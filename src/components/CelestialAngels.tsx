import React from 'react';

/**
 * High-fidelity Celestial Angel and Buzz Lightyear SVG components
 * representing the Biblical Seraphim / Ophanim angels and Buzz in awe.
 */

export const CelestialAngelSVG: React.FC<{
  size?: number;
  width?: number;
  height?: number;
  glow?: boolean;
  className?: string;
  rotation?: number;
}> = ({ size = 80, width, height, glow = true, className = '', rotation = 0 }) => {
  const w = width || size;
  const h = height || (size * 100) / 80;

  return (
    <svg
      viewBox="0 0 100 125"
      width={w}
      height={h}
      className={`select-none ${className}`}
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        filter: glow ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : undefined,
      }}
    >
      <defs>
        <radialGradient id="divineEyeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <linearGradient id="robeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <radialGradient id="haloRaysGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Radiating Divine Rays / Halo */}
      <circle cx="50" cy="36" r="34" fill="url(#haloRaysGrad)" />
      <g stroke="#f59e0b" strokeWidth="0.6" opacity="0.8">
        {[...Array(24)].map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 22;
          const y1 = 36 + Math.sin(rad) * 22;
          const x2 = 50 + Math.cos(rad) * 35;
          const y2 = 36 + Math.sin(rad) * 35;
          return <line key={`ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={i % 2 === 0 ? '1 1' : undefined} />;
        })}
      </g>

      {/* 2. Floating Concentric Halo of Segmented Eyes (Ophanim) */}
      <ellipse cx="50" cy="24" rx="30" ry="7" fill="none" stroke="#d97706" strokeWidth="1.2" />
      {[18, 30, 42, 50, 58, 70, 82].map((xPos, idx) => {
        const yPos = 24 + Math.sin(((idx - 3) / 3) * (Math.PI / 2)) * 3;
        return (
          <g key={`eye-ring-${idx}`}>
            <ellipse cx={xPos} cy={yPos} rx="3" ry="1.8" fill="#ffffff" stroke="#1e293b" strokeWidth="0.5" />
            <circle cx={xPos} cy={yPos} r="1" fill="#0f172a" />
            <circle cx={xPos + 0.3} cy={yPos - 0.3} r="0.4" fill="#ffffff" />
          </g>
        );
      })}

      {/* 3. Upper Crown & Giant All-Seeing Eye */}
      <circle cx="50" cy="30" r="11" fill="url(#divineEyeGrad)" stroke="#1e293b" strokeWidth="0.8" />
      <circle cx="50" cy="30" r="6" fill="#0f172a" />
      <circle cx="50" cy="30" r="3.5" fill="#1e1b4b" />
      <circle cx="51.5" cy="28.5" r="1.4" fill="#ffffff" />

      {/* 4. Second Ring: Sacred Sensorial Band (Noses & Lips) */}
      <ellipse cx="50" cy="42" rx="26" ry="6" fill="none" stroke="#b45309" strokeWidth="1.0" />
      {[28, 42, 58, 72].map((nx, i) => (
        <path key={`nose-${i}`} d={`M ${nx - 2} 43 Q ${nx} 40 ${nx + 2} 43`} fill="none" stroke="#475569" strokeWidth="0.7" />
      ))}

      {/* 5. Flowing Draped Robe of the Celestial Entity */}
      <path
        d="M 38 48 Q 50 46 62 48 L 78 112 Q 50 118 22 112 Z"
        fill="url(#robeGrad)"
        stroke="#1e293b"
        strokeWidth="1.2"
      />
      {/* Robe Engraving Lines */}
      <path d="M 32 58 Q 30 85 26 110" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
      <path d="M 42 52 Q 40 85 38 114" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
      <path d="M 50 50 L 50 116" fill="none" stroke="#64748b" strokeWidth="0.7" />
      <path d="M 58 52 Q 60 85 62 114" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
      <path d="M 68 58 Q 70 85 74 110" fill="none" stroke="#94a3b8" strokeWidth="0.6" />

      {/* 6. Multiple Holy Hands in Prayer and Gestures */}
      {/* Top Hands praying near chest */}
      <g stroke="#1e293b" strokeWidth="0.7" fill="#f8fafc">
        {/* Left chest hand */}
        <path d="M 44 68 Q 48 60 50 63 Q 48 70 44 72 Z" />
        {/* Right chest hand */}
        <path d="M 56 68 Q 52 60 50 63 Q 52 70 56 72 Z" />

        {/* Outreach Hands left */}
        <path d="M 36 62 Q 22 56 16 52 Q 20 62 34 68 Z" />
        <path d="M 35 74 Q 18 72 12 70 Q 18 78 33 79 Z" />
        <path d="M 36 86 Q 24 88 18 92 Q 26 95 36 91 Z" />

        {/* Outreach Hands right */}
        <path d="M 64 62 Q 78 56 84 52 Q 80 62 66 68 Z" />
        <path d="M 65 74 Q 82 72 88 70 Q 82 78 67 79 Z" />
        <path d="M 64 86 Q 76 88 82 92 Q 74 95 64 91 Z" />
      </g>

      {/* Flowing golden hair/strands draping downwards */}
      <path d="M 45 42 Q 43 75 42 105" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6" />
      <path d="M 55 42 Q 57 75 58 105" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
};

export const BuzzGazingAngelSVG: React.FC<{
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}> = ({ size = 70, width, height, className = '' }) => {
  const w = width || size;
  const h = height || size;

  return (
    <svg
      viewBox="0 0 100 100"
      width={w}
      height={h}
      className={`select-none ${className}`}
    >
      <defs>
        <radialGradient id="buzzDomeGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#15803d" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="buzzFaceGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="60%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#f472b6" />
        </radialGradient>
      </defs>

      {/* Legs & Meat Boots sitting on ground */}
      {/* Right Boot with MEAT text */}
      <g transform="rotate(12 75 75)">
        <ellipse cx="74" cy="78" rx="14" ry="9" fill="#1e1b4b" stroke="#141414" strokeWidth="1.2" />
        <ellipse cx="74" cy="78" rx="12" ry="7" fill="#a855f7" stroke="#22c55e" strokeWidth="1.0" />
        <text
          x="74"
          y="81"
          textAnchor="middle"
          fill="#141414"
          fontSize="6"
          fontWeight="900"
          fontFamily="impact, sans-serif"
          letterSpacing="0.5"
        >
          MEAT
        </text>
      </g>

      {/* Left Boot */}
      <g transform="rotate(-15 25 75)">
        <ellipse cx="26" cy="78" rx="12" ry="8" fill="#1e1b4b" stroke="#141414" strokeWidth="1.2" />
        <ellipse cx="26" cy="78" rx="10" ry="6" fill="#a855f7" stroke="#22c55e" strokeWidth="0.8" />
      </g>

      {/* Robotic Torso / Space Suit */}
      <ellipse cx="50" cy="58" rx="26" ry="18" fill="#f8fafc" stroke="#141414" strokeWidth="1.5" />
      {/* Green Chest Accent */}
      <path d="M 28 54 Q 50 62 72 54 L 68 64 Q 50 70 32 64 Z" fill="#22c55e" stroke="#141414" strokeWidth="1.0" />

      {/* Chest Buttons */}
      <circle cx="38" cy="58" r="2.2" fill="#3b82f6" stroke="#141414" strokeWidth="0.6" />
      <circle cx="44" cy="58" r="2.2" fill="#22c55e" stroke="#141414" strokeWidth="0.6" />
      <circle cx="50" cy="58" r="2.2" fill="#ef4444" stroke="#141414" strokeWidth="0.6" />
      <rect x="56" y="56" width="7" height="4" rx="2" fill="#ef4444" stroke="#141414" strokeWidth="0.6" />

      {/* Arms resting */}
      {/* Left arm */}
      <path d="M 26 50 Q 14 56 12 70 Q 18 72 24 62" fill="#f8fafc" stroke="#141414" strokeWidth="1.2" />
      <path d="M 12 70 Q 8 76 10 80 Q 14 78 14 72" fill="#9333ea" stroke="#141414" strokeWidth="0.8" />

      {/* Right arm */}
      <path d="M 74 50 Q 86 56 88 70 Q 82 72 76 62" fill="#f8fafc" stroke="#141414" strokeWidth="1.2" />
      <circle cx="78" cy="46" r="4.5" fill="#94a3b8" stroke="#141414" strokeWidth="1.0" />

      {/* Purple Cowl / Neck ruff */}
      <ellipse cx="50" cy="38" rx="22" ry="14" fill="#9333ea" stroke="#141414" strokeWidth="1.5" />
      <ellipse cx="50" cy="38" rx="19" ry="11" fill="#7e22ce" />

      {/* Glass Bubble Helmet Base Ring */}
      <circle cx="50" cy="32" r="23" fill="url(#buzzDomeGrad)" stroke="#22c55e" strokeWidth="1.8" />

      {/* Flesh / Meat Face tilted upwards gazing at the Angel */}
      <path
        d="M 40 28 Q 50 18 60 28 Q 64 42 50 44 Q 36 42 40 28 Z"
        fill="url(#buzzFaceGrad)"
        stroke="#141414"
        strokeWidth="1.0"
      />

      {/* Wide Open Staring Eyes (Gazing up in awe) */}
      <ellipse cx="44" cy="26" rx="4.5" ry="5.5" fill="#0f172a" stroke="#141414" strokeWidth="0.8" />
      <circle cx="44" cy="24" r="1.5" fill="#ffffff" />
      <circle cx="46" cy="27" r="0.8" fill="#ffffff" />

      <ellipse cx="56" cy="26" rx="4.5" ry="5.5" fill="#0f172a" stroke="#141414" strokeWidth="0.8" />
      <circle cx="56" cy="24" r="1.5" fill="#ffffff" />
      <circle cx="58" cy="27" r="0.8" fill="#ffffff" />

      {/* Open Mouth with teeth smiling in ecstasy / awe */}
      <path d="M 45 34 Q 50 32 55 34 Q 56 39 50 40 Q 44 39 45 34 Z" fill="#141414" />
      {/* Teeth */}
      <path d="M 46 34 L 46 36 M 48 34 L 48 36 M 50 33 L 50 36 M 52 34 L 52 36 M 54 34 L 54 36" stroke="#ffffff" strokeWidth="0.8" />

      {/* Chin swirl */}
      <path d="M 50 40 Q 52 42 50 43" fill="none" stroke="#db2777" strokeWidth="0.8" />

      {/* Helmet Reflection Highlight */}
      <path d="M 33 22 Q 42 14 55 14" fill="none" stroke="#ffffff" strokeWidth="2.0" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
};

export const OphanimEyeWheelSVG: React.FC<{
  size?: number;
  rotation?: number;
  className?: string;
}> = ({ size = 50, rotation = 0, className = '' }) => {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`select-none ${className}`}
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.7))',
      }}
    >
      {/* Outer Golden Ring */}
      <circle cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
      <circle cx="40" cy="40" r="34" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="3 3" />
      
      {/* Inner Interlocking Ring */}
      <ellipse cx="40" cy="40" rx="34" ry="18" fill="none" stroke="#d97706" strokeWidth="2.5" transform="rotate(45 40 40)" />
      
      {/* Multiple All-Seeing Eyes along the perimeter */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
        const rad = (angle * Math.PI) / 180;
        const ex = 40 + Math.cos(rad) * 34;
        const ey = 40 + Math.sin(rad) * 34;
        return (
          <g key={`ophanim-eye-${idx}`} transform={`rotate(${angle} ${ex} ${ey})`}>
            <ellipse cx={ex} cy={ey} rx="5" ry="3" fill="#ffffff" stroke="#1e293b" strokeWidth="0.8" />
            <circle cx={ex} cy={ey} r="2" fill="#d97706" />
            <circle cx={ex} cy={ey} r="1.2" fill="#0f172a" />
            <circle cx={ex + 0.5} cy={ey - 0.5} r="0.5" fill="#ffffff" />
          </g>
        );
      })}

      {/* Central Flame / Divine Core */}
      <circle cx="40" cy="40" r="10" fill="#fef08a" opacity="0.9" />
      <circle cx="40" cy="40" r="6" fill="#f59e0b" />
      <circle cx="40" cy="40" r="3" fill="#ffffff" />
    </svg>
  );
};
