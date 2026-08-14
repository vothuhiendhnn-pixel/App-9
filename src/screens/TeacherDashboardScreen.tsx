import React, { useState } from 'react';
import { UserProfile } from '../types';
import { store } from '../services/store';
import { TeacherSummaryCard } from '../components/TeacherSummaryCard';
import {
  Users,
  UserCheck,
  LogIn,
  Trophy,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface TeacherDashboardScreenProps {
  user: UserProfile;
  onSelectStudent: (studentId: string) => void;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardScreenProps> = ({
  user,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'loginCount' | 'avgScore' | 'highestScore' | 'progress' | 'xp' | 'lastLogin'>('avgScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const analytics = store.getTeacherAnalytics();

  // Filter students
  let filteredStudents = analytics.students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = selectedClass === 'All' || s.className === selectedClass;

    let matchScore = true;
    if (scoreFilter === 'high') matchScore = s.avgScore >= 80;
    if (scoreFilter === 'medium') matchScore = s.avgScore >= 60 && s.avgScore < 80;
    if (scoreFilter === 'low') matchScore = s.avgScore < 60;

    return matchSearch && matchClass && matchScore;
  });

  // Sort students
  filteredStudents.sort((a, b) => {
    let valA: any = a[sortBy];
    let valB: any = b[sortBy];

    if (sortBy === 'lastLogin') {
      valA = new Date(a.lastLogin).getTime();
      valB = new Date(b.lastLogin).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDownloadReport = (type: 'scores' | 'logins' | 'progress') => {
    const csvContent = store.exportReportCSV(type);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `English9_MissHien_${type}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4 pt-4 sm:px-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-[#FAF2E4] border border-[#F0DEBA] text-[#8E5D32] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Quyền Giáo Viên
            </span>
            <span className="text-xs text-[#5C6B57] font-bold">Khối 9 • Global Success</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2D332A] font-serif mt-1 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6B57] font-medium">
            Theo dõi tiến độ, thời lượng truy cập và điểm số chi tiết của học sinh.
          </p>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-[#4B5D44] hover:bg-[#3D4C37] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo (CSV / Excel)</span>
          </button>

          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5DDD0] p-2 z-40 space-y-1">
                <button
                  onClick={() => handleDownloadReport('scores')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#2D332A] hover:bg-[#FAF7F2]"
                >
                  📊 Báo cáo điểm thi chi tiết
                </button>
                <button
                  onClick={() => handleDownloadReport('logins')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#2D332A] hover:bg-[#FAF7F2]"
                >
                  ⏱️ Báo cáo thời lượng truy cập
                </button>
                <button
                  onClick={() => handleDownloadReport('progress')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#2D332A] hover:bg-[#FAF7F2]"
                >
                  📈 Báo cáo tiến độ cả lớp
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <TeacherSummaryCard
          title="Tổng số học sinh"
          value={analytics.totalStudents}
          subtitle="học sinh"
          icon={Users}
          color="blue"
        />
        <TeacherSummaryCard
          title="Truy cập hôm nay"
          value={analytics.activeTodayCount}
          subtitle="học sinh"
          icon={UserCheck}
          color="green"
        />
        <TeacherSummaryCard
          title="Tổng lượt truy cập"
          value={analytics.totalLogins}
          subtitle="phiên học"
          icon={LogIn}
          color="yellow"
        />
        <TeacherSummaryCard
          title="Điểm trung bình"
          value={`${analytics.avgScore}%`}
          subtitle="toàn khối"
          icon={Trophy}
          color="red"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5DDD0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#5C6B57] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên học sinh hoặc email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5DDD0] text-xs font-medium focus:border-[#4B5D44] focus:outline-hidden"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#5C6B57] whitespace-nowrap">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D332A] focus:outline-hidden"
            >
              <option value="All">Tất cả (Khối 9)</option>
              <option value="9A">Lớp 9A</option>
              <option value="9B">Lớp 9B</option>
              <option value="9C">Lớp 9C</option>
            </select>
          </div>

          {/* Score Level Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#5C6B57] whitespace-nowrap">Điểm:</span>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D332A] focus:outline-hidden"
            >
              <option value="All">Tất cả mức điểm</option>
              <option value="high">Điểm cao (&ge; 80%)</option>
              <option value="medium">Trung bình (60% - 79%)</option>
              <option value="low">Cần lưu ý (&lt; 60%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Management Table */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE3D5] flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#2D332A] font-serif">
            Danh Sách Học Sinh ({filteredStudents.length})
          </h2>
          <span className="text-xs text-[#5C6B57]">Nhấp vào học sinh để xem chi tiết bài làm</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDD0] text-[#5C6B57] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Họ tên</th>
                <th className="py-3.5 px-3">Lớp</th>
                <th
                  onClick={() => handleSort('loginCount')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#2D332A] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Lượt truy cập</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lastLogin')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#2D332A] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Truy cập gần nhất</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Bài đã làm</th>
                <th
                  onClick={() => handleSort('avgScore')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#2D332A] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Điểm TB</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('highestScore')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#2D332A] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Điểm cao nhất</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('xp')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#2D332A] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>XP</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('progress')}
                  className="py-3.5 px-3 cursor-pointer hover:text-[#2D332A] whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Tiến độ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Trạng thái</th>
                <th className="py-3.5 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D5]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s.id)}
                    className="hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-extrabold text-[#2D332A]">
                      {s.name}
                      <span className="block text-[10px] font-normal text-[#5C6B57]">{s.email}</span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#5C6B57]">{s.className}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#2D332A]">{s.loginCount}</td>
                    <td className="py-3.5 px-3 text-[#5C6B57]">
                      {new Date(s.lastLogin).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#2D332A]">{s.quizzesDone} bài</td>
                    <td className="py-3.5 px-3 font-black text-[#4B5D44]">{s.avgScore}%</td>
                    <td className="py-3.5 px-3 font-black text-[#384732]">{s.highestScore}%</td>
                    <td className="py-3.5 px-3 font-bold text-[#8E5D32]">{s.xp}</td>
                    <td className="py-3.5 px-3 font-black text-[#4B5D44]">{s.progress}%</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          s.statusBadge === 'Active'
                            ? 'bg-[#E8EFE6] border-[#C6D8C2] text-[#384732]'
                            : s.statusBadge === 'Needs Attention'
                            ? 'bg-[#FAF2E4] border-[#F0DEBA] text-[#875514]'
                            : 'bg-[#F9EBE9] border-[#ECC7C3] text-[#88372A]'
                        }`}
                      >
                        {s.statusBadge === 'Active' ? 'Hoạt động' : s.statusBadge === 'Needs Attention' ? 'Cần nhắc nhở' : 'Điểm thấp'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-[#8C9886]" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#5C6B57]">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
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
