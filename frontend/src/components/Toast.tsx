import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Toast {
  id: number;
  tipo: 'sucesso' | 'erro';
  mensagem: string;
}

const ToastContext = createContext<{
  sucesso: (msg: string) => void;
  erro: (msg: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const contador = useRef(0);

  const remover = useCallback((id: number) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }, []);

  const adicionar = useCallback(
    (tipo: Toast['tipo'], mensagem: string) => {
      const id = ++contador.current;
      setToasts((atual) => [...atual, { id, tipo, mensagem }]);
      setTimeout(() => remover(id), 4000);
    },
    [remover]
  );

  return (
    <ToastContext.Provider
      value={{
        sucesso: (msg) => adicionar('sucesso', msg),
        erro: (msg) => adicionar('erro', msg),
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onFechar={() => remover(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onFechar }: { toast: Toast; onFechar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const aoMontar = useCallback((el: HTMLDivElement | null) => {
    ref.current = el;
    if (el) {
      gsap.fromTo(el, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.35, ease: 'back.out(1.7)' });
    }
  }, []);

  return (
    <div
      ref={aoMontar}
      onClick={onFechar}
      className="flex max-w-sm cursor-pointer items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      {toast.tipo === 'sucesso' ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
      )}
      <span>{toast.mensagem}</span>
    </div>
  );
}
