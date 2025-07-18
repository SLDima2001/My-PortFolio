import React, { useState, useEffect, useRef } from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaEnvelope, FaLinkedin, FaDownload, FaCode, FaEye, FaArrowRight } from "react-icons/fa";

function Portfolio() {
  const sectionRefs = useRef([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCopied, setIsCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
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
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
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

  const styles = {
    app: {
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
      color: "#ffffff",
      minHeight: "100vh",
      overflowX: "hidden",
      position: "relative",
    },
    
    // Animated background elements
    backgroundPattern: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `
        radial-gradient(circle at 20% 50%, rgba(0, 123, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 0, 150, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(0, 255, 150, 0.1) 0%, transparent 50%)
      `,
      zIndex: -1,
      animation: "float 20s ease-in-out infinite",
    },

    header: {
      background: "rgba(10, 10, 10, 0.95)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "20px 40px",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: "all 0.3s ease",
      transform: `translateY(${scrollY > 50 ? '0' : '0'})`,
      boxShadow: scrollY > 50 ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "none",
    },

    headerContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      maxWidth: "1200px",
      margin: "0 auto",
    },

    logo: {
      fontSize: "24px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #007bff 0%, #00d4ff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },

    nav: {
      display: "flex",
      gap: "30px",
      alignItems: "center",
    },

    navLink: {
      color: "#ffffff",
      textDecoration: "none",
      fontSize: "16px",
      fontWeight: "500",
      position: "relative",
      transition: "all 0.3s ease",
      padding: "8px 16px",
      borderRadius: "8px",
    },

    navLinkActive: {
      background: "rgba(0, 123, 255, 0.1)",
      color: "#007bff",
    },

    main: {
      paddingTop: "100px",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "100px 20px 0",
    },

    heroSection: {
      minHeight: "90vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "60px",
      marginBottom: "100px",
      flexDirection: isMobile ? "column" : "row",
    },

    heroContent: {
      flex: 1,
      zIndex: 2,
    },

    heroTitle: {
      fontSize: isMobile ? "48px" : "72px",
      fontWeight: "800",
      lineHeight: "1.1",
      marginBottom: "20px",
      background: "linear-gradient(135deg, #ffffff 0%, #007bff 50%, #00d4ff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },

    heroSubtitle: {
      fontSize: isMobile ? "20px" : "24px",
      color: "#b0b0b0",
      marginBottom: "30px",
      fontWeight: "300",
    },

    heroDescription: {
      fontSize: "18px",
      lineHeight: "1.6",
      color: "#d0d0d0",
      marginBottom: "40px",
    },

    ctaButtons: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
    },

    primaryButton: {
      background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
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
      gap: "8px",
      boxShadow: "0 8px 32px rgba(0, 123, 255, 0.3)",
    },

    secondaryButton: {
      background: "rgba(255, 255, 255, 0.1)",
      color: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "16px 32px",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },

    heroImage: {
      width: isMobile ? "280px" : "400px",
      height: isMobile ? "280px" : "400px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid transparent",
      background: "linear-gradient(135deg, #007bff, #00d4ff) padding-box, linear-gradient(135deg, #007bff, #00d4ff) border-box",
      boxShadow: "0 20px 60px rgba(0, 123, 255, 0.3)",
      transition: "all 0.5s ease",
    },

    section: {
      marginBottom: "120px",
      opacity: 0,
      transform: "translateY(50px)",
      transition: "all 0.8s ease",
    },

    sectionTitle: {
      fontSize: isMobile ? "36px" : "48px",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "60px",
      background: "linear-gradient(135deg, #ffffff 0%, #007bff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },

    projectGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "40px",
      marginTop: "60px",
    },

    projectCard: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "30px",
      transition: "all 0.3s ease",
      cursor: "pointer",
      overflow: "hidden",
      position: "relative",
    },

    projectImage: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
      borderRadius: "12px",
      marginBottom: "20px",
      transition: "all 0.3s ease",
    },

    projectTitle: {
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "15px",
      color: "#ffffff",
    },

    projectDescription: {
      color: "#b0b0b0",
      lineHeight: "1.6",
      marginBottom: "20px",
    },

    projectLinks: {
      display: "flex",
      gap: "15px",
    },

    projectLink: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#007bff",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease",
    },

    contactSection: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "60px 40px",
      marginBottom: "60px",
    },

    contactGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "60px",
      alignItems: "center",
    },

    formContainer: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      padding: "40px",
    },

    input: {
      width: "100%",
      padding: "16px",
      margin: "10px 0",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      background: "rgba(255, 255, 255, 0.1)",
      color: "#ffffff",
      fontSize: "16px",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },

    contactImage: {
      width: "100%",
      height: "400px",
      objectFit: "cover",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    },

    footer: {
      background: "rgba(10, 10, 10, 0.95)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "60px 40px 40px",
      textAlign: "center",
    },

    socialIcons: {
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      marginBottom: "40px",
    },

    socialIcon: {
      fontSize: "32px",
      color: "#ffffff",
      transition: "all 0.3s ease",
      cursor: "pointer",
      padding: "16px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "50%",
      backdropFilter: "blur(10px)",
    },

    copyMessage: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: "rgba(0, 123, 255, 0.9)",
      color: "#ffffff",
      padding: "16px 24px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: 1000,
      transform: isCopied ? "translateY(0)" : "translateY(100px)",
      opacity: isCopied ? 1 : 0,
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={styles.app}>
      <div style={styles.backgroundPattern}></div>
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div 
            style={styles.logo}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Dimalsha Praveen
          </div>
          <nav style={styles.nav}>
            <a href="#about" style={{...styles.navLink, ...(activeSection === 'about' ? styles.navLinkActive : {})}}>
              About
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
        {/* Hero Section */}
        <section style={styles.heroSection} id="about" ref={(el) => (sectionRefs.current[0] = el)}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Hello! I'm<br />
              K.K.G.Dimalsha Praveen
            </h1>
            <p style={styles.heroSubtitle}>
              Full Stack Developer & UI/UX Designer
            </p>
            <p style={styles.heroDescription}>
              A passionate developer with expertise in creating modern, responsive web applications. 
              I specialize in React, Node.js, and building dynamic user experiences that combine 
              beautiful design with powerful functionality.
            </p>
            <div style={styles.ctaButtons}>
              <button 
                style={styles.primaryButton}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 123, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 123, 255, 0.3)";
                }}
                onClick={handleDownloadCV}
              >
                <FaDownload />
                Download CV
              </button>
              <button 
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.2)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                Get In Touch
              </button>
            </div>
          </div>
          <img
            src="https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/My.jpg?raw=true"
            alt="Dimalsha Praveen"
            style={styles.heroImage}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 25px 70px rgba(0, 123, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 20px 60px rgba(0, 123, 255, 0.3)";
            }}
          />
        </section>

        {/* Projects Section */}
        <section id="projects" style={styles.section} ref={(el) => (sectionRefs.current[1] = el)}>
          <h2 style={styles.sectionTitle}>Featured Projects</h2>
          
          <div style={styles.projectGrid}>
            <div 
              style={styles.projectCard}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-10px)";
                e.target.style.boxShadow = "0 25px 70px rgba(0, 123, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <img
                src="https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/photo123.png?raw=true"
                alt="Lahiru Tours"
                style={styles.projectImage}
              />
              <h3 style={styles.projectTitle}>Lahiru Tours</h3>
              <p style={styles.projectDescription}>
                A comprehensive tour booking platform featuring tailor-made travel experiences, 
                showcasing beautiful destinations with seamless user experience and modern design.
              </p>
              <div style={styles.projectLinks}>
                <a href="https://lahirutours.co.uk/" style={styles.projectLink}>
                  <FaEye /> Live Demo
                </a>
                <a href="#" style={styles.projectLink}>
                  <FaCode /> Source Code
                </a>
              </div>
            </div>

            <div 
              style={styles.projectCard}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-10px)";
                e.target.style.boxShadow = "0 25px 70px rgba(0, 123, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <img
                src="https://github.com/SLDima2001/My-PortFolio/blob/main/frontend/Project%202.png?raw=true"
                alt="Yale Art School UI/UX"
                style={styles.projectImage}
              />
              <h3 style={styles.projectTitle}>Yale Art School UI/UX</h3>
              <p style={styles.projectDescription}>
                A modern UI/UX design for Yale School of Art, incorporating creativity and innovation 
                with aesthetic and functional elements that align with the institution's prestige.
              </p>
              <div style={styles.projectLinks}>
                <a href="https://www.figma.com/proto/0ZqKjHGHQUoh4rqVAu3q1H/HCI?node-id=109-67&node-type=canvas&t=wgjCtr4Sy2AXhhh2-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=109%3A67" style={styles.projectLink}>
                  <FaEye /> View Design
                </a>
                <a href="#" style={styles.projectLink}>
                  <FaCode /> Case Study
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" style={styles.section} ref={(el) => (sectionRefs.current[2] = el)}>
          <h2 style={styles.sectionTitle}>Let's Work Together</h2>
          
          <div style={styles.contactSection}>
            <div style={styles.contactGrid}>
              <div style={styles.formContainer}>
                <form onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = "#007bff"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
                    required 
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = "#007bff"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
                    required 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = "#007bff"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
                    required 
                  />
                  <textarea
                    placeholder="Your Message"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ ...styles.input, height: "120px", resize: "vertical" }}
                    onFocus={(e) => e.target.style.borderColor = "#007bff"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
                    required
                  />
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 12px 40px rgba(0, 123, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 8px 32px rgba(0, 123, 255, 0.3)";
                    }}
                  >
                    Send Message <FaArrowRight />
                  </button>
                </form>
              </div>
              
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Contact" 
                style={styles.contactImage}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.socialIcons}>
          <a
            href="https://web.facebook.com/dimalsha.praveen/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.socialIcon}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.background = "rgba(24, 119, 242, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.instagram.com/dimalsha___praveen/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.socialIcon}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.background = "rgba(225, 48, 108, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.linkedin.com/in/dimalsha-praveen-kariyawasam/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.socialIcon}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.background = "rgba(0, 119, 181, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <FaLinkedin />
          </a>
          <div
            onClick={handleCopy}
            style={{...styles.socialIcon, color: isCopied ? "#007bff" : "#ffffff"}}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.background = "rgba(0, 123, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <FaEnvelope />
          </div>
        </div>
        <p style={{color: "#b0b0b0", fontSize: "14px"}}>
          © 2024 Dimalsha Praveen. All rights reserved.
        </p>
      </footer>

      {/* Copy Success Message */}
      <div style={styles.copyMessage}>
        📧 Email copied to clipboard!
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(1deg); }
          66% { transform: translateY(-20px) rotate(-1deg); }
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default Portfolio;