import React, { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { Helmet } from "react-helmet-async";
import "../styles/Notebooks.css";

const categories = ["All", "Science", "Programming", "Humanities", "Math", "Language", "Arts"];

const initialNotebooks = [
  {
    id: 1,
    subject: "Computer Science",
    category: "Programming",
    title: "Data Structures & Algorithms",
    sources: "14 sources",
    tags: ["Trees", "Graphs"],
    author: "@marcus_c",
    likes: "12.4k",
    colorClass: "red"
  },
  {
    id: 2,
    subject: "Computer Science",
    category: "Programming",
    title: "Machine Learning Fundamentals",
    sources: "11 sources",
    tags: ["Neural nets", "PyTorch"],
    author: "@ai_marcus",
    likes: "21.3k",
    colorClass: "teal"
  },
  {
    id: 3,
    subject: "Programming",
    category: "Programming",
    title: "Advanced Python Programming",
    sources: "9 sources",
    tags: ["Decorators", "Asyncio"],
    author: "@aiden_dev",
    likes: "18.7k",
    colorClass: "green"
  },
  {
    id: 4,
    subject: "Mathematics",
    category: "Math",
    title: "Calculus II: Integration Techniques",
    sources: "12 sources",
    tags: ["Series", "Integrals"],
    author: "@sarah_math",
    likes: "9.1k",
    colorClass: "blue"
  },
  {
    id: 5,
    subject: "Biology",
    category: "Science",
    title: "Human Anatomy & Physiology",
    sources: "10 sources",
    tags: ["Systems", "Cells"],
    author: "@dr_evans",
    likes: "14.2k",
    colorClass: "pink"
  },
  {
    id: 6,
    subject: "Physics",
    category: "Science",
    title: "Introduction to Quantum Mechanics",
    sources: "8 sources",
    tags: ["Wave functions", "Schrödinger"],
    author: "@prof_kim",
    likes: "8.5k",
    colorClass: "purple"
  }
];

export default function Notebooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  
  const pageRef = useRef(null);
  const gridRef = useRef(null);

  // Filter Logic
  const filteredNotebooks = useMemo(() => {
    return initialNotebooks.filter((notebook) => {
      const matchesFilter = activeFilter === "All" || notebook.category === activeFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        notebook.title.toLowerCase().includes(searchLower) ||
        notebook.subject.toLowerCase().includes(searchLower) ||
        notebook.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        notebook.author.toLowerCase().includes(searchLower);
      
      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, activeFilter]);

  // Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
      
      tl.fromTo(".notebooks-header-area", { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: 0.1 })
        .fromTo(".search-filter-row", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.5")
        .fromTo(".category-pills .pill", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.05 }, "-=0.5")
        .fromTo(".results-count", { opacity: 0 }, { opacity: 1 }, "-=0.3")
        .fromTo(".notebook-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.5");
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Re-animate grid when filters change
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
          
          {/* Header Area */}
          <div className="notebooks-header-area">
            <div>
              <h1>Notebooks</h1>
              <p>Browse community notebooks or create your own</p>
            </div>
            <button className="btn-primary">+ New Notebook</button>
          </div>

          {/* Search & Sort Row */}
          <div className="search-filter-row">
            <div className="search-input-wrap">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search notebooks by title, subject, tag, or author..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-sort">Most Liked</button>
          </div>

          {/* Filter Pills */}
          <div className="category-pills">
            {categories.map((cat) => (
              <button 
                key={cat}
                className={`pill ${activeFilter === cat ? "active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="results-divider"></div>

          {/* Results Count */}
          <div className="results-count">
            {filteredNotebooks.length > 0 
              ? `${filteredNotebooks.length} notebooks`
              : `0 notebooks for "${searchQuery}"`
            }
          </div>

          {/* Dynamic Content Area: Grid vs Empty State */}
          {filteredNotebooks.length > 0 ? (
            <div className="notebooks-grid" ref={gridRef}>
              {filteredNotebooks.map((nb) => (
                <div key={nb.id} className="notebook-card">
                  <div className="card-top">
                    <div className={`icon-box ${nb.colorClass}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                    <span className={`source-badge ${nb.colorClass}-badge`}>{nb.sources}</span>
                  </div>
                  
                  <span className={`subject-text ${nb.colorClass}-text`}>{nb.subject}</span>
                  <h3 className="notebook-title">{nb.title}</h3>
                  
                  <div className="tags-row">
                    {nb.tags.map(tag => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                  
                  {/* Interactive Action Footer */}
                  <div className="card-actions-row">
                    <div className="interaction-group">
                      <button className="action-icon-btn like-btn" aria-label="Like">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>{nb.likes}</span>
                      </button>
                      
                      <button className="action-icon-btn" aria-label="Share">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      </button>
                      
                      <button className="action-icon-btn" aria-label="Save">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                    </div>

                    <span className="creator-username">{nb.author}</span>
                  </div>
                </div>
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