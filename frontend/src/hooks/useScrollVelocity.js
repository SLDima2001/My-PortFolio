import { useEffect, useRef, useState } from 'react';

/**
 * Tracks scroll velocity and returns a normalized value between -1 and 1.
 * Positive = scrolling down, Negative = scrolling up.
 * Decays to 0 when scroll stops (exponential decay).
 */
export function useScrollVelocity(decayFactor = 0.9) {
  const velocityRef = useRef(0);
  const lastScrollY = useRef(window.scrollY);
  const lastTime = useRef(performance.now());
  const rafRef = useRef(null);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastTime.current, 1);
      const dy = window.scrollY - lastScrollY.current;
      // pixels per ms → normalize to [-1, 1] range (clamp at 3px/ms)
      velocityRef.current = Math.max(-1, Math.min(1, dy / (dt * 3)));
      lastScrollY.current = window.scrollY;
      lastTime.current = now;
    };

    const tick = () => {
      // Decay velocity
      velocityRef.current *= decayFactor;
      if (Math.abs(velocityRef.current) < 0.001) velocityRef.current = 0;
      setVelocity(velocityRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [decayFactor]);

  return velocity;
}
