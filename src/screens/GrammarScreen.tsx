import React, { useMemo, useState } from 'react';
import type { UserProfile } from '../types';
import { store } from '../services/store';
import { progressService } from '../services/progressService';
import {
  GRAMMAR_DATA_12_UNITS,
  getGrammarUnit,
  getGrammarQuestionsByUnit,
} from '../data/grammarData';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, AlertCircle, HelpCircle, PenTool, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrammarScreenProps {
  user: UserProfile;
  initialUnitId?: number;
  onBack: () => void;
  onUpdateProgress: () => void;
}

type Feedback = 'idle' | 'try_again' | 'correct' | 'failed';

const optionThemes = [
  { border: 'border-[#9ACAAB]', background: 'bg-[#F0F8F1]', text: 'text-[#106540]', marker: 'bg-[#115A3C]' },
  { border: 'border-[#9AC2F9]', background: 'bg-[#F0F6FF]', text: 'text-[#1457B5]', marker: 'bg-[#155FC1]' },
  { border: 'border-[#F2C483]', background: 'bg-[#FFF8EC]', text: 'text-[#AC440E]', marker: 'bg-[#B7490B]' },
  { border: 'border-[#F0B0B0]', background: 'bg-[#FFF3F3]', text: 'text-[#B32C2C]', marker: 'bg-[#C62828]' },
] as const;

/** Only the presentation/navigation changes here. Existing quiz scoring and Supabase submission stay intact. */
export const GrammarScreen: React.FC<GrammarScreenProps> = ({
  user,
  initialUnitId = 1,
  onBack,
  onUpdateProgress,
}) => {
  const [selectedUnit, setSelectedUnit] = useState(initialUnitId || 1);
  const [activeTab, setActiveTab] = useState<'practice' | 'theory'>('practice');
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [score, setScore] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<string, { isCorrect: boolean; userAnswer: string }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentUnitInfo = useMemo(() => getGrammarUnit(selectedUnit), [selectedUnit]);
  const activeQuestions = useMemo(
    () => getGrammarQuestionsByUnit(selectedUnit).filter(q => q.type === 'multiple_choice'),
    [selectedUnit],
  );
  const currentQuestion = activeQuestions[currentExIndex];
  const totalQuestions = activeQuestions.length;
  const progressPercentage = totalQuestions ? Math.round((Object.keys(answeredMap).length / totalQuestions) * 100) : 0;

  const resetExercise = () => {
    setCurrentExIndex(0);
    setSelectedOption('');
    setFeedback('idle');
    setAttemptCount(0);
    setScore(0);
    setAnsweredMap({});
    setIsCompleted(false);
    setShowHint(false);
  };

  const handleUnitChange = (unitNum: number) => {
    setSelectedUnit(unitNum);
    resetExercise();
    setActiveTab('practice');
  };

  const normalizeAnswer = (str: string) => str.toLowerCase().trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ');

  const handleCheckAnswer = () => {
    if (!currentQuestion || !selectedOption || feedback === 'correct' || feedback === 'failed') return;
    const userAnswer = selectedOption.trim();
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(currentQuestion.answer);

    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
      setAnsweredMap(prev => ({ ...prev, [currentQuestion.id]: { isCorrect: true, userAnswer } }));
      store.addXP(user.id, 5);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } else if (attemptCount === 0) {
      setAttemptCount(1);
      setFeedback('try_again');
    } else {
      setFeedback('failed');
      setAnsweredMap(prev => ({ ...prev, [currentQuestion.id]: { isCorrect: false, userAnswer } }));
      store.recordMistake({
        studentId: user.id,
        unit: selectedUnit,
        module: 'grammar',
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        studentAnswer: userAnswer,
        correctAnswer: currentQuestion.answer,
        explanationVi: currentQuestion.explanationVi || 'Review the related grammar point.',
      });
    }
  };

  const handleNextQuestion = () => {
    if (feedback !== 'correct' && feedback !== 'failed') return;
    setSelectedOption('');
    setFeedback('idle');
    setAttemptCount(0);
    setShowHint(false);

    if (currentExIndex < totalQuestions - 1) {
      setCurrentExIndex(prev => prev + 1);
      return;
    }

    setIsCompleted(true);
    const totalQ = totalQuestions || 1;
    const percentage = Math.round((score / totalQ) * 100);
    const savedAttempt = store.recordQuizAttempt({
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
    void progressService.submitAttempt(user, savedAttempt);
    store.updateModuleProgress(user.id, selectedUnit, 'grammar', Math.max(70, percentage));
    onUpdateProgress();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 space-y-5 text-[#1D3027]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#C7D5CC] bg-white px-4 py-2 text-sm font-bold text-[#154D38] shadow-sm hover:bg-[#EFF7F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126443]">
          <ArrowLeft size={17} /> Back to Learning
        </button>
        <span className="rounded-full border border-[#D5DFD6] bg-[#F2F7F1] px-4 py-2 text-sm font-bold text-[#19543D]">
          English 9 · Global Success · Unit {selectedUnit}
        </span>
      </div>

      <nav aria-label="Select a unit" className="rounded-[22px] border border-[#D8DDD2] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {GRAMMAR_DATA_12_UNITS.map(u => (
            <button key={u.unit} type="button" onClick={() => handleUnitChange(u.unit)} aria-pressed={selectedUnit === u.unit}
              className={`shrink-0 rounded-xl border px-4 py-3 text-left text-sm font-extrabold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126443] ${selectedUnit === u.unit
                ? 'border-[#0E5136] bg-[#0E5136] text-white shadow-md'
                : 'border-[#DFE5DC] bg-[#F7F8F2] text-[#244A35] hover:bg-[#E5F0E7]'}`}>
              U{u.unit} <span className="ml-1 text-xs font-semibold uppercase opacity-85">{u.title}</span>
            </button>
          ))}
        </div>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-[#C3D5C8] bg-white shadow-lg">
        <div className="bg-[#0F5136] px-5 py-6 text-white sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#C9E6D4]">Unit {selectedUnit} · Grammar</p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Grammar Practice</h1>
              <p className="mt-2 text-sm text-[#E1F1E6] sm:text-base">Choose the best answer for each question.</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2.5"><p className="text-xs text-[#D9EBDD]">Score</p><p className="text-2xl font-extrabold">{score} / {totalQuestions}</p></div>
              <div className="rounded-xl bg-white/10 px-4 py-2.5"><p className="text-xs text-[#D9EBDD]">Question</p><p className="text-2xl font-extrabold">{Math.min(currentExIndex + 1, totalQuestions)} / {totalQuestions}</p></div>
            </div>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/25" aria-label="Quiz completion progress">
            <div className="h-full rounded-full bg-[#E3A65A] transition-all" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="p-4 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#F1F2E9] p-2">
            <button type="button" onClick={() => setActiveTab('practice')} aria-pressed={activeTab === 'practice'}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold ${activeTab === 'practice' ? 'bg-white text-[#104C34] shadow-sm' : 'text-[#465C4C] hover:bg-white/60'}`}>
              <PenTool size={17} /> Practice ({totalQuestions} Questions)
            </button>
            <button type="button" onClick={() => setActiveTab('theory')} aria-pressed={activeTab === 'theory'}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold ${activeTab === 'theory' ? 'bg-white text-[#104C34] shadow-sm' : 'text-[#465C4C] hover:bg-white/60'}`}>
              <BookOpen size={17} /> Grammar Rules
            </button>
          </div>

          {activeTab === 'theory' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#D4E0D6] bg-[#F4F8F2] p-5">
                <h2 className="text-xl font-extrabold text-[#104C34]">{currentUnitInfo.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2">{currentUnitInfo.grammarTopics.map((topic, i) => (
                  <span key={i} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#20563E]">{topic}</span>
                ))}</div>
              </div>
              {currentUnitInfo.lessons.map((lesson, i) => (
                <article key={lesson.id} className="rounded-2xl border border-[#DDE3D9] bg-[#FBFAF6] p-5 space-y-3">
                  <h3 className="text-lg font-bold text-[#164D36]">{i + 1}. {lesson.title}</h3>
                  <div className="rounded-xl border border-[#C9DCCA] bg-[#EBF4EC] p-4">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#286348]">Grammar Pattern</p>
                    <pre className="whitespace-pre-wrap font-mono text-sm font-bold text-[#1A482F]">{lesson.pattern}</pre>
                  </div>
                  {/* Keep the existing author-provided explanations; do not silently remove teaching content. */}
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[#344638]">{lesson.explanationVi}</p>
                  {lesson.examples?.length > 0 && <div className="space-y-2">
                    <h4 className="font-bold text-[#164D36]">Examples</h4>
                    {lesson.examples.map((ex, idx) => <div key={idx} className="rounded-xl border border-[#DFE5DB] bg-white p-3">
                      <p className="text-base font-semibold text-[#1D3027]">{ex.en}</p>
                      <p className="text-sm text-[#5B6B60]">{ex.vi}</p>
                    </div>)}
                  </div>}
                </article>
              ))}
              <button type="button" onClick={() => setActiveTab('practice')}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0F5136] px-6 py-3 font-bold text-white hover:bg-[#083E29]">Start Practice <ArrowRight size={18}/></button>
            </div>
          )}

          {activeTab === 'practice' && !isCompleted && currentQuestion && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-xl bg-[#E9F4EC] px-4 py-2 text-sm font-bold text-[#14563D]">Multiple Choice · {totalQuestions} Questions</span>
                <span className="text-sm font-semibold text-[#3B5D47]">Question {currentExIndex + 1} of {totalQuestions}</span>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Question progress">
                {activeQuestions.map((question, index) => {
                  const completed = answeredMap[question.id];
                  return <span key={question.id} aria-current={index === currentExIndex ? 'step' : undefined}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold ${index === currentExIndex
                      ? 'border-[#B05A1A] bg-[#AF5418] text-white shadow-sm'
                      : completed ? (completed.isCorrect ? 'border-[#B9D7C0] bg-[#E5F4E9] text-[#14583C]' : 'border-[#E9B6B4] bg-[#FBECEB] text-[#B2312B]')
                        : 'border-[#DFE2D8] bg-[#F8F8F2] text-[#526553]'}`}>{index + 1}</span>;
                })}
              </div>

              <div className="rounded-2xl border border-[#D8E0D8] bg-[#FFFEFC] p-4 shadow-sm sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-[#A44D11] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white">Multiple Choice</span>
                  <span className="text-sm font-semibold text-[#3E5748]">Question ID: {currentQuestion.id}</span>
                </div>
                <div className="rounded-2xl border border-[#E4E0D4] bg-[#F8F5EF] p-5 sm:p-6">
                  <p className="text-xl font-extrabold leading-relaxed text-[#1B2B27] sm:text-2xl">{currentQuestion.question}</p>
                </div>

                {currentQuestion.hint && <div>
                  <button type="button" onClick={() => setShowHint(v => !v)} aria-expanded={showHint}
                    className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#A34F12] hover:underline">
                    <HelpCircle size={18} /> {showHint ? 'Hide Grammar Hint' : 'Show Grammar Hint'}
                  </button>
                  {showHint && <p className="rounded-xl border border-[#E7CEAF] bg-[#FFF7E9] p-3 text-sm text-[#7C441B]">{currentQuestion.hint}</p>}
                </div>}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Answer options">
                  {(currentQuestion.options ?? []).map((opt, i) => {
                    const theme = optionThemes[i % optionThemes.length];
                    const isSelected = selectedOption === opt;
                    const isAnswer = opt === currentQuestion.answer;
                    const resolved = feedback === 'correct' || feedback === 'failed';
                    const correctStyle = resolved && isAnswer;
                    const wrongStyle = feedback === 'failed' && isSelected && !isAnswer;
                    return <button type="button" key={`${i}-${opt}`} onClick={() => setSelectedOption(opt)}
                      disabled={resolved} aria-pressed={isSelected}
                      className={`flex min-h-[94px] items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5136] disabled:cursor-default sm:p-5 ${correctStyle
                        ? 'border-[#137847] bg-[#E0F3E7] ring-2 ring-[#87CBA3]'
                        : wrongStyle ? 'border-[#C02E2E] bg-[#FFF0F0]'
                          : isSelected ? `${theme.border} ${theme.background} ring-2 ring-[#466B55]/30`
                            : `border-[#E4E0D7] bg-white hover:bg-[#F4F8F3] hover:border-[#BCCDC0]`}`}>
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-extrabold text-white ${correctStyle ? 'bg-[#11683E]' : wrongStyle ? 'bg-[#B72D2D]' : theme.marker}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={`min-w-0 break-words text-2xl font-extrabold leading-snug sm:text-3xl ${correctStyle ? 'text-[#10683E]' : wrongStyle ? 'text-[#AD2424]' : theme.text}`}>{opt}</span>
                    </button>;
                  })}
                </div>

                {feedback === 'try_again' && <div role="status" className="flex gap-3 rounded-xl border border-[#E7C494] bg-[#FFF7E9] p-4 text-[#8B480F]">
                  <AlertCircle className="shrink-0" size={21}/><div><p className="font-bold">Not quite right. Try one more time!</p>{currentQuestion.hint && <p className="mt-1 text-sm">Hint: {currentQuestion.hint}</p>}</div>
                </div>}
                {feedback === 'correct' && <div role="status" className="flex gap-3 rounded-xl border border-[#A7D4B5] bg-[#EAF7EF] p-4 text-[#145D3B]">
                  <CheckCircle2 className="shrink-0" size={21}/><div><p className="font-bold">Correct! Excellent work! (+5 XP)</p>{currentQuestion.explanationVi && <p className="mt-1 text-sm">{currentQuestion.explanationVi}</p>}</div>
                </div>}
                {feedback === 'failed' && <div role="status" className="flex gap-3 rounded-xl border border-[#E9B6B6] bg-[#FFF0F0] p-4 text-[#AA2828]">
                  <AlertCircle className="shrink-0" size={21}/><div><p className="font-bold">Correct Answer: <span className="text-lg">{currentQuestion.answer}</span></p>{currentQuestion.explanationVi && <p className="mt-1 text-sm">{currentQuestion.explanationVi}</p>}<p className="mt-1 text-xs">This question has been added to your mistake notebook.</p></div>
                </div>}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E3E9E1] pt-4">
                  <span className="text-sm font-bold text-[#466150]">Unit {selectedUnit} · {currentExIndex + 1} / {totalQuestions}</span>
                  {feedback === 'idle' || feedback === 'try_again' ? (
                    <button type="button" onClick={handleCheckAnswer} disabled={!selectedOption}
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#A64C15] px-6 py-3 text-base font-bold text-white shadow-md hover:bg-[#8F3E0A] disabled:cursor-not-allowed disabled:opacity-45">
                      <Check size={19}/> Check Answer
                    </button>
                  ) : (
                    <button type="button" onClick={handleNextQuestion}
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0F5136] px-6 py-3 text-base font-bold text-white shadow-md hover:bg-[#083B28]">
                      {currentExIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Practice'} <ArrowRight size={19}/>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'practice' && !isCompleted && !currentQuestion && (
            <div role="alert" className="rounded-2xl border border-[#E7C494] bg-[#FFF8E8] p-6 text-base font-semibold text-[#744419]">
              No multiple-choice questions are available for Unit {selectedUnit}. Please check the question data.
            </div>
          )}

          {isCompleted && <section className="mx-auto max-w-xl space-y-5 rounded-2xl border border-[#D7E2D9] bg-[#FCFDF9] p-6 text-center sm:p-8">
            <Trophy className="mx-auto text-[#C18130]" size={56}/>
            <p className="text-sm font-bold uppercase tracking-wider text-[#9C511B]">Grammar Practice Completed</p>
            <h2 className="text-2xl font-extrabold text-[#134D35]">Unit {selectedUnit}: {currentUnitInfo.title}</h2>
            <p className="text-[#445C4B]">You have finished all {totalQuestions} multiple-choice questions.</p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl bg-[#E6F2E9] p-4"><p className="text-sm text-[#3B6448]">Score</p><p className="text-3xl font-extrabold text-[#10563A]">{score}/{totalQuestions}</p></div>
              <div className="rounded-xl bg-[#FFF2E1] p-4"><p className="text-sm text-[#835127]">Accuracy</p><p className="text-3xl font-extrabold text-[#AE5A1D]">{Math.round(score / (totalQuestions || 1) * 100)}%</p></div>
            </div>
            <p className="text-xs text-[#647468]">Your result is submitted using the existing Supabase synchronization service.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={resetExercise} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D1DED4] bg-white px-5 py-2.5 font-bold text-[#1E553A] hover:bg-[#F2F8F3]"><RotateCcw size={17}/> Try Again</button>
              {selectedUnit < 12 && <button type="button" onClick={() => handleUnitChange(selectedUnit + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0F5136] px-5 py-2.5 font-bold text-white hover:bg-[#083B28]">Next Unit <ArrowRight size={17}/></button>}
            </div>
          </section>}
        </div>
      </section>
    </main>
  );
};
