# Biblioteca — Levantamento de Requisitos

> Status: **levantamento de requisitos** (ainda sem código).
> Última atualização: 2026-11-22

## 1. Visão geral

Site de **uma única página**: uma biblioteca pessoal com **3 estantes** vazias, onde a pessoa vai **adicionando os livros** que leu (e os que deseja ler). Cada livro aparece na estante pela **lombada**, com profundidade leve (um "3D, mas não tanto"). A pessoa pode **pegar o livro e arrastá-lo** para qualquer lugar, abrir as informações dele e personalizar o cenário inteiro com **temas animados**.

- **Agora:** site responsivo. O desenvolvimento começa pelo desktop, mas **o celular é a prioridade**, porque a maioria do público vai acessar por ele.
- **Futuro (talvez):** app para iPhone e Android.

## 2. Stack definida

| Camada                 | Escolha                          | Motivo                                                                                  |
| ---------------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| Base                   | React + Vite                     | Ecossistema grande, rápido, reaproveitável para um app (Capacitor ou React Native/Expo) |
| Linguagem              | TypeScript                       | Segurança e escalabilidade                                                              |
| Estilo                 | Tailwind CSS (CSS mobile-first)  | Responsividade simples                                                                  |
| Animações de interface | Motion (Framer Motion)           | Molas, gestos, modal, livro seguindo o ponteiro                                         |
| Animações de cenário   | GSAP e/ou Canvas                 | Vagalumes, árvores balançando, ambientação                                              |
| Arrastar e soltar      | dnd-kit                          | Mouse, toque e teclado, com overlay customizado                                         |
| API de livros          | **Google Books API**             | Melhor acervo em português, com páginas, capa, autor e sinopse                          |
| Lombada/3D             | CSS 3D (sem Three.js nos livros) | Leve no celular e fácil de arrastar                                                     |

## 3. Requisitos funcionais

### RF01 — Estantes

- **3 estantes** fixas na página.
- Começam **vazias**.
- **17 slots por prateleira.** Cada livro ocupa 1 slot.
- O formato visual das estantes e do cenário depende do tema escolhido (RF07).

### RF02 — Buscar e adicionar livro

- Busca por **nome do livro** (e autor) usando a **Google Books API**.
- Lista de resultados com capa, título e autor.
- Ao escolher um livro, a pessoa define se ele é **lido** ou **desejo** (quero ler).
- O livro é adicionado à estante **com animação**: ele "voa" e entra no slot.

### RF03 — Lombada gerada a partir da capa

- Não existe API gratuita com imagens de lombada, então a lombada é **gerada automaticamente**:
  - **Cor** extraída das cores dominantes da capa.
  - **Título e autor** na vertical, com tipografia de lombada.
  - **Espessura** proporcional ao número de páginas, quando possível dentro do slot (ver questões em aberto).
  - **Altura** com base nas dimensões da API, quando disponíveis. Se não houver, com uma leve variação.
  - Textura sutil de papel, brilho e sombra.
- **Profundidade leve:** o livro aparece levemente girado, mostrando **um pouco da capa** na lateral, além da borda das páginas.
- Futuro opcional: a pessoa envia uma foto da lombada real.

### RF04 — Pegar e mover o livro (requisito crítico)

- A pessoa **segura o livro** (clicar e segurar no desktop, toque longo no celular).
- O livro **sai literalmente da estante** e **acompanha o ponteiro ou o dedo**, sempre visível enquanto é arrastado:
  - levanta, inclina e a sombra cresce, como se estivesse sendo segurado;
  - o movimento é **fluido, com física de mola**, e o livro inclina de acordo com a velocidade e direção do arraste;
  - o slot de origem fica vazio ou marcado enquanto o livro está "na mão".
- Durante o arraste, **os slots disponíveis aparecem** e os livros vizinhos **se afastam** para abrir espaço no ponto de soltura.
- Ao soltar, o livro **encaixa com animação de mola** e os outros se reorganizam.
- É possível mover:
  - dentro da mesma prateleira (ex.: colocar em primeiro, ou entre dois livros);
  - entre prateleiras;
  - entre estantes.
- Respeita o limite de 17 slots. Prateleira cheia não aceita o livro, com um feedback visual claro.
- Soltar fora de um slot devolve o livro à posição original, com animação.
- No celular, o toque longo evita conflito com a rolagem da tela. No Android há vibração leve ao pegar o livro, quando suportada.

### RF05 — Modal de informações do livro

Ao clicar ou tocar no livro (sem arrastar), abre um modal com:

- Capa, título, autor e sinopse (vindos da API).
- **Número de páginas**: vem da API e pode ser editado, porque às vezes falta.
- **Data em que foi lido**, preenchida pela pessoa (só para livros lidos).
- **Nota de 1 a 5 estrelas** (só para livros lidos).
- **Resenha/anotação** curta, escrita pela pessoa.
- Status: **lido** ou **desejo**, com opção de marcar um desejo como lido.
- Botão para **remover o livro** da estante.

### RF06 — Estante de desejos (livros não lidos) — **fase posterior**

> Só será feita **depois que a estante normal estiver pronta**. Até lá, a estante só tem livros lidos.

- Além dos livros lidos, a pessoa pode adicionar **livros que deseja ler**.
- Ao marcar um desejo como lido, ele passa a pedir a data e a nota.
- O formato está em aberto (ver questões em aberto).

### RF07 — Temas de cenário

- Vários temas selecionáveis. **Cada tema muda o fundo, as estantes e o cenário inteiro.**
- Os temas podem ter **ambientação animada**. Exemplo:
  - **Floresta:** vagalumes voando, árvores balançando ao fundo.
- **Temas inspirados na atmosfera de livros**, por exemplo:
  - Escola de magia (vibe Harry Potter): castelo gótico, velas flutuando, pedra e madeira escura.
  - Acampamento mitológico (vibe Percy Jackson): grego, mármore, mar e luz de verão.
  - Corte das fadas (vibe O Príncipe Cruel): floresta sombria, dourado, espinhos e flores.
  - (lista a crescer)
- **Regra de propriedade intelectual:** os temas **evocam a atmosfera** desses livros, mas **não usam** nomes oficiais, logos, personagens, brasões nem arte oficial. Isso evita problemas de direitos autorais e de marca, principalmente se o projeto virar app nas lojas.
- **Foco inicial: um único cenário**, completo e polido, para validar a experiência antes de criar os outros.
- O design dos temas será definido pelo usuário (pendente).
- Modelos 3D simples podem ser usados no cenário e na decoração, mas não nos livros.

## 4. Requisitos não funcionais

- **RNF01 — Mobile primeiro:** CSS escrito pensando primeiro no celular, mesmo com o desenvolvimento visual começando pelo desktop.
- **RNF02 — Performance:** animações a 60fps no celular, animando só transform e opacity. As animações de cenário pausam quando a aba não está visível.
- **RNF03 — Acessibilidade:** respeitar a configuração de "reduzir movimento" do aparelho, oferecer arrastar por teclado e boa área de toque.
- **RNF04 — Escalabilidade:** código organizado para virar app no futuro.
- **RNF05 — API:** a chave do Google Books fica protegida. Respostas faltando dados (sem capa, sem páginas) são tratadas.

## 5. Questões em aberto

1. **Onde salvar os dados?** Só no aparelho (sem login) ou com conta na nuvem (login)?
2. **Espessura com slots fixos:** com 17 slots iguais, um livro grosso ocupa o mesmo espaço que um fino? Opções:
   - (a) todos os slots têm a mesma largura e a espessura varia só visualmente dentro dela;
   - (b) livros muito grossos ocupam 2 slots.
3. **Quantas prateleiras por estante?** Isso define a capacidade total (ex.: 4 prateleiras × 17 = 68 livros por estante).
4. **Desejos:** ficam numa das 3 estantes (ex.: a estante da direita é a de desejos) ou se misturam com os lidos, diferenciados visualmente?
5. **Celular:** como mostrar 3 estantes com 17 slots por prateleira numa tela pequena? Deslizar entre estantes (uma por vez)? Zoom na prateleira? Como arrastar um livro de uma estante para outra no celular?
6. **Temas:** qual será o **primeiro cenário** (floresta ou um dos inspirados em livros)? Lista completa e designs pendentes.
7. **Livro repetido:** pode adicionar o mesmo livro duas vezes?

## 6. Próximos passos

1. Usuário define os designs e temas.
2. Resolver as questões em aberto.
3. Rodar o `/impeccable` para criar a direção visual e o design system (DESIGN.md) com base neste documento.
4. Só então começar o código.
