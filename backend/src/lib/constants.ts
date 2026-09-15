export const STATUS_ORDEM = [
  "ABERTA",
  "EM_ANDAMENTO",
  "AGUARDANDO_PECA",
  "CONCLUIDA",
  "CANCELADA",
] as const;
export type StatusOrdem = (typeof STATUS_ORDEM)[number];

export const TIPOS_ITEM = ["SERVICO", "PECA"] as const;
export type TipoItem = (typeof TIPOS_ITEM)[number];
