import { describe, expect, it } from "vitest";

import { resolvePrismaDatasourceUrl } from "@/lib/prisma-config";

describe("resolvePrismaDatasourceUrl", () => {
  const directUrl = "postgresql://app:secret@db.example.com:5432/classhub";
  const databaseUrl = "postgresql://app:secret@pooled.db.example.com:5432/classhub";

  it.each([
    ["generate", ["generate"]],
    ["validate", ["validate"]],
    ["format", ["format"]],
    ["migrate diff", ["migrate", "diff", "--from-empty"]],
  ])("allows offline Prisma %s without a database URL", (_command, args) => {
    expect(resolvePrismaDatasourceUrl(args)).toBe("");
  });

  it("prefers DIRECT_URL for database commands", () => {
    expect(resolvePrismaDatasourceUrl(["migrate", "deploy"], directUrl, databaseUrl)).toBe(directUrl);
  });

  it("falls back to DATABASE_URL when DIRECT_URL is not configured", () => {
    expect(resolvePrismaDatasourceUrl(["migrate", "deploy"], undefined, databaseUrl)).toBe(databaseUrl);
  });

  it("uses only URLs explicitly passed to the pure helper", () => {
    const originalDirectUrl = process.env.DIRECT_URL;
    process.env.DIRECT_URL = directUrl;
    try {
      expect(resolvePrismaDatasourceUrl(["generate"])).toBe("");
    } finally {
      if (originalDirectUrl === undefined) delete process.env.DIRECT_URL;
      else process.env.DIRECT_URL = originalDirectUrl;
    }
  });

  it.each([
    ["migrate dev", ["migrate", "dev"]],
    ["migrate deploy", ["migrate", "deploy"]],
    ["db seed", ["db", "seed"]],
  ])("requires a database URL for %s", (_command, args) => {
    expect(() => resolvePrismaDatasourceUrl(args)).toThrow("DIRECT_URL or DATABASE_URL");
  });
});
