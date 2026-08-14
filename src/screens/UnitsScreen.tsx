import React from 'react';
import { UNITS_DATA } from '../data/unitsData';
import { ProgressBar } from '../components/ProgressBar';
import { StudentProgress } from '../types';
import { BookOpen, Sparkles, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface UnitsScreenProps {
  progress: StudentProgress;
  onSelectUnit: (unitId: number) => void;
}

export const UnitsScreen: React.FC<UnitsScreenProps> = ({ progress, onSelectUnit }) => {
  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full uppercase tracking-wider">
            English 9 • Global Success
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2D332A] tracking-tight font-serif">
          Chương trình 12 Units
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#5C6B57]">
          Chọn bài học bạn muốn ôn tập cùng cô Hiền
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {UNITS_DATA.map((unit) => {
          const isUnit1 = unit.id === 1;
          const currentProg = isUnit1 ? progress.unitProgress : 0;

          return (
            <div
              key={unit.id}
              id={`unit-card-${unit.id}`}
              onClick={() => {
                if (unit.isActive) onSelectUnit(unit.id);
              }}
              className={`rounded-2xl p-5 border transition-all relative ${
                unit.isActive
                  ? 'bg-white border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm cursor-pointer group'
                  : 'bg-[#F0EAE1]/50 border-[#E5DDD0] opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      unit.isActive
                        ? 'bg-[#4B5D44] text-[#F7F3E9] shadow-xs'
                        : 'bg-[#D9C5B2] text-[#5C6B57]'
                    }`}
                  >
                    UNIT {unit.id}
                  </span>
                  {unit.isActive ? (
                    <span className="text-[11px] font-extrabold text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Đang học
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[#5C6B57] bg-[#EAE3D7] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Coming Soon
                    </span>
                  )}
                </div>

                {unit.isActive && (
                  <span className="text-xs font-black text-[#384732] font-serif">
                    {currentProg}%
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className={`text-lg font-black tracking-tight font-serif ${unit.isActive ? 'text-[#2D332A] group-hover:text-[#4B5D44]' : 'text-[#5C6B57]'}`}>
                {unit.title}
              </h3>
              <p className="text-xs font-bold text-[#8E5D32] mt-0.5">
                {unit.vietnameseTitle}
              </p>
              <p className="text-xs text-[#5C6B57] font-medium mt-2 leading-relaxed">
                {unit.description}
              </p>

              {/* Topics chips */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#EFE7DA]">
                {unit.topics.vocabulary.slice(0, 2).map((top, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-[#FAF7F2] text-[#5C6B57] px-2 py-0.5 rounded-md border border-[#E5DDD0]"
                  >
                    {top}
                  </span>
                ))}
                {unit.topics.grammar.slice(0, 1).map((top, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-[#FAF2E4] text-[#875514] px-2 py-0.5 rounded-md border border-[#F0DEBA]"
                  >
                    {top}
                  </span>
                ))}
              </div>

              {/* Progress or Button */}
              {unit.isActive ? (
                <div className="mt-4 pt-2">
                  <ProgressBar progress={currentProg} color="blue" size="sm" />
                  <div className="mt-3 flex justify-end">
                    <span className="text-xs font-bold text-[#4B5D44] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Vào học Unit 1</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-2 text-right">
                  <span className="text-[11px] font-semibold text-[#8C9886]">
                    Đang chuẩn bị nội dung...
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
