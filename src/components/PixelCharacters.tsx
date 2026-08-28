import React from 'react';

export type CharacterType = 'gumball' | 'darwin' | 'anais' | 'penny';

interface PixelCharacterProps {
  size?: number; // width in pixels
  animate?: boolean;
  className?: string;
  mood?: 'happy' | 'thinking' | 'excited' | 'speed';
}

/**
 * High-definition crisp pixel-art SVGs inspired directly by the reference image of
 * Gumball (Cyan), Darwin (Orange), and Anais (Pink) from El Increíble Mundo de Gumball.
 */

export const PixelGumball: React.FC<PixelCharacterProps> = ({
  size = 40,
  animate = true,
  className = '',
  mood = 'happy'
}) => {
  return (
    <svg
      viewBox="0 0 24 32"
      width={size}
      height={(size * 32) / 24}
      className={`select-none inline-block ${animate ? 'transition-transform duration-200 hover:scale-110 active:scale-95' : ''} ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {/* Outer Glow / Drop shadow if animated */}
      <defs>
        <filter id="gumballGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#00E5FF" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter={animate ? 'url(#gumballGlow)' : undefined}>
        {/* BLACK OUTLINE / BORDER PIXELS */}
        {/* Left Ear */}
        <rect x="2" y="2" width="6" height="6" fill="#141414" />
        {/* Right Ear */}
        <rect x="15" y="0" width="6" height="6" fill="#141414" />
        {/* Head Outline */}
        <rect x="1" y="4" width="21" height="15" fill="#141414" rx="1" />

        {/* CYAN HEAD FILL */}
        <rect x="3" y="3" width="4" height="4" fill="#38BDF8" />
        <rect x="16" y="1" width="4" height="4" fill="#38BDF8" />
        <rect x="2" y="5" width="19" height="13" fill="#38BDF8" />
        {/* Lighter Cyan Highlight */}
        <rect x="3" y="5" width="2" height="10" fill="#7DD3FC" />
        <rect x="4" y="5" width="15" height="2" fill="#7DD3FC" />

        {/* EYEBROWS */}
        <rect x="5" y="7" width="3" height="1" fill="#0F172A" />
        <rect x="15" y="7" width="3" height="1" fill="#0F172A" />

        {/* EYES */}
        {/* Left Eye */}
        <rect x="4" y="9" width="5" height="5" fill="#0F172A" />
        <rect x="5" y="10" width="2" height="2" fill="#FFFFFF" />
        {/* Right Eye */}
        <rect x="14" y="9" width="5" height="5" fill="#0F172A" />
        <rect x="15" y="10" width="2" height="2" fill="#FFFFFF" />

        {/* NOSE & CHEEKS / SNOUT */}
        <rect x="9" y="12" width="5" height="4" fill="#FFFFFF" />
        <rect x="10" y="12" width="3" height="2" fill="#D97706" />
        {/* Mouth */}
        {mood === 'excited' ? (
          <rect x="10" y="14" width="3" height="2" fill="#EF4444" />
        ) : (
          <rect x="10" y="14" width="3" height="1" fill="#0F172A" />
        )}

        {/* BODY (Tan Sweater) */}
        <rect x="8" y="18" width="7" height="6" fill="#141414" />
        <rect x="9" y="18" width="5" height="5" fill="#D4B996" />
        <rect x="10" y="18" width="3" height="4" fill="#EADBC8" />

        {/* ARMS / HANDS (Cyan) */}
        <rect x="6" y="19" width="2" height="4" fill="#38BDF8" />
        <rect x="15" y="19" width="2" height="4" fill="#38BDF8" />
        <rect x="5" y="21" width="1" height="3" fill="#141414" />
        <rect x="17" y="21" width="1" height="3" fill="#141414" />

        {/* SHORTS (Navy Blue) */}
        <rect x="8" y="23" width="7" height="4" fill="#141414" />
        <rect x="9" y="23" width="5" height="3" fill="#1E293B" />

        {/* LEGS & SHOES (Cyan & Black Soles) */}
        {/* Left Foot */}
        <rect x="6" y="26" width="3" height="4" fill="#141414" />
        <rect x="7" y="26" width="2" height="3" fill="#38BDF8" />
        <rect x="5" y="29" width="4" height="2" fill="#141414" />
        <rect x="6" y="29" width="2" height="1" fill="#7DD3FC" />

        {/* Right Foot */}
        <rect x="14" y="26" width="3" height="4" fill="#141414" />
        <rect x="14" y="26" width="2" height="3" fill="#38BDF8" />
        <rect x="14" y="29" width="4" height="2" fill="#141414" />
        <rect x="15" y="29" width="2" height="1" fill="#7DD3FC" />
      </g>
    </svg>
  );
};

export const PixelDarwin: React.FC<PixelCharacterProps> = ({
  size = 40,
  animate = true,
  className = '',
  mood = 'happy'
}) => {
  return (
    <svg
      viewBox="0 0 26 32"
      width={size}
      height={(size * 32) / 26}
      className={`select-none inline-block ${animate ? 'transition-transform duration-200 hover:scale-110 active:scale-95' : ''} ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      <defs>
        <filter id="darwinGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#FF7700" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter={animate ? 'url(#darwinGlow)' : undefined}>
        {/* BLACK OUTLINES */}
        {/* Fin / Tail on Right */}
        <rect x="19" y="8" width="5" height="6" fill="#141414" />
        {/* Main Body / Head */}
        <rect x="2" y="1" width="19" height="18" fill="#141414" rx="1" />

        {/* ORANGE FILL */}
        <rect x="20" y="9" width="3" height="4" fill="#EA580C" />
        <rect x="3" y="2" width="17" height="16" fill="#FB923C" />
        {/* Lighter Orange Highlight */}
        <rect x="4" y="3" width="15" height="2" fill="#FDBA74" />
        <rect x="4" y="4" width="2" height="11" fill="#FDBA74" />

        {/* EYEBROWS */}
        <rect x="5" y="4" width="3" height="1" fill="#0F172A" />
        <rect x="13" y="4" width="3" height="1" fill="#0F172A" />

        {/* EYES */}
        {/* Left Eye */}
        <rect x="4" y="6" width="5" height="6" fill="#0F172A" />
        <rect x="5" y="7" width="2" height="2" fill="#FFFFFF" />
        {/* Right Eye */}
        <rect x="12" y="6" width="5" height="6" fill="#0F172A" />
        <rect x="13" y="7" width="2" height="2" fill="#FFFFFF" />

        {/* SMILE / CHEEKS */}
        <rect x="9" y="13" width="3" height="2" fill="#EA580C" />
        {mood === 'excited' ? (
          <rect x="9" y="14" width="3" height="2" fill="#EF4444" />
        ) : (
          <rect x="8" y="14" width="5" height="1" fill="#0F172A" />
        )}

        {/* LEGS (Black Skinny Legs) */}
        <rect x="6" y="19" width="3" height="7" fill="#141414" />
        <rect x="7" y="19" width="1" height="6" fill="#FB923C" />
        
        <rect x="13" y="19" width="3" height="7" fill="#141414" />
        <rect x="14" y="19" width="1" height="6" fill="#FB923C" />

        {/* GREEN SNEAKERS WITH WHITE SOLES */}
        {/* Left Shoe */}
        <rect x="4" y="24" width="7" height="6" fill="#141414" />
        <rect x="5" y="25" width="5" height="3" fill="#4ADE80" />
        <rect x="6" y="25" width="2" height="1" fill="#86EFAC" />
        <rect x="4" y="28" width="7" height="2" fill="#FFFFFF" />
        <rect x="4" y="29" width="7" height="1" fill="#141414" />

        {/* Right Shoe */}
        <rect x="12" y="24" width="7" height="6" fill="#141414" />
        <rect x="13" y="25" width="5" height="3" fill="#4ADE80" />
        <rect x="14" y="25" width="2" height="1" fill="#86EFAC" />
        <rect x="12" y="28" width="7" height="2" fill="#FFFFFF" />
        <rect x="12" y="29" width="7" height="1" fill="#141414" />
      </g>
    </svg>
  );
};

export const PixelAnais: React.FC<PixelCharacterProps> = ({
  size = 40,
  animate = true,
  className = '',
  mood = 'happy'
}) => {
  return (
    <svg
      viewBox="0 0 24 34"
      width={size}
      height={(size * 34) / 24}
      className={`select-none inline-block ${animate ? 'transition-transform duration-200 hover:scale-110 active:scale-95' : ''} ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      <defs>
        <filter id="anaisGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#F472B6" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter={animate ? 'url(#anaisGlow)' : undefined}>
        {/* PINK EARS */}
        {/* Left Ear */}
        <rect x="3" y="1" width="6" height="9" fill="#141414" />
        <rect x="4" y="2" width="4" height="7" fill="#F472B6" />
        <rect x="5" y="3" width="2" height="5" fill="#FBCFE8" />

        {/* Right Ear */}
        <rect x="13" y="1" width="6" height="9" fill="#141414" />
        <rect x="14" y="2" width="4" height="7" fill="#F472B6" />
        <rect x="15" y="3" width="2" height="5" fill="#FBCFE8" />

        {/* PINK HEAD OUTLINE & FILL */}
        <rect x="2" y="8" width="19" height="14" fill="#141414" rx="1" />
        <rect x="3" y="9" width="17" height="12" fill="#F472B6" />
        {/* Head Highlights */}
        <rect x="4" y="10" width="15" height="2" fill="#FBCFE8" />
        <rect x="4" y="11" width="2" height="8" fill="#FBCFE8" />

        {/* EYEBROW */}
        <rect x="13" y="10" width="2" height="1" fill="#0F172A" />

        {/* EYES */}
        {/* Left Eye */}
        <rect x="4" y="12" width="5" height="5" fill="#0F172A" />
        <rect x="5" y="13" width="2" height="2" fill="#FFFFFF" />
        {/* Right Eye */}
        <rect x="13" y="12" width="5" height="5" fill="#0F172A" />
        <rect x="14" y="13" width="2" height="2" fill="#FFFFFF" />

        {/* WHITE SNOUT & PINK NOSE */}
        <rect x="9" y="14" width="4" height="4" fill="#FFFFFF" />
        <rect x="10" y="14" width="2" height="2" fill="#DB2777" />
        {/* Mouth */}
        {mood === 'excited' ? (
          <rect x="10" y="16" width="2" height="2" fill="#EF4444" />
        ) : (
          <rect x="10" y="16" width="2" height="1" fill="#0F172A" />
        )}

        {/* ORANGE DRESS */}
        <rect x="6" y="22" width="11" height="6" fill="#141414" />
        <rect x="7" y="23" width="9" height="4" fill="#FB923C" />
        <rect x="8" y="23" width="7" height="2" fill="#FDBA74" />
        {/* White Collar */}
        <rect x="9" y="22" width="5" height="1" fill="#FFFFFF" />

        {/* FEET / WHITE SHOES */}
        {/* Left Shoe */}
        <rect x="7" y="28" width="4" height="4" fill="#141414" />
        <rect x="8" y="28" width="2" height="3" fill="#FFFFFF" />
        {/* Right Shoe */}
        <rect x="12" y="28" width="4" height="4" fill="#141414" />
        <rect x="13" y="28" width="2" height="3" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export const PixelPenny: React.FC<PixelCharacterProps> = ({
  size = 40,
  animate = true,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 24 32"
      width={size}
      height={(size * 32) / 24}
      className={`select-none inline-block ${animate ? 'transition-transform duration-200 hover:scale-110 active:scale-95' : ''} ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      <defs>
        <filter id="pennyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#34D399" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter={animate ? 'url(#pennyGlow)' : undefined}>
        {/* Antlers */}
        <rect x="3" y="1" width="3" height="6" fill="#141414" />
        <rect x="4" y="2" width="2" height="4" fill="#10B981" />
        <rect x="18" y="1" width="3" height="6" fill="#141414" />
        <rect x="18" y="2" width="2" height="4" fill="#10B981" />

        {/* Head */}
        <rect x="2" y="6" width="20" height="15" fill="#141414" rx="2" />
        <rect x="3" y="7" width="18" height="13" fill="#34D399" />
        <rect x="4" y="8" width="16" height="2" fill="#A7F3D0" />

        {/* Eyes */}
        <rect x="5" y="11" width="4" height="4" fill="#064E3B" />
        <rect x="6" y="12" width="2" height="2" fill="#FFFFFF" />
        <rect x="15" y="11" width="4" height="4" fill="#064E3B" />
        <rect x="16" y="12" width="2" height="2" fill="#FFFFFF" />

        {/* Smile */}
        <rect x="10" y="16" width="4" height="2" fill="#064E3B" />

        {/* Body (Green Fairy Dress) */}
        <rect x="5" y="22" width="14" height="6" fill="#141414" />
        <rect x="6" y="23" width="12" height="4" fill="#059669" />
        <rect x="7" y="23" width="10" height="2" fill="#34D399" />

        {/* Feet */}
        <rect x="7" y="28" width="4" height="3" fill="#141414" />
        <rect x="8" y="28" width="2" height="2" fill="#A7F3D0" />
        <rect x="13" y="28" width="4" height="3" fill="#141414" />
        <rect x="14" y="28" width="2" height="2" fill="#A7F3D0" />
      </g>
    </svg>
  );
};

export const PixelCharacterHead: React.FC<{
  character: CharacterType;
  size?: number;
  className?: string;
}> = ({ character, size = 26, className = '' }) => {
  if (character === 'gumball') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 24 20"
          width={size}
          height={(size * 20) / 24}
          style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
        >
          {/* Gumball Head only for compact slider thumb */}
          <rect x="2" y="2" width="5" height="5" fill="#141414" />
          <rect x="15" y="0" width="5" height="5" fill="#141414" />
          <rect x="1" y="4" width="20" height="14" fill="#141414" />
          <rect x="3" y="3" width="3" height="3" fill="#38BDF8" />
          <rect x="16" y="1" width="3" height="3" fill="#38BDF8" />
          <rect x="2" y="5" width="18" height="12" fill="#38BDF8" />
          <rect x="3" y="5" width="15" height="2" fill="#7DD3FC" />
          <rect x="5" y="6" width="3" height="1" fill="#0F172A" />
          <rect x="14" y="6" width="3" height="1" fill="#0F172A" />
          <rect x="4" y="8" width="4" height="4" fill="#0F172A" />
          <rect x="5" y="9" width="2" height="2" fill="#FFFFFF" />
          <rect x="14" y="8" width="4" height="4" fill="#0F172A" />
          <rect x="15" y="9" width="2" height="2" fill="#FFFFFF" />
          <rect x="9" y="11" width="4" height="3" fill="#FFFFFF" />
          <rect x="10" y="11" width="2" height="2" fill="#D97706" />
        </svg>
      </div>
    );
  }

  if (character === 'darwin') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 24 20"
          width={size}
          height={(size * 20) / 24}
          style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
        >
          {/* Darwin Head only */}
          <rect x="17" y="6" width="5" height="5" fill="#141414" />
          <rect x="2" y="2" width="17" height="15" fill="#141414" />
          <rect x="18" y="7" width="3" height="3" fill="#EA580C" />
          <rect x="3" y="3" width="15" height="13" fill="#FB923C" />
          <rect x="4" y="4" width="13" height="2" fill="#FDBA74" />
          <rect x="5" y="5" width="3" height="1" fill="#0F172A" />
          <rect x="12" y="5" width="3" height="1" fill="#0F172A" />
          <rect x="4" y="7" width="4" height="5" fill="#0F172A" />
          <rect x="5" y="8" width="2" height="2" fill="#FFFFFF" />
          <rect x="12" y="7" width="4" height="5" fill="#0F172A" />
          <rect x="13" y="8" width="2" height="2" fill="#FFFFFF" />
          <rect x="8" y="13" width="4" height="1" fill="#0F172A" />
        </svg>
      </div>
    );
  }

  if (character === 'anais') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 22 24"
          width={size}
          height={(size * 24) / 22}
          style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
        >
          {/* Anais Ears + Head */}
          <rect x="2" y="1" width="5" height="7" fill="#141414" />
          <rect x="3" y="2" width="3" height="5" fill="#F472B6" />
          <rect x="13" y="1" width="5" height="7" fill="#141414" />
          <rect x="14" y="2" width="3" height="5" fill="#F472B6" />
          <rect x="2" y="7" width="17" height="13" fill="#141414" />
          <rect x="3" y="8" width="15" height="11" fill="#F472B6" />
          <rect x="4" y="9" width="13" height="2" fill="#FBCFE8" />
          <rect x="12" y="9" width="2" height="1" fill="#0F172A" />
          <rect x="4" y="11" width="4" height="4" fill="#0F172A" />
          <rect x="5" y="12" width="2" height="2" fill="#FFFFFF" />
          <rect x="12" y="11" width="4" height="4" fill="#0F172A" />
          <rect x="13" y="12" width="2" height="2" fill="#FFFFFF" />
          <rect x="8" y="13" width="4" height="3" fill="#FFFFFF" />
          <rect x="9" y="13" width="2" height="2" fill="#DB2777" />
        </svg>
      </div>
    );
  }

  // Penny Head (Green / Fairy Antlers)
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      >
        {/* Antlers */}
        <rect x="2" y="1" width="3" height="6" fill="#141414" />
        <rect x="3" y="2" width="2" height="4" fill="#10B981" />
        <rect x="19" y="1" width="3" height="6" fill="#141414" />
        <rect x="19" y="2" width="2" height="4" fill="#10B981" />
        {/* Head */}
        <rect x="3" y="6" width="18" height="14" fill="#141414" rx="2" />
        <rect x="4" y="7" width="16" height="12" fill="#34D399" />
        <rect x="5" y="8" width="14" height="2" fill="#A7F3D0" />
        {/* Eyes */}
        <rect x="6" y="11" width="4" height="4" fill="#064E3B" />
        <rect x="7" y="12" width="2" height="2" fill="#FFFFFF" />
        <rect x="14" y="11" width="4" height="4" fill="#064E3B" />
        <rect x="15" y="12" width="2" height="2" fill="#FFFFFF" />
        {/* Smile */}
        <rect x="10" y="15" width="4" height="2" fill="#064E3B" />
      </svg>
    </div>
  );
};

export const PixelTrioBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-4 p-3 bg-[#0a0f1d] border-2 border-cyan-400 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center group cursor-pointer">
          <PixelGumball size={38} className="animate-bounce" />
          <span className="text-[9px] font-black uppercase text-cyan-300 font-mono tracking-wider">Gumball</span>
        </div>
        <div className="flex flex-col items-center group cursor-pointer">
          <PixelDarwin size={40} className="animate-pulse" />
          <span className="text-[9px] font-black uppercase text-orange-400 font-mono tracking-wider">Darwin</span>
        </div>
        <div className="flex flex-col items-center group cursor-pointer">
          <PixelAnais size={36} className="animate-bounce" style={{ animationDelay: '0.2s' }} />
          <span className="text-[9px] font-black uppercase text-pink-400 font-mono tracking-wider">Anais</span>
        </div>
      </div>
    </div>
  );
};
