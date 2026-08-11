import { describe, expect, it } from "vitest";

import { consumeLoginAttempt, resetLoginAttempts } from "@/services/login-throttle-service";

describe("login throttle", () => {
  it("allows attempts in the window then blocks the next one", async () => {
    const repository = new MemoryThrottleRepository();
    const now = new Date("2026-08-07T12:00:00.000Z");

    for (let index = 0; index < 5; index += 1) {
      await expect(consumeLoginAttempt("fingerprint", repository, () => now)).resolves.toEqual({ allowed: true });
    }
    await expect(consumeLoginAttempt("fingerprint", repository, () => now)).resolves.toMatchObject({ allowed: false });
  });

  it("resets a successful login and starts a new window after expiry", async () => {
    const repository = new MemoryThrottleRepository();
    const initial = new Date("2026-08-07T12:00:00.000Z");
    await consumeLoginAttempt("fingerprint", repository, () => initial);
    await resetLoginAttempts("fingerprint", repository);
    expect(await consumeLoginAttempt("fingerprint", repository, () => initial)).toEqual({ allowed: true });
    expect(await consumeLoginAttempt("expired", repository, () => new Date("2026-08-07T12:16:00.000Z"))).toEqual({ allowed: true });
  });

  it("limits concurrent attempts without losing updates", async () => {
    const repository = new MemoryThrottleRepository();
    const now = new Date("2026-08-07T12:00:00.000Z");
    const results = await Promise.all(Array.from({ length: 10 }, () => consumeLoginAttempt("concurrent", repository, () => now)));
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
  });

  it("preserves an active lockout and restarts after it expires", async () => {
    const repository = new MemoryThrottleRepository();
    const at = (minute: number) => new Date(`2026-08-07T12:${String(minute).padStart(2, "0")}:00.000Z`);
    for (let attempt = 0; attempt < 5; attempt += 1) await consumeLoginAttempt("lock", repository, () => at(0));
    expect(await consumeLoginAttempt("lock", repository, () => at(14))).toMatchObject({ allowed: false, retryAt: at(29) });
    expect(await consumeLoginAttempt("lock", repository, () => at(16))).toMatchObject({ allowed: false, retryAt: at(29) });
    expect(await consumeLoginAttempt("lock", repository, () => at(29))).toEqual({ allowed: true });
  });
});

type Entry = { fingerprint: string; attempts: number; windowStartedAt: Date; blockedUntil: Date | null };
class MemoryThrottleRepository {
  private readonly entries = new Map<string, Entry>();
  async consume(fingerprint: string, now: Date, windowMs: number, max: number) { const current=this.entries.get(fingerprint); if(current?.blockedUntil && current.blockedUntil>now)return current; const expired=!current||current.windowStartedAt.getTime()+windowMs<=now.getTime(); const attempts=expired?1:current.attempts+1; const blockedUntil=attempts>max?new Date(now.getTime()+windowMs):null; const row={fingerprint,attempts,windowStartedAt:expired?now:current.windowStartedAt,blockedUntil}; this.entries.set(fingerprint,row); return row; }
  async delete(fingerprint: string) { this.entries.delete(fingerprint); }
  async cleanup() {}
}
