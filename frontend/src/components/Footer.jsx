import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Left Column: Brand & Newsletter */}
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
            Empowering students worldwide with intelligent, grounded AI learning companions.
          </p>
          <div className="footer-newsletter">
            <input type="email" placeholder="Enter your email" className="newsletter-input" />
            <button className="btn-subscribe">Subscribe</button>
          </div>
        </div>

        {/* Right Column: Multi-column links grid */}
        <div className="footer-links-grid">
          <div className="links-group">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#notebooks">Public Notebooks</a></li>
              <li><a href="#updates">Changelog</a></li>
            </ul>
          </div>

          <div className="links-group">
            <h4>Resources</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#guides">Guides & Tutorials</a></li>
              <li><a href="#community">Community Discord</a></li>
              <li><a href="#status">System Status</a></li>
            </ul>
          </div>

          <div className="links-group">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
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
            <a href="#twitter" aria-label="Twitter" className="social-icon">𝕏</a>
            <a href="#github" aria-label="GitHub" className="social-icon">🐙</a>
            <a href="#linkedin" aria-label="LinkedIn" className="social-icon">💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
}