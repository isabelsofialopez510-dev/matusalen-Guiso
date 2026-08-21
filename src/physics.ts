/**
 * Special Relativity 2D Physics Engine
 * Contains formulas and state calculations for:
 * - Lorentz factor (gamma)
 * - Length contraction (1D and 2D vector-based)
 * - Relativistic velocity addition (forward and 2D)
 * - Light clock geometry and proper/coordinate time conversions
 */

// Speed of light in normalized units (c = 1.0)
export const C = 1.0;

// Proper dimensions of the bus in meters
export const PROPER_LENGTH = 14.0;
export const PROPER_WIDTH = 4.0;
export const PROPER_HEIGHT = 2.5;

/**
 * Calculates the Lorentz factor (gamma) for a given velocity v (as a fraction of c).
 * gamma = 1 / sqrt(1 - beta^2) where beta = v / c
 */
export function getLorentzFactor(v: number): number {
  const absV = Math.abs(v);
  if (absV <= 0) return 1.0;
  // Cap at 0.9999c to prevent division by zero or infinite values
  const beta = Math.min(absV, 0.9999) / C;
  return 1.0 / Math.sqrt(1.0 - beta * beta);
}

/**
 * Calculates simple length contraction along the direction of motion.
 * L = L0 / gamma
 */
export function getContractedLength(L0: number, v: number): number {
  const gamma = getLorentzFactor(v);
  return L0 / gamma;
}

/**
 * Relativistic speed addition formula:
 * Adds a velocity change dv to current velocity v, ensuring c is never exceeded.
 * v_new = (v + dv) / (1 + v * dv / c^2)
 */
export function addRelativisticVelocity(v: number, dv: number): number {
  const denominator = 1.0 + (v * dv) / (C * C);
  if (Math.abs(denominator) < 0.0001) return v;
  const vNew = (v + dv) / denominator;
  // Keep within [-0.999c, 0.999c]
  return Math.max(-0.999, Math.min(0.999, vNew));
}

/**
 * Represents a 2D vector (position, displacement, or velocity)
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Contracts a 2D position vector relative to a center point,
 * given the motion velocity vector of the moving frame.
 * 
 * Contraction only happens along the direction of motion.
 * 1. Project the offset vector onto the velocity direction.
 * 2. Contract the parallel component by dividing by gamma.
 * 3. Keep the perpendicular component unchanged.
 * 4. Reconstruct the contracted offset vector.
 */
export function contractVector2D(
  offset: Vector2D,
  velocity: Vector2D
): Vector2D {
  const vSubC = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (vSubC < 0.001) {
    return { ...offset };
  }
  
  const gamma = getLorentzFactor(vSubC);
  
  // Unit vector of motion
  const nx = velocity.x / vSubC;
  const ny = velocity.y / vSubC;
  
  // Projection of offset onto motion vector (parallel component magnitude)
  const proj = offset.x * nx + offset.y * ny;
  
  // Parallel and perpendicular vectors
  const parallelX = proj * nx;
  const parallelY = proj * ny;
  
  const perpendicularX = offset.x - parallelX;
  const perpendicularY = offset.y - parallelY;
  
  // Contract the parallel component
  const contractedParallelX = parallelX / gamma;
  const contractedParallelY = parallelY / gamma;
  
  return {
    x: contractedParallelX + perpendicularX,
    y: contractedParallelY + perpendicularY,
  };
}

/**
 * Transforms coordinates of a point from the bus proper frame (S')
 * to the ground observer frame (S), where the bus center is at busPos,
 * has heading angle theta, and is moving at speed v.
 * 
 * In S', the bus is aligned horizontally, center is at (0,0).
 * In S, the bus is centered at busPos, oriented at theta, and contracted
 * in the direction of motion (which is its velocity direction).
 */
export function transformBusToGround(
  localPoint: Vector2D,
  busPos: Vector2D,
  theta: number,
  v: number
): Vector2D {
  // 1. Rotate the point in proper frame to match the bus heading theta
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const rotatedOffset = {
    x: localPoint.x * cosT - localPoint.y * sinT,
    y: localPoint.x * sinT + localPoint.y * cosT,
  };
  
  // The bus moves in direction of its heading theta (or we can use actual velocity direction)
  // Let's assume velocity is along the heading theta.
  const velocity = {
    x: v * cosT,
    y: v * sinT,
  };
  
  // 2. Contract the rotated offset vector along the velocity direction
  const contractedOffset = contractVector2D(rotatedOffset, velocity);
  
  // 3. Translate by bus position
  return {
    x: busPos.x + contractedOffset.x,
    y: busPos.y + contractedOffset.y,
  };
}

/**
 * Relativistic 2D Velocity Addition.
 * Transforms a velocity vector u' = (ux', uy') from the moving bus frame
 * to the ground frame u = (ux, uy), where the bus moves at velocity v along the x-axis.
 * 
 * If the bus is oriented at angle theta, we first rotate u' to align with the bus heading,
 * then perform the relativistic transformation, then return the velocity vector.
 */
export function transformVelocityToGround2D(
  uPrime: Vector2D,
  v: number,
  theta: number
): Vector2D {
  const gamma = getLorentzFactor(v);
  
  // Rotate u' to align with the bus's heading
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const uPrimeRot = {
    x: uPrime.x * cosT - uPrime.y * sinT,
    y: uPrime.x * sinT + uPrime.y * cosT,
  };
  
  // Relativistic addition of the rotated proper velocity and bus velocity v (which is in the heading direction)
  // Since the bus velocity is along its heading, we can add velocities along the heading x-axis,
  // and scale the perpendicular heading y-axis by gamma.
  // Let's denote the components along the heading axis as h_parallel and h_perp:
  const uParallelPrime = uPrime.x; // proper velocity along bus axis
  const uPerpPrime = uPrime.y;     // proper velocity perpendicular to bus axis
  
  const denominator = 1.0 + (uParallelPrime * v) / (C * C);
  if (Math.abs(denominator) < 0.0001) {
    return { x: 0, y: 0 };
  }
  
  const uParallelGround = (uParallelPrime + v) / denominator;
  const uPerpGround = uPerpPrime / (gamma * denominator);
  
  // Rotate back to global ground coordinates
  return {
    x: uParallelGround * cosT - uPerpGround * sinT,
    y: uParallelGround * sinT + uPerpGround * cosT,
  };
}
