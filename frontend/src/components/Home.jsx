import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Helmet } from "react-helmet-async";
import "../styles/home.css"
import "../styles/index.css";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const navigate = useNavigate();

  // GSAP Scope References
  const componentScopeRef = useRef(null);
  const leftContentRef = useRef(null);
  const notebookRef = useRef(null);
  const floatingCardsRef = useRef([]);

  const howItWorksRef = useRef(null);
  const accordionRef = useRef(null);
  const communityRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const bannerRef = useRef(null);

  // State
  const [activeFeature, setActiveFeature] = useState(0);
  const [publicNotebooks, setPublicNotebooks] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);

  // =========================================================================
  // 1. DATA FETCHING: PUBLIC NOTEBOOKS
  // =========================================================================
  useEffect(() => {
    let isMounted = true;
    const fetchPublicNotebooks = async () => {
      try {
        const res = await fetch("https://vibestudy-backend-o61q.onrender.com/public-notebooks");
        const data = await res.json();
        if (res.ok && isMounted) {
          const notebooksArray = Array.isArray(data) ? data : data.notebooks || [];
          setPublicNotebooks(notebooksArray);
        }
      } catch (err) {
        // Silent fallback
      } finally {
        if (isMounted) {
          setLoadingPublic(false);
          setTimeout(() => ScrollTrigger.refresh(), 150);
        }
      }
    };
    fetchPublicNotebooks();
    return () => { isMounted = false; };
  }, []);

  const features = [
    {
      id: 0,
      tag: "Deep-Dive Study",
      title: "Prepare for hard concepts",
      desc: "Upload dense readings and use the Chat Interface to instantly unpack complex logic, synthesize definitions, and clear up tricky lecture gaps.",
      bg: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 1,
      tag: "Active Commute",
      title: "Review on the go",
      desc: "Turn your uploaded text documents and presentation slides into dual-narrator Audio Overviews to listen like a podcast during your morning walk or drive.",
      bg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      tag: "Visual Context",
      title: "Bridge gaps with Video",
      desc: "Get context-aware Video Recommendations mapped straight to your weakest study areas, providing an immediate fallback explanation when text isn't enough.",
      bg: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      tag: "Exam Readiness",
      title: "Simulate test day",
      desc: "Run personalized diagnostic checks via Interactive Quizzes based purely on your uploaded files to lock down retention and catch blind spots early.",
      bg: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // =========================================================================
  // 2. GSAP MASTER ANIMATION ENGINE
  // =========================================================================
  useEffect(() => {
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      const tlHero = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tlHero
        .fromTo(".badge", { opacity: 0, y: -20 }, { opacity: 1, y: 0, delay: 0.1 })
        .fromTo(".hero-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.6")
        .fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.6")
        .fromTo(".hero-cta-group > *", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, stagger: 0.1 }, "-=0.6")
        .fromTo(".hero-footer-text", { opacity: 0 }, { opacity: 1 }, "-=0.5")
        .fromTo(".hero-graphic-wrap", { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, "-=0.8");

      gsap.to(".abstract-ring-1", { rotation: 360, duration: 20, repeat: -1, ease: "none" });
      gsap.to(".abstract-ring-2", { rotation: -360, duration: 25, repeat: -1, ease: "none" });

      gsap.utils.toArray(".floating-card").forEach((card, index) => {
        gsap.fromTo(card, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.8 + (index * 0.1), ease: "back.out(1.5)" });
        gsap.to(card, { y: index % 2 === 0 ? "-8px" : "8px", duration: 2 + index, ease: "sine.inOut", repeat: -1, yoyo: true, delay: index * 0.2 });
      });

      const tlHowItWorks = gsap.timeline({
        scrollTrigger: { trigger: ".how-it-works-animated", start: "top 75%", invalidateOnRefresh: true }
      });
      tlHowItWorks
        .fromTo(".how-it-works-animated .section-title-wrap > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 })
        .fromTo(".left-inputs .source-card", { opacity: 0, x: -40 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.2")
        .fromTo(".notebook-sphere-core", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }, "-=0.3")
        .fromTo(".right-outputs .output-card", { opacity: 0, x: 40 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.4");

    }, componentScopeRef);

    return () => ctx.revert();
  }, []);

  // =========================================================================
  // 3. INFINITE MARQUEE TRANSLATION CONTROLLER
  // =========================================================================
  useEffect(() => {
    if (loadingPublic || !marqueeInnerRef.current || publicNotebooks.length === 0) return;

    const marqueeInner = marqueeInnerRef.current;
    const ctx = gsap.context(() => {
      const originalWidth = marqueeInner.scrollWidth / 2;
      const marqueeTween = gsap.to(marqueeInner, { x: -originalWidth, duration: 35, ease: "none", repeat: -1 });

      const pauseAnimation = () => marqueeTween.pause();
      const playAnimation = () => marqueeTween.play();

      marqueeInner.addEventListener("mouseenter", pauseAnimation);
      marqueeInner.addEventListener("mouseleave", playAnimation);

      return () => {
        marqueeInner.removeEventListener("mouseenter", pauseAnimation);
        marqueeInner.removeEventListener("mouseleave", playAnimation);
      };
    }, componentScopeRef);

    return () => ctx.revert();
  }, [publicNotebooks, loadingPublic]);

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
    <>
      <Helmet>
        <title>VibeStudy - Transform Your Learning</title>
        <meta charSet="utf-8" />
      </Helmet>

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
                <span className="gradient-text">with VibeStudy</span>
              </h1>
              <p className="hero-subtitle">
                Upload your plain text, Word documents, and PowerPoint slides.
                VibeStudy instantly transforms your files into a unified
                learning workspace featuring contextual chat, audio summaries,
                interactive quizzes, and tailored video recommendations.
              </p>
              <div className="hero-cta-group">
                <button
                  className="btn-hero-primary"
                  onMouseMove={handleButtonMove}
                  onMouseLeave={handleButtonReset}
                  onClick={() => navigate("/notebooks")}
                >
                  Get started — It's free <span>→</span>
                </button>
                <a href="#how-it-works" className="btn-hero-link">
                  See how it works →
                </a>
              </div>
              {/* <p className="hero-footer-text">
                Used by 50,000+ students · No credit card required
              </p> */}
            </div>

            <div className="hero-right">
              <div className="hero-graphic-wrap">
                <div className="radial-ambient-glow" />

                <div className="floating-card float-pdf" ref={(el) => (floatingCardsRef.current[0] = el)}>
                  ✨ Contextual Chat
                </div>
                <div className="floating-card float-audio" ref={(el) => (floatingCardsRef.current[1] = el)}>
                  🎧 Audio Summary podcasts
                </div>
                <div className="floating-card float-doc" ref={(el) => (floatingCardsRef.current[2] = el)}>
                  🎬 Video Lessons
                </div>
                <div className="floating-card float-video" ref={(el) => (floatingCardsRef.current[3] = el)}>
                  🔥 Adaptive Quizzes
                </div>

                <div className="notebook-card" ref={notebookRef}>
                  <div className="notebook-card-inner">
                    <div className="abstract-ring-1"></div>
                    <div className="abstract-ring-2"></div>
                    <div className="core-gradient-sphere">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4" />
                      </svg>
                    </div>
                    <div className="intelligence-engine-tag">
                      <p>Intelligence Engine</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section id="how-it-works" className="how-it-works-animated" ref={howItWorksRef}>
          <div className="section-title-wrap">
            <span className="premium-tag">HOW IT WORKS</span>
            <h2>One notebook. All your sources.</h2>
            <p>Bring in your learning material. VibeStudy unifies it into a single interactive pipeline.</p>
          </div>

          <div className="interactive-hub-container">
            <div className="hub-col left-inputs">
              <div className="source-card"><span>📄</span> Plain Text & PDFs</div>
              <div className="source-card"><span>📝</span> Word Documents (.docx)</div>
              <div className="source-card"><span>📊</span> PowerPoint Slides (.pptx)</div>
            </div>

            <div className="central-svg-stream">
              <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none">
                {/* 3 LEFT INPUT LINES -> CENTER HUB */}
                <path d="M 0 50 C 100 50, 100 150, 150 150" stroke="url(#blue-grad)" strokeWidth="2.5" strokeDasharray="6 6" className="streaming-path" />
                <path d="M 0 150 C 100 150, 100 150, 150 150" stroke="url(#amber-grad)" strokeWidth="2.5" strokeDasharray="6 6" className="streaming-path" />
                <path d="M 0 250 C 100 250, 100 150, 150 150" stroke="url(#red-grad)" strokeWidth="2.5" strokeDasharray="6 6" className="streaming-path" />

                {/* 4 RIGHT OUTPUT LINES */}
                <path d="M 300 35 C 200 35, 200 150, 150 150" stroke="url(#blue-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />
                <path d="M 300 110 C 200 110, 200 150, 150 150" stroke="url(#amber-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />
                <path d="M 300 190 C 200 190, 200 150, 150 150" stroke="url(#red-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />
                <path d="M 300 265 C 200 265, 200 150, 150 150" stroke="url(#green-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="streaming-path-fast" />

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
                  <h4>VibeStudy</h4>
                  <p>Notebook</p>
                </div>
              </div>
            </div>

            <div className="hub-col right-outputs">
              <div className="output-card c-b">Chat Interface</div>
              <div className="output-card c-a">Audio Overviews</div>
              <div className="output-card c-v">Video Recommendations</div>
              <div className="output-card c-q">Interactive Quizzes</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: STUDY WORKFLOWS */}
        <section className="master-accordion-section" ref={accordionRef}>
          <div className="section-title-wrap">
            <span className="premium-tag">STUDY WORKFLOWS</span>
            <h2>Built for how you actually learn</h2>
          </div>

          <div className="accordion-flex-container">
            {features.map((feat) => (
              <div
                key={feat.id}
                className={`accordion-panel ${activeFeature === feat.id ? "active" : ""}`}
                onClick={() => setActiveFeature(feat.id)}
                onMouseEnter={() => setActiveFeature(feat.id)}
                style={{ "--panel-bg": `url(${feat.bg})` }}
              >
                <div className="panel-overlay"></div>
                <div className="panel-content">
                  <span className="panel-badge-tag">{feat.tag}</span>
                  <div className="panel-text-block">
                    <h3>{feat.title}</h3>
                    <p className="panel-desc">{feat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PUBLIC NOTEBOOKS SLIDER */}
        <section className="community-marquee-section" ref={communityRef}>
          <div className="community-marquee-header">
            <div className="section-title-wrap marquee-header-reset">
              <span className="premium-tag">PUBLIC NOTEBOOKS</span>
              <h2>Learn from the community</h2>
            </div>
            <button className="browse-all-btn" onClick={() => navigate("/notebooks")}>
              Browse all notebooks →
            </button>
          </div>

          <div className="marquee-viewport">
            {loadingPublic ? (
              <div className="marquee-loading">⏳ Loading community notes...</div>
            ) : publicNotebooks.length === 0 ? (
              <div className="marquee-empty">No public notebooks available right now.</div>
            ) : (
              <div className="marquee-inner" ref={marqueeInnerRef}>
                {[...publicNotebooks, ...publicNotebooks].map((notebook, index) => {
                  const likeCount = Array.isArray(notebook.likes)
                    ? notebook.likes.length
                    : (typeof notebook.likes === 'number' ? notebook.likes : 0);

                  const authorName = typeof notebook.author === 'object'
                    ? notebook.author?.username || "community_user"
                    : notebook.author || "community_user";

                  return (
                    <div key={index} className="marquee-card">

                      <div className="marquee-card-header">
                        <div className="marquee-card-icon-box">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M4 19V5C4 3.89543 4.89543 3 6 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H6C4.89543 21 4 20.1046 4 19ZM4 19C4 20.1046 4.89543 21 6 21H19" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 3V21" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="marquee-card-title">{notebook.title || "Untitled Notebook"}</h3>
                        </div>
                      </div>

                      <div className="marquee-summary-box">
                        <div className="marquee-summary-header">
                          <div className="marquee-summary-dot"></div>
                          <span className="marquee-summary-label">Summary</span>
                        </div>
                        <p className="marquee-summary-text">{notebook.aiSummary || notebook.summary || "No summary preview available for this public collection."}</p>
                      </div>

                      <div className="marquee-action-grid">
                        <button className="btn-marquee-primary" onClick={() => navigate(`/notebook/${notebook._id || notebook.id}/study`)}>Open Notebook</button>
                        <button className="btn-marquee-secondary" onClick={() => navigate(`/notebook/${notebook._id || notebook.id}/quiz`)}>Take Quiz</button>
                      </div>

                      <div className="marquee-card-footer">
                        <div className="marquee-likes">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4757" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span>{likeCount}</span>
                        </div>
                        <div className="marquee-author-badge">@{authorName}</div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: CTA BANNER */}
        <section className="cta-clean-section" ref={bannerRef}>
          <div className="cta-clean-container">
            <div className="cta-clean-content">
              <span className="cta-mini-tag">GET STARTED INSTANTLY</span>
              <h2>Build your first notebook today</h2>
              <p>
                Transform dense PDFs, plain text, and PowerPoint slides into your
                own interactive, personalized AI workspace featuring smart summaries
                and custom video insights.
              </p>
              <div className="cta-action-wrapper">
                <button className="cta-action-btn" onClick={() => navigate("/notebooks")}>
                  Create a notebook — It's free →
                </button>
                <span className="cta-fineprint">No credit card required · Free forever for students</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}