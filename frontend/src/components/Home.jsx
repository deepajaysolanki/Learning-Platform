import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/home.css";
import "./index.css";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const componentScopeRef = useRef(null); // Scopes GSAP queries cleanly
  const leftContentRef = useRef(null);
  const notebookRef = useRef(null);
  const floatingCardsRef = useRef([]);

  const howItWorksRef = useRef(null);
  const communityRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const bannerRef = useRef(null);
  
  const [activeFeature, setActiveFeature] = useState(0);

  const notebooks = [
    {
      subject: "Physics",
      title: "Introduction to Quantum Mechanics",
      sources: "8 sources",
      tags: ["Wave functions", "Schrödinger"],
      views: "12.4k views",
      color: "purple",
    },
    {
      subject: "Astronomy",
      title: "Space Science: Solar System",
      sources: "5 sources",
      tags: ["Planets", "Gravity", "NASA"],
      views: "8.1k views",
      color: "pink",
    },
    {
      subject: "Computer Science",
      title: "Machine Learning Fundamentals",
      sources: "11 sources",
      tags: ["Neural nets", "PyTorch"],
      views: "21.3k views",
      color: "blue",
    },
    {
      subject: "History",
      title: "World History: Cold War Era",
      sources: "7 sources",
      tags: ["1947–1991", "NATO"],
      views: "5.6k views",
      color: "amber",
    },
    {
      subject: "Biochemistry",
      title: "Cellular Respiration & ATP Synthesis",
      sources: "9 sources",
      tags: ["Glycolysis", "Krebs"],
      views: "14.2k views",
      color: "purple",
    },
  ];

  const features = [
    {
      id: 0,
      tag: "Document Chat",
      title: "Interact with notes",
      desc: "Ask complex contextual questions about your uploaded documents, handouts, and textbooks directly.",
      bg: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 1,
      tag: "Audio Overview",
      title: "AI-Narrated Podcasts",
      desc: "Transform dense reading materials into high-fidelity, dual-narrator talk shows on the go.",
      bg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      tag: "Video Summaries",
      title: "Key Moment Extraction",
      desc: "Auto-index video lectures into chapters, timelines, and auto-generated meeting notes instantly.",
      bg: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      tag: "Interactive Quizzes",
      title: "Test Your Knowledge",
      desc: "Generate multi-tier quizzes, flashcards, and conceptual diagnostic checks mapped directly to your exams.",
      bg: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    },
  ];

  useEffect(() => {
    // Single robust GSAP Context manages memory, scoping, and unmounting cleanly
    const ctx = gsap.context(() => {
      
      // --- 1. HERO TEXT TIMELINE ---
      if (leftContentRef.current) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
        tl.fromTo(leftContentRef.current.querySelector(".badge"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, delay: 0.2 })
          .fromTo(leftContentRef.current.querySelector(".hero-title"), { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.5")
          .fromTo(leftContentRef.current.querySelector(".hero-subtitle"), { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.6")
          .fromTo(leftContentRef.current.querySelectorAll(".hero-cta-group > *"), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, stagger: 0.15 }, "-=0.5")
          .fromTo(leftContentRef.current.querySelector(".hero-footer-text"), { opacity: 0 }, { opacity: 1 }, "-=0.4");
      }

      // --- 2. HERO NOTEBOOK MOCKUP ---
      if (notebookRef.current) {
        gsap.fromTo(notebookRef.current, 
          { opacity: 0, scale: 0.9, y: 40 },
          { opacity: 1, scale: 1, y: 0, ease: "back.out(1.2)", duration: 1, delay: 0.4 }
        );
      }

      // --- 3. FLOATING BACKGROUND CARDS ---
      floatingCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, scale: 0.5, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, delay: 0.6 + index * 0.1, ease: "back.out(1.5)" }
        );

        gsap.to(card, {
          y: index % 2 === 0 ? "-12px" : "12px",
          rotation: index % 2 === 0 ? 1 : -1,
          duration: 3 + index * 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.2,
        });
      });

      // --- 4. INFINITE CAROUSEL MARQUEE ---
      const marqueeInner = marqueeInnerRef.current;
      if (marqueeInner) {
        const originalWidth = marqueeInner.scrollWidth / 2;
        const marqueeTween = gsap.to(marqueeInner, {
          x: -originalWidth,
          duration: 25,
          ease: "none",
          repeat: -1,
        });

        marqueeInner.addEventListener("mouseenter", () => marqueeTween.pause());
        marqueeInner.addEventListener("mouseleave", () => marqueeTween.play());
      }

      // --- 5. HOW IT WORKS VIEWPORT SCROLLTRIGGER ---
      if (howItWorksRef.current) {
        gsap.fromTo(".how-it-works-animated .source-card",
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, stagger: 0.15, duration: 0.6, scrollTrigger: { trigger: howItWorksRef.current, start: "top 70%" } }
        );

        gsap.fromTo(".how-it-works-animated .output-card",
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, stagger: 0.15, duration: 0.6, scrollTrigger: { trigger: howItWorksRef.current, start: "top 70%" } }
        );
      }

      // --- 6. CALL TO ACTION BANNER SCROLLTRIGGER ---
      if (bannerRef.current) {
        gsap.fromTo(".cta-clean-content > *",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: bannerRef.current, start: "top 85%" } }
        );
      }

    }, componentScopeRef);

    return () => ctx.revert(); // Safely teardown all timers and window event trackers
  }, []);

  // Magnetic button triggers
  const handleButtonMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleButtonReset = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <div className="premium-experience" ref={componentScopeRef}>
      {/* SECTION 1: HERO */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left" ref={leftContentRef}>
            <div className="badge">
              <span className="badge-dot"></span> Powered by AI
            </div>

            <h1 className="hero-title">
              Understand anything <br />
              <span className="gradient-text">with SmartStudy AI</span>
            </h1>

            <p className="hero-subtitle">
              Upload your notes, PDFs, recordings, and videos. SmartStudy
              transforms them into interactive conversations, audio summaries,
              and quizzes — all grounded in your own material.
            </p>

            <div className="hero-cta-group">
              <button
                className="btn-hero-primary"
                onMouseMove={handleButtonMove}
                onMouseLeave={handleButtonReset}
              >
                Get started — It's free <span>→</span>
              </button>
              <a href="#how-it-works" className="btn-hero-link">
                See how it works →
              </a>
            </div>

            <p className="hero-footer-text">
              Used by 50,000+ students · No credit card required
            </p>
          </div>

          <div className="hero-right">
            <div className="mockup-canvas">
              <div className="notebook-card" ref={notebookRef}>
                <div className="notebook-header">
                  <div className="notebook-icon-wrap">📘</div>
                  <div>
                    <h3>Biology Midterm</h3>
                    <p>5 sources · Last edited today</p>
                  </div>
                </div>
                <div className="tag-row">
                  <span className="tag pdf">PDF</span>
                  <span className="tag audio">AUDIO</span>
                  <span className="tag doc">DOC</span>
                  <span className="tag image">IMAGE</span>
                  <span className="tag video">VIDEO</span>
                </div>
                <div className="summary-box">
                  <div className="summary-title">
                    <span className="summary-dot"></span> AI Summary
                  </div>
                  <p>
                    Covers cellular respiration, photosynthesis, and membrane
                    transport. Key focus areas: ATP synthesis and signal
                    transduction pathways.
                  </p>
                </div>
                <div className="action-buttons-grid">
                  <div className="action-tag">Chat with notes</div>
                  <div className="action-tag">Audio overview</div>
                  <div className="action-tag">Video summary</div>
                  <div className="action-tag">Take Quiz</div>
                </div>
              </div>

              <div className="floating-card float-pdf" ref={(el) => (floatingCardsRef.current[0] = el)}>
                📄 Lecture_Notes.pdf <span className="sub">Added</span>
              </div>
              <div className="floating-card float-audio" ref={(el) => (floatingCardsRef.current[1] = el)}>
                🎵 Chapter_7_Audio.mp3 <span className="sub">Added</span>
              </div>
              <div className="floating-card float-doc" ref={(el) => (floatingCardsRef.current[2] = el)}>
                📝 Study_Guide.docx <span className="sub">Added</span>
              </div>
              <div className="floating-card float-video" ref={(el) => (floatingCardsRef.current[3] = el)}>
                🎬 Seminar_Recording.mp4 <span className="sub">Added</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="how-it-works-animated" ref={howItWorksRef}>
        <div className="section-title-wrap">
          <span className="premium-tag">HOW IT WORKS</span>
          <h2>One notebook. All your sources.</h2>
          <p>Bring in any learning material. SmartStudy unifies it into a single pipeline.</p>
        </div>

        <div className="interactive-hub-container">
          <div className="hub-col left-inputs">
            <div className="source-card"><span>📄</span> Text Documents</div>
            <div className="source-card"><span>▶️</span> Audio Overviews</div>
            <div className="source-card"><span>📹</span> Video Overviews</div>
            <div className="source-card"><span>💡</span> Interactive Quizzes</div>
          </div>

          <div className="central-svg-stream">
            <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
              <path d="M 0 20 Q 100 20 200 100" stroke="url(#blue-grad)" strokeWidth="2.5" className="streaming-path" />
              <path d="M 0 70 Q 100 70 200 100" stroke="url(#amber-grad)" strokeWidth="2.5" className="streaming-path" />
              <path d="M 0 130 Q 100 130 200 100" stroke="url(#red-grad)" strokeWidth="2.5" className="streaming-path" />
              <path d="M 0 180 Q 100 180 200 100" stroke="url(#green-grad)" strokeWidth="2.5" className="streaming-path" />

              <path d="M 200 100 Q 300 30 400 30" stroke="url(#blue-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />
              <path d="M 200 100 Q 300 75 400 75" stroke="url(#amber-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />
              <path d="M 200 100 Q 300 125 400 125" stroke="url(#red-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />
              <path d="M 200 100 Q 300 170 400 170" stroke="url(#green-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />

              <defs>
                <linearGradient id="blue-grad"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                <linearGradient id="amber-grad"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                <linearGradient id="red-grad"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f87171" /></linearGradient>
                <linearGradient id="green-grad"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
              </defs>
            </svg>

            <div className="notebook-sphere-core">
              <div className="sphere-pulse-glow"></div>
              <div className="sphere-content-box">
                <span className="icon">💻</span>
                <h4>SmartStudy</h4>
                <p>Notebook</p>
              </div>
            </div>
          </div>

          <div className="hub-col right-outputs">
            <div className="output-card c-b">Chat Interface</div>
            <div className="output-card c-a">Audio Summary</div>
            <div className="output-card c-v">Video Clips</div>
            <div className="output-card c-q">Quiz Mode</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES ACCORDION */}
      <section className="master-accordion-section">
        <div className="section-title-wrap">
          <span className="premium-tag">FEATURES</span>
          <h2>Four ways to master your material</h2>
        </div>

        <div className="accordion-flex-container">
          {features.map((feat) => (
            <div
              key={feat.id}
              className={`accordion-panel ${activeFeature === feat.id ? "active" : ""}`}
              onMouseEnter={() => setActiveFeature(feat.id)}
              style={{ "--panel-bg": `url(${feat.bg})` }}
            >
              <div className="panel-overlay"></div>
              <div className="panel-content">
                <span className="panel-badge-tag">{feat.tag}</span>
                <div className="panel-text-block">
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
                <button className="panel-action-arrow">↗</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: PUBLIC NOTEBOOKS SLIDER */}
      <section className="community-marquee-section" ref={communityRef}>
        <div className="community-marquee-header">
          <div>
            <span className="premium-tag">PUBLIC NOTEBOOKS</span>
            <h2>Learn from the community</h2>
          </div>
          <button className="browse-all-btn">Browse all notebooks →</button>
        </div>

        <div className="marquee-viewport">
          <div className="marquee-inner" ref={marqueeInnerRef}>
            {[...notebooks, ...notebooks].map((nb, index) => (
              <div key={index} className="marquee-card">
                <div className="card-top">
                  <span className={`sub-icon ${nb.color}`}>⚛️</span>
                  <span className="src-count">{nb.sources}</span>
                </div>
                <span className={`sub-text ${nb.color}`}>{nb.subject}</span>
                <h4>{nb.title}</h4>
                <div className="tag-row">
                  {nb.tags.map((t, idx) => (
                    <span key={idx} className="card-pill">{t}</span>
                  ))}
                </div>
                <div className="card-bottom">
                  <span>👁️ {nb.views}</span>
                  <span className="open-link">Open notebook →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA BANNER */}
      <section className="cta-clean-section" ref={bannerRef}>
        <div className="cta-clean-container">
            
          <div className="cta-clean-content">
            <span className="cta-mini-tag">GET STARTED INSTANTLY</span>
            <h2>Build your first notebook today</h2>
            <p>
              Transform dense PDFs, disorganized notes, and complex audio/video
              material into your own interactive, personalized AI workspace.
            </p>
            <div className="cta-action-wrapper">
              <button className="btn-cta-light">Create a notebook — It's free →</button>
              <span className="cta-fineprint">No credit card required · Free forever for students</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}