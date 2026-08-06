// Read-through query cache.
//
// Uses Upstash Redis (JSON with TTL) when UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN are set; otherwise an in-memory Map so local dev
// needs no config. Values must be JSON-serializable - Date fields come back
// as ISO strings, which the UI types (`Date | string`) already tolerate.

import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

const memory = new Map<string, { value: unknown; expiresAt: number }>();

const PREFIX = "forkable:cache:";

export async function cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  if (hasUpstash) {
    try {
      const hit = await getRedis().get<T>(PREFIX + key);
      if (hit !== null && hit !== undefined) return hit;
      const value = await fn();
      // fire-and-forget write; a failed set must not fail the request
      getRedis().set(PREFIX + key, value, { ex: ttlSec }).catch(() => {});
      return value;
    } catch {
      // Redis outage: fall through to memory
    }
  }

  const now = Date.now();
  const hit = memory.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const value = await fn();
  memory.set(key, { value, expiresAt: now + ttlSec * 1000 });

  // opportunistic sweep so the map doesn't grow unbounded in dev
  if (memory.size > 500) {
    for (const [k, v] of memory) {
      if (v.expiresAt <= now) memory.delete(k);
    }
  }

  return value;
}

/** Drop a cached key (all backends). Used after mutations that invalidate it. */
export async function invalidate(key: string): Promise<void> {
  memory.delete(key);
  if (hasUpstash) {
    try {
      await getRedis().del(PREFIX + key);
    } catch {
      /* best effort */
    }
  }
}
