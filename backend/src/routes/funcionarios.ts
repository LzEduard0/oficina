import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

const funcionarioSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  cargo: z.string().min(2, "Cargo é obrigatório"),
  telefone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  salario: z.coerce.number().optional().nullable(),
  ativo: z.coerce.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const somenteAtivos = req.query.ativos === "true";
    const funcionarios = await prisma.funcionario.findMany({
      where: somenteAtivos ? { ativo: true } : undefined,
      orderBy: { nome: "asc" },
    });
    res.json(funcionarios);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const funcionario = await prisma.funcionario.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: { ordensServico: true },
    });
    res.json(funcionario);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = funcionarioSchema.parse(req.body);
    const funcionario = await prisma.funcionario.create({ data: dados });
    res.status(201).json(funcionario);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const dados = funcionarioSchema.partial().parse(req.body);
    const funcionario = await prisma.funcionario.update({
      where: { id: Number(req.params.id) },
      data: dados,
    });
    res.json(funcionario);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.funcionario.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);

export default router;
