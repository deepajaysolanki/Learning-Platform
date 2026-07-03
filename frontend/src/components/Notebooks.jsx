import React, { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { Helmet } from "react-helmet-async";
import "../styles/Notebooks.css";

// --- STATIC DATA ---
const categories = ["All", "Science", "Programming", "Humanities", "Math", "Language", "Arts"];

const initialNotebooks = [
  { 
    id: 1, category: "Programming", title: "Data Structures & Algorithms", sources: "14", 
    summary: "Covers arrays, linked lists, trees, and graph algorithms. Key focus areas: Time complexity and dynamic programming.",
    author: "@marcus_c", likes: "12.4k"
  },
  { 
    id: 2, category: "Programming", title: "Machine Learning Fundamentals", sources: "11", 
    summary: "Introduction to neural networks, backpropagation, and gradient descent. Includes PyTorch implementation examples.",
    author: "@ai_marcus", likes: "21.3k"
  },
  { 
    id: 3, category: "Programming", title: "Advanced Python Programming", sources: "9", 
    summary: "Deep dive into decorators, generators, asyncio, and memory management. Focuses on writing pythonic, scalable code.",
    author: "@aiden_dev", likes: "18.7k"
  },
  { 
    id: 4, category: "Math", title: "Calculus II: Integration Techniques", sources: "12", 
    summary: "Covers integration by parts, partial fractions, trigonometric substitution, and Taylor series expansions.",
    author: "@sarah_math", likes: "9.1k"
  },
  { 
    id: 5, category: "Science", title: "Human Anatomy & Physiology", sources: "10", 
    summary: "Comprehensive overview of the nervous, circulatory, and respiratory systems, focusing on cellular signal transduction.",
    author: "@dr_evans", likes: "14.2k"
  },
  { 
    id: 6, category: "Science", title: "Introduction to Quantum Mechanics", sources: "8", 
    summary: "Focuses on the Schrödinger equation, wave function collapse, and quantum entanglement principles.",
    author: "@prof_kim", likes: "8.5k"
  }
];

// --- CUSTOM HOOK: DEBOUNCE ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- SUB-COMPONENT: EXACT RICH NOTEBOOK CARD ---
const NotebookCard = ({ nb }) => (
  <div className="rich-notebook-card">
    
    {/* 1. Header (Book Icon & Title) */}
    <div className="rnc-header">
      <div className="rnc-icon-bg">
        <div className="rnc-book-icon"></div>
      </div>
      <div className="rnc-title-group">
        <h3>{nb.title}</h3>
        <p>{nb.sources} sources · Last edited today</p>
      </div>
    </div>

    {/* 2. Media Tags */}
    <div className="rnc-media-tags">
      <span className="rm-tag pdf-tag">PDF</span>
      <span className="rm-tag audio-tag">AUDIO</span>
      <span className="rm-tag doc-tag">DOC</span>
      <span className="rm-tag image-tag">IMAGE</span>
      <span className="rm-tag video-tag">VIDEO</span>
    </div>

    {/* 3. AI Summary Box */}
    <div className="rnc-summary-box">
      <div className="rnc-summary-header">
        <span className="rnc-blue-dot"></span>
        <h4>AI Summary</h4>
      </div>
      <p>{nb.summary}</p>
    </div>

    {/* 4. Action Buttons 2x2 */}
    <div className="rnc-actions-grid">
      <button type="button" className="rnc-action-btn">Chat with notes</button>
      <button type="button" className="rnc-action-btn">Audio overview</button>
      <button type="button" className="rnc-action-btn">Video summary</button>
      <button type="button" className="rnc-action-btn">Take Quiz</button>
    </div>

    {/* 5. Interactive Social Footer */}
    <div className="card-actions-row">
      <div className="interaction-group">
        <button type="button" className="action-icon-btn like-btn" aria-label="Like">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span className="like-count">{nb.likes}</span>
        </button>
        <button type="button" className="action-icon-btn" aria-label="Share">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
        <button type="button" className="action-icon-btn" aria-label="Save">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      <span className="creator-username">{nb.author}</span>
    </div>
    
  </div>
);

// --- MAIN COMPONENT ---
export default function Notebooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const pageRef = useRef(null);
  const gridRef = useRef(null);

  const filteredNotebooks = useMemo(() => {
    return initialNotebooks.filter((nb) => {
      const matchesFilter = activeFilter === "All" || nb.category === activeFilter;
      const searchLower = debouncedSearchQuery.toLowerCase();
      
      return matchesFilter && (
        nb.title.toLowerCase().includes(searchLower) || 
        nb.category.toLowerCase().includes(searchLower) || 
        nb.author.toLowerCase().includes(searchLower)
      );
    });
  }, [debouncedSearchQuery, activeFilter]);

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
      gsap.fromTo(gridRef.current.children, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
      );
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
              <h1>Notebooks</h1>
              <p>Browse community notebooks or create your own</p>
            </div>
            <button type="button" className="btn-primary">+ New Notebook</button>
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
              ? `${filteredNotebooks.length} notebooks`
              : `0 notebooks for "${debouncedSearchQuery}"`
            }
          </div>

          {filteredNotebooks.length > 0 ? (
            <div className="notebooks-grid" ref={gridRef}>
              {filteredNotebooks.map((nb) => (
                <NotebookCard key={nb.id} nb={nb} />
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
    </>
  );
}