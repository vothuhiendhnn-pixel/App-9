import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, Check, X, ArrowRight, RotateCcw, Volume2, Sparkles, Lightbulb } from 'lucide-react';
import { UserProfile, VocabPracticeResult, VocabPracticeType } from '../../types';
import { VOCABULARY_RAW_DATA } from '../../data/vocabularyData';
import { store } from '../../services/store';
import { audioService } from '../../services/audioService';
import {
  getUnitContextQuestions,
  checkWordAnswerMatch,
  generateWordMaskedHint,
} from '../../data/vocabularyPracticeData';
import { PracticeResultSummary } from './PracticeResultSummary';

interface VocabularyChallengeExerciseProps {
  unit: number;
  user: UserProfile;
  onComplete: () => void;
  onNext: () => void;
  onBackToRoadmap: () => void;
}

interface ChallengeQuestion {
  type: 'choose_meaning' | 'listen_and_choose' | 'type_word' | 'complete_sentence';
  id: number | string;
  word: string;
  ipa: string;
  meaningVi: string;
  audioText: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  contextSentence?: string;
}

export const VocabularyChallengeExercise: React.FC<VocabularyChallengeExerciseProps> = ({
  unit,
  user,
  onComplete,
  onNext,
  onBackToRoadmap,
}) => {
  const unitVocab = useMemo(() => {
    const raw = VOCABULARY_RAW_DATA.find((u) => u.unit === unit);
    return raw ? raw.vocabulary : [];
  }, [unit]);

  const contextBank = useMemo(() => {
    return getUnitContextQuestions(unit);
  }, [unit]);

  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [firstAttemptMap, setFirstAttemptMap] = useState<Record<number, boolean>>({});
  const [retryMap, setRetryMap] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [resultData, setResultData] = useState<VocabPracticeResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const initChallenge = () => {
    if (unitVocab.length === 0) return;

    // Prioritise review words 3x weight
    const reviewWords = store.getWordsNeedingReview(user.id, unit, 10);
    const reviewIds = new Set(reviewWords.map((r) => Number(r.wordId)));

    const weightedVocab = [...unitVocab].sort((a, b) => {
      const aWeight = reviewIds.has(a.id) ? 3 : 1;
      const bWeight = reviewIds.has(b.id) ? 3 : 1;
      return (bWeight - aWeight) + (Math.random() - 0.5);
    });

    const qList: ChallengeQuestion[] = [];

    // 1. Choose Meaning (2 questions)
    const chooseItems = weightedVocab.slice(0, 2);
    chooseItems.forEach((item) => {
      const distractors = unitVocab
        .filter((v) => v.id !== item.id && v.meaning_vi !== item.meaning_vi)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((d) => d.meaning_vi);
      qList.push({
        type: 'choose_meaning',
        id: item.id,
        word: item.word,
        ipa: item.ipa,
        meaningVi: item.meaning_vi,
        audioText: item.audio_text,
        prompt: item.word,
        options: [item.meaning_vi, ...distractors].sort(() => 0.5 - Math.random()),
        correctAnswer: item.meaning_vi,
      });
    });

    // 2. Listen and Choose (3 questions)
    const listenItems = weightedVocab.slice(2, 5);
    listenItems.forEach((item) => {
      const distractors = unitVocab
        .filter((v) => v.id !== item.id && v.word !== item.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((d) => d.word);
      qList.push({
        type: 'listen_and_choose',
        id: item.id,
        word: item.word,
        ipa: item.ipa,
        meaningVi: item.meaning_vi,
        audioText: item.audio_text,
        prompt: 'Nghe phát âm và chọn từ:',
        options: [item.word, ...distractors].sort(() => 0.5 - Math.random()),
        correctAnswer: item.word,
      });
    });

    // 3. Type Word (3 questions)
    const typeItems = weightedVocab.slice(5, 8);
    typeItems.forEach((item) => {
      qList.push({
        type: 'type_word',
        id: item.id,
        word: item.word,
        ipa: item.ipa,
        meaningVi: item.meaning_vi,
        audioText: item.audio_text,
        prompt: item.meaning_vi,
        correctAnswer: item.word,
      });
    });

    // 4. Complete Sentence (2 questions)
    const sentenceItems = [...contextBank].sort(() => 0.5 - Math.random()).slice(0, 2);
    sentenceItems.forEach((s) => {
      const item = unitVocab.find((v) => checkWordAnswerMatch(v.word, s.answer));
      qList.push({
        type: 'complete_sentence',
        id: s.id,
        word: s.answer,
        ipa: item?.ipa || '',
        meaningVi: item?.meaning_vi || '',
        audioText: s.answer,
        prompt: s.sentence,
        correctAnswer: s.answer,
        contextSentence: s.sentence,
      });
    });

    // Final shuffle of the 10 questions
    const final10 = [...qList].slice(0, 10).sort(() => 0.5 - Math.random());

    setQuestions(final10);
    setCurrentIndex(0);
    setSelectedOption(null);
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setFirstAttemptMap({});
    setRetryMap({});
    setScore(0);
    setIsFinished(false);
    setResultData(null);
    setShowHint(false);
  };

  useEffect(() => {
    initChallenge();
  }, [unit]);

  const currentQ = questions[currentIndex];

  // Auto-speak on question if listen_and_choose
  useEffect(() => {
    if (currentQ && !isFinished) {
      if (currentQ.type === 'listen_and_choose') {
        audioService.speak(currentQ.audioText, 0.82);
      }
    }
  }, [currentIndex, currentQ, isFinished]);

  useEffect(() => {
    if (inputRef.current && !isAnswerSubmitted && !isFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswerSubmitted, isFinished]);

  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
    checkAnswer(opt);
  };

  const handleSubmitTyped = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedAnswer.trim() || isAnswerSubmitted) return;
    checkAnswer(typedAnswer);
  };

  const checkAnswer = (answer: string) => {
    const correct =
      currentQ.type === 'choose_meaning' || currentQ.type === 'listen_and_choose'
        ? answer === currentQ.correctAnswer
        : checkWordAnswerMatch(answer, currentQ.correctAnswer);

    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

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
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
    if (currentQ.type === 'listen_and_choose') {
      audioService.speak(currentQ.audioText, 0.82);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
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
        practiceType: 'challenge',
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
    initChallenge();
  };

  if (isFinished && resultData) {
    const wrongList = questions
      .filter((_, idx) => !firstAttemptMap[idx])
      .map((q) => ({ word: q.word, meaningVi: q.meaningVi, ipa: q.ipa }));

    return (
      <PracticeResultSummary
        practiceType="challenge"
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
            <span className="text-xl">🏆</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#BC8A5F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#E5DDD0]">
              Vocabulary Challenge • Unit {unit}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
            Thử thách tổng hợp từ vựng
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B57]">
            10 câu tổng hợp các dạng bài. Đạt 80% trở lên để hoàn thành Unit!
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

      {/* Dynamic Question Card based on Question Type */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DDD0] shadow-sm text-center space-y-5">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-bold text-[#8E5D32] bg-[#FAF7F2] border border-[#E5DDD0] px-3 py-1 rounded-full uppercase tracking-wider">
            {currentQ.type === 'choose_meaning' && 'Dạng 1: Chọn nghĩa'}
            {currentQ.type === 'listen_and_choose' && 'Dạng 2: Nghe & Chọn'}
            {currentQ.type === 'type_word' && 'Dạng 3: Gõ từ vựng'}
            {currentQ.type === 'complete_sentence' && 'Dạng 4: Điền câu'}
          </span>
        </div>

        {/* Type 1: Choose Meaning */}
        {currentQ.type === 'choose_meaning' && (
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-[#2D332A] font-serif">{currentQ.word}</h3>
            <p className="text-sm font-mono text-[#5C6B57]">{currentQ.ipa}</p>
          </div>
        )}

        {/* Type 2: Listen and Choose */}
        {currentQ.type === 'listen_and_choose' && (
          <div className="space-y-3">
            <button
              onClick={() => audioService.speak(currentQ.audioText, 0.82)}
              className="w-16 h-16 mx-auto rounded-2xl bg-[#4B5D44] hover:bg-[#3D4C37] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Volume2 className="w-7 h-7" />
            </button>
            <p className="text-xs font-extrabold text-[#5C6B57]">Bấm để nghe từ chuẩn en-GB</p>
          </div>
        )}

        {/* Type 3: Type Word */}
        {currentQ.type === 'type_word' && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C9886]">Nghĩa tiếng Việt</p>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif">
              "{currentQ.meaningVi}"
            </h3>
            {showHint && (
              <p className="font-mono text-sm font-black text-[#8E5D32] bg-[#FAF7F2] p-2 rounded-xl border border-[#E5DDD0] inline-block">
                {generateWordMaskedHint(currentQ.word)}
              </p>
            )}
          </div>
        )}

        {/* Type 4: Complete Sentence */}
        {currentQ.type === 'complete_sentence' && currentQ.contextSentence && (
          <div className="space-y-3">
            <p className="text-lg font-bold text-[#2D332A] leading-relaxed">
              {currentQ.contextSentence.replace('______', isAnswerSubmitted ? `[ ${currentQ.correctAnswer} ]` : '______')}
            </p>
          </div>
        )}
      </div>

      {/* Answer Controls: Options or Text Input */}
      {currentQ.options ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isTarget = opt === currentQ.correctAnswer;

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
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswerSubmitted}
                className={`p-4 rounded-2xl border text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] text-xs font-black text-[#5C6B57] flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
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
      ) : (
        <form onSubmit={handleSubmitTyped} className="space-y-3">
          <div className="relative">
            <input
              id="challenge-typed-input"
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
      )}

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
                <span className="font-bold text-[#2D332A] text-sm font-serif">
                  {currentQ.correctAnswer}
                </span>
                {currentQ.meaningVi && <span>• {currentQ.meaningVi}</span>}
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
