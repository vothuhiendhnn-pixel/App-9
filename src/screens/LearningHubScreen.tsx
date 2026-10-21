import React from 'react';
import type { UserProfile } from '../types';

interface LearningHubScreenProps {
  user: UserProfile;
  selectedUnit: number;
  onSelectUnit: (unit: number) => void;
  onOpenVocabulary: () => void;
  onOpenGrammar: () => void;
  onOpenListening: () => void;
  onOpenMore: () => void;
}

/** Navigation only: scoring, answers and Supabase submissions remain in original screens. */
export const LearningHubScreen: React.FC<LearningHubScreenProps> = ({
  user, selectedUnit, onSelectUnit, onOpenVocabulary, onOpenGrammar,
  onOpenListening, onOpenMore,
}) => {
  const tasks = [
    { key: 'vocabulary', step: '01', icon: '📚', title: 'TỪ VỰNG', subtitle: 'Vocabulary', detail: 'Khám phá từ mới, flashcards và luyện tập từ vựng.', bg: 'bg-[#EDF8EF]', border: 'border-[#B6E5C3]', color: 'text-[#17643F]', action: onOpenVocabulary },
    { key: 'grammar', step: '02', icon: '🧩', title: 'NGỮ PHÁP', subtitle: 'Grammar', detail: 'Tìm hiểu cấu trúc câu và làm bài tập ngữ pháp.', bg: 'bg-[#EEF4FF]', border: 'border-[#B6D1FF]', color: 'text-[#174CB4]', action: onOpenGrammar },
    { key: 'listening', step: '03', icon: '🎧', title: 'THỰC HÀNH', subtitle: 'Listening', detail: 'Luyện nghe và hoàn thành bài tập của Unit.', bg: 'bg-[#FFF6EC]', border: 'border-[#FFD5A7]', color: 'text-[#9A390F]', action: onOpenListening },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 pb-28" aria-label="Trang học tập">
      <div className="mb-8">
        <p className="text-sm font-bold tracking-wide text-[#5A7258] uppercase">English 9 · Miss Hiền</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-[#2D332A]">Chọn Unit và bắt đầu học</h1>
        <p className="mt-2 text-[#647060]">{user.name}{user.className ? ` · Lớp ${user.className}` : ''}</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5DDD0] shadow-sm p-5 sm:p-6 mb-7">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-[#2D332A]">1. Chọn Unit</h2>
          <span className="text-sm text-[#647060]">Đang chọn: Unit {selectedUnit}</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2" role="group" aria-label="Danh sách Unit theo thứ tự">
          {Array.from({ length: 12 }, (_, index) => index + 1).map(unit => (
            <button key={unit} type="button" onClick={() => onSelectUnit(unit)}
              aria-pressed={selectedUnit === unit}
              className={`rounded-xl border min-h-[48px] px-1 py-2 font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A7258] ${selectedUnit === unit ? 'bg-[#4D6248] border-[#4D6248] text-white shadow-md' : 'bg-[#F7F3E9] border-[#E5DDD0] text-[#374334] hover:border-[#4D6248]'}`}>
              {unit}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#71806E]">Các Unit hiển thị theo thứ tự chương trình. Nội dung khả dụng tùy theo bài đã được xây dựng trong APP.</p>
      </div>

      <h2 className="text-lg font-bold text-[#2D332A] mb-4">2. Chọn nhiệm vụ học tập · Unit {selectedUnit}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {tasks.map(task => (
          <button key={task.key} type="button" onClick={task.action}
            className={`text-left flex flex-col min-h-[270px] rounded-3xl border-2 ${task.border} ${task.bg} p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4D6248]`}>
            <div className="flex justify-between items-start mb-5">
              <span className="text-4xl" aria-hidden="true">{task.icon}</span>
              <span className={`text-sm font-bold ${task.color}`}>BƯỚC {task.step}</span>
            </div>
            <h3 className={`text-2xl font-serif font-bold ${task.color}`}>{task.title}</h3>
            <p className="font-semibold text-[#374334] mt-1">{task.subtitle}</p>
            <p className="text-[#576554] text-sm leading-relaxed mt-3 flex-1">{task.detail}</p>
            <div className={`mt-6 pt-4 border-t ${task.border} font-bold ${task.color}`}>Vào bài học <span aria-hidden="true">→</span></div>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#E5DDD0] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#2D332A]">Các hoạt động khác của Unit {selectedUnit}</h3>
          <p className="text-sm text-[#647060] mt-1">Giữ lại Pronunciation, Practice và thử thách hiện có; không xóa nội dung.</p>
        </div>
        <button type="button" onClick={onOpenMore} className="shrink-0 px-5 py-3 rounded-xl border border-[#C6D3C1] text-[#3F573A] bg-[#F6FAF4] font-bold hover:bg-[#E9F3E6]">Xem hoạt động khác →</button>
      </div>
      <p className="text-sm text-[#647060] mt-5">Điểm và bài nộp tiếp tục được xử lý bởi từng màn hình bài tập hiện có.</p>
    </section>
  );
};
