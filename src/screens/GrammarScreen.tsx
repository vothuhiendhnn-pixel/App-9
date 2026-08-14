import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { store } from '../services/store';
import {
  GrammarQuestion,
  GRAMMAR_DATA_12_UNITS,
  getGrammarUnit,
  getGrammarQuestionsByUnit,
} from '../data/grammarData';
import { UNITS_DATA } from '../data/unitsData';
import {
  ArrowLeft,
  BookOpen,
  PenTool,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Volume2,
  Filter,
  Check,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrammarScreenProps {
  user: UserProfile;
  initialUnitId?: number;
  onBack: () => void;
  onUpdateProgress: () => void;
}

export const GrammarScreen: React.FC<GrammarScreenProps> = ({
  user,
  initialUnitId = 1,
  onBack,
  onUpdateProgress,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<number>(initialUnitId || 1);
  const [activeTab, setActiveTab] = useState<'practice' | 'theory'>('practice');
  const [typeFilter, setTypeFilter] = useState<'all' | 'multiple_choice' | 'fill_blank' | 'transformation'>('all');

  // Practice state
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'try_again' | 'correct' | 'failed'>('idle');
  const [score, setScore] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<string, { isCorrect: boolean; userAnswer: string }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentUnitInfo = useMemo(() => getGrammarUnit(selectedUnit), [selectedUnit]);

  // Filtered exercises for current unit
  const activeQuestions = useMemo(() => {
    let list = getGrammarQuestionsByUnit(selectedUnit);
    if (typeFilter === 'multiple_choice') {
      list = list.filter((q) => q.type === 'multiple_choice');
    } else if (typeFilter === 'fill_blank') {
      list = list.filter((q) => q.type === 'fill_blank');
    } else if (typeFilter === 'transformation') {
      list = list.filter((q) => q.type === 'sentence_transformation' || q.type === 'sentence_combination');
    }
    return list;
  }, [selectedUnit, typeFilter]);

  const currentQuestion: GrammarQuestion | undefined = activeQuestions[currentExIndex] || activeQuestions[0];

  const handleUnitChange = (unitNum: number) => {
    setSelectedUnit(unitNum);
    setCurrentExIndex(0);
    setSelectedOption('');
    setTextInput('');
    setFeedback('idle');
    setAttemptCount(0);
    setScore(0);
    setAnsweredMap({});
    setIsCompleted(false);
    setShowHint(false);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove blank underscores for cleaner audio
      const cleanText = text.replace(/_{2,}/g, 'blank');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const normalizeAnswer = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
      .replace(/\s+/g, ' ');
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    const userAnswer =
      currentQuestion.type === 'multiple_choice'
        ? selectedOption.trim()
        : textInput.trim();

    if (!userAnswer) return;

    const normUser = normalizeAnswer(userAnswer);
    const normCorrect = normalizeAnswer(currentQuestion.answer);

    // Support flexible slash answers (e.g. "have / joined" vs "have joined")
    const isCorrect =
      normUser === normCorrect ||
      normUser.replace(/\s*\/\s*/g, ' ') === normCorrect.replace(/\s*\/\s*/g, ' ') ||
      (currentQuestion.type === 'sentence_transformation' && normUser.includes(normCorrect.slice(0, 15)));

    if (isCorrect) {
      setFeedback('correct');
      setScore((prev) => prev + 1);
      setAnsweredMap((prev) => ({
        ...prev,
        [currentQuestion.id]: { isCorrect: true, userAnswer },
      }));
      store.addXP(user.id, 5);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } else {
      if (attemptCount === 0) {
        setAttemptCount(1);
        setFeedback('try_again');
      } else {
        // Second incorrect attempt -> reveal answer & record mistake
        setFeedback('failed');
        setAnsweredMap((prev) => ({
          ...prev,
          [currentQuestion.id]: { isCorrect: false, userAnswer },
        }));
        store.recordMistake({
          studentId: user.id,
          unit: selectedUnit,
          module: 'grammar',
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          studentAnswer: userAnswer,
          correctAnswer: currentQuestion.answer,
          explanationVi: currentQuestion.explanationVi || 'Xem lại điểm ngữ pháp liên quan.',
        });
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption('');
    setTextInput('');
    setFeedback('idle');
    setAttemptCount(0);
    setShowHint(false);

    if (currentExIndex < activeQuestions.length - 1) {
      setCurrentExIndex(currentExIndex + 1);
    } else {
      setIsCompleted(true);
      const totalQ = activeQuestions.length || 1;
      const percentage = Math.round(((score + (feedback === 'correct' ? 0 : 0)) / totalQ) * 100);
      store.recordQuizAttempt({
        studentId: user.id,
        unit: selectedUnit,
        module: 'grammar',
        activityId: `u${selectedUnit}-grammar-practice`,
        activityName: `Unit ${selectedUnit} Grammar Practice (${currentUnitInfo.title})`,
        score,
        maxScore: totalQ,
        percentage,
        xpEarned: percentage >= 80 ? 30 : 15,
      });
      store.updateModuleProgress(user.id, selectedUnit, 'grammar', Math.max(70, percentage));
      onUpdateProgress();
    }
  };

  const handleRestartPractice = () => {
    setCurrentExIndex(0);
    setSelectedOption('');
    setTextInput('');
    setFeedback('idle');
    setAttemptCount(0);
    setScore(0);
    setAnsweredMap({});
    setIsCompleted(false);
    setShowHint(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 sm:px-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3 py-1.5 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#875514] bg-[#FAF2E4] border border-[#F0DEBA] px-3 py-1 rounded-full">
            Unit {selectedUnit}: {currentUnitInfo.title}
          </span>
          <span className="text-xs font-bold text-[#4B5D44] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
            240 Câu ngữ pháp Global Success
          </span>
        </div>
      </div>

      {/* Unit Selector Pills (1 to 12) */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5DDD0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#BC8A5F]" />
            <span className="text-xs font-black text-[#2D332A] uppercase tracking-wider">
              Chọn Unit Ngữ Pháp (1 - 12)
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#5C6B57]">
            20 câu / Unit • Đầy đủ chủ điểm
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {GRAMMAR_DATA_12_UNITS.map((u) => {
            const isSelected = selectedUnit === u.unit;
            return (
              <button
                key={u.unit}
                onClick={() => handleUnitChange(u.unit)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#BC8A5F] text-white shadow-xs scale-105'
                    : 'bg-[#FAF7F2] hover:bg-[#EBE3D5] text-[#5C6B57] border border-[#E5DDD0]'
                }`}
              >
                <span>U{u.unit}</span>
                <span className="text-[10px] opacity-85 font-medium hidden md:inline">
                  {u.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs: Practice vs Theory */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 bg-[#EBE3D5] p-1 rounded-2xl max-w-sm w-full shadow-inner">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'practice'
                ? 'bg-white text-[#2D332A] shadow-xs font-extrabold'
                : 'text-[#5C6B57] hover:text-[#2D332A]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-[#4B5D44]" />
            <span>Luyện tập 20 câu ({activeQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'theory'
                ? 'bg-white text-[#2D332A] shadow-xs font-extrabold'
                : 'text-[#5C6B57] hover:text-[#2D332A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#BC8A5F]" />
            <span>Lý thuyết & Công thức</span>
          </button>
        </div>
      </div>

      {/* TAB 1: THEORY (Lý thuyết) */}
      {activeTab === 'theory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#E5DDD0] shadow-xs space-y-4">
            <div className="border-b border-[#E5DDD0] pb-3">
              <span className="text-xs font-black text-[#BC8A5F] uppercase tracking-wider block mb-1">
                Ngữ pháp trọng tâm Unit {selectedUnit}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif">
                {currentUnitInfo.title}
              </h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentUnitInfo.grammarTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold bg-[#FAF2E4] text-[#875514] border border-[#F0DEBA] px-2.5 py-1 rounded-lg"
                  >
                    • {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Lessons list */}
            <div className="space-y-6 pt-2">
              {currentUnitInfo.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E5DDD0] space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#4B5D44] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#2D332A]">
                        {lesson.titleVi}
                      </h3>
                      <p className="text-xs text-[#5C6B57]">{lesson.title}</p>
                    </div>
                  </div>

                  {/* Formula / Pattern */}
                  <div className="bg-[#E8EFE6] border border-[#C6D8C2] p-4 rounded-xl">
                    <span className="text-[11px] font-bold text-[#384732] block mb-1 uppercase tracking-wider">
                      Công thức / Cấu trúc (Grammar Pattern)
                    </span>
                    <pre className="text-xs sm:text-sm font-extrabold text-[#384732] font-mono whitespace-pre-wrap">
                      {lesson.pattern}
                    </pre>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="text-xs sm:text-sm text-[#2D332A] leading-relaxed bg-white p-4 rounded-xl border border-[#E5DDD0]">
                    <p className="font-semibold whitespace-pre-line">
                      {lesson.explanationVi}
                    </p>
                  </div>

                  {/* Examples */}
                  {lesson.examples && lesson.examples.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-[#5C6B57] uppercase tracking-wider">
                        Ví dụ thực hành:
                      </h4>
                      <div className="space-y-2">
                        {lesson.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-3 bg-white rounded-xl border border-[#EBE3D5] text-xs space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-[#2D332A]">{ex.en}</p>
                              <button
                                onClick={() => handleSpeak(ex.en)}
                                className="text-[#5C6B57] hover:text-[#4B5D44] p-1"
                                title="Phát âm câu ví dụ"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[#5C6B57]">{ex.vi}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setActiveTab('practice')}
                className="bg-[#BC8A5F] hover:bg-[#A8764D] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Bắt đầu làm 20 câu bài tập Unit {selectedUnit}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE (Luyện tập) */}
      {activeTab === 'practice' && !isCompleted && currentQuestion && (
        <div className="space-y-4">
          {/* Practice Header & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5DDD0] shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-[#5C6B57] mr-1" />
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setCurrentExIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-[#4B5D44] text-white'
                    : 'bg-[#FAF7F2] text-[#5C6B57] hover:bg-[#EBE3D5]'
                }`}
              >
                Tất cả ({getGrammarQuestionsByUnit(selectedUnit).length})
              </button>
              <button
                onClick={() => {
                  setTypeFilter('multiple_choice');
                  setCurrentExIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'multiple_choice'
                    ? 'bg-[#4B5D44] text-white'
                    : 'bg-[#FAF7F2] text-[#5C6B57] hover:bg-[#EBE3D5]'
                }`}
              >
                Trắc nghiệm
              </button>
              <button
                onClick={() => {
                  setTypeFilter('fill_blank');
                  setCurrentExIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'fill_blank'
                    ? 'bg-[#4B5D44] text-white'
                    : 'bg-[#FAF7F2] text-[#5C6B57] hover:bg-[#EBE3D5]'
                }`}
              >
                Điền từ
              </button>
              <button
                onClick={() => {
                  setTypeFilter('transformation');
                  setCurrentExIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'transformation'
                    ? 'bg-[#4B5D44] text-white'
                    : 'bg-[#FAF7F2] text-[#5C6B57] hover:bg-[#EBE3D5]'
                }`}
              >
                Viết lại câu
              </button>
            </div>

            {/* Score & Progress text */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#875514]">
                Điểm: {score} / {activeQuestions.length}
              </span>
              <span className="text-xs font-bold text-[#5C6B57] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E5DDD0]">
                Câu {currentExIndex + 1} / {activeQuestions.length}
              </span>
            </div>
          </div>

          {/* Question Dots Navigator */}
          <div className="bg-white rounded-xl p-3 border border-[#E5DDD0] shadow-xs flex items-center gap-1.5 overflow-x-auto">
            {activeQuestions.map((q, idx) => {
              const res = answeredMap[q.id];
              const isCurrent = idx === currentExIndex;
              let bg = 'bg-[#FAF7F2] text-[#5C6B57] border-[#E5DDD0]';
              if (res) {
                bg = res.isCorrect
                  ? 'bg-[#E8EFE6] text-[#384732] border-[#C6D8C2] font-black'
                  : 'bg-[#FBEAEA] text-[#A82B2B] border-[#F5C2C2] font-black';
              }
              if (isCurrent) {
                bg += ' ring-2 ring-[#BC8A5F] font-black scale-105';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentExIndex(idx);
                    setSelectedOption('');
                    setTextInput('');
                    setFeedback('idle');
                    setAttemptCount(0);
                    setShowHint(false);
                  }}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold border flex items-center justify-center transition-all flex-shrink-0 ${bg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DDD0] shadow-xs space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-[#FAF2E4] text-[#875514] border border-[#F0DEBA] px-2.5 py-0.5 rounded-md">
                  {currentQuestion.type === 'multiple_choice'
                    ? 'Multiple Choice'
                    : currentQuestion.type === 'fill_blank'
                    ? 'Fill in the blank'
                    : 'Sentence Transformation'}
                </span>
                <span className="text-xs font-bold text-[#5C6B57]">
                  Mã câu: {currentQuestion.id}
                </span>
              </div>

              <button
                onClick={() => handleSpeak(currentQuestion.question)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#4B5D44] hover:text-[#2D332A] bg-[#E8EFE6] px-2.5 py-1 rounded-lg transition-colors"
                title="Nghe câu hỏi"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phát âm</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5DDD0]">
              <p className="text-base sm:text-lg font-bold text-[#2D332A] leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Hint toggle if available */}
            {currentQuestion.hint && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-[#875514] hover:text-[#683E0A] flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý ngữ pháp'}</span>
                </button>
                {showHint && (
                  <p className="text-xs text-[#875514] bg-[#FAF2E4] p-2 rounded-lg border border-[#F0DEBA] flex-1 ml-4 animate-fadeIn">
                    💡 <strong>Gợi ý:</strong> {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {/* INPUT / CHOICES SECTION */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, i) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = selectedOption === opt;
                  let optStyle = 'bg-white border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#2D332A]';

                  if (isSelected) {
                    optStyle = 'bg-[#FAF2E4] border-[#BC8A5F] text-[#875514] ring-2 ring-[#BC8A5F]/40 font-bold';
                  }

                  if (feedback === 'correct' && opt === currentQuestion.answer) {
                    optStyle = 'bg-[#E8EFE6] border-[#4B5D44] text-[#384732] ring-2 ring-[#4B5D44] font-black';
                  } else if (feedback === 'failed') {
                    if (opt === currentQuestion.answer) {
                      optStyle = 'bg-[#E8EFE6] border-[#4B5D44] text-[#384732] font-black';
                    } else if (isSelected) {
                      optStyle = 'bg-[#FBEAEA] border-[#A82B2B] text-[#A82B2B] font-bold';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={feedback === 'correct' || feedback === 'failed'}
                      onClick={() => setSelectedOption(opt)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${optStyle}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E5DDD0] text-xs font-black flex items-center justify-center flex-shrink-0">
                        {letters[i]}
                      </span>
                      <span className="text-sm font-semibold">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Text Input for Fill Blank or Transformation */
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C6B57] block">
                  {currentQuestion.type === 'fill_blank'
                    ? 'Nhập từ / cụm từ chính xác vào ô trống:'
                    : 'Viết lại toàn bộ câu hoàn chỉnh:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={textInput}
                    disabled={feedback === 'correct' || feedback === 'failed'}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && feedback === 'idle') {
                        handleCheckAnswer();
                      }
                    }}
                    placeholder={
                      currentQuestion.type === 'fill_blank'
                        ? 'Ví dụ: were walking, should take, which...'
                        : 'Ví dụ: I use an app which helps me...'
                    }
                    className="w-full bg-[#FAF7F2] border-2 border-[#E5DDD0] focus:border-[#BC8A5F] rounded-xl px-4 py-3 text-sm font-bold text-[#2D332A] outline-none transition-all placeholder:text-[#9EA89A]"
                  />
                </div>
              </div>
            )}

            {/* FEEDBACK AREA */}
            {feedback === 'try_again' && (
              <div className="bg-[#FAF2E4] border border-[#F0DEBA] rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-[#875514] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#875514] space-y-1">
                  <p className="font-extrabold text-sm">Chưa chính xác! Thử lại một lần nữa nhé.</p>
                  {currentQuestion.hint && <p>💡 Gợi ý: {currentQuestion.hint}</p>}
                </div>
              </div>
            )}

            {feedback === 'correct' && (
              <div className="bg-[#E8EFE6] border border-[#C6D8C2] rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-[#4B5D44] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#384732] space-y-1">
                  <p className="font-extrabold text-sm">Chính xác! Xuất sắc lắm! (+5 XP)</p>
                  {currentQuestion.explanationVi && <p>📌 {currentQuestion.explanationVi}</p>}
                </div>
              </div>
            )}

            {feedback === 'failed' && (
              <div className="bg-[#FBEAEA] border border-[#F5C2C2] rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-[#A82B2B] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#A82B2B] space-y-1">
                  <p className="font-extrabold text-sm">Đáp án chính xác là:</p>
                  <p className="text-sm font-black bg-white px-3 py-1.5 rounded-lg border border-[#F5C2C2] inline-block">
                    {currentQuestion.answer}
                  </p>
                  {currentQuestion.explanationVi && (
                    <p className="text-[#5C6B57] mt-1">📌 Giải thích: {currentQuestion.explanationVi}</p>
                  )}
                  <p className="text-[11px] text-[#5C6B57] italic">Câu hỏi đã được tự động lưu vào Sổ tay lỗi sai.</p>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-[#5C6B57]">
                Unit {selectedUnit} • {currentExIndex + 1} / {activeQuestions.length}
              </span>

              {feedback === 'idle' || feedback === 'try_again' ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    currentQuestion.type === 'multiple_choice' ? !selectedOption : !textInput.trim()
                  }
                  className="bg-[#BC8A5F] hover:bg-[#A8764D] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Kiểm tra đáp án</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>{currentExIndex < activeQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài tập'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRACTICE COMPLETED RECAP */}
      {isCompleted && (
        <div className="bg-white rounded-2xl p-8 border border-[#E5DDD0] shadow-xs text-center space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FAF2E4] border-2 border-[#BC8A5F] text-[#BC8A5F] rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black text-[#875514] uppercase tracking-wider">
              Kết quả Luyện tập Ngữ pháp
            </span>
            <h3 className="text-2xl font-black text-[#2D332A] font-serif">
              Unit {selectedUnit}: {currentUnitInfo.title}
            </h3>
            <p className="text-xs text-[#5C6B57]">
              Bạn đã hoàn thành toàn bộ bài tập ngữ pháp của Unit {selectedUnit}!
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DDD0]">
              <span className="text-[11px] font-bold text-[#5C6B57] block">Điểm số</span>
              <span className="text-2xl font-black text-[#4B5D44] font-serif">
                {score} / {activeQuestions.length}
              </span>
            </div>
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DDD0]">
              <span className="text-[11px] font-bold text-[#5C6B57] block">Tỷ lệ chính xác</span>
              <span className="text-2xl font-black text-[#BC8A5F] font-serif">
                {Math.round((score / (activeQuestions.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleRestartPractice}
              className="px-5 py-2.5 rounded-xl border border-[#E5DDD0] text-xs font-bold text-[#2D332A] hover:bg-[#FAF7F2] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5C6B57]" />
              <span>Làm lại Unit {selectedUnit}</span>
            </button>

            {selectedUnit < 12 && (
              <button
                onClick={() => handleUnitChange(selectedUnit + 1)}
                className="bg-[#BC8A5F] hover:bg-[#A8764D] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Sang Unit {selectedUnit + 1}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
