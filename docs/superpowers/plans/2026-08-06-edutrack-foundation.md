# EduTrack Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a fundação executável do EduTrack com Next.js, qualidade automatizada, Prisma Postgres, seed, autenticação própria e shell administrativo protegido.

**Architecture:** O sistema será um monólito modular no Next.js App Router. Server Actions formam a fronteira de entrada, serviços concentram regras e repositórios isolam Prisma; autenticação usa sessão opaca persistida como hash e cookie seguro.

**Tech Stack:** Next.js App Router, React, TypeScript estrito, Tailwind CSS, shadcn/ui, Zod, Prisma ORM 7, Prisma Postgres, bcrypt, Vitest, Testing Library e pnpm 11.20.0 via Corepack.

## Global Constraints

- Node.js deve ser `20.19+`, `22.12+` ou `24.0+`; usar Node 24 quando disponível.
- Usar pnpm 11.20.0 exclusivamente via Corepack, versionar `pnpm-lock.yaml` e manter os comandos `corepack pnpm install --frozen-lockfile`, `corepack pnpm run db:setup` e `corepack pnpm run dev`; não depender de shim global ou `corepack enable`.
- Usar App Router, diretório `src/`, TypeScript estrito, ESLint e alias `@/*`.
- Não usar Supabase, Firebase, Docker, IA, microsserviços ou cadastro público.
- Não criar landing page; `/login` é a única entrada pública e `/` é o dashboard autenticado.
- Usar PostgreSQL com Prisma Postgres; `DATABASE_URL` é agrupada e `DIRECT_URL` é direta.
- Nunca versionar `.env`, credenciais, banco, artefatos gerados ou dados reais.
- Manter desenvolvimento e produção isolados; preview nunca acessa produção.
- Implementar somente um administrador, sem papéis, convites ou multiempresa.
- Componentes não acessam Prisma; Server Actions não contêm regras de negócio.
- Cada operação protegida valida a sessão no servidor, mesmo quando `proxy.ts` já redirecionou.
- Não usar números fictícios no dashboard final.
- Nesta semana, priorizar fluxos principais, testes críticos, lint, tipos e build; Playwright completo e automações avançadas ficam fora deste plano.

---

## Boundary and follow-on plans

Este plano cobre somente o Ciclo 1 aprovado. Os próximos documentos serão independentes e executados nesta ordem:

1. `edutrack-students-lessons-dashboard`: alunos, aulas, página individual e dashboard real.
2. `edutrack-history-reports-settings`: histórico, filtros, relatórios, PDF e configurações.
3. `edutrack-delivery`: estados finais, acessibilidade, responsividade, README completo, Vercel e verificação de entrega.

Nenhum stub de domínio ou dado fictício será criado para antecipar esses ciclos.

## File map

### Project and quality

- `package.json`: scripts e dependências.
- `tsconfig.json`: TypeScript estrito e alias.
- `next.config.ts`: configuração mínima do Next.js.
- `eslint.config.mjs`: regras do Next.js e TypeScript.
- `postcss.config.mjs`: Tailwind CSS.
- `vitest.config.ts`: ambiente e aliases dos testes.
- `vitest.setup.ts`: matchers de DOM.
- `src/app/layout.tsx`: documento raiz, fonte Geist e metadados.
- `src/app/globals.css`: tokens visuais do EduTrack.
- `src/lib/utils.ts`: composição de classes.

### Configuration and persistence

- `.env.example`: contrato de configuração sem segredos.
- `src/config/env.ts`: parsing puro e testável do ambiente.
- `src/config/server-env.ts`: leitura server-only de `process.env`.
- `prisma/schema.prisma`: modelos, enums, relações e índices.
- `prisma.config.ts`: migrations, seed e conexão direta.
- `prisma/seed.ts`: administrador inicial idempotente.
- `src/generated/prisma/`: client gerado e ignorado pelo Git.
- `src/lib/prisma.ts`: singleton Prisma com adapter PostgreSQL.

### Authentication

- `src/lib/auth/constants.ts`: nome do cookie e duração da sessão.
- `src/lib/auth/password.ts`: bcrypt.
- `src/lib/auth/token.ts`: token aleatório e hash SHA-256.
- `src/lib/auth/types.ts`: contratos de usuário e sessão.
- `src/repositories/auth-repository.ts`: interfaces de persistência.
- `src/repositories/prisma-auth-repository.ts`: implementação Prisma.
- `src/services/auth-service.ts`: autenticação e ciclo de sessão.
- `src/lib/auth/session.ts`: integração com cookies do Next.js.
- `src/schemas/login-schema.ts`: validação do login.
- `src/actions/auth-actions.ts`: login e logout.
- `src/proxy.ts`: redirecionamento otimista por presença do cookie.
- `src/app/(auth)/login/page.tsx`: tela de login.
- `src/components/auth/login-form.tsx`: formulário e feedback.

### Administrative shell

- `src/app/(dashboard)/layout.tsx`: validação forte de sessão e shell.
- `src/app/(dashboard)/page.tsx`: estado inicial sem métricas falsas.
- `src/components/layout/app-sidebar.tsx`: navegação desktop.
- `src/components/layout/mobile-nav.tsx`: navegação temporária no celular.
- `src/components/layout/app-header.tsx`: cabeçalho e menu do usuário.
- `src/config/navigation.ts`: itens de navegação habilitados.
- `src/components/ui/*`: componentes shadcn necessários.

---

### Task 1: Bootstrap and quality baseline

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Test: `src/lib/utils.test.ts`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nenhum código anterior.
- Produces: alias `@/*`, scripts de qualidade e `cn(...inputs: ClassValue[]): string`.

- [ ] **Step 1: Initialize pnpm 11.20.0 and install the baseline dependencies**

Run from the repository root:

```powershell
corepack prepare pnpm@11.20.0 --activate
corepack pnpm init
corepack use pnpm@11.20.0
corepack pnpm add next@latest react@latest react-dom@latest zod bcrypt @prisma/client @prisma/adapter-pg pg server-only lucide-react clsx tailwind-merge class-variance-authority react-hook-form @hookform/resolvers
corepack pnpm add --save-dev typescript @types/node @types/react @types/react-dom @types/bcrypt @types/pg tailwindcss @tailwindcss/postcss eslint eslint-config-next prisma tsx vitest jsdom @testing-library/react @testing-library/jest-dom
```

Expected: `package.json` declares `"packageManager": "pnpm@11.20.0"`, `pnpm-lock.yaml` exists, and `corepack pnpm list next react typescript prisma vitest --depth=0` exits with code 0.

- [ ] **Step 2: Define package scripts**

Set exactly these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:setup": "prisma generate && prisma migrate dev --name init && prisma db seed"
  }
}
```

Preserve dependency entries written by pnpm. Do not add `postinstall` before `prisma/schema.prisma` exists in Task 3. Lifecycle scripts call project binaries directly because pnpm places `node_modules/.bin` on their `PATH`; they must not invoke pnpm recursively.

- [ ] **Step 3: Write the failing utility test**

Create `src/lib/utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conditional and conflicting Tailwind classes", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
```

- [ ] **Step 4: Run the test and confirm the expected failure**

Run:

```powershell
corepack pnpm test -- src/lib/utils.test.ts
```

Expected: FAIL because `@/lib/utils` does not exist.

- [ ] **Step 5: Create the strict TypeScript, Next.js, ESLint, Tailwind and Vitest configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
```

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Configure Tailwind v4 in `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Create `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"]),
]);
```

- [ ] **Step 6: Implement the utility and minimal App Router document**

Create `src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "EduTrack", template: "%s | EduTrack" },
  description: "Sistema interno para acompanhamento de alunos e aulas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function FoundationPage() {
  return <main><h1>EduTrack</h1></main>;
}
```

Create `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  --background: #f5f6f8;
  --foreground: #18181b;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--background); color: var(--foreground); font-family: var(--font-geist), sans-serif; }
button, input, textarea, select { font: inherit; }
```

Run `corepack pnpm exec next typegen` to generate `next-env.d.ts` and route types.

- [ ] **Step 7: Ignore generated and private files**

Create `.gitignore`:

```gitignore
node_modules/
.next/
out/
.env
.env.*
!.env.example
src/generated/prisma/
coverage/
playwright-report/
test-results/
work/
outputs/
.superpowers/
*.log
```

- [ ] **Step 8: Run the baseline verification**

Run:

```powershell
corepack pnpm test -- src/lib/utils.test.ts
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

Expected: all four commands exit with code 0.

- [ ] **Step 9: Commit the baseline**

```powershell
git add package.json pnpm-lock.yaml tsconfig.json next-env.d.ts next.config.ts eslint.config.mjs postcss.config.mjs vitest.config.ts vitest.setup.ts .gitignore src
git commit -m "chore: bootstrap EduTrack application"
```

---

### Task 2: Environment contract and shared action result

**Files:**
- Create: `.env.example`
- Create: `src/config/env.ts`
- Create: `src/config/server-env.ts`
- Test: `src/config/env.test.ts`
- Create: `src/types/action-result.ts`

**Interfaces:**
- Consumes: Zod and strict TypeScript from Task 1.
- Produces: `parseServerEnv(source)`, `serverEnv` and `ActionResult<T>`.

- [ ] **Step 1: Write failing environment tests**

Create `src/config/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/config/env";

const validEnv = {
  DATABASE_URL: "postgresql://app:secret@pooled.db.prisma.io:5432/edutrack",
  DIRECT_URL: "postgresql://app:secret@db.prisma.io:5432/edutrack",
  INITIAL_ADMIN_NAME: "Administrador",
  INITIAL_ADMIN_EMAIL: "admin@edutrack.local",
  INITIAL_ADMIN_PASSWORD: "uma-senha-com-16",
  SESSION_SECRET: "12345678901234567890123456789012",
  APP_URL: "http://localhost:3000",
};

describe("parseServerEnv", () => {
  it("normalizes the initial administrator email", () => {
    expect(parseServerEnv({ ...validEnv, INITIAL_ADMIN_EMAIL: " ADMIN@EDUTRACK.LOCAL " }).INITIAL_ADMIN_EMAIL)
      .toBe("admin@edutrack.local");
  });

  it("rejects a short session secret", () => {
    expect(() => parseServerEnv({ ...validEnv, SESSION_SECRET: "short" })).toThrow();
  });
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run `corepack pnpm test -- src/config/env.test.ts`.

Expected: FAIL because `@/config/env` does not exist.

- [ ] **Step 3: Implement the environment parser**

Create `src/config/env.ts`:

```ts
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgres"),
  DIRECT_URL: z.string().url().startsWith("postgres"),
  INITIAL_ADMIN_NAME: z.string().trim().min(2).max(100),
  INITIAL_ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
  INITIAL_ADMIN_PASSWORD: z.string().min(12).max(128),
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(source);
}
```

Create `src/config/server-env.ts`:

```ts
import "server-only";

import { parseServerEnv } from "@/config/env";

export const serverEnv = parseServerEnv(process.env);
```

Create `.env.example` with the same keys and illustrative non-production values from the approved design.

- [ ] **Step 4: Define the shared action result**

Create `src/types/action-result.ts`:

```ts
export type FieldErrors = Record<string, string[]>;

export type ActionResult<T> =
  | { status: "idle" }
  | { status: "success"; data: T }
  | { status: "validation_error"; message: string; fieldErrors: FieldErrors }
  | { status: "unauthorized"; message: string }
  | { status: "not_found"; message: string }
  | { status: "conflict"; message: string }
  | { status: "internal_error"; message: string; errorId: string };
```

- [ ] **Step 5: Run verification and commit**

```powershell
corepack pnpm test -- src/config/env.test.ts
corepack pnpm run typecheck
corepack pnpm run lint
git add .env.example src/config src/types
git commit -m "feat: validate EduTrack environment"
```

Expected: tests, types and lint pass.

---

### Task 3: Prisma domain schema, client and administrator seed

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Create: `prisma.config.ts`
- Create: `prisma/seed.ts`
- Create: `src/lib/prisma.ts`
- Test: `tests/unit/seed-env.test.ts`
- Create: `src/lib/seed-env.ts`

**Interfaces:**
- Consumes: `serverEnv`, bcrypt and PostgreSQL URLs.
- Produces: generated `PrismaClient`, `prisma`, enums `StudentStatus` and `AttendanceStatus`, and idempotent initial administrator.

- [ ] **Step 1: Write the failing seed input test**

Create `tests/unit/seed-env.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { parseSeedAdmin } from "@/lib/seed-env";

describe("parseSeedAdmin", () => {
  it("returns normalized administrator data", () => {
    expect(parseSeedAdmin({
      INITIAL_ADMIN_NAME: " Administrador ",
      INITIAL_ADMIN_EMAIL: " ADMIN@EDUTRACK.LOCAL ",
      INITIAL_ADMIN_PASSWORD: "uma-senha-com-16",
    })).toEqual({
      name: "Administrador",
      email: "admin@edutrack.local",
      password: "uma-senha-com-16",
    });
  });
});
```

- [ ] **Step 2: Run the seed test and verify failure**

Run `corepack pnpm test -- tests/unit/seed-env.test.ts`.

Expected: FAIL because `parseSeedAdmin` does not exist.

- [ ] **Step 3: Implement seed environment parsing**

Create `src/lib/seed-env.ts`:

```ts
import { z } from "zod";

const seedAdminSchema = z.object({
  INITIAL_ADMIN_NAME: z.string().trim().min(2).max(100),
  INITIAL_ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
  INITIAL_ADMIN_PASSWORD: z.string().min(12).max(128),
});

export type SeedAdmin = { name: string; email: string; password: string };

export function parseSeedAdmin(source: Record<string, string | undefined>): SeedAdmin {
  const parsed = seedAdminSchema.parse(source);
  return {
    name: parsed.INITIAL_ADMIN_NAME,
    email: parsed.INITIAL_ADMIN_EMAIL,
    password: parsed.INITIAL_ADMIN_PASSWORD,
  };
}
```

- [ ] **Step 4: Define the complete Prisma schema**

Create `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum StudentStatus {
  ACTIVE
  INACTIVE
}

enum AttendanceStatus {
  PRESENT
  ABSENT
}

model User {
  id           String    @id @default(cuid())
  name         String    @db.VarChar(100)
  email        String    @unique @db.VarChar(254)
  passwordHash String    @db.VarChar(255)
  sessions     Session[]
  settings     Settings?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique @db.Char(64)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([expiresAt])
  @@index([userId])
}

model Student {
  id           String        @id @default(cuid())
  name         String        @db.VarChar(150)
  className    String        @db.VarChar(100)
  subject      String        @db.VarChar(100)
  teacherName  String        @db.VarChar(150)
  phone        String?       @db.VarChar(30)
  email        String?       @db.VarChar(254)
  generalNotes String?       @db.Text
  status       StudentStatus @default(ACTIVE)
  lessons      Lesson[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([status, name])
  @@index([name])
}

model Lesson {
  id                String           @id @default(cuid())
  studentId         String
  lessonDate        DateTime         @db.Date
  lessonTime        String?          @db.VarChar(5)
  attendanceStatus  AttendanceStatus
  content           String?          @db.Text
  activity          String?          @db.Text
  activityCompleted Boolean?
  notes             String?          @db.Text
  nextSteps         String?          @db.Text
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  student           Student          @relation(fields: [studentId], references: [id], onDelete: Restrict)

  @@index([studentId, lessonDate])
  @@index([attendanceStatus, lessonDate])
  @@index([activityCompleted, lessonDate])
}

model Settings {
  id               String   @id @default(cuid())
  userId           String   @unique
  organizationName String?  @db.VarChar(150)
  reportHeader     String?  @db.Text
  reportFooter     String?  @db.Text
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

After `prisma/schema.prisma` exists, add the Prisma Client generation lifecycle script to `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Do not add this script earlier: a clean dependency installation must remain valid before the schema task.
Keep `postinstall` as the direct `prisma generate` invocation shown above; lifecycle scripts receive project binaries on `PATH` and must not wrap them in `corepack pnpm`.

- [ ] **Step 5: Configure Prisma 7 and the pooled runtime client**

Create `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: env("DIRECT_URL") },
});
```

Create `src/lib/prisma.ts`:

```ts
import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { serverEnv } from "@/config/server-env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (serverEnv.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: Create or attach the development Prisma Postgres database**

In the Vercel project, create Prisma Postgres through Storage, connect it to the application, and obtain:

```env
DATABASE_URL="postgres://pooled-application-connection"
DIRECT_URL="postgres://direct-migration-connection"
```

Use a free plan unless the user explicitly authorizes a paid plan. Keep both values only in `.env` and Vercel environment settings.

- [ ] **Step 7: Implement the idempotent seed**

In `prisma/seed.ts`, parse the initial admin, hash the password with bcrypt cost 12, and call `prisma.user.upsert` by normalized e-mail. On create, also create empty `Settings`; on update, update name and password hash without deleting existing settings. Disconnect in `finally` and set a non-zero exit code on failure.

- [ ] **Step 8: Generate, migrate, seed and inspect**

Run:

```powershell
corepack pnpm test -- tests/unit/seed-env.test.ts
corepack pnpm run db:generate
corepack pnpm run db:migrate -- --name init
corepack pnpm run db:seed
corepack pnpm exec prisma validate
```

Expected: test passes, migration is created, seed reports one administrator, and schema validation passes.

- [ ] **Step 9: Commit persistence**

```powershell
git add prisma prisma.config.ts src/lib/prisma.ts src/lib/seed-env.ts tests/unit/seed-env.test.ts
git commit -m "feat: add EduTrack persistence foundation"
```

---

### Task 3 review correction contract

- `INITIAL_ADMIN_PASSWORD` must contain 12 to 72 UTF-8 bytes, matching bcrypt input limits.
- `src/lib/prisma-config.ts` owns pure datasource resolution. Without `DIRECT_URL`, only `generate`, `validate`, `format`, and `migrate diff` use an illustrative PostgreSQL URL; `migrate dev`, `migrate deploy`, and `db seed` fail before database access.
- `dotenv@17.4.2` is a direct development dependency and `db:validate` runs `prisma validate`.

---

### Task 4: Password, token and authentication service

**Files:**
- Create: `src/lib/auth/constants.ts`
- Create: `src/lib/auth/password.ts`
- Create: `src/lib/auth/token.ts`
- Create: `src/lib/auth/types.ts`
- Create: `src/repositories/auth-repository.ts`
- Create: `src/services/auth-service.ts`
- Test: `tests/unit/auth-service.test.ts`

**Interfaces:**
- Consumes: normalized e-mail, bcrypt and opaque session persistence interfaces.
- Produces: `authenticate(credentials, deps)`, `createSession(userId, deps)`, `validateSession(token, deps)` and `revokeSession(token, deps)`.

- [ ] **Step 1: Write failing crypto and service tests**

Create `tests/unit/auth-service.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { hashSessionToken } from "@/lib/auth/token";
import type { AuthUser, StoredSession } from "@/lib/auth/types";
import type { AuthSessionRepository, AuthUserRepository } from "@/repositories/auth-repository";
import { authenticate, createSession, revokeSession, validateSession } from "@/services/auth-service";

class MemoryUsers implements AuthUserRepository {
  constructor(private readonly users: AuthUser[]) {}
  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }
  findById(id: string): AuthUser | null {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

class MemorySessions implements AuthSessionRepository {
  readonly rows = new Map<string, { userId: string; expiresAt: Date }>();
  readonly deleted: string[] = [];
  constructor(private readonly users: MemoryUsers) {}
  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    this.rows.set(input.tokenHash, { userId: input.userId, expiresAt: input.expiresAt });
  }
  async findByTokenHash(tokenHash: string): Promise<StoredSession | null> {
    const row = this.rows.get(tokenHash);
    if (!row) return null;
    const user = this.users.findById(row.userId);
    if (!user) return null;
    return { tokenHash, expiresAt: row.expiresAt, user: { id: user.id, name: user.name, email: user.email } };
  }
  async deleteByTokenHash(tokenHash: string): Promise<void> {
    this.deleted.push(tokenHash);
    this.rows.delete(tokenHash);
  }
}

describe("auth service", () => {
  let users: MemoryUsers;
  let sessions: MemorySessions;
  const now = new Date("2026-08-06T12:00:00.000Z");
  const sessionSecret = "12345678901234567890123456789012";

  beforeEach(async () => {
    users = new MemoryUsers([{
      id: "user-1",
      name: "Administrador",
      email: "admin@edutrack.local",
      passwordHash: await hashPassword("senha-correta-123"),
    }]);
    sessions = new MemorySessions(users);
  });

  const makeDeps = () => ({ users, sessions, now: () => now, sessionSecret });

  it("accepts the correct password and creates an opaque session", async () => {
    const deps = makeDeps();
    const auth = await authenticate({ email: " ADMIN@EDUTRACK.LOCAL ", password: "senha-correta-123" }, deps);
    expect(auth).toMatchObject({ ok: true, user: { id: "user-1" } });
    const session = await createSession("user-1", deps);
    expect(session.token).not.toContain("user-1");
    expect(sessions.rows.has(hashSessionToken(session.token, sessionSecret))).toBe(true);
  });

  it("returns invalid_credentials for an unknown email", async () => {
    await expect(authenticate({ email: "unknown@edutrack.local", password: "qualquer-senha" }, makeDeps()))
      .resolves.toEqual({ ok: false, reason: "invalid_credentials" });
  });

  it("returns invalid_credentials for a wrong password", async () => {
    await expect(authenticate({ email: "admin@edutrack.local", password: "senha-incorreta" }, makeDeps()))
      .resolves.toEqual({ ok: false, reason: "invalid_credentials" });
  });

  it("returns null for an expired session and deletes it", async () => {
    const token = "expired-token";
    const tokenHash = hashSessionToken(token, sessionSecret);
    sessions.rows.set(tokenHash, { userId: "user-1", expiresAt: new Date("2026-08-05T12:00:00.000Z") });
    await expect(validateSession(token, makeDeps())).resolves.toBeNull();
    expect(sessions.deleted).toContain(tokenHash);
  });

  it("revokes a session by the hash of its raw token", async () => {
    const token = "active-token";
    const tokenHash = hashSessionToken(token, sessionSecret);
    sessions.rows.set(tokenHash, { userId: "user-1", expiresAt: new Date("2026-08-07T12:00:00.000Z") });
    await revokeSession(token, makeDeps());
    expect(sessions.deleted).toContain(tokenHash);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run `corepack pnpm test -- tests/unit/auth-service.test.ts`.

Expected: FAIL because the auth modules do not exist.

- [ ] **Step 3: Define auth constants and types**

Create `src/lib/auth/constants.ts`:

```ts
export const SESSION_COOKIE_NAME = "edutrack_session";
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
export const BCRYPT_COST = 12;
```

Create `src/lib/auth/types.ts`:

```ts
export type SessionUser = { id: string; name: string; email: string };
export type AuthUser = SessionUser & { passwordHash: string };
export type StoredSession = {
  user: SessionUser;
  tokenHash: string;
  expiresAt: Date;
};
```

- [ ] **Step 4: Implement password and token helpers**

`src/lib/auth/password.ts` exports:

```ts
export function hashPassword(password: string): Promise<string>;
export function verifyPassword(password: string, passwordHash: string): Promise<boolean>;
```

Use bcrypt cost 12.

`src/lib/auth/token.ts` exports:

```ts
export function generateSessionToken(): string;
export function hashSessionToken(token: string, secret: string): string;
```

Generate 32 random bytes encoded as base64url and hash with HMAC-SHA-256 hexadecimal using `SESSION_SECRET`.

- [ ] **Step 5: Define repository contracts**

Create `src/repositories/auth-repository.ts`:

```ts
import type { AuthUser, StoredSession } from "@/lib/auth/types";

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
}

export interface AuthSessionRepository {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<StoredSession | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}
```

- [ ] **Step 6: Implement the authentication service**

Create `src/services/auth-service.ts` with dependency injection. Normalize e-mail with `trim().toLowerCase()`, return `{ ok: false, reason: "invalid_credentials" }` uniformly for unknown e-mail and wrong password, and return a session token only after password verification. Delete expired sessions during validation.

Use these signatures:

```ts
export type AuthDependencies = {
  users: AuthUserRepository;
  sessions: AuthSessionRepository;
  now: () => Date;
  sessionSecret: string;
};

export function authenticate(
  input: { email: string; password: string },
  deps: AuthDependencies,
): Promise<{ ok: true; user: SessionUser } | { ok: false; reason: "invalid_credentials" }>;

export function createSession(userId: string, deps: AuthDependencies): Promise<{ token: string; expiresAt: Date }>;
export function validateSession(token: string, deps: AuthDependencies): Promise<SessionUser | null>;
export function revokeSession(token: string, deps: AuthDependencies): Promise<void>;
```

- [ ] **Step 7: Run tests and commit**

```powershell
corepack pnpm test -- tests/unit/auth-service.test.ts
corepack pnpm run typecheck
corepack pnpm run lint
git add src/lib/auth src/repositories/auth-repository.ts src/services/auth-service.ts tests/unit/auth-service.test.ts
git commit -m "feat: add secure authentication service"
```

---

### Task 5: Prisma auth repositories and server session integration

**Files:**
- Create: `src/repositories/prisma-auth-repository.ts`
- Create: `src/lib/auth/dependencies.ts`
- Create: `src/lib/auth/session.ts`
- Test: `tests/unit/session-cookie.test.ts`

**Interfaces:**
- Consumes: generated Prisma Client and Task 4 contracts.
- Produces: `authDependencies`, `buildSessionCookie(expiresAt, isProduction)`, `getCurrentUser()`, `requireCurrentUser()`, `startUserSession(userId)` and `endCurrentSession()`.

- [ ] **Step 1: Write the failing cookie option test**

Extract a pure `buildSessionCookie(expiresAt, isProduction)` helper and test:

```ts
expect(buildSessionCookie(expiresAt, true)).toMatchObject({
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  expires: expiresAt,
});
```

Also assert `secure: false` in development.

- [ ] **Step 2: Implement Prisma repositories**

Create `PrismaAuthUserRepository` and `PrismaAuthSessionRepository` classes. Map only the fields required by the interfaces. `findByTokenHash` must include the related user and return `null` when absent.

- [ ] **Step 3: Assemble dependencies once**

Create `src/lib/auth/dependencies.ts`:

```ts
export const authDependencies: AuthDependencies = {
  users: new PrismaAuthUserRepository(prisma),
  sessions: new PrismaAuthSessionRepository(prisma),
  now: () => new Date(),
  sessionSecret: serverEnv.SESSION_SECRET,
};
```

- [ ] **Step 4: Implement Next.js cookie integration**

In `src/lib/auth/session.ts`, use `cookies()` from `next/headers`. `getCurrentUser` reads the raw cookie and validates it. `requireCurrentUser` redirects to `/login` when invalid. `startUserSession` creates a session and sets the cookie. `endCurrentSession` revokes the current token before deleting the cookie.

- [ ] **Step 5: Run tests, types and database-backed smoke check**

```powershell
corepack pnpm test -- tests/unit/session-cookie.test.ts tests/unit/auth-service.test.ts
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm exec prisma validate
```

Expected: all commands pass.

- [ ] **Step 6: Commit session integration**

```powershell
git add src/repositories/prisma-auth-repository.ts src/lib/auth tests/unit/session-cookie.test.ts
git commit -m "feat: persist authenticated sessions"
```

---

### Task 6: Login, logout and route protection

**Files:**
- Create: `src/schemas/login-schema.ts`
- Test: `src/schemas/login-schema.test.ts`
- Create: `src/actions/auth-actions.ts`
- Create: `src/components/auth/login-form.tsx`
- Test: `src/components/auth/login-form.test.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/proxy.ts`
- Test: `tests/unit/proxy.test.ts`

**Interfaces:**
- Consumes: auth service, session cookie integration and `ActionResult`.
- Produces: functional `/login`, `loginAction`, `logoutAction`, `LoginFormView({ state, pending, formAction })` and `decideAuthRedirect({ pathname, hasCookie })`.

- [ ] **Step 1: Write failing login schema tests**

Create `src/schemas/login-schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { loginSchema } from "@/schemas/login-schema";

describe("loginSchema", () => {
  it("normalizes a valid email", () => {
    expect(loginSchema.parse({ email: " ADMIN@EDUTRACK.LOCAL ", password: "senha" }).email)
      .toBe("admin@edutrack.local");
  });

  it("returns the public email message for an invalid email", () => {
    const result = loginSchema.safeParse({ email: "invalid", password: "senha" });
    expect(result.error?.flatten().fieldErrors.email).toContain("Informe um e-mail válido.");
  });

  it("requires a password without describing the password policy", () => {
    const result = loginSchema.safeParse({ email: "admin@edutrack.local", password: "" });
    expect(result.error?.flatten().fieldErrors.password).toEqual(["Informe sua senha."]);
  });
});
```

- [ ] **Step 2: Implement the login schema**

Export:

```ts
export const loginSchema: z.ZodObject<{
  email: z.ZodString;
  password: z.ZodString;
}>;
```

Use Portuguese field messages: `Informe um e-mail válido.` and `Informe sua senha.`

- [ ] **Step 3: Implement login and logout Server Actions**

`loginAction` must:

1. parse `FormData` with `loginSchema`;
2. return `validation_error` with `flatten().fieldErrors` when invalid;
3. call `authenticate`;
4. return the same `E-mail ou senha inválidos.` message for both credential failures;
5. call `startUserSession` and redirect to `/` on success;
6. return a safe `internal_error` with `crypto.randomUUID()` on unexpected failures.

`logoutAction` calls `endCurrentSession` and redirects to `/login`.

- [ ] **Step 4: Write and implement the login form test**

Create a testable `LoginFormView` and wrapper `LoginForm`. Test the view with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginFormView } from "@/components/auth/login-form";

describe("LoginFormView", () => {
  it("renders accessible fields and validation feedback", () => {
    render(<LoginFormView
      state={{ status: "validation_error", message: "Revise os campos.", fieldErrors: { email: ["Informe um e-mail válido."] } }}
      pending={false}
      formAction={vi.fn()}
    />);
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(screen.getByText("Informe um e-mail válido.")).toBeVisible();
  });

  it("shows the pending state", () => {
    render(<LoginFormView state={{ status: "idle" }} pending formAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
  });
});
```

`LoginForm` calls `useActionState(loginAction, { status: "idle" })` and passes the returned state, action and pending flag to `LoginFormView`.

- [ ] **Step 5: Build the login page**

The page must show the EduTrack mark, title `Acessar o EduTrack`, short instruction `Entre com as credenciais configuradas para o sistema.` and the form. It must not contain marketing copy, illustration, plan or public registration link.

- [ ] **Step 6: Write and implement Proxy redirect tests**

Create `tests/unit/proxy.test.ts` with these pure decisions before wiring `NextRequest`:

```ts
expect(decideAuthRedirect({ pathname: "/", hasCookie: false })).toBe("/login");
expect(decideAuthRedirect({ pathname: "/login", hasCookie: true })).toBe("/");
expect(decideAuthRedirect({ pathname: "/login", hasCookie: false })).toBeNull();
```

In `src/proxy.ts`, use the cookie only for optimistic redirects. Match application pages while excluding `_next`, metadata and static files. Do not query Prisma in Proxy.

- [ ] **Step 7: Verify login behavior**

Run:

```powershell
corepack pnpm test -- src/schemas/login-schema.test.ts src/components/auth/login-form.test.tsx tests/unit/proxy.test.ts
corepack pnpm run typecheck
corepack pnpm run lint
```

Then start `corepack pnpm run dev` and manually verify invalid credentials remain on `/login`, valid seed credentials reach `/`, and logout returns to `/login`.

- [ ] **Step 8: Commit the login flow**

```powershell
git add src/schemas src/actions src/components/auth 'src/app/(auth)' src/proxy.ts tests/unit/proxy.test.ts
git commit -m "feat: add EduTrack login flow"
```

---

### Task 7: Approved administrative shell and empty dashboard

**Files:**
- Create: `components.json`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/config/navigation.ts`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/layout/app-header.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/page.tsx` by moving it to `src/app/(dashboard)/page.tsx`
- Test: `src/components/layout/app-sidebar.test.tsx`
- Test: `src/app/(dashboard)/page.test.tsx`

**Interfaces:**
- Consumes: `requireCurrentUser`, `logoutAction`, Lucide React and approved visual direction.
- Produces: `AppSidebar({ pathname }: { pathname: string })`, protected application shell with compact navigation and a truthful zero-data dashboard.

- [ ] **Step 1: Initialize shadcn/ui and add only required components**

Run:

```powershell
corepack pnpm dlx shadcn@latest init -d
corepack pnpm dlx shadcn@latest add button sheet dropdown-menu separator
```

Keep Tailwind v4 and the `@/*` alias. Do not add card, chart or animation dependencies in this task.

- [ ] **Step 2: Write the failing sidebar test**

Create `src/components/layout/app-sidebar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppSidebar } from "@/components/layout/app-sidebar";

describe("AppSidebar", () => {
  it("shows the enabled overview and no dead links for future modules", () => {
    render(<AppSidebar pathname="/" />);
    expect(screen.getByText("EduTrack")).toBeVisible();
    expect(screen.getByRole("link", { name: "Visão geral" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "Alunos" })).not.toBeInTheDocument();
    expect(screen.getByText("Alunos")).toHaveAttribute("aria-disabled", "true");
  });
});
```

- [ ] **Step 3: Define navigation state**

Create `src/config/navigation.ts`:

```ts
export type NavigationItem = {
  label: string;
  href: string;
  enabled: boolean;
  icon: "layout-dashboard" | "users" | "book-open" | "history" | "file-text" | "settings";
};

export const navigationItems: NavigationItem[] = [
  { label: "Visão geral", href: "/", enabled: true, icon: "layout-dashboard" },
  { label: "Alunos", href: "/students", enabled: false, icon: "users" },
  { label: "Registrar aula", href: "/lessons/new", enabled: false, icon: "book-open" },
  { label: "Histórico", href: "/history", enabled: false, icon: "history" },
  { label: "Relatórios", href: "/reports", enabled: false, icon: "file-text" },
  { label: "Configurações", href: "/settings", enabled: false, icon: "settings" },
];
```

Later plans enable each item in the same commit that creates its route.

- [ ] **Step 4: Implement the desktop and mobile navigation**

Follow the approved mockup: 216px desktop sidebar, compact 76px intermediate sidebar, temporary Sheet on mobile, subtle indigo active state, no gradients and no icon tiles. Every icon is decorative and every icon-only trigger has an accessible name.

- [ ] **Step 5: Implement the protected dashboard layout**

The layout calls `requireCurrentUser()` before rendering. Pass only `{ id, name, email }` to header components. The user menu contains `Configurações` as disabled until its route exists and a form bound to `logoutAction`.

- [ ] **Step 6: Write the failing empty-dashboard test**

Create `src/app/(dashboard)/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "@/app/(dashboard)/page";

describe("foundation dashboard", () => {
  it("shows a truthful empty state without invented metrics", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { name: "Visão geral" })).toBeVisible();
    expect(screen.getByText("Adicione o primeiro aluno para começar.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Cadastrar primeiro aluno" })).toBeDisabled();
    expect(screen.queryByText("18")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Implement the truthful foundation dashboard**

Render the approved shell and an empty state only. Do not query students before the student repository exists and do not render hard-coded totals. The next plan replaces the disabled action and adds real metrics atomically.

- [ ] **Step 8: Apply the EduTrack visual tokens**

In `globals.css`, define light theme tokens using neutral gray surfaces, indigo primary, compact 7–10px radii, minimal shadows, visible focus rings and semantic green/red/amber colors. Preserve shadcn variable names, WCAG-readable contrast and Geist typography. Do not install Motion.

- [ ] **Step 9: Run component and production verification**

```powershell
corepack pnpm test -- src/components/layout/app-sidebar.test.tsx 'src/app/(dashboard)/page.test.tsx'
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

Expected: all commands pass; build contains `/`, `/login` and Proxy.

- [ ] **Step 10: Commit the shell**

```powershell
git add components.json src/components/ui src/components/layout src/config/navigation.ts src/app src/app/globals.css
git commit -m "feat: add protected EduTrack shell"
```

---

### Task 8: Foundation documentation and acceptance checkpoint

**Files:**
- Create: `README.md`
- Modify: `.env.example`
- Test: all priority tests from Tasks 1–7.

**Interfaces:**
- Consumes: complete foundation.
- Produces: reproducible local setup and evidence for starting the student/lesson plan.

- [ ] **Step 1: Document the foundation setup**

Create `README.md` sections for requirements, Prisma Postgres creation, `.env`, installation, `db:setup`, development, initial credentials, password warning, lint, types, tests and production build. State that student, lesson and report modules are delivered by subsequent approved plans; do not claim the full product is complete.

- [ ] **Step 2: Run a clean setup rehearsal**

From a clean dependency state, run:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm run db:setup
corepack pnpm test
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

Expected: every command exits with code 0. `db:setup` is idempotent and leaves exactly one administrator for the configured e-mail.

- [ ] **Step 3: Perform manual authentication acceptance**

Verify:

1. unauthenticated `/` redirects to `/login`;
2. invalid credentials show `E-mail ou senha inválidos.`;
3. valid credentials redirect to `/`;
4. authenticated `/login` redirects to `/`;
5. deleting or expiring the database session causes the protected layout to redirect;
6. logout revokes the database session and clears the cookie;
7. keyboard navigation reaches all login and shell actions with visible focus;
8. shell is usable at 360px, 736px and desktop width.

- [ ] **Step 4: Inspect for forbidden artifacts**

Run:

```powershell
$taskPlaceholderPattern = ('TO' + 'DO|TB' + 'D|FIX' + 'ME')
rg -n $taskPlaceholderPattern src prisma README.md
rg -n "console\.log|mock|lorem|supabase|firebase" src prisma README.md
git status --short
```

Expected: no temporary logs, placeholders, mock dashboard values or forbidden services. Only intentional project files are tracked or staged.

- [ ] **Step 5: Commit the foundation checkpoint**

```powershell
git add README.md .env.example
git commit -m "docs: add EduTrack foundation setup"
```

- [ ] **Step 6: Record completion evidence**

Capture the exact passing-test count printed by `corepack pnpm test`, followed by `Lint: passed`, `Types: passed`, `Build: passed`, `Manual auth: passed`, and `Known limitation: domain modules begin in the next implementation plan`.

Do not mark the full EduTrack complete at this checkpoint.
