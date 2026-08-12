import "dotenv/config";
import { defineConfig } from "prisma/config";

import { resolvePrismaDatasourceUrl } from "./src/lib/prisma-config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: resolvePrismaDatasourceUrl(process.argv.slice(2), process.env.DIRECT_URL, process.env.DATABASE_URL) },
});
