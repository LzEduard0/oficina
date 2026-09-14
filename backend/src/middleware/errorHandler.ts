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

  const anyErr = err as { code?: string; message?: string };
  if (anyErr?.message?.includes("MP_ACCESS_TOKEN")) {
    return res.status(400).json({ error: anyErr.message });
  }
  if (anyErr?.code === "P2025") {
    return res.status(404).json({ error: "Registro não encontrado" });
  }
  if (anyErr?.code === "P2002") {
    return res.status(409).json({ error: "Registro duplicado (violação de unicidade)" });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor", detalhes: anyErr?.message });
}
