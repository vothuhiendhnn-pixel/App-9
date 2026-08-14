import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Check, X, ArrowRight, RotateCcw, Volume2, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, WordMasteryItem } from '../../types';
import { store } from '../../services/store';
import { audioService } from '../../services/audioService';
import { checkWordAnswerMatch, generateWordMaskedHint } from '../../data/vocabularyPracticeData';
import { VOCABULARY_RAW_DATA } from '../../data/vocabularyData';

interface ReviewWrongWordsExerciseProps {
  unit?: number;
  user: UserProfile;
  onBackToRoadmap: () => void;
}

export const ReviewWrongWordsExercise: React.FC<ReviewWrongWordsExerciseProps> = ({
  unit,
  user,
  onBackToRoadmap,
}) => {
  const [reviewList, setReviewList] = useState<WordMasteryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [justMasteredWord, setJustMasteredWord] = useState<string | null>(null);
  const [masteredCountSession, setMasteredCountSession] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadReviewWords = () => {
    const list = store.getWordsNeedingReview(user.id, unit, 20);
    setReviewList(list);
    setCurrentIndex(0);
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setJustMasteredWord(null);
    setIsFinished(false);
  };

  useEffect(() => {
    loadReviewWords();
  }, [unit]);

  const currentWord = reviewList[currentIndex];

  useEffect(() => {
    if (inputRef.current && !isAnswerSubmitted && !isFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswerSubmitted, isFinished]);

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedAnswer.trim() || isAnswerSubmitted || !currentWord) return;

    const correct = checkWordAnswerMatch(typedAnswer, currentWord.word);
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    const updated = store.recordWordPractice(
      user.id,
      currentWord.unit,
      currentWord.wordId,
      currentWord.word,
      currentWord.meaningVi,
      currentWord.ipa,
      correct,
      true
    );

    if (correct) {
      audioService.speak(currentWord.audioText || currentWord.word, 0.88);
      if (updated.mastered) {
        setJustMasteredWord(currentWord.word);
        setMasteredCountSession((prev) => prev + 1);
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleNextWord = () => {
    if (currentIndex < reviewList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTypedAnswer('');
      setIsAnswerSubmitted(false);
      setIsCorrect(false);
      setJustMasteredWord(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetryCurrent = () => {
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
  };

  // If no words need review
  if (reviewList.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-6 pb-12 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 border border-[#E5DDD0] shadow-sm space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E8EFE6] border border-[#C6D8C2] flex items-center justify-center text-4xl shadow-inner">
            🎉
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#2D332A] font-serif">
              Không có từ nào cần ôn!
            </h2>
            <p className="text-sm text-[#5C6B57]">
              Tuyệt vời! Em đã hoàn thành xuất sắc các từ vựng{unit ? ` của Unit ${unit}` : ''}. Tất cả các từ đều đã thuộc hoặc chưa gặp lỗi.
            </p>
          </div>
          <button
            onClick={onBackToRoadmap}
            className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-3 rounded-xl font-black text-sm shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>QUAY LẠI LỘ TRÌNH</span>
          </button>
        </div>
      </div>
    );
  }

  // Finished session
  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-6 pb-12 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 border border-[#E5DDD0] shadow-sm space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center text-4xl shadow-inner">
            🌟
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#2D332A] font-serif">
              Hoàn thành phiên ôn tập!
            </h2>
            <p className="text-sm text-[#5C6B57]">
              Em đã ôn qua {reviewList.length} từ hay sai. Đã chinh phục thêm{' '}
              <span className="font-bold text-[#4B5D44]">{masteredCountSession} từ</span> đạt cấp độ Đã thuộc!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={loadReviewWords}
              className="w-full sm:w-auto bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#2D332A] border border-[#E5DDD0] px-5 py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ÔN TIẾP TỪ CÒN LẠI</span>
            </button>
            <button
              onClick={onBackToRoadmap}
              className="w-full sm:w-auto bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-3 rounded-xl font-black text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>LỘ TRÌNH BÀI TẬP</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-12 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DDD0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#88372A] bg-[#F9EBE9] px-2.5 py-0.5 rounded-full border border-[#E8C2BD]">
              Ôn từ tôi hay sai
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
            Luyện tập tập trung
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B57]">
            Gõ đúng 3 lần liên tiếp để chuyển từ sang trạng thái "Đã thuộc".
          </p>
        </div>

        {/* Word Counter & Streak */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5DDD0]">
          <span className="text-xs text-[#5C6B57] font-bold">Từ cần ôn</span>
          <span className="text-lg font-black text-[#2D332A] font-serif">
            {currentIndex + 1} <span className="text-xs text-[#8C9886]">/ {reviewList.length}</span>
          </span>
        </div>
      </div>

      {/* Prompt Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD0] shadow-sm text-center space-y-4">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-bold text-[#88372A] bg-[#F9EBE9] border border-[#E8C2BD] px-3 py-1 rounded-full">
            Sai {currentWord.wrongCount} lần
          </span>
          <span className="text-xs font-bold text-[#4B5D44] bg-[#E8EFE6] border border-[#C6D8C2] px-3 py-1 rounded-full">
            Đúng liên tiếp: {currentWord.consecutiveCorrect} / 3
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#8C9886] font-bold">Nghĩa tiếng Việt</p>
          <h3 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif tracking-tight">
            "{currentWord.meaningVi}"
          </h3>
        </div>

        {/* Mastered celebration badge */}
        {justMasteredWord && (
          <div className="p-3 bg-[#E8EFE6] border border-[#C6D8C2] rounded-2xl inline-flex items-center gap-2 text-xs font-black text-[#384732] animate-bounce">
            <Sparkles className="w-4 h-4 text-[#BC8A5F]" />
            <span>Chúc mừng! Em đã thuộc từ "{justMasteredWord}"!</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmitAnswer} className="space-y-3">
        <div className="relative">
          <input
            id="review-word-input"
            ref={inputRef}
            type="text"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            disabled={isAnswerSubmitted}
            placeholder="Gõ từ tiếng Anh vào đây..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            className={`w-full px-5 py-4 rounded-2xl border text-base sm:text-lg font-bold transition-all outline-none ${
              isAnswerSubmitted
                ? isCorrect
                  ? 'bg-[#E8EFE6] border-[#4B5D44] text-[#384732] ring-2 ring-[#4B5D44]/30'
                  : 'bg-[#F9EBE9] border-[#E8C2BD] text-[#88372A]'
                : 'bg-white border-[#E5DDD0] text-[#2D332A] focus:border-[#4B5D44] focus:ring-4 focus:ring-[#4B5D44]/10 shadow-xs'
            }`}
          />
          {!isAnswerSubmitted && (
            <button
              type="submit"
              disabled={!typedAnswer.trim()}
              className="absolute right-2.5 top-2.5 bottom-2.5 px-5 rounded-xl bg-[#4B5D44] hover:bg-[#3D4C37] disabled:bg-[#D5DDD0] text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>KIỂM TRA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Feedback & Navigation Bar */}
      {isAnswerSubmitted && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5DDD0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            {isCorrect ? (
              <div className="w-8 h-8 rounded-full bg-[#E8EFE6] text-[#4B5D44] flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F9EBE9] text-[#88372A] flex items-center justify-center shrink-0">
                <X className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className={`font-black text-sm ${isCorrect ? 'text-[#4B5D44]' : 'text-[#88372A]'}`}>
                {isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#5C6B57]">
                <span>Từ đúng:</span>
                <span className="font-bold text-[#2D332A] text-sm font-serif">{currentWord.word}</span>
                {currentWord.ipa && <span className="font-mono text-[#8C9886]">{currentWord.ipa}</span>}
                <button
                  type="button"
                  onClick={() => audioService.speak(currentWord.audioText || currentWord.word, 0.88)}
                  className="text-[#4B5D44] hover:text-[#3D4C37] cursor-pointer ml-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isCorrect && (
              <button
                onClick={handleRetryCurrent}
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#2D332A] border border-[#E5DDD0] font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gõ lại</span>
              </button>
            )}

            <button
              onClick={handleNextWord}
              className="px-5 py-2.5 rounded-xl bg-[#4B5D44] hover:bg-[#3D4C37] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <span>{currentIndex < reviewList.length - 1 ? 'TỪ TIẾP THEO' : 'HOÀN THÀNH'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
