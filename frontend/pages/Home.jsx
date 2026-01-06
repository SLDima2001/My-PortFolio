import React, { useState, useEffect, useRef } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaCode, FaExternalLinkAlt, FaReact, FaNodeJs, FaFigma, FaDatabase, FaArrowRight, FaCheckCircle, FaMobile, FaBars, FaTimes } from "react-icons/fa";
import { SiMongodb, SiExpress, SiTailwindcss, SiJavascript, SiTypescript, SiNextdotjs, SiPython } from "react-icons/si";

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

  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = "frontend/public/DimalshaResume.pdf";
    link.download = "DimalshaResume.pdf";
    link.click();
  };

  const myemail = "dimalshapraveen2001@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(myemail).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch('https://my-port-folio-onn7.vercel.app/send-email/form1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        alert('✅ Message sent successfully! I will get back to you soon.');
      } else {
        alert('❌ Failed to send message. Please try again or email me directly.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('❌ Network error. Please check your connection or email me directly at dimalshapraveen2001@gmail.com');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  };

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

    return () => {
      sectionRefs.current.forEach((ref) => ref && observer.unobserve(ref));
    };
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
  };

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

  const projects = [
    {
      title: "Lahiru Tours",
      description: "A comprehensive tour booking platform featuring tailor-made travel experiences with real-time booking system, payment integration, and dynamic itinerary management. Built with modern web technologies for optimal performance.",
      image: "https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/photo123.png?raw=true",
      tech: ["React", "Node.js", "MongoDB", "Express"],
      liveUrl: "https://lahirutours.co.uk/",
      githubUrl: "#",
      featured: true
    },
    {
      title: "Yale Art School UI/UX",
      description: "A complete UI/UX redesign for Yale School of Art, incorporating modern design principles, accessibility standards, and interactive prototyping. Features innovative navigation and immersive gallery experiences.",
      image: "https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/Project%202.png?raw=true",
      tech: ["Figma", "UI/UX", "Prototyping", "Design Systems"],
      liveUrl: "https://www.figma.com/proto/0ZqKjHGHQUoh4rqVAu3q1H/HCI?node-id=109-67&node-type=canvas&t=wgjCtr4Sy2AXhhh2-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=109%3A67",
      githubUrl: "#",
      featured: true
    },
    {
      title: "Explore Sri Lanka Mobile App",
      description: "React-Native Mobile app For foreigner to get an idea about Sri Lanka Details and show latest offer details from web app.Backend Create Using Python",
      image: "https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/MobileApp.png?raw=true",
      tech: ["React-Native", "Python", "MongoDB","REST API"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false
    },
    {
      title: "Explore Sri Lanka Web App",
      description: "Web Application For Add Businesses and Offers details through the web for show in explore Sri Lanka Mobile app ",
      image: "https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/WebApp.png?raw=true",
      tech: ["React", "Node","Express", "MongoDB","Payhere Payment Gateway" ],
      liveUrl: "#",
      githubUrl: "https://github.com/SLDima2001/SriLanka-Login-Registration.git",
      featured: false
    },
    {
      title: "Mood Tracker Mobile App",
      description: "Users can add their Mood and Save it in Mobile Phone",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop",
      tech: ["React-Native", "MongoDB"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false
    }
  ];

  return (
    <div className="portfolio-app">
      {!isMobile && (
        <>
          <div ref={cursorDotRef} className="cursor-dot"></div>
          <div ref={cursorRingRef} className="cursor-ring"></div>
        </>
      )}
      
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <header className={`header ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">Dimalsha</span>
            <span className="logo-dot">.</span>
          </div>
          <nav className="nav">
            <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}>
              About
            </a>
            <a href="#skills" className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`}>
              Skills
            </a>
            <a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}>
              Projects
            </a>
            <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}>
              Contact
            </a>
          </nav>
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#about" className={`mobile-nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '#about')}>
          About
        </a>
        <a href="#skills" className={`mobile-nav-link ${activeSection === 'skills' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '#skills')}>
          Skills
        </a>
        <a href="#projects" className={`mobile-nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '#projects')}>
          Projects
        </a>
        <a href="#contact" className={`mobile-nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '#contact')}>
          Contact
        </a>
      </div>

      <main className="main-content">
        <section className="hero-section" id="about" ref={(el) => (sectionRefs.current[0] = el)}>
          <div className="hero-content">
            <div className="hero-label floating">Full Stack Developer</div>
            <h1 className="hero-title">
              Hi, I'm <span className="gradient-text">Dimalsha</span><br />
              Building Digital Experiences
            </h1>
            <p className="hero-subtitle">
              I'm a passionate full-stack developer and UI/UX designer specializing in creating modern, 
              scalable web applications with beautiful user experiences. With expertise in React, Node.js, 
              and modern design tools, I transform ideas into reality.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={handleDownloadCV}>
                <FaDownload /> Download CV
              </button>
              <button className="btn-secondary" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
                Get In Touch
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">6+</div>
                <div className="stat-label">Projects Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">2+</div>
                <div className="stat-label">Years Experience</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Client Satisfaction</div>
              </div>
            </div>
          </div>
          <div className="hero-image-container">
            <div className="image-wrapper">
              <img
                src="https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/My.jpg?raw=true"
                alt="Dimalsha Praveen"
                className="hero-image"
              />
            </div>
          </div>
        </section>

        <section className="about-section section" ref={(el) => (sectionRefs.current[1] = el)}>
          <div className="about-content">
            <div className="about-text">
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
            </div>
            
            <div className="expertise-grid">
              <div className="expertise-card">
                <div className="expertise-icon">
                  <FaMobile />
                </div>
                <h3 className="expertise-title">Mobile Development</h3>
                <p className="expertise-description">
                  Specialized in React Native for building cross-platform mobile applications with 
                  smooth animations, offline capabilities, and native integrations.
                </p>
              </div>
              
              <div className="expertise-card">
                <div className="expertise-icon">
                  <SiPython />
                </div>
                <h3 className="expertise-title">Backend with Python</h3>
                <p className="expertise-description">
                  Proficient in Python for backend development, creating efficient APIs, data processing 
                  pipelines, and integrating with databases and third-party services.
                </p>
              </div>
              
              <div className="expertise-card">
                <div className="expertise-icon">
                  <FaReact />
                </div>
                <h3 className="expertise-title">Full-Stack Development</h3>
                <p className="expertise-description">
                  End-to-end application development using modern JavaScript frameworks, Node.js, 
                  and database technologies to deliver complete, production-ready solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="skills-section section" ref={(el) => (sectionRefs.current[2] = el)}>
          <div className="section-header">
            <div className="section-label">Technical Expertise</div>
            <h2 className="section-title">Skills & Technologies</h2>
            <p className="section-description">
              Proficient in modern web technologies and frameworks with a focus on creating 
              performant, scalable applications
            </p>
          </div>
          
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={index} className="skill-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="skill-icon" style={{ color: skill.color }}>
                  {skill.icon}
                </div>
                <div className="skill-name">{skill.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="projects-section section" ref={(el) => (sectionRefs.current[3] = el)}>
          <div className="section-header">
            <div className="section-label">Portfolio</div>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-description">
              A selection of recent work showcasing my expertise in full-stack development 
              and UI/UX design
            </p>
          </div>
          
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="project-image-wrapper">
                  <img src={project.image} alt={project.title} className="project-image" />
                  <div className="project-overlay">
                    <div className="project-links">
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <FaExternalLinkAlt /> Live Demo
                      </a>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <FaCode /> View Code
                      </a>
                    </div>
                  </div>
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section section" ref={(el) => (sectionRefs.current[4] = el)}>
          <div className="contact-container">
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
              <button type="submit" className="btn-submit">
                Send Message <FaArrowRight />
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="social-icons">
          <a href="https://github.com/SLDima2001" target="_blank" rel="noopener noreferrer" className="social-icon">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/dimalsha-praveen-kariyawasam/" target="_blank" rel="noopener noreferrer" className="social-icon">
            <FaLinkedin />
          </a>
          <div onClick={handleCopy} className="social-icon">
            <FaEnvelope />
          </div>
        </div>
        <p className="footer-text">
          © 2024 Dimalsha Praveen. Crafted with passion and attention to detail.
        </p>
      </footer>

      <div className={`copy-notification ${isCopied ? 'show' : ''}`}>
        <FaCheckCircle /> Email copied to clipboard!
      </div>
      
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          overflow-x: hidden;
        }
        
        .portfolio-app {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0a0a0f;
          color: #ffffff;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        .cursor-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          background: #00d4ff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease;
        }

        .cursor-ring {
          position: fixed;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(0, 212, 255, 0.4);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: all 0.15s ease;
        }

        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #00d4ff 0%, transparent 70%);
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #9333ea 0%, transparent 70%);
          bottom: -10%;
          right: -5%;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          top: 40%;
          right: -15%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, -100px) scale(1.1); }
          66% { transform: translate(-100px, 100px) scale(0.9); }
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 24px 40px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header.scrolled {
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .logo-text {
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-dot {
          color: #00d4ff;
          font-size: 32px;
        }

        .nav {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          padding: 8px 0;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #9333ea);
          transition: width 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #ffffff;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .hamburger {
          display: none;
          font-size: 24px;
          color: #ffffff;
          cursor: pointer;
          z-index: 1001;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 300px;
          height: 100vh;
          background: rgba(10, 10, 15, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding: 100px 40px 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-nav-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .mobile-nav-link.active,
        .mobile-nav-link:hover {
          color: #00d4ff;
          transform: translateX(10px);
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 80px;
          padding-top: 100px;
        }

        .hero-content {
          flex: 1;
          max-width: 700px;
        }

        .hero-label {
          display: inline-block;
          padding: 10px 24px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          color: #00d4ff;
          margin-bottom: 32px;
          letter-spacing: 0.5px;
        }

        .floating {
          animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-title {
          font-size: 72px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 32px;
          letter-spacing: -2px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 40px;
          line-height: 1.7;
          font-weight: 400;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 60px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: #ffffff;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 212, 255, 0.5);
        }

        .btn-secondary {
          background: transparent;
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          border-color: #00d4ff;
          color: #00d4ff;
          transform: translateY(-3px);
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-top: 20px;
        }

        .stat-item {
          text-align: left;
        }

        .stat-number {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .hero-image-container {
          position: relative;
          flex: 0 0 auto;
        }

        .image-wrapper {
          position: relative;
          width: 420px;
          height: 420px;
          animation: float-image 6s ease-in-out infinite;
        }

        @keyframes float-image {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        .hero-image {
          width: 100%;
          height: 100%;
          border-radius: 30px;
          object-fit: cover;
          box-shadow: 0 30px 80px rgba(0, 212, 255, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .hero-image:hover {
          transform: scale(1.05);
          box-shadow: 0 40px 100px rgba(0, 212, 255, 0.5);
        }

        .section {
          margin-bottom: 160px;
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s ease;
        }

        .about-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 80px 60px;
          position: relative;
          overflow: hidden;
        }

        .about-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .about-content {
          display: flex;
          gap: 60px;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }

        .about-text {
          flex: 1;
        }

        .section-title {
          font-size: 48px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 32px;
          letter-spacing: -1px;
        }

        .about-paragraph {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .expertise-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .expertise-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 28px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .expertise-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 212, 255, 0.4);
          transform: translateY(-8px) rotateX(5deg);
          box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
        }

        .expertise-icon {
          font-size: 32px;
          color: #00d4ff;
          margin-bottom: 16px;
        }

        .expertise-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .expertise-description {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-label {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          color: #00d4ff;
          margin-bottom: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .section-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          max-width: 700px;
          margin: 16px auto 0;
          line-height: 1.7;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 24px;
        }

        .skill-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px 24px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .skill-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-12px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .skill-icon {
          font-size: 56px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .skill-card:hover .skill-icon {
          transform: rotateY(180deg) scale(1.1);
        }

        .skill-name {
          font-size: 17px;
          font-weight: 600;
          color: #ffffff;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 32px;
        }

        .project-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        .project-card:hover {
          transform: translateY(-12px);
          border-color: rgba(0, 212, 255, 0.4);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        .project-image-wrapper {
          width: 100%;
          height: 320px;
          overflow: hidden;
          position: relative;
        }

        .project-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s ease;
        }

        .project-card:hover .project-image {
          transform: scale(1.1);
        }

        .project-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 100%);
          opacity: 0;
          transition: all 0.3s ease;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 32px;
        }

        .project-card:hover .project-overlay {
          opacity: 1;
        }

        .project-links {
          display: flex;
          gap: 16px;
        }

        .project-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          padding: 12px 24px;
          border-radius: 10px;
          background: rgba(0, 212, 255, 0.2);
          border: 1px solid rgba(0, 212, 255, 0.4);
        }

        .project-link:hover {
          background: rgba(0, 212, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
        }

        .project-content {
          padding: 32px;
        }

        .project-title {
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .project-description {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .project-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tech-badge {
          padding: 8px 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #00d4ff;
        }

        .contact-section {
          padding-bottom: 0;
        }

        .contact-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 80px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .contact-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(0, 212, 255, 0.1), transparent);
          animation: rotate 10s linear infinite;
        }

        .contact-title {
          font-size: 56px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 20px;
          letter-spacing: -1px;
          position: relative;
          z-index: 1;
        }

        .contact-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          max-width: 700px;
          margin: 0 auto 60px;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        .contact-form {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-input {
          width: 100%;
          padding: 18px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 15px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #00d4ff;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-textarea {
          grid-column: 1 / -1;
          min-height: 180px;
          resize: vertical;
          margin-bottom: 20px;
        }

        .btn-submit {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: #ffffff;
          border: none;
          padding: 18px 40px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
        }

        .btn-submit:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 212, 255, 0.5);
        }

        .footer {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 60px 40px 40px;
          text-align: center;
          margin-top: 160px;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .social-icon {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
          cursor: pointer;
          padding: 18px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social-icon:hover {
          color: #00d4ff;
          background: rgba(0, 212, 255, 0.1);
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.2);
        }

        .footer-text {
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          font-weight: 400;
        }

        .copy-notification {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: #ffffff;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          z-index: 1000;
          transform: translateY(100px);
          opacity: 0;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 30px rgba(0, 212, 255, 0.4);
        }

        .copy-notification.show {
          transform: translateY(0);
          opacity: 1;
        }

        @media (max-width: 768px) {
          .hamburger {
            display: block;
          }

          .nav {
            display: none;
          }

          .main-content {
            padding: 0 24px;
          }

          .hero-section {
            flex-direction: column;
            gap: 40px;
            padding-top: 120px;
          }

          .hero-title {
            font-size: 42px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .image-wrapper {
            width: 300px;
            height: 300px;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }

          .stat-number {
            font-size: 28px;
          }

          .stat-label {
            font-size: 12px;
          }

          .about-section {
            padding: 40px 24px;
          }

          .about-content {
            flex-direction: column;
            gap: 40px;
          }

          .section-title {
            font-size: 32px;
          }

          .skills-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .skill-card {
            padding: 28px 16px;
          }

          .skill-icon {
            font-size: 40px;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }

          .project-image-wrapper {
            height: 220px;
          }

          .contact-container {
            padding: 40px 24px;
          }

          .contact-title {
            font-size: 36px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .copy-notification {
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
          }
        }
      `}</style>
    </div>
  );
}

export default Portfolio;