import React from 'react';
import { useFinance } from '../../context/FinanceContext';

interface BcvAmountDisplayProps {
  amount: number; // In base USD currency
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  colorClass?: string;
  showEquivalents?: boolean;
  layout?: 'stacked' | 'inline' | 'subtle';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const BcvAmountDisplay: React.FC<BcvAmountDisplayProps> = ({
  amount,
  size = 'md',
  colorClass = 'text-slate-950',
  showEquivalents = true,
  layout = 'stacked',
  align = 'left',
  className = '',
}) => {
  const { isBcvModeEnabled, getBreakdown, formatCurrency } = useFinance();

  if (!isBcvModeEnabled) {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base font-bold',
      lg: 'text-lg font-bold',
      xl: 'text-xl font-extrabold',
      '2xl': 'text-2xl font-black',
      '3xl': 'text-3xl sm:text-4xl font-black',
    };

    return (
      <span className={`font-mono tabular-nums ${sizeClasses[size]} ${colorClass} ${className}`}>
        {formatCurrency(amount)}
      </span>
    );
  }

  const breakdown = getBreakdown(amount);

  const mainSizeClasses = {
    xs: 'text-xs font-bold',
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-lg font-black',
    xl: 'text-xl font-black',
    '2xl': 'text-2xl font-black',
    '3xl': 'text-3xl sm:text-4xl font-black',
  };

  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  if (!showEquivalents) {
    return (
      <span className={`font-mono tabular-nums ${mainSizeClasses[size]} ${colorClass} ${className}`}>
        {breakdown.primaryFormatted}
      </span>
    );
  }

  if (layout === 'inline') {
    return (
      <div className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
        <span className={`font-mono tabular-nums ${mainSizeClasses[size]} ${colorClass}`}>
          {breakdown.primaryFormatted}
        </span>
        <span className="text-[11px] font-bold font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-2xs">
          {breakdown.compactSummary}
        </span>
      </div>
    );
  }

  if (layout === 'subtle') {
    return (
      <div className={`flex flex-col ${alignClasses[align]} ${className}`}>
        <span className={`font-mono tabular-nums ${mainSizeClasses[size]} ${colorClass}`}>
          {breakdown.primaryFormatted}
        </span>
        <span className="text-[10px] font-semibold font-mono text-slate-600 mt-0.5">
          {breakdown.counterpartFormatted} • {breakdown.vesFormatted}
        </span>
      </div>
    );
  }

  // Default 'stacked' layout: Primary bold number on top, counterparts in pure white pills without yellow background
  return (
    <div className={`flex flex-col ${alignClasses[align]} ${className}`}>
      <span className={`font-mono tabular-nums ${mainSizeClasses[size]} ${colorClass} leading-tight`}>
        {breakdown.primaryFormatted}
      </span>
      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] sm:text-[11px] font-bold font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
          ≈ {breakdown.counterpartFormatted}
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold font-mono text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
          {breakdown.vesFormatted}
        </span>
      </div>
    </div>
  );
};
