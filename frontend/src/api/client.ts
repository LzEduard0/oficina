import axios from 'axios';
import type {
  Cliente,
  Funcionario,
  FaturamentoAno,
  FaturamentoResumo,
  MetodoPagamento,
  OrdemServico,
  Pagamento,
  StatusOrdem,
  TipoItem,
  Veiculo,
} from './types';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error?.response?.data?.error || error?.message || 'Erro inesperado ao comunicar com o servidor';
    return Promise.reject(new Error(mensagem));
  }
);

// Clientes
export const listarClientes = (busca?: string) =>
  api.get<Cliente[]>('/clientes', { params: { busca } }).then((r) => r.data);
export const buscarCliente = (id: number) => api.get<Cliente>(`/clientes/${id}`).then((r) => r.data);
export const criarCliente = (dados: Partial<Cliente>) =>
  api.post<Cliente>('/clientes', dados).then((r) => r.data);
export const atualizarCliente = (id: number, dados: Partial<Cliente>) =>
  api.put<Cliente>(`/clientes/${id}`, dados).then((r) => r.data);
export const removerCliente = (id: number) => api.delete(`/clientes/${id}`);

// Veículos
export const listarVeiculos = (busca?: string) =>
  api.get<Veiculo[]>('/veiculos', { params: { busca } }).then((r) => r.data);
export const criarVeiculo = (dados: Partial<Veiculo>) =>
  api.post<Veiculo>('/veiculos', dados).then((r) => r.data);
export const atualizarVeiculo = (id: number, dados: Partial<Veiculo>) =>
  api.put<Veiculo>(`/veiculos/${id}`, dados).then((r) => r.data);
export const removerVeiculo = (id: number) => api.delete(`/veiculos/${id}`);

// Funcionários
export const listarFuncionarios = () => api.get<Funcionario[]>('/funcionarios').then((r) => r.data);
export const criarFuncionario = (dados: Partial<Funcionario>) =>
  api.post<Funcionario>('/funcionarios', dados).then((r) => r.data);
export const atualizarFuncionario = (id: number, dados: Partial<Funcionario>) =>
  api.put<Funcionario>(`/funcionarios/${id}`, dados).then((r) => r.data);
export const removerFuncionario = (id: number) => api.delete(`/funcionarios/${id}`);

// Ordens de Serviço
export interface ItemOrdemInput {
  tipo: TipoItem;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}
export interface OrdemServicoInput {
  clienteId: number;
  veiculoId: number;
  funcionarioId?: number | null;
  descricao?: string;
  km?: number | null;
  itens: ItemOrdemInput[];
}

export const listarOrdens = (filtros?: { status?: string }) =>
  api.get<OrdemServico[]>('/ordens-servico', { params: filtros }).then((r) => r.data);
export const buscarOrdem = (id: number) => api.get<OrdemServico>(`/ordens-servico/${id}`).then((r) => r.data);
export const criarOrdem = (dados: OrdemServicoInput) =>
  api.post<OrdemServico>('/ordens-servico', dados).then((r) => r.data);
export const atualizarOrdem = (id: number, dados: Partial<OrdemServicoInput>) =>
  api.put<OrdemServico>(`/ordens-servico/${id}`, dados).then((r) => r.data);
export const atualizarStatusOrdem = (id: number, status: StatusOrdem) =>
  api.patch<OrdemServico>(`/ordens-servico/${id}/status`, { status }).then((r) => r.data);
export const removerOrdem = (id: number) => api.delete(`/ordens-servico/${id}`);

// Faturamento
export const buscarResumoFaturamento = () =>
  api.get<FaturamentoResumo>('/faturamento/resumo').then((r) => r.data);
export const buscarFaturamentoAno = (ano: number) =>
  api.get<FaturamentoAno>('/faturamento/ano', { params: { ano } }).then((r) => r.data);

// Pagamentos
export const listarPagamentos = () => api.get<Pagamento[]>('/pagamentos').then((r) => r.data);
export const criarPagamento = (dados: { ordemServicoId: number; metodo: MetodoPagamento; emailPagador?: string }) =>
  api.post<Pagamento>('/pagamentos', dados).then((r) => r.data);
export const consultarStatusPagamento = (id: number) =>
  api.get<Pagamento>(`/pagamentos/${id}/status`).then((r) => r.data);
