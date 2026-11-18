import React from 'react';

interface FinovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'compact';
  theme?: 'dark' | 'light' | 'gold';
  className?: string;
}

export const FinovaLogo: React.FC<FinovaLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'dark',
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subtextSize = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Finova Emblem */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0E1A] p-1.5 shadow-md border border-amber-400/30 flex items-center justify-center shrink-0 relative overflow-hidden group`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle grid background */}
          <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.4" />

          {/* Golden 'F' Vertical Spine */}
          <rect x="28" y="24" width="13" height="52" rx="3" fill="url(#logoGoldGrad)" />

          {/* Top Bar with dynamic Chevron */}
          <path d="M41 24 H74 C76 24 78 26 77 28 L72 37 C71 39 69 40 67 40 H41 V24 Z" fill="url(#logoGoldGrad)" />

          {/* Middle Bar */}
          <path d="M41 46 H62 C64 46 65 48 64 50 L60 57 C59 58 58 59 56 59 H41 V46 Z" fill="url(#logoGoldGrad)" />

          {/* Nova Star Sparkle Node */}
          <path d="M78 48 L83 41 L88 48 L83 55 Z" fill="#34D399" />
          <circle cx="83" cy="27" r="3.5" fill="#FFCF00" />

          <defs>
            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF275" />
              <stop offset="45%" stopColor="#FFCF00" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-amber-400/10 rounded-xl pointer-events-none" />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-brand ${textSize} ${
                theme === 'light'
                  ? 'text-white'
                  : 'text-slate-950'
              }`}
            >
              FINO
            </span>
          </div>
          {variant === 'full' && (
            <span
              className={`font-semibold tracking-wide ${subtextSize} ${
                theme === 'light' ? 'text-amber-200/90' : 'text-slate-600'
              }`}
            >
              Finanzas & Negocios
            </span>
          )}
        </div>
      )}
    </div>
  );
};
