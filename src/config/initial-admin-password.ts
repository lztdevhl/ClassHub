import { z } from "zod";

export const initialAdminPasswordSchema = z.string().refine(
  (value) => {
    const byteLength = Buffer.byteLength(value, "utf8");
    return byteLength >= 12 && byteLength <= 72;
  },
  { message: "A senha inicial deve ter entre 12 e 72 bytes UTF-8." },
);
