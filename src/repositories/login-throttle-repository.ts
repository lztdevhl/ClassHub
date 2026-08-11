export type LoginThrottle = { fingerprint: string; attempts: number; windowStartedAt: Date; blockedUntil: Date | null };
export interface LoginThrottleRepository {
  consume(fingerprint: string, now: Date, windowMs: number, maxAttempts: number): Promise<LoginThrottle>;
  delete(fingerprint: string): Promise<void>;
  cleanup(before: Date): Promise<void>;
}
