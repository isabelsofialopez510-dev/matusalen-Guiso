// Specialized High-Energy Cartoon Animation Engine for Angry Gumball
// Implements expressive character cycles, elastic physics, comic action banners,
// rotating debris, dynamic smoke/dust puffs, eye tracking, and speech bubbles.

export interface ComicBanner {
  id: number;
  x: number;
  y: number;
  text: string;
  subtext?: string;
  color: string;
  bgColor: string;
  scale: number;
  rotation: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface DebrisFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
  material: 'cardboard' | 'wood' | 'glass' | 'tnt';
}

export interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface SlingshotElastic {
  twangTime: number;
  ampX: number;
  ampY: number;
  active: boolean;
}

// 1. ANIMATED CLOUDS & SKY ATMOSPHERE
export function drawAnimatedClouds(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.save();
  const clouds = [
    { base: 70, y: 50, speed: 0.2, scale: 0.9 },
    { base: 340, y: 80, speed: 0.35, scale: 0.7 },
    { base: 640, y: 45, speed: 0.25, scale: 1.1 },
  ];

  clouds.forEach((c) => {
    const cx = ((c.base + tick * c.speed) % 950) - 50;
    const cy = c.y + Math.sin(tick * 0.03 + c.base) * 4;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * c.scale, 0, Math.PI * 2);
    ctx.arc(cx + 15 * c.scale, cy - 8 * c.scale, 16 * c.scale, 0, Math.PI * 2);
    ctx.arc(cx + 32 * c.scale, cy, 20 * c.scale, 0, Math.PI * 2);
    ctx.arc(cx + 48 * c.scale, cy + 2 * c.scale, 14 * c.scale, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// 2. ANIMATED CHROMATIC PULSE RAINBOW
export function drawAnimatedRainbow(ctx: CanvasRenderingContext2D, tick: number): void {
  ctx.save();
  const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
  const wave = Math.sin(tick * 0.05) * 5;

  rainbowColors.forEach((col, idx) => {
    ctx.beginPath();
    ctx.arc(430, 420 + wave, 390 - idx * 7, Math.PI, Math.PI * 2, false);
    ctx.lineWidth = 6 + Math.sin(tick * 0.08 + idx) * 1.2;
    ctx.strokeStyle = col;
    // Chromatic pulsing alpha
    ctx.globalAlpha = 0.35 + Math.sin(tick * 0.06 + idx * 0.5) * 0.12;
    ctx.stroke();
  });
  ctx.restore();
}

// 3. ANIMATED GUMBALL (Blue cat with blonde wig, pink dress, dynamic emotions & arms!)
export function drawAnimatedGumball(
  ctx: CanvasRenderingContext2D,
  tick: number,
  state: 'idle' | 'pulling' | 'cheering' | 'gasp',
  dragPos?: { x: number; y: number },
  slingshotPos: { x: number; y: number } = { x: 135, y: 295 }
): void {
  ctx.save();

  // Root position & dynamic bobbing
  let gx = 88;
  let gy = 246;
  let gRot = 0;

  if (state === 'idle') {
    gy += Math.sin(tick * 0.08) * 2;
  } else if (state === 'pulling') {
    // Lean back with strain
    gx -= 8;
    gy += 3;
    gRot = -0.15;
  } else if (state === 'cheering') {
    // Excited jumping!
    gy -= Math.abs(Math.sin(tick * 0.25)) * 14;
    gRot = Math.sin(tick * 0.3) * 0.1;
  } else if (state === 'gasp') {
    // Shivering panic
    gx += (Math.random() - 0.5) * 3;
    gy += 2;
  }

  ctx.translate(gx, gy);
  ctx.rotate(gRot);

  // Blonde Wig
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-3, -6, 24, 0, Math.PI * 2);
  ctx.fill();
  // Wig ponytails swaying
  const hairSway = Math.sin(tick * 0.1) * 3;
  ctx.beginPath();
  ctx.ellipse(-26, 4 + hairSway, 8, 14, -0.3, 0, Math.PI * 2);
  ctx.ellipse(20, 4 - hairSway, 8, 14, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Blue Head
  ctx.fillStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Animated Cat Ears (twitching!)
  const earTwitch = Math.sin(tick * 0.15) > 0.85 ? -3 : 0;
  ctx.beginPath();
  ctx.moveTo(-13, -16);
  ctx.lineTo(-6 + earTwitch, -31);
  ctx.lineTo(2, -18);
  ctx.closePath();
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(3, -18);
  ctx.lineTo(11, -30);
  ctx.lineTo(18, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eyes & Expressions
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -1, 5, 0, Math.PI * 2);
  ctx.arc(6, -1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  if (state === 'pulling') {
    // Fierce squinting pupils
    ctx.beginPath();
    ctx.arc(-4, -1, 2, 0, Math.PI * 2);
    ctx.arc(8, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    // Gritted teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, 7, 12, 5);
    ctx.strokeRect(-6, 7, 12, 5);
    // Sweat droplet from strain
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(15, -12, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (state === 'cheering') {
    // Star eyes!
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', -6, 3);
    ctx.fillText('★', 6, 3);
    // Big open happy mouth
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 7, 5, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  } else {
    // Normal confident eyes
    ctx.beginPath();
    ctx.arc(-5, -1, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Smug cat smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 7);
    ctx.quadraticCurveTo(-1, 10, 0, 7);
    ctx.quadraticCurveTo(2, 10, 5, 7);
    ctx.stroke();
  }

  // Eyebrows
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (state === 'pulling') {
    ctx.moveTo(-12, -7);
    ctx.lineTo(-2, -5);
    ctx.moveTo(12, -7);
    ctx.lineTo(2, -5);
  } else {
    ctx.moveTo(-10, -8);
    ctx.lineTo(-2, -6);
    ctx.moveTo(10, -8);
    ctx.lineTo(2, -6);
  }
  ctx.stroke();

  // Pink Princess Dress
  ctx.fillStyle = '#f472b6';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-12, 18);
  ctx.lineTo(12, 18);
  ctx.lineTo(20, 48);
  ctx.lineTo(-20, 48);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dress ruffles animated
  ctx.fillStyle = '#fbcfe8';
  for (let i = -18; i < 18; i += 7) {
    ctx.beginPath();
    ctx.arc(i + 3, 48, 4, 0, Math.PI);
    ctx.fill();
  }

  // Arms and Hands:
  if (state === 'pulling' && dragPos) {
    // Stretching arm reaching towards the catapult pouch!
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, 24);
    // Relative to Gumball origin
    const relDragX = dragPos.x - gx;
    const relDragY = dragPos.y - gy;
    ctx.lineTo(relDragX * 0.7, relDragY * 0.7);
    ctx.lineTo(relDragX, relDragY);
    ctx.stroke();
  } else if (state === 'cheering') {
    // Arms raised in victory!
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 22);
    ctx.lineTo(-24, 4);
    ctx.moveTo(10, 22);
    ctx.lineTo(24, 4);
    ctx.stroke();
  } else {
    // Arms on hips
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-10, 22);
    ctx.lineTo(-18, 32);
    ctx.lineTo(-10, 36);
    ctx.moveTo(10, 22);
    ctx.lineTo(18, 32);
    ctx.lineTo(10, 36);
    ctx.stroke();
  }

  ctx.restore();
}

// 4. ANIMATED DARWIN (Orange fish, crown sparkles, eye tracking, and scribbling telemetry clipboard!)
export function drawAnimatedDarwin(
  ctx: CanvasRenderingContext2D,
  tick: number,
  targetPos: { x: number; y: number } | null,
  speechText: string,
  speechTimer: number
): void {
  ctx.save();

  const dx = 205;
  let dy = 265 + Math.sin(tick * 0.09 + 1) * 2;

  ctx.translate(dx, dy);

  // Brown Ponytail
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(-10, -10, 14, 0, Math.PI * 2);
  ctx.fill();

  // Orange Head
  ctx.fillStyle = '#fb923c';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gold Crown with animated shimmering sparkles!
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(-9, -15);
  ctx.lineTo(-5, -25);
  ctx.lineTo(0, -19);
  ctx.lineTo(5, -25);
  ctx.lineTo(9, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Orbiting crown star sparkles
  const sparklePhase = tick * 0.1;
  const sx = Math.cos(sparklePhase) * 14;
  const sy = -22 + Math.sin(sparklePhase) * 4;
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('✨', sx, sy);

  // Big Cartoon Eyes with DYNAMIC PUPIL TRACKING!
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5, -1, 6, 0, Math.PI * 2);
  ctx.arc(7, -1, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Calculate gaze direction towards target
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  if (targetPos) {
    const angle = Math.atan2(targetPos.y - dy, targetPos.x - dx);
    pupilOffsetX = Math.cos(angle) * 3;
    pupilOffsetY = Math.sin(angle) * 2.5;
  }

  // Darwin Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-4 + pupilOffsetX, -1 + pupilOffsetY, 3, 0, Math.PI * 2);
  ctx.arc(8 + pupilOffsetX, -1 + pupilOffsetY, 3, 0, Math.PI * 2);
  ctx.fill();
  // Catchlight sparkle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5 + pupilOffsetX, -2 + pupilOffsetY, 1, 0, Math.PI * 2);
  ctx.arc(7 + pupilOffsetX, -2 + pupilOffsetY, 1, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful smile
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1, 6, 4, 0, Math.PI);
  ctx.stroke();

  // White ruffled dress
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, 17);
  ctx.lineTo(13, 17);
  ctx.lineTo(20, 45);
  ctx.lineTo(-17, 45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Clipboard in hand
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-15, 50, 38, 45);
  ctx.strokeRect(-15, 50, 38, 45);

  // Clipboard clip
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-4, 47, 16, 6);

  // Graph on clipboard
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, 85);
  ctx.lineTo(17, 85);
  ctx.moveTo(-10, 85);
  ctx.lineTo(-10, 58);
  ctx.stroke();

  // Parabolic Curve highlighted
  ctx.strokeStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-10, 85);
  ctx.quadraticCurveTo(3, 55, 17, 85);
  ctx.stroke();

  // Text "45°"
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('45°', -1, 68);

  // Animated pencil scribbling rapidly!
  const penWiggle = Math.sin(tick * 0.4) * 3;
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(14 + penWiggle, 70);
  ctx.lineTo(24 + penWiggle, 60);
  ctx.stroke();

  // Floating math numbers coming from clipboard!
  if (tick % 40 < 20) {
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('R=v²/g', 26, 45 - (tick % 40) * 0.8);
  }

  // Dynamic Comic Speech Bubble over Darwin!
  if (speechTimer > 0 && speechText) {
    ctx.save();
    const bubbleX = 10;
    const bubbleY = -55;
    ctx.font = 'bold 10px sans-serif';
    const textWidth = ctx.measureText(speechText).width;
    const pad = 8;
    const bw = Math.max(textWidth + pad * 2, 80);
    const bh = 26;

    // Bubble shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(bubbleX - bw / 2 + 3, bubbleY - bh / 2 + 3, bw, bh, 10);
    ctx.fill();

    // Bubble body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bubbleX - bw / 2, bubbleY - bh / 2, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // Pointer tail
    ctx.beginPath();
    ctx.moveTo(bubbleX - 6, bubbleY + bh / 2);
    ctx.lineTo(bubbleX, bubbleY + bh / 2 + 8);
    ctx.lineTo(bubbleX + 6, bubbleY + bh / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(speechText, bubbleX, bubbleY);
    ctx.restore();
  }

  ctx.restore();
}

// 5. ANIMATED ENEMIES (Tobias, Banana Joe, Rob, etc. with sweating, shaking, and 3D star knockout orbiters!)
export function drawAnimatedEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: {
    x: number;
    y: number;
    radius: number;
    name: string;
    color: string;
    expression: 'idle' | 'panic' | 'hit';
    defeated: boolean;
  },
  tick: number,
  isThreatened: boolean
): void {
  ctx.save();

  let ex = enemy.x;
  let ey = enemy.y;
  let scaleX = 1;
  let scaleY = 1;

  if (enemy.defeated) {
    // Fallen / dizzy knockout state
    ctx.translate(ex, ey);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = enemy.color;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spiral Knockout Eyes
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('x x', 0, -1);

    // 3 Golden Stars ORBITING in 3D around the head!
    const orbitSpeed = tick * 0.12;
    for (let i = 0; i < 3; i++) {
      const angle = orbitSpeed + (i * Math.PI * 2) / 3;
      const starX = Math.cos(angle) * (enemy.radius + 8);
      const starY = -enemy.radius - 4 + Math.sin(angle) * 4;
      const starScale = 0.7 + (Math.sin(angle) + 1) * 0.3;

      ctx.save();
      ctx.translate(starX, starY);
      ctx.scale(starScale, starScale);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('⭐', 0, 0);
      ctx.restore();
    }

    ctx.restore();
    return;
  }

  // Living enemy animation:
  if (isThreatened || enemy.expression === 'panic') {
    // Trembling in terror!
    ex += (Math.random() - 0.5) * 4;
    ey += (Math.random() - 0.5) * 2;
    scaleY = 1.08;
    scaleX = 0.94;
  } else {
    // Gentle breathing idle squish
    const breathe = Math.sin(tick * 0.08 + enemy.x) * 0.04;
    scaleY = 1 + breathe;
    scaleX = 1 - breathe;
  }

  ctx.translate(ex, ey);
  ctx.scale(scaleX, scaleY);

  // Body
  ctx.fillStyle = enemy.color;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5, -2, 5, 0, Math.PI * 2);
  ctx.arc(5, -2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  if (isThreatened || enemy.expression === 'panic') {
    // Shivering pinpoint pupils (terror)
    ctx.beginPath();
    ctx.arc(-5 + (Math.random() - 0.5), -2, 1.5, 0, Math.PI * 2);
    ctx.arc(5 + (Math.random() - 0.5), -2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Open screaming mouth
    ctx.beginPath();
    ctx.ellipse(0, 7, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sweat droplets popping off forehead!
    ctx.fillStyle = '#38bdf8';
    const sweatWave = Math.sin(tick * 0.2);
    ctx.beginPath();
    ctx.arc(enemy.radius + 4, -enemy.radius + sweatWave * 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-enemy.radius - 3, -enemy.radius - sweatWave * 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Smug / confident pupils
    ctx.beginPath();
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Smirk
    ctx.beginPath();
    ctx.arc(0, 4, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Enemy Name Tag
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(enemy.name, 0, enemy.radius + 12);

  ctx.restore();
}

// 6. ANIMATED SLINGSHOT & DAMPED HARMONIC ELASTIC BANDS
export function drawSlingshotAndBands(
  ctx: CanvasRenderingContext2D,
  origin: { x: number; y: number },
  isDragging: boolean,
  dragPos: { x: number; y: number },
  elastic: SlingshotElastic,
  tick: number
): void {
  ctx.save();

  // Fork Post Vibration when twanging
  let forkVibX = 0;
  if (elastic.active && elastic.twangTime < 1.0) {
    forkVibX = Math.sin(elastic.twangTime * 40) * Math.exp(-elastic.twangTime * 6) * 4;
  }

  // Wooden Post
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 4;
  ctx.fillRect(origin.x - 6 + forkVibX, origin.y, 12, 85);
  ctx.strokeRect(origin.x - 6 + forkVibX, origin.y, 12, 85);

  // Slingshot Fork
  ctx.beginPath();
  ctx.moveTo(origin.x - 16 + forkVibX, origin.y - 18);
  ctx.lineTo(origin.x - 4 + forkVibX, origin.y);
  ctx.lineTo(origin.x + 4 + forkVibX, origin.y);
  ctx.lineTo(origin.x + 16 + forkVibX, origin.y - 18);
  ctx.stroke();

  // Rubber Bands
  const forkLeft = { x: origin.x - 14 + forkVibX, y: origin.y - 15 };
  const forkRight = { x: origin.x + 14 + forkVibX, y: origin.y - 15 };

  if (isDragging) {
    // Fully stretched tension band
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(forkLeft.x, forkLeft.y);
    ctx.lineTo(dragPos.x, dragPos.y);
    ctx.moveTo(dragPos.x, dragPos.y);
    ctx.lineTo(forkRight.x, forkRight.y);
    ctx.stroke();

    // Leather Pouch
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(dragPos.x, dragPos.y, 7, 10, Math.atan2(dragPos.y - origin.y, dragPos.x - origin.x), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (elastic.active && elastic.twangTime < 1.0) {
    // DAMPED HARMONIC OSCILLATION (Snapping elastic rubber twang!)
    const decay = Math.exp(-elastic.twangTime * 6);
    const wave = Math.sin(elastic.twangTime * 35) * decay;
    const twangX = origin.x + elastic.ampX * wave * 0.5;
    const twangY = origin.y + elastic.ampY * wave * 0.5;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(forkLeft.x, forkLeft.y);
    ctx.quadraticCurveTo(twangX, twangY, forkRight.x, forkRight.y);
    ctx.stroke();
  } else {
    // Resting relaxed rubber band
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(forkLeft.x, forkLeft.y);
    ctx.quadraticCurveTo(origin.x, origin.y - 8, forkRight.x, forkRight.y);
    ctx.stroke();
  }

  ctx.restore();
}

// 7. COMIC ACTION BANNERS ("¡KABOOM!", "¡WHAM!", "¡45° PERFECTO!")
export function drawComicBanners(ctx: CanvasRenderingContext2D, banners: ComicBanner[]): void {
  banners.forEach((b) => {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);
    ctx.scale(b.scale, b.scale);
    ctx.globalAlpha = b.alpha;

    // Comic Starburst / Badge Background
    ctx.fillStyle = b.bgColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;

    const padX = 14;
    const padY = 7;
    ctx.font = 'black 16px sans-serif';
    const txtMetrics = ctx.measureText(b.text);
    const bw = txtMetrics.width + padX * 2;
    const bh = 32;

    // Comic jagged badge or pill
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // Bold Comic text
    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(b.text, 0, 0);
    ctx.fillText(b.text, 0, 0);

    ctx.restore();
  });
}

// 8. DEBRIS SYSTEM (Flying wooden splinters, glass shards, cardboard rips)
export function drawDebris(ctx: CanvasRenderingContext2D, debris: DebrisFragment[]): void {
  debris.forEach((d) => {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);
    ctx.globalAlpha = d.alpha;
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;

    if (d.material === 'glass') {
      // Shimmering triangular glass shard
      ctx.beginPath();
      ctx.moveTo(-d.w / 2, -d.h / 2);
      ctx.lineTo(d.w / 2, 0);
      ctx.lineTo(-d.w / 4, d.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
      ctx.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h);
    }

    ctx.restore();
  });
}

// Spawn shattered fragments when a block is destroyed
export function spawnDebrisExplosion(
  x: number,
  y: number,
  w: number,
  h: number,
  material: 'cardboard' | 'wood' | 'glass' | 'tnt',
  color: string
): DebrisFragment[] {
  const pieces: DebrisFragment[] = [];
  const count = material === 'tnt' ? 14 : 8;

  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = Math.random() * 8 + 3;
    pieces.push({
      x: x + (Math.random() - 0.5) * w,
      y: y + (Math.random() - 0.5) * h,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.4,
      w: Math.random() * (w * 0.4) + 6,
      h: Math.random() * (h * 0.4) + 6,
      color: material === 'glass' ? '#bae6fd' : color,
      alpha: 1,
      material,
    });
  }
  return pieces;
}

// 9. SMOKE & DUST PUFFS
export function drawSmokePuffs(ctx: CanvasRenderingContext2D, puffs: SmokePuff[]): void {
  puffs.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// 10. ANIMATED JAKE THE DOG (Hora de Aventura: perro elástico mágico con brazo extensible para la resortera)
export function drawAnimatedJake(
  ctx: CanvasRenderingContext2D,
  tick: number,
  state: 'idle' | 'pulling' | 'cheering' | 'gasp',
  dragPos?: { x: number; y: number },
  slingshotPos: { x: number; y: number } = { x: 135, y: 295 }
): void {
  ctx.save();

  // Root position & dynamic bobbing
  let jx = 88;
  let jy = 252;
  let jRot = 0;
  let scaleX = 1;
  let scaleY = 1;

  if (state === 'idle') {
    // Rhythmic breathing bob
    jy += Math.sin(tick * 0.08) * 2.5;
  } else if (state === 'pulling') {
    // Lean back with intense physical strain
    jx -= 10;
    jy += 3;
    jRot = -0.16;
    scaleX = 0.95;
    scaleY = 1.05;
  } else if (state === 'cheering') {
    // Joyful stretch-jumping in the air ("¡¡ALGEBRAICO!!")
    jy -= Math.abs(Math.sin(tick * 0.25)) * 18;
    jRot = Math.sin(tick * 0.3) * 0.12;
    scaleX = 1 + Math.sin(tick * 0.25) * 0.1;
    scaleY = 1 - Math.sin(tick * 0.25) * 0.08;
  } else if (state === 'gasp') {
    // Melting puddle dog / shock
    jy += 8;
    scaleX = 1.25;
    scaleY = 0.75;
    jx += (Math.random() - 0.5) * 3;
  }

  ctx.translate(jx, jy);
  ctx.rotate(jRot);
  ctx.scale(scaleX, scaleY);

  // Wagging tail in the back
  ctx.save();
  const tailWag = state === 'cheering' ? Math.sin(tick * 0.5) * 16 : Math.sin(tick * 0.15) * 6;
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(-20, 16 + tailWag * 0.2, 7, 10, -0.6 + tailWag * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Jake Main Body (Golden Yellow Dog)
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Body capsule / bean shape
  ctx.beginPath();
  ctx.ellipse(0, 12, 19, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Subtle warm belly highlight
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(2, 14, 13, 17, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Stubby back legs / feet
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(-11, 35, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(11, 35, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Jake Floppy Ears (animated swaying)
  const earSway = state === 'cheering' ? Math.sin(tick * 0.3) * 6 : Math.sin(tick * 0.1) * 2.5;
  // Left ear
  ctx.beginPath();
  ctx.ellipse(-19, -4 + earSway, 6, 15, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right ear
  ctx.beginPath();
  ctx.ellipse(19, -4 - earSway, 6, 15, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Jake's Iconic Cheeks / Jowls (Muzzle)
  ctx.fillStyle = '#f59e0b';
  // Left cheek
  ctx.beginPath();
  ctx.arc(-7, 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right cheek
  ctx.beginPath();
  ctx.arc(7, 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black oval nose
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(0, -3, 4.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-1.5, -4.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Big Cartoon Eyes
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2.5;

  if (state === 'pulling') {
    // Determined aiming squinting eyes
    ctx.beginPath();
    ctx.arc(-8, -12, 6.5, 0, Math.PI * 2);
    ctx.arc(8, -12, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Focused pupils looking forward towards sling
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(-6, -12, 3.5, 0, Math.PI * 2);
    ctx.arc(10, -12, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -13, 1.5, 0, Math.PI * 2);
    ctx.arc(9, -13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Gritted teeth or tongue sticking out in effort
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, 9, 4, 6, 0.1, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Cartoon sweat drops flying from brow when pulling!
    const sweatOsc = Math.sin(tick * 0.3);
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    // Left drop
    ctx.beginPath();
    ctx.moveTo(-16, -18 + sweatOsc * 2);
    ctx.quadraticCurveTo(-20, -14, -17, -11);
    ctx.quadraticCurveTo(-14, -14, -16, -18 + sweatOsc * 2);
    ctx.fill();
    ctx.stroke();
    // Right drop
    ctx.beginPath();
    ctx.moveTo(16, -20 - sweatOsc * 2);
    ctx.quadraticCurveTo(20, -16, 17, -13);
    ctx.quadraticCurveTo(14, -16, 16, -20 - sweatOsc * 2);
    ctx.fill();
    ctx.stroke();
  } else if (state === 'cheering') {
    // Star eyes in pure joy!
    ctx.beginPath();
    ctx.arc(-8, -12, 7, 0, Math.PI * 2);
    ctx.arc(8, -12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', -8, -8);
    ctx.fillText('★', 8, -8);

    // Big happy dog mouth open with tongue
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(0, 4, 7, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    // Pink tongue
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(0, 7, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sparkles over Jake
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('✨', -18, -26 + Math.sin(tick * 0.2) * 3);
    ctx.fillText('⭐', 18, -26 - Math.sin(tick * 0.2) * 3);
  } else if (state === 'gasp') {
    // Shocked dizzy spiral eyes (defeated / life lost!)
    ctx.beginPath();
    ctx.arc(-8, -12, 8, 0, Math.PI * 2);
    ctx.arc(8, -12, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotating spiral eyes
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1.8;
    const spiralAngle = tick * 0.15;
    [-8, 8].forEach((eyeX) => {
      ctx.save();
      ctx.translate(eyeX, -12);
      ctx.rotate(spiralAngle);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.3) {
        const r = (a / (Math.PI * 3)) * 5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Wavy groaning mouth
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, 7);
    ctx.quadraticCurveTo(-3, 4, 0, 7);
    ctx.quadraticCurveTo(3, 10, 6, 7);
    ctx.stroke();

    // Floating broken heart / panic symbol over Jake
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('💔', -5, -28 + Math.sin(tick * 0.15) * 3);
  } else {
    // Relaxed happy Jake eyes
    ctx.beginPath();
    ctx.arc(-8, -12, 7, 0, Math.PI * 2);
    ctx.arc(8, -12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Big glossy pupils
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(-7, -12, 4, 0, Math.PI * 2);
    ctx.arc(9, -12, 4, 0, Math.PI * 2);
    ctx.fill();
    // Highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-9, -14, 1.8, 0, Math.PI * 2);
    ctx.arc(7, -14, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Friendly smirk
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 5, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  // Left arm (idle / holding hip / cheering)
  ctx.strokeStyle = '#18181b';
  ctx.fillStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  if (state === 'cheering') {
    // Both arms raised high in victory!
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.quadraticCurveTo(-24, -10, -20, -28);
    ctx.stroke();
    // Left paw
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-20, -28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Rest on side
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-14, 10);
    ctx.quadraticCurveTo(-22, 18, -14, 25);
    ctx.stroke();
  }

  // Right arm: JAKE'S MAGIC STRETCHING ARM!
  if (state === 'pulling' && dragPos) {
    // MAGICAL STRETCHY ARM extends all the way into slingshot pouch!
    const relDragX = dragPos.x - jx;
    const relDragY = dragPos.y - jy;

    ctx.save();
    // Yellow stretchy tube
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(12, 8);
    // Dynamic bend in the stretchy rubber arm
    const midX = (12 + relDragX) * 0.5 + Math.sin(tick * 0.2) * 5;
    const midY = (8 + relDragY) * 0.5 - 10;
    ctx.quadraticCurveTo(midX, midY, relDragX, relDragY);
    ctx.stroke();

    // Dark outline for cartoon definition
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Jake's stretchy hand gripping the pouch
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(relDragX, relDragY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Strain lines
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(relDragX - 8, relDragY - 6);
    ctx.lineTo(relDragX - 12, relDragY - 10);
    ctx.moveTo(relDragX - 6, relDragY + 8);
    ctx.lineTo(relDragX - 10, relDragY + 12);
    ctx.stroke();
    ctx.restore();
  } else if (state === 'cheering') {
    // Right arm high in the air
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.quadraticCurveTo(24, -10, 20, -28);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(20, -28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Right arm resting forward
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.quadraticCurveTo(22, 18, 14, 25);
    ctx.stroke();
  }

  ctx.restore();
}

// 11. ANIMATED PRINCESA GRUMOSA / LUMPY SPACE PRINCESS (LSP)
// Nube violeta flotante con estrella dorada centelleante, brazos dramáticos y bocadillos cómicos
export function drawAnimatedLumpyPrincess(
  ctx: CanvasRenderingContext2D,
  tick: number,
  targetPos: { x: number; y: number } | null,
  speechText: string,
  speechTimer: number
): void {
  ctx.save();

  const px = 205;
  // Anti-gravity floating hover cycle
  const hoverOffset = Math.sin(tick * 0.08) * 5;
  const py = 258 + hoverOffset;

  // Floating Shadow underneath LSP
  ctx.save();
  ctx.fillStyle = 'rgba(24, 10, 35, 0.35)';
  const shadowScale = 1 - hoverOffset * 0.04;
  ctx.beginPath();
  ctx.ellipse(px, 305, 24 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.translate(px, py);

  // Emotional state detection
  const isDramaticGasp = speechText.includes('VIDA') || speechText.includes('DRAMA') || speechText.includes('NOOO') || speechText.includes('drama');
  const isExcited = speechText.includes('45°') || speechText.includes('EXACTO') || speechText.includes('BULTOS') || speechText.includes('GANADORES');

  // Waving stubby arms in background/foreground
  const armSway = Math.sin(tick * 0.15) * 6;
  const dramaWiggle = Math.sin(tick * 0.35) * 8;

  ctx.fillStyle = '#d946ef';
  ctx.strokeStyle = '#3b0764';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  if (isDramaticGasp) {
    // Horrified drama pose: Hands covering cheeks/mouth in utter despair!
    ctx.beginPath();
    ctx.ellipse(-14, 2, 5, 8, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(14, 2, 5, 8, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (isExcited) {
    // Excited victory / cheer pose: Both arms raised high!
    ctx.beginPath();
    ctx.ellipse(-18, -12 + Math.sin(tick * 0.3) * 4, 5, 9, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(18, -12 - Math.sin(tick * 0.3) * 4, 5, 9, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Left stubby arm (flailing or on hip)
    ctx.beginPath();
    ctx.ellipse(-23, 10 + armSway * 0.5, 5, 9, 0.4 + armSway * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right stubby arm (dramatically gesturing: "Oh my glob!")
    ctx.beginPath();
    ctx.ellipse(23, 10 - dramaWiggle * 0.5, 5, 9, -0.4 - dramaWiggle * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // LSP Main Cloud Body (Lumps of Lumpy Space)
  ctx.fillStyle = '#e879f9';
  ctx.strokeStyle = '#3b0764';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  // Draw overlapping organic cloud bumps
  ctx.beginPath();
  // Bottom center
  ctx.arc(0, 16, 14, 0, Math.PI * 2);
  // Bottom left & right
  ctx.arc(-14, 12, 13, 0, Math.PI * 2);
  ctx.arc(14, 12, 13, 0, Math.PI * 2);
  // Mid left & right
  ctx.arc(-18, -2, 13, 0, Math.PI * 2);
  ctx.arc(18, -2, 13, 0, Math.PI * 2);
  // Top left, top center, top right
  ctx.arc(-12, -16, 12, 0, Math.PI * 2);
  ctx.arc(12, -16, 12, 0, Math.PI * 2);
  ctx.arc(0, -18, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner soft pastel glow highlights
  ctx.fillStyle = '#f0abfc';
  ctx.beginPath();
  ctx.arc(-3, -8, 16, 0, Math.PI * 2);
  ctx.fill();

  // Lumpy Space Star on Forehead (Iconic 5-pointed star with radiant pulse)
  ctx.save();
  const starPulse = 1 + Math.sin(tick * 0.15) * 0.18;
  ctx.translate(0, -18);
  ctx.scale(starPulse, starPulse);

  // Star glow halo
  ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // 5-pointed star polygon
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angleOuter = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const angleInner = angleOuter + Math.PI / 5;
    const rOuter = 6.5;
    const rInner = 3;
    if (i === 0) {
      ctx.moveTo(Math.cos(angleOuter) * rOuter, Math.sin(angleOuter) * rOuter);
    } else {
      ctx.lineTo(Math.cos(angleOuter) * rOuter, Math.sin(angleOuter) * rOuter);
    }
    ctx.lineTo(Math.cos(angleInner) * rInner, Math.sin(angleInner) * rInner);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Star center glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Expressive LSP Face: Eyes with dynamic pupil tracking!
  let pupilX = 0;
  let pupilY = 0;
  if (targetPos) {
    const angle = Math.atan2(targetPos.y - py, targetPos.x - px);
    pupilX = Math.cos(angle) * 2.5;
    pupilY = Math.sin(angle) * 2;
  }

  // Oval cartoon eyes with attitude
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(-7 + pupilX, -3 + pupilY, 2.2, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(7 + pupilX, -3 + pupilY, 2.2, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Catchlight sparkle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-8 + pupilX, -4 + pupilY, 1, 0, Math.PI * 2);
  ctx.arc(6 + pupilX, -4 + pupilY, 1, 0, Math.PI * 2);
  ctx.fill();

  // Sassy LSP Mouth
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (speechTimer > 0) {
    // Talking mouth animation: opens and closes!
    const isOpen = Math.sin(tick * 0.35) > 0;
    if (isOpen) {
      ctx.fillStyle = '#831843';
      ctx.ellipse(0, 7, 3.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Little tooth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, 3.5, 3, 2);
    } else {
      ctx.moveTo(-4, 7);
      ctx.quadraticCurveTo(0, 9, 4, 7);
      ctx.stroke();
    }
  } else {
    // Default sassy smirk
    ctx.moveTo(-4, 6);
    ctx.quadraticCurveTo(0, 8, 4, 6);
    ctx.stroke();
  }

  // Floating purple star particles around LSP
  const pPhase1 = tick * 0.08;
  const sx1 = Math.cos(pPhase1) * 28;
  const sy1 = -10 + Math.sin(pPhase1 * 1.5) * 8;
  ctx.fillStyle = '#e879f9';
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('✧', sx1, sy1);

  const pPhase2 = tick * 0.08 + Math.PI;
  const sx2 = Math.cos(pPhase2) * 26;
  const sy2 = 6 + Math.sin(pPhase2 * 1.3) * 6;
  ctx.fillStyle = '#fef08a';
  ctx.fillText('✦', sx2, sy2);

  // Drama crying tears when life is lost / game failed
  if (isDramaticGasp) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-8, 8 + Math.sin(tick * 0.4) * 3, 2.5, 0, Math.PI * 2);
    ctx.arc(8, 8 - Math.sin(tick * 0.4) * 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('💔', -7, -32 + Math.sin(tick * 0.2) * 3);
  }

  // Dynamic Comic Speech Bubble over Princesa Grumosa!
  if (speechTimer > 0 && speechText) {
    ctx.save();
    const bubbleX = 12;
    const bubbleY = -58;
    ctx.font = 'bold 10px sans-serif';
    const textWidth = ctx.measureText(speechText).width;
    const pad = 10;
    const bw = Math.max(textWidth + pad * 2, 85);
    const bh = 28;

    // Bubble shadow
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(bubbleX - bw / 2 + 3, bubbleY - bh / 2 + 3, bw, bh, 10);
    ctx.fill();

    // Bubble body with sweet lavender/pink gradient or clean white
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c026d3';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bubbleX - bw / 2, bubbleY - bh / 2, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // Pointer tail to LSP
    ctx.beginPath();
    ctx.moveTo(bubbleX - 6, bubbleY + bh / 2);
    ctx.lineTo(bubbleX, bubbleY + bh / 2 + 9);
    ctx.lineTo(bubbleX + 6, bubbleY + bh / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Speech text
    ctx.fillStyle = '#581c87';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(speechText, bubbleX, bubbleY);
    ctx.restore();
  }

  ctx.restore();
}

