import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useCountUp(value: number, formatar: (n: number) => string) {
  const ref = useRef<HTMLSpanElement>(null);
  const anterior = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { valor: anterior.current };
    const tween = gsap.to(obj, {
      valor: value,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = formatar(obj.valor);
      },
    });
    anterior.current = value;
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return ref;
}
