import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'blue' | 'yellow' | 'red' | 'green';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'blue',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const bgGradients = {
    blue: 'bg-gradient-to-r from-[#4B5D44] to-[#607A56]',
    yellow: 'bg-gradient-to-r from-[#BC8A5F] to-[#D4A373]',
    red: 'bg-gradient-to-r from-[#A64B3B] to-[#C46857]',
    green: 'bg-gradient-to-r from-[#587550] to-[#769A6C]',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#5C6B57]">
          <span>Tiến độ</span>
          <span className="text-[#2D332A] font-extrabold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#EFE7DA] rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} rounded-full transition-all duration-500 ease-out ${bgGradients[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
