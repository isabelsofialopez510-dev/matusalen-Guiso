import React, { useState, useEffect } from 'react';
import {
  Globe,
  Rocket,
  Sparkles,
  Target,
  ArrowRight,
  User,
  Home,
  Zap,
  Flame,
  Award,
  Wind,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import bgBusStop from '../assets/images/elmore_bus_stop_1787235581594.jpg';
import bgSpace from '../assets/images/space_world_bg_1785850978031.jpg';
import bgHouse from '../assets/images/suburban_house_bg_1785850447893.jpg';
import bgGarden from '../assets/images/elmore_garden_bg_1787237438721.jpg';
import { sfx } from '../utils/audioEffects';

interface WorldSelectorProps {
  onSelectWorld: (world: 'world1' | 'world2' | 'world3' | 'world4') => void;
  onGoHome: () => void;
  onOpenStory?: () => void;
  userProfile: { name: string; age: string; grade: string } | null;
  onOpenProfileModal: () => void;
}

export const WorldSelector: React.FC<WorldSelectorProps> = ({
  onSelectWorld,
  onGoHome,
  onOpenStory,
  userProfile,
  onOpenProfileModal,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => sfx.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    sfx.playLaser(1400);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleSound = () => {
    const next = sfx.toggleMute();
    setIsMuted(next);
  };

  const handleSelect = (world: 'world1' | 'world2' | 'world3' | 'world4') => {
    sfx.playSparkle();
    onSelectWorld(world);
  };
  const worlds = [
    {
      id: 'world1' as const,
      num: '1',
      title: 'Mundo 1: Perspectivas Simultáneas',
      subtitle: 'Gumball & Relatividad Especial 1D / 2D en el Autobús',
      badge: '🐱 MUNDO 1 • GUMBALL & AZUL RELATIVISTA',
      bgImg: bgBusStop,
      accentBorder: 'border-sky-400',
      accentBg: 'bg-sky-500',
      accentText: 'text-sky-300',
      glowColor: 'shadow-[8px_8px_0px_#0284c7]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#38bdf8]',
      btnBg: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white hover:from-sky-300 hover:to-blue-400',
      icon: Globe,
      features: [
        '🐱 Gumball en el autobús observando el tiro vertical 1D (Marco S\')',
        '🚌 Doble marco simultáneo: Interior 1D vs Exterior 2D Parabólico (Marco S)',
        '⚡ Transformaciones galileanas y descomposición cinemática vectorial',
        '💫 Tonalidades de Azul: Zafiro, Celeste, Marino, Cian Eléctrico y Pastel',
      ],
      tagline: 'Gumball compara la perspectiva interna y externa del autobús de Elmore.',
    },
    {
      id: 'world2' as const,
      num: '2',
      title: 'Mundo 2: Pista Horizontal MUA vs MRU',
      subtitle: 'Anais & Carrera Cinemática 1D en Tonos Rosados',
      badge: '🐰 MUNDO 2 • ANAIS & ROSADO CINEMÁTICO',
      bgImg: bgSpace,
      accentBorder: 'border-pink-400',
      accentBg: 'bg-pink-500',
      accentText: 'text-pink-300',
      glowColor: 'shadow-[8px_8px_0px_#ec4899]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#f472b6]',
      btnBg: 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white hover:from-pink-400 hover:to-rose-400',
      icon: Rocket,
      features: [
        '🐰 Anais analiza la carrera: Cubo MUA (a = cte) vs Cubo MRU (v = cte)',
        '📈 Gráficas cinemáticas en vivo en rosa: posición x(t), v(t) y a(t)',
        '⏱️ Cronometraje oficial de foto-finish, telemetría y punto de intersección',
        '🌸 Tonalidades de Rosado: Fucsia, Magenta, Chicle, Rosa Pastel y Neón',
      ],
      tagline: 'Duelo cinemático entre velocidad constante y aceleración constante en pista rosa.',
    },
    {
      id: 'world3' as const,
      num: '3',
      title: 'Mundo 3: Caída Libre & Resistencia al Aire',
      subtitle: 'Darwin en las Torres de Elmore en Tonos Naranjas',
      badge: '🐟 MUNDO 3 • DARWIN & NARANJA DINÁMICO',
      bgImg: bgHouse,
      accentBorder: 'border-orange-400',
      accentBg: 'bg-orange-500',
      accentText: 'text-orange-300',
      glowColor: 'shadow-[8px_8px_0px_#ea580c]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#fb923c]',
      btnBg: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white hover:from-orange-400 hover:to-amber-400',
      icon: Sparkles,
      features: [
        '🐟 Darwin lanza la roca (5 kg) y moneda (5 g) desde alturas de 10 a 150 m',
        '⚡ Modo Vacío (0 Pa): Caída simultánea sin importar la masa (m·a = m·g)',
        '💨 Modo Con Aire (1 atm): Arrastre de fluidos y velocidad terminal límite MRU',
        '🍊 Tonalidades de Naranja: Ámbar, Mandarina, Coral, Melocotón y Óxido Cálido',
      ],
      tagline: 'Demuestra experimentalmente el principio de equivalencia de Galileo con Darwin.',
    },
    {
      id: 'world4' as const,
      num: '4',
      title: 'Mundo 4: Tiro Parabólico 2D Balístico',
      subtitle: 'Lanzamiento Balístico en el Jardín en Tonos Verdes',
      badge: '🎯 MUNDO 4 • VERDE BALÍSTICO 2D',
      bgImg: bgGarden,
      accentBorder: 'border-emerald-400',
      accentBg: 'bg-emerald-500',
      accentText: 'text-emerald-300',
      glowColor: 'shadow-[8px_8px_0px_#059669]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#34d399]',
      btnBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-400',
      icon: Target,
      features: [
        '🍬 Lanzamiento balístico con v₀ = 28 m/s a θ = 16.3°, X = 43 m, H_max = 3.3 m',
        '📐 Cinemática 2D desacoplada: MRU horizontal + MUA gravitacional vertical',
        '🎯 Diana balística, estela parabólica y telemetría vectorial en verde',
        '🌿 Tonalidades de Verde: Esmeralda, Menta, Bosque, Lima, Jade y Salvia',
      ],
      tagline: 'Calcula la parábola 2D y acierta a la diana en el exuberante jardín verde.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d0926] text-white p-4 sm:p-6 md:p-8 font-sans antialiased relative overflow-x-hidden bg-[radial-gradient(#ec4899_1.5px,transparent_1.5px)] [background-size:24px_24px]">
      {/* Background Pop-art Accents */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Header / Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#16123b]/95 border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[8px_8px_0px_#facc15]">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="px-4 py-2.5 bg-yellow-400 border-3 border-black text-black font-black text-xs uppercase rounded-2xl shadow-[3px_3px_0px_#000] hover:bg-pink-500 hover:text-white hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer rotate-[-1deg]"
              title="Volver a la portada de inicio"
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </button>

            {onOpenStory && (
              <button
                onClick={() => {
                  sfx.playWarpWhoosh();
                  onOpenStory();
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 border-3 border-black text-white font-black text-xs uppercase rounded-2xl shadow-[3px_3px_0px_#000] hover:brightness-110 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer rotate-[1deg]"
                title="Leer la Historia Rara de la Física"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>👁️ Historia Rara</span>
              </button>
            )}

            <div>
              <span className="font-black text-lg sm:text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 drop-shadow-[2px_2px_0px_#000]">
                SELECCIÓN DE MUNDOS
              </span>
              <p className="text-[11px] font-mono font-bold text-cyan-300">
                🎨 Multiverso de Física Interactiva — 4 Mundos Didácticos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleFullscreen}
              className={`px-3 py-1.5 border-2 border-black rounded-2xl font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-400 text-black hover:bg-yellow-300'
                  : 'bg-slate-800 text-amber-200 hover:bg-slate-700'
              }`}
              title="Pantalla Completa (Tecla F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Salir Full' : 'Full'}</span>
            </button>

            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 border-2 border-black rounded-2xl font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-emerald-400 text-black hover:bg-emerald-300'
              }`}
              title={isMuted ? 'Activar Efectos de Sonido' : 'Silenciar Sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
              <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'SFX ON'}</span>
            </button>

            {userProfile ? (
              <div
                onClick={() => {
                  sfx.playPop();
                  onOpenProfileModal();
                }}
                className="flex items-center gap-2 bg-[#0d0926] border-2 border-pink-400 px-3.5 py-1.5 rounded-2xl text-xs font-mono font-bold cursor-pointer hover:border-yellow-400 transition-all shadow-[3px_3px_0px_#000]"
                title="Clic para editar tu perfil"
              >
                <div className="w-7 h-7 bg-pink-500 text-white rounded-xl border border-black flex items-center justify-center font-black">
                  <User className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-pink-300 font-bold leading-none">Estudiante</div>
                  <div className="text-white font-black leading-tight">{userProfile.name}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  sfx.playPop();
                  onOpenProfileModal();
                }}
                className="px-4 py-2 bg-pink-500 border-2 border-black text-white font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_#000] hover:bg-pink-600 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-yellow-300" />
                <span>Registrarse</span>
              </button>
            )}
          </div>
        </header>

        {/* Hero Title inside Worlds Screen */}
        <div className="text-center space-y-2 py-2">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 border-3 border-black rounded-full text-black font-black text-xs uppercase shadow-[4px_4px_0px_#000] rotate-[-1deg]">
            <Zap className="w-4 h-4 fill-black" />
            <span>LABORATORIOS DIDÁCTICOS & SIMULADORES DE FÍSICA</span>
            <Zap className="w-4 h-4 fill-black" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            ELIGE TU SIMULADOR DE FÍSICA
          </h2>
          <p className="text-sm font-mono text-amber-200 max-w-2xl mx-auto font-medium">
            Selecciona cualquiera de los 4 mundos interactivos para experimentar con relatividad, cinemática 1D/2D, caída libre y tiro parabólico.
          </p>

          {onOpenStory && (
            <div className="pt-2">
              <button
                onClick={() => {
                  sfx.playWarpWhoosh();
                  onOpenStory();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 border-3 border-black text-white font-black text-xs sm:text-sm uppercase rounded-2xl shadow-[4px_4px_0px_#000] hover:brightness-110 hover:-translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
                title="Abrir el Cuento Narrativo y Visual de Física"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                <span>📖 ABRIR CUENTO DE FÍSICA CUÁNTICA</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </button>
            </div>
          )}
        </div>

        {/* 4 Worlds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {worlds.map((w) => {
            const IconComp = w.icon;
            return (
              <div
                key={w.id}
                className={`bg-[#16123b] border-4 ${w.accentBorder} rounded-3xl overflow-hidden ${w.glowColor} ${w.hoverGlow} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group relative`}
              >
                {/* Top Image Preview Banner with Overlay */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b-4 border-black">
                  <img
                    src={w.bgImg}
                    alt={w.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16123b] via-[#16123b]/40 to-transparent" />

                  {/* Badge & Number */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-3 py-1 bg-black text-white border-2 ${w.accentBorder} rounded-xl font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000]`}>
                      {w.badge}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 w-10 h-10 bg-black border-2 border-white rounded-2xl flex items-center justify-center font-black text-xl text-yellow-300 shadow-[3px_3px_0px_#000] rotate-[4deg]">
                    {w.num}
                  </div>

                  {/* Floating Title on Image */}
                  <div className="absolute bottom-3 left-4 right-4 text-left">
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white drop-shadow-[2px_2px_0px_#000] flex items-center gap-2">
                      <IconComp className={`w-6 h-6 ${w.accentText}`} />
                      <span>{w.title}</span>
                    </h3>
                    <p className="text-xs font-mono font-bold text-slate-300">
                      {w.subtitle}
                    </p>
                  </div>
                </div>

                {/* Card Body with Features */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-amber-200/90 font-medium italic border-l-3 border-yellow-400 pl-3">
                      "{w.tagline}"
                    </p>

                    <div className="space-y-2 pt-1 font-mono text-xs text-slate-200">
                      {w.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-400 font-black mt-0.5">•</span>
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => handleSelect(w.id)}
                      className={`w-full py-3.5 px-5 ${w.btnBg} border-3 border-black font-black text-base uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer group/btn`}
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      <span>INGRESAR AL MUNDO {w.num}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="bg-[#16123b]/95 border-3 border-yellow-400/80 rounded-2xl p-4 sm:p-5 shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono text-amber-200">
          <div className="text-center md:text-left space-y-0.5">
            <p className="font-black text-white text-sm">🏛️ Institución Educativa Josefa Campos</p>
            <p className="text-pink-300 font-bold">Autores: Isabel Sofía López y Juan Alejandro Mejía • Docente: Jorge Armando Jaramillo Bravo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sfx.playPop();
                onGoHome();
              }}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
            >
              ⬅️ Portada de Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
