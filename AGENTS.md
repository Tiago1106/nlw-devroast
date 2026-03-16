# Devroast

- Objetivo: app web que recebe trechos de codigo, aplica a identidade de "roast" e exibe resultados, ranking e playground interno de UI.
- Stack: Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Biome.
- Estrutura: rotas em `src/app`, componentes compartilhados em `src/components`, componentes por feature fora de `app` quando houver reuso ou responsabilidade de interface.
- UI: manter linguagem terminal/monospace, tons escuros, alto contraste e copy curta com humor; preservar tokens do `src/app/globals.css`.
- Componentes: usar named exports, `tailwind-variants` para variantes e seguir `src/components/ui/AGENTS.md` para padroes de UI.
- Renderizacao: preferir Server Components; adicionar `"use client"` apenas quando houver estado, efeitos ou eventos no navegador.
- Higiene: evitar logica de negocio dentro de `page.tsx`; extrair para componentes/feature folders e manter nomes de arquivos em kebab-case.
- Git: apos criar commit solicitado pelo usuario, lembrar de executar `git push` no fluxo seguinte.
