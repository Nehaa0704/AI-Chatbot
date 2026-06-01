import React from "react";

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-container">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          Botmania<span>.Ai</span>
        </div>

        <ul className="nav-links">

          <li>
            <a href="#home">Home</a>
          </li>

          <li>
            <a href="#features">Features</a>
          </li>

          <li>
            <a href="#about">About</a>
          </li>

          <li>
            <a href="#contact">Contact</a>
          </li>

        </ul>

        <button
          className="login-btn"
          onClick={onStart}
        >
          Login
        </button>

      </nav>

      {/* HERO SECTION */}
      <section className="hero-section" id="home">

        <div className="hero-left">

          <div className="badge">
            ✨ AI POWERED VOICE ASSISTANT
          </div>

          <h1>
            Your AI <br />
             <span>Assistant</span>
          </h1>

          <p>
            Chat naturally, speak effortlessly,
            and get intelligent responses in real-time.
            Your personal AI companion is always ready
            to assist you.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={onStart}
            >
              Start Chatting →
            </button>

            <a href="#features">
              <button className="secondary-btn">
                Explore Features
              </button>
            </a>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="hero-right">

          <div className="mic-circle">
            🎤
          </div>

        </div>

      </section>

      {/* FEATURES SECTION */}

      <section
        className="features-section"
        id="features"
      >

        <h2 className="section-title">
          Powerful Features
        </h2>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>AI Chat</h3>

            <p>
              Smart AI conversations with
              intelligent real-time responses.
            </p>
          </div>

          <div className="feature-card">
            <h3>Voice Assistant</h3>

            <p>
              Speak naturally and interact
              using voice commands.
            </p>
          </div>

          <div className="feature-card">
            <h3>Voice Output</h3>

            <p>
              AI responds back using realistic
              speech synthesis.
            </p>
          </div>

          <div className="feature-card">
            <h3>Secure Login</h3>

            <p>
              JWT-based authentication with
              protected user sessions.
            </p>
          </div>

          <div className="feature-card">
            <h3>Chat History</h3>

            <p>
              Save and access previous
              conversations anytime.
            </p>
          </div>

          <div className="feature-card">
            <h3>Theme Customization</h3>

            <p>
              Switch between futuristic
              dark and light themes.
            </p>
          </div>

        </div>

      </section>

      {/* ABOUT SECTION */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-card">

          <div className="about-left">

            <h2>
              About <span>Botmania.AI</span>
            </h2>

            <p>
              Botmania.AI is an intelligent
              AI chatbot and voice assistant
              designed to provide smart
              real-time conversations using
              both text and voice interaction.

              The project is built using
              React, Flask, MySQL,
              JWT Authentication,
              Speech Recognition,
              and Speech Synthesis.
            </p>

          </div>

          <div className="tech-stack">

            <div>React</div>

            <div>Flask</div>

            <div>MySQL</div>

            <div>JWT Auth</div>

            <div>REST APIs</div>

            <div>Voice AI</div>

          </div>

        </div>

      </section>

      {/* CONTACT SECTION */}

      <section
        className="contact-section"
        id="contact"
      >

        <h2 className="section-title">
          Get In Touch
        </h2>

        <div className="contact-container">

          {/* LEFT */}

          <div className="contact-info">

            <h3>Project Team</h3>

            <p className = "project-title">
              Final Year Project —
              AI Chatbot with Voice Assistant
            </p>
            <div className="team-members">
                <div className="member">
                  <h4>Anshu Kumari</h4>
                  <p>Frontend & UI development</p>
                </div>
                 
                 <div className="member">
                  <h4>Neha Kumari</h4>
                  <p>Backened & Database</p>
                </div>

                <div className="member">
                  <h4>Mamta Rani Mahato</h4>
                  <p>API & Authentication</p>
                </div>

            </div>
             <div className="project-details">
                <p>📧 botmania.ai@gmail.com</p>
                <p>💻 github.com/botmania-ai</p>
             </div>
          </div>
        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <h2>
          Botmania<span>.Ai</span>
        </h2>

        <p>
          © 2026 Botmania.AI
          All rights reserved.
        </p>

      </footer>

    </div>
  );
};

export default LandingPage;