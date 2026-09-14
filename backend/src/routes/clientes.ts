import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

const clienteSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().min(8, "Telefone é obrigatório"),
  email: z.string().email().optional().or(z.literal("")),
  cpfCnpj: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const busca = (req.query.busca as string | undefined)?.trim();
    const clientes = await prisma.cliente.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca } },
              { telefone: { contains: busca } },
              { cpfCnpj: { contains: busca } },
            ],
          }
        : undefined,
      orderBy: { nome: "asc" },
      include: { veiculos: true, _count: { select: { ordensServico: true } } },
    });
    res.json(clientes);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const cliente = await prisma.cliente.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: { veiculos: true, ordensServico: true },
    });
    res.json(cliente);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = clienteSchema.parse(req.body);
    const cliente = await prisma.cliente.create({ data: dados });
    res.status(201).json(cliente);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const dados = clienteSchema.partial().parse(req.body);
    const cliente = await prisma.cliente.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(cliente);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.cliente.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);

export default router;
