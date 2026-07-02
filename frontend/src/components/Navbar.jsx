import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  // Check if the user is logged in right now
  const token = localStorage.getItem("studyAppToken");
  console.log("Token from localStorage:", token); // Debugging line

  // The Logout Function
  const handleLogout = () => {
    localStorage.removeItem("studyAppToken"); // Throw away the token
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            {/* Grid Icon representation */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
            </svg>
          </div>
          <span className="logo-text">SmartStudy AI</span>
        </Link>
        
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/notebooks">Notebooks</Link></li>
        </ul>
        
        <div className="nav-actions">
          {token ? (
            <>
              <button onClick={handleLogout} className="btn-primary-nav">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-signin">Sign in</Link>
              <Link to="/register" className="btn-primary-nav">Try for free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;