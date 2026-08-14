import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Check, X, ArrowRight, RotateCcw, Headphones, Sparkles } from 'lucide-react';
import { UserProfile, VocabPracticeResult } from '../../types';
import { VOCABULARY_RAW_DATA } from '../../data/vocabularyData';
import { store } from '../../services/store';
import { audioService } from '../../services/audioService';
import { PracticeResultSummary } from './PracticeResultSummary';

interface ListenChooseExerciseProps {
  unit: number;
  user: UserProfile;
  onComplete: () => void;
  onNext: () => void;
  onBackToRoadmap: () => void;
}

interface ListenQuestionItem {
  id: number;
  word: string;
  ipa: string;
  meaningVi: string;
  audioText: string;
  options: string[];
}

export const ListenChooseExercise: React.FC<ListenChooseExerciseProps> = ({
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
      meaningVi: v.meaning_vi,
      audioText: v.audio_text,
    }));
  }, [unit]);

  const [questions, setQuestions] = useState<ListenQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [firstAttemptMap, setFirstAttemptMap] = useState<Record<number, boolean>>({});
  const [retryMap, setRetryMap] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [resultData, setResultData] = useState<VocabPracticeResult | null>(null);

  const maxPlays = 3;

  const initExercise = () => {
    if (unitVocab.length === 0) return;

    // Prioritise review words
    const reviewWords = store.getWordsNeedingReview(user.id, unit, 5);
    const reviewIds = new Set(reviewWords.map((r) => Number(r.wordId)));

    const reviewItems = unitVocab.filter((v) => reviewIds.has(v.id));
    const otherItems = unitVocab.filter((v) => !reviewIds.has(v.id));
    const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());

    const chosen = [...reviewItems, ...shuffledOthers].slice(0, Math.min(10, unitVocab.length));

    const qList: ListenQuestionItem[] = chosen.map((item) => {
      const distractors = unitVocab
        .filter((v) => v.id !== item.id && v.word !== item.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((d) => d.word);

      const allOptions = [item.word, ...distractors].sort(() => 0.5 - Math.random());

      return {
        id: item.id,
        word: item.word,
        ipa: item.ipa,
        meaningVi: item.meaningVi,
        audioText: item.audioText,
        options: allOptions,
      };
    });

    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setPlayCount(0);
    setFirstAttemptMap({});
    setRetryMap({});
    setScore(0);
    setIsFinished(false);
    setResultData(null);
  };

  useEffect(() => {
    initExercise();
  }, [unit]);

  const currentQ = questions[currentIndex];

  const playAudio = () => {
    if (!currentQ || isPlayingAudio) return;
    if (playCount >= maxPlays && !isAnswerSubmitted) return;

    setIsPlayingAudio(true);
    setPlayCount((prev) => prev + 1);

    audioService.speak(currentQ.audioText, 0.82, () => {
      setIsPlayingAudio(false);
    });
  };

  // Play audio on question switch
  useEffect(() => {
    if (currentQ && !isFinished) {
      setPlayCount(0);
      setIsPlayingAudio(true);
      setPlayCount(1);
      audioService.speak(currentQ.audioText, 0.82, () => {
        setIsPlayingAudio(false);
      });
    }
  }, [currentIndex, currentQ]);

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
    setIsAnswerSubmitted(true);

    const correct = option === currentQ.word;
    setIsCorrect(correct);

    const isFirst = firstAttemptMap[currentIndex] === undefined && !retryMap[currentIndex];

    if (correct) {
      if (isFirst) {
        setFirstAttemptMap((prev) => ({ ...prev, [currentIndex]: true }));
        setScore((prev) => prev + 10);
      } else {
        setScore((prev) => prev + 5);
      }

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
      setFirstAttemptMap((prev) => ({ ...prev, [currentIndex]: false }));
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
    setRetryMap((prev) => ({ ...prev, [currentIndex]: true }));
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    playAudio();
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsCorrect(false);
    } else {
      const maxScore = questions.length * 10;
      const percentage = Math.round((score / maxScore) * 100);
      const passed = percentage >= 80;

      const result: VocabPracticeResult = {
        unit,
        studentId: user.id,
        practiceType: 'listen_and_choose',
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
        practiceType="listen_and_choose"
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 pb-12 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DDD0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎧</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#4B5D44] bg-[#E8EFE6] px-2.5 py-0.5 rounded-full border border-[#C6D8C2]">
              Luyện từ vựng • Bài 3/6
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
            Nghe và chọn từ đúng
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B57]">
            Lắng nghe phát âm chuẩn giọng British English (en-GB) và chọn từ tương ứng.
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

      {/* Audio Player Card (Word is strictly HIDDEN before answering) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD0] shadow-sm text-center space-y-5">
        <div className="space-y-2">
          <button
            onClick={playAudio}
            disabled={isPlayingAudio || (playCount >= maxPlays && !isAnswerSubmitted)}
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white transition-all shadow-md cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#8E5D32] ring-4 ring-[#BC8A5F]/40 scale-105'
                : playCount >= maxPlays && !isAnswerSubmitted
                ? 'bg-[#A8B2A4] cursor-not-allowed opacity-75'
                : 'bg-[#4B5D44] hover:bg-[#3D4C37] hover:scale-105 active:scale-95'
            }`}
          >
            <Volume2 className={`w-8 h-8 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          </button>

          <div className="space-y-1">
            <p className="font-extrabold text-sm text-[#2D332A]">
              {isPlayingAudio ? 'Đang phát âm thanh...' : 'Bấm để nghe từ'}
            </p>
            <p className="text-xs text-[#5C6B57]">
              Lần nghe:{' '}
              <span className="font-bold text-[#2D332A]">
                {playCount} / {maxPlays}
              </span>{' '}
              {isAnswerSubmitted && '• Đã mở khóa nghe lại không giới hạn'}
            </p>
          </div>
        </div>

        {/* Revealed Word Info only AFTER submission */}
        {isAnswerSubmitted ? (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-1 animate-fadeIn">
            <p className="font-black text-2xl text-[#2D332A] font-serif">{currentQ.word}</p>
            <p className="text-xs font-mono text-[#5C6B57]">{currentQ.ipa}</p>
            <p className="text-xs font-semibold text-[#8E5D32]">{currentQ.meaningVi}</p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#E5DDD0] text-xs text-[#8C9886] font-medium">
            🔒 Từ tiếng Anh được ẩn đi để luyện kỹ năng nghe của em
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isTarget = option === currentQ.word;

          let btnStyle = 'bg-white hover:bg-[#FAF7F2] border-[#E5DDD0] text-[#2D332A] shadow-xs';

          if (isAnswerSubmitted) {
            if (isTarget) {
              btnStyle = 'bg-[#E8EFE6] border-[#4B5D44] text-[#384732] ring-2 ring-[#4B5D44]/30 font-black';
            } else if (isSelected && !isTarget) {
              btnStyle = 'bg-[#F9EBE9] border-[#E8C2BD] text-[#88372A]';
            } else {
              btnStyle = 'bg-white border-[#E5DDD0] text-[#8C9886] opacity-60';
            }
          }

          return (
            <button
              key={`opt-${idx}`}
              onClick={() => handleSelectOption(option)}
              disabled={isAnswerSubmitted}
              className={`p-4 rounded-2xl border text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] text-xs font-black text-[#5C6B57] flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              {isAnswerSubmitted && isTarget && (
                <Check className="w-5 h-5 text-[#4B5D44] shrink-0" />
              )}
              {isAnswerSubmitted && isSelected && !isTarget && (
                <X className="w-5 h-5 text-[#88372A] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

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
              <p className="text-xs text-[#5C6B57]">
                Từ đúng: <span className="font-bold text-[#2D332A]">{currentQ.word}</span> • {currentQ.meaningVi}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isCorrect && (
              <button
                onClick={handleRetryCurrent}
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#2D332A] border border-[#E5DDD0] font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thử lại (5đ)</span>
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
