# Deploy do EduTrack na Vercel

## 1. Pré-requisitos

- Repositório do EduTrack no GitHub.
- Projeto na Vercel conectado ao repositório.
- PostgreSQL hospedado, vazio e acessível externamente.
- Node.js 20.19 ou superior para executar Prisma localmente.

Não use o PostgreSQL local como banco da Vercel e não envie o arquivo `.env` ao Git.

## 2. Variáveis da Vercel

Configure em **Vercel → Project → Settings → Environment Variables**, ao menos para `Production`:

- `DATABASE_URL`: URL PostgreSQL da aplicação. Prefira a URL pooled do provedor.
- `SESSION_SECRET`: segredo aleatório e estável com pelo menos 32 caracteres. Gere localmente com:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Não são usadas variáveis `NEXTAUTH_*`, `AUTH_*` ou `NEXT_PUBLIC_*`. `NODE_ENV` é definido pela plataforma.

`DIRECT_URL` não é necessária para atender requisições na Vercel. Use-a no ambiente em que executar migrations e bootstrap quando o provedor oferecer uma conexão direta. Sem ela, o Prisma CLI usa `DATABASE_URL`.

## 3. PostgreSQL de produção

Crie um banco PostgreSQL externo pelo Marketplace da Vercel ou diretamente em um provedor. Guarde a URL pooled para `DATABASE_URL` e a URL direta para `DIRECT_URL`, se houver. O banco deve iniciar vazio. Não execute `prisma db seed` em produção.

## 4. Aplicar migrations

Em um terminal seguro, configure temporariamente as URLs do banco de produção sem gravá-las no repositório e execute:

```bash
npx prisma migrate deploy
```

Isso aplica as 4 migrations versionadas. Não use `migrate dev`, `migrate reset` ou `db push` em produção.

## 5. Criar o primeiro professor

Depois das migrations, no mesmo terminal apontado para produção:

```bash
npm run create-admin -- --name="Nome do professor" --email="professor@dominio.com"
```

A senha é solicitada e confirmada sem ser exibida. O script usa o mesmo bcrypt da autenticação, cria somente `User` e `Settings` e recusa sobrescrever e-mail existente. Não cria alunos, aulas, turmas ou dados de demonstração.

## 6. Fazer o deploy

1. Envie a versão validada para a branch principal do GitHub.
2. Importe/conecte o repositório na Vercel como projeto Next.js.
3. Cadastre `DATABASE_URL` e `SESSION_SECRET` antes do primeiro deploy.
4. Mantenha instalação `npm install` e build `npm run build`.
5. Faça o deploy pela integração Git. Não é necessário `vercel.json`.

O `postinstall` executa somente `prisma generate`; migrations permanecem separadas do build.

## 7. Validar produção

- Abra `/login` por HTTPS e entre com o professor criado.
- Confirme que `/dashboard` abre sem dados fictícios.
- Teste logout e novo login.
- Teste uma escrita controlada, importação CSV/XLSX e exportação PDF.

Importação e PDF processam dados em memória e não dependem de disco persistente.

## 8. Migrations futuras

Crie migrations no desenvolvimento com `npm run db:migrate`, revise e versione `prisma/migrations`. Antes de liberar a aplicação correspondente, execute contra produção:

```bash
npx prisma migrate deploy
```

Depois publique a versão. Faça backup antes de migrations que alterem ou removam dados.
