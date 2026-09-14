import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { STATUS_ORDEM, TIPOS_ITEM } from "../lib/constants";

const router = Router();

const itemSchema = z.object({
  tipo: z.enum(TIPOS_ITEM),
  descricao: z.string().min(1),
  quantidade: z.coerce.number().positive().default(1),
  valorUnitario: z.coerce.number().nonnegative(),
});

const ordemSchema = z.object({
  clienteId: z.coerce.number().int(),
  veiculoId: z.coerce.number().int(),
  funcionarioId: z.coerce.number().int().optional().nullable(),
  descricao: z.string().optional().or(z.literal("")),
  km: z.coerce.number().int().optional().nullable(),
  itens: z.array(itemSchema).default([]),
});

const statusSchema = z.object({
  status: z.enum(STATUS_ORDEM),
});

function calcularTotal(itens: { quantidade: number; valorUnitario: number }[]) {
  return itens.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, clienteId, veiculoId } = req.query as Record<string, string | undefined>;
    const ordens = await prisma.ordemServico.findMany({
      where: {
        status: status || undefined,
        clienteId: clienteId ? Number(clienteId) : undefined,
        veiculoId: veiculoId ? Number(veiculoId) : undefined,
      },
      orderBy: { dataAbertura: "desc" },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: true,
        pagamentos: true,
      },
    });
    res.json(ordens);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ordem = await prisma.ordemServico.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: true,
        pagamentos: true,
      },
    });
    res.json(ordem);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = ordemSchema.parse(req.body);
    const valorTotal = calcularTotal(dados.itens);

    const ordem = await prisma.ordemServico.create({
      data: {
        clienteId: dados.clienteId,
        veiculoId: dados.veiculoId,
        funcionarioId: dados.funcionarioId ?? undefined,
        descricao: dados.descricao || undefined,
        km: dados.km ?? undefined,
        valorTotal,
        itens: { create: dados.itens },
      },
      include: { cliente: true, veiculo: true, funcionario: true, itens: true },
    });
    res.status(201).json(ordem);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const dados = ordemSchema.partial().parse(req.body);
    const id = Number(req.params.id);

    let valorTotal: number | undefined;
    if (dados.itens) {
      valorTotal = calcularTotal(dados.itens);
      await prisma.itemOrdemServico.deleteMany({ where: { ordemServicoId: id } });
    }

    const ordem = await prisma.ordemServico.update({
      where: { id },
      data: {
        clienteId: dados.clienteId,
        veiculoId: dados.veiculoId,
        funcionarioId: dados.funcionarioId ?? undefined,
        descricao: dados.descricao,
        km: dados.km ?? undefined,
        valorTotal,
        itens: dados.itens ? { create: dados.itens } : undefined,
      },
      include: { cliente: true, veiculo: true, funcionario: true, itens: true },
    });
    res.json(ordem);
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const ordem = await prisma.ordemServico.update({
      where: { id: Number(req.params.id) },
      data: {
        status,
        dataConclusao: status === "CONCLUIDA" ? new Date() : undefined,
      },
    });
    res.json(ordem);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.ordemServico.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);

export default router;
