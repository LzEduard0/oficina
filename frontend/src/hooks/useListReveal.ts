import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

/** Anima em cascata os filhos diretos do container sempre que `deps` mudar. */
export function useListReveal<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const itens = Array.from(el.children);
    if (itens.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        itens,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.05 }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
