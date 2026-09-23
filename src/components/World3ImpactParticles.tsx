import React from 'react';
import { motion } from 'motion/react';

interface World3ImpactParticlesProps {
  type: 'rock' | 'coin';
  x: number;
  y: number;
  impactKey: number;
  characterType?: 'classic' | 'gumball_darwin';
}

// Pre-configured deterministic trajectories for rock debris & sparks
const ROCK_DEBRIS = [
  { id: 1, dx: -48, dy: -42, rot: -180, scale: 1.2, color: '#ef4444', shape: 'chunk', size: 6, dur: 0.55, delay: 0 },
  { id: 2, dx: -38, dy: -68, rot: -90, scale: 1.0, color: '#f59e0b', shape: 'star', size: 7, dur: 0.6, delay: 0.02 },
  { id: 3, dx: -26, dy: -85, rot: -45, scale: 1.4, color: '#fbbf24', shape: 'circle', size: 5, dur: 0.65, delay: 0.01 },
  { id: 4, dx: -15, dy: -96, rot: 30, scale: 1.1, color: '#ffffff', shape: 'spark', size: 4, dur: 0.5, delay: 0 },
  { id: 5, dx: -4, dy: -105, rot: 15, scale: 1.5, color: '#ef4444', shape: 'star', size: 8, dur: 0.7, delay: 0.03 },
  { id: 6, dx: 10, dy: -98, rot: 60, scale: 1.2, color: '#fbbf24', shape: 'circle', size: 6, dur: 0.62, delay: 0.01 },
  { id: 7, dx: 22, dy: -88, rot: 120, scale: 1.3, color: '#f97316', shape: 'chunk', size: 7, dur: 0.68, delay: 0.02 },
  { id: 8, dx: 36, dy: -70, rot: 160, scale: 1.0, color: '#38bdf8', shape: 'star', size: 6, dur: 0.58, delay: 0.04 },
  { id: 9, dx: 48, dy: -46, rot: 210, scale: 1.2, color: '#78350f', shape: 'chunk', size: 6, dur: 0.52, delay: 0.01 },
  { id: 10, dx: -55, dy: -24, rot: -120, scale: 0.9, color: '#d97706', shape: 'circle', size: 5, dur: 0.48, delay: 0.03 },
  { id: 11, dx: 56, dy: -26, rot: 140, scale: 0.9, color: '#ef4444', shape: 'spark', size: 5, dur: 0.5, delay: 0.02 },
  { id: 12, dx: 0, dy: -75, rot: 0, scale: 1.6, color: '#fbbf24', shape: 'star', size: 9, dur: 0.75, delay: 0 },
];

// Pre-configured deterministic trajectories for coin golden glints & sparkles
const COIN_DEBRIS = [
  { id: 1, dx: -34, dy: -36, rot: -140, scale: 1.1, color: '#facc15', shape: 'star', size: 6, dur: 0.48, delay: 0 },
  { id: 2, dx: -22, dy: -58, rot: -70, scale: 1.3, color: '#fef08a', shape: 'circle', size: 5, dur: 0.52, delay: 0.02 },
  { id: 3, dx: -10, dy: -74, rot: -20, scale: 1.0, color: '#ffffff', shape: 'spark', size: 4, dur: 0.55, delay: 0.01 },
  { id: 4, dx: 0, dy: -82, rot: 0, scale: 1.4, color: '#facc15', shape: 'star', size: 8, dur: 0.6, delay: 0 },
  { id: 5, dx: 12, dy: -72, rot: 45, scale: 1.1, color: '#38bdf8', shape: 'spark', size: 4, dur: 0.54, delay: 0.02 },
  { id: 6, dx: 24, dy: -54, rot: 90, scale: 1.2, color: '#fb923c', shape: 'circle', size: 5, dur: 0.5, delay: 0.01 },
  { id: 7, dx: 35, dy: -32, rot: 135, scale: 1.0, color: '#facc15', shape: 'star', size: 6, dur: 0.46, delay: 0.03 },
  { id: 8, dx: -38, dy: -18, rot: -90, scale: 0.8, color: '#fef08a', shape: 'spark', size: 3, dur: 0.42, delay: 0.02 },
  { id: 9, dx: 38, dy: -18, rot: 90, scale: 0.8, color: '#ffffff', shape: 'spark', size: 3, dur: 0.42, delay: 0.02 },
];

export const World3ImpactParticles: React.FC<World3ImpactParticlesProps> = ({
  type,
  x,
  y,
  impactKey,
  characterType = 'gumball_darwin',
}) => {
  if (!impactKey) return null;

  const isRock = type === 'rock';
  const debrisList = isRock ? ROCK_DEBRIS : COIN_DEBRIS;

  return (
    <g
      key={`impact-group-${type}-${impactKey}`}
      transform={`translate(${x}, ${y})`}
      className="pointer-events-none select-none"
    >
      {/* 1. PRIMARY EXPANDING SHOCKWAVE RING */}
      <motion.ellipse
        cx="0"
        cy="0"
        rx="6"
        ry="2"
        fill="none"
        stroke={isRock ? '#ef4444' : '#facc15'}
        strokeWidth={isRock ? 5 : 3.5}
        initial={{ rx: 6, ry: 2, opacity: 1 }}
        animate={{
          rx: isRock ? 75 : 45,
          ry: isRock ? 20 : 12,
          opacity: 0,
        }}
        transition={{ duration: isRock ? 0.65 : 0.48, ease: 'easeOut' }}
      />

      {/* 2. SECONDARY DELAYED SHOCKWAVE RING */}
      <motion.ellipse
        cx="0"
        cy="0"
        rx="4"
        ry="1.5"
        fill="none"
        stroke={isRock ? '#fbbf24' : '#38bdf8'}
        strokeWidth={isRock ? 3.5 : 2}
        initial={{ rx: 4, ry: 1.5, opacity: 0.9 }}
        animate={{
          rx: isRock ? 50 : 30,
          ry: isRock ? 14 : 8,
          opacity: 0,
        }}
        transition={{ duration: isRock ? 0.55 : 0.4, delay: 0.08, ease: 'easeOut' }}
      />

      {/* 3. GROUND DUST CLOUDS EXPANDING LEFT & RIGHT */}
      {isRock && (
        <>
          {/* Left dust cloud */}
          <motion.circle
            cx="0"
            cy="-4"
            r="6"
            fill="#d97706"
            opacity="0.8"
            initial={{ cx: 0, cy: -4, r: 6, opacity: 0.85 }}
            animate={{ cx: -42, cy: -10, r: 24, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          {/* Right dust cloud */}
          <motion.circle
            cx="0"
            cy="-4"
            r="6"
            fill="#d97706"
            opacity="0.8"
            initial={{ cx: 0, cy: -4, r: 6, opacity: 0.85 }}
            animate={{ cx: 42, cy: -10, r: 24, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          {/* Central dust puff upwards */}
          <motion.circle
            cx="0"
            cy="-2"
            r="8"
            fill="#b45309"
            opacity="0.75"
            initial={{ cx: 0, cy: -2, r: 8, opacity: 0.75 }}
            animate={{ cx: 0, cy: -26, r: 28, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        </>
      )}

      {/* 4. FLYING DEBRIS, CARTOON SPARKS & STARS */}
      {debrisList.map((p) => {
        return (
          <motion.g
            key={`p-${p.id}-${impactKey}`}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
            animate={{
              x: p.dx,
              y: p.dy,
              scale: [0.2, p.scale, 0],
              opacity: [1, 1, 0],
              rotate: p.rot,
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              ease: [0.18, 0.89, 0.32, 1.25], // cartoon pop-out bounce
            }}
          >
            {p.shape === 'star' ? (
              <polygon
                points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8"
                fill={p.color}
                stroke="#141414"
                strokeWidth="1"
              />
            ) : p.shape === 'chunk' ? (
              <rect
                x={-p.size / 2}
                y={-p.size / 2}
                width={p.size}
                height={p.size}
                rx="1"
                fill={p.color}
                stroke="#141414"
                strokeWidth="1"
              />
            ) : p.shape === 'spark' ? (
              <line
                x1={-p.size}
                y1={0}
                x2={p.size}
                y2={0}
                stroke={p.color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              <circle
                cx="0"
                cy="0"
                r={p.size / 2}
                fill={p.color}
                stroke="#141414"
                strokeWidth="1"
              />
            )}
          </motion.g>
        );
      })}

      {/* 5. CARTOON EXPLOSION IMPACT STARBURST BADGE */}
      <motion.g
        initial={{ scale: 0, opacity: 0, rotate: -25 }}
        animate={{
          scale: [0, isRock ? 1.6 : 1.2, isRock ? 1.3 : 1.0, 0],
          opacity: [0, 1, 1, 0],
          rotate: [ -25, 5, 0, 15 ],
        }}
        transition={{
          duration: isRock ? 0.65 : 0.48,
          times: [0, 0.25, 0.7, 1],
          ease: 'easeOut',
        }}
      >
        <polygon
          points="0,-22 6,-8 22,-8 10,4 15,20 0,11 -15,20 -10,4 -22,-8 -6,-8"
          fill={isRock ? '#fbbf24' : '#fef08a'}
          stroke="#141414"
          strokeWidth="2.5"
          filter="url(#neonGlowW3)"
        />
        <circle cx="0" cy="4" r={isRock ? 7 : 5} fill={isRock ? '#ef4444' : '#facc15'} />
      </motion.g>

      {/* 6. POP-OUT COMIC SFX TEXT */}
      <motion.text
        x="0"
        y="-32"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="900"
        fontSize={isRock ? '13' : '11'}
        fill={isRock ? '#fef08a' : '#38bdf8'}
        stroke="#141414"
        strokeWidth="3.5"
        paintOrder="stroke"
        initial={{ scale: 0, y: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.4, 1.1, 0.8],
          y: isRock ? [-5, -34, -40, -48] : [-5, -28, -34, -40],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: isRock ? 0.7 : 0.55,
          times: [0, 0.3, 0.75, 1],
          ease: 'easeOut',
        }}
      >
        {isRock
          ? characterType === 'gumball_darwin'
            ? '¡¡BOOOOM SPLAT!! 💥'
            : '¡¡CRASH 5KG!! 💥'
          : characterType === 'gumball_darwin'
            ? '¡¡CLINK DARWIN!! ✨'
            : '¡¡PLINK 5G!! ✨'}
      </motion.text>
    </g>
  );
};
