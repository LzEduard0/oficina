# Oficina — Sistema de Gestão para Oficina Mecânica

Sistema completo de gestão para oficinas mecânicas: cadastro de clientes, veículos e
funcionários, ordens de serviço, cálculo de faturamento (dia/mês/ano) e geração de
links de pagamento via **PIX** e **cartão** usando o **Mercado Pago**.

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
- Uma conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel)
  para obter o **Access Token** (necessário apenas para gerar cobranças PIX/cartão).

## Configuração

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edite o .env e informe seu MP_ACCESS_TOKEN
npx prisma migrate dev # cria o banco SQLite e as tabelas
npm run dev             # inicia em http://localhost:3001
```

Variáveis de ambiente (`backend/.env`):

| Variável        | Descrição                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| `PORT`          | Porta da API (padrão `3001`)                                               |
| `DATABASE_URL`  | Caminho do arquivo SQLite (padrão `file:./dev.db`)                         |
| `MP_ACCESS_TOKEN` | Access Token do Mercado Pago (obrigatório para gerar cobranças PIX/cartão) |
| `FRONTEND_URL`  | URL pública do frontend (usada no retorno do checkout)                    |
| `BACKEND_URL`   | URL pública do backend (usada no webhook de notificações)                 |

> **Como obter o Access Token do Mercado Pago:** acesse o [painel de
> desenvolvedores](https://www.mercadopago.com.br/developers/panel/app), crie uma
> aplicação e copie o *Access Token* (use o de teste para desenvolver e o de
> produção somente ao publicar). Nunca commite esse token — ele já está protegido
> pelo `.gitignore` (`backend/.env`).

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
- **Pagamentos:** a partir de uma ordem de serviço é possível gerar:
  - **PIX** — cria uma cobrança com QR Code e código "copia e cola" via API de
    Pagamentos do Mercado Pago.
  - **Cartão** — cria um link de checkout (Checkout Pro) do Mercado Pago.
  - Um *webhook* (`POST /api/pagamentos/webhook`) recebe as notificações de
    status do Mercado Pago e atualiza o pagamento automaticamente.
- **Faturamento:** o dashboard mostra o total faturado (soma de pagamentos
  aprovados) do dia, do mês e do ano corrente, além de um gráfico com o
  faturamento mês a mês.

## Testando pagamentos localmente

O Mercado Pago só consegue notificar o *webhook* (`/api/pagamentos/webhook`) se
o backend estiver acessível publicamente. Em desenvolvimento local, use uma
ferramenta como [ngrok](https://ngrok.com/) para expor o backend e configure
`BACKEND_URL` com a URL pública gerada. Sem isso, o link de pagamento ainda
funciona normalmente — apenas a atualização automática de status via webhook
não chegará; use o botão **"Atualizar status"** na tela de Pagamentos para
consultar manualmente.

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
