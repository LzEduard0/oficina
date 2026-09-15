import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Wrench } from 'lucide-react';
import { atualizarStatusOrdem, buscarOrdem } from '../api/client';
import type { OrdemServico, StatusOrdem } from '../api/types';
import { Badge, Card, Select, formatarData, formatarMoeda } from '../components/ui';
import { useToast } from '../components/Toast';

const OPCOES_STATUS: StatusOrdem[] = ['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA'];

export function OrdemServicoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { sucesso, erro } = useToast();

  async function carregar() {
    setCarregando(true);
    try {
      setOrdem(await buscarOrdem(Number(id)));
    } catch (e) {
      erro((e as Error).message);
      navigate('/ordens');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function mudarStatus(status: StatusOrdem) {
    if (!ordem) return;
    try {
      const atualizado = await atualizarStatusOrdem(ordem.id, status);
      setOrdem({ ...ordem, ...atualizado });
      sucesso('Status atualizado.');
    } catch (e) {
      erro((e as Error).message);
    }
  }

  if (carregando || !ordem) {
    return <p className="text-sm text-[var(--color-text-muted)]">Carregando ordem de serviço...</p>;
  }

  return (
    <div>
      <Link to="/ordens" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Wrench size={20} /> Ordem de Serviço #{ordem.id}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Aberta em {formatarData(ordem.dataAbertura)}
            {ordem.dataConclusao && ` · Concluída em ${formatarData(ordem.dataConclusao)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={ordem.status} />
          <Select value={ordem.status} onChange={(e) => mudarStatus(e.target.value as StatusOrdem)} className="w-auto">
            {OPCOES_STATUS.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Cliente e veículo</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[var(--color-text-muted)]">Cliente</p>
              <p className="font-medium">{ordem.cliente.nome}</p>
              <p className="text-[var(--color-text-muted)]">{ordem.cliente.telefone}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Veículo</p>
              <p className="font-medium">{ordem.veiculo.placa}</p>
              <p className="text-[var(--color-text-muted)]">
                {ordem.veiculo.marca} {ordem.veiculo.modelo} {ordem.veiculo.ano ? `· ${ordem.veiculo.ano}` : ''}
              </p>
            </div>
            {ordem.funcionario && (
              <div>
                <p className="text-[var(--color-text-muted)]">Responsável</p>
                <p className="font-medium">{ordem.funcionario.nome}</p>
              </div>
            )}
            {ordem.km != null && (
              <div>
                <p className="text-[var(--color-text-muted)]">Quilometragem</p>
                <p className="font-medium">{ordem.km.toLocaleString('pt-BR')} km</p>
              </div>
            )}
          </div>
          {ordem.descricao && (
            <div className="mt-3 border-t pt-3 text-sm" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[var(--color-text-muted)]">Descrição</p>
              <p>{ordem.descricao}</p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold">Itens</h2>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {ordem.itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p>{item.descricao}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.tipo === 'PECA' ? 'Peça' : 'Serviço'} · {item.quantidade} x {formatarMoeda(item.valorUnitario)}
                  </p>
                </div>
                <span className="font-medium">{formatarMoeda(item.quantidade * item.valorUnitario)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">{formatarMoeda(ordem.valorTotal)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
