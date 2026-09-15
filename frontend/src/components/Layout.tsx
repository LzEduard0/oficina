import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import {
  Car,
  LayoutDashboard,
  Menu,
  Receipt,
  Users,
  UserSquare2,
  Wrench,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icone: LayoutDashboard, fim: true },
  { to: '/clientes', label: 'Clientes', icone: Users },
  { to: '/veiculos', label: 'Veículos', icone: Car },
  { to: '/funcionarios', label: 'Funcionários', icone: UserSquare2 },
  { to: '/ordens', label: 'Ordens de Serviço', icone: Wrench },
];

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    if (menuAberto) {
      backdrop.style.pointerEvents = 'auto';
      gsap.to(backdrop, { opacity: 1, duration: 0.2 });
      gsap.to(drawer, { x: 0, duration: 0.35, ease: 'power3.out' });
    } else {
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (backdrop) backdrop.style.pointerEvents = 'none';
        },
      });
      gsap.to(drawer, { x: '-100%', duration: 0.3, ease: 'power3.in' });
    }
  }, [menuAberto]);

  useEffect(() => {
    const el = conteudoRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [location.pathname]);

  return (
    <div className="flex h-screen" style={{ background: 'var(--color-bg)' }}>
      <aside
        className="hidden w-64 shrink-0 flex-col border-r px-4 py-6 md:flex"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <Marca />
        <Nav />
      </aside>

      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 bg-black/50 opacity-0 md:hidden"
        style={{ pointerEvents: 'none' }}
        onClick={() => setMenuAberto(false)}
      />
      <aside
        ref={drawerRef}
        className="fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r px-4 py-6 md:hidden"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="mb-2 flex items-center justify-between">
          <Marca />
          <button
            onClick={() => setMenuAberto(false)}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <Nav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 border-b px-4 py-3 md:hidden"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <button
            onClick={() => setMenuAberto(true)}
            className="rounded-lg p-2 text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold">Oficina Mecânica</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div ref={conteudoRef} className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Marca() {
  return (
    <div className="mb-6 flex items-center gap-2 px-1">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
        <Wrench size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">Oficina</p>
        <p className="text-xs leading-tight text-[var(--color-text-muted)]">Gestão completa</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map(({ to, label, icone: Icone, fim }) => (
        <NavLink
          key={to}
          to={to}
          end={fim}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]'
            }`
          }
        >
          <Icone size={18} />
          {label}
        </NavLink>
      ))}
      <div className="mt-auto pt-4 text-xs text-[var(--color-text-muted)]">
        <Receipt size={14} className="mb-1 inline" /> v1.0.0
      </div>
    </nav>
  );
}
