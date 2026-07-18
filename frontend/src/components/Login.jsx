import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { GoogleLogin } from "@react-oauth/google";
import { gsap } from "gsap";
import "../styles/Login.css";
import VibeStudyIcon from "./VibeStudyIcon";

const Login = () => {
  const pageScopeRef = useRef(null);

  // ✅ 1. Unified State: We only need one variable for the username/email input
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
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
    try {
      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ 2. Payload matches the unified state exactly
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
      setMessage(`${error}`);
    }
  };

  // Google Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/google", {
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
    }
  };

  // Submit the New Username
  const handleCompleteGoogleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/google/complete", {
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
                  {/* ✅ 3. Input is fully bound to the unified state */}
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

                <div className="form-group">
                  <div className="label-wrapper-row">
                    <label htmlFor="password">Password</label>
                    <a href="/forgot-password" className="forgot-password-link">
                      Forgot password?
                    </a>
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

              <button type="submit" className="btn-submit-login">
                Complete Setup
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