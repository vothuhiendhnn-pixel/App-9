import React, { useEffect } from 'react';
import { Trophy, RotateCcw, ArrowRight, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabPracticeType } from '../../types';
import { VOCAB_PRACTICE_CONFIGS } from '../../data/vocabularyPracticeData';

interface PracticeResultSummaryProps {
  practiceType: VocabPracticeType | 'review_wrong_words';
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  wrongWords: { word: string; meaningVi: string; ipa?: string }[];
  onRetry: () => void;
  onNext?: () => void;
  onBackToRoadmap: () => void;
  onReviewWrongWords?: () => void;
}

export const PracticeResultSummary: React.FC<PracticeResultSummaryProps> = ({
  practiceType,
  score,
  maxScore,
  percentage,
  passed,
  attemptNumber,
  wrongWords,
  onRetry,
  onNext,
  onBackToRoadmap,
  onReviewWrongWords,
}) => {
  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4B5D44', '#BC8A5F', '#8E5D32', '#F4A261', '#2A9D8F'],
      });
    }
  }, [passed]);

  // Scoring feedback levels
  const getLevelInfo = () => {
    if (percentage >= 90) {
      return {
        status: 'excellent',
        icon: '🌟',
        title: 'Xuất sắc!',
        message: 'Xuất sắc! Em đã nhớ từ rất tốt.',
        badgeBg: 'bg-[#E8EFE6] text-[#384732] border-[#C6D8C2]',
      };
    }
    if (percentage >= 80) {
      return {
        status: 'passed',
        icon: '✅',
        title: 'Đạt yêu cầu!',
        message: 'Tốt lắm! Em đã đạt yêu cầu.',
        badgeBg: 'bg-[#E8EFE6] text-[#384732] border-[#C6D8C2]',
      };
    }
    if (percentage >= 60) {
      return {
        status: 'practice_more',
        icon: '💪',
        title: 'Gần đạt rồi!',
        message: 'Gần đạt rồi! Hãy ôn lại những từ em làm sai và thử lại nhé.',
        badgeBg: 'bg-[#F7EFE6] text-[#8E5D32] border-[#E5D2C0]',
      };
    }
    return {
      status: 'retry',
      icon: '📚',
      title: 'Cần ôn thêm!',
      message: 'Hãy học lại các từ cần ôn và thử lại nhé!',
      badgeBg: 'bg-[#F9EBE9] text-[#88372A] border-[#E8C2BD]',
    };
  };

  const levelInfo = getLevelInfo();
  const config = practiceType !== 'review_wrong_words' ? VOCAB_PRACTICE_CONFIGS[practiceType] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-12 animate-fadeIn">
      {/* Score Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD0] shadow-sm text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center text-4xl shadow-inner">
          {levelInfo.icon}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border mb-2">
            <span>{config?.name || 'Ôn từ hay sai'}</span>
            <span>• Lần làm thứ {attemptNumber}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif">
            {levelInfo.title}
          </h2>
          <p className="text-sm text-[#5C6B57] max-w-md mx-auto font-medium">
            {levelInfo.message}
          </p>
        </div>

        {/* Score Ring / Bar */}
        <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] max-w-sm mx-auto flex items-center justify-around">
          <div>
            <p className="text-xs text-[#5C6B57] font-bold uppercase tracking-wider">Điểm số</p>
            <p className="text-3xl font-black text-[#2D332A] font-serif">
              {score} <span className="text-sm font-semibold text-[#8C9886]">/ {maxScore}</span>
            </p>
          </div>
          <div className="h-10 w-px bg-[#E5DDD0]" />
          <div>
            <p className="text-xs text-[#5C6B57] font-bold uppercase tracking-wider">Kết quả</p>
            <p className={`text-3xl font-black font-serif ${passed ? 'text-[#4B5D44]' : 'text-[#BC8A5F]'}`}>
              {percentage}%
            </p>
          </div>
          <div className="h-10 w-px bg-[#E5DDD0]" />
          <div>
            <p className="text-xs text-[#5C6B57] font-bold uppercase tracking-wider">Trạng thái</p>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border mt-1 ${
                passed
                  ? 'bg-[#E8EFE6] text-[#384732] border-[#C6D8C2]'
                  : 'bg-[#F9EBE9] text-[#88372A] border-[#E8C2BD]'
              }`}
            >
              {passed ? 'ĐẠT (>= 80%)' : 'CHƯA ĐẠT'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {passed && onNext && (
            <button
              id="next-exercise-btn"
              onClick={onNext}
              className="w-full sm:w-auto bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-3 rounded-xl font-black text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>BÀI TIẾP THEO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            id="retry-exercise-btn"
            onClick={onRetry}
            className="w-full sm:w-auto bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#2D332A] border border-[#E5DDD0] px-5 py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>LÀM LẠI</span>
          </button>

          <button
            id="roadmap-btn"
            onClick={onBackToRoadmap}
            className="w-full sm:w-auto bg-white hover:bg-[#FAF7F2] text-[#5C6B57] border border-[#E5DDD0] px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>DANH SÁCH BÀI TẬP</span>
          </button>
        </div>
      </div>

      {/* Wrong Words Section if any */}
      {wrongWords.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DDD0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#88372A]" />
              <h3 className="font-extrabold text-base text-[#2D332A] font-serif">
                Từ cần lưu ý & ôn tập ({wrongWords.length})
              </h3>
            </div>
            {onReviewWrongWords && (
              <button
                onClick={onReviewWrongWords}
                className="text-xs font-black text-[#BC8A5F] hover:text-[#8E5D32] flex items-center gap-1 cursor-pointer"
              >
                <span>Ôn ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {wrongWords.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] flex items-start justify-between gap-2"
              >
                <div>
                  <p className="font-black text-sm text-[#2D332A]">{item.word}</p>
                  {item.ipa && <p className="text-xs text-[#8C9886] font-mono">{item.ipa}</p>}
                  <p className="text-xs text-[#5C6B57] mt-0.5">{item.meaningVi}</p>
                </div>
                <span className="text-[10px] font-extrabold text-[#88372A] bg-[#F9EBE9] px-2 py-0.5 rounded-md border border-[#E8C2BD] whitespace-nowrap">
                  Cần ôn
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
