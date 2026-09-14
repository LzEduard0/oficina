import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function getClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MP_ACCESS_TOKEN não configurado. Defina a variável de ambiente com seu Access Token do Mercado Pago."
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

interface DadosPagamento {
  descricao: string;
  valor: number;
  emailPagador?: string;
  referenciaExterna: string;
}

export async function criarPagamentoPix(dados: DadosPagamento) {
  const client = getClient();
  const payment = new Payment(client);

  const resultado = await payment.create({
    body: {
      transaction_amount: Number(dados.valor.toFixed(2)),
      description: dados.descricao,
      payment_method_id: "pix",
      external_reference: dados.referenciaExterna,
      payer: {
        email: dados.emailPagador || "cliente@oficina.com",
      },
    },
  });

  const transacao = resultado.point_of_interaction?.transaction_data;

  return {
    mpPaymentId: String(resultado.id),
    status: resultado.status,
    qrCode: transacao?.qr_code ?? null,
    qrCodeBase64: transacao?.qr_code_base64 ?? null,
    linkPagamento: transacao?.ticket_url ?? null,
  };
}

export async function criarPagamentoCartao(dados: DadosPagamento) {
  const client = getClient();
  const preference = new Preference(client);

  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const resultado = await preference.create({
    body: {
      items: [
        {
          id: dados.referenciaExterna,
          title: dados.descricao,
          quantity: 1,
          unit_price: Number(dados.valor.toFixed(2)),
          currency_id: "BRL",
        },
      ],
      payer: dados.emailPagador ? { email: dados.emailPagador } : undefined,
      external_reference: dados.referenciaExterna,
      back_urls: {
        success: `${frontendUrl}/pagamentos`,
        pending: `${frontendUrl}/pagamentos`,
        failure: `${frontendUrl}/pagamentos`,
      },
      notification_url: `${backendUrl}/api/pagamentos/webhook`,
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
      },
    },
  });

  return {
    mpPreferenceId: resultado.id ?? null,
    linkPagamento: resultado.init_point ?? resultado.sandbox_init_point ?? null,
  };
}

export async function consultarPagamento(mpPaymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: mpPaymentId });
}

export function mapStatusMercadoPago(status?: string | null): "PENDENTE" | "APROVADO" | "RECUSADO" | "CANCELADO" {
  switch (status) {
    case "approved":
      return "APROVADO";
    case "rejected":
      return "RECUSADO";
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "CANCELADO";
    default:
      return "PENDENTE";
  }
}
