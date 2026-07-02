import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/Login.css"; // Reusing your existing awesome styles!

const Register = () => {
  const pageScopeRef = useRef(null);

  // Standard Registration State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Google OAuth State
  const [needsUsername, setNeedsUsername] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  // validation function for the registration form
  const validateForm = () => {
    const errors = {};

    // Username Validation
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{3,20}$/;

    if (!usernameRegex.test(username)) {
      errors.username =
        "Username must be 3-20 characters, contain at least one letter, and use no special symbols.";
    }

    // Email Validation (Basic regex check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    // Strict Password Validation
    // (Requires at least 8 characters, one uppercase, one lowercase, and one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.password =
        "Password must be at least 8 characters, with 1 uppercase letter and 1 number.";
    }

    // Confirm Password Match
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);

    // If the errors object is empty, the form is valid! Returns true or false.
    return Object.keys(errors).length === 0;
  };

  //  Standard Email/Password Registration
  const handleStandardSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Your backend standard register route doesn't issue a token,
        // so we just redirect them to the login page to sign in normally.
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

  //  Google Registration Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:3000/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();

      if (data.requireUsername) {
        // New user! Switch UI to ask for their username
        setGoogleEmail(data.email);
        setNeedsUsername(true);
      } else if (response.ok) {
        // They actually already have an account, so just log them in!
        localStorage.setItem("studyAppToken", data.token);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setMessage("Google registration failed.");
    }
  };

  //  Submit the New Username (Completing Google Auth)
  const handleCompleteGoogleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3000/google/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: googleEmail, username: newUsername }),
        },
      );
      const data = await response.json();

      if (response.ok) {
        // Backend issues a token here, so log them straight in
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
        <title>SmartStudy AI - Create Account</title>
        <meta charSet="utf-8" />
      </Helmet>

      <div className="login-page-wrapper" ref={pageScopeRef}>
        <div className="login-ambient-glow"></div>

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-accent">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
                </svg>
              </div>
              <span>SmartStudy AI</span>
            </div>
            <h2>Create an account</h2>
            <p>Join us today to start managing your study notes.</p>
          </div>

          {!needsUsername ? (
            <>
              {/* --- STANDARD REGISTRATION FORM --- */}
              <form className="login-form" onSubmit={handleStandardSubmit}>
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
                    <span
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {fieldErrors.username}
                    </span>
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
                    <span
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {fieldErrors.password && (
                    <span
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {fieldErrors.confirmPassword && (
                    <span
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <button type="submit" className="btn-submit-login">
                  Sign up
                </button>

                {message && <p className="status-msg">{message}</p>}
              </form>

              <div className="divider-row">
                <span>or</span>
              </div>

              {/* --- THE GOOGLE BUTTON --- */}
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
                  text="signup_with" // Changes the button text from "Sign in" to "Sign up"
                />
              </div>

              <p className="signup-redirect">
                Already have an account? <a href="/login">Log in here</a>
              </p>
            </>
          ) : (
            /* --- THE MINI-FORM FOR NEW GOOGLE USERS --- */
            <form onSubmit={handleCompleteGoogleSignUp} className="login-form">
              <h2>Almost there!</h2>
              <p>
                You are registering with <strong>{googleEmail}</strong>.
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

export default Register;
