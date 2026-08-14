/**
 * STUDENT SERVICE FOR "ENGLISH 9 - MISS HIEN"
 * Handles student authentication via Full Name + Phone Number (studentId),
 * local session storage, profile updates, and Google Sheets synchronization.
 */

import { UserProfile } from '../types';
import { googleSheetsService } from './googleSheetsService';
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
    name: string,
    phone: string,
    className: string = '9A'
  ): Promise<{ success: boolean; student?: UserProfile; isNew?: boolean; message?: string; error?: string }> {
    const trimmedName = name.trim();
    const studentId = this.normalizePhoneNumber(phone);

    const validation = this.validateLoginForm(trimmedName, phone);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.name || validation.errors.phone || 'Thông tin chưa hợp lệ.',
      };
    }

    // 1. Check existing local users in store
    const localUsers = store.getUsers();
    let student = localUsers.find(u => u.id === studentId);

    const nowIso = new Date().toISOString();

    if (!student) {
      // New student record initialization
      student = {
        id: studentId,
        role: 'student',
        name: trimmedName,
        phone: studentId,
        className: className || '9A',
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
        syncStatus: 'syncing',
      };
      store.addUser(student);
    } else {
      // Update name and login time
      student.name = trimmedName;
      student.lastLoginAt = nowIso;
      student.syncStatus = 'syncing';
      store.updateUser(student);
    }

    // Set current active user in store and session storage
    store.setCurrentUser(student);
    this.saveCurrentStudent(student);

    // 2. Call Google Sheets Backend
    try {
      const serverRes = await googleSheetsService.login(studentId, trimmedName, className);
      if (serverRes.success && serverRes.data && serverRes.data.student) {
        const serverStudent = serverRes.data.student;
        // Merge server data with local state if server has historical progress
        student = {
          ...student,
          name: serverStudent.name || student.name,
          className: serverStudent.className || student.className,
          createdAt: serverStudent.createdAt || student.createdAt,
          xp: typeof serverStudent.xp === 'number' ? Math.max(student.xp, serverStudent.xp) : student.xp,
          streak: typeof serverStudent.streak === 'number' ? Math.max(student.streak, serverStudent.streak) : student.streak,
          overallProgress: typeof serverStudent.overallProgress === 'number' ? serverStudent.overallProgress : student.overallProgress,
          vocabularyScore: serverStudent.vocabularyScore ?? student.vocabularyScore,
          grammarScore: serverStudent.grammarScore ?? student.grammarScore,
          pronunciationScore: serverStudent.pronunciationScore ?? student.pronunciationScore,
          listeningScore: serverStudent.listeningScore ?? student.listeningScore,
          vocabularyProgress: serverStudent.vocabularyProgress ?? student.vocabularyProgress,
          grammarProgress: serverStudent.grammarProgress ?? student.grammarProgress,
          pronunciationProgress: serverStudent.pronunciationProgress ?? student.pronunciationProgress,
          listeningProgress: serverStudent.listeningProgress ?? student.listeningProgress,
          syncStatus: 'synced',
        };

        store.updateUser(student);
        this.saveCurrentStudent(student);

        return {
          success: true,
          student,
          isNew: serverRes.data.isNew,
          message: serverRes.data.isNew ? 'Chào mừng em tham gia English 9!' : 'Chào mừng em quay trở lại!',
        };
      }
    } catch {
      // Offline fallback: keep local data
      student.syncStatus = 'pending';
      store.updateUser(student);
      this.saveCurrentStudent(student);
    }

    return {
      success: true,
      student,
      isNew: false,
      message: 'Đăng nhập thành công (chế độ ngoại tuyến).',
    };
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
   * Refreshes student data from Google Sheets
   */
  public async syncWithServer(studentId: string): Promise<UserProfile | null> {
    const student = this.getCurrentStudent();
    if (!student || student.id !== studentId) return null;

    try {
      const res = await googleSheetsService.getStudent(studentId);
      if (res.success && res.data && res.data.student) {
        const s = res.data.student;
        const updated: UserProfile = {
          ...student,
          name: s.name || student.name,
          className: s.className || student.className,
          xp: Math.max(student.xp, s.xp || 0),
          streak: Math.max(student.streak, s.streak || 1),
          overallProgress: s.overallProgress ?? student.overallProgress,
          vocabularyScore: s.vocabularyScore ?? student.vocabularyScore,
          grammarScore: s.grammarScore ?? student.grammarScore,
          pronunciationScore: s.pronunciationScore ?? student.pronunciationScore,
          listeningScore: s.listeningScore ?? student.listeningScore,
          syncStatus: 'synced',
        };
        store.updateUser(updated);
        this.saveCurrentStudent(updated);
        return updated;
      }
    } catch {
      // ignore
    }
    return student;
  }
}

export const studentService = new StudentService();
