import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../styles/Notebooks.css";

export default function MyNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeChatNotebook, setActiveChatNotebook] = useState(null);

  useEffect(() => {
    const fetchMyNotebooks = async () => {
      const token = localStorage.getItem("studyAppToken");
      try {
        const response = await fetch("http://localhost:3000/my-notebooks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setNotebooks(data.notebooks);
      } catch (err) {
        console.error("Failed to fetch notebooks", err);
      }
    };
    fetchMyNotebooks();
  }, []);

  const filtered = notebooks.filter((nb) => {
    const matchesSearch = nb.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Public" && nb.isPublic) ||
      (filter === "Private" && !nb.isPublic);
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - My Notebooks</title>
      </Helmet>

      <div className="notebooks-page-wrapper">
        <div className="notebooks-container">
          <div className="notebooks-header-area">
            <div>
              <h1>My Notebooks</h1>
              <p>Manage your private and public collections</p>
            </div>
          </div>

          <div className="search-filter-row">
            <div className="search-input-wrap">
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                placeholder="Search my notebooks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="btn-sort"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="All">All Notebooks</option>
              <option value="Public">Public Only</option>
              <option value="Private">Private Only</option>
            </select>
          </div>

          <div className="results-divider"></div>

          <div className="notebooks-grid">
            {filtered.map((nb) => (
              /* 🔥 EXACT HTML STRUCTURE FROM THE MAIN NOTEBOOK PAGE */
              <div key={nb.id} className="rich-notebook-card">
                <div className="rnc-header">
                  <div className="rnc-icon-bg">
                    <div className="rnc-book-icon"></div>
                  </div>
                  <div className="rnc-title-group">
                    <h3>{nb.title}</h3>
                    <p>
                      {nb.isPublic ? "🟢 Public" : "🔒 Private"} •{" "}
                      {nb.sources || 0} sources
                    </p>
                  </div>
                </div>

                <div className="rnc-media-tags">
                  <span className="rm-tag pdf-tag">PDF</span>
                  <span className="rm-tag audio-tag">AUDIO</span>
                  <span className="rm-tag doc-tag">DOC</span>
                </div>

                <div className="rnc-summary-box">
                  <div className="rnc-summary-header">
                    <span className="rnc-blue-dot"></span>
                    <h4>AI Summary</h4>
                  </div>
                  <p>{nb.summary}</p>
                </div>

                <div className="rnc-actions-grid">
                  <button
                    type="button"
                    className="rnc-action-btn"
                    onClick={() => setActiveChatNotebook(nb)}
                  >
                    Chat with notes
                  </button>
                  <button type="button" className="rnc-action-btn">
                    Audio overview
                  </button>
                  <button type="button" className="rnc-action-btn">
                    Take Quiz
                  </button>
                  <button type="button" className="rnc-action-btn">
                    Edit Details
                  </button>
                </div>

                <div className="card-actions-row">
                  <div className="interaction-group">
                    <div
                      className="action-icon-btn like-btn"
                      style={{
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        border: "1px solid transparent",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span
                        className="like-count"
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      >
                        {nb.likes || 0} Saves
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <span className="creator-username">Created by You</span>
                  </div>
                </div>
              </div>
              /* 🔥 END EXACT HTML STRUCTURE */
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No notebooks found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      <ChatModal
        isOpen={!!activeChatNotebook}
        onClose={() => setActiveChatNotebook(null)}
        notebook={activeChatNotebook}
      />
    </>
  );
}
