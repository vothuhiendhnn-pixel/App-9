/**
 * STUDENT SERVICE FOR "ENGLISH 9 - MISS HIEN"
 * Handles student authentication via Full Name + Phone Number (studentId),
 * local session storage and Supabase RPC authentication.
 */

import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { store } from './store';

const STUDENT_STORAGE_KEY = 'english9_student';

export interface LoginFormErrors {
  name?: string;
  phone?: string;
}

class StudentService {
  /**
   * Normalizes raw phone input: removes spaces, dots, hyphens, parentheses
   */
  public normalizePhoneNumber(raw: string): string {
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    // Convert +84 or 84 to 0 if standard VN number
    if (digits.startsWith('84') && digits.length >= 11) {
      digits = '0' + digits.substring(2);
    }
    return digits;
  }

  /**
   * Extracts friendly first name or middle+first name from full Vietnamese name
   * e.g. "Nguyễn Minh Anh" -> "Minh Anh"
   * "Lê Hoàng Lan" -> "Hoàng Lan"
   * "Trần Nam" -> "Nam"
   */
  public getStudentDisplayName(fullName: string): string {
    if (!fullName) return 'Em';
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'Em';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[1];
    // For 3+ words: take the last two words (e.g. "Minh Anh")
    return parts.slice(-2).join(' ');
  }

  /**
   * Validates student login input
   */
  public validateLoginForm(name: string, phone: string): { isValid: boolean; errors: LoginFormErrors } {
    const errors: LoginFormErrors = {};
    const trimmedName = name.trim();
    const normalizedPhone = this.normalizePhoneNumber(phone);

    if (!trimmedName) {
      errors.name = 'Vui lòng nhập họ và tên.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Họ và tên cần có ít nhất 2 ký tự.';
    }

    if (!phone || !phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      errors.phone = 'Số điện thoại chưa hợp lệ (từ 9 - 11 chữ số).';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Retrieves logged in student from localStorage
   */
  public getCurrentStudent(): UserProfile | null {
    try {
      const data = localStorage.getItem(STUDENT_STORAGE_KEY);
      if (data) {
        const student = JSON.parse(data) as UserProfile;
        if (student && student.id && student.name) {
          return student;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Saves student session to localStorage
   */
  public saveCurrentStudent(student: UserProfile): void {
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
    } catch (e) {
      console.warn('Failed to save student session', e);
    }
  }

  /**
   * Main login flow:
   * 1. Validate
   * 2. Normalize phone to studentId
   * 3. Create or load local profile
   * 4. Call Apps Script to create or load server profile
   * 5. Save session
   */
  public async login(
    studentCode: string,
    password: string,
    _className: string = '9A'
  ): Promise<{
    success: boolean;
    student?: UserProfile;
    isNew?: boolean;
    message?: string;
    error?: string;
  }> {
    const code = studentCode.trim();
    const pass = password.trim();

    if (!code || !pass) {
      return {
        success: false,
        error: 'Vui lòng nhập mã học sinh và mật khẩu.',
      };
    }

    try {
      // Abort unresponsive login requests instead of hanging indefinitely.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      let data: any;
      let error: any;
      try {
        const response = await supabase.rpc('student_login', {
          p_student_code: code,
          p_password: pass,
        }, { signal: controller.signal });
        data = response.data;
        error = response.error;
      } finally {
        clearTimeout(timer);
      }

      if (error) {
        console.error('Supabase login error:', error);
        return {
          success: false,
          error: 'Không thể xác thực tài khoản. Kiểm tra kết nối mạng hoặc liên hệ giáo viên.',
        };
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        return {
          success: false,
          error: 'Mã học sinh hoặc mật khẩu không đúng.',
        };
      }

      const nowIso = new Date().toISOString();

      const student: UserProfile = {
        id: result.student_id,
        role: 'student',
        name: result.full_name,
        phone: result.student_code,
        className: result.class_name || '9A',
        xp: 0,
        streak: 1,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        overallProgress: 0,
        vocabularyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        listeningScore: 0,
        vocabularyProgress: 0,
        grammarProgress: 0,
        pronunciationProgress: 0,
        listeningProgress: 0,
        lastActivity: 'Đăng nhập',
        syncStatus: 'synced',
      };

      const localUsers = store.getUsers();
      const existingStudent = localUsers.find(
        user => user.id === student.id
      );

      if (existingStudent) {
        Object.assign(student, existingStudent, {
          id: result.student_id,
          role: 'student',
          name: result.full_name,
          phone: result.student_code,
          className: result.class_name || existingStudent.className,
          lastLoginAt: nowIso,
          syncStatus: 'synced',
        });

        store.updateUser(student);
      } else {
        store.addUser(student);
      }

      store.setCurrentUser(student);
      this.saveCurrentStudent(student);

      return {
        success: true,
        student,
        isNew: false,
        message: `Chào mừng ${student.name} quay trở lại!`,
      };
    } catch (error) {
      console.error('Student login error:', error);

      return {
        success: false,
        error: error instanceof Error && error.name === 'AbortError'
          ? 'Kết nối quá thời gian (12 giây). Vui lòng thử lại hoặc đổi mạng.'
          : 'Đăng nhập thất bại. Vui lòng kiểm tra mạng rồi thử lại.',
      };
    }
  }

  /**
   * Logs out the current student
   */
  public logout(): void {
    try {
      localStorage.removeItem(STUDENT_STORAGE_KEY);
      store.logout();
    } catch (e) {
      console.warn('Logout error', e);
    }
  }

  /**
   * Remote profile refresh intentionally disabled until a secured Supabase
   * endpoint exists. Never overwrite local progress with unverified data.
   */
  public async syncWithServer(studentId: string): Promise<UserProfile | null> {
    const student = this.getCurrentStudent();
    return student?.id === studentId ? student : null;
  }
}

export const studentService = new StudentService();
