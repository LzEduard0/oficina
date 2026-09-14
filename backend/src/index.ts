import "dotenv/config";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
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
app.listen(PORT, () => {
  console.log(`Servidor da oficina rodando em http://localhost:${PORT}`);
});
