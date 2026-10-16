/**
 * English 9 – student authentication.
 * Supabase Auth is required for RLS-protected reads/writes.
 * The existing student_login RPC is retained ONLY as a temporary legacy
 * sign-in fallback. An RPC login is NOT an authenticated Supabase session.
 */
import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { store } from './store';

const STUDENT_STORAGE_KEY = 'english9_student';
const AUTH_DOMAIN = 'student.easyenglish.internal';

type LoginResult = {
  success: boolean;
  student?: UserProfile;
  isNew?: boolean;
  message?: string;
  error?: string;
};

export interface LoginFormErrors {
  name?: string;
  phone?: string;
}

class StudentService {
  public normalizePhoneNumber(raw: string): string {
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('84') && digits.length >= 11) {
      digits = '0' + digits.substring(2);
    }
    return digits;
  }

  public getStudentDisplayName(fullName: string): string {
    if (!fullName) return 'Em';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'Em';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[1];
    return parts.slice(-2).join(' ');
  }

  public validateLoginForm(name: string, phone: string): { isValid: boolean; errors: LoginFormErrors } {
    const errors: LoginFormErrors = {};
    const trimmedName = name.trim();
    const normalizedPhone = this.normalizePhoneNumber(phone);
    if (!trimmedName) errors.name = 'Vui lòng nhập họ và tên.';
    else if (trimmedName.length < 2) errors.name = 'Họ và tên cần có ít nhất 2 ký tự.';
    if (!phone?.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
    else if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      errors.phone = 'Số điện thoại chưa hợp lệ (từ 9 - 11 chữ số).';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  public getCurrentStudent(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
      if (!raw) return null;
      const student = JSON.parse(raw) as UserProfile;
      if (!student?.id || !student?.name) return null;
      // Cached profile is a display convenience, never proof of an Auth session.
      return { ...student, syncStatus: 'pending' };
    } catch {
      return null;
    }
  }

  public saveCurrentStudent(student: UserProfile): void {
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
    } catch (error) {
      console.warn('Could not cache student profile', error);
    }
  }

  private makeProfile(result: {
    student_id: string;
    student_code: string;
    full_name: string;
    class_name?: string | null;
  }, authenticated: boolean): UserProfile {
    const now = new Date().toISOString();
    const old = store.getUsers().find(u => u.id === result.student_id);
    return {
      id: result.student_id,
      role: 'student',
      name: result.full_name,
      phone: result.student_code,
      className: result.class_name || old?.className || '9A1',
      xp: old?.xp ?? 0,
      streak: old?.streak ?? 1,
      createdAt: old?.createdAt || now,
      lastLoginAt: now,
      overallProgress: old?.overallProgress ?? 0,
      vocabularyScore: old?.vocabularyScore ?? 0,
      grammarScore: old?.grammarScore ?? 0,
      pronunciationScore: old?.pronunciationScore ?? 0,
      listeningScore: old?.listeningScore ?? 0,
      vocabularyProgress: old?.vocabularyProgress ?? 0,
      grammarProgress: old?.grammarProgress ?? 0,
      pronunciationProgress: old?.pronunciationProgress ?? 0,
      listeningProgress: old?.listeningProgress ?? 0,
      lastActivity: old?.lastActivity || 'Đăng nhập',
      // Even an Auth session does not imply exercise results were uploaded.
      syncStatus: 'pending',
    };
  }

  private persistProfile(student: UserProfile): void {
    if (store.getUsers().some(user => user.id === student.id)) {
      store.updateUser(student);
    } else {
      store.addUser(student);
    }
    store.setCurrentUser(student);
    this.saveCurrentStudent(student);
  }

  public async login(studentCode: string, password: string, _className = '9A1'): Promise<LoginResult> {
    const code = studentCode.trim().toUpperCase();
    // Do not trim passwords: spaces can be meaningful characters.
    const pass = password;
    if (!code || !pass) return { success: false, error: 'Vui lòng nhập mã học sinh và mật khẩu.' };

    // The existing Auth email naming scheme was verified in Supabase Users.
    // Reject malformed codes before constructing an email address.
    if (!/^HS[A-Z0-9-]+$/.test(code)) {
      return { success: false, error: 'Mã học sinh chưa đúng định dạng.' };
    }

    try {
      const email = `${code.toLowerCase()}@${AUTH_DOMAIN}`;
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });

      if (!authError && authData.user && authData.session) {
        // An Auth user must also match an existing students.user_id.
        const { data: studentRow, error: studentError } = await supabase
          .from('students')
          .select('id, user_id, student_code, full_name, class_id, active')
          .eq('user_id', authData.user.id)
          .eq('student_code', code)
          .maybeSingle();
        if (studentError || !studentRow || studentRow.active === false) {
          await supabase.auth.signOut();
          return { success: false, error: 'Tài khoản chưa được cấp quyền học sinh hoặc đã ngừng hoạt động.' };
        }
        const student = this.makeProfile({
          student_id: studentRow.id,
          student_code: studentRow.student_code,
          full_name: studentRow.full_name,
          class_name: _className,
        }, true);
        this.persistProfile(student);
        return {
          success: true, student, isNew: false,
          message: `Đăng nhập Supabase Auth thành công. Chào mừng ${student.name}!`,
        };
      }

      // Compatibility fallback only. The RPC validates the old password hash,
      // but it DOES NOT establish a Supabase Auth session for RLS operations.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const { data, error } = await supabase.rpc('student_login', {
          p_student_code: code,
          p_password: pass,
        }, { signal: controller.signal });
        if (error) {
          console.warn('Legacy login RPC was unavailable:', error.message);
          return { success: false, error: 'Chưa xác thực được. Kiểm tra mật khẩu Auth hoặc kết nối Supabase.' };
        }
        const result = (Array.isArray(data) ? data[0] : data) as {
          student_id: string; student_code: string; full_name: string; class_name?: string;
        } | null;
        if (!result) return { success: false, error: 'Mã học sinh hoặc mật khẩu không đúng.' };
        const student = this.makeProfile(result, false);
        this.persistProfile(student);
        return {
          success: true, student, isNew: false,
          message: 'Đăng nhập bằng tài khoản cũ. Chưa có phiên Supabase Auth nên chưa thể đồng bộ bài nộp.',
        };
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error('Student sign-in failed:', error);
      return {
        success: false,
        error: error instanceof Error && error.name === 'AbortError'
          ? 'Kết nối quá thời gian (12 giây). Vui lòng thử lại.'
          : 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối.',
      };
    }
  }

  public logout(): void {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    store.logout();
    void supabase.auth.signOut();
  }

  // Until submission reads and verified RLS are implemented, do not pretend
  // localStorage is a server-side copy of progress.
  public async syncWithServer(studentId: string): Promise<UserProfile | null> {
    const student = this.getCurrentStudent();
    return student?.id === studentId ? student : null;
  }
}

export const studentService = new StudentService();
