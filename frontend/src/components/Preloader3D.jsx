import React, { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceCapability } from '../hooks/useDeviceCapability';

/* ─────────────────────────────────────────────────────────────
   CANVAS-BASED 3D WIREFRAME SPHERE PRELOADER
   Uses raw WebGL / Canvas API as a safe fallback that works
   even before @react-three/fiber is resolved. Falls back to
   CSS spinner on low-spec / no-WebGL devices.
───────────────────────────────────────────────────────────── */

/** Generates wireframe sphere vertex pairs for line drawing */
function buildSphereWireframe(radius, latSegs, lonSegs) {
  const lines = [];
  for (let lat = 0; lat <= latSegs; lat++) {
    const theta = (lat * Math.PI) / latSegs;
    for (let lon = 0; lon < lonSegs; lon++) {
      const phi1 = (lon * 2 * Math.PI) / lonSegs;
      const phi2 = ((lon + 1) * 2 * Math.PI) / lonSegs;
      const x1 = radius * Math.sin(theta) * Math.cos(phi1);
      const y1 = radius * Math.cos(theta);
      const z1 = radius * Math.sin(theta) * Math.sin(phi1);
      const x2 = radius * Math.sin(theta) * Math.cos(phi2);
      const y2 = radius * Math.cos(theta);
      const z2 = radius * Math.sin(theta) * Math.sin(phi2);
      lines.push([x1, y1, z1, x2, y2, z2]);
    }
  }
  for (let lon = 0; lon < lonSegs; lon++) {
    const phi = (lon * 2 * Math.PI) / lonSegs;
    for (let lat = 0; lat < latSegs; lat++) {
      const theta1 = (lat * Math.PI) / latSegs;
      const theta2 = ((lat + 1) * Math.PI) / latSegs;
      const x1 = radius * Math.sin(theta1) * Math.cos(phi);
      const y1 = radius * Math.cos(theta1);
      const z1 = radius * Math.sin(theta1) * Math.sin(phi);
      const x2 = radius * Math.sin(theta2) * Math.cos(phi);
      const y2 = radius * Math.cos(theta2);
      const z2 = radius * Math.sin(theta2) * Math.sin(phi);
      lines.push([x1, y1, z1, x2, y2, z2]);
    }
  }
  return lines;
}

/** Simple 3D → 2D perspective projection */
function project(x, y, z, rotX, rotY, cx, cy, fov) {
  // Rotate Y
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;
  // Rotate X
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y1 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  // Perspective
  const scale = fov / (fov + z2);
  return { px: cx + x1 * scale, py: cy + y1 * scale, scale, z: z2 };
}

/* ─── CSS Spinner Fallback ─── */
function CSSPreloader({ progress, onSkip }) {
  return (
    <div className="preloader-overlay">
      <div className="css-spinner-ring" />
      <div className="preloader-progress-text">{Math.round(progress)}%</div>
      <div className="preloader-label">Loading...</div>
      {progress > 20 && (
        <div className="preloader-skip" onClick={onSkip}>Click to skip</div>
      )}
    </div>
  );
}

/* ─── Main Wireframe Canvas Preloader ─── */
function WireframePreloader({ progress, exploding, onCanvasReady }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    rotX: 0, rotY: 0,
    explodeParticles: [],
    explodeStarted: false,
    morphT: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(DPR, DPR);
    };
    resize();
    window.addEventListener('resize', resize);

    const CX = () => window.innerWidth / 2;
    const CY = () => window.innerHeight / 2;
    const RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.16;
    const FOV = 400;
    const wireLines = buildSphereWireframe(RADIUS, 12, 16);

    // Build explosion particles from sphere vertices
    const buildExplosionParticles = () => {
      const pts = [];
      for (let lat = 0; lat <= 12; lat++) {
        for (let lon = 0; lon < 16; lon++) {
          const theta = (lat * Math.PI) / 12;
          const phi = (lon * 2 * Math.PI) / 16;
          const x = RADIUS * Math.sin(theta) * Math.cos(phi);
          const y = RADIUS * Math.cos(theta);
          const z = RADIUS * Math.sin(theta) * Math.sin(phi);
          const speed = 2 + Math.random() * 4;
          const angle = Math.random() * Math.PI * 2;
          const vz = (Math.random() - 0.5) * 3;
          pts.push({
            x, y, z,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz,
            alpha: 1,
            size: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? '#00d4ff' : '#9333ea',
          });
        }
      }
      return pts;
    };

    let explodeParticles = [];
    let exploding = false;
    let explodeAlpha = 1;

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const s = stateRef.current;
      const cx = CX(), cy = CY();

      if (!exploding) {
        // ── Normal rotating sphere ──
        s.rotY += 0.012;
        s.rotX += 0.006;
        s.morphT += 0.04;
        const morphScale = 1 + 0.06 * Math.sin(s.morphT);

        ctx.save();
        // Outer glow
        const grad = ctx.createRadialGradient(cx, cy, RADIUS * 0.3 * morphScale, cx, cy, RADIUS * 1.4 * morphScale);
        grad.addColorStop(0, 'rgba(0,212,255,0.06)');
        grad.addColorStop(0.5, 'rgba(147,51,234,0.04)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, RADIUS * 1.4 * morphScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw wireframe lines
        for (const [x1, y1, z1, x2, y2, z2] of wireLines) {
          const p1 = project(x1 * morphScale, y1 * morphScale, z1 * morphScale, s.rotX, s.rotY, cx, cy, FOV);
          const p2 = project(x2 * morphScale, y2 * morphScale, z2 * morphScale, s.rotX, s.rotY, cx, cy, FOV);
          const depth = (p1.z + p2.z) / 2;
          const norm = (depth + RADIUS) / (2 * RADIUS);
          const alpha = 0.15 + norm * 0.65;
          const colorT = (p1.px - (cx - RADIUS)) / (2 * RADIUS);
          const r = Math.round(0 + colorT * 147);
          const g = Math.round(212 - colorT * 161);
          const b = Math.round(255 - colorT * 21);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8 + norm * 0.6;
          ctx.shadowBlur = norm > 0.7 ? 8 : 0;
          ctx.shadowColor = `rgba(0,212,255,${norm * 0.5})`;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Center core glow
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS * 0.35 * morphScale);
        coreGrad.addColorStop(0, 'rgba(0,212,255,0.25)');
        coreGrad.addColorStop(0.5, 'rgba(147,51,234,0.08)');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, RADIUS * 0.35 * morphScale, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // ── Explosion phase ──
        explodeAlpha = Math.max(0, explodeAlpha - 0.018);
        for (const p of explodeParticles) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.alpha *= 0.97;
          const proj = project(p.x, p.y, p.z, stateRef.current.rotX, stateRef.current.rotY, cx, cy, FOV);
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, p.size * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(')', `,${p.alpha * explodeAlpha})`).replace('rgb', 'rgba').replace('#00d4ff', 'rgba(0,212,255,').replace('#9333ea', 'rgba(147,51,234,');
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // Expose explode trigger via ref
    stateRef.current.triggerExplode = () => {
      exploding = true;
      explodeParticles = buildExplosionParticles();
    };

    onCanvasReady && onCanvasReady(stateRef.current);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Trigger explosion when exploding prop becomes true
  useEffect(() => {
    if (exploding && stateRef.current.triggerExplode) {
      stateRef.current.triggerExplode();
    }
  }, [exploding]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   PRELOADER ORCHESTRATOR
───────────────────────────────────────────────────────────── */
export default function Preloader3D({ onComplete }) {
  const { isLowSpec, canWebGL } = useDeviceCapability();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'exploding' | 'done'
  const [canSkip, setCanSkip] = useState(false);
  const progressRef = useRef(0);
  const completeCalledRef = useRef(false);

  // Allow skip after 1 second
  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Simulated progress ticker (accelerates toward 100%)
  useEffect(() => {
    if (phase !== 'loading') return;
    const tick = setInterval(() => {
      progressRef.current += Math.random() * 8 + 2;
      if (progressRef.current >= 100) {
        progressRef.current = 100;
        setProgress(100);
        clearInterval(tick);
        // Start explosion after short hold
        setTimeout(() => setPhase('exploding'), 300);
      } else {
        setProgress(Math.floor(progressRef.current));
      }
    }, 80);
    return () => clearInterval(tick);
  }, [phase]);

  // After explosion phase, call onComplete
  useEffect(() => {
    if (phase === 'exploding' && !completeCalledRef.current) {
      const t = setTimeout(() => {
        completeCalledRef.current = true;
        setPhase('done');
        onComplete?.();
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const handleSkip = useCallback(() => {
    if (!canSkip || completeCalledRef.current) return;
    completeCalledRef.current = true;
    setPhase('done');
    onComplete?.();
  }, [canSkip, onComplete]);

  if (phase === 'done') return null;

  if (isLowSpec || !canWebGL) {
    return (
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
          >
            <CSSPreloader progress={progress} onSkip={handleSkip} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: '#070710',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
          onClick={handleSkip}
        >
          {/* Canvas sphere */}
          <WireframePreloader
            progress={progress}
            exploding={phase === 'exploding'}
          />

          {/* Overlay UI */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', pointerEvents: 'none' }}>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px', fontWeight: 700, letterSpacing: '3px',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                marginBottom: '160px',
              }}
            >
              DIMALSHA PRAVEEN
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'exploding' ? 0 : 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{ marginTop: '160px' }}
            >
              {/* Percentage */}
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '56px', fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff 0%, #9333ea 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1, marginBottom: '20px',
              }}>
                {progress}%
              </div>

              {/* Track */}
              <div style={{
                width: '220px', height: '2px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px', margin: '0 auto',
              }}>
                <motion.div
                  style={{
                    height: '100%', borderRadius: '2px',
                    background: 'linear-gradient(90deg, #00d4ff, #9333ea)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.6)',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>

              {/* Label */}
              <div style={{
                marginTop: '16px', fontSize: '12px', fontWeight: 600,
                letterSpacing: '2px', color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
              }}>
                {phase === 'loading' ? 'Initializing...' : 'Launching...'}
              </div>

              {/* Skip hint */}
              {canSkip && phase === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: '28px', fontSize: '12px',
                    color: 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}
                >
                  Click anywhere to skip
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div style={{
            position: 'absolute', top: 32, left: 32,
            width: 40, height: 40,
            borderTop: '1.5px solid rgba(0,212,255,0.3)',
            borderLeft: '1.5px solid rgba(0,212,255,0.3)',
          }} />
          <div style={{
            position: 'absolute', bottom: 32, right: 32,
            width: 40, height: 40,
            borderBottom: '1.5px solid rgba(147,51,234,0.3)',
            borderRight: '1.5px solid rgba(147,51,234,0.3)',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
