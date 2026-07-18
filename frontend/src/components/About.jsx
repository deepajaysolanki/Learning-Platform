/**
 * @file About.jsx
 * @description About page for VibeStudy. Features robust GSAP timeline sequencing
 * across every section, dynamic scroll triggers, and a fully responsive layout.
 */

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Helmet } from "react-helmet-async";
import "../styles/About.css";

// Register ScrollTrigger plugin safely
gsap.registerPlugin(ScrollTrigger);

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
    // Force a clean layout calculation before binding animations
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // --- 1. HERO SECTION TIMELINE ---
      if (heroRef.current) {
        const tlHero = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.8 },
        });
        tlHero
          .fromTo(
            ".about-tag",
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, delay: 0.1 },
          )
          .fromTo(
            ".about-title",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0 },
            "-=0.6",
          )
          .fromTo(
            ".about-subtitle",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0 },
            "-=0.6",
          );
      }

      // --- 2. MISSION SECTION TIMELINE ---
      if (missionRef.current) {
        const tlMission = gsap.timeline({
          scrollTrigger: {
            trigger: missionRef.current,
            start: "top 75%",
            invalidateOnRefresh: true,
          },
        });
        tlMission
          .fromTo(
            ".mission-left-pane > *",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
            },
          )
          .fromTo(
            ".pillar-card",
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.7,
              ease: "power2.out",
            },
            "-=0.4",
          );
      }

      // --- 3. TEAM / FOUNDER SECTION TIMELINE ---
      if (teamRef.current) {
        const tlTeam = gsap.timeline({
          scrollTrigger: {
            trigger: teamRef.current,
            start: "top 80%",
            invalidateOnRefresh: true,
          },
        });
        tlTeam
          .fromTo(
            ".team-container > .section-label-center, .team-section-title",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
            },
          )
          .fromTo(
            ".founder-card",
            { opacity: 0, scale: 0.95, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: "back.out(1.2)",
            },
            "-=0.4",
          );
      }

      // --- 4. CTA BANNER TIMELINE ---
      if (ctaRef.current) {
        const tlCTA = gsap.timeline({
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            invalidateOnRefresh: true,
          },
        });
        tlCTA
          .fromTo(
            ".about-cta-container h2",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          )
          .fromTo(
            ".about-cta-container p",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
            "-=0.4",
          )
          .fromTo(
            ".about-cta-actions > *",
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
            },
            "-=0.4",
          );
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
        {/* ==========================================
            SECTION 1: HERO
            ========================================== */}
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

        {/* ==========================================
            SECTION 2: MISSION
            ========================================== */}
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

        {/* ==========================================
            SECTION 3: TEAM / FOUNDER
            ========================================== */}
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
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-footer-btn github"
                    aria-label="Deep Solanki GitHub Profile"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-footer-btn twitter"
                    aria-label="Deep Solanki Twitter Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#000000"
                      class="bi bi-twitter-x"
                      viewBox="0 0 16 16"
                      id="Twitter-X--Streamline-Bootstrap"
                      height="16"
                      width="16"
                    >
                      <desc>
                        Twitter X Streamline Icon: https://streamlinehq.com
                      </desc>
                      <path
                        d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z"
                        stroke-width="1"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 4: CTA BANNER
            ========================================== */}
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
