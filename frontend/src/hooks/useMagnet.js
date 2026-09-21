import { useRef, useCallback } from 'react';
import { useSpring } from 'framer-motion';

/**
 * Magnetic cursor pull hook.
 * Returns { x, y } spring-animated offsets and event handlers.
 * 
 * Usage:
 *   const { x, y, handlers } = useMagnet({ strength: 0.4 });
 *   <motion.div style={{ x, y }} {...handlers}>...</motion.div>
 */
export function useMagnet({ strength = 0.35, radius = 120 } = {}) {
  const ref = useRef(null);

  const springConfig = { stiffness: 180, damping: 18, mass: 0.6 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius) {
      x.set(dx * strength);
      y.set(dy * strength);
    }
  }, [strength, radius, x, y]);

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, ref, handlers: { onMouseMove, onMouseLeave } };
}
