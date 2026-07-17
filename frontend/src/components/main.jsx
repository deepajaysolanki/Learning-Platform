import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../styles/index.css";
import App from "./App.jsx";
import Home from "./Home.jsx";
import About from "./About.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import Notebooks from "./Notebooks.jsx";
import Registration from "./Registration.jsx";
import Login from "./Login.jsx";
import MyNotebooks from "./MyNotebooks.jsx";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatPage from "./ChatPage.jsx";
import QuizPage from "./QuizPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import UserDashboard from "./UserDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

function MainApp() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/notebooks" element={<Notebooks />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-notebooks" element={<MyNotebooks />} />
        <Route path="/notebook/:id/study" element={<ChatPage />} />
        <Route path="/notebook/:id/quiz" element={<QuizPage />} />
        <Route path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </>
  );
}
console.log(
  "GOOGLE_CLIENT_ID from env:",
  import.meta.env.VITE_GOOGLE_CLIENT_ID,
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <MainApp />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
