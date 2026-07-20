import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Footer.css';
import VibeStudyIcon from './VibeStudyIcon';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminMessage, setAdminMessage] = useState("");
  const [status, setStatus] = useState(""); // "", "sending", "success", "error", "auth_required"
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state on component mount
  useEffect(() => {
    const token = localStorage.getItem("studyAppToken");
    setIsLoggedIn(!!token);
  }, []);

  // Helper to scroll to section if on home, or navigate to home then scroll
  const handleScrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("studyAppToken");

    // 🟢 AUTH GUARD: Restrict sending messages if user is not logged in
    if (!token) {
      setStatus("auth_required");
      setTimeout(() => {
        navigate("/login?msg=login_required");
      }, 1500);
      return;
    }

    if (!adminMessage.trim()) return;

    setStatus("sending");

    try {
      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: adminMessage.trim(),
        }),
      });

      if (response.ok) {
        setAdminMessage("");
        setStatus("success");
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to send message to admin:", err);
      setStatus("error");
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Left Column: Brand & Talk to Admin Component */}
        <div className="footer-brand-column">
          <div className="footer-logo">
            <div className="logo-icon-box">
              <VibeStudyIcon size={36} />
            </div>
            <span className="logo-text">VibeStudy</span>
          </div>
          
          <p className="footer-tagline">
            Empowering students worldwide with intelligent, grounded AI learning companions built around your material.
          </p>

          {/* Talk to Admin Widget */}
          <div className="footer-admin-chat">
            <span className="admin-chat-label">
              💬 HAVE QUESTIONS? TALK TO ADMIN
            </span>
            <form onSubmit={handleSendMessage} className="admin-chat-form">
              <div className="admin-chat-input-row">
                <input 
                  type="text" 
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder={isLoggedIn ? "Ask admin anything..." : "Log in to message admin..."} 
                  className="newsletter-input"
                  disabled={status === "sending"}
                />
                <button 
                  type="submit" 
                  className="btn-subscribe"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending..." : "Send"}
                </button>
              </div>
              
              {status === "auth_required" && (
                <span className="status-banner error">
                  🔒 Please log in to send a message to admin. Redirecting...
                </span>
              )}

              {status === "success" && (
                <span className="status-banner success">
                  🟢 Message sent straight to the admin dashboard!
                </span>
              )}

              {status === "error" && (
                <span className="status-banner error">
                  ⚠️ Failed to send message. Please try again.
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Navigation Links */}
        <div className="footer-links-grid">
          <div className="links-group">
            <h4>Features</h4>
            <ul>
              <li>
                <button type="button" onClick={() => handleScrollToSection("how-it-works")} className="footer-link-btn">
                  Contextual Chat
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("how-it-works")} className="footer-link-btn">
                  Audio Overviews
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("how-it-works")} className="footer-link-btn">
                  Video Insights
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("how-it-works")} className="footer-link-btn">
                  Interactive Quizzes
                </button>
              </li>
            </ul>
          </div>

          <div className="links-group">
            <h4>Workflows</h4>
            <ul>
              <li>
                <button type="button" onClick={() => handleScrollToSection("workflows")} className="footer-link-btn">
                  Deep-Dive Study
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("workflows")} className="footer-link-btn">
                  Active Commute
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("workflows")} className="footer-link-btn">
                  Visual Context
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("workflows")} className="footer-link-btn">
                  Exam Readiness
                </button>
              </li>
            </ul>
          </div>

          <div className="links-group">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/notebooks">Public Marketplace</Link></li>
              <li><Link to="/dashboard">User Workspace</Link></li>
              <li>
                <button type="button" onClick={() => handleScrollToSection("how-it-works")} className="footer-link-btn">
                  Supported Uploads
                </button>
              </li>
              <li><Link to="/register">Get Started Free</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © 2026 VibeStudy, Inc. All rights reserved.
          </p>

          <div className="footer-socials">
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Twitter / X" 
              className="social-icon"
            >
              𝕏
            </a>

            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="GitHub" 
              className="social-icon"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.082.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 3.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}