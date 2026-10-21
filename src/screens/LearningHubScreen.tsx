import React from 'react';
import type { UserProfile } from '../types';

interface LearningHubScreenProps {
  user: UserProfile;
  selectedUnit: number;
  onSelectUnit: (unit: number) => void;
  onOpenVocabulary: () => void;
  onOpenGrammar: () => void;
  onOpenListening: () => void;
  // Keep the existing prop contract so App.tsx does not need to change.
  onOpenMore: () => void;
}

/** Navigation only: exercise content, scoring and Supabase submissions remain unchanged. */
export const LearningHubScreen: React.FC<LearningHubScreenProps> = ({
  user, selectedUnit, onSelectUnit, onOpenVocabulary, onOpenGrammar, onOpenListening,
}) => {
  const tasks = [
    {
      key: 'vocabulary', step: '01', icon: '📚', title: 'TỪ VỰNG', subtitle: 'Vocabulary',
      detail: 'Học từ mới, ôn flashcards và thử sức với bài luyện tập.',
      bg: 'bg-[#EDF8F0]', border: 'border-[#B6E5C3]', color: 'text-[#17643F]',
      iconBg: 'bg-white/75', action: onOpenVocabulary,
    },
    {
      key: 'grammar', step: '02', icon: '🧩', title: 'NGỮ PHÁP', subtitle: 'Grammar',
      detail: 'Hiểu cấu trúc câu và vận dụng vào các bài tập thú vị.',
      bg: 'bg-[#EFF4FF]', border: 'border-[#BDD4FF]', color: 'text-[#174CB4]',
      iconBg: 'bg-white/75', action: onOpenGrammar,
    },
    {
      key: 'listening', step: '03', icon: '🎧', title: 'THỰC HÀNH', subtitle: 'Listening',
      detail: 'Rèn luyện kỹ năng nghe và hoàn thành bài tập của Unit.',
      bg: 'bg-[#FFF6EC]', border: 'border-[#FFD5A7]', color: 'text-[#9A390F]',
      iconBg: 'bg-white/75', action: onOpenListening,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-7 pb-16 sm:pt-9" aria-label="Trang học tập">
      <div className="mb-7">
        <p className="text-xs sm:text-sm font-bold tracking-[0.12em] text-[#5A7258] uppercase">English 9 · Miss Hiền</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#2D332A]">Hôm nay, mình học gì?</h1>
        <p className="mt-2 text-sm sm:text-base text-[#647060]">
          {user.name}{user.className ? ` · Lớp ${user.className}` : ''}
          <span className="block mt-1">Chọn Unit và bắt đầu hành trình chinh phục Tiếng Anh nhé!</span>
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5DDD0] shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-[#2D332A]">1. Chọn Unit</h2>
          <span className="rounded-full bg-[#EBF2E9] border border-[#CEDCC8] px-3 py-1 text-sm font-semibold text-[#3F573A]">
            Unit {selectedUnit} đang chọn
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2" role="group" aria-label="Danh sách Unit theo thứ tự">
          {Array.from({ length: 12 }, (_, index) => index + 1).map(unit => (
            <button
              key={unit}
              type="button"
              onClick={() => onSelectUnit(unit)}
              aria-label={`Chọn Unit ${unit}`}
              aria-pressed={selectedUnit === unit}
              className={`rounded-xl border min-h-[48px] px-1 py-2 font-bold text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A7258] ${selectedUnit === unit
                ? 'bg-[#4D6248] border-[#4D6248] text-white shadow-md scale-[1.02]'
                : 'bg-[#FAF8F3] border-[#E5DDD0] text-[#374334] hover:bg-[#EDF3EA] hover:border-[#8FAA85]'}`}
            >
              {unit}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#71806E]">Các Unit sắp xếp theo chương trình; nội dung bài học hiển thị theo phần đã được xây dựng.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#2D332A]">2. Chọn nhiệm vụ · Unit {selectedUnit}</h2>
        <span className="text-xs font-semibold text-[#71806E]">3 bước học tập</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {tasks.map(task => (
          <button
            key={task.key}
            type="button"
            onClick={task.action}
            className={`group text-left flex flex-col w-full min-h-[280px] rounded-3xl border-2 ${task.border} ${task.bg} p-6 sm:p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4D6248]`}
          >
            <div className="flex items-start justify-between gap-3 mb-6">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${task.iconBg} text-3xl shadow-sm`} aria-hidden="true">{task.icon}</span>
              <span className={`text-xs font-extrabold tracking-wider ${task.color}`}>BƯỚC {task.step}</span>
            </div>
            <h3 className={`text-2xl font-serif font-bold ${task.color}`}>{task.title}</h3>
            <p className="font-semibold text-[#374334] mt-1">{task.subtitle}</p>
            <p className="text-[#576554] text-sm leading-relaxed mt-4 flex-1">{task.detail}</p>
            <div className={`flex items-center justify-between mt-7 pt-4 border-t ${task.border} font-bold ${task.color}`}>
              <span>Bắt đầu học</span>
              <span aria-hidden="true" className="text-xl transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
