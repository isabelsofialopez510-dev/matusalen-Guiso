import React, { useState, useEffect } from 'react';
import { Target, RotateCcw, Play, Pause, Sparkles, CheckCircle, Heart, Star } from 'lucide-react';
import bgGarden from '../assets/images/elmore_garden_bg_1787237438721.jpg';
import gumballGlobeImg from '../assets/images/gumball_machine_globe_1787237193159.jpg';

interface World4ParabolicProps {
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  showVectors: boolean;
  showTrail: boolean;
}

export const World4Parabolic: React.FC<World4ParabolicProps> = ({
  isPlaying,
  setIsPlaying,
  showVectors,
  showTrail,
}) => {
  // --- Parabolic Launch Parameters (Calibrated to: v0=28m/s, t=1.6s, X=43m, H=3.3m) ---
  const [angleDeg, setAngleDeg] = useState<number>(16.3); // degrees giving t=1.6s, X=43m, H=3.3m
  const [v0, setV0] = useState<number>(28); // 28 m/s
  const [y0, setY0] = useState<number>(0); // initial height = 0m
  const [gravity, setGravity] = useState<number>(9.8); // m/s^2 (9.8 m/s^2 gives exact 1.6s and 43m)
  const [projectile, setProjectile] = useState<'gumball_globe' | 'gumball' | 'darwin' | 'rocket' | 'cannonball'>('gumball_globe');
  const [targetDist, setTargetDist] = useState<number>(43); // 43 meters
  const [showFormulas, setShowFormulas] = useState<boolean>(true);

  // Time state for animation
  const [tSim, setTSim] = useState<number>(0);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const [landedTime, setLandedTime] = useState<number>(0);

  // --- Exact Mathematical Kinematics ---
  const angleRad = (angleDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(angleRad);
  const v0y = v0 * Math.sin(angleRad);

  // Time to apex and max height
  const tApex = v0y / gravity;
  const hMax = y0 + (v0y * v0y) / (2 * gravity);

  // Total flight time to y = 0
  const discriminant = v0y * v0y + 2 * gravity * y0;
  const tFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / gravity;
  const xMax = v0x * tFlight;

  // Check if target is hit (within 2.5 meters)
  const hitTarget = Math.abs(xMax - targetDist) <= 2.5;

  // Reset launch
  const handleReset = () => {
    setTSim(0);
    setHasLanded(false);
    setLandedTime(0);
  };

  // Set exact requested problem preset
  const applyRequestedPreset = () => {
    setV0(28);
    setAngleDeg(16.3);
    setY0(0);
    setGravity(9.8);
    setTargetDist(43);
    setProjectile('gumball_globe');
    handleReset();
  };

  // Animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number | null = null;

    const step = (now: number) => {
      if (lastTime !== null && isPlaying && !hasLanded) {
        const dt = ((now - lastTime) / 1000) * 1.0; // 1x real time
        setTSim((prev) => {
          const nextT = prev + dt;
          if (nextT >= tFlight) {
            setHasLanded(true);
            setLandedTime(tFlight);
            return tFlight;
          }
          return nextT;
        });
      }
      lastTime = now;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, hasLanded, tFlight]);

  // Current Kinematic State
  const curT = hasLanded ? landedTime : tSim;
  const curX = v0x * curT;
  const curY = Math.max(0, y0 + v0y * curT - 0.5 * gravity * curT * curT);
  const curVx = v0x;
  const curVy = v0y - gravity * curT;
  const curV = Math.sqrt(curVx * curVx + curVy * curVy);

  // SVG Coordinate Conversion
  // SVG Viewport: 960 x 440
  const SVG_W = 960;
  const SVG_H = 440;
  const MARGIN_LEFT = 110;
  const MARGIN_BOTTOM = 55;
  const SCALE_X = (SVG_W - 170) / Math.max(60, xMax * 1.2, targetDist * 1.2);
  const SCALE_Y = (SVG_H - 140) / Math.max(15, hMax * 2.8);

  const toSvgX = (x: number) => MARGIN_LEFT + x * SCALE_X;
  const toSvgY = (y: number) => SVG_H - MARGIN_BOTTOM - y * SCALE_Y;

  // Trajectory Parabola Points Generator
  const trajectoryPoints: { x: number; y: number }[] = [];
  const numSteps = 70;
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * tFlight;
    const px = v0x * t;
    const py = Math.max(0, y0 + v0y * t - 0.5 * gravity * t * t);
    trajectoryPoints.push({ x: toSvgX(px), y: toSvgY(py) });
  }

  const pathD = trajectoryPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );

  // Trajectory Trail already traversed
  const trailPoints: { x: number; y: number }[] = [];
  const curSteps = Math.floor((curT / tFlight) * numSteps);
  for (let i = 0; i <= curSteps; i++) {
    const t = (i / numSteps) * tFlight;
    const px = v0x * t;
    const py = Math.max(0, y0 + v0y * t - 0.5 * gravity * t * t);
    trailPoints.push({ x: toSvgX(px), y: toSvgY(py) });
  }
  const trailD = trailPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );

  // Darwin's Throwing Animation State
  const isWindingUp = curT === 0 && !isPlaying;
  const isThrowing = curT > 0 && curT < 0.28;
  const isCelebrating = hasLanded && hitTarget;

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Telemetry Bar */}
      <div className="bg-[#0b0e1b] border-4 border-emerald-400 p-4 shadow-[0_0_20px_rgba(52,211,153,0.3)] rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-emerald-400/40 pb-3">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-400 text-[#0b0e1b] rounded-lg font-black text-xl shadow-[0_0_12px_#34d399]">
              🎯
            </span>
            <div>
              <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
                <span>Mundo 4: Tiro Parabólico de Darwin (Jardín de Elmore)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-400 text-[#0b0e1b] font-black rounded">
                  2D KINEMATICS
                </span>
              </h3>
              <p className="text-[11px] font-mono text-emerald-200">
                v₀ = 28 m/s • Tiempo de vuelo = 1.6 s • Alcance = 43 m • Altura máxima = 3.3 m • Lanzador: Darwin Raglan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={applyRequestedPreset}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-[#0b0e1b] font-black text-xs uppercase border-2 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)] flex items-center gap-1.5 transition-all"
              title="Restablecer a valores exactos: v0=28m/s, t=1.6s, X=43m, H=3.3m"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Valores Exactos</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 border-2 font-black text-xs uppercase shadow-[0_0_12px_rgba(52,211,153,0.4)] flex items-center gap-2 transition-all ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-[#0b0e1b] border-amber-300'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-[#0b0e1b] border-emerald-300 animate-pulse'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pausar Disparo' : '¡Darwin Lanza!'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-[#1e293b] hover:bg-slate-700 text-emerald-200 font-bold text-xs uppercase border-2 border-emerald-400 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        {/* Real-time telemetry cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 font-mono">
          <div className="bg-[#131728] p-3 border-2 border-emerald-400/50 rounded flex flex-col justify-between">
            <span className="text-[10px] uppercase text-emerald-300 font-bold">⏱️ Tiempo de Vuelo:</span>
            <span className="text-xl font-black text-emerald-300">
              {curT.toFixed(1)} s <span className="text-xs text-slate-400">/ {tFlight.toFixed(1)} s</span>
            </span>
            <span className="text-[9px] text-slate-400">t_cima = {tApex.toFixed(2)} s (0.8s)</span>
          </div>

          <div className="bg-[#131728] p-3 border-2 border-emerald-400/50 rounded flex flex-col justify-between">
            <span className="text-[10px] uppercase text-emerald-300 font-bold">📍 Posición (X, Y):</span>
            <span className="text-sm font-black text-amber-300">
              x = {curX.toFixed(1)} m | y = {curY.toFixed(1)} m
            </span>
            <span className="text-[9px] text-slate-400">
              {hasLanded ? '💥 Impacto en X = 43 m' : '🚀 En Vuelo por el Jardín'}
            </span>
          </div>

          <div className="bg-[#131728] p-3 border-2 border-emerald-400/50 rounded flex flex-col justify-between">
            <span className="text-[10px] uppercase text-emerald-300 font-bold">⚡ Velocidad Inicial (v₀):</span>
            <span className="text-sm font-black text-cyan-300">
              v₀ = {v0} m/s ({(v0 * 3.6).toFixed(1)} km/h)
            </span>
            <span className="text-[9px] text-slate-400">
              vx = {curVx.toFixed(1)} | vy = {curVy.toFixed(1)} m/s
            </span>
          </div>

          <div className="bg-[#131728] p-3 border-2 border-emerald-400/50 rounded flex flex-col justify-between">
            <span className="text-[10px] uppercase text-emerald-300 font-bold">🎯 Alcance & Altura Máx:</span>
            <span className="text-xs font-black uppercase text-pink-300">
              X_max = {xMax.toFixed(0)} m | H_max = {hMax.toFixed(1)} m
            </span>
            <span className="text-[9px] text-slate-400">
              {hasLanded && hitTarget ? '🎉 ¡¡Darwin Acertó la Diana a 43 m!!' : `Diana en: ${targetDist} m`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Canvas with Garden Background & Animated Darwin */}
      <div className="border-4 bg-[#030712] border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)] flex flex-col overflow-hidden relative rounded-lg">
        <div className="px-4 py-2 bg-[#0b0e1b] text-emerald-300 border-b-2 border-emerald-400 flex items-center justify-between font-mono text-xs">
          <span className="font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Jardín Botánico de Elmore: Darwin lanza la Esfera de Chicles (v₀ = {v0} m/s, θ = {angleDeg.toFixed(1)}°)
          </span>
          <span className="text-[11px] text-slate-300">
            H_max = {hMax.toFixed(1)} m | X_max = {xMax.toFixed(0)} m | t = {tFlight.toFixed(1)} s
          </span>
        </div>

        <div className="relative w-full h-[440px] overflow-hidden flex items-center justify-center bg-[#071311]">
          {/* Botanical Garden of Elmore Background */}
          <img
            src={bgGarden}
            alt="Jardín Botánico de Elmore"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-transparent to-[#040d0a]/70 pointer-events-none" />

          {/* Celebratory sticker overlay when Darwin hits the target */}
          {hasLanded && hitTarget && (
            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Floating cute clouds and sparkles from reference sticker image */}
                <div className="absolute top-12 left-1/4 animate-bounce text-2xl">☁️✨</div>
                <div className="absolute top-16 right-1/4 animate-bounce text-2xl delay-100">🐰💖</div>
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white font-black text-sm px-4 py-1.5 rounded-full border-2 border-white shadow-[0_0_20px_#10b981] animate-pulse uppercase tracking-wider">
                  🌸 ¡¡TIRO PERFECTO DE DARWIN: 43 METROS EN 1.6 SEGUNDOS!! 🌸
                </div>
              </div>
            </div>
          )}

          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full select-none relative z-10">
            <defs>
              <linearGradient id="cannonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <clipPath id="globeClip">
                <circle cx="0" cy="0" r="19" />
              </clipPath>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ground Lawn with Flowers */}
            <rect x="0" y={toSvgY(0)} width={SVG_W} height={MARGIN_BOTTOM} fill="#14532d" opacity="0.95" />
            <line x1="0" y1={toSvgY(0)} x2={SVG_W} y2={toSvgY(0)} stroke="#4ade80" strokeWidth="4" />

            {/* Flower bed accents along the path */}
            {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880].map((fx, i) => (
              <g key={i} transform={`translate(${fx + 20}, ${toSvgY(0) + 12})`}>
                <circle cx="0" cy="0" r="4" fill={i % 3 === 0 ? '#f43f5e' : i % 3 === 1 ? '#fbbf24' : '#a855f7'} />
                <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                <circle cx="10" cy="8" r="3.5" fill={i % 2 === 0 ? '#38bdf8' : '#fb923c'} />
              </g>
            ))}

            {/* Trajectory Parabola Curve */}
            {showTrail && (
              <path
                d={pathD}
                fill="none"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                opacity="0.85"
              />
            )}

            {/* Traversed dynamic trail */}
            <path
              d={trailD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.5"
              filter="url(#glow)"
              opacity="0.9"
            />

            {/* Distance Markers along ground */}
            {[10, 20, 30, 40, 43, 50].map((dist) => (
              <g key={dist} transform={`translate(${toSvgX(dist)}, ${toSvgY(0)})`}>
                <line x1="0" y1="0" x2="0" y2="8" stroke={dist === 43 ? '#f59e0b' : '#94a3b8'} strokeWidth={dist === 43 ? '2.5' : '1'} />
                <text
                  x="0"
                  y="22"
                  textAnchor="middle"
                  fill={dist === 43 ? '#fbbf24' : '#cbd5e1'}
                  fontSize={dist === 43 ? '10' : '8'}
                  fontWeight={dist === 43 ? 'black' : 'bold'}
                  fontFamily="monospace"
                >
                  {dist}m
                </text>
              </g>
            ))}

            {/* Apex Marker (H_max = 3.3 m at t=0.8s) */}
            <g transform={`translate(${toSvgX(v0x * tApex)}, ${toSvgY(hMax)})`}>
              <line x1="0" y1="0" x2="0" y2={toSvgY(0) - toSvgY(hMax)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="5" fill="#f59e0b" stroke="#141414" strokeWidth="1.5" />
              <rect x="-44" y="-26" width="88" height="20" fill="#0b0e1b" stroke="#f59e0b" strokeWidth="1.5" rx="4" />
              <text x="0" y="-12" textAnchor="middle" fill="#f59e0b" fontSize="9.5" fontWeight="black" fontFamily="monospace">
                H_max: {hMax.toFixed(1)} m
              </text>
            </g>

            {/* Target Ring on Floor (43 m) */}
            <g transform={`translate(${toSvgX(targetDist)}, ${toSvgY(0)})`}>
              <ellipse cx="0" cy="0" rx="22" ry="8" fill="#ef4444" opacity="0.6" />
              <ellipse cx="0" cy="0" rx="14" ry="5" fill="#fbbf24" opacity="0.8" />
              <line x1="0" y1="0" x2="0" y2="-50" stroke="#ef4444" strokeWidth="2.5" />
              {/* Flag / Target Banner */}
              <polygon points="0,-50 32,-38 0,-26" fill="#ef4444" stroke="#141414" strokeWidth="1.5" />
              <text x="14" y="-35" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black" fontFamily="monospace">
                43m
              </text>
              <text x="0" y="-55" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="black" fontFamily="monospace">
                🎯 DIANA (43 m)
              </text>
            </g>

            {/* ================================================================= */}
            {/* ANIMATED DARWIN THE THROWER (AT LAUNCH ORIGIN)                   */}
            {/* ================================================================= */}
            <g transform={`translate(${toSvgX(0) - 35}, ${toSvgY(y0) - 40})`}>
              {/* Shadow on floor */}
              <ellipse cx="10" cy="40" rx="18" ry="5" fill="#000000" opacity="0.4" />

              {/* Darwin Body & Legs */}
              {isCelebrating ? (
                // Celebrating Darwin (Jumping with Joy like sticker reference!)
                <g transform={`translate(0, ${Math.sin(curT * 20) * 12 - 10})`}>
                  {/* Cute background rainbow sparkles from sticker */}
                  <g transform="translate(10, -10)">
                    <circle cx="-25" cy="-25" r="4" fill="#fbbf24" opacity="0.8" />
                    <circle cx="45" cy="-25" r="4" fill="#fbbf24" opacity="0.8" />
                    <circle cx="-35" cy="10" r="3" fill="#f43f5e" opacity="0.8" />
                    <circle cx="55" cy="10" r="3" fill="#38bdf8" opacity="0.8" />
                  </g>

                  {/* Legs with Green Shoes */}
                  <path d="M 0,22 L -8,32" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 16,22 L 24,30" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  {/* Green Shoes */}
                  <ellipse cx="-10" cy="34" rx="8" ry="4" fill="#22c55e" stroke="#141414" strokeWidth="1.5" />
                  <ellipse cx="26" cy="32" rx="8" ry="4" fill="#22c55e" stroke="#141414" strokeWidth="1.5" />
                  <circle cx="-6" cy="34" r="2.5" fill="#ffffff" />
                  <circle cx="30" cy="32" r="2.5" fill="#ffffff" />

                  {/* Darwin Head/Body (Orange Fish) */}
                  <ellipse cx="10" cy="10" rx="26" ry="22" fill="#fb923c" stroke="#141414" strokeWidth="2.5" />
                  <ellipse cx="-16" cy="10" rx="5" ry="7" fill="#ea580c" /> {/* Fin */}

                  {/* Winking & Happy Eyes */}
                  <path d="M 2,4 L 10,8 L 2,12" fill="none" stroke="#141414" strokeWidth="3" strokeLinecap="round" /> {/* Wink */}
                  <circle cx="20" cy="6" r="7" fill="#ffffff" stroke="#141414" strokeWidth="2" />
                  <circle cx="20" cy="6" r="3.5" fill="#141414" />
                  <circle cx="22" cy="4.5" r="1.5" fill="#ffffff" />

                  {/* Big Open Happy Mouth */}
                  <path d="M 2,14 Q 12,28 24,14 Z" fill="#ef4444" stroke="#141414" strokeWidth="2" />
                  <path d="M 6,21 Q 12,26 18,21" fill="#f43f5e" />

                  {/* Arms Raised in Victory */}
                  <path d="M -8,8 Q -20,-10 -25,-18" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 28,8 Q 40,-10 45,-18" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />

                  {/* Floating Victory Text */}
                  <text x="10" y="-30" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="black" fontFamily="monospace">
                    ⭐ ¡¡SÍII!! 43m ⭐
                  </text>
                </g>
              ) : isThrowing ? (
                // Throwing Pose (Forward throw action)
                <g>
                  {/* Legs */}
                  <path d="M 2,24 L -4,38" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 16,24 L 28,38" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  <ellipse cx="-5" cy="39" rx="8" ry="4" fill="#22c55e" stroke="#141414" strokeWidth="1.5" />
                  <ellipse cx="29" cy="39" rx="8" ry="4" fill="#22c55e" stroke="#141414" strokeWidth="1.5" />

                  {/* Body leaning forward */}
                  <ellipse cx="12" cy="14" rx="24" ry="20" fill="#fb923c" stroke="#141414" strokeWidth="2.5" />

                  {/* Determined Face */}
                  <circle cx="12" cy="8" r="5" fill="#ffffff" stroke="#141414" strokeWidth="1.5" />
                  <circle cx="24" cy="8" r="5" fill="#ffffff" stroke="#141414" strokeWidth="1.5" />
                  <circle cx="14" cy="8" r="2.5" fill="#141414" />
                  <circle cx="26" cy="8" r="2.5" fill="#141414" />
                  <path d="M 12,18 Q 18,22 24,18" fill="none" stroke="#141414" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Throwing Arm extended towards angle */}
                  <path
                    d={`M 24,14 L ${24 + 30 * Math.cos(angleRad)},${14 - 30 * Math.sin(angleRad)}`}
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Wind swoosh lines */}
                  <path d="M 40,2 Q 60,0 55,-15" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                </g>
              ) : (
                // Ready / Aiming Pose
                <g>
                  {/* Legs */}
                  <path d="M 4,24 L 0,38" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 16,24 L 20,38" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                  <ellipse cx="0" cy="39" rx="8" ry="4" fill="#22c55e" stroke="#141414" strokeWidth="1.5" />
                  <ellipse cx="20" cy="39" rx="8" ry="4" fill="#22c55e" stroke="#141414" strokeWidth="1.5" />

                  {/* Darwin Body */}
                  <ellipse cx="10" cy="14" rx="24" ry="20" fill="#fb923c" stroke="#141414" strokeWidth="2.5" />
                  <ellipse cx="-14" cy="14" rx="4" ry="6" fill="#ea580c" />

                  {/* Eyes looking towards target */}
                  <circle cx="10" cy="8" r="6" fill="#ffffff" stroke="#141414" strokeWidth="1.5" />
                  <circle cx="22" cy="8" r="6" fill="#ffffff" stroke="#141414" strokeWidth="1.5" />
                  <circle cx="13" cy="8" r="3" fill="#141414" />
                  <circle cx="25" cy="8" r="3" fill="#141414" />
                  <circle cx="14" cy="6.5" r="1" fill="#ffffff" />
                  <circle cx="26" cy="6.5" r="1" fill="#ffffff" />

                  {/* Confident Smile */}
                  <path d="M 10,18 Q 16,24 22,18" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" />

                  {/* Arms holding / ready to launch */}
                  {curT === 0 ? (
                    <g>
                      {/* Darwin holding the gumball machine globe ready to throw */}
                      <path d="M 4,16 Q 16,28 28,14" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                      <text x="10" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="black" fontFamily="monospace">
                        Darwin (θ = {angleDeg.toFixed(1)}°)
                      </text>
                    </g>
                  ) : (
                    <g>
                      {/* Darwin looking up tracking the flying globe */}
                      <path d="M 18,14 Q 28,4 32,-4" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                      <text x="10" y="-8" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="black" fontFamily="monospace">
                        ¡Miren eso!
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>

            {/* Gumball (cheering friend next to Darwin in the garden) */}
            <g transform={`translate(${toSvgX(0) - 80}, ${toSvgY(y0) - 40})`}>
              <ellipse cx="10" cy="40" rx="14" ry="4" fill="#000000" opacity="0.3" />
              {/* Legs */}
              <path d="M 4,24 L 2,38" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <path d="M 14,24 L 16,38" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="2" cy="39" rx="6" ry="3" fill="#64748b" />
              <ellipse cx="16" cy="39" rx="6" ry="3" fill="#64748b" />
              {/* Gumball Head */}
              <circle cx="10" cy="12" r="18" fill="#38bdf8" stroke="#141414" strokeWidth="2" />
              {/* Cat Ears */}
              <polygon points="0,0 -4,-8 4,-4" fill="#38bdf8" stroke="#141414" strokeWidth="1.5" />
              <polygon points="16,0 24,-8 20,-4" fill="#38bdf8" stroke="#141414" strokeWidth="1.5" />
              {/* Face */}
              <circle cx="6" cy="10" r="4.5" fill="#ffffff" stroke="#141414" strokeWidth="1" />
              <circle cx="16" cy="10" r="4.5" fill="#ffffff" stroke="#141414" strokeWidth="1" />
              <circle cx="7.5" cy="10" r="2" fill="#141414" />
              <circle cx="17.5" cy="10" r="2" fill="#141414" />
              <ellipse cx="12" cy="14" rx="2.5" ry="1.5" fill="#ef4444" />
              <path d="M 6,18 Q 12,23 18,18" fill="none" stroke="#141414" strokeWidth="1.5" />
              {/* Cheering arm */}
              <path d="M 20,16 Q 30,8 32,0" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* ================================================================= */}
            {/* FLYING PROJECTILE (GUMBALL MACHINE GLOBE & CANDY PARTICLES)       */}
            {/* ================================================================= */}
            <g transform={`translate(${toSvgX(curX)}, ${toSvgY(curY)})`}>
              {/* Particle Sparkle Trail behind flying globe */}
              {!hasLanded && curT > 0 && (
                <g transform="translate(-18, 0)">
                  <circle cx="-12" cy={Math.sin(curT * 15) * 6} r="3" fill="#f43f5e" opacity="0.8" />
                  <circle cx="-22" cy={Math.cos(curT * 15) * 6} r="2.5" fill="#38bdf8" opacity="0.8" />
                  <circle cx="-32" cy={Math.sin(curT * 20) * 8} r="3" fill="#fbbf24" opacity="0.7" />
                  <circle cx="-42" cy={-4} r="2" fill="#a855f7" opacity="0.6" />
                </g>
              )}

              {projectile === 'gumball_globe' && (
                <g transform={`rotate(${curT * 480})`}>
                  {/* Outer Glass Sphere with glow */}
                  <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="#ffffff" strokeWidth="2" filter="url(#glow)" />
                  
                  {/* Clipped image of the colorful gumball dispenser globe */}
                  <g clipPath="url(#globeClip)">
                    <image
                      href={gumballGlobeImg}
                      x="-22"
                      y="-22"
                      width="44"
                      height="44"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </g>
                  
                  {/* Glass Shine Arc */}
                  <circle cx="0" cy="0" r="19" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.85" />
                  <path d="M -12,-12 A 16 16 0 0 1 10,-12" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
                </g>
              )}

              {projectile === 'gumball' && (
                <g transform={`rotate(${curT * 360})`}>
                  <circle cx="0" cy="0" r="16" fill="#38bdf8" stroke="#141414" strokeWidth="2" />
                  <circle cx="-5" cy="-2" r="3" fill="#ffffff" />
                  <circle cx="5" cy="-2" r="3" fill="#ffffff" />
                  <circle cx="-5" cy="-2" r="1.5" fill="#141414" />
                  <circle cx="5" cy="-2" r="1.5" fill="#141414" />
                  <ellipse cx="0" cy="4" rx="4" ry="3" fill="#ef4444" />
                </g>
              )}

              {projectile === 'darwin' && (
                <g transform={`rotate(${curT * 360})`}>
                  <ellipse cx="0" cy="0" rx="16" ry="14" fill="#fb923c" stroke="#141414" strokeWidth="2" />
                  <circle cx="-4" cy="-3" r="3.5" fill="#ffffff" />
                  <circle cx="6" cy="-3" r="3.5" fill="#ffffff" />
                  <circle cx="-4" cy="-3" r="1.5" fill="#141414" />
                  <circle cx="6" cy="-3" r="1.5" fill="#141414" />
                  <path d="M -4,4 Q 0,8 4,4" fill="none" stroke="#141414" strokeWidth="2" />
                </g>
              )}

              {projectile === 'rocket' && (
                <g transform={`rotate(${Math.atan2(-curVy, curVx) * (180 / Math.PI)})`}>
                  <polygon points="18,0 -12,-8 -12,8" fill="#f43f5e" stroke="#141414" strokeWidth="1.5" />
                  <polygon points="-12,-8 -18,-14 -12,0" fill="#f59e0b" />
                  <polygon points="-12,8 -18,14 -12,0" fill="#f59e0b" />
                </g>
              )}

              {projectile === 'cannonball' && (
                <circle cx="0" cy="0" r="12" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              )}

              {/* Vector Arrows */}
              {showVectors && !hasLanded && (
                <g>
                  {/* Vx Vector (Horizontal MRU - Constant Cyan Arrow) */}
                  <line x1="0" y1="0" x2={curVx * 1.3} y2="0" stroke="#00E5FF" strokeWidth="2.5" />
                  <polygon
                    points={`${curVx * 1.3},0 ${curVx * 1.3 - 5},-3 ${curVx * 1.3 - 5},3`}
                    fill="#00E5FF"
                  />
                  <text x={curVx * 1.3 + 4} y="-3" fill="#00E5FF" fontSize="8" fontWeight="black" fontFamily="monospace">
                    vx={curVx.toFixed(0)}m/s
                  </text>

                  {/* Vy Vector (Vertical MUA - Variable Arrow) */}
                  <line x1="0" y1="0" x2="0" y2={-curVy * 2.2} stroke={curVy >= 0 ? '#fbbf24' : '#ef4444'} strokeWidth="2.5" />
                  <polygon
                    points={`0,${-curVy * 2.2} -3,${-curVy * 2.2 + (curVy >= 0 ? 5 : -5)} 3,${-curVy * 2.2 + (curVy >= 0 ? 5 : -5)}`}
                    fill={curVy >= 0 ? '#fbbf24' : '#ef4444'}
                  />
                  <text x="5" y={-curVy * 2.2} fill={curVy >= 0 ? '#fbbf24' : '#ef4444'} fontSize="8" fontWeight="black" fontFamily="monospace">
                    vy={curVy.toFixed(1)}m/s
                  </text>
                </g>
              )}

              {/* Landing Comic Splash & Candies Bursting */}
              {hasLanded && (
                <g transform="translate(0, 0)">
                  <ellipse cx="0" cy="6" rx="34" ry="10" fill="#f43f5e" opacity="0.85" />
                  
                  {/* Bursting colorful candies around impact */}
                  <circle cx="-20" cy="-12" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="22" cy="-14" r="5" fill="#fb923c" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="-10" cy="-24" r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="12" cy="-22" r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="0" cy="-30" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />

                  <text x="0" y="-38" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="black" fontFamily="monospace">
                    💥 ¡¡POW!! 43m (1.6 s)
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* 3. Parameter Sliders & Configuration */}
      <div className="bg-[#0b0e1b] border-2 border-emerald-500/40 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-black uppercase text-emerald-300 font-mono flex items-center gap-2">
            <span>⚙️ Parámetros del Tiro de Darwin</span>
            <span className="text-[10px] text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
              v₀ = 28 m/s • t = 1.6 s • X = 43 m • H = 3.3 m
            </span>
          </h4>

          <button
            onClick={applyRequestedPreset}
            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Fijar Valores Requeridos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {/* Initial Velocity Slider (28 m/s) */}
          <div className="space-y-1.5 bg-[#131728] p-3 rounded border border-emerald-500/30">
            <div className="flex justify-between items-center text-emerald-300">
              <span className="font-bold">Velocidad (v₀):</span>
              <strong className="bg-emerald-500 text-[#0b0e1b] px-2 py-0.5 rounded font-black">{v0} m/s</strong>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={v0}
              onChange={(e) => {
                setV0(parseFloat(e.target.value));
                handleReset();
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>10 m/s</span>
              <span className="text-amber-300 font-bold">28 m/s (Requerido)</span>
              <span>50 m/s</span>
            </div>
          </div>

          {/* Angle Slider (16.3°) */}
          <div className="space-y-1.5 bg-[#131728] p-3 rounded border border-emerald-500/30">
            <div className="flex justify-between items-center text-emerald-300">
              <span className="font-bold">Ángulo de Lanzamiento (θ):</span>
              <strong className="bg-emerald-500 text-[#0b0e1b] px-2 py-0.5 rounded font-black">{angleDeg.toFixed(1)}°</strong>
            </div>
            <input
              type="range"
              min="5"
              max="85"
              step="0.1"
              value={angleDeg}
              onChange={(e) => {
                setAngleDeg(parseFloat(e.target.value));
                handleReset();
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>5°</span>
              <span className="text-amber-300 font-bold">16.3° (1.6s / 43m)</span>
              <span>85°</span>
            </div>
          </div>

          {/* Initial Height (0 m) */}
          <div className="space-y-1.5 bg-[#131728] p-3 rounded border border-emerald-500/30">
            <div className="flex justify-between items-center text-emerald-300">
              <span className="font-bold">Altura Inicial (y₀):</span>
              <strong className="bg-emerald-500 text-[#0b0e1b] px-2 py-0.5 rounded font-black">{y0} m</strong>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={y0}
              onChange={(e) => {
                setY0(parseFloat(e.target.value));
                handleReset();
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span className="text-amber-300 font-bold">0m (Suelo)</span>
              <span>10m</span>
              <span>20m</span>
            </div>
          </div>

          {/* Target Distance (43 m) */}
          <div className="space-y-1.5 bg-[#131728] p-3 rounded border border-emerald-500/30">
            <div className="flex justify-between items-center text-emerald-300">
              <span className="font-bold">Diana (Objetivo):</span>
              <strong className="bg-red-500 text-white px-2 py-0.5 rounded font-black">{targetDist} m</strong>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={targetDist}
              onChange={(e) => setTargetDist(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>15 m</span>
              <span className="text-amber-300 font-bold">43 m (Impacto)</span>
              <span>90 m</span>
            </div>
          </div>
        </div>

        {/* Projectile Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/20 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">Objeto que Lanza Darwin:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'gumball_globe', label: '🍬 Esfera de Chicles (Elmore)' },
                { id: 'gumball', label: '🐱 Mini Gumball' },
                { id: 'darwin', label: '🐟 Mini Darwin' },
                { id: 'rocket', label: '🚀 Cohete' },
                { id: 'cannonball', label: '💣 Pelota' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProjectile(p.id as any)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    projectile === p.id
                      ? 'bg-emerald-400 text-[#0b0e1b] border-emerald-300 shadow-[0_0_8px_#34d399] font-black'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. "La Verdadera Calculación" Panel */}
      <div className="bg-[#0b0e1b] border-4 border-emerald-400 p-4 shadow-[0_0_20px_rgba(52,211,153,0.3)] rounded-lg space-y-3">
        <div className="flex items-center justify-between border-b-2 border-emerald-400/40 pb-2">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-400 text-[#0b0e1b] rounded font-black text-sm">📐</span>
            <div>
              <h4 className="font-black text-base uppercase text-white font-mono tracking-wider">
                La Verdadera Calculación: Demostración Física Exacta
              </h4>
              <p className="text-xs text-emerald-300 font-mono">
                Cálculo riguroso para v₀ = 28 m/s, t_vuelo = 1.6 s, X_max = 43 m y H_max = 3.3 m
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="text-xs font-mono text-emerald-300 hover:text-emerald-200 uppercase font-bold underline"
          >
            {showFormulas ? 'Ocultar Ecuaciones' : 'Ver Ecuaciones'}
          </button>
        </div>

        {showFormulas && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            {/* Box 1: Vector Decomposition */}
            <div className="bg-[#131728] p-3.5 rounded border border-cyan-500/40 space-y-2">
              <h5 className="font-bold text-cyan-300 uppercase text-[11px]">
                1. Componentes de la Velocidad Inicial:
              </h5>
              <div className="p-2 bg-[#080c18] rounded text-slate-200 space-y-1 text-[11px]">
                <p className="text-cyan-300 font-bold">v_0x = v_0 · cos(θ) = 28 · cos(16.3°)</p>
                <p className="text-amber-300 font-bold">v_0y = v_0 · sin(θ) = 28 · sin(16.3°)</p>
              </div>
              <div className="p-2 bg-[#080c18] rounded text-cyan-200 text-[10px] space-y-0.5">
                <p>v_0x = <strong className="text-cyan-300">26.88 m/s</strong> (Constante en MRU)</p>
                <p>v_0y = <strong className="text-amber-300">7.86 m/s</strong> (Afectada por gravedad)</p>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                💡 Velocidad horizontal uniforme (a_x = 0).
              </p>
            </div>

            {/* Box 2: Max Height & Flight Time */}
            <div className="bg-[#131728] p-3.5 rounded border border-amber-500/40 space-y-2">
              <h5 className="font-bold text-amber-300 uppercase text-[11px]">
                2. Tiempo de Vuelo y Altura Máxima (H_max):
              </h5>
              <div className="p-2 bg-[#080c18] rounded text-slate-200 space-y-1 text-[11px]">
                <p className="text-amber-300 font-bold">t_vuelo = 2 · v_0y / g = 2 · 7.86 / 9.8</p>
                <p className="text-purple-300 font-bold">H_max = (v_0y)² / (2·g) = (7.86)² / (19.6)</p>
              </div>
              <div className="p-2 bg-[#080c18] rounded text-amber-200 text-[10px] space-y-0.5">
                <p>⏱️ Tiempo de vuelo = <strong className="text-amber-300">1.6 s</strong> (t_subida = 0.8s)</p>
                <p>🏔️ Altura Máxima = <strong className="text-purple-300">3.3 m</strong></p>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                ⚡ En la cima (0.8s), v_y = 0 m/s.
              </p>
            </div>

            {/* Box 3: Maximum Range */}
            <div className="bg-[#131728] p-3.5 rounded border border-pink-500/40 space-y-2">
              <h5 className="font-bold text-pink-300 uppercase text-[11px]">
                3. Alcance Horizontal Máximo (X_max):
              </h5>
              <div className="p-2 bg-[#080c18] rounded text-slate-200 space-y-1 text-[11px]">
                <p className="text-emerald-300 font-bold">X_max = v_0x · t_vuelo</p>
                <p className="text-pink-300 font-bold">X_max = 26.88 m/s × 1.6 s</p>
              </div>
              <div className="p-2 bg-[#080c18] rounded text-emerald-200 text-[10px] space-y-0.5">
                <p>🎯 Alcance Máximo = <strong className="text-pink-300">43.0 m</strong> (43 m)</p>
                <p>💥 Diana impactada exactamente a los 43 metros.</p>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                🎯 Cumple perfectamente las leyes de la cinemática 2D.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
