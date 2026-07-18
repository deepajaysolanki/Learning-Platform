import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import VibeStudyIcon from "./VibeStudyIcon";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("studyAppToken");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/profile", {
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

  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <VibeStudyIcon size={36} />
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
            VibeStudy 
          </span>
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#64748b",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            style={{
              textDecoration: "none",
              color: "#64748b",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            About
          </Link>
          <Link
            to="/notebooks"
            style={{
              textDecoration: "none",
              color: "#64748b",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Notebooks
          </Link>
        </div>

        {/* Right User Actions */}
        <div>
          {token ? (
            /* Logged In State: Profile Pill Badge */
            <button
              onClick={() => navigate("/dashboard")}
              title="Go to Dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "4px 14px 4px 6px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "30px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <img
                src={avatarUrl}
                alt={userName}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1e293b",
                  maxWidth: "120px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName}
              </span>
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
            /* 🟢 Logged Out State: Log In & Sign Up / Try Free Buttons */
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#475569",
                  fontWeight: "700",
                  fontSize: "14px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  transition: "color 0.2s",
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "20px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
                  transition: "all 0.2s ease",
                }}
              >
                Try for Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}