import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Helmet } from "react-helmet-async";
import "../styles/About.css";

// Register ScrollTrigger plugin safely
gsap.registerPlugin(ScrollTrigger);

// Turn off null target warnings globally for GSAP
gsap.config({ nullTargetWarn: false });

export default function About() {
  const navigate = useNavigate();

  // Master Page Ref
  const pageRef = useRef(null);

  // Section Refs for GSAP scoping
  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const teamRef = useRef(null);
  const ctaRef = useRef(null);

  // =========================================================================
  // GSAP MASTER ANIMATION ENGINE
  // =========================================================================
  useEffect(() => {
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // --- 1. HERO SECTION TIMELINE ---
      if (heroRef.current) {
        const tag = heroRef.current.querySelector(".about-tag");
        const title = heroRef.current.querySelector(".about-title");
        const subtitle = heroRef.current.querySelector(".about-subtitle");

        const tlHero = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.8 },
        });

        if (tag) tlHero.fromTo(tag, { opacity: 0, y: -20 }, { opacity: 1, y: 0, delay: 0.1 });
        if (title) tlHero.fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.6");
        if (subtitle) tlHero.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.6");
      }

      // --- 2. MISSION SECTION TIMELINE ---
      if (missionRef.current) {
        const leftElements = missionRef.current.querySelectorAll(".mission-left-pane > *");
        const pillars = missionRef.current.querySelectorAll(".pillar-card");

        const tlMission = gsap.timeline({
          scrollTrigger: {
            trigger: missionRef.current,
            start: "top 75%",
            invalidateOnRefresh: true,
          },
        });

        if (leftElements.length > 0) {
          tlMission.fromTo(
            leftElements,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" }
          );
        }

        if (pillars.length > 0) {
          tlMission.fromTo(
            pillars,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power2.out" },
            "-=0.4"
          );
        }
      }

      // --- 3. TEAM / FOUNDER SECTION TIMELINE ---
      if (teamRef.current) {
        const teamTitles = teamRef.current.querySelectorAll(".section-label-center, .team-section-title");
        const founderCard = teamRef.current.querySelector(".founder-card");

        const tlTeam = gsap.timeline({
          scrollTrigger: {
            trigger: teamRef.current,
            start: "top 80%",
            invalidateOnRefresh: true,
          },
        });

        if (teamTitles.length > 0) {
          tlTeam.fromTo(
            teamTitles,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" }
          );
        }

        if (founderCard) {
          tlTeam.fromTo(
            founderCard,
            { opacity: 0, scale: 0.95, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" },
            "-=0.4"
          );
        }
      }

      // --- 4. CTA BANNER TIMELINE ---
      if (ctaRef.current) {
        const heading = ctaRef.current.querySelector(".about-cta-container h2");
        const text = ctaRef.current.querySelector(".about-cta-container p");
        const actions = ctaRef.current.querySelectorAll(".about-cta-actions > *");

        const tlCTA = gsap.timeline({
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            invalidateOnRefresh: true,
          },
        });

        if (heading) tlCTA.fromTo(heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
        if (text) tlCTA.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4");
        if (actions.length > 0) {
          tlCTA.fromTo(
            actions,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" },
            "-=0.4"
          );
        }
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const pillars = [
    {
      icon: "🎯",
      title: "Understanding over memorization",
      desc: "We believe cramming facts is less valuable than building deep mental models. Everything we build pushes toward genuine comprehension.",
    },
    {
      icon: "🔍",
      title: "Grounded in your material",
      desc: "By forcing the AI to strictly cite your uploaded documents, we maximize accuracy so you can trust and verify exactly what you are learning.",
    },
    {
      icon: "🛠️",
      title: "Tools that get out of the way",
      desc: "The best study tool is the one you forget you are using. We obsess over removing friction from every interaction.",
    },
    {
      icon: "🌍",
      title: "Education should be accessible",
      desc: "VibeStudy is built to level the playing field, providing students with a personalized interactive workspace without premium boundaries.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>VibeStudy | About Our Mission & Architecture</title>
        <meta
          name="description"
          content="Discover how VibeStudy scales complex textual documents into interactive grounded AI systems designed by students, for students."
        />
      </Helmet>

      <div className="about-page-wrapper" ref={pageRef}>
        {/* SECTION 1: HERO */}
        <section className="about-hero" ref={heroRef}>
          <div className="about-hero-container">
            <span className="about-tag">OUR STORY</span>
            <h1 className="about-title">
              Building the AI study tool <br />
              <span className="gradient-text">we always wanted</span>
            </h1>
            <p className="about-subtitle">
              VibeStudy started at 2 AM during a grueling exam week, when we
              realized that having access to vast folders of information isn't
              the same as actually understanding it. This platform was built to
              bridge that gap seamlessly.
            </p>
          </div>
        </section>

        {/* SECTION 2: MISSION */}
        <section className="mission-section" ref={missionRef}>
          <div className="mission-container">
            <div className="mission-left-pane">
              <span className="section-label">MISSION</span>
              <h2>Make deep understanding available to every student</h2>
              <p>
                The gap between having access to study materials and actually
                mastering them is enormous. Most students read passively,
                highlight aimlessly, and hope something sticks. We think that's
                a completely solvable problem.
              </p>
              <p>
                VibeStudy creates an active dialogue between a student and their
                material. Ask questions. Get challenged back. Receive
                explanations tailored to what you already know.
              </p>
            </div>

            <div className="mission-grid">
              {pillars.map((pillar, i) => (
                <div key={i} className="pillar-card">
                  <div className="pillar-icon-box">{pillar.icon}</div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: TEAM / FOUNDER */}
        <section className="team-section" ref={teamRef}>
          <div className="team-container">
            <span className="section-label-center">THE TEAM</span>
            <h2 className="team-section-title">
              Built by people who love learning
            </h2>

            <div className="founder-card">
              <div className="founder-avatar">⚡</div>
              <div className="founder-info">
                <div className="founder-header">
                  <div className="founder-meta-titles">
                    <h3>Deep Solanki</h3>
                    <span className="founder-role">Founder & Developer</span>
                  </div>
                </div>

                <p className="founder-bio">
                  Building the complete full-stack web architecture of VibeStudy
                  single-handedly. Focused on engineering highly robust document
                  processing pipelines and performance-optimized UI spaces to
                  fully remove cognitive friction from the learning process.
                </p>

                {/* SOCIAL BUTTONS FOOTER */}
                <div className="founder-card-footer">
                  <a
                    href="https://github.com/deepajaysolanki"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-footer-btn github"
                    aria-label="Deep Solanki GitHub Profile"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.082.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 3.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/deepSolankii_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-footer-btn twitter"
                    aria-label="Deep Solanki Twitter Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      height="16"
                      width="16"
                    >
                      <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CTA BANNER */}
        <section className="about-cta-section" ref={ctaRef}>
          <div className="about-cta-container">
            <div className="cta-glow-effect"></div>
            <h2>Ready to study differently?</h2>
            <p>
              Transform your course materials into your own interactive,
              personalized AI workspace today.
            </p>
            <div className="about-cta-actions">
              <button
                className="btn-about-primary"
                onClick={() => navigate("/dashboard")}
              >
                Get started free →
              </button>
              <button
                className="btn-about-secondary"
                onClick={() => navigate("/dashboard")}
              >
                Browse notebooks
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}