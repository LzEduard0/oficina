import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

function inicioFimDoDia(data: Date) {
  const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0, 0);
  const fim = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999);
  return { inicio, fim };
}

function inicioFimDoMes(ano: number, mes: number) {
  const inicio = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
  const fim = new Date(ano, mes, 0, 23, 59, 59, 999);
  return { inicio, fim };
}

function inicioFimDoAno(ano: number) {
  const inicio = new Date(ano, 0, 1, 0, 0, 0, 0);
  const fim = new Date(ano, 11, 31, 23, 59, 59, 999);
  return { inicio, fim };
}

// Faturamento = soma dos pagamentos APROVADOS no período (dinheiro que efetivamente entrou)
async function somarPagamentosAprovados(inicio: Date, fim: Date) {
  const resultado = await prisma.pagamento.aggregate({
    _sum: { valor: true },
    _count: { _all: true },
    where: {
      status: "APROVADO",
      atualizadoEm: { gte: inicio, lte: fim },
    },
  });
  return {
    total: resultado._sum.valor ?? 0,
    quantidade: resultado._count._all,
  };
}

router.get(
  "/dia",
  asyncHandler(async (req, res) => {
    const dataParam = req.query.data ? new Date(String(req.query.data)) : new Date();
    const { inicio, fim } = inicioFimDoDia(dataParam);
    const dados = await somarPagamentosAprovados(inicio, fim);
    res.json({ periodo: "dia", data: inicio.toISOString().slice(0, 10), ...dados });
  })
);

router.get(
  "/mes",
  asyncHandler(async (req, res) => {
    const hoje = new Date();
    const ano = req.query.ano ? Number(req.query.ano) : hoje.getFullYear();
    const mes = req.query.mes ? Number(req.query.mes) : hoje.getMonth() + 1;
    const { inicio, fim } = inicioFimDoMes(ano, mes);
    const dados = await somarPagamentosAprovados(inicio, fim);
    res.json({ periodo: "mes", ano, mes, ...dados });
  })
);

router.get(
  "/ano",
  asyncHandler(async (req, res) => {
    const hoje = new Date();
    const ano = req.query.ano ? Number(req.query.ano) : hoje.getFullYear();
    const { inicio, fim } = inicioFimDoAno(ano);
    const dados = await somarPagamentosAprovados(inicio, fim);

    const meses = [];
    for (let mes = 1; mes <= 12; mes++) {
      const { inicio: iniMes, fim: fimMes } = inicioFimDoMes(ano, mes);
      const dadosMes = await somarPagamentosAprovados(iniMes, fimMes);
      meses.push({ mes, ...dadosMes });
    }

    res.json({ periodo: "ano", ano, ...dados, meses });
  })
);

router.get(
  "/resumo",
  asyncHandler(async (req, res) => {
    const hoje = req.query.data ? new Date(String(req.query.data)) : new Date();
    const { inicio: inicioDia, fim: fimDia } = inicioFimDoDia(hoje);
    const { inicio: inicioMes, fim: fimMes } = inicioFimDoMes(hoje.getFullYear(), hoje.getMonth() + 1);
    const { inicio: inicioAno, fim: fimAno } = inicioFimDoAno(hoje.getFullYear());

    const [dia, mes, ano, ordensAbertas, ordensConcluidas] = await Promise.all([
      somarPagamentosAprovados(inicioDia, fimDia),
      somarPagamentosAprovados(inicioMes, fimMes),
      somarPagamentosAprovados(inicioAno, fimAno),
      prisma.ordemServico.count({ where: { status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"] } } }),
      prisma.ordemServico.count({ where: { status: "CONCLUIDA" } }),
    ]);

    res.json({ dia, mes, ano, ordensAbertas, ordensConcluidas });
  })
);

export default router;
