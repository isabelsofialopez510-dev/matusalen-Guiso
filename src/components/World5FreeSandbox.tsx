import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Trash2,
  Plus,
  Compass,
  Layers,
  Activity,
  Maximize2,
  Flame,
  Wind,
  Gauge,
  Eye,
  Sliders,
  Share2,
  Atom,
  Magnet,
  Shield,
  HelpCircle,
  Volume2,
  VolumeX,
  FastForward,
  ChevronRight,
  Crosshair,
  Pencil,
  Hand,
  Bomb,
  Rocket,
  Target,
  Trophy,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { sfx } from '../utils/audioEffects';
import bgSpace from '../assets/images/space_world_bg_1785850978031.jpg';
import bgHouse from '../assets/images/suburban_house_bg_1785850447893.jpg';
import bgBusStop from '../assets/images/elmore_bus_stop_1787235581594.jpg';
import bgGarden from '../assets/images/elmore_garden_bg_1787237438721.jpg';
import { PixelSlider } from './PixelSlider';

export type ParkEntityType =
  | 'coaster_cart'
  | 'gumball'
  | 'darwin'
  | 'anais'
  | 'balloon'
  | 'target'
  | 'ring_of_fire'
  | 'popcorn'
  | 'firework_rocket'
  | 'bomb'
  | 'bumper_car'
  | 'heavy_anvil'
  | 'blackhole';

export type ParkToolMode =
  | 'grab'
  | 'spawn'
  | 'cannon'
  | 'draw_track'
  | 'trampoline'
  | 'boost_pad'
  | 'fireworks'
  | 'erase';

export interface PhysicsBody {
  id: string;
  type: ParkEntityType;
  x: number; // in meters (canvas 0 to widthM)
  y: number; // in meters (canvas 0 to heightM)
  vx: number; // m/s
  vy: number; // m/s
  mass: number; // kg
  radius: number; // meters
  restitution: number; // 0 to 1+
  dragCoeff: number; // air resistance
  buoyancy?: number; // upward lift (e.g., balloons)
  color: string;
  angle: number;
  angularVel: number;
  thrust?: number; // for rockets
  trail: { x: number; y: number }[];
  isPinned?: boolean;
  scoreValue?: number;
  isHit?: boolean;
}

export interface TrackSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'rail' | 'trampoline' | 'boost';
  color?: string;
  boostMultiplier?: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type?: 'spark' | 'confetti' | 'smoke' | 'fire' | 'star';
}

interface World5FreeSandboxProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showVectors: boolean;
  showTrail: boolean;
}

export const World5FreeSandbox: React.FC<World5FreeSandboxProps> = ({
  isPlaying,
  setIsPlaying,
  showVectors,
  showTrail,
}) => {
  // --- Canvas Dimensions in Simulation Units (Meters) ---
  const CANVAS_WIDTH_M = 120; // 120 meters wide
  const CANVAS_HEIGHT_M = 68; // 68 meters high (16:9 widescreen)
  const SVG_VIEW_WIDTH = 1200;
  const SVG_VIEW_HEIGHT = 680;
  const SCALE = SVG_VIEW_WIDTH / CANVAS_WIDTH_M; // 10 px per meter

  // --- Theme Park Physics Parameters ---
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2 (0 to 35)
  const [airDensity, setAirDensity] = useState<number>(0.12); // 0 (vacuum) to 0.8
  const [windSpeed, setWindSpeed] = useState<number>(0); // m/s (-25 to 25)
  const [globalRestitution, setGlobalRestitution] = useState<number>(0.88); // 0 to 1.5
  const [enableMutualGravity, setEnableMutualGravity] = useState<boolean>(false);
  const [carnivalLights, setCarnivalLights] = useState<boolean>(true);
  const [bgChoice, setBgChoice] = useState<'blank_canvas' | 'fair_night' | 'carnival_day' | 'space_park' | 'garden_fair'>('blank_canvas');

  // --- Active Tool & Selected Entity ---
  const [activeTool, setActiveTool] = useState<ParkToolMode>('cannon');
  const [selectedEntityType, setSelectedEntityType] = useState<ParkEntityType>('coaster_cart');
  const [timeScale, setTimeScale] = useState<number>(1.0); // 0.25x to 2.0x
  const [parkScore, setParkScore] = useState<number>(0);

  // --- Ferris Wheel Attraction Mechanical State ---
  const [ferrisWheelSpeed, setFerrisWheelSpeed] = useState<number>(0.6); // rad/s
  const [ferrisWheelActive, setFerrisWheelActive] = useState<boolean>(false);

  // --- Bodies, Tracks, Particles State ---
  const [bodies, setBodies] = useState<PhysicsBody[]>([]);
  const [tracks, setTracks] = useState<TrackSegment[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [collisionCount, setCollisionCount] = useState<number>(0);

  // --- Interactive Dragging / Slingshot / Drawing State ---
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [grabbedBodyId, setGrabbedBodyId] = useState<string | null>(null);
  const [drawingTrack, setDrawingTrack] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // --- Refs for High-Performance Animation Loop ---
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const tracksRef = useRef<TrackSegment[]>([]);
  const particlesRef = useRef<ParticleEffect[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const collisionCountRef = useRef<number>(0);
  const ferrisWheelAngleRef = useRef<number>(0);

  // Synchronize state to refs
  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  // Theme Park Entity Catalog Templates
  const entityTemplates: Record<
    ParkEntityType,
    {
      name: string;
      defaultMass: number;
      defaultRadius: number;
      restitution: number;
      dragCoeff: number;
      buoyancy: number;
      color: string;
      icon: string;
      category: string;
      description: string;
    }
  > = {
    coaster_cart: {
      name: 'Vagoneta de Montaña Rusa',
      defaultMass: 15.0,
      defaultRadius: 3.6,
      restitution: 0.85,
      dragCoeff: 0.15,
      buoyancy: 0,
      color: '#f43f5e',
      icon: '🎢',
      category: 'Atracción',
      description: 'Vagoneta aerodinámica diseñada para surcar rieles y loopings a gran velocidad.',
    },
    bumper_car: {
      name: 'Carro Chocón Eléctrico',
      defaultMass: 25.0,
      defaultRadius: 3.8,
      restitution: 1.15, // Super bounce bumper
      dragCoeff: 0.2,
      buoyancy: 0,
      color: '#00e5ff',
      icon: '🏎️',
      category: 'Atracción',
      description: 'Defensas de goma de alto impacto con rebote amplificado (e = 1.15) y chispas eléctricas.',
    },
    gumball: {
      name: 'Gumball en Feria',
      defaultMass: 5.0,
      defaultRadius: 3.2,
      restitution: 0.90,
      dragCoeff: 0.22,
      buoyancy: 0,
      color: '#00E5FF',
      icon: '🐱',
      category: 'Personaje',
      description: 'Acróbata intrépido con gran elasticidad y energía en las atracciones.',
    },
    darwin: {
      name: 'Darwin Rebotador',
      defaultMass: 1.5,
      defaultRadius: 2.5,
      restitution: 0.98,
      dragCoeff: 0.3,
      buoyancy: 0,
      color: '#fb923c',
      icon: '🐟',
      category: 'Personaje',
      description: 'Super rebotador ligero capaz de alcanzar alturas récord en trampolines.',
    },
    anais: {
      name: 'Anais en el Parque',
      defaultMass: 3.0,
      defaultRadius: 2.3,
      restitution: 0.92,
      dragCoeff: 0.18,
      buoyancy: 0,
      color: '#ec4899',
      icon: '🐰',
      category: 'Personaje',
      description: 'Compacta y veloz para calcular trayectorias de feria exactas.',
    },
    balloon: {
      name: 'Globo de Helio de Carnaval',
      defaultMass: 0.2,
      defaultRadius: 2.8,
      restitution: 0.7,
      dragCoeff: 0.6,
      buoyancy: 18.0, // Ascends upward against gravity!
      color: '#a855f7',
      icon: '🎈',
      category: 'Feria',
      description: 'Flota hacia arriba por principio de Arquímedes con empuje E = ρ·V·g.',
    },
    target: {
      name: 'Diana de Tiro al Blanco',
      defaultMass: 8.0,
      defaultRadius: 3.2,
      restitution: 0.5,
      dragCoeff: 0.4,
      buoyancy: 0,
      color: '#ef4444',
      icon: '🎯',
      category: 'Juego',
      description: '¡Acertar a la diana otorga +100 Puntos y detona lluvia de confeti!',
    },
    ring_of_fire: {
      name: 'Aro de Fuego de Acrobacias',
      defaultMass: 20.0,
      defaultRadius: 4.5,
      restitution: 0.2,
      dragCoeff: 0.1,
      buoyancy: 0,
      color: '#f97316',
      icon: '🎪',
      category: 'Juego',
      description: 'Aro de circo flamígero por donde atravesar con cohetes y personajes.',
    },
    popcorn: {
      name: 'Palomita Voladora',
      defaultMass: 0.15,
      defaultRadius: 1.5,
      restitution: 0.95,
      dragCoeff: 0.7,
      buoyancy: 1.5,
      color: '#fef08a',
      icon: '🍿',
      category: 'Snack',
      description: 'Masa diminuta y esponjosa que salta con gran facilidad por el aire.',
    },
    firework_rocket: {
      name: 'Cohete Pirotécnico',
      defaultMass: 3.5,
      defaultRadius: 2.6,
      restitution: 0.4,
      dragCoeff: 0.12,
      buoyancy: 0,
      color: '#eab308',
      icon: '🚀',
      category: 'Pirotecnia',
      description: 'Propulsión constante con estela de fuego y detonación pirotécnica en cadena.',
    },
    bomb: {
      name: 'Bomba de Confeti de Carnaval',
      defaultMass: 6.0,
      defaultRadius: 3.0,
      restitution: 0.5,
      dragCoeff: 0.25,
      buoyancy: 0,
      color: '#8b5cf6',
      icon: '💣',
      category: 'Pirotecnia',
      description: 'Explosión de 30 chispas y confeti al chocar contra cualquier atracción.',
    },
    heavy_anvil: {
      name: 'Pesa de Fuerza de Feria',
      defaultMass: 60.0,
      defaultRadius: 3.8,
      restitution: 0.2,
      dragCoeff: 0.1,
      buoyancy: 0,
      color: '#475569',
      icon: '🪨',
      category: 'Feria',
      description: 'Masa pesada de 60 kg para probar el martillo de fuerza de la feria.',
    },
    blackhole: {
      name: 'Vórtice Gravitatorio de Parque',
      defaultMass: 1000.0,
      defaultRadius: 4.5,
      restitution: 0.0,
      dragCoeff: 0.0,
      buoyancy: 0,
      color: '#1e1b4b',
      icon: '🧲',
      category: 'Atracción',
      description: 'Atractor cósmico que hace girar a las vagonetas en órbitas vertiginosas.',
    },
  };

  // Helper to spawn a new body
  const createBody = useCallback(
    (
      type: ParkEntityType,
      x: number,
      y: number,
      vx: number = 0,
      vy: number = 0,
      customMass?: number
    ): PhysicsBody => {
      const t = entityTemplates[type];
      const mass = customMass !== undefined ? customMass : t.defaultMass;
      const isPinned = type === 'blackhole' || type === 'ring_of_fire';

      return {
        id: `body-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        x: Math.max(t.defaultRadius, Math.min(CANVAS_WIDTH_M - t.defaultRadius, x)),
        y: Math.max(t.defaultRadius, Math.min(CANVAS_HEIGHT_M - t.defaultRadius, y)),
        vx,
        vy,
        mass,
        radius: t.defaultRadius,
        restitution: t.restitution,
        dragCoeff: t.dragCoeff,
        buoyancy: t.buoyancy,
        color: t.color,
        angle: Math.random() * Math.PI * 2,
        angularVel: (Math.random() - 0.5) * 2,
        thrust: type === 'firework_rocket' ? 55 : 0,
        trail: [],
        isPinned,
        scoreValue: type === 'target' ? 100 : type === 'balloon' ? 25 : 0,
      };
    },
    [entityTemplates]
  );

  // Trigger Carnival Confetti & Fireworks
  const triggerCarnivalExplosion = useCallback(
    (x: number, y: number, count = 28, power = 22, isConfetti = false) => {
      if (isConfetti) {
        sfx.playSparkle();
      } else {
        sfx.playBoing();
      }

      const newParts: ParticleEffect[] = [];
      const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#f472b6', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.3 + Math.random() * 0.7) * power;
        newParts.push({
          id: `p-${Date.now()}-${i}-${Math.random()}`,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          maxLife: 0.7 + Math.random() * 0.7,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: isConfetti ? 4 + Math.random() * 6 : 3 + Math.random() * 4,
          type: isConfetti ? 'confetti' : 'spark',
        });
      }

      setParticles((prev) => [...prev.slice(-90), ...newParts]);
    },
    []
  );

  // Pre-designed Theme Park Attractions Presets
  const loadPreset = useCallback(
    (presetName: string) => {
      sfx.playSparkle();
      setTracks([]);
      collisionCountRef.current = 0;
      setCollisionCount(0);
      setParkScore(0);

      if (presetName === 'blank') {
        // --- 0. Lienzo en Blanco / Sandbox Limpio ---
        setGravity(9.81);
        setAirDensity(0.05);
        setWindSpeed(0);
        setGlobalRestitution(0.85);
        setEnableMutualGravity(false);
        setBgChoice('blank_canvas');
        setTracks([]);
        setBodies([]);
        setParticles([]);
        setFerrisWheelActive(false);
      } else if (presetName === 'roller_coaster') {
        // --- 1. Mega Montaña Rusa Looping & Drops ---
        setGravity(9.81);
        setAirDensity(0.08);
        setWindSpeed(0);
        setGlobalRestitution(0.9);
        setEnableMutualGravity(false);
        setBgChoice('fair_night');

        // Roller Coaster Track Layout
        const newTracks: TrackSegment[] = [
          // Launch ramp
          { id: 't1', x1: 5, y1: 20, x2: 35, y2: 48, type: 'rail', color: '#f43f5e' },
          // Boost speed pad
          { id: 't2', x1: 35, y1: 48, x2: 55, y2: 48, type: 'boost', color: '#eab308', boostMultiplier: 1.4 },
          // Looping Incline
          { id: 't3', x1: 55, y1: 48, x2: 75, y2: 24, type: 'rail', color: '#00e5ff' },
          // High Drop
          { id: 't4', x1: 75, y1: 24, x2: 95, y2: 52, type: 'rail', color: '#f43f5e' },
          // Trampoline Finish
          { id: 't5', x1: 95, y1: 52, x2: 115, y2: 42, type: 'trampoline', color: '#a855f7' },
        ];
        setTracks(newTracks);

        const newBodies: PhysicsBody[] = [
          createBody('coaster_cart', 8, 16, 12, 0),
          createBody('coaster_cart', 16, 24, 10, 0),
          createBody('gumball', 24, 30, 8, 0),
          createBody('darwin', 80, 20, -5, 0),
          createBody('balloon', 65, 35, 0, -2),
          createBody('balloon', 85, 30, 0, -3),
          createBody('target', 105, 20, 0, 0),
        ];
        setBodies(newBodies);
      } else if (presetName === 'bumper_cars') {
        // --- 2. Pista de Carros Chocones de Neón ---
        setGravity(4.5);
        setAirDensity(0.04);
        setWindSpeed(0);
        setGlobalRestitution(1.1); // Hyper-elastic
        setEnableMutualGravity(false);
        setBgChoice('fair_night');

        // Enclosed Bumper Arena with Trampoline Cushions
        const newTracks: TrackSegment[] = [
          { id: 'b1', x1: 15, y1: 15, x2: 105, y2: 15, type: 'trampoline', color: '#ec4899' },
          { id: 'b2', x1: 105, y1: 15, x2: 105, y2: 55, type: 'trampoline', color: '#00e5ff' },
          { id: 'b3', x1: 105, y1: 55, x2: 15, y2: 55, type: 'trampoline', color: '#facc15' },
          { id: 'b4', x1: 15, y1: 55, x2: 15, y2: 15, type: 'trampoline', color: '#a855f7' },
          // Central Booster
          { id: 'b5', x1: 50, y1: 35, x2: 70, y2: 35, type: 'boost', color: '#eab308', boostMultiplier: 1.5 },
        ];
        setTracks(newTracks);

        const newBodies: PhysicsBody[] = [
          createBody('bumper_car', 30, 25, 14, 8),
          createBody('bumper_car', 90, 45, -12, -10),
          createBody('bumper_car', 35, 45, 10, -12),
          createBody('bumper_car', 85, 25, -14, 9),
          createBody('gumball', 60, 22, 5, 5),
          createBody('darwin', 60, 48, -5, -5),
          createBody('bomb', 60, 35, 0, 0),
        ];
        setBodies(newBodies);
      } else if (presetName === 'circus_cannon') {
        // --- 3. Gran Circo & Cañón Humano ---
        setGravity(9.81);
        setAirDensity(0.12);
        setWindSpeed(4);
        setGlobalRestitution(0.85);
        setEnableMutualGravity(false);
        setBgChoice('carnival_day');

        // Ring of Fire Obstacles & Targets
        const newTracks: TrackSegment[] = [
          { id: 'c1', x1: 85, y1: 58, x2: 115, y2: 45, type: 'trampoline', color: '#ec4899' },
          { id: 'c2', x1: 50, y1: 55, x2: 70, y2: 55, type: 'boost', color: '#facc15' },
        ];
        setTracks(newTracks);

        const newBodies: PhysicsBody[] = [
          // Projectiles ready to launch
          createBody('gumball', 12, 50, 24, -22),
          createBody('firework_rocket', 14, 52, 28, -25),
          createBody('darwin', 16, 54, 20, -18),
          // Targets in the sky
          createBody('ring_of_fire', 55, 25, 0, 0),
          createBody('target', 80, 18, 0, 0),
          createBody('target', 100, 25, 0, 0),
          createBody('balloon', 70, 35, 0, -2),
          createBody('balloon', 90, 30, 0, -2.5),
        ];
        setBodies(newBodies);
      } else if (presetName === 'ferris_fair') {
        // --- 4. Rueda de la Fortuna & Feria Estelar ---
        setGravity(6.0);
        setAirDensity(0.05);
        setWindSpeed(0);
        setGlobalRestitution(0.92);
        setEnableMutualGravity(false);
        setBgChoice('fair_night');

        const newTracks: TrackSegment[] = [
          { id: 'f1', x1: 10, y1: 58, x2: 45, y2: 48, type: 'rail', color: '#38bdf8' },
          { id: 'f2', x1: 75, y1: 48, x2: 110, y2: 58, type: 'rail', color: '#38bdf8' },
          { id: 'f3', x1: 45, y1: 60, x2: 75, y2: 60, type: 'trampoline', color: '#f43f5e' },
        ];
        setTracks(newTracks);

        const newBodies: PhysicsBody[] = [
          createBody('coaster_cart', 20, 35, 8, 0),
          createBody('coaster_cart', 100, 35, -8, 0),
          createBody('balloon', 40, 20, 0, -2),
          createBody('balloon', 80, 20, 0, -2),
          createBody('popcorn', 55, 30, 4, -8),
          createBody('popcorn', 65, 30, -4, -8),
          createBody('gumball', 60, 45, 0, -10),
        ];
        setBodies(newBodies);
      } else if (presetName === 'space_carnival') {
        // --- 5. Parque Espacial 0g Antigravedad ---
        setGravity(0);
        setAirDensity(0);
        setWindSpeed(0);
        setGlobalRestitution(0.95);
        setEnableMutualGravity(true);
        setBgChoice('space_park');

        const sunVortex = createBody('blackhole', 60, 34, 0, 0, 1500);
        const orbiter1 = createBody('coaster_cart', 60, 14, 15, 0);
        const orbiter2 = createBody('bumper_car', 60, 54, -15, 0);
        const orbiter3 = createBody('gumball', 35, 34, 0, 12);
        const orbiter4 = createBody('darwin', 85, 34, 0, -12);
        const orbiter5 = createBody('firework_rocket', 20, 20, 10, 10);

        setBodies([sunVortex, orbiter1, orbiter2, orbiter3, orbiter4, orbiter5]);
      }
    },
    [createBody]
  );

  // Load blank clean canvas on mount
  useEffect(() => {
    loadPreset('blank');
  }, [loadPreset]);

  // Main Physics Step (Verlet / Sub-stepping with theme park mechanics)
  const updatePhysics = useCallback(
    (dt: number) => {
      const SUB_STEPS = 4;
      const subDt = (dt * timeScale) / SUB_STEPS;
      let currBodies = [...bodiesRef.current];
      const currTracks = tracksRef.current;
      let newCollisions = 0;

      // Update Ferris Wheel Angular Rotation
      if (ferrisWheelActive) {
        ferrisWheelAngleRef.current += ferrisWheelSpeed * subDt * 4;
      }

      for (let step = 0; step < SUB_STEPS; step++) {
        // 1. Calculate Forces on all Bodies
        for (let i = 0; i < currBodies.length; i++) {
          const b = currBodies[i];
          if (b.isPinned) continue;

          let fx = 0;
          let fy = b.mass * gravity; // Gravity Force

          // Buoyancy Lift (Helium Balloons ascend!)
          if (b.buoyancy && b.buoyancy > 0) {
            fy -= b.buoyancy * (gravity > 0 ? gravity / 9.81 : 1);
          }

          // Air Drag & Wind Force
          const relVx = b.vx - windSpeed;
          const relVy = b.vy;
          const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);
          if (relSpeed > 0.001) {
            const dragMag = 0.5 * airDensity * relSpeed * relSpeed * b.dragCoeff * b.radius;
            fx -= (relVx / relSpeed) * dragMag;
            fy -= (relVy / relSpeed) * dragMag;
          }

          // Firework Rocket Forward Thrust
          if (b.thrust && b.thrust > 0) {
            const vMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (vMag > 0.1) {
              fx += (b.vx / vMag) * b.thrust;
              fy += (b.vy / vMag) * b.thrust;
            } else {
              fx += Math.cos(b.angle) * b.thrust;
              fy += Math.sin(b.angle) * b.thrust;
            }
          }

          // Mutual Gravitational Attraction (N-Body)
          if (enableMutualGravity) {
            const G = 18;
            for (let j = 0; j < currBodies.length; j++) {
              if (i === j) continue;
              const other = currBodies[j];
              const dx = other.x - b.x;
              const dy = other.y - b.y;
              const distSq = dx * dx + dy * dy + 4.0;
              const dist = Math.sqrt(distSq);
              const forceMag = (G * b.mass * other.mass) / distSq;
              fx += (dx / dist) * forceMag;
              fy += (dy / dist) * forceMag;
            }
          }

          // Apply Accelerations
          const ax = fx / b.mass;
          const ay = fy / b.mass;

          b.vx += ax * subDt;
          b.vy += ay * subDt;

          b.x += b.vx * subDt;
          b.y += b.vy * subDt;
          b.angle += b.angularVel * subDt;
        }

        // 2. Body-to-Body Collisions
        for (let i = 0; i < currBodies.length; i++) {
          for (let j = i + 1; j < currBodies.length; j++) {
            const b1 = currBodies[i];
            const b2 = currBodies[j];

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0.0001) {
              const nx = dx / dist;
              const ny = dy / dist;

              // Overlap separation
              const overlap = minDist - dist;
              if (!b1.isPinned && !b2.isPinned) {
                const totalMass = b1.mass + b2.mass;
                b1.x -= nx * overlap * (b2.mass / totalMass);
                b1.y -= ny * overlap * (b2.mass / totalMass);
                b2.x += nx * overlap * (b1.mass / totalMass);
                b2.y += ny * overlap * (b1.mass / totalMass);
              } else if (!b1.isPinned && b2.isPinned) {
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
              } else if (b1.isPinned && !b2.isPinned) {
                b2.x += nx * overlap;
                b2.y += ny * overlap;
              }

              // Relative speed along collision normal
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = 2 * (nx * kx + ny * ky);

              if (p > 0) {
                const e = Math.max(b1.restitution, b2.restitution);
                const impulse = ((1 + e) * p) / (b1.mass + b2.mass);

                if (!b1.isPinned) {
                  b1.vx -= nx * impulse * b2.mass;
                  b1.vy -= ny * impulse * b2.mass;
                }
                if (!b2.isPinned) {
                  b2.vx += nx * impulse * b1.mass;
                  b2.vy += ny * impulse * b1.mass;
                }

                newCollisions++;

                // Target Hit Score & Confetti
                if (b1.type === 'target' || b2.type === 'target') {
                  const targetX = b1.type === 'target' ? b1.x : b2.x;
                  const targetY = b1.type === 'target' ? b1.y : b2.y;
                  setParkScore((s) => s + 100);
                  triggerCarnivalExplosion(targetX, targetY, 32, 22, true);
                }

                // Bomb detonation on impact
                if (b1.type === 'bomb' || b2.type === 'bomb') {
                  const bombX = b1.type === 'bomb' ? b1.x : b2.x;
                  const bombY = b1.type === 'bomb' ? b1.y : b2.y;
                  triggerCarnivalExplosion(bombX, bombY, 26, 24, false);
                }

                // Bumper car sparks
                if (b1.type === 'bumper_car' || b2.type === 'bumper_car') {
                  const sparkX = (b1.x + b2.x) / 2;
                  const sparkY = (b1.y + b2.y) / 2;
                  triggerCarnivalExplosion(sparkX, sparkY, 12, 14, false);
                }
              }
            }
          }
        }

        // 3. Track Segment Collisions (Rails, Trampolines, Boosters)
        for (let i = 0; i < currBodies.length; i++) {
          const b = currBodies[i];
          if (b.isPinned) continue;

          for (let tIdx = 0; tIdx < currTracks.length; tIdx++) {
            const trk = currTracks[tIdx];
            const wx = trk.x2 - trk.x1;
            const wy = trk.y2 - trk.y1;
            const lenSq = wx * wx + wy * wy;
            if (lenSq === 0) continue;

            let t = ((b.x - trk.x1) * wx + (b.y - trk.y1) * wy) / lenSq;
            t = Math.max(0, Math.min(1, t));

            const closestX = trk.x1 + t * wx;
            const closestY = trk.y1 + t * wy;
            const dx = b.x - closestX;
            const dy = b.y - closestY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < b.radius && dist > 0.0001) {
              const nx = dx / dist;
              const ny = dy / dist;

              b.x = closestX + nx * b.radius;
              b.y = closestY + ny * b.radius;

              const dot = b.vx * nx + b.vy * ny;
              if (dot < 0) {
                let restCoeff = b.restitution;

                // Trampoline: Super bounce
                if (trk.type === 'trampoline') {
                  restCoeff = 1.45;
                  sfx.playBoing();
                  triggerCarnivalExplosion(closestX, closestY, 10, 12, true);
                }

                // Boost Pad: Tangential acceleration
                if (trk.type === 'boost') {
                  const boostMult = trk.boostMultiplier || 1.35;
                  const trackDirX = wx / Math.sqrt(lenSq);
                  const trackDirY = wy / Math.sqrt(lenSq);
                  b.vx += trackDirX * 12;
                  b.vy += trackDirY * 12;
                  sfx.playLaser(1800);
                  triggerCarnivalExplosion(closestX, closestY, 12, 16, false);
                }

                b.vx = (b.vx - (1 + restCoeff) * dot * nx) * 0.98;
                b.vy = (b.vy - (1 + restCoeff) * dot * ny) * 0.98;
                newCollisions++;
              }
            }
          }
        }

        // 4. Boundary Walls Checks
        for (let i = 0; i < currBodies.length; i++) {
          const b = currBodies[i];
          if (b.isPinned) continue;

          // Floor
          if (b.y + b.radius >= CANVAS_HEIGHT_M) {
            b.y = CANVAS_HEIGHT_M - b.radius;
            if (b.vy > 0) {
              b.vy = -b.vy * b.restitution;
              b.vx *= 0.96; // floor friction
              if (Math.abs(b.vy) < 0.2) b.vy = 0;
            }
          }
          // Ceiling
          if (b.y - b.radius <= 0) {
            b.y = b.radius;
            if (b.vy < 0) b.vy = -b.vy * b.restitution;
          }
          // Left Wall
          if (b.x - b.radius <= 0) {
            b.x = b.radius;
            if (b.vx < 0) b.vx = -b.vx * b.restitution;
          }
          // Right Wall
          if (b.x + b.radius >= CANVAS_WIDTH_M) {
            b.x = CANVAS_WIDTH_M - b.radius;
            if (b.vx > 0) b.vx = -b.vx * b.restitution;
          }
        }
      }

      // 5. Update Trails
      if (showTrail) {
        currBodies.forEach((b) => {
          b.trail.push({ x: b.x, y: b.y });
          if (b.trail.length > 24) {
            b.trail.shift();
          }
        });
      }

      // 6. Update Particle Life
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt * timeScale,
            y: p.y + p.vy * dt * timeScale + (gravity > 0 ? 8 : 0) * dt,
            life: p.life - dt / p.maxLife,
          }))
          .filter((p) => p.life > 0)
      );

      if (newCollisions > 0) {
        collisionCountRef.current += newCollisions;
        setCollisionCount(collisionCountRef.current);
      }

      setBodies(currBodies);
    },
    [
      gravity,
      airDensity,
      windSpeed,
      timeScale,
      enableMutualGravity,
      showTrail,
      ferrisWheelActive,
      ferrisWheelSpeed,
      triggerCarnivalExplosion,
    ]
  );

  // 60 FPS Simulation Tick Loop
  useEffect(() => {
    let animId: number;

    const loop = (time: number) => {
      const deltaMs = Math.min(time - lastTimeRef.current, 45);
      lastTimeRef.current = time;

      if (isPlaying) {
        updatePhysics(deltaMs / 1000);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, updatePhysics]);

  // Pointer Canvas Position Helper
  const getCanvasCoords = (e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const x = (clientX / rect.width) * CANVAS_WIDTH_M;
    const y = (clientY / rect.height) * CANVAS_HEIGHT_M;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getCanvasCoords(e);
    setIsPointerDown(true);
    setDragStartPos(coords);
    setDragCurrentPos(coords);

    // Find clicked body
    const clickedBody = bodies.find((b) => {
      const dx = b.x - coords.x;
      const dy = b.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= b.radius * 1.35;
    });

    if (activeTool === 'erase') {
      if (clickedBody) {
        sfx.playWhoosh();
        setBodies((prev) => prev.filter((b) => b.id !== clickedBody.id));
      }
      return;
    }

    if (activeTool === 'fireworks') {
      sfx.playLaser(1900);
      triggerCarnivalExplosion(coords.x, coords.y, 35, 26, true);
      // Radial shockwave outward
      setBodies((prev) =>
        prev.map((b) => {
          const dx = b.x - coords.x;
          const dy = b.y - coords.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.8;
          const pushPower = 500 / (dist * dist + 5);
          return {
            ...b,
            vx: b.vx + (dx / dist) * pushPower,
            vy: b.vy + (dy / dist) * pushPower,
          };
        })
      );
      return;
    }

    if (activeTool === 'grab' && clickedBody) {
      setGrabbedBodyId(clickedBody.id);
      return;
    }

    if (activeTool === 'draw_track' || activeTool === 'trampoline' || activeTool === 'boost_pad') {
      setDrawingTrack({ x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPointerDown) return;
    const coords = getCanvasCoords(e);
    setDragCurrentPos(coords);

    // Live Move when Grabbing
    if (activeTool === 'grab' && grabbedBodyId) {
      setBodies((prev) =>
        prev.map((b) => {
          if (b.id === grabbedBodyId) {
            return {
              ...b,
              x: coords.x,
              y: coords.y,
              vx: (coords.x - (dragCurrentPos?.x || coords.x)) * 18,
              vy: (coords.y - (dragCurrentPos?.y || coords.y)) * 18,
            };
          }
          return b;
        })
      );
    }

    if (drawingTrack) {
      setDrawingTrack((prev) => (prev ? { ...prev, x2: coords.x, y2: coords.y } : null));
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDown) return;
    setIsPointerDown(false);

    if (activeTool === 'cannon' && dragStartPos && dragCurrentPos) {
      sfx.playLaser(1600);
      // Slingshot cannon velocity
      const vx = (dragStartPos.x - dragCurrentPos.x) * 1.8;
      const vy = (dragStartPos.y - dragCurrentPos.y) * 1.8;
      const newBody = createBody(selectedEntityType, dragStartPos.x, dragStartPos.y, vx, vy);
      setBodies((prev) => [...prev, newBody]);
      triggerCarnivalExplosion(dragStartPos.x, dragStartPos.y, 14, 15, false);
    } else if (activeTool === 'spawn' && dragStartPos) {
      sfx.playPop();
      const newBody = createBody(selectedEntityType, dragStartPos.x, dragStartPos.y, 0, 0);
      setBodies((prev) => [...prev, newBody]);
    } else if (drawingTrack) {
      const dist = Math.sqrt(
        Math.pow(drawingTrack.x2 - drawingTrack.x1, 2) + Math.pow(drawingTrack.y2 - drawingTrack.y1, 2)
      );
      if (dist > 2.5) {
        sfx.playSparkle();
        let trackType: 'rail' | 'trampoline' | 'boost' = 'rail';
        let trackColor = '#f43f5e';

        if (activeTool === 'trampoline') {
          trackType = 'trampoline';
          trackColor = '#a855f7';
        } else if (activeTool === 'boost_pad') {
          trackType = 'boost';
          trackColor = '#eab308';
        }

        setTracks((prev) => [
          ...prev,
          {
            id: `trk-${Date.now()}`,
            x1: drawingTrack.x1,
            y1: drawingTrack.y1,
            x2: drawingTrack.x2,
            y2: drawingTrack.y2,
            type: trackType,
            color: trackColor,
            boostMultiplier: 1.4,
          },
        ]);
      }
      setDrawingTrack(null);
    }

    setDragStartPos(null);
    setDragCurrentPos(null);
    setGrabbedBodyId(null);
  };

  // Telemetry Calculations
  const totalKineticEnergy = bodies.reduce(
    (acc, b) => acc + 0.5 * b.mass * (b.vx * b.vx + b.vy * b.vy),
    0
  );
  const fastestBody = bodies.reduce<PhysicsBody | null>((max, b) => {
    const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    const maxSpd = max ? Math.sqrt(max.vx * max.vx + max.vy * max.vy) : 0;
    return spd > maxSpd ? b : max;
  }, null);
  const fastestSpeed = fastestBody
    ? Math.sqrt(fastestBody.vx * fastestBody.vx + fastestBody.vy * fastestBody.vy)
    : 0;

  // Ferris Wheel Center Coordinates in Canvas (Meters)
  const FERRIS_CENTER_X = 60;
  const FERRIS_CENTER_Y = 32;
  const FERRIS_RADIUS = 20;
  const CABIN_COUNT = 6;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. TOP HEADER & THEME PARK HUD */}
      <div className="bg-[#100326] border-4 border-yellow-400 p-4 sm:p-5 rounded-3xl shadow-[8px_8px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 border-3 border-black flex items-center justify-center font-black text-3xl text-black shadow-[4px_4px_0px_#000] rotate-[-4deg]">
            🎡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-yellow-400 text-black px-3 py-0.5 rounded-lg border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_#000]">
                ★ PARQUE DE DIVERSIONES DE ELMORE ★
              </span>
              <span className="text-xs font-mono font-bold text-pink-300">
                Simulador de Física de Atracciones & Carnaval
              </span>
            </div>
            <h2 className="font-black text-xl sm:text-2xl text-white tracking-tight leading-tight flex items-center gap-2">
              <span>Montañas Rusas, Ruedas & Cañones</span>
              <span className="text-yellow-300 text-sm font-mono">
                [Puntos: {parkScore}]
              </span>
            </h2>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => {
              sfx.playPop();
              setIsPlaying(!isPlaying);
            }}
            className={`px-4 py-2.5 rounded-2xl border-3 border-black font-black text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000] transition-all cursor-pointer ${
              isPlaying
                ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                : 'bg-emerald-400 hover:bg-emerald-300 text-black animate-bounce'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={() => {
              sfx.playWhoosh();
              loadPreset('blank');
            }}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl border-3 border-black font-black text-xs uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer transition-all"
            title="Limpiar lienzo y dejar en blanco"
          >
            <Trash2 className="w-4 h-4" />
            <span>Dejar en Blanco</span>
          </button>

          <div className="flex items-center bg-[#1e073d] border-2 border-yellow-400/80 rounded-2xl p-1 shadow-[2px_2px_0px_#000]">
            {[0.25, 1.0, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  sfx.playPop();
                  setTimeScale(rate);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase transition-all ${
                  timeScale === rate
                    ? 'bg-yellow-400 text-black border border-black shadow-[1px_1px_0px_#000]'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THEME PARK TELEMETRY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#1b083b] border-2 border-pink-500/70 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-pink-300 font-bold uppercase flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Puntos de Feria:
          </span>
          <span className="text-xl sm:text-2xl font-black text-yellow-300">{parkScore} PTS</span>
          <span className="text-[9px] text-slate-300">¡Golpea dianas y globos!</span>
        </div>

        <div className="bg-[#1b083b] border-2 border-cyan-400/70 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Energía Cinética Total:
          </span>
          <span className="text-lg sm:text-xl font-black text-cyan-300">
            {totalKineticEnergy < 1000 ? `${totalKineticEnergy.toFixed(1)} J` : `${(totalKineticEnergy / 1000).toFixed(2)} kJ`}
          </span>
          <span className="text-[9px] text-slate-300">Ek = ∑ ½ m v²</span>
        </div>

        <div className="bg-[#1b083b] border-2 border-amber-400/70 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-amber-300 font-bold uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Choques de Feria:
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-300">{collisionCount}</span>
          <span className="text-[9px] text-slate-300">Rebotes & Impactos</span>
        </div>

        <div className="bg-[#1b083b] border-2 border-emerald-400/70 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1">
            <FastForward className="w-3.5 h-3.5 text-emerald-400" /> Vagoneta Más Rápida:
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-300">
            {fastestSpeed.toFixed(1)} m/s
          </span>
          <span className="text-[9px] text-slate-300">
            {(fastestSpeed * 3.6).toFixed(0)} km/h
          </span>
        </div>
      </div>

      {/* 3. THEME PARK TOOLS & SCENARIOS PRESETS */}
      <div className="bg-[#1b083b] border-4 border-black p-3.5 rounded-3xl shadow-[6px_6px_0px_#000] flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Tools Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-yellow-300 uppercase font-mono mr-1">
            Herramientas:
          </span>

          {[
            { id: 'cannon' as ParkToolMode, label: '🎪 Cañón Lanzador', color: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black' },
            { id: 'grab' as ParkToolMode, label: '🖐️ Agarrar & Mover', color: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-black' },
            { id: 'draw_track' as ParkToolMode, label: '🎢 Riel de Montaña', color: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' },
            { id: 'trampoline' as ParkToolMode, label: '🪂 Cama Elástica', color: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white' },
            { id: 'boost_pad' as ParkToolMode, label: '⚡ Acelerador Boost', color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' },
            { id: 'fireworks' as ParkToolMode, label: '🎆 Fuegos Artificiales', color: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-black' },
            { id: 'erase' as ParkToolMode, label: '🧹 Borrador', color: 'bg-gradient-to-r from-red-500 to-rose-600 text-white' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sfx.playPop();
                setActiveTool(t.id);
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                activeTool === t.id
                  ? `${t.color} scale-105 shadow-[4px_4px_0px_#000]`
                  : 'bg-[#0d0321] text-slate-300 hover:bg-[#270c54]'
              }`}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Theme Park Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-yellow-300 uppercase font-mono mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Modos & Presets:
          </span>

          {[
            { id: 'blank', label: '📄 Lienzo en Blanco' },
            { id: 'roller_coaster', label: '🎢 Montaña Rusa' },
            { id: 'bumper_cars', label: '🏎️ Carros Chocones' },
            { id: 'circus_cannon', label: '🎪 Cañón de Circo' },
            { id: 'ferris_fair', label: '🎡 Rueda de la Fortuna' },
            { id: 'space_carnival', label: '🚀 Parque Espacial 0g' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold shadow-[2px_2px_0px_#000] transition-all cursor-pointer border-2 ${
                (p.id === 'blank' && bgChoice === 'blank_canvas' && bodies.length === 0)
                  ? 'bg-yellow-400 text-black border-black scale-105 shadow-[3px_3px_0px_#000]'
                  : 'bg-[#0d0321] hover:bg-yellow-400 hover:text-black border-pink-500/50 hover:border-black text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. ENTITY SPAWNER PALETTE */}
      <div className="bg-[#14022e] border-3 border-yellow-400/80 p-3 rounded-2xl shadow-[4px_4px_0px_#000] flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-mono font-black text-yellow-300 uppercase whitespace-nowrap pl-1">
          Objeto a Lanzar:
        </span>
        <div className="flex items-center gap-2">
          {(Object.keys(entityTemplates) as ParkEntityType[]).map((key) => {
            const item = entityTemplates[key];
            const isSelected = selectedEntityType === key;
            return (
              <button
                key={key}
                onClick={() => {
                  sfx.playPop();
                  setSelectedEntityType(key);
                }}
                className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                  isSelected
                    ? 'bg-yellow-400 text-black border-black scale-105'
                    : 'bg-[#22074c] text-slate-200 border-purple-800 hover:bg-[#340b74]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>
                  {item.name.split(' ')[0]} ({item.defaultMass}kg)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. MAIN INTERACTIVE THEME PARK STAGE (SVG 1200 x 680) */}
      <div className={`relative w-full h-[520px] sm:h-[600px] border-5 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_#000] select-none ${
        bgChoice === 'blank_canvas' ? 'bg-white' : 'bg-[#070114]'
      }`}>
        
        {/* BLANK CANVAS CLEAN WHITEBOARD BACKGROUND */}
        {bgChoice === 'blank_canvas' && (
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-white">
            {/* Subtle Clean Technical Grid */}
            <div 
              className="absolute inset-0 opacity-[0.08]" 
              style={{
                backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            {/* Helpful Watermark */}
            <div className="absolute bottom-4 right-4 pointer-events-none text-slate-400 font-mono text-xs opacity-60 flex items-center gap-1.5">
              <span>📄 Mundo Libre: Lienzo en Blanco</span>
            </div>
          </div>
        )}

        {/* CARNIVAL ATMOSPHERE BACKGROUND LAYER */}
        {bgChoice === 'fair_night' && (
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-b from-[#0b011c] via-[#21023a] to-[#450742] overflow-hidden">
            {/* Twinkling Carnival Lights & Glow */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300 via-pink-500/20 to-transparent" />
            
            {/* Carnival Striped Big Top Tent Silhouette in Background */}
            <div className="absolute bottom-0 inset-x-0 h-48 flex items-end justify-between px-4 opacity-40">
              <div className="w-56 h-36 bg-[#250342] rounded-t-full border-t-4 border-yellow-400/50" />
              <div className="w-80 h-48 bg-[#320459] rounded-t-full border-t-4 border-pink-500/50" />
              <div className="w-56 h-36 bg-[#250342] rounded-t-full border-t-4 border-cyan-400/50" />
            </div>
          </div>
        )}

        {bgChoice === 'carnival_day' && (
          <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-b from-[#38bdf8] via-[#a78bfa] to-[#f472b6] overflow-hidden">
            <div className="absolute bottom-0 inset-x-0 h-32 bg-[#4ade80]/30 backdrop-blur-[1px]" />
          </div>
        )}

        {bgChoice === 'space_park' && (
          <img
            src={bgSpace}
            alt="Espacio Parque"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
          />
        )}

        {/* MAIN INTERACTIVE SVG STAGE */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH_M} ${CANVAS_HEIGHT_M}`}
          className="w-full h-full cursor-crosshair relative z-10 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            {/* Glowing Gradients */}
            <radialGradient id="coasterCartGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="60%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </radialGradient>
            <radialGradient id="bumperCarGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="60%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>
            <radialGradient id="balloonGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="60%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#831843" />
            </radialGradient>
            <radialGradient id="targetGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ffffff" />
            </radialGradient>
            <radialGradient id="popcornGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
          </defs>

          {/* 1. GIANT THEME PARK FERRIS WHEEL (RUEDA DE LA FORTUNA) - ONLY WHEN ACTIVE */}
          {ferrisWheelActive && (
            <g transform={`translate(${FERRIS_CENTER_X}, ${FERRIS_CENTER_Y})`}>
              {/* Ferris Wheel Support Legs */}
              <line x1="0" y1="0" x2="-22" y2="34" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="22" y2="34" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-22" y2="34" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="22" y2="34" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />

              {/* Rotating Wheel & Spokes */}
              <g transform={`rotate(${(ferrisWheelAngleRef.current * 180) / Math.PI})`}>
                {/* Outer Neon Rings */}
                <circle cx="0" cy="0" r={FERRIS_RADIUS} fill="none" stroke="#ec4899" strokeWidth="1.8" opacity="0.9" />
                <circle cx="0" cy="0" r={FERRIS_RADIUS * 0.7} fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />

                {/* Spokes */}
                {Array.from({ length: CABIN_COUNT }).map((_, idx) => {
                  const angle = (idx * (2 * Math.PI)) / CABIN_COUNT;
                  const spokeX = Math.cos(angle) * FERRIS_RADIUS;
                  const spokeY = Math.sin(angle) * FERRIS_RADIUS;
                  return (
                    <g key={`spoke-${idx}`}>
                      <line x1="0" y1="0" x2={spokeX} y2={spokeY} stroke="#facc15" strokeWidth="1.2" />
                      <circle cx={spokeX * 0.6} cy={spokeY * 0.6} r="1.0" fill="#ffffff" />
                    </g>
                  );
                })}

                {/* Cabins (Gondolas) that stay upright with gravity */}
                {Array.from({ length: CABIN_COUNT }).map((_, idx) => {
                  const angle = (idx * (2 * Math.PI)) / CABIN_COUNT;
                  const cabinX = Math.cos(angle) * FERRIS_RADIUS;
                  const cabinY = Math.sin(angle) * FERRIS_RADIUS;
                  const cabinColors = ['#f43f5e', '#00e5ff', '#fbbf24', '#a855f7', '#34d399', '#f472b6'];
                  const color = cabinColors[idx % cabinColors.length];

                  return (
                    <g
                      key={`cabin-${idx}`}
                      transform={`translate(${cabinX}, ${cabinY}) rotate(${(-ferrisWheelAngleRef.current * 180) / Math.PI})`}
                    >
                      {/* Cabin Body */}
                      <rect x="-3.2" y="-2" width="6.4" height="4.5" rx="1.5" fill={color} stroke="#141414" strokeWidth="0.8" />
                      <circle cx="-1.5" cy="0" r="1.0" fill="#ffffff" opacity="0.8" />
                      <circle cx="1.5" cy="0" r="1.0" fill="#ffffff" opacity="0.8" />
                      {/* Carnival light on roof */}
                      <circle cx="0" cy="-2.5" r="0.8" fill="#facc15" className="animate-ping" />
                    </g>
                  );
                })}
              </g>

              {/* Central Axle Gear */}
              <circle cx="0" cy="0" r="3.2" fill="#141414" stroke="#facc15" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="1.5" fill="#f43f5e" />
            </g>
          )}

          {/* 2. THEME PARK TRACKS (RAILS, TRAMPOLINES & BOOSTERS) */}
          {tracks.map((trk) => {
            const isRail = trk.type === 'rail';
            const isTrampoline = trk.type === 'trampoline';
            const isBoost = trk.type === 'boost';

            return (
              <g key={trk.id}>
                {/* Track Base Shadow */}
                <line
                  x1={trk.x1}
                  y1={trk.y1}
                  x2={trk.x2}
                  y2={trk.y2}
                  stroke="#000000"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                />

                {/* Track Colored Rail */}
                <line
                  x1={trk.x1}
                  y1={trk.y1}
                  x2={trk.x2}
                  y2={trk.y2}
                  stroke={trk.color || '#f43f5e'}
                  strokeWidth={isTrampoline ? 3.5 : 2.5}
                  strokeDasharray={isBoost ? '3 3' : 'none'}
                  strokeLinecap="round"
                />

                {/* Roller Coaster Sleepers / Ties */}
                {isRail && (
                  <line
                    x1={trk.x1}
                    y1={trk.y1}
                    x2={trk.x2}
                    y2={trk.y2}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeDasharray="1 3"
                  />
                )}

                {/* Trampoline Springs */}
                {isTrampoline && (
                  <circle cx={(trk.x1 + trk.x2) / 2} cy={(trk.y1 + trk.y2) / 2} r="2.0" fill="#a855f7" stroke="#ffffff" strokeWidth="0.5" />
                )}

                {/* Boost Arrow Indicator */}
                {isBoost && (
                  <circle cx={(trk.x1 + trk.x2) / 2} cy={(trk.y1 + trk.y2) / 2} r="2.2" fill="#eab308" stroke="#000000" strokeWidth="0.6" />
                )}
              </g>
            );
          })}

          {/* Active Drawing Track Preview */}
          {drawingTrack && (
            <line
              x1={drawingTrack.x1}
              y1={drawingTrack.y1}
              x2={drawingTrack.x2}
              y2={drawingTrack.y2}
              stroke="#facc15"
              strokeWidth="2.5"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
          )}

          {/* 3. PHYSICS PARTICLES & CONFETTI */}
          {particles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={(p.size / SCALE) * p.life}
              fill={p.color}
              opacity={p.life}
            />
          ))}

          {/* 4. MOTION TRAILS */}
          {showTrail &&
            bodies.map((b) => (
              <g key={`trail-${b.id}`}>
                {b.trail.map((pt, idx) => {
                  if (idx === 0) return null;
                  const prevPt = b.trail[idx - 1];
                  const alpha = (idx / b.trail.length) * 0.75;
                  return (
                    <line
                      key={`seg-${idx}`}
                      x1={prevPt.x}
                      y1={prevPt.y}
                      x2={pt.x}
                      y2={pt.y}
                      stroke={b.color}
                      strokeWidth={b.radius * 0.35 * (idx / b.trail.length)}
                      strokeOpacity={alpha}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            ))}

          {/* 5. RENDER THEME PARK BODIES */}
          {bodies.map((b) => {
            const vMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            return (
              <g key={b.id} transform={`translate(${b.x}, ${b.y}) rotate(${(b.angle * 180) / Math.PI})`}>
                
                {/* ROLLER COASTER CART */}
                {b.type === 'coaster_cart' && (
                  <g>
                    {/* Cart Body */}
                    <rect x={-b.radius * 1.1} y={-b.radius * 0.7} width={b.radius * 2.2} height={b.radius * 1.4} rx={b.radius * 0.4} fill="url(#coasterCartGrad)" stroke="#141414" strokeWidth="0.8" />
                    {/* Windshield */}
                    <rect x={b.radius * 0.3} y={-b.radius * 0.55} width={b.radius * 0.6} height={b.radius * 0.5} rx="0.3" fill="#ffffff" opacity="0.85" />
                    {/* Steel Wheels */}
                    <circle cx={-b.radius * 0.7} cy={b.radius * 0.75} r={b.radius * 0.3} fill="#1f2937" stroke="#fbbf24" strokeWidth="0.4" />
                    <circle cx={b.radius * 0.7} cy={b.radius * 0.75} r={b.radius * 0.3} fill="#1f2937" stroke="#fbbf24" strokeWidth="0.4" />
                    {/* Passenger Smiley */}
                    <circle cx={-b.radius * 0.2} cy={-b.radius * 0.2} r={b.radius * 0.28} fill="#facc15" stroke="#141414" strokeWidth="0.3" />
                  </g>
                )}

                {/* BUMPER CAR */}
                {b.type === 'bumper_car' && (
                  <g>
                    {/* Outer Rubber Bumper Ring */}
                    <circle cx="0" cy="0" r={b.radius * 1.15} fill="#111827" stroke="#00e5ff" strokeWidth="0.8" />
                    {/* Main Metallic Pod */}
                    <circle cx="0" cy="0" r={b.radius * 0.85} fill="url(#bumperCarGrad)" stroke="#141414" strokeWidth="0.6" />
                    {/* Headlights */}
                    <circle cx={b.radius * 0.5} cy={-b.radius * 0.3} r={b.radius * 0.18} fill="#fef08a" />
                    <circle cx={b.radius * 0.5} cy={b.radius * 0.3} r={b.radius * 0.18} fill="#fef08a" />
                    {/* Electric Pole Antenna */}
                    <line x1={-b.radius * 0.4} y1="0" x2={-b.radius * 0.9} y2="-4" stroke="#eab308" strokeWidth="0.8" />
                    <circle cx={-b.radius * 0.9} cy="-4" r="0.6" fill="#facc15" className="animate-ping" />
                  </g>
                )}

                {/* GUMBALL CHARACTER */}
                {b.type === 'gumball' && (
                  <g>
                    <ellipse cx={-b.radius * 0.6} cy={-b.radius * 0.85} rx={b.radius * 0.35} ry={b.radius * 0.55} fill="#00E5FF" stroke="#141414" strokeWidth="0.6" transform="rotate(-15)" />
                    <ellipse cx={b.radius * 0.6} cy={-b.radius * 0.85} rx={b.radius * 0.35} ry={b.radius * 0.55} fill="#00E5FF" stroke="#141414" strokeWidth="0.6" transform="rotate(15)" />
                    <circle cx="0" cy="0" r={b.radius} fill="#00E5FF" stroke="#141414" strokeWidth="0.8" />
                    <ellipse cx={-b.radius * 0.32} cy={-b.radius * 0.15} rx={b.radius * 0.28} ry={b.radius * 0.38} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <ellipse cx={b.radius * 0.32} cy={-b.radius * 0.15} rx={b.radius * 0.28} ry={b.radius * 0.38} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.15} fill="#141414" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.15} fill="#141414" />
                    <ellipse cx="0" cy={b.radius * 0.2} rx={b.radius * 0.14} ry={b.radius * 0.1} fill="#ea580c" />
                    <path d={`M ${-b.radius * 0.25} ${b.radius * 0.4} Q 0 ${b.radius * 0.65} ${b.radius * 0.25} ${b.radius * 0.4}`} fill="none" stroke="#141414" strokeWidth="0.5" strokeLinecap="round" />
                  </g>
                )}

                {/* DARWIN CHARACTER */}
                {b.type === 'darwin' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="#fb923c" stroke="#141414" strokeWidth="0.8" />
                    <path d={`M ${-b.radius * 0.9} 0 C ${-b.radius * 1.4} ${-b.radius * 0.5} ${-b.radius * 1.4} ${b.radius * 0.5} ${-b.radius * 0.9} 0`} fill="#fb923c" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.2} r={b.radius * 0.32} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.2} r={b.radius * 0.32} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={-b.radius * 0.25} cy={-b.radius * 0.2} r={b.radius * 0.14} fill="#141414" />
                    <circle cx={b.radius * 0.25} cy={-b.radius * 0.2} r={b.radius * 0.14} fill="#141414" />
                    <ellipse cx={-b.radius * 0.45} cy={b.radius * 0.15} rx={b.radius * 0.15} ry={b.radius * 0.1} fill="#f43f5e" opacity="0.8" />
                    <ellipse cx={b.radius * 0.45} cy={b.radius * 0.15} rx={b.radius * 0.15} ry={b.radius * 0.1} fill="#f43f5e" opacity="0.8" />
                    <path d={`M ${-b.radius * 0.3} ${b.radius * 0.35} Q 0 ${b.radius * 0.65} ${b.radius * 0.3} ${b.radius * 0.35}`} fill="none" stroke="#141414" strokeWidth="0.5" strokeLinecap="round" />
                  </g>
                )}

                {/* ANAIS CHARACTER */}
                {b.type === 'anais' && (
                  <g>
                    <ellipse cx={-b.radius * 0.45} cy={-b.radius * 1.1} rx={b.radius * 0.25} ry={b.radius * 0.65} fill="#f472b6" stroke="#141414" strokeWidth="0.5" />
                    <ellipse cx={b.radius * 0.45} cy={-b.radius * 1.1} rx={b.radius * 0.25} ry={b.radius * 0.65} fill="#f472b6" stroke="#141414" strokeWidth="0.5" />
                    <circle cx="0" cy="0" r={b.radius} fill="#f472b6" stroke="#141414" strokeWidth="0.7" />
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.25} fill="#ffffff" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.25} fill="#ffffff" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.1} fill="#141414" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.1} fill="#141414" />
                  </g>
                )}

                {/* HELIUM CARNIVAL BALLOON */}
                {b.type === 'balloon' && (
                  <g>
                    <ellipse cx="0" cy={-b.radius * 0.2} rx={b.radius * 0.85} ry={b.radius * 1.05} fill="url(#balloonGrad)" stroke="#141414" strokeWidth="0.6" />
                    {/* Balloon Knot */}
                    <polygon points={`0,${b.radius * 0.9} ${-b.radius * 0.2},${b.radius * 1.2} ${b.radius * 0.2},${b.radius * 1.2}`} fill="#be185d" />
                    {/* String */}
                    <path d={`M 0 ${b.radius * 1.2} Q ${b.radius * 0.3} ${b.radius * 1.8} 0 ${b.radius * 2.4}`} fill="none" stroke="#ffffff" strokeWidth="0.4" />
                  </g>
                )}

                {/* TARGET */}
                {b.type === 'target' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="url(#targetGrad)" stroke="#141414" strokeWidth="0.8" />
                    <circle cx="0" cy="0" r={b.radius * 0.3} fill="#fbbf24" />
                  </g>
                )}

                {/* RING OF FIRE */}
                {b.type === 'ring_of_fire' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="none" stroke="#f97316" strokeWidth="2.2" className="animate-pulse" />
                    <circle cx="0" cy="0" r={b.radius * 0.85} fill="none" stroke="#facc15" strokeWidth="1.2" strokeDasharray="2 2" />
                    <circle cx="0" cy="0" r={b.radius * 0.4} fill="#ea580c" opacity="0.3" />
                  </g>
                )}

                {/* POPCORN */}
                {b.type === 'popcorn' && (
                  <g>
                    <circle cx={-b.radius * 0.3} cy={-b.radius * 0.2} r={b.radius * 0.6} fill="url(#popcornGrad)" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={b.radius * 0.3} cy={-b.radius * 0.1} r={b.radius * 0.55} fill="url(#popcornGrad)" stroke="#141414" strokeWidth="0.4" />
                    <circle cx="0" cy={b.radius * 0.3} r={b.radius * 0.6} fill="url(#popcornGrad)" stroke="#141414" strokeWidth="0.4" />
                  </g>
                )}

                {/* FIREWORK ROCKET */}
                {b.type === 'firework_rocket' && (
                  <g>
                    <polygon points={`0,${-b.radius * 1.4} ${b.radius * 0.7},${b.radius * 0.8} ${-b.radius * 0.7},${b.radius * 0.8}`} fill="#ef4444" stroke="#141414" strokeWidth="0.6" />
                    <circle cx="0" cy="0" r={b.radius * 0.35} fill="#38bdf8" stroke="#141414" strokeWidth="0.4" />
                    <polygon points={`0,${b.radius * 1.5} ${b.radius * 0.4},${b.radius * 0.8} ${-b.radius * 0.4},${b.radius * 0.8}`} fill="#fbbf24" opacity="0.95" />
                  </g>
                )}

                {/* BOMB */}
                {b.type === 'bomb' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="#8b5cf6" stroke="#141414" strokeWidth="0.8" />
                    <rect x={-b.radius * 0.25} y={-b.radius * 1.25} width={b.radius * 0.5} height={b.radius * 0.4} fill="#581c87" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={b.radius * 0.4} cy={-b.radius * 1.3} r={b.radius * 0.25} fill="#fbbf24" className="animate-ping" />
                    <text x="0" y="1" textAnchor="middle" fill="#ffffff" fontSize={b.radius * 0.8} fontWeight="black" fontFamily="monospace">
                      💣
                    </text>
                  </g>
                )}

                {/* HEAVY ANVIL */}
                {b.type === 'heavy_anvil' && (
                  <g>
                    <polygon
                      points={`${-b.radius},0 ${-b.radius * 0.7},${-b.radius * 0.8} ${b.radius * 0.6},${-b.radius * 0.9} ${b.radius},${-b.radius * 0.2} ${b.radius * 0.8},${b.radius * 0.8} ${-b.radius * 0.4},${b.radius}`}
                      fill="#475569"
                      stroke="#141414"
                      strokeWidth="0.8"
                    />
                    <text x="0" y="1" textAnchor="middle" fill="#facc15" fontSize={b.radius * 0.6} fontWeight="black" fontFamily="monospace">
                      60kg
                    </text>
                  </g>
                )}

                {/* BLACK HOLE / GRAVITY VORTEX */}
                {b.type === 'blackhole' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius * 1.6} fill="#a855f7" opacity="0.3" className="animate-pulse" />
                    <circle cx="0" cy="0" r={b.radius} fill="#000000" stroke="#c084fc" strokeWidth="1.0" />
                    <circle cx="0" cy="0" r={b.radius * 0.4} fill="#ffffff" opacity="0.85" />
                  </g>
                )}

                {/* Velocity Vector Arrow */}
                {showVectors && vMag > 0.5 && (
                  <g>
                    <line
                      x1="0"
                      y1="0"
                      x2={b.vx * 0.5}
                      y2={b.vy * 0.5}
                      stroke="#22c55e"
                      strokeWidth="1.0"
                      strokeLinecap="round"
                    />
                    <circle cx={b.vx * 0.5} cy={b.vy * 0.5} r="1.0" fill="#22c55e" stroke="#141414" strokeWidth="0.3" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Slingshot Launching Visual Cannon Guide */}
          {isPointerDown && dragStartPos && dragCurrentPos && activeTool === 'cannon' && (
            <g>
              <line
                x1={dragStartPos.x}
                y1={dragStartPos.y}
                x2={dragCurrentPos.x}
                y2={dragCurrentPos.y}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle cx={dragStartPos.x} cy={dragStartPos.y} r="2.5" fill="#f43f5e" />
              {/* Projected trajectory line */}
              <line
                x1={dragStartPos.x}
                y1={dragStartPos.y}
                x2={dragStartPos.x + (dragStartPos.x - dragCurrentPos.x) * 1.2}
                y2={dragStartPos.y + (dragStartPos.y - dragCurrentPos.y) * 1.2}
                stroke="#22c55e"
                strokeWidth="2.0"
              />
              <circle
                cx={dragStartPos.x + (dragStartPos.x - dragCurrentPos.x) * 1.2}
                cy={dragStartPos.y + (dragStartPos.y - dragCurrentPos.y) * 1.2}
                r="2.0"
                fill="#22c55e"
              />
            </g>
          )}
        </svg>

        {/* Live HUD Floating Tag on Canvas */}
        <div className="absolute top-3 left-3 bg-[#0d0321]/90 border-2 border-yellow-400 px-3.5 py-1.5 rounded-xl font-mono text-[11px] text-yellow-300 shadow-[3px_3px_0px_#000] flex items-center gap-2 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>g = {gravity.toFixed(2)} m/s² | e = {globalRestitution.toFixed(2)} | Viento = {windSpeed} m/s</span>
        </div>
      </div>

      {/* 6. PHYSICAL CONSTANTS & CARNIVAL SLIDERS */}
      <div className="bg-[#100326] border-4 border-yellow-400/90 p-5 rounded-3xl shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-pink-500/40 pb-2 flex-wrap gap-2">
          <h3 className="font-black text-sm sm:text-base text-yellow-300 uppercase flex items-center gap-2 font-mono">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Controles Físicos del Parque de Diversiones
          </h3>
          <span className="text-[11px] font-mono text-pink-300">
            Ajusta la gravedad, elasticidad y velocidad de atracciones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Gravity Slider */}
          <PixelSlider
            label="Gravedad del Parque (g)"
            character="gumball"
            value={gravity}
            min={0}
            max={35}
            step={0.5}
            unit="m/s²"
            onChange={(newVal) => setGravity(newVal)}
            description="Aceleración que empuja las vagonetas hacia abajo"
            highlightFormula="F_g = m · g"
            presetTags={[
              { label: '0g 🚀', value: 0 },
              { label: '1.62 (Luna)', value: 1.62 },
              { label: '9.81 (Tierra)', value: 9.81 },
              { label: '24.8 (Júpiter)', value: 24.8 },
            ]}
          />

          {/* Elasticity Restitution */}
          <PixelSlider
            label="Elasticidad de Choques (e)"
            character="darwin"
            value={globalRestitution}
            min={0}
            max={1.5}
            step={0.05}
            unit=""
            onChange={(newVal) => {
              setGlobalRestitution(newVal);
              setBodies((prev) => prev.map((b) => ({ ...b, restitution: newVal })));
            }}
            description="Coeficiente de rebote en defensas y trampolines"
            highlightFormula="e = v_separación / v_aproximación"
            presetTags={[
              { label: '0.2 (Inelástico)', value: 0.2 },
              { label: '0.9 (Carro)', value: 0.9 },
              { label: '1.3 (Trampolín)', value: 1.3 },
            ]}
          />

          {/* Air Drag */}
          <PixelSlider
            label="Resistencia del Aire (ρ)"
            character="anais"
            value={airDensity}
            min={0}
            max={0.8}
            step={0.05}
            unit="kg/m³"
            onChange={(newVal) => setAirDensity(newVal)}
            description="Fricción que frena las vagonetas de feria"
            highlightFormula="F_drag = ½ ρ v² C_d A"
            presetTags={[
              { label: '0 (Vacío)', value: 0 },
              { label: '0.12 (Aire)', value: 0.12 },
              { label: '0.6 (Fluido)', value: 0.6 },
            ]}
          />

          {/* Ferris Wheel Speed Slider */}
          <PixelSlider
            label="Velocidad Rueda Fortuna (ω)"
            character="gumball"
            value={ferrisWheelSpeed}
            min={0}
            max={2.5}
            step={0.1}
            unit="rad/s"
            onChange={(newVal) => setFerrisWheelSpeed(newVal)}
            description="Velocidad angular de rotación de la rueda"
            highlightFormula="F_c = m · ω² · r"
            presetTags={[
              { label: '0 (Parada)', value: 0 },
              { label: '0.6 (Paseo)', value: 0.6 },
              { label: '2.0 (Turbo)', value: 2.0 },
            ]}
          />
        </div>

        {/* Feature Switches & Background Theme */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pink-500/30 font-mono text-xs text-slate-200">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ferrisWheelActive}
                onChange={(e) => setFerrisWheelActive(e.target.checked)}
                className="w-4 h-4 accent-yellow-400 rounded"
              />
              <span className="text-yellow-300 font-bold">Girar Rueda de la Fortuna (ω)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableMutualGravity}
                onChange={(e) => setEnableMutualGravity(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <span className="text-cyan-200 font-bold">Gravedad Mutua N-Cuerpos</span>
            </label>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-[11px]">Tema:</span>
            {[
              { id: 'fair_night', label: '🎡 Feria Nocturna' },
              { id: 'carnival_day', label: '🎪 Carnaval de Día' },
              { id: 'space_park', label: '🚀 Parque Espacial' },
            ].map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBgChoice(bg.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  bgChoice === bg.id
                    ? 'bg-yellow-400 text-black border-black font-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#22074c] text-slate-300 border-purple-800 hover:bg-[#340b74]'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
