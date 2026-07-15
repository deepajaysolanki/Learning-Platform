import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notebooks");

  // --- USER STATES ---
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NOTEBOOK STATES ---
  const [myNotebooks, setMyNotebooks] = useState([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(false);
  const [notebookError, setNotebookError] = useState("");

  // --- SEARCH & FILTER STATES (NEW) ---
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
        const response = await fetch("http://localhost:3000/profile", {
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

  // --- FETCH NOTEBOOKS ---
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
      const res = await fetch("http://localhost:3000/my-notebooks", {
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

  // --- DELETE NOTEBOOK ---
  const handleDeleteNotebook = async (notebookId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this notebook? This cannot be undone.",
      )
    )
      return;

    const token = localStorage.getItem("studyAppToken");
    try {
      const res = await fetch(`http://localhost:3000/notebook/${notebookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMyNotebooks((prev) => prev.filter((nb) => nb._id !== notebookId));
        alert("Notebook deleted succesfully!.");
      } else {
        alert("Failed to delete the notebook.");
      }
    } catch (err) {
      alert("Network error while trying to delete.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studyAppToken");
    navigate("/");
  };

  // --- FILTER LOGIC (NEW) ---
  const filteredNotebooks = Array.isArray(myNotebooks)
    ? myNotebooks.filter((notebook) => {
        // 1. Search filter
        const matchesSearch = (notebook.title || "Untitled Notebook")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // 2. Visibility filter (Assuming your DB uses notebook.isPublic or visibility === 'public')
        const isPublic = notebook.isPublic || notebook.visibility === "public";

        let matchesVisibility = true;
        if (visibilityFilter === "Public Only") matchesVisibility = isPublic;
        if (visibilityFilter === "Private Only") matchesVisibility = !isPublic;

        return matchesSearch && matchesVisibility;
      })
    : [];

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        Loading your dashboard...
      </div>
    );
  }

  const pageTitle =
    activeTab === "notebooks" ? "My Notebooks" : "Profile Settings";

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
        <meta
          name="description"
          content="Manage your Quizolve account and notebooks."
        />
      </Helmet>

      {/* 🟢 SIDEBAR (NOW STICKY) 🟢 */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          position: "fixed", // Makes it stick to the top
          top: 0, // Sticks exactly at the top of the window
          height: "100vh", // Takes up the full height of the viewport
          overflowY: "auto", // Allows inner scrolling if the sidebar gets too tall
          left: 0, // <-- Locked to the left edge
          bottom: 0, // <-- Stretches to the bottom
          zIndex: 10,
        }}
      >
        <h2
          style={{ color: "#0f172a", marginBottom: "40px", fontSize: "20px" }}
        >
          Welcome, {userData?.username || "User"}!
        </h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            flex: 1,
          }}
        >
          <button
            onClick={() => setActiveTab("settings")}
            style={{
              padding: "12px 16px",
              textAlign: "left",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              backgroundColor:
                activeTab === "settings" ? "#eef2ff" : "transparent",
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
              backgroundColor:
                activeTab === "notebooks" ? "#eef2ff" : "transparent",
              color: activeTab === "notebooks" ? "#6366f1" : "#64748b",
            }}
          >
            📚 My Notebooks
          </button>

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
              marginTop: "50vh",
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "40px" }}>
        {" "}
        {/* Removed overflowY: auto to allow natural window scroll */}
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* TAB 1: MY NOTEBOOKS */}
          {activeTab === "notebooks" && (
            <div>
              <h1
                style={{
                  color: "#0f172a",
                  marginBottom: "8px",
                  fontSize: "32px",
                  fontWeight: "800",
                }}
              >
                My Notebooks
              </h1>
              <p
                style={{
                  color: "#64748b",
                  marginBottom: "30px",
                  fontSize: "15px",
                }}
              >
                Manage your private and public collections
              </p>

              {/* 🟢 SEARCH & FILTER ROW (NEW) 🟢 */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "30px",
                  width: "100%",
                }}
              >
                {/* Search Bar */}
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
                    }}
                  />
                </div>

                {/* Dropdown Filter */}
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
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "6px",
                    marginBottom: "20px",
                  }}
                >
                  ⚠️ {notebookError}
                </div>
              )}

              {loadingNotebooks ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6366f1",
                    fontWeight: "bold",
                  }}
                >
                  ⏳ Loading your notebooks...
                </div>
              ) : filteredNotebooks.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1px dashed #cbd5e1",
                    textAlign: "center",
                  }}
                >
                  <h3 style={{ color: "#334155" }}>No Notebooks Found</h3>
                  <p style={{ color: "#64748b" }}>
                    {myNotebooks.length === 0
                      ? "You haven't created any study materials yet."
                      : "No notebooks match your search."}
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(450px, 1fr))", // Slightly wider cards per your image
                    gap: "24px",
                  }}
                >
                  {/* Map over filteredNotebooks instead of myNotebooks */}
                  {filteredNotebooks.map((notebook, index) => {
                    const isPublic =
                      notebook.isPublic || notebook.visibility === "public";

                    return (
                      <div
                        key={notebook._id || notebook.id || index}
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
                        {/* HEADER SECTION */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "16px",
                          }}
                        >
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
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
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
                            <h3
                              style={{
                                margin: "0 0 8px 0",
                                color: "#0f172a",
                                fontSize: "22px",
                                fontWeight: "800",
                                lineHeight: "1.2",
                              }}
                            >
                              {notebook.title || "Untitled Notebook"}
                            </h3>

                            {/* Privacy and Sources Tag */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              {isPublic ? (
                                <>
                                  <span
                                    style={{
                                      color: "#22c55e",
                                      fontSize: "10px",
                                    }}
                                  >
                                    🟢
                                  </span>{" "}
                                  Public
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: "12px" }}>🔒</span>{" "}
                                  Private
                                </>
                              )}
                              <span>•</span>
                              <span>{notebook.sources || 0} sources</span>
                            </div>
                          </div>
                        </div>

                        {/* FILE TYPE BADGES */}
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "16px",
                          }}
                        >
                          <span
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#fef2f2",
                              color: "#ef4444",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            PDF
                          </span>
                          <span
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#fef9c3",
                              color: "#ca8a04",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            AUDIO
                          </span>
                          <span
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#eff6ff",
                              color: "#3b82f6",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            DOC
                          </span>
                        </div>

                        {/* SUMMARY BOX */}
                        <div
                          style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: "12px",
                            padding: "20px",
                            marginTop: "20px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#2563eb",
                              }}
                            ></div>
                            <span
                              style={{
                                color: "#2563eb",
                                fontWeight: "bold",
                                fontSize: "15px",
                              }}
                            >
                              AI Summary
                            </span>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "#475569",
                              fontSize: "15px",
                              lineHeight: "1.6",
                            }}
                          >
                            {notebook.description ||
                              notebook.summary ||
                              "Client-server architecture enables communication between a user's browser and a remote server..."}
                          </p>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginTop: "24px",
                          }}
                        >
                          <button
                            onClick={() =>
                              navigate(
                                `/notebook/${notebook._id || notebook.id}`,
                              )
                            }
                            style={{
                              padding: "12px",
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              color: "#334155",
                              fontWeight: "500",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s",
                            }}
                          >
                            Chat with notes
                          </button>
                          <button
                            style={{
                              padding: "12px",
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              color: "#334155",
                              fontWeight: "500",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            Audio overview
                          </button>
                          <button
                            style={{
                              padding: "12px",
                              backgroundColor: "white",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              color: "#334155",
                              fontWeight: "500",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            Take Quiz
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteNotebook(notebook._id || notebook.id)
                            }
                            style={{
                              padding: "12px",
                              backgroundColor: "white",
                              border: "1px solid #fee2e2",
                              borderRadius: "8px",
                              color: "#ef4444",
                              fontWeight: "500",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            Delete Notebook
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE SETTINGS */}
          {activeTab === "settings" && (
            <div>
              <h1 style={{ color: "#0f172a", marginBottom: "20px" }}>
                Profile Settings
              </h1>
              {/* ... (Your existing profile settings code remains exactly the same here) ... */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "30px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${userData?.fullName || userData?.username || "User"}&background=6366f1&color=fff&size=80&bold=true`}
                    alt="Profile Avatar"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      border: "2px solid #eef2ff",
                    }}
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
                      const res = await fetch("http://localhost:3000/profile", {
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={userData?.fullName || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, fullName: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "15px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      value={userData?.username || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, username: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "15px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userData?.email || ""}
                      disabled
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        color: "#94a3b8",
                        fontSize: "15px",
                        cursor: "not-allowed",
                      }}
                    />
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      Emails cannot be changed directly for security reasons.
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#6366f1",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginTop: "10px",
                      width: "fit-content",
                      transition: "background 0.2s",
                    }}
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* SECURITY / PASSWORD SECTION */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ margin: "0 0 20px 0" }}>Security</h3>

                {userData?.googleId ? (
                  <div>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      Your account is managed via Google. You do not need a
                      password.
                    </p>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "6px",
                        color: "#475569",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      <span>🛡️</span> Google Authenticated
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();

                      setPasswordError("");
                      setPasswordSuccess("");

                      const passwordRegex =
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
                      if (!passwordRegex.test(passwordData.newPassword)) {
                        return setPasswordError(
                          "Password must be at least 8 characters, with 1 uppercase letter and 1 number.",
                        );
                      }

                      if (
                        passwordData.newPassword !==
                        passwordData.confirmPassword
                      ) {
                        return setPasswordError("New passwords do not match!");
                      }

                      const token = localStorage.getItem("studyAppToken");

                      try {
                        const res = await fetch(
                          "http://localhost:3000/profile/password",
                          {
                            method: "PUT",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              currentPassword: passwordData.currentPassword,
                              newPassword: passwordData.newPassword,
                            }),
                          },
                        );

                        const data = await res.json();

                        if (res.ok) {
                          setPasswordSuccess("Password updated successfully!");
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        } else {
                          setPasswordError(
                            data.message || "Failed to update password.",
                          );
                        }
                      } catch (err) {
                        setPasswordError(
                          "Network error occurred. Please try again.",
                        );
                      }
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {passwordError && (
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          border: "1px solid #ef4444",
                        }}
                      >
                        ⚠️ {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          border: "1px solid #22c55e",
                        }}
                      >
                        ✅ {passwordSuccess}
                      </div>
                    )}

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#64748b",
                          fontSize: "14px",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#64748b",
                          fontSize: "14px",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#64748b",
                          fontSize: "14px",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#0f172a",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginTop: "10px",
                        width: "fit-content",
                      }}
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
