import React from 'react';
import { UNITS_DATA } from '../data/unitsData';
import { StudentProgress } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import {
  ArrowLeft,
  BookA,
  PenTool,
  Volume2,
  Headphones,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface UnitDetailScreenProps {
  unitId?: number;
  unitNumber?: number;
  user?: any;
  progress: StudentProgress;
  onBack: () => void;
  onNavigateModule?: (modulePath: string) => void;
  onSelectModule?: (module: 'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice' | 'challenge') => void;
}

export const UnitDetailScreen: React.FC<UnitDetailScreenProps> = ({
  unitId,
  unitNumber,
  progress,
  onBack,
  onNavigateModule,
  onSelectModule,
}) => {
  const currentId = unitNumber || unitId || 1;
  const unit = UNITS_DATA.find((u) => u.id === currentId) || UNITS_DATA[0];

  const handleGo = (mod: 'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice') => {
    if (onSelectModule) {
      onSelectModule(mod);
    } else if (onNavigateModule) {
      onNavigateModule(`unit/${currentId}/${mod}`);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3 py-1.5 rounded-xl transition-colors shadow-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại danh sách Unit</span>
      </button>

      {/* Unit Header Banner */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E5DDD0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#4B5D44] text-[#F7F3E9] font-black text-xs px-2.5 py-1 rounded-lg">
                UNIT {unit.id}
              </span>
              <span className="text-xs font-bold text-[#8E5D32]">
                {unit.vietnameseTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D332A] mt-1.5 tracking-tight font-serif">
              {unit.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6B57] font-medium mt-1 leading-relaxed">
              {unit.description}
            </p>
          </div>

          <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E5DDD0] text-center min-w-[120px] shadow-xs">
            <span className="text-[11px] font-bold text-[#5C6B57] block">Tiến độ Unit</span>
            <span className="text-2xl font-black text-[#4B5D44] font-serif">
              {progress.unitProgress}%
            </span>
          </div>
        </div>

        <ProgressBar progress={progress.unitProgress} color="blue" size="md" showLabel />
      </div>

      {/* 4 Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-[#2D332A] uppercase tracking-wider text-[11px]">
          Các mô-đun bài học (Modules)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Module 1: Vocabulary */}
          <div
            id="module-vocab"
            onClick={() => handleGo('vocab')}
            className="group bg-white rounded-2xl p-5 border border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#384732] flex items-center justify-center font-black">
                <BookA className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
                {progress.vocabularyProgress}%
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#4B5D44] transition-colors font-serif">
                  VOCABULARY
                </h3>
                <span className="text-xs font-bold text-[#5C6B57]">Global Success</span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-1">
                Từ vựng trọng tâm Unit {currentId}, phát âm IPA, nghĩa và bài tập trắc nghiệm.
              </p>
            </div>

            <ProgressBar progress={progress.vocabularyProgress} color="blue" size="sm" />

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#4B5D44]">
              <span>Learn • Flashcards • Quiz</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 2: Grammar */}
          <div
            id="module-grammar"
            onClick={() => handleGo('grammar')}
            className="group bg-white rounded-2xl p-5 border border-[#E5DDD0] hover:border-[#BC8A5F]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2E4] text-[#875514] flex items-center justify-center font-black">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#875514] bg-[#FAF2E4] border border-[#F0DEBA] px-2.5 py-1 rounded-full">
                {progress.grammarProgress}%
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#BC8A5F] transition-colors font-serif">
                  GRAMMAR
                </h3>
                <span className="text-xs font-bold text-[#5C6B57]">20 câu hỏi</span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-1">
                Lý thuyết công thức trọng tâm & 20 câu bài tập trắc nghiệm, điền từ, viết lại câu.
              </p>
            </div>

            <ProgressBar progress={progress.grammarProgress} color="yellow" size="sm" />

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#875514]">
              <span>Lý thuyết • 20 câu hỏi • Giải thích chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 3: Pronunciation */}
          <div
            id="module-pronunciation"
            onClick={() => handleGo('pronunciation')}
            className="group bg-white rounded-2xl p-5 border border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#384732] flex items-center justify-center font-black">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
                {progress.pronunciationProgress}%
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#4B5D44] transition-colors font-serif">
                  PRONUNCIATION
                </h3>
                <span className="text-xs font-bold text-[#5C6B57]">Phát âm</span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-1">
                Luyện phát âm chuẩn IPA, cặp từ tối thiểu và ngữ điệu câu.
              </p>
            </div>

            <ProgressBar progress={progress.pronunciationProgress} color="green" size="sm" />

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#384732]">
              <span>Listen & Repeat • Voice assessment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 4: Listening - Fill in the Blanks */}
          <div
            id="module-listening"
            onClick={() => handleGo('listening')}
            className="group bg-white rounded-2xl p-5 border border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#4B5D44] flex items-center justify-center font-black">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#4B5D44] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
                {progress.practiceProgress || 80}%
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#4B5D44] transition-colors font-serif">
                  LISTENING (Nghe điền từ)
                </h3>
                <span className="text-xs font-bold text-[#5C6B57]">2 Lessons</span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-1">
                Nghe audio British English (en-GB) và điền từ vào chỗ trống theo SGK.
              </p>
            </div>

            <ProgressBar progress={progress.practiceProgress || 80} color="green" size="sm" />

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#4B5D44]">
              <span>Audio TTS • 5 Blanks • Max 3 Plays</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 5: Practice */}
          <div
            id="module-practice"
            onClick={() => handleGo('practice')}
            className="group bg-white rounded-2xl p-5 border border-[#E5DDD0] hover:border-[#A64B3B]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F9EBE9] text-[#88372A] flex items-center justify-center font-black">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#88372A] bg-[#F9EBE9] border border-[#ECC7C3] px-2.5 py-1 rounded-full">
                {progress.practiceProgress}%
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#88372A] transition-colors font-serif">
                  PRACTICE (Luyện tập)
                </h3>
                <span className="text-xs font-bold text-[#5C6B57]">4 activities</span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-1">
                Bài nghe điền từ: "A Community Helper" (Mr. Vinh) & bài tập tổng hợp.
              </p>
            </div>

            <ProgressBar progress={progress.practiceProgress} color="red" size="sm" />

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#88372A]">
              <span>Listening Gap-fill • Audio timeline</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* UNIT CHALLENGE BANNER */}
      <div className="bg-[#4B5D44] rounded-[22px] p-6 text-[#F7F3E9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#3D4C37]">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#D9C5B2]" />
            <span>Thử thách 100 điểm</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif">
            UNIT 1 CHALLENGE
          </h3>
          <p className="text-xs text-[#E5DDD0] font-medium">
            Đánh giá toàn diện 4 kỹ năng: Từ vựng (30đ), Ngữ pháp (30đ), Phát âm (20đ), Nghe (20đ).
          </p>
        </div>

        <button
          id="unit-challenge-btn"
          onClick={() => onNavigateModule('unit/1/challenge')}
          className="bg-[#F7F3E9] hover:bg-white text-[#2D332A] px-6 py-3.5 rounded-xl font-black text-sm shadow-xs transition-transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
        >
          <Trophy className="w-4 h-4 text-[#BC8A5F]" />
          <span>BẮT ĐẦU THỬ THÁCH</span>
        </button>
      </div>
    </div>
  );
};
