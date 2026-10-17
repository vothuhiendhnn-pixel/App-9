import { StudentPillars } from '../components/StudentPillars';
import React from 'react';
import { UserProfile, StudentProgress } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { studentService } from '../services/studentService';
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
  const [activeTab, setActiveTab] = React.useState('units');
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
      
      {/* --- GIAO DIỆN 3 TRỤ CỘT MỚI --- */}
      <StudentPillars onNavigate={onNavigateUnits} />
      
    </div>
  );
};
