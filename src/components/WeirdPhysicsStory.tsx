import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
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
  Atom,
  Feather,
  BookMarked,
  Share2,
  Layers,
  Activity,
  Orbit,
} from 'lucide-react';
import pixelCoverArt from '../assets/images/psychedelic_pixel_cover_1787926979816.jpg';
import { PixelGumball, PixelDarwin, PixelAnais, PixelPenny } from './PixelCharacters';
import { sfx } from '../utils/audioEffects';

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  storyPageTitle: string;
  storyNarrative: string[];
  topic: string;
  character: string;
  icon: string;
  themeColor: string;
  accentColor: string;
  bgGradient: string;
  physicsAura: string;
  floatingFormulas: string[];
  dialogues: {
    speaker: string;
    avatar: 'entity' | 'gumball' | 'darwin' | 'anais' | 'penny' | 'narrator';
    text: string;
    scientificNote?: string;
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
  simulationWorldTarget: 'world1' | 'world2' | 'world3' | 'world4';
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'Capítulo I: El Despertar del Ente Cósmico y el Autobús de Dos Realidades',
    subtitle: 'La Relatividad Clásica de Galileo y los Marcos de Referencia',
    storyPageTitle: 'Érase una vez en los confines de Elmore...',
    storyNarrative: [
      'En el vórtice donde los planos dimensionales convergen, habita una entidad milenaria de incontables pupilas. Dicen los sabios que sus ojos no ven simplemente formas, sino las trayectorias puras del espacio-tiempo.',
      'Un día ordinario, un autobús amarillo cruzaba la avenida a 15 metros por segundo. En su interior, el joven Gumball jugaba a lanzar una esfera hacia el techo. Para él, la pelota solo subía y bajaba en una recta vertical perfecta.',
      'Sin embargo, desde la acera, Darwin y la criatura observaban asombrados cómo la pelota no caía en el mismo sitio del suelo, sino que trazaba una parábola infinita a través del aire. ¿Quién poseía la verdad absoluta? La física sonrió: ambos tenían razón.',
    ],
    topic: 'Cinemática Relativista 1D vs 2D',
    character: 'El Guardián del Vórtice & Gumball',
    icon: '👁️',
    themeColor: 'from-amber-400 to-yellow-500',
    accentColor: '#facc15',
    bgGradient: 'from-[#1b0633] via-[#2f084a] to-[#0d021c]',
    physicsAura: 'rgba(250, 204, 21, 0.4)',
    floatingFormulas: [
      '\\vec{v}_{\\text{total}} = \\vec{v}_x + \\vec{v}_y',
      'v = \\sqrt{v_x^2 + v_y^2}',
      'x(t) = v_{\\text{bus}} \\cdot t',
      'y(t) = v_{0y} t - \\frac{1}{2}gt^2',
      '\\tan\\theta = \\frac{v_y}{v_x}',
    ],
    dialogues: [
      {
        speaker: 'El Guardián del Vórtice',
        avatar: 'entity',
        text: '«Observen con mis múltiples ojos, mortales. Ningún punto en el universo es el centro inmóvil. Todo reposo es una ilusión tejida por el marco donde decides pararte.»',
        scientificNote: 'Principio de Inercia y Relatividad Galileana (1632)',
      },
      {
        speaker: 'Gumball',
        avatar: 'gumball',
        text: '«¡Yo sólo lancé la pelota verticalmente hacia arriba a 15 m/s! Desde mi asiento dentro del bus no se mueve hacia los lados. ¡Es puro movimiento unidimensional 1D!»',
      },
      {
        speaker: 'Darwin',
        avatar: 'darwin',
        text: '«¡Pero Gumball! Yo estoy afuera en la parada fija. El autobús se mueve a 15 m/s hacia el este. La pelota viaja hacia arriba Y hacia el frente al mismo tiempo... ¡Es una parábola 2D de 21.21 m/s!»',
      },
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: '«¡Exacto! La velocidad observada por Darwin es la suma vectorial: v = √(15² + 15²) = √450 ≈ 21.21 m/s en un ángulo de 45°. Las leyes de Newton se cumplen en ambos sistemas inerciales.»',
        scientificNote: 'Invarianza de Galileo: F = m·a es idéntica en todos los marcos inerciales.',
      },
    ],
    gizmoType: 'vectors',
    challenge: {
      question: 'Si el autobús escolar marcha horizontalmente a 15 m/s y Gumball dispara la pelota verticalmente a 15 m/s, ¿cuál es la velocidad total resultante que mide Darwin desde el andén exterior?',
      formula: 'v_{\\text{total}} = \\sqrt{v_x^2 + v_y^2}',
      options: [
        {
          text: 'v = 15.0 m/s (la velocidad del bus se anula)',
          isCorrect: false,
          explanation: '¡Incorrecto! Los movimientos perpendicularmente acoplados no se anulan, se componen vectorialmente.',
        },
        {
          text: 'v = √(15² + 15²) = √450 ≈ 21.21 m/s en 45°',
          isCorrect: true,
          explanation: '¡MAGNÍFICO! Por el teorema de Pitágoras vectorial, dos componentes ortogonales de 15 m/s generan una hipotenusa de 21.21 m/s.',
        },
        {
          text: 'v = 30.0 m/s (suma algebraica simple 15 + 15)',
          isCorrect: false,
          explanation: '¡Incorrecto! No se pueden sumar escalares directos cuando los vectores forman un ángulo recto de 90°.',
        },
      ],
    },
    simulationWorldTarget: 'world1',
  },
  {
    id: 2,
    title: 'Capítulo II: La Carrera de los Dos Destinos y la Dilatación del Tiempo',
    subtitle: 'Movimiento Rectilíneo Uniforme (MRU) vs Acelerado (MUA) y Einstein',
    storyPageTitle: 'En la pista infinita de la relatividad...',
    storyNarrative: [
      'Al alba, sobre una pista rosada de cristal cuántico, Anais retó a su hermano a una carrera legendaria. Anais encendió su bólido con velocidad constante (MRU), marchando serena y perfecta.',
      'Gumball, desesperado por ganar, pisó a fondo un propulsor de aceleración constante (MUA). Al inicio parecía rezagado, pero la ecuación cuadrática del tiempo comenzó a multiplicar su velocidad de forma implacable.',
      'El Guardián del Vórtice susurró desde el éter: "La aceleración dobla la distancia recorrida con el cuadrado del tiempo, pero si te acercas a la luz, el tiempo mismo empezará a frenar tu reloj frente al cosmos..."',
    ],
    topic: 'MRU, MUA y Factor γ de Lorentz',
    character: 'Anais, Gumball & Lorentz',
    icon: '⚡',
    themeColor: 'from-pink-500 to-rose-600',
    accentColor: '#ec4899',
    bgGradient: 'from-[#2b0524] via-[#450939] to-[#120210]',
    physicsAura: 'rgba(236, 72, 153, 0.45)',
    floatingFormulas: [
      'x(t) = x_0 + v_0 t + \\frac{1}{2} a t^2',
      'v(t) = v_0 + a t',
      'v^2 = v_0^2 + 2a \\Delta x',
      '\\gamma = \\frac{1}{\\sqrt{1 - \\frac{v^2}{c^2}}}',
      '\\Delta t\' = \\gamma \\Delta t',
    ],
    dialogues: [
      {
        speaker: 'El Guardián del Vórtice',
        avatar: 'entity',
        text: '«En el reino clásico, la aceleración te otorga una ventaja cuadrática: x ∝ t². Pero en mi reino relativista, la velocidad de la luz (c ≈ 300,000 km/s) es el muro infranqueable de la realidad.»',
        scientificNote: 'Postulado de Einstein: La velocidad de la luz es constante para todo observador.',
      },
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: '«Mi vehículo viaja a MRU con velocidad constante de 20 m/s: x(t) = 20·t. Es un avance lineal predecible y elegante.»',
      },
      {
        speaker: 'Gumball',
        avatar: 'gumball',
        text: '«¡Mi cohete partió del reposo con aceleración a = 4 m/s²! En t = 10 segundos, mi distancia es x = 0.5 · 4 · (10)² = 200 metros, y mi velocidad llegó a 40 m/s... ¡Te alcancé!»',
      },
      {
        speaker: 'Penny',
        avatar: 'penny',
        text: '«¡Y si aceleraran hasta el 80% de la velocidad de la luz (0.8c), el factor gamma γ sería 1.66! Cada segundo en su nave equivaldría a 1.66 segundos para los espectadores terrestres.»',
        scientificNote: 'Efecto de dilatación temporal relativista comprobado en satélites GPS.',
      },
    ],
    gizmoType: 'lorentz',
    challenge: {
      question: 'Un móvil parte del reposo (v₀ = 0) con aceleración constante a = 6 m/s². ¿Qué distancia recorre exactamente al cabo de t = 4 segundos?',
      formula: 'x = v_0 t + \\frac{1}{2} a t^2',
      options: [
        {
          text: 'x = 24 metros (multiplicando 6 × 4)',
          isCorrect: false,
          explanation: '¡Incorrecto! 24 m/s es su velocidad final instantánea v = a·t, no la distancia total recorrida.',
        },
        {
          text: 'x = 0.5 × 6 × (4)² = 3 × 16 = 48 metros',
          isCorrect: true,
          explanation: '¡PERFECTO! La distancia bajo aceleración constante escala con el cuadrado del tiempo: 1/2 · 6 · 16 = 48 metros.',
        },
        {
          text: 'x = 96 metros',
          isCorrect: false,
          explanation: '¡Incorrecto! Olvidaste dividir por 2 en el término 1/2·a·t².',
        },
      ],
    },
    simulationWorldTarget: 'world2',
  },
  {
    id: 3,
    title: 'Capítulo III: El Suspiro de Galileo y el Secreto del Vacío',
    subtitle: 'Caída Libre, Gravedad Terrestre (g = 9.8 m/s²) y Fricción del Aire',
    storyPageTitle: 'Desde la Torre Suprema del Conocimiento...',
    storyNarrative: [
      'Cuenta la leyenda que el sabio Galileo subió a lo alto de la torre para desafiar dos mil años de dogmas aristotélicos. Sostenía en una mano una pluma ligera y en la otra una pesada esfera de hierro fundido.',
      'Al soltarlas en la atmósfera terrestre, el aire abrazó la pluma y la hizo danzar lentamente, mientras la bola de hierro se estrellaba veloz. Pero el Guardián del Vórtice abrió una grieta de vacío absoluto.',
      'Al desaparecer el aire, el milagro se reveló: la pluma ingrávida y la esfera cayeron hombro a hombro, rozando el suelo en el mismo instante matemático, pues la gravedad no discrimina por masa.',
    ],
    topic: 'Caída Libre y Resistencia Aerodinámica',
    character: 'Darwin, Galileo & Newton',
    icon: '🍎',
    themeColor: 'from-orange-500 to-amber-600',
    accentColor: '#f97316',
    bgGradient: 'from-[#2b1204] via-[#4a2208] to-[#120702]',
    physicsAura: 'rgba(249, 115, 22, 0.45)',
    floatingFormulas: [
      'g = 9.80665 \\text{ m/s}^2',
      'y(t) = h_0 - \\frac{1}{2} g t^2',
      'v_f = \\sqrt{2 g h}',
      'F_d = \\frac{1}{2} \\rho C_d A v^2',
      'v_{\\text{terminal}} = \\sqrt{\\frac{2mg}{\\rho C_d A}}',
    ],
    dialogues: [
      {
        speaker: 'El Guardián del Vórtice',
        avatar: 'entity',
        text: '«En el vacío del cosmos, una estrella y un grano de polvo caen con la misma aceleración g. La masa gravitatoria y la masa inercial son la misma cara de una moneda sagrada.»',
        scientificNote: 'Principio de Equivalencia Fuerte de Albert Einstein.',
      },
      {
        speaker: 'Darwin',
        avatar: 'darwin',
        text: '«¡Yo siempre creí que las cosas pesadas caían más rápido porque la Tierra las jalaba con más fuerza bruta!»',
      },
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: '«La Tierra jala con más fuerza a la masa grande (F = m·g), pero esa misma masa grande tiene más inercia (resistencia a ser acelerada, a = F/m). ¡Ambas masas se cancelan y todas aceleran a 9.8 m/s²!»',
      },
      {
        speaker: 'Gumball',
        avatar: 'gumball',
        text: '«¡Solo cuando encendemos el aire aparece la fuerza de arrastre F_d = 1/2 · ρ · C_d · A · v², que frena a los objetos con gran superficie hasta su velocidad terminal!»',
        scientificNote: 'En el vacío lunar del Apolo 15, el astronauta David Scott dejó caer un martillo y una pluma al mismo tiempo con éxito total.',
      },
    ],
    gizmoType: 'drag',
    challenge: {
      question: 'Si dejamos caer una esfera desde un edificio de altura h = 45 metros en el vacío (g ≈ 10 m/s², sin fricción), ¿cuánto tiempo tarda en tocar el suelo?',
      formula: 't = \\sqrt{\\frac{2h}{g}}',
      options: [
        {
          text: 't = 4.5 segundos',
          isCorrect: false,
          explanation: '¡Incorrecto! No puedes simplemente dividir altura entre gravedad.',
        },
        {
          text: 't = √(2 × 45 / 10) = √9 = 3.0 segundos',
          isCorrect: true,
          explanation: '¡EXCELENTE! Usando h = 1/2·g·t², despejamos t = √(2h/g) = √(90/10) = 3 segundos exactos.',
        },
        {
          text: 't = 9.0 segundos',
          isCorrect: false,
          explanation: '¡Incorrecto! Olvidaste aplicar la raíz cuadrada al resultado de 9.',
        },
      ],
    },
    simulationWorldTarget: 'world3',
  },
  {
    id: 4,
    title: 'Capítulo IV: La Balística Sagrada y el Jardín de las Parábolas',
    subtitle: 'Lanzamiento de Proyectiles en 2D y el Ángulo Óptimo de 45°',
    storyPageTitle: 'En el frondoso jardín de las trayectorias...',
    storyNarrative: [
      'Al cruzar las puertas del jardín verde de Elmore, los viajeros se toparon con el gran Cañón Balístico del Guardián. En la lejanía, sobre una colina de piedra, reposaba la campana del triunfo.',
      'Gumball intentó disparar a 10 grados, pero el proyectil chocó contra el pasto muy pronto. Luego disparó a 80 grados, y la esfera subió hasta las nubes para caer casi sobre su propia cabeza.',
      'Fue entonces cuando la voz cósmica resonó: "La naturaleza adora el equilibrio. El ángulo de 45 grados reparte la energía a partes iguales entre el vuelo en altura y la conquista del horizonte".',
    ],
    topic: 'Tiro Parabólico 2D y Alcance Balístico',
    character: 'Gumball, Anais & El Cañón',
    icon: '🎯',
    themeColor: 'from-emerald-500 to-teal-600',
    accentColor: '#10b981',
    bgGradient: 'from-[#032418] via-[#053d29] to-[#01140d]',
    physicsAura: 'rgba(16, 185, 129, 0.45)',
    floatingFormulas: [
      'x(t) = v_0 \\cos(\\theta) \\cdot t',
      'y(t) = v_0 \\sin(\\theta) \\cdot t - \\frac{1}{2}gt^2',
      'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
      'H_{\\text{max}} = \\frac{v_0^2 \\sin^2(\\theta)}{2g}',
      't_{\\text{vuelo}} = \\frac{2 v_0 \\sin(\\theta)}{g}',
    ],
    dialogues: [
      {
        speaker: 'El Guardián del Vórtice',
        avatar: 'entity',
        text: '«El tiro balístico es la danza simultánea de dos dimensiones independientes: un MRU incorruptible en X y un MUA gravitacional en Y.»',
        scientificNote: 'Principio de Independencia de Movimientos formulado por Galileo.',
      },
      {
        speaker: 'Gumball',
        avatar: 'gumball',
        text: '«¡Disparé a 45° con velocidad v₀ = 20 m/s! El proyectil voló con el alcance máximo horizontal posible antes de tocar la hierba.»',
      },
      {
        speaker: 'Anais',
        avatar: 'anais',
        text: '«¡Exacto! El factor sen(2θ) alcanza su valor máximo de 1.0 cuando 2θ = 90°, es decir, θ = 45°. Además, ángulos complementarios como 30° y 60° logran exactamente el mismo alcance horizontal.»',
        scientificNote: 'Alcance complementario: sen(2×30°) = sen(60°) = sen(2×60°) = sen(120°) = √3/2.',
      },
      {
        speaker: 'Penny',
        avatar: 'penny',
        text: '«En la cúspide de la parábola, la velocidad vertical Vy se hace cero por un instante fugaz, pero la velocidad horizontal Vx sigue intacta.»',
      },
    ],
    gizmoType: 'ballistics',
    challenge: {
      question: '¿Qué ángulo de elevación θ proporciona el alcance horizontal máximo (X_max) al disparar un proyectil sobre terreno plano?',
      formula: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
      options: [
        {
          text: 'θ = 90° (tiro completamente vertical)',
          isCorrect: false,
          explanation: '¡Incorrecto! A 90° el proyectil alcanza la altura máxima pero su alcance horizontal es 0 metros.',
        },
        {
          text: 'θ = 45° (optimización trigonométrica de sen(2θ))',
          isCorrect: true,
          explanation: '¡CORRECTO! A 45°, sen(2×45°) = sen(90°) = 1, maximizando la fórmula del alcance balístico.',
        },
        {
          text: 'θ = 60°',
          isCorrect: false,
          explanation: '¡Incorrecto! A 60° sube más alto pero recorre menos distancia horizontal que a 45°.',
        },
      ],
    },
    simulationWorldTarget: 'world4',
  },
];

interface WeirdPhysicsStoryProps {
  onGoHome: () => void;
  onOpenWorld: (world: 'world1' | 'world2' | 'world3' | 'world4' | 'free') => void;
  onFinishStoryToFreeWorld?: () => void;
  userProfile: { name: string; age: string; grade: string } | null;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const WeirdPhysicsStory: React.FC<WeirdPhysicsStoryProps> = ({
  onGoHome,
  onOpenWorld,
  onFinishStoryToFreeWorld,
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
  const [activeStoryTab, setActiveStoryTab] = useState<'narrative' | 'dialogue' | 'enigma'>('narrative');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  // Gizmo state variables
  const [gizmoVx, setGizmoVx] = useState<number>(15);
  const [gizmoVy, setGizmoVy] = useState<number>(15);
  const [gizmoBeta, setGizmoBeta] = useState<number>(0.8);
  const [gizmoAngle, setGizmoAngle] = useState<number>(45);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const chapter = STORY_CHAPTERS[currentChapterIdx];

  // Fullscreen monitor
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

  // Switch chapters
  const handleSelectChapter = (idx: number) => {
    sfx.playPop();
    setCurrentChapterIdx(idx);
    setCurrentDialogueIdx(0);
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setShowChallenge(false);
    setActiveStoryTab('narrative');
  };

  const handleNextDialogue = () => {
    sfx.playPop(500);
    if (currentDialogueIdx < chapter.dialogues.length - 1) {
      setCurrentDialogueIdx((prev) => prev + 1);
    } else {
      setActiveStoryTab('enigma');
      setShowChallenge(true);
    }
  };

  const handlePrevDialogue = () => {
    sfx.playPop(400);
    if (currentDialogueIdx > 0) {
      setCurrentDialogueIdx((prev) => prev - 1);
    }
  };

  const handleFinishToFreeWorld = () => {
    sfx.playFanfare();
    if (onFinishStoryToFreeWorld) {
      onFinishStoryToFreeWorld();
    } else {
      onOpenWorld('free');
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
      if (currentChapterIdx === STORY_CHAPTERS.length - 1) {
        setTimeout(() => {
          setShowCompleteModal(true);
        }, 1200);
      }
    } else {
      sfx.playBoing();
    }
  };

  const handleNextChapter = () => {
    sfx.playWarpWhoosh();
    if (currentChapterIdx < STORY_CHAPTERS.length - 1) {
      setCurrentChapterIdx((prev) => prev + 1);
      setCurrentDialogueIdx(0);
      setSelectedOption(null);
      setAnsweredCorrectly(null);
      setShowChallenge(false);
      setActiveStoryTab('narrative');
    }
  };

  // -------------------------------------------------------------
  // ANIMATED PHYSICS CANVASES: PARTICLES & ORBITING ATOMIC ELECTRONS
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let angle = 0;
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      radius: Math.random() * 2.5 + 1,
      color: ['#facc15', '#ec4899', '#38bdf8', '#4ade80', '#a855f7'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      angle += 0.025;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Draw Orbiting Quantum Atomic Ellipses around the central figure
      ctx.save();
      ctx.lineWidth = 1.5;

      const orbitConfigs = [
        { rx: width * 0.44, ry: height * 0.22, rot: Math.PI / 6, color: '#facc15', speed: 1.2 },
        { rx: width * 0.42, ry: height * 0.22, rot: -Math.PI / 4, color: '#38bdf8', speed: -1.5 },
        { rx: width * 0.46, ry: height * 0.24, rot: Math.PI / 2.2, color: '#ec4899', speed: 1.0 },
      ];

      orbitConfigs.forEach((orbit, oIdx) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(orbit.rot);

        // Orbit ring
        ctx.beginPath();
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = orbit.color;
        ctx.globalAlpha = 0.25;
        ctx.stroke();

        // Orbiting electron / photon
        const curAng = angle * orbit.speed + oIdx * 2;
        const ex = Math.cos(curAng) * orbit.rx;
        const ey = Math.sin(curAng) * orbit.ry;

        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = orbit.color;
        ctx.shadowColor = orbit.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        // Wave ripple trail
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.strokeStyle = orbit.color;
        ctx.globalAlpha = 0.4;
        ctx.stroke();

        ctx.restore();
      });
      ctx.restore();

      // 2. Draw Floating Sparks & Energy Dust
      ctx.save();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.restore();

      // 3. Draw Sine Wave at Bottom (Photon Wavepacket)
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      for (let x = 0; x < width; x += 4) {
        const y = height - 20 + Math.sin(x * 0.03 + angle * 2) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentChapterIdx]);

  return (
    <div className="min-h-screen w-full bg-[#070114] text-white flex flex-col justify-between p-2 sm:p-4 md:p-6 font-mono relative overflow-x-hidden select-none">
      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-gradient-to-b ${chapter.bgGradient} opacity-95 transition-colors duration-1000 pointer-events-none`} />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      {/* TOP NAVIGATION HEADER */}
      <header className="relative z-30 w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 p-3 bg-[#110526]/90 border-3 border-amber-400 rounded-3xl shadow-[5px_5px_0px_#000] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.playPop();
              onGoHome();
            }}
            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>PORTADA</span>
          </button>

          <button
            onClick={() => {
              sfx.playFanfare();
              if (onFinishStoryToFreeWorld) {
                onFinishStoryToFreeWorld();
              } else {
                onOpenWorld('free');
              }
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-black font-black text-xs uppercase rounded-xl border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
            title="Ir al Mundo Libre"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>MUNDO LIBRE 🎡</span>
          </button>

          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-xl border border-yellow-400/50">
            <BookMarked className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span className="text-xs font-black text-amber-300">CUENTO DE FÍSICA CUÁNTICA</span>
          </div>
        </div>

        {/* User stats & controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-xl border border-yellow-400/80 text-xs font-bold text-yellow-300">
            <Award className="w-4 h-4 text-yellow-400 animate-bounce" />
            <span>XP: {userScore}</span>
          </div>

          {userProfile && (
            <div className="hidden md:flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-xl border border-pink-400/80 text-xs font-bold text-pink-200">
              <User className="w-3.5 h-3.5" />
              <span>{userProfile.name}</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1 rounded-xl border-2 font-black text-xs uppercase flex items-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
              isFullscreen
                ? 'bg-amber-400 text-black border-black hover:bg-yellow-300'
                : 'bg-slate-800 text-amber-200 border-amber-400 hover:bg-slate-700'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'SALIR' : 'FULL'}</span>
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

      {/* CHAPTER INDEX PILLS (BOOK CHAPTERS) */}
      <div className="relative z-30 w-full max-w-7xl mx-auto my-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STORY_CHAPTERS.map((ch, idx) => {
          const isCurrent = currentChapterIdx === idx;
          const isDone = completedChapters.includes(ch.id);
          return (
            <button
              key={`ch-pill-${ch.id}`}
              onClick={() => handleSelectChapter(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl border-2 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_#000] ${
                isCurrent
                  ? 'bg-amber-400 text-black border-black font-black scale-105 shadow-[4px_4px_0px_#FF007F]'
                  : isDone
                    ? 'bg-emerald-600/90 text-white border-emerald-400 hover:bg-emerald-500'
                    : 'bg-[#15072e]/90 text-slate-300 border-purple-800 hover:bg-purple-900/60'
              }`}
            >
              <span>{ch.icon}</span>
              <span>{ch.title.split(':')[0]}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* MAIN STORY BOOK STAGE */}
      <main className="relative z-30 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: THE ORIGINAL UNMODIFIED ARTWORK WITH LIVING PHYSICS AURA AROUND IT */}
        <div className="lg:col-span-5 flex flex-col bg-[#110526]/95 border-4 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-[8px_8px_0px_#000] backdrop-blur-md relative overflow-hidden">
          
          {/* Header of the Illustration Canvas */}
          <div className="flex items-center justify-between mb-3 text-xs font-black text-amber-300">
            <div className="flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-xl border border-yellow-400/50">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>ENTE CÓSMICO • GUARDIÁN DEL VÓRTICE</span>
            </div>
            <span className="text-pink-300 font-bold text-[11px] bg-pink-950/60 px-2 py-0.5 rounded-lg border border-pink-500/40">
              {chapter.topic}
            </span>
          </div>

          {/* Central Artwork Stage: Unmodified original vertical image + floating physics around it */}
          <div className="relative w-full aspect-[9/14] sm:aspect-[9/13] max-h-[520px] bg-[#080112] border-3 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] flex items-center justify-center">
            
            {/* 1. Canvas overlay for atomic orbits and quantum sparks around the character */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none z-10 w-full h-full"
            />

            {/* 2. THE EXACT UNMODIFIED USER PIXEL ARTWORK */}
            <img
              src={pixelCoverArt}
              alt="Entidad Cósmica Pixel Art Original"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain object-center z-0 relative"
              style={{
                imageRendering: 'pixelated',
              }}
            />

            {/* 3. FLOATING PHYSICS FORMULAS AROUND THE ENTITY */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-2 sm:p-3">
              {/* Top Row Formulas */}
              <div className="flex items-center justify-between gap-1">
                <motion.div
                  animate={{ y: [0, -4, 0], opacity: [0.85, 1, 0.85] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="bg-black/80 px-2 py-1 rounded-lg border border-yellow-400/80 text-[10px] sm:text-xs font-mono font-black text-yellow-300 shadow-[2px_2px_0px_#000] backdrop-blur-sm"
                >
                  {chapter.floatingFormulas[0] || 'E = mc²'}
                </motion.div>

                <motion.div
                  animate={{ y: [0, 4, 0], opacity: [0.85, 1, 0.85] }}
                  transition={{ repeat: Infinity, duration: 3.5, delay: 0.5, ease: 'easeInOut' }}
                  className="bg-black/80 px-2 py-1 rounded-lg border border-cyan-400/80 text-[10px] sm:text-xs font-mono font-black text-cyan-300 shadow-[2px_2px_0px_#000] backdrop-blur-sm"
                >
                  {chapter.floatingFormulas[1] || 'F = m · a'}
                </motion.div>
              </div>

              {/* Middle Floating Formula Badges */}
              <div className="flex items-center justify-between gap-1">
                <motion.div
                  animate={{ x: [0, -3, 0], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="bg-black/80 px-2 py-1 rounded-lg border border-pink-400/80 text-[9px] sm:text-[11px] font-mono font-black text-pink-300 shadow-[2px_2px_0px_#000] backdrop-blur-sm"
                >
                  {chapter.floatingFormulas[2] || 'γ = 1/√(1 - v²/c²)'}
                </motion.div>

                <motion.div
                  animate={{ x: [0, 3, 0], rotate: [2, -2, 2] }}
                  transition={{ repeat: Infinity, duration: 4.2, delay: 0.7, ease: 'easeInOut' }}
                  className="bg-black/80 px-2 py-1 rounded-lg border border-emerald-400/80 text-[9px] sm:text-[11px] font-mono font-black text-emerald-300 shadow-[2px_2px_0px_#000] backdrop-blur-sm"
                >
                  {chapter.floatingFormulas[3] || 'g = 9.8 m/s²'}
                </motion.div>
              </div>

              {/* Bottom Floating Formula Badge */}
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ scale: [0.97, 1.03, 0.97] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="bg-purple-950/90 px-3 py-1 rounded-full border-2 border-amber-400 text-[10px] sm:text-xs font-mono font-black text-amber-300 shadow-[3px_3px_0px_#000] backdrop-blur-sm flex items-center gap-1.5"
                >
                  <Atom className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span>{chapter.floatingFormulas[4] || 'Δx · Δp ≥ ℏ/2'}</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Quick link button to Free World */}
          <button
            onClick={() => {
              sfx.playFanfare();
              if (onFinishStoryToFreeWorld) {
                onFinishStoryToFreeWorld();
              } else {
                onOpenWorld('free');
              }
            }}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-pink-500 border-3 border-black text-black font-black text-xs sm:text-sm uppercase rounded-2xl shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#FF007F] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Orbit className="w-4 h-4 text-black animate-spin" />
            <span>IR DIRECTO AL MUNDO LIBRE 🎡</span>
          </button>
        </div>

        {/* RIGHT COLUMN: THE STORYBOOK INTERFACE (NARRATIVE, DIALOGUES & ENIGMA) */}
        <div className="lg:col-span-7 bg-[#110526]/95 border-4 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-[8px_8px_0px_#000] backdrop-blur-md flex flex-col justify-between">
          
          <div>
            {/* Storybook Header */}
            <div className="border-b-2 border-purple-800 pb-3 mb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-silkscreen text-amber-300 uppercase tracking-widest bg-black/60 px-2.5 py-0.5 rounded-md border border-amber-400/40">
                  EXPEDIENTE CUÁNTICO #{chapter.id}
                </span>

                {/* Sub-tabs: Cuento Narrado / Diálogo Teatral / Enigma */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      sfx.playPop();
                      setActiveStoryTab('narrative');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                      activeStoryTab === 'narrative'
                        ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-black/50 text-slate-300 border-purple-800 hover:bg-purple-900/60'
                    }`}
                  >
                    📖 Relato
                  </button>

                  <button
                    onClick={() => {
                      sfx.playPop();
                      setActiveStoryTab('dialogue');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                      activeStoryTab === 'dialogue'
                        ? 'bg-pink-500 text-white border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-black/50 text-slate-300 border-purple-800 hover:bg-purple-900/60'
                    }`}
                  >
                    💬 Diálogos
                  </button>

                  <button
                    onClick={() => {
                      sfx.playPop();
                      setActiveStoryTab('enigma');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                      activeStoryTab === 'enigma'
                        ? 'bg-emerald-400 text-black border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-black/50 text-slate-300 border-purple-800 hover:bg-purple-900/60'
                    }`}
                  >
                    🎯 Enigma
                  </button>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 mt-2">
                {chapter.title}
              </h2>
              <p className="text-xs text-amber-200/90 font-bold mt-0.5">
                ✦ {chapter.subtitle}
              </p>
            </div>

            {/* TAB 1: STORY NARRATIVE (LITERARY STORYBOOK) */}
            {activeStoryTab === 'narrative' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="flex items-center gap-2 text-pink-300 text-xs font-bold italic">
                  <Feather className="w-4 h-4 text-yellow-300" />
                  <span>« {chapter.storyPageTitle} »</span>
                </div>

                <div className="bg-[#080114]/90 border-2 border-purple-700/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-[4px_4px_0px_#000] text-slate-100 text-xs sm:text-sm leading-relaxed font-sans">
                  {chapter.storyNarrative.map((paragraph, pIdx) => (
                    <p key={`p-${pIdx}`} className="first-letter:text-2xl first-letter:font-black first-letter:text-yellow-300 first-letter:mr-1">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-amber-300/80 italic font-mono">
                    Continúa a los diálogos para debatir las leyes físicas con los personajes.
                  </span>

                  <button
                    onClick={() => {
                      sfx.playPop();
                      setActiveStoryTab('dialogue');
                    }}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>LEER DIÁLOGOS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: INTERACTIVE THEATRICAL DIALOGUES */}
            {activeStoryTab === 'dialogue' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Speaker Banner */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_#000] shrink-0">
                    {chapter.dialogues[currentDialogueIdx].avatar === 'entity' ? (
                      '👁️'
                    ) : chapter.dialogues[currentDialogueIdx].avatar === 'gumball' ? (
                      <PixelGumball size={32} />
                    ) : chapter.dialogues[currentDialogueIdx].avatar === 'darwin' ? (
                      <PixelDarwin size={32} />
                    ) : chapter.dialogues[currentDialogueIdx].avatar === 'anais' ? (
                      <PixelAnais size={32} />
                    ) : (
                      <PixelPenny size={32} />
                    )}
                  </div>

                  <div>
                    <span className="block text-xs sm:text-sm font-black text-yellow-300 uppercase">
                      {chapter.dialogues[currentDialogueIdx].speaker}
                    </span>
                    {chapter.dialogues[currentDialogueIdx].scientificNote && (
                      <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 inline-block mt-0.5">
                        💡 {chapter.dialogues[currentDialogueIdx].scientificNote}
                      </span>
                    )}
                  </div>
                </div>

                {/* Speech Card */}
                <div className="p-4 sm:p-5 bg-[#090117] border-3 border-purple-600 rounded-2xl text-slate-100 text-sm sm:text-base leading-relaxed shadow-[4px_4px_0px_#000]">
                  {chapter.dialogues[currentDialogueIdx].text}
                </div>

                {/* Dialogue Navigation & Progress */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-900/60">
                  <div className="flex items-center gap-1.5">
                    {chapter.dialogues.map((_, dIdx) => (
                      <button
                        key={`dot-${dIdx}`}
                        onClick={() => {
                          sfx.playPop();
                          setCurrentDialogueIdx(dIdx);
                        }}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          currentDialogueIdx === dIdx
                            ? 'bg-amber-400 w-6'
                            : currentDialogueIdx > dIdx
                              ? 'bg-emerald-400 w-2.5'
                              : 'bg-purple-900 w-2.5'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentDialogueIdx > 0 && (
                      <button
                        onClick={handlePrevDialogue}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-600 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={handleNextDialogue}
                      className="px-4 py-2 bg-amber-400 hover:bg-yellow-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {currentDialogueIdx < chapter.dialogues.length - 1 ? 'SIGUIENTE' : '¡RESOLVER ENIGMA!'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: PHYSICS CHALLENGE / ENIGMA */}
            {activeStoryTab === 'enigma' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-yellow-400 border-2 border-black rounded-full text-black font-black text-[10px] sm:text-[11px] uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>DESAFÍO DEL GUARDIÁN CUÁNTICO</span>
                </div>

                <p className="text-sm sm:text-base font-black text-yellow-100">
                  {chapter.challenge.question}
                </p>

                {chapter.challenge.formula && (
                  <div className="p-2 bg-[#090217] border border-cyan-400 rounded-xl text-cyan-300 text-xs font-mono font-bold text-center">
                    Fórmula de Apoyo: <strong>{chapter.challenge.formula}</strong>
                  </div>
                )}

                {/* Option Buttons */}
                <div className="space-y-2 mt-2">
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
                            : 'bg-[#090117] text-slate-200 border-purple-800 hover:bg-purple-950/70 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-black/50 flex items-center justify-center text-[10px] font-black shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {answeredCorrectly !== null && selectedOption !== null && (
                  <div
                    className={`p-3 rounded-2xl border-2 text-xs font-mono leading-relaxed ${
                      answeredCorrectly
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                        : 'bg-red-950/90 border-red-400 text-red-200'
                    }`}
                  >
                    <strong>{answeredCorrectly ? '🎉 ¡CORRECTO! (+100 XP): ' : '⚠️ INCORRECTO: '}</strong>
                    {chapter.challenge.options[selectedOption].explanation}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* BOTTOM CONTROLS OF THE STORYBOOK */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-900/60 mt-4 gap-2">
            <div className="flex items-center gap-1 text-[11px] text-amber-200">
              <span>Capítulo {chapter.id} de {STORY_CHAPTERS.length}</span>
            </div>

            {currentChapterIdx < STORY_CHAPTERS.length - 1 ? (
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
                disabled={!answeredCorrectly}
                onClick={handleFinishToFreeWorld}
                className={`px-5 py-2.5 font-black text-xs sm:text-sm uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2 transition-all ${
                  answeredCorrectly
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-pink-500 text-black cursor-pointer hover:brightness-110 animate-bounce'
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                }`}
              >
                <span>¡ ENTRAR AL MUNDO LIBRE ! 🎡</span>
                <Sparkles className="w-4 h-4 fill-black" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* STORY COMPLETION MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-xl bg-[#13072b] border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-[12px_12px_0px_#FF007F] text-white text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-yellow-400 border-2 border-black rounded-full text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000]">
              <Award className="w-4 h-4 text-black fill-black animate-bounce" />
              <span>¡CRÓNICA CUÁNTICA COMPLETADA! 🏆</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow-[2px_2px_0px_#000]">
              ¡HAS SUPERADO LA HISTORIA!
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              Has desentrañado los 4 misterios del cosmos junto a Gumball, Darwin, Anais y el Ente Cósmico.
              El Guardián del Vórtice ha abierto el portal al <strong>Mundo Libre (Carnaval & Parque Mecánico)</strong> para que experimentes sin límites.
            </p>

            <div className="p-3 bg-black/60 border-2 border-purple-600 rounded-2xl flex items-center justify-around text-xs font-bold">
              <div>
                <span className="text-slate-400 block text-[10px]">PUNTUACIÓN FINAL</span>
                <span className="text-yellow-300 text-lg font-black">{userScore} XP</span>
              </div>
              <div className="h-8 w-px bg-purple-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">CAPÍTULOS RESUELTOS</span>
                <span className="text-emerald-400 text-lg font-black">4 / 4 🌟</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinishToFreeWorld}
                className="w-full py-4 bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400 border-4 border-black text-black font-black text-base sm:text-xl uppercase tracking-wider rounded-2xl shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#00E5FF] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer animate-pulse"
              >
                <Sparkles className="w-6 h-6 fill-black" />
                <span>🎡 ¡ENTRAR AL MUNDO LIBRE AHORA! 🚀</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* FOOTER: CREDITS & INSTITUTION */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto py-2 text-[10px] font-mono text-amber-200/80 text-center flex flex-col sm:flex-row items-center justify-between gap-1 border-t border-purple-900/50 pt-2 mt-2">
        <span>🏛️ Institución Educativa Josefa Campos</span>
        <span>Autora: <strong>Isabel Sofía López Guisado</strong> • Docente: <strong>Jorge Armando Jaramillo</strong></span>
        <span>Crónicas del Vórtice Cuántico &copy; 2026</span>
      </footer>
    </div>
  );
};
