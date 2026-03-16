# Especificacao de dados para Drizzle + Postgres

## Objetivo

Definir a primeira camada de persistencia do `devroast` com Drizzle ORM e Postgres, tomando como base:

- o que ja esta descrito em `README.md`
- o estado atual do layout no Pencil (`Screen 1 - Code Input`, `Screen 2 - Roast Results`, `Screen 3 - Shame Leaderboard`, `Screen 4 - OG Image`)

O foco desta especificacao e cobrir o MVP de dados para:

- receber um trecho de codigo
- armazenar o resultado do roast
- renderizar a tela de resultados
- alimentar o leaderboard
- preparar o caminho para compartilhamento e OG image

## Leitura do produto atual

### README

O README deixa claro que o produto precisa:

- receber trechos de codigo para analise
- ativar um modo de roast mais sarcastico
- exibir score
- mostrar leaderboard
- manter um playground interno de UI

### Layout no Pencil

O layout atual reforca alguns requisitos de dados:

- `Screen 1 - Code Input`
  - editor de codigo
  - toggle de `roast mode`
  - contador de codigos analisados
  - media global de score
  - preview do leaderboard
- `Screen 2 - Roast Results`
  - score numerico
  - verdict geral
  - quote/resumo do roast
  - metadados do snippet (`lang`, `lines`)
  - cards de analise com severidade (`critical`, `warning`, `good`)
  - bloco de diff com linhas `removed`, `added` e `context`
  - CTA de `share_roast`
- `Screen 3 - Shame Leaderboard`
  - ranking com score, preview do codigo, linguagem e quantidade de linhas
- `Screen 4 - OG Image`
  - depende do mesmo conjunto de dados do resultado publicado
- `Component Library` / playground
  - nao exige persistencia propria neste momento

## Decisoes de modelagem

- O dominio principal e um `roast` gerado a partir de uma submissao de codigo.
- O leaderboard pode ser derivado por query; nao precisa de tabela propria no MVP.
- O compartilhamento vale separar em tabela propria para permitir slug publico sem acoplar tudo ao registro principal.
- Linguagem deve ser `text` no MVP, nao enum, para nao limitar snippets arbitrarios.
- Score deve ser `numeric(3,1)` para refletir a UI atual (`1.2`, `3.5`, `9.2`).
- Playground de componentes fica fora do banco.

## Tabelas propostas

### 1. `roast_submissions`

Tabela principal. Representa uma submissao analisada e seu resultado consolidado.

Campos sugeridos:

- `id` uuid pk
- `source_code` text not null
- `source_hash` varchar(64) not null
- `language` text null
- `line_count` integer not null
- `roast_mode` `roast_mode_enum` not null
- `status` `analysis_status_enum` not null default `completed`
- `score` numeric(3,1) not null
- `score_label` text null
- `verdict` `roast_verdict_enum` not null
- `headline` text not null
- `summary` text not null
- `visibility` `submission_visibility_enum` not null default `private`
- `created_at` timestamp with time zone not null default now()
- `updated_at` timestamp with time zone not null default now()

Observacoes:

- `headline` cobre o texto principal do resultado, ex.: a quote do roast.
- `summary` cobre o resumo curto que pode abastecer resultado, share card e OG image.
- `score_label` pode guardar rotulos derivados do score se quisermos copy pronta para UI.
- `visibility` permite separar resultados privados de resultados elegiveis ao leaderboard/share.

### 2. `roast_issues`

Lista de cards da secao de analise do resultado.

Campos sugeridos:

- `id` uuid pk
- `submission_id` uuid not null fk -> `roast_submissions.id`
- `severity` `roast_issue_severity_enum` not null
- `title` text not null
- `description` text not null
- `display_order` integer not null
- `created_at` timestamp with time zone not null default now()

Observacoes:

- Cada card da tela `Analysis Section` vira um registro.
- `display_order` garante a mesma ordem da UI.

### 3. `roast_diff_lines`

Representa a secao de diff do roast.

Campos sugeridos:

- `id` uuid pk
- `submission_id` uuid not null fk -> `roast_submissions.id`
- `kind` `diff_line_kind_enum` not null
- `content` text not null
- `display_order` integer not null
- `old_line_number` integer null
- `new_line_number` integer null
- `created_at` timestamp with time zone not null default now()

Observacoes:

- O layout atual pede pelo menos `removed`, `added` e `context`.
- `old_line_number` e `new_line_number` sao opcionais, mas deixam a estrutura pronta para evoluir o diff sem migracao estrutural.

### 4. `roast_shares`

Tabela para compartilhamento publico, URL amigavel e material de OG image.

Campos sugeridos:

- `id` uuid pk
- `submission_id` uuid not null unique fk -> `roast_submissions.id`
- `slug` text not null unique
- `title` text not null
- `description` text not null
- `shared_at` timestamp with time zone not null default now()

Observacoes:

- Se um roast puder ser compartilhado uma unica vez por submissao, o `unique(submission_id)` resolve bem.
- O conteudo pode inicialmente espelhar `headline` e `summary`, mas a tabela deixa espaco para customizacao futura.

## Tabelas que nao precisamos agora

- `users`
  - nao ha autenticacao no produto atual
- `leaderboard_entries`
  - o ranking pode ser montado por query sobre `roast_submissions`
- `playground_components`
  - playground e somente UI interna neste momento
- `roast_runs` / `jobs`
  - so passam a fazer sentido quando a analise virar pipeline assincrono real

## Enums necessarios

### `roast_mode_enum`

- `standard`
- `full_roast`

Uso:

- representa o toggle da home
- diferencia analise normal de analise mais sarcastica

### `analysis_status_enum`

- `pending`
- `completed`
- `failed`

Uso:

- permite evoluir de um fluxo sincrono para assincrono sem retrabalho

### `submission_visibility_enum`

- `private`
- `public`
- `hidden`

Uso:

- `private`: resultado ainda nao publicado
- `public`: pode aparecer em leaderboard e share
- `hidden`: removido da vitrine sem apagar historico

### `roast_verdict_enum`

- `needs_serious_help`
- `needs_attention`
- `actually_good`

Uso:

- abastece o badge/verdict principal da tela de resultado
- tambem serve para OG image e filtros futuros

### `roast_issue_severity_enum`

- `critical`
- `warning`
- `good`

Uso:

- casa exatamente com os cards vistos na `Analysis Section`

### `diff_line_kind_enum`

- `context`
- `removed`
- `added`

Uso:

- casa exatamente com o bloco visual de diff do layout atual

## Relacionamentos

- `roast_submissions` 1:N `roast_issues`
- `roast_submissions` 1:N `roast_diff_lines`
- `roast_submissions` 1:1 `roast_shares`

## Como o leaderboard deve funcionar

No MVP, o leaderboard deve ser uma query e nao uma tabela fisica.

Filtro recomendado:

- `visibility = public`
- `status = completed`

Ordenacao recomendada:

1. `score` asc
2. `created_at` desc

Campos que a UI precisa retornar:

- `id`
- `score`
- `language`
- `line_count`
- preview curta derivada de `source_code`
- `slug` quando houver share publico

Observacao:

- Se a carga crescer, podemos criar uma `view` SQL ou materialized view depois. Nao parece necessario agora.

## Estrutura sugerida de arquivos

```text
src/
  db/
    client.ts
    index.ts
    schema/
      enums.ts
      roast-submissions.ts
      roast-issues.ts
      roast-diff-lines.ts
      roast-shares.ts
      relations.ts
drizzle/
drizzle.config.ts
docker-compose.yml
.env.example
```

## Recomendacao de stack para Drizzle

Recomendacao para este projeto:

- `drizzle-orm`
- `drizzle-kit`
- `postgres`
- `dotenv`

Motivo:

- Drizzle suporta config via `drizzle.config.ts` com `dialect: "postgresql"`, `schema` e `dbCredentials.url`.
- A documentacao atual mostra uma estrutura simples com schema em `src/db/schema.ts` ou pasta equivalente e migrations geradas por `drizzle-kit`.
- Para conexao, Drizzle suporta `postgres-js` via `drizzle-orm/postgres-js`, o que encaixa bem em Next.js/TypeScript.

Referencia usada via Context7:

- Drizzle ORM docs: `/drizzle-team/drizzle-orm-docs`
- Docker Compose docs: `/docker/compose`

## Configuracao de ambiente

### Variaveis esperadas

`.env.example`

```env
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
POSTGRES_DB=devroast
POSTGRES_USER=devroast
POSTGRES_PASSWORD=devroast
POSTGRES_PORT=5432
```

## Docker Compose sugerido

Baseado na documentacao atual do Docker Compose, a composicao local deve ter:

- container `postgres:15` ou `postgres:16`
- volume persistente
- porta exposta localmente
- variaveis de ambiente para db/user/password
- `healthcheck` com `pg_isready`
- `restart: unless-stopped`

Exemplo recomendado:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: devroast-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - devroast_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  devroast_postgres_data:
```

## Configuracao do Drizzle

### `drizzle.config.ts`

Segundo a documentacao atual do Drizzle, a base deve seguir este formato:

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### `src/db/client.ts`

Exemplo de conexao recomendado para o projeto:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle({ client, schema, casing: "snake_case" });
```

## Indices e constraints recomendados

### `roast_submissions`

- index em `created_at`
- index composto em `visibility, status, score, created_at`
- index em `source_hash`

### `roast_issues`

- index em `submission_id, display_order`

### `roast_diff_lines`

- index em `submission_id, display_order`

### `roast_shares`

- unique em `submission_id`
- unique em `slug`

## Seed inicial recomendado

Faz sentido subir um seed pequeno para acelerar desenvolvimento das telas:

- 3 roasts publicos para home/leaderboard
- 1 roast completo com:
  - score
  - verdict
  - headline
  - 4 issues
  - diff lines
  - share slug

Isso substitui mocks hardcoded aos poucos sem travar a UI atual.

## To-dos de implementacao

### Infra

- [ ] adicionar dependencias `drizzle-orm`, `drizzle-kit`, `postgres`, `dotenv`
- [ ] criar `docker-compose.yml` com Postgres e volume persistente
- [ ] criar `.env.example` com `DATABASE_URL` e variaveis do Postgres
- [ ] atualizar `.gitignore` se surgirem artefatos locais extras

### Banco e schema

- [ ] criar pasta `src/db`
- [ ] criar arquivos de enums
- [ ] criar tabelas `roast_submissions`, `roast_issues`, `roast_diff_lines`, `roast_shares`
- [ ] declarar relations do Drizzle
- [ ] adicionar indices e uniques do MVP

### Migrations

- [ ] criar `drizzle.config.ts`
- [ ] gerar migration inicial com Drizzle Kit
- [ ] aplicar migration no banco local
- [ ] validar se o schema criado bate com a especificacao

### Integracao com app

- [ ] substituir os mocks de leaderboard de `src/app/page.tsx` por query real
- [ ] preparar query para tela de resultado usando `submission_id` ou `slug`
- [ ] criar helper para estatisticas globais (`codes roasted`, `avg score`)
- [ ] definir criterio para publicar no leaderboard (`visibility = public`)

### Seeds e DX

- [ ] criar seed inicial para desenvolvimento local
- [ ] documentar comandos de banco no README
- [ ] decidir se o app vai rodar migrations manualmente ou por script dedicado

## Fora do escopo imediato

- autenticacao
- moderacao administrativa
- filas de processamento
- versionamento de prompts/LLM
- analytics detalhado por evento
- multi-tenant

## Conclusao

Para o estado atual do `devroast`, o menor modelo consistente e util e:

- `roast_submissions`
- `roast_issues`
- `roast_diff_lines`
- `roast_shares`

Com isso conseguimos atender o layout atual, manter o leaderboard derivado por query e preparar compartilhamento/OG sem sobreengenharia.
