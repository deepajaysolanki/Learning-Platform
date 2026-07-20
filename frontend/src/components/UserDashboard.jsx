import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../styles/UserDashboard.css"; // 🟢 Import external CSS

// 🟢 REUSABLE INTERACTIVE LIKE BUTTON
const DashLikeButton = ({ notebookId, initialLikes, initialIsLiked }) => {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);

  useEffect(() => {
    setLikes(initialLikes || 0);
    setIsLiked(initialIsLiked || false);
  }, [initialLikes, initialIsLiked]);

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("studyAppToken");
    if (!token) return;

    // Optimistic Update
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);

    try {
      const response = await fetch(`https://vibestudy-backend-o61q.onrender.com/like/${notebookId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setLikes(data.likes);
        setIsLiked(data.isLiked);
      } else {
        setLikes(initialLikes || 0);
        setIsLiked(initialIsLiked || false);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setLikes(initialLikes || 0);
      setIsLiked(initialIsLiked || false);
    }
  };

  return (
    <button
      type="button"
      className="like-button"
      onClick={handleToggleLike}
      title={isLiked ? "Unlike Notebook" : "Like Notebook"}
      style={{ color: isLiked ? "#ff4757" : "#64748b" }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isLiked ? "#ff4757" : "none"}
        stroke={isLiked ? "#ff4757" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span>{likes}</span>
    </button>
  );
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");

  // --- USER STATES ---
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NOTEBOOK STATES ---
  const [myNotebooks, setMyNotebooks] = useState([]);
  const [savedNotebooks, setSavedNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const [notebookError, setNotebookError] = useState("");

  // --- SEARCH & FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("All Notebooks");

  // --- PASSWORD STATES ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // --- FETCH PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("studyAppToken");
      try {
        const response = await fetch("https://vibestudy-backend-o61q.onrender.com/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- FETCH SAVED NOTEBOOKS ---
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedNotebooks();
    }
  }, [activeTab]);

  const fetchSavedNotebooks = async () => {
    try {
      const token = localStorage.getItem("studyAppToken");
      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/saved-notebooks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSavedNotebooks(data.savedNotebooks || []);
      }
    } catch (err) {
      console.error("Error fetching saved notebooks", err);
    }
  };

  // --- FETCH MY NOTEBOOKS ---
  useEffect(() => {
    if (activeTab === "notebooks") {
      fetchMyNotebooks();
    }
  }, [activeTab]);

  const fetchMyNotebooks = async () => {
    setLoadingNotebooks(true);
    setNotebookError("");
    const token = localStorage.getItem("studyAppToken");

    try {
      const res = await fetch("https://vibestudy-backend-o61q.onrender.com/my-notebooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        if (Array.isArray(data)) {
          setMyNotebooks(data);
        } else if (data.notebooks && Array.isArray(data.notebooks)) {
          setMyNotebooks(data.notebooks);
        } else {
          setMyNotebooks([]);
        }
      } else {
        setNotebookError(data.message || "Failed to fetch your notebooks.");
      }
    } catch (err) {
      setNotebookError("A network error occurred while fetching notebooks.");
    } finally {
      setLoadingNotebooks(false);
    }
  };

  // --- DELETE MY NOTEBOOK ---
  const handleDeleteNotebook = async (notebookId) => {
    if (!window.confirm("Are you sure you want to delete this notebook? This cannot be undone.")) return;

    const token = localStorage.getItem("studyAppToken");
    try {
      const res = await fetch(`https://vibestudy-backend-o61q.onrender.com/notebook/${notebookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMyNotebooks((prev) => prev.filter((nb) => (nb._id || nb.id) !== notebookId));
        alert("Notebook deleted successfully!");
      } else {
        alert("Failed to delete the notebook.");
      }
    } catch (err) {
      alert("Network error while trying to delete.");
    }
  };

  // --- REMOVE FROM SAVED NOTEBOOKS ---
  const handleRemoveSavedNotebook = async (notebookId) => {
    const token = localStorage.getItem("studyAppToken");
    if (!token) return;

    setSavedNotebooks((prev) => prev.filter((nb) => (nb.id || nb._id) !== notebookId));

    try {
      const response = await fetch(`https://vibestudy-backend-o61q.onrender.com/save-notebook/${notebookId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        fetchSavedNotebooks();
      }
    } catch (err) {
      console.error("Failed to remove saved notebook:", err);
      fetchSavedNotebooks();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studyAppToken");
    navigate("/");
  };

  // --- FILTER LOGIC FOR MY NOTEBOOKS ---
  const filteredNotebooks = Array.isArray(myNotebooks)
    ? myNotebooks.filter((notebook) => {
        const matchesSearch = (notebook.title || "Untitled Notebook")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const isPublic = notebook.isPublic || notebook.visibility === "public";

        let matchesVisibility = true;
        if (visibilityFilter === "Public Only") matchesVisibility = isPublic;
        if (visibilityFilter === "Private Only") matchesVisibility = !isPublic;

        return matchesSearch && matchesVisibility;
      })
    : [];

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  const pageTitle =
    activeTab === "notebooks"
      ? "My Notebooks"
      : activeTab === "saved"
      ? "Saved Notebooks"
      : "Profile Settings";

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>{pageTitle} | Quizolve</title>
        <meta name="description" content="Manage your Quizolve account and notebooks." />
      </Helmet>

      {/* SIDEBAR */}
      <div className="dashboard-sidebar-wrapper">
        <div className="dashboard-sidebar">
          <h2 className="sidebar-heading">
            Welcome, {userData?.username || "User"}!
          </h2>

          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab("settings")}
              className={`sidebar-btn ${activeTab === "settings" ? "active" : ""}`}
            >
              ⚙️ Profile Settings
            </button>

            <button
              onClick={() => setActiveTab("notebooks")}
              className={`sidebar-btn ${activeTab === "notebooks" ? "active" : ""}`}
            >
              📚 My Notebooks
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`sidebar-btn ${activeTab === "saved" ? "active" : ""}`}
            >
              🔖 Saved Notebooks
            </button>

            {userData?.role === "admin" && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="sidebar-btn-admin"
              >
                🛡️ Admin Panel
              </button>
            )}

            <button onClick={handleLogout} className="sidebar-btn-logout">
              🚪 Logout
            </button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="dashboard-main">
        <div className="dashboard-content-wrapper">
          
          {/* TAB 1: MY NOTEBOOKS */}
          {activeTab === "notebooks" && (
            <div>
              <h1 className="dash-title">My Notebooks</h1>
              <p className="dash-subtitle">Manage your private and public collections</p>

              {/* SEARCH & FILTER ROW */}
              <div className="search-filter-row">
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="dash-search-input"
                    placeholder="Search my notebooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="dash-filter-select"
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                >
                  <option value="All Notebooks">All Notebooks</option>
                  <option value="Public Only">Public Only</option>
                  <option value="Private Only">Private Only</option>
                </select>
              </div>

              {notebookError && (
                <div className="dash-error-banner">⚠️ {notebookError}</div>
              )}

              {loadingNotebooks ? (
                <div className="dash-loading-state">⏳ Loading your notebooks...</div>
              ) : filteredNotebooks.length === 0 ? (
                <div className="dash-empty-state">
                  <h3>No Notebooks Found</h3>
                  <p>
                    {myNotebooks.length === 0
                      ? "You haven't created any study materials yet."
                      : "No notebooks match your search."}
                  </p>
                  <button onClick={() => navigate("/notebooks")} className="dash-primary-btn">
                    Create Notebook
                  </button>
                </div>
              ) : (
                <div className="notebooks-grid">
                  {filteredNotebooks.map((notebook, index) => {
                    const isPublic = notebook.isPublic || notebook.visibility === "public";
                    const notebookId = notebook._id || notebook.id;

                    return (
                      <div key={notebookId || index} className="notebook-card">
                        <div className="card-header">
                          <div className="card-icon-box blue">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M4 19V5C4 3.89543 4.89543 3 6 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H6C4.89543 21 4 20.1046 4 19ZM4 19C4 20.1046 4.89543 21 6 21H19"
                                stroke="#3b82f6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9 3V21"
                                stroke="#3b82f6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="card-title">
                              {notebook.title || "Untitled Notebook"}
                            </h3>
                            <div className="visibility-badge">
                              {isPublic ? (
                                <>
                                  <span className="badge-dot">🟢</span> Public
                                </>
                              ) : (
                                <>
                                  <span>🔒</span> Private
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="card-summary-box">
                          <div className="summary-header">
                            <div className="summary-dot"></div>
                            <span className="summary-label">Summary</span>
                          </div>
                          <p className="summary-text">
                            {notebook.description || notebook.summary || "No description provided."}
                          </p>
                        </div>

                        <div className="card-actions-grid">
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/study`)}
                            className="btn-card-action"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/quiz`)}
                            className="btn-card-action"
                          >
                            Quiz
                          </button>
                        </div>

                        <div className="card-footer">
                          <div className="footer-left-actions">
                            <DashLikeButton
                              notebookId={notebookId}
                              initialLikes={notebook.likes}
                              initialIsLiked={notebook.isLiked}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteNotebook(notebookId)}
                              title="Delete Notebook"
                              className="btn-card-delete"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                          <span className="card-author-handle">
                            @{userData?.username || "You"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED NOTEBOOKS */}
          {activeTab === "saved" && (
            <div>
              <h1 className="dash-title">Saved Notebooks</h1>
              <p className="dash-subtitle">Community notebooks you have bookmarked for study</p>

              {savedNotebooks.length === 0 ? (
                <div className="dash-empty-state">
                  <h3>No Saved Notebooks</h3>
                  <p>You haven't bookmarked any public notebooks yet.</p>
                  <button onClick={() => navigate("/notebooks")} className="dash-primary-btn">
                    Browse Community Feed
                  </button>
                </div>
              ) : (
                <div className="notebooks-grid">
                  {savedNotebooks.map((notebook, index) => {
                    const notebookId = notebook.id || notebook._id;

                    return (
                      <div key={notebookId || index} className="notebook-card">
                        <div className="card-header">
                          <div className="card-icon-box green">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="card-title">{notebook.title}</h3>
                            <span className="card-author-handle">By {notebook.author}</span>
                          </div>
                        </div>

                        <div className="card-summary-box">
                          <span className="summary-label" style={{ display: "block", marginBottom: "8px" }}>
                            Summary
                          </span>
                          <p className="summary-text">
                            {notebook.summary || "No summary available."}
                          </p>
                        </div>

                        <div className="card-actions-grid three-col">
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/study`)}
                            className="btn-card-action primary"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/quiz`)}
                            className="btn-card-action"
                          >
                            Quiz
                          </button>
                          <button
                            onClick={() => handleRemoveSavedNotebook(notebookId)}
                            className="btn-card-action danger"
                            title="Remove from saved notebooks"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="card-footer">
                          <DashLikeButton
                            notebookId={notebookId}
                            initialLikes={notebook.likes}
                            initialIsLiked={notebook.isLiked}
                          />
                          <span className="card-author-handle">{notebook.author}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === "settings" && (
            <div>
              <h1 className="dash-title">Profile Settings</h1>

              <div className="settings-card">
                <div className="avatar-header-row">
                  <img
                    src={`https://ui-avatars.com/api/?name=${userData?.fullName || userData?.username || "User"}&background=6366f1&color=fff&size=80&bold=true`}
                    alt="Profile Avatar"
                    className="settings-avatar"
                  />
                  <div>
                    <h2 className="user-display-name">
                      {userData?.fullName || userData?.username}
                    </h2>
                    <p className="user-display-sub">Manage your personal information</p>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem("studyAppToken");
                    try {
                      const res = await fetch("https://vibestudy-backend-o61q.onrender.com/profile", {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          username: userData.username,
                          fullName: userData.fullName,
                        }),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        alert("Profile updated successfully!");
                      } else {
                        alert(data.message || "Failed to update profile.");
                      }
                    } catch (err) {
                      alert("A network error occurred.");
                    }
                  }}
                  className="form-group-col"
                >
                  <div>
                    <label className="form-field-label">Full Name</label>
                    <input
                      type="text"
                      className="form-text-input"
                      placeholder="e.g. Jane Doe"
                      value={userData?.fullName || ""}
                      onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">Username</label>
                    <input
                      type="text"
                      className="form-text-input"
                      value={userData?.username || ""}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-field-label">Email Address</label>
                    <input
                      type="email"
                      className="form-text-input disabled"
                      value={userData?.email || ""}
                      disabled
                    />
                    <p className="form-field-help">
                      Emails cannot be changed directly for security reasons.
                    </p>
                  </div>

                  <button type="submit" className="btn-save-settings">
                    Save Changes
                  </button>
                </form>
              </div>

              {/* SECURITY / PASSWORD SECTION */}
              <div className="settings-card">
                <h3 style={{ margin: "0 0 20px 0" }}>Security</h3>

                {userData?.googleId ? (
                  <div>
                    <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "10px" }}>
                      Your account is managed via Google. You do not need a password.
                    </p>
                    <div className="google-auth-badge">
                      <span>🛡️</span> Google Authenticated
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setPasswordError("");
                      setPasswordSuccess("");

                      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
                      if (!passwordRegex.test(passwordData.newPassword)) {
                        return setPasswordError(
                          "Password must be at least 8 characters, with 1 uppercase letter and 1 number."
                        );
                      }

                      if (passwordData.newPassword !== passwordData.confirmPassword) {
                        return setPasswordError("New passwords do not match!");
                      }

                      const token = localStorage.getItem("studyAppToken");

                      try {
                        const res = await fetch("https://vibestudy-backend-o61q.onrender.com/profile/password", {
                          method: "PUT",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            currentPassword: passwordData.currentPassword,
                            newPassword: passwordData.newPassword,
                          }),
                        });

                        const data = await res.json();

                        if (res.ok) {
                          setPasswordSuccess("Password updated successfully!");
                          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        } else {
                          setPasswordError(data.message || "Failed to update password.");
                        }
                      } catch (err) {
                        setPasswordError("Network error occurred. Please try again.");
                      }
                    }}
                    className="form-group-col"
                  >
                    {passwordError && (
                      <div className="dash-error-banner">⚠️ {passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="dash-error-banner" style={{ backgroundColor: "#dcfce7", color: "#166534", borderColor: "#22c55e" }}>
                        ✅ {passwordSuccess}
                      </div>
                    )}

                    <div>
                      <label className="form-field-label">Current Password</label>
                      <input
                        type="password"
                        className="form-text-input"
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-field-label">New Password</label>
                      <input
                        type="password"
                        className="form-text-input"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-field-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-text-input"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-update-password">
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}