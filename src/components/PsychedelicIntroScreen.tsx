import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  LayoutGrid,
  Orbit,
  GraduationCap,
  Sliders,
  X,
  Play,
  ArrowRight,
  Shield,
  HelpCircle,
  Eye,
  Flame,
  Award
} from 'lucide-react';
import pixelCoverArt from '../assets/images/psychedelic_pixel_cover_1787926979816.jpg';
import { sfx } from '../utils/audioEffects';

interface PsychedelicIntroScreenProps {
  onStartStory: () => void;
  onOpenWorlds: () => void;
  onOpenSandbox?: () => void;
  onOpenWorldDirect?: (world: 'world1' | 'world2' | 'world3' | 'world4' | 'free') => void;
  onOpenProfile: () => void;
  userProfile: { name: string; age: string; grade: string } | null;
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
  onOpenSandbox,
  onOpenWorldDirect,
  onOpenProfile,
  userProfile,
  isMuted,
  onToggleSound,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [showExtrasModal, setShowExtrasModal] = useState<boolean>(false);
  const [showStoryAndSandboxModal, setShowStoryAndSandboxModal] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [crtFlicker, setCrtFlicker] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; normX: number; normY: number }>({
    x: 0,
    y: 0,
    normX: 0.5,
    normY: 0.5,
  });
  const shockwavesRef = useRef<Shockwave[]>([]);

  // Menu items: INICIAR opens the physics simulators immediately, followed by Story & Free World together
  const menuItems = [
    {
      id: 'iniciar',
      label: 'INICIAR SIMULADORES',
      subtitle: 'Entrar directo al Hub de los 4 Mundos y Laboratorios de Física',
      icon: LayoutGrid,
      action: () => {
        sfx.playLaser(1600);
        onOpenWorlds();
      },
    },
    {
      id: 'historia_mundo_libre',
      label: 'HISTORIA Y MUNDO LIBRE',
      subtitle: '📖 Historia Rara de la Física + 🎡 Parque de Diversiones Sandbox',
      icon: Zap,
      action: () => {
        sfx.playPop(520);
        setShowStoryAndSandboxModal(true);
      },
    },
    {
      id: 'parque',
      label: 'MUNDO LIBRE (PARQUE)',
      subtitle: '🎡 Montañas Rusas, Rueda de la Fortuna, Carros Chocones y Cañón',
      icon: Sparkles,
      action: () => {
        sfx.playLaser(1400);
        if (onOpenSandbox) {
          onOpenSandbox();
        } else if (onOpenWorldDirect) {
          onOpenWorldDirect('free');
        } else {
          onOpenWorlds();
        }
      },
    },
    {
      id: 'historia',
      label: 'HISTORIA RARA',
      subtitle: 'Aventura de física cuántica y cinemática en Elmore (Cap. 1-5)',
      icon: Eye,
      action: () => {
        sfx.playLaser(1500);
        onStartStory();
      },
    },
    {
      id: 'opciones',
      label: 'OPCIONES',
      subtitle: 'Audio SFX, Pantalla Completa y Filtro CRT',
      icon: Sliders,
      action: () => {
        sfx.playPop(520);
        setShowOptionsModal(true);
      },
    },
    {
      id: 'extras',
      label: 'EXTRAS & PASAPORTE',
      subtitle: 'Registro de Estudiante, Créditos y Reconocimientos',
      icon: GraduationCap,
      action: () => {
        sfx.playPop(480);
        setShowExtrasModal(true);
      },
    },
    {
      id: 'salir',
      label: 'FULLSCREEN / SALIR',
      subtitle: 'Alternar Pantalla Completa o Salir',
      icon: Maximize2,
      action: () => {
        sfx.playPop(400);
        toggleFullscreen();
      },
    },
  ];

  // Fullscreen Detection
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    sfx.playLaser(1500);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard navigation for authentic arcade feel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOptionsModal || showExtrasModal || showExitConfirm) return;

      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sfx.playPop(420);
        setSelectedIdx((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        sfx.playPop(520);
        setSelectedIdx((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuItems[selectedIdx].action();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, showOptionsModal, showExtrasModal, showExitConfirm, menuItems]);

  // Periodic Glitch / CRT flicker
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setCrtFlicker(true);
        setTimeout(() => setCrtFlicker(false), 90 + Math.random() * 120);
      }
    }, 4000);
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

    // Living Reactive Mystical Eyes mapping to the entity
    const livingEyes: LivingEye[] = [
      // Big chest third eye
      { xPct: 0.46, yPct: 0.61, radius: 24, irisColor: '#9333ea', pupilColor: '#000000', glowColor: '#e879f9', blinkTimer: 200, blinkDuration: 0, isBlinking: false },
      // Face Left Eye
      { xPct: 0.44, yPct: 0.42, radius: 14, irisColor: '#06b6d4', pupilColor: '#000000', glowColor: '#67e8f9', blinkTimer: 240, blinkDuration: 0, isBlinking: false },
      // Face Right Eye
      { xPct: 0.58, yPct: 0.43, radius: 14, irisColor: '#ec4899', pupilColor: '#000000', glowColor: '#f472b6', blinkTimer: 260, blinkDuration: 0, isBlinking: false },
      // Left shoulder eyes
      { xPct: 0.28, yPct: 0.40, radius: 9, irisColor: '#ef4444', pupilColor: '#000000', glowColor: '#f87171', blinkTimer: 180, blinkDuration: 0, isBlinking: false },
      { xPct: 0.33, yPct: 0.41, radius: 9, irisColor: '#f59e0b', pupilColor: '#000000', glowColor: '#fbbf24', blinkTimer: 290, blinkDuration: 0, isBlinking: false },
      // Right arm eyes
      { xPct: 0.79, yPct: 0.69, radius: 10, irisColor: '#3b82f6', pupilColor: '#000000', glowColor: '#60a5fa', blinkTimer: 220, blinkDuration: 0, isBlinking: false },
      { xPct: 0.80, yPct: 0.74, radius: 10, irisColor: '#06b6d4', pupilColor: '#000000', glowColor: '#22d3ee', blinkTimer: 310, blinkDuration: 0, isBlinking: false },
      // Hip eyes
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
      className={`relative w-full h-screen min-h-screen bg-[#070014] text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-hidden font-pixel ${
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
        {/* Color Grading Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#140026]/30 to-[#070014]/80 mix-blend-multiply" />
      </div>

      {/* INTERACTIVE ANIMATED PARTICLES & LIVING EYES CANVAS OVERLAY */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* RETRO CRT SCANLINES OVERLAY */}
      {scanlinesEnabled && (
        <div className="fixed inset-0 pointer-events-none z-20 opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.9)_3px,rgba(0,0,0,0.9)_4px)]" />
      )}

      {/* TOP FLOATING NAVIGATION BAR */}
      <header className="relative z-30 w-full max-w-6xl mx-auto flex items-center justify-between gap-2 p-2 sm:p-3 bg-black/75 border-2 sm:border-3 border-yellow-400 rounded-2xl backdrop-blur-md shadow-[4px_4px_0px_#000]">
        {/* Title Tag */}
        <div className="flex items-center gap-2">
          <span className="text-yellow-300 text-[10px] sm:text-xs tracking-widest pixel-text-yellow animate-pulse">
            ★ ESQUIZOFRENIA • PORTAL ARCADE ★
          </span>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className={`px-2.5 py-1 rounded-xl border-2 font-pixel text-[9px] sm:text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
              isFullscreen
                ? 'bg-amber-400 text-black border-black hover:bg-yellow-300'
                : 'bg-slate-900 text-amber-200 border-amber-400 hover:bg-slate-800'
            }`}
            title="Pantalla Completa (Tecla F)"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span className="hidden sm:inline">{isFullscreen ? 'SALIR' : 'FULLSCREEN'}</span>
          </button>

          {/* Sound Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSound();
            }}
            className={`px-2.5 py-1 rounded-xl border-2 font-pixel text-[9px] sm:text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
              isMuted
                ? 'bg-red-600 text-white border-black hover:bg-red-500'
                : 'bg-emerald-400 text-black border-black hover:bg-emerald-300'
            }`}
            title="Sonido SFX (Tecla M)"
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 animate-pulse" />}
            <span className="hidden sm:inline">{isMuted ? 'MUDO' : 'SFX'}</span>
          </button>
        </div>
      </header>

      {/* MAIN RETRO INTERACTIVE PIXEL MENU ON THE LEFT (MATCHING EXACT SCREENSHOT) */}
      <div className="relative z-30 w-full max-w-6xl mx-auto my-auto flex flex-col md:flex-row items-center justify-between gap-6 px-3 sm:px-6">
        
        {/* LEFT SIDE: AUTHENTIC PIXEL-ART VERTICAL MENU */}
        <nav
          className="flex flex-col items-start space-y-3 sm:space-y-4 text-left p-4 sm:p-6 bg-black/60 md:bg-transparent rounded-3xl md:rounded-none border-2 border-yellow-400/80 md:border-none backdrop-blur-sm md:backdrop-blur-none shadow-[6px_6px_0px_#000] md:shadow-none"
          role="menu"
          aria-label="Menú Principal"
        >
          {menuItems.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={item.id}
                id={`pixel-menu-item-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
                onMouseEnter={() => {
                  if (selectedIdx !== idx) {
                    sfx.playPop(450);
                    setSelectedIdx(idx);
                  }
                }}
                className={`group relative flex items-center gap-2.5 sm:gap-3 text-left transition-all duration-150 cursor-pointer focus:outline-none ${
                  isSelected ? 'scale-110 translate-x-2' : 'hover:translate-x-1 opacity-90 hover:opacity-100'
                }`}
              >
                {/* Yellow Arrow Cursor Indicator */}
                <span
                  className={`text-base sm:text-xl md:text-2xl font-black text-yellow-300 pixel-text-yellow transition-opacity duration-150 ${
                    isSelected ? 'opacity-100 animate-pulse' : 'opacity-0'
                  }`}
                >
                  &gt;
                </span>

                {/* Menu Option Label */}
                <div className="flex flex-col">
                  <span
                    className={`text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wider transition-colors duration-150 pixel-text-shadow ${
                      isSelected
                        ? 'text-yellow-300 pixel-text-yellow drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                        : 'text-white hover:text-yellow-200'
                    }`}
                  >
                    {item.label}
                  </span>
                  
                  {/* Subtle Context Subtitle on Hover/Select */}
                  <span
                    className={`text-[9px] sm:text-[10px] font-silkscreen text-pink-300 font-bold transition-all duration-200 ${
                      isSelected ? 'opacity-100 max-h-6 mt-0.5' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* RIGHT SIDE: QUICK SHORTCUT CARD (ONLY ON WIDER SCREENS) */}
        <div className="hidden lg:flex flex-col items-end space-y-3 pointer-events-auto">
          <div className="bg-black/80 border-3 border-yellow-400 p-4 rounded-2xl shadow-[6px_6px_0px_#000] text-right max-w-xs backdrop-blur-md">
            <div className="flex items-center justify-end gap-2 text-yellow-300 text-xs font-bold mb-1">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="pixel-text-shadow">ACCESO RÁPIDO</span>
            </div>
            <p className="text-[10px] font-silkscreen text-slate-200 leading-relaxed mb-3">
              4 Mundos de Física • Parque Libre • Historia Narrada
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playLaser(1600);
                  onOpenWorlds();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-black text-black font-black text-[11px] uppercase rounded-xl shadow-[3px_3px_0px_#000] hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>🎮 SIMULADORES (4 MUNDOS)</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.playPop(520);
                  setShowStoryAndSandboxModal(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 border-2 border-black text-white font-black text-[11px] uppercase rounded-xl shadow-[3px_3px_0px_#000] hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>📖 HISTORIA & PARQUE 🎡</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER: BLINKING "PRESIONA START" & SOCIAL WATERMARK */}
      <footer className="relative z-30 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 p-2 sm:p-3 text-center">
        {/* Left Credit Info */}
        <div className="text-[8px] sm:text-[9px] font-silkscreen text-amber-200/90 pixel-text-shadow text-left hidden sm:block">
          <span>I.E. JOSEFA CAMPOS</span> • <span className="text-pink-300">FÍSICA MULTIVERSAL</span>
        </div>

        {/* Central Action Buttons: START (SIMULADORES) & HISTORIA + MUNDO LIBRE */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              sfx.playLaser(1600);
              onOpenWorlds();
            }}
            className="group px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 border-2 border-black rounded-2xl text-black font-pixel text-xs sm:text-sm tracking-wider uppercase shadow-[4px_4px_0px_#000] animate-bounce cursor-pointer transition-all flex items-center gap-2"
            title="Abrir directamente los Simuladores"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>PRESIONA START (SIMULADORES)</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              sfx.playPop(520);
              setShowStoryAndSandboxModal(true);
            }}
            className="px-3.5 py-2 bg-[#1b0336]/90 hover:bg-[#2c0556] border-2 border-pink-400 hover:border-pink-300 text-pink-200 hover:text-white rounded-2xl font-pixel text-[10px] sm:text-xs uppercase shadow-[3px_3px_0px_#000] cursor-pointer transition-all flex items-center gap-1.5"
            title="Abrir Historia y Parque de Diversiones"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>HISTORIA & MUNDO LIBRE 🎡</span>
          </button>
        </div>

        {/* Right Watermark @ria.star23 */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-silkscreen text-yellow-200 pixel-text-shadow">
          <span className="opacity-90">♪ @ria.star23</span>
        </div>
      </footer>

      {/* COMBINED STORY & FREE WORLD (PARQUE) MODAL */}
      <AnimatePresence>
        {showStoryAndSandboxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#16032d] border-4 border-yellow-400 rounded-3xl p-6 sm:p-7 shadow-[10px_10px_0px_#FF007F] text-white font-pixel"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStoryAndSandboxModal(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 border-2 border-black text-black font-black rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="text-center space-y-1 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 border border-black rounded-full text-black font-black text-[9px] uppercase shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>MODOS COMPLEMENTARIOS</span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 uppercase pixel-text-shadow pt-1">
                  HISTORIA Y MUNDO LIBRE
                </h3>
                <p className="text-[10px] font-silkscreen text-amber-200">
                  Elige tu experiencia: vive la historia interactiva o experimenta en el parque mecánico libre.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Historia Rara */}
                <div className="bg-[#240645] border-3 border-pink-400 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_#000] hover:border-yellow-400 transition-all group">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-pink-300 text-xs font-black">
                      <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      <span>📖 HISTORIA RARA</span>
                    </div>
                    <p className="text-[9px] font-silkscreen text-slate-200 leading-relaxed">
                      5 Capítulos ilustrados con diálogos de Gumball, Darwin y Anais, retos con XP y gizmos matemáticos.
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStoryAndSandboxModal(false);
                      sfx.playLaser(1600);
                      onStartStory();
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-black text-white font-black text-[10px] uppercase rounded-xl shadow-[3px_3px_0px_#000] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>ENTRAR A LA HISTORIA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option 2: Mundo Libre (Parque) */}
                <div className="bg-[#0c1f38] border-3 border-cyan-400 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_#000] hover:border-yellow-400 transition-all group">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs font-black">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>🎡 MUNDO LIBRE (PARQUE)</span>
                    </div>
                    <p className="text-[9px] font-silkscreen text-slate-200 leading-relaxed">
                      Rueda de la fortuna giratoria, montañas rusas con loopings y boosts, carros chocones y cañón de feria.
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStoryAndSandboxModal(false);
                      sfx.playLaser(1400);
                      if (onOpenSandbox) {
                        onOpenSandbox();
                      } else if (onOpenWorldDirect) {
                        onOpenWorldDirect('free');
                      } else {
                        onOpenWorlds();
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-black text-black font-black text-[10px] uppercase rounded-xl shadow-[3px_3px_0px_#000] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>ENTRAR AL PARQUE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-purple-900/60 flex items-center justify-between text-[9px] font-silkscreen text-slate-400">
                <span>I.E. Josefa Campos</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStoryAndSandboxModal(false);
                    onOpenWorlds();
                  }}
                  className="text-yellow-300 hover:underline cursor-pointer"
                >
                  O ir al Hub de 4 Mundos &gt;
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OPTIONS MODAL */}
      <AnimatePresence>
        {showOptionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#16032d] border-4 border-yellow-400 rounded-3xl p-6 shadow-[10px_10px_0px_#000] text-white font-pixel"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsModal(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 border-2 border-black text-black font-black rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <h3 className="text-sm sm:text-base font-black text-yellow-300 uppercase mb-4 flex items-center gap-2 pixel-text-yellow">
                <Sliders className="w-4 h-4 text-yellow-300" />
                <span>OPCIONES DEL SISTEMA</span>
              </h3>

              <div className="space-y-3 text-[10px]">
                {/* Audio SFX */}
                <div className="bg-black/70 p-3 rounded-2xl border-2 border-purple-800 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs block text-white">SONIDO SFX</span>
                    <span className="text-slate-400 text-[8px] font-silkscreen">Sintetizador Web Audio</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSound();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] text-[9px] ${
                      isMuted ? 'bg-red-500 text-white' : 'bg-emerald-400 text-black'
                    }`}
                  >
                    {isMuted ? 'MUDO' : 'ACTIVO'}
                  </button>
                </div>

                {/* Fullscreen */}
                <div className="bg-black/70 p-3 rounded-2xl border-2 border-purple-800 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs block text-white">FULLSCREEN</span>
                    <span className="text-slate-400 text-[8px] font-silkscreen">Pantalla Completa (F)</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] text-[9px] ${
                      isFullscreen ? 'bg-amber-400 text-black' : 'bg-cyan-400 text-black'
                    }`}
                  >
                    {isFullscreen ? 'SALIR' : 'ACTIVAR'}
                  </button>
                </div>

                {/* Scanlines Filter */}
                <div className="bg-black/70 p-3 rounded-2xl border-2 border-purple-800 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs block text-white">FILTRO CRT</span>
                    <span className="text-slate-400 text-[8px] font-silkscreen">Líneas de escaneo retro</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sfx.playPop();
                      setScanlinesEnabled(!scanlinesEnabled);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] text-[9px] ${
                      scanlinesEnabled ? 'bg-yellow-400 text-black' : 'bg-slate-700 text-white'
                    }`}
                  >
                    {scanlinesEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Controls Info */}
                <div className="bg-black/70 p-3 rounded-2xl border-2 border-purple-800 space-y-1 font-silkscreen text-[9px] text-amber-200">
                  <span className="font-black text-[10px] block text-cyan-300 font-pixel">🎮 CONTROLES:</span>
                  <p>• <strong>↑ / ↓ o W / S:</strong> Mover cursor</p>
                  <p>• <strong>ENTER / ESPACIO:</strong> Seleccionar</p>
                  <p>• <strong>F:</strong> Pantalla Completa</p>
                  <p>• <strong>M:</strong> Mute SFX</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsModal(false);
                }}
                className="mt-4 w-full py-2.5 bg-yellow-400 border-3 border-black text-black font-black uppercase rounded-2xl shadow-[3px_3px_0px_#000] hover:bg-yellow-300 cursor-pointer text-xs"
              >
                VOLVER
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXTRAS MODAL (CREDITS, PASSPORT, SANDBOX) */}
      <AnimatePresence>
        {showExtrasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#16032d] border-4 border-pink-500 rounded-3xl p-6 sm:p-7 shadow-[10px_10px_0px_#000] text-white font-pixel"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExtrasModal(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-pink-500 border-2 border-black text-white font-black rounded-xl flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="text-center space-y-1 mb-4">
                <span className="text-[9px] px-2.5 py-0.5 bg-yellow-400 border border-black rounded-full text-black font-black uppercase">
                  CONTENIDO EXTRA Y ACADÉMICO
                </span>
                <h3 className="text-sm sm:text-base font-black text-pink-300 uppercase pixel-text-shadow">
                  I.E. JOSEFA CAMPOS
                </h3>
              </div>

              <div className="space-y-2.5 text-[9px] font-silkscreen">
                {/* Authors & Teacher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-black/70 p-3 rounded-2xl border-2 border-yellow-400 text-center">
                    <span className="text-yellow-300 font-black block uppercase text-[10px] mb-1 font-pixel">✍️ Estudiantes</span>
                    <p className="text-white font-bold text-xs">Isabel Sofía López</p>
                    <p className="text-white font-bold text-xs">& Juan Alejandro Mejía</p>
                  </div>

                  <div className="bg-black/70 p-3 rounded-2xl border-2 border-cyan-400 text-center">
                    <span className="text-cyan-300 font-black block uppercase text-[10px] mb-1 font-pixel">👨‍🏫 Docente</span>
                    <p className="text-white font-bold text-xs">Jorge Armando Jaramillo Bravo</p>
                    <p className="text-slate-400 text-[8px]">Física & Ciencias Naturales</p>
                  </div>
                </div>

                {/* Fast Launchers from Extras */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExtrasModal(false);
                      onOpenProfile();
                    }}
                    className="p-2.5 bg-gradient-to-br from-fuchsia-600 to-purple-800 border-2 border-black rounded-xl text-white font-pixel text-[9px] uppercase shadow-[3px_3px_0px_#000] hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>PASAPORTE</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExtrasModal(false);
                      if (onOpenSandbox) {
                        onOpenSandbox();
                      } else {
                        onOpenWorlds();
                      }
                    }}
                    className="p-2.5 bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 border-2 border-black rounded-xl text-white font-pixel text-[9px] uppercase shadow-[3px_3px_0px_#000] hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>PARQUE 🎡</span>
                  </button>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExtrasModal(false);
                }}
                className="mt-4 w-full py-2.5 bg-pink-500 border-3 border-black text-white font-black uppercase rounded-2xl shadow-[3px_3px_0px_#000] hover:bg-pink-400 cursor-pointer text-xs"
              >
                CERRAR EXTRAS
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
