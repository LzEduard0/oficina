import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { METODOS_PAGAMENTO } from "../lib/constants";
import {
  consultarPagamento,
  criarPagamentoCartao,
  criarPagamentoPix,
  mapStatusMercadoPago,
} from "../services/mercadopago";

const router = Router();

const criarPagamentoSchema = z.object({
  ordemServicoId: z.coerce.number().int(),
  metodo: z.enum(METODOS_PAGAMENTO),
  emailPagador: z.string().email().optional().or(z.literal("")),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pagamentos = await prisma.pagamento.findMany({
      orderBy: { criadoEm: "desc" },
      include: { ordemServico: { include: { cliente: true, veiculo: true } } },
    });
    res.json(pagamentos);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = criarPagamentoSchema.parse(req.body);

    const ordem = await prisma.ordemServico.findUniqueOrThrow({
      where: { id: dados.ordemServicoId },
      include: { cliente: true },
    });

    const descricao = `Ordem de Serviço #${ordem.id} - ${ordem.descricao || "Serviço na oficina"}`;
    const referenciaExterna = `os-${ordem.id}-${Date.now()}`;

    if (dados.metodo === "PIX") {
      const resultado = await criarPagamentoPix({
        descricao,
        valor: ordem.valorTotal,
        emailPagador: dados.emailPagador || ordem.cliente.email || undefined,
        referenciaExterna,
      });

      const pagamento = await prisma.pagamento.create({
        data: {
          ordemServicoId: ordem.id,
          metodo: "PIX",
          valor: ordem.valorTotal,
          status: mapStatusMercadoPago(resultado.status),
          mpPaymentId: resultado.mpPaymentId,
          qrCode: resultado.qrCode,
          qrCodeBase64: resultado.qrCodeBase64,
          linkPagamento: resultado.linkPagamento,
        },
      });
      return res.status(201).json(pagamento);
    }

    const resultado = await criarPagamentoCartao({
      descricao,
      valor: ordem.valorTotal,
      emailPagador: dados.emailPagador || ordem.cliente.email || undefined,
      referenciaExterna,
    });

    const pagamento = await prisma.pagamento.create({
      data: {
        ordemServicoId: ordem.id,
        metodo: "CARTAO",
        valor: ordem.valorTotal,
        status: "PENDENTE",
        mpPreferenceId: resultado.mpPreferenceId ?? undefined,
        linkPagamento: resultado.linkPagamento,
      },
    });
    return res.status(201).json(pagamento);
  })
);

router.get(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const pagamento = await prisma.pagamento.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
    });

    if (!pagamento.mpPaymentId) {
      return res.json(pagamento);
    }

    const mpPagamento = await consultarPagamento(pagamento.mpPaymentId);
    const novoStatus = mapStatusMercadoPago(mpPagamento.status);

    const atualizado = await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { status: novoStatus },
    });

    res.json(atualizado);
  })
);

// Webhook de notificações do Mercado Pago (IPN / webhooks v2)
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const paymentId: string | undefined =
      req.body?.data?.id || (req.query["data.id"] as string | undefined);

    if (req.body?.type === "payment" && paymentId) {
      const mpPagamento = await consultarPagamento(String(paymentId));
      const referencia = mpPagamento.external_reference;

      const pagamento = await prisma.pagamento.findFirst({
        where: {
          OR: [{ mpPaymentId: String(paymentId) }, { mpPreferenceId: referencia ?? undefined }],
        },
      });

      if (pagamento) {
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: {
            status: mapStatusMercadoPago(mpPagamento.status),
            mpPaymentId: String(paymentId),
          },
        });
      }
    }

    res.status(200).send("ok");
  })
);

export default router;
