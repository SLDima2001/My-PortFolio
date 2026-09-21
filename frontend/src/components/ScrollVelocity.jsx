import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useScrollVelocity } from '../hooks/useScrollVelocity';

/**
 * ScrollVelocity — wraps children and applies a subtle skewY transform
 * that scales with scroll speed, creating a momentum/"rubber band" feel.
 * 
 * Props:
 *   maxSkew   {number}  maximum skew in degrees (default 3)
 *   children  {node}
 *   style     {object}
 *   className {string}
 */
export default function ScrollVelocity({ children, maxSkew = 3, style, className }) {
  const velocity = useScrollVelocity(0.88);

  // Spring-smooth the skew value
  const skewSpring = useSpring(0, { stiffness: 80, damping: 20, mass: 0.5 });

  // Update spring target based on velocity
  React.useEffect(() => {
    skewSpring.set(velocity * maxSkew);
  }, [velocity, maxSkew, skewSpring]);

  return (
    <motion.div
      className={className}
      style={{
        ...style,
        skewY: skewSpring,
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
}
