# devroast

devroast e uma experiencia web onde voce cola um trecho de codigo e recebe uma analise em tom de roast: direta, divertida e com cara de terminal hacker.

O projeto esta sendo construido durante o evento NLW da Rocketseat, acompanhando as aulas e evoluindo a interface ao longo do evento.

## O que o app faz

- recebe trechos de codigo para analise
- ativa um modo de roast com identidade mais sarcastica
- destaca a experiencia visual de editor, terminal e feedback de score
- mostra um leaderboard com os codigos mais "sofriveis"
- possui um playground interno para evolucao e validacao dos componentes visuais

## Experiencia

O foco do devroast nao e ser apenas uma tela de formulario. A proposta e transformar a analise de codigo em uma experiencia com personalidade, misturando humor, interface inspirada em terminal e componentes reutilizaveis para suportar a evolucao do produto.

## Status do projeto

Neste momento o app esta em construcao, com foco em:

- consolidacao da identidade visual
- organizacao dos componentes compartilhados
- criacao das primeiras interacoes da home
- preparacao da base para as proximas features do produto

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Banco local

Para rodar com banco local usando Docker Desktop:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Se quiser inspecionar os dados:

```bash
npm run db:studio
```

## Analise com IA

O app funciona sem provedor externo usando o fallback heuristico local. Para ativar a analise com IA real:

1. copie `.env.example` para `.env`
2. preencha `OPENAI_API_KEY`
3. opcionalmente ajuste `OPENAI_MODEL`

Exemplo:

```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4.1-mini
```

Sem `OPENAI_API_KEY`, o fluxo continua funcional usando a analise local.
