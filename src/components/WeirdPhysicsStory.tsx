import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Eye,
  Flame,
  LayoutGrid,
  ChevronRight,
  Award,
  Play,
  Volume2,
  VolumeX,
  User,
  Home,
  Maximize2,
  Minimize2,
  Sliders,
  Compass,
  Atom
} from 'lucide-react';
import introArt from '../assets/images/psychedelic_physics_intro_1787923937586.jpg';
import { PixelGumball, PixelDarwin, PixelAnais, PixelPenny } from './PixelCharacters';
import { CelestialAngelSVG, BuzzGazingAngelSVG, OphanimEyeWheelSVG } from './CelestialAngels';
import { sfx } from '../utils/audioEffects';

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  topic: string;
  character: string;
  icon: string;
  themeColor: string;
  bgGradient: string;
  dialogues: {
    speaker: string;
    avatar: 'alien_eye' | 'gumball' | 'darwin' | 'anais' | 'angel' | 'buzz' | 'penny';
    text: string;
    note?: string;
  }[];
  gizmoType: 'vectors' | 'lorentz' | 'drag' | 'ballistics' | 'gravity';
  challenge: {
    question: string;
    formula?: string;
    options: {
      text: string;
      isCorrect: boolean;
      explanation: string;
    }[];
  };
  simulationWorldTarget: 'world1' | 'world2' | 'world3' | 'world4' | 'world5';
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'Capítulo 1: El Ojo Que Todo Lo Ve y la Ilusión del Movimiento',
    subtitle: 'Relatividad de Galileo y Marcos de Referencia',
    topic: 'Cinemática Relativista 1D vs 2D',
    character: 'El Observador Cósmico & Gumball',
    icon: '👁️',
    themeColor: 'from-amber-400 to-yellow-500',
    bgGradient: 'from-[#18042b] via-[#2f084a] to-[#0d021c]',
    gizmoType: 'vectors',
    dialogues: [
      {
        speaker: 'Ente Cuántico (Observador Cósmico)',
        avatar: 'alien_eye',
        text: '¡Saludos, mortal curioso! Mis múltiples ojos ven simultáneamente todas las dimensiones. Te revelaré el primer gran misterio de la física: EL MOVIMIENTO ABSOLUTO NO EXISTE.',
        note: 'Principio de Relatividad Clásica',
      },
      {
        speaker: 'Gumball',
        avatar: 'gumball',
        text: '¡Oye! Yo voy dentro del autobús escolar lanzando una pelota hacia arriba. Sube y baja en una línea vertical 1D perfecta frente a mis ojos. ¡Es lo más simple del mundo!',
      },
      {
        speaker: 'Darwin',
        avatar: 'darwin',
        text: '¡Pero Gumball! Yo estoy afuera parado en la estación de Elmore viendo pasar tu autobús a 15 m/s... ¡Para mí, la pelota describe una PARÁBOLA COMPUESTA 2D gigante cruzando toda la calle!',
      },
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: '¡Ambos tienen razón! La velocidad de la pelota según Darwin es la suma vectorial: v_total = v_autobús (eje x) + v_lanzamiento (eje y). Las leyes de la física son idénticas en todos los marcos inerciales.',
      },
    ],
    challenge: {
      question: 'Si el autobús viaja a 15 m/s hacia la derecha y Gumball lanza la pelota verticalmente hacia arriba a 15 m/s, ¿cuál es la velocidad total (magnitud) que observa Darwin desde la estación fija?',
      formula: 'v = √(v_x² + v_y²)',
      options: [
        {
          text: 'v = 15.0 m/s (la velocidad del bus anula el tiro)',
          isCorrect: false,
          explanation: '¡Incorrecto! Las componentes en los ejes X e Y son ortogonales y se suman mediante el teorema de Pitágoras.',
        },
        {
          text: 'v = √(15² + 15²) = √450 ≈ 21.21 m/s en ángulo de 45°',
          isCorrect: true,
          explanation: '¡CORRECTO! Los vectores perpendiculares v_x y v_y se combinan dando una resultante de 21.21 m/s inclinada a 45°.',
        },
        {
          text: 'v = 30.0 m/s (suma aritmética simple 15 + 15)',
          isCorrect: false,
          explanation: '¡Incorrecto! No puedes sumar escalares cuando las direcciones son perpendiculares.',
        },
      ],
    },
    simulationWorldTarget: 'world1',
  },
  {
    id: 2,
    title: 'Capítulo 2: La Carrera Imposible contra la Velocidad de la Luz',
    subtitle: 'MUA, MRU y la Barrera de Einstein',
    topic: 'Aceleración vs Límite Cósmico',
    character: 'Anais y el Taquión Fantasma',
    icon: '⚡',
    themeColor: 'from-pink-500 to-purple-600',
    bgGradient: 'from-[#2b031c] via-[#4a0833] to-[#12010c]',
    gizmoType: 'lorentz',
    dialogues: [
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: 'En el Mundo 2 competimos en una pista recta: un cuerpo con Movimiento Rectilíneo Uniforme (MRU a v = cte) contra uno con Movimiento Uniformemente Acelerado (MUA a a = cte).',
      },
      {
        speaker: 'Ente Cuántico (Observador Cósmico)',
        avatar: 'alien_eye',
        text: 'En la física de Newton clásica, si aceleras sin parar a = 100 m/s², ¡creerías que puedes superar la velocidad de la luz! Pero mis ojos ven que el espacio se comprime y tu masa inercial se dispara a infinito.',
        note: 'Factor de Lorentz: γ = 1 / √(1 - v²/c²)',
      },
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: 'Exacto: la energía requerida para acelerar una masa hasta c es infinita. Por eso ningún objeto con masa puede superar los 299,792,458 m/s en el vacío.',
      },
    ],
    challenge: {
      question: 'En un corredor rectilíneo de L = 100 m, si un corredor parte del reposo (v₀ = 0) con aceleración constante a = 2 m/s² (MUA), ¿cuánto tiempo tarda en llegar a la meta?',
      formula: 'x = ½ · a · t²  ⟹  t = √(2x / a)',
      options: [
        {
          text: 't = 10.0 segundos exactos (v_final = 20 m/s)',
          isCorrect: true,
          explanation: '¡EXCELENTE! t = √(2 · 100 / 2) = √100 = 10 segundos. La velocidad final al cruzar la meta es v = a · t = 20 m/s.',
        },
        {
          text: 't = 50.0 segundos',
          isCorrect: false,
          explanation: '¡Incorrecto! Has dividido 100 / 2 sin aplicar la fórmula cuadrática de aceleración x = ½at².',
        },
        {
          text: 't = 5.0 segundos',
          isCorrect: false,
          explanation: '¡Incorrecto! En 5 segundos sólo habría recorrido x = ½(2)(25) = 25 metros.',
        },
      ],
    },
    simulationWorldTarget: 'world2',
  },
  {
    id: 3,
    title: 'Capítulo 3: El Monstruo del Aire y la Gravedad de Galileo',
    subtitle: 'Caída Libre con Rozamiento y Velocidad Terminal',
    topic: 'Fuerza de Arrastre Aerodinámico',
    character: 'Darwin en la Torre de Caída',
    icon: '🪂',
    themeColor: 'from-orange-500 to-amber-600',
    bgGradient: 'from-[#2b1003] via-[#4a1c08] to-[#120501]',
    gizmoType: 'drag',
    dialogues: [
      {
        speaker: 'Darwin',
        avatar: 'darwin',
        text: '¡Galileo Galilei demostró en Pisa que si soltamos un yunque y una pluma en el vacío, ambos tocan el suelo al MISMO tiempo! La aceleración g = 9.8 m/s² no depende de la masa.',
      },
      {
        speaker: 'Ente Cuántico (Observador Cósmico)',
        avatar: 'alien_eye',
        text: '¡Pero el planeta Tierra no es el vacío! El aire es un fluido de billones de moléculas que chocan contra el cuerpo que cae, generando una fuerza de arrastre opuesta F_drag = ½ · ρ · C_d · A · v².',
      },
      {
        speaker: 'Darwin',
        avatar: 'darwin',
        text: 'Cuando el peso F_g = m·g se iguala exactamente con la fuerza de arrastre F_drag, la aceleración se hace CERO (a = 0) y el cuerpo alcanza su VELOCIDAD TERMINAL constante.',
      },
    ],
    challenge: {
      question: '¿Qué ocurre cuando un paracaidista abre su paracaídas y alcanza la velocidad terminal?',
      formula: 'ΣF = m·g - F_drag = 0  ⟹  a = 0',
      options: [
        {
          text: 'La gravedad deja de actuar y flota sin caer',
          isCorrect: false,
          explanation: '¡Incorrecto! La gravedad sigue atrayéndolo, pero la fuerza del aire la compensa exactamente.',
        },
        {
          text: 'La fuerza neta es cero (ΣF = 0) y desciende a velocidad constante (MRU)',
          isCorrect: true,
          explanation: '¡PERFECTO! Al equilibrarse el peso y la resistencia del aire, la aceleración es 0 y continúa con velocidad constante.',
        },
        {
          text: 'Acelera indefinidamente hasta estrellarse',
          isCorrect: false,
          explanation: '¡Incorrecto! La velocidad terminal es el límite de velocidad máxima.',
        },
      ],
    },
    simulationWorldTarget: 'world3',
  },
  {
    id: 4,
    title: 'Capítulo 4: El Vuelo del Maní y el Tiro Parabólico Óptimo',
    subtitle: 'Descomposición 2D en el Jardín Verde',
    topic: 'Alcance Máximo y Altura de Vuelo',
    character: 'Penny y la Balística',
    icon: '🎯',
    themeColor: 'from-emerald-400 to-teal-600',
    bgGradient: 'from-[#032616] via-[#08452a] to-[#01140a]',
    gizmoType: 'ballistics',
    dialogues: [
      {
        speaker: 'Penny',
        avatar: 'penny',
        text: 'En el Jardín Verde (Mundo 4), lanzamos proyectiles balísticos con ángulo θ y velocidad inicial v₀. El movimiento en X es MRU (v_x = v₀·cos θ = cte) y en Y es MUA (v_y = v₀·sin θ - g·t).',
      },
      {
        speaker: 'Ente Cuántico (Observador Cósmico)',
        avatar: 'alien_eye',
        text: 'En la altura máxima del vuelo H_max, la velocidad vertical se anula por una fracción de segundo (v_y = 0), pero la velocidad horizontal v_x NUNCA desaparece.',
      },
    ],
    challenge: {
      question: 'En ausencia de fricción del aire, ¿cuál es el ángulo de lanzamiento ideal θ que maximiza el alcance horizontal X_max de un proyectil?',
      formula: 'X = (v₀² · sin(2θ)) / g',
      options: [
        {
          text: 'θ = 90° (tiro completamente vertical)',
          isCorrect: false,
          explanation: '¡Incorrecto! Con 90° sube muy alto pero el alcance horizontal es cero (sin(180°) = 0).',
        },
        {
          text: 'θ = 45° (donde sin(2 · 45°) = sin(90°) = 1, máximo absoluto)',
          isCorrect: true,
          explanation: '¡EXCELENTE! Como la función seno alcanza su valor máximo de 1 en 90°, el ángulo óptimo para máximo alcance es θ = 45°.',
        },
        {
          text: 'θ = 30°',
          isCorrect: false,
          explanation: '¡Incorrecto! Aunque tiene buena velocidad horizontal, cae demasiado rápido.',
        },
      ],
    },
    simulationWorldTarget: 'world4',
  },
  {
    id: 5,
    title: 'Capítulo 5: El Reino de los Cielos y el Ojo Serafín Cuántico',
    subtitle: 'Gravedad Mutua, Agujeros Negros y el Sandbox Multiversal',
    topic: 'Física N-Cuerpos y Fuerzas Universales',
    character: 'Serafín Sagrado & Buzz en el Firmamento',
    icon: '👼',
    themeColor: 'from-amber-300 via-yellow-400 to-amber-600',
    bgGradient: 'from-[#1c082b] via-[#3d0f59] to-[#69211c]',
    gizmoType: 'gravity',
    dialogues: [
      {
        speaker: 'Serafín Sagrado de Múltiples Ojos',
        avatar: 'angel',
        text: '¡HE AQUÍ EL FIRMAMENTO SAGRADO! En este nivel multiversal, todos los cuerpos masivos se atraen mutuamente mediante la ley de gravitación universal de Newton F = G · M · m / r².',
      },
      {
        speaker: 'Buzz Mirando al Ángel',
        avatar: 'buzz',
        text: '¡Al infinito y más allá! Mis propulsores no pueden competir con la curvatura del espacio-tiempo cerca de un Agujero Negro hipermasivo. La velocidad de escape supera a la de la luz.',
      },
      {
        speaker: 'Ente Cuántico (Observador Cósmico)',
        avatar: 'alien_eye',
        text: '¡Ahora el poder del Universo está en tus manos! En el Sandbox Libre puedes alterar la gravedad, la densidad del aire, las cargas electrostáticas (F = k·q₁·q₂/r²) y crear tu propio cosmos.',
      },
    ],
    challenge: {
      question: 'Si duplicas la distancia r entre dos cuerpos celestes gravitacionales (r ➔ 2r), ¿qué le ocurre a la fuerza de atracción F entre ellos?',
      formula: 'F = G · (m₁ · m₂) / r²',
      options: [
        {
          text: 'Se reduce a la cuarta parte (F / 4)',
          isCorrect: true,
          explanation: '¡BRILIANTE! Al estar la distancia elevada al cuadrado en el denominador (1 / (2r)² = 1 / 4r²), la fuerza cae a la cuarta parte según la ley del inverso del cuadrado.',
        },
        {
          text: 'Se reduce a la mitad (F / 2)',
          isCorrect: false,
          explanation: '¡Incorrecto! La gravedad disminuye con el cuadrado de la distancia, no linealmente.',
        },
        {
          text: 'Se duplica (2F)',
          isCorrect: false,
          explanation: '¡Incorrecto! Al alejar los cuerpos la atracción siempre disminuye.',
        },
      ],
    },
    simulationWorldTarget: 'world5',
  },
];

interface WeirdPhysicsStoryProps {
  onGoHome: () => void;
  onOpenWorld: (world: 'world1' | 'world2' | 'world3' | 'world4' | 'world5') => void;
  userProfile: { name: string; age: string; grade: string } | null;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const WeirdPhysicsStory: React.FC<WeirdPhysicsStoryProps> = ({
  onGoHome,
  onOpenWorld,
  userProfile,
  isMuted,
  onToggleSound,
}) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [showChallenge, setShowChallenge] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive Gizmo States
  const [gizmoVx, setGizmoVx] = useState<number>(15);
  const [gizmoVy, setGizmoVy] = useState<number>(15);
  const [gizmoBeta, setGizmoBeta] = useState<number>(0.8);
  const [gizmoAngle, setGizmoAngle] = useState<number>(45);
  const [gizmoDist, setGizmoDist] = useState<number>(2);

  const chapter = CHAPTERS[currentChapterIdx];

  // Monitor Fullscreen
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

  const handleNextDialogue = () => {
    sfx.playPop(500);
    if (currentDialogueIdx < chapter.dialogues.length - 1) {
      setCurrentDialogueIdx((prev) => prev + 1);
    } else {
      setShowChallenge(true);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (answeredCorrectly !== null) return;
    setSelectedOption(idx);
    const isCorrect = chapter.challenge.options[idx].isCorrect;
    setAnsweredCorrectly(isCorrect);

    if (isCorrect) {
      sfx.playFanfare();
      setUserScore((prev) => prev + 100);
      if (!completedChapters.includes(chapter.id)) {
        setCompletedChapters((prev) => [...prev, chapter.id]);
      }
    } else {
      sfx.playBoing();
    }
  };

  const handleNextChapter = () => {
    sfx.playWarpWhoosh();
    if (currentChapterIdx < CHAPTERS.length - 1) {
      setCurrentChapterIdx((prev) => prev + 1);
      setCurrentDialogueIdx(0);
      setSelectedOption(null);
      setAnsweredCorrectly(null);
      setShowChallenge(false);
    }
  };

  const handleSelectChapterFromList = (idx: number) => {
    sfx.playPop();
    setCurrentChapterIdx(idx);
    setCurrentDialogueIdx(0);
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setShowChallenge(false);
  };

  // Render Interactive Gizmo depending on Chapter
  const renderInteractiveGizmo = () => {
    switch (chapter.gizmoType) {
      case 'vectors': {
        const vTot = Math.sqrt(gizmoVx * gizmoVx + gizmoVy * gizmoVy);
        return (
          <div className="bg-[#0b031c] border-2 border-yellow-400 p-3 rounded-2xl space-y-2 mt-3 text-xs">
            <span className="text-yellow-300 font-black block uppercase flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>GIZMO 1: COMPOSICIÓN VECTORIAL 2D</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-sky-300 block">Vel. Autobús Vx: {gizmoVx} m/s</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={gizmoVx}
                  onChange={(e) => setGizmoVx(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-pink-300 block">Vel. Tiro Vy: {gizmoVy} m/s</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={gizmoVy}
                  onChange={(e) => setGizmoVy(Number(e.target.value))}
                  className="w-full accent-pink-400"
                />
              </div>
            </div>
            <div className="bg-black/60 p-2 rounded-xl text-center font-bold text-amber-300 border border-purple-800">
              Resultante: <strong className="text-emerald-400 text-sm">{vTot.toFixed(2)} m/s</strong> (Ángulo: {(Math.atan2(gizmoVy, gizmoVx || 0.001) * (180 / Math.PI)).toFixed(1)}°)
            </div>
          </div>
        );
      }
      case 'lorentz': {
        const lorentz = 1 / Math.sqrt(Math.max(0.0001, 1 - gizmoBeta * gizmoBeta));
        return (
          <div className="bg-[#0b031c] border-2 border-pink-500 p-3 rounded-2xl space-y-2 mt-3 text-xs">
            <span className="text-pink-300 font-black block uppercase flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>GIZMO 2: FACTOR DE DILATACIÓN γ (LORENTZ)</span>
            </span>
            <div>
              <label className="text-[10px] text-cyan-300 block">Velocidad Relativa v/c: {(gizmoBeta * 100).toFixed(0)}% de c</label>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={gizmoBeta}
                onChange={(e) => setGizmoBeta(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
            <div className="bg-black/60 p-2 rounded-xl text-center font-bold text-amber-300 border border-purple-800">
              Factor γ: <strong className="text-yellow-300 text-sm">{lorentz.toFixed(3)}x</strong> (El tiempo para el bus pasa {lorentz.toFixed(2)}x más lento)
            </div>
          </div>
        );
      }
      case 'ballistics': {
        const range = (25 * 25 * Math.sin((2 * gizmoAngle * Math.PI) / 180)) / 9.8;
        return (
          <div className="bg-[#0b031c] border-2 border-emerald-400 p-3 rounded-2xl space-y-2 mt-3 text-xs">
            <span className="text-emerald-300 font-black block uppercase flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>GIZMO 4: CALCULADOR DE ÁNGULO BALÍSTICO</span>
            </span>
            <div>
              <label className="text-[10px] text-amber-300 block">Ángulo θ de Disparo: {gizmoAngle}° (v₀ = 25 m/s)</label>
              <input
                type="range"
                min="5"
                max="85"
                value={gizmoAngle}
                onChange={(e) => setGizmoAngle(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
            <div className="bg-black/60 p-2 rounded-xl text-center font-bold text-amber-300 border border-purple-800">
              Alcance Máximo X: <strong className="text-cyan-300 text-sm">{range.toFixed(1)} metros</strong> {gizmoAngle === 45 && '🌟 ¡ÓPTIMO MÁXIMO!'}
            </div>
          </div>
        );
      }
      case 'gravity': {
        const forceFraction = 1 / (gizmoDist * gizmoDist);
        return (
          <div className="bg-[#0b031c] border-2 border-amber-400 p-3 rounded-2xl space-y-2 mt-3 text-xs">
            <span className="text-amber-300 font-black block uppercase flex items-center gap-1">
              <Atom className="w-3.5 h-3.5" />
              <span>GIZMO 5: LEY DEL INVERSO DEL CUADRADO</span>
            </span>
            <div>
              <label className="text-[10px] text-pink-300 block">Distancia Relativa: {gizmoDist}x radio orbital</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={gizmoDist}
                onChange={(e) => setGizmoDist(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
            <div className="bg-black/60 p-2 rounded-xl text-center font-bold text-amber-300 border border-purple-800">
              Fuerza de Atracción: <strong className="text-yellow-300 text-sm">{(forceFraction * 100).toFixed(1)}%</strong> de F₀
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080214] text-white flex flex-col justify-between p-3 sm:p-5 md:p-6 font-mono relative overflow-hidden select-none">
      
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${chapter.bgGradient} opacity-90 transition-all duration-700 pointer-events-none`} />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-30 w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 p-3 bg-[#13072b]/90 border-3 border-amber-400 rounded-3xl shadow-[5px_5px_0px_#000] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sfx.playPop();
              onGoHome();
            }}
            className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer rotate-[-1deg]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>PORTADA</span>
          </button>

          <button
            onClick={() => {
              sfx.playPop();
              onOpenWorld('world1');
            }}
            className="px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer rotate-[1deg]"
            title="Ir a los Simuladores y 4 Mundos"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">🎮 SIMULADORES</span>
          </button>

          <button
            onClick={() => {
              sfx.playLaser(1400);
              onOpenWorld('world5');
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black font-black text-xs uppercase rounded-xl border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
            title="Ir a Mundo Libre: Parque de Diversiones"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">🎡 PARQUE LIBRE</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
              <span>📖 HISTORIA RARA DE LA FÍSICA</span>
            </span>
          </div>
        </div>

        {/* Score & Profile & Tools */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-xl border border-yellow-400/80 text-xs font-bold text-yellow-300">
            <Award className="w-4 h-4 text-yellow-400 animate-bounce" />
            <span>XP: {userScore}</span>
          </div>

          {userProfile && (
            <div className="hidden sm:flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-xl border border-pink-400/80 text-xs font-bold text-pink-200">
              <User className="w-3.5 h-3.5" />
              <span>{userProfile.name}</span>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1 rounded-xl border-2 font-black text-xs uppercase flex items-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
              isFullscreen
                ? 'bg-amber-400 text-black border-black hover:bg-yellow-300'
                : 'bg-slate-800 text-amber-200 border-amber-400 hover:bg-slate-700'
            }`}
            title="Pantalla Completa (Tecla F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'SALIR FULL' : 'FULL'}</span>
          </button>

          <button
            onClick={() => {
              sfx.playPop();
              onToggleSound();
            }}
            className={`px-2.5 py-1 rounded-xl border-2 font-black text-xs uppercase flex items-center gap-1 cursor-pointer ${
              isMuted ? 'bg-red-600 text-white' : 'bg-emerald-400 text-black'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
          </button>
        </div>
      </header>

      {/* Chapter Selection Pill Bar */}
      <div className="relative z-30 w-full max-w-7xl mx-auto my-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CHAPTERS.map((ch, idx) => {
          const isCurrent = currentChapterIdx === idx;
          const isDone = completedChapters.includes(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() => handleSelectChapterFromList(idx)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-2xl border-2 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                isCurrent
                  ? 'bg-amber-400 text-black border-black font-black scale-105 shadow-[4px_4px_0px_#000]'
                  : isDone
                    ? 'bg-emerald-600/90 text-white border-emerald-400 hover:bg-emerald-500'
                    : 'bg-[#15072e]/90 text-slate-300 border-purple-800 hover:bg-purple-900/60'
              }`}
            >
              <span>{ch.icon}</span>
              <span>Capítulo {ch.id}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Main Chapter Content Stage */}
      <main className="relative z-30 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Visual Story Artwork & Interactive Mini-Gizmo */}
        <div className="lg:col-span-5 flex flex-col bg-[#13072b]/90 border-4 border-amber-400 rounded-3xl p-5 shadow-[8px_8px_0px_#000] backdrop-blur-md relative overflow-hidden">
          {/* Chapter Badge */}
          <div className="w-full flex items-center justify-between mb-3 text-xs font-black text-amber-300">
            <span className="bg-black/70 px-2.5 py-0.5 rounded-xl border border-amber-400/50">
              EXPEDIENTE {chapter.id} / 5
            </span>
            <span className="text-pink-300 font-bold">{chapter.topic}</span>
          </div>

          {/* Visual Hero */}
          <div className="relative w-full aspect-video bg-[#090214] border-3 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] flex items-center justify-center">
            {chapter.id === 5 ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 relative bg-gradient-to-b from-[#2a0845] to-[#641d1a]">
                <div className="animate-pulse">
                  <CelestialAngelSVG size={100} glow={true} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <BuzzGazingAngelSVG size={45} />
                  <OphanimEyeWheelSVG size={35} className="animate-spin" />
                </div>
              </div>
            ) : (
              <img
                src={introArt}
                alt="Ente Cósmico Cuántico"
                className="w-full h-full object-cover filter contrast-110"
              />
            )}

            <div className="absolute top-2 right-2 bg-black/80 px-2.5 py-0.5 rounded-lg border border-yellow-400 text-[10px] font-black text-yellow-300 flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>OJO CUÁNTICO</span>
            </div>
          </div>

          {/* Mini Interactive Physics Gizmo */}
          {renderInteractiveGizmo()}

          {/* Direct Warp to Live Simulation World */}
          <button
            onClick={() => {
              sfx.playWarpWhoosh();
              onOpenWorld(chapter.simulationWorldTarget);
            }}
            className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 border-3 border-black text-black font-black text-xs sm:text-sm uppercase rounded-2xl shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#FF007F] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>PROBAR EN EL SIMULADOR VIVO (MUNDO {chapter.id})</span>
          </button>
        </div>

        {/* Right Column: Dialogue Box or Challenge Card */}
        <div className="lg:col-span-7 bg-[#13072b]/95 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#000] backdrop-blur-md flex flex-col justify-between min-h-[420px]">
          
          {/* Header Title */}
          <div className="border-b-2 border-purple-800 pb-3 mb-4">
            <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400">
              {chapter.title}
            </h2>
            <p className="text-xs text-amber-200 font-bold mt-0.5">
              {chapter.subtitle}
            </p>
          </div>

          {/* Section A: Dialogue Mode */}
          {!showChallenge ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Speaker Avatar Tag */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500 border-2 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#000]">
                    {chapter.dialogues[currentDialogueIdx].avatar === 'alien_eye'
                      ? '👁️'
                      : chapter.dialogues[currentDialogueIdx].avatar === 'gumball'
                        ? '🐱'
                        : chapter.dialogues[currentDialogueIdx].avatar === 'darwin'
                          ? '🐟'
                          : chapter.dialogues[currentDialogueIdx].avatar === 'anais'
                            ? '🐰'
                            : chapter.dialogues[currentDialogueIdx].avatar === 'penny'
                              ? '🥜'
                              : chapter.dialogues[currentDialogueIdx].avatar === 'angel'
                                ? '👼'
                                : '👨‍🚀'}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-black text-yellow-300 uppercase">
                      {chapter.dialogues[currentDialogueIdx].speaker}
                    </span>
                    {chapter.dialogues[currentDialogueIdx].note && (
                      <span className="text-[10px] text-cyan-300 font-bold">
                        ✦ {chapter.dialogues[currentDialogueIdx].note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated Speech Bubble */}
                <div className="p-4 sm:p-5 bg-[#0a0319] border-3 border-purple-600 rounded-2xl text-slate-100 text-sm sm:text-base leading-relaxed shadow-[4px_4px_0px_#000]">
                  «{chapter.dialogues[currentDialogueIdx].text}»
                </div>
              </div>

              {/* Progress Dots & Next Button */}
              <div className="flex items-center justify-between pt-4 border-t border-purple-900">
                <div className="flex items-center gap-1.5">
                  {chapter.dialogues.map((_, dIdx) => (
                    <span
                      key={`dot-${dIdx}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        currentDialogueIdx === dIdx
                          ? 'bg-amber-400 w-6'
                          : currentDialogueIdx > dIdx
                            ? 'bg-emerald-400'
                            : 'bg-purple-900'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextDialogue}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>
                    {currentDialogueIdx < chapter.dialogues.length - 1 ? 'CONTINUAR LEYENDO' : '¡RESOLVER ENIGMA!'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Section B: Challenge Mode (Physics Enigma) */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-yellow-400 border-2 border-black rounded-full text-black font-black text-[11px] uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>DESAFÍO DE FÍSICA CUÁNTICA</span>
                </div>

                <p className="text-sm sm:text-base font-black text-yellow-100">
                  {chapter.challenge.question}
                </p>

                {chapter.challenge.formula && (
                  <div className="my-2 p-2.5 bg-[#090217] border border-cyan-400 rounded-xl text-cyan-300 text-xs font-mono font-bold text-center">
                    Fórmula Guía: <strong>{chapter.challenge.formula}</strong>
                  </div>
                )}

                {/* Option Buttons */}
                <div className="space-y-2 mt-3">
                  {chapter.challenge.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    return (
                      <button
                        key={`opt-${oIdx}`}
                        disabled={answeredCorrectly !== null}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full text-left p-3 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          isSelected
                            ? opt.isCorrect
                              ? 'bg-emerald-500 text-black border-black font-black shadow-[3px_3px_0px_#000]'
                              : 'bg-red-500 text-white border-black font-black'
                            : 'bg-[#0b031d] text-slate-200 border-purple-800 hover:bg-purple-950/70 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-black/40 flex items-center justify-center text-[10px] font-black shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card upon answering */}
                {answeredCorrectly !== null && selectedOption !== null && (
                  <div
                    className={`mt-3 p-3 rounded-2xl border-2 text-xs font-mono leading-relaxed ${
                      answeredCorrectly
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                        : 'bg-red-950/90 border-red-400 text-red-200'
                    }`}
                  >
                    <strong>{answeredCorrectly ? '🎉 ¡CORRECTO! (+100 XP): ' : '⚠️ INCORRECTO: '}</strong>
                    {chapter.challenge.options[selectedOption].explanation}
                  </div>
                )}
              </div>

              {/* Footer Controls for Challenge */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-900 gap-2">
                <button
                  onClick={() => {
                    sfx.playPop();
                    setShowChallenge(false);
                  }}
                  className="px-3 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 hover:bg-slate-700 cursor-pointer"
                >
                  ◀ Repasar Diálogo
                </button>

                {currentChapterIdx < CHAPTERS.length - 1 ? (
                  <button
                    disabled={!answeredCorrectly}
                    onClick={handleNextChapter}
                    className={`px-5 py-2.5 font-black text-xs sm:text-sm uppercase rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-all ${
                      answeredCorrectly
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-black cursor-pointer hover:-translate-y-0.5 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>SIGUIENTE CAPÍTULO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sfx.playFanfare();
                      onOpenWorld('world5');
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-xs sm:text-sm uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2 cursor-pointer hover:brightness-110 animate-bounce"
                  >
                    <span>¡ ENTRAR AL SANDBOX MULTIVERSAL !</span>
                    <Sparkles className="w-4 h-4 fill-black" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto py-2 text-[10px] font-mono text-amber-200/70 text-center flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-purple-900/50 pt-2 mt-2">
        <span>🏛️ Institución Educativa Josefa Campos</span>
        <span>Crónicas del Ojo Cuántico: Historia Rara de la Física &copy; 2026</span>
        <span>Autores: Isabel Sofía López & Juan Alejandro Mejía</span>
      </footer>
    </div>
  );
};
