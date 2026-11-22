# 📚 Alexandria

Sua biblioteca pessoal: estantes que você preenche com os livros que leu. Pesquise qualquer livro, coloque-o na estante, pegue e arraste para onde quiser, dê nota e escreva sua resenha, tudo dentro de cenários animados.

> 🚧 Em desenvolvimento. Acompanhe as etapas no [Roadmap](ROADMAP.md).

## Documentação

- [Requisitos](REQUISITOS.md): o que o app faz
- [Roadmap](ROADMAP.md): etapas de desenvolvimento

## Stack

React · TypeScript · Vite · Tailwind CSS · Motion · GSAP · dnd-kit · Google Books API

## Rodando localmente

Precisa do [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
cp .env.example .env   # preencha as chaves quando necessário
npm run dev            # abre em http://localhost:5173
```

Para testar no celular na mesma rede Wi-Fi: `npm run dev -- --host` e abra o endereço "Network" que aparecer.

## Scripts

| Comando                | O que faz                            |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Servidor de desenvolvimento          |
| `npm run build`        | Checa os tipos e gera a versão final |
| `npm run preview`      | Abre a versão final localmente       |
| `npm run lint`         | Procura problemas no código (oxlint) |
| `npm run format`       | Formata o código (Prettier)          |
| `npm run format:check` | Verifica se o código está formatado  |
| `npm run typecheck`    | Checa os tipos do TypeScript         |

## Estrutura de pastas

```
src/
├── App.tsx          # Página principal
├── main.tsx         # Ponto de entrada
├── index.css        # Tailwind + tokens de tema
├── components/      # Componentes visuais reutilizáveis (botões, modal…)
├── features/        # Funcionalidades: estante, busca, livro, arrastar, temas
├── lib/             # Clientes de API e utilitários (ex.: Google Books)
├── store/           # Estado global da estante (Zustand)
└── types/           # Tipos TypeScript compartilhados (ex.: Livro)
```

> As pastas são criadas conforme cada etapa precisar delas.
