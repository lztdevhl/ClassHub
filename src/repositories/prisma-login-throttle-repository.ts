import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { LoginThrottle, LoginThrottleRepository } from "@/repositories/login-throttle-repository";

export class PrismaLoginThrottleRepository implements LoginThrottleRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async consume(fingerprint: string, now: Date, windowMs: number, maxAttempts: number): Promise<LoginThrottle> {
    const [row] = await this.prisma.$queryRaw<LoginThrottle[]>(Prisma.sql`
      INSERT INTO "LoginThrottle" ("fingerprint", "attempts", "windowStartedAt", "blockedUntil", "createdAt", "updatedAt")
      VALUES (${fingerprint}, 1, ${now}, NULL, ${now}, ${now})
      ON CONFLICT ("fingerprint") DO UPDATE SET
        "attempts" = CASE WHEN "LoginThrottle"."blockedUntil" > ${now}::timestamp THEN "LoginThrottle"."attempts" WHEN "LoginThrottle"."windowStartedAt" + make_interval(secs => ${windowMs}::double precision / 1000) <= ${now}::timestamp THEN 1 ELSE "LoginThrottle"."attempts" + 1 END,
        "windowStartedAt" = CASE WHEN "LoginThrottle"."blockedUntil" > ${now}::timestamp THEN "LoginThrottle"."windowStartedAt" WHEN "LoginThrottle"."windowStartedAt" + make_interval(secs => ${windowMs}::double precision / 1000) <= ${now}::timestamp THEN ${now}::timestamp ELSE "LoginThrottle"."windowStartedAt" END,
        "blockedUntil" = CASE WHEN "LoginThrottle"."blockedUntil" > ${now}::timestamp THEN "LoginThrottle"."blockedUntil" WHEN "LoginThrottle"."windowStartedAt" + make_interval(secs => ${windowMs}::double precision / 1000) <= ${now}::timestamp THEN NULL WHEN "LoginThrottle"."attempts" + 1 > ${maxAttempts} THEN ${now}::timestamp + make_interval(secs => ${windowMs}::double precision / 1000) ELSE NULL END,
        "updatedAt" = ${now}
      RETURNING "fingerprint", "attempts", "windowStartedAt", "blockedUntil"`);
    return row;
  }
  async delete(fingerprint: string) { await this.prisma.loginThrottle.deleteMany({ where: { fingerprint } }); }
  async cleanup(before: Date) { await this.prisma.loginThrottle.deleteMany({ where: { updatedAt: { lt: before } } }); }
}
