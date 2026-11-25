import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  showLabel = false,
}) => {
  const p = Math.max(0, Math.min(100, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[height];

  // Restrained professional palette: Emerald for completed, Brand navy for in-progress, Amber for early/behind
  let barColor = 'bg-brand-700';
  if (p >= 100) barColor = 'bg-emerald-600';
  else if (p < 30) barColor = 'bg-amber-600';

  return (
    <div className="w-full flex items-center gap-2">
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`${heightClasses} ${barColor} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${p}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-slate-700 min-w-[32px] text-right shrink-0">
          {p}%
        </span>
      )}
    </div>
  );
};
