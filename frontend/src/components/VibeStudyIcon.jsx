import React from "react";

export default function VibeStudyIcon({ size = 48, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: "22%", boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)", ...style }}
    >
      <defs>
        {/* Modern Vibrant Gradient Background */}
        <linearGradient id="vibeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Glow Shadow for Icon Details */}
        <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* App Icon Container Tile */}
      <rect width="100" height="100" rx="22" fill="url(#vibeBg)" />

      {/* Notebook / Document Symbol */}
      <rect
        x="24"
        y="22"
        width="48"
        height="58"
        rx="8"
        fill="#ffffff"
        opacity="0.95"
        filter="url(#iconGlow)"
      />

      {/* Document Content Lines (Simulating Notes) */}
      <rect x="32" y="32" width="22" height="4" rx="2" fill="#818cf8" opacity="0.6" />
      <rect x="32" y="40" width="32" height="4" rx="2" fill="#cbd5e1" />
      <rect x="32" y="48" width="28" height="4" rx="2" fill="#cbd5e1" />

      {/* Grounded AI Active Checkmark / Lightning (Fun & Quick Solving) */}
      <path
        d="M 44 68 L 54 78 L 78 40"
        stroke="#22c55e"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#iconGlow)"
      />

      {/* AI Sparkle Stars (Fun & Smart AI Vibe) */}
      {/* Top Right Sparkle */}
      <path
        d="M 72 20 Q 72 26 78 26 Q 72 26 72 32 Q 72 26 66 26 Q 72 26 72 20 Z"
        fill="#fbbf24"
      />
      {/* Small Secondary Sparkle */}
      <path
        d="M 22 72 Q 22 75 25 75 Q 22 75 22 78 Q 22 75 19 75 Q 22 75 22 72 Z"
        fill="#f472b6"
      />
    </svg>
  );
}