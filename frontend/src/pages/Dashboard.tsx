import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { CalendarDays, CalendarRange, ClipboardList, DollarSign, ListChecks } from 'lucide-react';
import { buscarFaturamentoAno, buscarResumoFaturamento } from '../api/client';
import type { FaturamentoAno, FaturamentoResumo } from '../api/types';
import { Card, formatarMoeda } from '../components/ui';
import { useCountUp } from '../hooks/useCountUp';
import { useToast } from '../components/Toast';

const NOMES_MES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function Dashboard() {
  const [resumo, setResumo] = useState<FaturamentoResumo | null>(null);
  const [ano, setAno] = useState<FaturamentoAno | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { erro } = useToast();

  useEffect(() => {
    const anoAtual = new Date().getFullYear();
    Promise.all([buscarResumoFaturamento(), buscarFaturamentoAno(anoAtual)])
      .then(([r, a]) => {
        setResumo(r);
        setAno(a);
      })
      .catch((e) => erro(e.message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (carregando) {
    return <p className="text-sm text-[var(--color-text-muted)]">Carregando painel...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Visão geral</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Acompanhe o faturamento e as ordens de serviço da oficina.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoFaturamento
          titulo="Hoje"
          valor={resumo?.dia.total ?? 0}
          quantidade={resumo?.dia.quantidade ?? 0}
          icone={CalendarDays}
        />
        <CartaoFaturamento
          titulo="Este mês"
          valor={resumo?.mes.total ?? 0}
          quantidade={resumo?.mes.quantidade ?? 0}
          icone={CalendarRange}
        />
        <CartaoFaturamento
          titulo="Este ano"
          valor={resumo?.ano.total ?? 0}
          quantidade={resumo?.ano.quantidade ?? 0}
          icone={DollarSign}
        />
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Ordens de serviço</p>
              <p className="mt-2 text-2xl font-semibold">{resumo?.ordensAbertas ?? 0} abertas</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {resumo?.ordensConcluidas ?? 0} concluídas ao todo
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
              <ClipboardList size={20} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-semibold">Faturamento mensal ({ano?.ano})</h2>
        </div>
        {ano && <GraficoMensal meses={ano.meses} />}
      </Card>
    </div>
  );
}

function CartaoFaturamento({
  titulo,
  valor,
  quantidade,
  icone: Icone,
}: {
  titulo: string;
  valor: number;
  quantidade: number;
  icone: typeof DollarSign;
}) {
  const ref = useCountUp(valor, formatarMoeda);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{titulo}</p>
          <p className="mt-2 text-2xl font-semibold">
            <span ref={ref}>{formatarMoeda(0)}</span>
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{quantidade} ordem(ns) concluída(s)</p>
        </div>
        <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
          <Icone size={20} />
        </div>
      </div>
    </Card>
  );
}

function GraficoMensal({ meses }: { meses: FaturamentoAno['meses'] }) {
  const maior = Math.max(1, ...meses.map((m) => m.total));

  useEffect(() => {
    const barras = document.querySelectorAll<HTMLElement>('[data-barra-mes]');
    gsap.fromTo(
      barras,
      { scaleY: 0 },
      { scaleY: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04, transformOrigin: 'bottom' }
    );
  }, [meses]);

  return (
    <div className="flex h-48 items-end gap-2 sm:gap-3">
      {meses.map((m) => (
        <div key={m.mes} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-36 w-full items-end">
            <div
              data-barra-mes
              title={formatarMoeda(m.total)}
              className="w-full rounded-t-md bg-[var(--color-primary)]"
              style={{ height: `${Math.max(4, (m.total / maior) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] sm:text-xs">{NOMES_MES[m.mes - 1]}</span>
        </div>
      ))}
    </div>
  );
}
