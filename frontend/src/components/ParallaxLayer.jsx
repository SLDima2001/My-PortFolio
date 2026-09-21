import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ParallaxLayer — creates scroll-driven vertical parallax movement.
 * 
 * Props:
 *   depth     {number}  0–1  parallax intensity (0.1 = subtle, 0.5 = strong)
 *   children  {node}
 *   className {string}
 *   style     {object}
 */
export default function ParallaxLayer({ children, depth = 0.15, className, style }) {
  const ref = useRef(null);

  // Use the whole page scroll progress [0 → 1]
  const { scrollYProgress } = useScroll();

  // Map scroll 0–1 to vertical offset based on depth
  // Positive depth: element moves up slower than scroll (foreground feel)
  // Negative depth: element moves opposite (background feel)
  const yTranslate = useTransform(
    scrollYProgress,
    [0, 1],
    ['0px', `${-depth * 200}px`]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y: yTranslate, willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
