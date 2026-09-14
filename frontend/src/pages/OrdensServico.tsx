import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Wrench } from 'lucide-react';
import {
  criarOrdem,
  listarClientes,
  listarFuncionarios,
  listarOrdens,
  listarVeiculos,
} from '../api/client';
import type { Cliente, Funcionario, OrdemServico, TipoItem, Veiculo } from '../api/types';
import { Badge, Button, Card, EmptyState, Field, Input, Select, Textarea, formatarData, formatarMoeda } from '../components/ui';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useListReveal } from '../hooks/useListReveal';

interface LinhaItem {
  tipo: TipoItem;
  descricao: string;
  quantidade: string;
  valorUnitario: string;
}

const LINHA_VAZIA: LinhaItem = { tipo: 'SERVICO', descricao: '', quantidade: '1', valorUnitario: '' };
const FILTROS_STATUS = ['TODAS', 'ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA'];

export function OrdensServico() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('TODAS');
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { sucesso, erro } = useToast();
  const listRef = useListReveal<HTMLDivElement>([ordens]);

  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [km, setKm] = useState('');
  const [itens, setItens] = useState<LinhaItem[]>([{ ...LINHA_VAZIA }]);

  const veiculosDoCliente = useMemo(
    () => veiculos.filter((v) => String(v.clienteId) === clienteId),
    [veiculos, clienteId]
  );

  const totalOrcado = useMemo(
    () =>
      itens.reduce((soma, item) => soma + (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0), 0),
    [itens]
  );

  async function carregar() {
    setCarregando(true);
    try {
      const [o, c, v, f] = await Promise.all([
        listarOrdens(filtroStatus !== 'TODAS' ? { status: filtroStatus } : undefined),
        listarClientes(),
        listarVeiculos(),
        listarFuncionarios(),
      ]);
      setOrdens(o);
      setClientes(c);
      setVeiculos(v);
      setFuncionarios(f);
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus]);

  function abrirNova() {
    setClienteId(clientes[0] ? String(clientes[0].id) : '');
    setVeiculoId('');
    setFuncionarioId('');
    setDescricao('');
    setKm('');
    setItens([{ ...LINHA_VAZIA }]);
    setModalAberto(true);
  }

  function atualizarItem(indice: number, campo: keyof LinhaItem, valor: string) {
    setItens((atual) => atual.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  async function salvar() {
    setSalvando(true);
    try {
      await criarOrdem({
        clienteId: Number(clienteId),
        veiculoId: Number(veiculoId),
        funcionarioId: funcionarioId ? Number(funcionarioId) : null,
        descricao,
        km: km ? Number(km) : null,
        itens: itens
          .filter((i) => i.descricao && i.valorUnitario)
          .map((i) => ({
            tipo: i.tipo,
            descricao: i.descricao,
            quantidade: Number(i.quantidade) || 1,
            valorUnitario: Number(i.valorUnitario) || 0,
          })),
      });
      sucesso('Ordem de serviço criada com sucesso.');
      setModalAberto(false);
      await carregar();
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Ordens de Serviço</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Acompanhe os serviços em andamento.</p>
        </div>
        <Button onClick={abrirNova} disabled={clientes.length === 0}>
          <Plus size={16} /> Nova ordem
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS_STATUS.map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filtroStatus === status
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {status === 'TODAS' ? 'Todas' : status.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {!carregando && ordens.length === 0 && (
        <EmptyState titulo="Nenhuma ordem de serviço" descricao="Clique em 'Nova ordem' para começar." />
      )}

      <div ref={listRef} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {ordens.map((ordem) => (
          <Link key={ordem.id} to={`/ordens/${ordem.id}`}>
            <Card className="flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">OS #{ordem.id} · {ordem.veiculo.placa}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {ordem.cliente.nome} · {ordem.veiculo.marca} {ordem.veiculo.modelo}
                  </p>
                </div>
                <Badge status={ordem.status} />
              </div>
              {ordem.descricao && <p className="text-sm text-[var(--color-text-muted)]">{ordem.descricao}</p>}
              <div className="flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <Wrench size={14} /> {formatarData(ordem.dataAbertura)}
                </span>
                <span className="font-semibold">{formatarMoeda(ordem.valorTotal)}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Modal aberto={modalAberto} titulo="Nova ordem de serviço" onFechar={() => setModalAberto(false)} largura="lg">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Cliente">
            <Select
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                setVeiculoId('');
              }}
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Veículo">
            <Select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
              <option value="">Selecione</option>
              {veiculosDoCliente.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} · {v.marca} {v.modelo}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Funcionário responsável" hint="Opcional.">
            <Select value={funcionarioId} onChange={(e) => setFuncionarioId(e.target.value)}>
              <option value="">Não definido</option>
              {funcionarios.filter((f) => f.ativo).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Quilometragem" hint="Opcional.">
            <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} />
          </Field>
        </div>
        <Field label="Descrição do problema/serviço">
          <Textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>

        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Itens (peças e serviços)</span>
            <Button
              type="button"
              variant="secondary"
              className="px-2.5 py-1 text-xs"
              onClick={() => setItens((a) => [...a, { ...LINHA_VAZIA }])}
            >
              <Plus size={14} /> Adicionar item
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {itens.map((item, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-end" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-full sm:w-28">
                  <Select value={item.tipo} onChange={(e) => atualizarItem(i, 'tipo', e.target.value)}>
                    <option value="SERVICO">Serviço</option>
                    <option value="PECA">Peça</option>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Descrição"
                    value={item.descricao}
                    onChange={(e) => atualizarItem(i, 'descricao', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-20">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(i, 'quantidade', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-28">
                  <Input
                    type="number"
                    placeholder="Valor unit."
                    value={item.valorUnitario}
                    onChange={(e) => atualizarItem(i, 'valorUnitario', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removerItem(i)}
                  className="shrink-0 self-center rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm text-[var(--color-text-muted)]">Total estimado</span>
          <span className="text-lg font-semibold">{formatarMoeda(totalOrcado)}</span>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !clienteId || !veiculoId}>
            {salvando ? 'Salvando...' : 'Criar ordem'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
