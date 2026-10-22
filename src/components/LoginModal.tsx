import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { studentService } from '../services/studentService';
import type { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialTab?: LoginTab;
}

type LoginTab = 'student' | 'teacher';

/**
 * English 9 – Miss Hiền: real authentication only.
 * Student: existing Supabase RPC via studentService.login().
 * Teacher: Supabase Auth plus explicit teacher authorization.
 * Never grant teacher privileges solely because an Auth session exists.
 */
export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'student',
}) => {
  const [tab, setTab] = useState<LoginTab>(initialTab);
  const [studentCode, setStudentCode] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (!studentCode.trim() || !studentPassword) {
      setError('Vui lòng nhập mã học sinh và mật khẩu được cấp.');
      return;
    }

    setLoading(true);
    try {
      const result = await studentService.login(studentCode.trim(), studentPassword);
      if (!result.success || !result.student) {
        setError(result.error || 'Đăng nhập học sinh không thành công.');
        return;
      }
      // The service returns the real student ID, name, and class from Supabase.
      onLoginSuccess(result.student);
      onClose();
    } catch (cause) {
      console.error('Student login failed:', cause);
      setError('Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    const email = teacherEmail.trim().toLowerCase();
    if (!email || !teacherPassword) {
      setError('Vui lòng nhập email và mật khẩu giáo viên.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: teacherPassword,
      });
      if (authError) throw authError;
      const authUser = data.user;
      if (!authUser) throw new Error('Missing Supabase Auth user');

      // Check a server-managed role. A mere successful login is NOT teacher authorization.
      const appRole = authUser.app_metadata?.role;
      let teacherAuthorized = appRole === 'teacher';
      if (!teacherAuthorized) {
        // This query requires the `profiles` table to contain `id` and `role`,
        // and an RLS SELECT policy allowing the authenticated user to read their role.
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();
        if (profileError) {
          console.error('Teacher role lookup failed:', {
            code: profileError.code,
            message: profileError.message,
          });
        }
        teacherAuthorized = !profileError && profile?.role === 'teacher';
      }

      if (!teacherAuthorized) {
        await supabase.auth.signOut();
        setError('Tài khoản đã xác thực nhưng chưa được cấp quyền giáo viên.');
        return;
      }

      const now = new Date().toISOString();
      // UserProfile compatibility with the existing App.tsx. These learner-only
      // fields are neutral for a teacher and are NOT student scores.
      const teacher: UserProfile = {
        id: authUser.id,
        role: 'teacher',
        name: typeof authUser.user_metadata?.full_name === 'string'
          ? authUser.user_metadata.full_name
          : 'Giáo viên',
        phone: '',
        className: '',
        xp: 0,
        streak: 0,
        createdAt: authUser.created_at || now,
        lastLoginAt: now,
        overallProgress: 0,
        vocabularyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        listeningScore: 0,
        vocabularyProgress: 0,
        grammarProgress: 0,
        pronunciationProgress: 0,
        listeningProgress: 0,
        lastActivity: 'Đăng nhập giáo viên',
        syncStatus: 'synced',
      };
      onLoginSuccess(teacher);
      onClose();
    } catch (cause: unknown) {
      const detail = cause as { message?: string; code?: string; status?: number };
      console.error('Teacher Supabase Auth error:', {
        message: detail?.message,
        code: detail?.code,
        status: detail?.status,
      });
      if (detail?.message === 'Invalid login credentials') {
        setError('Email hoặc mật khẩu chưa khớp với Supabase Auth.');
      } else if (detail?.message === 'Email not confirmed') {
        setError('Email giáo viên chưa được xác nhận trong Supabase Auth.');
      } else {
        setError('Đăng nhập chưa thành công. Hãy xem mã lỗi trong Console để kiểm tra.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7258]';
  const labelClass = 'block text-xs font-bold text-[#2D332A] uppercase tracking-wider mb-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng cửa sổ đăng nhập"
          className="absolute right-4 top-3 text-gray-500 hover:text-gray-800 disabled:opacity-50 text-2xl"
        >
          ×
        </button>
        <div className="p-7">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#5A7258] rounded-2xl flex items-center justify-center text-white font-serif text-2xl">E9</div>
          <h2 className="text-2xl font-bold text-center text-[#2D332A] mb-6 font-serif">English 9 - Miss Hiền</h2>
          <div className="mb-6 text-center">
            <span className={`inline-flex rounded-full px-5 py-2 font-bold text-sm ${tab === 'student' ? 'bg-[#E8F1E7] text-[#456743]' : 'bg-[#F7EEE5] text-[#8B5A2B]'}`}>
              {tab === 'student' ? 'Đăng nhập học sinh' : 'Đăng nhập giáo viên'}
            </span>
          </div>

          {error && <div role="alert" className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}

          {tab === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-5">
              <div>
                <label htmlFor="student-code" className={labelClass}>Mã học sinh</label>
                <input
                  id="student-code"
                  name="english9-student-identifier"
                  type="text"
                  className={inputClass}
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  autoComplete="off"
                  placeholder="Ví dụ: HS9A1-10"
                  spellCheck={false}
                  required
                />
              </div>
              <div>
                <label htmlFor="student-password" className={labelClass}>Mật khẩu</label>
                <input id="student-password" type="password" className={inputClass} value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <p className="text-xs text-[#5A7258]">Họ tên và lớp được lấy từ Supabase sau khi đăng nhập.</p>
              <button disabled={loading} type="submit" className="w-full py-4 rounded-xl bg-[#5A7258] text-white font-bold disabled:opacity-50">
                {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỌC SINH'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTeacherLogin} className="space-y-5">
              <div>
                <label htmlFor="teacher-email" className={labelClass}>Email giáo viên</label>
                <input id="teacher-email" type="email" className={inputClass} value={teacherEmail}
                  onChange={e => setTeacherEmail(e.target.value)} autoComplete="username" required />
              </div>
              <div>
                <label htmlFor="teacher-password" className={labelClass}>Mật khẩu</label>
                <input id="teacher-password" type="password" className={inputClass} value={teacherPassword}
                  onChange={e => setTeacherPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 rounded-xl bg-[#8B5A2B] text-white font-bold disabled:opacity-50">
                {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP GIÁO VIÊN'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
