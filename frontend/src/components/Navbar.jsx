import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import VibeStudyIcon from "./VibeStudyIcon";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem("studyAppToken");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch("https://vibestudy-backend-o61q.onrender.com/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch navbar profile:", error);
      }
    };

    fetchUserProfile();
  }, [token]);

  const userName = user?.fullName || user?.username || "User";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=6366f1&color=fff&size=36&bold=true`;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <VibeStudyIcon size={36} />
          <span className="logo-text">VibeStudy</span>
        </Link>

        {/* Hamburger Icon (Mobile Only) */}
        <button
          className={`hamburger ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Collapsible Menu Container */}
        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="nav-links">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/notebooks" onClick={closeMenu}>Notebooks</Link>
          </div>

          <div className="nav-actions">
            {token ? (
              <button
                className="user-badge"
                onClick={() => {
                  closeMenu();
                  navigate("/dashboard");
                }}
                title="Go to Dashboard"
              >
                <img src={avatarUrl} alt={userName} className="avatar-img" />
                <span className="user-name">{userName}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login" onClick={closeMenu}>
                  Log In
                </Link>
                <Link to="/register" className="btn-register" onClick={closeMenu}>
                  Try for Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}