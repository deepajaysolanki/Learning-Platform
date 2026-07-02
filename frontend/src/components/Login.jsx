import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to backend
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Login successful!");

        // Save the token to the browser's memory
        localStorage.setItem("token", data.token);

        // send the user to the home page after successful login
        window.location.href = "/";
      } else {
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setMessage(`Network error: Could not reach the server ${error.message}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - Login</title>
        <meta charSet="utf-8" />
      </Helmet>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Login</h1>
          <label htmlFor="name">Email or Username</label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          {message && (
            <p style={{ fontWeight: "bold", marginTop: "10px" }}>{message}</p>
          )}
        </form>
      </div>
    </>
  );
};

export default Login;
