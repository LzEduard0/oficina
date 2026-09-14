import "dotenv/config";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";
import clientesRouter from "./routes/clientes";
import veiculosRouter from "./routes/veiculos";
import funcionariosRouter from "./routes/funcionarios";
import ordensServicoRouter from "./routes/ordensServico";
import faturamentoRouter from "./routes/faturamento";
import pagamentosRouter from "./routes/pagamentos";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/clientes", clientesRouter);
app.use("/api/veiculos", veiculosRouter);
app.use("/api/funcionarios", funcionariosRouter);
app.use("/api/ordens-servico", ordensServicoRouter);
app.use("/api/faturamento", faturamentoRouter);
app.use("/api/pagamentos", pagamentosRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, async () => {
  console.log(`Servidor da oficina rodando em http://localhost:${PORT}`);

  try {
    await prisma.cliente.count();
  } catch (err) {
    const anyErr = err as { code?: string };
    if (anyErr?.code === "P2021") {
      console.error(
        "\n⚠️  As tabelas do banco de dados ainda não existem.\n" +
          "   Rode `npx prisma migrate dev` dentro da pasta backend e reinicie o servidor.\n"
      );
    } else {
      console.error(
        "\n⚠️  Não foi possível conectar ao banco de dados. Verifique se backend/.env existe " +
          "(copie de backend/.env.example) e se DATABASE_URL está definido.\n",
        err
      );
    }
  }
});
