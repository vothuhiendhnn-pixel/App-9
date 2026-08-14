import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, ListeningLesson, ListeningUnit, ListeningAssessmentResult, BlankCheckResult } from '../types';
import { LISTENING_UNITS_DATA, getListeningByUnit } from '../data/listeningData';
import { store } from '../services/store';
import { audioService } from '../services/audioService';
import {
  Headphones,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  HelpCircle,
  FileText,
  Lock,
  Unlock,
  AlertCircle,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ListeningScreenProps {
  user: UserProfile;
  initialUnitId?: number;
  onBack: () => void;
  onUpdateProgress?: () => void;
}

export const ListeningScreen: React.FC<ListeningScreenProps> = ({
  user,
  initialUnitId = 1,
  onBack,
  onUpdateProgress,
}) => {
  // Unit & Lesson State
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number>(initialUnitId);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);

  // Form & Interaction State
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ListeningAssessmentResult | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // Audio Playback State
  const [playCount, setPlayCount] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const maxPlaysBeforeCheck = 3;

  // Celebration Modal
  const [showUnitCompletionModal, setShowUnitCompletionModal] = useState<boolean>(false);

  // Units list
  const currentUnit: ListeningUnit = useMemo(() => {
    return (
      LISTENING_UNITS_DATA.find((u) => u.unit === selectedUnitNumber) ||
      LISTENING_UNITS_DATA[0]
    );
  }, [selectedUnitNumber]);

  const currentLesson: ListeningLesson = useMemo(() => {
    return currentUnit.lessons[currentLessonIndex] || currentUnit.lessons[0];
  }, [currentUnit, currentLessonIndex]);

  // Load previous state when lesson changes
  useEffect(() => {
    audioService.stop();
    setIsPlayingAudio(false);
    setShowTranscript(false);

    const savedState = store.getListeningLessonState(user.id, currentLesson.id);
    if (savedState && savedState.passed) {
      // Pre-fill answers with saved results
      const initAnswers: Record<number, string> = {};
      savedState.blankResults.forEach((b) => {
        initAnswers[b.blank] = b.studentAnswer;
      });
      setAnswers(initAnswers);
      setIsSubmitted(true);
      setSubmissionResult(savedState);
      setPlayCount(0);
    } else {
      setAnswers({});
      setIsSubmitted(false);
      setSubmissionResult(null);
      setPlayCount(0);
    }
  }, [currentLesson.id, user.id]);

  // Handle TTS audio playback
  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      audioService.stop();
      setIsPlayingAudio(false);
      return;
    }

    if (!isSubmitted && playCount >= maxPlaysBeforeCheck) {
      return;
    }

    setIsPlayingAudio(true);
    if (!isSubmitted) {
      setPlayCount((prev) => prev + 1);
    }

    // STRICT MANDATE: Send ONLY audio.audioScript to TTS. Never displayText or answers.
    audioService.speak(
      currentLesson.audio.audioScript,
      0.88,
      () => {
        setIsPlayingAudio(false);
      },
      'en-GB'
    );
  };

  const handleStopAudio = () => {
    audioService.stop();
    setIsPlayingAudio(false);
  };

  // Normalization & Answer verification
  const normalize = (text: string): string => {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    audioService.stop();
    setIsPlayingAudio(false);

    let correctCount = 0;
    const blankResults: BlankCheckResult[] = currentLesson.blanks.map((b) => {
      const studentRaw = answers[b.blank] || '';
      const studentNorm = normalize(studentRaw);
      const allAccepted = [b.answer, ...(b.acceptedAnswers || [])].map(normalize);
      const isCorrect = allAccepted.includes(studentNorm);

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        blank: b.blank,
        studentAnswer: studentRaw,
        isCorrect,
        correctAnswer: b.answer,
        acceptedAnswers: b.acceptedAnswers || [b.answer],
      };
    });

    const score = correctCount * 20;
    const passed = score >= 80;

    const result: ListeningAssessmentResult = {
      lessonId: currentLesson.id,
      studentId: user.id,
      unit: selectedUnitNumber,
      score,
      maxScore: 100,
      passed,
      correctCount,
      totalCount: currentLesson.blanks.length,
      blankResults,
      attempt: 1,
      bestScore: score,
      latestScore: score,
      createdAt: new Date().toISOString(),
    };

    store.saveListeningResult(result);
    setSubmissionResult(result);
    setIsSubmitted(true);

    if (onUpdateProgress) {
      onUpdateProgress();
    }

    if (passed) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      // Check if both lessons are now passed in this unit
      setTimeout(() => {
        const results = store.getListeningResults(user.id, selectedUnitNumber);
        const l1 = results.find((r) => r.lessonId === `U${selectedUnitNumber}L01`);
        const l2 = results.find((r) => r.lessonId === `U${selectedUnitNumber}L02`);
        const isL1Pass = l1 && (l1.passed || l1.score >= 80);
        const isL2Pass = l2 && (l2.passed || l2.score >= 80);

        if (isL1Pass && isL2Pass) {
          setShowUnitCompletionModal(true);
        }
      }, 600);
    }
  };

  const handleRetry = () => {
    audioService.stop();
    setIsPlayingAudio(false);
    setAnswers({});
    setIsSubmitted(false);
    setSubmissionResult(null);
    setPlayCount(0);
    setShowTranscript(false);
  };

  const handleNextLesson = () => {
    audioService.stop();
    setIsPlayingAudio(false);
    if (currentLessonIndex < currentUnit.lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    } else if (selectedUnitNumber < 12) {
      setSelectedUnitNumber((prev) => prev + 1);
      setCurrentLessonIndex(0);
    }
  };

  // Get progress across all units for unit selector badges
  const unitSummaries = useMemo(() => {
    const summary = store.getListeningSummary(user.id);
    return summary.listening.units;
  }, [user.id, isSubmitted, selectedUnitNumber]);

  // Check if Lesson 2 is unlocked (requires Lesson 1 passed with >= 80)
  const isLesson2Unlocked = useMemo(() => {
    const l1State = store.getListeningLessonState(user.id, `U${selectedUnitNumber}L01`);
    return Boolean(l1State && (l1State.passed || l1State.bestScore >= 80 || l1State.score >= 80));
  }, [user.id, selectedUnitNumber, isSubmitted]);

  // Splitting displayText into interactive chunks
  const parsedDisplayParts = useMemo(() => {
    // Splits by (1) ______, (2) ______, etc.
    const regex = /\((\d+)\)\s*_{3,}/g;
    const parts: { type: 'text' | 'blank'; content: string; blankNum?: number }[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(currentLesson.displayText)) !== null) {
      if (match.index > lastIdx) {
        parts.push({
          type: 'text',
          content: currentLesson.displayText.substring(lastIdx, match.index),
        });
      }
      parts.push({
        type: 'blank',
        content: match[0],
        blankNum: parseInt(match[1], 10),
      });
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < currentLesson.displayText.length) {
      parts.push({
        type: 'text',
        content: currentLesson.displayText.substring(lastIdx),
      });
    }

    return parts;
  }, [currentLesson.displayText]);

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => {
            audioService.stop();
            onBack();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3 py-1.5 rounded-xl transition-colors shadow-xs w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại bảng điều khiển</span>
        </button>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-[#E8EFE6] border border-[#C6D8C2] px-3 py-1 rounded-full text-xs font-black text-[#384732]">
            <Headphones className="w-3.5 h-3.5 text-[#4B5D44]" />
            <span>Tiếng Anh 9 - Global Success</span>
          </div>
        </div>
      </div>

      {/* Unit Selector Pills (1 - 12) */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5DDD0] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#5C6B57]">
            Chọn Unit luyện nghe (12 Units)
          </span>
          <span className="text-xs font-bold text-[#4B5D44]">
            Unit {selectedUnitNumber}: {currentUnit.title}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {LISTENING_UNITS_DATA.map((u) => {
            const isCurrent = u.unit === selectedUnitNumber;
            const uSummary = unitSummaries[`unit${u.unit}`];
            const isCompleted = uSummary?.completed;

            return (
              <button
                key={u.unit}
                onClick={() => {
                  if (u.unit !== selectedUnitNumber) {
                    audioService.stop();
                    setSelectedUnitNumber(u.unit);
                    setCurrentLessonIndex(0);
                  }
                }}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#4B5D44] text-white shadow-xs scale-105'
                    : isCompleted
                    ? 'bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2] hover:bg-[#DCE7D9]'
                    : 'bg-[#FAF7F2] text-[#5C6B57] border border-[#E5DDD0] hover:border-[#4B5D44]/40 hover:text-[#2D332A]'
                }`}
              >
                <span>Unit {u.unit}</span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#384732]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lesson Content Card */}
      <div className="bg-white rounded-[24px] border border-[#E5DDD0] shadow-xs overflow-hidden">
        {/* Lesson Tabs Header */}
        <div className="bg-[#FAF7F2] border-b border-[#E5DDD0] px-5 pt-4 pb-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {currentUnit.lessons.map((lesson, idx) => {
              const isSelected = idx === currentLessonIndex;
              const isLocked = idx === 1 && !isLesson2Unlocked;
              const lessonState = store.getListeningLessonState(user.id, lesson.id);
              const isPassed = lessonState && (lessonState.passed || lessonState.score >= 80);

              return (
                <button
                  key={lesson.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked && idx !== currentLessonIndex) {
                      audioService.stop();
                      setCurrentLessonIndex(idx);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 border-t border-x ${
                    isSelected
                      ? 'bg-white border-[#E5DDD0] text-[#2D332A] shadow-xs'
                      : isLocked
                      ? 'bg-transparent border-transparent text-[#9DAA98] cursor-not-allowed'
                      : 'bg-transparent border-transparent text-[#5C6B57] hover:text-[#2D332A]'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-[#9DAA98]" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4B5D44]" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-[#E5DDD0] text-[#5C6B57] text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                  )}
                  <span>{lesson.title}</span>
                  {lessonState && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isPassed ? 'bg-[#E8EFE6] text-[#384732]' : 'bg-[#F9EBE9] text-[#88372A]'
                      }`}
                    >
                      {lessonState.bestScore ?? lessonState.score}đ
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pb-3 text-xs font-bold text-[#5C6B57] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#8E5D32]" />
            <span>Mục tiêu: Đạt ≥ 80/100 điểm</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Lesson Title & Instructions */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#4B5D44] text-[#F7F3E9] text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase">
                {currentLesson.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
                {currentLesson.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C6B57] leading-relaxed">
              🎧 <strong>Hướng dẫn:</strong> Lắng nghe đoạn audio phát âm chuẩn British English (en-GB) và điền từ thích hợp vào 5 chỗ trống (1) - (5). Bạn được nghe tối đa 3 lần trước khi nộp bài.
            </p>
          </div>

          {/* Audio Player Controller Box */}
          <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E5DDD0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                id="play-listening-audio-btn"
                onClick={handlePlayAudio}
                disabled={!isSubmitted && playCount >= maxPlaysBeforeCheck && !isPlayingAudio}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xs flex-shrink-0 ${
                  isPlayingAudio
                    ? 'bg-[#88372A] text-white animate-pulse'
                    : !isSubmitted && playCount >= maxPlaysBeforeCheck
                    ? 'bg-[#E5DDD0] text-[#9DAA98] cursor-not-allowed'
                    : 'bg-[#4B5D44] hover:bg-[#3D4C37] text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-7 h-7" />
                ) : (
                  <Volume2 className="w-7 h-7" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#2D332A]">
                    {isPlayingAudio
                      ? 'Đang phát âm chuẩn British English...'
                      : isSubmitted
                      ? 'Nghe lại để luyện phát âm & kiểm tra'
                      : playCount === 0
                      ? 'Bấm để nghe audio'
                      : `Đã nghe ${playCount}/${maxPlaysBeforeCheck} lần`}
                  </span>
                  {isPlayingAudio && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-3 bg-[#4B5D44] animate-bounce rounded-full" />
                      <span className="w-1.5 h-4 bg-[#4B5D44] animate-bounce delay-75 rounded-full" />
                      <span className="w-1.5 h-2 bg-[#4B5D44] animate-bounce delay-150 rounded-full" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#5C6B57]">
                  <span className="font-semibold">Giọng đọc: British English (en-GB, 0.88x)</span>
                  <span className="font-bold">•</span>
                  {!isSubmitted ? (
                    <span
                      className={`font-bold ${
                        playCount >= maxPlaysBeforeCheck ? 'text-[#88372A]' : 'text-[#384732]'
                      }`}
                    >
                      {playCount >= maxPlaysBeforeCheck
                        ? 'Hết lượt nghe trước nộp bài'
                        : `Còn lại ${maxPlaysBeforeCheck - playCount} lượt nghe`}
                    </span>
                  ) : (
                    <span className="text-[#384732] font-bold">Lượt nghe không giới hạn</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isPlayingAudio && (
                <button
                  onClick={handleStopAudio}
                  className="px-3 py-1.5 bg-white border border-[#E5DDD0] text-xs font-bold text-[#88372A] rounded-xl hover:bg-[#F9EBE9] transition-colors"
                >
                  Dừng phát
                </button>
              )}
              {isSubmitted && (
                <button
                  onClick={() => setShowTranscript((prev) => !prev)}
                  className="px-3.5 py-2 bg-white border border-[#E5DDD0] text-xs font-extrabold text-[#5C6B57] hover:text-[#2D332A] rounded-xl hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showTranscript ? 'Ẩn Transcript' : 'Xem Transcript'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Transcript Viewer (Unlocked after submission or toggle) */}
          {showTranscript && isSubmitted && (
            <div className="bg-[#FAF2E4] border border-[#F0DEBA] rounded-2xl p-5 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-black text-[#875514] uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Audio Transcript (Lời thoại chuẩn)</span>
              </div>
              <p className="text-sm font-serif text-[#2D332A] leading-relaxed italic bg-white/80 p-4 rounded-xl border border-[#F0DEBA]/50">
                "{currentLesson.audio.audioScript}"
              </p>
            </div>
          )}

          {/* Exercise Area: Fill in the blanks in paragraph */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#5C6B57] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#4B5D44]" />
              <span>Nội dung bài nghe & Điền từ</span>
            </h3>

            {/* Interactive paragraph rendering with inline inputs */}
            <div className="bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-2xl p-6 sm:p-7 text-base sm:text-lg leading-loose font-serif text-[#2D332A]">
              {parsedDisplayParts.map((part, index) => {
                if (part.type === 'text') {
                  return <span key={index}>{part.content}</span>;
                }

                const blankNum = part.blankNum || 1;
                const value = answers[blankNum] || '';
                const blankCheck = submissionResult?.blankResults.find(
                  (b) => b.blank === blankNum
                );

                return (
                  <span
                    key={index}
                    className="inline-flex items-center align-middle mx-1 my-1 relative group"
                  >
                    <span className="text-xs font-sans font-black text-[#8E5D32] mr-1">
                      ({blankNum})
                    </span>
                    <input
                      id={`blank-input-${blankNum}`}
                      type="text"
                      disabled={isSubmitted}
                      value={value}
                      placeholder={`...`}
                      onChange={(e) => {
                        setAnswers({
                          ...answers,
                          [blankNum]: e.target.value,
                        });
                      }}
                      className={`min-w-[110px] sm:min-w-[140px] max-w-[200px] text-center font-sans font-bold text-sm px-3 py-1.5 rounded-xl border transition-all outline-none ${
                        isSubmitted && blankCheck
                          ? blankCheck.isCorrect
                            ? 'bg-[#E8EFE6] border-[#4B5D44] text-[#384732]'
                            : 'bg-[#F9EBE9] border-[#88372A] text-[#88372A]'
                          : 'bg-white border-[#C6D8C2] text-[#2D332A] focus:border-[#4B5D44] focus:ring-2 focus:ring-[#4B5D44]/20 shadow-2xs'
                      }`}
                    />
                    {isSubmitted && blankCheck && (
                      <span className="ml-1.5">
                        {blankCheck.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4B5D44] inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#88372A] inline" />
                        )}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Answer Detailed Review Grid when submitted */}
            {isSubmitted && submissionResult && (
              <div className="bg-white rounded-2xl p-5 border border-[#E5DDD0] space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#2D332A]">
                  Chi tiết kết quả từng chỗ trống:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {submissionResult.blankResults.map((b) => (
                    <div
                      key={b.blank}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        b.isCorrect
                          ? 'bg-[#E8EFE6]/50 border-[#C6D8C2]'
                          : 'bg-[#F9EBE9]/50 border-[#ECC7C3]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#5C6B57]">Chỗ trống ({b.blank})</span>
                        {b.isCorrect ? (
                          <span className="text-[#384732] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng (+20đ)
                          </span>
                        ) : (
                          <span className="text-[#88372A] font-black flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Chưa đúng (0đ)
                          </span>
                        )}
                      </div>
                      <div className="text-[#2D332A]">
                        <span className="text-[#5C6B57]">Em trả lời:</span>{' '}
                        <strong className={b.isCorrect ? 'text-[#384732]' : 'text-[#88372A]'}>
                          {b.studentAnswer || '(để trống)'}
                        </strong>
                      </div>
                      {!b.isCorrect && (
                        <div className="text-[#875514]">
                          <span>Đáp án đúng:</span>{' '}
                          <strong className="underline">{b.correctAnswer}</strong>
                          {b.acceptedAnswers.length > 1 && (
                            <span className="text-[10px] text-[#5C6B57] block">
                              (Chấp nhận: {b.acceptedAnswers.join(', ')})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Action Buttons */}
          <div className="pt-2">
            {!isSubmitted ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#5C6B57] font-medium">
                  💡 Điền đủ từ hoặc bấm kiểm tra khi sẵn sàng.
                </span>

                <button
                  id="submit-listening-answers-btn"
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-8 py-3 bg-[#4B5D44] hover:bg-[#3D4C37] text-white rounded-xl font-extrabold text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kiểm tra kết quả</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result Feedback Banner */}
                <div
                  className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    submissionResult?.passed
                      ? 'bg-[#E8EFE6] border-[#C6D8C2]'
                      : 'bg-[#F9EBE9] border-[#ECC7C3]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                        submissionResult?.passed
                          ? 'bg-[#4B5D44] text-white'
                          : 'bg-[#88372A] text-white'
                      }`}
                    >
                      {submissionResult?.score}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-[#2D332A] font-serif">
                          {submissionResult?.score === 100
                            ? '🌟 Xuất sắc! Em đã đúng tuyệt đối!'
                            : submissionResult?.passed
                            ? '🎉 Chúc mừng! Em đã đạt yêu cầu (≥ 80%)'
                            : '💪 Chưa đạt 80%! Cố gắng lên nào!'}
                        </h4>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            submissionResult?.passed
                              ? 'bg-[#4B5D44] text-white'
                              : 'bg-[#88372A] text-white'
                          }`}
                        >
                          {submissionResult?.passed ? 'PASSED' : 'RETRY'}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C6B57] mt-0.5">
                        {submissionResult?.passed
                          ? `Em đã trả lời đúng ${submissionResult.correctCount}/5 chỗ trống (+20 XP). Bài tiếp theo đã được mở!`
                          : `Em cần đạt tối thiểu 80/100 điểm để mở bài tiếp theo. Hãy bấm "Làm lại" để luyện lại nhé.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      id="retry-listening-btn"
                      onClick={handleRetry}
                      className="px-5 py-2.5 bg-white border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#2D332A] rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại</span>
                    </button>

                    {submissionResult?.passed && (
                      <button
                        id="next-listening-lesson-btn"
                        onClick={handleNextLesson}
                        className="px-6 py-2.5 bg-[#4B5D44] hover:bg-[#3D4C37] text-white rounded-xl font-extrabold text-xs shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span>Bài tiếp theo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unit Completion Celebration Modal */}
      {showUnitCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 border border-[#E5DDD0] shadow-xl text-center space-y-5 animate-scaleUp">
            <div className="w-16 h-16 bg-[#E8EFE6] text-[#4B5D44] rounded-2xl mx-auto flex items-center justify-center">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#8E5D32] bg-[#F7EFE6] px-2.5 py-0.5 rounded-full">
                UNIT {selectedUnitNumber} COMPLETED
              </span>
              <h3 className="text-2xl font-black text-[#2D332A] font-serif">
                Chúc mừng em đã hoàn thành Listening!
              </h3>
              <p className="text-xs sm:text-sm text-[#5C6B57] leading-relaxed">
                Em đã vượt qua cả 2 bài nghe của <strong>Unit {selectedUnitNumber}: {currentUnit.title}</strong> với kết quả xuất sắc (≥ 80%). Thưởng thêm <strong>+50 XP</strong>!
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DDD0] flex justify-around text-center">
              <div>
                <span className="text-[11px] text-[#5C6B57] block font-bold">Lesson 1</span>
                <span className="text-base font-black text-[#4B5D44] font-serif">
                  {store.getListeningLessonState(user.id, `U${selectedUnitNumber}L01`)?.bestScore ?? 100}đ
                </span>
              </div>
              <div className="border-r border-[#E5DDD0]" />
              <div>
                <span className="text-[11px] text-[#5C6B57] block font-bold">Lesson 2</span>
                <span className="text-base font-black text-[#4B5D44] font-serif">
                  {store.getListeningLessonState(user.id, `U${selectedUnitNumber}L02`)?.bestScore ?? 100}đ
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowUnitCompletionModal(false)}
                className="flex-1 py-3 bg-white border border-[#E5DDD0] text-xs font-extrabold text-[#5C6B57] rounded-xl hover:bg-[#FAF7F2] transition-colors"
              >
                Ở lại Unit này
              </button>
              {selectedUnitNumber < 12 && (
                <button
                  onClick={() => {
                    setShowUnitCompletionModal(false);
                    setSelectedUnitNumber((prev) => prev + 1);
                    setCurrentLessonIndex(0);
                  }}
                  className="flex-1 py-3 bg-[#4B5D44] hover:bg-[#3D4C37] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Học Unit {selectedUnitNumber + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
