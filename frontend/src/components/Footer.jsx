import React, { useState } from 'react';
import '../styles/Footer.css';
import VibeStudyIcon from './VibeStudyIcon';

export default function Footer() {
  const [adminMessage, setAdminMessage] = useState("");
  const [status, setStatus] = useState(""); // "", "sending", "success", "error"

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!adminMessage.trim()) return;

  setStatus("sending");

  try {
    const token = localStorage.getItem("studyAppToken");

    const response = await fetch("https://vibestudy-backend-o61q.onrender.com/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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

          {/* 🟢 CONNECTED: TALK TO ADMIN COMPONENT HUB 🟢 */}
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
                  className="newsletter-input"
                  style={{ flex: 1 }}
                  disabled={status === "sending"}
                />
                <button 
                  type="submit" 
                  className="btn-subscribe"
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

              {status === "error" && (
                <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>
                  ⚠️ Failed to send message. Please try again.
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
            © 2026 VibeStudy, Inc. All rights reserved.
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