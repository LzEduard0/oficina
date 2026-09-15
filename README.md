# Oficina — Sistema de Gestão para Oficina Mecânica

Sistema completo de gestão para oficinas mecânicas: cadastro de clientes, veículos,
funcionários, ordens de serviço e cálculo de faturamento (dia/mês/ano).

- **Backend:** Node.js + TypeScript + Express + Prisma + **SQLite**
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + **GSAP** (animações)
- Layout **responsivo**, funciona em desktop e mobile.

## Estrutura do projeto

```
oficina/
├── backend/     # API REST (Express + Prisma + SQLite)
└── frontend/    # Aplicação React (Vite)
```

## Pré-requisitos

- Node.js 20+

## Configuração

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # ajuste PORT/DATABASE_URL se necessário
npx prisma migrate dev # cria o banco SQLite e as tabelas
npm run dev             # inicia em http://localhost:3001
```

Variáveis de ambiente (`backend/.env`):

| Variável       | Descrição                                          |
| -------------- | --------------------------------------------------- |
| `PORT`         | Porta da API (padrão `3001`)                         |
| `DATABASE_URL` | Caminho do arquivo SQLite (padrão `file:./dev.db`)   |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # inicia em http://localhost:5173
```

O Vite já está configurado para redirecionar chamadas `/api/*` para o backend em
`http://localhost:3001` (veja `frontend/vite.config.ts`).

Acesse **http://localhost:5173** no navegador (ou no celular, na mesma rede,
usando o endereço de rede exibido pelo Vite).

## Funcionalidades

- **Clientes:** cadastro, busca, edição e exclusão.
- **Veículos:** vinculados a um cliente (placa, marca, modelo, ano, cor).
- **Funcionários:** cadastro com cargo, contato, salário e status ativo/inativo.
- **Ordens de Serviço:** cliente + veículo + funcionário responsável, itens
  (peças e serviços) com cálculo automático do valor total, status
  (aberta, em andamento, aguardando peça, concluída, cancelada).
- **Faturamento:** o dashboard mostra o total faturado (soma do valor das
  ordens de serviço concluídas) do dia, do mês e do ano corrente, além de um
  gráfico com o faturamento mês a mês.

## Build de produção

```bash
# backend
cd backend && npm run build && npm start

# frontend
cd frontend && npm run build   # gera frontend/dist, pronto para hospedar em qualquer servidor estático
```

## Banco de dados

O projeto usa **SQLite** através do Prisma ORM (`backend/prisma/schema.prisma`),
com o arquivo do banco em `backend/prisma/dev.db` (criado automaticamente pela
migration, não versionado no git). Para alterar o schema, edite o arquivo
`.prisma` e rode `npx prisma migrate dev --name <nome-da-mudanca>`.
