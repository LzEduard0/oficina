import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { consultarStatusPagamento, listarPagamentos } from '../api/client';
import type { Pagamento } from '../api/types';
import { Badge, Card, EmptyState, formatarDataHora, formatarMoeda } from '../components/ui';
import { useToast } from '../components/Toast';
import { useListReveal } from '../hooks/useListReveal';

export function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);
  const { erro, sucesso } = useToast();
  const listRef = useListReveal<HTMLDivElement>([pagamentos]);

  async function carregar() {
    setCarregando(true);
    try {
      setPagamentos(await listarPagamentos());
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function atualizarStatus(pagamento: Pagamento) {
    setAtualizandoId(pagamento.id);
    try {
      await consultarStatusPagamento(pagamento.id);
      sucesso('Status consultado junto ao Mercado Pago.');
      await carregar();
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setAtualizandoId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Pagamentos</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Links de pagamento gerados via Mercado Pago.</p>
      </div>

      {!carregando && pagamentos.length === 0 && (
        <EmptyState
          titulo="Nenhum pagamento gerado"
          descricao="Gere um link de pagamento a partir de uma ordem de serviço."
        />
      )}

      <div ref={listRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pagamentos.map((pagamento) => (
          <Card key={pagamento.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <Link to={`/ordens/${pagamento.ordemServicoId}`} className="font-semibold hover:underline">
                  OS #{pagamento.ordemServicoId}
                </Link>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {pagamento.ordemServico?.cliente?.nome} · {pagamento.metodo === 'PIX' ? 'PIX' : 'Cartão'}
                </p>
              </div>
              <Badge status={pagamento.status} />
            </div>
            <p className="text-lg font-semibold">{formatarMoeda(pagamento.valor)}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Criado em {formatarDataHora(pagamento.criadoEm)}</p>
            {pagamento.status === 'PENDENTE' && pagamento.mpPaymentId && (
              <button
                onClick={() => atualizarStatus(pagamento)}
                disabled={atualizandoId === pagamento.id}
                className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <RefreshCw size={13} className={atualizandoId === pagamento.id ? 'animate-spin' : ''} />
                Atualizar status
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
