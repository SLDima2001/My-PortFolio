import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import {
  FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaCode,
  FaExternalLinkAlt, FaReact, FaNodeJs, FaFigma, FaDatabase,
  FaArrowRight, FaCheckCircle, FaMobile, FaBars, FaTimes,
  FaImages, FaChevronRight
} from "react-icons/fa";
import { SiMongodb, SiExpress, SiTailwindcss, SiJavascript, SiTypescript, SiNextdotjs, SiPython } from "react-icons/si";
import Preloader3D from "../src/components/Preloader3D";
import SceneBackground from "../src/components/SceneBackground";
import MagneticButton from "../src/components/MagneticButton";
import ParallaxLayer from "../src/components/ParallaxLayer";
import ScrollVelocity from "../src/components/ScrollVelocity";

/* ─────────────────────────────────────────────
   CANVAS PARTICLE BACKGROUND
───────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const PARTICLE_COUNT = window.innerWidth < 768 ? 60 : 130;
    const CONNECTION_DISTANCE = 140;
    const REPEL_RADIUS = 120;
    const REPEL_STRENGTH = 3.5;

    const palette = ["rgba(0,212,255,", "rgba(147,51,234,", "rgba(59,130,246,"];

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : (Math.random() > 0.5 ? -10 : H + 10);
        this.size = Math.random() * 2.2 + 0.6;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }
      update(t) {
        const mx = mouseRef.current.x, my = mouseRef.current.y;
        const dx = this.x - mx, dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          this.x += (dx / dist) * force * REPEL_STRENGTH;
          this.y += (dy / dist) * force * REPEL_STRENGTH;
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
        this.currentAlpha = this.alpha * (0.7 + 0.3 * Math.sin(t * this.pulseSpeed + this.pulseOffset));
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.currentAlpha + ")";
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color + "0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t++;
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${opacity})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
        particles[i].update(t);
        particles[i].draw();
      }
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    };
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   3D TILT CARD WRAPPER
───────────────────────────────────────────── */
function TiltCard({ children, className, style, onClick, intensity = 12 }) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -intensity;
    const rotY = ((x - cx) / cx) * intensity;
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
  }, [intensity]);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: "transform 0.15s ease-out", willChange: "transform" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL-REVEAL WRAPPER
───────────────────────────────────────────── */
function Reveal({ children, delay = 0, y = 40, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   DEFAULT PROJECT DATA (0ms Initial Render)
───────────────────────────────────────────── */
const DEFAULT_PROJECTS = [
  {
    _id: "6a65f740831d4c30fd8f352d",
    title: "Jayantha Engineering - Inventory & Dedicated Invoice Management System",
    description: "A custom, full-stack enterprise web application built for Jayantha Engineering & Fabricators Pvt Ltd to streamline stock tracking and automated invoice generation.",
    images: ["https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/photo123.png?raw=true"],
    tech: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
    liveUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    _id: "6a65f740831d4c30fd8f352e",
    title: "Dynamic Multi-Tenant Invoice Engine & Inventory Management System",
    description: "Multi-tenant inventory management system with real-time stock monitoring, custom PDF invoice generation, and analytical dashboards.",
    images: ["https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/WebApp.png?raw=true"],
    tech: ["React", "Node.js", "Express", "MongoDB"],
    liveUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    _id: "6a65f740831d4c30fd8f352f",
    title: "Sinhala Learning App",
    description: "Interactive mobile & web application designed to teach Sinhala language fundamentals through gamified lessons and interactive quizzes.",
    images: ["https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/MobileApp.png?raw=true"],
    tech: ["React Native", "React", "Node.js", "MongoDB"],
    liveUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    _id: "6a65f740831d4c30fd8f3530",
    title: "Lahiru Tours – Destination Management Web Platform",
    description: "A comprehensive tour booking platform featuring tailor-made travel experiences with real-time booking system, payment integration, and dynamic itinerary management.",
    images: ["https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/photo123.png?raw=true"],
    tech: ["React", "Node.js", "MongoDB", "Express"],
    liveUrl: "https://lahirutours.co.uk/",
    githubUrl: "#",
    featured: true
  }
];

/* ─────────────────────────────────────────────
   OPTIMIZED PROJECT IMAGE DECODER
───────────────────────────────────────────── */
function ProjectImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!src) return;
    if (typeof src === 'string' && src.startsWith('data:image/')) {
      try {
        const parts = src.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        setObjectUrl(src);
      }
    } else {
      setObjectUrl(src);
    }
  }, [src]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {!loaded && !error && (
        <div className="shimmer" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', zIndex: 1 }} />
      )}
      <img
        src={objectUrl || src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PORTFOLIO COMPONENT
───────────────────────────────────────────── */
function Portfolio() {
  const sectionRefs = useRef([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCopied, setIsCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [profileImages, setProfileImages] = useState([]);
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const [preloaderDone, setPreloaderDone] = useState(false);

  /* ── Existing event listeners (unchanged) ── */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = `${e.clientX}px`;
        cursorRingRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  /* ── CV Download (unchanged) ── */
  const handleDownloadCV = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';
    try {
      window.open(`${apiUrl}/cv/download`, '_blank');
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV. Please try again later.');
    }
  };

  const myemail = "dimalshapraveen2001@gmail.com";

  /* ── Email Copy (unchanged) ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(myemail).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  /* ── Contact Form Submit (unchanged) ── */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const subject = event.target.querySelector('input[placeholder="Subject"]')?.value || "General Inquiry";
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';
    try {
      await fetch(`${apiUrl}/send-email/form1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      setName(''); setEmail(''); setPhone(''); setMessage('');
      alert('✅ Message sent successfully! I will get back to you soon.');
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Error sending message. Please try again.');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  };

  /* ── Intersection Observer (unchanged) ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => { sectionRefs.current.forEach((ref) => ref && observer.unobserve(ref)); };
  }, []);

  /* ── Nav Click (unchanged) ── */
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
  };

  /* ── Skills Data (unchanged) ── */
  const skills = [
    { name: "React", icon: <FaReact />, color: "#61DAFB" },
    { name: "React Native", icon: <FaMobile />, color: "#61DAFB" },
    { name: "Node.js", icon: <FaNodeJs />, color: "#339933" },
    { name: "Python", icon: <SiPython />, color: "#3776AB" },
    { name: ".NET", icon: "⚡", color: "#512BD4" },
    { name: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
    { name: "Express", icon: <SiExpress />, color: "#ffffff" },
    { name: "JavaScript", icon: <SiJavascript />, color: "#F7DF1E" },
    { name: "TypeScript", icon: <SiTypescript />, color: "#3178C6" },
    { name: "Tailwind", icon: <SiTailwindcss />, color: "#06B6D4" },
    { name: "Figma", icon: <FaFigma />, color: "#F24E1E" },
  ];

  const [projects, setProjects] = useState(() => {
    try {
      const cached = sessionStorage.getItem('portfolio_projects_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PROJECTS;
  });
  const [loadingProjects, setLoadingProjects] = useState(false);

  /* ── Optimized Data Fetching with Cache & Summary Mode ── */
  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');
      try {
        const pResponse = await fetch(`${apiUrl}/projects?summary=true`);
        if (pResponse.ok) {
          const pData = await pResponse.json();
          const finalProjects = pData.length > 0 ? pData : DEFAULT_PROJECTS;
          setProjects(finalProjects);
          try {
            sessionStorage.setItem('portfolio_projects_cache', JSON.stringify(finalProjects));
          } catch (e) {}
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingProjects(false);
      }

      try {
        const profResponse = await fetch(`${apiUrl}/profile`);
        if (profResponse.ok) {
          const profData = await profResponse.json();
          setProfileImages(profData.images || []);
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
      }
    };
    fetchData();
  }, []);

  /* ── Lightbox with On-Demand Gallery Image Loading ── */
  const openLightbox = async (images, index = 0, projectId = null) => {
    let imagesToUse = images || [];
    if (projectId && imagesToUse.length <= 1) {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');
      try {
        const res = await fetch(`${apiUrl}/projects/${projectId}`);
        if (res.ok) {
          const fullProj = await res.json();
          if (fullProj.images && fullProj.images.length > 0) {
            imagesToUse = fullProj.images;
          }
        }
      } catch (err) {
        console.error("Error fetching full project details for lightbox:", err);
      }
    }
    setLightbox({ isOpen: true, images: imagesToUse, currentIndex: index });
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
    document.body.style.overflow = 'auto';
  };
  const nextImage = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));
  };

  /* ── Hero animation variants ── */
  const heroStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } }
  };
  const heroItem = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } }
  };

  /* ── Navbar animation ── */
  const navVariants = {
    hidden: { y: -80, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const NAV_LINKS = ['about', 'skills', 'projects', 'contact'];

  return (
    <div className="portfolio-app">
      {/* ─── Custom Cursor (desktop only) ─── */}
      {!isMobile && (
        <>
          <div ref={cursorDotRef} className="cursor-dot" />
          <div ref={cursorRingRef} className="cursor-ring" />
        </>
      )}

      {/* ─── Creative 3D Preloader Experience ─── */}
      <Preloader3D onComplete={() => setPreloaderDone(true)} />

      {/* ─── Immersive 3D WebGL Background Scene ─── */}
      <SceneBackground />

      {/* ─── Gradient Orbs ─── */}
      <div className="animated-background" aria-hidden="true">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      {/* ─── Navbar ─── */}
      <motion.header
        className={`header ${scrollY > 50 ? 'scrolled' : ''}`}
        variants={navVariants}
        initial="hidden"
        animate="show"
      >
        <div className="header-content">
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="logo-text">Dimalsha</span>
            <span className="logo-dot">.</span>
          </motion.div>

          <nav className="nav">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link}`}
                className={`nav-link ${activeSection === link ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, `#${link}`)}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </a>
            ))}
          </nav>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </motion.header>

      {/* ─── Mobile Menu ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu open"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link}`}
                className={`mobile-nav-link ${activeSection === link ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, `#${link}`)}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="main-content">

        {/* ════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════ */}
        <section
          className="hero-section"
          id="about"
          ref={(el) => (sectionRefs.current[0] = el)}
        >
          <motion.div
            className="hero-content"
            variants={heroStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div className="hero-label floating" variants={heroItem}>
              <span className="hero-label-dot" />
              Full Stack Developer
            </motion.div>

            <motion.h1 className="hero-title" variants={heroItem}>
              Hi, I'm <span className="gradient-text">Dimalsha</span><br />
              Building Digital<br />
              <span className="hero-title-accent">Experiences</span>
            </motion.h1>

            <motion.p className="hero-subtitle" variants={heroItem}>
              I'm a passionate full-stack developer and UI/UX designer specializing in creating modern,
              scalable web applications with beautiful user experiences. With expertise in React, Node.js,
              and modern design tools, I transform ideas into reality.
            </motion.p>

            <motion.div className="cta-buttons" variants={heroItem}>
              <MagneticButton strength={0.25}>
                <motion.button
                  className="btn-primary"
                  onClick={handleDownloadCV}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaDownload /> Download CV
                </motion.button>
              </MagneticButton>
              <MagneticButton strength={0.25}>
                <motion.button
                  className="btn-secondary"
                  onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get In Touch
                </motion.button>
              </MagneticButton>
            </motion.div>

            <motion.div className="stats-grid" variants={heroItem}>
              {[
                { num: "6+", label: "Projects Completed" },
                { num: "2+", label: "Years Experience" },
                { num: "100%", label: "Client Satisfaction" },
              ].map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-number">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <ParallaxLayer depth={0.18} className="hero-parallax-wrapper">
            <motion.div
              className="hero-image-container"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
            <div
              className="image-wrapper"
              onClick={() => profileImages.length > 0 && openLightbox(profileImages)}
              style={{ cursor: profileImages.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="image-glow-ring" />
              <img
                src={profileImages.length > 0 ? profileImages[0] : "https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/My.jpg?raw=true"}
                alt="Dimalsha Praveen"
                className="hero-image"
              />
              {profileImages.length > 1 && (
                <div className="image-count-badge">
                  <FaImages /> +{profileImages.length - 1}
                </div>
              )}
            </div>
          </motion.div>
          </ParallaxLayer>
        </section>

        {/* ════════════════════════════════════
            ABOUT SECTION
        ════════════════════════════════════ */}
        <section
          className="about-section section"
          ref={(el) => (sectionRefs.current[1] = el)}
        >
          <div className="about-content">
            <Reveal className="about-text">
              <h2 className="section-title">About Me</h2>
              <p className="about-paragraph">
                I'm a versatile full-stack developer with a passion for creating seamless digital experiences.
                My journey in software development has equipped me with a diverse skill set spanning both web
                and mobile platforms, allowing me to build comprehensive solutions from concept to deployment.
              </p>
              <p className="about-paragraph">
                With extensive experience in React Native, I've developed cross-platform mobile applications
                that deliver native-like performance and user experiences. My backend expertise in Python enables
                me to build robust, scalable server-side applications and RESTful APIs that power modern applications.
              </p>
              <p className="about-paragraph">
                I believe in writing clean, maintainable code and creating intuitive user interfaces that not only
                look great but also provide exceptional functionality. Whether it's building a responsive web application,
                developing a mobile app, or designing a comprehensive full-stack solution, I approach every project
                with dedication and attention to detail.
              </p>
            </Reveal>

            <div className="expertise-grid">
              {[
                { icon: <FaMobile />, title: "Mobile Development", desc: "Specialized in React Native for building cross-platform mobile applications with smooth animations, offline capabilities, and native integrations." },
                { icon: <SiPython />, title: "Backend with Python", desc: "Proficient in Python for backend development, creating efficient APIs, data processing pipelines, and integrating with databases and third-party services." },
                { icon: <FaReact />, title: "Full-Stack Development", desc: "End-to-end application development using modern JavaScript frameworks, Node.js, and database technologies to deliver complete, production-ready solutions." },
              ].map((card, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <TiltCard className="expertise-card" intensity={8}>
                    <div className="expertise-card-glow" />
                    <div className="expertise-icon">{card.icon}</div>
                    <h3 className="expertise-title">{card.title}</h3>
                    <p className="expertise-description">{card.desc}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            SKILLS SECTION
        ════════════════════════════════════ */}
        <section
          id="skills"
          className="skills-section section"
          ref={(el) => (sectionRefs.current[2] = el)}
        >
          <Reveal className="section-header">
            <div className="section-label">Technical Expertise</div>
            <h2 className="section-title">Skills &amp; Technologies</h2>
            <p className="section-description">
              Proficient in modern web technologies and frameworks with a focus on creating
              performant, scalable applications
            </p>
          </Reveal>

          <div className="skills-grid">
            {skills.map((skill, index) => (
              <Reveal key={index} delay={index * 0.06} y={24}>
                <motion.div
                  className="skill-card"
                  whileHover={{ y: -10, scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  style={{ "--skill-color": skill.color }}
                >
                  <div className="skill-glow" />
                  <div className="skill-icon" style={{ color: skill.color }}>
                    {skill.icon}
                  </div>
                  <div className="skill-name">{skill.name}</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════
            PROJECTS SECTION
        ════════════════════════════════════ */}
        <section
          id="projects"
          className="projects-section section"
          ref={(el) => (sectionRefs.current[3] = el)}
        >
          <Reveal className="section-header">
            <div className="section-label">Portfolio</div>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-description">
              A selection of recent work showcasing my expertise in full-stack development
              and UI/UX design
            </p>
          </Reveal>

          <ScrollVelocity maxSkew={2.5}>
            {loadingProjects && projects.length === 0 ? (
              <div className="projects-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="project-card glass-depth-card skeleton-card">
                    <div className="skeleton-image-wrapper shimmer" />
                    <div className="project-content" style={{ padding: '24px' }}>
                      <div className="skeleton-line skeleton-title shimmer" />
                      <div className="skeleton-line skeleton-text shimmer" />
                      <div className="skeleton-line skeleton-text-short shimmer" />
                      <div className="skeleton-badges">
                        <div className="skeleton-badge shimmer" />
                        <div className="skeleton-badge shimmer" />
                        <div className="skeleton-badge shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map((project, index) => (
                  <Reveal key={project._id || index} delay={index * 0.08}>
                    <TiltCard className="project-card glass-depth-card" intensity={6}>
                      <div className="project-card-border-glow" />
                      <div
                        className="project-image-wrapper"
                        onClick={() => project.images && project.images.length > 0 && openLightbox(project.images, 0, project._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <ProjectImage
                          src={project.images && project.images.length > 0 ? project.images[0] : (project.image || '')}
                          alt={project.title}
                          className="project-image"
                        />
                        <div className="project-overlay">
                          <div className="project-links" onClick={(e) => e.stopPropagation()}>
                            {project.liveUrl && project.liveUrl !== '#' && (
                              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                <FaExternalLinkAlt /> Live Demo
                              </a>
                            )}
                            {project.githubUrl && project.githubUrl !== '#' && (
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                <FaCode /> View Code
                              </a>
                            )}
                          </div>
                          {(project.imageCount > 1 || (project.images && project.images.length > 1)) && (
                            <div className="gallery-indicator">
                              <FaImages /> View Gallery ({project.imageCount || project.images.length})
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="project-content">
                        <h3 className="project-title">{project.title}</h3>
                        <p className="project-description">{project.description}</p>
                        <div className="project-tech">
                          {Array.isArray(project.tech) && project.tech.map((tech, techIndex) => (
                            <span key={techIndex} className="tech-badge">{tech}</span>
                          ))}
                        </div>
                      </div>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            )}
          </ScrollVelocity>
        </section>

        {/* ════════════════════════════════════
            CONTACT SECTION
        ════════════════════════════════════ */}
        <section
          id="contact"
          className="contact-section section"
          ref={(el) => (sectionRefs.current[4] = el)}
        >
          <Reveal>
            <div className="contact-container">
              <div className="contact-corner contact-corner-tl" />
              <div className="contact-corner contact-corner-br" />
              <h2 className="contact-title">Let's Work Together</h2>
              <p className="contact-subtitle">
                Have a project in mind? Let's discuss how we can bring your ideas to life.
                I'm always open to new opportunities and collaborations.
              </p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    className="form-input"
                  />
                </div>
                <textarea
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input form-textarea"
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                  <MagneticButton strength={0.3}>
                    <motion.button
                      type="submit"
                      className="btn-submit"
                      whileHover={{ scale: 1.04, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Send Message <FaArrowRight />
                    </motion.button>
                  </MagneticButton>
                </div>
              </form>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <div className="social-icons">
          {[
            { href: "https://github.com/SLDima2001", icon: <FaGithub />, label: "GitHub" },
            { href: "https://www.linkedin.com/in/dimalsha-praveen-kariyawasam/", icon: <FaLinkedin />, label: "LinkedIn" },
          ].map(({ href, icon, label }) => (
            <MagneticButton key={label} strength={0.35}>
              <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                whileHover={{ y: -6, scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
                aria-label={label}
              >
                {icon}
              </motion.a>
            </MagneticButton>
          ))}
          <MagneticButton strength={0.35}>
            <motion.div
              onClick={handleCopy}
              className="social-icon"
              whileHover={{ y: -6, scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              style={{ cursor: 'pointer' }}
              aria-label="Copy email"
            >
              <FaEnvelope />
            </motion.div>
          </MagneticButton>
        </div>
        <p className="footer-text">
          <Link to="/admin-login" style={{ color: 'inherit', textDecoration: 'none', cursor: 'default' }}>
            © 2024 Dimalsha Praveen. Crafted with passion and attention to detail.
          </Link>
        </p>
      </footer>

      {/* ─── Copy Notification ─── */}
      <AnimatePresence>
        {isCopied && (
          <motion.div
            className="copy-notification"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <FaCheckCircle /> Email copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Lightbox (unchanged logic) ─── */}
      <AnimatePresence>
        {lightbox.isOpen && (
          <motion.div
            className="smart-lightbox"
            onClick={closeLightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="lightbox-close"><FaTimes /></div>
            <button className="lightbox-nav prev" onClick={prevImage}>
              <FaChevronRight style={{ transform: 'rotate(180deg)' }} />
            </button>
            <motion.div
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
              key={lightbox.currentIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
            >
              <img src={lightbox.images[lightbox.currentIndex]} alt="" className="lightbox-image" />
              <div className="lightbox-counter">{lightbox.currentIndex + 1} / {lightbox.images.length}</div>
            </motion.div>
            <button className="lightbox-nav next" onClick={nextImage}><FaChevronRight /></button>
            <div className="lightbox-thumbnails">
              {lightbox.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${idx === lightbox.currentIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, currentIndex: idx }); }}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          STYLES
      ════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { margin: 0; overflow-x: hidden; }

        /* ─── App Shell ─── */
        .portfolio-app {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #070710;
          color: #ffffff;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── Custom Cursor ─── */
        .cursor-dot {
          position: fixed;
          width: 6px; height: 6px;
          background: #00d4ff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease;
          mix-blend-mode: screen;
        }
        .cursor-ring {
          position: fixed;
          width: 36px; height: 36px;
          border: 1.5px solid rgba(0,212,255,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: all 0.12s ease;
          mix-blend-mode: screen;
        }

        /* ─── Animated Background Orbs ─── */
        .animated-background {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0; overflow: hidden;
          pointer-events: none;
        }
        .gradient-orb {
          position: absolute; border-radius: 50%;
          filter: blur(100px); opacity: 0.18;
          animation: orbFloat 22s infinite ease-in-out;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #00d4ff 0%, transparent 70%);
          top: -15%; left: -15%; animation-delay: 0s;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #9333ea 0%, transparent 70%);
          bottom: -15%; right: -10%; animation-delay: 8s;
        }
        .orb-3 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          top: 45%; right: -12%; animation-delay: 16s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(80px,-80px) scale(1.12); }
          66% { transform: translate(-80px,80px) scale(0.9); }
        }

        /* ─── Header / Navbar ─── */
        .header {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000;
          padding: 20px 40px;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .header.scrolled {
          background: rgba(7,7,16,0.85);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(0,212,255,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          padding: 14px 40px;
        }
        .header-content {
          max-width: 1400px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -1px; display: flex; align-items: center; gap: 2px; }
        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .logo-dot { color: #00d4ff; font-size: 36px; line-height: 1; }

        .nav { display: flex; gap: 36px; align-items: center; }
        .nav-link {
          color: rgba(255,255,255,0.55);
          text-decoration: none; font-size: 14px; font-weight: 500;
          transition: all 0.3s ease; position: relative; padding: 8px 0;
          letter-spacing: 0.3px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #00d4ff, #9333ea);
          transition: width 0.35s cubic-bezier(0.4,0,0.2,1);
          border-radius: 2px;
        }
        .nav-link:hover, .nav-link.active { color: #ffffff; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }

        .hamburger {
          display: none; font-size: 22px; color: #ffffff;
          cursor: pointer; z-index: 1001; padding: 8px;
          border-radius: 8px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s;
        }
        .hamburger:hover { background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.3); }

        /* ─── Mobile Menu ─── */
        .mobile-menu {
          position: fixed; top: 0; right: 0;
          width: 280px; height: 100vh;
          background: rgba(7,7,16,0.97);
          backdrop-filter: blur(24px);
          border-left: 1px solid rgba(0,212,255,0.15);
          padding: 100px 40px 40px;
          display: flex; flex-direction: column; gap: 28px;
          z-index: 999;
        }
        .mobile-nav-link {
          color: rgba(255,255,255,0.6); text-decoration: none;
          font-size: 22px; font-weight: 600;
          transition: all 0.3s ease; display: block;
        }
        .mobile-nav-link.active, .mobile-nav-link:hover {
          color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.4);
        }

        /* ─── Main Content ─── */
        .main-content {
          max-width: 1400px; margin: 0 auto; padding: 0 40px;
          position: relative; z-index: 1;
        }

        /* ─── Hero Section ─── */
        .hero-section {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: space-between;
          gap: 80px; padding-top: 100px;
        }
        .hero-content { flex: 1; max-width: 680px; }

        .hero-label {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 10px 22px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 50px; font-size: 13px; font-weight: 600;
          color: #00d4ff; margin-bottom: 32px; letter-spacing: 0.5px;
          backdrop-filter: blur(8px);
        }
        .hero-label-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #00d4ff; display: inline-block;
          box-shadow: 0 0 8px #00d4ff;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #00d4ff; }
          50% { opacity: 0.5; box-shadow: 0 0 16px #00d4ff, 0 0 24px rgba(0,212,255,0.4); }
        }

        .floating { animation: heroFloat 4s ease-in-out infinite; }
        @keyframes heroFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        .hero-title {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 72px; font-weight: 800; line-height: 1.08;
          margin-bottom: 28px; letter-spacing: -2.5px;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 60%, #3b82f6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        .gradient-text {
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        @keyframes gradientShift {
          0%,100%{background-position:0% 50%} 50%{background-position:100% 50%}
        }

        .hero-subtitle {
          font-size: 18px; color: rgba(255,255,255,0.65);
          margin-bottom: 44px; line-height: 1.8; font-weight: 400;
        }

        .cta-buttons {
          display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 64px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #00d4ff 0%, #0088bb 100%);
          color: #07070f; border: none;
          padding: 15px 30px; border-radius: 12px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 24px rgba(0,212,255,0.35), 0 0 0 0 rgba(0,212,255,0.4);
          transition: box-shadow 0.3s ease; position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary:hover { box-shadow: 0 8px 32px rgba(0,212,255,0.55), 0 0 0 4px rgba(0,212,255,0.12); }

        .btn-secondary {
          background: rgba(255,255,255,0.04);
          color: #ffffff; border: 1px solid rgba(255,255,255,0.18);
          padding: 15px 30px; border-radius: 12px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          border-color: rgba(0,212,255,0.5); color: #00d4ff;
          background: rgba(0,212,255,0.06);
          box-shadow: 0 4px 20px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.04);
        }

        .stats-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; margin-top: 16px;
        }
        .stat-item { text-align: left; }
        .stat-number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 40px; font-weight: 800;
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 6px; line-height: 1;
        }
        .stat-label { font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 500; }

        /* ─── Hero Image ─── */
        .hero-image-container { position: relative; flex: 0 0 auto; }
        .image-wrapper {
          position: relative; width: 400px; height: 400px;
          animation: imgFloat 7s ease-in-out infinite;
        }
        @keyframes imgFloat {
          0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(1.5deg)}
        }
        .image-glow-ring {
          position: absolute; inset: -3px; border-radius: 32px;
          background: linear-gradient(135deg, #00d4ff, #9333ea, #3b82f6, #00d4ff);
          background-size: 300% 300%;
          animation: ringRotate 4s linear infinite;
          z-index: 0;
        }
        @keyframes ringRotate { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        .hero-image {
          width: 100%; height: 100%; border-radius: 30px;
          object-fit: cover;
          border: 3px solid rgba(7,7,16,1);
          position: relative; z-index: 1;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.15);
          transition: transform 0.4s ease;
        }
        .hero-image:hover { transform: scale(1.03); }
        .image-count-badge {
          position: absolute; bottom: 18px; right: 18px; z-index: 2;
          background: rgba(7,7,16,0.75); backdrop-filter: blur(8px);
          padding: 8px 14px; border-radius: 50px; font-size: 13px;
          font-weight: 600; display: flex; align-items: center; gap: 7px;
          color: white; border: 1px solid rgba(255,255,255,0.12);
        }

        /* ─── Section Base ─── */
        .section {
          margin-bottom: 160px; opacity: 0;
          transform: translateY(50px); transition: all 0.8s ease;
        }

        /* ─── About Section ─── */
        .about-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 32px; padding: 80px 64px;
          position: relative; overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .about-section::before {
          content: ''; position: absolute;
          top: -50%; right: -50%; width: 100%; height: 100%;
          background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%);
          animation: rotateGlow 25s linear infinite; pointer-events: none;
        }
        @keyframes rotateGlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .about-content {
          display: flex; gap: 64px; align-items: flex-start; position: relative; z-index: 1;
        }
        .about-text { flex: 1; }

        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 46px; font-weight: 800; color: #ffffff;
          margin-bottom: 28px; letter-spacing: -1px;
        }
        .about-paragraph {
          font-size: 16px; color: rgba(255,255,255,0.65);
          line-height: 1.85; margin-bottom: 20px;
        }

        .expertise-grid { flex: 1; display: grid; grid-template-columns: 1fr; gap: 20px; }
        .expertise-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 28px;
          position: relative; overflow: hidden;
          cursor: pointer; transition: border-color 0.3s, box-shadow 0.3s;
        }
        .expertise-card-glow {
          position: absolute; inset: 0; border-radius: 20px;
          background: radial-gradient(circle at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.4s;
          pointer-events: none;
        }
        .expertise-card:hover { border-color: rgba(0,212,255,0.35); box-shadow: 0 12px 40px rgba(0,212,255,0.12); }
        .expertise-card:hover .expertise-card-glow { opacity: 1; }
        .expertise-icon { font-size: 30px; color: #00d4ff; margin-bottom: 14px; }
        .expertise-title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
        .expertise-description { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.65; }

        /* ─── Section Header ─── */
        .section-header { text-align: center; margin-bottom: 72px; }
        .section-label {
          display: inline-block; padding: 7px 18px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 50px; font-size: 12px; font-weight: 700;
          color: #00d4ff; margin-bottom: 20px; letter-spacing: 1.5px; text-transform: uppercase;
        }
        .section-description {
          font-size: 17px; color: rgba(255,255,255,0.55);
          max-width: 680px; margin: 16px auto 0; line-height: 1.75;
        }

        /* ─── Skills ─── */
        .skills-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px;
        }
        .skill-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 36px 20px;
          text-align: center; cursor: pointer;
          position: relative; overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .skill-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 30%, var(--skill-color, #00d4ff) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.35s; pointer-events: none;
        }
        .skill-card:hover { border-color: rgba(0,212,255,0.3); }
        .skill-card:hover .skill-glow { opacity: 0.08; box-shadow: 0 0 40px var(--skill-color, #00d4ff); }
        .skill-icon { font-size: 52px; margin-bottom: 16px; position: relative; z-index: 1; display: flex; justify-content: center; }
        .skill-name { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.9); position: relative; z-index: 1; }

        /* ─── Projects ─── */
        .projects-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 28px;
        }
        .project-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; overflow: hidden;
          position: relative; cursor: pointer;
          transition: border-color 0.35s, box-shadow 0.35s;
        }
        .project-card-border-glow {
          position: absolute; inset: 0; border-radius: 24px; z-index: 0; pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(0,212,255,0);
          transition: box-shadow 0.4s;
        }
        .project-card:hover { border-color: rgba(0,212,255,0.4); }
        .project-card:hover .project-card-border-glow {
          box-shadow: inset 0 0 0 1px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.1);
        }
        .project-image-wrapper {
          width: 100%; height: 300px; overflow: hidden; position: relative; z-index: 1;
        }
        .project-image {
          width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(0.4,0,0.2,1);
        }
        .project-card:hover .project-image { transform: scale(1.08); }
        .project-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 30%, rgba(7,7,16,0.95) 100%);
          opacity: 0; transition: opacity 0.35s;
          display: flex; align-items: flex-end; justify-content: center;
          flex-direction: column; padding: 28px; gap: 12px;
        }
        .project-card:hover .project-overlay { opacity: 1; }
        .project-links { display: flex; gap: 12px; }
        .project-link {
          display: flex; align-items: center; gap: 8px; color: #ffffff;
          text-decoration: none; font-size: 13px; font-weight: 600;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(0,212,255,0.15); border: 1px solid rgba(0,212,255,0.35);
          backdrop-filter: blur(8px); transition: all 0.25s ease;
        }
        .project-link:hover {
          background: rgba(0,212,255,0.3); transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,212,255,0.25);
        }
        .gallery-indicator {
          font-size: 12px; color: #00d4ff;
          display: flex; align-items: center; gap: 5px; font-weight: 600;
        }
        .project-content { padding: 28px; position: relative; z-index: 1; }
        .project-title { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 12px; font-family: 'Space Grotesk', sans-serif; }
        .project-description { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.75; margin-bottom: 20px; }
        .project-tech { display: flex; flex-wrap: wrap; gap: 8px; }
        .tech-badge {
          padding: 6px 14px; background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.22);
          border-radius: 8px; font-size: 12px; font-weight: 600; color: #00d4ff;
        }

        /* ─── Contact ─── */
        .contact-section { padding-bottom: 0; }
        .contact-container {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 32px; padding: 80px 64px;
          text-align: center; position: relative; overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .contact-container::before {
          content: ''; position: absolute;
          top: -60%; left: -60%; width: 220%; height: 220%;
          background: conic-gradient(from 0deg, transparent, rgba(0,212,255,0.06), transparent 60%);
          animation: rotateGlow 12s linear infinite; pointer-events: none;
        }
        .contact-corner {
          position: absolute; width: 120px; height: 120px; pointer-events: none;
        }
        .contact-corner-tl {
          top: 0; left: 0;
          border-top: 2px solid rgba(0,212,255,0.4);
          border-left: 2px solid rgba(0,212,255,0.4);
          border-radius: 32px 0 0 0;
        }
        .contact-corner-br {
          bottom: 0; right: 0;
          border-bottom: 2px solid rgba(147,51,234,0.4);
          border-right: 2px solid rgba(147,51,234,0.4);
          border-radius: 0 0 32px 0;
        }
        .contact-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 52px; font-weight: 800; color: #ffffff;
          margin-bottom: 18px; letter-spacing: -1.5px; position: relative; z-index: 1;
        }
        .contact-subtitle {
          font-size: 17px; color: rgba(255,255,255,0.55);
          max-width: 680px; margin: 0 auto 56px; line-height: 1.75;
          position: relative; z-index: 1;
        }
        .contact-form { max-width: 780px; margin: 0 auto; position: relative; z-index: 1; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        .form-input {
          width: 100%; padding: 16px 22px;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #ffffff;
          font-size: 15px; font-family: inherit;
          transition: all 0.3s ease; outline: none;
        }
        .form-input:focus {
          border-color: rgba(0,212,255,0.5);
          background: rgba(0,212,255,0.04);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.1), 0 0 20px rgba(0,212,255,0.12);
        }
        .form-input::placeholder { color: rgba(255,255,255,0.35); }
        .form-textarea { min-height: 160px; resize: vertical; margin-bottom: 20px; }
        .btn-submit {
          background: linear-gradient(135deg, #00d4ff 0%, #0088bb 100%);
          color: #07070f; border: none;
          padding: 16px 38px; border-radius: 12px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: inline-flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 24px rgba(0,212,255,0.35);
          transition: box-shadow 0.3s; position: relative; overflow: hidden;
        }
        .btn-submit::after {
          content: ''; position: absolute;
          top: -50%; left: -60%; width: 30%; height: 200%;
          background: rgba(255,255,255,0.25); transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .btn-submit:hover::after { left: 130%; }
        .btn-submit:hover { box-shadow: 0 8px 32px rgba(0,212,255,0.5); }

        /* ─── Footer ─── */
        .footer {
          background: rgba(255,255,255,0.015);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 60px 40px 40px; text-align: center;
          margin-top: 160px; position: relative; z-index: 1;
        }
        .social-icons { display: flex; justify-content: center; gap: 16px; margin-bottom: 36px; }
        .social-icon {
          font-size: 22px; color: rgba(255,255,255,0.55);
          padding: 16px; background: rgba(255,255,255,0.04);
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          color: #00d4ff; background: rgba(0,212,255,0.08);
          border-color: rgba(0,212,255,0.3);
          box-shadow: 0 6px 24px rgba(0,212,255,0.2);
        }
        .footer-text { color: rgba(255,255,255,0.35); font-size: 13px; }

        /* ─── Copy Notification ─── */
        .copy-notification {
          position: fixed; bottom: 36px; right: 30px;
          background: linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,150,200,0.9));
          backdrop-filter: blur(12px);
          color: #07070f; padding: 14px 22px; border-radius: 12px;
          font-size: 14px; font-weight: 700; z-index: 9000;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 32px rgba(0,212,255,0.4);
        }

        /* ─── Lightbox ─── */
        .smart-lightbox {
          position: fixed; inset: 0;
          background: rgba(7,7,16,0.97);
          backdrop-filter: blur(20px);
          z-index: 99999; display: flex; justify-content: center; align-items: center;
        }
        .lightbox-close {
          position: absolute; top: 28px; right: 28px;
          color: white; font-size: 28px; cursor: pointer;
          transition: all 0.3s ease; padding: 10px;
          background: rgba(255,255,255,0.05); border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .lightbox-close:hover { transform: scale(1.1) rotate(90deg); color: #00d4ff; border-color: rgba(0,212,255,0.4); }
        .lightbox-nav {
          position: absolute; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12); color: white;
          width: 54px; height: 54px; border-radius: 50%;
          display: flex; justify-content: center; align-items: center;
          cursor: pointer; font-size: 18px; transition: all 0.3s ease; z-index: 10;
        }
        .lightbox-nav:hover { background: #00d4ff; color: #07070f; transform: scale(1.1); border-color: #00d4ff; }
        .lightbox-nav.prev { left: 36px; }
        .lightbox-nav.next { right: 36px; }
        .lightbox-content {
          max-width: 85%; max-height: 75vh;
          display: flex; flex-direction: column; align-items: center;
        }
        .lightbox-image {
          max-width: 100%; max-height: 70vh; object-fit: contain;
          border-radius: 16px; box-shadow: 0 0 60px rgba(0,0,0,0.6);
        }
        .lightbox-counter {
          margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.5);
          background: rgba(0,0,0,0.3); padding: 5px 14px; border-radius: 20px;
        }
        .lightbox-thumbnails {
          position: absolute; bottom: 24px;
          display: flex; gap: 12px; padding: 10px;
          max-width: 90%; overflow-x: auto;
        }
        .thumbnail {
          width: 56px; height: 56px; border-radius: 8px; overflow: hidden;
          cursor: pointer; opacity: 0.45; border: 2px solid transparent; transition: all 0.3s;
        }
        /* ─── Skeleton Loading Cards ─── */
        .skeleton-card {
          min-height: 400px;
          pointer-events: none;
          position: relative;
          overflow: hidden;
        }
        .skeleton-image-wrapper {
          width: 100%;
          height: 240px;
          background: rgba(255,255,255,0.05);
          border-radius: 16px 16px 0 0;
        }
        .skeleton-line {
          height: 16px;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .skeleton-title { width: 60%; height: 24px; margin-bottom: 16px; }
        .skeleton-text { width: 95%; }
        .skeleton-text-short { width: 70%; }
        .skeleton-badges { display: flex; gap: 8px; margin-top: 20px; }
        .skeleton-badge { width: 64px; height: 24px; border-radius: 20px; background: rgba(255,255,255,0.06); }
        
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 212, 255, 0.12),
            transparent
          );
          animation: shimmerSweep 1.8s infinite;
        }
        @keyframes shimmerSweep {
          100% { transform: translateX(100%); }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .hero-section { gap: 48px; }
          .image-wrapper { width: 340px; height: 340px; }
          .projects-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .hamburger { display: flex; align-items: center; justify-content: center; }
          .nav { display: none; }
          .header { padding: 16px 24px; }
          .header.scrolled { padding: 12px 24px; }
          .main-content { padding: 0 20px; }

          .hero-section { flex-direction: column; gap: 48px; padding-top: 110px; align-items: flex-start; }
          .hero-title { font-size: 44px; letter-spacing: -1.5px; }
          .hero-subtitle { font-size: 16px; }
          .image-wrapper { width: 280px; height: 280px; align-self: center; }
          .stats-grid { gap: 24px; }
          .stat-number { font-size: 30px; }
          .stat-label { font-size: 11px; }

          .about-section { padding: 40px 24px; }
          .about-content { flex-direction: column; gap: 36px; }
          .section-title { font-size: 32px; }

          .skills-grid { grid-template-columns: repeat(2,1fr); gap: 14px; }
          .skill-card { padding: 28px 14px; }
          .skill-icon { font-size: 40px; }

          .projects-grid { grid-template-columns: 1fr; }
          .project-image-wrapper { height: 220px; }

          .contact-container { padding: 40px 22px; }
          .contact-title { font-size: 34px; }
          .form-row { grid-template-columns: 1fr; }

          .lightbox-nav { width: 44px; height: 44px; font-size: 16px; }
          .lightbox-nav.prev { left: 10px; }
          .lightbox-nav.next { right: 10px; }

          .copy-notification { right: 16px; left: 16px; bottom: 20px; }

          .section { margin-bottom: 100px; }
          .footer { margin-top: 100px; }
        }
      `}</style>
    </div>
  );
}

export default Portfolio;