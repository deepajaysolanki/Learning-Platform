import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { GoogleLogin } from "@react-oauth/google";
import { gsap } from "gsap";
import "../styles/Registration.css";
import VibeStudyIcon from "./VibeStudyIcon";

const Register = () => {
  const pageScopeRef = useRef(null);

  // Standard Registration State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Google OAuth State
  const [needsUsername, setNeedsUsername] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      tl.fromTo(
        ".registration-card",
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, delay: 0.1 }
      )
        .fromTo(
          ".reg-header > *",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          ".form-group",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.1 },
          "-=0.5"
        )
        .fromTo(
          ".btn-submit-reg, .status-msg",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          ".divider-row, .google-btn-wrapper, .signin-redirect",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.1 },
          "-=0.4"
        );
    }, pageScopeRef);

    return () => ctx.revert();
  }, []);

  const validateForm = () => {
    const errors = {};

    const fullNameRegex = /^(?=.{3,20}$)([A-Za-z]+(?: [A-Za-z]+)?)$/;
    if (!fullNameRegex.test(fullName)) {
      errors.fullName =
        "Full name must be 3-20 characters, contain letters only, and can include one space.";
    }

    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      errors.username =
        "Username must be 3-20 characters, contain at least one letter, and use no special symbols.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.password =
        "Password must be at least 8 characters, with 1 uppercase letter and 1 number.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(
        "https://vibestudy-backend-o61q.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, username, email, password }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setMessage("Account created! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("Network error.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(
        "https://vibestudy-backend-o61q.onrender.com/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        }
      );
      const data = await response.json();

      if (data.requireUsername) {
        setGoogleEmail(data.email);
        setNeedsUsername(true);
      } else if (response.ok) {
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/";
      }
    } catch (error) {
      setMessage("Google registration failed.");
    }
  };

  const handleCompleteGoogleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://vibestudy-backend-o61q.onrender.com/google/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: googleEmail, username: newUsername }),
        }
      );
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
        <title>VibeStudy - Create Account</title>
        <meta charSet="utf-8" />
      </Helmet>

      <div className="registration-page-wrapper" ref={pageScopeRef}>
        <div className="registration-ambient-glow"></div>

        <div className="registration-card">
          <div className="reg-header">
            <div className="reg-logo">
              <div className="reg-logo-accent">
                <VibeStudyIcon size={36} />
              </div>
              <span>VibeStudy</span>
            </div>
            <h2>Create an account</h2>
            <p>Join us today to start managing your study notes.</p>
          </div>

          {!needsUsername ? (
            <>
              {/* --- STANDARD REGISTRATION FORM --- */}
              <form className="registration-form" onSubmit={handleStandardSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {fieldErrors.fullName && (
                    <span className="field-error-text">{fieldErrors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Choose a unique username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {fieldErrors.username && (
                    <span className="field-error-text">{fieldErrors.username}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {fieldErrors.email && (
                    <span className="field-error-text">{fieldErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className="field-error-text">{fieldErrors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span className="field-error-text">{fieldErrors.confirmPassword}</span>
                  )}
                </div>

                <button type="submit" className="btn-submit-reg">
                  Sign up
                </button>

                {message && <p className="status-msg">{message}</p>}
              </form>

              <div className="divider-row">
                <span>or</span>
              </div>

              {/* --- GOOGLE BUTTON WRAPPER --- */}
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage("Google verification failed")}
                  text="signup_with"
                />
              </div>

              <p className="signin-redirect">
                Already have an account? <a href="/login">Log in here</a>
              </p>
            </>
          ) : (
            /* --- MINI-FORM FOR GOOGLE USERNAME CREATION --- */
            <form onSubmit={handleCompleteGoogleSignUp} className="registration-form">
              <div className="reg-header">
                <h2>Almost there!</h2>
                <p>
                  You are registering with <strong>{googleEmail}</strong>.
                </p>
              </div>

              <div className="form-group">
                <label>Please choose a unique username.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex_study"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-submit-reg">
                Complete Setup
              </button>

              {message && <p className="status-msg">{message}</p>}
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;