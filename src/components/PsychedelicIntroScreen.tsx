import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  GraduationCap,
  User,
  School,
  Zap,
} from 'lucide-react';
import pixelCoverArt from '../assets/images/psychedelic_pixel_cover_1787926979816.jpg';
import { sfx } from '../utils/audioEffects';

interface PsychedelicIntroScreenProps {
  onStartStory?: () => void;
  onOpenWorlds: () => void;
  onOpenSandbox?: () => void;
  onOpenWorldDirect?: (world: 'world1' | 'world2' | 'world3' | 'world4' | 'free') => void;
  onOpenProfile?: () => void;
  userProfile?: { name: string; age: string; grade: string } | null;
  isMuted: boolean;
  onToggleSound: () => void;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface LivingEye {
  xPct: number;
  yPct: number;
  radius: number;
  irisColor: string;
  pupilColor: string;
  glowColor: string;
  blinkTimer: number;
  blinkDuration: number;
  isBlinking: boolean;
}

export const PsychedelicIntroScreen: React.FC<PsychedelicIntroScreenProps> = ({
  onStartStory,
  onOpenWorlds,
  isMuted,
  onToggleSound,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [crtFlicker, setCrtFlicker] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; normX: number; normY: number }>({
    x: 0,
    y: 0,
    normX: 0.5,
    normY: 0.5,
  });
  const shockwavesRef = useRef<Shockwave[]>([]);

  const handleStart = () => {
    sfx.playLaser(1600);
    if (onStartStory) {
      onStartStory();
    } else {
      onOpenWorlds();
    }
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    sfx.playLaser(1500);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Fullscreen Detection
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Keyboard navigation for Enter / Space / F / M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartStory, onOpenWorlds, onToggleSound]);

  // Periodic subtle CRT flicker
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.65) {
        setCrtFlicker(true);
        setTimeout(() => setCrtFlicker(false), 90 + Math.random() * 100);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Track Pointer Position
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = {
      x,
      y,
      normX: Math.max(0, Math.min(1, x / (rect.width || 1))),
      normY: Math.max(0, Math.min(1, y / (rect.height || 1))),
    };
  };

  // Shockwave click effect
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colors = ['#facc15', '#ec4899', '#00f5ff', '#a855f7', '#ff5500'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    shockwavesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 180 + Math.random() * 90,
      color: chosenColor,
      alpha: 1.0,
    });

    sfx.playLaser(1700 + Math.random() * 300);
  };

  // -------------------------------------------------------------
  // ANIMATED PSYCHEDELIC CANVAS OVERLAY (EYES, PARTICLES, LASERS)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Living Reactive Mystical Eyes mapping to the background entity
    const livingEyes: LivingEye[] = [
      { xPct: 0.46, yPct: 0.61, radius: 24, irisColor: '#9333ea', pupilColor: '#000000', glowColor: '#e879f9', blinkTimer: 200, blinkDuration: 0, isBlinking: false },
      { xPct: 0.44, yPct: 0.42, radius: 14, irisColor: '#06b6d4', pupilColor: '#000000', glowColor: '#67e8f9', blinkTimer: 240, blinkDuration: 0, isBlinking: false },
      { xPct: 0.58, yPct: 0.43, radius: 14, irisColor: '#ec4899', pupilColor: '#000000', glowColor: '#f472b6', blinkTimer: 260, blinkDuration: 0, isBlinking: false },
      { xPct: 0.28, yPct: 0.40, radius: 9, irisColor: '#ef4444', pupilColor: '#000000', glowColor: '#f87171', blinkTimer: 180, blinkDuration: 0, isBlinking: false },
      { xPct: 0.33, yPct: 0.41, radius: 9, irisColor: '#f59e0b', pupilColor: '#000000', glowColor: '#fbbf24', blinkTimer: 290, blinkDuration: 0, isBlinking: false },
      { xPct: 0.79, yPct: 0.69, radius: 10, irisColor: '#3b82f6', pupilColor: '#000000', glowColor: '#60a5fa', blinkTimer: 220, blinkDuration: 0, isBlinking: false },
      { xPct: 0.80, yPct: 0.74, radius: 10, irisColor: '#06b6d4', pupilColor: '#000000', glowColor: '#22d3ee', blinkTimer: 310, blinkDuration: 0, isBlinking: false },
      { xPct: 0.19, yPct: 0.79, radius: 10, irisColor: '#dc2626', pupilColor: '#000000', glowColor: '#f87171', blinkTimer: 270, blinkDuration: 0, isBlinking: false },
      { xPct: 0.12, yPct: 0.85, radius: 10, irisColor: '#ea580c', pupilColor: '#000000', glowColor: '#fb923c', blinkTimer: 330, blinkDuration: 0, isBlinking: false },
    ];

    // Floating purple plasma embers & quantum sparks
    const sparks = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 1.5 - 0.3,
      size: Math.random() * 4 + 1.5,
      color: ['#facc15', '#ec4899', '#a855f7', '#00f5ff', '#ff5500'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.8 + 0.2,
    }));

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const mouse = mousePosRef.current;

      // 1. Render Floating Embers & Plasma Fire Sparks
      ctx.save();
      sparks.forEach((sp) => {
        sp.x += sp.vx + Math.sin(time + sp.y * 0.02) * 0.5;
        sp.y += sp.vy;
        if (sp.y < 0) {
          sp.y = height + 10;
          sp.x = Math.random() * width;
        }
        if (sp.x < 0) sp.x = width;
        if (sp.x > width) sp.x = 0;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = sp.alpha * (0.6 + Math.sin(time * 3 + sp.x) * 0.4);
        ctx.fill();
      });
      ctx.restore();

      // 2. Render Interactive Glowing Living Eyes
      ctx.save();
      livingEyes.forEach((eye) => {
        const eyeCanvasX = width * eye.xPct;
        const eyeCanvasY = height * eye.yPct;

        // Blinking state update
        eye.blinkTimer--;
        if (eye.blinkTimer <= 0 && !eye.isBlinking) {
          eye.isBlinking = true;
          eye.blinkDuration = 10;
          eye.blinkTimer = Math.random() * 250 + 150;
        }

        if (eye.isBlinking) {
          eye.blinkDuration--;
          if (eye.blinkDuration <= 0) {
            eye.isBlinking = false;
          }
        }

        // Mouse tracking calculation
        const dx = mouse.x - eyeCanvasX;
        const dy = mouse.y - eyeCanvasY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxOffset = eye.radius * 0.45;
        const pupilX = dist > 0 ? (dx / dist) * Math.min(dist * 0.08, maxOffset) : 0;
        const pupilY = dist > 0 ? (dy / dist) * Math.min(dist * 0.08, maxOffset) : 0;

        ctx.save();
        ctx.translate(eyeCanvasX, eyeCanvasY);

        if (!eye.isBlinking) {
          // Iris glow
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, eye.radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = eye.irisColor;
          ctx.shadowColor = eye.glowColor;
          ctx.shadowBlur = 12;
          ctx.fill();

          // Dark pupil center
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, eye.radius * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = eye.pupilColor;
          ctx.fill();

          // Specular glint
          ctx.beginPath();
          ctx.arc(pupilX - eye.radius * 0.15, pupilY - eye.radius * 0.15, eye.radius * 0.14, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.fill();
        } else {
          // Closed eyelid line
          ctx.beginPath();
          ctx.moveTo(-eye.radius * 0.8, 0);
          ctx.lineTo(eye.radius * 0.8, 0);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 6;
          ctx.stroke();
        }

        ctx.restore();
      });
      ctx.restore();

      // 3. Render Click Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 5;
        sw.alpha -= 0.025;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4 * sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = sw.alpha;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 * sw.alpha;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      id="psychedelic-intro-root"
      onPointerMove={handlePointerMove}
      onClick={handleStageClick}
      className={`relative w-full h-screen min-h-screen bg-[#070014] text-white flex flex-col items-center justify-between p-3 sm:p-6 select-none overflow-hidden font-pixel ${
        crtFlicker ? 'brightness-125 contrast-125' : ''
      }`}
    >
      {/* BACKGROUND IMAGE FILLING THE ENTIRE SCREEN */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center bg-[#070014]">
        <img
          src={pixelCoverArt}
          alt="Portada Psicodélica Pixel Art Original"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover sm:object-contain object-center scale-100 transition-transform duration-1000 ease-out"
          style={{
            imageRendering: 'pixelated',
          }}
        />
        {/* Color Grading Vignette for Readability */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/85 via-transparent to-black/90 mix-blend-multiply" />
      </div>

      {/* INTERACTIVE ANIMATED PARTICLES & LIVING EYES CANVAS OVERLAY */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* RETRO CRT SCANLINES OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-20 opacity-25 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.9)_3px,rgba(0,0,0,0.9)_4px)]" />

      {/* TOP SECTION: ESQUIZOFRENIA TITLE */}
      <header className="relative z-30 w-full max-w-4xl mx-auto flex flex-col items-center justify-center pt-2 sm:pt-4 text-center">
        {/* Controls (Sound & Fullscreen) pinned neatly in top right */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border-2 font-pixel text-[9px] sm:text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-[3px_3px_0px_#000] ${
              isFullscreen
                ? 'bg-amber-400 text-black border-black hover:bg-yellow-300'
                : 'bg-black/75 text-amber-200 border-yellow-400 hover:bg-slate-900'
            }`}
            title="Pantalla Completa (Tecla F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'SALIR' : 'FULLSCREEN'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSound();
            }}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border-2 font-pixel text-[9px] sm:text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-[3px_3px_0px_#000] ${
              isMuted
                ? 'bg-red-600 text-white border-black hover:bg-red-500'
                : 'bg-emerald-400 text-black border-black hover:bg-emerald-300'
            }`}
            title="Sonido SFX (Tecla M)"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
            <span className="hidden md:inline">{isMuted ? 'MUDO' : 'AUDIO SFX'}</span>
          </button>
        </div>

        {/* Big Stylized "ESQUIZOFRENIA" Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-1 sm:space-y-2 mt-2 sm:mt-0"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 border-2 border-black rounded-full text-black font-black text-[9px] sm:text-[11px] uppercase shadow-[3px_3px_0px_#000] tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>PORTAL ARCADE DE FÍSICA MULTIVERSAL</span>
            <Zap className="w-3.5 h-3.5 fill-black" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow-[0_0_25px_rgba(236,72,153,0.85)] filter pixel-text-shadow">
            ESQUIZOFRENIA
          </h1>
        </motion.div>
      </header>

      {/* CENTER AREA: ONLY THE INGRESS / ENTRY BUTTON FOR THE STORY */}
      <main className="relative z-30 my-auto flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <button
            id="btn-ingreso-historia"
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="group relative px-8 sm:px-14 py-4 sm:py-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-pink-500 hover:from-yellow-300 hover:via-amber-300 hover:to-pink-400 border-4 border-black rounded-3xl text-black font-black text-xl sm:text-3xl md:text-4xl uppercase tracking-widest shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#FF007F] hover:-translate-y-1 active:translate-y-1 active:shadow-[4px_4px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-3 sm:gap-4 animate-bounce"
            title="Iniciar la Historia de Física Cuántica"
          >
            <BookOpen className="w-6 h-6 sm:w-9 sm:h-9 text-black group-hover:scale-110 transition-transform" />
            <span className="drop-shadow-[1px_1px_0px_#fff]">INICIAR HISTORIA</span>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-black animate-spin" />
          </button>

          <span className="text-[10px] sm:text-xs font-silkscreen text-amber-200 pixel-text-shadow tracking-wider bg-black/60 px-3 py-1 rounded-lg border border-yellow-400/40">
            [ Presiona ENTER o ESPACIO para comenzar ]
          </span>
        </motion.div>
      </main>

      {/* BOTTOM SECTION: CREDITS (AUTORA, DOCENTE, INSTITUCIÓN EDUCATIVA) */}
      <footer className="relative z-30 w-full max-w-4xl mx-auto pb-2 sm:pb-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-black/85 border-3 border-yellow-400 rounded-2xl sm:rounded-3xl p-3 sm:p-4 backdrop-blur-md shadow-[6px_6px_0px_#000] text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 items-center divide-y md:divide-y-0 md:divide-x divide-yellow-400/30">
            {/* 1. Autora */}
            <div className="flex items-center justify-center gap-2 py-1 md:py-0 px-2 text-center">
              <User className="w-4 h-4 text-pink-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-silkscreen text-pink-300 font-bold uppercase tracking-wider">
                  AUTORA
                </span>
                <span className="text-xs sm:text-sm font-black text-white pixel-text-shadow">
                  Isabel Sofía López Guisado
                </span>
              </div>
            </div>

            {/* 2. Docente */}
            <div className="flex items-center justify-center gap-2 py-1 md:py-0 px-2 text-center">
              <GraduationCap className="w-4 h-4 text-yellow-300 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-silkscreen text-yellow-300 font-bold uppercase tracking-wider">
                  DOCENTE
                </span>
                <span className="text-xs sm:text-sm font-black text-white pixel-text-shadow">
                  Jorge Armando Jaramillo
                </span>
              </div>
            </div>

            {/* 3. Institución Educativa */}
            <div className="flex items-center justify-center gap-2 py-1 md:py-0 px-2 text-center">
              <School className="w-4 h-4 text-cyan-300 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-silkscreen text-cyan-300 font-bold uppercase tracking-wider">
                  INSTITUCIÓN EDUCATIVA
                </span>
                <span className="text-xs sm:text-sm font-black text-white pixel-text-shadow">
                  Institución Educativa Josefa Campos
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};
