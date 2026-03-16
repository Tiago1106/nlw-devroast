# Plano tecnico - home editor com syntax highlight

## Objetivo

Transformar a especificacao aprovada em um plano de implementacao por arquivos, preservando a identidade visual do devroast e preparando a homepage para um editor com syntax highlight, autodeteccao de linguagem, override manual e suporte a arquivos maiores.

## Decisoes ja aprovadas

- editor principal: `CodeMirror 6`
- autodeteccao de linguagem: `highlight.js`
- fallback oficial: `typescript`
- seletor manual: sempre visivel
- v1 com linguagens frontend e backend relevantes
- Shiki permanece para renderizacoes nao editaveis

## Estrutura proposta

### 1. Feature da home

Criar uma pasta dedicada para a feature do editor na home:

- `src/components/home/home-code-editor.tsx`
- `src/components/home/home-editor-toolbar.tsx`
- `src/components/home/home-language-select.tsx`
- `src/components/home/home-editor-status.tsx`
- `src/components/home/use-language-detection.ts`
- `src/components/home/use-resolved-language.ts`
- `src/components/home/language-options.ts`
- `src/components/home/language-aliases.ts`
- `src/components/home/home-editor-theme.ts`

Motivo:

- concentrar a responsabilidade da feature fora de `app`
- separar UI, estado derivado e mapeamento de linguagem
- permitir evolucao futura sem inflar `page.tsx`

### 2. Camada compartilhada de editor

Se a implementacao crescer e passar a ser reutilizavel, extrair parte da base para `ui`:

- `src/components/ui/code-editor-shell.tsx`
- `src/components/ui/code-editor-language-badge.tsx`

Observacao:

- essa extracao nao precisa acontecer na primeira etapa se atrapalhar a velocidade
- a v1 pode nascer inteiramente em `src/components/home`

## Responsabilidade de cada arquivo

### `src/components/home/home-code-editor.tsx`

Responsabilidades:

- componente client principal da feature
- montar o editor com CodeMirror
- orquestrar `code`, `languageMode`, `manualLanguage`, `detectedLanguage` e `resolvedLanguage`
- integrar toolbar, seletor manual e area de edicao
- expor callbacks necessarios para a homepage

Nao deve fazer:

- heuristica pesada inline
- map de aliases hardcoded no JSX

### `src/components/home/home-editor-toolbar.tsx`

Responsabilidades:

- renderizar header do editor
- conter seletor de linguagem sempre visivel
- mostrar estado atual: `Auto`, linguagem detectada, linguagem manual, fallback
- reservar espaco para futuras acoes como limpar, colar exemplo e importar arquivo

### `src/components/home/home-language-select.tsx`

Responsabilidades:

- encapsular o select de linguagem
- oferecer opcao `Auto`
- listar todas as linguagens suportadas na v1
- devolver valor canonico para a feature

### `src/components/home/home-editor-status.tsx`

Responsabilidades:

- mostrar feedback curto de linguagem resolvida
- exemplos: `auto: python`, `manual: rust`, `fallback: typescript`
- evitar que a logica de apresentacao polua o toolbar

### `src/components/home/use-language-detection.ts`

Responsabilidades:

- encapsular a heuristica com `highlight.js`
- restringir deteccao ao conjunto suportado
- aplicar debounce
- decidir quando rodar deteccao: colagem, input estabilizado e carga inicial com conteudo

Regras importantes:

- nao sobrescrever escolha manual
- para codigo vazio, nao detectar
- para codigo ambiguo, retornar sinalizacao consistente para cair no fallback

### `src/components/home/use-resolved-language.ts`

Responsabilidades:

- centralizar a regra final de resolucao de linguagem
- combinar `languageMode`, `manualLanguage`, `detectedLanguage` e fallback
- expor um valor final pronto para o editor

### `src/components/home/language-options.ts`

Responsabilidades:

- lista canonica de linguagens suportadas
- labels amigaveis e ids internos
- ordem de exibicao no select

Sugestao de conteudo:

- `auto`
- `javascript`
- `typescript`
- `jsx`
- `tsx`
- `json`
- `html`
- `css`
- `python`
- `bash`
- `sql`
- `go`
- `rust`
- `java`
- `php`

### `src/components/home/language-aliases.ts`

Responsabilidades:

- mapear aliases do detector para os nomes aceitos pelo editor
- exemplos esperados:
  - `js -> javascript`
  - `ts -> typescript`
  - `shell -> bash`
  - `py -> python`

### `src/components/home/home-editor-theme.ts`

Responsabilidades:

- definir tema do CodeMirror alinhado aos tokens atuais do projeto
- usar os tokens de `src/app/globals.css`
- evitar visual default de IDE embedada

## Alteracoes em arquivos existentes

### `src/app/page.tsx`

Alteracao prevista:

- trocar uso atual de `HomeActions` ou da implementacao atual de editor pela nova feature `HomeCodeEditor`
- manter a page enxuta, apenas compondo a feature

### `src/components/home/home-actions.tsx`

Opcoes:

- evoluir este arquivo para compor a nova experiencia
- ou dividir suas responsabilidades e deixar `home-actions` como wrapper de CTA + editor

Recomendacao:

- manter `home-actions.tsx` como composicao de alto nivel e mover a responsabilidade do editor para `home-code-editor.tsx`

### `src/components/ui/code-editor.tsx`

Opcoes:

- manter como componente legado/simples
- ou substituir internamente pela nova base

Recomendacao:

- nao reaproveitar diretamente como engine da nova feature
- ele pode continuar existindo como textarea estilizado simples, caso ainda seja util no playground ou em cenarios menores

### `src/components/ui/code-block.tsx`

Papel futuro:

- continuar como renderer estatico com Shiki
- possivel uso em resultados do roast, previews ou comparacoes antes/depois

## Bibliotecas e integracao

### `CodeMirror 6`

Pacotes esperados:

- pacote base do editor
- setup minimo
- pacote de tema/estado/view conforme necessidade
- pacotes de linguagem usados na v1

Uso esperado:

- apenas client-side
- tema custom
- recursos minimos necessarios para boa experiencia de digitacao e arquivos maiores

### `highlight.js`

Uso esperado:

- apenas para `highlightAuto`
- sempre restrito ao conjunto de linguagens suportadas
- nunca como renderer final do editor

### `Shiki`

Uso esperado:

- permanecer onde o projeto ja usa renderizacao destacada nao editavel
- nao ser a engine principal do editor interativo da home

## Fluxo de estados

### Entrada

- usuario cola ou digita codigo

### Deteccao

- se o modo for `Auto`, rodar autodeteccao com debounce
- mapear o resultado para o id canonico interno
- se nao houver match confiavel, usar fallback `typescript`

### Override manual

- se o usuario trocar para uma linguagem manual, interromper a prioridade da autodeteccao
- a deteccao automatica pode continuar para diagnostico interno, mas sem atualizar a linguagem resolvida

### Resolucao final

- `manual` -> usar linguagem manual
- `auto + detectada` -> usar detectada
- `auto + sem detectada` -> usar `typescript`

## Requisitos especificos para arquivos maiores

- evitar rerender completo da arvore React a cada tecla
- delegar a maior parte da interacao ao proprio editor
- aplicar debounce na deteccao
- evitar reprocessamento agressivo de linguagem durante digitacao continua
- validar desempenho com colagens extensas e multiplas centenas de linhas

## Ordem de implementacao sugerida

### Etapa 1 - Fundacao

- criar `language-options.ts`
- criar `language-aliases.ts`
- criar `use-resolved-language.ts`
- criar a estrutura inicial de `home-code-editor.tsx`

### Etapa 2 - Editor funcional

- integrar CodeMirror 6
- aplicar tema visual do devroast
- exibir toolbar com select sempre visivel
- suportar linguagens da v1

### Etapa 3 - Deteccao automatica

- integrar `highlight.js`
- implementar `use-language-detection.ts`
- aplicar debounce e regras de fallback
- mostrar status atual no toolbar

### Etapa 4 - Integracao com homepage

- conectar `home-code-editor.tsx` dentro de `home-actions.tsx`
- manter o layout da home consistente
- validar estados vazios, colagem e troca manual

### Etapa 5 - Validacao

- testar snippets curtos e ambiguos
- testar linguagens frontend e backend
- testar arquivos maiores
- revisar polish visual, contraste e consistencia com a marca

## Checklist tecnico

- [ ] definir conjunto exato de pacotes CodeMirror
- [ ] instalar pacotes de linguagem necessarios
- [ ] definir mapping final entre detector e editor
- [ ] definir heuristicas minimas para aceitar ou rejeitar uma deteccao
- [ ] implementar fallback `typescript`
- [ ] montar toolbar com select sempre visivel
- [ ] validar performance com arquivos maiores
- [ ] revisar acessibilidade basica do seletor e foco do editor
- [ ] validar se o layout mobile continua utilizavel

## Resultado esperado

Ao final da implementacao, a home deve ter um editor com cara de produto, nao de IDE genérica, permitindo que o usuario cole codigo, veja highlight automaticamente, corrija a linguagem manualmente quando quiser e use a experiencia com conforto mesmo em arquivos maiores.
