import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/home.css";
import "../styles/index.css";
import { Helmet } from "react-helmet-async";

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
  const [publicNotebooks, setPublicNotebooks] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);

  // --- FETCH ACTUAL PUBLIC NOTEBOOKS ---
  useEffect(() => {
    const fetchPublicNotebooks = async () => {
      try {
        const res = await fetch("http://localhost:3000/public-notebooks");
        const data = await res.json();
        if (res.ok) {
          const notebooksArray = Array.isArray(data)
            ? data
            : data.notebooks || [];
          setPublicNotebooks(notebooksArray);
        }
      } catch (err) {
        console.error("Error fetching public notebooks:", err);
      } finally {
        setLoadingPublic(false);
      }
    };
    fetchPublicNotebooks();
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

  // --- 1. CORE GSAP STATIC LAYOUT EFFECTS TIMELINE ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- HERO TEXT TIMELINE ---
      if (leftContentRef.current) {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.8 },
        });
        tl.fromTo(
          leftContentRef.current.querySelector(".badge"),
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, delay: 0.2 },
        )
          .fromTo(
            leftContentRef.current.querySelector(".hero-title"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0 },
            "-=0.5",
          )
          .fromTo(
            leftContentRef.current.querySelector(".hero-subtitle"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0 },
            "-=0.6",
          )
          .fromTo(
            leftContentRef.current.querySelectorAll(".hero-cta-group > *"),
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, stagger: 0.15 },
            "-=0.5",
          )
          .fromTo(
            leftContentRef.current.querySelector(".hero-footer-text"),
            { opacity: 0 },
            { opacity: 1 },
            "-=0.4",
          );
      }

      // --- HERO VISUAL CORE DECK ANIMATION ---
      if (notebookRef.current) {
        gsap.fromTo(
          notebookRef.current,
          { opacity: 0, scale: 0.9, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: "back.out(1.2)",
            duration: 1,
            delay: 0.4,
          },
        );

        gsap.to(".abstract-ring-1", {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: "none",
        });
        gsap.to(".abstract-ring-2", {
          rotation: -360,
          duration: 25,
          repeat: -1,
          ease: "none",
        });
      }

      // --- FLOATING BACKGROUND CARDS ---
      floatingCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.5, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            delay: 0.6 + index * 0.1,
            ease: "back.out(1.5)",
          },
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

      // --- HOW IT WORKS VIEWPORT SCROLLTRIGGER ---
      if (howItWorksRef.current) {
        gsap.fromTo(
          ".how-it-works-animated .source-card",
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.6,
            scrollTrigger: { trigger: howItWorksRef.current, start: "top 70%" },
          },
        );

        gsap.fromTo(
          ".how-it-works-animated .output-card",
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.6,
            scrollTrigger: { trigger: howItWorksRef.current, start: "top 70%" },
          },
        );
      }

      // --- CALL TO ACTION BANNER SCROLLTRIGGER ---
      if (bannerRef.current) {
        gsap.fromTo(
          ".cta-clean-content > *",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: bannerRef.current, start: "top 85%" },
          },
        );
      }
    }, componentScopeRef);

    return () => ctx.revert();
  }, []);

  // 🟢 2. NEW CORRECT ROOT-LEVEL HOOK: MOVED OUTSIDE PREVIOUS CONTEXT AND TRIGGERS SMOOTH SCROLLING WHEN LIVE RECORDS LAND
  useEffect(() => {
    if (loadingPublic || !marqueeInnerRef.current || publicNotebooks.length === 0) return;

    const marqueeInner = marqueeInnerRef.current;
    
    // Give browser rendering layout engine a tiny split second to fetch true domestic element scrolling offsets
    const ctx = gsap.context(() => {
      const originalWidth = marqueeInner.scrollWidth / 2;

      const marqueeTween = gsap.to(marqueeInner, {
        x: -originalWidth,
        duration: 35, // Smooth translation runtime control speed
        ease: "none",
        repeat: -1,
      });

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
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - Transform Your Learning</title>
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
                <span className="gradient-text">with SmartStudy AI</span>
              </h1>

              <p className="hero-subtitle">
                Upload your plain text, Word documents, and PowerPoint slides.
                SmartStudy instantly transforms your files into a unified
                learning workspace featuring contextual chat, audio summaries,
                interactive quizzes, and tailored video recommendations.
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

            <div
              className="hero-right"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "540px",
                  height: "460px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "350px",
                    height: "350px",
                    background:
                      "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0) 70%)",
                    top: "5%",
                    right: "0%",
                    zIndex: 0,
                    filter: "blur(30px)",
                  }}
                />

                <div
                  className="floating-card float-pdf"
                  ref={(el) => (floatingCardsRef.current[0] = el)}
                  style={{
                    position: "absolute",
                    top: "12%",
                    left: "-5%",
                    zIndex: 3,
                    boxShadow: "0 12px 30px -5px rgba(99,102,241,0.1)",
                    border: "1px solid #eef2ff",
                    backgroundColor: "#ffffff",
                    borderRadius: "30px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#4f46e5",
                  }}
                >
                  ✨ Contextual Chat
                </div>

                <div
                  className="floating-card float-audio"
                  ref={(el) => (floatingCardsRef.current[1] = el)}
                  style={{
                    position: "absolute",
                    top: "24%",
                    right: "-8%",
                    zIndex: 3,
                    boxShadow: "0 12px 30px -5px rgba(0,0,0,0.05)",
                    border: "1px solid #f1f5f9",
                    backgroundColor: "#ffffff",
                    borderRadius: "30px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  🎧 Audio Summary podcasts
                </div>

                <div
                  className="floating-card float-doc"
                  ref={(el) => (floatingCardsRef.current[2] = el)}
                  style={{
                    position: "absolute",
                    bottom: "18%",
                    left: "-8%",
                    zIndex: 3,
                    boxShadow: "0 12px 30px -5px rgba(0,0,0,0.05)",
                    border: "1px solid #f1f5f9",
                    backgroundColor: "#ffffff",
                    borderRadius: "30px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  🎬 Video Lessons
                </div>

                <div
                  className="floating-card float-video"
                  ref={(el) => (floatingCardsRef.current[3] = el)}
                  style={{
                    position: "absolute",
                    bottom: "8%",
                    right: "2%",
                    zIndex: 3,
                    boxShadow: "0 12px 30px -5px rgba(59,130,246,0.1)",
                    border: "1px solid #eff6ff",
                    backgroundColor: "#ffffff",
                    borderRadius: "30px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#2563eb",
                  }}
                >
                  🔥 Adaptive Quizzes
                </div>

                <div
                  className="notebook-card"
                  ref={notebookRef}
                  style={{
                    position: "relative",
                    width: "80%",
                    height: "340px",
                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(16px)",
                    borderRadius: "32px",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    boxShadow:
                      "0 30px 50px -10px rgba(0, 0, 0, 0.04), 0 10px 20px -5px rgba(0, 0, 0, 0.01)",
                    padding: "30px",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="abstract-ring-1"
                      style={{
                        position: "absolute",
                        width: "220px",
                        height: "220px",
                        borderRadius: "50%",
                        border: "2px dashed #cbd5e1",
                      }}
                    ></div>

                    <div
                      className="abstract-ring-2"
                      style={{
                        position: "absolute",
                        width: "160px",
                        height: "160px",
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#6366f1",
                        borderBottomColor: "#3b82f6",
                      }}
                    ></div>

                    <div
                      style={{
                        position: "absolute",
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#6366f1",
                        borderRadius: "50%",
                        top: "30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        boxShadow: "0 0 12px #6366f1",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "absolute",
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "50%",
                        bottom: "30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        boxShadow: "0 0 12px #3b82f6",
                      }}
                    ></div>

                    <div
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                          "0 10px 25px -5px rgba(99,102,241,0.5), 0 0 30px rgba(59,130,246,0.3)",
                        zIndex: 3,
                      }}
                    >
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4" />
                      </svg>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        bottom: "-10px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#94a3b8",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        Intelligence Engine
                      </p>
                    </div>
                  </div>
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
            <p>
              Bring in your learning material. SmartStudy unifies it into a
              single interactive pipeline.
            </p>
          </div>

          <div className="interactive-hub-container">
            <div className="hub-col left-inputs">
              <div className="source-card">
                <span>📄</span> Plain Text & PDFs
              </div>
              <div className="source-card">
                <span>📝</span> Word Documents (.docx)
              </div>
              <div className="source-card">
                <span>📊</span> PowerPoint Slides (.pptx)
              </div>
            </div>

            <div className="central-svg-stream">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 35 Q 100 35 200 100"
                  stroke="url(#blue-grad)"
                  strokeWidth="2.5"
                  className="streaming-path"
                />
                <path
                  d="M 0 100 Q 100 100 200 100"
                  stroke="url(#amber-grad)"
                  strokeWidth="2.5"
                  className="streaming-path"
                />
                <path
                  d="M 0 165 Q 100 165 200 100"
                  stroke="url(#red-grad)"
                  strokeWidth="2.5"
                  className="streaming-path"
                />

                <path
                  d="M 200 100 Q 300 25 400 25"
                  stroke="url(#blue-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="streaming-path-fast"
                />
                <path
                  d="M 200 100 Q 300 75 400 75"
                  stroke="url(#amber-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="streaming-path-fast"
                />
                <path
                  d="M 200 100 Q 300 125 400 125"
                  stroke="url(#red-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="streaming-path-fast"
                />
                <path
                  d="M 200 100 Q 300 175 400 170"
                  stroke="url(#green-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="streaming-path-fast"
                />

                <defs>
                  <linearGradient id="blue-grad">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="amber-grad">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient id="red-grad">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                  <linearGradient id="green-grad">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
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
              <div className="output-card c-a">Audio Overviews</div>
              <div className="output-card c-v">Video Recommendations</div>
              <div className="output-card c-q">Interactive Quizzes</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: STUDY WORKFLOWS */}
        <section className="master-accordion-section">
          <div className="section-title-wrap">
            <span className="premium-tag">STUDY WORKFLOWS</span>
            <h2>Built for how you actually learn</h2>
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
            <div className="section-title-wrap">
              <span className="premium-tag">PUBLIC NOTEBOOKS</span>
              <h2>Learn from the community</h2>
            </div>
          </div>
          <div className="community-marquee-subtitle">
            <button className="browse-all-btn">Browse all notebooks →</button>
          </div>

          <div className="marquee-viewport">
            {loadingPublic ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6366f1",
                  fontWeight: "bold",
                }}
              >
                ⏳ Loading community notes...
              </div>
            ) : publicNotebooks.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#64748b",
                }}
              >
                No public notebooks available right now.
              </div>
            ) : (
              <div className="marquee-inner" ref={marqueeInnerRef}>
                {/* DYNAMIC SCROLLTRIGGER REFRESH TRIGGER HACK */}
                <span
                  ref={() => {
                    setTimeout(() => ScrollTrigger.refresh(), 100);
                  }}
                  style={{ display: "none" }}
                />

                {[...publicNotebooks, ...publicNotebooks].map(
                  (notebook, index) => {
                    return (
                      <div
                        key={index}
                        className="marquee-card"
                        style={{
                          backgroundColor: "white",
                          padding: "24px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          width: "450px",
                          textAlign: "left",
                          flexShrink: 0,
                          boxSizing: "border-box",
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
                                fontSize: "18px",
                                fontWeight: "800",
                                lineHeight: "1.2",
                              }}
                            >
                              {notebook.title || "Untitled Notebook"}
                            </h3>
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
                              
                            </div>
                          </div>
                        </div>

                        {/* ACTUAL SUMMARY BOX FROM DATABASE */}
                        <div
                          style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: "12px",
                            padding: "16px",
                            marginTop: "20px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "8px",
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
                                fontSize: "14px",
                              }}
                            >
                              Summary
                            </span>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "#475569",
                              fontSize: "14px",
                              lineHeight: "1.5",
                            }}
                          >
                            {notebook.aiSummary ||
                              "No summary preview available for this public collection."}
                          </p>
                        </div>

                        {/* SIDE-BY-SIDE TWO BUTTON ACTION GRID */}
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "20px",
                          }}
                        >
                          <button
                            onClick={() =>
                              (window.location.href = `/notebook/${notebook._id || notebook.id}`)
                            }
                            style={{
                              flex: 1,
                              padding: "12px 6px",
                              backgroundColor: "#6366f1",
                              border: "none",
                              borderRadius: "8px",
                              color: "white",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "13px",
                              textAlign: "center",
                            }}
                          >
                            Open Notebook
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/notebook/${notebook._id || notebook.id}?action=quiz`)
                            }
                            style={{
                              flex: 1,
                              padding: "12px 6px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              color: "#4f46e5",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "13px",
                              textAlign: "center",
                            }}
                          >
                            Take Quiz
                          </button>
                        </div>

                        {/* CARD FOOTER METRICS WITH LIVE DATA */}
                        <div
                          style={{
                            borderTop: "1px solid #e2e8f0",
                            marginTop: "20px",
                            paddingTop: "14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              color: "#64748b",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
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
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              <span
                                style={{ fontSize: "14px", fontWeight: "500" }}
                              >
                                {notebook.likes || 0}
                              </span>
                            </div>
                            <svg
                              style={{ cursor: "pointer" }}
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="18" cy="5" r="3"></circle>
                              <circle cx="6" cy="12" r="3"></circle>
                              <circle cx="18" cy="19" r="3"></circle>
                              <line
                                x1="8.59"
                                y1="13.51"
                                x2="15.42"
                                y2="17.49"
                              ></line>
                              <line
                                x1="15.41"
                                y1="6.51"
                                x2="8.59"
                                y2="10.49"
                              ></line>
                            </svg>
                          </div>

                          <div
                            style={{
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            @{notebook.author?.username || "community_user"}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
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
              
              {/* 🟢 FIXED: REMOVED AUDIO/VIDEO UPLOADS REFERENCES 🟢 */}
              <p>
                Transform dense PDFs, plain text, and PowerPoint slides into your 
                own interactive, personalized AI workspace featuring smart summaries 
                and custom video insights.
              </p>
              
              <div className="cta-action-wrapper">
                <button
                  className="cta-action-btn"
                  onClick={() => window.location.href = '/dashboard'} // Make sure it routes to your actual app/dashboard!
                  style={{
                    padding: "14px 28px",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Create a notebook — It's free →
                </button>
                <span className="cta-fineprint">
                  No credit card required · Free forever for students
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
} 