import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantes: Record<Variante, string> = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)]',
  secondary:
    'bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:brightness-95',
  ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]',
  danger: 'bg-[var(--color-danger)] text-white hover:brightness-110',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variante }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="mb-3 block text-sm">
      <span className="mb-1.5 block font-medium text-[var(--color-text)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-text-muted)]">{hint}</span>}
    </label>
  );
}

const inputClasses =
  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20';
const inputStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClasses} ${props.className ?? ''}`} style={inputStyle} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClasses} ${props.className ?? ''}`} style={inputStyle} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClasses} ${props.className ?? ''}`} style={inputStyle} />;
}

export function LabelPill(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} />;
}

const badgeCores: Record<string, string> = {
  ABERTA: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  EM_ANDAMENTO: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  AGUARDANDO_PECA: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  CONCLUIDA: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  CANCELADA: 'bg-gray-500/15 text-gray-500',
  PENDENTE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  APROVADO: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  RECUSADO: 'bg-red-500/15 text-red-600 dark:text-red-400',
  CANCELADO: 'bg-gray-500/15 text-gray-500',
};

const badgeTextos: Record<string, string> = {
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_PECA: 'Aguardando peça',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  CANCELADO: 'Cancelado',
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        badgeCores[status] ?? 'bg-gray-500/15 text-gray-500'
      }`}
    >
      {badgeTextos[status] ?? status}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--color-border)' }}>
      <p className="text-sm font-medium text-[var(--color-text)]">{titulo}</p>
      {descricao && <p className="mt-1 max-w-xs text-sm text-[var(--color-text-muted)]">{descricao}</p>}
    </div>
  );
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}
