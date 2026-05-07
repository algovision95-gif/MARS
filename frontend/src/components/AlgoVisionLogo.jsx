import React from 'react';

/**
 * AlgoVision Logo — SVG component with transparent background
 * Renders the pink diamond logo that blends natively with any dark background.
 * 
 * @param {number} size - Width/height in pixels
 * @param {boolean} glow - Whether to show a pink glow behind the logo
 * @param {string} className - Additional CSS classes
 */
export default function AlgoVisionLogo({ size = 32, glow = false, className = '' }) {
  const id = `av-${size}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow backdrop */}
      {glow && (
        <div
          className="absolute inset-[-40%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      )}

      <svg
        viewBox="0 0 100 105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-lg"
        style={{ filter: glow ? 'drop-shadow(0 0 6px var(--accent-glow))' : undefined }}
      >
        <defs>
          {/* Main pink gradient */}
          <linearGradient id={`pink-${id}`} x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="35%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          {/* 3D shadow gradient for the fold effect */}
          <linearGradient id={`shadow-${id}`} x1="50" y1="5" x2="85" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
            <stop offset="40%" stopColor="rgba(0,0,0,0.65)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>
        </defs>

        {/* Outer diamond shape — pink base */}
        <polygon
          points="50,5 95,50 50,95 5,50"
          fill={`url(#pink-${id})`}
        />

        {/* 3D fold / ribbon shadow — curved path on the right */}
        <path
          d="M50,5 C62,28 62,72 50,95 L95,50 Z"
          fill={`url(#shadow-${id})`}
        />

        {/* Center diamond cutout — shows through to page background */}
        <polygon
          points="50,32 68,50 50,68 32,50"
          fill="var(--bg-color)"
          className="transition-colors"
        />

        {/* Inner highlight on the center cutout edge */}
        <polygon
          points="50,32 68,50 50,68 32,50"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.15"
          strokeWidth="1"
        />

        {/* Small decorative dot / capsule at the bottom */}
        <rect x="44" y="97" width="12" height="4" rx="2" fill="#ec4899" opacity="0.8" />
      </svg>
    </div>
  );
}
