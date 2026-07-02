import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../styles/index.css";
import App from "../components/App.jsx";
import Home from "../components/Home.jsx";
import About from "../components/About.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Notebooks from "../components/Notebooks.jsx";
import Registration from "./Registration.jsx";
import Login from "./Login.jsx";
import { HelmetProvider } from "react-helmet-async";

function MainApp() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/notebooks" element={<Notebooks />} />
        <Route path="/api/auth/register" element={<Registration />} />
        <Route path="/api/auth/login" element={<Login />} />
      </Routes>
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
