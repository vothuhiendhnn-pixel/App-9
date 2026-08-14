import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Check, X, ArrowRight, RotateCcw, Lightbulb, Volume2, Sparkles } from 'lucide-react';
import { UserProfile, VocabPracticeResult } from '../../types';
import { VOCABULARY_RAW_DATA } from '../../data/vocabularyData';
import { store } from '../../services/store';
import { audioService } from '../../services/audioService';
import { checkWordAnswerMatch, generateWordMaskedHint } from '../../data/vocabularyPracticeData';
import { PracticeResultSummary } from './PracticeResultSummary';

interface TypeWordExerciseProps {
  unit: number;
  user: UserProfile;
  onComplete: () => void;
  onNext: () => void;
  onBackToRoadmap: () => void;
}

interface TypeWordQuestion {
  id: number;
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  audioText: string;
}

export const TypeWordExercise: React.FC<TypeWordExerciseProps> = ({
  unit,
  user,
  onComplete,
  onNext,
  onBackToRoadmap,
}) => {
  const unitVocab = useMemo(() => {
    const raw = VOCABULARY_RAW_DATA.find((u) => u.unit === unit);
    if (!raw || raw.vocabulary.length === 0) return [];
    return raw.vocabulary.map((v) => ({
      id: v.id,
      word: v.word,
      ipa: v.ipa,
      partOfSpeech: v.partOfSpeech || 'noun',
      meaningVi: v.meaning_vi,
      audioText: v.audio_text,
    }));
  }, [unit]);

  const [questions, setQuestions] = useState<TypeWordQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAttemptCounts, setWrongAttemptCounts] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [firstAttemptMap, setFirstAttemptMap] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [resultData, setResultData] = useState<VocabPracticeResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const initExercise = () => {
    if (unitVocab.length === 0) return;

    // Prioritise review words
    const reviewWords = store.getWordsNeedingReview(user.id, unit, 5);
    const reviewIds = new Set(reviewWords.map((r) => Number(r.wordId)));

    const reviewItems = unitVocab.filter((v) => reviewIds.has(v.id));
    const otherItems = unitVocab.filter((v) => !reviewIds.has(v.id));
    const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());

    const chosen = [...reviewItems, ...shuffledOthers].slice(0, Math.min(10, unitVocab.length));

    setQuestions(chosen);
    setCurrentIndex(0);
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setWrongAttemptCounts({});
    setShowHint(false);
    setFirstAttemptMap({});
    setScore(0);
    setIsFinished(false);
    setResultData(null);
  };

  useEffect(() => {
    initExercise();
  }, [unit]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (inputRef.current && !isAnswerSubmitted && !isFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswerSubmitted, isFinished]);

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedAnswer.trim() || isAnswerSubmitted) return;

    const correct = checkWordAnswerMatch(typedAnswer, currentQ.word);
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    const prevWrongs = wrongAttemptCounts[currentIndex] || 0;
    const isFirst = prevWrongs === 0 && firstAttemptMap[currentIndex] === undefined;

    if (correct) {
      if (isFirst) {
        setFirstAttemptMap((prev) => ({ ...prev, [currentIndex]: true }));
        setScore((prev) => prev + 10);
      } else {
        setScore((prev) => prev + 5);
      }

      audioService.speak(currentQ.audioText, 0.88);

      store.recordWordPractice(
        user.id,
        unit,
        currentQ.id,
        currentQ.word,
        currentQ.meaningVi,
        currentQ.ipa,
        true,
        isFirst
      );
    } else {
      const newWrongCount = prevWrongs + 1;
      setWrongAttemptCounts((prev) => ({ ...prev, [currentIndex]: newWrongCount }));
      setFirstAttemptMap((prev) => ({ ...prev, [currentIndex]: false }));

      if (newWrongCount >= 2) {
        setShowHint(true);
      }

      store.recordWordPractice(
        user.id,
        unit,
        currentQ.id,
        currentQ.word,
        currentQ.meaningVi,
        currentQ.ipa,
        false,
        false
      );
    }
  };

  const handleRetryCurrent = () => {
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTypedAnswer('');
      setIsAnswerSubmitted(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      const maxScore = questions.length * 10;
      const percentage = Math.round((score / maxScore) * 100);
      const passed = percentage >= 80;

      const result: VocabPracticeResult = {
        unit,
        studentId: user.id,
        practiceType: 'type_word',
        score,
        maxScore,
        percentage,
        passed,
        attemptNumber: attemptCount,
        bestScore: percentage,
        latestScore: percentage,
        correctCount: Object.values(firstAttemptMap).filter(Boolean).length,
        totalQuestions: questions.length,
        wordsPracticed: questions.map((q, idx) => ({
          word: q.word,
          isCorrect: Boolean(firstAttemptMap[idx]),
        })),
        createdAt: new Date().toISOString(),
      };

      store.saveVocabPracticeResult(result);
      setResultData(result);
      setIsFinished(true);
      onComplete();
    }
  };

  const handleRetryAll = () => {
    setAttemptCount((prev) => prev + 1);
    initExercise();
  };

  if (isFinished && resultData) {
    const wrongList = questions
      .filter((_, idx) => !firstAttemptMap[idx])
      .map((q) => ({ word: q.word, meaningVi: q.meaningVi, ipa: q.ipa }));

    return (
      <PracticeResultSummary
        practiceType="type_word"
        score={resultData.score}
        maxScore={resultData.maxScore}
        percentage={resultData.percentage}
        passed={resultData.passed}
        attemptNumber={attemptCount}
        wrongWords={wrongList}
        onRetry={handleRetryAll}
        onNext={onNext}
        onBackToRoadmap={onBackToRoadmap}
      />
    );
  }

  if (!currentQ) return null;

  const hintMask = generateWordMaskedHint(currentQ.word);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-12 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DDD0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#4B5D44] bg-[#E8EFE6] px-2.5 py-0.5 rounded-full border border-[#C6D8C2]">
              Luyện từ vựng • Bài 4/6
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
            Gõ từ vựng tiếng Anh
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B57]">
            Nhìn nghĩa tiếng Việt và gõ từ/cụm từ tiếng Anh tương ứng.
          </p>
        </div>

        {/* Question Counter */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5DDD0]">
          <span className="text-xs text-[#5C6B57] font-bold">Câu hỏi</span>
          <span className="text-lg font-black text-[#2D332A] font-serif">
            {currentIndex + 1} <span className="text-xs text-[#8C9886]">/ {questions.length}</span>
          </span>
        </div>
      </div>

      {/* Prompt Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD0] shadow-sm text-center space-y-4">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-bold text-[#8E5D32] bg-[#FAF7F2] border border-[#E5DDD0] px-3 py-1 rounded-full uppercase tracking-wider">
            {currentQ.partOfSpeech}
          </span>
          <span className="text-xs text-[#5C6B57] font-medium">
            {currentQ.word.length} ký tự
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#8C9886] font-bold">Nghĩa tiếng Việt</p>
          <h3 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif tracking-tight">
            "{currentQ.meaningVi}"
          </h3>
        </div>

        {/* Masked Hint if triggered */}
        {showHint && (
          <div className="p-3 bg-[#FAF7F2] border border-[#E5DDD0] rounded-2xl inline-block max-w-md animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#BC8A5F] mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Gợi ý chữ cái đầu & cuối:</span>
            </div>
            <p className="font-mono text-base font-black tracking-widest text-[#2D332A]">{hintMask}</p>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmitAnswer} className="space-y-3">
        <div className="relative">
          <input
            id="type-word-input"
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

        {/* Hint toggle button if not shown yet */}
        {!showHint && !isAnswerSubmitted && (wrongAttemptCounts[currentIndex] || 0) >= 1 && (
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="text-xs font-bold text-[#BC8A5F] hover:text-[#8E5D32] flex items-center gap-1 cursor-pointer mx-auto"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Xem gợi ý chữ cái (-5đ)</span>
          </button>
        )}
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
                {isCorrect ? 'Chính xác! (+10 điểm)' : 'Chưa chính xác!'}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#5C6B57]">
                <span>Đáp án đúng:</span>
                <span className="font-bold text-[#2D332A] text-sm font-serif">{currentQ.word}</span>
                <span className="font-mono text-[#8C9886]">{currentQ.ipa}</span>
                <button
                  type="button"
                  onClick={() => audioService.speak(currentQ.audioText, 0.88)}
                  className="text-[#4B5D44] hover:text-[#3D4C37] cursor-pointer ml-1"
                  title="Nghe phát âm"
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
                <span>Gõ lại (5đ)</span>
              </button>
            )}

            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 rounded-xl bg-[#4B5D44] hover:bg-[#3D4C37] text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <span>{currentIndex < questions.length - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
