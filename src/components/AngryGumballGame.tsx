import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Star,
  Zap,
  Target,
  Volume2,
  VolumeX,
  Eye,
  Info,
  Flame,
  Award,
  BookOpen,
  Heart,
  HeartCrack,
} from 'lucide-react';
import gumballCatapultArt from '../assets/images/gumball_catapult_lab_1789929108215.jpg';
import bgAdventureTreehouse from '../assets/images/treehouse_adventure_bg.jpg';
import jakeDogImg from '../assets/images/jake_dog_adventure_1789930587311.jpg';
import lumpyPrincessImg from '../assets/images/lumpy_princess_adventure_1789930598617.jpg';
import { sfx } from '../utils/audioEffects';
import {
  ComicBanner,
  DebrisFragment,
  SmokePuff,
  SlingshotElastic,
  drawAnimatedClouds,
  drawAnimatedRainbow,
  drawAnimatedGumball,
  drawAnimatedDarwin,
  drawAnimatedJake,
  drawAnimatedLumpyPrincess,
  drawAnimatedEnemy,
  drawSlingshotAndBands,
  drawComicBanners,
  drawDebris,
  drawSmokePuffs,
  spawnDebrisExplosion,
} from './angryGumballAnimations';

interface AngryGumballGameProps {
  onGoHome: () => void;
  onGoWorlds?: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

// Types for Projectile, Blocks, Targets, and Particles
type ProjectileType = 'jake' | 'grumosa' | 'daisy' | 'bomb' | 'gumball' | 'darwin_split';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: ProjectileType;
  inFlight: boolean;
  hasCollided: boolean;
  hasSplit?: boolean;
  exploded?: boolean;
  trail: { x: number; y: number; alpha: number }[];
  rotation?: number;
  squashX?: number;
  squashY?: number;
}

interface PhysicsBlock {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  material: 'cardboard' | 'wood' | 'glass' | 'tnt';
  hp: number;
  maxHp: number;
  color: string;
  destroyed?: boolean;
}

interface EnemyTarget {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  name: string;
  expression: 'idle' | 'panic' | 'hit';
  hp: number;
  defeated: boolean;
  points: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape?: 'star' | 'circle' | 'spark';
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
  color: string;
}

// Level configuration
interface GameLevel {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  targetCount: number;
  availableShots: ProjectileType[];
  parScore: number;
  blocks: { x: number; y: number; w: number; h: number; material: 'cardboard' | 'wood' | 'glass' | 'tnt' }[];
  enemies: { x: number; y: number; name: string; color: string }[];
}

const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    name: 'NIVEL 1: EL FUERTE DE CARTÓN DE TOBIAS',
    subtitle: 'Introducción al Tiro Parabólico (θ ≈ 45°)',
    description: 'Apunta con el conejito Daisy hacia el fuerte de cajas de cartón. ¡Usa un ángulo cercano a 45° para máximo alcance horizontal!',
    targetCount: 2,
    availableShots: ['daisy', 'daisy', 'gumball'],
    parScore: 12000,
    blocks: [
      { x: 580, y: 350, w: 35, h: 70, material: 'cardboard' },
      { x: 670, y: 350, w: 35, h: 70, material: 'cardboard' },
      { x: 565, y: 310, w: 155, h: 20, material: 'cardboard' },
      { x: 620, y: 250, w: 45, h: 55, material: 'cardboard' },
      { x: 600, y: 190, w: 85, h: 18, material: 'cardboard' },
    ],
    enemies: [
      { x: 625, y: 360, name: 'Tobias', color: '#c084fc' },
      { x: 642, y: 215, name: 'Banana Joe', color: '#facc15' },
    ],
  },
  {
    id: 2,
    name: 'NIVEL 2: LA TORRE DE CRISTAL Y MADERA',
    subtitle: 'Centro de Gravedad y Momento de Impacto',
    description: 'La estructura tiene vigas de madera pesadas y bloques de cristal frágiles. ¡Golpea la base para derrumbar todo el rascacielos!',
    targetCount: 3,
    availableShots: ['daisy', 'gumball', 'darwin_split', 'bomb'],
    parScore: 22000,
    blocks: [
      // Base
      { x: 560, y: 340, w: 30, h: 80, material: 'wood' },
      { x: 640, y: 340, w: 30, h: 80, material: 'wood' },
      { x: 720, y: 340, w: 30, h: 80, material: 'wood' },
      { x: 550, y: 295, w: 210, h: 18, material: 'wood' },
      // Floor 2
      { x: 585, y: 240, w: 25, h: 50, material: 'glass' },
      { x: 695, y: 240, w: 25, h: 50, material: 'glass' },
      { x: 580, y: 210, w: 150, h: 16, material: 'wood' },
      // Floor 3
      { x: 640, y: 160, w: 30, h: 45, material: 'glass' },
      { x: 620, y: 135, w: 70, h: 15, material: 'cardboard' },
    ],
    enemies: [
      { x: 600, y: 365, name: 'Hector', color: '#93c5fd' },
      { x: 680, y: 365, name: 'Jamie', color: '#f87171' },
      { x: 655, y: 260, name: 'Banana Joe', color: '#facc15' },
    ],
  },
  {
    id: 3,
    name: 'NIVEL 3: EL POLVORÍN TNT DE ROB',
    subtitle: 'Reacciones Balísticas en Cadena',
    description: '¡Cuidado con las cajas de TNT! Un solo impacto en la dinamita provocará una onda de choque expansiva que volará la fortaleza.',
    targetCount: 3,
    availableShots: ['bomb', 'daisy', 'darwin_split', 'gumball'],
    parScore: 30000,
    blocks: [
      { x: 540, y: 350, w: 35, h: 70, material: 'wood' },
      { x: 615, y: 355, w: 45, h: 45, material: 'tnt' },
      { x: 690, y: 350, w: 35, h: 70, material: 'wood' },
      { x: 535, y: 305, w: 200, h: 20, material: 'wood' },
      { x: 575, y: 245, w: 30, h: 55, material: 'glass' },
      { x: 660, y: 245, w: 30, h: 55, material: 'glass' },
      { x: 565, y: 215, w: 135, h: 16, material: 'wood' },
      { x: 618, y: 165, w: 35, h: 45, material: 'tnt' },
    ],
    enemies: [
      { x: 580, y: 365, name: 'Rob', color: '#a78bfa' },
      { x: 650, y: 365, name: 'Tobias', color: '#c084fc' },
      { x: 632, y: 265, name: 'Jamie', color: '#f87171' },
    ],
  },
  {
    id: 4,
    name: 'NIVEL 4: EL BÚNKER IMPOSIBLE DE MISS SIMIAN',
    subtitle: 'Tiro Parabólico de Precisión Balística',
    description: 'El búnker cuenta con refuerzo blindado y obstáculos altos. Debes calcular la trayectoria en arco alto sobre el muro para alcanzar el núcleo.',
    targetCount: 4,
    availableShots: ['darwin_split', 'bomb', 'gumball', 'daisy'],
    parScore: 40000,
    blocks: [
      // Outer barrier
      { x: 480, y: 260, w: 28, h: 160, material: 'wood' },
      { x: 470, y: 240, w: 50, h: 18, material: 'wood' },
      // Main bunker
      { x: 580, y: 340, w: 40, h: 80, material: 'wood' },
      { x: 670, y: 340, w: 40, h: 80, material: 'wood' },
      { x: 760, y: 340, w: 40, h: 80, material: 'wood' },
      { x: 570, y: 295, w: 240, h: 22, material: 'wood' },
      { x: 625, y: 245, w: 40, h: 45, material: 'tnt' },
      { x: 715, y: 245, w: 35, h: 45, material: 'glass' },
      { x: 610, y: 215, w: 160, h: 18, material: 'wood' },
      { x: 675, y: 160, w: 35, h: 50, material: 'glass' },
      { x: 655, y: 135, w: 75, h: 16, material: 'cardboard' },
    ],
    enemies: [
      { x: 540, y: 365, name: 'Banana Joe', color: '#facc15' },
      { x: 625, y: 365, name: 'Miss Simian', color: '#fb923c' },
      { x: 715, y: 365, name: 'Rob', color: '#a78bfa' },
      { x: 692, y: 265, name: 'Tobias', color: '#c084fc' },
    ],
  },
];

export const AngryGumballGame: React.FC<AngryGumballGameProps> = ({
  onGoHome,
  onGoWorlds,
  isMuted = false,
  onToggleSound,
}) => {
  // Game States
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('angry_gumball_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [shotsLeft, setShotsLeft] = useState<number>(3);
  const [activeShotType, setActiveShotType] = useState<ProjectileType>('jake');
  const [gameState, setGameState] = useState<'aiming' | 'flying' | 'settling' | 'victory' | 'defeat' | 'game_over'>('aiming');
  const [lives, setLives] = useState<number>(3);
  const [showLivesModal, setShowLivesModal] = useState<boolean>(false);
  const [starsWon, setStarsWon] = useState<number>(0);
  const [showArtworkModal, setShowArtworkModal] = useState<boolean>(false);
  const [modalArtworkTab, setModalArtworkTab] = useState<'treehouse' | 'jake' | 'grumosa' | 'elmore'>('treehouse');
  const [selectedBackground, setSelectedBackground] = useState<'treehouse' | 'bedroom'>('treehouse');
  const selectedBackgroundRef = useRef<'treehouse' | 'bedroom'>('treehouse');
  const treehouseImgRef = useRef<HTMLImageElement | null>(null);

  // Character Duo state: default to 'adventure_time' (Jake & Princesa Grumosa)
  const [characterDuo, setCharacterDuo] = useState<'adventure_time' | 'elmore'>('adventure_time');
  const characterDuoRef = useRef<'adventure_time' | 'elmore'>('adventure_time');
  useEffect(() => {
    characterDuoRef.current = characterDuo;
  }, [characterDuo]);

  const [showPhysicsLabInfo, setShowPhysicsLabInfo] = useState<boolean>(false);
  const [gGravity, setGGravity] = useState<number>(9.8); // 9.8 m/s²
  const [slowMo, setSlowMo] = useState<boolean>(false);

  // Slingshot Live Metrics
  const [liveAngleDeg, setLiveAngleDeg] = useState<number>(45);
  const [liveSpeed, setLiveSpeed] = useState<number>(24);
  const [isNear45, setIsNear45] = useState<boolean>(true);
  const [screenShake, setScreenShake] = useState<number>(0);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 130, y: 290 });
  const slingshotOrigin = { x: 135, y: 295 };

  // Physics Entities Ref
  const projectileRef = useRef<Projectile | null>(null);
  const extraProjectilesRef = useRef<Projectile[]>([]); // for Darwin 3-way split
  const blocksRef = useRef<PhysicsBlock[]>([]);
  const enemiesRef = useRef<EnemyTarget[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingScoresRef = useRef<FloatingScore[]>([]);

  // High-Energy Cartoon Animation State Refs
  const animTickRef = useRef<number>(0);
  const comicBannersRef = useRef<ComicBanner[]>([]);
  const debrisRef = useRef<DebrisFragment[]>([]);
  const smokePuffsRef = useRef<SmokePuff[]>([]);
  const slingshotElasticRef = useRef<SlingshotElastic>({
    twangTime: 1.0,
    ampX: 0,
    ampY: 0,
    active: false,
  });
  const gumballMoodRef = useRef<'idle' | 'pulling' | 'cheering' | 'gasp'>('idle');
  const darwinSpeechRef = useRef<{ text: string; timer: number }>({
    text: '¡45° es el secreto balístico! 📐',
    timer: 180,
  });
  const jakeMoodRef = useRef<'idle' | 'pulling' | 'cheering' | 'gasp'>('idle');
  const lspSpeechRef = useRef<{ text: string; timer: number }>({
    text: '¡45° es el ángulo más grumoso del universo! ✨',
    timer: 180,
  });

  // Helper to trigger comic action badges (e.g. ¡KABOOM!, ¡BULLSEYE!)
  const spawnComicBanner = useCallback((text: string, x: number, y: number, color = '#fef08a', bgColor = '#dc2626') => {
    comicBannersRef.current.push({
      id: Math.random(),
      x: Math.max(70, Math.min(x, 780)),
      y: Math.max(50, Math.min(y, 380)),
      text,
      color,
      bgColor,
      scale: 0.3,
      rotation: (Math.random() - 0.5) * 0.35,
      alpha: 1,
      life: 60,
      maxLife: 60,
    });
  }, []);

  const currentLevel = GAME_LEVELS[currentLevelIdx];

  // Initialize or Reset Level
  const initLevel = useCallback((levelIdx: number) => {
    const lvl = GAME_LEVELS[levelIdx];
    setCurrentLevelIdx(levelIdx);
    setShotsLeft(lvl.availableShots.length);
    setActiveShotType(lvl.availableShots[0]);
    setGameState('aiming');
    setStarsWon(0);
    isDraggingRef.current = false;
    dragPosRef.current = { x: slingshotOrigin.x - 30, y: slingshotOrigin.y + 30 };
    projectileRef.current = null;
    extraProjectilesRef.current = [];
    particlesRef.current = [];
    floatingScoresRef.current = [];
    comicBannersRef.current = [];
    debrisRef.current = [];
    smokePuffsRef.current = [];
    gumballMoodRef.current = 'idle';
    darwinSpeechRef.current = { text: '¡Apunta a 45° para máximo alcance! 📐', timer: 180 };
    jakeMoodRef.current = 'idle';
    lspSpeechRef.current = { text: '¡45° es el ángulo más grumoso! ✨', timer: 180 };

    // Blocks
    blocksRef.current = lvl.blocks.map((b, i) => {
      let maxHp = 40;
      let color = '#d97706';
      if (b.material === 'cardboard') {
        maxHp = 25;
        color = '#b45309';
      } else if (b.material === 'wood') {
        maxHp = 60;
        color = '#78350f';
      } else if (b.material === 'glass') {
        maxHp = 15;
        color = '#38bdf8';
      } else if (b.material === 'tnt') {
        maxHp = 10;
        color = '#ef4444';
      }
      return {
        id: i,
        x: b.x,
        y: b.y,
        w: b.w,
        h: b.h,
        vx: 0,
        vy: 0,
        rot: 0,
        vrot: 0,
        material: b.material,
        hp: maxHp,
        maxHp,
        color,
      };
    });

    // Enemies
    enemiesRef.current = lvl.enemies.map((e, i) => ({
      id: i,
      x: e.x,
      y: e.y,
      vx: 0,
      vy: 0,
      radius: 17,
      name: e.name,
      expression: 'idle',
      hp: 30,
      defeated: false,
      points: 5000,
      color: e.color,
    }));
  }, [slingshotOrigin.x, slingshotOrigin.y]);

  const handleRestartLevel = useCallback(() => {
    sfx.playBoing();
    sfx.playPop();
    initLevel(currentLevelIdx);
    spawnComicBanner('¡NIVEL REINICIADO! 🔄', 425, 140, '#fef08a', '#2563eb');
    if (characterDuoRef.current === 'adventure_time') {
      jakeMoodRef.current = 'idle';
      lspSpeechRef.current = { text: '¡Recalibrando bultos! ¡Apunta a 45°! ✨', timer: 160 };
    } else {
      gumballMoodRef.current = 'idle';
      darwinSpeechRef.current = { text: '¡Reiniciando catapultas balísticas! 📐', timer: 160 };
    }
  }, [currentLevelIdx, initLevel, spawnComicBanner]);

  const handleRechargeLives = useCallback(() => {
    sfx.playSparkle();
    setLives(3);
    spawnComicBanner('¡3 VIDAS RECUPERADAS! ❤️❤️❤️', 425, 140, '#fbcfe8', '#db2777');
    if (characterDuoRef.current === 'adventure_time') {
      jakeMoodRef.current = 'cheering';
      lspSpeechRef.current = { text: '¡Bultos al 100%! ¡Tenemos 3 vidas nuevas! 💖✨', timer: 220 };
    } else {
      gumballMoodRef.current = 'cheering';
      darwinSpeechRef.current = { text: '¡Corazones restaurados! ¡Vamos por ese 45°! ❤️🎉', timer: 220 };
    }
  }, [spawnComicBanner]);

  const handleFullRestart = useCallback(() => {
    sfx.playFanfare();
    setLives(3);
    setScore(0);
    initLevel(0);
    spawnComicBanner('¡JUEGO REINICIADO! 🚀', 425, 140, '#fef08a', '#16a34a');
    if (characterDuoRef.current === 'adventure_time') {
      jakeMoodRef.current = 'cheering';
      lspSpeechRef.current = { text: '¡Partida desde cero con 3 vidas! ✨', timer: 200 };
    } else {
      gumballMoodRef.current = 'cheering';
      darwinSpeechRef.current = { text: '¡Partida reiniciada con 3 vidas completas! 📐', timer: 200 };
    }
  }, [initLevel, spawnComicBanner]);

  // Load Level initially
  useEffect(() => {
    initLevel(0);
  }, [initLevel]);

  // Sync background ref for canvas game loop
  useEffect(() => {
    selectedBackgroundRef.current = selectedBackground;
  }, [selectedBackground]);

  // Preload Adventure Time Treehouse Background Image
  useEffect(() => {
    const img = new Image();
    img.src = bgAdventureTreehouse;
    img.onload = () => {
      treehouseImgRef.current = img;
    };
  }, []);

  // Screen shake decay
  useEffect(() => {
    if (screenShake > 0) {
      const timer = setTimeout(() => setScreenShake((s) => Math.max(0, s - 1)), 50);
      return () => clearTimeout(timer);
    }
  }, [screenShake]);

  // Calculate projectile trajectory preview points
  const getTrajectoryPoints = () => {
    const dx = slingshotOrigin.x - dragPosRef.current.x;
    const dy = slingshotOrigin.y - dragPosRef.current.y;
    const power = Math.min(Math.hypot(dx, dy) * 0.38, 35);
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * power * 1.6;
    const vy = -Math.sin(angle) * power * 1.6; // Canvas Y is inverted

    const pts: { x: number; y: number }[] = [];
    const dt = 0.08;
    let px = slingshotOrigin.x;
    let py = slingshotOrigin.y;
    let pvx = vx;
    let pvy = vy;

    for (let i = 0; i < 36; i++) {
      px += pvx * dt * 10;
      py += pvy * dt * 10;
      pvy += gGravity * dt * 2.2; // canvas scale gravity
      if (py > 420 || px > 850) break;
      pts.push({ x: px, y: py });
    }
    return pts;
  };

  // Launch Projectile
  const launchProjectile = () => {
    if (gameState !== 'aiming') return;
    const dx = slingshotOrigin.x - dragPosRef.current.x;
    const dy = slingshotOrigin.y - dragPosRef.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) return; // Too small pull

    const power = Math.min(dist * 0.38, 35);
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * power * 1.6;
    const vy = -Math.sin(angle) * power * 1.6;

    // Trigger Damped Harmonic Elastic Slingshot Twang!
    slingshotElasticRef.current = {
      twangTime: 0,
      ampX: dx,
      ampY: dy,
      active: true,
    };

    // Create active projectile
    projectileRef.current = {
      x: slingshotOrigin.x,
      y: slingshotOrigin.y,
      vx,
      vy,
      radius: activeShotType === 'gumball' || activeShotType === 'jake' ? 18 : activeShotType === 'bomb' ? 16 : activeShotType === 'grumosa' ? 16 : 14,
      type: activeShotType,
      inFlight: true,
      hasCollided: false,
      trail: [],
      rotation: 0,
      squashX: 1,
      squashY: 1,
    };

    sfx.playBoing();
    setGameState('flying');

    // High-energy character reactions
    gumballMoodRef.current = 'cheering';
    jakeMoodRef.current = 'cheering';
    if (isNear45) {
      darwinSpeechRef.current = { text: '¡¡45° PERFECTO!! 🎯🚀', timer: 140 };
      lspSpeechRef.current = { text: '¡¡45° EXACTO!! ¡MIS BULTOS ESTÁN EN LLAMAS! ✨🔥', timer: 140 };
      spawnComicBanner('¡45° EXACTO! 🎯', slingshotOrigin.x + 90, slingshotOrigin.y - 70, '#fef08a', '#8b5cf6');
    } else {
      darwinSpeechRef.current = { text: '¡¡FUEGOOO!! 🚀', timer: 100 };
      lspSpeechRef.current = { text: '¡OH POR MI GLOB! ¡MIRA CÓMO VUELA! 🌟', timer: 120 };
      spawnComicBanner(characterDuoRef.current === 'adventure_time' ? '¡ALGEBRAICO! ⚔️' : '¡LANZAMIENTO! 💨', slingshotOrigin.x + 80, slingshotOrigin.y - 50, '#ffffff', '#3b82f6');
    }

    // Spawn puff particles at slingshot
    for (let i = 0; i < 14; i++) {
      particlesRef.current.push({
        x: slingshotOrigin.x,
        y: slingshotOrigin.y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 25,
        maxLife: 25,
        color: '#f472b6',
        size: Math.random() * 4 + 2,
        shape: 'circle',
      });
    }

    // Set enemies to panic mode
    enemiesRef.current.forEach((en) => {
      if (!en.defeated) en.expression = 'panic';
    });
  };

  // Trigger special mid-air ability
  const handleMidAirPower = () => {
    if (!projectileRef.current || !projectileRef.current.inFlight) return;
    const p = projectileRef.current;

    if (p.type === 'darwin_split' && !p.hasSplit) {
      p.hasSplit = true;
      sfx.playLaser(1400);
      sfx.playPop();
      // Split into 3 Darwins
      const angles = [-0.25, 0.25];
      angles.forEach((offset) => {
        const speed = Math.hypot(p.vx, p.vy);
        const currentAng = Math.atan2(p.vy, p.vx);
        extraProjectilesRef.current.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(currentAng + offset) * speed,
          vy: Math.sin(currentAng + offset) * speed,
          radius: 12,
          type: 'darwin_split',
          inFlight: true,
          hasCollided: false,
          trail: [],
          rotation: 0,
        });
      });
      spawnComicBanner('¡TRI-DARWIN! 🐟', p.x, p.y - 30, '#ffffff', '#ea580c');
      floatingScoresRef.current.push({
        id: Math.random(),
        x: p.x,
        y: p.y - 20,
        text: '¡TRI-DARWIN SPLIT! 🐟🐟🐟',
        alpha: 1,
        color: '#fb923c',
      });
    } else if (p.type === 'bomb' && !p.exploded) {
      // Detonate in mid-air
      detonateBomb(p.x, p.y);
      spawnComicBanner('¡AIR BURST! 💣', p.x, p.y - 30, '#fef08a', '#dc2626');
      p.exploded = true;
      p.inFlight = false;
    } else if (p.type === 'jake' && !p.hasSplit) {
      // Jake Stretchy Fist Power: Transforms into a massive heavy fist rocket!
      p.hasSplit = true;
      p.radius = 26;
      p.vx *= 1.6;
      p.vy *= 0.35;
      sfx.playImpact('heavy');
      sfx.playLaser(700);
      setScreenShake(8);
      spawnComicBanner('¡¡PUÑO DE JAKE!! 👊💥', p.x, p.y - 30, '#fef08a', '#d97706');
      floatingScoresRef.current.push({
        id: Math.random(),
        x: p.x,
        y: p.y - 20,
        text: '¡PUÑO ELÁSTICO! 🐶👊',
        alpha: 1,
        color: '#f59e0b',
      });
      // Golden star particles
      for (let k = 0; k < 12; k++) {
        particlesRef.current.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 30,
          maxLife: 30,
          color: '#facc15',
          size: 4,
          shape: 'star',
        });
      }
    } else if (p.type === 'grumosa' && !p.hasSplit) {
      // Princesa Grumosa Lumpy Shockwave: Releases a dramatic celestial blast!
      p.hasSplit = true;
      sfx.playLaser(1200);
      sfx.playPop(1100);
      setScreenShake(6);
      spawnComicBanner('¡¡ONDA GRUMOSA!! ✨💅', p.x, p.y - 35, '#f0abfc', '#a21caf');
      floatingScoresRef.current.push({
        id: Math.random(),
        x: p.x,
        y: p.y - 20,
        text: '¡ONDA CELESTIAL! 🌟💜',
        alpha: 1,
        color: '#e879f9',
      });

      // Knock back nearby blocks and crack enemies
      blocksRef.current.forEach((b) => {
        const d = Math.hypot(b.x - p.x, b.y - p.y);
        if (d < 110) {
          const force = (110 - d) / 110;
          b.vx += (b.x > p.x ? 1 : -1) * force * 5;
          b.vy -= force * 4;
          b.hp -= 20;
        }
      });
      enemiesRef.current.forEach((en) => {
        const d = Math.hypot(en.x - p.x, en.y - p.y);
        if (d < 120 && !en.defeated) {
          en.hp -= 35;
          en.expression = 'panic';
          if (en.hp <= 0) {
            en.defeated = true;
            setScore((s) => s + en.points);
            spawnComicBanner('¡DRAMA TOTAL! 💅', en.x, en.y - 20, '#f0abfc', '#9333ea');
          }
        }
      });

      // Sparkly violet & gold star burst
      for (let k = 0; k < 20; k++) {
        particlesRef.current.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 35,
          maxLife: 35,
          color: k % 2 === 0 ? '#e879f9' : '#facc15',
          size: 4.5,
          shape: 'star',
        });
      }
    } else if (p.type === 'daisy') {
      // Daisy speed burst
      p.vx *= 1.4;
      p.vy *= 0.6;
      sfx.playPop(850);
      spawnComicBanner('¡TURBO DAISY! 💖', p.x, p.y - 30, '#fbcfe8', '#db2777');
      floatingScoresRef.current.push({
        id: Math.random(),
        x: p.x,
        y: p.y - 20,
        text: '¡TURBO DAISY! 💖',
        alpha: 1,
        color: '#f472b6',
      });
    }
  };

  // Detonate TNT / Bomb Shockwave
  const detonateBomb = (bx: number, by: number) => {
    sfx.playImpact('heavy');
    sfx.playLaser(400);
    setScreenShake(12);

    // Comic Banner
    spawnComicBanner('¡¡KABOOOM!! 🧨💥', bx, by - 40, '#fef08a', '#dc2626');

    // Smoke Puffs
    for (let s = 0; s < 8; s++) {
      smokePuffsRef.current.push({
        x: bx + (Math.random() - 0.5) * 45,
        y: by + (Math.random() - 0.5) * 45,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2.5 - 1,
        radius: Math.random() * 16 + 12,
        maxRadius: 52,
        alpha: 0.85,
        color: '#334155',
      });
    }

    // Shockwave radius
    const shockRadius = 140;

    // Spawn blast particles
    for (let i = 0; i < 40; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 8 + 3;
      particlesRef.current.push({
        x: bx,
        y: by,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 35,
        maxLife: 35,
        color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#ef4444' : '#fde047',
        size: Math.random() * 6 + 3,
        shape: 'star',
      });
    }

    // Damage blocks within radius
    blocksRef.current.forEach((b) => {
      const centerX = b.x + b.w / 2;
      const centerY = b.y + b.h / 2;
      const dist = Math.hypot(centerX - bx, centerY - by);
      if (dist < shockRadius) {
        const force = (1 - dist / shockRadius) * 22;
        const ang = Math.atan2(centerY - by, centerX - bx);
        b.vx += Math.cos(ang) * force;
        b.vy += Math.sin(ang) * force - 4; // Upward kick
        b.vrot += (Math.random() - 0.5) * 0.3;
        b.hp -= 40;
      }
    });

    // Damage enemies within radius
    enemiesRef.current.forEach((en) => {
      if (en.defeated) return;
      const dist = Math.hypot(en.x - bx, en.y - by);
      if (dist < shockRadius) {
        en.defeated = true;
        en.expression = 'hit';
        sfx.playVictoryFanfare();
        setScore((s) => s + en.points);
        spawnComicBanner('¡BULLSEYE! 🎯', en.x, en.y - 30, '#fef08a', '#10b981');
        floatingScoresRef.current.push({
          id: Math.random(),
          x: en.x,
          y: en.y - 20,
          text: `+${en.points} PTS! 💥`,
          alpha: 1,
          color: '#fbbf24',
        });
      }
    });

    floatingScoresRef.current.push({
      id: Math.random(),
      x: bx,
      y: by - 30,
      text: '¡¡BOOOM!! 🧨💥',
      alpha: 1,
      color: '#ef4444',
    });
  };

  // Main Physics Engine Update Loop (runs at 60 FPS)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = slowMo ? 0.008 : 0.022;
    const groundY = 415;

    const gameLoop = () => {
      animTickRef.current += 1;
      const tick = animTickRef.current;

      // --- UPDATE PHYSICS ---
      const activeProjectiles = [
        ...(projectileRef.current && projectileRef.current.inFlight ? [projectileRef.current] : []),
        ...extraProjectilesRef.current.filter((p) => p.inFlight),
      ];

      // Update Projectiles
      activeProjectiles.forEach((p) => {
        p.vy += gGravity * dt * 2.2 * 10;
        p.x += p.vx * dt * 30;
        p.y += p.vy * dt * 30;
        p.rotation = (p.rotation || 0) + Math.hypot(p.vx, p.vy) * 0.12;

        // Trail
        p.trail.push({ x: p.x, y: p.y, alpha: 1 });
        if (p.trail.length > 25) p.trail.shift();

        // Real-time animation particle emitters in flight!
        if (p.type === 'daisy' && tick % 2 === 0) {
          particlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 20,
            maxLife: 20,
            color: Math.random() > 0.5 ? '#f472b6' : '#fbcfe8',
            size: Math.random() * 4 + 3,
            shape: 'star',
          });
        } else if (p.type === 'gumball' && tick % 2 === 0) {
          particlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: -p.vx * 0.15 + (Math.random() - 0.5) * 2,
            vy: -p.vy * 0.15 + (Math.random() - 0.5) * 2,
            life: 18,
            maxLife: 18,
            color: '#38bdf8',
            size: 3,
            shape: 'spark',
          });
        } else if (p.type === 'darwin_split' && tick % 2 === 0) {
          particlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 20,
            maxLife: 20,
            color: '#38bdf8',
            size: 2.5,
            shape: 'circle',
          });
        } else if (p.type === 'bomb' && tick % 2 === 0) {
          particlesRef.current.push({
            x: p.x + Math.cos(p.rotation || 0) * 8,
            y: p.y - 12,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3 - 1,
            life: 15,
            maxLife: 15,
            color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
            size: 2.5,
            shape: 'spark',
          });
        }

        // Ground Collision
        if (p.y + p.radius >= groundY) {
          p.y = groundY - p.radius;
          p.vy = -p.vy * 0.45; // bounce
          p.vx *= 0.75; // friction
          p.hasCollided = true;
          // Dust puff on ground impact
          smokePuffsRef.current.push({
            x: p.x,
            y: groundY - 2,
            vx: (Math.random() - 0.5) * 2,
            vy: -1,
            radius: 8,
            maxRadius: 22,
            alpha: 0.6,
            color: '#cbd5e1',
          });
          if (Math.abs(p.vy) < 1 && Math.abs(p.vx) < 1) {
            p.inFlight = false;
          }
        }

        // Walls
        if (p.x > 840 || p.x < 10) {
          p.inFlight = false;
        }

        // Check Collision with Blocks
        blocksRef.current.forEach((b) => {
          if (b.hp <= 0) return;
          // Circle vs AABB collision
          const closestX = Math.max(b.x, Math.min(p.x, b.x + b.w));
          const closestY = Math.max(b.y, Math.min(p.y, b.y + b.h));
          const distX = p.x - closestX;
          const distY = p.y - closestY;
          const distSq = distX * distX + distY * distY;

          if (distSq < p.radius * p.radius) {
            // Collision detected!
            p.hasCollided = true;
            sfx.playImpact('light');
            const impactForce = Math.hypot(p.vx, p.vy);

            // Damage block
            b.hp -= impactForce * 1.5;
            b.vx += p.vx * 0.35;
            b.vy += p.vy * 0.25;
            b.vrot += (p.vx > 0 ? 0.05 : -0.05) * (impactForce / 15);

            // Rebound projectile
            p.vx *= -0.3;
            p.vy *= -0.3;

            // Trigger TNT
            if (b.material === 'tnt' && impactForce > 5) {
              b.hp = 0;
              detonateBomb(b.x + b.w / 2, b.y + b.h / 2);
            }

            // Glass shattering
            if (b.material === 'glass') {
              sfx.playLaser(1800);
              for (let k = 0; k < 8; k++) {
                particlesRef.current.push({
                  x: closestX,
                  y: closestY,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 20,
                  maxLife: 20,
                  color: '#7dd3fc',
                  size: 2.5,
                  shape: 'spark',
                });
              }
            }
          }
        });

        // Check Collision with Enemies
        enemiesRef.current.forEach((en) => {
          if (en.defeated) return;
          const d = Math.hypot(p.x - en.x, p.y - en.y);
          if (d < p.radius + en.radius) {
            // Defeated!
            en.defeated = true;
            en.expression = 'hit';
            sfx.playImpact('heavy');
            sfx.playPop(900);
            setScore((s) => s + en.points);

            gumballMoodRef.current = 'cheering';
            jakeMoodRef.current = 'cheering';
            darwinSpeechRef.current = { text: '¡¡DIRECTO AL BLANCO!! 🎯🔥', timer: 140 };
            lspSpeechRef.current = { text: '¡¡LOS HICISTE PURÉ GRUMOSO!! 💜💥', timer: 140 };
            spawnComicBanner(characterDuoRef.current === 'adventure_time' ? '¡¡BULLSEYE DE JAKE!! 🐶🎯' : '¡BULLSEYE! 🎯', en.x, en.y - 30, '#fef08a', '#10b981');

            floatingScoresRef.current.push({
              id: Math.random(),
              x: en.x,
              y: en.y - 25,
              text: `+${en.points} PTS! 🎯`,
              alpha: 1,
              color: '#34d399',
            });

            // Particles
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push({
                x: en.x,
                y: en.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 30,
                maxLife: 30,
                color: en.color,
                size: Math.random() * 5 + 2,
                shape: 'star',
              });
            }

            p.vx *= 0.5;
            p.vy *= 0.5;
          }
        });
      });

      // Update Blocks Physics (Gravity, rotation, ground, destruction)
      blocksRef.current.forEach((b) => {
        if (b.hp <= 0) {
          if (!b.destroyed) {
            b.destroyed = true;
            setScore((s) => s + 250);
            const frags = spawnDebrisExplosion(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, b.material, b.color);
            debrisRef.current.push(...frags);
            smokePuffsRef.current.push({
              x: b.x + b.w / 2,
              y: b.y + b.h / 2,
              vx: 0,
              vy: -0.6,
              radius: 12,
              maxRadius: 30,
              alpha: 0.7,
              color: '#94a3b8',
            });
            const comicWords = ['¡CRASH! 💥', '¡SMASH! 🔨', '¡DEMOLICIÓN! ⚡'];
            spawnComicBanner(comicWords[Math.floor(Math.random() * comicWords.length)], b.x + b.w / 2, b.y - 15, '#ffffff', '#f59e0b');
          }
          return;
        }

        b.vy += gGravity * dt * 2.2 * 8;
        b.x += b.vx * dt * 25;
        b.y += b.vy * dt * 25;
        b.rot += b.vrot;
        b.vx *= 0.96;
        b.vrot *= 0.94;

        // Ground collision for blocks
        if (b.y + b.h >= groundY) {
          b.y = groundY - b.h;
          b.vy = 0;
          b.vx *= 0.85;
          b.vrot *= 0.8;
        }
      });

      // Update Debris Fragments
      debrisRef.current.forEach((d) => {
        d.vy += gGravity * dt * 2.2 * 8;
        d.x += d.vx * dt * 25;
        d.y += d.vy * dt * 25;
        d.rot += d.vrot;
        d.alpha -= 0.012;
        if (d.y > groundY - 4) {
          d.y = groundY - 4;
          d.vy = -d.vy * 0.35;
          d.vx *= 0.8;
        }
      });
      debrisRef.current = debrisRef.current.filter((d) => d.alpha > 0);

      // Update Smoke Puffs
      smokePuffsRef.current.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.radius += 0.55;
        sp.alpha -= 0.018;
      });
      smokePuffsRef.current = smokePuffsRef.current.filter((sp) => sp.alpha > 0);

      // Update Comic Banners
      comicBannersRef.current.forEach((cb) => {
        cb.life -= 1;
        cb.y -= 0.55;
        if (cb.scale < 1.0) cb.scale += (1.0 - cb.scale) * 0.35;
        if (cb.life < 15) cb.alpha = cb.life / 15;
      });
      comicBannersRef.current = comicBannersRef.current.filter((cb) => cb.life > 0);

      // Update Slingshot Elastic Twang
      if (slingshotElasticRef.current.active) {
        slingshotElasticRef.current.twangTime += dt * 3.5;
        if (slingshotElasticRef.current.twangTime > 1.0) {
          slingshotElasticRef.current.active = false;
        }
      }

      // Update Darwin Speech Timer
      if (darwinSpeechRef.current.timer > 0) {
        darwinSpeechRef.current.timer -= 1;
      }

      // Update Enemies (Gravity and falling)
      enemiesRef.current.forEach((en) => {
        if (en.defeated) return;
        en.vy += gGravity * dt * 2.2 * 8;
        en.x += en.vx * dt * 25;
        en.y += en.vy * dt * 25;
        en.vx *= 0.95;

        // Ground
        if (en.y + en.radius >= groundY) {
          en.y = groundY - en.radius;
          en.vy = 0;
        }

        // Check if block fell on enemy
        blocksRef.current.forEach((b) => {
          if (b.hp <= 0) return;
          if (
            en.x > b.x &&
            en.x < b.x + b.w &&
            en.y > b.y &&
            en.y < b.y + b.h &&
            Math.hypot(b.vx, b.vy) > 2
          ) {
            en.defeated = true;
            en.expression = 'hit';
            sfx.playImpact('heavy');
            setScore((s) => s + en.points);
            spawnComicBanner('¡APLASTADO! 💥', en.x, en.y - 30, '#fef08a', '#dc2626');
            floatingScoresRef.current.push({
              id: Math.random(),
              x: en.x,
              y: en.y - 25,
              text: `¡APLASTADO! +${en.points} 💥`,
              alpha: 1,
              color: '#facc15',
            });
          }
        });
      });

      // Update Particles
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15; // particle gravity
        pt.life -= 1;
      });
      particlesRef.current = particlesRef.current.filter((pt) => pt.life > 0);

      // Update Floating Scores
      floatingScoresRef.current.forEach((fs) => {
        fs.y -= 1;
        fs.alpha -= 0.02;
      });
      floatingScoresRef.current = floatingScoresRef.current.filter((fs) => fs.alpha > 0);

      // --- CHECK VICTORY / ROUND ADVANCE ---
      const allDefeated = enemiesRef.current.every((en) => en.defeated);
      const anyInFlight =
        (projectileRef.current && projectileRef.current.inFlight) ||
        extraProjectilesRef.current.some((p) => p.inFlight);

      if (allDefeated && gameState !== 'victory') {
        setGameState('victory');
        sfx.playVictoryFanfare();
        gumballMoodRef.current = 'cheering';
        jakeMoodRef.current = 'cheering';
        darwinSpeechRef.current = { text: '¡¡VICTORIA TOTAL!! 🎉⭐', timer: 300 };
        lspSpeechRef.current = { text: '¡¡TODOS QUIEREN MIS BULTOS GANADORES!! 👑✨', timer: 300 };
        spawnComicBanner(characterDuoRef.current === 'adventure_time' ? '¡¡MATEMÁTICO!! ⭐⭐⭐' : '¡¡VICTORIA!! ⭐⭐⭐', 425, 120, '#fef08a', '#16a34a');

        // Calculate stars
        const stars = shotsLeft >= 2 ? 3 : shotsLeft === 1 ? 2 : 1;
        setStarsWon(stars);
        // Bonus for shots left
        const bonus = shotsLeft * 5000;
        setScore((s) => {
          const finalScore = s + bonus;
          if (finalScore > highScore) {
            setHighScore(finalScore);
            try {
              localStorage.setItem('angry_gumball_highscore', String(finalScore));
            } catch {}
          }
          return finalScore;
        });
      } else if (!anyInFlight && gameState === 'flying') {
        // Projectile has finished its trajectory
        setTimeout(() => {
          if (!enemiesRef.current.every((en) => en.defeated)) {
            if (shotsLeft - 1 > 0) {
              setShotsLeft((sl) => sl - 1);
              const nextShot = currentLevel.availableShots[currentLevel.availableShots.length - (shotsLeft - 1)];
              setActiveShotType(characterDuoRef.current === 'adventure_time' ? (nextShot === 'darwin_split' ? 'jake' : nextShot === 'gumball' ? 'grumosa' : nextShot) : (nextShot || 'daisy'));
              setGameState('aiming');
              projectileRef.current = null;
              extraProjectilesRef.current = [];
              gumballMoodRef.current = 'idle';
              jakeMoodRef.current = 'idle';
              darwinSpeechRef.current = { text: '¡Apunta a 45° para máximo alcance! 📐', timer: 140 };
              lspSpeechRef.current = { text: '¡Ugh, concéntrate y usa 45°! 💅✨', timer: 140 };
            } else {
              setShotsLeft(0);
              sfx.playImpact('heavy');
              gumballMoodRef.current = 'gasp';
              jakeMoodRef.current = 'gasp';

              // Deduct a life and determine if defeat or total game over
              setLives((prevLives) => {
                const nextLives = Math.max(0, prevLives - 1);
                if (nextLives === 0) {
                  setGameState('game_over');
                  darwinSpeechRef.current = { text: '¡Se nos acabaron las vidas! 😿💔', timer: 320 };
                  lspSpeechRef.current = { text: '¡¡NOOO! ¡¡TODAS LAS VIDAS SE ESFUMARON!! 💔😭', timer: 320 };
                  spawnComicBanner('¡¡SIN VIDAS!! 💀💔', 425, 130, '#ffffff', '#b91c1c');
                } else {
                  setGameState('defeat');
                  darwinSpeechRef.current = { text: `¡Perdimos 1 vida! Quedan ${nextLives} ❤️`, timer: 220 };
                  lspSpeechRef.current = { text: `¡QUÉ DRAMA! ¡Solo quedan ${nextLives} vidas! 💔😱`, timer: 220 };
                  spawnComicBanner(`¡VIDA PERDIDA! 💔 (${nextLives} restantes)`, 425, 130, '#ffffff', '#ef4444');
                }
                return nextLives;
              });
            }
          }
        }, 1200);
      }

      // --- RENDER CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const confettiColors = ['#ec4899', '#3b82f6', '#eab308', '#10b981', '#a855f7', '#f97316'];

      // Camera shake offset
      ctx.save();
      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 3;
        const sy = (Math.random() - 0.5) * screenShake * 3;
        ctx.translate(sx, sy);
      }

      // 1. DYNAMIC BACKGROUND (Treehouse at Sunset or Bedroom)
      if (selectedBackgroundRef.current === 'treehouse') {
        // --- ADVENTURE TIME TREE FORT AT SUNSET ---
        if (treehouseImgRef.current && treehouseImgRef.current.complete && treehouseImgRef.current.naturalWidth > 0) {
          const img = treehouseImgRef.current;
          const targetRatio = canvas.width / canvas.height;
          const imgRatio = img.naturalWidth / img.naturalHeight;

          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (imgRatio < targetRatio) {
            sh = img.naturalWidth / targetRatio;
            sy = (img.naturalHeight - sh) * 0.36; // Perfectly frame the treehouse and glowing sun
          } else {
            sw = img.naturalHeight * targetRatio;
            sx = (img.naturalWidth - sw) * 0.5;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

          // Subtle warm twilight tint to boost contrast of blocks and projectiles
          const sunWarmth = ctx.createLinearGradient(0, 0, 0, canvas.height);
          sunWarmth.addColorStop(0, 'rgba(251, 146, 60, 0.05)');
          sunWarmth.addColorStop(0.65, 'rgba(0, 0, 0, 0.0)');
          sunWarmth.addColorStop(1, 'rgba(15, 23, 42, 0.22)');
          ctx.fillStyle = sunWarmth;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Warm sunset fallback gradient while image is loading
          const sunsetGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          sunsetGrad.addColorStop(0, '#ea580c');
          sunsetGrad.addColorStop(0.4, '#f59e0b');
          sunsetGrad.addColorStop(0.75, '#fef08a');
          sunsetGrad.addColorStop(1, '#65a30d');
          ctx.fillStyle = sunsetGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Floating fluffy clouds across the sunset sky
        drawAnimatedClouds(ctx, tick);

        // Rolling grassy ground at collision plane (groundY = 415)
        ctx.save();
        // Grassy rim highlight
        ctx.fillStyle = 'rgba(134, 239, 172, 0.45)';
        ctx.fillRect(0, groundY - 2, canvas.width, 3);

        // Ground depth gradient blending with Land of Ooo hills
        const hillSoilGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
        hillSoilGrad.addColorStop(0, 'rgba(34, 197, 94, 0.94)');
        hillSoilGrad.addColorStop(0.35, 'rgba(22, 163, 74, 0.98)');
        hillSoilGrad.addColorStop(1, 'rgba(20, 83, 45, 1.0)');
        ctx.fillStyle = hillSoilGrad;
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        // Cartoon grass blades along the surface
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2;
        for (let gx = 10; gx < canvas.width; gx += 26) {
          ctx.beginPath();
          ctx.moveTo(gx, groundY);
          ctx.lineTo(gx - 3, groundY - 6);
          ctx.moveTo(gx, groundY);
          ctx.lineTo(gx + 3, groundY - 8);
          ctx.moveTo(gx, groundY);
          ctx.lineTo(gx + 6, groundY - 5);
          ctx.stroke();
        }

        // Cheerful wildflowers on the hill
        for (let fx = 28; fx < canvas.width; fx += 70) {
          const fColor = fx % 140 === 0 ? '#f472b6' : '#ffffff';
          ctx.fillStyle = fColor;
          ctx.beginPath();
          ctx.arc(fx, groundY + 9, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(fx, groundY + 9, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        // --- CLASSIC ELMORE BEDROOM BACKGROUND ---
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#bfdbfe');
        bgGrad.addColorStop(0.7, '#e0f2fe');
        bgGrad.addColorStop(1, '#fef08a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animated Clouds in window/sky
        drawAnimatedClouds(ctx, tick);

        // Animated Chromatic Pulse Rainbow
        drawAnimatedRainbow(ctx, tick);

        // Confetti on the floor
        ctx.save();
        for (let i = 0; i < 40; i++) {
          const cx = (i * 37) % 850;
          const cy = 415 + (i * 13) % 45;
          ctx.fillStyle = confettiColors[i % confettiColors.length];
          ctx.fillRect(cx, cy, 6, 4);
        }
        ctx.restore();

        // Wooden Floor
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, groundY, canvas.width, 50);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(0, groundY, canvas.width, 6);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < canvas.width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, groundY);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      }

      // 2. Cardboard Castle Fortress on the Left
      ctx.fillStyle = '#9ca3af';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.fillRect(40, 310, 130, 105);
      ctx.strokeRect(40, 310, 130, 105);

      for (let i = 0; i < 4; i++) {
        ctx.fillRect(40 + i * 34, 292, 22, 20);
        ctx.strokeRect(40 + i * 34, 292, 22, 20);
      }

      // Purple paper cone towers
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(25, 310);
      ctx.lineTo(45, 250);
      ctx.lineTo(65, 310);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(145, 310);
      ctx.lineTo(165, 250);
      ctx.lineTo(185, 310);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tape details
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(55, 330, 35, 10);
      ctx.fillRect(120, 360, 30, 10);

      // 3. ANIMATED CHARACTERS (Jake the Dog & Princesa Grumosa vs Gumball & Darwin)
      if (characterDuoRef.current === 'adventure_time') {
        drawAnimatedJake(
          ctx,
          tick,
          jakeMoodRef.current,
          isDraggingRef.current ? dragPosRef.current : undefined,
          slingshotOrigin
        );

        const targetForLSP = activeProjectiles.length > 0
          ? { x: activeProjectiles[0].x, y: activeProjectiles[0].y }
          : isDraggingRef.current
          ? dragPosRef.current
          : null;
        drawAnimatedLumpyPrincess(
          ctx,
          tick,
          targetForLSP,
          lspSpeechRef.current.text,
          lspSpeechRef.current.timer
        );
      } else {
        drawAnimatedGumball(
          ctx,
          tick,
          gumballMoodRef.current,
          isDraggingRef.current ? dragPosRef.current : undefined,
          slingshotOrigin
        );

        const targetForDarwin = activeProjectiles.length > 0
          ? { x: activeProjectiles[0].x, y: activeProjectiles[0].y }
          : isDraggingRef.current
          ? dragPosRef.current
          : null;
        drawAnimatedDarwin(ctx, tick, targetForDarwin, darwinSpeechRef.current.text, darwinSpeechRef.current.timer);
      }

      // 5. ANIMATED SLINGSHOT & DAMPED ELASTIC BANDS
      drawSlingshotAndBands(
        ctx,
        slingshotOrigin,
        isDraggingRef.current,
        dragPosRef.current,
        slingshotElasticRef.current,
        tick
      );

      // Trajectory Guide Line with Sparkle Wave
      if (gameState === 'aiming' || isDraggingRef.current) {
        const curDrag = dragPosRef.current;

        // Projectile in pocket (preview with soft breathing)
        ctx.save();
        ctx.translate(curDrag.x, curDrag.y);
        const pouchScale = 1 + Math.sin(tick * 0.1) * 0.05;
        ctx.scale(pouchScale, pouchScale);
        drawProjectileIcon(ctx, activeShotType, 14);
        ctx.restore();

        // Parabolic Trajectory Guide Line (Rainbow sparkles like in image!)
        const trajectory = getTrajectoryPoints();
        ctx.save();
        trajectory.forEach((pt, i) => {
          const waveOff = Math.sin(tick * 0.15 + i * 0.3) * 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y + waveOff, i % 2 === 0 ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fillStyle = confettiColors[i % confettiColors.length];
          ctx.globalAlpha = Math.max(0.2, 1 - i / trajectory.length);
          ctx.fill();
        });

        // Target crosshair at end of preview with animated rotating reticle
        if (trajectory.length > 5) {
          const endPt = trajectory[trajectory.length - 1];
          ctx.save();
          ctx.translate(endPt.x, endPt.y);
          ctx.rotate(tick * 0.05);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.moveTo(-13, 0);
          ctx.lineTo(13, 0);
          ctx.moveTo(0, -13);
          ctx.lineTo(0, 13);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }

      // 6. Render Active Projectiles & Trails with Rotation
      activeProjectiles.forEach((p) => {
        p.trail.forEach((t, ti) => {
          ctx.beginPath();
          ctx.arc(t.x, t.y, (ti / p.trail.length) * 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#f472b6';
          ctx.globalAlpha = ti / p.trail.length;
          ctx.fill();
        });

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        drawProjectileIcon(ctx, p.type, p.radius);
        ctx.restore();
      });

      // 7. Render Blocks with Stress Cracks when damaged
      blocksRef.current.forEach((b) => {
        if (b.hp <= 0) return;
        ctx.save();
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        ctx.rotate(b.rot);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';

        if (b.material === 'cardboard') {
          ctx.fillStyle = b.color;
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-b.w / 2 + 5, -5, b.w - 10, 8);
        } else if (b.material === 'wood') {
          ctx.fillStyle = b.color;
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeStyle = '#451a03';
          ctx.beginPath();
          ctx.moveTo(-b.w / 2 + 4, 0);
          ctx.lineTo(b.w / 2 - 4, 0);
          ctx.stroke();
        } else if (b.material === 'glass') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-b.w / 2 + 6, -b.h / 2 + 6);
          ctx.lineTo(b.w / 2 - 6, b.h / 2 - 6);
          ctx.stroke();
        } else if (b.material === 'tnt') {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'black 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TNT', 0, 4);
        }

        // Stress cracks when damaged
        if (b.hp < b.maxHp * 0.7) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-b.w / 3, -b.h / 3);
          ctx.lineTo(0, 0);
          ctx.lineTo(b.w / 4, -b.h / 4);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 8. Render Debris Fragments (Flying wooden splinters, glass shards, cardboard scraps)
      drawDebris(ctx, debrisRef.current);

      // 9. Render Enemies with Live Expressions, Shivering, and 3D Knockout Stars
      enemiesRef.current.forEach((en) => {
        // Threat detection: projectile flying close or player aiming towards it
        const isThreatened =
          isDraggingRef.current ||
          activeProjectiles.some((p) => Math.hypot(p.x - en.x, p.y - en.y) < 180);
        drawAnimatedEnemy(ctx, en, tick, isThreatened);
      });

      // 10. Render Smoke & Dust Puffs
      drawSmokePuffs(ctx, smokePuffsRef.current);

      // 11. Render Comic Action Banners ("¡KABOOM!", "¡45° EXACTO!", etc.)
      drawComicBanners(ctx, comicBannersRef.current);

      // 12. Render Particles
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        if (pt.shape === 'star') {
          ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 13. Floating Scores
      floatingScoresRef.current.forEach((fs) => {
        ctx.save();
        ctx.font = 'black 13px sans-serif';
        ctx.fillStyle = fs.color;
        ctx.globalAlpha = fs.alpha;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(fs.text, fs.x, fs.y);
        ctx.fillText(fs.text, fs.x, fs.y);
        ctx.restore();
      });

      ctx.restore(); // Restore camera shake

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, slowMo, gGravity, shotsLeft, currentLevel, highScore]);

  // Helper to draw projectile icons
  const drawProjectileIcon = (ctx: CanvasRenderingContext2D, type: ProjectileType, radius: number) => {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#000';

    if (type === 'jake') {
      // Jake the Dog - Golden magic dog
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Floppy ears flapping
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(-radius - 3, -4, 4, 8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(radius + 3, -4, 4, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Big round white cartoon eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -2, 5, 0, Math.PI * 2);
      ctx.arc(5, -2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Black pupils
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Drooping jowls
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-3.5, 4, 4, 0, Math.PI * 2);
      ctx.arc(3.5, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Black nose
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.ellipse(0, 2, 2.5, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'grumosa') {
      // Princesa Grumosa (Lumpy Space Princess) - Puffy Lavender Cloud
      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.arc(-radius * 0.7, -radius * 0.25, radius * 0.5, 0, Math.PI * 2);
      ctx.arc(radius * 0.7, -radius * 0.25, radius * 0.5, 0, Math.PI * 2);
      ctx.arc(-radius * 0.45, radius * 0.55, radius * 0.5, 0, Math.PI * 2);
      ctx.arc(radius * 0.45, radius * 0.55, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden Star on forehead
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, -radius * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sassy eyes
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 1.5, 2.2, 0, 0, Math.PI * 2);
      ctx.ellipse(4, 0, 1.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sassy pout mouth
      ctx.strokeStyle = '#831843';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 5, 2.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (type === 'daisy') {
      // Pink Bunny Stuffed Toy (Daisy, from the photo!)
      ctx.fillStyle = '#f472b6';
      // Head
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bunny Ears
      ctx.beginPath();
      ctx.ellipse(-6, -radius - 5, 4, 9, -0.2, 0, Math.PI * 2);
      ctx.ellipse(6, -radius - 5, 4, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner ears
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(-6, -radius - 5, 2, 6, -0.2, 0, Math.PI * 2);
      ctx.ellipse(6, -radius - 5, 2, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Cute face
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-4, -1, 1.5, 0, Math.PI * 2);
      ctx.arc(4, -1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Pink cheeks
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(-7, 3, 2.5, 0, Math.PI * 2);
      ctx.arc(7, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'gumball') {
      // Gumball heavy blue head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cat ears
      ctx.beginPath();
      ctx.moveTo(-10, -radius + 4);
      ctx.lineTo(-6, -radius - 6);
      ctx.lineTo(0, -radius + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Fierce face
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-4, -1, 4, 0, Math.PI * 2);
      ctx.arc(4, -1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-3, -1, 2, 0, Math.PI * 2);
      ctx.arc(5, -1, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'darwin_split') {
      // Darwin Orange Fish
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-radius, 0);
      ctx.lineTo(-radius - 7, -5);
      ctx.lineTo(-radius - 7, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Big Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(2, -2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'bomb') {
      // Black TNT Bomb
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fuse
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.quadraticCurveTo(5, -radius - 7, 8, -radius - 12);
      ctx.stroke();
      // Spark
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(8, -radius - 12, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Mouse / Touch Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'aiming') {
      // In-flight: tapping screen activates special ability!
      handleMidAirPower();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 850;
    const y = ((e.clientY - rect.top) / rect.height) * 450;

    // Check if clicked directly on Jake or Gumball (interactive character touch!)
    const distToChar1 = Math.hypot(x - 88, y - 246);
    if (distToChar1 < 38) {
      sfx.playBoing();
      if (characterDuoRef.current === 'adventure_time') {
        jakeMoodRef.current = 'cheering';
        lspSpeechRef.current = { text: '¡Jake dice: ¡Apunta a 45° socio! 🐶⭐', timer: 180 };
        spawnComicBanner('¡WOOF! ¡SOY JAKE! 🐶✨', 115, 190, '#fef08a', '#d97706');
      } else {
        gumballMoodRef.current = 'cheering';
        darwinSpeechRef.current = { text: '¡Esa es mi peluca mágica! 🐱🎀', timer: 180 };
        spawnComicBanner('¡GUMBALL EN ACCIÓN! 🐱', 115, 190, '#fef08a', '#0284c7');
      }
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: 88,
          y: 246,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 5 - 2,
          life: 35,
          maxLife: 35,
          color: '#facc15',
          size: 4 + Math.random() * 3,
          shape: 'star',
        });
      }
      return;
    }

    // Check if clicked directly on Princesa Grumosa or Darwin (interactive spectator!)
    const distToChar2 = Math.hypot(x - 205, y - 258);
    if (distToChar2 < 40) {
      sfx.playSparkle();
      if (characterDuoRef.current === 'adventure_time') {
        lspSpeechRef.current = {
          text: '¡¡AY POR FAVOR! ¡NO TOQUES MIS BULTOS, BRAD MIRA! 💅✨',
          timer: 200,
        };
        spawnComicBanner('¡NO TOQUES MIS BULTOS! 💅', 230, 190, '#fdf4ff', '#9333ea');
      } else {
        darwinSpeechRef.current = {
          text: '¡R = v₀²·sen(2θ)/g! ¡Usa 45° siempre! 🐟📐',
          timer: 200,
        };
        spawnComicBanner('¡DARWIN 45°! 🐟⭐', 230, 190, '#ecfeff', '#0284c7');
      }
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          x: 205,
          y: 258,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 6 - 1,
          life: 40,
          maxLife: 40,
          color: '#e879f9',
          size: 4 + Math.random() * 4,
          shape: 'star',
        });
      }
      return;
    }

    // Check if clicked near slingshot
    const distToSlingshot = Math.hypot(x - slingshotOrigin.x, y - slingshotOrigin.y);
    if (distToSlingshot < 75) {
      isDraggingRef.current = true;
      dragPosRef.current = { x, y };
      gumballMoodRef.current = 'pulling';
      jakeMoodRef.current = 'pulling';
      updateLiveMetrics(x, y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 850;
    const y = ((e.clientY - rect.top) / rect.height) * 450;

    gumballMoodRef.current = 'pulling';
    jakeMoodRef.current = 'pulling';

    // Clamp drag distance
    const maxDist = 95;
    const dx = x - slingshotOrigin.x;
    const dy = y - slingshotOrigin.y;
    const dist = Math.hypot(dx, dy);

    if (dist > maxDist) {
      const angle = Math.atan2(dy, dx);
      dragPosRef.current = {
        x: slingshotOrigin.x + Math.cos(angle) * maxDist,
        y: slingshotOrigin.y + Math.sin(angle) * maxDist,
      };
    } else {
      dragPosRef.current = { x, y };
    }

    updateLiveMetrics(dragPosRef.current.x, dragPosRef.current.y);
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      launchProjectile();
    } else {
      gumballMoodRef.current = 'idle';
      jakeMoodRef.current = 'idle';
    }
  };

  const updateLiveMetrics = (dragX: number, dragY: number) => {
    const dx = slingshotOrigin.x - dragX;
    const dy = slingshotOrigin.y - dragY;
    const angleRad = Math.atan2(dy, dx);
    const deg = Math.round((angleRad * 180) / Math.PI);
    const speed = Math.round(Math.min(Math.hypot(dx, dy) * 0.38, 35));

    setLiveAngleDeg(deg);
    setLiveSpeed(speed);
    const near45 = deg >= 42 && deg <= 48;
    setIsNear45(near45);

    if (near45) {
      darwinSpeechRef.current = { text: '¡¡45° EXACTO!! ¡SUELTA! 🎯🔥', timer: 45 };
      lspSpeechRef.current = { text: '¡¡45° EXACTO!! ¡MIS BULTOS DICEN DISPARA! ✨💅', timer: 45 };
    } else if (deg < 38 && deg > 10) {
      darwinSpeechRef.current = { text: '¡Sube a 45° para más alcance! 📐', timer: 40 };
      lspSpeechRef.current = { text: '¡Ugh, qué flojera! ¡Súbelo a 45°! 🙄', timer: 40 };
    } else if (deg > 52) {
      darwinSpeechRef.current = { text: '¡Muy alto! Baja hacia 45° 📐', timer: 40 };
      lspSpeechRef.current = { text: '¡¿Al espacio grumoso?! ¡Bájale a 45°! 💅', timer: 40 };
    }
  };

  return (
    <div className="min-h-screen relative bg-[#070b19] text-white flex flex-col items-center justify-between p-2 sm:p-4 font-sans select-none overflow-x-hidden">
      {/* Ambient Sunset Glow from the Treehouse Background */}
      {selectedBackground === 'treehouse' && (
        <div
          className="fixed inset-0 pointer-events-none opacity-20 bg-cover bg-center filter blur-xl scale-110 z-0 transition-opacity duration-700"
          style={{ backgroundImage: `url(${bgAdventureTreehouse})` }}
        />
      )}

      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="relative z-10 w-full max-w-5xl bg-[#131c36] border-4 border-black rounded-3xl p-3 sm:p-4 shadow-[6px_6px_0px_#000] flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Left: Back Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.playPop();
              onGoHome();
            }}
            className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            title="Volver a la Portada"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>PORTADA</span>
          </button>

          {onGoWorlds && (
            <button
              onClick={() => {
                sfx.playPop();
                onGoWorlds();
              }}
              className="px-3 py-2 bg-pink-500 hover:bg-pink-400 text-white font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>MUNDOS 🪐</span>
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              title={isMuted ? 'Activar Sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-300" /> : <Volume2 className="w-5 h-5 text-yellow-300" />}
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 text-center">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-400 border-3 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Target className="w-5 h-5 text-black stroke-[3]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow-[2px_2px_0px_#000]">
              ANGRY GUMBALL: BALÍSTICA 45°
            </h1>
            <p className="text-[10px] font-mono text-amber-200">
              {selectedBackground === 'treehouse' ? '🌄 Fuerte del Árbol al Atardecer • Hora de Aventura' : '🏠 Cuarto de Elmore • Laboratorio de Destrucción'}
            </p>
          </div>
        </div>

        {/* Right: Duo Switcher, Background Toggle, Inspect Artwork / Info */}
        <div className="flex items-center gap-2">
          {/* Character Duo Switcher (Jake & Princesa Grumosa vs Gumball & Darwin) */}
          <button
            onClick={() => {
              sfx.playFanfare();
              if (characterDuo === 'adventure_time') {
                setCharacterDuo('elmore');
                setActiveShotType('daisy');
                gumballMoodRef.current = 'idle';
                darwinSpeechRef.current = { text: '¡Elmore Physics Lab en acción! 📐', timer: 180 };
                spawnComicBanner('¡GUMBALL Y DARWIN! 🐱🐟', 425, 140, '#fef08a', '#0284c7');
              } else {
                setCharacterDuo('adventure_time');
                setActiveShotType('jake');
                jakeMoodRef.current = 'idle';
                lspSpeechRef.current = { text: '¡Llegaron los bultos reales de Ooo! ✨', timer: 180 };
                spawnComicBanner('¡JAKE Y GRUMOSA! 🐶✨', 425, 140, '#fef08a', '#d97706');
              }
            }}
            className={`px-3 py-2 font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              characterDuo === 'adventure_time'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-purple-400 text-black hover:brightness-110'
                : 'bg-gradient-to-r from-sky-400 to-orange-400 text-black hover:brightness-110'
            }`}
            title="Alternar dúo de personajes: Jake el Perro & Princesa Grumosa o Gumball & Darwin"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current text-purple-950" />
            <span>{characterDuo === 'adventure_time' ? '🐶 JAKE & GRUMOSA' : '🐱 GUMBALL & DARWIN'}</span>
          </button>

          {/* Background Toggle Button */}
          <button
            onClick={() => {
              sfx.playPop();
              setSelectedBackground((b) => (b === 'treehouse' ? 'bedroom' : 'treehouse'));
            }}
            className={`px-3 py-2 font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              selectedBackground === 'treehouse'
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-black hover:brightness-110'
                : 'bg-sky-400 hover:bg-sky-300 text-black'
            }`}
            title="Cambiar fondo: Casa del Árbol (Hora de Aventura) o Habitación Elmore"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current text-orange-950" />
            <span>{selectedBackground === 'treehouse' ? '🌄 CASA DEL ÁRBOL' : '🏠 ELMORE'}</span>
          </button>

          <button
            onClick={() => {
              setModalArtworkTab(selectedBackground === 'treehouse' ? 'treehouse' : 'elmore');
              setShowArtworkModal(true);
            }}
            className="px-3 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs uppercase rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            title="Ver ilustraciones originales y fondos del juego"
          >
            <Eye className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">ILUSTRACIÓN</span> 🎨
          </button>

          <button
            onClick={() => setShowPhysicsLabInfo(!showPhysicsLabInfo)}
            className="px-2.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1 cursor-pointer transition-all"
            title="Fórmulas y Teoría del Tiro Parabólico"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. STATS & DARWIN'S 45° TELEMETRY BAR */}
      <div className="w-full max-w-5xl bg-[#0f172a] border-3 border-black rounded-2xl p-2.5 shadow-[4px_4px_0px_#000] mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Level & Shots */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-purple-900/80 px-2.5 py-1 rounded-xl border border-purple-400 text-purple-200 font-black">
            {currentLevel.name.split(':')[0]}
          </div>

          <div className="flex items-center gap-1 text-pink-300 font-black">
            <span>DISPAROS:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: shotsLeft }).map((_, i) => (
                <span key={i} className="text-base animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
                  🐰
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Darwin's 45° Optimal Angle HUD Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border-2 transition-all font-bold ${
          isNear45
            ? 'bg-amber-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse'
            : 'bg-black/60 text-slate-300 border-slate-700'
        }`}>
          <Sparkles className="w-4 h-4 text-orange-600 fill-current" />
          <span>ÁNGULO: {liveAngleDeg}°</span>
          <span className="text-[10px]">
            {isNear45 ? '🎯 ¡ÓPTIMO DE DARWIN! (R = v₀²/g)' : `(Meta: 45°)`}
          </span>
        </div>

        {/* Score & Highscore */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-300 font-black">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>PUNTOS: {score}</span>
          </div>
          <div className="text-slate-400 text-[10px] hidden sm:block">
            RÉCORD: {highScore}
          </div>
        </div>
      </div>

      {/* 3. MAIN GAMEPLAY STAGE (HTML5 CANVAS) */}
      <div className="relative w-full max-w-5xl aspect-[17/9] bg-black border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_#000] group">
        <canvas
          ref={canvasRef}
          width={850}
          height={450}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Instructional Floating Toast on Aiming */}
        {gameState === 'aiming' && (
          <div className="absolute top-3 left-3 pointer-events-none bg-black/80 border-2 border-yellow-400 text-yellow-300 text-[11px] font-mono px-3 py-1.5 rounded-xl shadow flex items-center gap-2">
            <span className="text-base animate-bounce">👆</span>
            <span>Arrastra hacia atrás la catapulta y suelta para disparar a 45°</span>
          </div>
        )}

        {/* In-Flight Tip for Mid-Air Ability */}
        {gameState === 'flying' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none bg-pink-600/90 border-2 border-white text-white text-[11px] font-black px-3 py-1 rounded-xl shadow animate-pulse">
            ⚡ ¡TOCA LA PANTALLA EN EL AIRE PARA ACTIVAR LA HABILIDAD ESPECIAL!
          </div>
        )}

        {/* VICTORY OVERLAY */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-yellow-400 border-3 border-black text-black font-black text-sm uppercase rounded-full shadow-[3px_3px_0px_#000] rotate-[-2deg] mb-2">
              <Award className="w-5 h-5 fill-current" />
              <span>¡NIVEL COMPLETADO! 🎉</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 drop-shadow-[3px_3px_0px_#000] mb-2">
              ¡LA PARÁBOLA TRIUNFÓ!
            </h2>

            {/* Stars */}
            <div className="flex items-center gap-3 my-3">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-12 h-12 transition-all duration-500 ${
                    s <= starsWon
                      ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            <p className="font-mono text-sm text-amber-200 mb-4 max-w-md">
              Darwin está orgulloso: lograste el objetivo derribando todas las fortalezas con una trayectoria matemática impecable.
            </p>

            <div className="bg-purple-950/80 border-2 border-purple-400 px-6 py-2 rounded-2xl mb-6 font-mono text-lg font-black text-yellow-300 shadow">
              PUNTUACIÓN FINAL: {score} PTS
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  sfx.playPop();
                  initLevel(currentLevelIdx);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border-3 border-black text-white font-black text-xs uppercase rounded-2xl shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>REINTENTAR</span>
              </button>

              {currentLevelIdx < GAME_LEVELS.length - 1 ? (
                <button
                  onClick={() => {
                    sfx.playFanfare();
                    initLevel(currentLevelIdx + 1);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 border-4 border-black text-black font-black text-sm uppercase rounded-2xl shadow-[5px_5px_0px_#000] hover:scale-105 flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5 fill-black" />
                  <span>SIGUIENTE NIVEL 🚀</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sfx.playFanfare();
                    initLevel(0);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-300 border-4 border-black text-black font-black text-sm uppercase rounded-2xl shadow-[5px_5px_0px_#000] flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Trophy className="w-5 h-5 fill-black" />
                  <span>¡JUGAR DE NUEVO DESDE EL NIVEL 1!</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* DEFEAT OVERLAY */}
        {gameState === 'defeat' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="w-16 h-16 rounded-3xl bg-red-600 border-4 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000] mb-3">
              💥
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-red-400 drop-shadow-[2px_2px_0px_#000] mb-2">
              ¡TE QUEDASTE SIN MUNICIÓN!
            </h2>
            <p className="font-mono text-sm text-slate-300 mb-6 max-w-md">
              Aún quedan objetivos en pie. Ajusta el ángulo a 45° para maximizar el alcance y derribar la base de la torre.
            </p>
            <button
              onClick={() => {
                sfx.playPop();
                initLevel(currentLevelIdx);
              }}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 border-4 border-black text-black font-black text-sm uppercase rounded-2xl shadow-[5px_5px_0px_#000] flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <RotateCcw className="w-5 h-5 stroke-[3]" />
              <span>REINTENTAR NIVEL 🎯</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. BOTTOM CONTROLS & PROJECTILE SELECTOR */}
      <footer className="w-full max-w-5xl bg-[#131c36] border-4 border-black rounded-3xl p-3 sm:p-4 shadow-[6px_6px_0px_#000] mt-3 flex flex-wrap items-center justify-between gap-3">
        {/* Projectile Type Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1 rounded-2xl border-2 border-slate-700">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase">MUNICIÓN:</span>
          {/* Jake the Dog projectile */}
          <button
            onClick={() => {
              sfx.playPop();
              setActiveShotType('jake');
            }}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeShotType === 'jake'
                ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                : 'text-amber-300/70 hover:text-white'
            }`}
          >
            <span>🐶 Jake (Puño)</span>
          </button>
          {/* Princesa Grumosa projectile */}
          <button
            onClick={() => {
              sfx.playPop();
              setActiveShotType('grumosa');
            }}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeShotType === 'grumosa'
                ? 'bg-fuchsia-500 text-white shadow-[2px_2px_0px_#000]'
                : 'text-fuchsia-300/70 hover:text-white'
            }`}
          >
            <span>✨ Grumosa (Onda)</span>
          </button>
          <button
            onClick={() => {
              sfx.playPop();
              setActiveShotType('daisy');
            }}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeShotType === 'daisy'
                ? 'bg-pink-500 text-white shadow-[2px_2px_0px_#000]'
                : 'text-pink-300/70 hover:text-white'
            }`}
          >
            <span>🐰 Daisy (Rebote)</span>
          </button>
          <button
            onClick={() => {
              sfx.playPop();
              setActiveShotType('gumball');
            }}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeShotType === 'gumball'
                ? 'bg-sky-400 text-black shadow-[2px_2px_0px_#000]'
                : 'text-sky-300/70 hover:text-white'
            }`}
          >
            <span>🐱 Gumball (Pesado)</span>
          </button>
          <button
            onClick={() => {
              sfx.playPop();
              setActiveShotType('darwin_split');
            }}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeShotType === 'darwin_split'
                ? 'bg-orange-500 text-white shadow-[2px_2px_0px_#000]'
                : 'text-orange-300/70 hover:text-white'
            }`}
          >
            <span>🐟 Darwin (Tri-Split)</span>
          </button>
          <button
            onClick={() => {
              sfx.playPop();
              setActiveShotType('bomb');
            }}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeShotType === 'bomb'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_#000]'
                : 'text-red-300/70 hover:text-white'
            }`}
          >
            <span>💣 TNT</span>
          </button>
        </div>

        {/* Physics Modifiers: Gravity & SlowMo */}
        <div className="flex items-center gap-2">
          {/* Gravity Selector */}
          <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-slate-700 text-[11px] font-mono">
            <span className="text-slate-400">g:</span>
            <button
              onClick={() => {
                sfx.playPop();
                setGGravity(gGravity === 9.8 ? 3.7 : gGravity === 3.7 ? 1.6 : 9.8);
              }}
              className="text-yellow-300 font-bold hover:underline cursor-pointer"
            >
              {gGravity === 9.8 ? '9.8 m/s² (Tierra)' : gGravity === 3.7 ? '3.7 m/s² (Marte)' : '1.6 m/s² (Luna)'}
            </button>
          </div>

          {/* Slow Motion */}
          <button
            onClick={() => {
              sfx.playPop();
              setSlowMo(!slowMo);
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              slowMo ? 'bg-amber-400 text-black animate-pulse' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{slowMo ? 'SLOW-MO ON ⚡' : 'SLOW-MO'}</span>
          </button>

          {/* Level Quick Select */}
          <div className="flex items-center gap-1">
            {GAME_LEVELS.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => {
                  sfx.playPop();
                  initLevel(idx);
                }}
                className={`w-8 h-8 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                  currentLevelIdx === idx
                    ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lvl.id}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* 5. MODAL: ORIGINAL ARTWORK & LABORATORY DETAILS */}
      {showArtworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#141b33] border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[12px_12px_0px_#FF007F] flex flex-col items-center">
            <button
              onClick={() => setShowArtworkModal(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-yellow-400 hover:bg-pink-500 hover:text-white text-black font-black text-lg rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
            >
              ✕
            </button>

            {/* Modal Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3 mt-1">
              <button
                onClick={() => setModalArtworkTab('treehouse')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                  modalArtworkTab === 'treehouse'
                    ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#1e293b] text-slate-300 hover:text-white'
                }`}
              >
                🌄 Casa del Árbol
              </button>
              <button
                onClick={() => setModalArtworkTab('jake')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                  modalArtworkTab === 'jake'
                    ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#1e293b] text-slate-300 hover:text-white'
                }`}
              >
                🐶 Jake el Perro
              </button>
              <button
                onClick={() => setModalArtworkTab('grumosa')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                  modalArtworkTab === 'grumosa'
                    ? 'bg-purple-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#1e293b] text-slate-300 hover:text-white'
                }`}
              >
                ✨ Princesa Grumosa
              </button>
              <button
                onClick={() => setModalArtworkTab('elmore')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
                  modalArtworkTab === 'elmore'
                    ? 'bg-pink-500 text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-[#1e293b] text-slate-300 hover:text-white'
                }`}
              >
                🎨 Elmore Lab
              </button>
            </div>

            {modalArtworkTab === 'treehouse' ? (
              <>
                <div className="text-center mb-2">
                  <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                    FONDO ACTIVO • TIERRA DE OOO AL ATARDECER
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-yellow-300 drop-shadow-[2px_2px_0px_#000]">
                    LA CASA DEL ÁRBOL EN LA COLINA DORADA
                  </h3>
                </div>

                <div className="w-full max-h-[360px] aspect-video rounded-2xl overflow-hidden border-3 border-black shadow-[4px_4px_0px_#000] mb-3 bg-black flex items-center justify-center">
                  <img
                    src={bgAdventureTreehouse}
                    alt="Casa del Árbol de Finn y Jake al atardecer sobre colinas verdes"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-xs font-mono text-amber-200/90 text-center max-w-lg space-y-2">
                  <p>
                    La legendaria <strong>Casa del Árbol</strong> iluminada por un atardecer dorado.
                    La física de lanzamiento a 45° se proyecta a través de las colinas de Ooo, manteniendo las colisiones y cálculos balísticos intactos.
                  </p>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => {
                        setSelectedBackground('treehouse');
                        sfx.playPop();
                        setShowArtworkModal(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
                    >
                      {selectedBackground === 'treehouse' ? '✅ FONDO SELECCIONADO' : 'USAR COMO FONDO EN EL JUEGO 🌄'}
                    </button>
                  </div>
                </div>
              </>
            ) : modalArtworkTab === 'jake' ? (
              <>
                <div className="text-center mb-2">
                  <span className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider">
                    PERSONAJE ANIMADO • PODER ELÁSTICO
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-yellow-300 drop-shadow-[2px_2px_0px_#000]">
                    JAKE EL PERRO MÁGICO
                  </h3>
                </div>

                <div className="w-full max-h-[340px] aspect-square rounded-2xl overflow-hidden border-3 border-black shadow-[4px_4px_0px_#000] mb-3 bg-black flex items-center justify-center">
                  <img
                    src={jakeDogImg}
                    alt="Jake the dog smiling with his floppy ears"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-xs font-mono text-amber-200/90 text-center max-w-lg space-y-2">
                  <p>
                    <strong>Jake el Perro</strong> opera la catapulta estirando su brazo mágico con deformación elástica bezier en tiempo real.
                    En el aire, ¡toca la pantalla para activar el <strong>Puño Gigante de Jake</strong> y arrasar los bloques enemigos!
                  </p>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => {
                        setCharacterDuo('adventure_time');
                        setActiveShotType('jake');
                        sfx.playPop();
                        setShowArtworkModal(false);
                      }}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
                    >
                      ACTIVAR JAKE EN EL JUEGO 🐶
                    </button>
                  </div>
                </div>
              </>
            ) : modalArtworkTab === 'grumosa' ? (
              <>
                <div className="text-center mb-2">
                  <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                    PERSONAJE ANIMADO • ESPACIO GRUMOSO
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-purple-300 drop-shadow-[2px_2px_0px_#000]">
                    PRINCESA DEL ESPACIO GRUMOSO (LSP)
                  </h3>
                </div>

                <div className="w-full max-h-[340px] aspect-square rounded-2xl overflow-hidden border-3 border-black shadow-[4px_4px_0px_#000] mb-3 bg-black flex items-center justify-center">
                  <img
                    src={lumpyPrincessImg}
                    alt="Princesa Grumosa con su estrella dorada y forma de nube"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-xs font-mono text-amber-200/90 text-center max-w-lg space-y-2">
                  <p>
                    <strong>Princesa Grumosa</strong> flota con levitación armónica, emite destellos estelares desde su estrella en la frente y critica tus tiros si no usas el ángulo perfecto de 45°.
                    Como proyectil, ¡desata una <strong>Onda Grumosa Celestial</strong> con empuje sísmico!
                  </p>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => {
                        setCharacterDuo('adventure_time');
                        setActiveShotType('grumosa');
                        sfx.playPop();
                        setShowArtworkModal(false);
                      }}
                      className="px-4 py-2 bg-purple-400 hover:bg-purple-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
                    >
                      ACTIVAR PRINCESA GRUMOSA 💜
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-2">
                  <span className="text-[10px] font-mono text-pink-300 font-bold uppercase tracking-wider">
                    ILUSTRACIÓN CANÓNICA • ELMORE PHYSICS LAB
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-yellow-300 drop-shadow-[2px_2px_0px_#000]">
                    GUMBALL & DARWIN EN EL LABORATORIO DE FÍSICA
                  </h3>
                </div>

                <div className="w-full max-h-[360px] aspect-square rounded-2xl overflow-hidden border-3 border-black shadow-[4px_4px_0px_#000] mb-3 bg-black flex items-center justify-center">
                  <img
                    src={gumballCatapultArt}
                    alt="Gumball y Darwin jugando a lanzar conejito con catapulta a 45 grados"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-xs font-mono text-amber-200/90 text-center max-w-lg space-y-2">
                  <p>
                    <strong>Gumball</strong> con peluca rubia y vestido rosa opera la catapulta del castillo de cartón,
                    mientras <strong>Darwin</strong> con corona y libreta de telemetría indica que el <strong>Ángulo de 45°</strong> es el secreto del máximo alcance bajo la gravedad terrestre (g = 9.8 m/s²).
                  </p>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => {
                        setSelectedBackground('bedroom');
                        sfx.playPop();
                        setShowArtworkModal(false);
                      }}
                      className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
                    >
                      {selectedBackground === 'bedroom' ? '✅ FONDO SELECCIONADO' : 'USAR HABITACIÓN ELMORE 🏠'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL: PHYSICS LAB FORMULAS & THEORY */}
      {showPhysicsLabInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#10172a] border-4 border-yellow-400 rounded-3xl p-5 sm:p-6 shadow-[10px_10px_0px_#000] text-white font-mono">
            <button
              onClick={() => setShowPhysicsLabInfo(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-yellow-400 hover:bg-pink-500 hover:text-white text-black font-black text-lg rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-black text-yellow-300 uppercase">
                SECRETOS BALÍSTICOS DE DARWIN
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="bg-black/60 p-3 rounded-2xl border border-yellow-400/40">
                <span className="text-yellow-400 font-bold block mb-1">🎯 1. ¿Por qué 45° da el Máximo Alcance?</span>
                <p>
                  El alcance horizontal está dado por la fórmula:<br />
                  <code className="text-emerald-300 font-bold">R = (v₀² · sen(2θ)) / g</code><br />
                  La función seno alcanza su valor máximo de <strong>1.0</strong> cuando su argumento es 90°. Por lo tanto: <code className="text-pink-300">2θ = 90° ⟹ θ = 45°</code>.
                </p>
              </div>

              <div className="bg-black/60 p-3 rounded-2xl border border-yellow-400/40">
                <span className="text-cyan-400 font-bold block mb-1">📐 2. Independencia de Ejes X e Y</span>
                <p>
                  - <strong>Eje Horizontal (X):</strong> MRU constante (sin fricción), <code className="text-sky-300">v_x = v₀ · cos(θ)</code>.<br />
                  - <strong>Eje Vertical (Y):</strong> MUA desacelerado por la gravedad, <code className="text-sky-300">v_y = v₀ · sen(θ) - g·t</code>.
                </p>
              </div>

              <div className="bg-black/60 p-3 rounded-2xl border border-yellow-400/40">
                <span className="text-pink-400 font-bold block mb-1">💥 3. Altura Máxima Apogea (H_max)</span>
                <p>
                  En el punto más alto, <code className="text-yellow-300">v_y = 0</code>:<br />
                  <code className="text-pink-300 font-bold">H_max = (v₀ · sen(θ))² / (2g)</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
