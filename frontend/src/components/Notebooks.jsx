import React, { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import CreateNotebookModal from "./CreateNotebookModal";
import ChatPanel from "./ChatPanel";
import "../styles/Notebooks.css";

// const categories = ["All", "Science", "Programming", "Humanities", "Math", "Language", "Arts"];

const categories = [];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- SUB-COMPONENT: NOTEBOOK CARD ---
// 🟢 FIX 1: We added 'onQuizClick' as a prop so the parent component can handle the navigation
const NotebookCard = ({ nb, onInteract, onChatClick, onQuizClick }) => {
  // Local state so the heart updates instantly when clicked
  const [likes, setLikes] = useState(nb.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("studyAppToken");
    if (!token) {
      onInteract(); // Triggers your login warning for guests
      return;
    }

    // Figure out the math we want the server to do
    const actionToSend = isLiked ? "unlike" : "like";

    // Optimistic UI: Update screen instantly
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);

    try {
      const response = await fetch(`http://localhost:3000/like/${nb.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: actionToSend }),
      });

      const data = await response.json();

      if (response.ok) {
        setLikes(data.likes);
      }
    } catch (err) {
      console.error("Failed to like notebook");
    }
  };

  return (
    <div className="rich-notebook-card">
      <div className="rnc-header">
        <div className="rnc-icon-bg">
          <div className="rnc-book-icon"></div>
        </div>
        <div className="rnc-title-group">
          <h3>{nb.title}</h3>
          {/* <p>{nb.sources} sources</p> */}
        </div>
      </div>

      <div className="rnc-summary-box">
        <div className="rnc-summary-header">
          <span className="rnc-blue-dot"></span>
          <h4>Summary</h4>
        </div>
        {/* AI Summary renders here */}
        <p>{nb.summary}</p>
      </div>

      <div className="rnc-actions-grid">
        <button type="button" className="rnc-action-btn" onClick={onChatClick}>
          Open notebook
        </button>
        {/* <button type="button" className="rnc-action-btn" onClick={onInteract}>
          Audio overview
        </button> */}

        {/* 🟢 FIX 2: Replaced the broken navigate code with our new prop. 
            This safely sends the click up to the main Notebooks component! */}
        <button type="button" className="rnc-action-btn" onClick={onQuizClick}>
          Take Quiz
        </button>

        {/* <button type="button" className="rnc-action-btn" onClick={onInteract}>
          Save to Profile
        </button> */}
      </div>

      <div className="card-actions-row">
        <div className="interaction-group">
          <span className="creator-username">{nb.author}</span>
          {/* 🔥 Fully functional Like Button
          <button
            type="button"
            className="action-icon-btn like-btn"
            aria-label="Like"
            onClick={handleLikeClick}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isLiked ? "#ff4757" : "none"}
              stroke={isLiked ? "#ff4757" : "currentColor"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span
              className="like-count"
              style={{ color: isLiked ? "#ff4757" : "inherit" }}
            >
              {likes}
            </span>
          </button> */}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        ></div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Notebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChatNotebook, setActiveChatNotebook] = useState(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const pageRef = useRef(null);
  const gridRef = useRef(null);

  // 🟢 navigate is correctly initialized here, at the top of the main component!
  const navigate = useNavigate();

  // FETCH PUBLIC DATA
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const response = await fetch("http://localhost:3000/createnotebook", {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setNotebooks(data.notebooks);
        } else {
          console.error("Backend error:", data.message);
        }
      } catch (err) {
        console.error("Network error.", err);
      }
    };

    fetchNotebooks();
  }, []);

  // THE AUTH GUARD FUNCTION
  const enforceLogin = (actionCallback) => {
    const token = localStorage.getItem("studyAppToken");
    if (!token) {
      window.location.href = "/login?msg=login_required";
      return;
    }
    if (actionCallback) actionCallback();
  };

  const filteredNotebooks = useMemo(() => {
    return notebooks.filter((nb) => {
      const matchesFilter =
        activeFilter === "All" || nb.category === activeFilter;
      const searchLower = debouncedSearchQuery.toLowerCase();

      return (
        matchesFilter &&
        (nb.title.toLowerCase().includes(searchLower) ||
          (nb.category && nb.category.toLowerCase().includes(searchLower)) ||
          (nb.author && nb.author.toLowerCase().includes(searchLower)))
      );
    });
  }, [debouncedSearchQuery, activeFilter, notebooks]);

  // GSAP Animations...
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.7 },
      });
      tl.fromTo(
        ".notebooks-header-area",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0 },
      )
        .fromTo(
          ".search-filter-row",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=0.5",
        )
        .fromTo(
          ".category-pills .pill",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, stagger: 0.05 },
          "-=0.5",
        )
        .fromTo(
          ".rich-notebook-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1 },
          "-=0.5",
        );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (gridRef.current && filteredNotebooks.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.4,
            ease: "power2.out",
          },
        );
      }, gridRef);
      return () => ctx.revert();
    }
  }, [filteredNotebooks]);

  if (activeChatNotebook) {
    return (
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 60px)",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#f8fafc",
        }}
      >
        {/* LEFT SIDE: The Document */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          <button
            onClick={() => setActiveChatNotebook(null)}
            style={{
              padding: "8px 16px",
              marginBottom: "24px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: "bold",
            }}
          >
            ← Back to Notebooks
          </button>

          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "10px",
              color: "#0f172a",
            }}
          >
            {activeChatNotebook.title}
          </h1>
          <p style={{ color: "#64748b", marginBottom: "30px" }}>
            Created by {activeChatNotebook.author} •{" "}
            {activeChatNotebook.sources} Sources
          </p>

          <div
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                borderBottom: "2px solid #eef2ff",
                paddingBottom: "10px",
                marginBottom: "20px",
                color: "#334155",
              }}
            >
              Notebook Content
            </h3>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
                color: "#334155",
                fontSize: "16px",
              }}
            >
              {activeChatNotebook.summary}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: The AI Chat */}
        <div
          style={{
            width: "400px",
            flexShrink: 0,
            borderLeft: "1px solid #e2e8f0",
            backgroundColor: "white",
          }}
        >
          <ChatPanel notebook={activeChatNotebook} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - Notebooks</title>
      </Helmet>

      <div className="notebooks-page-wrapper" ref={pageRef}>
        <div className="notebooks-container">
          <div className="notebooks-header-area">
            <div>
              <h1>Community Notebooks</h1>
              <p>Browse public notebooks or create your own</p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => enforceLogin(() => setIsModalOpen(true))}
            >
              + New Notebook
            </button>
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
                type="text"
                placeholder="Search notebooks by title, tag, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <button type="button" className="btn-sort">
              Most Liked
            </button> */}
          </div>

          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pill ${activeFilter === cat ? "active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="results-divider"></div>

          <div className="results-count">
            {filteredNotebooks.length > 0
              ? `${filteredNotebooks.length} public notebooks`
              : `0 notebooks for "${debouncedSearchQuery}"`}
          </div>

          {filteredNotebooks.length > 0 ? (
            <div className="notebooks-grid" ref={gridRef}>
              {filteredNotebooks.map((nb) => (
                <NotebookCard
                  key={nb.id}
                  nb={nb}
                  onInteract={() => enforceLogin()}
                  onChatClick={() =>
                    enforceLogin(() =>
                      navigate(`/notebook/${nb.id}/study`, {
                        state: { notebook: nb },
                      }),
                    )
                  }
                  // Added the onQuizClick prop here!
                  // It uses the correct nb.id and enforces login before navigating.
                  onQuizClick={() =>
                    enforceLogin(() =>
                      navigate(`/notebook/${nb.id}/quiz`, {
                        state: { notebook: nb },
                      }),
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No notebooks found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      <CreateNotebookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNotebookCreated={(newNotebook) => {
          if (newNotebook.isPublic) {
            setNotebooks([newNotebook, ...notebooks]);
          }
        }}
      />
    </>
  );
}
