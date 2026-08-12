function isOfflinePrismaCommand(args: readonly string[]): boolean {
  const [command, subcommand] = args;

  return ["generate", "validate", "format"].includes(command)
    || (command === "migrate" && subcommand === "diff");
}

export function resolvePrismaDatasourceUrl(
  args: readonly string[],
  directUrl?: string,
  databaseUrl?: string,
): string {
  if (directUrl) return directUrl;
  if (databaseUrl) return databaseUrl;
  if (isOfflinePrismaCommand(args)) return "";

  throw new Error("DIRECT_URL or DATABASE_URL is required for Prisma commands that access the database.");
}
