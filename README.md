# Sistema de Pedidos — Versão Limpa

## Estrutura

```
sistema-pedidos/
├── backend/
│   ├── server.js        # monta o app Express e conecta as rotas
│   ├── produtos.js        # dados, busca e rotas de Produto
│   ├── clientes.js         # dados, busca e rotas de Cliente
│   ├── pedidos.js           # dados, cálculos, regras e rotas de Pedido
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── main.js        # config + navegação entre abas
│       ├── produtos.js
│       ├── clientes.js
│       └── pedidos.js
├── GLOSSARIO.md
└── relatorio-antes-depois.docx
```

## As 6 premissas aplicadas (back-end e front-end)

1. **Verificadores de estilo e formatadores** — ESLint com o guia de
   estilo Airbnb (`eslint-config-airbnb-base`) integrado ao Prettier, no
   back-end; `var`/`==` trocados por `const`/`let`/`===` no front-end.
2. **Nomes legíveis** — variáveis e funções com nomes que revelam seu
   propósito (`novoProduto`, `dadosPedido`, `criarPedido`,
   `montarCardDeProduto`...).
3. **Sem números mágicos** — valores de desconto, frete e limites de
   quantidade viraram constantes nomeadas no back-end, declaradas dentro
   das funções que as usam (não há números mágicos de regra de negócio
   no front-end).
4. **Linguagem ubíqua** — vocabulário do domínio (Cliente, Produto,
   Pedido, Status do Pedido...) padronizado em back e front; ver
   `GLOSSARIO.md`.
5. **Funções coesas e desacopladas** — lógica dividida em funções
   pequenas de responsabilidade única (ex.: `calcularFrete`,
   `montarCardDePedido`), e o próprio projeto dividido em um arquivo por
   entidade, tanto no back-end quanto no front-end.
6. **Fluxos de execução separados** — back-end com rotas envolvidas em
   `try/catch`; front-end com chamadas `fetch` em `async/await` dentro
   de `try/catch`, sempre registrando o erro em vez de ignorá-lo.

## Como rodar

### Back-end

```bash
cd backend
npm install
npm start
```

Servidor em `http://localhost:3000`.

Para checar estilo e formatação:

```bash
npx eslint . --fix
npx prettier --write .
```

### Front-end

```bash
cd frontend
npx serve .
```

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/produtos` | Lista os produtos |
| POST | `/produtos` | Cadastra um novo produto |
| GET | `/clientes` | Lista os clientes |
| POST | `/pedidos` | Cria um pedido (calcula desconto, frete e total) |
| GET | `/pedidos` | Lista os pedidos |
| GET | `/pedidos/:id` | Busca um pedido pelo id |
| PUT | `/pedidos/:id/status` | Atualiza o status de um pedido |

## Documentação

- `GLOSSARIO.md` — vocabulário do domínio (linguagem ubíqua).
