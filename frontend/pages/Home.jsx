import React, { useState,useEffect, useRef } from "react";
import { FaFacebook, FaInstagram, FaTiktok, FaEnvelope, FaLinkedin } from "react-icons/fa";

function Portfolio() {
  const sectionRefs = useRef([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  const [isCopied, setIsCopied] = useState(false);

  const myemail = "dimalshapraveen2001@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(myemail).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset the message after 2 seconds
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    

    try {
      const response = await fetch('http://localhost:5555/send-email/form1', {
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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();

        if (responseData.success) {
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
          
          
        } else {
          alert('Failed to send email.');
        }
      } else {
        
      }
    } catch (error) {
      console.alert(error);
      alert('Error');
    }
    window.location.reload(); // Reload the page
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
          } else {
            entry.target.style.opacity = 0;
            entry.target.style.transform = "translateY(50px)";
          }
        });
      },
      { threshold: 0.3 }
    );

    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));

    // Apply the observer to text in the About section
    const aboutText = document.querySelector(".about-text");
    if (aboutText) observer.observe(aboutText);

    return () => {
      sectionRefs.current.forEach((ref) => ref && observer.unobserve(ref));
      if (aboutText) observer.unobserve(aboutText);
    };
  }, []);

  const styles = {
    app: {
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#1c1c1c",
      color: "#fff",
      minHeight: "100vh",
      overflowX: "hidden",
    },
    header: {
      backgroundColor: "#121212",
      padding: "20px",
      textAlign: "center",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    },
    navLink: {
      color: "#ffffff",
      margin: "0 15px",
      textDecoration: "none",
      fontSize: "16px",
    },
    main: {
      padding: "50px 20px",
    },
    section: {
      marginBottom: "50px",
      padding: "20px",
      backgroundColor: "#2a2a2a",
      borderRadius: "10px",
      opacity: 0,
      transform: "translateY(50px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    },
    section2: {
      marginBottom: "50px",
      padding: "20px",
      backgroundColor: "#2a2a2a",
      borderRadius: "10px",
      opacity: 0,
      transform: "translateY(50px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    },
    section3: {
      display:isMobile? 'inline-block':'flex',
      flex:"",
      marginBottom: "50px",
      padding: "50px",
      backgroundColor: "#2a2a2a",
      borderRadius: "10px",
      opacity: 0,
      transform: "translateY(40px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    },
    aboutContainer: {
      display:isMobile?"inline-block": "flex",
      alignItems: "center",
      gap: "20px",
    },
    aboutImage: {

      width:isMobile?"100%": "250px",
      height: isMobile?"100%":"auto",
      borderRadius:isMobile?"2%": "5%",
      objectFit: "cover",
      border: "3px solid #007bff",
    },
    aboutText: {
      
      flex: 1,
      opacity: 0,
      transform: "translateY(30px)",
      transition: "opacity 1s ease, transform 1s ease",
    },
    projectContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "30px",
    },
    projectCard: {
      backgroundColor: "#333",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 1.5)",
      width:"500px",
      textAlign: "center",
    },
    projectImage: {
      width:isMobile? "100%":"1000%",
      height: isMobile?"":"400px",
      borderRadius: "10px",
      marginBottom: "15px",
    },
    formContainer: {
      backgroundColor: "#2a2a2a",
      padding: "30px",
      borderRadius: "10px",
      maxWidth: "500px",
      margin: "auto",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    },
    input: {
      width: "100%",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "5px",
      border: "1px solid #555",
      backgroundColor: "#444",
      color: "#fff",
    },
    submitButton: {
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      transition: "background-color 0.3s ease",
    },
    submitButtonHover: {
      backgroundColor: "#0056b3",
    },
    footer: {
      display:isMobile? "flex":"flex",
      alignItems:isMobile?"center":"",
      backgroundColor: "#121212",
      color: "#fff",
      padding: "20px",
      textAlign: "center",
      gap:isMobile?"auto":"450px",
      width:"100%",
    },
    socialIcon: {
      alignItems:"center",
      color: "#fff",
      margin: "0 10px",
      fontSize: isMobile?"70px":"100px",
      
    },
    socialIconmail: {
      alignItems:"center",
      cursor: "pointer",
    color: isCopied ? "highlight" : "white",
      
      margin: "0 10px",
      fontSize: isMobile?"70px":"100px",
      
    },

    h1tag: {
      
      fontSize: isHovered ? "2.5em" : "2em",
      color: isHovered ? "#007BFF" : "#333",
      transition: "all 0.5s ease",
      transform: isHovered ? "rotate(0deg)" : "rotate(0deg)",
      
    },
   
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.h1tag}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >Dimalsha Praveen</h1>
        <nav>
          <a href="#about" style={styles.navLink}>
            About
          </a>
          <a href="#projects" style={styles.navLink}>
            Projects
          </a>
          <a href="#contact" style={styles.navLink}>
            Contact
          </a>
        </nav>
      </header>

      <main style={styles.main}>
        <section id="about" style={styles.section} ref={(el) => (sectionRefs.current[0] = el)}>
          <h2 style={{textAlign:"center",marginBottom:"50px",fontSize:"50px",}}
         
          >About Me</h2>
          <div style={styles.aboutContainer}>
            <img
              src="My.jpg"
              alt="Dimalsha"
              style={styles.aboutImage}
            />
            <div style={styles.aboutText} className="about-text">
              <p style={{textAlign:isMobile?"justify":"center"}}>
                <p style={{fontSize:"50px",}}>Hello! </p><p style={{fontSize:"40px",}}>I'm K.K.G.Dimalsha Praveen,</p> <p style={{fontSize:"30px",}}>a passionate developer with expertise in creating modern,
                responsive web applications. I specialize in React, Node.js, and building dynamic
                user experiences.</p>
              </p>
            </div>
          </div>
        </section>

        <section id="projects" style={styles.section2} ref={(el) => (sectionRefs.current[1] = el)}>
          <h2 style={{textAlign:"center",marginBottom:"50px",fontSize:"50px",}}>My Projects</h2>
          <div style={styles.projectContainer}>
            <div style={styles.projectCard}>
            <h3 style={{fontSize:"30px",color:""}}>Lahiru Tours</h3>
              <img
                src="photo123.png"
                alt="Project One"
                style={styles.projectImage}
              />
              
              <p>Lahiru Tours is your gateway to unforgettable adventures. Specializing in tailor-made travel experiences, we offer exclusive tour packages designed to showcase the beauty, culture, and heritage of your dream destinations. From scenic landscapes to cultural landmarks, every journey is crafted with care to ensure a seamless and enriching travel experience.Discover, explore, and create memories that last a lifetime with Lahiru Tours.</p>
            </div>
            <div style={styles.projectCard}>
            <h3 style={{fontSize:"30px",color:""}}>Yale Art School UI/UX</h3>
              <img
                src="https://via.placeholder.com/300"
                alt="Project Two"
                style={styles.projectImage}
              />
              
              <p>A brief description of Project Two.</p>
            </div>
          </div>
        </section>

        <section id="contact" style={styles.section3} ref={(el) => (sectionRefs.current[2] = el)}>
          <h2 style={{ textAlign: "left", fontSize:"30px",}}>Contact Me</h2>
          <div style={styles.formContainer}>
            <form  onSubmit={handleSubmit}>
              <input 
              type="text" 
              placeholder="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={styles.input} required />


              <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={styles.input} required />
              

              <input 
              type="tel" 
              placeholder="Phone Number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              style={styles.input} required />
              
              <textarea
                placeholder="Message"
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...styles.input, height: "100px" }}
                required
              ></textarea>


              <button
                type="submit"
                style={styles.submitButton}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor)
                }
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                Send Message
              </button>
            </form>

          </div>
          <div>
              <img style={{height:"500px",width:"1000px",borderRadius:"20px"}} src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Img" />

            </div>
        </section>
      </main>

      <footer style={styles.footer}>
        
        <a
          href="https://web.facebook.com/dimalsha.praveen/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.socialIcon}
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.instagram.com/dimalsha___praveen/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.socialIcon}
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.linkedin.com/in/dimalsha-praveen-kariyawasam/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.socialIcon}
        >
          <FaLinkedin />
        </a>
        <i  onClick={handleCopy} title="Click to copy email" style={styles.socialIconmail}>
          <FaEnvelope />
        </i>
        <p>{isCopied ? "Email copied to clipboard!" : ""}</p>
      </footer>
    </div>
  );
}

export default Portfolio;
