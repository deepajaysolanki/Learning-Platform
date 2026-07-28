import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { GoogleLogin } from "@react-oauth/google";
import { gsap } from "gsap";
import "../styles/Login.css";
import VibeStudyIcon from "./VibeStudyIcon";

const Login = () => {
  const pageScopeRef = useRef(null);

  // Form State
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Google OAuth State
  const [needsUsername, setNeedsUsername] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("msg") === "login_required") {
      setMessage("Please log in or create an account to access this feature.");
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      tl.fromTo(".login-card", { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, delay: 0.1 })
        .fromTo(".login-header > *", { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.4")
        .fromTo(".form-group", { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.5")
        .fromTo(".btn-submit-login, .status-msg", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, stagger: 0.1 }, "-=0.4")
        .fromTo(".divider-row, .btn-google-login, .signup-redirect", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.4");
    }, pageScopeRef);

    return () => ctx.revert();
  }, []);

  // Standard Email/Password Login
  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://vibestudy-backend-avmi.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON. Check your backend route URL!");
      }

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/";
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      setMessage("Login Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://vibestudy-backend-avmi.onrender.com/google", {
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
        window.location.href = "/";
      }
    } catch (error) {
      console.log("THE REAL ERROR IS:", error);
      setMessage("Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit the New Username
  const handleCompleteGoogleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("https://vibestudy-backend-avmi.onrender.com/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, username: newUsername }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/";
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error completing setup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>VibeStudy - Login</title>
        <meta charSet="utf-8" />
      </Helmet>

      <div className="login-page-wrapper" ref={pageScopeRef}>
        <div className="login-ambient-glow"></div>

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-accent">
                <VibeStudyIcon size={36} />
              </div>
              <span>VibeStudy</span>
            </div>
            <h2>Sign in</h2>
            <p>Welcome back! Please enter your details to continue.</p>
          </div>

          {!needsUsername ? (
            <>
              <form className="login-form" onSubmit={handleStandardSubmit}>
                <div className="form-group">
                  <label htmlFor="emailOrUsername">Email or username</label>
                  <input
                    type="text"
                    id="emailOrUsername"
                    name="emailOrUsername"
                    placeholder="you@email.com or @username"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                  />
                </div>

                <div className="form-group password-field-group" style={{ position: "relative" }}>
                  <label htmlFor="password">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "38px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#888",
                      display: "flex",
                      alignItems: "center"
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      // Eye Off Icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      // Eye Icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                <button type="submit" className="btn-submit-login" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>

                {message && <p className="status-msg">{message}</p>}
              </form>

              <div className="divider-row">
                <span>or</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
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
              <p>
                You are signing in as <strong>{googleEmail}</strong>.
              </p>

              <div className="form-group">
                <label>Please choose a unique username.</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-submit-login" disabled={isLoading}>
                {isLoading ? "Completing setup..." : "Complete Setup"}
              </button>

              {message && (
                <p className="status-msg" style={{ color: "red" }}>
                  {message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;