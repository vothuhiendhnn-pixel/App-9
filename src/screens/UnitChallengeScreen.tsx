import React, { useState } from 'react';
import { UserProfile, Exercise } from '../types';
import { UNIT_1_CHALLENGE_QUESTIONS } from '../data/unitsData';
import { store } from '../services/store';
import { AudioButton } from '../components/AudioButton';
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnitChallengeScreenProps {
  user: UserProfile;
  onBack: () => void;
  onNavigateReview: () => void;
  onUpdateProgress: () => void;
}

export const UnitChallengeScreen: React.FC<UnitChallengeScreenProps> = ({
  user,
  onBack,
  onNavigateReview,
  onUpdateProgress,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const questions = UNIT_1_CHALLENGE_QUESTIONS;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: opt,
    });
  };

  const handleSubmitChallenge = () => {
    let score = 0;
    let correct = 0;
    let wrong = 0;

    questions.forEach((q, idx) => {
      const userAns = (selectedAnswers[idx] || '').trim();
      const isCorrect = userAns.toLowerCase() === String(q.answer).toLowerCase();

      if (isCorrect) {
        correct++;
        // Vocab: 10 pts each, Grammar: 10 pts each, Pron: 10 pts each, Listening: 10 pts each
        score += 10;
      } else {
        wrong++;
        // Record mistake for review
        store.recordMistake({
          studentId: user.id,
          unit: 1,
          module: 'challenge',
          questionId: q.id,
          question: q.question,
          studentAnswer: userAns || '(chưa chọn)',
          correctAnswer: String(q.answer),
          explanationVi: q.explanationVi,
        });
      }
    });

    const percentage = Math.round((score / 100) * 100);
    const xp = score >= 80 ? 50 : 30; // +30 XP complete challenge, +20 bonus if >=80%

    setTotalScore(score);
    setCorrectCount(correct);
    setWrongCount(wrong);
    setXpEarned(xp);
    setIsSubmitted(true);

    // Save full quiz attempt
    store.recordQuizAttempt({
      studentId: user.id,
      unit: 1,
      module: 'challenge',
      activityId: 'u1-challenge',
      activityName: 'Unit 1 Challenge (100 Points)',
      score,
      maxScore: 100,
      percentage,
      xpEarned: xp,
    });

    store.updateModuleProgress(user.id, 1, 'practice', 100);
    onUpdateProgress();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleTryAgain = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setTotalScore(0);
    setCorrectCount(0);
    setWrongCount(0);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4 pt-4 sm:px-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3 py-1.5 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Thoát thử thách</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#8E5D32] bg-[#FAF2E4] border border-[#F0DEBA] px-3 py-1 rounded-full">
            Unit 1 Challenge • 100 Points
          </span>
        </div>
      </div>

      {!isSubmitted ? (
        /* Active Quiz Screen */
        <div className="bg-white rounded-[22px] p-6 border border-[#E5DDD0] shadow-xs space-y-6">
          {/* Question Stepper Indicator */}
          <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-3 text-xs font-bold text-[#5C6B57]">
            <div className="flex items-center gap-2">
              <span className="bg-[#4B5D44] text-white px-2 py-0.5 rounded-md font-black">
                {currentIdx < 3 ? 'Vocabulary' : currentIdx < 6 ? 'Grammar' : currentIdx < 8 ? 'Pronunciation' : 'Listening'}
              </span>
              <span>Câu {currentIdx + 1} / {questions.length}</span>
            </div>
            <span className="text-[#8E5D32] font-extrabold">10 điểm</span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#2D332A] font-serif leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIdx] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#E8EFE6] border-[#4B5D44] text-[#384732] font-bold ring-2 ring-[#4B5D44]/30'
                      : 'bg-[#FAF7F2] border-[#E5DDD0] text-[#2D332A] hover:bg-[#F2F7F0] hover:border-[#C6D8C2]'
                  }`}
                >
                  <span>{opt}</span>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EBE3D5]">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="text-xs font-bold text-[#5C6B57] disabled:opacity-30 px-4 py-2 rounded-xl border border-[#E5DDD0] hover:bg-[#FAF7F2]"
            >
              ← Câu trước
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="bg-[#2D332A] hover:bg-[#1E231C] text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitChallenge}
                className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <Trophy className="w-4 h-4" />
                <span>NỘP BÀI THỬ THÁCH</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="bg-white rounded-[22px] p-6 sm:p-8 text-center border border-[#E5DDD0] shadow-xs space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-[#FAF2E4] border border-[#F0DEBA] text-[#8E5D32] mx-auto flex items-center justify-center shadow-xs">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#2D332A] font-serif">
              Kết Quả Unit 1 Challenge!
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#5C6B57]">
              Chúc mừng bạn đã hoàn thành bài kiểm tra tổng hợp 100 điểm
            </p>
          </div>

          {/* Main Score Box */}
          <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5DDD0] max-w-sm mx-auto space-y-4">
            <div>
              <span className="text-xs font-bold text-[#5C6B57] block uppercase tracking-wider">Tổng điểm đạt được</span>
              <span className="text-4xl sm:text-5xl font-black text-[#4B5D44] font-serif tracking-tight">
                {totalScore} <span className="text-2xl text-[#5C6B57]">/ 100</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E5DDD0] text-xs">
              <div className="p-2 rounded-xl bg-[#E8EFE6] text-[#384732] font-bold border border-[#C6D8C2]">
                <span className="block text-[10px] uppercase font-bold text-[#384732]">Đúng</span>
                <span className="text-base font-black">{correctCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F9EBE9] text-[#88372A] font-bold border border-[#ECC7C3]">
                <span className="block text-[10px] uppercase font-bold text-[#88372A]">Sai</span>
                <span className="text-base font-black">{wrongCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF2E4] text-[#8E5D32] font-bold border border-[#F0DEBA]">
                <span className="block text-[10px] uppercase font-bold text-[#8E5D32]">Thưởng</span>
                <span className="text-base font-black">+{xpEarned} XP</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTryAgain}
              className="w-full sm:w-auto bg-white border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#2D332A] px-5 py-3 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5C6B57]" />
              <span>TRY AGAIN (Làm lại)</span>
            </button>

            {wrongCount > 0 && (
              <button
                onClick={onNavigateReview}
                className="w-full sm:w-auto bg-[#FAF2E4] border border-[#F0DEBA] text-[#8E5D32] hover:bg-[#F5EAD4] px-5 py-3 rounded-xl font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>REVIEW MISTAKES (Sửa {wrongCount} câu sai)</span>
              </button>
            )}

            <button
              onClick={onBack}
              className="w-full sm:w-auto bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-3 rounded-xl font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>CONTINUE (Về trang chủ)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
