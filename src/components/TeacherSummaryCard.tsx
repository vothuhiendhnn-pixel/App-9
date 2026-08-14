import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TeacherSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'yellow' | 'red' | 'green';
}

export const TeacherSummaryCard: React.FC<TeacherSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-[#E8EFE6]',
      border: 'border-[#C6D8C2]',
      iconBg: 'bg-[#4B5D44]',
      text: 'text-[#384732]',
    },
    yellow: {
      bg: 'bg-[#FAF2E4]',
      border: 'border-[#F0DEBA]',
      iconBg: 'bg-[#BC8A5F]',
      text: 'text-[#875514]',
    },
    red: {
      bg: 'bg-[#F9EBE9]',
      border: 'border-[#ECC7C3]',
      iconBg: 'bg-[#A64B3B]',
      text: 'text-[#88372A]',
    },
    green: {
      bg: 'bg-[#EAF0E8]',
      border: 'border-[#CAD8C6]',
      iconBg: 'bg-[#587550]',
      text: 'text-[#384732]',
    },
  };

  const current = colorStyles[color];

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${current.bg} ${current.border} shadow-xs space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#5C6B57]">{title}</span>
        <div className={`w-8 h-8 rounded-xl ${current.iconBg} text-white flex items-center justify-center shadow-xs`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-[#2D332A] tracking-tight font-serif">
          {value}
        </span>
        {subtitle && <span className="text-xs font-medium text-[#5C6B57]">{subtitle}</span>}
      </div>
    </div>
  );
};
