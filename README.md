# EduTrack

Sistema administrativo privado para um professor particular acompanhar alunos, aulas, frequência, atividades, pendências e relatórios em PDF.

## Funcionalidades

- Login privado, logout, sessão persistida no PostgreSQL e limitação de tentativas.
- Dashboard com indicadores reais e registros recentes.
- Cadastro, edição, pesquisa e arquivamento de alunos sem apagar o histórico.
- Registro, edição, exclusão e filtros de aulas.
- Histórico completo e indicadores por aluno.
- Pendências com conclusão direta.
- Relatórios combinando aluno, período, presença e atividade, com prévia e PDF multipágina.
- Configuração do perfil e alteração segura de senha.

## Pré-requisitos

- Node.js 22 ou superior
- npm
- PostgreSQL instalado diretamente no sistema operacional

Não são usados Docker, SQLite, Supabase, Firebase ou banco em memória.

## Banco local

No `psql` ou no pgAdmin, crie o banco:

```sql
CREATE DATABASE edutrack;
```

Copie `.env.example` para `.env` e ajuste usuário e senha. Em uma instalação local, `DATABASE_URL` e `DIRECT_URL` podem ser iguais:

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/edutrack"
DIRECT_URL="postgresql://postgres:senha@localhost:5432/edutrack"
INITIAL_ADMIN_NAME="Professor"
INITIAL_ADMIN_EMAIL="admin@edutrack.local"
INITIAL_ADMIN_PASSWORD="EduTrack@1234"
SESSION_SECRET="gere-um-segredo-com-pelo-menos-32-caracteres"
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

Nunca publique o arquivo `.env`. Em produção, use conexão PostgreSQL com pool em `DATABASE_URL` e conexão administrativa direta em `DIRECT_URL`.

## Instalação e banco

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

O seed é idempotente e provisiona somente o administrador inicial, sem criar alunos, aulas ou outros dados de demonstração. A senha fica somente como hash bcrypt. Altere a senha de desenvolvimento em **Configurações** antes de uso real.

## Executar

```bash
npm run dev
```

Acesse `http://localhost:3000/login`.

Para produção:

```bash
npm run lint
npm run build
npm start
```

## Estrutura

- `src/app`: páginas privadas, login e rota do PDF.
- `src/actions`: mutações autenticadas no servidor.
- `src/components`: layout, formulários e componentes visuais.
- `src/lib`: sessão, Prisma, datas, consultas e PDF.
- `src/schemas`: validações Zod compartilhadas.
- `prisma`: schema, migrations e seed.
