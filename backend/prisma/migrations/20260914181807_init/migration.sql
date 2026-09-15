-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cpfCnpj" TEXT,
    "endereco" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER,
    "cor" TEXT,
    "clienteId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Veiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "salario" REAL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "funcionarioId" INTEGER,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "km" INTEGER,
    "dataAbertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataConclusao" DATETIME,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "OrdemServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdemServico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdemServico_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemOrdemServico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" REAL NOT NULL DEFAULT 1,
    "valorUnitario" REAL NOT NULL,
    CONSTRAINT "ItemOrdemServico_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordemServicoId" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valor" REAL NOT NULL,
    "mpPaymentId" TEXT,
    "mpPreferenceId" TEXT,
    "linkPagamento" TEXT,
    "qrCode" TEXT,
    "qrCodeBase64" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Pagamento_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");
