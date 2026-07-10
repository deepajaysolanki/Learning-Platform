import React, { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { Helmet } from "react-helmet-async";
import CreateNotebookModal from './CreateNotebookModal';
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
const NotebookCard = ({ nb, onInteract }) => {
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
    const actionToSend = isLiked ? 'unlike' : 'like';

    // Optimistic UI: Update screen instantly
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);

    try {
      const response = await fetch(`http://localhost:3000/like/${nb.id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
        body: JSON.stringify({ action: actionToSend })
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
          <p>{nb.sources} sources</p>
        </div>
      </div>

      {/* <div className="rnc-media-tags">
        <span className="rm-tag pdf-tag">PDF</span>
        <span className="rm-tag audio-tag">AUDIO</span>
        <span className="rm-tag doc-tag">DOC</span>
      </div> */}

      <div className="rnc-summary-box">
        <div className="rnc-summary-header">
          <span className="rnc-blue-dot"></span>
          <h4>Summary</h4>
        </div>
        {/* AI Summary renders here */}
        <p>{nb.summary}</p>
      </div>

      <div className="rnc-actions-grid">
        <button type="button" className="rnc-action-btn" onClick={onInteract}>Chat with notes</button>
        <button type="button" className="rnc-action-btn" onClick={onInteract}>Audio overview</button>
        <button type="button" className="rnc-action-btn" onClick={onInteract}>Take Quiz</button>
        {/* 🔥 Save Button restored */}
        <button type="button" className="rnc-action-btn" onClick={onInteract}>Save to Profile</button>
      </div>

      <div className="card-actions-row">
        <div className="interaction-group">
          
          {/* 🔥 Fully functional Like Button */}
          <button 
            type="button" 
            className="action-icon-btn like-btn" 
            aria-label="Like" 
            onClick={handleLikeClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "#ff4757" : "none"} stroke={isLiked ? "#ff4757" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count" style={{ color: isLiked ? "#ff4757" : "inherit" }}>{likes}</span>
          </button>
          
          <button type="button" className="action-icon-btn" aria-label="Share" onClick={onInteract}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>
        
        {/* 🔥 Raw ID removed, cleanly showing only the username */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span className="creator-username">{nb.author}</span>
        </div>
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const pageRef = useRef(null);
  const gridRef = useRef(null);

  // FETCH PUBLIC DATA 
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const response = await fetch("http://localhost:3000/createnotebook", {
          method: "GET"
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
      const matchesFilter = activeFilter === "All" || nb.category === activeFilter;
      const searchLower = debouncedSearchQuery.toLowerCase();
      
      return matchesFilter && (
        nb.title.toLowerCase().includes(searchLower) || 
        (nb.category && nb.category.toLowerCase().includes(searchLower)) || 
        (nb.author && nb.author.toLowerCase().includes(searchLower))
      );
    });
  }, [debouncedSearchQuery, activeFilter, notebooks]); 

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
      tl.fromTo(".notebooks-header-area", { opacity: 0, y: 20 }, { opacity: 1, y: 0 })
        .fromTo(".search-filter-row", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.5")
        .fromTo(".category-pills .pill", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.05 }, "-=0.5")
        .fromTo(".rich-notebook-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.5");
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (gridRef.current && filteredNotebooks.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(gridRef.current.children, 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
        );
      }, gridRef);
      return () => ctx.revert();
    }
  }, [filteredNotebooks]);

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
            <button type="button" className="btn-sort">Most Liked</button>
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
              : `0 notebooks for "${debouncedSearchQuery}"`
            }
          </div>

          {filteredNotebooks.length > 0 ? (
            <div className="notebooks-grid" ref={gridRef}>
              {filteredNotebooks.map((nb) => (
                <NotebookCard 
                  key={nb.id} 
                  nb={nb} 
                  onInteract={() => enforceLogin()} 
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