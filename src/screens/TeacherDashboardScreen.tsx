import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, RefreshCcw, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { UserProfile } from '../types';

interface TeacherDashboardScreenProps {
  user: UserProfile;
  onSelectStudent?: (studentId: string) => void;
  onBack?: () => void;
}

type StudentRow = {
  id: string;
  student_code: string | null;
  full_name: string | null;
  class_id: string | null;
  active: boolean | null;
  created_at?: string | null;
  class_name?: string | null;
};

type SubmissionRow = {
  id?: string;
  student_id: string;
  activity_id: string | null;
  activity_type: string | null;
  unit_number: number | null;
  created_at?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  grading_status?: string | null;
  answers?: Record<string, unknown> | null;
};

type StudentWithSubmissions = StudentRow & {
  classLabel: string;
  submissions: SubmissionRow[];
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('vi-VN') : '—';
};

const submissionDate = (submission: SubmissionRow): string | null =>
  submission.submitted_at ?? submission.created_at ?? submission.completed_at ?? null;

const scoreText = (submission: SubmissionRow) => {
  const correct = submission.answers?.correct;
  const total = submission.answers?.total;
  if (typeof correct === 'number' && typeof total === 'number' && total > 0 && correct >= 0 && correct <= total) {
    return `${correct}/${total} (${Math.round((correct / total) * 100)}%)`;
  }
  return 'Chưa có số liệu';
};

export const TeacherDashboardScreen: React.FC<TeacherDashboardScreenProps> = ({ user, onBack }) => {
  const [students, setStudents] = useState<StudentWithSubmissions[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || !auth.user) throw new Error('Phiên đăng nhập Supabase không hợp lệ. Vui lòng đăng nhập lại.');

        const studentsResponse = await supabase
          .from('students')
          .select('id, student_code, full_name, class_id, active, created_at')
          .order('student_code', { ascending: true });
        if (studentsResponse.error) throw new Error(`Không đọc được danh sách học sinh: ${studentsResponse.error.message}`);

        const submissionsResponse = await supabase
          .from('submissions')
          .select('*')
          .limit(1000);
        if (submissionsResponse.error) throw new Error(`Không đọc được bài nộp: ${submissionsResponse.error.message}`);

        // Read class labels if RLS allows it; never fabricate the class for a student.
        const classLabels = new Map<string, string>();
        const classResponse = await supabase.from('classes').select('*');
        if (!classResponse.error && classResponse.data) {
          for (const item of classResponse.data) {
            const label = item.class_name ?? item.name ?? item.code;
            if (item.id != null && typeof label === 'string') classLabels.set(String(item.id), label);
          }
        }

        const allStudents = (studentsResponse.data ?? []) as StudentRow[];
        const studentIds = new Set(allStudents.map(s => String(s.id)));
        const byStudent = new Map<string, SubmissionRow[]>();
        for (const submission of (submissionsResponse.data ?? []) as SubmissionRow[]) {
          const id = String(submission.student_id);
          // Discard orphan/mismatched records from DISPLAY ONLY, never from the database.
          if (!studentIds.has(id)) continue;
          byStudent.set(id, [...(byStudent.get(id) ?? []), submission]);
        }

        for (const entries of byStudent.values()) {
          entries.sort((a, b) => {
            const at = Date.parse(submissionDate(a) ?? '') || 0;
            const bt = Date.parse(submissionDate(b) ?? '') || 0;
            return bt - at;
          });
        }

        const mapped: StudentWithSubmissions[] = allStudents
          .map(s => ({
            ...s,
            classLabel: s.class_id != null ? (classLabels.get(String(s.class_id)) ?? 'Chưa xác định') : 'Chưa xác định',
            submissions: byStudent.get(String(s.id)) ?? [],
          }));
        if (!cancelled) setStudents(mapped);
      } catch (e) {
        if (!cancelled) {
          setStudents([]); // Fail closed: do not fall back to demo/local storage.
          setError(e instanceof Error ? e.message : 'Không thể đọc dữ liệu Supabase.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi-VN');
    return students.filter(s => `${s.full_name ?? ''} ${s.student_code ?? ''} ${s.classLabel}`.toLocaleLowerCase('vi-VN').includes(term));
  }, [students, search]);

  const submissionCount = students.reduce((sum, s) => sum + s.submissions.length, 0);
  const studentsWithWork = students.filter(s => s.submissions.length > 0).length;
  const selected = students.find(s => String(s.id) === selectedId) ?? null;

  const exportRealCsv = () => {
    const header = ['Mã học sinh', 'Họ tên', 'Lớp', 'Bài làm', 'Loại bài', 'Unit', 'Thời gian nộp', 'Kết quả học sinh tự báo', 'Trạng thái chấm'];
    const rows = students.flatMap(student => student.submissions.map(item => [
      student.student_code ?? '', student.full_name ?? '', student.classLabel,
      item.activity_id ?? '', item.activity_type ?? '', String(item.unit_number ?? ''),
      formatDate(submissionDate(item)), scoreText(item), item.grading_status ?? 'Chưa xác định',
    ]));
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const content = '\uFEFF' + [header, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'English9_ket_qua_Supabase.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 pb-20 space-y-5 text-[#2D332A]">
      <header className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <div className="flex gap-2 items-center text-xs text-[#5A7258] font-bold"><ShieldCheck className="w-4 h-4"/> DỮ LIỆU THẬT • SUPABASE</div>
          <h1 className="text-2xl font-bold mt-1">Dashboard giáo viên</h1>
          <p className="text-xs text-gray-600 mt-1">Giáo viên: {user.name}. Chỉ hiển thị học sinh và bài nộp đọc được từ Supabase.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onBack && <button type="button" onClick={onBack} className="flex gap-1 items-center px-3 py-2 rounded-xl border bg-white text-xs"><ArrowLeft className="w-4 h-4"/> Thoát</button>}
          <button type="button" onClick={() => setReloadKey(k => k + 1)} className="flex gap-1 items-center px-3 py-2 rounded-xl border bg-white text-xs"><RefreshCcw className="w-4 h-4"/> Tải lại</button>
          <button type="button" disabled={loading || !!error} onClick={exportRealCsv} className="flex gap-1 items-center px-3 py-2 rounded-xl bg-[#4B5D44] text-white text-xs disabled:opacity-40"><Download className="w-4 h-4"/> Xuất CSV thật</button>
        </div>
      </header>

      {loading && <p className="p-5 bg-white rounded-xl">Đang tải học sinh và bài nộp từ Supabase…</p>}
      {error && <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error} — Kiểm tra quyền đọc bảng (RLS) trước khi thử lại; hệ thống không hiển thị dữ liệu mẫu thay thế.</div>}

      {!loading && !error && <>
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Học sinh thực', students.length],
            ['Đã nộp bài', studentsWithWork],
            ['Tổng bài nộp', submissionCount],
            ['Chưa có bài nộp', students.length - studentsWithWork],
          ].map(([label, value]) => <div key={String(label)} className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">{label}</div><div className="text-2xl font-bold mt-2">{value}</div></div>)}
        </section>
        <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-3">Điểm hiển thị bên dưới là kết quả do trình duyệt báo cáo (chưa phải điểm giáo viên đã xác minh). Không sử dụng số liệu giả cho tiến độ, XP hoặc lượt truy cập.</p>
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2"><Search className="w-4 h-4 text-gray-500"/><input className="w-full outline-none text-sm" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học sinh, mã số hoặc lớp…" /></div>
        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF7F2] text-xs"><tr><th className="p-3">Mã</th><th className="p-3">Học sinh</th><th className="p-3">Lớp</th><th className="p-3">Bài đã nộp</th><th className="p-3">Nộp gần nhất</th><th className="p-3">Xem bài</th></tr></thead>
            <tbody>
              {filtered.map(student => <tr key={student.id} className="border-t"><td className="p-3">{student.student_code ?? '—'}</td><td className="p-3 font-semibold">{student.full_name ?? 'Chưa có tên'}</td><td className="p-3">{student.classLabel}</td><td className="p-3">{student.submissions.length}</td><td className="p-3">{formatDate(student.submissions[0] ? submissionDate(student.submissions[0]) : null)}</td><td className="p-3"><button type="button" onClick={() => setSelectedId(String(student.id))} className="text-[#315d8e] font-semibold underline">Chi tiết</button></td></tr>)}
              {filtered.length === 0 && <tr><td className="p-6 text-center" colSpan={6}>Không tìm thấy học sinh từ Supabase.</td></tr>}
            </tbody>
          </table>
        </div>
        {selected && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}>
          <section role="dialog" aria-modal="true" aria-label={`Bài nộp của ${selected.full_name ?? 'học sinh'}`} className="bg-white border rounded-2xl shadow-2xl p-5 space-y-3 w-full max-w-4xl max-h-[85vh] overflow-auto">
          <div className="flex justify-between gap-2 items-center"><h2 className="font-bold">Bài nộp: {selected.full_name} ({selected.student_code})</h2><button type="button" onClick={() => setSelectedId(null)} className="text-sm underline">Đóng</button></div>
          {selected.submissions.length === 0 ? <p className="text-sm text-gray-500">Học sinh chưa có bài nộp trong Supabase.</p> : <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr><th className="p-2">Ngày nộp</th><th className="p-2">Bài</th><th className="p-2">Unit</th><th className="p-2">Kết quả tự báo</th><th className="p-2">Xác minh</th></tr></thead><tbody>{selected.submissions.map((item, i) => <tr key={item.id ?? i} className="border-t"><td className="p-2">{formatDate(submissionDate(item))}</td><td className="p-2">{item.activity_id ?? item.activity_type ?? '—'}</td><td className="p-2">{item.unit_number ?? '—'}</td><td className="p-2">{scoreText(item)}</td><td className="p-2">{item.grading_status ?? 'Chưa xác minh'}</td></tr>)}</tbody></table></div>}
          </section>
        </div>}
      </>}
    </main>
  );
};
