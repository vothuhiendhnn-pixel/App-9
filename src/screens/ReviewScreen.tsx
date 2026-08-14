import React, { useState } from 'react';
import { UserProfile, MistakeItem, VocabularyItem } from '../types';
import { store } from '../services/store';
import { AudioButton } from '../components/AudioButton';
import {
  RotateCcw,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  Play,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewScreenProps {
  user: UserProfile;
  onNavigateHome: () => void;
  onUpdateProgress: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  user,
  onNavigateHome,
  onUpdateProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'mistakes' | 'vocab' | 'grammar' | 'weak_words'>('mistakes');
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => store.getMistakes(user.id));
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(() => store.getAllVocabWithStatus(user.id));

  // Practice My Mistakes Quiz State
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<'idle' | 'correct' | 'try_again'>('idle');

  const weakWords = vocabList.filter((v) => v.status === 'learning' || v.status === 'new');
  const activeMistake = mistakes[practiceIdx];

  const handleStartPracticeMistakes = () => {
    if (mistakes.length === 0) return;
    setIsPracticing(true);
    setPracticeIdx(0);
    setPracticeInput('');
    setPracticeFeedback('idle');
  };

  const handleCheckMistakePractice = () => {
    if (!practiceInput.trim()) return;
    const isCorrect = practiceInput.trim().toLowerCase() === activeMistake.correctAnswer.toLowerCase();

    if (isCorrect) {
      setPracticeFeedback('correct');
      store.resolveMistake(user.id, activeMistake.questionId);
      store.addXP(user.id, 10);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } else {
      setPracticeFeedback('try_again');
    }
  };

  const handleNextMistakePractice = () => {
    setPracticeInput('');
    setPracticeFeedback('idle');
    const updatedMistakes = store.getMistakes(user.id);
    setMistakes(updatedMistakes);

    if (practiceIdx < updatedMistakes.length - 1) {
      setPracticeIdx(practiceIdx + 1);
    } else {
      setIsPracticing(false);
      alert('Hoan hô! Bạn đã ôn luyện xong danh sách lỗi sai.');
      onUpdateProgress();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8E5D32] bg-[#FAF2E4] border border-[#F0DEBA] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Spaced Repetition & Error Correction
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif tracking-tight">
          Khu vực Ôn tập & Sửa lỗi (Review)
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#5C6B57]">
          Biến các câu trả lời sai thành bài học và củng cố kiến thức ngắt quãng.
        </p>
      </div>

      {/* 4 Tabs */}
      <div className="flex items-center gap-1 bg-[#EBE3D5] p-1 rounded-2xl overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('mistakes');
            setIsPracticing(false);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'mistakes' ? 'bg-white text-[#88372A] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>My Mistakes ({mistakes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('vocab');
            setIsPracticing(false);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'vocab' ? 'bg-white text-[#4B5D44] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Vocabulary Review</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('grammar');
            setIsPracticing(false);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'grammar' ? 'bg-white text-[#875514] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grammar Summary</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('weak_words');
            setIsPracticing(false);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'weak_words' ? 'bg-white text-[#8E5D32] shadow-xs' : 'text-[#5C6B57] hover:text-[#2D332A]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Weak Words ({weakWords.length})</span>
        </button>
      </div>

      {/* TAB 1: MY MISTAKES */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          {!isPracticing ? (
            <>
              {/* Practice button banner */}
              <div className="bg-[#FAF2E4] p-5 rounded-2xl border border-[#F0DEBA] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-base text-[#2D332A] font-serif">
                    Luyện tập các câu đã làm sai ({mistakes.length} câu)
                  </h3>
                  <p className="text-xs text-[#8E5D32]">
                    Hệ thống sẽ tạo bài kiểm tra ngắn từ chính các lỗi sai của bạn.
                  </p>
                </div>

                <button
                  onClick={handleStartPracticeMistakes}
                  disabled={mistakes.length === 0}
                  className="bg-[#8E5D32] hover:bg-[#784D28] disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>PRACTICE MY MISTAKES</span>
                </button>
              </div>

              {/* List of mistakes */}
              {mistakes.length > 0 ? (
                <div className="space-y-3">
                  {mistakes.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl p-5 border border-[#E5DDD0] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#88372A] bg-[#F9EBE9] border border-[#ECC7C3] px-2.5 py-0.5 rounded-md uppercase">
                          Unit {m.unit} • {m.module}
                        </span>
                        <span className="text-[#5C6B57]">
                          Sai {m.attemptCount} lần • {new Date(m.lastAttempt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#2D332A]">
                        {m.question}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#F9EBE9] border border-[#ECC7C3] text-[#88372A]">
                          <span className="font-bold block text-[10px] uppercase">Câu trả lời của bạn:</span>
                          <span className="font-semibold">{m.studentAnswer}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#E8EFE6] border border-[#C6D8C2] text-[#384732]">
                          <span className="font-bold block text-[10px] uppercase">Đáp án chính xác:</span>
                          <span className="font-extrabold">{m.correctAnswer}</span>
                        </div>
                      </div>

                      {m.explanationVi && (
                        <p className="text-xs text-[#5C6B57] bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DDD0]">
                          💡 <strong>Giải thích:</strong> {m.explanationVi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-[#E5DDD0] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#E8EFE6] text-[#384732] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg text-[#2D332A] font-serif">Không có lỗi sai nào cần ôn tập!</h4>
                  <p className="text-xs text-[#5C6B57]">
                    Bạn đang làm rất tốt tất cả các bài tập trong Unit 1.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Active Practice Mistakes View */
            <div className="bg-white rounded-2xl p-6 border border-[#E5DDD0] shadow-xs space-y-5 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-3 text-xs font-bold text-[#5C6B57]">
                <span className="text-[#88372A] font-extrabold uppercase">
                  Sửa lỗi {practiceIdx + 1} / {mistakes.length}
                </span>
                <button
                  onClick={() => setIsPracticing(false)}
                  className="text-[#5C6B57] hover:underline"
                >
                  Thoát ôn tập
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#5C6B57] uppercase">Câu hỏi:</span>
                <h3 className="text-base font-extrabold text-[#2D332A] font-serif">
                  {activeMistake?.question}
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C6B57]">Nhập câu trả lời chính xác:</label>
                <input
                  type="text"
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  disabled={practiceFeedback === 'correct'}
                  placeholder="Gõ đáp án đúng..."
                  className="w-full p-3 rounded-xl border border-[#E5DDD0] focus:border-[#4B5D44] focus:outline-hidden text-sm font-semibold"
                />
              </div>

              {practiceFeedback === 'try_again' && (
                <div className="bg-[#FAF2E4] border border-[#F0DEBA] p-3 rounded-xl text-xs text-[#875514] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Chưa đúng! Gợi ý: {activeMistake?.explanationVi}</span>
                </div>
              )}

              {practiceFeedback === 'correct' && (
                <div className="bg-[#E8EFE6] border border-[#C6D8C2] p-3 rounded-xl text-xs text-[#384732] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tuyệt vời! Đã khắc phục lỗi sai thành công (+10 XP)</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                {practiceFeedback !== 'correct' ? (
                  <button
                    onClick={handleCheckMistakePractice}
                    className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button
                    onClick={handleNextMistakePractice}
                    className="bg-[#2D332A] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs"
                  >
                    Câu tiếp theo →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VOCABULARY REVIEW (Spaced Repetition Status) */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#E8EFE6] p-3 rounded-xl text-center border border-[#C6D8C2]">
              <span className="text-[10px] font-bold text-[#384732] block">ĐÃ THUỘC (7d)</span>
              <span className="text-xl font-black text-[#384732] font-serif">
                {vocabList.filter((v) => v.status === 'mastered').length}
              </span>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl text-center border border-[#F0DEBA]">
              <span className="text-[10px] font-bold text-[#8E5D32] block">KHÁ TỐT (3d)</span>
              <span className="text-xl font-black text-[#8E5D32] font-serif">
                {vocabList.filter((v) => v.status === 'good').length}
              </span>
            </div>
            <div className="bg-[#FAF7F2] p-3 rounded-xl text-center border border-[#E5DDD0]">
              <span className="text-[10px] font-bold text-[#875514] block">ĐANG HỌC (1d)</span>
              <span className="text-xl font-black text-[#875514] font-serif">
                {vocabList.filter((v) => v.status === 'learning').length}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl text-center border border-[#E5DDD0]">
              <span className="text-[10px] font-bold text-[#5C6B57] block">TỪ MỚI</span>
              <span className="text-xl font-black text-[#5C6B57] font-serif">
                {vocabList.filter((v) => v.status === 'new' || !v.status).length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vocabList.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-[#E5DDD0] flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-[#2D332A] font-serif">{item.word}</h4>
                  <p className="text-xs font-bold text-[#BC8A5F]">{item.meaningVi}</p>
                </div>
                <AudioButton text={item.word} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GRAMMAR SUMMARY */}
      {activeTab === 'grammar' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5DDD0] space-y-3 shadow-xs">
            <h3 className="font-black text-base text-[#2D332A] font-serif">
              1. Question words before to-infinitives
            </h3>
            <p className="text-xs text-[#5C6B57] leading-relaxed">
              Cấu trúc: <strong>what / where / when / who / how + to + V (nguyên mẫu)</strong>
            </p>
            <div className="bg-[#E8EFE6] border border-[#C6D8C2] p-3 rounded-xl text-xs font-medium text-[#384732]">
              Ví dụ: "I don't know <strong>how to solve</strong> this problem."
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5DDD0] space-y-3 shadow-xs">
            <h3 className="font-black text-base text-[#2D332A] font-serif">
              2. 8 Phrasal Verbs thông dụng Unit 1
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">look around:</strong> đi quanh để xem
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">come back:</strong> quay trở lại
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">hand down:</strong> truyền lại cho đời sau
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">find out:</strong> tìm hiểu thông tin
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">take care of:</strong> chăm sóc, trông nom
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">get on with:</strong> có quan hệ tốt với
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">cut down on:</strong> cắt giảm bớt
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E5DDD0]">
                <strong className="text-[#8E5D32]">run out of:</strong> hết, cạn kiệt
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEAK WORDS */}
      {activeTab === 'weak_words' && (
        <div className="space-y-4">
          <div className="bg-[#FAF2E4] p-4 rounded-2xl border border-[#F0DEBA] text-xs text-[#875514] font-medium">
            Danh sách các từ vựng bạn cần củng cố thêm (trạng thái "Đang học" hoặc "Mới"):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakWords.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-[#E5DDD0] flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-[#2D332A] font-serif">{item.word}</h4>
                  <p className="text-xs font-bold text-[#BC8A5F]">{item.meaningVi}</p>
                </div>
                <AudioButton text={item.word} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
