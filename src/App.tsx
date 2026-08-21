import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import bgHouse from './assets/images/suburban_house_bg_1785850447893.jpg';
import bgSpace from './assets/images/space_world_bg_1785850978031.jpg';
import bgRedLockers from './assets/images/red_lockers_bg_1785853032705.jpg';
import bgBusStop from './assets/images/elmore_bus_stop_1787235581594.jpg';
import esquizofreniaBg from './assets/images/esquizofrenia_bg_1786629914289.jpg';

const bgHouseSuburban = bgHouse;
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Compass,
  ArrowRightLeft,
  Eye,
  LayoutGrid,
  Globe,
  Rocket,
  Wind,
  Zap,
  Gauge,
  Layers,
  Box,
  Scale,
  Home,
  ArrowRight,
  Star,
  CheckCircle2,
  UserPlus,
  User,
  GraduationCap,
  X,
  Check,
  Trophy,
  Flag,
  Timer,
  Award,
  History,
  Flame,
  Target
} from 'lucide-react';
import { World4Parabolic } from './components/World4Parabolic';
import {
  getLorentzFactor,
  getContractedLength,
  PROPER_LENGTH,
} from './physics';
import { calcFreefallObject, calcCubeMotion } from './physicsSim';

// Custom interface for frozen trails
interface FrozenTrail {
  id: string;
  label: string;
  points: { x: number; y: number; isBreak?: boolean }[];
  color: string;
  v: number;
  type: 'light' | 'ball' | 'cube';
}

// Custom interface for World 2 Arrival Records
export interface RaceRecord {
  id: string;
  timestamp: string;
  mode: 'both' | 'mua' | 'mru';
  trackLength: number;
  muaTime: number;
  muaFinalSpeed: number;
  muaAvgSpeed: number;
  muaAcc: number;
  muaV0: number;
  mruTime: number;
  mruSpeed: number;
  winner: 'MUA' | 'MRU' | 'TIE' | 'SOLO_MUA' | 'SOLO_MRU';
  timeDiff: number;
  marginDistance: number;
}

export default function App() {
  // --- Navigation Screen State ---
  const [activeScreen, setActiveScreen] = useState<'home' | 'simulation'>('home');

  // --- User Profile / Registration State ---
  const [userProfile, setUserProfile] = useState<{ name: string; age: string; grade: string } | null>(() => {
    try {
      const saved = localStorage.getItem('esquizofrenia_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>(userProfile?.name || '');
  const [regAge, setRegAge] = useState<string>(userProfile?.age || '');
  const [regGrade, setRegGrade] = useState<string>(userProfile?.grade || '🎒 Primaria / Infantil (6 - 11 años)');
  const [regCustomGrade, setRegCustomGrade] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;
    const finalGrade = regGrade === '✨ Otro / Personalizado' ? (regCustomGrade.trim() || 'Estudiante Libre') : regGrade;
    const profile = {
      name: regName.trim(),
      age: regAge.trim() || 'Todas las edades',
      grade: finalGrade,
    };
    setUserProfile(profile);
    try {
      localStorage.setItem('esquizofrenia_user_profile', JSON.stringify(profile));
    } catch (err) {
      console.error(err);
    }
    setShowRegisterModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  // --- Simulation State ---
  const [worldMode, setWorldMode] = useState<'world1' | 'world2' | 'world3' | 'world4'>('world1'); // World 1 (Relatividad Bus), World 2 (Cubo MUA vs MRU), World 3 (Caída Libre Roca vs Moneda), World 4 (Tiro Parabólico 2D)
  const [v, setV] = useState<number>(0.80); // Speed of the bus (v/c)
  const [velocityInput, setVelocityInput] = useState<string>('0.80');
  const [viewMode, setViewMode] = useState<'split' | 'bus' | 'ground'>('split');
  const [projectileType, setProjectileType] = useState<'light' | 'ball' | 'cube'>('ball');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // Speed multiplier
  const [cubeSpeed, setCubeSpeed] = useState<number>(0.50); // Speed of the cube inside cabin u'/c
  const [cubeSpeedInput, setCubeSpeedInput] = useState<string>('0.50');
  const cubeSpeedRef = useRef<number>(0.50);

  // --- World 2 (MRU vs MUA Cubes) State ---
  const [world2SubMode, setWorld2SubMode] = useState<'both' | 'mua' | 'mru'>('both'); // 'both' (Carrera Comparativa), 'mua' (MUA Aislado), 'mru' (MRU Aislado)
  const [muaAcc, setMuaAcc] = useState<number>(2.5); // m/s^2
  const [muaV0, setMuaV0] = useState<number>(0.0); // m/s
  const [mruV, setMruV] = useState<number>(10.0); // m/s
  const [world2TrackLength, setWorld2TrackLength] = useState<number>(100); // meters

  // World 2 Arrival Registration State
  const [w2RaceHistory, setW2RaceHistory] = useState<RaceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('esquizofrenia_w2_race_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showPhotoFinishCard, setShowPhotoFinishCard] = useState<boolean>(true);
  const [showHistoryTable, setShowHistoryTable] = useState<boolean>(true);
  const w2LoggedRunRef = useRef<boolean>(false);

  // Sync w2RaceHistory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('esquizofrenia_w2_race_history', JSON.stringify(w2RaceHistory));
    } catch (e) {
      console.error(e);
    }
  }, [w2RaceHistory]);

  // --- World 3 (Caída Libre Gumball vs Darwin / Roca vs Moneda) State ---
  const [ffHeight, setFfHeight] = useState<number>(50); // meters
  const [ffVacuum, setFfVacuum] = useState<boolean>(false); // false = Con Aire (1 atm), true = Vacío (0 Pa)
  const [ffGravity, setFfGravity] = useState<number>(9.81); // m/s^2
  const [ffRockMass, setFfRockMass] = useState<number>(5.0); // 5 kg (Gumball)
  const [ffCoinMass, setFfCoinMass] = useState<number>(0.005); // 5 g = 0.005 kg (Darwin)
  const [w3CharacterType, setW3CharacterType] = useState<'gumball_darwin' | 'classic'>('gumball_darwin');
  const [w3ShowStepByStep, setW3ShowStepByStep] = useState<boolean>(true);

  // --- World 3 Long Distance Traveled State ---
  const [hallwayDist, setHallwayDist] = useState<number>(1000); // Distance range L in meters (100m to 3000m)
  const hallwayDistRef = useRef<number>(1000);

  // Sync cubeSpeed & hallwayDist with refs
  useEffect(() => {
    cubeSpeedRef.current = cubeSpeed;
  }, [cubeSpeed]);

  useEffect(() => {
    hallwayDistRef.current = hallwayDist;
  }, [hallwayDist]);
  
  // --- Visual Options ---
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [showSquash, setShowSquash] = useState<boolean>(true);
  const [showShadow, setShowShadow] = useState<boolean>(true);
  const [showSpin, setShowSpin] = useState<boolean>(true);

  // --- Time accumulators ---
  const [tPrime, setTPrime] = useState<number>(0);  // Proper time (Bus Frame S')
  const [tGround, setTGround] = useState<number>(0); // Coordinate time (Ground Frame S)
  const tGroundRef = useRef<number>(0);
  const tPrimeRef = useRef<number>(0);

  // --- Scroll offset for scenery seen from inside stationary bus ---
  const [scrollX, setScrollX] = useState<number>(0);
  const scrollXRef = useRef<number>(0);
  const vRef = useRef<number>(0.80);

  // --- Ground Trail for exterior parabolic curve ---
  const [activeTrail, setActiveTrail] = useState<{ x: number; y: number; isBreak?: boolean }[]>([]);
  const [frozenTrails, setFrozenTrails] = useState<FrozenTrail[]>([]);

  // --- Animation frame ref ---
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Sync v with vRef
  useEffect(() => {
    vRef.current = v;
  }, [v]);

  // Keep slider input in sync with v
  useEffect(() => {
    setVelocityInput(v.toFixed(3));
  }, [v]);

  // Handle velocity manual input change
  const handleVelocityChange = (val: string) => {
    setVelocityInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 0.999) {
      setV(parsed);
      vRef.current = parsed;
      resetSimulation();
    }
  };

  // Reset clock accumulators and trails
  const resetSimulation = () => {
    tGroundRef.current = 0;
    tPrimeRef.current = 0;
    setTPrime(0);
    setTGround(0);
    setActiveTrail([]);
    previousTimeRef.current = null;
    scrollXRef.current = 0;
    setScrollX(0);
    w2LoggedRunRef.current = false;
  };

  // Switch projectile type
  const handleProjectileTypeChange = (type: 'light' | 'ball' | 'cube') => {
    setProjectileType(type);
    resetSimulation();
  };

  // Color palette for frozen traces
  const traceColors = [
    '#00E5FF', // Neon Cyan
    '#D500F9', // Neon Purple
    '#FF4D00', // Neon Orange
    '#FFEA00', // Yellow
    '#00E676', // Green
  ];

  // Freeze current active trail to comparison list
  const freezeCurrentTrail = () => {
    if (activeTrail.length < 2) return;
    
    const color = traceColors[frozenTrails.length % traceColors.length];
    const newTrail: FrozenTrail = {
      id: Math.random().toString(36).substring(2, 9),
      label: `v = ${v.toFixed(2)}c (${projectileType === 'cube' ? 'Cubo Iba y Vuelta' : projectileType === 'light' ? 'Luz' : 'Pelota'})`,
      points: [...activeTrail],
      color,
      v,
      type: projectileType
    };

    setFrozenTrails([...frozenTrails, newTrail]);
  };

  // Calculated relativity factors
  const gamma = getLorentzFactor(v);
  const contractedLength = getContractedLength(PROPER_LENGTH, v);

  // --- Dimension and Draw Scaling ---
  const W_VIEW = 900;
  const H_VIEW = 320;
  const Y_GROUND = 250;
  const H_BUS = 130; // Pixels
  const Y_BUS_BOTTOM = Y_GROUND - 30; // 220
  const Y_BUS_TOP = Y_BUS_BOTTOM - H_BUS; // 90
  const PROPER_BUS_WIDTH = 380; // Pixels for PROPER_LENGTH (14m)

  // Dynamic current background based on world selection
  const currentBg = worldMode === 'world1' ? bgHouse : worldMode === 'world2' ? bgSpace : bgRedLockers;
  const gravityFactor = worldMode === 'world1' ? 1.0 : worldMode === 'world2' ? 0.35 : 1.0; // World 1: 1.0g Earth, World 2: 0.35g Space/Lunar floaty, World 3: Lockers Hallway

  // Projectile speeds in proper frame
  const uPrimeY = 0.6; // Vertical launch speed inside bus
  const T0_half = (1.0 / uPrimeY) / Math.sqrt(gravityFactor); // Proper time for one-way vertical trip
  const cycle = T0_half * 2; // Full bounce cycle in proper time

  // Calculate ball position relative to bus interior floor
  const getProjectilePos = (tPrimeTime: number, baseBottomY: number) => {
    const phase = tPrimeTime % cycle;
    const norm = phase / cycle; // 0.0 to 1.0
    const relativeYFrac = 4.0 * norm * (1.0 - norm); // True physical parabola
    const y = baseBottomY - relativeYFrac * H_BUS;
    return { y, relativeYFrac };
  };

  // --- Unified Animation Core Loop ---
  useEffect(() => {
    const updatePhysics = (timestamp: number) => {
      if (!previousTimeRef.current) previousTimeRef.current = timestamp;
      const realDtSeconds = (timestamp - previousTimeRef.current) / 1000;
      previousTimeRef.current = timestamp;

      const dt = Math.min(realDtSeconds, 0.1) * simSpeed;

      if (isPlaying) {
        const pixelScale = 220; // horizontal speed scaling
        const currentGamma = getLorentzFactor(vRef.current);

        // Advance coordinate time in Ground frame S
        tGroundRef.current += dt;
        tPrimeRef.current = tGroundRef.current / currentGamma;

        setTGround(tGroundRef.current);
        setTPrime(tPrimeRef.current);

        const nextGroundTime = tGroundRef.current;
        const nextProperTime = tPrimeRef.current;

        // Update scenery scroll offset for interior bus window
        scrollXRef.current -= vRef.current * dt * pixelScale;
        const spacing = 150;
        if (scrollXRef.current < -spacing * 10) scrollXRef.current += spacing * 10;
        if (scrollXRef.current > 0) scrollXRef.current -= spacing * 10;
        setScrollX(scrollXRef.current);

        // Ground bus position & object coordinates for trail
        const busCenterX = ((vRef.current * nextGroundTime * pixelScale) % (W_VIEW + 400)) - 200;
        let trailPointX = busCenterX;
        let trailPointY = Y_BUS_BOTTOM;

        if (worldMode === 'world3') {
          const currentDist = hallwayDistRef.current;
          const maxAmp = Math.min(410, Math.max(160, (currentDist / 1000) * 380 + 30));
          const tHalfCube = Math.max(1.2, (currentDist / 300) / Math.max(0.05, cubeSpeedRef.current));
          const tCycleCube = tHalfCube * 2;
          const phCube = nextProperTime % tCycleCube;
          let relX = 0;
          if (phCube < tHalfCube) {
            relX = -maxAmp + (phCube / tHalfCube) * (2 * maxAmp);
          } else {
            relX = +maxAmp - ((phCube - tHalfCube) / tHalfCube) * (2 * maxAmp);
          }
          trailPointX = 450 + relX;
          trailPointY = 240;
        } else if (projectileType === 'cube') {
          const tHalfCube = 1.4 / Math.max(0.05, cubeSpeedRef.current);
          const tCycleCube = tHalfCube * 2;
          const phCube = nextProperTime % tCycleCube;
          let relX = 0;
          if (phCube < tHalfCube) {
            relX = -140 + (phCube / tHalfCube) * 280;
          } else {
            relX = +140 - ((phCube - tHalfCube) / tHalfCube) * 280;
          }
          trailPointX = busCenterX + (relX / currentGamma);
          trailPointY = Y_BUS_BOTTOM - 25;
        } else {
          const { y: groundProjY } = getProjectilePos(nextProperTime, Y_BUS_BOTTOM);
          trailPointX = busCenterX;
          trailPointY = groundProjY;
        }

        if (showTrail) {
          setActiveTrail((trail) => {
            const newPoint = { x: trailPointX, y: trailPointY };
            if (trail.length > 0) {
              const lastPt = trail[trail.length - 1];
              const dist = Math.abs(newPoint.x - lastPt.x);
              if (dist > 300) {
                return [...trail, { ...newPoint, isBreak: true }].slice(-400);
              }
            }
            return [...trail, newPoint].slice(-400);
          });
        }
      }

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, simSpeed, gamma, projectileType, showTrail, worldMode]);

  // Positions for interior and exterior renderings
  const pixelScale = 220;
  const exteriorBusX = ((v * tGround * pixelScale) % (W_VIEW + 400)) - 200;
  const currentBusWidthExterior = PROPER_BUS_WIDTH / gamma;

  // Cube back-and-forth oscillation math in Frame S' and Frame S
  const maxAmpW2 = Math.min(410, Math.max(160, (hallwayDist / 1000) * 380 + 30));
  const T0_cube_half = worldMode === 'world3'
    ? Math.max(1.2, (hallwayDist / 300) / Math.max(0.05, cubeSpeed))
    : 1.4 / Math.max(0.05, cubeSpeed);
  const cycle_cube = T0_cube_half * 2;
  const phase_cube = tPrime % cycle_cube;
  
  let cubeRelX = 0;
  let uPrimeX_cube = cubeSpeed;
  if (phase_cube < T0_cube_half) {
    cubeRelX = worldMode === 'world3'
      ? -maxAmpW2 + (phase_cube / T0_cube_half) * (2 * maxAmpW2)
      : -140 + (phase_cube / T0_cube_half) * 280;
    uPrimeX_cube = cubeSpeed; // Moving right -> (Ir)
  } else {
    cubeRelX = worldMode === 'world3'
      ? +maxAmpW2 - ((phase_cube - T0_cube_half) / T0_cube_half) * (2 * maxAmpW2)
      : +140 - ((phase_cube - T0_cube_half) / T0_cube_half) * 280;
    uPrimeX_cube = -cubeSpeed; // Moving left <- (Vuelta)
  }

  const exteriorCubeX = exteriorBusX + (cubeRelX / gamma);
  const u_x_fwd = (cubeSpeed + v) / (1 + cubeSpeed * v);
  const u_x_bwd = (-cubeSpeed + v) / (1 - cubeSpeed * v);
  const u_x_cube = uPrimeX_cube > 0 ? u_x_fwd : u_x_bwd;

  const { y: interiorProjY, relativeYFrac } = getProjectilePos(tPrime, Y_BUS_BOTTOM);
  const exteriorProjY = interiorProjY; // Heights match in y axis

  // Instantaneous velocities
  const phase = tPrime % cycle;
  const normPhase = phase / cycle;
  const uPrimeY_instant = uPrimeY * (1.0 - 2.0 * normPhase);

  const u_x = v;
  const u_y = uPrimeY_instant / gamma;
  const totalSpeed = Math.sqrt(u_x * u_x + u_y * u_y);

  // Dynamic deformation & spin
  let squashX = 1.0;
  let squashY = 1.0;
  if (showSquash) {
    if (relativeYFrac < 0.08) {
      const compress = (0.08 - relativeYFrac) / 0.08;
      squashY = 1.0 - 0.35 * compress;
      squashX = 1.0 + 0.35 * compress;
    } else {
      const velRatio = Math.abs(uPrimeY_instant) / uPrimeY;
      squashY = 1.0 + 0.18 * velRatio;
      squashX = 1.0 / Math.sqrt(squashY);
    }
  }

  const ballSpinAngle = showSpin ? (scrollX * -0.5 + tPrime * 180) % 360 : 0;

  // Complete Parabola Arc calculation for Observador B
  const groundCycleDuration = gamma * cycle;
  const deltaXSpan = v * groundCycleDuration * pixelScale;

  const arcStartX = exteriorBusX - normPhase * deltaXSpan;
  const arcApexX = arcStartX + deltaXSpan / 2;
  const arcEndX = arcStartX + deltaXSpan;

  let parabolaPathD = '';
  const pathSteps = 60;
  for (let i = 0; i <= pathSteps; i++) {
    const s = i / pathSteps;
    const px = arcStartX + s * deltaXSpan;
    const py = Y_BUS_BOTTOM - 4 * H_BUS * s * (1 - s);
    if (i === 0) {
      parabolaPathD += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
    } else {
      parabolaPathD += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
  }

  // --- World 2 Physics Calculation ---
  const cubePhysics = calcCubeMotion(tGround, muaV0, muaAcc, mruV, world2TrackLength);
  const w2State = {
    t: tGround,
    x_mua: cubePhysics.mua.x,
    v_mua: cubePhysics.mua.v,
    a_mua: cubePhysics.mua.a,
    reached_mua: cubePhysics.mua.isFinished,
    x_mru: cubePhysics.mru.x,
    v_mru: cubePhysics.mru.v,
    a_mru: cubePhysics.mru.a,
    reached_mru: cubePhysics.mru.isFinished,
  };

  const w2IntersectT = muaAcc > 0 ? (2 * (mruV - muaV0)) / muaAcc : -1;
  const w2IntersectX = w2IntersectT > 0 ? mruV * w2IntersectT : -1;

  const w2ChartData = Array.from({ length: 31 }, (_, i) => {
    const maxFinTime = Math.max(cubePhysics.mua.timeToFinish, cubePhysics.mru.timeToFinish, 1);
    const timePoint = (maxFinTime / 30) * i;
    const res = calcCubeMotion(timePoint, muaV0, muaAcc, mruV, world2TrackLength);
    return {
      t: parseFloat(timePoint.toFixed(2)),
      x_mua: parseFloat(res.mua.x.toFixed(1)),
      v_mua: parseFloat(res.mua.v.toFixed(1)),
      x_mru: parseFloat(res.mru.x.toFixed(1)),
      v_mru: parseFloat(res.mru.v.toFixed(1)),
    };
  });

  // World 2 Arrival Registration Effect
  useEffect(() => {
    if (worldMode !== 'world2') return;
    const isFirstArrived =
      world2SubMode === 'both'
        ? w2State.reached_mua || w2State.reached_mru
        : world2SubMode === 'mua'
        ? w2State.reached_mua
        : w2State.reached_mru;

    if (isFirstArrived && !w2LoggedRunRef.current && tGround > 0.05) {
      w2LoggedRunRef.current = true;
      const newRecord: RaceRecord = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        mode: world2SubMode,
        trackLength: world2TrackLength,
        muaTime: cubePhysics.mua.timeToFinish,
        muaFinalSpeed: cubePhysics.mua.vFinish,
        muaAvgSpeed: cubePhysics.mua.avgSpeed,
        muaAcc,
        muaV0,
        mruTime: cubePhysics.mru.timeToFinish,
        mruSpeed: mruV,
        winner:
          world2SubMode === 'both'
            ? cubePhysics.winner
            : world2SubMode === 'mua'
            ? 'SOLO_MUA'
            : 'SOLO_MRU',
        timeDiff: cubePhysics.timeDiff,
        marginDistance: cubePhysics.marginDistanceMeters,
      };
      setW2RaceHistory((prev) => [newRecord, ...prev.slice(0, 24)]);
    }
  }, [w2State.reached_mua, w2State.reached_mru, worldMode, world2SubMode, tGround]);

  // --- World 3 Freefall Physics Calculation ---
  const rockRes = calcFreefallObject(tGround, ffHeight, ffGravity, ffRockMass, 0.47, 0.03, ffVacuum);
  const coinRes = calcFreefallObject(tGround, ffHeight, ffGravity, ffCoinMass, 1.15, 0.0004, ffVacuum);

  const w3Rock = {
    t: tGround,
    y: rockRes.y,
    v: rockRes.v,
    a: rockRes.a,
    impactTime: rockRes.impactTime,
    impacted: rockRes.hasLanded,
    regime: rockRes.modelType,
    v_term: rockRes.vTerm || 999,
  };

  const w3Coin = {
    t: tGround,
    y: coinRes.y,
    v: coinRes.v,
    a: coinRes.a,
    impactTime: coinRes.impactTime,
    impacted: coinRes.hasLanded,
    regime: coinRes.modelType,
    v_term: coinRes.vTerm || 999,
  };

  const w3MaxTime = Math.max(rockRes.impactTime, coinRes.impactTime, 1);
  const w3ChartData = Array.from({ length: 31 }, (_, i) => {
    const timePoint = (w3MaxTime / 30) * i;
    const rRes = calcFreefallObject(timePoint, ffHeight, ffGravity, ffRockMass, 0.47, 0.03, ffVacuum);
    const cRes = calcFreefallObject(timePoint, ffHeight, ffGravity, ffCoinMass, 1.15, 0.0004, ffVacuum);
    return {
      t: parseFloat(timePoint.toFixed(2)),
      v_rock: parseFloat(rRes.v.toFixed(1)),
      v_coin: parseFloat(cRes.v.toFixed(1)),
      y_rock: parseFloat(rRes.y.toFixed(1)),
      y_coin: parseFloat(cRes.y.toFixed(1)),
    };
  });

  if (activeScreen === 'home') {
    return (
      <div className="min-h-screen w-full bg-[#0d0926] text-white flex flex-col justify-between selection:bg-pink-500 selection:text-white p-4 md:p-8 relative overflow-hidden font-sans bg-[radial-gradient(#ec4899_2px,transparent_2px)] [background-size:28px_28px]">
        {/* Ambient Glows & Maximalist Radial Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 rounded-full blur-[150px] opacity-50 pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-600 rounded-full blur-[150px] opacity-50 pointer-events-none animate-pulse" />
        <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] bg-amber-400/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[30%] left-[10%] w-[400px] h-[400px] bg-pink-600/30 rounded-full blur-[120px] pointer-events-none" />

        {/* ================= MAXIMALIST WEIRD CREATURES & DOODLES (CRIATURAS RARAS) ================= */}

        {/* CREATURE 1: Three-Eyed Purple Tentacle Monster (Top-Left) */}
        <div className="absolute top-6 left-4 lg:left-12 pointer-events-none z-0 hover:scale-110 transition-transform hidden sm:block animate-bounce" style={{ animationDuration: '3.5s' }}>
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            {/* Body */}
            <path d="M 20 70 Q 10 30 50 15 Q 90 30 80 70 Q 50 85 20 70 Z" fill="#a855f7" stroke="#141414" strokeWidth="4" />
            {/* Tentacles */}
            <path d="M 25 70 Q 15 90 5 80" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
            <path d="M 25 70 Q 15 90 5 80" stroke="#141414" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 50 78 Q 50 98 40 92" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
            <path d="M 50 78 Q 50 98 40 92" stroke="#141414" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 75 70 Q 85 90 95 82" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
            <path d="M 75 70 Q 85 90 95 82" stroke="#141414" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Eyes */}
            <circle cx="35" cy="35" r="10" fill="#FFF" stroke="#141414" strokeWidth="2.5" />
            <circle cx="35" cy="35" r="4" fill="#141414" />
            <circle cx="65" cy="35" r="10" fill="#FFF" stroke="#141414" strokeWidth="2.5" />
            <circle cx="65" cy="35" r="4" fill="#141414" />
            <circle cx="50" cy="22" r="8" fill="#FFF" stroke="#141414" strokeWidth="2.5" />
            <circle cx="50" cy="22" r="3" fill="#141414" />
            {/* Wide Mouth with Sharp Tooth */}
            <path d="M 30 55 Q 50 70 70 55" fill="#141414" stroke="#141414" strokeWidth="2" />
            <polygon points="45,55 50,63 55,55" fill="#FFF" />
          </svg>
          <div className="absolute -top-4 -right-8 bg-yellow-300 text-black px-2 py-0.5 rounded-lg border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_#000] rotate-[6deg]">
            👾 ¡GRAVEDAD!
          </div>
        </div>

        {/* CREATURE 2: Green Slime Monster with Glasses & Formula (Top-Right) */}
        <div className="absolute top-10 right-6 lg:right-16 pointer-events-none z-0 hidden sm:block animate-pulse" style={{ animationDuration: '4s' }}>
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
            {/* Slime Body */}
            <path d="M 20 50 Q 20 10 50 15 Q 80 10 80 50 Q 90 80 50 85 Q 10 80 20 50 Z" fill="#22c55e" stroke="#141414" strokeWidth="4" />
            {/* Big Single Eye */}
            <circle cx="50" cy="40" r="16" fill="#FFF" stroke="#141414" strokeWidth="3" />
            <circle cx="50" cy="40" r="7" fill="#141414" />
            <circle cx="52" cy="38" r="2.5" fill="#FFF" />
            {/* Nerd Glasses */}
            <rect x="28" y="28" width="22" height="22" rx="4" fill="none" stroke="#141414" strokeWidth="3" />
            <rect x="50" y="28" width="22" height="22" rx="4" fill="none" stroke="#141414" strokeWidth="3" />
            <line x1="48" y1="38" x2="52" y2="38" stroke="#141414" strokeWidth="3" />
            {/* Tongue */}
            <path d="M 40 65 Q 50 80 55 65" fill="#ef4444" stroke="#141414" strokeWidth="2" />
          </svg>
          <div className="absolute -bottom-2 -left-6 bg-pink-500 text-white px-2.5 py-0.5 rounded-lg border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_#000] rotate-[-8deg]">
            ⚡ E = mc²
          </div>
        </div>

        {/* CREATURE 3: Flying Cyclops Alien UFO (Middle-Left) */}
        <div className="absolute top-1/3 left-2 lg:left-8 pointer-events-none z-0 hidden md:block animate-bounce" style={{ animationDuration: '5s' }}>
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            {/* Glass Dome */}
            <path d="M 35 45 A 25 25 0 0 1 85 45 Z" fill="#38bdf8" opacity="0.8" stroke="#141414" strokeWidth="3" />
            {/* Flying Saucer Base */}
            <ellipse cx="60" cy="55" rx="50" ry="16" fill="#f43f5e" stroke="#141414" strokeWidth="4" />
            <ellipse cx="60" cy="55" rx="40" ry="8" fill="#fbbf24" stroke="#141414" strokeWidth="2" />
            {/* Alien inside dome */}
            <circle cx="60" cy="38" r="10" fill="#a3e635" stroke="#141414" strokeWidth="2" />
            <circle cx="60" cy="36" r="4" fill="#FFF" stroke="#141414" strokeWidth="1" />
            <circle cx="60" cy="36" r="2" fill="#141414" />
            <path d="M 56 42 Q 60 45 64 42" fill="none" stroke="#141414" strokeWidth="1.5" />
            {/* Thruster Beams */}
            <polygon points="40,68 30,90 50,90" fill="#00E5FF" opacity="0.8" stroke="#141414" strokeWidth="2" />
            <polygon points="70,68 60,90 80,90" fill="#00E5FF" opacity="0.8" stroke="#141414" strokeWidth="2" />
          </svg>
          <div className="absolute top-0 -right-6 bg-cyan-400 text-black px-2 py-0.5 rounded-lg border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_#000] rotate-[5deg]">
            🛸 v = 0.8c
          </div>
        </div>

        {/* CREATURE 4: Brain Monster with Lightning Ears (Middle-Right) */}
        <div className="absolute top-1/2 right-4 lg:right-10 pointer-events-none z-0 hidden md:block animate-pulse" style={{ animationDuration: '3s' }}>
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
            {/* Brain Body */}
            <circle cx="50" cy="50" r="35" fill="#00E5FF" stroke="#141414" strokeWidth="4" />
            {/* Brain Squiggles */}
            <path d="M 30 35 C 30 25, 45 25, 45 35 C 45 45, 30 45, 30 55" stroke="#141414" strokeWidth="2.5" fill="none" />
            <path d="M 70 35 C 70 25, 55 25, 55 35 C 55 45, 70 45, 70 55" stroke="#141414" strokeWidth="2.5" fill="none" />
            {/* Googly Eyes */}
            <circle cx="42" cy="60" r="7" fill="#FFF" stroke="#141414" strokeWidth="2" />
            <circle cx="42" cy="60" r="3" fill="#141414" />
            <circle cx="58" cy="60" r="7" fill="#FFF" stroke="#141414" strokeWidth="2" />
            <circle cx="58" cy="60" r="3" fill="#141414" />
            {/* Lightning Ears */}
            <polygon points="12,30 22,40 16,42 26,55 18,48" fill="#facc15" stroke="#141414" strokeWidth="2" />
            <polygon points="88,30 78,40 84,42 74,55 82,48" fill="#facc15" stroke="#141414" strokeWidth="2" />
          </svg>
          <div className="absolute -top-3 -left-8 bg-yellow-400 text-black px-2 py-0.5 rounded-lg border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_#000] rotate-[-6deg]">
            🧠 ¡ACELERACIÓN!
          </div>
        </div>

        {/* CREATURE 5: Striped Caterpillar Worm Monster with Spiral Glasses (Bottom-Left) */}
        <div className="absolute bottom-12 left-4 lg:left-14 pointer-events-none z-0 hidden lg:block animate-bounce" style={{ animationDuration: '4.5s' }}>
          <svg width="130" height="90" viewBox="0 0 130 90" fill="none">
            {/* Body Segments */}
            <circle cx="20" cy="55" r="18" fill="#f97316" stroke="#141414" strokeWidth="3" />
            <circle cx="42" cy="50" r="18" fill="#facc15" stroke="#141414" strokeWidth="3" />
            <circle cx="64" cy="52" r="18" fill="#f97316" stroke="#141414" strokeWidth="3" />
            <circle cx="86" cy="48" r="18" fill="#facc15" stroke="#141414" strokeWidth="3" />
            <circle cx="108" cy="40" r="22" fill="#FF007F" stroke="#141414" strokeWidth="3.5" />
            {/* Eyes with Spiral */}
            <circle cx="100" cy="32" r="7" fill="#FFF" stroke="#141414" strokeWidth="2" />
            <path d="M 98 32 A 2 2 0 0 1 102 32" stroke="#141414" strokeWidth="2" fill="none" />
            <circle cx="116" cy="32" r="7" fill="#FFF" stroke="#141414" strokeWidth="2" />
            <path d="M 114 32 A 2 2 0 0 1 118 32" stroke="#141414" strokeWidth="2" fill="none" />
            {/* Antennae */}
            <line x1="104" y1="20" x2="98" y2="6" stroke="#141414" strokeWidth="3" />
            <circle cx="98" cy="5" r="4" fill="#00E5FF" stroke="#141414" strokeWidth="1.5" />
            <line x1="112" y1="20" x2="118" y2="6" stroke="#141414" strokeWidth="3" />
            <circle cx="118" cy="5" r="4" fill="#00E5FF" stroke="#141414" strokeWidth="1.5" />
          </svg>
          <div className="absolute -top-3 left-6 bg-emerald-400 text-black px-2 py-0.5 rounded-lg border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_#000] rotate-[4deg]">
            🐛 F = m·a
          </div>
        </div>

        {/* CREATURE 6: Cat-Eared Star Monster (Bottom-Right) */}
        <div className="absolute bottom-16 right-6 lg:right-16 pointer-events-none z-0 hidden lg:block animate-pulse" style={{ animationDuration: '3.8s' }}>
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
            {/* Star Body */}
            <polygon points="50,10 62,38 90,38 68,56 76,85 50,68 24,85 32,56 10,38 38,38" fill="#facc15" stroke="#141414" strokeWidth="4" />
            {/* Cat Ears */}
            <polygon points="32,25 25,5 42,18" fill="#FF007F" stroke="#141414" strokeWidth="2.5" />
            <polygon points="68,25 75,5 58,18" fill="#FF007F" stroke="#141414" strokeWidth="2.5" />
            {/* Cute Eyes & Blushing */}
            <circle cx="40" cy="42" r="4" fill="#141414" />
            <circle cx="60" cy="42" r="4" fill="#141414" />
            <ellipse cx="34" cy="48" rx="4" ry="2" fill="#FF007F" opacity="0.6" />
            <ellipse cx="66" cy="48" rx="4" ry="2" fill="#FF007F" opacity="0.6" />
            <path d="M 45 48 Q 50 53 55 48" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="absolute -top-2 -left-6 bg-pink-500 text-white px-2 py-0.5 rounded-lg border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0px_#000] rotate-[-5deg]">
            ⭐ ¡BOING!
          </div>
        </div>

        {/* FLOATING COMIC POP-ART STICKERS & SPEECH BUBBLES */}
        <div className="absolute top-28 left-1/4 bg-yellow-300 border-3 border-black text-black font-mono font-black text-xs px-3 py-1.5 rounded-2xl shadow-[4px_4px_0px_#000] rotate-[-6deg] hidden xl:block animate-bounce" style={{ animationDuration: '6s' }}>
          💥 POW! FÍSICA DIVERTIDA
        </div>
        <div className="absolute bottom-32 right-1/4 bg-cyan-300 border-3 border-black text-black font-mono font-black text-xs px-3 py-1.5 rounded-2xl shadow-[4px_4px_0px_#000] rotate-[8deg] hidden xl:block animate-pulse" style={{ animationDuration: '4s' }}>
          🌀 γ = 1 / √(1 - v²/c²)
        </div>
        <div className="absolute top-1/2 left-6 bg-pink-400 border-3 border-black text-white font-mono font-black text-xs px-3 py-1.5 rounded-2xl shadow-[4px_4px_0px_#000] rotate-[12deg] hidden xl:block">
          ⚡ BZZZT!
        </div>

        {/* Hero Section */}
        <main className="w-full max-w-4xl mx-auto my-auto flex flex-col items-center justify-center text-center space-y-8 z-10 py-6">
          {/* MAIN TITLE: "esquizofrenia" */}
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 via-emerald-400 via-cyan-400 to-purple-500 drop-shadow-[6px_6px_0px_#000]">
              esquizofrenia
            </h1>
          </div>

          {/* MAIN START BUTTON & REGISTER BUTTON */}
          <div className="pt-2 flex flex-col items-center space-y-4 w-full max-w-xl">
            {/* Start Button */}
            <button
              onClick={() => {
                setWorldMode('world1');
                setActiveScreen('simulation');
              }}
              className="w-full px-10 py-6 bg-gradient-to-r from-yellow-300 via-pink-400 via-emerald-400 to-cyan-400 border-5 border-black text-black font-black text-2xl sm:text-3xl uppercase tracking-wider rounded-3xl shadow-[10px_10px_0px_#000] hover:shadow-[16px_16px_0px_#00E5FF] hover:-translate-y-1.5 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-4 cursor-pointer group rotate-[-1deg]"
            >
              <Zap className="w-10 h-10 fill-yellow-300 text-black group-hover:animate-bounce" />
              <span>¡ INICIAR SIMULACIÓN !</span>
              <ArrowRight className="w-10 h-10 text-black group-hover:translate-x-3 transition-transform" />
            </button>

            {/* BOTÓN DE REGISTRO */}
            <button
              onClick={() => {
                setRegName(userProfile?.name || '');
                setRegAge(userProfile?.age || '');
                setRegGrade(userProfile?.grade || '🎒 Primaria / Infantil (6 - 11 años)');
                setShowRegisterModal(true);
              }}
              className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-4 border-black text-white font-black text-lg sm:text-xl uppercase tracking-wider rounded-2xl shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#facc15] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer group rotate-[1deg]"
            >
              <UserPlus className="w-7 h-7 text-yellow-300 group-hover:scale-125 transition-transform" />
              <span>{userProfile ? '✏️ EDITAR MI PERFIL DE REGISTRO' : '📝 REGISTRARSE (TODAS LAS EDADES)'}</span>
            </button>

            {/* User Profile Badge if registered */}
            {userProfile && (
              <div className="flex flex-wrap items-center justify-center gap-3 bg-[#16123b]/95 border-3 border-yellow-400 px-6 py-2.5 rounded-2xl shadow-[5px_5px_0px_#000] text-xs font-mono font-bold text-amber-200">
                <span className="bg-pink-500 text-white px-2.5 py-1 rounded-lg border-2 border-black font-black flex items-center gap-1">
                  <User className="w-4 h-4 text-yellow-300" />
                  <span>Estudiante: {userProfile.name}</span>
                </span>
                <span>• Edad: <strong className="text-cyan-300">{userProfile.age}</strong></span>
                <span>• Grado: <strong className="text-emerald-300">{userProfile.grade}</strong></span>
              </div>
            )}
          </div>

          {/* CREDITS BANNER (Créditos del Proyecto) */}
          <div className="w-full max-w-2xl bg-[#16123b]/95 border-4 border-yellow-400 rounded-3xl p-6 shadow-[10px_10px_0px_#facc15] text-center space-y-4 relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-yellow-400 border-2 border-black rounded-full text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] rotate-[-1deg]">
              <span>🏫 CRÉDITOS DEL PROYECTO ACADÉMICO</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 drop-shadow-[2px_2px_0px_#000]">
              Institución Educativa Josefa Campos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs font-mono font-bold">
              <div className="bg-[#0d0926] p-4 rounded-2xl border-2 border-pink-500/80 text-pink-200 flex flex-col items-center justify-center gap-1 shadow-[4px_4px_0px_#000]">
                <span className="text-yellow-300 font-black uppercase text-xs flex items-center gap-1">
                  <span>✍️ Autores:</span>
                </span>
                <span className="text-white text-base font-black">Isabel Sofía López</span>
                <span className="text-white text-base font-black">& Juan Alejandro Mejía</span>
              </div>

              <div className="bg-[#0d0926] p-4 rounded-2xl border-2 border-cyan-400/80 text-cyan-200 flex flex-col items-center justify-center gap-1 shadow-[4px_4px_0px_#000]">
                <span className="text-cyan-300 font-black uppercase text-xs flex items-center gap-1">
                  <span>👨‍🏫 Docente Orientador:</span>
                </span>
                <span className="text-white text-base font-black">Jorge Armando Jaramillo Bravo</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-5xl mx-auto py-4 border-t-3 border-black text-center font-mono text-xs text-amber-200 z-10 flex flex-col md:flex-row items-center justify-between gap-3 bg-[#16123b]/90 p-5 rounded-2xl border-3 border-black shadow-[6px_6px_0px_#000]">
          <div className="text-left space-y-0.5">
            <p className="font-black text-white text-sm">🏛️ Institución Educativa Josefa Campos</p>
            <p className="text-[11px] text-pink-300 font-bold">Autores: Isabel Sofía López y Juan Alejandro Mejía</p>
            <p className="text-[11px] text-cyan-300 font-bold">Docente: Jorge Armando Jaramillo Bravo</p>
          </div>
          <div className="text-right flex flex-col items-center md:items-end gap-1">
            <span className="text-pink-400 font-black flex items-center gap-1">
              <span>Relatividad</span> | <span>MUA</span> | <span>Caída Libre</span> 🌈
            </span>
            <span className="text-[10px] text-slate-400 font-mono">🎨 Esquizofrenia Physics Cartoon App &copy; 2026</span>
          </div>
        </footer>

        {/* REGISTRATION MODAL (POP-ART CARTOON AESTHETIC) */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#16123b] border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[12px_12px_0px_#FF007F] text-white font-sans bg-[radial-gradient(#ec4899_1.5px,transparent_1.5px)] [background-size:20px_20px]">
              
              {/* Close Button */}
              <button
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-yellow-400 border-3 border-black text-black font-black text-xl rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] hover:bg-pink-500 hover:text-white transition-all cursor-pointer rotate-[3deg]"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>

              {/* Modal Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-yellow-400 border-2 border-black rounded-full text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] rotate-[-2deg]">
                  <GraduationCap className="w-4 h-4 fill-black" />
                  <span>PARA TODAS LAS EDADES 🌈</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 drop-shadow-[2px_2px_0px_#000]">
                  📝 REGISTRO DE ESTUDIANTE
                </h2>
                <p className="text-xs font-mono text-amber-200 font-bold">
                  Ingresa tu información para tu pasaporte de física multiversal
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Field 1: Nombre */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-pink-400" />
                    <span>1. Nombre o Apodo:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej: Darwin, Marie Curie, Sofía, Profe Carlos..."
                    className="w-full px-4 py-3 bg-[#0d0926] border-3 border-black rounded-2xl text-white font-bold placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 shadow-[4px_4px_0px_#000]"
                  />
                </div>

                {/* Field 2: Edad (Para todas las edades) */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <span>2. Edad (¡Para todas las edades!):</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      placeholder="Ej: 10 años, 16 años, Adulto, etc."
                      className="w-full px-4 py-3 bg-[#0d0926] border-3 border-black rounded-2xl text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 shadow-[4px_4px_0px_#000]"
                    />
                    {/* Quick age options */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['7 años', '12 años', '16 años', '20+ años', 'Todas las edades 🌈'].map((ageOption) => (
                        <button
                          key={ageOption}
                          type="button"
                          onClick={() => setRegAge(ageOption)}
                          className={`px-2.5 py-1 text-[11px] font-mono font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                            regAge === ageOption
                              ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_#000]'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {ageOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Field 3: Grado o Nivel Educativo */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>3. Grado / Nivel Educativo:</span>
                  </label>
                  <select
                    value={regGrade}
                    onChange={(e) => setRegGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d0926] border-3 border-black rounded-2xl text-white font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 shadow-[4px_4px_0px_#000] cursor-pointer"
                  >
                    <option value="🎒 Primaria / Infantil (6 - 11 años)">🎒 Primaria / Infantil (6 - 11 años)</option>
                    <option value="📐 Secundaria / Educación Básica (12 - 15 años)">📐 Secundaria / Educación Básica (12 - 15 años)</option>
                    <option value="🧪 Bachillerato / Preparatoria (16 - 18 años)">🧪 Bachillerato / Preparatoria (16 - 18 años)</option>
                    <option value="🎓 Universidad / Educación Superior">🎓 Universidad / Educación Superior</option>
                    <option value="🧠 Curioso / Autodidacta (Todas las edades)">🧠 Curioso / Autodidacta (Todas las edades)</option>
                    <option value="✨ Otro / Personalizado">✨ Otro / Personalizado</option>
                  </select>

                  {/* Custom grade input if selected */}
                  {regGrade === '✨ Otro / Personalizado' && (
                    <input
                      type="text"
                      value={regCustomGrade}
                      onChange={(e) => setRegCustomGrade(e.target.value)}
                      placeholder="Escribe tu grado o nivel personalizado..."
                      className="w-full mt-2 px-4 py-2.5 bg-[#0d0926] border-3 border-black rounded-2xl text-white font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-400 shadow-[4px_4px_0px_#000]"
                    />
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 border-4 border-black text-black font-black text-lg uppercase tracking-wider rounded-2xl shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#00E5FF] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer rotate-[-1deg]"
                  >
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>¡ GUARDAR Y ENTRAR ! 🚀</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Alert on Profile Save */}
        {showSuccessToast && (
          <div className="fixed top-6 right-6 z-50 bg-yellow-400 border-4 border-black text-black p-4 rounded-2xl shadow-[6px_6px_0px_#000] flex items-center gap-3 animate-bounce">
            <div className="w-10 h-10 bg-pink-500 rounded-xl border-2 border-black flex items-center justify-center text-white text-xl font-black">
              🌟
            </div>
            <div>
              <p className="font-black text-sm uppercase">¡PERFIL GUARDADO CON ÉXITO!</p>
              <p className="text-xs font-mono font-bold">Bienvenido/a, {userProfile?.name} 🎉</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans antialiased p-2 sm:p-4 md:p-6 transition-all duration-500 ${
        worldMode === 'world2'
          ? 'bg-[#060913] text-purple-100 selection:bg-[#a855f7] selection:text-white'
          : 'bg-cover bg-center bg-fixed text-[#141414] selection:bg-[#FF4D00] selection:text-white'
      }`}
      style={{
        backgroundImage: worldMode === 'world1'
          ? `linear-gradient(to bottom, rgba(228, 227, 224, 0.86), rgba(228, 227, 224, 0.92)), url(${currentBg})`
          : `radial-gradient(ellipse at top, #1e1b4b 0%, #060913 85%)`
      }}
    >
      {/* Top Header Navigation */}
      <header className={`w-full max-w-7xl mx-auto border-4 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        worldMode === 'world1'
          ? 'bg-[#CECDBA] border-[#141414] shadow-[6px_6px_0px_#141414] text-[#141414]'
          : worldMode === 'world2'
            ? 'bg-[#0f172a] border-[#a855f7] shadow-[0_0_25px_rgba(168,85,247,0.35)] text-slate-100'
            : 'bg-[#0f172a] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)] text-slate-100'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveScreen('home')}
            className={`px-3 py-2 border-2 font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              worldMode === 'world1'
                ? 'bg-[#FF4D00] text-white border-[#141414] shadow-[2px_2px_0px_#141414] hover:bg-[#e04400]'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-purple-300 shadow-[0_0_10px_#a855f7]'
            }`}
            title="Volver a la Pantalla de Inicio"
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${worldMode === 'world1' ? 'text-[#141414]' : 'text-white'}`}>
                {worldMode === 'world1'
                  ? 'Mundo 1: Perspectivas Simultáneas (Relatividad Especial)'
                  : worldMode === 'world2'
                    ? 'Mundo 2: Simulador de MUA y MRU con Cubo en Pista Horizontal'
                    : 'Mundo 3: Caída Libre (Roca de 5 kg vs Moneda de 5 g) — MUA y MRU'}
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase border-2 ${
                worldMode === 'world1'
                  ? 'bg-[#FFEA00] text-[#141414] border-[#141414]'
                  : worldMode === 'world2'
                    ? 'bg-[#a855f7] text-white border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-amber-400 text-[#141414] border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              }`}>
                {worldMode === 'world1' ? 'Mundo 1' : worldMode === 'world2' ? 'Mundo 2' : 'Mundo 3'}
              </span>
            </div>

            {/* Student Badge in Simulation Screen Header */}
            {userProfile && (
              <div className="flex items-center gap-1.5 mt-1 text-xs font-mono font-bold">
                <span className="bg-pink-500 text-white px-2.5 py-0.5 rounded-lg border-2 border-black font-black flex items-center gap-1 shadow-[2px_2px_0px_#000]">
                  <User className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Estudiante: {userProfile.name}</span>
                </span>
                <span className="text-amber-300 font-extrabold">({userProfile.age} • {userProfile.grade})</span>
              </div>
            )}
            <p className={`text-xs font-mono font-semibold ${worldMode === 'world1' ? 'text-gray-700' : worldMode === 'world2' ? 'text-purple-300' : 'text-amber-300'}`}>
              {worldMode === 'world1'
                ? '🌍 Mundo 1: Relatividad de Galileo y Einstein (Relatividad Especial 2D)'
                : worldMode === 'world2'
                  ? '🧱 Mundo 2: Pista Horizontal — Comparativa de MUA (a = cte) vs MRU (v = cte)'
                  : '🪨 Mundo 3: Caída Libre con Resistencia de Aire — Análisis MUA y Velocidad Terminal MRU'}
            </p>
          </div>
        </div>

        {/* Action Controls & World Switcher Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* World Selector Header Tabs */}
          <div className={`flex items-center p-1 gap-1 border-2 ${
            worldMode === 'world1' ? 'bg-[#141414] border-[#141414] shadow-[2px_2px_0px_#141414]' : 'bg-[#030712] border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.3)]'
          }`}>
            <button
              onClick={() => { setWorldMode('world1'); setProjectileType('ball'); resetSimulation(); }}
              className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all flex items-center gap-1 ${
                worldMode === 'world1'
                  ? 'bg-[#FFEA00] text-[#141414]'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Mundo 1</span>
            </button>
            <button
              onClick={() => { setWorldMode('world2'); setProjectileType('ball'); resetSimulation(); }}
              className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all flex items-center gap-1 ${
                worldMode === 'world2'
                  ? 'bg-[#a855f7] text-white shadow-[0_0_10px_#a855f7]'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <Rocket className="w-3 h-3" />
              <span>Mundo 2</span>
            </button>
            <button
              onClick={() => { setWorldMode('world3'); setProjectileType('cube'); resetSimulation(); }}
              className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all flex items-center gap-1 ${
                worldMode === 'world3'
                  ? 'bg-amber-400 text-[#141414] font-black shadow-[0_0_10px_#fbbf24]'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Mundo 3</span>
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 font-bold text-xs uppercase border-2 transition-all flex items-center gap-1.5 ${
              worldMode === 'world1'
                ? 'bg-white hover:bg-gray-100 text-[#141414] border-[#141414] shadow-[2px_2px_0px_#141414]'
                : 'bg-[#a855f7] hover:bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={resetSimulation}
            className={`px-3 py-1.5 font-bold text-xs uppercase border-2 transition-all flex items-center gap-1.5 ${
              worldMode === 'world1'
                ? 'bg-white hover:bg-gray-100 text-[#141414] border-[#141414] shadow-[2px_2px_0px_#141414]'
                : 'bg-[#1e293b] hover:bg-slate-700 text-purple-200 border-[#a855f7]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>

          <button
            onClick={freezeCurrentTrail}
            className={`px-3 py-1.5 font-bold text-xs uppercase border-2 transition-all flex items-center gap-1.5 ${
              worldMode === 'world1'
                ? 'bg-[#FF4D00] text-white hover:bg-[#e04400] border-[#141414] shadow-[2px_2px_0px_#141414]'
                : 'bg-[#00E5FF] text-[#0f172a] hover:bg-cyan-300 border-cyan-400 font-black shadow-[0_0_10px_#00E5FF]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Congelar Rastro</span>
          </button>
        </div>
      </header>

      {/* Main Grid Viewport & Sidebar */}
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR: CONTROL PARAMETERS */}
          <section className={`lg:col-span-1 border-4 divide-y-4 flex flex-col justify-between transition-all ${
            worldMode === 'world1'
              ? 'bg-[#CECDBA] border-[#141414] shadow-[6px_6px_0px_#141414] divide-[#141414] text-[#141414]'
              : worldMode === 'world2'
                ? 'bg-[#0b0e1b] border-[#a855f7] shadow-[0_0_25px_rgba(168,85,247,0.3)] divide-[#1e293b] text-purple-100'
                : worldMode === 'world3'
                  ? 'bg-[#0b0e1b] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] divide-[#1e293b] text-amber-100'
                  : 'bg-[#0b0e1b] border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)] divide-[#1e293b] text-emerald-100'
          }`}>
            
            {/* 0. World Selector (Mundo 1, Mundo 2, Mundo 3, Mundo 4) */}
            <div className={`p-4 space-y-3 ${worldMode === 'world1' ? 'bg-[#E4E3E0]' : 'bg-[#131728]'}`}>
              <label className={`text-[10px] font-black uppercase tracking-widest block flex items-center justify-between ${
                worldMode === 'world1' ? 'text-[#141414]' : worldMode === 'world2' ? 'text-purple-300' : worldMode === 'world3' ? 'text-amber-300' : 'text-emerald-300'
              }`}>
                <span>Entorno de Simulación</span>
                <span className={`font-mono font-bold text-[9px] px-1.5 py-0.5 ${
                  worldMode === 'world1'
                    ? 'bg-[#FF4D00] text-white'
                    : worldMode === 'world2'
                      ? 'bg-[#a855f7] text-white shadow-[0_0_8px_#a855f7]'
                      : worldMode === 'world3'
                        ? 'bg-amber-400 text-[#141414] font-black'
                        : 'bg-emerald-400 text-[#0b0e1b] font-black'
                }`}>
                  {worldMode === 'world1' ? 'Relatividad' : worldMode === 'world2' ? 'Pista MUA/MRU' : worldMode === 'world3' ? 'Caída Libre' : 'Tiro Parabólico'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setWorldMode('world1'); setProjectileType('ball'); resetSimulation(); }}
                  className={`py-1.5 px-1 border-2 text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                    worldMode === 'world1'
                      ? 'bg-[#FFEA00] text-[#141414] border-[#141414] shadow-[2px_2px_0px_#141414]'
                      : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-[#FF4D00]" />
                  <span className="text-[8.5px]">Mundo 1</span>
                  <span className="text-[7px] font-mono opacity-80">Relativ.</span>
                </button>

                <button
                  onClick={() => { setWorldMode('world2'); resetSimulation(); }}
                  className={`py-1.5 px-1 border-2 text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                    worldMode === 'world2'
                      ? 'bg-[#a855f7] text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:border-purple-400'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span className="text-[8.5px]">Mundo 2</span>
                  <span className="text-[7px] font-mono opacity-80">Pista H.</span>
                </button>

                <button
                  onClick={() => { setWorldMode('world3'); resetSimulation(); }}
                  className={`py-1.5 px-1 border-2 text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                    worldMode === 'world3'
                      ? 'bg-amber-400 text-[#141414] border-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.5)] font-black'
                      : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[8.5px]">Mundo 3</span>
                  <span className="text-[7px] font-mono opacity-80">Caída Lib.</span>
                </button>

                <button
                  onClick={() => { setWorldMode('world4'); resetSimulation(); }}
                  className={`py-1.5 px-1 border-2 text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                    worldMode === 'world4'
                      ? 'bg-emerald-400 text-[#0b0e1b] border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)] font-black'
                      : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[8.5px]">Mundo 4</span>
                  <span className="text-[7px] font-mono opacity-80">Tiro Parab.</span>
                </button>
              </div>
            </div>

            {/* WORLD 1 CONTROLS */}
            {worldMode === 'world1' && (
              <>
                {/* 1. Velocity Control Slider */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#141414] flex items-center">
                      <Compass className="w-4 h-4 mr-1.5 text-[#FF4D00]" />
                      Velocidad Bus (v/c)
                    </label>
                    <span className="text-sm font-mono font-bold px-2 py-0.5 border bg-[#141414] text-white border-[#141414]">
                      {v.toFixed(3)} c
                    </span>
                  </div>

                  <input
                    id="slider-velocity"
                    type="range"
                    min="0"
                    max="0.999"
                    step="0.001"
                    value={v}
                    onChange={(e) => handleVelocityChange(e.target.value)}
                    className="w-full h-3 border-2 appearance-none cursor-pointer bg-white border-[#141414] accent-[#FF4D00]"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {[0.0, 0.5, 0.8, 0.95, 0.999].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setV(preset);
                          resetSimulation();
                        }}
                        className={`py-1 text-[11px] font-mono border-2 transition-all ${
                          v === preset
                            ? 'bg-[#141414] text-white border-[#141414]'
                            : 'bg-[#E4E3E0] text-[#141414] border-[#141414] hover:bg-[#D4D3D0]'
                        }`}
                      >
                        {preset === 0.0 ? '0.0' : `${preset.toFixed(2)}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Display View Mode Selector */}
                <div className="p-5 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414] block">
                    Modo de Visualización
                  </label>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setViewMode('split')}
                      className={`w-full py-2 px-3 border-2 text-left text-xs font-bold uppercase transition-all flex items-center justify-between ${
                        viewMode === 'split'
                          ? 'bg-[#141414] text-white border-[#141414] shadow-[3px_3px_0px_#141414]'
                          : 'bg-[#CECDBA] text-[#141414] border-[#141414] hover:bg-[#bfbea9]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-[#00E5FF]" />
                        Vista Doble (Marco S' + Marco S)
                      </span>
                    </button>

                    <button
                      onClick={() => setViewMode('bus')}
                      className={`w-full py-2 px-3 border-2 text-left text-xs font-bold uppercase transition-all flex items-center justify-between ${
                        viewMode === 'bus'
                          ? 'bg-[#141414] text-white border-[#141414] shadow-[3px_3px_0px_#141414]'
                          : 'bg-[#CECDBA] text-[#141414] border-[#141414] hover:bg-[#bfbea9]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#FFEA00]" />
                        Solo Cabina (Marco S')
                      </span>
                    </button>

                    <button
                      onClick={() => setViewMode('ground')}
                      className={`w-full py-2 px-3 border-2 text-left text-xs font-bold uppercase transition-all flex items-center justify-between ${
                        viewMode === 'ground'
                          ? 'bg-[#141414] text-white border-[#141414] shadow-[3px_3px_0px_#141414]'
                          : 'bg-[#CECDBA] text-[#141414] border-[#141414] hover:bg-[#bfbea9]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#FF4D00]" />
                        Solo Estación Exterior (Marco S)
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. Dinámica del Experimento */}
                <div className="p-5 space-y-3 bg-[#CECDBA]/50 border-t-2 border-[#141414]">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#141414]">
                    <Sparkles className="w-4 h-4 text-[#FF4D00] animate-bounce" />
                    Simulación Vertical en Movimiento
                  </div>
                  <p className="text-[11px] font-mono text-[#141414] leading-relaxed">
                    La pelota rebotante se lanza verticalmente en el Marco S' (Interior del Bus). El Observador A ve un movimiento <strong>1D vertical puro</strong>, mientras el Observador B desde la estación ve una trayectoria <strong>parabólica 2D</strong> debido a la velocidad $v$ del vehículo.
                  </p>
                  <div className="p-2.5 bg-[#141414] text-white rounded text-[10px] font-mono space-y-1.5 shadow-inner">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                      <span className="text-[#00E5FF] font-bold">Obs A (Marco S'):</span>
                      <span className="bg-[#00E5FF]/20 text-[#00E5FF] px-1.5 py-0.5 rounded">Tiro 1D (v_x'=0)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#FF4D00] font-bold">Obs B (Marco S):</span>
                      <span className="bg-[#FF4D00]/20 text-[#FF4D00] px-1.5 py-0.5 rounded">Parábola 2D</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* WORLD 2 CONTROLS (SIMULADOR DE MUA Y MRU EN PISTA HORIZONTAL) */}
            {worldMode === 'world2' && (
              <div className="p-5 space-y-4 bg-[#131728]">
                <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                  <span className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-purple-400" />
                    Mundo 2: MUA y MRU
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500 text-white font-bold rounded">
                    Mundo 2
                  </span>
                </div>

                {/* Sub-Mode Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-amber-300 block">
                    Modo de Análisis en Mundo 2:
                  </span>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                    <button
                      onClick={() => setWorld2SubMode('both')}
                      className={`py-2 px-1 font-black rounded border-2 transition-all flex flex-col items-center justify-center text-center ${
                        world2SubMode === 'both'
                          ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_8px_#a855f7]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span>🏁 Ambos</span>
                      <span className="text-[8px] text-purple-200">Carrera</span>
                    </button>
                    <button
                      onClick={() => setWorld2SubMode('mru')}
                      className={`py-2 px-1 font-black rounded border-2 transition-all flex flex-col items-center justify-center text-center ${
                        world2SubMode === 'mru'
                          ? 'bg-cyan-500 text-[#0b0e1b] border-cyan-300 shadow-[0_0_8px_#38bdf8]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span>⚡ MRU Solo</span>
                      <span className="text-[8px] text-cyan-950 font-extrabold">Vel. Cte</span>
                    </button>
                    <button
                      onClick={() => setWorld2SubMode('mua')}
                      className={`py-2 px-1 font-black rounded border-2 transition-all flex flex-col items-center justify-center text-center ${
                        world2SubMode === 'mua'
                          ? 'bg-pink-600 text-white border-pink-300 shadow-[0_0_8px_#ec4899]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span>🚀 MUA Solo</span>
                      <span className="text-[8px] text-pink-200">Acelerado</span>
                    </button>
                  </div>
                </div>

                {/* MUA Controls (Visible if 'both' or 'mua') */}
                {(world2SubMode === 'both' || world2SubMode === 'mua') && (
                  <div className="space-y-3 pt-2 border-t border-purple-500/30">
                    <span className="text-xs font-mono font-black text-purple-300 block uppercase">
                      Parámetros MUA (Acelerado):
                    </span>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-purple-300 font-bold">1. Aceleración (a):</span>
                        <span className="bg-purple-600 text-white font-bold px-2 py-0.5 rounded">
                          {muaAcc.toFixed(1)} m/s²
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="8.0"
                        step="0.1"
                        value={muaAcc}
                        onChange={(e) => {
                          setMuaAcc(parseFloat(e.target.value));
                          resetSimulation();
                        }}
                        className="w-full accent-purple-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-purple-300 font-bold">2. Vel. Inicial (v₀):</span>
                        <span className="bg-purple-900 text-purple-200 font-bold px-2 py-0.5 rounded">
                          {muaV0.toFixed(1)} m/s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="15.0"
                        step="0.5"
                        value={muaV0}
                        onChange={(e) => {
                          setMuaV0(parseFloat(e.target.value));
                          resetSimulation();
                        }}
                        className="w-full accent-purple-400"
                      />
                    </div>
                  </div>
                )}

                {/* MRU Controls (Visible if 'both' or 'mru') */}
                {(world2SubMode === 'both' || world2SubMode === 'mru') && (
                  <div className="space-y-3 pt-2 border-t border-cyan-500/30">
                    <span className="text-xs font-mono font-black text-cyan-300 block uppercase">
                      Parámetros MRU (Vel. Constante):
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-cyan-300 font-bold">Velocidad Constante (v):</span>
                        <span className="bg-cyan-500 text-[#0b0e1b] font-black px-2 py-0.5 rounded">
                          {mruV.toFixed(1)} m/s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="25.0"
                        step="0.5"
                        value={mruV}
                        onChange={(e) => {
                          setMruV(parseFloat(e.target.value));
                          resetSimulation();
                        }}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>
                )}

                {/* Track Length */}
                <div className="space-y-1.5 pt-2 border-t border-slate-700">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-amber-300 font-bold">Longitud Pista (L):</span>
                    <span className="bg-amber-400 text-[#0b0e1b] font-black px-2 py-0.5 rounded">
                      {world2TrackLength} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={world2TrackLength}
                    onChange={(e) => {
                      setWorld2TrackLength(parseInt(e.target.value));
                      resetSimulation();
                    }}
                    className="w-full accent-amber-400"
                  />
                </div>

                {/* Preset Scenarios */}
                <div className="pt-2 border-t border-purple-500/30 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                    Escenarios Didácticos
                  </span>
                  <div className="space-y-1.5 text-[10px] font-mono">
                    <button
                      onClick={() => {
                        setWorld2SubMode('both');
                        setMuaAcc(3.0);
                        setMuaV0(0.0);
                        setMruV(12.0);
                        setWorld2TrackLength(100);
                        resetSimulation();
                      }}
                      className="w-full py-1.5 px-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/50 rounded text-left transition-all"
                    >
                      🚀 1. Carrera Comparativa (MUA vs MRU)
                    </button>

                    <button
                      onClick={() => {
                        setWorld2SubMode('mru');
                        setMruV(15.0);
                        setWorld2TrackLength(120);
                        resetSimulation();
                      }}
                      className="w-full py-1.5 px-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/50 rounded text-left transition-all"
                    >
                      ⚡ 2. Módulo Aislado MRU (v = 15 m/s, a = 0)
                    </button>

                    <button
                      onClick={() => {
                        setWorld2SubMode('mua');
                        setMuaAcc(3.5);
                        setMuaV0(2.0);
                        setWorld2TrackLength(120);
                        resetSimulation();
                      }}
                      className="w-full py-1.5 px-2 bg-pink-950 hover:bg-pink-900 text-pink-200 border border-pink-500/50 rounded text-left transition-all"
                    >
                      🔥 3. Módulo Aislado MUA (a = 3.5 m/s², v₀ = 2 m/s)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WORLD 3 CONTROLS (CAÍDA LIBRE ROCA VS MONEDA) */}
            {worldMode === 'world3' && (
              <div className="p-5 space-y-4 bg-[#131728]">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Caída Libre Didáctica (Gumball vs Darwin)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400 text-[#0b0e1b] font-black rounded">
                    Mundo 3
                  </span>
                </div>

                {/* Character Selection in Sidebar */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-amber-300 block">
                    Personajes de la Caída:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <button
                      onClick={() => {
                        setW3CharacterType('gumball_darwin');
                        resetSimulation();
                      }}
                      className={`py-1.5 px-2 border font-bold rounded flex items-center justify-center gap-1 transition-all ${
                        w3CharacterType === 'gumball_darwin'
                          ? 'bg-[#00E5FF] text-[#0b0e1b] border-cyan-300 font-black shadow-[0_0_10px_#00E5FF]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>🐱 Gumball & 🐟 Darwin</span>
                    </button>
                    <button
                      onClick={() => {
                        setW3CharacterType('classic');
                        resetSimulation();
                      }}
                      className={`py-1.5 px-2 border font-bold rounded flex items-center justify-center gap-1 transition-all ${
                        w3CharacterType === 'classic'
                          ? 'bg-amber-400 text-[#0b0e1b] border-amber-300 font-black shadow-[0_0_10px_#fbbf24]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>🪨 Roca vs 🪙 Moneda</span>
                    </button>
                  </div>
                </div>

                {/* Drop Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-amber-300 font-bold">1. Altura Caída (H):</span>
                    <span className="bg-amber-400 text-[#0b0e1b] font-black px-2 py-0.5 rounded">
                      {ffHeight} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={ffHeight}
                    onChange={(e) => {
                      setFfHeight(parseInt(e.target.value));
                      resetSimulation();
                    }}
                    className="w-full accent-amber-400"
                  />
                </div>

                {/* Atmosphere / Air Toggle */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 block">
                    2. Medio Atmosférico:
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <button
                      onClick={() => {
                        setFfVacuum(false);
                        resetSimulation();
                      }}
                      className={`py-2 px-2 border-2 font-bold rounded flex items-center justify-center gap-1 transition-all ${
                        !ffVacuum
                          ? 'bg-cyan-400 text-[#0b0e1b] border-cyan-300 font-black shadow-[0_0_10px_#00E5FF]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      <Wind className="w-3.5 h-3.5" />
                      <span>Con Aire (1 atm)</span>
                    </button>

                    <button
                      onClick={() => {
                        setFfVacuum(true);
                        resetSimulation();
                      }}
                      className={`py-2 px-2 border-2 font-bold rounded flex items-center justify-center gap-1 transition-all ${
                        ffVacuum
                          ? 'bg-amber-400 text-[#0b0e1b] border-amber-300 font-black shadow-[0_0_10px_#fbbf24]'
                          : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>En Vacío (0 Pa)</span>
                    </button>
                  </div>
                </div>

                {/* Gravity Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-purple-300 font-bold">3. Gravedad (g):</span>
                    <span className="bg-purple-600 text-white font-bold px-2 py-0.5 rounded">
                      {ffGravity.toFixed(2)} m/s²
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                    <button
                      onClick={() => {
                        setFfGravity(9.81);
                        resetSimulation();
                      }}
                      className={`py-1.5 px-1 border font-bold rounded text-center ${
                        ffGravity === 9.81 ? 'bg-purple-600 text-white border-purple-300' : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      Tierra (9.81)
                    </button>

                    <button
                      onClick={() => {
                        setFfGravity(1.62);
                        resetSimulation();
                      }}
                      className={`py-1.5 px-1 border font-bold rounded text-center ${
                        ffGravity === 1.62 ? 'bg-purple-600 text-white border-purple-300' : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      Luna (1.62)
                    </button>

                    <button
                      onClick={() => {
                        setFfGravity(24.79);
                        resetSimulation();
                      }}
                      className={`py-1.5 px-1 border font-bold rounded text-center ${
                        ffGravity === 24.79 ? 'bg-purple-600 text-white border-purple-300' : 'bg-[#1e293b] text-slate-300 border-slate-700'
                      }`}
                    >
                      Júpiter (24.79)
                    </button>
                  </div>
                </div>

                {/* Controls Section: Pause / Play & Reset */}
                <div className="space-y-2 pt-2 border-t border-amber-500/30">
                  <span className="text-xs font-mono font-bold text-amber-300 block">
                    4. Control de Simulación:
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`py-2 px-2 border-2 font-black rounded flex items-center justify-center gap-1.5 transition-all ${
                        isPlaying
                          ? 'bg-amber-400 text-[#0b0e1b] border-amber-300 shadow-[0_0_10px_#fbbf24]'
                          : 'bg-[#00E5FF] text-[#0b0e1b] border-cyan-300 shadow-[0_0_10px_#00E5FF]'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlaying ? 'Pausar' : 'Iniciar'}</span>
                    </button>

                    <button
                      onClick={resetSimulation}
                      className="py-2 px-2 bg-[#1e293b] hover:bg-slate-700 text-amber-200 border-2 border-amber-400 font-bold rounded flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar</span>
                    </button>
                  </div>
                </div>

                {/* Calculation of Time Box */}
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded space-y-1.5 font-mono text-[10px] text-amber-200">
                  <div className="flex items-center justify-between font-bold text-amber-300 border-b border-amber-500/30 pb-1">
                    <span>⏱️ TIEMPO CALCULADO DE CAÍDA</span>
                    <span className="text-[9px] bg-amber-400 text-[#0b0e1b] px-1.5 rounded font-black">
                      H = {ffHeight}m
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p className="flex justify-between">
                      <span>• 🪨 Roca (5 kg):</span>
                      <strong className="text-amber-300">{w3Rock.impactTime.toFixed(2)} s</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>• 🪙 Moneda (5 g):</span>
                      <strong className="text-cyan-300">{w3Coin.impactTime.toFixed(2)} s</strong>
                    </p>
                    {ffVacuum ? (
                      <p className="text-[9px] text-amber-400 font-bold pt-1 border-t border-amber-500/20">
                        ⚡ En Vacío: t = √(2H/g) = √({(2 * ffHeight).toFixed(0)}/{ffGravity}) = {w3Rock.impactTime.toFixed(2)}s
                      </p>
                    ) : (
                      <p className="text-[9px] text-cyan-300 font-bold pt-1 border-t border-amber-500/20">
                        💨 En Aire: Diferencia de tiempo = +{(w3Coin.impactTime - w3Rock.impactTime).toFixed(2)}s por resistencia aerodinámica
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WORLD 4 CONTROLS (TIRO PARABÓLICO 2D BALÍSTICO) */}
            {worldMode === 'world4' && (
              <div className="p-5 space-y-4 bg-[#0a1912]">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                  <span className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Mundo 4: Tiro Parabólico
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-400 text-[#0b0e1b] font-black rounded">
                    Mundo 4
                  </span>
                </div>

                <div className="p-3 bg-[#06120d] border border-emerald-500/40 rounded space-y-2 text-xs font-mono text-emerald-200">
                  <p className="text-[11px] leading-relaxed">
                    Dispara proyectiles balísticos con ángulo θ y velocidad v₀ para calcular la altura máxima, tiempo de vuelo y acertar en la diana.
                  </p>
                  <div className="p-2 bg-[#020705] rounded text-[10px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-cyan-300 font-bold">Horizontal (X):</span>
                      <span>MRU (v_x = cte)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-300 font-bold">Vertical (Y):</span>
                      <span>MUA (a_y = -g)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Display Visual Toggles */}
            <div className={`p-5 space-y-2 ${worldMode === 'world1' ? '' : 'bg-[#131728]'}`}>
              <label className={`text-[10px] font-black uppercase tracking-widest block ${
                worldMode === 'world1' ? 'text-[#141414]' : 'text-purple-300'
              }`}>
                Opciones Visuales
              </label>
              <div className="space-y-1.5 text-xs font-mono">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="accent-[#FF4D00]"
                  />
                  <span>Malla de Referencia</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="accent-[#FF4D00]"
                  />
                  <span>Vectores Velocidad/Fuerzas</span>
                </label>
              </div>
            </div>

            {/* Simulation Speed */}
            <div className={`p-5 space-y-2 ${worldMode === 'world1' ? 'bg-[#E4E3E0]' : 'bg-[#0f172a]'}`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold">Velocidad Simulación:</span>
                <span>{simSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#141414]"
              />
            </div>
          </section>

          {/* RIGHT VIEWPORT AREA: DEDICATED SIMULATORS FOR WORLD 1, WORLD 2, AND WORLD 3 */}
          <section className="lg:col-span-3 space-y-6">

            {/* ========================================================================= */}
            {/* WORLD 2: SIMULADOR INTERACTIVO DE MUA Y MRU EN PISTA HORIZONTAL           */}
            {/* ========================================================================= */}
            {worldMode === 'world2' && (
              <div className="space-y-6">
                {/* Header Control Panel */}
                <div className="bg-[#0b0e1b] border-4 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)] p-5 space-y-4 text-purple-100 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-purple-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-purple-600 text-white rounded-md border border-purple-400 shadow-[0_0_12px_#a855f7]">
                        <Trophy className="w-5 h-5 animate-pulse text-amber-300" />
                      </span>
                      <div>
                        <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
                          <span>Mundo 2: Pista de Carreras Didáctica & Cronometraje Oficial</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500 text-white font-bold rounded shadow-[0_0_8px_#a855f7]">
                            {cubePhysics.firstFinished ? '🏁 META CRUZADA' : '⏱️ EN PISTA'}
                          </span>
                        </h3>
                        <p className="text-[11px] font-mono text-purple-200">
                          Registro de verdadera llegada con foto-finish animada, cinta de meta, cronómetro de milésimas y verificación cinemática.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 border-2 font-black text-xs uppercase shadow-[0_0_12px_rgba(168,85,247,0.4)] flex items-center gap-2 transition-all ${
                          isPlaying ? 'bg-purple-600 text-white border-purple-400 hover:bg-purple-500' : 'bg-[#00E5FF] text-[#0b0e1b] border-cyan-300 hover:bg-cyan-300'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlaying ? 'Pausar Simulación' : 'Iniciar Simulación'}</span>
                      </button>

                      <button
                        onClick={resetSimulation}
                        className="px-4 py-2 bg-[#1e293b] hover:bg-slate-700 text-purple-200 font-bold text-xs uppercase border-2 border-purple-400 flex items-center gap-2 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reiniciar Carrera</span>
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Cards Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="bg-[#131728] p-3 border-2 border-purple-500/50 rounded flex flex-col justify-between">
                      <span className="text-[10px] uppercase text-purple-300 font-bold flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-purple-400" /> Cronómetro En Vivo:
                      </span>
                      <span className="text-xl font-black text-purple-300">{w2State.t.toFixed(3)} s</span>
                      <span className="text-[9px] text-slate-400">
                        {cubePhysics.allFinished ? '🏁 Ambos terminaron' : cubePhysics.firstFinished ? '⚡ 1° en meta' : '🏃 En carrera'}
                      </span>
                    </div>

                    {(world2SubMode === 'both' || world2SubMode === 'mua') && (
                      <div className="bg-[#131728] p-3 border-2 border-purple-500/50 rounded flex flex-col justify-between">
                        <span className="text-[10px] uppercase text-purple-300 font-bold flex items-center justify-between">
                          <span>MUA (Acelerado):</span>
                          {w2State.reached_mua && <span className="text-amber-400 font-black">¡LLEGÓ!</span>}
                        </span>
                        <span className="text-base font-bold text-purple-200">
                          x = {w2State.x_mua.toFixed(1)}m | v = {w2State.v_mua.toFixed(1)}m/s
                        </span>
                        <span className="text-[9px] text-purple-400">
                          Meta calculada: {cubePhysics.mua.timeToFinish.toFixed(3)} s
                        </span>
                      </div>
                    )}

                    {(world2SubMode === 'both' || world2SubMode === 'mru') && (
                      <div className="bg-[#131728] p-3 border-2 border-cyan-500/50 rounded flex flex-col justify-between">
                        <span className="text-[10px] uppercase text-cyan-300 font-bold flex items-center justify-between">
                          <span>MRU (Vel. Cte):</span>
                          {w2State.reached_mru && <span className="text-cyan-300 font-black">¡LLEGÓ!</span>}
                        </span>
                        <span className="text-base font-bold text-cyan-200">
                          x = {w2State.x_mru.toFixed(1)}m | v = {mruV.toFixed(1)}m/s
                        </span>
                        <span className="text-[9px] text-cyan-400">
                          Meta calculada: {cubePhysics.mru.timeToFinish.toFixed(3)} s
                        </span>
                      </div>
                    )}

                    {world2SubMode === 'both' ? (
                      <div className="bg-[#131728] p-3 border-2 border-amber-500/50 rounded flex flex-col justify-between">
                        <span className="text-[10px] uppercase text-amber-300 font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-400" /> Resultado Oficial:
                        </span>
                        <span className="text-xs font-black text-amber-300">
                          {cubePhysics.firstFinished ? (
                            cubePhysics.winner === 'MUA' ? '🥇 MUA Ganador (⚡)' :
                            cubePhysics.winner === 'MRU' ? '🥇 MRU Ganador (😎)' :
                            '🤝 Empate Técnico'
                          ) : (
                            w2IntersectT > 0 && w2IntersectT <= Math.max(cubePhysics.mua.timeToFinish, cubePhysics.mru.timeToFinish) ?
                            `Alcance: t = ${w2IntersectT.toFixed(2)}s` :
                            'Sin cruce en pista'
                          )}
                        </span>
                        <span className="text-[9px] text-amber-200/80">
                          {cubePhysics.firstFinished ? `Diferencia: Δt = ${cubePhysics.timeDiff.toFixed(3)} s` : `Pista L = ${world2TrackLength} m`}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-[#131728] p-3 border-2 border-emerald-500/50 rounded flex flex-col justify-between">
                        <span className="text-[10px] uppercase text-emerald-300 font-bold">Estado del Modo:</span>
                        <span className="text-xs font-bold text-emerald-200 uppercase">
                          {world2SubMode === 'mua' ? '🚀 MUA Aislado (a ≠ 0)' : '⚡ MRU Aislado (v = cte)'}
                        </span>
                        <span className="text-[9px] text-emerald-300">
                          {w2State.reached_mua || w2State.reached_mru ? '🏁 Prueba completada' : '⏱️ En recorrido'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Horizontal Track Canvas */}
                <div className="border-4 bg-[#030712] border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden relative rounded-lg">
                  <div className="px-4 py-2 bg-[#0b0e1b] text-purple-300 border-b-2 border-purple-500 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                      {world2SubMode === 'both' && `Pista de Carrera Oficial MUA vs MRU (L = ${world2TrackLength} m)`}
                      {world2SubMode === 'mua' && `Pista de Análisis MUA - Movimiento Acelerado (L = ${world2TrackLength} m)`}
                      {world2SubMode === 'mru' && `Pista de Análisis MRU - Velocidad Constante (L = ${world2TrackLength} m)`}
                    </span>
                    <span className="text-[11px] text-slate-300 flex items-center gap-2">
                      {cubePhysics.firstFinished && (
                        <span className="px-2 py-0.5 bg-amber-400 text-[#0b0e1b] font-black rounded text-[10px] animate-bounce">
                          📸 FOTO FINISH REGISTRADA
                        </span>
                      )}
                      {world2SubMode === 'both' && <>Superior: <strong className="text-purple-400">MUA (a = {muaAcc}m/s²)</strong> | Inferior: <strong className="text-cyan-400">MRU (a = 0)</strong></>}
                    </span>
                  </div>

                  <div className="relative w-full h-[320px] overflow-hidden flex items-center justify-center bg-[#02040a]">
                    {/* Elmore Bus Stop Street Background */}
                    <img
                      src={bgBusStop}
                      alt="Parada de Autobús de Elmore (El Increíble Mundo de Gumball)"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#02040a]/40 via-transparent to-[#02040a]/70 pointer-events-none" />

                    <svg viewBox={`0 0 ${W_VIEW} ${H_VIEW}`} className="w-full h-full select-none relative z-10">
                      <defs>
                        <linearGradient id="cubeMuaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#7e22ce" />
                        </linearGradient>
                        <linearGradient id="cubeMruGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <pattern id="checkeredPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                          <rect width="8" height="8" fill="#FFFFFF" />
                          <rect x="8" width="8" height="8" fill="#141414" />
                          <rect y="8" width="8" height="8" fill="#141414" />
                          <rect x="8" y="8" width="8" height="8" fill="#FFFFFF" />
                        </pattern>
                        <pattern id="ribbonCheckers" width="20" height="12" patternUnits="userSpaceOnUse">
                          <rect width="10" height="12" fill="#fbbf24" />
                          <rect x="10" width="10" height="12" fill="#141414" />
                        </pattern>
                        <filter id="neonGlowW2" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Grid */}
                      {showGrid && (
                        <g opacity="0.15">
                          {Array.from({ length: 19 }).map((_, i) => (
                            <line key={`w2g-v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2={H_VIEW} stroke="#a855f7" strokeDasharray="4 4" />
                          ))}
                          {Array.from({ length: 7 }).map((_, i) => (
                            <line key={`w2g-h-${i}`} x1="0" y1={i * 50} x2={W_VIEW} y2={i * 50} stroke="#38bdf8" strokeDasharray="4 4" />
                          ))}
                        </g>
                      )}

                      {/* Distance Markers along track */}
                      {Array.from({ length: 11 }).map((_, i) => {
                        const distM = (world2TrackLength / 10) * i;
                        const xPx = 60 + (i / 10) * (W_VIEW - 120);
                        return (
                          <g key={`w2m-${i}`} transform={`translate(${xPx}, 0)`}>
                            <line x1="0" y1="30" x2="0" y2={H_VIEW - 20} stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
                            <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                              {distM.toFixed(0)}m
                            </text>
                          </g>
                        );
                      })}

                      {/* Finish Line Sensor Pole / Laser Gate */}
                      <g transform={`translate(${W_VIEW - 60}, 0)`}>
                        {/* Checkered Finish Post */}
                        <rect x="-8" y="25" width="16" height="260" fill="url(#checkeredPattern)" stroke="#fbbf24" strokeWidth="2" opacity="0.85" />
                        
                        {/* Laser Timing Sensor Line */}
                        <line
                          x1="0"
                          y1="30"
                          x2="0"
                          y2="280"
                          stroke={cubePhysics.firstFinished ? '#00E676' : '#FF0055'}
                          strokeWidth={cubePhysics.firstFinished ? '4' : '2.5'}
                          strokeDasharray={cubePhysics.firstFinished ? 'none' : '4 2'}
                          opacity={cubePhysics.firstFinished ? 1.0 : 0.8}
                          className={cubePhysics.firstFinished ? 'animate-pulse' : ''}
                        />

                        {/* Top Timing Sensor Box & Flag */}
                        <rect x="-24" y="8" width="48" height="22" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
                        <text x="0" y="22" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="black" fontFamily="monospace">
                          META ({world2TrackLength}m)
                        </text>

                        {/* Camera Shutter Indicator Light */}
                        <circle cx="16" cy="19" r="3" fill={cubePhysics.firstFinished ? '#22c55e' : '#ef4444'} className="animate-pulse" />

                        {/* Waving Finish Flag on top */}
                        <g transform="translate(18, -4)">
                          <line x1="0" y1="0" x2="0" y2="18" stroke="#FFFFFF" strokeWidth="2" />
                          <path
                            d={`M 0,0 Q 8,${Math.sin(tGround * 8) * 3} 16,0 L 16,10 Q 8,${10 + Math.sin(tGround * 8) * 3} 0,10 Z`}
                            fill="url(#checkeredPattern)"
                            stroke="#141414"
                            strokeWidth="1"
                          />
                        </g>
                      </g>

                      {/* LANE 1: MUA (Acelerado - Cubo Púrpura) */}
                      {(world2SubMode === 'both' || world2SubMode === 'mua') && (
                        <g id="lane-mua">
                          {/* Track Lane Line */}
                          <line x1="40" y1={world2SubMode === 'mua' ? "170" : "120"} x2={W_VIEW - 40} y2={world2SubMode === 'mua' ? "170" : "120"} stroke="#a855f7" strokeWidth="3" opacity="0.8" />
                          <text x="50" y={world2SubMode === 'mua' ? "120" : "70"} fill="#a855f7" fontSize="11" fontWeight="black" fontFamily="monospace">
                            CARRIL MUA (a = {muaAcc} m/s², v₀ = {muaV0} m/s) • Meta teórica: {cubePhysics.mua.timeToFinish.toFixed(3)}s
                          </text>

                          {/* Intersection Marker */}
                          {world2SubMode === 'both' && w2IntersectX > 0 && w2IntersectX <= world2TrackLength && (
                            <g transform={`translate(${60 + (w2IntersectX / world2TrackLength) * (W_VIEW - 120)}, 120)`}>
                              <circle cx="0" cy="0" r="12" fill="#fbbf24" opacity="0.3" className="animate-ping" />
                              <circle cx="0" cy="0" r="6" fill="#fbbf24" />
                              <line x1="0" y1="-30" x2="0" y2="100" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
                              <text x="0" y="-36" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="black" fontFamily="monospace">
                                Alcance (x = {w2IntersectX.toFixed(1)}m)
                              </text>
                            </g>
                          )}

                          {/* MUA Cube / Cartoon Racer */}
                          {(() => {
                            const isFinished = w2State.reached_mua;
                            const xPx = 60 + Math.min(1.0, w2State.x_mua / world2TrackLength) * (W_VIEW - 120);
                            const baseY = world2SubMode === 'mua' ? 150 : 100;
                            // Celebratory hop when finished
                            const hopY = isFinished ? -Math.abs(Math.sin((tGround - cubePhysics.mua.timeToFinish) * 8)) * 12 : 0;
                            const yPos = baseY + hopY;
                            const isWinner = cubePhysics.winner === 'MUA' || world2SubMode === 'mua';

                            return (
                              <g transform={`translate(${xPx}, ${yPos})`}>
                                {/* Speed Flames Behind */}
                                {!isFinished && w2State.v_mua > 1 && (
                                  <path
                                    d={`M -18,-5 L ${-28 - Math.sin(w2State.t * 20) * 8},0 L -18,5 Z`}
                                    fill="#FF007F"
                                    stroke="#141414"
                                    strokeWidth="1.5"
                                  />
                                )}
                                <ellipse cx="0" cy={22 - hopY} rx="18" ry="5" fill="#000" opacity={0.5 - hopY * 0.02} />
                                <rect x="-18" y="-18" width="36" height="36" rx="8" fill="url(#cubeMuaGrad)" stroke="#141414" strokeWidth="3" />
                                
                                {/* Cartoon Eyes */}
                                <g fill="#FFFFFF" stroke="#141414" strokeWidth="1.5">
                                  <circle cx="-4" cy="-6" r="4.5" />
                                  <circle cx="6" cy="-6" r="4.5" />
                                  <circle cx="-2" cy="-6" r="2" fill="#141414" />
                                  <circle cx="8" cy="-6" r="2" fill="#141414" />
                                </g>

                                <text x="0" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="black" fontFamily="monospace">
                                  MUA ⚡
                                </text>

                                {/* CELEBRATION CROWN / MEDAL IF FINISHED */}
                                {isFinished && isWinner && (
                                  <g transform="translate(0, -26)">
                                    {/* Golden Crown */}
                                    <polygon points="-12,0 -16,-10 -6,-4 0,-14 6,-4 16,-10 12,0" fill="#FFD700" stroke="#141414" strokeWidth="1.5" />
                                    <circle cx="0" cy="-14" r="2" fill="#FF0055" />
                                    <circle cx="-16" cy="-10" r="1.5" fill="#00E5FF" />
                                    <circle cx="16" cy="-10" r="1.5" fill="#00E5FF" />
                                  </g>
                                )}

                                {/* ARRIVAL SPEECH BUBBLE */}
                                {isFinished && (
                                  <g transform="translate(0, -42)">
                                    <rect x="-56" y="-14" width="112" height="18" rx="4" fill="#a855f7" stroke="#FFFFFF" strokeWidth="1.5" />
                                    <text x="0" y="-2" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="black" fontFamily="monospace">
                                      {isWinner ? `🥇 1° | ${cubePhysics.mua.timeToFinish.toFixed(3)}s` : `🥈 2° | ${cubePhysics.mua.timeToFinish.toFixed(3)}s`}
                                    </text>
                                  </g>
                                )}

                                {/* Velocity Vector Arrow */}
                                {showVectors && !isFinished && w2State.v_mua > 0.1 && (
                                  <g>
                                    <line x1="0" y1="0" x2={Math.min(80, w2State.v_mua * 3)} y2="0" stroke="#facc15" strokeWidth="3.5" />
                                    <polygon
                                      points={`${Math.min(80, w2State.v_mua * 3)},0 ${Math.min(80, w2State.v_mua * 3) - 8},-5 ${Math.min(80, w2State.v_mua * 3) - 8},5`}
                                      fill="#facc15"
                                      stroke="#141414"
                                      strokeWidth="1"
                                    />
                                    <text x="0" y="-24" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="black" fontFamily="monospace">
                                      v = {w2State.v_mua.toFixed(1)} m/s
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })()}
                        </g>
                      )}

                      {/* LANE 2: MRU (Velocidad Constante - Cubo Cyan) */}
                      {(world2SubMode === 'both' || world2SubMode === 'mru') && (
                        <g id="lane-mru">
                          {/* Track Lane Line */}
                          <line x1="40" y1={world2SubMode === 'mru' ? "170" : "240"} x2={W_VIEW - 40} y2={world2SubMode === 'mru' ? "170" : "240"} stroke="#38bdf8" strokeWidth="3" opacity="0.8" />
                          <text x="50" y={world2SubMode === 'mru' ? "120" : "190"} fill="#38bdf8" fontSize="11" fontWeight="black" fontFamily="monospace">
                            CARRIL MRU (v = {mruV} m/s, a = 0) • Meta teórica: {cubePhysics.mru.timeToFinish.toFixed(3)}s
                          </text>

                          {/* MRU Cube / Cartoon Racer */}
                          {(() => {
                            const isFinished = w2State.reached_mru;
                            const xPx = 60 + Math.min(1.0, w2State.x_mru / world2TrackLength) * (W_VIEW - 120);
                            const baseY = world2SubMode === 'mru' ? 150 : 220;
                            // Celebratory hop when finished
                            const hopY = isFinished ? -Math.abs(Math.sin((tGround - cubePhysics.mru.timeToFinish) * 8)) * 12 : 0;
                            const yPos = baseY + hopY;
                            const isWinner = cubePhysics.winner === 'MRU' || world2SubMode === 'mru';

                            return (
                              <g transform={`translate(${xPx}, ${yPos})`}>
                                {/* Speed Lines Behind */}
                                {!isFinished && mruV > 1 && (
                                  <path
                                    d={`M -18,-5 L ${-25 - Math.cos(w2State.t * 20) * 6},0 L -18,5 Z`}
                                    fill="#00E5FF"
                                    stroke="#141414"
                                    strokeWidth="1.5"
                                  />
                                )}
                                <ellipse cx="0" cy={22 - hopY} rx="18" ry="5" fill="#000" opacity={0.5 - hopY * 0.02} />
                                <rect x="-18" y="-18" width="36" height="36" rx="8" fill="url(#cubeMruGrad)" stroke="#141414" strokeWidth="3" />
                                
                                {/* Cartoon Sunglasses */}
                                <rect x="-12" y="-10" width="10" height="7" fill="#141414" rx="2" />
                                <rect x="2" y="-10" width="10" height="7" fill="#141414" rx="2" />
                                <line x1="-2" y1="-7" x2="2" y2="-7" stroke="#141414" strokeWidth="2" />
                                
                                <text x="0" y="10" textAnchor="middle" fill="#0b0e1b" fontSize="9" fontWeight="black" fontFamily="monospace">
                                  MRU 😎
                                </text>

                                {/* CELEBRATION CROWN / MEDAL IF FINISHED */}
                                {isFinished && isWinner && (
                                  <g transform="translate(0, -26)">
                                    {/* Golden Crown */}
                                    <polygon points="-12,0 -16,-10 -6,-4 0,-14 6,-4 16,-10 12,0" fill="#FFD700" stroke="#141414" strokeWidth="1.5" />
                                    <circle cx="0" cy="-14" r="2" fill="#00E5FF" />
                                    <circle cx="-16" cy="-10" r="1.5" fill="#FFD700" />
                                    <circle cx="16" cy="-10" r="1.5" fill="#FFD700" />
                                  </g>
                                )}

                                {/* ARRIVAL SPEECH BUBBLE */}
                                {isFinished && (
                                  <g transform="translate(0, -42)">
                                    <rect x="-56" y="-14" width="112" height="18" rx="4" fill="#0284c7" stroke="#FFFFFF" strokeWidth="1.5" />
                                    <text x="0" y="-2" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="black" fontFamily="monospace">
                                      {isWinner ? `🥇 1° | ${cubePhysics.mru.timeToFinish.toFixed(3)}s` : `🥈 2° | ${cubePhysics.mru.timeToFinish.toFixed(3)}s`}
                                    </text>
                                  </g>
                                )}

                                {/* Velocity Vector Arrow */}
                                {showVectors && !isFinished && (
                                  <g>
                                    <line x1="0" y1="0" x2={Math.min(80, mruV * 3)} y2="0" stroke="#38bdf8" strokeWidth="3.5" />
                                    <polygon
                                      points={`${Math.min(80, mruV * 3)},0 ${Math.min(80, mruV * 3) - 8},-5 ${Math.min(80, mruV * 3) - 8},5`}
                                      fill="#38bdf8"
                                      stroke="#141414"
                                      strokeWidth="1"
                                    />
                                    <text x="0" y="-24" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="black" fontFamily="monospace">
                                      v = {mruV.toFixed(1)} m/s (cte)
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })()}
                        </g>
                      )}

                      {/* DYNAMIC FINISH RIBBON (CINTA DE META QUE SE CORTA/DESPRENDE) */}
                      {(() => {
                        const finishX = W_VIEW - 60;
                        const isCut = cubePhysics.firstFinished;
                        const tSinceCut = Math.max(0, tGround - Math.min(cubePhysics.mua.timeToFinish, cubePhysics.mru.timeToFinish));
                        
                        if (!isCut) {
                          // Intact waving ribbon across the track
                          const flutter = Math.sin(tGround * 6) * 4;
                          return (
                            <g id="finish-ribbon-intact" transform={`translate(${finishX}, 0)`}>
                              <path
                                d={`M -6,50 Q ${flutter},160 -6,270 L 6,270 Q ${flutter + 4},160 6,50 Z`}
                                fill="url(#ribbonCheckers)"
                                stroke="#fbbf24"
                                strokeWidth="1.5"
                                opacity="0.9"
                              />
                              <rect x="-8" y="145" width="16" height="30" fill="#fbbf24" stroke="#141414" strokeWidth="1" rx="2" />
                              <text x="0" y="164" textAnchor="middle" fill="#141414" fontSize="8" fontWeight="black" transform="rotate(-90 0 160)">
                                CINTA DE META
                              </text>
                            </g>
                          );
                        } else {
                          // Snapped / Broken ribbon fluttering apart
                          const rotTop = Math.sin(tGround * 12) * 20 - Math.min(45, tSinceCut * 30);
                          const rotBot = -Math.sin(tGround * 12) * 20 + Math.min(45, tSinceCut * 30);
                          return (
                            <g id="finish-ribbon-cut" transform={`translate(${finishX}, 160)`}>
                              {/* Top Snapped Ribbon piece */}
                              <g transform={`rotate(${rotTop}) translate(0, -55)`}>
                                <path d="M -5,0 L 5,0 L 8,-60 L -8,-60 Z" fill="url(#ribbonCheckers)" stroke="#fbbf24" strokeWidth="1" />
                                <polygon points="-5,0 0,6 5,0 0,-6" fill="#fbbf24" />
                              </g>
                              {/* Bottom Snapped Ribbon piece */}
                              <g transform={`rotate(${rotBot}) translate(0, 55)`}>
                                <path d="M -5,0 L 5,0 L 8,60 L -8,60 Z" fill="url(#ribbonCheckers)" stroke="#fbbf24" strokeWidth="1" />
                                <polygon points="-5,0 0,-6 5,0 0,6" fill="#fbbf24" />
                              </g>
                              {/* Explosion Sparks at cut point */}
                              {Array.from({ length: 8 }).map((_, idx) => {
                                const angle = (idx / 8) * Math.PI * 2;
                                const rad = Math.min(40, tSinceCut * 60 + 10);
                                return (
                                  <circle
                                    key={`ribbon-spark-${idx}`}
                                    cx={Math.cos(angle) * rad}
                                    cy={Math.sin(angle) * rad}
                                    r="2.5"
                                    fill="#fbbf24"
                                    opacity={Math.max(0, 1 - tSinceCut * 0.5)}
                                  />
                                );
                              })}
                            </g>
                          );
                        }
                      })()}

                      {/* ANIMATED CELEBRATION CONFETTI PARTICLES SHOWER */}
                      {cubePhysics.firstFinished && (
                        <g id="confetti-shower" opacity="0.95">
                          {Array.from({ length: 36 }).map((_, i) => {
                            const tSince = Math.max(0, tGround - Math.min(cubePhysics.mua.timeToFinish, cubePhysics.mru.timeToFinish));
                            const colors = ['#FF007F', '#00E5FF', '#FFD700', '#C084FC', '#00E676', '#FFFFFF', '#FB923C'];
                            const color = colors[i % colors.length];
                            
                            // Deterministic positions and falling velocities
                            const xBase = (W_VIEW - 140) + Math.sin(i * 1.3) * 160;
                            const xDrift = Math.sin(i + tSince * 4) * 25;
                            const posX = Math.max(40, Math.min(W_VIEW - 20, xBase + xDrift));
                            const posY = (40 + (i * 17 + tSince * (60 + (i % 5) * 20))) % (H_VIEW - 20);
                            const rot = (i * 35 + tSince * 240) % 360;
                            const size = 4 + (i % 4) * 2;

                            return (
                              <g key={`confetti-${i}`} transform={`translate(${posX}, ${posY}) rotate(${rot})`}>
                                {i % 3 === 0 ? (
                                  <rect x={-size / 2} y={-size / 4} width={size} height={size / 2} fill={color} />
                                ) : i % 3 === 1 ? (
                                  <circle cx="0" cy="0" r={size / 2.5} fill={color} />
                                ) : (
                                  <polygon points={`0,${-size} ${size / 2},0 0,${size} ${-size / 2},0`} fill={color} />
                                )}
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* PHOTO FINISH CAMERA FLASH FLASH-BULB EFFECT */}
                      {(() => {
                        const tSince = tGround - Math.min(cubePhysics.mua.timeToFinish, cubePhysics.mru.timeToFinish);
                        if (cubePhysics.firstFinished && tSince >= 0 && tSince < 0.4) {
                          const flashAlpha = 0.65 * (1 - tSince / 0.4);
                          return (
                            <g id="photo-finish-flash">
                              <rect x="0" y="0" width={W_VIEW} height={H_VIEW} fill="#FFFFFF" opacity={flashAlpha} />
                              <text
                                x={W_VIEW / 2}
                                y={H_VIEW / 2}
                                textAnchor="middle"
                                fill="#141414"
                                fontSize="18"
                                fontWeight="black"
                                fontFamily="monospace"
                                opacity={flashAlpha * 1.5}
                              >
                                📸 ¡FOTO FINISH OFICIAL REGISTRADA!
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })()}
                    </svg>

                    {/* Meta Banner Status Tag */}
                    {cubePhysics.firstFinished && (
                      <div className="absolute top-3 right-4 bg-gradient-to-r from-amber-400 to-yellow-300 text-[#0b0e1b] px-3.5 py-1.5 font-mono font-black text-xs uppercase shadow-[0_0_20px_#fbbf24] rounded-md flex items-center gap-2 border border-amber-200 animate-bounce">
                        <Trophy className="w-4 h-4 text-[#0b0e1b]" />
                        <span>
                          {world2SubMode === 'both' ? (
                            cubePhysics.winner === 'MUA' ? '🏆 ¡MUA Gana la Carrera!' :
                            cubePhysics.winner === 'MRU' ? '🏆 ¡MRU Gana la Carrera!' :
                            '🤝 ¡Empate Técnico!'
                          ) : (
                            world2SubMode === 'mua' ? '🏆 ¡MUA Llegó a la Meta!' : '🏆 ¡MRU Llegó a la Meta!'
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* HISTORIAL DE LLEGADAS REGISTRADAS (LOGBOOK OFICIAL DE CARRERAS)           */}
                {/* ========================================================================= */}
                <div className="bg-[#0b0e1b] border-2 border-purple-500/80 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <History className="w-4 h-4 text-purple-400" />
                      <h4 className="font-bold font-mono text-xs text-purple-300 uppercase">
                        Historial de Llegadas Registradas ({w2RaceHistory.length} carreras)
                      </h4>
                    </div>
                    {w2RaceHistory.length > 0 && (
                      <button
                        onClick={() => setW2RaceHistory([])}
                        className="text-[10px] font-mono text-pink-400 hover:text-pink-300 underline"
                      >
                        Limpiar Historial
                      </button>
                    )}
                  </div>

                  {w2RaceHistory.length === 0 ? (
                    <p className="text-[11px] font-mono text-slate-400 py-3 text-center">
                      🏁 Inicia la simulación para registrar automáticamente las llegadas oficiales con foto-finish.
                    </p>
                  ) : (
                    <div className="overflow-x-auto max-h-56 overflow-y-auto">
                      <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                        <thead>
                          <tr className="bg-[#131728] text-purple-300 border-b border-purple-800 text-[10px] uppercase">
                            <th className="p-2">Hora</th>
                            <th className="p-2">Modo</th>
                            <th className="p-2">Pista (L)</th>
                            <th className="p-2">Tiempo MUA</th>
                            <th className="p-2">Tiempo MRU</th>
                            <th className="p-2">Diferencia (Δt)</th>
                            <th className="p-2">Ganador</th>
                            <th className="p-2 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-950">
                          {w2RaceHistory.map((rec, idx) => (
                            <tr key={rec.id} className="hover:bg-purple-950/30 transition-colors">
                              <td className="p-2 text-slate-400">{rec.timestamp}</td>
                              <td className="p-2 uppercase font-bold text-[10px]">
                                {rec.mode === 'both' ? '🏁 Ambos' : rec.mode === 'mua' ? '🚀 MUA' : '⚡ MRU'}
                              </td>
                              <td className="p-2 text-amber-300 font-bold">{rec.trackLength} m</td>
                              <td className="p-2 text-purple-300 font-bold">{rec.muaTime.toFixed(3)} s</td>
                              <td className="p-2 text-cyan-300 font-bold">{rec.mruTime.toFixed(3)} s</td>
                              <td className="p-2 text-amber-200">{rec.timeDiff.toFixed(3)} s</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                  rec.winner === 'MUA' ? 'bg-purple-500/40 text-purple-200 border border-purple-400' :
                                  rec.winner === 'MRU' ? 'bg-cyan-500/40 text-cyan-200 border border-cyan-400' :
                                  rec.winner === 'TIE' ? 'bg-amber-400/40 text-amber-200 border border-amber-300' :
                                  'bg-slate-700 text-slate-200'
                                }`}>
                                  {rec.winner === 'MUA' ? '🥇 MUA' :
                                   rec.winner === 'MRU' ? '🥇 MRU' :
                                   rec.winner === 'TIE' ? '🤝 Empate' :
                                   rec.winner === 'SOLO_MUA' ? '🚀 MUA Solo' : '⚡ MRU Solo'}
                                </span>
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => {
                                    setWorld2SubMode(rec.mode);
                                    setWorld2TrackLength(rec.trackLength);
                                    setMuaAcc(rec.muaAcc);
                                    setMuaV0(rec.muaV0);
                                    setMruV(rec.mruSpeed);
                                    resetSimulation();
                                  }}
                                  className="px-2 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition-all"
                                >
                                  Cargar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Real-time Comparative Physics Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chart 1: Position x(t) */}
                  <div className="bg-[#0b0e1b] border-2 border-purple-500/80 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold font-mono text-xs text-purple-300 uppercase flex items-center justify-between">
                      <span>Gráfica Posición vs Tiempo x(t)</span>
                      <span className="text-[10px] text-slate-400">
                        {world2SubMode === 'both' ? 'Parábola (MUA) vs Recta (MRU)' : world2SubMode === 'mua' ? 'Curva Parabólica (MUA)' : 'Línea Recta Inclinada (MRU)'}
                      </span>
                    </h4>
                    <div className="h-44 w-full bg-[#030712] p-2 rounded border border-purple-900/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={w2ChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 'x (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', fontSize: '11px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          {(world2SubMode === 'both' || world2SubMode === 'mua') && (
                            <Line type="monotone" dataKey="x_mua" name="MUA: x = v₀t + ½at²" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                          )}
                          {(world2SubMode === 'both' || world2SubMode === 'mru') && (
                            <Line type="monotone" dataKey="x_mru" name="MRU: x = vt" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Velocity v(t) */}
                  <div className="bg-[#0b0e1b] border-2 border-purple-500/80 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold font-mono text-xs text-cyan-300 uppercase flex items-center justify-between">
                      <span>Gráfica Velocidad vs Tiempo v(t)</span>
                      <span className="text-[10px] text-slate-400">
                        {world2SubMode === 'both' ? 'Inclinada (MUA) vs Horizontal (MRU)' : world2SubMode === 'mua' ? 'Línea Recta Inclinada (MUA)' : 'Línea Horizontal Plana (MRU)'}
                      </span>
                    </h4>
                    <div className="h-44 w-full bg-[#030712] p-2 rounded border border-purple-900/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={w2ChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 'v (m/s)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          {(world2SubMode === 'both' || world2SubMode === 'mua') && (
                            <Line type="monotone" dataKey="v_mua" name="MUA: v = v₀ + at" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                          )}
                          {(world2SubMode === 'both' || world2SubMode === 'mru') && (
                            <Line type="monotone" dataKey="v_mru" name="MRU: v = constante" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ========================================================================= */}
            {/* WORLD 3: SIMULADOR DE CAÍDA LIBRE (ROCA DE 5 KG VS MONEDA DE 5 G)          */}
            {/* ========================================================================= */}
            {worldMode === 'world3' && (
              <div className="space-y-6">
                {/* Header Control Panel */}
                <div className="bg-[#0b0e1b] border-4 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)] p-5 space-y-4 text-amber-100 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-amber-400 text-[#141414] rounded-md border border-amber-300 shadow-[0_0_12px_#fbbf24]">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </span>
                      <div>
                        <h3 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
                          <span>Mundo 3: Caída Libre Didáctica (Roca de 5 kg vs Moneda de 5 g)</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400 text-[#0b0e1b] font-bold rounded shadow-[0_0_8px_#fbbf24]">
                            SYS: ACTIVE
                          </span>
                        </h3>
                        <p className="text-[11px] font-mono text-amber-200">
                          {ffVacuum
                            ? 'EN VACÍO: Ambas caen idénticamente en MUA puro (a = g) sin importar la masa.'
                            : 'EN AIRE: La resistencia del aire frena a la moneda ligera al alcanzar la velocidad límite terminal (MRU).'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 border-2 font-black text-xs uppercase shadow-[0_0_12px_rgba(251,191,36,0.4)] flex items-center gap-2 transition-all ${
                          isPlaying ? 'bg-amber-400 text-[#141414] border-amber-300 hover:bg-amber-500' : 'bg-[#00E5FF] text-[#0b0e1b] border-cyan-300 hover:bg-cyan-300'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        <span>{isPlaying ? 'Pausar Simulación' : 'Iniciar Simulación'}</span>
                      </button>

                      <button
                        onClick={resetSimulation}
                        className="px-4 py-2 bg-[#1e293b] hover:bg-slate-700 text-amber-200 font-bold text-xs uppercase border-2 border-amber-400 flex items-center gap-2 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reiniciar</span>
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Grid Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="bg-[#131728] p-3 border-2 border-amber-400/50 rounded flex flex-col justify-between">
                      <span className="text-[10px] uppercase text-amber-300 font-bold">⏱️ Tiempo Transcurrido:</span>
                      <span className="text-xl font-black text-amber-300">{w3Rock.t.toFixed(2)} s</span>
                      <span className="text-[9px] text-slate-400">Cronómetro en tiempo real</span>
                    </div>

                    <div className="bg-[#131728] p-3 border-2 border-amber-400/50 rounded flex flex-col justify-between">
                      <span className="text-[10px] uppercase text-amber-300 font-bold">🪨 Roca (5 kg) - {w3Rock.regime}:</span>
                      <span className="text-sm font-bold text-amber-200">
                        t_caída = <strong className="text-amber-300">{w3Rock.impactTime.toFixed(2)} s</strong>
                      </span>
                      <span className="text-[10px] text-slate-300">
                        v = {w3Rock.v.toFixed(1)} m/s | a = {w3Rock.a.toFixed(2)} m/s²
                      </span>
                    </div>

                    <div className="bg-[#131728] p-3 border-2 border-cyan-400/50 rounded flex flex-col justify-between">
                      <span className="text-[10px] uppercase text-cyan-300 font-bold">🪙 Moneda (5 g) - {w3Coin.regime}:</span>
                      <span className="text-sm font-bold text-cyan-200">
                        t_caída = <strong className="text-cyan-300">{w3Coin.impactTime.toFixed(2)} s</strong>
                      </span>
                      <span className="text-[10px] text-slate-300">
                        v = {w3Coin.v.toFixed(1)} m/s | a = {w3Coin.a.toFixed(2)} m/s²
                      </span>
                    </div>

                    <div className="bg-[#131728] p-3 border-2 border-purple-400/50 rounded flex flex-col justify-between">
                      <span className="text-[10px] uppercase text-purple-300 font-bold">📏 Altura Inicial (H):</span>
                      <span className="text-xl font-black text-purple-300">{ffHeight} m</span>
                      <span className="text-[9px] text-purple-200">
                        {ffVacuum ? 'Ambos caen al mismo tiempo' : `Retraso Moneda: +${(w3Coin.impactTime - w3Rock.impactTime).toFixed(2)} s`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SVG Vertical Drop Towers */}
                <div className="border-4 bg-[#030712] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)] flex flex-col overflow-hidden relative rounded-lg">
                  <div className="px-4 py-2 bg-[#0b0e1b] text-amber-300 border-b-2 border-amber-400 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Torres Paralelas de Caída Libre Didáctica (H = {ffHeight} m)
                    </span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <button
                        onClick={() => setW3CharacterType(w3CharacterType === 'gumball_darwin' ? 'classic' : 'gumball_darwin')}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-[#0b0e1b] font-black rounded text-[10px] uppercase shadow transition-all"
                      >
                        {w3CharacterType === 'gumball_darwin' ? '🐱 Gumball & 🐟 Darwin' : '🪨 Roca vs 🪙 Moneda'}
                      </button>
                      <span className="hidden sm:inline text-slate-300 font-mono">
                        Medio: <strong className={ffVacuum ? 'text-amber-300' : 'text-cyan-300'}>{ffVacuum ? 'EN VACÍO' : 'EN AIRE'}</strong> | g = {ffGravity} m/s²
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-[400px] overflow-hidden flex items-center justify-center bg-[#02040a]">
                    {/* Elmore Junior High Red Lockers Background */}
                    <img
                      src={bgRedLockers}
                      alt="Casilleros Rojos de Elmore Junior High"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#02040a]/50 via-transparent to-[#02040a]/75 pointer-events-none" />

                    <svg viewBox={`0 0 ${W_VIEW} ${H_VIEW}`} className="w-full h-full select-none relative z-10">
                      <defs>
                        <linearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="100%" stopColor="#ca8a04" />
                        </linearGradient>
                        <linearGradient id="gumballSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                        <linearGradient id="darwinSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                        <linearGradient id="mouthRed" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#b91c1c" />
                          <stop offset="100%" stopColor="#881337" />
                        </linearGradient>
                        <filter id="neonGlowW3" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Height Grid Marks */}
                      {Array.from({ length: 6 }).map((_, i) => {
                        const hVal = (ffHeight / 5) * (5 - i);
                        const yPx = 50 + (i / 5) * (H_VIEW - 100);
                        return (
                          <g key={`w3h-${i}`} transform={`translate(0, ${yPx})`}>
                            <line x1="50" y1="0" x2={W_VIEW - 50} y2="0" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                            <text x="35" y="4" textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                              {hVal.toFixed(0)}m
                            </text>
                          </g>
                        );
                      })}

                      {/* Top Initial Height Indicator (Misma Altura) */}
                      <line x1="120" y1="50" x2={W_VIEW - 120} y2="50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 3" />
                      <rect x={W_VIEW / 2 - 160} y="36" width="320" height="24" fill="#0b0e1b" stroke="#fbbf24" strokeWidth="1.5" rx="4" />
                      <text x={W_VIEW / 2} y={52} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="black" fontFamily="monospace">
                        📌 MISMA ALTURA INICIAL DE CAÍDA (H = {ffHeight} m, v₀ = 0 m/s)
                      </text>

                      {/* Floor Ground */}
                      <line x1="20" y1={H_VIEW - 50} x2={W_VIEW - 20} y2={H_VIEW - 50} stroke="#fbbf24" strokeWidth="4" />
                      <rect x="20" y={H_VIEW - 50} width={W_VIEW - 40} height="30" fill="#1e293b" opacity="0.8" />
                      <text x={W_VIEW / 2} y={H_VIEW - 30} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="black" fontFamily="monospace">
                        SUPERFICIE / SUELO (y = 0m)
                      </text>

                      {/* TOWER 1: GUMBALL (O ROCA 5 KG) */}
                      <g id="tower-gumball" transform="translate(260, 0)">
                        <line x1="0" y1="40" x2="0" y2={H_VIEW - 50} stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.8" />
                        <text x="0" y="20" textAnchor="middle" fill="#00E5FF" fontSize="12" fontWeight="black" fontFamily="monospace">
                          {w3CharacterType === 'gumball_darwin' ? '🐱 GUMBALL GRITANDO (5 kg)' : '🪨 ROCA (5 kg)'}
                        </text>
                        <text x="0" y="32" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                          t_caída = {w3Rock.impactTime.toFixed(3)} s
                        </text>

                        {(() => {
                          const isLanded = w3Rock.impacted;
                          const yPx = 50 + (1.0 - w3Rock.y / ffHeight) * (H_VIEW - 100);
                          // Panic shake while falling
                          const shakeX = !isLanded && isPlaying ? Math.sin(tGround * 45) * Math.min(3, w3Rock.v * 0.15) : 0;
                          const shakeY = !isLanded && isPlaying ? Math.cos(tGround * 50) * Math.min(2, w3Rock.v * 0.1) : 0;

                          return (
                            <g transform={`translate(${shakeX}, ${yPx + shakeY})`}>
                              {/* Wind Streams Upward while falling */}
                              {!isLanded && w3Rock.v > 2 && (
                                <g opacity={Math.min(1, w3Rock.v / 15)}>
                                  <line x1="-32" y1="20" x2="-32" y2="-30" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 4" />
                                  <line x1="32" y1="20" x2="32" y2="-30" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 4" />
                                  <line x1="-15" y1="35" x2="-15" y2="-20" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 4" />
                                  <line x1="15" y1="35" x2="15" y2="-20" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 4" />
                                </g>
                              )}

                              {/* Shadow on ground */}
                              <ellipse cx="0" cy={24} rx={isLanded ? 35 : 22} ry={isLanded ? 4 : 6} fill="#000" opacity={0.6} />

                              {/* Character Render: Gumball Screaming OR Classic Rock */}
                              {w3CharacterType === 'gumball_darwin' ? (
                                <g id="gumball-screaming">
                                  {isLanded ? (
                                    /* SQUASHED / SPLAT LANDED STATE */
                                    <g transform="translate(0, 5)">
                                      {/* Squashed Blue Body */}
                                      <ellipse cx="0" cy="5" rx="34" ry="12" fill="url(#gumballSkin)" stroke="#141414" strokeWidth="3" />
                                      {/* Dizzy X Eyes */}
                                      <g stroke="#141414" strokeWidth="2">
                                        <line x1="-14" y1="2" x2="-6" y2="8" />
                                        <line x1="-6" y1="2" x2="-14" y2="8" />
                                        <line x1="6" y1="2" x2="14" y2="8" />
                                        <line x1="14" y1="2" x2="6" y2="8" />
                                      </g>
                                      {/* Squished tongue */}
                                      <path d="M -5,8 Q 0,14 5,8 Z" fill="#f43f5e" stroke="#141414" strokeWidth="1" />
                                      {/* Dizzy Stars Halo overhead */}
                                      <g transform={`translate(0, -22) rotate(${tGround * 180})`}>
                                        <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#FFD700" stroke="#141414" strokeWidth="1" />
                                        <polygon points="14,4 16,7 19,8 16,9 14,12 12,9 9,8 12,7" fill="#FF007F" stroke="#141414" strokeWidth="0.8" />
                                        <polygon points="-14,4 -16,7 -19,8 -16,9 -14,12 -12,9 -9,8 -12,7" fill="#00E5FF" stroke="#141414" strokeWidth="0.8" />
                                      </g>
                                      {/* Splat Text */}
                                      <text x="0" y="-12" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="black" fontFamily="monospace">
                                        💥 ¡¡SPLAT!!
                                      </text>
                                    </g>
                                  ) : (
                                    /* ACTIVE FALLING SCREAMING GUMBALL (Exact matching reference photo) */
                                    <g>
                                      {/* Raised trembling arms/paws */}
                                      <path d={`M -20,-5 Q ${-32 + Math.sin(tGround * 30) * 4},${-28} ${-22 + Math.sin(tGround * 35) * 3},-38`} fill="none" stroke="url(#gumballSkin)" strokeWidth="6" strokeLinecap="round" />
                                      <path d={`M 20,-5 Q ${32 - Math.sin(tGround * 30) * 4},${-28} ${22 - Math.sin(tGround * 35) * 3},-38`} fill="none" stroke="url(#gumballSkin)" strokeWidth="6" strokeLinecap="round" />
                                      
                                      {/* Cat Ears */}
                                      <polygon points="-20,-16 -28,-36 -8,-24" fill="#38bdf8" stroke="#141414" strokeWidth="2.5" />
                                      <polygon points="20,-16 28,-36 8,-24" fill="#38bdf8" stroke="#141414" strokeWidth="2.5" />
                                      <polygon points="-19,-18 -25,-32 -10,-24" fill="#f472b6" />
                                      <polygon points="19,-18 25,-32 10,-24" fill="#f472b6" />

                                      {/* Main Head Circle */}
                                      <ellipse cx="0" cy="-4" rx="26" ry="24" fill="url(#gumballSkin)" stroke="#141414" strokeWidth="3" />

                                      {/* Huge Screaming Open Mouth (Iconic Gumball terror scream) */}
                                      <path
                                        d="M -18,2 C -22,-14 22,-14 18,2 C 16,18 -16,18 -18,2 Z"
                                        fill="url(#mouthRed)"
                                        stroke="#141414"
                                        strokeWidth="2.5"
                                      />
                                      {/* Goofy Teeth & Tongue inside gaping mouth */}
                                      <path d="M -10,-8 L -6,-3 L -2,-8 L 2,-3 L 6,-8" stroke="#FFFFFF" strokeWidth="2.5" fill="#FFFFFF" />
                                      <path d="M -8,12 Q 0,4 8,12" stroke="#FFFFFF" strokeWidth="2.5" fill="#FFFFFF" />
                                      <path d="M -6,6 Q 0,0 6,6 Q 0,14 -6,6 Z" fill="#f43f5e" stroke="#881337" strokeWidth="1.5" />

                                      {/* Terrified Bulging Panicked Eyes */}
                                      <ellipse cx="-11" cy="-14" rx="9" ry="11" fill="#FFFFFF" stroke="#141414" strokeWidth="2" />
                                      <ellipse cx="11" cy="-14" rx="9" ry="11" fill="#FFFFFF" stroke="#141414" strokeWidth="2" />
                                      {/* Tiny dilated pupils looking in terror */}
                                      <circle cx={-11 + Math.sin(tGround * 20) * 1.5} cy={-16} r="3" fill="#141414" />
                                      <circle cx={11 - Math.sin(tGround * 20) * 1.5} cy={-16} r="3" fill="#141414" />
                                      <circle cx={-12} cy={-18} r="1.2" fill="#FFFFFF" />
                                      <circle cx={10} cy={-18} r="1.2" fill="#FFFFFF" />

                                      {/* Red Nose & Whiskers */}
                                      <ellipse cx="0" cy="-7" rx="3.5" ry="2.5" fill="#ef4444" stroke="#141414" strokeWidth="1" />
                                      <line x1="-22" y1="-5" x2="-32" y2="-8" stroke="#141414" strokeWidth="1.5" />
                                      <line x1="-22" y1="-1" x2="-33" y2="1" stroke="#141414" strokeWidth="1.5" />
                                      <line x1="22" y1="-5" x2="32" y2="-8" stroke="#141414" strokeWidth="1.5" />
                                      <line x1="22" y1="-1" x2="33" y2="1" stroke="#141414" strokeWidth="1.5" />

                                      {/* Flying Sweat Drops */}
                                      {w3Rock.v > 3 && (
                                        <g>
                                          <circle cx="-25" cy="-22" r="2.5" fill="#00E5FF" stroke="#141414" strokeWidth="0.8" />
                                          <circle cx="25" cy="-24" r="2.5" fill="#00E5FF" stroke="#141414" strokeWidth="0.8" />
                                        </g>
                                      )}

                                      {/* Comic Scream Balloon */}
                                      <g transform="translate(0, -48)">
                                        <rect x="-60" y="-12" width="120" height="20" rx="4" fill="#00E5FF" stroke="#141414" strokeWidth="1.5" />
                                        <text x="0" y="2" textAnchor="middle" fill="#0b0e1b" fontSize="8.5" fontWeight="black" fontFamily="monospace">
                                          ¡¡¡NOOO, EL SUELOOOO!!! 😱
                                        </text>
                                      </g>
                                    </g>
                                  )}
                                </g>
                              ) : (
                                <g>
                                  <circle cx="0" cy="0" r="22" fill="url(#rockGrad)" stroke="#141414" strokeWidth="3" />
                                  <g fill="#FFFFFF" stroke="#141414" strokeWidth="1.5">
                                    <circle cx="-6" cy="-6" r="5" />
                                    <circle cx="6" cy="-6" r="5" />
                                    <circle cx="-4" cy="-6" r="2" fill="#141414" />
                                    <circle cx="8" cy="-6" r="2" fill="#141414" />
                                  </g>
                                  <text x="0" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="black" fontFamily="monospace">
                                    5kg
                                  </text>
                                </g>
                              )}

                              {/* Force Vectors */}
                              {showVectors && !isLanded && (
                                <g>
                                  <line x1="0" y1="0" x2="0" y2="35" stroke="#ef4444" strokeWidth="3" />
                                  <polygon points="0,35 -5,27 5,27" fill="#ef4444" stroke="#141414" strokeWidth="1" />
                                  <text x="12" y="30" fill="#ef4444" fontSize="10" fontWeight="black" fontFamily="monospace">
                                    Fg = {(ffRockMass * ffGravity).toFixed(1)}N
                                  </text>

                                  {!ffVacuum && w3Rock.v > 0.5 && (
                                    <g>
                                      <line x1="0" y1="0" x2="0" y2="-20" stroke="#38bdf8" strokeWidth="2.5" />
                                      <polygon points="0,-20 -4,-14 4,-14" fill="#38bdf8" stroke="#141414" strokeWidth="1" />
                                      <text x="8" y="-12" fill="#38bdf8" fontSize="9" fontWeight="black" fontFamily="monospace">
                                        Fd
                                      </text>
                                    </g>
                                  )}
                                </g>
                              )}
                            </g>
                          );
                        })()}
                      </g>

                      {/* TOWER 2: DARWIN (O MONEDA 5 G) */}
                      <g id="tower-darwin" transform="translate(640, 0)">
                        <line x1="0" y1="40" x2="0" y2={H_VIEW - 50} stroke="#f97316" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.8" />
                        <text x="0" y="20" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="black" fontFamily="monospace">
                          {w3CharacterType === 'gumball_darwin' ? '🐟 DARWIN ATERRADO (5 g)' : '🪙 MONEDA (5 g)'}
                        </text>
                        <text x="0" y="32" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold" fontFamily="monospace">
                          t_caída = {w3Coin.impactTime.toFixed(3)} s
                        </text>

                        {(() => {
                          const isLanded = w3Coin.impacted;
                          const yPx = 50 + (1.0 - w3Coin.y / ffHeight) * (H_VIEW - 100);
                          const shakeX = !isLanded && isPlaying ? Math.sin(tGround * 55 + 2) * Math.min(3, w3Coin.v * 0.15) : 0;
                          const shakeY = !isLanded && isPlaying ? Math.cos(tGround * 48 + 1) * Math.min(2, w3Coin.v * 0.1) : 0;

                          return (
                            <g transform={`translate(${shakeX}, ${yPx + shakeY})`}>
                              {/* Wind streaks & Doodles in Air Mode */}
                              {!ffVacuum && !isLanded && w3Coin.v > 1 && (
                                <g>
                                  <path d="M -30,-10 Q -40,-20 -20,-30" fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="4 2" />
                                  <path d="M 30,-10 Q 40,-20 20,-30" fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="4 2" />
                                </g>
                              )}

                              {/* Shadow on ground */}
                              <ellipse cx="0" cy={24} rx={isLanded ? 35 : 20} ry={isLanded ? 4 : 5} fill="#000" opacity={0.6} />

                              {/* Character Render: Darwin Screaming OR Classic Coin */}
                              {w3CharacterType === 'gumball_darwin' ? (
                                <g id="darwin-screaming">
                                  {isLanded ? (
                                    /* SQUASHED / SPLAT LANDED STATE */
                                    <g transform="translate(0, 5)">
                                      <ellipse cx="0" cy="5" rx="34" ry="12" fill="url(#darwinSkin)" stroke="#141414" strokeWidth="3" />
                                      {/* Dizzy X Eyes */}
                                      <g stroke="#141414" strokeWidth="2">
                                        <line x1="-14" y1="2" x2="-6" y2="8" />
                                        <line x1="-6" y1="2" x2="-14" y2="8" />
                                        <line x1="6" y1="2" x2="14" y2="8" />
                                        <line x1="14" y1="2" x2="6" y2="8" />
                                      </g>
                                      {/* Tiny green shoes sticking out */}
                                      <rect x="-26" y="8" width="10" height="6" rx="2" fill="#22c55e" stroke="#141414" strokeWidth="1" />
                                      <rect x="16" y="8" width="10" height="6" rx="2" fill="#22c55e" stroke="#141414" strokeWidth="1" />
                                      {/* Dizzy Stars Halo overhead */}
                                      <g transform={`translate(0, -22) rotate(${-tGround * 180})`}>
                                        <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#FFD700" stroke="#141414" strokeWidth="1" />
                                        <polygon points="14,4 16,7 19,8 16,9 14,12 12,9 9,8 12,7" fill="#fb923c" stroke="#141414" strokeWidth="0.8" />
                                        <polygon points="-14,4 -16,7 -19,8 -16,9 -14,12 -12,9 -9,8 -12,7" fill="#22c55e" stroke="#141414" strokeWidth="0.8" />
                                      </g>
                                      <text x="0" y="-12" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="black" fontFamily="monospace">
                                        💥 ¡¡FLAP SPLAT!!
                                      </text>
                                    </g>
                                  ) : (
                                    /* ACTIVE FALLING SCREAMING DARWIN (Exact matching reference photo) */
                                    <g>
                                      {/* Flailing Green Sneakers & Socks */}
                                      <g transform={`translate(0, 15) rotate(${Math.sin(tGround * 40) * 15})`}>
                                        <rect x="-14" y="0" width="8" height="10" fill="#22c55e" stroke="#141414" strokeWidth="2" rx="2" />
                                        <rect x="6" y="0" width="8" height="10" fill="#22c55e" stroke="#141414" strokeWidth="2" rx="2" />
                                        <rect x="-14" y="0" width="8" height="3" fill="#FFFFFF" />
                                        <rect x="6" y="0" width="8" height="3" fill="#FFFFFF" />
                                      </g>

                                      {/* Orange Fish Head (Darwin) */}
                                      <path
                                        d="M -24,-10 C -30,-22 0,-30 20,-16 C 30,-2 28,18 8,20 C -12,20 -24,4 -24,-10 Z"
                                        fill="url(#darwinSkin)"
                                        stroke="#141414"
                                        strokeWidth="3"
                                      />
                                      {/* Fish Tail / Fin on Left */}
                                      <path d="M -24,-8 C -36,-16 -34,4 -24,2 Z" fill="#ea580c" stroke="#141414" strokeWidth="2" />

                                      {/* Giant Screaming Mouth (Darwin's signature panic face) */}
                                      <path
                                        d="M -16,4 C -22,-14 20,-10 18,6 C 14,18 -12,18 -16,4 Z"
                                        fill="url(#mouthRed)"
                                        stroke="#141414"
                                        strokeWidth="2.5"
                                      />
                                      {/* Big Rounded Cartoon Teeth & Pink Tongue */}
                                      <path d="M -8,-6 C -4,-3 -4,-3 0,-6" stroke="#FFFFFF" strokeWidth="3" fill="#FFFFFF" strokeLinecap="round" />
                                      <path d="M -8,12 C 0,8 0,8 6,12" stroke="#FFFFFF" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />
                                      <ellipse cx="0" cy="8" rx="7" ry="5" fill="#f43f5e" />

                                      {/* Bulging Terrified Panicked Eyes looking up */}
                                      <circle cx="-4" cy="-16" r="9" fill="#FFFFFF" stroke="#141414" strokeWidth="2" />
                                      <circle cx="12" cy="-14" r="8" fill="#FFFFFF" stroke="#141414" strokeWidth="2" />
                                      <circle cx={-3 + Math.sin(tGround * 25) * 1.5} cy="-18" r="2.8" fill="#141414" />
                                      <circle cx={13 - Math.sin(tGround * 25) * 1.5} cy="-16" r="2.5" fill="#141414" />
                                      <circle cx="-4" cy="-20" r="1.2" fill="#FFFFFF" />
                                      <circle cx="12" cy="-18" r="1.2" fill="#FFFFFF" />

                                      {/* Blushing Cute Cheeks */}
                                      <ellipse cx="-16" cy="-2" rx="4" ry="2.5" fill="#f43f5e" opacity="0.8" />
                                      <ellipse cx="20" cy="0" rx="4" ry="2.5" fill="#f43f5e" opacity="0.8" />

                                      {/* Comic Scream Balloon */}
                                      <g transform="translate(0, -48)">
                                        <rect x="-60" y="-12" width="120" height="20" rx="4" fill="#fb923c" stroke="#141414" strokeWidth="1.5" />
                                        <text x="0" y="2" textAnchor="middle" fill="#0b0e1b" fontSize="8.5" fontWeight="black" fontFamily="monospace">
                                          ¡¡¡GUMBALL AYÚDAMEEE!!! 😱
                                        </text>
                                      </g>
                                    </g>
                                  )}
                                </g>
                              ) : (
                                <g>
                                  <circle cx="0" cy="0" r="16" fill="url(#coinGrad)" stroke="#141414" strokeWidth="2.5" />
                                  <circle cx="-4" cy="-3" r="2" fill="#141414" />
                                  <circle cx="4" cy="-3" r="2" fill="#141414" />
                                  <path d="M -3,3 Q 0,6 3,3" fill="none" stroke="#141414" strokeWidth="1.5" />
                                  <text x="0" y="8" textAnchor="middle" fill="#141414" fontSize="8" fontWeight="black" fontFamily="monospace">
                                    5g
                                  </text>
                                </g>
                              )}

                              {/* Dynamic Regime Badge */}
                              <g transform="translate(30, 0)">
                                <rect x="0" y="-12" width="96" height="22" fill="#141414" stroke={w3Coin.regime === 'MRU' ? '#00E5FF' : '#facc15'} strokeWidth="2" rx="6" />
                                <text x="48" y="3" textAnchor="middle" fill={w3Coin.regime === 'MRU' ? '#00E5FF' : '#facc15'} fontSize="9.5" fontWeight="black" fontFamily="monospace">
                                  {w3Coin.regime === 'MRU' ? 'MRU (a ≈ 0) 💨' : 'MUA (a ≈ g) ⚡'}
                                </text>
                              </g>

                              {/* Force Vectors */}
                              {showVectors && !isLanded && (
                                <g>
                                  <line x1="0" y1="0" x2="0" y2="25" stroke="#ef4444" strokeWidth="2.5" />
                                  <polygon points="0,25 -3,19 3,19" fill="#ef4444" stroke="#141414" strokeWidth="1" />

                                  {!ffVacuum && w3Coin.v > 0.5 && (
                                    <g>
                                      <line x1="0" y1="0" x2="0" y2={-Math.min(25, (w3Coin.v / w3Coin.v_term) * 25)} stroke="#38bdf8" strokeWidth="2.5" />
                                      <polygon
                                        points={`0,${-Math.min(25, (w3Coin.v / w3Coin.v_term) * 25)} -3,${-Math.min(25, (w3Coin.v / w3Coin.v_term) * 25) + 6} 3,${-Math.min(25, (w3Coin.v / w3Coin.v_term) * 25) + 6}`}
                                        fill="#38bdf8"
                                        stroke="#141414"
                                        strokeWidth="1"
                                      />
                                    </g>
                                  )}
                                </g>
                              )}
                            </g>
                          );
                        })()}
                      </g>
                    </svg>

                    {/* Ground Impact Banner Overlay */}
                    {(w3Rock.impacted || w3Coin.impacted) && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-[#0b0e1b] px-4 py-2 font-mono font-black text-xs uppercase shadow-[0_0_20px_#fbbf24] rounded-md animate-bounce flex items-center gap-2 border-2 border-white">
                        <span>💥 ¡¡IMPACTO REGISTRADO EN EL SUELO!!</span>
                        <span className="text-[10px] bg-[#0b0e1b] text-amber-300 px-2 py-0.5 rounded">
                          {ffVacuum ? '¡Caída Simultánea Verificada!' : w3Rock.impacted && !w3Coin.impacted ? 'Gumball Llegó Primero' : 'Ambos Llegaron'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Freefall Speed Chart */}
                <div className="bg-[#0b0e1b] border-2 border-amber-400/80 p-4 rounded-lg space-y-2">
                  <h4 className="font-bold font-mono text-xs text-amber-300 uppercase flex items-center justify-between">
                    <span>Gráfica Velocidad vs Tiempo v(t) - Demostración MUA vs MRU</span>
                    <span className="text-[10px] text-slate-400">Pared Límite Terminal en Aire</span>
                  </h4>
                  <div className="h-48 w-full bg-[#030712] p-2 rounded border border-amber-900/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={w3ChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 't (s)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 'v (m/s)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#fbbf24', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="v_rock" name={w3CharacterType === 'gumball_darwin' ? "Gumball (5 kg): MUA Puro" : "Roca (5 kg): MUA Puro"} stroke="#fbbf24" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="v_coin" name={w3CharacterType === 'gumball_darwin' ? "Darwin (5 g): Transición MUA → MRU" : "Moneda (5 g): Transición MUA → MRU"} stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* WORLD 4: TIRO PARABÓLICO 2D (CAÑÓN BALÍSTICO DE ELMORE)                   */}
            {/* ========================================================================= */}
            {worldMode === 'world4' && (
              <World4Parabolic
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                showVectors={showVectors}
                showTrail={showTrail}
              />
            )}


            {/* ========================================================================= */}
            {/* WORLD 1: RELATIVIDAD ESPECIAL EN EL AUTOBÚS                                */}
            {/* ========================================================================= */}
            {worldMode === 'world1' && (
              <div className="space-y-6">
                {/* VIEWPORT 1: INTERIOR DEL AUTOBÚS (Observador A) */}
                {(viewMode === 'split' || viewMode === 'bus') && (
                  <div className="border-4 bg-white border-[#141414] shadow-[6px_6px_0px_#141414] flex flex-col overflow-hidden relative">
                    <div className="px-4 py-2 bg-[#141414] text-white flex items-center justify-between font-mono text-xs border-b-4 border-[#141414]">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
                        <span className="font-bold uppercase tracking-wider text-[#00E5FF]">
                          1. PERSPECTIVA INTERIOR DEL BUS (Observador A - Marco S')
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 border border-[#00E5FF] font-bold">
                          Tiro Vertical Recto 1D
                        </span>
                        <span>t' = {tPrime.toFixed(3)}s</span>
                      </div>
                    </div>

                    <div className="relative w-full h-[320px] overflow-hidden flex items-center justify-center bg-[#10141e]">
                      <svg viewBox={`0 0 ${W_VIEW} ${H_VIEW}`} className="w-full h-full select-none">
                        <defs>
                          <radialGradient id="ball3dGrad1" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#80F5FF" />
                            <stop offset="40%" stopColor="#00E5FF" />
                            <stop offset="85%" stopColor="#0088A3" />
                            <stop offset="100%" stopColor="#004D5C" />
                          </radialGradient>
                          <linearGradient id="busGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                          </linearGradient>
                          <filter id="neonGlow1" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {(() => {
                          const busVibeY = isPlaying && v > 0 ? Math.sin(tGround * 28) * Math.min(2.0, v * 2.5) : 0;
                          const headAngle = (relativeYFrac - 0.5) * -22;
                          const isBlinking = Math.sin(tGround * 3.5) > 0.95;

                          return (
                            <g transform={`translate(0, ${busVibeY})`}>
                              {/* Grid */}
                              {showGrid && (
                                <g opacity="0.10">
                                  {Array.from({ length: 19 }).map((_, i) => (
                                    <line key={`g1-v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2={H_VIEW} stroke="#00E5FF" strokeDasharray="4 4" />
                                  ))}
                                  {Array.from({ length: 7 }).map((_, i) => (
                                    <line key={`g1-h-${i}`} x1="0" y1={i * 50} x2={W_VIEW} y2={i * 50} stroke="#00E5FF" strokeDasharray="4 4" />
                                  ))}
                                </g>
                              )}

                              {/* Scrolling Window Scenery */}
                              <g id="window-scenery">
                                <clipPath id="windowClip">
                                  <rect x="70" y="25" width="760" height="150" rx="12" />
                                </clipPath>

                                <rect x="70" y="25" width="760" height="150" fill="#0f172a" rx="12" />

                                <g clipPath="url(#windowClip)">
                                  {/* Cartoon Clouds */}
                                  <g transform={`translate(${((tGround * (20 + v * 120)) % 860) - 100}, 10)`}>
                                    <path
                                      d="M 20,40 Q 35,25 50,40 Q 65,25 80,40 Q 90,50 70,60 Q 30,60 20,40 Z"
                                      fill="#38bdf8"
                                      stroke="#0f172a"
                                      strokeWidth="2"
                                      opacity="0.9"
                                    />
                                    {/* Cloud Eyes */}
                                    <circle cx="45" cy="40" r="2" fill="#0f172a" />
                                    <circle cx="55" cy="40" r="2" fill="#0f172a" />
                                    <path d="M 47,46 Q 50,49 53,46" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                                  </g>

                                  {/* Background Image */}
                                  <image
                                    href={bgHouseSuburban}
                                    x={70 + (scrollX % 760)}
                                    y="15"
                                    width="760"
                                    height="160"
                                    preserveAspectRatio="xMidYMid slice"
                                    opacity="0.9"
                                  />
                                  <image
                                    href={bgHouseSuburban}
                                    x={70 + (scrollX % 760) + (scrollX % 760 > 0 ? -760 : 760)}
                                    y="15"
                                    width="760"
                                    height="160"
                                    preserveAspectRatio="xMidYMid slice"
                                    opacity="0.9"
                                  />

                                  {/* Speed streaks & Cartoon Zoom Lines */}
                                  {v > 0.15 && Array.from({ length: 8 }).map((_, i) => {
                                    const lineX = ((1000 - ((tGround * 900 * v + i * 120) % 900)) % 800) + 70;
                                    const lineY = 30 + i * 18;
                                    return (
                                      <line
                                        key={`speed-streak-${i}`}
                                        x1={lineX}
                                        y1={lineY}
                                        x2={lineX + 80 * v}
                                        y2={lineY}
                                        stroke={i % 2 === 0 ? "#FF007F" : "#00E5FF"}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        opacity={0.6 + v * 0.4}
                                      />
                                    );
                                  })}

                                  {/* Glass tint overlay */}
                                  <rect x="70" y="25" width="760" height="150" fill="url(#busGlassGrad)" />
                                </g>

                                <rect x="70" y="25" width="760" height="150" fill="none" stroke="#141414" strokeWidth="6" rx="12" />
                                <rect x="70" y="25" width="760" height="150" fill="none" stroke="#facc15" strokeWidth="2" rx="12" />
                              </g>

                              {/* Bus Interior Structure */}
                              <rect x="0" y="0" width={W_VIEW} height="25" fill="#f43f5e" stroke="#141414" strokeWidth="3" />
                              <line x1="0" y1="25" x2={W_VIEW} y2="25" stroke="#facc15" strokeWidth="3" />

                              {/* Overhead Hand Straps with Swing Effect */}
                              {[180, 320, 580, 720].map((px, i) => {
                                const sway = Math.sin(tGround * 5 + i) * (v * 8);
                                return (
                                  <g key={`strap-${i}`} transform={`translate(${px}, 25)`}>
                                    <line x1="0" y1="0" x2={sway} y2="35" stroke="#141414" strokeWidth="4" />
                                    <circle cx={sway} cy="42" r="9" fill="#facc15" stroke="#141414" strokeWidth="3" />
                                  </g>
                                );
                              })}

                              {/* Bus Floor */}
                              <rect x="0" y={Y_BUS_BOTTOM} width={W_VIEW} height={H_VIEW - Y_BUS_BOTTOM} fill="#1e1b4b" stroke="#141414" strokeWidth="3" />
                              <line x1="0" y1={Y_BUS_BOTTOM} x2={W_VIEW} y2={Y_BUS_BOTTOM} stroke="#00E5FF" strokeWidth="4" />
                              <line x1="0" y1={Y_BUS_BOTTOM + 4} x2={W_VIEW} y2={Y_BUS_BOTTOM + 4} stroke="#facc15" strokeWidth="2" strokeDasharray="8 6" />

                              {/* Seats */}
                              <g transform="translate(260, 180)">
                                <rect x="0" y="0" width="60" height="40" fill="#a855f7" rx="6" stroke="#141414" strokeWidth="3" />
                                <rect x="0" y="-30" width="14" height="30" fill="#7e22ce" rx="4" stroke="#141414" strokeWidth="3" />
                              </g>
                              <g transform="translate(600, 180)">
                                <rect x="0" y="0" width="60" height="40" fill="#a855f7" rx="6" stroke="#141414" strokeWidth="3" />
                                <rect x="46" y="-30" width="14" height="30" fill="#7e22ce" rx="4" stroke="#141414" strokeWidth="3" />
                              </g>

                              {/* Observer A (Gumball Blue Cat Style) */}
                              <g transform={`translate(390, ${Y_BUS_BOTTOM - 45})`}>
                                {/* Body */}
                                <path d="M -16,20 Q 0,-5 16,20 L 12,45 L -12,45 Z" fill="#0284c7" stroke="#141414" strokeWidth="3" />
                                {/* Arms holding phone/device */}
                                <line x1="-5" y1="10" x2="-16" y2="-20" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                                <circle cx="-16" cy="-20" r="5" fill="#facc15" stroke="#141414" strokeWidth="1.5" />

                                <g transform={`translate(0, -14) rotate(${headAngle})`}>
                                  {/* Cat Ears */}
                                  <polygon points="-12,-8 -18,-24 -4,-12" fill="#0284c7" stroke="#141414" strokeWidth="2.5" />
                                  <polygon points="12,-8 18,-24 4,-12" fill="#0284c7" stroke="#141414" strokeWidth="2.5" />
                                  {/* Head */}
                                  <circle cx="0" cy="0" r="14" fill="#38bdf8" stroke="#141414" strokeWidth="3" />
                                  {!isBlinking ? (
                                    <g fill="#141414">
                                      <circle cx="5" cy="-2" r="2.5" fill="#141414" />
                                      <circle cx="-5" cy="-2" r="2.5" fill="#141414" />
                                      {/* Cute Smile */}
                                      <path d="M -4,4 Q 0,8 4,4" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
                                    </g>
                                  ) : (
                                    <g stroke="#141414" strokeWidth="2">
                                      <line x1="2" y1="-2" x2="8" y2="-2" />
                                      <line x1="-8" y1="-2" x2="-2" y2="-2" />
                                    </g>
                                  )}
                                </g>

                                <rect x="-36" y="-48" width="72" height="18" fill="#facc15" stroke="#141414" strokeWidth="2.5" rx="6" />
                                <text x="0" y="-35" textAnchor="middle" fill="#141414" fontSize="10" fontWeight="black" fontFamily="monospace">
                                  Obs A (S') 🐱
                                </text>
                              </g>

                              {/* Vertical Rail */}
                              <line x1="480" y1={Y_BUS_TOP + 10} x2="480" y2={Y_BUS_BOTTOM} stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="6 4" />

                              {/* Bounce Ripple Effect & Comic BOING! */}
                              {relativeYFrac < 0.12 && (
                                <g>
                                  <ellipse
                                    cx="480"
                                    cy={Y_BUS_BOTTOM}
                                    rx={(1.0 - relativeYFrac / 0.12) * 32}
                                    ry={(1.0 - relativeYFrac / 0.12) * 10}
                                    fill="#facc15"
                                    stroke="#141414"
                                    strokeWidth="3"
                                    opacity={0.8}
                                  />
                                  {/* Comic Sound Effect Badge */}
                                  <g transform="translate(505, 185) rotate(-10)">
                                    <rect x="-24" y="-12" width="48" height="20" fill="#FF007F" stroke="#141414" strokeWidth="2.5" rx="6" />
                                    <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="black">
                                      ¡BOING!
                                    </text>
                                  </g>
                                </g>
                              )}

                              {/* Ghost Trail */}
                              {[0.1, 0.2, 0.3].map((lag, idx) => {
                                const lagTime = Math.max(0, tPrime - lag * 0.15);
                                const { y: lagY } = getProjectilePos(lagTime, Y_BUS_BOTTOM);
                                return (
                                  <circle
                                    key={`ghost-${idx}`}
                                    cx="480"
                                    cy={lagY}
                                    r={12 - idx * 2}
                                    fill="#FF007F"
                                    stroke="#141414"
                                    strokeWidth="1.5"
                                    opacity={0.45 - idx * 0.1}
                                  />
                                );
                              })}

                              {/* Moving Object inside Bus (Pelota Cartoon con Ojos) */}
                              <g id="proj-bus" transform={`translate(480, ${interiorProjY})`}>
                                <g transform={`scale(${squashX}, ${squashY})`}>
                                  <circle cx="0" cy="0" r="16" fill="url(#ball3dGrad1)" stroke="#141414" strokeWidth="3" />
                                  <g transform={`rotate(${ballSpinAngle})`}>
                                    <path d="M -12,0 Q 0,-9 12,0" fill="none" stroke="#141414" strokeWidth="2" opacity="0.8" />
                                    <path d="M -12,0 Q 0,9 12,0" fill="none" stroke="#141414" strokeWidth="2" opacity="0.8" />
                                    <line x1="0" y1="-13" x2="0" y2="13" stroke="#141414" strokeWidth="2" opacity="0.8" />
                                  </g>
                                  {/* Cartoon Eyes on Ball */}
                                  {relativeYFrac < 0.12 ? (
                                    /* Squashed Expression */
                                    <g stroke="#141414" strokeWidth="2">
                                      <line x1="-7" y1="-5" x2="-2" y2="0" />
                                      <line x1="-2" y1="-5" x2="-7" y2="0" />
                                      <line x1="2" y1="-5" x2="7" y2="0" />
                                      <line x1="7" y1="-5" x2="2" y2="0" />
                                    </g>
                                  ) : (
                                    /* Happy Flying Face */
                                    <g fill="#FFFFFF" stroke="#141414" strokeWidth="1.5">
                                      <circle cx="-5" cy="-4" r="4.5" />
                                      <circle cx="5" cy="-4" r="4.5" />
                                      <circle cx="-4" cy="-4" r="2" fill="#141414" />
                                      <circle cx="6" cy="-4" r="2" fill="#141414" />
                                    </g>
                                  )}
                                </g>

                                {/* Instantaneous Velocity Vector Arrow */}
                                {showVectors && (
                                  <g>
                                    <line
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2={-uPrimeY_instant * 45}
                                      stroke="#fbbf24"
                                      strokeWidth="3"
                                    />
                                    <polygon
                                      points={`0,${-uPrimeY_instant * 45} -4,${-uPrimeY_instant * 45 + (uPrimeY_instant >= 0 ? 8 : -8)} 4,${-uPrimeY_instant * 45 + (uPrimeY_instant >= 0 ? 8 : -8)}`}
                                      fill="#fbbf24"
                                    />
                                    <text
                                      x="12"
                                      y={-uPrimeY_instant * 22}
                                      fill="#fbbf24"
                                      fontSize="10"
                                      fontWeight="black"
                                      fontFamily="monospace"
                                    >
                                      v_y' = {(uPrimeY_instant).toFixed(2)}c
                                    </text>
                                  </g>
                                )}
                              </g>

                              {/* Dashboard Telemetry HUD Overlay in Top Right */}
                              <g transform="translate(680, 35)">
                                <rect x="0" y="0" width="135" height="55" fill="#0f172a" stroke="#00E5FF" strokeWidth="1.5" rx="6" opacity="0.9" />
                                <text x="8" y="16" fill="#00E5FF" fontSize="9" fontWeight="black" fontFamily="monospace">
                                  TAQUÍMETRO MARCO S'
                                </text>
                                <text x="8" y="32" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                                  v_bus = {v.toFixed(3)} c
                                </text>
                                <text x="8" y="46" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                  γ = {gamma.toFixed(3)} | t' = {tPrime.toFixed(2)}s
                                </text>
                              </g>
                            </g>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                )}

                {/* VIEWPORT 2: EXTERIOR DESDE LA ESTACIÓN (Observador B) */}
                {(viewMode === 'split' || viewMode === 'ground') && (
                  <div className="border-4 bg-white border-[#141414] shadow-[6px_6px_0px_#141414] flex flex-col overflow-hidden relative">
                    <div className="px-4 py-2 bg-[#141414] text-white flex items-center justify-between font-mono text-xs border-b-4 border-[#141414]">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00] animate-ping"></span>
                        <span className="font-bold uppercase tracking-wider text-[#FF4D00]">
                          2. PERSPECTIVA DESDE LA ESTACIÓN EXTERIOR (Observador B - Marco S)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="bg-[#FF4D00]/20 text-[#FF4D00] px-2 py-0.5 border border-[#FF4D00] font-bold">
                          Trayectoria Parabólica 2D
                        </span>
                        <span>t = {tGround.toFixed(3)}s</span>
                      </div>
                    </div>

                    <div className="relative w-full h-[320px] overflow-hidden flex items-center justify-center bg-[#020617]">
                      <svg viewBox={`0 0 ${W_VIEW} ${H_VIEW}`} className="w-full h-full select-none">
                        <defs>
                          <linearGradient id="busBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#ca8a04" />
                          </linearGradient>
                          <radialGradient id="wheelRimGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="70%" stopColor="#334155" />
                            <stop offset="100%" stopColor="#0f172a" />
                          </radialGradient>
                        </defs>

                        {/* Grid */}
                        {showGrid && (
                          <g opacity="0.10">
                            {Array.from({ length: 19 }).map((_, i) => (
                              <line key={`g2-v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2={H_VIEW} stroke="#FF4D00" strokeDasharray="4 4" />
                            ))}
                            {Array.from({ length: 7 }).map((_, i) => (
                              <line key={`g2-h-${i}`} x1="0" y1={i * 50} x2={W_VIEW} y2={i * 50} stroke="#FF4D00" strokeDasharray="4 4" />
                            ))}
                          </g>
                        )}

                        {/* Station Background */}
                        <image href={bgHouseSuburban} x="0" y="0" width={W_VIEW} height="120" preserveAspectRatio="xMidYMid slice" opacity="0.75" />

                        {/* Station Roof & Signboard */}
                        <rect x="150" y="5" width="600" height="26" fill="#facc15" stroke="#141414" strokeWidth="3" rx="8" />
                        <text x="450" y="22" textAnchor="middle" fill="#141414" fontSize="12" fontWeight="black" fontFamily="monospace">
                          🏛️ ESTACIÓN CENTRAL DE EINSTEIN & GUMBALL (MARCO S)
                        </text>

                        {/* Cartoon Sun with Sunglasses */}
                        <g transform="translate(60, 35)">
                          <circle cx="0" cy="0" r="18" fill="#facc15" stroke="#141414" strokeWidth="2.5" />
                          {/* Rays */}
                          {Array.from({ length: 8 }).map((_, i) => (
                            <line
                              key={`sunray-${i}`}
                              x1="0"
                              y1="0"
                              x2={Math.cos((i * Math.PI) / 4) * 26}
                              y2={Math.sin((i * Math.PI) / 4) * 26}
                              stroke="#facc15"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          ))}
                          <circle cx="0" cy="0" r="18" fill="#facc15" stroke="#141414" strokeWidth="2.5" />
                          {/* Sunglasses */}
                          <rect x="-12" y="-5" width="10" height="7" fill="#141414" rx="2" />
                          <rect x="2" y="-5" width="10" height="7" fill="#141414" rx="2" />
                          <line x1="-2" y1="-2" x2="2" y2="-2" stroke="#141414" strokeWidth="2" />
                          {/* Smile */}
                          <path d="M -6,5 Q 0,9 6,5" fill="none" stroke="#141414" strokeWidth="2" />
                        </g>

                        {/* Station Clock */}
                        <g transform="translate(140, 45)">
                          <circle cx="0" cy="0" r="16" fill="#16123b" stroke="#facc15" strokeWidth="3" />
                          <line x1="0" y1="0" x2="0" y2="-10" stroke="#facc15" strokeWidth="2.5" transform={`rotate(${(tGround * 60) % 360})`} />
                          <line x1="0" y1="0" x2="6" y2="0" stroke="#00E5FF" strokeWidth="2" transform={`rotate(${(tGround * 5) % 360})`} />
                          <circle cx="0" cy="0" r="3" fill="#FF007F" />
                        </g>

                        {/* Platform Sidewalk */}
                        <rect x="0" y="110" width={W_VIEW} height="12" fill="#e2e8f0" />
                        <rect x="0" y="110" width={W_VIEW} height="3" fill="#ef4444" />
                        <line x1="0" y1="122" x2={W_VIEW} y2={122} stroke="#0f172a" strokeWidth="4" />

                        {/* Observer B on Platform (Darwin Orange Fish with Green Sneakers Style) */}
                        {(() => {
                          const headAngleObsB = Math.max(-25, Math.min(25, (exteriorBusX - 450) / 14));
                          const isBlinkingB = Math.sin(tGround * 4.2) > 0.95;

                          return (
                            <g transform="translate(450, 110)">
                              {/* Green Sneakers */}
                              <rect x="-10" y="-6" width="9" height="6" fill="#22c55e" stroke="#141414" strokeWidth="2" rx="2" />
                              <rect x="1" y="-6" width="9" height="6" fill="#22c55e" stroke="#141414" strokeWidth="2" rx="2" />

                              {/* Legs */}
                              <line x1="-5" y1="-14" x2="-5" y2="-6" stroke="#141414" strokeWidth="3" />
                              <line x1="5" y1="-14" x2="5" y2="-6" stroke="#141414" strokeWidth="3" />

                              {/* Darwin Body / Head (Orange Fish) */}
                              <g transform={`translate(0, -22) rotate(${headAngleObsB})`}>
                                <ellipse cx="0" cy="0" rx="14" ry="12" fill="#f97316" stroke="#141414" strokeWidth="3" />
                                {/* Fish Tail */}
                                <polygon points="-14,0 -22,-8 -22,8" fill="#f97316" stroke="#141414" strokeWidth="2.5" />
                                {!isBlinkingB ? (
                                  <g fill="#FFFFFF" stroke="#141414" strokeWidth="1.5">
                                    <circle cx="4" cy="-3" r="4.5" />
                                    <circle cx="4" cy="-3" r="2" fill="#141414" />
                                  </g>
                                ) : (
                                  <line x1="1" y1="-3" x2="8" y2="-3" stroke="#141414" strokeWidth="2" />
                                )}
                                {/* Cute Smile */}
                                <path d="M 0,3 Q 4,7 8,3" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
                              </g>

                              <rect x="-38" y="-56" width="76" height="18" fill="#f97316" stroke="#141414" strokeWidth="2.5" rx="6" />
                              <text x="0" y="-43" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="black" fontFamily="monospace">
                                Obs B (S) 🐟
                              </text>
                            </g>
                          );
                        })()}

                        {/* Road Surface */}
                        <rect x="0" y="122" width={W_VIEW} height={H_VIEW - 122} fill="#1e293b" />
                        {Array.from({ length: 12 }).map((_, i) => (
                          <rect
                            key={`road-line-${i}`}
                            x={i * 80}
                            y={Y_BUS_BOTTOM + 8}
                            width="40"
                            height="4"
                            fill="#fbbf24"
                            opacity="0.8"
                          />
                        ))}

                        {/* Parabola Trail */}
                        {showTrail && (
                          <g>
                            <path d={parabolaPathD} fill="none" stroke="#00E5FF" strokeWidth="3.5" strokeDasharray="6 4" filter="url(#neonGlow1)" />
                            {Array.from({ length: 7 }).map((_, i) => {
                              const fraction = ((tGround * 0.8 + i / 7) % 1.0);
                              const pX = arcStartX + fraction * deltaXSpan;
                              const pY = Y_BUS_BOTTOM - 4 * H_BUS * fraction * (1 - fraction);
                              return (
                                <circle key={`pdot-${i}`} cx={pX} cy={pY} r="3" fill="#00E5FF" opacity="0.8" />
                              );
                            })}
                          </g>
                        )}

                        {/* BUS MOVING EXTERIOR */}
                        <g transform={`translate(${exteriorBusX}, 0)`}>
                          {v > 0.4 && (
                            <rect
                              x={-currentBusWidthExterior / 2 - 6}
                              y={Y_BUS_TOP - 6}
                              width={currentBusWidthExterior + 12}
                              height={H_BUS + 12}
                              rx="14"
                              fill="none"
                              stroke="#00E5FF"
                              strokeWidth="3"
                              opacity={0.4 + v * 0.5}
                              filter="url(#neonGlow1)"
                            />
                          )}

                          {v > 0.3 && Array.from({ length: 5 }).map((_, i) => {
                            const pOffX = -currentBusWidthExterior / 2 - 10 - ((tGround * 400 + i * 25) % 80);
                            const pOffY = Y_BUS_BOTTOM - 15 + Math.sin(i * 3) * 6;
                            return (
                              <circle
                                key={`exhaust-${i}`}
                                cx={pOffX}
                                cy={pOffY}
                                r={6 - i}
                                fill={i % 2 === 0 ? "#FF4D00" : "#00E5FF"}
                                opacity={0.8 - i * 0.15}
                              />
                            );
                          })}

                          <rect
                            x={-currentBusWidthExterior / 2}
                            y={Y_BUS_TOP}
                            width={currentBusWidthExterior}
                            height={H_BUS}
                            rx="10"
                            fill="url(#busBodyGrad)"
                            stroke="#141414"
                            strokeWidth="3.5"
                          />

                          {Array.from({ length: 4 }).map((_, i) => {
                            const wWidth = Math.max(12, (currentBusWidthExterior - 40) / 4);
                            const wX = -currentBusWidthExterior / 2 + 12 + i * (wWidth + 6);
                            return (
                              <g key={`ext-win-${i}`}>
                                <rect x={wX} y={Y_BUS_TOP + 12} width={wWidth} height="32" rx="4" fill="#0284c7" stroke="#0f172a" strokeWidth="2" opacity="0.85" />
                                {i === 1 && (
                                  <circle cx={wX + wWidth / 2} cy={Y_BUS_TOP + 28} r="6" fill="#38bdf8" />
                                )}
                              </g>
                            );
                          })}

                          <polygon
                            points={`${currentBusWidthExterior / 2},${Y_BUS_BOTTOM - 25} ${currentBusWidthExterior / 2 + 90},${Y_BUS_BOTTOM - 38} ${currentBusWidthExterior / 2 + 90},${Y_BUS_BOTTOM - 10}`}
                            fill="#fef08a"
                            opacity="0.35"
                          />
                          <circle cx={currentBusWidthExterior / 2} cy={Y_BUS_BOTTOM - 20} r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                          <rect x={-currentBusWidthExterior / 2 - 2} y={Y_BUS_BOTTOM - 25} width="4" height="12" fill="#ef4444" rx="1" />

                          {(() => {
                            const wheelAngle = (tGround * v * 1200) % 360;
                            const wOffset = Math.min(60, currentBusWidthExterior * 0.28);
                            return (
                              <g>
                                <g transform={`translate(${wOffset}, ${Y_BUS_BOTTOM})`}>
                                  <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                                  <circle cx="0" cy="0" r="9" fill="url(#wheelRimGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                                  <g transform={`rotate(${wheelAngle})`}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                      <line key={`spoke1-${i}`} x1="0" y1="0" x2="0" y2="-9" stroke="#f8fafc" strokeWidth="2" transform={`rotate(${i * 60})`} />
                                    ))}
                                  </g>
                                </g>

                                <g transform={`translate(${-wOffset}, ${Y_BUS_BOTTOM})`}>
                                  <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                                  <circle cx="0" cy="0" r="9" fill="url(#wheelRimGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                                  <g transform={`rotate(${wheelAngle})`}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                      <line key={`spoke2-${i}`} x1="0" y1="0" x2="0" y2="-9" stroke="#f8fafc" strokeWidth="2" transform={`rotate(${i * 60})`} />
                                    ))}
                                  </g>
                                </g>
                              </g>
                            );
                          })()}
                        </g>

                        {/* Object moving in Exterior (Pelota 2D Parábola) */}
                        <g id="proj-ext" transform={`translate(${exteriorBusX}, ${exteriorProjY})`}>
                          <circle cx="0" cy="0" r="14" fill="#00E5FF" opacity="0.3" filter="url(#neonGlow1)" />
                          <circle cx="0" cy="0" r="11" fill="url(#ball3dGrad1)" stroke="#141414" strokeWidth="2.5" />
                          <g transform={`rotate(${ballSpinAngle})`}>
                            <path d="M -10,0 Q 0,-8 10,0" fill="none" stroke="#141414" strokeWidth="1.8" opacity="0.8" />
                            <path d="M -10,0 Q 0,8 10,0" fill="none" stroke="#141414" strokeWidth="1.8" opacity="0.8" />
                            <line x1="0" y1="-11" x2="0" y2="11" stroke="#141414" strokeWidth="1.5" opacity="0.8" />
                          </g>

                          {/* 2D Vector Decomposition Arrows */}
                          {showVectors && (
                            <g>
                              <line x1="0" y1="0" x2="35" y2="0" stroke="#FF4D00" strokeWidth="3" />
                              <polygon points="35,0 27,-4 27,4" fill="#FF4D00" />
                              <text x="38" y="4" fill="#FF4D00" fontSize="9" fontWeight="black" fontFamily="monospace">
                                v_x = {v.toFixed(2)}c
                              </text>

                              <line x1="0" y1="0" x2="0" y2={-u_y * 45} stroke="#00E5FF" strokeWidth="3" />
                              <polygon points={`0,${-u_y * 45} -4,${-u_y * 45 + (u_y >= 0 ? 7 : -7)} 4,${-u_y * 45 + (u_y >= 0 ? 7 : -7)}`} fill="#00E5FF" />
                              <text x="8" y={-u_y * 22} fill="#00E5FF" fontSize="9" fontWeight="black" fontFamily="monospace">
                                v_y = {u_y.toFixed(2)}c
                              </text>

                              <line x1="0" y1="0" x2="35" y2={-u_y * 45} stroke="#4ade80" strokeWidth="2.5" strokeDasharray="3 2" />
                              <text x="40" y={-u_y * 45} fill="#4ade80" fontSize="9" fontWeight="black" fontFamily="monospace">
                                v_total = {totalSpeed.toFixed(2)}c
                              </text>
                            </g>
                          )}
                        </g>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

          </section>
        </div>

        {/* DATA FOOTER */}
        <footer className={`border-t-4 flex flex-col md:flex-row items-center justify-between p-4 font-mono text-xs gap-3 transition-all ${
          worldMode === 'world1'
            ? 'border-[#141414] bg-[#141414] text-white'
            : worldMode === 'world2'
              ? 'border-[#a855f7] bg-[#030712] text-purple-200'
              : 'border-amber-400 bg-[#030712] text-amber-200'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="font-bold">
              Simulación en Tiempo Real ({worldMode === 'world1' ? 'Mundo 1: Terrestre (Tierra)' : worldMode === 'world2' ? 'Mundo 2: Relativista (Nave Espacial)' : 'Mundo 3: Pasillo de Casilleros (L)'})
            </span>
          </div>
          <div className="flex items-center space-x-6 text-cyan-400">
            <span>Distancia L = {hallwayDist}m</span>
            <span>Velocidad = {cubeSpeed.toFixed(2)}c</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
