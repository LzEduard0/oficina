import { useEffect, useState } from 'react';
import { Car, Mail, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react';
import {
  atualizarCliente,
  criarCliente,
  listarClientes,
  removerCliente,
} from '../api/client';
import type { Cliente } from '../api/types';
import { Button, Card, EmptyState, Field, Input } from '../components/ui';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useListReveal } from '../hooks/useListReveal';

const CLIENTE_VAZIO = { nome: '', telefone: '', email: '', cpfCnpj: '', endereco: '' };

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState(CLIENTE_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Cliente | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const { sucesso, erro } = useToast();
  const listRef = useListReveal<HTMLDivElement>([clientes]);

  async function carregar(termo?: string) {
    setCarregando(true);
    try {
      setClientes(await listarClientes(termo));
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
    setForm(CLIENTE_VAZIO);
    setModalAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditando(cliente);
    setForm({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email ?? '',
      cpfCnpj: cliente.cpfCnpj ?? '',
      endereco: cliente.endereco ?? '',
    });
    setModalAberto(true);
  }

  async function salvar() {
    setSalvando(true);
    try {
      if (editando) {
        await atualizarCliente(editando.id, form);
        sucesso('Cliente atualizado com sucesso.');
      } else {
        await criarCliente(form);
        sucesso('Cliente cadastrado com sucesso.');
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
      await removerCliente(paraExcluir.id);
      sucesso('Cliente removido.');
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
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Cadastro de clientes da oficina.</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus size={16} /> Novo cliente
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input
          placeholder="Buscar por nome, telefone ou CPF/CNPJ"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {!carregando && clientes.length === 0 && (
        <EmptyState titulo="Nenhum cliente cadastrado" descricao="Clique em 'Novo cliente' para começar." />
      )}

      <div ref={listRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {clientes.map((cliente) => (
          <Card key={cliente.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{cliente.nome}</p>
                {cliente.cpfCnpj && (
                  <p className="text-xs text-[var(--color-text-muted)]">{cliente.cpfCnpj}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => abrirEdicao(cliente)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setParaExcluir(cliente)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-2">
                <Phone size={14} /> {cliente.telefone}
              </span>
              {cliente.email && (
                <span className="flex items-center gap-2">
                  <Mail size={14} /> {cliente.email}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Car size={14} /> {cliente.veiculos?.length ?? 0} veículo(s)
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal aberto={modalAberto} titulo={editando ? 'Editar cliente' : 'Novo cliente'} onFechar={() => setModalAberto(false)}>
        <Field label="Nome completo">
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Field>
        <Field label="Telefone">
          <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        </Field>
        <Field label="E-mail" hint="Opcional, usado para enviar o link de pagamento.">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="CPF/CNPJ">
          <Input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} />
        </Field>
        <Field label="Endereço">
          <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !form.nome || !form.telefone}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir cliente"
        mensagem={`Tem certeza que deseja excluir "${paraExcluir?.nome}"? Essa ação não pode ser desfeita.`}
        confirmando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
