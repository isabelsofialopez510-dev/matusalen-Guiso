import React from 'react';
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
  Wind
} from 'lucide-react';
import bgBusStop from '../assets/images/elmore_bus_stop_1787235581594.jpg';
import bgSpace from '../assets/images/space_world_bg_1785850978031.jpg';
import bgHouse from '../assets/images/suburban_house_bg_1785850447893.jpg';
import bgGarden from '../assets/images/elmore_garden_bg_1787237438721.jpg';

interface WorldSelectorProps {
  onSelectWorld: (world: 'world1' | 'world2' | 'world3' | 'world4') => void;
  onGoHome: () => void;
  userProfile: { name: string; age: string; grade: string } | null;
  onOpenProfileModal: () => void;
}

export const WorldSelector: React.FC<WorldSelectorProps> = ({
  onSelectWorld,
  onGoHome,
  userProfile,
  onOpenProfileModal,
}) => {
  const worlds = [
    {
      id: 'world1' as const,
      num: '1',
      title: 'Mundo 1: Perspectivas Simultáneas',
      subtitle: 'Relatividad Especial 1D / 2D & Autobús de Einstein',
      badge: '🚀 RELATIVIDAD & CINEMÁTICA',
      bgImg: bgBusStop,
      accentBorder: 'border-yellow-400',
      accentBg: 'bg-yellow-400',
      accentText: 'text-yellow-300',
      glowColor: 'shadow-[8px_8px_0px_#facc15]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#FF007F]',
      btnBg: 'bg-gradient-to-r from-yellow-300 to-amber-400 text-black hover:from-yellow-200 hover:to-amber-300',
      icon: Globe,
      features: [
        '🚌 Autobús relativista a v = 0.80c en las calles de Elmore',
        '⚡ Transformación de Lorentz, dilatación temporal y contracción de longitud',
        '👁️ Doble marco de referencia: pasajero en movimiento vs observador en tierra',
        '💫 Trayectorias de luz rectilíneas vs parábolas clásicas y relativistas',
      ],
      tagline: 'Compara la perspectiva interna y externa a velocidades relativistas.',
    },
    {
      id: 'world2' as const,
      num: '2',
      title: 'Mundo 2: Pista Horizontal MUA vs MRU',
      subtitle: 'Carrera Cinemática 1D de Cubos en Pista Rectilínea',
      badge: '🏎️ CINEMÁTICA 1D EN PISTA',
      bgImg: bgSpace,
      accentBorder: 'border-purple-400',
      accentBg: 'bg-purple-500',
      accentText: 'text-purple-300',
      glowColor: 'shadow-[8px_8px_0px_#a855f7]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#38bdf8]',
      btnBg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400',
      icon: Rocket,
      features: [
        '🏁 Comparativa cara a cara: Cubo MUA (a = cte) vs Cubo MRU (v = cte)',
        '📈 Gráficas cinemáticas en vivo: posición x(t), velocidad v(t) y aceleración a(t)',
        '⏱️ Cronometraje oficial de llegada, telemetría y foto-finish',
        '📝 Logbook y registro histórico persistente de todas las carreras',
      ],
      tagline: 'Analiza el duelo entre velocidad uniforme y aceleración constante.',
    },
    {
      id: 'world3' as const,
      num: '3',
      title: 'Mundo 3: Caída Libre & Resistencia al Aire',
      subtitle: 'Gumball vs Darwin en las Torres de Elmore (Galileo vs Aristóteles)',
      badge: '🍎 CAÍDA LIBRE & DINÁMICA',
      bgImg: bgHouse,
      accentBorder: 'border-amber-400',
      accentBg: 'bg-amber-400',
      accentText: 'text-amber-300',
      glowColor: 'shadow-[8px_8px_0px_#fbbf24]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#00E5FF]',
      btnBg: 'bg-gradient-to-r from-amber-400 to-cyan-400 text-black hover:from-amber-300 hover:to-cyan-300',
      icon: Sparkles,
      features: [
        '🪂 Gumball (5 kg) y Darwin (5 g) lanzados desde alturas de 10 a 150 metros',
        '⚡ Modo Vacío (0 Pa): Caída simultánea sin importar la masa (m·a = m·g)',
        '💨 Modo Con Aire (1 atm): Arrastre de fluidos y velocidad terminal límite MRU',
        '🪐 Entornos gravitacionales: Tierra (9.81), Luna (1.62) y Júpiter (24.79 m/s²)',
      ],
      tagline: 'Demuestra experimentalmente el principio de equivalencia de Galileo.',
    },
    {
      id: 'world4' as const,
      num: '4',
      title: 'Mundo 4: Tiro Parabólico 2D Balístico',
      subtitle: 'Darwin Lanzador de Chicles en el Jardín Botánico de Elmore',
      badge: '🎯 TIRO PARABÓLICO 2D',
      bgImg: bgGarden,
      accentBorder: 'border-emerald-400',
      accentBg: 'bg-emerald-400',
      accentText: 'text-emerald-300',
      glowColor: 'shadow-[8px_8px_0px_#34d399]',
      hoverGlow: 'hover:shadow-[14px_14px_0px_#f43f5e]',
      btnBg: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300',
      icon: Target,
      features: [
        '🍬 Lanzamiento balístico de esfera de chicles con v₀ = 28 m/s a θ = 16.3°',
        '📐 Cinemática 2D desacoplada: MRU en eje X (v_0x) + MUA en eje Y (g = 9.8 m/s²)',
        '🎯 Diana balística en X = 43 metros con altura máxima H_max = 3.3 metros',
        '🎨 Fondo animado del Jardín Botánico, estela de dulces y stickers de celebración',
      ],
      tagline: 'Calcula la trayectoria parabólica y acierta a la diana en Elmore.',
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

            <div>
              <span className="font-black text-lg sm:text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 drop-shadow-[2px_2px_0px_#000]">
                SELECCIÓN DE MUNDOS
              </span>
              <p className="text-[11px] font-mono font-bold text-cyan-300">
                🎨 Multiverso de Física Interactiva — 4 Mundos Didácticos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userProfile ? (
              <div
                onClick={onOpenProfileModal}
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
                onClick={onOpenProfileModal}
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
            <span>EXPLORA LAS 4 DIMENSIONES DE FÍSICA CLÁSICA Y MODERNA</span>
            <Zap className="w-4 h-4 fill-black" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            ELIGE EL MUNDO QUE DESEAS EXPLORAR
          </h2>
          <p className="text-sm font-mono text-amber-200 max-w-2xl mx-auto font-medium">
            Selecciona cualquiera de los mundos a continuación para ingresar directamente a su laboratorio y simulación interactiva.
          </p>
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
                      onClick={() => onSelectWorld(w.id)}
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
              onClick={onGoHome}
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
