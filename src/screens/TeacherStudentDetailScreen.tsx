import React from 'react';
import { store } from '../services/store';
import { ProgressBar } from '../components/ProgressBar';
import {
  ArrowLeft,
  UserCircle,
  Clock,
  Trophy,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  LogIn,
  Layers,
} from 'lucide-react';

interface TeacherStudentDetailScreenProps {
  studentId: string;
  onBack: () => void;
}

export const TeacherStudentDetailScreen: React.FC<TeacherStudentDetailScreenProps> = ({
  studentId,
  onBack,
}) => {
  const users = store.getUsers();
  const student = users.find((u) => u.id === studentId);
  const attempts = store.getQuizAttempts(studentId);
  const sessions = store.getSessions().filter((s) => s.studentId === studentId);
  const progress = store.getStudentProgress(studentId, 1);
  const mistakes = store.getMistakes(studentId);

  if (!student) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-sm text-[#68738A]">Không tìm thấy thông tin học sinh.</p>
        <button
          onClick={onBack}
          className="bg-[#7DB7FF] text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const totalDurationMins = Math.round(
    sessions.reduce((acc, s) => acc + (s.sessionDurationSeconds || 0), 0) / 60
  );

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : progress.averageScore;

  const highestScore = attempts.length > 0
    ? Math.max(...attempts.map((a) => a.percentage))
    : 0;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B57] hover:text-[#2D332A] bg-white border border-[#E5DDD0] px-3 py-1.5 rounded-xl transition-colors shadow-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại Bảng Giáo Viên</span>
      </button>

      {/* Student Profile Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E5DDD0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#4B5D44] text-white flex items-center justify-center font-black text-2xl shadow-xs font-serif">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#2D332A] font-serif">
                  {student.name}
                </h1>
                <span className="text-xs font-black bg-[#E8EFE6] border border-[#C6D8C2] text-[#384732] px-2.5 py-0.5 rounded-full">
                  Lớp {student.className}
                </span>
              </div>
              <p className="text-xs text-[#5C6B57] mt-0.5">{student.email}</p>
              <p className="text-[11px] text-[#5C6B57] mt-1">
                Truy cập gần nhất: {new Date(student.lastLoginAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#E8EFE6] text-[#384732] px-3 py-1.5 rounded-xl text-xs font-black border border-[#C6D8C2]">
              {student.xp} XP
            </div>
            <div className="bg-[#FAF2E4] text-[#8E5D32] px-3 py-1.5 rounded-xl text-xs font-black border border-[#F0DEBA]">
              Chuỗi {student.streak} ngày
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EBE3D5]">
          <div className="bg-[#FAF7F2] p-3 rounded-xl text-center border border-[#E5DDD0]">
            <span className="text-[10px] font-bold text-[#5C6B57] block uppercase">Tổng thời gian học</span>
            <span className="text-lg font-black text-[#2D332A] font-serif">{totalDurationMins} phút</span>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl text-center border border-[#E5DDD0]">
            <span className="text-[10px] font-bold text-[#5C6B57] block uppercase">Tổng bài đã nộp</span>
            <span className="text-lg font-black text-[#4B5D44] font-serif">{attempts.length} bài</span>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl text-center border border-[#E5DDD0]">
            <span className="text-[10px] font-bold text-[#5C6B57] block uppercase">Điểm trung bình</span>
            <span className="text-lg font-black text-[#384732] font-serif">{avgScore}%</span>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl text-center border border-[#E5DDD0]">
            <span className="text-[10px] font-bold text-[#5C6B57] block uppercase">Điểm cao nhất</span>
            <span className="text-lg font-black text-[#8E5D32] font-serif">{highestScore}%</span>
          </div>
        </div>
      </div>

      {/* Student Unit Progress Matrix */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE3D5]">
          <h2 className="font-extrabold text-base text-[#2D332A] font-serif">
            Tiến Độ Từng Kỹ Năng Trong Unit 1
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDD0] text-[#5C6B57] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-3">Vocabulary</th>
                <th className="py-3 px-3">Grammar</th>
                <th className="py-3 px-3">Pronunciation</th>
                <th className="py-3 px-3">Practice</th>
                <th className="py-3 px-3">Điểm TB Unit</th>
                <th className="py-3 px-3">Tiến độ</th>
                <th className="py-3 px-3">Hoạt động cuối</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#EBE3D5]">
                <td className="py-3.5 px-4 font-black text-[#2D332A]">
                  Unit 1 (Local Community)
                </td>
                <td className="py-3.5 px-3 font-bold text-[#4B5D44]">{progress.vocabularyProgress}%</td>
                <td className="py-3.5 px-3 font-bold text-[#875514]">{progress.grammarProgress}%</td>
                <td className="py-3.5 px-3 font-bold text-[#384732]">{progress.pronunciationProgress}%</td>
                <td className="py-3.5 px-3 font-bold text-[#88372A]">{progress.practiceProgress}%</td>
                <td className="py-3.5 px-3 font-black text-[#2D332A]">{progress.averageScore || avgScore}%</td>
                <td className="py-3.5 px-3 font-black text-[#4B5D44]">{progress.unitProgress}%</td>
                <td className="py-3.5 px-3 text-[#5C6B57]">
                  {new Date(progress.lastActivity).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Quiz Attempts & Score History */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE3D5] flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#2D332A] font-serif">
            Lịch Sử Làm Bài & Các Lần Thử (Quiz Attempts)
          </h2>
          <span className="text-xs text-[#5C6B57]">Lưu trữ toàn bộ các lần làm bài</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDD0] text-[#5C6B57] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Kỹ năng</th>
                <th className="py-3 px-3">Tên bài kiểm tra</th>
                <th className="py-3 px-3">Điểm số</th>
                <th className="py-3 px-3">Tỉ lệ (%)</th>
                <th className="py-3 px-3">Lần làm (Attempt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D5]">
              {attempts.length > 0 ? (
                attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#FAF7F2]">
                    <td className="py-3 px-4 text-[#5C6B57]">
                      {new Date(att.submittedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#2D332A]">Unit {att.unit}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-extrabold text-[#4B5D44]">
                      {att.module}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#2D332A]">{att.activityName}</td>
                    <td className="py-3 px-3 font-black text-[#2D332A]">
                      {att.score} / {att.maxScore}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-black ${
                        att.percentage >= 80 ? 'text-[#384732]' : 'text-[#8E5D32]'
                      }`}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-[#FAF7F2] border border-[#E5DDD0] px-2 py-0.5 rounded-md font-bold text-[#5C6B57]">
                        Attempt {att.attemptNumber}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-[#5C6B57]">
                    Chưa có lịch sử làm bài nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
