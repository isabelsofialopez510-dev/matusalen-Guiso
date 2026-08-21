/**
 * Physics Simulation Calculations for MUA and MRU
 * Used in World 2 (Cube horizontal track MUA vs MRU) and World 3 (Freefall Rock vs Coin with air resistance)
 */

export interface FreefallObjectState {
  y: number;
  v: number;
  a: number;
  impactTime: number;
  vTerm?: number;
  hasLanded: boolean;
  modelType: 'MUA' | 'MRU';
  modelDesc: string;
}

/**
 * Calculates freefall position y, velocity v, and acceleration a for an object.
 * In Vacuum: pure MUA (a = g).
 * In Air: transition from MUA (a ~ g) to MRU (a ~ 0, terminal velocity v ~ vTerm).
 */
export function calcFreefallObject(
  t: number,
  H: number,
  g: number,
  mass: number,
  Cd: number,
  Area: number,
  isVacuum: boolean
): FreefallObjectState {
  if (isVacuum) {
    const impactTime = Math.sqrt((2 * H) / Math.max(0.1, g));
    const timeClamped = Math.min(t, impactTime);
    const y = Math.max(0, H - 0.5 * g * timeClamped * timeClamped);
    const v = g * timeClamped;
    const a = timeClamped >= impactTime ? 0 : g;
    const hasLanded = t >= impactTime;
    return {
      y,
      v,
      a,
      impactTime,
      hasLanded,
      modelType: 'MUA',
      modelDesc: 'MUA Puro (Aceleración constante a = g)',
    };
  }

  // Air resistance calculation
  const rho = 1.225; // Air density in kg/m^3
  const k = (0.5 * rho * Cd * Area) / Math.max(0.0001, mass);
  const vTerm = Math.sqrt(g / Math.max(1e-6, k));

  // Analytical integration for freefall with drag:
  // d(t) = (vTerm^2 / g) * ln(cosh(g * t / vTerm))
  // v(t) = vTerm * tanh(g * t / vTerm)
  // a(t) = g / cosh^2(g * t / vTerm)
  const argExp = (H * g) / (vTerm * vTerm);
  const expVal = Math.exp(Math.min(argExp, 60));
  const acoshVal = Math.acosh(Math.max(1, expVal));
  const impactTime = (vTerm / g) * acoshVal;

  const timeClamped = Math.min(t, impactTime);
  const gtOverVterm = (g * timeClamped) / vTerm;
  const v = vTerm * Math.tanh(gtOverVterm);
  const coshVal = Math.cosh(Math.min(gtOverVterm, 30));
  const a = timeClamped >= impactTime ? 0 : g / (coshVal * coshVal);
  const distFallen = ((vTerm * vTerm) / g) * Math.log(coshVal);
  const y = Math.max(0, H - distFallen);
  const hasLanded = t >= impactTime;

  // Determine whether it behaves like MUA or MRU at this instant:
  const isMRU = v >= 0.9 * vTerm || a <= 0.15 * g;
  const modelType: 'MUA' | 'MRU' = isMRU ? 'MRU' : 'MUA';
  const modelDesc = isMRU
    ? `MRU (Velocidad límite v ≈ ${vTerm.toFixed(1)} m/s, a ≈ 0)`
    : `MUA (Acelerando con arrastre, a = ${a.toFixed(2)} m/s²)`;

  return {
    y,
    v,
    a,
    impactTime,
    vTerm,
    hasLanded,
    modelType,
    modelDesc,
  };
}

/**
 * Calculates motion of MRU vs MUA cubes on a 1D horizontal track.
 * Provides exact analytical finish times, arrival velocities, and comparative winner telemetry.
 */
export function calcCubeMotion(
  t: number,
  v0_mua: number,
  a_mua: number,
  v_mru: number,
  trackLength: number = 100
) {
  // MUA calculations:
  // x(t) = v0 * t + 0.5 * a * t^2
  // v(t) = v0 + a * t
  // a(t) = a
  const timeToFinishMUA =
    a_mua > 0
      ? (-v0_mua + Math.sqrt(Math.max(0, v0_mua * v0_mua + 2 * a_mua * trackLength))) / a_mua
      : trackLength / Math.max(0.1, v0_mua);

  const tMUA = Math.min(t, timeToFinishMUA);
  const x_mua = Math.min(trackLength, v0_mua * tMUA + 0.5 * a_mua * tMUA * tMUA);
  const v_mua = t >= timeToFinishMUA ? 0 : v0_mua + a_mua * tMUA;
  const a_mua_val = t >= timeToFinishMUA ? 0 : a_mua;
  const v_finish_mua = Math.sqrt(Math.max(0, v0_mua * v0_mua + 2 * a_mua * trackLength));
  const avg_speed_mua = trackLength / Math.max(0.001, timeToFinishMUA);

  // MRU calculations:
  // x(t) = v_mru * t
  // v(t) = v_mru
  // a(t) = 0
  const timeToFinishMRU = trackLength / Math.max(0.1, v_mru);
  const tMRU = Math.min(t, timeToFinishMRU);
  const x_mru = Math.min(trackLength, v_mru * tMRU);
  const v_mru_val = t >= timeToFinishMRU ? 0 : v_mru;
  const a_mru_val = 0;
  const v_finish_mru = v_mru;
  const avg_speed_mru = v_mru;

  // Comparative winner determination:
  const timeDiff = Math.abs(timeToFinishMUA - timeToFinishMRU);
  let winner: 'MUA' | 'MRU' | 'TIE' = 'TIE';
  if (timeToFinishMUA < timeToFinishMRU - 0.005) {
    winner = 'MUA';
  } else if (timeToFinishMRU < timeToFinishMUA - 0.005) {
    winner = 'MRU';
  } else {
    winner = 'TIE';
  }

  // Margin of victory in distance when winner touches line:
  let marginDistanceMeters = 0;
  if (winner === 'MUA') {
    const mruAtMUAWin = v_mru * timeToFinishMUA;
    marginDistanceMeters = Math.max(0, trackLength - mruAtMUAWin);
  } else if (winner === 'MRU') {
    const muaAtMRUWin = v0_mua * timeToFinishMRU + 0.5 * a_mua * timeToFinishMRU * timeToFinishMRU;
    marginDistanceMeters = Math.max(0, trackLength - muaAtMRUWin);
  }

  return {
    mua: {
      x: x_mua,
      v: v_mua,
      a: a_mua_val,
      pct: Math.min(100, (x_mua / trackLength) * 100),
      timeToFinish: timeToFinishMUA,
      vFinish: v_finish_mua,
      avgSpeed: avg_speed_mua,
      isFinished: t >= timeToFinishMUA,
    },
    mru: {
      x: x_mru,
      v: v_mru_val,
      a: a_mru_val,
      pct: Math.min(100, (x_mru / trackLength) * 100),
      timeToFinish: timeToFinishMRU,
      vFinish: v_finish_mru,
      avgSpeed: avg_speed_mru,
      isFinished: t >= timeToFinishMRU,
    },
    winner,
    timeDiff,
    marginDistanceMeters,
    firstFinished: t >= Math.min(timeToFinishMUA, timeToFinishMRU),
    allFinished: t >= Math.max(timeToFinishMUA, timeToFinishMRU),
  };
}
