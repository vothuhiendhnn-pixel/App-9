import React from 'react';
import { VocabularyItem } from '../types';
import { AudioButton } from './AudioButton';

interface VocabularyCardProps {
  item: VocabularyItem;
  onStatusChange?: (status: 'new' | 'learning' | 'good' | 'mastered') => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ item }) => {
  const statusColors = {
    new: 'bg-[#FAF7F2] text-[#5C6B57] border-[#E5DDD0]',
    learning: 'bg-[#FAF2E4] text-[#875514] border-[#F0DEBA]',
    good: 'bg-[#F7EFE6] text-[#8E5D32] border-[#E5D2C0]',
    mastered: 'bg-[#E8EFE6] text-[#384732] border-[#C6D8C2]',
  };

  const statusLabels = {
    new: 'Mới',
    learning: 'Đang học',
    good: 'Khá tốt',
    mastered: 'Đã thuộc',
  };

  const currentStatus = item.status || 'new';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#E5DDD0] hover:border-[#BC8A5F]/50 hover:shadow-sm transition-all space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-extrabold text-[#2D332A] tracking-tight font-serif">
              {item.word}
            </h3>
            <span className="text-xs font-mono font-bold text-[#384732] bg-[#E8EFE6] px-2 py-0.5 rounded-lg border border-[#C6D8C2]">
              {item.ipa}
            </span>
            <span className="text-[10px] font-bold text-[#5C6B57] uppercase bg-[#FAF7F2] border border-[#E5DDD0] px-2 py-0.5 rounded-md">
              {item.partOfSpeech}
            </span>
          </div>
          <p className="text-base font-bold text-[#8E5D32] mt-1.5">
            {item.meaningVi}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AudioButton text={item.word} size="md" />
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColors[currentStatus]}`}>
            {statusLabels[currentStatus]}
          </span>
        </div>
      </div>

      {item.example && (
        <div className="bg-[#FAF7F2] rounded-xl p-3 text-xs border border-[#EBE3D5] space-y-1">
          <div className="flex items-center justify-between text-[#5C6B57] font-semibold">
            <span>Ví dụ ngữ cảnh:</span>
            <AudioButton text={item.example} size="sm" />
          </div>
          <p className="text-[#2D332A] font-medium italic leading-relaxed">
            "{item.example}"
          </p>
        </div>
      )}
    </div>
  );
};
