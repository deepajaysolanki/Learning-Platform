import React, { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import CreateNotebookModal from "./CreateNotebookModal";
import ChatPanel from "./ChatPanel";
import "../styles/Notebooks.css";

gsap.registerPlugin(ScrollTrigger);

const categories = [];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ============================================================================
// SUB-COMPONENT: NOTEBOOK CARD
// ============================================================================
const NotebookCard = ({ nb, onInteract, onChatClick, onQuizClick }) => {
  const [likes, setLikes] = useState(nb.likes || 0);
  const [isLiked, setIsLiked] = useState(nb.isLiked || false);
  const [isSaved, setIsSaved] = useState(nb.isSaved || false);

  useEffect(() => {
    setLikes(nb.likes || 0);
    setIsLiked(nb.isLiked || false);
    setIsSaved(nb.isSaved || false);
  }, [nb.likes, nb.isLiked, nb.isSaved]);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("studyAppToken");
    if (!token) {
      onInteract();
      return;
    }

    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);

    try {
      const response = await fetch(`https://vibestudy-backend-o61q.onrender.com/like/${nb.id}`, {
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
        setLikes(nb.likes || 0);
        setIsLiked(nb.isLiked || false);
      }
    } catch (err) {
      setLikes(nb.likes || 0);
      setIsLiked(nb.isLiked || false);
    }
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("studyAppToken");
    if (!token) {
      onInteract();
      return;
    }

    setIsSaved(!isSaved);

    try {
      const response = await fetch(`https://vibestudy-backend-o61q.onrender.com/save-notebook/${nb.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setIsSaved(data.isSaved);
      } else {
        setIsSaved(nb.isSaved || false);
      }
    } catch (err) {
      setIsSaved(nb.isSaved || false);
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
        </div>
      </div>

      <div className="rnc-summary-box">
        <div className="rnc-summary-header">
          <span className="rnc-blue-dot"></span>
          <h4>Summary</h4>
        </div>
        <p>{nb.summary}</p>
      </div>

      <div className="rnc-actions-grid">
        <button type="button" className="rnc-action-btn" onClick={onChatClick}>
          Open notebook
        </button>
        <button type="button" className="rnc-action-btn" onClick={onQuizClick}>
          Take Quiz
        </button>
      </div>

      <div className="card-actions-row">
        <div className="interaction-group">
          <button
            type="button"
            className={`action-icon-btn like-btn ${isLiked ? "active" : ""}`}
            aria-label="Like"
            onClick={handleLikeClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#ff4757" : "none"} stroke={isLiked ? "#ff4757" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count">{likes}</span>
          </button>

          <button
            type="button"
            className={`action-icon-btn save-btn ${isSaved ? "active" : ""}`}
            aria-label="Save Notebook"
            title={isSaved ? "Saved to Dashboard" : "Save Notebook"}
            onClick={handleSaveClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "#2563eb" : "none"} stroke={isSaved ? "#2563eb" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="save-label">{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>

        <div className="creator-wrap">
          <span className="creator-username">{nb.author}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: NOTEBOOKS
// ============================================================================
export default function Notebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChatNotebook, setActiveChatNotebook] = useState(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const emptyStateRef = useRef(null);
  const chatOverlayRef = useRef(null);
  const navigate = useNavigate();

  // Fetch Public Feed
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const token = localStorage.getItem("studyAppToken");
        const response = await fetch("https://vibestudy-backend-o61q.onrender.com/createnotebook", {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await response.json();
        if (response.ok) setNotebooks(data.notebooks);
      } catch (err) {
        console.error("Network error.", err);
      }
    };
    fetchNotebooks();
  }, []);

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
      const matchesFilter = activeFilter === "All" || nb.category === activeFilter;
      const searchLower = debouncedSearchQuery.toLowerCase();
      return (
        matchesFilter &&
        (nb.title.toLowerCase().includes(searchLower) ||
          (nb.category && nb.category.toLowerCase().includes(searchLower)) ||
          (nb.author && nb.author.toLowerCase().includes(searchLower)))
      );
    });
  }, [debouncedSearchQuery, activeFilter, notebooks]);

  // GSAP: Initial Page Load Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
      tl.fromTo(".notebooks-header-area > *", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 })
        .fromTo(".search-filter-row", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.5")
        .fromTo(".category-pills .pill", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.05 }, "-=0.5");
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // GSAP: Grid Items & Empty State Animations on Filter Change
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current && filteredNotebooks.length > 0) {
        gsap.fromTo(
          ".rich-notebook-card",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".notebooks-grid",
              start: "top 90%",
              toggleActions: "play none none none"
            }
          }
        );
      } else if (emptyStateRef.current && filteredNotebooks.length === 0) {
        gsap.fromTo(
          emptyStateRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
        );
      }
    }, pageRef);
    return () => ctx.revert();
  }, [filteredNotebooks]);

  // GSAP: Active Chat Overlay Animation
  useEffect(() => {
    if (activeChatNotebook && chatOverlayRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".chat-overlay-content > *",
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
        );
        gsap.fromTo(
          ".chat-overlay-sidebar",
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        );
      }, chatOverlayRef);
      return () => ctx.revert();
    }
  }, [activeChatNotebook]);

  // --- RENDER CHAT / DETAIL OVERLAY ---
  if (activeChatNotebook) {
    return (
      <div className="chat-overlay-wrapper" ref={chatOverlayRef}>
        <div className="chat-overlay-content">
          <button className="chat-overlay-back" onClick={() => setActiveChatNotebook(null)}>
            ← Back to Notebooks
          </button>
          <h1 className="chat-overlay-title">{activeChatNotebook.title}</h1>
          <p className="chat-overlay-meta">
            Created by {activeChatNotebook.author} • {activeChatNotebook.sources || 0} Sources
          </p>

          <div className="chat-overlay-summary-box">
            <h3>Notebook Content</h3>
            <p>{activeChatNotebook.summary}</p>
          </div>
        </div>

        <div className="chat-overlay-sidebar">
          <ChatPanel notebook={activeChatNotebook} />
        </div>
      </div>
    );
  }

  // --- RENDER MAIN NOTEBOOKS PAGE ---
  return (
    <>
      <Helmet>
        <title>VibeStudy - Notebooks</title>
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
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          </div>

          {categories.length > 0 && (
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
          )}

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
                      navigate(`/notebook/${nb.id}/study`, { state: { notebook: nb } })
                    )
                  }
                  onQuizClick={() =>
                    enforceLogin(() =>
                      navigate(`/notebook/${nb.id}/quiz`, { state: { notebook: nb } })
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state" ref={emptyStateRef}>
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