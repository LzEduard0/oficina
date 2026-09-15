export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string | null;
  cpfCnpj?: string | null;
  endereco?: string | null;
  criadoEm: string;
  veiculos?: Veiculo[];
}

export interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number | null;
  cor?: string | null;
  clienteId: number;
  cliente?: Cliente;
  criadoEm: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
  telefone?: string | null;
  email?: string | null;
  salario?: number | null;
  ativo: boolean;
  criadoEm: string;
}

export type TipoItem = 'SERVICO' | 'PECA';

export interface ItemOrdemServico {
  id: number;
  tipo: TipoItem;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export type StatusOrdem =
  | 'ABERTA'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_PECA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export interface OrdemServico {
  id: number;
  clienteId: number;
  cliente: Cliente;
  veiculoId: number;
  veiculo: Veiculo;
  funcionarioId?: number | null;
  funcionario?: Funcionario | null;
  descricao?: string | null;
  status: StatusOrdem;
  km?: number | null;
  dataAbertura: string;
  dataConclusao?: string | null;
  valorTotal: number;
  itens: ItemOrdemServico[];
}

export interface FaturamentoPeriodo {
  total: number;
  quantidade: number;
}

export interface FaturamentoResumo {
  dia: FaturamentoPeriodo;
  mes: FaturamentoPeriodo;
  ano: FaturamentoPeriodo;
  ordensAbertas: number;
  ordensConcluidas: number;
}

export interface FaturamentoAno extends FaturamentoPeriodo {
  periodo: 'ano';
  ano: number;
  meses: ({ mes: number } & FaturamentoPeriodo)[];
}
