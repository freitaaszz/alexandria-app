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

- [ ] Botão de "adicionar livro" que abre a busca
- [ ] Escolher o livro e colocá-lo no primeiro slot livre
- [ ] Animação do livro entrando na estante
- [ ] Aviso quando todas as estantes estiverem cheias
- **Pronto quando:** pesquisar, adicionar e ver o livro entrar animado na estante.

### Etapa 6 — Modal do livro

**Objetivo:** ver e editar as informações do livro.

- [ ] Abrir o modal ao clicar ou tocar no livro
- [ ] Mostrar capa, título, autor e sinopse
- [ ] Número de páginas editável
- [ ] Data de leitura
- [ ] Nota com 5 estrelas
- [ ] Campo de resenha
- [ ] Remover o livro, com confirmação
- [ ] Animação de abrir e fechar; no celular, vira uma "folha" que sobe de baixo
- **Pronto quando:** dá para editar tudo, fechar, recarregar e as informações continuarem salvas.

### Etapa 7 — Pegar e arrastar o livro (a estrela do projeto)

**Objetivo:** o livro sai da estante e segue o dedo ou o mouse.

- [ ] Configurar o dnd-kit (mouse, toque e teclado)
- [ ] Livro "na mão": sai da estante, levanta, a sombra cresce e ele segue o ponteiro
- [ ] Física: inclina de acordo com a velocidade e a direção do arraste (mola)
- [ ] Slots aparecem durante o arraste e os vizinhos se afastam
- [ ] Mover dentro da prateleira, entre prateleiras e entre estantes
- [ ] Encaixe com mola ao soltar; volta para o lugar se soltar fora de um slot
- [ ] Bloqueio e feedback quando a prateleira está cheia
- [ ] Celular: toque longo para pegar, vibração no Android, rolagem automática nas bordas
- [ ] Diferenciar "clique" (abre o modal) de "segurar" (arrasta)
- **Pronto quando:** arrastar no celular for tão gostoso quanto no desktop.

### Etapa 8 — Primeiro cenário completo

**Objetivo:** aplicar o design real com um tema.

- [ ] Sistema de temas (cada tema define fundo, estantes, cenário e cores)
- [ ] Design das estantes do tema
- [ ] Fundo e cenário do tema
- [ ] Ambientação animada (ex.: vagalumes, árvores balançando)
- [ ] Animações pausam quando a aba fica oculta
- **Pronto quando:** o cenário está lindo e leve no celular.
- **Depende de:** design escolhido por você.

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
