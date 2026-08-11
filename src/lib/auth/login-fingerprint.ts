import { createHmac } from "node:crypto";

export function getLoginFingerprint(headers: Headers, secret: string): string {
  // Vercel overwrites this managed header before forwarding requests.
  const forwarded = headers.get("x-vercel-forwarded-for")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const source = forwarded || headers.get("x-real-ip") || "unknown";
  return createHmac("sha256", secret).update(source).digest("hex");
}
