import { describe, expect, it } from "vitest";

import { resolvePrismaDatasourceUrl } from "@/lib/prisma-config";

describe("resolvePrismaDatasourceUrl", () => {
  const directUrl = "postgresql://app:secret@db.example.com:5432/classhub";

  it.each([
    ["generate", ["generate"]],
    ["validate", ["validate"]],
    ["format", ["format"]],
    ["migrate diff", ["migrate", "diff", "--from-empty"]],
  ])("uses an illustrative URL for offline Prisma %s", (_command, args) => {
    expect(resolvePrismaDatasourceUrl(args)).toMatch(/^postgresql:\/\//);
  });

  it("uses DIRECT_URL when it is configured", () => {
    expect(resolvePrismaDatasourceUrl(["migrate", "deploy"], directUrl)).toBe(directUrl);
  });

  it("uses only the URL explicitly passed to the pure helper", () => {
    const originalDirectUrl = process.env.DIRECT_URL;
    process.env.DIRECT_URL = directUrl;

    try {
      expect(resolvePrismaDatasourceUrl(["generate"], undefined))
        .toBe("postgresql://classhub:offline@localhost:5432/classhub");
    } finally {
      if (originalDirectUrl === undefined) delete process.env.DIRECT_URL;
      else process.env.DIRECT_URL = originalDirectUrl;
    }
  });

  it.each([
    ["migrate dev", ["migrate", "dev"]],
    ["migrate deploy", ["migrate", "deploy"]],
    ["db seed", ["db", "seed"]],
  ])("requires DIRECT_URL for %s", (_command, args) => {
    expect(() => resolvePrismaDatasourceUrl(args)).toThrow("DIRECT_URL");
  });
});
