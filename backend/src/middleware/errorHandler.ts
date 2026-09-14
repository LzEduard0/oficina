import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Dados inválidos", detalhes: err.flatten() });
  }

  const anyErr = err as { code?: string; message?: string; name?: string };
  if (anyErr?.message?.includes("MP_ACCESS_TOKEN")) {
    return res.status(400).json({ error: anyErr.message });
  }
  if (anyErr?.code === "P2025") {
    return res.status(404).json({ error: "Registro não encontrado" });
  }
  if (anyErr?.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado (violação de unicidade)" });
  }
  if (anyErr?.code === "P2021") {
    console.error(err);
    return res.status(500).json({
      error:
        "Banco de dados não inicializado: as tabelas ainda não existem. Rode `npx prisma migrate dev` dentro da pasta backend e reinicie o servidor.",
    });
  }
  if (anyErr?.name === "PrismaClientInitializationError") {
    console.error(err);
    return res.status(500).json({
      error:
        "Não foi possível conectar ao banco de dados. Verifique se o arquivo backend/.env existe (copie de backend/.env.example) e se DATABASE_URL está definido.",
    });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor", detalhes: anyErr?.message });
}
