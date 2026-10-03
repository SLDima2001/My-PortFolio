import React from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';

/**
 * ScrollVelocity — wraps children and applies a subtle skewY transform
 * that scales with scroll speed using hardware-accelerated Framer Motion values.
 * Zero React re-renders during scroll!
 */
export default function ScrollVelocity({ children, maxSkew = 2.5, style, className }) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Smooth the scroll velocity
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300,
    mass: 0.5
  });

  // Map scroll velocity (px/s) to skew angle in degrees
  const skewY = useTransform(smoothVelocity, [-3000, 0, 3000], [-maxSkew, 0, maxSkew]);

  return (
    <motion.div
      className={className}
      style={{
        ...style,
        skewY,
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
}
