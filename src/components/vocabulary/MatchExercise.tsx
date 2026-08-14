import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Sparkles, RotateCcw, ArrowRight, Volume2 } from 'lucide-react';
import { UserProfile, VocabPracticeResult } from '../../types';
import { VOCABULARY_RAW_DATA } from '../../data/vocabularyData';
import { store } from '../../services/store';
import { audioService } from '../../services/audioService';
import { PracticeResultSummary } from './PracticeResultSummary';

interface MatchExerciseProps {
  unit: number;
  user: UserProfile;
  onComplete: () => void;
  onNext: () => void;
  onBackToRoadmap: () => void;
}

interface MatchItem {
  id: number;
  word: string;
  ipa: string;
  meaningVi: string;
  audioText: string;
}

export const MatchExercise: React.FC<MatchExerciseProps> = ({
  unit,
  user,
  onComplete,
  onNext,
  onBackToRoadmap,
}) => {
  // Load current unit vocabulary
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

  const [selectedPairs, setSelectedPairs] = useState<MatchItem[]>([]);
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ leftId: number; rightId: number } | null>(null);
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState<Set<number>>(new Set());
  const [wrongAttemptWords, setWrongAttemptWords] = useState<Set<number>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [resultData, setResultData] = useState<VocabPracticeResult | null>(null);

  // Initialize 5 unique random words
  const initExercise = () => {
    if (unitVocab.length === 0) return;
    // Check words needing review first to prioritise
    const reviewWords = store.getWordsNeedingReview(user.id, unit, 5);
    const reviewIds = new Set(reviewWords.map((r) => Number(r.wordId)));

    const reviewItems = unitVocab.filter((v) => reviewIds.has(v.id));
    const otherItems = unitVocab.filter((v) => !reviewIds.has(v.id));
    const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());

    const chosen: MatchItem[] = [...reviewItems, ...shuffledOthers].slice(0, Math.min(5, unitVocab.length));

    setSelectedPairs(chosen);
    setLeftItems([...chosen].sort(() => 0.5 - Math.random()));
    setRightItems([...chosen].sort(() => 0.5 - Math.random()));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds(new Set());
    setWrongPair(null);
    setFirstAttemptCorrect(new Set());
    setWrongAttemptWords(new Set());
    setIsFinished(false);
    setResultData(null);
  };

  useEffect(() => {
    initExercise();
  }, [unit]);

  const handleSelectLeft = (id: number) => {
    if (matchedIds.has(id)) return;
    setSelectedLeft(id);
    setWrongPair(null);

    // Speak word
    const item = selectedPairs.find((p) => p.id === id);
    if (item) {
      audioService.speak(item.audioText, 0.88);
    }

    if (selectedRight !== null) {
      checkMatch(id, selectedRight);
    }
  };

  const handleSelectRight = (id: number) => {
    if (matchedIds.has(id)) return;
    setSelectedRight(id);
    setWrongPair(null);

    if (selectedLeft !== null) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: number, rightId: number) => {
    const leftItem = selectedPairs.find((p) => p.id === leftId);

    if (leftId === rightId) {
      // Correct match!
      const newMatched = new Set<number>();
      matchedIds.forEach((id) => newMatched.add(id));
      newMatched.add(leftId);
      setMatchedIds(newMatched);

      const isFirst = !wrongAttemptWords.has(leftId);
      if (isFirst) {
        const newFirst = new Set<number>();
        firstAttemptCorrect.forEach((id) => newFirst.add(id));
        newFirst.add(leftId);
        setFirstAttemptCorrect(newFirst);
      }

      if (leftItem) {
        store.recordWordPractice(
          user.id,
          unit,
          leftItem.id,
          leftItem.word,
          leftItem.meaningVi,
          leftItem.ipa,
          true,
          isFirst
        );
      }

      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if all pairs are matched
      if (newMatched.size === selectedPairs.length) {
        const finalFirst = new Set<number>();
        firstAttemptCorrect.forEach((id) => finalFirst.add(id));
        if (isFirst) finalFirst.add(leftId);
        handleFinish(newMatched, finalFirst);
      }
    } else {
      // Wrong match
      setWrongPair({ leftId, rightId });
      const newWrong = new Set<number>();
      wrongAttemptWords.forEach((id) => newWrong.add(id));
      newWrong.add(leftId);
      setWrongAttemptWords(newWrong);

      if (leftItem) {
        store.recordWordPractice(
          user.id,
          unit,
          leftItem.id,
          leftItem.word,
          leftItem.meaningVi,
          leftItem.ipa,
          false,
          false
        );
      }

      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleFinish = (matched: Set<number>, firstCorrect: Set<number>) => {
    // Scoring: 20 points per pair
    // First attempt = 20 pts, retried after error = 10 pts
    let totalScore = 0;
    selectedPairs.forEach((pair) => {
      if (firstCorrect.has(pair.id)) {
        totalScore += 20;
      } else if (matched.has(pair.id)) {
        totalScore += 10;
      }
    });

    const maxScore = selectedPairs.length * 20; // 100
    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= 80;

    const result: VocabPracticeResult = {
      unit,
      studentId: user.id,
      practiceType: 'match',
      score: totalScore,
      maxScore,
      percentage,
      passed,
      attemptNumber: attemptCount,
      bestScore: percentage,
      latestScore: percentage,
      correctCount: firstCorrect.size,
      totalQuestions: selectedPairs.length,
      wordsPracticed: selectedPairs.map((p) => ({
        word: p.word,
        isCorrect: firstCorrect.has(p.id),
      })),
      createdAt: new Date().toISOString(),
    };

    store.saveVocabPracticeResult(result);
    setResultData(result);
    setIsFinished(true);
    onComplete();
  };

  const handleRetry = () => {
    setAttemptCount((prev) => prev + 1);
    initExercise();
  };

  if (isFinished && resultData) {
    const wrongList = selectedPairs.filter((p) => !firstAttemptCorrect.has(p.id));
    return (
      <PracticeResultSummary
        practiceType="match"
        score={resultData.score}
        maxScore={resultData.maxScore}
        percentage={resultData.percentage}
        passed={resultData.passed}
        attemptNumber={attemptCount}
        wrongWords={wrongList}
        onRetry={handleRetry}
        onNext={onNext}
        onBackToRoadmap={onBackToRoadmap}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 pb-12 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DDD0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧩</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#4B5D44] bg-[#E8EFE6] px-2.5 py-0.5 rounded-full border border-[#C6D8C2]">
              Luyện từ vựng • Bài 1/6
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
            Nối từ với nghĩa tiếng Việt
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B57]">
            Chạm vào từ tiếng Anh ở cột trái, sau đó chạm vào nghĩa tương ứng ở cột phải.
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5DDD0]">
          <span className="text-xs text-[#5C6B57] font-bold">Tiến độ nối</span>
          <span className="text-lg font-black text-[#2D332A] font-serif">
            {matchedIds.size} <span className="text-xs text-[#8C9886]">/ {selectedPairs.length} cặp</span>
          </span>
        </div>
      </div>

      {/* Matching Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: English Words */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#5C6B57] px-1">
            Từ tiếng Anh (English)
          </h3>
          <div className="space-y-2.5">
            {leftItems.map((item) => {
              const isMatched = matchedIds.has(item.id);
              const isSelected = selectedLeft === item.id;
              const isWrong = wrongPair?.leftId === item.id;

              return (
                <button
                  key={`left-${item.id}`}
                  onClick={() => handleSelectLeft(item.id)}
                  disabled={isMatched}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isMatched
                      ? 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732] opacity-75 shadow-none'
                      : isWrong
                      ? 'bg-[#F9EBE9] border-[#E8C2BD] text-[#88372A] animate-shake'
                      : isSelected
                      ? 'bg-[#FAF7F2] border-[#4B5D44] ring-2 ring-[#4B5D44]/30 shadow-sm'
                      : 'bg-white hover:bg-[#FAF7F2] border-[#E5DDD0] text-[#2D332A] hover:border-[#4B5D44]/40 shadow-xs'
                  }`}
                >
                  <div>
                    <p className="font-extrabold text-base">{item.word}</p>
                    <p className="text-xs text-[#8C9886] font-mono mt-0.5">{item.ipa}</p>
                  </div>
                  {isMatched ? (
                    <div className="w-7 h-7 rounded-full bg-[#4B5D44] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#8C9886] shrink-0 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Vietnamese Meanings */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#5C6B57] px-1">
            Nghĩa tiếng Việt (Vietnamese)
          </h3>
          <div className="space-y-2.5">
            {rightItems.map((item) => {
              const isMatched = matchedIds.has(item.id);
              const isSelected = selectedRight === item.id;
              const isWrong = wrongPair?.rightId === item.id;

              return (
                <button
                  key={`right-${item.id}`}
                  onClick={() => handleSelectRight(item.id)}
                  disabled={isMatched}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isMatched
                      ? 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732] opacity-75 shadow-none'
                      : isWrong
                      ? 'bg-[#F9EBE9] border-[#E8C2BD] text-[#88372A] animate-shake'
                      : isSelected
                      ? 'bg-[#FAF7F2] border-[#4B5D44] ring-2 ring-[#4B5D44]/30 shadow-sm'
                      : 'bg-white hover:bg-[#FAF7F2] border-[#E5DDD0] text-[#2D332A] hover:border-[#4B5D44]/40 shadow-xs'
                  }`}
                >
                  <p className="font-bold text-sm text-[#2D332A]">{item.meaningVi}</p>
                  {isMatched && (
                    <div className="w-7 h-7 rounded-full bg-[#4B5D44] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
