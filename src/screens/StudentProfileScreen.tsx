import React from 'react';
import { UserProfile, StudentProgress, QuizAttempt } from '../types';
import { store } from '../services/store';
import { ProgressBar } from '../components/ProgressBar';
import {
  UserCircle,
  Trophy,
  Flame,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';

interface StudentProfileScreenProps {
  user: UserProfile;
  progress: StudentProgress;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  user,
  progress,
}) => {
  const attempts = store.getQuizAttempts(user.id);
  const vocabList = store.getVocabListWithStatus(user.id, 1);
  const wordsMastered = vocabList.filter((v) => v.status === 'mastered').length;

  const totalExercises = attempts.length;
  const accuracy = totalExercises > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalExercises)
    : 0;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4 sm:px-6">
      {/* Profile Header */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E5DDD0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#4B5D44] text-white flex items-center justify-center font-black text-2xl shadow-xs font-serif">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#2D332A] font-serif">
                  {user.name}
                </h1>
                <span className="text-xs font-black bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2] px-2.5 py-0.5 rounded-full">
                  Lớp {user.className}
                </span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-0.5">{user.email}</p>
              <p className="text-[11px] text-[#5C6B57] mt-1">
                Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#FAF2E4] border border-[#F0DEBA] text-[#8E5D32] px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-[#8E5D32]" />
              <span>{user.streak} ngày liên tục</span>
            </div>
            <div className="bg-[#E8EFE6] border border-[#C6D8C2] text-[#384732] px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{user.xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-3 border-t border-[#EBE3D5]">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-[#2D332A]">Tiến độ học tập Unit 1</span>
            <span className="text-[#4B5D44] font-extrabold">{progress.unitProgress}%</span>
          </div>
          <ProgressBar progress={progress.unitProgress} color="green" size="md" />
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E5DDD0] shadow-xs text-center space-y-1">
          <span className="text-xs font-bold text-[#5C6B57] block">Từ vựng đã thuộc</span>
          <span className="text-2xl font-black text-[#384732] font-serif">{wordsMastered} / 12</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5DDD0] shadow-xs text-center space-y-1">
          <span className="text-xs font-bold text-[#5C6B57] block">Bài đã làm</span>
          <span className="text-2xl font-black text-[#4B5D44] font-serif">{totalExercises}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5DDD0] shadow-xs text-center space-y-1">
          <span className="text-xs font-bold text-[#5C6B57] block">Độ chính xác TB</span>
          <span className="text-2xl font-black text-[#384732] font-serif">{accuracy}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5DDD0] shadow-xs text-center space-y-1">
          <span className="text-xs font-bold text-[#5C6B57] block">Điểm trung bình</span>
          <span className="text-2xl font-black text-[#8E5D32] font-serif">{progress.averageScore || accuracy}%</span>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5DDD0] shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#2D332A] font-serif flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#4B5D44]" />
          <span>Lịch sử học tập gần đây</span>
        </h3>

        {attempts.length > 0 ? (
          <div className="space-y-2.5">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#2D332A]">{att.activityName}</span>
                    <span className="text-[10px] font-bold bg-white border border-[#E5DDD0] px-2 py-0.5 rounded-md text-[#5C6B57]">
                      Lần {att.attemptNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C6B57] mt-0.5">
                    Unit {att.unit} • {new Date(att.submittedAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black ${
                    att.percentage >= 80 ? 'text-[#384732]' : 'text-[#8E5D32]'
                  }`}>
                    {att.score}/{att.maxScore} ({att.percentage}%)
                  </span>
                  <span className="block text-[10px] font-bold text-[#4B5D44]">
                    +{att.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#5C6B57] italic">Chưa có hoạt động làm bài nào.</p>
        )}
      </div>
    </div>
  );
};
