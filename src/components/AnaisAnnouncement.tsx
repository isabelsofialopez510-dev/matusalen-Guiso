import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  X, 
  Compass,
  Atom,
  Zap,
  Target,
  Rocket,
  Globe,
  Clock,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import anaisImg from '../assets/images/anais_guide_1787841517089.jpg';
import { sfx } from '../utils/audioEffects';

export type WorldId = 'world1' | 'world2' | 'world3' | 'world4' | 'free';

interface AnaisAnnouncementProps {
  currentWorld: WorldId;
  isPlaying: boolean;
  onSwitchWorld?: (world: WorldId) => void;
  onReplaySimulation?: () => void;
}

interface WorldGuideInfo {
  worldTitle: string;
  subtitle: string;
  badgeColor: string;
  accentColor: string;
  borderColor: string;
  headerBg: string;
  icon: React.ReactNode;
  anaisQuote: string;
  liveStatusText: string;
  explanation: string;
  keyFormulas: { name: string; formula: string; desc: string }[];
  didYouKnow: string;
  quickTips: string[];
}

export const AnaisAnnouncement: React.FC<AnaisAnnouncementProps> = ({
  currentWorld,
  isPlaying,
}) => {
  // Pop-up visibility states
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'formulas' | 'trivia' | 'guide'>('concept');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(9);
  const [autoDismissEnabled, setAutoDismissEnabled] = useState<boolean>(true);

  // Keep track of user interactions and timers
  const prevWorldRef = useRef<WorldId>(currentWorld);
  const prevPlayingRef = useRef<boolean>(isPlaying);
  const autoCloseTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Content registry customized for each world
  const worldData: Record<WorldId, WorldGuideInfo> = {
    world1: {
      worldTitle: 'Mundo 1: Relatividad Especial de Einstein',
      subtitle: 'Dilatación Temporal & Contracción de Lorentz en el Autobús',
      badgeColor: 'bg-yellow-400 text-black',
      accentColor: '#00E5FF',
      borderColor: 'border-yellow-400',
      headerBg: 'bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300',
      icon: <Globe className="w-5 h-5 text-black" />,
      anaisQuote: '¡Cuidado con la velocidad de la luz! Al arrancar el autobús a velocidades relativistas, el tiempo de los pasajeros se dilata y el autobús se contrae.',
      liveStatusText: '¡Autobús en movimiento relativista! Observa cómo se deforma la longitud y el reloj de la parada corre más rápido.',
      explanation:
        'Cuando el autobús se desplaza a velocidad relativista (v cercana a c), para Gumball adentro la pelota solo sube y baja en línea recta vertical. Pero para Darwin en la parada, la pelota recorre una trayectoria parabólica más larga. Como la velocidad de la luz c es constante e insuperable para ambos, el intervalo de tiempo medido en la calle (Δt) es mayor que el tiempo propio adentro (Δt\').',
      keyFormulas: [
        {
          name: 'Factor de Lorentz (γ)',
          formula: 'γ = 1 / √(1 - v² / c²)',
          desc: 'Determina cuánto se dilata el tiempo y se contraen las longitudes.',
        },
        {
          name: 'Dilatación Temporal',
          formula: 'Δt = γ · Δt₀',
          desc: 'El observador en reposo mide más tiempo que el viajero.',
        },
        {
          name: 'Contracción de Longitud',
          formula: 'L = L₀ / γ',
          desc: 'El autobús se acorta en la dirección del movimiento.',
        },
      ],
      didYouKnow:
        'Si viajaras en el autobús al 90% de la velocidad de la luz (0.90c), ¡el tiempo dentro pasaría a menos de la mitad de velocidad (γ ≈ 2.29) que para las personas afuera!',
      quickTips: [
        'Aumenta el deslizador de velocidad (v) a 0.80c o 0.95c para ver cómo se aplasta el autobús.',
        'Observa el cronómetro del pasajero t\' versus el de la parada t.',
        'Usa el botón "Congelar Rastro" para dibujar la curva que ve Darwin.',
      ],
    },

    world2: {
      worldTitle: 'Mundo 2: Pista Didáctica MUA vs MRU',
      subtitle: 'Velocidad Constante frente a la Aceleración Constante',
      badgeColor: 'bg-purple-500 text-white',
      accentColor: '#a855f7',
      borderColor: 'border-purple-500',
      headerBg: 'bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-800',
      icon: <Rocket className="w-5 h-5 text-white" />,
      anaisQuote: '¡Comienza la carrera! El cubo MRU arranca ganando con velocidad fija, ¡pero el cubo MUA acelera con fuerza cuadrática (t²) hasta superarlo!',
      liveStatusText: '¡Pista activa! La aceleración constante hace que la curva de posición del MUA alcance y sobrepase al MRU.',
      explanation:
        'En el Movimiento Rectilíneo Uniforme (MRU), la velocidad permanece constante y la aceleración es 0 (x = v·t). En el Movimiento Uniformemente Acelerado (MUA), la velocidad aumenta de forma lineal y la distancia crece de forma cuadrática (x = v₀t + ½at²). Aunque el cubo MUA empiece desde 0 m/s, siempre superará al MRU si la pista es lo bastante larga.',
      keyFormulas: [
        {
          name: 'Posición MUA',
          formula: 'x(t) = x₀ + v₀·t + ½·a·t²',
          desc: 'Evolución cuadrática de la posición en función del tiempo.',
        },
        {
          name: 'Velocidad MUA',
          formula: 'v(t) = v₀ + a·t',
          desc: 'La velocidad crece proporcionalmente a la aceleración.',
        },
        {
          name: 'Posición MRU',
          formula: 'x(t) = v · t',
          desc: 'Movimiento a velocidad constante sin aceleración.',
        },
      ],
      didYouKnow:
        'Con a = 3 m/s² y v_mru = 12 m/s, el cruce ocurre exactamente a los t = 8 segundos, cuando ambos han recorrido 96 metros. ¡En ese instante, el MUA ya va al doble de velocidad (24 m/s)!',
      quickTips: [
        'Prueba el modo "Carrera Comparativa" para ver el corte animado de la cinta de meta.',
        'Varía la aceleración para ver cómo se adelanta o retrasa el punto de alcance.',
        'Revisa el cronómetro de milésimas y la foto-finish oficial al cruzar la meta.',
      ],
    },

    world3: {
      worldTitle: 'Mundo 3: Caída Libre & Fricción del Aire',
      subtitle: 'El Experimento de Galileo Galilei vs Resistencia Aerodinámica',
      badgeColor: 'bg-amber-400 text-black',
      accentColor: '#fbbf24',
      borderColor: 'border-amber-400',
      headerBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400',
      icon: <Zap className="w-5 h-5 text-black" />,
      anaisQuote: '¡Cuerpos en caída libre! En el aire la moneda frena rápido por su baja masa y arrastre, pero en el vacío caen exactamente iguales.',
      liveStatusText: '¡Objetos cayendo! La resistencia del aire limita la velocidad terminal de la moneda mientras la roca acelera con todo su peso.',
      explanation:
        'Galileo demostró que en ausencia de aire (vacío), una roca pesada y una pluma ligera caen con idéntica aceleración g = 9.8 m/s² y tocan el suelo al mismo tiempo. Sin embargo, en la atmósfera real, la fuerza de arrastre del aire (Fd = ½ρv²CdA) se opone al peso hasta igualarlo, provocando que los objetos ligeros alcancen su velocidad terminal casi al instante.',
      keyFormulas: [
        {
          name: 'Tiempo en Vacío',
          formula: 't = √(2H / g)',
          desc: 'Independiente de la masa del objeto (Galileo Galilei).',
        },
        {
          name: 'Fuerza de Arrastre (Aire)',
          formula: 'Fd = ½ · ρ · v² · Cd · A',
          desc: 'Fricción proporcional al cuadrado de la velocidad.',
        },
        {
          name: 'Velocidad Terminal',
          formula: 'v_term = √(2mg / (ρ·Cd·A))',
          desc: 'Velocidad máxima donde el arrastre iguala exactamente al peso.',
        },
      ],
      didYouKnow:
        '¡La moneda de 5 gramos alcanza su velocidad terminal de ~14 m/s en menos de 0.8 segundos! A partir de ahí, su movimiento cambia de acelerado (MUA) a velocidad constante (MRU).',
      quickTips: [
        'Activa el interruptor "Cámara de Vacío" para comprobar la caída simultánea.',
        'Cambia la gravedad a la Luna (1.62 m/s²) o Júpiter (24.79 m/s²).',
        'Observa la gráfica v(t) en tiempo real para ver la pared de velocidad terminal.',
      ],
    },

    world4: {
      worldTitle: 'Mundo 4: Tiro Parabólico 2D Balístico',
      subtitle: 'Composición de Movimientos & Blanco en la Diana de Darwin',
      badgeColor: 'bg-emerald-400 text-black',
      accentColor: '#34d399',
      borderColor: 'border-emerald-400',
      headerBg: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-green-700',
      icon: <Target className="w-5 h-5 text-white" />,
      anaisQuote: '¡Fuego en el cañón! El tiro parabólico combina velocidad horizontal constante en X con la gravedad vertical en Y.',
      liveStatusText: '¡Proyectil balístico en el aire! Descomposición vectorial: Vx constante y Vy acelerada por gravedad.',
      explanation:
        'Un proyectil lanzado con ángulo θ y velocidad inicial v₀ se descompone en dos ejes ortogonales: en el eje X no hay fuerzas, por lo que viaja en MRU constante (vx = v₀ cosθ); en el eje Y la gravedad actúa con MUA desacelerando la subida hasta vy = 0 en el punto más alto y acelerando la bajada.',
      keyFormulas: [
        {
          name: 'Alcance Máximo Horizontal',
          formula: 'X_max = (v₀² · sin(2θ)) / g',
          desc: 'Distancia total recorrida hasta volver a la altura inicial.',
        },
        {
          name: 'Altura Máxima (Apogeo)',
          formula: 'H_max = (v₀ · sinθ)² / (2g)',
          desc: 'Punto más alto donde la velocidad vertical vy se anula.',
        },
        {
          name: 'Tiempo Total de Vuelo',
          formula: 'T_vuelo = 2 · v₀ · sinθ / g',
          desc: 'Doble del tiempo que tarda en alcanzar la altura máxima.',
        },
      ],
      didYouKnow:
        'Para acertar la diana a 43 metros con v₀ = 28 m/s, el ángulo exacto es 16.3°, alcanzando una altura máxima de 3.3 m y tardando exactamente 1.6 segundos en llegar.',
      quickTips: [
        'Usa el botón "Diana de Darwin (43m)" para cargar el ejercicio calibrado de física.',
        'Observa los vectores verdes (Velocidad) y rojos (Fuerzas) en tiempo real.',
        'Si aciertas en la diana (±2.5m), ¡activarás la fanfarria de confeti y aplausos!',
      ],
    },

    free: {
      worldTitle: 'Mundo Libre: Laboratorio Sandbox de Física de Elmore',
      subtitle: 'Experimentos sin límites: Gravedad Cero, Colisiones N-Cuerpos & Dinámica Libre',
      badgeColor: 'bg-cyan-400 text-black',
      accentColor: '#06b6d4',
      borderColor: 'border-cyan-400',
      headerBg: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white',
      icon: <Sparkles className="w-5 h-5 text-yellow-300" />,
      anaisQuote: '¡Bienvenido a mi Laboratorio Libre! Aquí puedes crear objetos, cambiar la gravedad de 0g a Júpiter, dibujar rampas y experimentar con las 3 leyes de Newton sin restricciones.',
      liveStatusText: '¡Sandbox activo! Arrastra cuerpos con el cursor, genera explosiones y analiza la conservación de energía en tiempo real.',
      explanation:
        'En este laboratorio libre puedes comprobar simultáneamente todos los principios de la mecánica clásica: Conservación del Momento Lineal en colisiones elásticas e inelásticas (P_total = constante), Conservación de la Energía Mecánica (E = Ek + Ep), y la Ley de Gravitación Universal de Newton (F = G·m₁·m₂/r²). Modifica las constantes del universo a tu gusto.',
      keyFormulas: [
        {
          name: 'Conservación del Momento Lineal',
          formula: '∑ m₁·v₁ + m₂·v₂ = cte',
          desc: 'En cualquier colisión aislada, la cantidad de movimiento total se conserva.',
        },
        {
          name: 'Energía Cinética',
          formula: 'Ek = ½ · m · v²',
          desc: 'Energía asociada al movimiento de cada cuerpo según su masa y velocidad.',
        },
        {
          name: 'Gravitación Universal (N-Cuerpos)',
          formula: 'F = G · (m₁ · m₂) / r²',
          desc: 'Atracción gravitacional mutua entre todos los cuerpos del espacio.',
        },
      ],
      didYouKnow:
        '¡En gravedad cero (0 g), los cuerpos en movimiento continúan en línea recta indefinidamente con velocidad constante debido a la Primera Ley de Newton (Inercia), a menos que choquen!',
      quickTips: [
        'Selecciona una entidad (Gumball, Darwin, Roca, etc.) y haz clic en la pantalla para crearla.',
        'Usa la herramienta Slingshot para lanzar objetos con alta velocidad y ángulo.',
        'Prueba los presets: Gravedad Cero espacial, Torneo de Rebotes o Lluvia de Personajes.',
      ],
    },
  };

  const currentInfo = worldData[currentWorld] || worldData.world1;

  // Clear timers helper
  const clearTimers = () => {
    if (autoCloseTimerRef.current) {
      window.clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Trigger popup when simulation is launched or when world changes
  const triggerPopupWithAnimation = (autoDismissSec = 9) => {
    clearTimers();
    sfx.playAnaisPop();
    setIsOpen(true);
    setRemainingTime(autoDismissSec);

    if (autoDismissEnabled) {
      countdownIntervalRef.current = window.setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearTimers();
            sfx.playWhoosh();
            setIsOpen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Watch for simulation state changes (when user handles / plays simulation)
  useEffect(() => {
    if (isPlaying && !prevPlayingRef.current) {
      // User just pressed Play / launched simulation!
      triggerPopupWithAnimation(8);
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Watch for world switcher changes
  useEffect(() => {
    if (currentWorld !== prevWorldRef.current) {
      triggerPopupWithAnimation(10);
      prevWorldRef.current = currentWorld;
    }
  }, [currentWorld]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice narration handler
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      sfx.playLaserPing();
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      sfx.playPop();
    } else {
      clearTimers(); // Don't close while listening
      sfx.playSparkle();
      const textToRead = `Anuncio de física de Anais Watterson. ${currentInfo.worldTitle}. ${currentInfo.anaisQuote}. ${currentInfo.explanation}. Sabías que: ${currentInfo.didYouKnow}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'es-ES';
      utterance.rate = 1.08;
      utterance.pitch = 1.25; // cute pitch for Anais

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const closeAnnouncement = () => {
    sfx.playWhoosh();
    clearTimers();
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. FLOATING QUICK TRIGGER BUTTON (Always available when closed) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerPopupWithAnimation(12);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-yellow-300 hover:bg-yellow-200 text-black border-4 border-black px-4 py-3 rounded-2xl font-black text-xs uppercase shadow-[6px_6px_0px_#000] cursor-pointer group"
          title="Abrir Anuncio de Anais con Información Científica"
        >
          <div className="relative">
            <img
              src={anaisImg}
              alt="Anais Watterson"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-black object-cover group-hover:rotate-12 transition-transform shadow-[2px_2px_0px_#000]"
            />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 border-2 border-black rounded-full animate-ping" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-pink-700 font-mono font-bold">🐰 ¡INFORMACIÓN DE ANAIS!</span>
            <span className="block text-xs font-black">Ver Información Científica</span>
          </div>
        </motion.button>
      )}

      {/* 2. OVERLAY & ANIMATED TRANSIT POP-OUT ANNOUNCEMENT (Enters Left -> Leaves Right) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeAnnouncement();
            }}
          >
            {/* Main Comic Pop-out Modal: Comes from left (-100vw), exits to right (+100vw) */}
            <motion.div 
              className={`w-full max-w-3xl bg-[#0d0926] border-4 sm:border-5 ${currentInfo.borderColor} rounded-3xl shadow-[14px_14px_0px_#000] overflow-hidden text-white flex flex-col relative`}
              initial={{ x: '-120vw', rotate: -6, scale: 0.85, opacity: 0 }}
              animate={{ 
                x: 0, 
                rotate: 0, 
                scale: 1, 
                opacity: 1,
                transition: { 
                  type: 'spring', 
                  damping: 22, 
                  stiffness: 240, 
                  mass: 0.85 
                } 
              }}
              exit={{ 
                x: '120vw', 
                rotate: 6, 
                scale: 0.85, 
                opacity: 0,
                transition: { 
                  duration: 0.45, 
                  ease: [0.32, 0, 0.67, 0] // Accelerating swoop to the right
                } 
              }}
            >
              {/* TOP COLORFUL HEADER */}
              <div className={`${currentInfo.headerBg} p-3.5 sm:p-4 border-b-4 border-black text-black flex items-center justify-between gap-3 relative select-none`}>
                
                {/* Avatar + Title */}
                <div className="flex items-center gap-3">
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => sfx.playBoing()}
                    title="¡Clic en Anais para saltar!"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-3 border-black overflow-hidden shadow-[3px_3px_0px_#000] flex-shrink-0 relative group-hover:scale-105 transition-transform">
                      <img
                        src={anaisImg}
                        alt="Anais Watterson Guía Científica"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-1 bg-pink-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider animate-pulse">
                      🐰 ¡Anais!
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_#000] ${currentInfo.badgeColor} flex items-center gap-1`}>
                        {currentInfo.icon}
                        <span>ANUNCIO DIDÁCTICO</span>
                      </span>

                      {/* Auto-Dismiss Timer Pill */}
                      {autoDismissEnabled && remainingTime > 0 && (
                        <span className="text-[10px] font-mono font-bold bg-black/80 text-yellow-300 px-2 py-0.5 rounded border border-yellow-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-yellow-400 animate-spin" />
                          <span>Desaparece en {remainingTime}s ➔</span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-black text-base sm:text-xl text-black tracking-tight mt-1 leading-tight">
                      {currentInfo.worldTitle}
                    </h2>
                    <p className="text-xs font-bold text-black/90 font-mono hidden sm:block">
                      {currentInfo.subtitle}
                    </p>
                  </div>
                </div>

                {/* Action Tools */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Voice speech */}
                  <button
                    onClick={handleToggleSpeech}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-white hover:bg-yellow-100 text-black'
                    }`}
                    title={isSpeaking ? 'Detener Voz' : 'Escuchar Explicación con Voz'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="hidden md:inline">{isSpeaking ? 'Detener' : '🔊 Voz'}</span>
                  </button>

                  {/* Close Button (Launches Exit Animation to right) */}
                  <button
                    onClick={closeAnnouncement}
                    className="p-2 bg-pink-500 hover:bg-pink-600 text-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:scale-105 active:scale-95"
                    title="Cerrar y Desaparecer Anuncio"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* LIVE SIMULATION BUBBLE ALERT */}
              <div className="bg-[#171336] p-3 sm:p-4 border-b-2 border-purple-500/40 flex items-start gap-3">
                <div className="p-2 bg-pink-500/20 border border-pink-400 rounded-xl text-pink-300 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs sm:text-sm font-sans font-bold text-pink-200 leading-relaxed italic">
                    &ldquo;{currentInfo.anaisQuote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 flex-wrap gap-2">
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      {currentInfo.liveStatusText}
                    </span>

                    <label className="flex items-center gap-1 text-[10px] text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoDismissEnabled}
                        onChange={(e) => {
                          setAutoDismissEnabled(e.target.checked);
                          if (!e.target.checked) clearTimers();
                        }}
                        className="rounded border-gray-600 accent-pink-500"
                      />
                      <span>Auto-ocultar</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SCIENTIFIC INFORMATION BODY */}
              <div className="p-4 sm:p-5 space-y-4 bg-[#0d0926]/95 overflow-y-auto max-h-[55vh]">
                
                {/* TABS (ONLY PURE INFORMATION) */}
                <div className="flex flex-wrap items-center gap-2 border-b-2 border-purple-900/60 pb-2.5">
                  <button
                    onClick={() => { sfx.playPop(); setActiveTab('concept'); }}
                    className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] ${
                      activeTab === 'concept'
                        ? 'bg-yellow-400 text-black border-black scale-105'
                        : 'bg-[#1b173d] text-purple-200 border-purple-800 hover:bg-[#252054]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>1. Explicación Física</span>
                  </button>

                  <button
                    onClick={() => { sfx.playPop(); setActiveTab('formulas'); }}
                    className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] ${
                      activeTab === 'formulas'
                        ? 'bg-cyan-400 text-black border-black scale-105'
                        : 'bg-[#1b173d] text-purple-200 border-purple-800 hover:bg-[#252054]'
                    }`}
                  >
                    <Atom className="w-3.5 h-3.5" />
                    <span>2. Fórmulas</span>
                  </button>

                  <button
                    onClick={() => { sfx.playPop(); setActiveTab('trivia'); }}
                    className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] ${
                      activeTab === 'trivia'
                        ? 'bg-pink-500 text-white border-black scale-105'
                        : 'bg-[#1b173d] text-purple-200 border-purple-800 hover:bg-[#252054]'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>3. ¿Sabías Qué?</span>
                  </button>

                  <button
                    onClick={() => { sfx.playPop(); setActiveTab('guide'); }}
                    className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] ${
                      activeTab === 'guide'
                        ? 'bg-emerald-400 text-black border-black scale-105'
                        : 'bg-[#1b173d] text-purple-200 border-purple-800 hover:bg-[#252054]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>4. Guía de Pasos</span>
                  </button>
                </div>

                {/* TAB 1: CONCEPT */}
                {activeTab === 'concept' && (
                  <div className="space-y-3 font-mono">
                    <div className="bg-[#171336] p-4 sm:p-5 rounded-2xl border-2 border-purple-500/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <h3 className="text-xs sm:text-sm font-black text-yellow-300 uppercase flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                          ¿Qué está ocurriendo en esta simulación?
                        </h3>
                        <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded border border-purple-400 font-bold hidden sm:inline-block">
                          {currentInfo.subtitle}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        {currentInfo.explanation}
                      </p>
                      <div className="p-3 bg-[#0d0a21] border border-cyan-500/30 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">🎓</span>
                        <p className="text-[11px] sm:text-xs text-cyan-200 font-sans">
                          <strong>Conclusión Científica de Anais:</strong> Las leyes de este movimiento se verifican matemáticamente en los paneles de telemetría y gráficos en tiempo real.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FORMULAS */}
                {activeTab === 'formulas' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    {currentInfo.keyFormulas.map((f, i) => (
                      <div
                        key={`form-${i}`}
                        className="p-3.5 bg-[#171336] border-2 border-cyan-400/60 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
                            <span className="text-[11px] font-black text-cyan-300 uppercase">
                              {f.name}
                            </span>
                            <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-black">
                              #{i + 1}
                            </span>
                          </div>
                          <div className="my-2 p-2 bg-[#0a071d] rounded-xl border border-cyan-400/40 text-center">
                            <code className="text-xs sm:text-sm font-black text-yellow-300 font-mono tracking-wider">
                              {f.formula}
                            </code>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: TRIVIA */}
                {activeTab === 'trivia' && (
                  <div className="p-4 bg-gradient-to-r from-pink-950/60 via-[#171336] to-purple-950/60 border-2 border-pink-500/60 rounded-2xl shadow-[3px_3px_0px_#000] space-y-2.5 font-mono">
                    <div className="flex items-center gap-2 text-pink-300 font-black text-xs uppercase">
                      <Lightbulb className="w-4 h-4 text-yellow-300 animate-bounce" />
                      <span>Dato Curioso con Anais:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-sans text-pink-100 font-medium leading-relaxed bg-[#0d0926]/60 p-3.5 rounded-xl border border-pink-400/30">
                      {currentInfo.didYouKnow}
                    </p>
                  </div>
                )}

                {/* TAB 4: LAB GUIDE */}
                {activeTab === 'guide' && (
                  <div className="p-4 bg-[#171336] border-2 border-emerald-500/60 rounded-2xl shadow-[3px_3px_0px_#000] space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                      <span className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        Pasos para experimentar en este simulador:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {currentInfo.quickTips.map((tip, idx) => (
                        <div
                          key={`tip-${idx}`}
                          className="p-2.5 bg-[#0d0926] border border-emerald-500/40 rounded-xl flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-400 text-black font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-[11px] font-sans text-slate-200 leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* FOOTER BAR */}
              <div className="bg-[#0b0821] p-3 border-t-2 border-purple-900/80 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-purple-300 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Simulador de Física de Elmore</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={closeAnnouncement}
                    className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] uppercase text-[11px] cursor-pointer transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  >
                    <span>Entendido</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
