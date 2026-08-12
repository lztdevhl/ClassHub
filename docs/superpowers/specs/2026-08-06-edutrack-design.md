# EduTrack — Especificação de design

**Data:** 6 de agosto de 2026  
**Status:** aprovado para planejamento  
**Produto:** sistema administrativo interno para acompanhamento de aulas  
**Usuário inicial:** um único administrador

## 1. Objetivo

O EduTrack será uma aplicação web interna para cadastrar alunos, registrar aulas e faltas, acompanhar atividades e produzir relatórios organizados para professores. O produto deve funcionar como ferramenta real de trabalho, com interface profissional, operação rápida e dados persistentes.

O acesso inicial será por login. Não haverá landing page, cadastro público ou conteúdo comercial.

## 2. Critérios de sucesso

O sistema estará pronto para uso quando:

- todas as rotas administrativas estiverem protegidas;
- o administrador puder cadastrar, editar, consultar e inativar alunos;
- aulas, presenças, faltas, atividades e próximos passos puderem ser registrados e corrigidos;
- dashboard, histórico e página individual refletirem dados reais do banco;
- filtros, paginação e ordenação do histórico funcionarem;
- relatórios puderem ser visualizados, impressos e baixados em PDF A4;
- configurações de conta e textos de relatório puderem ser alteradas;
- produção estiver isolada de qualquer ambiente não produtivo;
- lint, verificação de tipos, testes prioritários e build de produção forem aprovados;
- a documentação permitir instalar, configurar, operar e proteger os dados do sistema.

### 2.1 Prioridade para o prazo de uma semana

O trabalho será organizado por impacto, sem permitir que itens complementares atrasem o produto utilizável.

**Prioridade primária — obrigatória para entrega:**

- fundação, banco, seed e autenticação;
- CRUD de alunos;
- registro e edição de presença e falta;
- dashboard com dados reais;
- página individual do aluno;
- histórico com filtros e paginação;
- relatórios, prévia e PDF funcional;
- configurações essenciais;
- validações e segurança dos fluxos principais;
- responsividade das ações essenciais;
- testes unitários e de integração das regras críticas;
- lint, verificação de tipos e build de produção aprovados;
- documentação de instalação e implantação.

**Prioridade secundária — executar somente depois da entrega primária aprovada:**

- suíte Playwright completa;
- scripts avançados de backup e restauração;
- automação e refinamentos adicionais da infraestrutura de preview;
- polimentos que não bloqueiem operação, segurança ou legibilidade.

## 3. Escopo excluído

Não serão implementados nesta versão:

- landing page, preços, planos ou conteúdo institucional;
- cadastro público, login social ou recuperação por e-mail;
- multiempresa, múltiplas escolas, convites ou níveis de acesso;
- áreas próprias para aluno ou professor;
- pagamentos, finanças, agenda complexa ou aplicativo nativo;
- envio automático de e-mail ou WhatsApp;
- notificações push, IA, chatbot ou gamificação;
- arquivos, importação em massa ou Google Calendar.

## 4. Decisão de arquitetura

O EduTrack será um monólito modular em Next.js App Router, implantado na Vercel e executado no runtime Node.js.

```text
Páginas e componentes
        ↓
Server Actions
        ↓
Serviços de domínio
        ↓
Repositórios
        ↓
Prisma ORM
        ↓
Prisma Postgres
```

Responsabilidades:

- **Páginas e componentes:** renderização, interação e feedback visual. Não acessam o banco nem implementam regras de negócio.
- **Server Actions:** fronteira de entrada. Validam sessão, autorização e dados com Zod; chamam serviços; retornam resultados tipados.
- **Serviços:** regras de negócio, cálculos, coordenação de repositórios e transações.
- **Repositórios:** única camada que conhece Prisma. Expõem operações orientadas ao domínio.
- **Prisma Postgres:** fonte de verdade para usuários, sessões, alunos, aulas e configurações.

A separação permitirá testar regras sem banco e substituir detalhes de persistência sem alterar a interface ou os serviços.

### 4.1 Stack definida

- Next.js com App Router e runtime Node.js;
- TypeScript em modo estrito;
- Tailwind CSS e shadcn/ui;
- React Hook Form e Zod;
- Prisma ORM e Prisma Postgres;
- bcrypt para hash de senha;
- TanStack Table no histórico em desktop;
- date-fns para datas e períodos;
- Lucide React para ícones;
- `@react-pdf/renderer` para documentos PDF;
- ESLint;
- Vitest para testes unitários e de integração;
- Playwright para fluxos ponta a ponta, como prioridade secundária após o núcleo aprovado.
- pnpm 11.20.0 via Corepack, declarado em `packageManager`, com `pnpm-lock.yaml` versionado e instalações reproduzíveis por `corepack pnpm install --frozen-lockfile`; nenhum comando depende de shim global ou `corepack enable`.

Motion somente será instalado se uma microinteração funcional justificar a dependência. Não haverá animações decorativas.

## 5. Banco e ambientes

SQLite foi removido da arquitetura porque a Vercel não oferece sistema de arquivos persistente para funções serverless. O banco será PostgreSQL por meio do Prisma Postgres, integrado à Vercel.

O tráfego da aplicação usará conexão agrupada. Migrations, Prisma Studio, inspeção e rotinas administrativas usarão conexão direta.

Variáveis mínimas:

```env
DATABASE_URL="postgresql://conexao-agrupada"
DIRECT_URL="postgresql://conexao-direta"
INITIAL_ADMIN_NAME="Administrador"
INITIAL_ADMIN_EMAIL="admin@edutrack.local"
INITIAL_ADMIN_PASSWORD="alterar-esta-senha"
SESSION_SECRET="adicione-uma-chave-segura"
APP_URL="http://localhost:3000"
```

Regras ambientais:

- desenvolvimento e produção não compartilham bancos;
- previews nunca acessam dados reais do cliente e apontam, no mínimo, para um ambiente não produtivo;
- automação de bancos efêmeros, branching e outros refinamentos de preview são prioridade secundária;
- `.env` e credenciais não são versionados;
- `.env.example` contém somente valores ilustrativos;
- o seed cria o administrador inicial lendo o ambiente;
- dados de demonstração são opcionais e nunca entram automaticamente em produção;
- a partir da etapa que cria `prisma/schema.prisma`, `postinstall` chama `prisma generate` diretamente pelo `PATH` do lifecycle para gerar o Prisma Client nos builds da Vercel; antes disso, o script não existe para preservar instalações limpas;
- produção executa migrations já revisadas com `prisma migrate deploy`.

## 6. Módulos

### 6.1 Autenticação

- login com e-mail e senha;
- logout;
- sessão opaca em cookie seguro;
- proteção de todas as rotas administrativas;
- redirecionamento ao login quando não autenticado;
- redirecionamento ao dashboard quando autenticado tenta abrir o login;
- alteração de e-mail e senha nas configurações;
- revogação de sessões após troca de senha.

### 6.2 Dashboard

- alunos ativos;
- aulas, presenças e faltas no mês;
- atividades pendentes;
- taxa de presença;
- últimos registros;
- próximos acompanhamentos;
- ação primária para registrar aula;
- estados vazios orientados para o próximo passo.

Não haverá gráficos na primeira entrega, salvo se os dados reais demonstrarem necessidade durante a validação final.

### 6.3 Alunos

- listagem com busca e filtro por status;
- cadastro, visualização e edição;
- ativação e inativação;
- exclusão confirmada apenas quando não houver aulas;
- página individual com indicadores e histórico recente.

### 6.4 Aulas

- registro rápido de presença ou falta;
- edição posterior;
- opção de salvar e registrar outra;
- exclusão confirmada;
- histórico com filtros, paginação e ordenação;
- cards responsivos no celular.

### 6.5 Relatórios

- seleção de aluno e período;
- opções para observações, atividades e próximos passos;
- prévia no navegador;
- impressão;
- PDF A4 estruturado;
- relatório individual acessível pelo aluno e pelo histórico.

### 6.6 Configurações

- nome do responsável;
- organização opcional;
- e-mail de acesso;
- senha;
- cabeçalho e rodapé padrão dos relatórios.

## 7. Modelo de dados

### User

- `id`: UUID ou CUID, chave primária;
- `name`: obrigatório;
- `email`: obrigatório, normalizado e único;
- `passwordHash`: obrigatório;
- `createdAt` e `updatedAt`.

### Session

- `id`: chave primária;
- `userId`: relação com `User`;
- `tokenHash`: único; o token bruto existe somente no cookie;
- `expiresAt`;
- `createdAt` e `updatedAt`;
- exclusão em cascata quando o usuário for removido.

### Student

- `id`;
- `name`;
- `className`;
- `subject`;
- `teacherName`;
- `phone`, opcional;
- `email`, opcional e normalizado quando informado;
- `generalNotes`, opcional;
- `status`: `ACTIVE` ou `INACTIVE`;
- `createdAt` e `updatedAt`.

### Lesson

- `id`;
- `studentId`;
- `lessonDate`: data sem horário;
- `lessonTime`: texto opcional validado como `HH:mm`;
- `attendanceStatus`: `PRESENT` ou `ABSENT`;
- `content`, opcional no banco;
- `activity`, opcional;
- `activityCompleted`, opcional;
- `notes`, opcional;
- `nextSteps`, opcional;
- `createdAt` e `updatedAt`.

### Settings

- `id`;
- `userId`: único, formando relação individual com `User`;
- `organizationName`, opcional;
- `reportHeader`, opcional;
- `reportFooter`, opcional;
- `createdAt` e `updatedAt`.

Índices principais:

- aluno por `status` e `name`;
- aula por `studentId` e `lessonDate`;
- aula por `attendanceStatus` e `lessonDate`;
- aula por `activityCompleted` e `lessonDate`;
- sessão por `tokenHash` e `expiresAt`.

Totais e taxas não serão armazenados. Serão calculados a partir de aulas reais.

## 8. Regras de negócio

### Alunos

- nome, turma, disciplina e professor são obrigatórios;
- o e-mail é validado somente quando informado;
- aluno inativo permanece consultável e mantém todo o histórico;
- aluno com aula não pode ser excluído fisicamente;
- aluno sem aula pode ser excluído após confirmação explícita;
- aulas existentes nunca são apagadas em cascata ao excluir aluno.

### Aulas

- aluno, data e presença são obrigatórios;
- datas inválidas são rejeitadas;
- presença exige conteúdo trabalhado;
- falta não exige conteúdo ou atividade;
- ao mudar uma aula para falta, conteúdo, atividade e conclusão são limpos para impedir contradições;
- atividade pendente significa atividade preenchida e `activityCompleted = false`;
- sem atividade, `activityCompleted` permanece nulo;
- taxa de presença é `presenças / total de aulas × 100`, com zero quando não houver aulas;
- página do aluno ordena histórico do mais recente para o mais antigo;
- relatório apresenta registros em ordem cronológica crescente para leitura documental.

### Configurações

- troca de senha exige senha atual;
- nova senha exige confirmação e política mínima documentada;
- troca de e-mail exige unicidade;
- alterações sensíveis invalidam outras sessões do usuário.

## 9. Rotas

```text
/login
/
/students
/students/new
/students/[id]
/students/[id]/edit
/lessons/new
/lessons/[id]
/lessons/[id]/edit
/history
/reports
/reports/preview
/settings
```

`/` será o dashboard autenticado. Não haverá rota pública de cadastro.

Páginas de suporte:

- `not-found` para recursos ausentes;
- `error` para falhas inesperadas;
- `loading` somente onde o carregamento assíncrono justificar;
- acesso negado com retorno seguro ao login ou dashboard.

## 10. Interface e sistema visual

A direção aprovada usa:

- fundo cinza muito claro e superfícies brancas;
- índigo moderado como cor primária;
- verde, vermelho suave e âmbar para estados sem depender apenas da cor;
- tipografia Geist ou Inter;
- raios discretos, bordas suaves e sombras mínimas;
- alta densidade informacional com hierarquia clara;
- sidebar compacta, recolhida em telas intermediárias e temporária no celular;
- cabeçalho discreto e ação principal contextual;
- formulários agrupados por significado, sem um card por campo;
- tabelas sem excesso de linhas verticais;
- cards responsivos no celular quando a tabela perder legibilidade.

Padrões:

- campos e botões com alturas consistentes;
- labels sempre visíveis;
- foco evidente;
- mensagens de erro junto ao campo;
- feedback de sucesso após gravação;
- confirmação em ações destrutivas;
- um único botão de maior ênfase por grupo de ações;
- estados vazios com explicação curta e próximo passo;
- skeleton somente em carregamentos em que reduz instabilidade visual.

Não serão usados gradientes fortes, glassmorphism, cards gigantes, títulos enormes, saudações genéricas, emojis ou animações decorativas.

## 11. Fluxos principais

### Primeiro acesso

1. O administrador abre o domínio e é redirecionado a `/login`.
2. Informa credenciais definidas no ambiente e criadas pelo seed.
3. Após autenticação, entra diretamente no dashboard.
4. O sistema informa de maneira discreta que a senha inicial deve ser alterada.
5. Sem alunos, o dashboard oferece cadastrar o primeiro aluno.

### Registrar aula

1. O administrador seleciona o aluno.
2. A data inicia no dia atual e pode ser alterada.
3. Seleciona presença ou falta.
4. Em presença, conteúdo é obrigatório; atividade é opcional.
5. Em falta, campos de conteúdo e atividade são removidos da exigência.
6. Salva e recebe confirmação.
7. Pode abrir o registro ou registrar outra aula.

### Gerar relatório

1. Seleciona aluno, período e conteúdo opcional.
2. O servidor valida filtros e monta um `ReportViewModel` único.
3. A prévia HTML apresenta exatamente os dados que alimentarão o PDF.
4. O administrador imprime ou solicita o PDF.
5. O servidor produz o documento A4 em runtime Node.js.

## 12. Relatórios e PDF

Um serviço de relatório produzirá um modelo imutável contendo dados do aluno, período, métricas e registros. A prévia e o PDF consumirão o mesmo modelo para evitar divergências.

O PDF será gerado no servidor com `@react-pdf/renderer`. A implementação será isolada atrás de um serviço de documento para que eventuais ajustes de biblioteca não afetem a montagem do relatório.

O documento conterá:

- marca textual EduTrack;
- título e período;
- dados do aluno e professor;
- resumo numérico;
- histórico cronológico;
- observações conforme seleção;
- cabeçalho e rodapé configuráveis;
- data de geração;
- margens, tipografia e quebras de página apropriadas para A4.

O PDF não será captura de tela da interface.

## 13. Autenticação e segurança

- senha com bcrypt;
- credenciais ausentes ou inválidas retornam mensagem uniforme;
- token de sessão aleatório e de alta entropia;
- somente o hash do token fica no banco;
- cookie `HTTP-only`, `Secure` em produção, `SameSite=Lax` e escopo de caminho restrito;
- expiração absoluta da sessão;
- logout remove cookie e revoga sessão;
- middleware faz redirecionamento inicial, mas cada operação de servidor verifica a sessão novamente;
- validação Zod no cliente e no servidor;
- Server Actions verificam origem e autorização;
- erros externos não incluem stack trace, SQL ou detalhes internos;
- envs sensíveis não são expostos ao cliente;
- ações de gravação desabilitam reenvio enquanto estão pendentes;
- transações protegem operações compostas;
- senha nunca aparece em logs.

## 14. Resultados, erros e feedback

Server Actions usarão um resultado discriminado:

```text
success: dados ou confirmação
validation_error: erros por campo
unauthorized: sessão ausente ou expirada
not_found: recurso inexistente
conflict: regra de negócio ou unicidade
internal_error: mensagem segura e identificador de diagnóstico
```

Formulários preservarão dados após erros recuperáveis. Listas distinguirão banco vazio de filtros sem resultado. Falhas de infraestrutura mostrarão tentativa novamente sem sugerir que os dados foram salvos.

## 15. Acessibilidade e responsividade

- HTML semântico;
- labels associados;
- navegação completa por teclado;
- foco visível;
- mensagens de erro anunciadas;
- nomes acessíveis em botões de ícone;
- ícones decorativos ignorados por leitores de tela;
- contraste compatível com WCAG AA nos elementos essenciais;
- estado não representado somente por cor;
- sidebar compacta no desktop intermediário e menu temporário no celular;
- histórico em cards no celular;
- formulários e filtros empilhados em telas estreitas;
- prévia do relatório adaptada sem comprometer a proporção A4 para impressão.

## 16. Estratégia de testes

### Unitários

Vitest cobrirá:

- schemas Zod;
- regras de presença e falta;
- cálculo da taxa de presença;
- definição de atividade pendente;
- montagem do relatório;
- regras de exclusão e inativação.

### Integração

- repositórios Prisma em banco PostgreSQL de teste;
- serviços com transações;
- criação e revogação de sessão;
- filtros e paginação;
- seed idempotente;
- geração do PDF com conteúdo esperado.

### Ponta a ponta — prioridade secundária

A suíte Playwright completa será executada depois que os fluxos principais, testes prioritários e build estiverem aprovados. Ela cobrirá:

- login e logout;
- bloqueio de rotas;
- criação e edição de aluno;
- registro de presença;
- registro de falta;
- histórico filtrado;
- prévia e download do relatório;
- troca de senha.

Antes da entrega primária serão executados lint, tipos, testes unitários e de integração prioritários, build e verificação manual dos fluxos principais, teclado e responsividade essencial. A ausência temporária da suíte Playwright completa não poderá mascarar falhas conhecidas nesses fluxos.

## 17. Scripts esperados

Instalação reproduzível:

```text
corepack use pnpm@11.20.0
corepack pnpm install --frozen-lockfile
```

```text
corepack pnpm run dev
corepack pnpm run build
corepack pnpm run start
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run test
corepack pnpm run db:generate
corepack pnpm run db:migrate
corepack pnpm run db:deploy
corepack pnpm run db:seed
corepack pnpm run db:setup
```

Scripts de prioridade secundária:

```text
corepack pnpm run test:e2e
corepack pnpm run db:backup
corepack pnpm run db:restore
```

`db:setup` gerará o client, aplicará migrations no ambiente local e executará seed. Quando implementada, a restauração exigirá seleção explícita do backup e confirmação antes de alterar o banco de destino.

## 18. Backup e restauração

Na entrega primária, o README documentará os recursos de proteção e exportação oferecidos pelo Prisma Postgres e um procedimento manual seguro. Depois que o núcleo estiver aprovado:

- `db:backup` criará exportação com data e hora quando `pg_dump` estiver disponível;
- `db:restore` usará conexão direta e nunca escolherá automaticamente produção;
- a restauração exigirá confirmação textual do ambiente e do arquivo;
- o banco atual deverá ser exportado antes de uma restauração manual;
- testes de restauração serão feitos em banco não produtivo.

## 19. Estrutura prevista

```text
src/
  app/
    (auth)/
    (dashboard)/
  actions/
  components/
    ui/
    layout/
    students/
    lessons/
    reports/
    forms/
  config/
  hooks/
  lib/
  repositories/
  schemas/
  services/
  types/
prisma/
  migrations/
  schema.prisma
  seed.ts
tests/
  unit/
  integration/
  e2e/
public/
```

A estrutura poderá ser simplificada quando uma pasta não justificar existência. Arquivos grandes e componentes monolíticos serão evitados.

## 20. Etapas de implementação

### Ciclo 1 — Fundação

- scaffold do Next.js;
- Tailwind e shadcn/ui;
- lint, tipos e testes;
- Prisma Postgres e migrations;
- seed;
- autenticação;
- shell administrativo e sistema visual.

### Ciclo 2 — Operação principal

- alunos;
- registro e edição de aulas;
- dashboard;
- página individual do aluno;
- testes dos fluxos.

### Ciclo 3 — Consulta e documentos

- histórico, filtros e paginação;
- relatórios e prévia;
- PDF;
- configurações;
- testes correspondentes.

### Ciclo 4A — Entrega primária obrigatória

- estados de erro e vazios;
- acessibilidade e responsividade dos fluxos essenciais;
- README;
- verificação final;
- preparação da produção na Vercel;
- lint, tipos, testes prioritários e build aprovados.

### Ciclo 4B — Itens secundários, se houver tempo

- suíte Playwright completa;
- scripts avançados de backup e restauração;
- refinamentos e automações do ambiente de preview;
- polimento adicional sem impacto nos fluxos principais.

Os ciclos 1, 2, 3 e 4A devem terminar com seus testes prioritários verdes e revisão. O ciclo 4B somente começa depois que a entrega primária estiver funcional e com build aprovado.

## 21. Riscos e mitigação

- **Conexões serverless:** usar pooling do Prisma Postgres e reutilizar Prisma Client por instância aquecida.
- **Migrations em previews:** isolar banco de preview e não executar mudanças destrutivas sem revisão.
- **Fusos horários:** armazenar dia da aula como data sem horário e validar horário separadamente.
- **PDF grande:** paginar registros no documento e testar múltiplas páginas.
- **Exclusão de histórico:** usar restrição no banco e regra no serviço.
- **Credencial inicial:** exigir configuração por env e indicar troca após o primeiro acesso.
- **Dependência do provedor:** manter domínio e repositórios desacoplados; usar PostgreSQL padrão.

## 22. Decisões fechadas

- Vercel será o destino de hospedagem.
- Prisma Postgres substituirá SQLite.
- Prisma ORM será mantido.
- A arquitetura será monólito modular com Server Actions, serviços e repositórios.
- O sistema terá um único administrador inicialmente.
- Não haverá multiempresa ou papéis.
- A direção visual aprovada é compacta, discreta e profissional.
- O escopo será entregue em quatro ciclos sem adicionar funcionalidades externas ao briefing.
