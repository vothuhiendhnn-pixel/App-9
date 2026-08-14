import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioService } from '../services/audioService';

interface AudioButtonProps {
  text: string;
  rate?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  rate = 0.9,
  size = 'md',
  label,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    audioService.speak(text, rate, () => {
      setIsPlaying(false);
    });
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handlePlay}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-all ${
        isPlaying
          ? 'bg-[#F7EFE6] text-[#8E5D32] ring-2 ring-[#BC8A5F]/40 border border-[#E5D2C0] scale-95 shadow-inner'
          : 'bg-[#E8EFE6] text-[#384732] hover:bg-[#D5E4D1] border border-[#C6D8C2] shadow-xs'
      } ${sizeClasses[size]} ${className}`}
      title={`Nghe phát âm: "${text}"`}
      type="button"
    >
      <Volume2 className={`${iconSizes[size]} ${isPlaying ? 'animate-bounce' : ''}`} />
      {label && <span>{isPlaying ? 'Đang phát...' : label}</span>}
    </button>
  );
};
