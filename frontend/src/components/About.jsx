import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/About.css";
import { Helmet } from 'react-helmet-async';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const pageRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Text Cascade Animation
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
      });
      tl.fromTo(
        ".about-tag",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, delay: 0.2 },
      )
        .fromTo(
          ".about-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
          "-=0.5",
        )
        .fromTo(
          ".about-subtitle",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=0.6",
        );

      // 2. Metrics Block Fade In
      gsap.fromTo(
        ".metric-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.6,
        },
      );

      // 3. ScrollTrigger for Pillars/Mission Cards
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".mission-grid",
            start: "top 80%",
          },
        },
      );

      // 4. ScrollTrigger for Founder Block
      gsap.fromTo(
        ".founder-card",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".founder-card",
            start: "top 85%",
          },
        },
      );
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
      desc: "SmartStudy is built to level the playing field, providing students with a personalized interactive workspace without premium boundaries.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - About Us</title>
        <meta charSet="utf-8" />
      </Helmet>
      
      <div className="about-page-wrapper" ref={pageRef}>
        {/* SECTION 1: HERO & STORY STORY */}
        <section className="about-hero">
          <div className="about-hero-container">
            <span className="about-tag">OUR STORY</span>
            <h1 className="about-title">
              Building the AI study tool <br />
              <span className="gradient-text">we always wanted</span>
            </h1>
            <p className="about-subtitle">
              SmartStudy AI started at 2 AM during a grueling exam week, when I
              realized that having access to vast folders of information isn't
              the same as actually understanding it. This platform was built to
              bridge that gap.
            </p>
          </div>
        </section>

        {/* SECTION 2: VALUES & MISSION SPLIT PILLARS */}
        <section className="mission-section">
          <div className="mission-container">
            <div className="mission-left-pane">
              <span className="section-label">MISSION</span>
              <h2>Make deep understanding available to every student</h2>
              <p>
                The gap between having access to study materials and actually
                mastering them is enormous. Most students read passively,
                highlight aimlessly, and hope something sticks. We think that's
                a solvable problem.
              </p>
              <p>
                SmartStudy creates an active dialogue between a student and
                their material. Ask questions. Get challenged back. Receive
                explanations tailored to what you already know.
              </p>
            </div>

            <div className="mission-grid">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="pillar-card"
                  ref={(el) => (cardsRef.current[i] = el)}
                >
                  <div className="pillar-icon-box">{pillar.icon}</div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: HONEST SOLO FOUNDER SHOWCASE */}
        <section className="team-section">
          <div className="team-container">
            <span className="section-label-center">THE TEAM</span>
            <h2 className="team-section-title">
              Built by people who love learning
            </h2>

            <div className="founder-card">
              <div className="founder-avatar">⚡</div>
              <div className="founder-info">
                <div className="founder-header">
                  <h3>Student Developer</h3>
                  <span className="founder-role">Founder & Developer</span>
                </div>
                <p>
                  Building the core architecture of SmartStudy AI
                  single-handedly. Focused on developing highly reliable
                  document parsing pipelines and intuitive, lightning-fast
                  interfaces to take the friction out of studying.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: REWRITTEN CLEAN LIGHT CTA */}
        <section className="about-cta-section">
          <div className="about-cta-container">
            <div className="cta-glow-effect"></div>
            <h2>Ready to study differently?</h2>
            <p>
              Transform your course materials into your own interactive,
              personalized AI workspace today.
            </p>
            <div className="about-cta-actions">
              <button className="btn-about-primary">Get started free →</button>
              <button className="btn-about-secondary">Browse notebooks</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
