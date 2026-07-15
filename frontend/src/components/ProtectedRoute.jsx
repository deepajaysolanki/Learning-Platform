import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Check if the user has a token in their browser storage
  const token = localStorage.getItem("studyAppToken");

  // If no token exists, redirect them to login with a message
  if (!token) {
    return <Navigate to="/login?msg=login_required" replace />;
  }

  // If they have a token, render the protected component (like the Dashboard)
  return children;
}