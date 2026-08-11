import "server-only";

import { parseServerEnv } from "@/config/env";

export const serverEnv = parseServerEnv(process.env);
