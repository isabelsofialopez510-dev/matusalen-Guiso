import React, { useRef, useState } from 'react';
import { CharacterType, PixelGumball, PixelDarwin, PixelAnais, PixelCharacterHead } from './PixelCharacters';
import { sfx } from '../utils/audioEffects';

interface PixelSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  character?: CharacterType;
  description?: string;
  highlightFormula?: string;
  id?: string;
  className?: string;
  presetTags?: { label: string; value: number }[];
}

export const PixelSlider: React.FC<PixelSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = '',
  onChange,
  character = 'gumball',
  description,
  highlightFormula,
  id,
  className = '',
  presetTags,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Character-specific color schemes
  const styles = {
    gumball: {
      accent: '#00E5FF',
      accentLight: '#7DD3FC',
      accentDark: '#0284C7',
      bgGlow: 'rgba(0, 229, 255, 0.35)',
      trackBg: 'linear-gradient(90deg, #0284C7 0%, #00E5FF 100%)',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
      labelColor: 'text-cyan-300',
      buttonBg: 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border-cyan-400',
      thumbGlow: 'shadow-[0_0_12px_#00e5ff]',
      name: 'Gumball',
    },
    darwin: {
      accent: '#FF7700',
      accentLight: '#FDBA74',
      accentDark: '#EA580C',
      bgGlow: 'rgba(255, 119, 0, 0.35)',
      trackBg: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-400',
      labelColor: 'text-orange-300',
      buttonBg: 'bg-orange-500/20 hover:bg-orange-500/40 text-orange-200 border-orange-400',
      thumbGlow: 'shadow-[0_0_12px_#ff7700]',
      name: 'Darwin',
    },
    anais: {
      accent: '#FF4DB8',
      accentLight: '#FBCFE8',
      accentDark: '#DB2777',
      bgGlow: 'rgba(255, 77, 184, 0.35)',
      trackBg: 'linear-gradient(90deg, #DB2777 0%, #F472B6 100%)',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-400',
      labelColor: 'text-pink-300',
      buttonBg: 'bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border-pink-400',
      thumbGlow: 'shadow-[0_0_12px_#ff4db8]',
      name: 'Anais',
    },
    penny: {
      accent: '#10B981',
      accentLight: '#A7F3D0',
      accentDark: '#047857',
      bgGlow: 'rgba(16, 185, 129, 0.35)',
      trackBg: 'linear-gradient(90deg, #047857 0%, #34D399 100%)',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
      labelColor: 'text-emerald-300',
      buttonBg: 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 border-emerald-400',
      thumbGlow: 'shadow-[0_0_12px_#10b981]',
      name: 'Penny',
    },
  }[character];

  // Percentage for track progress
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleStep = (direction: 'up' | 'down') => {
    sfx.playPop(direction === 'up' ? 680 : 520);
    const multiplier = step >= 1 ? step : step * 5 || 0.05;
    const newVal = direction === 'up' ? Math.min(max, value + multiplier) : Math.max(min, value - multiplier);
    onChange(Number(newVal.toFixed(3)));
  };

  return (
    <div
      id={id}
      className={`relative p-3.5 rounded-xl border-2 transition-all duration-300 group ${
        character === 'gumball'
          ? 'bg-[#051524]/90 border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
          : character === 'darwin'
            ? 'bg-[#1c0f05]/90 border-orange-500/50 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]'
            : character === 'anais'
              ? 'bg-[#1e0a17]/90 border-pink-500/50 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(244,114,182,0.3)]'
              : 'bg-[#041c14]/90 border-emerald-500/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header: Character Avatar + Label + Value Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Character Mini Avatar with bounce animation */}
          <div className="relative">
            <PixelCharacterHead character={character} size={24} className={isHovered || isDragging ? 'scale-110' : ''} />
          </div>

          <div className="flex flex-col">
            <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${styles.labelColor}`}>
              {label}
            </span>
            {highlightFormula && (
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {highlightFormula}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Value Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg border shadow-sm transition-all duration-200 ${styles.badgeBg} ${
              isDragging ? 'scale-110 shadow-[0_0_15px_' + styles.accent + ']' : ''
            }`}
          >
            {value.toFixed(step < 0.01 ? 3 : step < 1 ? 2 : 1)} {unit}
          </span>
        </div>
      </div>

      {description && (
        <p className="text-[10px] font-mono text-slate-400 mb-2 leading-tight">
          {description}
        </p>
      )}

      {/* Slider Track with Custom Pixel Handle */}
      <div className="relative py-2 flex items-center">
        {/* Step Down Button */}
        <button
          type="button"
          onClick={() => handleStep('down')}
          className={`w-6 h-6 rounded-md border flex items-center justify-center font-black text-xs font-mono select-none transition-all active:scale-90 cursor-pointer mr-2 ${styles.buttonBg}`}
          title="Disminuir valor"
        >
          -
        </button>

        {/* Range Container */}
        <div className="relative flex-1 flex items-center h-8">
          {/* Base Track Background */}
          <div className="absolute inset-x-0 h-3.5 bg-slate-900/90 rounded-full border border-slate-700 overflow-hidden shadow-inner">
            {/* Active Colored Progress Fill */}
            <div
              className="h-full rounded-full transition-all duration-75 relative overflow-hidden"
              style={{
                width: `${percentage}%`,
                background: styles.trackBg,
              }}
            >
              {/* Shimmer Light Stripe */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Riding Character Head on the Track Thumb! */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 z-10"
            style={{
              left: `calc(${percentage}% - 14px)`,
            }}
          >
            <div className={`p-1 bg-[#141414] border-2 rounded-full transform transition-transform ${
              character === 'gumball'
                ? 'border-cyan-300 shadow-[0_0_12px_#00E5FF]'
                : character === 'darwin'
                  ? 'border-orange-300 shadow-[0_0_12px_#FF7700]'
                  : 'border-pink-300 shadow-[0_0_12px_#FF4DB8]'
            } ${isDragging ? 'scale-125 rotate-6' : isHovered ? 'scale-110' : 'scale-100'}`}>
              <PixelCharacterHead character={character} size={20} />
            </div>
          </div>

          {/* Actual Native Input for high performance and accessibility */}
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              onChange(parseFloat(e.target.value));
            }}
            onMouseDown={() => {
              setIsDragging(true);
              sfx.playPop();
            }}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => {
              setIsDragging(true);
              sfx.playPop();
            }}
            onTouchEnd={() => setIsDragging(false)}
            className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer z-20"
          />
        </div>

        {/* Step Up Button */}
        <button
          type="button"
          onClick={() => handleStep('up')}
          className={`w-6 h-6 rounded-md border flex items-center justify-center font-black text-xs font-mono select-none transition-all active:scale-90 cursor-pointer ml-2 ${styles.buttonBg}`}
          title="Aumentar valor"
        >
          +
        </button>
      </div>

      {/* Footer: Min, Max & Presets */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
        <span className="font-semibold">{min} {unit}</span>

        {/* Preset quick buttons if available */}
        {presetTags && presetTags.length > 0 && (
          <div className="flex items-center gap-1">
            {presetTags.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sfx.playPop(750);
                  onChange(p.value);
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                  Math.abs(value - p.value) < (step || 0.01)
                    ? styles.badgeBg + ' font-black scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <span className="font-semibold">{max} {unit}</span>
      </div>
    </div>
  );
};
