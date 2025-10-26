import React, { useState, useEffect, useRef } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaCode, FaExternalLinkAlt, FaReact, FaNodeJs, FaFigma, FaDatabase, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { SiMongodb, SiExpress, SiTailwindcss, SiJavascript, SiTypescript, SiNextdotjs } from "react-icons/si";

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    
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
    
    try {
      const response = await fetch('https://my-port-folio-onn7.vercel.app/send-email/form1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (!response.ok) {
        throw new Error(`Error sending email: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.success) {
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        alert('Message sent successfully!');
      } else {
        alert('Failed to send email.');
      }
    } catch (error) {
      console.error(error);
      alert('Success');
    }
    window.location.reload();
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

  const skills = [
    { name: "React", icon: <FaReact />, color: "#61DAFB" },
    { name: "React Native", icon: <FaReact />, color: "#61DAFB" },
    { name: "Node.js", icon: <FaNodeJs />, color: "#339933" },
    { name: "Python", icon: "🐍", color: "#3776AB" },
    { name: ".NET", icon: "⚡", color: "#512BD4" },
    { name: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
    { name: "Express", icon: <SiExpress />, color: "#000000" },
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

  const styles = {
    app: {
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#0a0a0a",
      color: "#ffffff",
      minHeight: "100vh",
      overflowX: "hidden",
      position: "relative",
    },
    
    cursor: {
      position: "fixed",
      width: "20px",
      height: "20px",
      border: "2px solid #007bff",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999,
      left: `${mousePosition.x - 10}px`,
      top: `${mousePosition.y - 10}px`,
      transition: "transform 0.1s ease",
      display: isMobile ? "none" : "block",
    },

    backgroundPattern: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `
        radial-gradient(circle at 20% 50%, rgba(0, 123, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(0, 255, 150, 0.05) 0%, transparent 50%)
      `,
      zIndex: -1,
    },

    header: {
      background: scrollY > 50 ? "rgba(10, 10, 10, 0.98)" : "transparent",
      backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
      border: scrollY > 50 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
      padding: "24px 40px",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: "all 0.3s ease",
      boxShadow: scrollY > 50 ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "none",
    },

    headerContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      maxWidth: "1400px",
      margin: "0 auto",
    },

    logo: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: "-0.5px",
    },

    nav: {
      display: "flex",
      gap: "40px",
      alignItems: "center",
    },

    navLink: {
      color: "#a0a0a0",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: "500",
      transition: "all 0.3s ease",
      position: "relative",
    },

    navLinkActive: {
      color: "#ffffff",
    },

    main: {
      paddingTop: "0",
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 40px",
    },

    heroSection: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "80px",
      paddingTop: "100px",
      flexDirection: isMobile ? "column" : "row",
    },

    heroContent: {
      flex: 1,
      maxWidth: "700px",
    },

    heroLabel: {
      display: "inline-block",
      padding: "8px 20px",
      background: "rgba(0, 123, 255, 0.1)",
      border: "1px solid rgba(0, 123, 255, 0.3)",
      borderRadius: "50px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#007bff",
      marginBottom: "24px",
      letterSpacing: "0.5px",
    },

    heroTitle: {
      fontSize: isMobile ? "48px" : "72px",
      fontWeight: "800",
      lineHeight: "1.1",
      marginBottom: "24px",
      color: "#ffffff",
      letterSpacing: "-2px",
    },

    heroHighlight: {
      background: "linear-gradient(135deg, #007bff 0%, #8a2be2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },

    heroSubtitle: {
      fontSize: "20px",
      color: "#a0a0a0",
      marginBottom: "40px",
      lineHeight: "1.6",
      fontWeight: "400",
    },

    ctaButtons: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "60px",
    },

    primaryButton: {
      background: "#007bff",
      color: "#ffffff",
      border: "none",
      padding: "14px 32px",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    secondaryButton: {
      background: "transparent",
      color: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "14px 32px",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "40px",
      marginTop: "20px",
    },

    statItem: {
      textAlign: "left",
    },

    statNumber: {
      fontSize: "36px",
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: "8px",
    },

    statLabel: {
      fontSize: "14px",
      color: "#a0a0a0",
      fontWeight: "500",
    },

    heroImageContainer: {
      position: "relative",
      flex: "0 0 auto",
    },

    heroImage: {
      width: isMobile ? "280px" : "420px",
      height: isMobile ? "280px" : "420px",
      borderRadius: "20px",
      objectFit: "cover",
      boxShadow: "0 25px 80px rgba(0, 123, 255, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },

    section: {
      marginBottom: "160px",
      opacity: 0,
      transform: "translateY(50px)",
      transition: "all 0.8s ease",
    },

    sectionHeader: {
      textAlign: "center",
      marginBottom: "80px",
    },

    sectionLabel: {
      display: "inline-block",
      padding: "6px 16px",
      background: "rgba(0, 123, 255, 0.1)",
      border: "1px solid rgba(0, 123, 255, 0.3)",
      borderRadius: "50px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#007bff",
      marginBottom: "16px",
      letterSpacing: "1px",
      textTransform: "uppercase",
    },

    sectionTitle: {
      fontSize: isMobile ? "40px" : "56px",
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: "16px",
      letterSpacing: "-1px",
    },

    sectionDescription: {
      fontSize: "18px",
      color: "#a0a0a0",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.6",
    },

    skillsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
      gap: "24px",
      marginBottom: "80px",
    },

    skillCard: {
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      padding: "32px 24px",
      textAlign: "center",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },

    skillIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },

    skillName: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#ffffff",
    },

    projectGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "32px",
    },

    projectCard: {
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      overflow: "hidden",
      transition: "all 0.3s ease",
      cursor: "pointer",
      position: "relative",
    },

    projectImageContainer: {
      width: "100%",
      height: "280px",
      overflow: "hidden",
      position: "relative",
    },

    projectImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "all 0.5s ease",
    },

    projectOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)",
      opacity: 0,
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "flex-end",
      padding: "24px",
    },

    projectContent: {
      padding: "32px",
    },

    projectHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "16px",
    },

    projectTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: "12px",
    },

    projectDescription: {
      fontSize: "15px",
      color: "#a0a0a0",
      lineHeight: "1.6",
      marginBottom: "24px",
    },

    projectTech: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "24px",
    },

    techBadge: {
      padding: "6px 12px",
      background: "rgba(0, 123, 255, 0.1)",
      border: "1px solid rgba(0, 123, 255, 0.3)",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      color: "#007bff",
    },

    projectLinks: {
      display: "flex",
      gap: "12px",
    },

    projectLink: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#a0a0a0",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },

    contactSection: {
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "24px",
      padding: isMobile ? "40px 24px" : "80px 60px",
      textAlign: "center",
    },

    contactTitle: {
      fontSize: isMobile ? "36px" : "48px",
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: "16px",
      letterSpacing: "-1px",
    },

    contactSubtitle: {
      fontSize: "18px",
      color: "#a0a0a0",
      marginBottom: "48px",
      maxWidth: "600px",
      margin: "0 auto 48px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "16px",
      maxWidth: "800px",
      margin: "0 auto",
    },

    input: {
      width: "100%",
      padding: "16px 20px",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "#ffffff",
      fontSize: "15px",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
    },

    textarea: {
      gridColumn: isMobile ? "1" : "1 / -1",
      minHeight: "150px",
      resize: "vertical",
    },

    submitButton: {
      gridColumn: isMobile ? "1" : "1 / -1",
      background: "#007bff",
      color: "#ffffff",
      border: "none",
      padding: "16px 32px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      margin: "16px auto 0",
    },

    footer: {
      background: "rgba(255, 255, 255, 0.03)",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "60px 40px 40px",
      textAlign: "center",
    },

    socialIcons: {
      display: "flex",
      justifyContent: "center",
      gap: "16px",
      marginBottom: "32px",
    },

    socialIcon: {
      fontSize: "20px",
      color: "#a0a0a0",
      transition: "all 0.3s ease",
      cursor: "pointer",
      padding: "16px",
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },

    footerText: {
      color: "#666",
      fontSize: "14px",
      fontWeight: "400",
    },

    copyMessage: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: "#007bff",
      color: "#ffffff",
      padding: "16px 24px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: 1000,
      transform: isCopied ? "translateY(0)" : "translateY(100px)",
      opacity: isCopied ? 1 : 0,
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
  };

  return (
    <div style={styles.app}>
      <div style={styles.cursor}></div>
      <div style={styles.backgroundPattern}></div>
      
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>Dimalsha Praveen</div>
          <nav style={styles.nav}>
            <a href="#about" style={{...styles.navLink, ...(activeSection === 'about' ? styles.navLinkActive : {})}}>
              About
            </a>
            <a href="#skills" style={{...styles.navLink, ...(activeSection === 'skills' ? styles.navLinkActive : {})}}>
              Skills
            </a>
            <a href="#projects" style={{...styles.navLink, ...(activeSection === 'projects' ? styles.navLinkActive : {})}}>
              Projects
            </a>
            <a href="#contact" style={{...styles.navLink, ...(activeSection === 'contact' ? styles.navLinkActive : {})}}>
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.heroSection} id="about" ref={(el) => (sectionRefs.current[0] = el)}>
          <div style={styles.heroContent}>
            <div style={styles.heroLabel}>Full Stack Developer</div>
            <h1 style={styles.heroTitle}>
              Hi, I'm <span style={styles.heroHighlight}>Dimalsha</span><br />
              Building Digital Experiences
            </h1>
            <p style={styles.heroSubtitle}>
              I'm a passionate full-stack developer and UI/UX designer specializing in creating modern, 
              scalable web applications with beautiful user experiences. With expertise in React, Node.js, 
              and modern design tools, I transform ideas into reality.
            </p>
            <div style={styles.ctaButtons}>
              <button 
                style={styles.primaryButton}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                onClick={handleDownloadCV}
              >
                <FaDownload /> Download CV
              </button>
              <button 
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#007bff";
                  e.target.style.color = "#007bff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  e.target.style.color = "#ffffff";
                }}
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                Get In Touch
              </button>
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>6+</div>
                <div style={styles.statLabel}>Projects Completed</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>2+</div>
                <div style={styles.statLabel}>Years Experience</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>100%</div>
                <div style={styles.statLabel}>Client Satisfaction</div>
              </div>
            </div>
          </div>
          <div style={styles.heroImageContainer}>
            <img
              src="https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/My.jpg?raw=true"
              alt="Dimalsha Praveen"
              style={styles.heroImage}
            />
          </div>
        </section>

        <section id="skills" style={styles.section} ref={(el) => (sectionRefs.current[1] = el)}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionLabel}>Technical Expertise</div>
            <h2 style={styles.sectionTitle}>Skills & Technologies</h2>
            <p style={styles.sectionDescription}>
              Proficient in modern web technologies and frameworks with a focus on creating 
              performant, scalable applications
            </p>
          </div>
          
          <div style={styles.skillsGrid}>
            {skills.map((skill, index) => (
              <div 
                key={index}
                style={styles.skillCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = skill.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <div style={{...styles.skillIcon, color: skill.color}}>{skill.icon}</div>
                <div style={styles.skillName}>{skill.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" style={styles.section} ref={(el) => (sectionRefs.current[2] = el)}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionLabel}>Portfolio</div>
            <h2 style={styles.sectionTitle}>Featured Projects</h2>
            <p style={styles.sectionDescription}>
              A selection of recent work showcasing my expertise in full-stack development 
              and UI/UX design
            </p>
          </div>
          
          <div style={styles.projectGrid}>
            {projects.map((project, index) => (
              <div 
                key={index}
                style={styles.projectCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "rgba(0, 123, 255, 0.3)";
                  const overlay = e.currentTarget.querySelector('.project-overlay');
                  if (overlay) overlay.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  const overlay = e.currentTarget.querySelector('.project-overlay');
                  if (overlay) overlay.style.opacity = "0";
                }}
              >
                <div style={styles.projectImageContainer}>
                  <img src={project.image} alt={project.title} style={styles.projectImage} />
                  <div className="project-overlay" style={styles.projectOverlay}>
                    <div style={styles.projectLinks}>
                      <a 
                        href={project.liveUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.projectLink}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(0, 123, 255, 0.2)";
                          e.target.style.color = "#007bff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#a0a0a0";
                        }}
                      >
                        <FaExternalLinkAlt /> Live Demo
                      </a>
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.projectLink}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(0, 123, 255, 0.2)";
                          e.target.style.color = "#007bff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#a0a0a0";
                        }}
                      >
                        <FaCode /> View Code
                      </a>
                    </div>
                  </div>
                </div>
                <div style={styles.projectContent}>
                  <div style={styles.projectHeader}>
                    <h3 style={styles.projectTitle}>{project.title}</h3>
                  </div>
                  <p style={styles.projectDescription}>{project.description}</p>
                  <div style={styles.projectTech}>
                    {project.tech.map((tech, techIndex) => (
                      <span key={techIndex} style={styles.techBadge}>{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" style={styles.section} ref={(el) => (sectionRefs.current[3] = el)}>
          <div style={styles.contactSection}>
            <h2 style={styles.contactTitle}>Let's Work Together</h2>
            <p style={styles.contactSubtitle}>
              Have a project in mind? Let's discuss how we can bring your ideas to life. 
              I'm always open to new opportunities and collaborations.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = "#007bff"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = "#007bff"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  required 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = "#007bff"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Subject" 
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = "#007bff"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                />
                <textarea
                  placeholder="Your Message"
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  style={{...styles.input, ...styles.textarea}}
                  onFocus={(e) => e.target.style.borderColor = "#007bff"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                  required
                />
                <button
                  type="submit"
                  style={styles.submitButton}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 32px rgba(0, 123, 255, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  Send Message <FaArrowRight />
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.socialIcons}>
          <a
            href="https://github.com/SLDima2001"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.socialIcon}
            onMouseEnter={(e) => {
              e.target.style.color = "#ffffff";
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#a0a0a0";
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/dimalsha-praveen-kariyawasam/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.socialIcon}
            onMouseEnter={(e) => {
              e.target.style.color = "#0077b5";
              e.target.style.background = "rgba(0, 119, 181, 0.1)";
              e.target.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#a0a0a0";
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <FaLinkedin />
          </a>
          <div
            onClick={handleCopy}
            style={styles.socialIcon}
            onMouseEnter={(e) => {
              e.target.style.color = "#007bff";
              e.target.style.background = "rgba(0, 123, 255, 0.1)";
              e.target.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#a0a0a0";
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <FaEnvelope />
          </div>
        </div>
        <p style={styles.footerText}>
          © 2024 Dimalsha Praveen. Crafted with passion and attention to detail.
        </p>
      </footer>

      <div style={styles.copyMessage}>
        <FaCheckCircle /> Email copied to clipboard!
      </div>
      
      <style jsx>{`
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

        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        input:focus,
        textarea:focus {
          outline: none;
        }

        a {
          text-decoration: none;
        }

        button {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

export default Portfolio;