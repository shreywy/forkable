// Sliding-window rate limiting.
//
// Backend selection: when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are
// set, limits are enforced in Upstash Redis (shared across serverless
// instances). Otherwise an in-memory sliding window keeps local dev and
// previews working with zero config (per-instance only, which is fine there).

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: number };
export type RateLimitOptions = { limit?: number; windowSec?: number };

const DEFAULT_LIMIT = 30;
const DEFAULT_WINDOW_SEC = 60;

// ── Upstash backend ───────────────────────────────────────────────────────────

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// One Ratelimit instance per (limit, window) pair, cached across invocations.
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowSec: number): Ratelimit {
  const cacheKey = `${limit}:${windowSec}`;
  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "forkable:rl",
    });
    upstashLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory fallback ────────────────────────────────────────────────────────

const memoryWindows = new Map<string, number[]>();

function checkMemory(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const cutoff = now - windowMs;

  const timestamps = (memoryWindows.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    memoryWindows.set(key, timestamps);
    return { ok: false, remaining: 0, resetAt: timestamps[0] + windowMs };
  }

  timestamps.push(now);
  memoryWindows.set(key, timestamps);
  return { ok: true, remaining: limit - timestamps.length, resetAt: now + windowMs };
}

// Periodically drop stale keys so long-lived dev servers don't leak memory.
let lastSweep = Date.now();
function sweepMemory(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, timestamps] of memoryWindows) {
    if (timestamps.every((t) => t <= now - windowMs)) memoryWindows.delete(key);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check and consume one request against the sliding window for `key`.
 * Key convention: `"<route>:<userId|ip>"`, e.g. `"star:cku123"`.
 */
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const limit = opts.limit ?? DEFAULT_LIMIT;
  const windowSec = opts.windowSec ?? DEFAULT_WINDOW_SEC;

  if (hasUpstash) {
    try {
      const res = await getUpstashLimiter(limit, windowSec).limit(key);
      return { ok: res.success, remaining: res.remaining, resetAt: res.reset };
    } catch {
      // Redis outage must not take the API down - fall through to memory.
    }
  }

  sweepMemory(windowSec * 1000);
  return checkMemory(key, limit, windowSec);
}

/** Standard 429 response for a failed rate-limit check. */
export function rateLimitResponse(resetAt: number): Response {
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSec),
    },
  });
}

/** Best available client identifier: user id if signed in, else forwarded IP. */
export function clientKey(userId: string | null | undefined, request: Request): string {
  if (userId) return userId;
  const fwd = request.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "anon";
}
