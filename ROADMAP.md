# Biblioteca — Roadmap por Etapas

> Cada **etapa** vira uma **lista no Trello** e cada item vira um **card**.
> Cada etapa termina com um **commit/PR** no GitHub e algo funcionando de verdade.
> Requisitos completos: [REQUISITOS.md](REQUISITOS.md)

## Como vamos trabalhar no GitHub

- Uma **branch por etapa**, com o nome da etapa: `fundacao`, `estrutura-estantes`, `dados-salvamento`, `busca-google-books`, `lombada`, `adicionar-livro`, `modal-livro`, `arrastar-livro`, `primeiro-cenario`, `polimento`. No final de cada etapa, um **Pull Request** para a `main`.
- Commits pequenos, no padrão **Conventional Commits**:
  - `feat:` funcionalidade nova, por exemplo `feat: busca de livros na Google Books`
  - `fix:` correção
  - `style:` visual/CSS
  - `refactor:` reorganização sem mudar comportamento
  - `docs:` documentação
  - `chore:` configuração e dependências
- A `main` sempre funciona. Deploy (Vercel ou outra plataforma) fica para depois; por enquanto, localhost.

---

## FASE 1 — v1: a estante funcionando (só livros lidos)

### Etapa 0 — Fundação do projeto

**Objetivo:** projeto criado, rodando e publicado online (ainda vazio).

- [x] Criar o repositório no GitHub (você)
- [x] Criar o projeto com Vite + React + TypeScript
- [x] Configurar Tailwind CSS (mobile-first)
- [x] Configurar oxlint e Prettier (código padronizado)
- [x] Definir a estrutura de pastas
- [x] README inicial com a descrição do projeto
- [ ] ~~Deploy automático (Vercel)~~ adiado. **Ao publicar:** criar a regra de proxy `/capas/*` → `https://books.google.com/*` na plataforma (ver `vite.config.ts`), senão as lombadas ficam sem a cor da capa. Também adicionar o domínio nas restrições da chave da Google.
  - Por enquanto só localhost (`npm run dev -- --host` para testar no celular).
- **Pronto quando:** `npm run dev` mostra a página da Alexandria (no PC e no celular pela rede local).

### Etapa 1 — Estrutura das estantes (sem design final)

**Objetivo:** as 3 estantes com prateleiras e slots, em versão "rascunho".

- [x] Layout das 3 estantes no desktop
- [x] Prateleiras com 17 slots cada
- [x] Layout no celular: uma estante por vez, deslizando
- [x] Botão "ver biblioteca inteira" no celular (tocar numa estante leva até ela)
- [x] Slots vazios visíveis (modo debug)
- **Pronto quando:** dá para ver a grade de slots no desktop e no celular.
- **Depende de decidir:** quantas prateleiras por estante e como fica no celular.

### Etapa 2 — Dados e salvamento

**Objetivo:** o "cérebro" da estante, onde cada livro guarda seus dados e sua posição.

- [x] Definir o modelo do livro (título, autor, capa, páginas, data, nota, resenha, posição)
- [x] Gerenciador de estado da estante (Zustand)
- [x] Salvamento no aparelho (localStorage), sobrevivendo a fechar a aba
- [x] Regras: limite de 17 por prateleira, mover, remover (com testes automatizados)
- **Pronto quando:** livros de teste aparecem nos slots e continuam lá depois de recarregar a página.

### Etapa 3 — Busca na Google Books API

**Objetivo:** pesquisar qualquer livro.

- [x] Criar a chave da API no Google Cloud (você, com o meu passo a passo)
- [x] Proteger a chave (variável de ambiente)
- [x] Campo de busca com espera enquanto digita (debounce)
- [x] Lista de resultados: capa, título e autor
- [x] Estados: carregando, sem resultados, erro, livro sem capa ou sem páginas
- [x] Bônus: botão "Adicionar" simples em cada resultado (a animação e os avisos ficam para a etapa adicionar-livro)
- **Pronto quando:** digitar "Corte de Espinhos e Rosas" e ver o livro certo na lista.

### Etapa 4 — Lombada gerada a partir da capa

**Objetivo:** o livro aparecer bonito na estante.

- [x] Extrair as cores dominantes da capa
- [x] Lombada com título e autor na vertical
- [x] Espessura de acordo com o número de páginas
- [x] Profundidade em CSS 3D, mostrando um pouco da capa e a borda das páginas
- [x] Sombra, brilho e textura sutil
- [x] Versão para livro sem capa (lombada padrão bonita)
- **Pronto quando:** livros diferentes geram lombadas diferentes e convincentes.

### Etapa 5 — Adicionar livro na estante

**Objetivo:** fluxo completo de busca até a estante.

- [x] Botão de "adicionar livro" que abre a busca
- [x] Escolher o livro e colocá-lo no primeiro slot livre
- [x] Animação do livro entrando na estante
- [x] Aviso quando todas as estantes estiverem cheias
- **Pronto quando:** pesquisar, adicionar e ver o livro entrar animado na estante.

### Etapa 6 — Modal do livro

**Objetivo:** ver e editar as informações do livro.

- [x] Abrir o modal ao clicar ou tocar no livro
- [x] Mostrar capa, título, autor e sinopse
- [x] Número de páginas editável
- [x] Data de leitura
- [x] Nota com 5 estrelas
- [x] Campo de resenha
- [x] Remover o livro, com confirmação
- [x] Animação de abrir e fechar; no celular, vira uma "folha" que sobe de baixo
- **Pronto quando:** dá para editar tudo, fechar, recarregar e as informações continuarem salvas.

### Etapa 7 — Pegar e arrastar o livro (a estrela do projeto)

**Objetivo:** o livro sai da estante e segue o dedo ou o mouse.

- [x] Motor de arrastar próprio (mouse, toque e teclado), sem biblioteca: controle total da física
- [x] Livro "na mão": sai da estante, levanta, a sombra cresce e ele segue o ponteiro
- [x] Física: inclina de acordo com a velocidade e a direção do arraste (mola)
- [x] Slots aparecem durante o arraste e os vizinhos se afastam
- [x] Mover dentro da prateleira, entre prateleiras e entre estantes
- [x] Encaixe com mola ao soltar; volta para o lugar se soltar fora de um slot
- [x] Bloqueio e feedback quando a prateleira está cheia
- [x] Celular: toque longo para pegar, vibração no Android, rolagem automática nas bordas
- [x] Diferenciar "clique" (abre o modal) de "segurar" (arrasta)
- **Pronto quando:** arrastar no celular for tão gostoso quanto no desktop.

### Etapa 8 — Primeiro cenário: Alexandria em 3D de verdade (desktop)

**Decisão (2026-11-22):** o cenário passa a ser uma **sala 3D rodando no navegador** (Three.js / React Three Fiber), como a referência da arena: câmera cinematográfica voando até as estantes, livros 3D e luz "assada" no Blender. Dados, busca, modal e regras continuam; a parte visual das estantes, dos livros e do arrastar é refeita em 3D.

**Foco: 100% desktop.** O celular vira uma etapa própria depois.

Já feito (base que continua valendo):

- [x] Estante modelada no Blender (arco Tudor, colunas, nogueira escura, latão) em `design/blender/escola-de-magia.blend`
- [x] Fundo de castelo, vela e lombadas de couro (versão em imagem, branch `primeiro-cenario`)

Sub-etapas 3D (uma branch por sub-etapa):

- [x] **8.1 `prova-3d`**: estante com luz assada + 204 livros 3D no navegador, medindo o desempenho no desktop. **Resultado: 240 FPS** (limite da tela) com 3 estantes e 204 livros na RTX 5060, 1440×900. Abre em `/?3d`.
- [ ] **8.2 `sala-3d`**: a sala completa no Blender (estantes em arco na parede do fundo, paredes laterais com quadros, lanternas, trepadeiras, tapete, baú), luz assada e exportação otimizada (glTF comprimido)
- [ ] **8.3 `livros-3d`**: livros como objetos 3D com a lombada gerada da capa (cor, título, espessura)
- [ ] **8.4 `camera-3d`**: câmera **fixa** (a pessoa não anda nem gira pela sala); só se mexe de leve acompanhando o mouse (parallax). Movimentos maiores são só os do próprio site: aproximar uma estante e trocar entre estantes
- [ ] **8.5 `interacao-3d`**: clicar no livro abre o modal; arrastar o livro em 3D (puxa da estante e segue o mouse); voo da busca até a prateleira
- [ ] **8.6 `atmosfera-3d`**: velas flutuando com luz de verdade, poeira na luz, névoa e pós-processamento (brilho, vinheta, profundidade de campo)
- **Pronto quando:** a sala está no nível da referência e roda liso no desktop.

### Etapa 8.7 — Celular (depois do desktop pronto)

- [ ] Adaptar a sala 3D para o celular: câmera, toque, desempenho e teste em aparelho real

### Etapa 9 — Polimento, celular e acessibilidade

- [ ] Teste em celulares reais (iPhone e Android)
- [ ] Ajustes de toque: áreas de toque, sem zoom indesejado, área segura do notch
- [ ] Respeitar "reduzir movimento" do aparelho
- [ ] Performance: 60fps nas animações
- [ ] Tela de boas-vindas da estante vazia
- **Pronto quando:** dá para usar no celular sem nenhum atrito.

### Etapa 10 — Lançamento da v1 🎉

- [ ] Revisão geral
- [ ] README final com prints e GIF
- [ ] Tag `v1.0.0` no GitHub

---

## FASE 2 — Depois da v1 (ordem a definir)

- [ ] Estante de desejos (livros não lidos)
- [ ] Completar dados faltando com a Open Library (capa e número de páginas de livros que a Google não traz)
- [ ] Mais cenários (Escola de Magia, Acampamento Mitológico, Corte das Fadas…)
- [ ] Som ambiente
- [ ] Estatísticas de leitura
- [ ] Busca e filtro dentro da estante
- [ ] Compartilhar a estante (imagem ou link)
- [ ] Login e salvamento na nuvem (Supabase)
- [ ] App para iPhone e Android

---

## Decisões pendentes (antes da etapa indicada)

| Decisão                               | Necessária antes de | Sugestão                                     |
| ------------------------------------- | ------------------- | -------------------------------------------- |
| ~~Quantas prateleiras por estante~~   | Etapa 1             | ✅ 4 (68 por estante, 204 no total)          |
| ~~Navegação das estantes no celular~~ | Etapa 1             | ✅ Uma por vez deslizando + botão "ver tudo" |
| Onde salvar                           | Etapa 2             | No aparelho na v1, nuvem na fase 2           |
| Espessura × slots fixos               | Etapa 4             | Espessura só visual dentro do slot           |
| Livro repetido permitido?             | Etapa 5             | Não, com aviso de "já está na estante"       |
| Primeiro cenário e design             | Etapa 8             | Sua escolha                                  |
