import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import "../styles/Login.css"; // We can reuse your clean input styles here!

const CreateNotebookModal = ({ isOpen, onClose, onNotebookCreated }) => {
  const modalRef = useRef(null);
  
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // GSAP Animation for opening the modal smoothly
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle file selection (Limit to 10 files)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      setError("You can only upload a maximum of 10 documents per notebook.");
      setFiles([]);
    } else {
      setError("");
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one document.");
      return;
    }

    setIsUploading(true);
    setError("");

    // 🚨 IMPORTANT: When sending files, we MUST use FormData, not JSON!
    const formData = new FormData();
    formData.append("title", title);
    formData.append("isPublic", isPublic);
    
    // Retrieve the JWT token from localStorage (or wherever you store it)
    const token = localStorage.getItem("studyAppToken");

    // Append every file the user selected
    files.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/createnotebook", {
        method: "POST",
        // Do NOT set 'Content-Type': 'application/json' here. 
        // The browser automatically sets the correct multipart boundary for FormData!
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData, 
      });

      const data = await response.json();

      if (response.ok) {
        // Tell the parent page to update the list, then close the modal
        onNotebookCreated(data.notebook);
        onClose();
      } else {
        setError(data.message || "Failed to create notebook.");
      }
    } catch (err) {
      setError("Network error. Is your server running?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="login-card" ref={modalRef} style={{ width: '450px', margin: '0 20px' }}>
        <div className="login-header" style={{ marginBottom: '20px' }}>
          <h2>Create New Notebook</h2>
          <p>Upload your notes, PDFs, or slides to get started.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="nb-title">Notebook Title</label>
            <input
              type="text"
              id="nb-title"
              placeholder="e.g., Biology 101 Midterm Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label>Upload Documents (Max 10)</label>
            <input
              type="file"
              multiple
              accept=".pdf, .txt, .doc, .docx, .ppt, .pptx"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ padding: '10px 0' }}
            />
            {files.length > 0 && (
              <span style={{ fontSize: '12px', color: 'gray' }}>
                {files.length} file(s) selected
              </span>
            )}
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isUploading}
            />
            <label htmlFor="is-public" style={{ margin: 0, fontWeight: 'normal' }}>
              Make this notebook Public (Community can view)
            </label>
          </div>

          {error && <p className="status-msg" style={{ color: "red" }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              className="btn-submit-login" 
              style={{ background: '#e2e8f0', color: '#333' }}
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit-login"
              disabled={isUploading}
            >
              {isUploading ? "Uploading & Analyzing..." : "Create Notebook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple inline style for the dark backdrop
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

export default CreateNotebookModal;