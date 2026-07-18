import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// 🟢 REUSABLE INTERACTIVE LIKE BUTTON FOR DASHBOARD
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
        // Rollback on error
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
      onClick={handleToggleLike}
      title={isLiked ? "Unlike Notebook" : "Like Notebook"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: isLiked ? "#ff4757" : "#64748b",
        fontSize: "14px",
        fontWeight: "600",
        padding: "4px 8px",
        borderRadius: "6px",
        transition: "all 0.15s ease",
      }}
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
    if (
      !window.confirm(
        "Are you sure you want to delete this notebook? This cannot be undone."
      )
    )
      return;

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
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        Loading your dashboard...
      </div>
    );
  }

  const pageTitle =
    activeTab === "notebooks"
      ? "My Notebooks"
      : activeTab === "saved"
      ? "Saved Notebooks"
      : "Profile Settings";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <Helmet>
        <title>{pageTitle} | Quizolve</title>
        <meta name="description" content="Manage your Quizolve account and notebooks." />
      </Helmet>

      {/* 🟢 SIDEBAR 🟢 */}
      <div
        style={{
          width: "250px",
          flexShrink: 0,
          borderRight: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            width: "250px",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e2e8f0",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ color: "#0f172a", marginBottom: "40px", fontSize: "20px" }}>
            Welcome, {userData?.username || "User"}!
          </h2>

          <nav style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            <button
              onClick={() => setActiveTab("settings")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor: activeTab === "settings" ? "#eef2ff" : "transparent",
                color: activeTab === "settings" ? "#6366f1" : "#64748b",
              }}
            >
              ⚙️ Profile Settings
            </button>

            <button
              onClick={() => setActiveTab("notebooks")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor: activeTab === "notebooks" ? "#eef2ff" : "transparent",
                color: activeTab === "notebooks" ? "#6366f1" : "#64748b",
              }}
            >
              📚 My Notebooks
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor: activeTab === "saved" ? "#eef2ff" : "transparent",
                color: activeTab === "saved" ? "#6366f1" : "#64748b",
              }}
            >
              🔖 Saved Notebooks
            </button>

            {/* 🟢 ADMIN PANEL LINK (Appears only if user is Admin) */}
            {userData?.role === "admin" && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  backgroundColor: "#0f172a",
                  color: "#38bdf8",
                  marginTop: "10px",
                }}
              >
                🛡️ Admin Panel
              </button>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                marginTop: "45vh",
              }}
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* TAB 1: MY NOTEBOOKS */}
          {activeTab === "notebooks" && (
            <div>
              <h1 style={{ color: "#0f172a", marginBottom: "8px", fontSize: "32px", fontWeight: "800" }}>
                My Notebooks
              </h1>
              <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "15px" }}>
                Manage your private and public collections
              </p>

              {/* SEARCH & FILTER ROW */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "30px", width: "100%" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search my notebooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 44px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "15px",
                      color: "#334155",
                      outline: "none",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                    fontSize: "15px",
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                    minWidth: "160px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <option value="All Notebooks">All Notebooks</option>
                  <option value="Public Only">Public Only</option>
                  <option value="Private Only">Private Only</option>
                </select>
              </div>

              {notebookError && (
                <div style={{ padding: "10px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px", marginBottom: "20px" }}>
                  ⚠️ {notebookError}
                </div>
              )}

              {loadingNotebooks ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#6366f1", fontWeight: "bold" }}>
                  ⏳ Loading your notebooks...
                </div>
              ) : filteredNotebooks.length === 0 ? (
                <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                  <h3 style={{ color: "#334155" }}>No Notebooks Found</h3>
                  <p style={{ color: "#64748b" }}>
                    {myNotebooks.length === 0 ? "You haven't created any study materials yet." : "No notebooks match your search."}
                  </p>
                  <button
                    onClick={() => navigate("/notebooks")}
                    style={{
                      marginTop: "15px",
                      padding: "10px 20px",
                      backgroundColor: "#6366f1",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Create Notebook
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "24px" }}>
                  {filteredNotebooks.map((notebook, index) => {
                    const isPublic = notebook.isPublic || notebook.visibility === "public";
                    const notebookId = notebook._id || notebook.id;

                    return (
                      <div
                        key={notebookId || index}
                        style={{
                          backgroundColor: "white",
                          padding: "24px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "12px",
                              backgroundColor: "#eff6ff",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
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
                            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "22px", fontWeight: "800", lineHeight: "1.2" }}>
                              {notebook.title || "Untitled Notebook"}
                            </h3>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
                              {isPublic ? (
                                <>
                                  <span style={{ color: "#22c55e", fontSize: "10px" }}>🟢</span> Public
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: "12px" }}>🔒</span> Private
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "20px", marginTop: "20px", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#2563eb" }}></div>
                            <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: "15px" }}>Summary</span>
                          </div>
                          <p style={{ margin: 0, color: "#475569", fontSize: "15px", lineHeight: "1.6" }}>
                            {notebook.description || notebook.summary || "No description provided."}
                          </p>
                        </div>

                        {/* MAIN ACTION GRID */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/study`)}
                            style={{ padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#334155", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/quiz`)}
                            style={{ padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#334155", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
                          >
                            Quiz
                          </button>
                        </div>

                        {/* CARD FOOTER: LIKES + DELETE BUTTON + USERNAME */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "16px",
                            paddingTop: "16px",
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <DashLikeButton
                              notebookId={notebookId}
                              initialLikes={notebook.likes}
                              initialIsLiked={notebook.isLiked}
                            />

                            <button
                              type="button"
                              onClick={() => handleDeleteNotebook(notebookId)}
                              title="Delete Notebook"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#ef4444",
                                fontSize: "13px",
                                fontWeight: "600",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#fef2f2",
                              }}
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

                          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
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
              <h1 style={{ color: "#0f172a", marginBottom: "8px", fontSize: "32px", fontWeight: "800" }}>
                Saved Notebooks
              </h1>
              <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "15px" }}>
                Community notebooks you have bookmarked for study
              </p>

              {savedNotebooks.length === 0 ? (
                <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                  <h3 style={{ color: "#334155" }}>No Saved Notebooks</h3>
                  <p style={{ color: "#64748b" }}>
                    You haven't bookmarked any public notebooks yet.
                  </p>
                  <button
                    onClick={() => navigate("/notebooks")}
                    style={{
                      marginTop: "15px",
                      padding: "10px 20px",
                      backgroundColor: "#6366f1",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Browse Community Feed
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "24px" }}>
                  {savedNotebooks.map((notebook, index) => {
                    const notebookId = notebook.id || notebook._id;

                    return (
                      <div
                        key={notebookId || index}
                        style={{
                          backgroundColor: "white",
                          padding: "24px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "12px",
                              backgroundColor: "#f0fdf4",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "22px", fontWeight: "800", lineHeight: "1.2" }}>
                              {notebook.title}
                            </h3>
                            <span style={{ fontSize: "14px", color: "#64748b" }}>
                              By {notebook.author}
                            </span>
                          </div>
                        </div>

                        <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "20px", marginTop: "20px", flex: 1 }}>
                          <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px" }}>
                            Summary
                          </span>
                          <p style={{ margin: 0, color: "#475569", fontSize: "15px", lineHeight: "1.6" }}>
                            {notebook.summary || "No summary available."}
                          </p>
                        </div>

                        {/* MAIN ACTION GRID */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "24px" }}>
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/study`)}
                            style={{ padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => navigate(`/notebook/${notebookId}/quiz`)}
                            style={{ padding: "12px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#334155", fontWeight: "500", cursor: "pointer", fontSize: "13px" }}
                          >
                            Quiz
                          </button>
                          <button
                            onClick={() => handleRemoveSavedNotebook(notebookId)}
                            style={{ padding: "12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                            title="Remove from saved notebooks"
                          >
                            Remove
                          </button>
                        </div>

                        {/* FOOTER WITH INTERACTIVE LIKE BUTTON */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "16px",
                            paddingTop: "16px",
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          <DashLikeButton
                            notebookId={notebookId}
                            initialLikes={notebook.likes}
                            initialIsLiked={notebook.isLiked}
                          />
                          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                            {notebook.author}
                          </span>
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
              <h1 style={{ color: "#0f172a", marginBottom: "20px" }}>
                Profile Settings
              </h1>
              
              <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${userData?.fullName || userData?.username || "User"}&background=6366f1&color=fff&size=80&bold=true`}
                    alt="Profile Avatar"
                    style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid #eef2ff" }}
                  />
                  <div>
                    <h2 style={{ margin: "0 0 5px 0", color: "#0f172a" }}>
                      {userData?.fullName || userData?.username}
                    </h2>
                    <p style={{ margin: 0, color: "#64748b" }}>
                      Manage your personal information
                    </p>
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
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "14px", marginBottom: "5px", fontWeight: "bold" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={userData?.fullName || ""}
                      onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "14px", marginBottom: "5px", fontWeight: "bold" }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={userData?.username || ""}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "14px", marginBottom: "5px", fontWeight: "bold" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userData?.email || ""}
                      disabled
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "15px", cursor: "not-allowed", boxSizing: "border-box" }}
                    />
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                      Emails cannot be changed directly for security reasons.
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{ padding: "12px 24px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "10px", width: "fit-content" }}
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* SECURITY / PASSWORD SECTION */}
              <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 20px 0" }}>Security</h3>

                {userData?.googleId ? (
                  <div>
                    <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "10px" }}>
                      Your account is managed via Google. You do not need a password.
                    </p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", backgroundColor: "#f1f5f9", borderRadius: "6px", color: "#475569", fontWeight: "bold", fontSize: "14px" }}>
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
                        return setPasswordError("Password must be at least 8 characters, with 1 uppercase letter and 1 number.");
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
                    style={{ display: "flex", flexDirection: "column", gap: "15px" }}
                  >
                    {passwordError && (
                      <div style={{ padding: "10px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", border: "1px solid #ef4444" }}>
                        ⚠️ {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div style={{ padding: "10px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", border: "1px solid #22c55e" }}>
                        ✅ {passwordSuccess}
                      </div>
                    )}

                    <div>
                      <label style={{ display: "block", color: "#64748b", fontSize: "14px", marginBottom: "5px", fontWeight: "bold" }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", color: "#64748b", fontSize: "14px", marginBottom: "5px", fontWeight: "bold" }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", color: "#64748b", fontSize: "14px", marginBottom: "5px", fontWeight: "bold" }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{ padding: "12px 24px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "10px", width: "fit-content" }}
                    >
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