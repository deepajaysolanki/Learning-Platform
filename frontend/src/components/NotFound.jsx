import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import VibeStudyIcon from "./VibeStudyIcon";
import "../styles/NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | VibeStudy</title>
      </Helmet>

      <div className="not-found-wrapper">
        <div className="not-found-card">
          <div className="not-found-icon-box">
            <VibeStudyIcon size={48} />
          </div>

          <span className="not-found-badge">404 ERROR</span>

          <h1 className="not-found-title">Oops! Page Lost in Space</h1>

          <p className="not-found-text">
            We couldn't find the page or resource you were looking for. It might have been moved, deleted, or the URL might be mistyped.
          </p>

          <div className="not-found-actions">
            <button 
              type="button" 
              className="btn-nf-secondary"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
            <Link to="/" className="btn-nf-primary">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}