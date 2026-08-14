import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { UNIT_1_LISTENING } from '../data/unitsData';
import { audioService } from '../services/audioService';
import { store } from '../services/store';
import {
  ArrowLeft,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trophy,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeScreenProps {
  user: UserProfile;
  onBack: () => void;
  onNavigateChallenge: () => void;
  onUpdateProgress: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  user,
  onBack,
  onNavigateChallenge,
  onUpdateProgress,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Gap-fill state
  const [answers, setAnswers] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
  });
  const [attemptCount, setAttemptCount] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'try_again' | 'submitted'>('idle');
  const [showTranscript, setShowTranscript] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    setPlaybackProgress(0);
    audioService.speak(UNIT_1_LISTENING.audioScript, 0.85, () => {
      setIsPlaying(false);
      setPlaybackProgress(100);
    });
  };

  const handleStopAudio = () => {
    audioService.stop();
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const handleCheckAnswers = () => {
    let correctCount = 0;
    UNIT_1_LISTENING.blanks.forEach((b) => {
      if ((answers[b.index] || '').trim().toLowerCase() === b.correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });

    setScore(correctCount);

    if (correctCount === UNIT_1_LISTENING.blanks.length) {
      // 100% correct
      setFeedbackState('submitted');
      setIsCompleted(true);
      store.addXP(user.id, 15);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      store.recordQuizAttempt({
        studentId: user.id,
        unit: 1,
        module: 'practice',
        activityId: 'u1-listening-gap-fill',
        activityName: 'Listening Gap-fill: A Community Helper',
        score: correctCount,
        maxScore: UNIT_1_LISTENING.blanks.length,
        percentage: 100,
        xpEarned: 20,
      });
      store.updateModuleProgress(user.id, 1, 'practice', 90);
      onUpdateProgress();
    } else {
      if (attemptCount === 0) {
        setAttemptCount(1);
        setFeedbackState('try_again');
      } else {
        // Second attempt
        setFeedbackState('submitted');
        setIsCompleted(true);
        const percentage = Math.round((correctCount / UNIT_1_LISTENING.blanks.length) * 100);
        store.recordQuizAttempt({
          studentId: user.id,
          unit: 1,
          module: 'practice',
          activityId: 'u1-listening-gap-fill',
          activityName: 'Listening Gap-fill: A Community Helper',
          score: correctCount,
          maxScore: UNIT_1_LISTENING.blanks.length,
          percentage,
          xpEarned: 10,
        });

        // Record any wrong blanks into mistakes
        UNIT_1_LISTENING.blanks.forEach((b) => {
          const userAns = (answers[b.index] || '').trim();
          if (userAns.toLowerCase() !== b.correctAnswer.toLowerCase()) {
            store.recordMistake({
              studentId: user.id,
              unit: 1,
              module: 'practice',
              questionId: `u1-listen-b${b.index}`,
              question: `Listening Blank ${b.index}: ${b.beforeText} [_____] ${b.afterText}`,
              studentAnswer: userAns || '(để trống)',
              correctAnswer: b.correctAnswer,
              explanationVi: `Từ cần điền trong bài nghe là: "${b.correctAnswer}". Gợi ý: ${b.hint}`,
            });
          }
        });

        store.updateModuleProgress(user.id, 1, 'practice', Math.max(75, percentage));
        onUpdateProgress();
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3 py-1.5 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Unit 1</span>
        </button>

        <span className="text-xs font-black text-[#8E5D32] bg-[#FAF2E4] border border-[#F0DEBA] px-3 py-1 rounded-full">
          Unit 1 • Listening & Practice
        </span>
      </div>

      {/* Listening Practice Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E5DDD0] shadow-xs space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF2E4] text-[#8E5D32] flex items-center justify-center font-black">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E5D32]">
                Listening Gap-fill
              </span>
              <h2 className="text-lg font-black text-[#2D332A] font-serif">
                {UNIT_1_LISTENING.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Audio Player Box */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E5DDD0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E5D32]">
              Audio Track: A Community Helper (~22s)
            </span>
            <span className="text-xs font-mono font-bold text-[#5C6B57]">
              {isPlaying ? 'Đang phát...' : 'Sẵn sàng'}
            </span>
          </div>

          {/* Audio Timeline Progress */}
          <div className="w-full bg-[#EBE3D5] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#BC8A5F] h-full transition-all duration-300 rounded-full"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {!isPlaying ? (
              <button
                onClick={handlePlayAudio}
                className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Nghe bài đọc</span>
              </button>
            ) : (
              <button
                onClick={handleStopAudio}
                className="bg-[#2D332A] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                <span>Tạm dừng</span>
              </button>
            )}

            <button
              onClick={handlePlayAudio}
              className="bg-white border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#2D332A] px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5C6B57]" />
              <span>Nghe lại</span>
            </button>
          </div>
        </div>

        {/* Text with Gap-Fill Inputs */}
        <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E5DDD0] space-y-4">
          <h3 className="text-xs font-black text-[#5C6B57] uppercase tracking-wider">
            Điền từ còn thiếu vào các chỗ trống:
          </h3>

          <div className="text-sm sm:text-base leading-loose font-medium text-[#2D332A] space-y-3">
            <p>
              Mr Vinh is a hardworking man in our local community.
            </p>

            {/* Blank 1 */}
            <div className="flex items-center flex-wrap gap-2">
              <span>1. Every morning, Mr Vinh starts his job as a</span>
              <input
                type="text"
                value={answers[1] || ''}
                onChange={(e) => setAnswers({ ...answers, 1: e.target.value })}
                disabled={feedbackState === 'submitted'}
                placeholder="(collector type)"
                className={`px-3 py-1 rounded-xl border text-sm font-bold w-36 text-center ${
                  feedbackState === 'submitted'
                    ? (answers[1] || '').trim().toLowerCase() === 'garbage'
                      ? 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732]'
                      : 'bg-[#F9EBE9] border-[#ECC7C3] text-[#88372A]'
                    : 'bg-white border-[#E5DDD0] focus:border-[#4B5D44] focus:outline-hidden'
                }`}
              />
              <span>collector.</span>
              {feedbackState === 'submitted' && (answers[1] || '').trim().toLowerCase() !== 'garbage' && (
                <span className="text-xs font-bold text-[#384732] bg-[#E8EFE6] px-2 py-0.5 rounded-md border border-[#C6D8C2]">
                  Đáp án: garbage
                </span>
              )}
            </div>

            {/* Blank 2 */}
            <div className="flex items-center flex-wrap gap-2">
              <span>2. He helps keep the neighbourhood</span>
              <input
                type="text"
                value={answers[2] || ''}
                onChange={(e) => setAnswers({ ...answers, 2: e.target.value })}
                disabled={feedbackState === 'submitted'}
                placeholder="(adjective)"
                className={`px-3 py-1 rounded-xl border text-sm font-bold w-36 text-center ${
                  feedbackState === 'submitted'
                    ? (answers[2] || '').trim().toLowerCase() === 'clean'
                      ? 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732]'
                      : 'bg-[#F9EBE9] border-[#ECC7C3] text-[#88372A]'
                    : 'bg-white border-[#E5DDD0] focus:border-[#4B5D44] focus:outline-hidden'
                }`}
              />
              <span>and tidy.</span>
              {feedbackState === 'submitted' && (answers[2] || '').trim().toLowerCase() !== 'clean' && (
                <span className="text-xs font-bold text-[#384732] bg-[#E8EFE6] px-2 py-0.5 rounded-md border border-[#C6D8C2]">
                  Đáp án: clean
                </span>
              )}
            </div>

            {/* Blank 3 */}
            <div className="flex items-center flex-wrap gap-2">
              <span>3. All the residents respect him because he</span>
              <input
                type="text"
                value={answers[3] || ''}
                onChange={(e) => setAnswers({ ...answers, 3: e.target.value })}
                disabled={feedbackState === 'submitted'}
                placeholder="(verb)"
                className={`px-3 py-1 rounded-xl border text-sm font-bold w-36 text-center ${
                  feedbackState === 'submitted'
                    ? (answers[3] || '').trim().toLowerCase() === 'takes'
                      ? 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732]'
                      : 'bg-[#F9EBE9] border-[#ECC7C3] text-[#88372A]'
                    : 'bg-white border-[#E5DDD0] focus:border-[#4B5D44] focus:outline-hidden'
                }`}
              />
              <span>care of the environment every single day.</span>
              {feedbackState === 'submitted' && (answers[3] || '').trim().toLowerCase() !== 'takes' && (
                <span className="text-xs font-bold text-[#384732] bg-[#E8EFE6] px-2 py-0.5 rounded-md border border-[#C6D8C2]">
                  Đáp án: takes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback messages */}
        {feedbackState === 'try_again' && (
          <div className="bg-[#FAF2E4] border border-[#F0DEBA] p-4 rounded-xl text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-[#875514] font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Có chỗ chưa chính xác. Bạn hãy bấm "Nghe lại" và thử làm lại lần 2 nhé!</span>
            </div>
            <p className="text-[#875514]">
              💡 <strong>Gợi ý:</strong> Chú ý các từ chỉ nghề nghiệp dọn rác và giữ môi trường sạch sẽ.
            </p>
          </div>
        )}

        {/* Transcript Section (Hidden until submitted or answered) */}
        {feedbackState === 'submitted' && (
          <div className="space-y-2 animate-in fade-in">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs font-bold text-[#4B5D44] hover:underline flex items-center gap-1.5"
            >
              {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTranscript ? 'Ẩn Transcript bài nghe' : 'Xem toàn văn Transcript'}</span>
            </button>

            {showTranscript && (
              <div className="bg-[#E8EFE6] border border-[#C6D8C2] p-4 rounded-xl text-xs text-[#2D332A] leading-relaxed">
                <p className="font-bold text-[#384732] mb-1">Transcript:</p>
                <p>{UNIT_1_LISTENING.transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-between pt-2">
          {feedbackState !== 'submitted' ? (
            <button
              onClick={handleCheckAnswers}
              className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-2.5 rounded-xl font-extrabold text-sm shadow-xs transition-all ml-auto"
            >
              {feedbackState === 'try_again' ? 'Nộp bài (Lần 2)' : 'Nộp bài điền từ'}
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#384732]" />
                <span className="text-xs font-bold text-[#384732]">
                  Đúng {score} / 3 câu ({Math.round((score / 3) * 100)}%)
                </span>
              </div>
              <button
                onClick={onNavigateChallenge}
                className="bg-[#8E5D32] hover:bg-[#784D28] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Làm Unit 1 Challenge (100đ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
