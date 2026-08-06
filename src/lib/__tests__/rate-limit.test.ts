import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, rateLimitResponse, clientKey } from "@/lib/rate-limit";

// Upstash env vars are not set in tests, so these exercise the in-memory path.

describe("checkRateLimit (in-memory)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit and counts down remaining", async () => {
    const key = `test-under-${Math.random()}`;
    const first = await checkRateLimit(key, { limit: 3, windowSec: 60 });
    expect(first.ok).toBe(true);
    expect(first.remaining).toBe(2);

    const second = await checkRateLimit(key, { limit: 3, windowSec: 60 });
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks the request that exceeds the limit", async () => {
    const key = `test-block-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const res = await checkRateLimit(key, { limit: 3, windowSec: 60 });
      expect(res.ok).toBe(true);
    }
    const blocked = await checkRateLimit(key, { limit: 3, windowSec: 60 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("allows again after the window expires", async () => {
    const key = `test-expiry-${Math.random()}`;
    for (let i = 0; i < 3; i++) await checkRateLimit(key, { limit: 3, windowSec: 60 });
    expect((await checkRateLimit(key, { limit: 3, windowSec: 60 })).ok).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect((await checkRateLimit(key, { limit: 3, windowSec: 60 })).ok).toBe(true);
  });

  it("tracks keys independently", async () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    await checkRateLimit(a, { limit: 1, windowSec: 60 });
    expect((await checkRateLimit(a, { limit: 1, windowSec: 60 })).ok).toBe(false);
    expect((await checkRateLimit(b, { limit: 1, windowSec: 60 })).ok).toBe(true);
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 with a Retry-After header", async () => {
    const res = rateLimitResponse(Date.now() + 30_000);
    expect(res.status).toBe(429);
    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThanOrEqual(29);
    expect(retryAfter).toBeLessThanOrEqual(31);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Too many requests");
  });
});

describe("clientKey", () => {
  it("prefers the user id", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4" } });
    expect(clientKey("user-1", req)).toBe("user-1");
  });

  it("falls back to the first forwarded IP", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientKey(null, req)).toBe("1.2.3.4");
  });

  it("falls back to anon without any identifier", () => {
    expect(clientKey(undefined, new Request("http://x"))).toBe("anon");
  });
});
