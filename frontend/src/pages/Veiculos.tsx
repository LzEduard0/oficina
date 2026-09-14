import { useEffect, useState } from 'react';
import { Car, Palette, Pencil, Plus, Search, Trash2, User } from 'lucide-react';
import {
  atualizarVeiculo,
  criarVeiculo,
  listarClientes,
  listarVeiculos,
  removerVeiculo,
} from '../api/client';
import type { Cliente, Veiculo } from '../api/types';
import { Button, Card, EmptyState, Field, Input, Select } from '../components/ui';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useListReveal } from '../hooks/useListReveal';

const VEICULO_VAZIO = { placa: '', marca: '', modelo: '', ano: '', cor: '', clienteId: '' };

export function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [form, setForm] = useState(VEICULO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Veiculo | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const { sucesso, erro } = useToast();
  const listRef = useListReveal<HTMLDivElement>([veiculos]);

  async function carregar(termo?: string) {
    setCarregando(true);
    try {
      const [v, c] = await Promise.all([listarVeiculos(termo), listarClientes()]);
      setVeiculos(v);
      setClientes(c);
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

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  function abrirNovo() {
    setEditando(null);
    setForm({ ...VEICULO_VAZIO, clienteId: clientes[0] ? String(clientes[0].id) : '' });
    setModalAberto(true);
  }

  function abrirEdicao(veiculo: Veiculo) {
    setEditando(veiculo);
    setForm({
      placa: veiculo.placa,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano ? String(veiculo.ano) : '',
      cor: veiculo.cor ?? '',
      clienteId: String(veiculo.clienteId),
    });
    setModalAberto(true);
  }

  async function salvar() {
    setSalvando(true);
    try {
      const dados = {
        placa: form.placa,
        marca: form.marca,
        modelo: form.modelo,
        ano: form.ano ? Number(form.ano) : null,
        cor: form.cor,
        clienteId: Number(form.clienteId),
      };
      if (editando) {
        await atualizarVeiculo(editando.id, dados);
        sucesso('Veículo atualizado com sucesso.');
      } else {
        await criarVeiculo(dados);
        sucesso('Veículo cadastrado com sucesso.');
      }
      setModalAberto(false);
      await carregar(busca);
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await removerVeiculo(paraExcluir.id);
      sucesso('Veículo removido.');
      setParaExcluir(null);
      await carregar(busca);
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Veículos</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Veículos vinculados aos clientes.</p>
        </div>
        <Button onClick={abrirNovo} disabled={clientes.length === 0}>
          <Plus size={16} /> Novo veículo
        </Button>
      </div>

      {clientes.length === 0 && !carregando && (
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          Cadastre um cliente antes de adicionar veículos.
        </p>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input
          placeholder="Buscar por placa, marca ou modelo"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {!carregando && veiculos.length === 0 && (
        <EmptyState titulo="Nenhum veículo cadastrado" descricao="Clique em 'Novo veículo' para começar." />
      )}

      <div ref={listRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {veiculos.map((veiculo) => (
          <Card key={veiculo.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold tracking-wide">{veiculo.placa}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {veiculo.marca} {veiculo.modelo} {veiculo.ano ? `· ${veiculo.ano}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => abrirEdicao(veiculo)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setParaExcluir(veiculo)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-2">
                <User size={14} /> {veiculo.cliente?.nome ?? '—'}
              </span>
              {veiculo.cor && (
                <span className="flex items-center gap-2">
                  <Palette size={14} /> {veiculo.cor}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Car size={14} /> Cadastrado
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal aberto={modalAberto} titulo={editando ? 'Editar veículo' : 'Novo veículo'} onFechar={() => setModalAberto(false)}>
        <Field label="Cliente">
          <Select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Placa">
          <Input
            value={form.placa}
            onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
            maxLength={8}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca">
            <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          </Field>
          <Field label="Modelo">
            <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ano">
            <Input type="number" value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} />
          </Field>
          <Field label="Cor">
            <Input value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !form.placa || !form.marca || !form.modelo || !form.clienteId}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir veículo"
        mensagem={`Tem certeza que deseja excluir o veículo "${paraExcluir?.placa}"?`}
        confirmando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
