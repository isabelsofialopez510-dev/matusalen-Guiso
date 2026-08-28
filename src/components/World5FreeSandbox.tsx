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
  Rocket
} from 'lucide-react';
import { sfx } from '../utils/audioEffects';
import bgSpace from '../assets/images/space_world_bg_1785850978031.jpg';
import bgHouse from '../assets/images/suburban_house_bg_1785850447893.jpg';
import bgBusStop from '../assets/images/elmore_bus_stop_1787235581594.jpg';
import bgGarden from '../assets/images/elmore_garden_bg_1787237438721.jpg';
import { PixelSlider } from './PixelSlider';
import { PixelGumball, PixelDarwin, PixelAnais } from './PixelCharacters';

export type EntityType = 
  | 'gumball'
  | 'darwin'
  | 'anais'
  | 'rock'
  | 'ball'
  | 'feather'
  | 'rocket'
  | 'bomb'
  | 'blackhole';

export type ToolMode = 'spawn' | 'slingshot' | 'draw' | 'shockwave' | 'erase';

export interface PhysicsBody {
  id: string;
  type: EntityType;
  x: number; // in meters (canvas 0 to widthM)
  y: number; // in meters (canvas 0 to heightM)
  vx: number; // m/s
  vy: number; // m/s
  mass: number; // kg
  radius: number; // meters
  restitution: number; // 0 to 1
  dragCoeff: number; // air resistance
  charge: number; // for electric interaction (-1, 0, 1)
  color: string;
  angle: number;
  angularVel: number;
  thrust?: number; // for rocket
  trail: { x: number; y: number }[];
  isPinned?: boolean;
}

export interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
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
  const CANVAS_WIDTH_M = 100; // 100 meters wide
  const CANVAS_HEIGHT_M = 56; // 56 meters high (16:9 ratio)
  const SVG_VIEW_WIDTH = 1000;
  const SVG_VIEW_HEIGHT = 560;
  const SCALE = SVG_VIEW_WIDTH / CANVAS_WIDTH_M; // 10 px per meter

  // --- Sandbox Environmental Physics Parameters ---
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2 (0 to 40)
  const [airDensity, setAirDensity] = useState<number>(0.15); // 0 (vacuum) to 1.0
  const [windSpeed, setWindSpeed] = useState<number>(0); // m/s (-30 to 30)
  const [globalRestitution, setGlobalRestitution] = useState<number>(0.85); // 0 to 1
  const [enableMutualGravity, setEnableMutualGravity] = useState<boolean>(false);
  const [enableElectricForces, setEnableElectricForces] = useState<boolean>(false);
  const [wrapBoundaries, setWrapBoundaries] = useState<boolean>(false);
  const [bgChoice, setBgChoice] = useState<'grid' | 'space' | 'garden' | 'bus' | 'house'>('space');

  // --- Active Tool & Selected Entity to Spawn ---
  const [activeTool, setActiveTool] = useState<ToolMode>('spawn');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('gumball');
  const [spawnVelocityMag, setSpawnVelocityMag] = useState<number>(15); // m/s
  const [spawnMass, setSpawnMass] = useState<number>(5.0); // custom mass override
  const [timeScale, setTimeScale] = useState<number>(1.0); // 0.2x to 2.0x

  // --- Bodies, Walls, Particles State ---
  const [bodies, setBodies] = useState<PhysicsBody[]>([]);
  const [walls, setWalls] = useState<WallSegment[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [collisionCount, setCollisionCount] = useState<number>(0);

  // --- Interactive Dragging / Slingshot / Drawing State ---
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [drawingWall, setDrawingWall] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // --- Refs for High-Performance Animation Loop ---
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const wallsRef = useRef<WallSegment[]>([]);
  const particlesRef = useRef<ParticleEffect[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const collisionCountRef = useRef<number>(0);

  // Keep refs in sync with state for access in loops
  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    wallsRef.current = walls;
  }, [walls]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  // Entity templates definition
  const entityTemplates: Record<EntityType, {
    name: string;
    defaultMass: number;
    defaultRadius: number;
    restitution: number;
    dragCoeff: number;
    color: string;
    charge: number;
    icon: string;
    description: string;
  }> = {
    gumball: {
      name: 'Gumball Watterson',
      defaultMass: 5.0,
      defaultRadius: 3.2,
      restitution: 0.88,
      dragCoeff: 0.25,
      color: '#00E5FF',
      charge: 1,
      icon: '🐱',
      description: 'Cuerpo elástico equilibrado con gran elasticidad y masa de 5 kg.',
    },
    darwin: {
      name: 'Darwin Watterson',
      defaultMass: 1.0,
      defaultRadius: 2.5,
      restitution: 0.96,
      dragCoeff: 0.35,
      color: '#fb923c',
      charge: -1,
      icon: '🐟',
      description: 'Super-rebotador ultraligero de 1 kg con coeficiente de restitución e = 0.96.',
    },
    anais: {
      name: 'Anais Watterson',
      defaultMass: 2.5,
      defaultRadius: 2.2,
      restitution: 0.90,
      dragCoeff: 0.20,
      color: '#ec4899',
      charge: 1,
      icon: '🐰',
      description: 'Esfera inteligente compacta y ágil de 2.5 kg.',
    },
    rock: {
      name: 'Roca Pesada de Elmore',
      defaultMass: 40.0,
      defaultRadius: 4.2,
      restitution: 0.22,
      dragCoeff: 0.15,
      color: '#78716c',
      charge: 0,
      icon: '🪨',
      description: 'Masa masiva de 40 kg casi inelástica que transfiere gran momento lineal.',
    },
    ball: {
      name: 'Pelota de Neón',
      defaultMass: 2.0,
      defaultRadius: 2.6,
      restitution: 0.92,
      dragCoeff: 0.2,
      color: '#eab308',
      charge: 0,
      icon: '⚽',
      description: 'Pelota deportiva con rebote casi perfecto y gran visibilidad.',
    },
    feather: {
      name: 'Pluma Volátil',
      defaultMass: 0.1,
      defaultRadius: 1.8,
      restitution: 0.15,
      dragCoeff: 0.95,
      color: '#f8fafc',
      charge: 0,
      icon: '🪶',
      description: 'Masa diminuta con enorme arrastre aerodinámico. Flota con el viento.',
    },
    rocket: {
      name: 'Cohete Propulsado',
      defaultMass: 4.0,
      defaultRadius: 2.8,
      restitution: 0.6,
      dragCoeff: 0.1,
      color: '#ef4444',
      charge: 0,
      icon: '🚀',
      description: 'Genera empuje constante en su dirección de movimiento con estela de fuego.',
    },
    bomb: {
      name: 'Bomba de Confeti',
      defaultMass: 6.0,
      defaultRadius: 3.0,
      restitution: 0.4,
      dragCoeff: 0.3,
      color: '#a855f7',
      charge: 0,
      icon: '💣',
      description: 'Explota en una cascada de 25 partículas de choque al colisionar fuertemente.',
    },
    blackhole: {
      name: 'Atractor Gravitacional',
      defaultMass: 500.0,
      defaultRadius: 4.0,
      restitution: 0.0,
      dragCoeff: 0.0,
      color: '#1e1b4b',
      charge: 0,
      icon: '🧲',
      description: 'Cuerpo inmóvil hipermasivo que atrae a todos los cuerpos mediante F = G·M·m/r².',
    },
  };

  // Helper to spawn a new body
  const createBody = useCallback((
    type: EntityType,
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 0,
    customMass?: number
  ): PhysicsBody => {
    const t = entityTemplates[type];
    const mass = customMass !== undefined ? customMass : t.defaultMass;
    const isPinned = type === 'blackhole';

    return {
      id: `body-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      x: Math.max(t.defaultRadius, Math.min(CANVAS_WIDTH_M - t.defaultRadius, x)),
      y: Math.max(t.defaultRadius, Math.min(CANVAS_HEIGHT_M - t.defaultRadius, y)),
      vx,
      vy,
      mass,
      radius: t.defaultRadius,
      restitution: globalRestitution,
      dragCoeff: t.dragCoeff,
      charge: t.charge,
      color: t.color,
      angle: Math.random() * Math.PI * 2,
      angularVel: (Math.random() - 0.5) * 3,
      thrust: type === 'rocket' ? 45 : 0,
      trail: [],
      isPinned,
    };
  }, [globalRestitution]);

  // Initial Scenario Setup
  const loadPreset = useCallback((presetName: string) => {
    sfx.playSparkle();
    setWalls([]);
    collisionCountRef.current = 0;
    setCollisionCount(0);

    if (presetName === 'billiards') {
      // Elastic Collision Arena
      setGravity(0);
      setAirDensity(0.02);
      setWindSpeed(0);
      setGlobalRestitution(0.98);
      setEnableMutualGravity(false);
      setWrapBoundaries(false);
      setBgChoice('grid');

      const newBodies: PhysicsBody[] = [
        createBody('gumball', 25, 28, 22, 0, 5),
        createBody('darwin', 65, 28, 0, 0, 1),
        createBody('anais', 72, 22, 0, 0, 2.5),
        createBody('ball', 72, 34, 0, 0, 2),
        createBody('rock', 80, 28, 0, 0, 30),
      ];
      setBodies(newBodies);
    } else if (presetName === 'space') {
      // Zero Gravity Orbital N-Body Dance
      setGravity(0);
      setAirDensity(0);
      setWindSpeed(0);
      setGlobalRestitution(0.9);
      setEnableMutualGravity(true);
      setWrapBoundaries(true);
      setBgChoice('space');

      const sun = createBody('blackhole', 50, 28, 0, 0, 1200);
      const orbiter1 = createBody('gumball', 50, 10, 14, 0, 5);
      const orbiter2 = createBody('darwin', 50, 46, -14, 0, 1);
      const orbiter3 = createBody('rocket', 20, 28, 0, 12, 4);
      const orbiter4 = createBody('ball', 80, 28, 0, -12, 2);

      setBodies([sun, orbiter1, orbiter2, orbiter3, orbiter4]);
    } else if (presetName === 'galileo_extreme') {
      // Comparison of Freefall & Terminal Drag
      setGravity(9.81);
      setAirDensity(0.35);
      setWindSpeed(8);
      setGlobalRestitution(0.7);
      setEnableMutualGravity(false);
      setWrapBoundaries(false);
      setBgChoice('bus');

      const newBodies: PhysicsBody[] = [
        createBody('rock', 20, 8, 0, 0, 50),
        createBody('gumball', 40, 8, 0, 0, 5),
        createBody('darwin', 60, 8, 0, 0, 0.8),
        createBody('feather', 80, 8, 0, 0, 0.05),
      ];
      setBodies(newBodies);
    } else if (presetName === 'ramps') {
      // Ramp Physics with Bounces
      setGravity(9.81);
      setAirDensity(0.1);
      setWindSpeed(0);
      setGlobalRestitution(0.85);
      setEnableMutualGravity(false);
      setWrapBoundaries(false);
      setBgChoice('garden');

      const newWalls: WallSegment[] = [
        { id: 'w1', x1: 5, y1: 15, x2: 45, y2: 30, color: '#38bdf8' },
        { id: 'w2', x1: 95, y1: 28, x2: 55, y2: 42, color: '#fb923c' },
        { id: 'w3', x1: 15, y1: 45, x2: 50, y2: 52, color: '#a855f7' },
      ];
      setWalls(newWalls);

      const newBodies: PhysicsBody[] = [
        createBody('gumball', 12, 6, 0, 0),
        createBody('darwin', 20, 5, 2, 0),
        createBody('ball', 28, 4, -1, 0),
      ];
      setBodies(newBodies);
    } else if (presetName === 'fireworks') {
      // Explosive Chaos
      setGravity(6.0);
      setAirDensity(0.15);
      setWindSpeed(0);
      setGlobalRestitution(0.8);
      setEnableMutualGravity(false);
      setWrapBoundaries(false);
      setBgChoice('space');

      const newBodies: PhysicsBody[] = [
        createBody('bomb', 30, 20, 10, -10),
        createBody('bomb', 70, 20, -10, -10),
        createBody('bomb', 50, 40, 0, -15),
        createBody('rocket', 20, 45, 12, -18),
        createBody('rocket', 80, 45, -12, -18),
      ];
      setBodies(newBodies);
    }
  }, [createBody]);

  // Load default on mount
  useEffect(() => {
    loadPreset('billiards');
  }, [loadPreset]);

  // Explosion Particle Generator
  const triggerExplosion = useCallback((x: number, y: number, count = 24, power = 18) => {
    sfx.playBoing();
    const newParts: ParticleEffect[] = [];
    const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#ffffff'];

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
        maxLife: 0.6 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
      });
    }

    setParticles((prev) => [...prev.slice(-80), ...newParts]);
  }, []);

  // Main Physics Step Function (Verlet / Euler substepping)
  const updatePhysics = useCallback((dt: number) => {
    const SUB_STEPS = 4;
    const subDt = (dt * timeScale) / SUB_STEPS;
    let currBodies = [...bodiesRef.current];
    const currWalls = wallsRef.current;
    let newCollisions = 0;

    for (let step = 0; step < SUB_STEPS; step++) {
      // 1. Calculate and Apply Forces to all Bodies
      for (let i = 0; i < currBodies.length; i++) {
        const b = currBodies[i];
        if (b.isPinned) continue;

        let fx = 0;
        let fy = b.mass * gravity; // Gravity Force

        // Air Drag & Wind Force: Fd = 0.5 * rho * v_rel^2 * Cd
        const relVx = b.vx - windSpeed;
        const relVy = b.vy;
        const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);
        if (relSpeed > 0.001) {
          const dragMag = 0.5 * airDensity * relSpeed * relSpeed * b.dragCoeff * b.radius;
          fx -= (relVx / relSpeed) * dragMag;
          fy -= (relVy / relSpeed) * dragMag;
        }

        // Rocket Forward Thrust
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

        // Mutual Gravity between all bodies (N-Body: F = G * m1 * m2 / r^2)
        if (enableMutualGravity) {
          const G = 15; // Scaled Gravitational Constant
          for (let j = 0; j < currBodies.length; j++) {
            if (i === j) continue;
            const other = currBodies[j];
            const dx = other.x - b.x;
            const dy = other.y - b.y;
            const distSq = dx * dx + dy * dy + 4.0; // softening factor
            const dist = Math.sqrt(distSq);
            const forceMag = (G * b.mass * other.mass) / distSq;
            fx += (dx / dist) * forceMag;
            fy += (dy / dist) * forceMag;
          }
        }

        // Electric / Coulomb Forces (F = k * q1 * q2 / r^2)
        if (enableElectricForces && b.charge !== 0) {
          const kElectric = 80;
          for (let j = 0; j < currBodies.length; j++) {
            if (i === j) continue;
            const other = currBodies[j];
            if (other.charge === 0) continue;
            const dx = other.x - b.x;
            const dy = other.y - b.y;
            const distSq = dx * dx + dy * dy + 2.0;
            const dist = Math.sqrt(distSq);
            // Opposite charges attract (+ * - = -), like charges repel (+ * + = +)
            const forceMag = (-kElectric * b.charge * other.charge) / distSq;
            fx += (dx / dist) * forceMag;
            fy += (dy / dist) * forceMag;
          }
        }

        // Apply accelerations: a = F / m
        const ax = fx / b.mass;
        const ay = fy / b.mass;

        b.vx += ax * subDt;
        b.vy += ay * subDt;

        // Position update
        b.x += b.vx * subDt;
        b.y += b.vy * subDt;
        b.angle += b.angularVel * subDt;
      }

      // 2. Body-to-Body Elastic / Inelastic Collisions
      for (let i = 0; i < currBodies.length; i++) {
        for (let j = i + 1; j < currBodies.length; j++) {
          const b1 = currBodies[i];
          const b2 = currBodies[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0.0001) {
            // Normal vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping bodies
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

            // Relative velocity along collision normal
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky);

            // Only collide if moving towards each other
            if (p > 0) {
              const e = Math.min(b1.restitution, b2.restitution);
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
              
              // Bomb detonation on impact
              if (b1.type === 'bomb' || b2.type === 'bomb') {
                const bombX = b1.type === 'bomb' ? b1.x : b2.x;
                const bombY = b1.type === 'bomb' ? b1.y : b2.y;
                triggerExplosion(bombX, bombY, 22, 20);
              }
            }
          }
        }
      }

      // 3. Wall Segment Collisions (Drawn Ramps)
      for (let i = 0; i < currBodies.length; i++) {
        const b = currBodies[i];
        if (b.isPinned) continue;

        for (let w = 0; w < currWalls.length; w++) {
          const wall = currWalls[w];
          const wx = wall.x2 - wall.x1;
          const wy = wall.y2 - wall.y1;
          const lenSq = wx * wx + wy * wy;
          if (lenSq === 0) continue;

          // Project body position onto wall segment
          let t = ((b.x - wall.x1) * wx + (b.y - wall.y1) * wy) / lenSq;
          t = Math.max(0, Math.min(1, t));

          const closestX = wall.x1 + t * wx;
          const closestY = wall.y1 + t * wy;
          const dx = b.x - closestX;
          const dy = b.y - closestY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < b.radius && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Push out of wall
            b.x = closestX + nx * b.radius;
            b.y = closestY + ny * b.radius;

            // Reflect velocity with restitution
            const dot = b.vx * nx + b.vy * ny;
            if (dot < 0) {
              b.vx = (b.vx - (1 + b.restitution) * dot * nx) * 0.96;
              b.vy = (b.vy - (1 + b.restitution) * dot * ny) * 0.96;
              newCollisions++;
            }
          }
        }
      }

      // 4. Boundary Enclosure Checks
      for (let i = 0; i < currBodies.length; i++) {
        const b = currBodies[i];
        if (b.isPinned) continue;

        if (wrapBoundaries) {
          // Toroidal wrap-around
          if (b.x < 0) b.x = CANVAS_WIDTH_M;
          if (b.x > CANVAS_WIDTH_M) b.x = 0;
          if (b.y < 0) b.y = CANVAS_HEIGHT_M;
          if (b.y > CANVAS_HEIGHT_M) b.y = 0;
        } else {
          // Floor Bounce
          if (b.y + b.radius >= CANVAS_HEIGHT_M) {
            b.y = CANVAS_HEIGHT_M - b.radius;
            if (b.vy > 0) {
              b.vy = -b.vy * b.restitution;
              b.vx *= 0.98; // floor friction
              if (Math.abs(b.vy) < 0.2) b.vy = 0;
            }
          }
          // Ceiling Bounce
          if (b.y - b.radius <= 0) {
            b.y = b.radius;
            if (b.vy < 0) b.vy = -b.vy * b.restitution;
          }
          // Left Wall Bounce
          if (b.x - b.radius <= 0) {
            b.x = b.radius;
            if (b.vx < 0) b.vx = -b.vx * b.restitution;
          }
          // Right Wall Bounce
          if (b.x + b.radius >= CANVAS_WIDTH_M) {
            b.x = CANVAS_WIDTH_M - b.radius;
            if (b.vx > 0) b.vx = -b.vx * b.restitution;
          }
        }
      }
    }

    // 5. Update Trails
    if (showTrail) {
      currBodies.forEach((b) => {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 28) {
          b.trail.shift();
        }
      });
    }

    // 6. Update Particles Life
    setParticles((prevParts) =>
      prevParts
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt * timeScale,
          y: p.y + p.vy * dt * timeScale + gravity * 0.15 * dt,
          life: p.life - dt / p.maxLife,
        }))
        .filter((p) => p.life > 0)
    );

    if (newCollisions > 0) {
      collisionCountRef.current += newCollisions;
      setCollisionCount(collisionCountRef.current);
    }

    setBodies(currBodies);
  }, [
    gravity,
    airDensity,
    windSpeed,
    timeScale,
    enableMutualGravity,
    enableElectricForces,
    wrapBoundaries,
    showTrail,
    triggerExplosion,
  ]);

  // Animation Loop (60 FPS tick)
  useEffect(() => {
    let animId: number;

    const loop = (time: number) => {
      const deltaMs = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;

      if (isPlaying) {
        updatePhysics(deltaMs / 1000);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, updatePhysics]);

  // Pointer / Touch Handlers for Interactive Tools
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

    // Check if clicked an existing body
    const clickedBody = bodies.find((b) => {
      const dx = b.x - coords.x;
      const dy = b.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= b.radius * 1.3;
    });

    if (activeTool === 'erase') {
      if (clickedBody) {
        sfx.playWhoosh();
        setBodies((prev) => prev.filter((b) => b.id !== clickedBody.id));
      }
      return;
    }

    if (activeTool === 'shockwave') {
      sfx.playLaserPing();
      triggerExplosion(coords.x, coords.y, 30, 24);
      // Push all nearby bodies outward
      setBodies((prev) =>
        prev.map((b) => {
          const dx = b.x - coords.x;
          const dy = b.y - coords.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.5;
          const shockPower = 400 / (dist * dist + 4);
          return {
            ...b,
            vx: b.vx + (dx / dist) * shockPower,
            vy: b.vy + (dy / dist) * shockPower,
          };
        })
      );
      return;
    }

    if (clickedBody) {
      setSelectedBodyId(clickedBody.id);
    } else {
      setSelectedBodyId(null);
      if (activeTool === 'draw') {
        setDrawingWall({ x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y });
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPointerDown) return;
    const coords = getCanvasCoords(e);
    setDragCurrentPos(coords);

    if (activeTool === 'draw' && drawingWall) {
      setDrawingWall((prev) => prev ? { ...prev, x2: coords.x, y2: coords.y } : null);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDown) return;
    setIsPointerDown(false);

    if (activeTool === 'spawn' && dragStartPos) {
      sfx.playPop();
      let vx = 0;
      let vy = 0;
      if (dragCurrentPos) {
        // Slingshot vector from drag
        vx = (dragStartPos.x - dragCurrentPos.x) * 1.5;
        vy = (dragStartPos.y - dragCurrentPos.y) * 1.5;
      }
      const newBody = createBody(
        selectedEntityType,
        dragStartPos.x,
        dragStartPos.y,
        vx,
        vy,
        spawnMass
      );
      setBodies((prev) => [...prev, newBody]);
    } else if (activeTool === 'slingshot' && selectedBodyId && dragStartPos && dragCurrentPos) {
      sfx.playBoing();
      const vx = (dragStartPos.x - dragCurrentPos.x) * 2.2;
      const vy = (dragStartPos.y - dragCurrentPos.y) * 2.2;
      setBodies((prev) =>
        prev.map((b) => (b.id === selectedBodyId ? { ...b, vx, vy } : b))
      );
    } else if (activeTool === 'draw' && drawingWall) {
      const dist = Math.sqrt(
        Math.pow(drawingWall.x2 - drawingWall.x1, 2) + Math.pow(drawingWall.y2 - drawingWall.y1, 2)
      );
      if (dist > 2.0) {
        sfx.playSparkle();
        setWalls((prev) => [
          ...prev,
          {
            id: `wall-${Date.now()}`,
            x1: drawingWall.x1,
            y1: drawingWall.y1,
            x2: drawingWall.x2,
            y2: drawingWall.y2,
            color: '#38bdf8',
          },
        ]);
      }
      setDrawingWall(null);
    }

    setDragStartPos(null);
    setDragCurrentPos(null);
    setSelectedBodyId(null);
  };

  // Calculations for Telemetry Dashboard
  const totalKineticEnergy = bodies.reduce(
    (acc, b) => acc + 0.5 * b.mass * (b.vx * b.vx + b.vy * b.vy),
    0
  );
  const totalMomentumX = bodies.reduce((acc, b) => acc + b.mass * b.vx, 0);
  const totalMomentumY = bodies.reduce((acc, b) => acc + b.mass * b.vy, 0);
  const totalMomentumMag = Math.sqrt(totalMomentumX * totalMomentumX + totalMomentumY * totalMomentumY);
  const fastestBody = bodies.reduce<PhysicsBody | null>((max, b) => {
    const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    const maxSpd = max ? Math.sqrt(max.vx * max.vx + max.vy * max.vy) : 0;
    return spd > maxSpd ? b : max;
  }, null);
  const fastestSpeed = fastestBody
    ? Math.sqrt(fastestBody.vx * fastestBody.vx + fastestBody.vy * fastestBody.vy)
    : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. TOP HEADER & TELEMETRY SUMMARY BAR */}
      <div className="bg-[#110e2f] border-4 border-cyan-400 p-4 rounded-3xl shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400 border-2 border-black flex items-center justify-center font-black text-2xl text-black shadow-[3px_3px_0px_#000] rotate-[-3deg]">
            🌌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-400 text-black px-2.5 py-0.5 rounded-lg border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_#000]">
                MUNDO LIBRE • SANDBOX
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                Física N-Cuerpos & Cinemática Libre
              </span>
            </div>
            <h2 className="font-black text-lg sm:text-2xl text-white tracking-tight leading-tight">
              Laboratorio de Física Abierta de Elmore
            </h2>
          </div>
        </div>

        {/* Global Controls: Play, Pause, Reset, Slow Mo */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => {
              sfx.playPop();
              setIsPlaying(!isPlaying);
            }}
            className={`px-4 py-2 rounded-2xl border-3 border-black font-black text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000] transition-all cursor-pointer ${
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
              setBodies([]);
              setWalls([]);
              setParticles([]);
              collisionCountRef.current = 0;
              setCollisionCount(0);
            }}
            className="px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl border-3 border-black font-black text-xs uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer transition-all"
            title="Borrar todos los objetos y paredes"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

          <div className="flex items-center bg-[#1e1b4b] border-2 border-cyan-400/80 rounded-2xl p-1 shadow-[2px_2px_0px_#000]">
            {[0.25, 1.0, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  sfx.playPop();
                  setTimeScale(rate);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase transition-all ${
                  timeScale === rate
                    ? 'bg-cyan-400 text-black border border-black shadow-[1px_1px_0px_#000]'
                    : 'text-cyan-200 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME STATS TELEMETRY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#16123b] border-2 border-cyan-400/60 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1">
            <Atom className="w-3.5 h-3.5 text-cyan-400" /> Cuerpos Activos:
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{bodies.length}</span>
          <span className="text-[9px] text-slate-400">Total en simulación</span>
        </div>

        <div className="bg-[#16123b] border-2 border-yellow-400/60 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-yellow-300 font-bold uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Energía Cinética Total:
          </span>
          <span className="text-lg sm:text-xl font-black text-yellow-300">
            {totalKineticEnergy < 1000 ? `${totalKineticEnergy.toFixed(1)} J` : `${(totalKineticEnergy / 1000).toFixed(2)} kJ`}
          </span>
          <span className="text-[9px] text-slate-400">Ek = ∑ ½ m v²</span>
        </div>

        <div className="bg-[#16123b] border-2 border-purple-400/60 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-purple-300 font-bold uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-purple-400" /> Momento Lineal |P|:
          </span>
          <span className="text-lg sm:text-xl font-black text-purple-300">
            {totalMomentumMag.toFixed(1)} kg·m/s
          </span>
          <span className="text-[9px] text-slate-400">P = ∑ m v (Conservación)</span>
        </div>

        <div className="bg-[#16123b] border-2 border-emerald-400/60 p-3 rounded-2xl shadow-[3px_3px_0px_#000] flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Colisiones & Rebotes:
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-300">
            {collisionCount}
          </span>
          <span className="text-[9px] text-slate-400">
            {fastestBody ? `Vel. Máx: ${fastestSpeed.toFixed(1)} m/s` : 'Sin movimiento'}
          </span>
        </div>
      </div>

      {/* 3. TOOLBAR & PRESETS SELECTOR */}
      <div className="bg-[#16123b] border-4 border-black p-3.5 rounded-3xl shadow-[6px_6px_0px_#000] flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Tools Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-yellow-300 uppercase font-mono mr-1">
            Herramienta:
          </span>

          {[
            { id: 'spawn' as ToolMode, label: 'Crear Objeto', icon: Plus, color: 'bg-cyan-400 text-black' },
            { id: 'slingshot' as ToolMode, label: 'Lanzar (Slingshot)', icon: Crosshair, color: 'bg-yellow-400 text-black' },
            { id: 'draw' as ToolMode, label: 'Dibujar Rampa', icon: Pencil, color: 'bg-purple-500 text-white' },
            { id: 'shockwave' as ToolMode, label: 'Onda de Choque', icon: Zap, color: 'bg-emerald-400 text-black' },
            { id: 'erase' as ToolMode, label: 'Borrador', icon: Trash2, color: 'bg-pink-500 text-white' },
          ].map((t) => {
            const IconComp = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sfx.playPop();
                  setActiveTool(t.id);
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                  activeTool === t.id
                    ? `${t.color} scale-105 shadow-[4px_4px_0px_#000]`
                    : 'bg-[#0d0a21] text-slate-300 hover:bg-[#201a4f]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Physics Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-cyan-300 uppercase font-mono mr-1">
            Escenarios:
          </span>

          {[
            { id: 'billiards', label: '🎱 Colisiones Elásticas', desc: '0g Rebote' },
            { id: 'space', label: '🪐 Órbita Gravitacional', desc: 'Gravedad Mutua' },
            { id: 'galileo_extreme', label: '🪂 Galileo vs Arrastre', desc: 'Caída Libre' },
            { id: 'ramps', label: '🎢 Pistas y Rampas', desc: 'Rampas con Fricción' },
            { id: 'fireworks', label: '💣 Fuegos Artificiales', desc: 'Bombas' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              className="px-2.5 py-1 bg-[#0d0a21] hover:bg-yellow-400 hover:text-black border-2 border-purple-500/50 hover:border-black text-slate-200 rounded-xl font-mono text-[11px] font-bold shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. ENTITY SPAWNER PALETTE (Visible in Spawn Mode) */}
      {activeTool === 'spawn' && (
        <div className="bg-[#110e2f] border-3 border-cyan-400/80 p-3 rounded-2xl shadow-[4px_4px_0px_#000] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono font-black text-yellow-300 uppercase whitespace-nowrap pl-1">
            Selecciona Entidad:
          </span>
          <div className="flex items-center gap-2">
            {(Object.keys(entityTemplates) as EntityType[]).map((key) => {
              const item = entityTemplates[key];
              const isSelected = selectedEntityType === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    sfx.playPop();
                    setSelectedEntityType(key);
                    setSpawnMass(item.defaultMass);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs uppercase flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-black scale-105'
                      : 'bg-[#1b173d] text-slate-200 border-purple-800 hover:bg-[#262055]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name.split(' ')[0]} ({item.defaultMass}kg)</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MAIN INTERACTIVE PHYSICS CANVAS (SVG STAGE) */}
      <div className="relative w-full h-[480px] sm:h-[540px] bg-[#050314] border-5 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_#000] select-none">
        
        {/* Background choice layer */}
        {bgChoice === 'space' && (
          <img
            src={bgSpace}
            alt="Espacio Exterior"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
        )}
        {bgChoice === 'bus' && (
          <img
            src={bgBusStop}
            alt="Parada de Autobús de Elmore"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
        )}
        {bgChoice === 'garden' && (
          <img
            src={bgGarden}
            alt="Jardín Botánico de Elmore"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
        )}
        {bgChoice === 'house' && (
          <img
            src={bgHouse}
            alt="Casa de los Watterson"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
        )}

        {/* Vector Grid Overlay */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH_M} ${CANVAS_HEIGHT_M}`}
          className="w-full h-full cursor-crosshair relative z-10 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="freeWorldGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5" />
            </pattern>

            {/* Glowing Gradients */}
            <radialGradient id="gumballFaceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#80F5FF" />
              <stop offset="60%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0088A3" />
            </radialGradient>
            <radialGradient id="darwinFaceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>
            <radialGradient id="anaisFaceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#be185d" />
            </radialGradient>
            <radialGradient id="blackholeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="70%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          <rect width={CANVAS_WIDTH_M} height={CANVAS_HEIGHT_M} fill="url(#freeWorldGrid)" />

          {/* Wind Flow Lines Indicator */}
          {Math.abs(windSpeed) > 0.5 && (
            <g opacity="0.3">
              {[10, 25, 40].map((y, idx) => (
                <line
                  key={`wind-${idx}`}
                  x1={windSpeed > 0 ? 0 : CANVAS_WIDTH_M}
                  y1={y}
                  x2={windSpeed > 0 ? CANVAS_WIDTH_M : 0}
                  y2={y}
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="4 8"
                />
              ))}
            </g>
          )}

          {/* 1. Trails */}
          {showTrail &&
            bodies.map((b) => (
              <g key={`trail-${b.id}`}>
                {b.trail.map((pt, idx) => {
                  if (idx === 0) return null;
                  const prevPt = b.trail[idx - 1];
                  const alpha = (idx / b.trail.length) * 0.7;
                  return (
                    <line
                      key={`seg-${idx}`}
                      x1={prevPt.x}
                      y1={prevPt.y}
                      x2={pt.x}
                      y2={pt.y}
                      stroke={b.color}
                      strokeWidth={b.radius * 0.3 * (idx / b.trail.length)}
                      strokeOpacity={alpha}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            ))}

          {/* 2. Static Walls & Obstacles */}
          {walls.map((w) => (
            <g key={w.id}>
              <line
                x1={w.x1}
                y1={w.y1}
                x2={w.x2}
                y2={w.y2}
                stroke="#141414"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <line
                x1={w.x1}
                y1={w.y1}
                x2={w.x2}
                y2={w.y2}
                stroke={w.color || '#38bdf8'}
                strokeWidth="2.0"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Active drawing wall preview */}
          {drawingWall && (
            <line
              x1={drawingWall.x1}
              y1={drawingWall.y1}
              x2={drawingWall.x2}
              y2={drawingWall.y2}
              stroke="#fbbf24"
              strokeWidth="2.0"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
          )}

          {/* 3. Physics Particles */}
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

          {/* 4. Render Physics Bodies */}
          {bodies.map((b) => {
            const vMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            return (
              <g key={b.id} transform={`translate(${b.x}, ${b.y}) rotate(${(b.angle * 180) / Math.PI})`}>
                
                {/* BLACK HOLE / GRAVITY WELL */}
                {b.type === 'blackhole' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius * 1.5} fill="url(#blackholeGrad)" opacity="0.4" className="animate-pulse" />
                    <circle cx="0" cy="0" r={b.radius} fill="#000000" stroke="#c084fc" strokeWidth="0.8" />
                    <circle cx="0" cy="0" r={b.radius * 0.4} fill="#ffffff" opacity="0.8" />
                  </g>
                )}

                {/* GUMBALL CHARACTER */}
                {b.type === 'gumball' && (
                  <g>
                    {/* Ears */}
                    <ellipse cx={-b.radius * 0.6} cy={-b.radius * 0.85} rx={b.radius * 0.35} ry={b.radius * 0.55} fill="#00E5FF" stroke="#141414" strokeWidth="0.6" transform="rotate(-15)" />
                    <ellipse cx={b.radius * 0.6} cy={-b.radius * 0.85} rx={b.radius * 0.35} ry={b.radius * 0.55} fill="#00E5FF" stroke="#141414" strokeWidth="0.6" transform="rotate(15)" />
                    
                    {/* Main Head */}
                    <circle cx="0" cy="0" r={b.radius} fill="url(#gumballFaceGrad)" stroke="#141414" strokeWidth="0.8" />
                    
                    {/* Big Eyes */}
                    <ellipse cx={-b.radius * 0.32} cy={-b.radius * 0.15} rx={b.radius * 0.28} ry={b.radius * 0.38} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <ellipse cx={b.radius * 0.32} cy={-b.radius * 0.15} rx={b.radius * 0.28} ry={b.radius * 0.38} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={-b.radius * 0.28 + (b.vx / 30)} cy={-b.radius * 0.15 + (b.vy / 30)} r={b.radius * 0.15} fill="#141414" />
                    <circle cx={b.radius * 0.28 + (b.vx / 30)} cy={-b.radius * 0.15 + (b.vy / 30)} r={b.radius * 0.15} fill="#141414" />
                    
                    {/* Red Nose & Smile */}
                    <ellipse cx="0" cy={b.radius * 0.2} rx={b.radius * 0.14} ry={b.radius * 0.1} fill="#ea580c" />
                    <path d={`M ${-b.radius * 0.25} ${b.radius * 0.4} Q 0 ${b.radius * 0.65} ${b.radius * 0.25} ${b.radius * 0.4}`} fill="none" stroke="#141414" strokeWidth="0.5" strokeLinecap="round" />
                  </g>
                )}

                {/* DARWIN CHARACTER */}
                {b.type === 'darwin' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="url(#darwinFaceGrad)" stroke="#141414" strokeWidth="0.8" />
                    {/* Tail fin */}
                    <path d={`M ${-b.radius * 0.9} 0 C ${-b.radius * 1.4} ${-b.radius * 0.5} ${-b.radius * 1.4} ${b.radius * 0.5} ${-b.radius * 0.9} 0`} fill="#fb923c" stroke="#141414" strokeWidth="0.5" />
                    
                    {/* Huge Eyes */}
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.2} r={b.radius * 0.32} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.2} r={b.radius * 0.32} fill="#ffffff" stroke="#141414" strokeWidth="0.5" />
                    <circle cx={-b.radius * 0.25 + (b.vx / 25)} cy={-b.radius * 0.2 + (b.vy / 25)} r={b.radius * 0.14} fill="#141414" />
                    <circle cx={b.radius * 0.25 + (b.vx / 25)} cy={-b.radius * 0.2 + (b.vy / 25)} r={b.radius * 0.14} fill="#141414" />
                    
                    {/* Cheeks & Smile */}
                    <ellipse cx={-b.radius * 0.45} cy={b.radius * 0.15} rx={b.radius * 0.15} ry={b.radius * 0.1} fill="#f43f5e" opacity="0.8" />
                    <ellipse cx={b.radius * 0.45} cy={b.radius * 0.15} rx={b.radius * 0.15} ry={b.radius * 0.1} fill="#f43f5e" opacity="0.8" />
                    <path d={`M ${-b.radius * 0.3} ${b.radius * 0.35} Q 0 ${b.radius * 0.65} ${b.radius * 0.3} ${b.radius * 0.35}`} fill="none" stroke="#141414" strokeWidth="0.5" strokeLinecap="round" />
                  </g>
                )}

                {/* ANAIS CHARACTER */}
                {b.type === 'anais' && (
                  <g>
                    {/* Bunny Ears */}
                    <ellipse cx={-b.radius * 0.45} cy={-b.radius * 1.1} rx={b.radius * 0.25} ry={b.radius * 0.65} fill="#f472b6" stroke="#141414" strokeWidth="0.5" />
                    <ellipse cx={b.radius * 0.45} cy={-b.radius * 1.1} rx={b.radius * 0.25} ry={b.radius * 0.65} fill="#f472b6" stroke="#141414" strokeWidth="0.5" />
                    <circle cx="0" cy="0" r={b.radius} fill="url(#anaisFaceGrad)" stroke="#141414" strokeWidth="0.7" />
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.25} fill="#ffffff" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.25} fill="#ffffff" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={-b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.1} fill="#141414" />
                    <circle cx={b.radius * 0.28} cy={-b.radius * 0.15} r={b.radius * 0.1} fill="#141414" />
                  </g>
                )}

                {/* ROCK */}
                {b.type === 'rock' && (
                  <g>
                    <polygon
                      points={`${-b.radius},0 ${-b.radius * 0.7},${-b.radius * 0.8} ${b.radius * 0.6},${-b.radius * 0.9} ${b.radius},${-b.radius * 0.2} ${b.radius * 0.8},${b.radius * 0.8} ${-b.radius * 0.4},${b.radius}`}
                      fill="#78716c"
                      stroke="#141414"
                      strokeWidth="0.8"
                    />
                    <text x="0" y="0.8" textAnchor="middle" fill="#facc15" fontSize={b.radius * 0.6} fontWeight="black" fontFamily="monospace">
                      {b.mass}k
                    </text>
                  </g>
                )}

                {/* BALL */}
                {b.type === 'ball' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="#eab308" stroke="#141414" strokeWidth="0.7" />
                    <circle cx="0" cy="0" r={b.radius * 0.6} fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="1 1" />
                  </g>
                )}

                {/* FEATHER */}
                {b.type === 'feather' && (
                  <g>
                    <ellipse cx="0" cy="0" rx={b.radius * 0.4} ry={b.radius} fill="#f8fafc" stroke="#141414" strokeWidth="0.4" />
                    <line x1="0" y1={-b.radius} x2="0" y2={b.radius} stroke="#94a3b8" strokeWidth="0.3" />
                  </g>
                )}

                {/* ROCKET */}
                {b.type === 'rocket' && (
                  <g>
                    <polygon points={`0,${-b.radius * 1.3} ${b.radius * 0.7},${b.radius * 0.8} ${-b.radius * 0.7},${b.radius * 0.8}`} fill="#ef4444" stroke="#141414" strokeWidth="0.6" />
                    <circle cx="0" cy="0" r={b.radius * 0.35} fill="#38bdf8" stroke="#141414" strokeWidth="0.4" />
                    {/* Flame trail */}
                    <polygon points={`0,${b.radius * 1.4} ${b.radius * 0.4},${b.radius * 0.8} ${-b.radius * 0.4},${b.radius * 0.8}`} fill="#fbbf24" opacity="0.9" />
                  </g>
                )}

                {/* BOMB */}
                {b.type === 'bomb' && (
                  <g>
                    <circle cx="0" cy="0" r={b.radius} fill="#a855f7" stroke="#141414" strokeWidth="0.8" />
                    <rect x={-b.radius * 0.25} y={-b.radius * 1.25} width={b.radius * 0.5} height={b.radius * 0.4} fill="#6b21a8" stroke="#141414" strokeWidth="0.4" />
                    <circle cx={b.radius * 0.4} cy={-b.radius * 1.3} r={b.radius * 0.25} fill="#fbbf24" className="animate-ping" />
                    <text x="0" y="0.8" textAnchor="middle" fill="#ffffff" fontSize={b.radius * 0.7} fontWeight="black" fontFamily="monospace">
                      💣
                    </text>
                  </g>
                )}

                {/* Velocity Vector Arrow (v) */}
                {showVectors && vMag > 0.5 && (
                  <g>
                    <line
                      x1="0"
                      y1="0"
                      x2={b.vx * 0.45}
                      y2={b.vy * 0.45}
                      stroke="#22c55e"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                    />
                    <circle cx={b.vx * 0.45} cy={b.vy * 0.45} r="0.8" fill="#22c55e" stroke="#141414" strokeWidth="0.3" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Slingshot Launching Visual Guide */}
          {isPointerDown && dragStartPos && dragCurrentPos && (activeTool === 'spawn' || activeTool === 'slingshot') && (
            <g>
              <line
                x1={dragStartPos.x}
                y1={dragStartPos.y}
                x2={dragCurrentPos.x}
                y2={dragCurrentPos.y}
                stroke="#f43f5e"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              <circle cx={dragStartPos.x} cy={dragStartPos.y} r="2.0" fill="#f43f5e" />
              {/* Trajectory projection arrow */}
              <line
                x1={dragStartPos.x}
                y1={dragStartPos.y}
                x2={dragStartPos.x + (dragStartPos.x - dragCurrentPos.x)}
                y2={dragStartPos.y + (dragStartPos.y - dragCurrentPos.y)}
                stroke="#22c55e"
                strokeWidth="1.5"
              />
              <circle
                cx={dragStartPos.x + (dragStartPos.x - dragCurrentPos.x)}
                cy={dragStartPos.y + (dragStartPos.y - dragCurrentPos.y)}
                r="1.5"
                fill="#22c55e"
              />
            </g>
          )}
        </svg>

        {/* Live HUD Floating Tag on Canvas */}
        <div className="absolute top-3 left-3 bg-[#0d0a21]/90 border-2 border-cyan-400/80 px-3 py-1.5 rounded-xl font-mono text-[11px] text-cyan-200 shadow-[3px_3px_0px_#000] flex items-center gap-2 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>g = {gravity.toFixed(2)} m/s² | e = {globalRestitution.toFixed(2)} | Viento = {windSpeed} m/s</span>
        </div>
      </div>

      {/* 6. ADVANCED PHYSICAL CONSTANTS & SLIDERS ACCORDION */}
      <div className="bg-[#110e2f] border-4 border-cyan-400/80 p-5 rounded-3xl shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-purple-500/40 pb-2 flex-wrap gap-2">
          <h3 className="font-black text-sm sm:text-base text-yellow-300 uppercase flex items-center gap-2 font-mono">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Ajuste de Constantes del Universo
          </h3>
          <span className="text-[11px] font-mono text-purple-300">
            Modifica las leyes físicas en tiempo real
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Gravity Slider */}
          <PixelSlider
            label="Gravedad Vertical (g)"
            character="gumball"
            value={gravity}
            min={0}
            max={35}
            step={0.5}
            unit="m/s²"
            onChange={(newVal) => setGravity(newVal)}
            description="Aceleración gravitacional hacia el suelo"
            highlightFormula="F_g = m · g"
            presetTags={[
              { label: '0g 🚀', value: 0 },
              { label: '1.62 (Luna)', value: 1.62 },
              { label: '9.81 (Tierra)', value: 9.81 },
              { label: '24.8 (Júpiter)', value: 24.8 },
            ]}
          />

          {/* Restitution (Bounciness) Slider */}
          <PixelSlider
            label="Elasticidad Rebote (e)"
            character="darwin"
            value={globalRestitution}
            min={0}
            max={1.0}
            step={0.05}
            unit=""
            onChange={(newVal) => {
              setGlobalRestitution(newVal);
              setBodies((prev) => prev.map((b) => ({ ...b, restitution: newVal })));
            }}
            description="Coeficiente de restitución en choques y paredes"
            highlightFormula="e = v_separación / v_aproximación"
            presetTags={[
              { label: '0.2 (Inelástico)', value: 0.2 },
              { label: '0.7 (Goma)', value: 0.7 },
              { label: '1.0 (Elástico)', value: 1.0 },
            ]}
          />

          {/* Air Drag & Density */}
          <PixelSlider
            label="Densidad del Aire (ρ)"
            character="anais"
            value={airDensity}
            min={0}
            max={0.8}
            step={0.05}
            unit="kg/m³"
            onChange={(newVal) => setAirDensity(newVal)}
            description="Fricción aerodinámica que frena los cuerpos"
            highlightFormula="F_drag = ½ ρ v² C_d A"
            presetTags={[
              { label: '0 (Vacío)', value: 0 },
              { label: '0.15 (Aire)', value: 0.15 },
              { label: '0.6 (Fluido)', value: 0.6 },
            ]}
          />

          {/* Wind Speed */}
          <PixelSlider
            label="Velocidad Viento (v_w)"
            character="gumball"
            value={windSpeed}
            min={-25}
            max={25}
            step={1}
            unit="m/s"
            onChange={(newVal) => setWindSpeed(newVal)}
            description="Fuerza constante de arrastre lateral"
            highlightFormula="a_x = F_viento / m"
            presetTags={[
              { label: '-10 (← Izq)', value: -10 },
              { label: '0 (Calma)', value: 0 },
              { label: '+10 (Der →)', value: 10 },
            ]}
          />
        </div>

        {/* Feature Switches & Background Chooser */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-500/30 font-mono text-xs text-slate-200">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableMutualGravity}
                onChange={(e) => setEnableMutualGravity(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <span className="text-cyan-200 font-bold">Gravedad Mutua N-Cuerpos (F = G·M·m/r²)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableElectricForces}
                onChange={(e) => setEnableElectricForces(e.target.checked)}
                className="w-4 h-4 accent-yellow-400 rounded"
              />
              <span className="text-yellow-200 font-bold">Cargas Eléctricas (+ / -)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wrapBoundaries}
                onChange={(e) => setWrapBoundaries(e.target.checked)}
                className="w-4 h-4 accent-purple-400 rounded"
              />
              <span className="text-purple-200 font-bold">Paredes Abiertas (Wrap-around)</span>
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Fondo:</span>
            {[
              { id: 'space', label: '🚀 Espacio' },
              { id: 'garden', label: '🌸 Jardín' },
              { id: 'bus', label: '🚌 Bus' },
              { id: 'house', label: '🏡 Casa' },
              { id: 'grid', label: '📐 Rejilla' },
            ].map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBgChoice(bg.id as any)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  bgChoice === bg.id
                    ? 'bg-cyan-400 text-black border-black font-black'
                    : 'bg-[#1b173d] text-slate-300 border-purple-800'
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
