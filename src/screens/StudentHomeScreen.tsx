import React from 'react';
import { UserProfile, StudentProgress } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { studentService } from '../services/studentService';
import { googleSheetsService } from '../services/googleSheetsService';
import {
  BookOpen,
  Sparkles,
  Flame,
  ArrowRight,
  BookA,
  PenTool,
  Volume2,
  Headphones,
  Trophy,
  RotateCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
  Check,
  CloudCheck,
} from 'lucide-react';

interface StudentHomeScreenProps {
  user: UserProfile;
  progress: StudentProgress;
  mistakesCount?: number;
  onNavigate?: (route: string) => void;
  onNavigateUnit?: (unitNumber: number) => void;
  onNavigateModule?: (unitNumber: number, moduleName: 'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice') => void;
  onNavigateReview?: () => void;
  onNavigateUnits?: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  user,
  progress,
  mistakesCount = 0,
  onNavigate,
  onNavigateUnit,
  onNavigateModule,
  onNavigateReview,
  onNavigateUnits,
}) => {
  const firstName = studentService.getStudentDisplayName(user.name);

  const handleGoModule = (mod: 'vocab' | 'grammar' | 'pronunciation' | 'listening' | 'practice') => {
    if (onNavigateModule) {
      onNavigateModule(1, mod);
    } else if (onNavigate) {
      onNavigate(`unit/1/${mod}`);
    }
  };

  const handleGoUnits = () => {
    if (onNavigateUnits) {
      onNavigateUnits();
    } else if (onNavigate) {
      onNavigate('units');
    }
  };

  const handleGoReview = () => {
    if (onNavigateReview) {
      onNavigateReview();
    } else if (onNavigate) {
      onNavigate('review');
    }
  };
  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Greeting Banner */}
      <div className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#E5DDD0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full uppercase tracking-wider">
                English 9 - Miss Hiền
              </span>
              <span className="text-xs font-semibold text-[#5C6B57]">
                Lớp {user.className || '9A'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D332A] mt-1.5 tracking-tight font-serif">
              Hello, {firstName}! 👋
            </h1>
            <p className="text-sm font-medium text-[#5C6B57] mt-0.5">
              Let's learn something today. Cùng chinh phục Unit 1 nhé!
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DDD0] shadow-xs">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-[#5C6B57] block">Tiến độ</span>
              <span className="text-lg font-black text-[#4B5D44] font-serif">
                {progress.unitProgress}%
              </span>
            </div>
            <div className="text-center px-2 border-x border-[#E5DDD0]">
              <span className="text-[10px] font-bold text-[#5C6B57] block">XP</span>
              <span className="text-lg font-black text-[#384732] font-serif">
                {user.xp}
              </span>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-[#5C6B57] block">Chuỗi</span>
              <span className="text-lg font-black text-[#875514] font-serif flex items-center justify-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-[#BC8A5F] text-[#BC8A5F]" />
                {user.streak}d
              </span>
            </div>
          </div>
        </div>

        {/* Unit Overall Progress */}
        <div className="mt-5 pt-4 border-t border-[#E5DDD0]">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-[#2D332A]">Tiến độ học tập tổng quan</span>
            <span className="text-[#384732] font-extrabold">{progress.unitProgress}% Hoàn thành</span>
          </div>
          <ProgressBar progress={progress.unitProgress} color="blue" size="md" />
        </div>
      </div>

      {/* SECTION: Continue Learning */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#2D332A] flex items-center gap-2 font-serif">
            <Clock className="w-4 h-4 text-[#4B5D44]" />
            <span>Tiếp tục học (Continue Learning)</span>
          </h2>
          <button
            onClick={handleGoUnits}
            className="text-xs font-bold text-[#4B5D44] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Tất cả Unit</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5DDD0] shadow-xs hover:border-[#D9C5B2] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#8E5D32] bg-[#F7EFE6] border border-[#E5D2C0] px-2 py-0.5 rounded-md">
                  UNIT 1
                </span>
                <span className="text-xs font-bold text-[#5C6B57]">Local Community</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#2D332A] font-serif">
                Listening (Nghe điền từ: A Traditional Craft Village)
              </h3>
              <p className="text-xs text-[#5C6B57] font-medium">
                Nghe giọng chuẩn British English (en-GB) • 5 chỗ trống • Max 3 lần nghe
              </p>
            </div>

            <button
              id="continue-btn"
              onClick={() => handleGoModule('listening')}
              className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-6 py-3 rounded-xl font-extrabold text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <ProgressBar progress={progress.practiceProgress || 80} color="green" size="sm" />
          </div>
        </div>
      </div>

      {/* SECTION: Learn (Key Modules) */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-[#2D332A] flex items-center gap-2 font-serif">
          <BookOpen className="w-4 h-4 text-[#8E5D32]" />
          <span>Các kỹ năng trọng tâm (Learn)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {/* Card 1: Vocabulary */}
          <div
            id="card-vocab"
            onClick={() => handleGoModule('vocab')}
            className="group bg-white hover:bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#384732] flex items-center justify-center font-black">
                <BookA className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
                {progress.vocabularyProgress}%
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#4B5D44] transition-colors font-serif">
                Vocabulary (Từ vựng)
              </h3>
              <p className="text-xs text-[#5C6B57] mt-0.5">
                12 từ vựng Unit 1 • Flashcard lặp lại ngắt quãng & Quiz
              </p>
            </div>
            <ProgressBar progress={progress.vocabularyProgress} color="blue" size="sm" />
          </div>

          {/* Card 2: Grammar */}
          <div
            id="card-grammar"
            onClick={() => handleGoModule('grammar')}
            className="group bg-white hover:bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] hover:border-[#BC8A5F]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2E4] text-[#875514] flex items-center justify-center font-black">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#875514] bg-[#FAF2E4] border border-[#F0DEBA] px-2.5 py-1 rounded-full">
                {progress.grammarProgress}%
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#BC8A5F] transition-colors font-serif">
                Grammar (Ngữ pháp)
              </h3>
              <p className="text-xs text-[#5C6B57] mt-0.5">
                Question words + to-infinitive & Phrasal verbs (3 cấp độ)
              </p>
            </div>
            <ProgressBar progress={progress.grammarProgress} color="yellow" size="sm" />
          </div>

          {/* Card 3: Pronunciation */}
          <div
            id="card-pronunciation"
            onClick={() => handleGoModule('pronunciation')}
            className="group bg-white hover:bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#384732] flex items-center justify-center font-black">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#384732] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
                {progress.pronunciationProgress}%
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#4B5D44] transition-colors font-serif">
                Pronunciation (Phát âm)
              </h3>
              <p className="text-xs text-[#5C6B57] mt-0.5">
                Luyện âm /æ/, /ɑː/, /e/ • Đánh giá giọng nói AI & Cặp từ
              </p>
            </div>
            <ProgressBar progress={progress.pronunciationProgress} color="green" size="sm" />
          </div>

          {/* Card 4: Listening - Fill in the Blanks */}
          <div
            id="card-listening"
            onClick={() => handleGoModule('listening')}
            className="group bg-white hover:bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] hover:border-[#4B5D44]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#4B5D44] flex items-center justify-center font-black">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#4B5D44] bg-[#E8EFE6] border border-[#C6D8C2] px-2.5 py-1 rounded-full">
                {progress.practiceProgress || 80}%
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#4B5D44] transition-colors font-serif">
                Listening (Nghe điền từ)
              </h3>
              <p className="text-xs text-[#5C6B57] mt-0.5">
                24 bài nghe 12 Units • Giọng British English & Nghe 3 lần
              </p>
            </div>
            <ProgressBar progress={progress.practiceProgress || 80} color="green" size="sm" />
          </div>

          {/* Card 5: Practice & Challenge */}
          <div
            id="card-practice"
            onClick={() => handleGoModule('practice')}
            className="group bg-white hover:bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E5DDD0] hover:border-[#A64B3B]/50 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-3 sm:col-span-2 md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F9EBE9] text-[#88372A] flex items-center justify-center font-black">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#88372A] bg-[#F9EBE9] border border-[#ECC7C3] px-2.5 py-1 rounded-full">
                {progress.practiceProgress}%
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2D332A] group-hover:text-[#88372A] transition-colors font-serif">
                Practice & Challenge
              </h3>
              <p className="text-xs text-[#5C6B57] mt-0.5">
                Listening Gap-fill (Mr. Vinh) & Unit 1 Challenge 100đ
              </p>
            </div>
            <ProgressBar progress={progress.practiceProgress} color="red" size="sm" />
          </div>
        </div>
      </div>

      {/* SECTION: Review & Mistakes */}
      <div className="bg-[#FAF2E4] rounded-2xl p-5 border border-[#F0DEBA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <RotateCcw className="w-4 h-4 text-[#875514]" />
            <h3 className="font-extrabold text-base text-[#2D332A] font-serif">
              Khu vực Ôn tập & Sửa lỗi (Review)
            </h3>
          </div>
          <p className="text-xs text-[#875514] font-medium">
            12 từ cần ôn ngắt quãng • {mistakesCount} câu làm sai cần luyện lại
          </p>
        </div>

        <button
          id="review-now-btn"
          onClick={handleGoReview}
          className="bg-[#BC8A5F] hover:bg-[#A8764D] text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <span>REVIEW NOW</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
