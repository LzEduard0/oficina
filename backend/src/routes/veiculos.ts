import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

const veiculoSchema = z.object({
  placa: z.string().min(6, "Placa inválida"),
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  ano: z.coerce.number().int().optional().nullable(),
  cor: z.string().optional().or(z.literal("")),
  clienteId: z.coerce.number().int(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const busca = (req.query.busca as string | undefined)?.trim();
    const veiculos = await prisma.veiculo.findMany({
      where: busca
        ? {
            OR: [
              { placa: { contains: busca } },
              { marca: { contains: busca } },
              { modelo: { contains: busca } },
            ],
          }
        : undefined,
      orderBy: { criadoEm: "desc" },
      include: { cliente: true },
    });
    res.json(veiculos);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const veiculo = await prisma.veiculo.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: { cliente: true, ordensServico: true },
    });
    res.json(veiculo);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = veiculoSchema.parse(req.body);
    const veiculo = await prisma.veiculo.create({
      data: { ...dados, placa: dados.placa.toUpperCase() },
    });
    res.status(201).json(veiculo);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const dados = veiculoSchema.partial().parse(req.body);
    const veiculo = await prisma.veiculo.update({
      where: { id: Number(req.params.id) },
      data: { ...dados, placa: dados.placa ? dados.placa.toUpperCase() : undefined },
    });
    res.json(veiculo);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.veiculo.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);

export default router;
