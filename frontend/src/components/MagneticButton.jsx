import React from 'react';
import { motion } from 'framer-motion';
import { useMagnet } from '../hooks/useMagnet';

/**
 * MagneticButton — wraps any child element with magnetic cursor pull effect.
 * 
 * Props:
 *   strength  {number}  0–1 pull strength (default 0.35)
 *   radius    {number}  px radius of effect zone (default 120)
 *   className {string}  pass-through class name
 *   style     {object}  pass-through style
 */
export default function MagneticButton({
  children,
  strength = 0.35,
  radius = 120,
  className,
  style,
  ...rest
}) {
  const { x, y, ref, handlers } = useMagnet({ strength, radius });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', ...style, x, y }}
      {...handlers}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
