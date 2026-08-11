const offlineDatasourceUrl = "postgresql://classhub:offline@localhost:5432/classhub";

function isOfflinePrismaCommand(args: readonly string[]): boolean {
  const [command, subcommand] = args;

  return ["generate", "validate", "format"].includes(command)
    || (command === "migrate" && subcommand === "diff");
}

export function resolvePrismaDatasourceUrl(
  args: readonly string[],
  directUrl?: string,
): string {
  if (directUrl) return directUrl;
  if (isOfflinePrismaCommand(args)) return offlineDatasourceUrl;

  throw new Error("DIRECT_URL is required for Prisma commands that access the database.");
}
