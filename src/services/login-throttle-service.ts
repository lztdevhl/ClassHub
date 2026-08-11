import type { LoginThrottleRepository } from "@/repositories/login-throttle-repository";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function consumeLoginAttempt(fingerprint: string, repository: LoginThrottleRepository, now: () => Date) {
  const current = now();
  await repository.cleanup(new Date(current.getTime() - WINDOW_MS));
  const row = await repository.consume(fingerprint, current, WINDOW_MS, MAX_ATTEMPTS);
  return row.blockedUntil && row.blockedUntil > current ? { allowed: false, retryAt: row.blockedUntil } : { allowed: true };
}

export function resetLoginAttempts(fingerprint: string, repository: LoginThrottleRepository) { return repository.delete(fingerprint); }
