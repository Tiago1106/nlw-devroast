# Home editor com syntax highlight

## Contexto

Queremos evoluir o editor da homepage para que ele aceite codigo colado pelo usuario, descubra automaticamente a linguagem mais provavel e aplique syntax highlight em tempo real. Tambem deve existir uma forma de o usuario corrigir a deteccao manualmente pelo proprio editor.

Hoje o projeto ja tem:

- um editor simples baseado em `textarea` em `src/components/ui/code-editor.tsx`
- um renderer destacado com Shiki em `src/components/ui/code-block.tsx`
- stack base com Next.js App Router, React 19, Tailwind v4 e UI customizada com identidade terminal

## Objetivo da feature

- aceitar colagem e edicao de codigo na home
- aplicar syntax highlight sem exigir que o usuario escolha a linguagem antes
- detectar a linguagem automaticamente com boa confiabilidade
- permitir override manual de linguagem
- preservar a estetica atual do produto sem introduzir uma UI pesada ou visualmente generica

## Opcoes pesquisadas

### 1. Abordagem estilo Ray.so

Resumo:

- o Ray.so usa uma abordagem customizada, nao Monaco nem CodeMirror
- a entrada e um `textarea` transparente sobre uma camada renderizada com highlight
- o highlight final e feito com Shiki
- a deteccao automatica de linguagem usa `highlight.js` via `highlightAuto`
- a linguagem tambem pode ser escolhida manualmente

Clues encontrados no codigo do Ray.so:

- editor custom em `Editor.tsx`
- highlight renderizado separadamente em `HighlightedCode.tsx`
- deteccao em store baseada em `hljs.highlightAuto(...)`
- linguagens do Shiki carregadas sob demanda

Vantagens:

- visual altamente controlavel
- look and feel muito proximo do Ray.so
- combina bem com experiencia branded e foco em sharing/export

Desvantagens:

- complexidade alta para manter UX de edicao boa
- precisa implementar scroll sincronizado, tab, indentacao, enter, selecao, caret e edge cases manualmente
- mais facil introduzir bugs sutis de edicao e acessibilidade
- custo de manutencao maior para um editor que vive na homepage

Conclusao:

- boa referencia visual e arquitetural para a camada de apresentacao
- nao e a melhor base para a primeira implementacao do editor do devroast

### 2. CodeMirror 6

Resumo:

- editor moderno, modular e leve para uso web
- syntax highlighting e suporte de linguagem entram via extensoes e pacotes por linguagem
- excelente equilibrio entre experiencia de edicao, performance e controle visual
- nao possui autodeteccao de linguagem pronta no core; isso deve ser combinado com uma heuristica externa

Vantagens:

- muito mais robusto que um editor custom com `textarea`
- mais leve e mais facil de adaptar visualmente que Monaco
- arquitetura modular permite carregar apenas o necessario
- encaixa bem em um editor de homepage com edicao curta a media
- facilita evolucao futura para recursos como selecao de tema, atalhos, placeholder rico e decoracoes

Desvantagens:

- requer composicao de extensoes e pacotes por linguagem
- autodeteccao precisa ser definida por nos
- tema precisa ser customizado para casar com a identidade do produto

Conclusao:

- melhor opcao para o devroast nesta fase

### 3. Monaco Editor

Resumo:

- editor do ecossistema VS Code
- extremamente poderoso, com varios recursos prontos
- integracao no browser exige workers e traz mais peso de bundle

Vantagens:

- experiencia de editor muito madura
- muitos recursos avancados nativos

Desvantagens:

- pesado para homepage
- visual tende a puxar para IDE completa, o que conflita com a experiencia enxuta do produto
- maior custo de integracao e ajuste de bundle
- autodeteccao de linguagem nao resolve sozinha o problema de inferencia de linguagem do trecho colado

Conclusao:

- overkill para o caso atual

## Recomendacao

Recomendo implementar o editor com CodeMirror 6 e usar a arquitetura do Ray.so apenas como referencia de UX e apresentacao, nao como referencia de engine de edicao.

Direcao recomendada:

- `CodeMirror 6` como base do editor interativo
- heuristica de deteccao automatica separada da engine de highlight
- seletor manual de linguagem visivel no header do editor
- Shiki permanece no projeto para renderizacoes nao editaveis e possivel reuso em outputs futuros

## Estrategia recomendada

### Base de edicao

- criar um editor client component dedicado para a homepage
- usar CodeMirror 6 com setup minimo e extensoes apenas para linguagens suportadas inicialmente
- desabilitar tudo que pareca IDE demais para manter o produto leve e focado

### Deteccao de linguagem

Recomendacao inicial:

- usar deteccao automatica via `highlight.js` com `highlightAuto`
- restringir a deteccao para um subconjunto pequeno de linguagens suportadas pelo produto
- salvar a deteccao como `auto-detected language`
- se o usuario escolher manualmente outra linguagem, priorizar sempre o valor manual

Motivo:

- foi a estrategia escolhida pelo Ray.so
- `highlightAuto` funciona melhor quando o universo de linguagens e pequeno e controlado
- evita precisar construir um detector proprio logo no inicio

Observacao importante:

- a deteccao deve ser tratada como heuristica, nao verdade absoluta
- para snippets muito curtos ou ambiguos, a UI deve mostrar algo como `auto: javascript` e permitir troca facil

### Linguagens da v1

Escopo inicial:

- JavaScript
- TypeScript
- TSX
- JSX
- JSON
- HTML
- CSS
- Python
- Bash
- SQL
- Go
- Rust
- Java
- PHP

Justificativa:

- cobre melhor os cenarios reais de uso do produto
- reduz a necessidade de fallback incorreto para stacks backend comuns

### Selecao manual

- adicionar um seletor no header do editor
- opcoes com label amigavel e valor canonico interno
- primeira opcao: `Auto`
- quando `Auto` estiver ativo, a UI exibe a linguagem detectada atual
- quando manual estiver ativo, a deteccao automatica continua podendo existir internamente, mas sem sobrescrever a escolha do usuario

### Tema e UX visual

- manter a identidade atual do `devroast`: terminal, contraste alto, dark UI, tom monospace
- evitar o visual padrao do editor sem customizacao
- remover elementos de IDE que nao agregam na home, como minimap, gutters excessivos e chrome desnecessario
- manter line numbers como opcional de produto, mas com default ligado se o visual continuar limpo

### Performance

- carregar o editor somente no client
- lazy load dos pacotes de linguagem mais pesados quando possivel
- como a v1 precisa atender tambem arquivos maiores, priorizar render eficiente, atualizacoes incrementais e evitar recomputacao pesada a cada tecla
- evitar Monaco para nao aumentar bundle e custo de inicializacao da home

## Arquitetura sugerida

### Componentes

- `src/components/home/home-code-editor.tsx` para composicao da feature
- `src/components/home/language-select.tsx` para override manual
- `src/components/home/use-language-detection.ts` para estrategia de deteccao
- manter `src/components/ui/code-block.tsx` como renderer nao editavel

### Estado

Estado minimo esperado:

- `code`
- `languageMode`: `auto | manual`
- `manualLanguage`
- `detectedLanguage`
- `resolvedLanguage` para o highlight final

Regra de resolucao:

- se `languageMode === manual`, usar `manualLanguage`
- se `languageMode === auto`, usar `detectedLanguage`
- se a deteccao falhar, cair para uma linguagem neutra definida pelo produto

### Fallbacks

- fallback oficial: `typescript`
- para snippets vazios, mostrar placeholder sem highlight
- para codigo muito grande, manter highlight mas evitar qualquer processamento pesado a cada tecla sem debounce
- para arquivos maiores, a deteccao automatica deve usar uma estrategia conservadora, priorizando colagem, carregamento inicial e pausas de digitacao

## Trade-offs principais

### CodeMirror + detector separado

Pros:

- melhor equilibrio entre robustez e leveza
- caminho mais seguro para producao
- evolucao incremental simples

Contras:

- duas camadas conceituais: edicao e deteccao
- exige mapeamento claro entre nomes das linguagens do detector e da engine do editor

### Ray.so style custom editor

Pros:

- controle visual maximo
- identidade forte

Contras:

- alto custo de manutencao
- mais risco de bugs de UX basica

### Monaco

Pros:

- editor super completo

Contras:

- pesado demais para a homepage desta proposta

## Decisoes recomendadas para implementacao

- adotar CodeMirror 6 como editor interativo principal
- usar `highlight.js` somente para deteccao automatica de linguagem
- suportar na v1 linguagens frontend e backend relevantes
- expor seletor manual no header do editor com opcao `Auto`
- usar `typescript` como fallback oficial quando a deteccao falhar
- preservar Shiki para renderizacao de blocos estaticos e possiveis outputs do roast
- estilizar o editor para parecer um produto do devroast, nao uma IDE embedada

## Riscos

- autodeteccao errar em snippets curtos, SQL ambigua, JS vs TS, JSX vs TSX
- bundle crescer demais com a ampliacao das linguagens da v1
- desalinhamento entre nomes/aliases do detector e nomes internos do editor
- comportamento de colagem grande ou arquivos extensos gerar re-render excessivo se nao houver controle fino

## Plano de implementacao sugerido

### Fase 1

- trocar o editor atual da home por uma base com CodeMirror 6
- suportar colagem, digitacao, line numbers e tema custom
- suportar o conjunto inicial de linguagens incluindo frontend e backend
- adicionar seletor manual com opcao `Auto`
- manter o seletor manual sempre visivel no header
- adicionar deteccao automatica inicial ao colar e ao editar com debounce
- validar comportamento com arquivos maiores e colagens extensas

### Fase 2

- melhorar heuristica para snippets ambiguos
- persistir escolha manual durante a sessao
- instrumentar eventos de erro de deteccao ou troca manual para aprender com uso

### Fase 3

- integrar melhor com resultados do roast
- considerar formatacao opcional por linguagem
- considerar acoes extras como copiar, limpar, colar exemplo e importar arquivo

## To-dos

- [x] definir lista final de linguagens suportadas na v1
- [x] definir fallback oficial quando a deteccao falhar
- [ ] mapear aliases entre detector e editor
- [ ] definir se a deteccao roda a cada mudanca ou prioritariamente em eventos de colagem
- [ ] definir se line numbers ficam sempre visiveis ou configuraveis
- [x] definir se o seletor manual fica sempre visivel ou aparece apenas apos deteccao
- [ ] definir metrica de sucesso da feature: tempo para colar, trocar linguagem e iniciar roast
- [ ] validar o tema visual do editor com a identidade atual do produto
- [ ] validar performance com arquivos maiores

## Perguntas em aberto

Sem perguntas em aberto no momento.

## Decisao final deste estudo

Para o devroast, a melhor escolha e:

- usar CodeMirror 6 como editor
- usar deteccao automatica externa e controlada, preferencialmente com `highlight.js` restrito ao conjunto suportado
- manter override manual simples e visivel
- usar Ray.so como referencia de acabamento visual, nao como base da engine de edicao
