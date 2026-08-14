import React from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Play,
  Volume2,
  BookOpen,
  Layers,
} from 'lucide-react';
import { UserProfile, VocabPracticeType, VocabularyUnitPracticeProgress } from '../../types';
import { VOCAB_PRACTICE_CONFIGS } from '../../data/vocabularyPracticeData';
import { store } from '../../services/store';

interface VocabularyPracticeRoadmapProps {
  unit: number;
  user: UserProfile;
  progress: VocabularyUnitPracticeProgress;
  onSelectPractice: (type: VocabPracticeType | 'review_wrong_words') => void;
}

export const VocabularyPracticeRoadmap: React.FC<VocabularyPracticeRoadmapProps> = ({
  unit,
  user,
  progress,
  onSelectPractice,
}) => {
  const practiceOrder: VocabPracticeType[] = [
    'match',
    'choose_meaning',
    'listen_and_choose',
    'type_word',
    'complete_sentence',
    'challenge',
  ];

  const reviewWords = store.getWordsNeedingReview(user.id, unit, 50);
  const masteryStats = store.getVocabPracticeSummary(user.id);
  const unitMasteryList = store.getWordMasteryList(user.id, unit);
  const unitMasteredCount = unitMasteryList.filter((w) => w.mastered).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Unit Practice Hero & Mastery Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5DDD0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#4B5D44] bg-[#E8EFE6] px-3 py-1 rounded-full border border-[#C6D8C2]">
              Lộ trình 6 chặng luyện tập • Unit {unit}
            </span>
            {progress.completed && (
              <span className="text-xs font-black text-[#8E5D32] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E5DDD0] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#BC8A5F]" />
                <span>Đã hoàn thành Unit</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif">
            Luyện tập từ vựng từng bước
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B57] max-w-xl font-medium">
            Em cần đạt ít nhất <strong className="text-[#2D332A]">80 điểm (80%)</strong> ở mỗi chặng để mở khóa bài tập tiếp theo. Chinh phục chặng Challenge cuối cùng để hoàn tất Unit!
          </p>
        </div>

        {/* Word Mastery Mini Dashboard */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E5DDD0] flex items-center justify-around gap-4 shrink-0">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-[#5C6B57] font-extrabold">Đã thuộc</p>
            <p className="text-2xl font-black text-[#4B5D44] font-serif">{unitMasteredCount}</p>
            <span className="text-[10px] text-[#8C9886]">từ (streak ≥ 3)</span>
          </div>
          <div className="h-8 w-px bg-[#E5DDD0]" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-[#5C6B57] font-extrabold">Cần ôn lại</p>
            <p className="text-2xl font-black text-[#88372A] font-serif">{reviewWords.length}</p>
            <span className="text-[10px] text-[#8C9886]">từ hay sai</span>
          </div>
        </div>
      </div>

      {/* Review Wrong Words Callout Banner if any */}
      {reviewWords.length > 0 && (
        <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9EBE9] border border-[#E8C2BD] flex items-center justify-center text-xl shrink-0">
              🔄
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#2D332A] font-serif">
                Em có {reviewWords.length} từ cần ôn tập lại
              </h3>
              <p className="text-xs text-[#5C6B57]">
                Luyện tập tập trung các từ em vừa làm sai cho đến khi thuộc lòng.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPractice('review_wrong_words')}
            className="bg-[#8E5D32] hover:bg-[#784D28] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>ÔN TỪ HAY SAI NGAY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6 Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {practiceOrder.map((type, index) => {
          const config = VOCAB_PRACTICE_CONFIGS[type];
          const isUnlocked = progress.unlocked[type] ?? (index === 0);
          const bestScore = progress.bestScores[type] || 0;
          const latestScore = progress.latestScores[type] || 0;
          const attempts = progress.attempts[type] || 0;
          const isPassed = bestScore >= 80;

          return (
            <div
              key={type}
              className={`rounded-3xl border p-5 sm:p-6 transition-all relative flex flex-col justify-between gap-4 ${
                !isUnlocked
                  ? 'bg-[#FAF7F2]/60 border-[#E5DDD0] opacity-65'
                  : isPassed
                  ? 'bg-white border-[#C6D8C2] hover:border-[#4B5D44] shadow-xs hover:shadow-md'
                  : 'bg-white border-[#E5DDD0] hover:border-[#BC8A5F] shadow-xs hover:shadow-md'
              }`}
            >
              {/* Top Row: Icon & Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                      !isUnlocked
                        ? 'bg-[#E5DDD0]/50 border-[#D5CDC0]'
                        : isPassed
                        ? 'bg-[#E8EFE6] border-[#C6D8C2]'
                        : 'bg-[#FAF7F2] border-[#E5DDD0]'
                    }`}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8E5D32] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DDD0]">
                        Chặng {index + 1}/6
                      </span>
                      <span className="text-xs text-[#8C9886] font-bold">{config.badge}</span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#2D332A] font-serif mt-0.5">
                      {config.name}
                    </h3>
                  </div>
                </div>

                {/* Status Indicator */}
                <div>
                  {!isUnlocked ? (
                    <div className="w-8 h-8 rounded-full bg-[#E5DDD0] text-[#8C9886] flex items-center justify-center" title="Cần hoàn thành bài trước với điểm ≥ 80%">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : isPassed ? (
                    <div className="w-8 h-8 rounded-full bg-[#E8EFE6] text-[#4B5D44] flex items-center justify-center" title="Đã vượt qua">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] text-[#BC8A5F] flex items-center justify-center" title="Đang mở khóa">
                      <Unlock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Instruction */}
              <p className="text-xs sm:text-sm text-[#5C6B57] font-medium leading-relaxed">
                {config.instruction}
              </p>

              {/* Bottom Row: Score & Start Action */}
              <div className="flex items-center justify-between border-t border-[#E5DDD0] pt-3 mt-1">
                <div>
                  {attempts > 0 ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#5C6B57]">Điểm cao nhất:</span>
                      <span
                        className={`font-black font-serif text-sm ${
                          isPassed ? 'text-[#4B5D44]' : 'text-[#BC8A5F]'
                        }`}
                      >
                        {bestScore}%
                      </span>
                      <span className="text-[10px] text-[#8C9886]">({attempts} lần làm)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#8C9886] font-medium">Chưa làm bài</span>
                  )}
                </div>

                <button
                  id={`start-vocab-practice-${type}`}
                  onClick={() => isUnlocked && onSelectPractice(type)}
                  disabled={!isUnlocked}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${
                    !isUnlocked
                      ? 'bg-[#E5DDD0] text-[#8C9886] cursor-not-allowed'
                      : isPassed
                      ? 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#2D332A] border border-[#E5DDD0] cursor-pointer'
                      : 'bg-[#4B5D44] hover:bg-[#3D4C37] text-white shadow-xs cursor-pointer'
                  }`}
                >
                  <span>{attempts > 0 ? 'LÀM LẠI' : 'BẮT ĐẦU'}</span>
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
