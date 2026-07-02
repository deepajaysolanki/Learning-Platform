import React, { useEffect, useRef, useState } from "react";
// Removed useNavigate and gsap if you aren't using them right now to clean up warnings
import { Helmet } from "react-helmet-async";
import { GoogleLogin } from "@react-oauth/google"; 
import { GoogleOAuthProvider } from '@react-oauth/google'
import { gsap } from "gsap";
import "../styles/Login.css";

const Login = () => {
  // 🔥 FIX 3: Initialize the ref
  const pageScopeRef = useRef(null);

  // Standard Login State
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // New Google OAuth State
  const [needsUsername, setNeedsUsername] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    // Premium entry animation sequence matching the rest of the application
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      
      tl.fromTo(".login-card", { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, delay: 0.1 })
        .fromTo(".login-header > *", { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.4")
        .fromTo(".form-group", { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.5")
        .fromTo(".btn-submit-login, .status-msg", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, stagger: 0.1 }, "-=0.4")
        .fromTo(".divider-row, .btn-google-login, .signup-redirect", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.4");
    }, pageScopeRef);

    return () => ctx.revert();
  }, []);

  // 🟢 Standard Email/Password Login
  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/dashboard";
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      setMessage("Network error.");
    }
  };

  // 🟢 Google Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:3000/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();

      if (data.requireUsername) {
        setGoogleEmail(data.email);
        setNeedsUsername(true); 
      } else if (response.ok) {
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.log("THE REAL ERROR IS:", error);
      setMessage("Google login failed.");
    }
  };

  // 🟢 Submit the New Username
  const handleCompleteGoogleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, username: newUsername }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/dashboard";
      } else {
        setMessage(data.message); 
      }
    } catch (error) {
      setMessage("Error completing setup.");
    }
  };

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - Login</title>
        <meta charSet="utf-8" />
      </Helmet>

      <div className="login-page-wrapper" ref={pageScopeRef}>
        <div className="login-ambient-glow"></div>

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-accent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
                </svg>
              </div>
              <span>SmartStudy AI</span>
            </div>
            <h2>Sign in</h2>
            <p>Welcome back! Please enter your details to continue.</p>
          </div>

          {!needsUsername ? (
            /*  Wrapped the true condition in a React Fragment */
            <>
              {/*  Corrected the onSubmit function name */}
              <form className="login-form" onSubmit={handleStandardSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Email or username</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="you@email.com or @username"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div className="label-wrapper-row">
                    <label htmlFor="password">Password</label>
                    <a href="/forgot-password" className="forgot-password-link">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-submit-login">
                  Sign in
                </button>

                {message && (
                  <p className="status-msg">{message}</p>
                )}
              </form>
          
              <div className="divider-row">
                <span>or</span>
              </div>

              {/*  Used the official component so the backend receives the correct token */}
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => setMessage("Google verification failed")} 
                />
              </div>

              <p className="signup-redirect">
                Don't have an account? <a href="/register">Sign up free</a>
              </p>
            </>
          ) : (
            <form onSubmit={handleCompleteGoogleSignUp} className="login-form">
              <h2>Almost there!</h2>
              <p>You are signing in as <strong>{googleEmail}</strong>.</p>
              
              <div className="form-group">
                <label>Please choose a unique username.</label>
                <input 
                  type="text" 
                  required 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                />
              </div>
              
              <button type="submit" className="btn-submit-login">
                Complete Setup
              </button>
              
              {message && <p className="status-msg" style={{ color: "red" }}>{message}</p>}
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;