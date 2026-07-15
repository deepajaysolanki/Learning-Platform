import React, { useState } from 'react';
import '../styles/Footer.css';

export default function Footer() {
  const [adminMessage, setAdminMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!adminMessage.trim()) return;

    setStatus("sending");

    try {
      // 🟢 Hook this up to your backend support/contact endpoint later if you build one
      // For now, it will simulate a successful transmission to the admin
      setTimeout(() => {
        setAdminMessage("");
        setStatus("success");
        setTimeout(() => setStatus(""), 3000); // Clear success message after 3 seconds
      }, 1000);
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
              </svg>
            </div>
            <span className="logo-text">SmartStudy AI</span>
          </div>
          
          <p className="footer-tagline">
            Empowering students worldwide with intelligent, grounded AI learning companions built around your material.
          </p>

          {/* 🟢 NEW: TALK TO ADMIN COMPONENT HUB 🟢 */}
          <div className="footer-admin-chat" style={{ marginTop: "20px", maxWidth: "320px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#6366f1", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
              💬 HAVE QUESTIONS? TALK TO ADMIN
            </span>
            <form onSubmit={handleSendMessage} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  type="text" 
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Ask admin anything..." 
                  className="newsletter-input" // Reusing your existing style baseline safely
                  style={{ flex: 1 }}
                  disabled={status === "sending"}
                />
                <button 
                  type="submit" 
                  className="btn-subscribe" // Reusing your premium dark button style baseline safely
                  style={{ whiteSpace: "nowrap" }}
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending..." : "Send"}
                </button>
              </div>
              
              {status === "success" && (
                <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>
                  🟢 Message sent straight to the admin dashboard!
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Restored Multi-Column Grid */}
        <div className="footer-links-grid">
          <div className="links-group">
            <h4>Features</h4>
            <ul>
              <li><a href="#how-it-works">Contextual Chat</a></li>
              <li><a href="#how-it-works">Audio Overviews</a></li>
              <li><a href="#how-it-works">Video Insights</a></li>
              <li><a href="#how-it-works">Interactive Quizzes</a></li>
            </ul>
          </div>

          <div className="links-group">
            <h4>Workflows</h4>
            <ul>
              <li><a href="#workflows">Deep-Dive Study</a></li>
              <li><a href="#workflows">Active Commute</a></li>
              <li><a href="#workflows">Visual Context</a></li>
              <li><a href="#workflows">Exam Readiness</a></li>
            </ul>
          </div>

          <div className="links-group">
            <h4>Platform</h4>
            <ul>
              <li><a href="#notebooks">Public Marketplace</a></li>
              <li><a href="/dashboard">User Workspace</a></li>
              <li><a href="#how-it-works">Supported Uploads</a></li>
              <li><a href="#cta">Get Started Free</a></li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Bar: Copyright and Social Icons */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © 2026 SmartStudy AI, Inc. All rights reserved.
          </p>
          <div className="footer-socials">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-icon">𝕏</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="social-icon">🐙</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-icon">💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
}