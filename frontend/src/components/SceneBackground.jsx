import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useDeviceCapability } from '../hooks/useDeviceCapability';

/* ─────────────────────────────────────────────────────────────
   FLOATING 3D GEOMETRIC WIREFRAME MESHES (Cyberpunk Shapes)
   Planted at different 3D depths along the scroll path
───────────────────────────────────────────────────────────── */
function FloatingMesh({ position, shape = 'icosahedron', color = '#00d4ff', rotSpeed = [0.005, 0.008] }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += rotSpeed[0];
    meshRef.current.rotation.y += rotSpeed[1];
  });

  return (
    <mesh ref={meshRef} position={position}>
      {shape === 'icosahedron' && <icosahedronGeometry args={[1.2, 1]} />}
      {shape === 'octahedron' && <octahedronGeometry args={[1.0, 0]} />}
      {shape === 'torus' && <torusGeometry args={[1.1, 0.3, 16, 32]} />}
      {shape === 'dodecahedron' && <dodecahedronGeometry args={[1.0, 0]} />}
      <meshStandardMaterial
        color={color}
        wireframe
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   MULTI-DEPTH PARTICLE FIELD
   5 distinct layers moving at different parallax speeds
───────────────────────────────────────────────────────────── */
function ParticleLayer({ count = 100, z = 0, color = '#00d4ff', size = 0.035, spreadX = 35, spreadY = 25 }) {
  const pointsRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spreadX;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 4;
      vel.push({
        vx: (Math.random() - 0.5) * 0.003,
        vy: (Math.random() - 0.5) * 0.003,
      });
    }
    return { positions: pos, velocities: vel };
  }, [count, z, spreadX, spreadY]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i].vx;
      pos[i * 3 + 1] += velocities[i].vy;
      // Wrap around bounds
      const halfX = spreadX / 2;
      const halfY = spreadY / 2;
      if (pos[i * 3] > halfX) pos[i * 3] = -halfX;
      if (pos[i * 3] < -halfX) pos[i * 3] = halfX;
      if (pos[i * 3 + 1] > halfY) pos[i * 3 + 1] = -halfY;
      if (pos[i * 3 + 1] < -halfY) pos[i * 3 + 1] = halfY;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL & MOUSE CAMERA TRACKER
   Smoothly lerps camera position based on window scroll progress
   and subtle cursor position (cinematic parallax tilt)
───────────────────────────────────────────────────────────── */
function CinematicCamera({ isReady = true }) {
  const { camera } = useThree();
  const targetRef = useRef({
    scrollProgress: 0,
    mouseX: 0,
    mouseY: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetRef.current.scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const handleMouseMove = (e) => {
      targetRef.current.mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      targetRef.current.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((_, delta) => {
    const p = targetRef.current.scrollProgress;
    const mx = targetRef.current.mouseX;
    const my = targetRef.current.mouseY;

    // Target Z: flies from 8.0 down to 2.5 through the particle tunnel
    const targetZ = 8.0 - p * 5.5;
    // Target Y: drifts downward with scroll
    const targetY = -p * 3.0 + my * -0.3;
    // Target X: responds smoothly to mouse
    const targetX = mx * 0.8 + Math.sin(p * Math.PI) * 0.5;

    // Damped interpolation for buttery 60fps feel
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);

    // Subtle rotational camera tilts
    const targetRotX = p * 0.12 - my * 0.05;
    const targetRotY = Math.sin(p * Math.PI) * 0.15 + mx * 0.08;
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, targetRotX, 3.5, delta);
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, targetRotY, 3.5, delta);

    camera.updateProjectionMatrix();
  });

  return null;
}

/* ─────────────────────────────────────────────────────────────
   DYNAMIC LIGHTS (Cyan + Purple Neon Glow)
───────────────────────────────────────────────────────────── */
function NeonLights() {
  const cyanRef = useRef();
  const purpleRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (cyanRef.current) {
      cyanRef.current.position.x = Math.sin(t * 0.6) * 10;
      cyanRef.current.position.y = Math.cos(t * 0.4) * 6;
      cyanRef.current.position.z = Math.sin(t * 0.3) * 4;
    }
    if (purpleRef.current) {
      purpleRef.current.position.x = Math.cos(t * 0.5) * 10;
      purpleRef.current.position.y = Math.sin(t * 0.7) * 6;
      purpleRef.current.position.z = Math.cos(t * 0.4) * 4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight ref={cyanRef} color="#00d4ff" intensity={3.5} distance={25} />
      <pointLight ref={purpleRef} color="#9333ea" intensity={3.0} distance={25} />
      <directionalLight position={[0, 10, 5]} intensity={0.3} color="#ffffff" />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   CANVAS 2D ULTRA-FAST FALLBACK (for low-spec / mobile / no-WebGL)
───────────────────────────────────────────────────────────── */
function Canvas2DFallback() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const PARTICLE_COUNT = 70;
    const CONNECTION_DISTANCE = 130;
    const REPEL_RADIUS = 110;
    const palette = ['rgba(0,212,255,', 'rgba(147,51,234,', 'rgba(59,130,246,'];

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : (Math.random() > 0.5 ? -10 : H + 10);
        this.size = Math.random() * 2.2 + 0.6;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }
      update() {
        const mx = mouseRef.current.x, my = mouseRef.current.y;
        const dx = this.x - mx, dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          this.x += (dx / dist) * force * 3;
          this.y += (dy / dist) * force * 3;
        } else {
          this.x += (this.baseX - this.x) * 0.03;
          this.y += (this.baseY - this.y) * 0.03;
        }
        this.baseX += this.vx;
        this.baseY += this.vy;
        if (this.baseX < -20) this.baseX = W + 20;
        if (this.baseX > W + 20) this.baseX = -20;
        if (this.baseY < -20) this.baseY = H + 20;
        if (this.baseY > H + 20) this.baseY = -20;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    let particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / CONNECTION_DISTANCE) * 0.14})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw();
      }
      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ERROR BOUNDARY FOR WEBGL CRASH SAFETY
───────────────────────────────────────────────────────────── */
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('WebGL scene error handled gracefully:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORTED SCENE BACKGROUND
───────────────────────────────────────────────────────────── */
export default function SceneBackground() {
  const { isLowSpec, isMobile, pixelRatio, canWebGL } = useDeviceCapability();

  // If low spec, mobile, or WebGL unsupported, use the fast Canvas 2D fallback
  if (isLowSpec || isMobile || !canWebGL) {
    return <Canvas2DFallback />;
  }

  return (
    <WebGLErrorBoundary fallback={<Canvas2DFallback />}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 100 }}
          dpr={Math.min(pixelRatio, 1.5)}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <CinematicCamera />
            <NeonLights />

            {/* Depth-layered 3D Particle Fields */}
            <ParticleLayer count={70}  z={-26} color="#2563eb" size={0.03} spreadX={40} spreadY={30} />
            <ParticleLayer count={90}  z={-16} color="#9333ea" size={0.035} spreadX={35} spreadY={25} />
            <ParticleLayer count={110} z={-7}  color="#00d4ff" size={0.045} spreadX={30} spreadY={20} />
            <ParticleLayer count={50}  z={1}   color="#38bdf8" size={0.025} spreadX={20} spreadY={15} />

            {/* Floating 3D Geometric Wireframe Meshes in Cyberpunk Accent Colors */}
            <FloatingMesh position={[-5, 2, -4]} shape="icosahedron" color="#00d4ff" rotSpeed={[0.006, 0.009]} />
            <FloatingMesh position={[6, -3, -8]} shape="torus" color="#9333ea" rotSpeed={[0.008, 0.005]} />
            <FloatingMesh position={[-4, -7, -12]} shape="octahedron" color="#38bdf8" rotSpeed={[0.005, 0.007]} />
            <FloatingMesh position={[5, -11, -16]} shape="dodecahedron" color="#a855f7" rotSpeed={[0.007, 0.006]} />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
