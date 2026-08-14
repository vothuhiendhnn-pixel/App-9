import React, { useState, useMemo, useEffect } from 'react';
import { VocabularyItem, VocabularyStatus, UserProfile, VocabPracticeType } from '../types';
import { UNITS_DATA } from '../data/unitsData';
import { ALL_VOCABULARY_9, getVocabularyByUnit, VOCABULARY_RAW_DATA } from '../data/vocabularyData';
import { VocabularyCard } from '../components/VocabularyCard';
import { Flashcard } from '../components/Flashcard';
import { AudioButton } from '../components/AudioButton';
import { store } from '../services/store';
import { MatchExercise } from '../components/vocabulary/MatchExercise';
import { ChooseMeaningExercise } from '../components/vocabulary/ChooseMeaningExercise';
import { ListenChooseExercise } from '../components/vocabulary/ListenChooseExercise';
import { TypeWordExercise } from '../components/vocabulary/TypeWordExercise';
import { CompleteSentenceExercise } from '../components/vocabulary/CompleteSentenceExercise';
import { VocabularyChallengeExercise } from '../components/vocabulary/VocabularyChallengeExercise';
import { ReviewWrongWordsExercise } from '../components/vocabulary/ReviewWrongWordsExercise';
import { VocabularyPracticeRoadmap } from '../components/vocabulary/VocabularyPracticeRoadmap';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Search,
  Filter,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VocabularyScreenProps {
  user: UserProfile;
  initialUnitId?: number;
  onBack: () => void;
  onUpdateProgress: () => void;
}

interface GeneratedQuizQuestion {
  id: string;
  type: 'word_to_meaning' | 'meaning_to_word' | 'example_fill';
  question: string;
  wordEn: string;
  options: string[];
  answer: string;
  hint: string;
  explanationVi: string;
}

export const VocabularyScreen: React.FC<VocabularyScreenProps> = ({
  user,
  initialUnitId = 1,
  onBack,
  onUpdateProgress,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<number>(initialUnitId || 1);
  const [activeTab, setActiveTab] = useState<'practice' | 'learn' | 'flashcards' | 'quiz'>('practice');
  const [activePractice, setActivePractice] = useState<VocabPracticeType | 'review_wrong_words' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VocabularyStatus>('all');
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  // Load vocabulary with student's saved status
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(() =>
    store.getVocabListWithStatus(user.id, initialUnitId || 1)
  );

  // Load Unit Practice Progress
  const [unitPracticeProgress, setUnitPracticeProgress] = useState(() =>
    store.getVocabularyUnitPracticeProgress(user.id, initialUnitId || 1)
  );

  const effectiveUnit = selectedUnit === 0 ? 1 : selectedUnit;

  // Refresh progress helper
  const refreshPracticeProgress = () => {
    const updated = store.getVocabularyUnitPracticeProgress(user.id, effectiveUnit);
    setUnitPracticeProgress(updated);
    const list = store.getVocabListWithStatus(user.id, selectedUnit);
    setVocabList(list);
    onUpdateProgress();
  };

  // Update vocabList & practice progress whenever selectedUnit changes
  useEffect(() => {
    const list = store.getVocabListWithStatus(user.id, selectedUnit);
    setVocabList(list);
    setFlashcardIndex(0);
    handleRestartQuiz();
    setUnitPracticeProgress(store.getVocabularyUnitPracticeProgress(user.id, effectiveUnit));
    setActivePractice(null);
  }, [selectedUnit, user.id]);

  const handleNextPracticeStep = () => {
    refreshPracticeProgress();
    if (activePractice === 'match') {
      setActivePractice('choose_meaning');
    } else if (activePractice === 'choose_meaning') {
      setActivePractice('listen_and_choose');
    } else if (activePractice === 'listen_and_choose') {
      setActivePractice('type_word');
    } else if (activePractice === 'type_word') {
      setActivePractice('complete_sentence');
    } else if (activePractice === 'complete_sentence') {
      setActivePractice('challenge');
    } else {
      setActivePractice(null);
    }
  };

  // Filtered vocabulary list for display
  const filteredVocabList = useMemo(() => {
    return vocabList.filter((item) => {
      const matchesSearch =
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaningVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ipa && item.ipa.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || (item.status || 'new') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vocabList, searchQuery, statusFilter]);

  // Current Unit Meta
  const currentUnitMeta = useMemo(() => {
    if (selectedUnit === 0) {
      return {
        id: 0,
        title: 'Tất cả 12 Units (Global Success)',
        vietnameseTitle: 'Tổng hợp 266 từ vựng',
        vocabularyCount: ALL_VOCABULARY_9.length,
      };
    }
    const unit = UNITS_DATA.find((u) => u.id === selectedUnit);
    return unit || {
      id: selectedUnit,
      title: `Unit ${selectedUnit}`,
      vietnameseTitle: '',
      vocabularyCount: vocabList.length,
    };
  }, [selectedUnit, vocabList]);

  // Stats for the active unit
  const unitStats = useMemo(() => {
    const total = vocabList.length;
    const mastered = vocabList.filter((v) => v.status === 'mastered').length;
    const good = vocabList.filter((v) => v.status === 'good').length;
    const learning = vocabList.filter((v) => v.status === 'learning').length;
    const fresh = vocabList.filter((v) => !v.status || v.status === 'new').length;
    return { total, mastered, good, learning, fresh };
  }, [vocabList]);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'try_again' | 'correct' | 'failed'>('idle');
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Generate dynamic quiz questions from the current unit
  const quizQuestions: GeneratedQuizQuestion[] = useMemo(() => {
    const sourceList = vocabList.length > 0 ? vocabList : ALL_VOCABULARY_9;
    const shuffled = [...sourceList].sort(() => 0.5 - Math.random()).slice(0, Math.min(8, sourceList.length));

    return shuffled.map((item, idx) => {
      // Pick 3 random wrong options from all vocabulary
      const otherWords = ALL_VOCABULARY_9.filter((v) => v.id !== item.id);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());

      const isEven = idx % 2 === 0;
      if (isEven) {
        // Type: English -> Vietnamese meaning
        const wrongAnswers = shuffledOthers.slice(0, 3).map((w) => w.meaningVi);
        const options = [item.meaningVi, ...wrongAnswers].sort(() => 0.5 - Math.random());
        return {
          id: `q-${item.id}-${idx}`,
          type: 'word_to_meaning',
          question: `Từ "${item.word}" có nghĩa tiếng Việt là gì?`,
          wordEn: item.word,
          options,
          answer: item.meaningVi,
          hint: `Phát âm: ${item.ipa}. Từ loại: ${item.partOfSpeech || 'từ vựng'}.`,
          explanationVi: `"${item.word}" nghĩa là: "${item.meaningVi}".`,
        };
      } else {
        // Type: Vietnamese -> English word
        const wrongAnswers = shuffledOthers.slice(0, 3).map((w) => w.word);
        const options = [item.word, ...wrongAnswers].sort(() => 0.5 - Math.random());
        return {
          id: `q-${item.id}-${idx}`,
          type: 'meaning_to_word',
          question: `Chọn từ tiếng Anh phù hợp cho: "${item.meaningVi}"`,
          wordEn: item.word,
          options,
          answer: item.word,
          hint: `Bắt đầu bằng chữ cái: "${item.word.charAt(0).toUpperCase()}".`,
          explanationVi: `"${item.meaningVi}" trong tiếng Anh là "${item.word}" (${item.ipa}).`,
        };
      }
    });
  }, [vocabList]);

  const handleFlashcardChoice = (status: VocabularyStatus) => {
    const currentItem = vocabList[flashcardIndex];
    if (!currentItem) return;

    store.updateVocabStatus(user.id, currentItem.id, status);
    const updated = store.getVocabListWithStatus(user.id, selectedUnit);
    setVocabList(updated);

    if (flashcardIndex < vocabList.length - 1) {
      setFlashcardIndex(flashcardIndex + 1);
    } else {
      // Completed all flashcards in this unit
      store.addXP(user.id, 20);
      store.updateModuleProgress(user.id, selectedUnit || 1, 'vocabulary', 95);
      onUpdateProgress();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      alert(`Tuyệt vời! Bạn đã hoàn thành ôn tập flashcard cho Unit ${selectedUnit || 1}. (+20 XP)`);
      setFlashcardIndex(0);
    }
  };

  const handleSelectQuizOption = (option: string) => {
    if (feedback === 'correct' || feedback === 'failed') return;
    setSelectedOption(option);
  };

  const handleSubmitQuizAnswer = () => {
    if (!selectedOption || !quizQuestions[quizIndex]) return;
    const currentQ = quizQuestions[quizIndex];
    const isCorrect = selectedOption.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();

    if (isCorrect) {
      setFeedback('correct');
      setQuizScore(quizScore + 1);
      store.addXP(user.id, 5);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } else {
      if (attemptCount === 0) {
        setAttemptCount(1);
        setFeedback('try_again');
      } else {
        // Second attempt failed -> show answer & record mistake
        setFeedback('failed');
        store.recordMistake({
          studentId: user.id,
          unit: selectedUnit || 1,
          module: 'vocabulary',
          questionId: currentQ.id,
          question: currentQ.question,
          studentAnswer: selectedOption,
          correctAnswer: currentQ.answer,
          explanationVi: currentQ.explanationVi,
        });
      }
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setFeedback('idle');
    setAttemptCount(0);

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      // Complete quiz
      setQuizCompleted(true);
      const percentage = Math.round((quizScore / quizQuestions.length) * 100);
      store.recordQuizAttempt({
        studentId: user.id,
        unit: selectedUnit || 1,
        module: 'vocabulary',
        activityId: `u${selectedUnit || 1}-vocab-quiz`,
        activityName: `Unit ${selectedUnit || 1} Vocab Quiz`,
        score: quizScore,
        maxScore: quizQuestions.length,
        percentage,
        xpEarned: percentage >= 80 ? 25 : 15,
      });
      store.updateModuleProgress(user.id, selectedUnit || 1, 'vocabulary', Math.max(85, percentage));
      onUpdateProgress();
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setFeedback('idle');
    setAttemptCount(0);
    setQuizScore(0);
    setQuizCompleted(false);
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
          <span>Quay lại bài học</span>
        </button>

        {/* Unit Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#5C6B57]">Chọn Unit:</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(Number(e.target.value))}
            className="bg-white border border-[#C6D8C2] text-[#2D332A] text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-xs focus:ring-2 focus:ring-[#4B5D44] focus:outline-none"
          >
            <option value={0}>📚 Tất cả 12 Units (266 từ)</option>
            {UNITS_DATA.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.id}: {u.title} ({u.vocabularyCount} từ)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit Banner Header */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4B5D44] bg-[#E8EFE6] px-2.5 py-0.5 rounded-full border border-[#C6D8C2]">
              {selectedUnit === 0 ? 'Toàn bộ từ vựng SGK' : `Tiếng Anh 9 • Unit ${selectedUnit}`}
            </span>
            <span className="text-xs font-bold text-[#8E5D32]">
              {vocabList.length} từ vựng chuẩn Global Success
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D332A] font-serif mt-1">
            {currentUnitMeta.title}
          </h1>
          {currentUnitMeta.vietnameseTitle && (
            <p className="text-xs sm:text-sm font-medium text-[#5C6B57]">
              {currentUnitMeta.vietnameseTitle}
            </p>
          )}
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#E8EFE6] border border-[#C6D8C2] px-3 py-1 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#384732] block">Đã thuộc</span>
            <span className="text-sm font-black text-[#384732]">{unitStats.mastered}</span>
          </div>
          <div className="bg-[#FAF2E4] border border-[#F0DEBA] px-3 py-1 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#875514] block">Đang học</span>
            <span className="text-sm font-black text-[#875514]">{unitStats.learning + unitStats.good}</span>
          </div>
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] px-3 py-1 rounded-xl text-center">
            <span className="text-[10px] font-bold text-[#5C6B57] block">Chưa học</span>
            <span className="text-sm font-black text-[#5C6B57]">{unitStats.fresh}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#EBE3D5] p-1 rounded-2xl max-w-xl mx-auto overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('practice');
            setActivePractice(null);
          }}
          className={`flex-1 min-w-[120px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'practice' ? 'bg-white text-[#2D332A] shadow-xs font-black' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-[#4B5D44]" />
          <span>LUYỆN TẬP TỪ VỰNG</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className={`flex-1 min-w-[110px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'learn' ? 'bg-white text-[#2D332A] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#4B5D44]" />
          <span>DANH SÁCH TỪ</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'flashcards' ? 'bg-white text-[#2D332A] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#8E5D32]" />
          <span>FLASHCARDS</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 min-w-[90px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'quiz' ? 'bg-white text-[#2D332A] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#BC8A5F]" />
          <span>QUIZ TỔNG HỢP</span>
        </button>
      </div>

      {/* TAB 0: VOCABULARY PRACTICE MODULE (6 Interactive Exercises & Review Wrong Words) */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {activePractice && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActivePractice(null)}
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Lộ trình bài tập</span>
              </button>
            </div>
          )}

          {activePractice === null && (
            <VocabularyPracticeRoadmap
              unit={effectiveUnit}
              user={user}
              progress={unitPracticeProgress}
              onSelectPractice={(type) => setActivePractice(type)}
            />
          )}

          {activePractice === 'match' && (
            <MatchExercise
              unit={effectiveUnit}
              user={user}
              onComplete={refreshPracticeProgress}
              onNext={handleNextPracticeStep}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}

          {activePractice === 'choose_meaning' && (
            <ChooseMeaningExercise
              unit={effectiveUnit}
              user={user}
              onComplete={refreshPracticeProgress}
              onNext={handleNextPracticeStep}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}

          {activePractice === 'listen_and_choose' && (
            <ListenChooseExercise
              unit={effectiveUnit}
              user={user}
              onComplete={refreshPracticeProgress}
              onNext={handleNextPracticeStep}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}

          {activePractice === 'type_word' && (
            <TypeWordExercise
              unit={effectiveUnit}
              user={user}
              onComplete={refreshPracticeProgress}
              onNext={handleNextPracticeStep}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}

          {activePractice === 'complete_sentence' && (
            <CompleteSentenceExercise
              unit={effectiveUnit}
              user={user}
              onComplete={refreshPracticeProgress}
              onNext={handleNextPracticeStep}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}

          {activePractice === 'challenge' && (
            <VocabularyChallengeExercise
              unit={effectiveUnit}
              user={user}
              onComplete={refreshPracticeProgress}
              onNext={() => {
                refreshPracticeProgress();
                setActivePractice(null);
              }}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}

          {activePractice === 'review_wrong_words' && (
            <ReviewWrongWordsExercise
              unit={effectiveUnit}
              user={user}
              onBackToRoadmap={() => setActivePractice(null)}
            />
          )}
        </div>
      )}

      {/* TAB 1: LEARN (Word List with Search & Filters) */}
      {activeTab === 'learn' && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#E5DDD0]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#5C6B57] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm từ tiếng Anh, phiên âm, nghĩa tiếng Việt..."
                className="w-full pl-9.5 pr-4 py-2 text-xs bg-[#FAF7F2] rounded-xl border border-[#E5DDD0] focus:ring-2 focus:ring-[#4B5D44] focus:outline-none text-[#2D332A]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-[11px] font-bold text-[#5C6B57] whitespace-nowrap pl-1">Lọc:</span>
              {(['all', 'new', 'learning', 'good', 'mastered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-[#4B5D44] text-white border-[#4B5D44]'
                      : 'bg-[#FAF7F2] text-[#5C6B57] border-[#E5DDD0] hover:bg-[#F7EFE6]'
                  }`}
                >
                  {st === 'all'
                    ? 'Tất cả'
                    : st === 'new'
                    ? 'Mới'
                    : st === 'learning'
                    ? 'Đang học'
                    : st === 'good'
                    ? 'Khá tốt'
                    : 'Đã thuộc'}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-[#5C6B57] px-1">
            <span>
              Hiển thị <strong>{filteredVocabList.length}</strong> / {vocabList.length} từ vựng
            </span>
            <button
              onClick={() => setActiveTab('flashcards')}
              className="font-bold text-[#4B5D44] hover:underline"
            >
              Luyện Flashcard ({filteredVocabList.length} từ) →
            </button>
          </div>

          {/* Word Cards Grid */}
          {filteredVocabList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredVocabList.map((item) => (
                <VocabularyCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E5DDD0] space-y-2">
              <p className="text-sm font-bold text-[#2D332A]">Không tìm thấy từ vựng phù hợp</p>
              <p className="text-xs text-[#5C6B57]">Hãy thử đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="bg-[#FAF7F2] border border-[#E5DDD0] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#F7EFE6] text-[#2D332A] mt-2"
              >
                Đặt lại tìm kiếm
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLASHCARDS (Spaced Repetition) */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6 max-w-lg mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-[#5C6B57] px-2">
            <span>
              Thẻ {flashcardIndex + 1} / {vocabList.length}
            </span>
            <span className="text-[#4B5D44]">Lặp lại ngắt quãng (Spaced Repetition)</span>
          </div>

          {vocabList[flashcardIndex] && (
            <Flashcard
              item={vocabList[flashcardIndex]}
              onAnswer={handleFlashcardChoice}
            />
          )}

          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setFlashcardIndex(Math.max(0, flashcardIndex - 1))}
              disabled={flashcardIndex === 0}
              className="text-xs font-bold text-[#5C6B57] disabled:opacity-30 hover:text-[#2D332A] px-3 py-1.5 rounded-xl bg-white border border-[#E5DDD0]"
            >
              ← Thẻ trước
            </button>

            <button
              onClick={() => setFlashcardIndex((flashcardIndex + 1) % vocabList.length)}
              className="text-xs font-bold text-[#4B5D44] hover:underline px-3 py-1.5"
            >
              Bỏ qua / Thẻ sau →
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ (Interactive 2-attempt flow) */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto space-y-5">
          {!quizCompleted && quizQuestions.length > 0 ? (
            <div className="bg-white rounded-[22px] p-6 border border-[#E5DDD0] shadow-xs space-y-5">
              {/* Question header */}
              <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-3">
                <span className="text-xs font-extrabold text-[#4B5D44] uppercase tracking-wider">
                  Câu hỏi {quizIndex + 1} / {quizQuestions.length}
                </span>
                <span className="text-xs font-bold text-[#5C6B57]">
                  Điểm: {quizScore} / {quizQuestions.length}
                </span>
              </div>

              {/* Question prompt */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-[#2D332A] leading-snug font-serif">
                  {quizQuestions[quizIndex].question}
                </h3>
                {quizQuestions[quizIndex].wordEn && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5C6B57]">Nghe từ gốc:</span>
                    <AudioButton text={quizQuestions[quizIndex].wordEn} size="sm" />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {quizQuestions[quizIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  let btnStyle =
                    'bg-[#FAF7F2] border-[#E5DDD0] text-[#2D332A] hover:border-[#BC8A5F] hover:bg-[#F7EFE6]';

                  if (isSelected) {
                    btnStyle = 'bg-[#FAF2E4] border-[#BC8A5F] text-[#875514] font-bold ring-2 ring-[#BC8A5F]/30';
                  }

                  if (feedback === 'correct' && opt === quizQuestions[quizIndex].answer) {
                    btnStyle = 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732] font-bold';
                  }

                  if (feedback === 'failed') {
                    if (opt === quizQuestions[quizIndex].answer) {
                      btnStyle = 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732] font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-[#F9EBE9] border-[#ECC7C3] text-[#88372A] font-bold line-through';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={feedback === 'correct' || feedback === 'failed'}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback messages */}
              {feedback === 'try_again' && (
                <div className="bg-[#FAF2E4] border border-[#F0DEBA] p-4 rounded-xl text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-[#875514] font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Chưa chính xác. Bạn còn 1 cơ hội thử lại!</span>
                  </div>
                  <p className="text-[#875514]">
                    💡 <strong>Gợi ý:</strong> {quizQuestions[quizIndex].hint}
                  </p>
                </div>
              )}

              {feedback === 'correct' && (
                <div className="bg-[#E8EFE6] border border-[#C6D8C2] p-4 rounded-xl text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-[#384732] font-black text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chính xác! Làm tốt lắm! (+5 XP)</span>
                  </div>
                  <p className="text-[#384732]">{quizQuestions[quizIndex].explanationVi}</p>
                </div>
              )}

              {feedback === 'failed' && (
                <div className="bg-[#F9EBE9] border border-[#ECC7C3] p-4 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-[#88372A] font-black text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Đáp án đúng là: "{quizQuestions[quizIndex].answer}"</span>
                  </div>
                  <p className="text-[#88372A]">
                    📖 <strong>Giải thích:</strong> {quizQuestions[quizIndex].explanationVi}
                  </p>
                  <p className="text-[11px] text-[#88372A] italic">
                    Câu hỏi này đã được tự động lưu vào mục "My Mistakes" để bạn ôn tập lại.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                {feedback === 'idle' || feedback === 'try_again' ? (
                  <button
                    onClick={handleSubmitQuizAnswer}
                    disabled={!selectedOption}
                    className="bg-[#4B5D44] hover:bg-[#3D4C37] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-extrabold text-sm shadow-xs transition-all"
                  >
                    {feedback === 'try_again' ? 'Thử lại (Attempt 2)' : 'Kiểm tra đáp án'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="bg-[#2D332A] hover:bg-[#1E231C] text-white px-6 py-2.5 rounded-xl font-extrabold text-sm shadow-xs transition-all"
                  >
                    {quizIndex < quizQuestions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả quiz'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed Results */
            <div className="bg-white rounded-[22px] p-6 text-center border border-[#E5DDD0] shadow-xs space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#E8EFE6] text-[#384732] mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#2D332A] font-serif">
                  Hoàn thành Vocabulary Quiz!
                </h3>
                <p className="text-xs text-[#5C6B57]">
                  Kết quả đã được ghi lại vào lịch sử học tập
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DDD0]">
                  <span className="text-[11px] font-bold text-[#5C6B57] block">Điểm số</span>
                  <span className="text-2xl font-black text-[#4B5D44] font-serif">
                    {quizScore} / {quizQuestions.length}
                  </span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DDD0]">
                  <span className="text-[11px] font-bold text-[#5C6B57] block">Tỉ lệ đúng</span>
                  <span className="text-2xl font-black text-[#384732] font-serif">
                    {quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 100}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="bg-white border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#2D332A] px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  Làm lại quiz
                </button>
                <button
                  onClick={onBack}
                  className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-xs transition-colors"
                >
                  Hoàn thành bài học
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
