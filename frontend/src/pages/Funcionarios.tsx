import { useEffect, useState } from 'react';
import { Mail, Pencil, Phone, Plus, Trash2, Wallet } from 'lucide-react';
import {
  atualizarFuncionario,
  criarFuncionario,
  listarFuncionarios,
  removerFuncionario,
} from '../api/client';
import type { Funcionario } from '../api/types';
import { Badge, Button, Card, EmptyState, Field, Input, formatarMoeda } from '../components/ui';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useListReveal } from '../hooks/useListReveal';

const FUNCIONARIO_VAZIO = { nome: '', cargo: '', telefone: '', email: '', salario: '' };

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [form, setForm] = useState(FUNCIONARIO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Funcionario | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const { sucesso, erro } = useToast();
  const listRef = useListReveal<HTMLDivElement>([funcionarios]);

  async function carregar() {
    setCarregando(true);
    try {
      setFuncionarios(await listarFuncionarios());
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

  function abrirNovo() {
    setEditando(null);
    setForm(FUNCIONARIO_VAZIO);
    setModalAberto(true);
  }

  function abrirEdicao(funcionario: Funcionario) {
    setEditando(funcionario);
    setForm({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      telefone: funcionario.telefone ?? '',
      email: funcionario.email ?? '',
      salario: funcionario.salario ? String(funcionario.salario) : '',
    });
    setModalAberto(true);
  }

  async function salvar() {
    setSalvando(true);
    try {
      const dados = {
        nome: form.nome,
        cargo: form.cargo,
        telefone: form.telefone,
        email: form.email,
        salario: form.salario ? Number(form.salario) : null,
      };
      if (editando) {
        await atualizarFuncionario(editando.id, dados);
        sucesso('Funcionário atualizado com sucesso.');
      } else {
        await criarFuncionario(dados);
        sucesso('Funcionário cadastrado com sucesso.');
      }
      setModalAberto(false);
      await carregar();
    } catch (e) {
      erro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(funcionario: Funcionario) {
    try {
      await atualizarFuncionario(funcionario.id, { ativo: !funcionario.ativo });
      await carregar();
    } catch (e) {
      erro((e as Error).message);
    }
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await removerFuncionario(paraExcluir.id);
      sucesso('Funcionário removido.');
      setParaExcluir(null);
      await carregar();
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
          <h1 className="text-xl font-semibold">Funcionários</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Equipe da oficina.</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus size={16} /> Novo funcionário
        </Button>
      </div>

      {!carregando && funcionarios.length === 0 && (
        <EmptyState titulo="Nenhum funcionário cadastrado" descricao="Clique em 'Novo funcionário' para começar." />
      )}

      <div ref={listRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {funcionarios.map((funcionario) => (
          <Card key={funcionario.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{funcionario.nome}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{funcionario.cargo}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => abrirEdicao(funcionario)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setParaExcluir(funcionario)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
              {funcionario.telefone && (
                <span className="flex items-center gap-2">
                  <Phone size={14} /> {funcionario.telefone}
                </span>
              )}
              {funcionario.email && (
                <span className="flex items-center gap-2">
                  <Mail size={14} /> {funcionario.email}
                </span>
              )}
              {funcionario.salario != null && (
                <span className="flex items-center gap-2">
                  <Wallet size={14} /> {formatarMoeda(funcionario.salario)}
                </span>
              )}
            </div>
            <button onClick={() => alternarAtivo(funcionario)} className="w-fit" title="Clique para alternar">
              <Badge status={funcionario.ativo ? 'ATIVO' : 'INATIVO'} />
            </button>
          </Card>
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        titulo={editando ? 'Editar funcionário' : 'Novo funcionário'}
        onFechar={() => setModalAberto(false)}
      >
        <Field label="Nome completo">
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Field>
        <Field label="Cargo">
          <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone">
            <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
        <Field label="Salário" hint="Opcional.">
          <Input type="number" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !form.nome || !form.cargo}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir funcionário"
        mensagem={`Tem certeza que deseja excluir "${paraExcluir?.nome}"?`}
        confirmando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
