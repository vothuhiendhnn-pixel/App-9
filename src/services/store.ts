import {
  UserProfile,
  VocabularyItem,
  QuizAttempt,
  MistakeItem,
  LoginSession,
  LearningEvent,
  StudentProgress,
  VocabularyStatus,
  ListeningAssessmentResult,
  VocabPracticeType,
  WordMasteryItem,
  VocabularyUnitPracticeProgress,
  VocabPracticeResult,
} from '../types';
import { ALL_VOCABULARY_9, getVocabularyByUnit } from '../data/vocabularyData';

// Initial Demo Users
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'teacher-1',
    role: 'teacher',
    name: 'Miss Hiền (Cô Hiền)',
    email: 'hien.english9@school.edu.vn',
    className: 'Khối 9 (9A, 9B, 9C)',
    xp: 2500,
    streak: 30,
    createdAt: '2026-08-01T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'student-1',
    role: 'student',
    name: 'Minh Anh',
    email: 'minhanh.9a@student.edu.vn',
    className: '9A',
    xp: 640,
    streak: 6,
    createdAt: '2026-08-05T09:00:00.000Z',
    lastLoginAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'student-2',
    role: 'student',
    name: 'Lan Anh',
    email: 'lananh.9a@student.edu.vn',
    className: '9A',
    xp: 590,
    streak: 4,
    createdAt: '2026-08-06T10:00:00.000Z',
    lastLoginAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 'student-3',
    role: 'student',
    name: 'Hoàng Nam',
    email: 'hoangnam.9a@student.edu.vn',
    className: '9A',
    xp: 310,
    streak: 2,
    createdAt: '2026-08-08T14:00:00.000Z',
    lastLoginAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
];

// Initial Demo Progress for Minh Anh, Lan Anh, Hoàng Nam
const INITIAL_PROGRESS: StudentProgress[] = [
  {
    studentId: 'student-1',
    unit: 1,
    vocabularyProgress: 92,
    grammarProgress: 85,
    pronunciationProgress: 78,
    practiceProgress: 89,
    unitProgress: 86,
    averageScore: 86,
    lastActivity: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    studentId: 'student-2',
    unit: 1,
    vocabularyProgress: 80,
    grammarProgress: 75,
    pronunciationProgress: 70,
    practiceProgress: 65,
    unitProgress: 72,
    averageScore: 82,
    lastActivity: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    studentId: 'student-3',
    unit: 1,
    vocabularyProgress: 50,
    grammarProgress: 40,
    pronunciationProgress: 35,
    practiceProgress: 40,
    unitProgress: 41,
    averageScore: 65,
    lastActivity: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
];

// Initial Quiz Attempts History
const INITIAL_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-1',
    studentId: 'student-1',
    unit: 1,
    module: 'vocabulary',
    activityId: 'u1-vocab-quiz',
    activityName: 'Vocabulary Quiz',
    score: 9,
    maxScore: 10,
    percentage: 90,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    xpEarned: 20,
  },
  {
    id: 'att-2',
    studentId: 'student-1',
    unit: 1,
    module: 'grammar',
    activityId: 'u1-grammar-practice',
    activityName: 'Grammar Practice',
    score: 8,
    maxScore: 10,
    percentage: 80,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 86400 * 1000 * 1.5).toISOString(),
    xpEarned: 20,
  },
  {
    id: 'att-3',
    studentId: 'student-1',
    unit: 1,
    module: 'practice',
    activityId: 'u1-listening',
    activityName: 'Listening Gap-fill',
    score: 17,
    maxScore: 20,
    percentage: 85,
    attemptNumber: 2,
    submittedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    xpEarned: 20,
  },
  {
    id: 'att-4',
    studentId: 'student-1',
    unit: 1,
    module: 'challenge',
    activityId: 'u1-challenge',
    activityName: 'Unit 1 Challenge',
    score: 89,
    maxScore: 100,
    percentage: 89,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    xpEarned: 30,
  },
  // Lan Anh
  {
    id: 'att-5',
    studentId: 'student-2',
    unit: 1,
    module: 'vocabulary',
    activityId: 'u1-vocab-quiz',
    activityName: 'Vocabulary Quiz',
    score: 8,
    maxScore: 10,
    percentage: 80,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    xpEarned: 20,
  },
  {
    id: 'att-6',
    studentId: 'student-2',
    unit: 1,
    module: 'challenge',
    activityId: 'u1-challenge',
    activityName: 'Unit 1 Challenge',
    score: 82,
    maxScore: 100,
    percentage: 82,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    xpEarned: 30,
  },
  // Hoang Nam
  {
    id: 'att-7',
    studentId: 'student-3',
    unit: 1,
    module: 'vocabulary',
    activityId: 'u1-vocab-quiz',
    activityName: 'Vocabulary Quiz',
    score: 6,
    maxScore: 10,
    percentage: 60,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
    xpEarned: 10,
  },
  {
    id: 'att-8',
    studentId: 'student-3',
    unit: 1,
    module: 'challenge',
    activityId: 'u1-challenge',
    activityName: 'Unit 1 Challenge',
    score: 65,
    maxScore: 100,
    percentage: 65,
    attemptNumber: 1,
    submittedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    xpEarned: 10,
  },
];

// Initial Mistakes
const INITIAL_MISTAKES: MistakeItem[] = [
  {
    id: 'm-1',
    studentId: 'student-1',
    unit: 1,
    module: 'grammar',
    questionId: 'u1-g-ex6',
    question: 'This traditional pottery craft was _____ to local artisans through generations.',
    studentAnswer: 'run out of',
    correctAnswer: 'handed down',
    explanationVi: '"Hand down" nghĩa là truyền lại cho thế hệ sau.',
    attemptCount: 1,
    lastAttempt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    resolved: false,
  },
  {
    id: 'm-2',
    studentId: 'student-1',
    unit: 1,
    module: 'vocabulary',
    questionId: 'u1-v8',
    question: 'What is the Vietnamese meaning of "tourist attraction"?',
    studentAnswer: 'tiện ích công cộng',
    correctAnswer: 'địa điểm thu hút khách du lịch',
    explanationVi: '"tourist attraction" là điểm tham quan, danh lam thắng cảnh.',
    attemptCount: 1,
    lastAttempt: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
    resolved: false,
  },
  {
    id: 'm-3',
    studentId: 'student-3',
    unit: 1,
    module: 'pronunciation',
    questionId: 'u1-p-q2',
    question: "Listen to 'park' and identify the sound:",
    studentAnswer: '/æ/',
    correctAnswer: '/ɑː/',
    explanationVi: "'park' phát âm là /pɑːk/ với nguyên âm dài /ɑː/.",
    attemptCount: 2,
    lastAttempt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    resolved: false,
  },
];

// Initial Login Sessions
const INITIAL_SESSIONS: LoginSession[] = [
  {
    id: 'sess-1',
    studentId: 'student-1',
    studentName: 'Minh Anh',
    className: '9A',
    loginTime: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(),
    logoutTime: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    sessionDurationSeconds: 1800,
    deviceType: 'Chrome on Windows',
    lastHeartbeat: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'sess-2',
    studentId: 'student-2',
    studentName: 'Lan Anh',
    className: '9A',
    loginTime: new Date(Date.now() - 3600 * 1000 * 5.8).toISOString(),
    logoutTime: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    sessionDurationSeconds: 2880,
    deviceType: 'Safari on iPad',
    lastHeartbeat: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 'sess-3',
    studentId: 'student-3',
    studentName: 'Hoàng Nam',
    className: '9A',
    loginTime: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    logoutTime: new Date(Date.now() - 86400 * 1000 * 1.9).toISOString(),
    sessionDurationSeconds: 1500,
    deviceType: 'Chrome on Android',
    lastHeartbeat: new Date(Date.now() - 86400 * 1000 * 1.9).toISOString(),
  },
];

class AppStore {
  private currentUser: UserProfile | null = null;
  private currentSessionId: string | null = null;
  private heartbeatTimer: any = null;

  constructor() {
    this.initData();
  }

  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(`eng9_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`eng9_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  private initData() {
    if (!localStorage.getItem('eng9_users')) {
      this.setStorage('users', INITIAL_USERS);
    }
    if (!localStorage.getItem('eng9_progress')) {
      this.setStorage('progress', INITIAL_PROGRESS);
    }
    if (!localStorage.getItem('eng9_attempts')) {
      this.setStorage('attempts', INITIAL_ATTEMPTS);
    }
    if (!localStorage.getItem('eng9_mistakes')) {
      this.setStorage('mistakes', INITIAL_MISTAKES);
    }
    if (!localStorage.getItem('eng9_sessions')) {
      this.setStorage('sessions', INITIAL_SESSIONS);
    }
    if (!localStorage.getItem('eng9_events')) {
      this.setStorage('events', [] as LearningEvent[]);
    }
    if (!localStorage.getItem('eng9_vocab_progress')) {
      const initialVocabMap: Record<string, Record<string, VocabularyStatus>> = {
        'student-1': {
          'u1-v1': 'mastered',
          'u1-v2': 'mastered',
          'u1-v3': 'good',
          'u1-v4': 'good',
          'u1-v5': 'good',
          'u1-v6': 'good',
          'u1-v7': 'learning',
          'u1-v8': 'learning',
          'u1-v9': 'mastered',
          'u1-v10': 'mastered',
          'u1-v11': 'good',
          'u1-v12': 'good',
        },
      };
      this.setStorage('vocab_progress', initialVocabMap);
    }

    // Restore active session: prioritize english9_student
    try {
      const savedStudent = localStorage.getItem('english9_student');
      if (savedStudent) {
        const studentObj = JSON.parse(savedStudent) as UserProfile;
        if (studentObj && studentObj.id) {
          const users = this.getUsers();
          const existing = users.find(u => u.id === studentObj.id);
          if (!existing) {
            users.push(studentObj);
            this.setStorage('users', users);
          }
          this.currentUser = studentObj;
          this.startHeartbeat();
          return;
        }
      }
    } catch {
      // ignore
    }

    const savedUser = this.getStorage<UserProfile | null>('current_user', null);
    if (savedUser) {
      this.currentUser = savedUser;
      this.startHeartbeat();
    } else {
      const users = this.getUsers();
      const defaultStudent = users.find(u => u.id === 'student-1') || users[1];
      if (defaultStudent) {
        this.login(defaultStudent.id);
      }
    }
  }

  // User Management
  public getUsers(): UserProfile[] {
    return this.getStorage<UserProfile[]>('users', INITIAL_USERS);
  }

  public addUser(user: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.setStorage('users', users);
  }

  public getCurrentUser(): UserProfile {
    if (this.currentUser) return this.currentUser;
    const users = this.getUsers();
    return users[1] || users[0] || INITIAL_USERS[1];
  }

  public setCurrentUser(user: UserProfile): void {
    this.login(user.id);
  }

  public login(userId: string): UserProfile | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    user.lastLoginAt = new Date().toISOString();
    this.updateUser(user);

    this.currentUser = user;
    this.setStorage('current_user', user);

    // Create session
    const newSession: LoginSession = {
      id: `sess-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      className: user.className,
      loginTime: new Date().toISOString(),
      logoutTime: null,
      sessionDurationSeconds: 0,
      deviceType: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 40) : 'Browser',
      lastHeartbeat: new Date().toISOString(),
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession);
    this.setStorage('sessions', sessions);
    this.currentSessionId = newSession.id;

    this.logEvent(user.id, 'login');
    this.startHeartbeat();

    return user;
  }

  public loginWithCredentials(name: string, role: 'student' | 'teacher', className: string = '9A'): UserProfile {
    const users = this.getUsers();
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.role === role);

    if (!user) {
      user = {
        id: `${role}-${Date.now()}`,
        role,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@${role === 'teacher' ? 'school' : 'student'}.edu.vn`,
        className: role === 'teacher' ? 'Khối 9' : className,
        xp: 0,
        streak: 1,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
      this.setStorage('users', users);
    }

    return this.login(user.id)!;
  }

  public logout(): void {
    if (this.currentSessionId) {
      const sessions = this.getSessions();
      const session = sessions.find(s => s.id === this.currentSessionId);
      if (session) {
        session.logoutTime = new Date().toISOString();
        const duration = Math.floor((new Date(session.logoutTime).getTime() - new Date(session.loginTime).getTime()) / 1000);
        session.sessionDurationSeconds = Math.max(duration, session.sessionDurationSeconds);
        this.setStorage('sessions', sessions);
      }
    }

    if (this.currentUser) {
      this.logEvent(this.currentUser.id, 'logout');
    }

    this.stopHeartbeat();
    this.currentUser = null;
    this.currentSessionId = null;
    this.setStorage('current_user', null);
  }

  public updateUser(updatedUser: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index >= 0) {
      users[index] = updatedUser;
      this.setStorage('users', users);
      if (this.currentUser && this.currentUser.id === updatedUser.id) {
        this.currentUser = updatedUser;
        this.setStorage('current_user', updatedUser);
      }
    }
  }

  public addXP(userId: string, amount: number): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.xp += amount;
      this.updateUser(user);
    }
  }

  // Heartbeat tracking for realistic study session duration
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.currentSessionId) {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.id === this.currentSessionId);
        if (session) {
          session.lastHeartbeat = new Date().toISOString();
          session.sessionDurationSeconds += 30;
          this.setStorage('sessions', sessions);
        }
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Learning Events
  public logEvent(studentId: string, eventType: LearningEvent['eventType'], unit?: number, module?: string, activityId?: string): void {
    const events = this.getEvents();
    events.unshift({
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      eventType,
      unit,
      module,
      activityId,
      createdAt: new Date().toISOString(),
    });
    // Keep max 500 events
    if (events.length > 500) events.length = 500;
    this.setStorage('events', events);
  }

  public getEvents(): LearningEvent[] {
    return this.getStorage<LearningEvent[]>('events', []);
  }

  public getSessions(): LoginSession[] {
    return this.getStorage<LoginSession[]>('sessions', INITIAL_SESSIONS);
  }

  // Progress Tracking
  public getStudentProgress(studentId: string, unit: number = 1): StudentProgress {
    const allProgress = this.getStorage<StudentProgress[]>('progress', INITIAL_PROGRESS);
    const existing = allProgress.find(p => p.studentId === studentId && p.unit === unit);
    if (existing) return existing;

    const newProg: StudentProgress = {
      studentId,
      unit,
      vocabularyProgress: 0,
      grammarProgress: 0,
      pronunciationProgress: 0,
      practiceProgress: 0,
      unitProgress: 0,
      averageScore: 0,
      lastActivity: new Date().toISOString(),
    };
    allProgress.push(newProg);
    this.setStorage('progress', allProgress);
    return newProg;
  }

  public updateModuleProgress(
    studentId: string,
    unit: number,
    module: 'vocabulary' | 'grammar' | 'pronunciation' | 'practice',
    progressPercentage: number
  ): StudentProgress {
    const allProgress = this.getStorage<StudentProgress[]>('progress', INITIAL_PROGRESS);
    let prog = allProgress.find(p => p.studentId === studentId && p.unit === unit);

    if (!prog) {
      prog = {
        studentId,
        unit,
        vocabularyProgress: 0,
        grammarProgress: 0,
        pronunciationProgress: 0,
        practiceProgress: 0,
        unitProgress: 0,
        averageScore: 0,
        lastActivity: new Date().toISOString(),
      };
      allProgress.push(prog);
    }

    if (module === 'vocabulary') prog.vocabularyProgress = Math.max(prog.vocabularyProgress, progressPercentage);
    if (module === 'grammar') prog.grammarProgress = Math.max(prog.grammarProgress, progressPercentage);
    if (module === 'pronunciation') prog.pronunciationProgress = Math.max(prog.pronunciationProgress, progressPercentage);
    if (module === 'practice') prog.practiceProgress = Math.max(prog.practiceProgress, progressPercentage);

    // Calculate weighted unit progress: Vocab 25%, Grammar 25%, Pronunciation 20%, Practice 30%
    prog.unitProgress = Math.round(
      prog.vocabularyProgress * 0.25 +
      prog.grammarProgress * 0.25 +
      prog.pronunciationProgress * 0.20 +
      prog.practiceProgress * 0.30
    );

    prog.lastActivity = new Date().toISOString();
    this.setStorage('progress', allProgress);
    return prog;
  }

  // Quiz Attempts
  public recordQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'attemptNumber' | 'submittedAt'>): QuizAttempt {
    const attempts = this.getStorage<QuizAttempt[]>('attempts', INITIAL_ATTEMPTS);
    
    // Count previous attempts for this student on this activity
    const prevAttempts = attempts.filter(
      a => a.studentId === attempt.studentId && a.unit === attempt.unit && a.activityId === attempt.activityId
    );
    const attemptNumber = prevAttempts.length + 1;

    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      attemptNumber,
      submittedAt: new Date().toISOString(),
    };

    attempts.unshift(newAttempt);
    this.setStorage('attempts', attempts);

    // Award XP
    this.addXP(attempt.studentId, attempt.xpEarned);

    // Update Average Score in Progress
    const studentAttempts = attempts.filter(a => a.studentId === attempt.studentId && a.unit === attempt.unit);
    const avgScore = Math.round(studentAttempts.reduce((acc, a) => acc + a.percentage, 0) / studentAttempts.length);

    const progress = this.getStudentProgress(attempt.studentId, attempt.unit);
    progress.averageScore = avgScore;
    progress.lastActivity = new Date().toISOString();

    const allProgress = this.getStorage<StudentProgress[]>('progress', INITIAL_PROGRESS);
    const idx = allProgress.findIndex(p => p.studentId === attempt.studentId && p.unit === attempt.unit);
    if (idx >= 0) allProgress[idx] = progress;
    this.setStorage('progress', allProgress);

    this.logEvent(attempt.studentId, 'submit_quiz', attempt.unit, attempt.module, attempt.activityId);

    return newAttempt;
  }

  public getQuizAttempts(studentId?: string, unit?: number): QuizAttempt[] {
    const attempts = this.getStorage<QuizAttempt[]>('attempts', INITIAL_ATTEMPTS);
    return attempts.filter(a => {
      if (studentId && a.studentId !== studentId) return false;
      if (unit && a.unit !== unit) return false;
      return true;
    });
  }

  // Mistakes Tracking & Generation
  public recordMistake(mistake: Omit<MistakeItem, 'id' | 'attemptCount' | 'lastAttempt'>): void {
    const mistakes = this.getStorage<MistakeItem[]>('mistakes', INITIAL_MISTAKES);
    const existing = mistakes.find(
      m => m.studentId === mistake.studentId && m.questionId === mistake.questionId && !m.resolved
    );

    if (existing) {
      existing.studentAnswer = mistake.studentAnswer;
      existing.attemptCount += 1;
      existing.lastAttempt = new Date().toISOString();
    } else {
      mistakes.unshift({
        ...mistake,
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        attemptCount: 1,
        lastAttempt: new Date().toISOString(),
        resolved: false,
      });
    }

    this.setStorage('mistakes', mistakes);
  }

  public resolveMistake(studentId: string, questionId: string): void {
    const mistakes = this.getStorage<MistakeItem[]>('mistakes', INITIAL_MISTAKES);
    const item = mistakes.find(m => m.studentId === studentId && m.questionId === questionId);
    if (item) {
      item.resolved = true;
      this.setStorage('mistakes', mistakes);
    }
  }

  public getMistakes(studentId: string, unit?: number): MistakeItem[] {
    const mistakes = this.getStorage<MistakeItem[]>('mistakes', INITIAL_MISTAKES);
    return mistakes.filter(m => m.studentId === studentId && !m.resolved && (unit ? m.unit === unit : true));
  }

  // Spaced Repetition for Vocabulary
  public updateVocabStatus(studentId: string, wordId: string, status: VocabularyStatus): void {
    const allVocabMap = this.getStorage<Record<string, Record<string, VocabularyStatus>>>('vocab_progress', {});
    if (!allVocabMap[studentId]) {
      allVocabMap[studentId] = {};
    }
    allVocabMap[studentId][wordId] = status;
    this.setStorage('vocab_progress', allVocabMap);
  }

  public getVocabListWithStatus(studentId: string, unit: number = 1): VocabularyItem[] {
    const allVocabMap = this.getStorage<Record<string, Record<string, VocabularyStatus>>>('vocab_progress', {});
    const studentVocab = allVocabMap[studentId] || {};

    const rawList = unit > 0 ? getVocabularyByUnit(unit) : ALL_VOCABULARY_9;
    return rawList.map(item => ({
      ...item,
      status: studentVocab[item.id] || 'new',
    }));
  }

  public getAllVocabWithStatus(studentId: string): VocabularyItem[] {
    return this.getVocabListWithStatus(studentId, 0);
  }

  // Teacher Analytics Helpers
  public getTeacherAnalytics() {
    const users = this.getUsers().filter(u => u.role === 'student');
    const attempts = this.getQuizAttempts();
    const sessions = this.getSessions();
    const progressList = this.getStorage<StudentProgress[]>('progress', INITIAL_PROGRESS);

    const totalStudents = users.length;
    
    // Active today (login today or session today)
    const todayStr = new Date().toDateString();
    const activeTodayCount = users.filter(u => {
      return new Date(u.lastLoginAt).toDateString() === todayStr;
    }).length;

    const totalLogins = sessions.length;

    const avgScore = attempts.length > 0
      ? (attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length).toFixed(1)
      : '0.0';

    return {
      totalStudents,
      activeTodayCount,
      totalLogins,
      avgScore,
      students: users.map(student => {
        const studentAttempts = attempts.filter(a => a.studentId === student.id);
        const studentProg = progressList.find(p => p.studentId === student.id && p.unit === 1) || {
          unitProgress: 0,
          averageScore: 0,
        };

        const highestScore = studentAttempts.length > 0
          ? Math.max(...studentAttempts.map(a => a.percentage))
          : 0;

        const avgStudentScore = studentAttempts.length > 0
          ? Math.round(studentAttempts.reduce((acc, a) => acc + a.percentage, 0) / studentAttempts.length)
          : studentProg.averageScore;

        const studentSessions = sessions.filter(s => s.studentId === student.id);
        const totalDurationMins = Math.round(
          studentSessions.reduce((acc, s) => acc + (s.sessionDurationSeconds || 0), 0) / 60
        );

        // Status calculation
        const daysSinceLastLogin = Math.floor(
          (Date.now() - new Date(student.lastLoginAt).getTime()) / (1000 * 3600 * 24)
        );

        let statusBadge: 'Active' | 'Needs Attention' | 'Low Score' = 'Active';
        if (daysSinceLastLogin > 7) {
          statusBadge = 'Needs Attention';
        } else if (avgStudentScore < 60 && studentAttempts.length > 0) {
          statusBadge = 'Low Score';
        }

        return {
          id: student.id,
          name: student.name,
          className: student.className,
          email: student.email,
          loginCount: studentSessions.length,
          lastLogin: student.lastLoginAt,
          quizzesDone: studentAttempts.length,
          avgScore: avgStudentScore,
          highestScore,
          xp: student.xp,
          progress: studentProg.unitProgress,
          totalDurationMins,
          statusBadge,
        };
      }),
    };
  }

  // Pronunciation Practice Persistence
  public savePronunciationResult(result: any): void {
    const results = this.getStorage<any[]>('pronunciation_results', []);
    const key = result.subItemKey ? `${result.itemId}_${result.subItemKey}` : result.itemId;
    
    // Check existing
    const existingIndex = results.findIndex(
      r => r.studentId === result.studentId && (r.subItemKey ? `${r.itemId}_${r.subItemKey}` : r.itemId) === key
    );

    if (existingIndex >= 0) {
      const prev = results[existingIndex];
      const attempt = (prev.attempt || 1) + 1;
      const bestScore = Math.max(prev.bestScore || 0, result.overallScore);
      results[existingIndex] = {
        ...result,
        attempt,
        bestScore,
        latestScore: result.overallScore,
      };
    } else {
      results.unshift({
        ...result,
        attempt: 1,
        bestScore: result.overallScore,
        latestScore: result.overallScore,
      });
    }

    this.setStorage('pronunciation_results', results);

    // If passed (>= 80), award XP and log
    if (result.passed) {
      this.addXP(result.studentId, 15);
    }
  }

  public getPronunciationResults(studentId: string, unit?: number): any[] {
    const results = this.getStorage<any[]>('pronunciation_results', []);
    return results.filter(r => r.studentId === studentId && (unit ? (r.itemId.startsWith(`U${unit}`) || r.unit === unit) : true));
  }

  public getPronunciationItemState(studentId: string, itemId: string, subItemKey?: string): any | null {
    const results = this.getStorage<any[]>('pronunciation_results', []);
    const key = subItemKey ? `${itemId}_${subItemKey}` : itemId;
    return results.find(
      r => r.studentId === studentId && (r.subItemKey ? `${r.itemId}_${r.subItemKey}` : r.itemId) === key
    ) || null;
  }

  public getPronunciationSummary(studentId: string) {
    const results = this.getPronunciationResults(studentId);
    const unitMap: Record<string, { completed: boolean; averageScore: number; completedItems: number }> = {};
    
    for (let u = 1; u <= 12; u++) {
      const unitKey = `unit${u}`;
      const unitResults = results.filter(r => r.itemId.startsWith(`U${u}`) || r.unit === u);
      const passedCount = unitResults.filter(r => r.passed || r.overallScore >= 80).length;
      const avg = unitResults.length > 0
        ? Math.round(unitResults.reduce((acc, r) => acc + (r.overallScore || 0), 0) / unitResults.length)
        : 0;

      unitMap[unitKey] = {
        completed: passedCount >= 2, // at least items passed
        averageScore: avg,
        completedItems: passedCount,
      };
    }

    const completedUnits = Object.values(unitMap).filter(u => u.completed).length;
    const completedItems = results.filter(r => r.passed || r.overallScore >= 80).length;
    const totalAttempts = results.reduce((acc, r) => acc + (r.attempt || 1), 0);
    const averageScore = results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.overallScore || 0), 0) / results.length)
      : 0;
    const highestScore = results.length > 0
      ? Math.max(...results.map(r => r.bestScore || r.overallScore || 0))
      : 0;

    return {
      studentId,
      pronunciation: {
        totalUnits: 12,
        completedUnits,
        completedItems,
        totalAttempts,
        averageScore,
        highestScore,
        units: unitMap,
      },
    };
  }

  // --- LISTENING PRACTICE PERSISTENCE ---
  public saveListeningResult(result: ListeningAssessmentResult): void {
    const results = this.getStorage<ListeningAssessmentResult[]>('listening_results', []);
    
    // Check existing by studentId and lessonId
    const existingIndex = results.findIndex(
      r => r.studentId === result.studentId && r.lessonId === result.lessonId
    );

    if (existingIndex >= 0) {
      const prev = results[existingIndex];
      const attempt = (prev.attempt || 1) + 1;
      const bestScore = Math.max(prev.bestScore || 0, result.score);
      results[existingIndex] = {
        ...result,
        attempt,
        bestScore,
        latestScore: result.score,
      };
    } else {
      results.unshift({
        ...result,
        attempt: 1,
        bestScore: result.score,
        latestScore: result.score,
      });
    }

    this.setStorage('listening_results', results);

    // Save as quiz attempt for teacher reporting
    this.recordQuizAttempt({
      studentId: result.studentId,
      unit: result.unit,
      module: 'practice',
      activityId: result.lessonId,
      activityName: `Listening: ${result.lessonId}`,
      score: result.score,
      maxScore: result.maxScore,
      percentage: Math.round((result.score / result.maxScore) * 100),
      xpEarned: result.passed ? 20 : 5,
    });

    // Award XP
    if (result.passed) {
      this.addXP(result.studentId, 20);
    }
  }

  public getListeningResults(studentId: string, unit?: number): ListeningAssessmentResult[] {
    const results = this.getStorage<ListeningAssessmentResult[]>('listening_results', []);
    return results.filter(
      r => r.studentId === studentId && (unit ? r.unit === unit : true)
    );
  }

  public getListeningLessonState(studentId: string, lessonId: string): ListeningAssessmentResult | null {
    const results = this.getStorage<ListeningAssessmentResult[]>('listening_results', []);
    return results.find(
      r => r.studentId === studentId && r.lessonId === lessonId
    ) || null;
  }

  public getListeningSummary(studentId: string) {
    const results = this.getListeningResults(studentId);
    const unitMap: Record<string, { completed: boolean; lesson1Score: number; lesson2Score: number; averageScore: number }> = {};
    
    for (let u = 1; u <= 12; u++) {
      const unitKey = `unit${u}`;
      const l1 = results.find(r => r.lessonId === `U${u}L01`);
      const l2 = results.find(r => r.lessonId === `U${u}L02`);
      
      const l1Score = l1 ? (l1.bestScore ?? l1.score) : 0;
      const l2Score = l2 ? (l2.bestScore ?? l2.score) : 0;
      const l1Passed = (l1 && (l1.passed || l1Score >= 80));
      const l2Passed = (l2 && (l2.passed || l2Score >= 80));

      const scores = [l1Score, l2Score].filter(s => s > 0);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      unitMap[unitKey] = {
        completed: Boolean(l1Passed && l2Passed),
        lesson1Score: l1Score,
        lesson2Score: l2Score,
        averageScore: avg,
      };
    }

    const completedUnits = Object.values(unitMap).filter(u => u.completed).length;
    const completedLessons = results.filter(r => r.passed || r.score >= 80).length;
    const totalAttempts = results.reduce((acc, r) => acc + (r.attempt || 1), 0);
    const averageScore = results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length)
      : 0;
    const highestScore = results.length > 0
      ? Math.max(...results.map(r => r.bestScore || r.score || 0))
      : 0;

    return {
      studentId,
      listening: {
        totalUnits: 12,
        completedUnits,
        completedLessons,
        totalAttempts,
        averageScore,
        highestScore,
        units: unitMap,
      },
    };
  }

  // Vocabulary Practice Module & Word Mastery
  public getVocabularyUnitPracticeProgress(studentId: string, unit: number): VocabularyUnitPracticeProgress {
    const allUnitProgress = this.getStorage<Record<string, VocabularyUnitPracticeProgress>>('vocab_unit_progress', {});
    const key = `${studentId}_unit_${unit}`;

    if (allUnitProgress[key]) {
      return allUnitProgress[key];
    }

    // Default starting state
    const defaultProgress: VocabularyUnitPracticeProgress = {
      unit,
      studentId,
      matchScore: 0,
      chooseMeaningScore: 0,
      listenChooseScore: 0,
      typeWordScore: 0,
      completeSentenceScore: 0,
      challengeScore: 0,
      bestScores: {
        match: 0,
        choose_meaning: 0,
        listen_and_choose: 0,
        type_word: 0,
        complete_sentence: 0,
        challenge: 0,
      },
      latestScores: {
        match: 0,
        choose_meaning: 0,
        listen_and_choose: 0,
        type_word: 0,
        complete_sentence: 0,
        challenge: 0,
      },
      attempts: {
        match: 0,
        choose_meaning: 0,
        listen_and_choose: 0,
        type_word: 0,
        complete_sentence: 0,
        challenge: 0,
      },
      unlocked: {
        match: true,
        choose_meaning: false,
        listen_and_choose: false,
        type_word: false,
        complete_sentence: false,
        challenge: false,
        unit_completed: false,
      },
      completed: false,
      lastPracticedAt: new Date().toISOString(),
    };

    allUnitProgress[key] = defaultProgress;
    this.setStorage('vocab_unit_progress', allUnitProgress);
    return defaultProgress;
  }

  public saveVocabPracticeResult(result: VocabPracticeResult): VocabularyUnitPracticeProgress {
    const allUnitProgress = this.getStorage<Record<string, VocabularyUnitPracticeProgress>>('vocab_unit_progress', {});
    const key = `${result.studentId}_unit_${result.unit}`;
    const current = this.getVocabularyUnitPracticeProgress(result.studentId, result.unit);

    if (result.practiceType !== 'review_wrong_words') {
      const pType = result.practiceType as VocabPracticeType;
      current.latestScores[pType] = result.percentage;
      current.bestScores[pType] = Math.max(current.bestScores[pType] || 0, result.percentage);
      current.attempts[pType] = (current.attempts[pType] || 0) + 1;

      if (pType === 'match') current.matchScore = current.bestScores.match;
      if (pType === 'choose_meaning') current.chooseMeaningScore = current.bestScores.choose_meaning;
      if (pType === 'listen_and_choose') current.listenChooseScore = current.bestScores.listen_and_choose;
      if (pType === 'type_word') current.typeWordScore = current.bestScores.type_word;
      if (pType === 'complete_sentence') current.completeSentenceScore = current.bestScores.complete_sentence;
      if (pType === 'challenge') current.challengeScore = current.bestScores.challenge;

      // Sequential unlock rules (passing score >= 80)
      if (current.bestScores.match >= 80) current.unlocked.choose_meaning = true;
      if (current.bestScores.choose_meaning >= 80) current.unlocked.listen_and_choose = true;
      if (current.bestScores.listen_and_choose >= 80) current.unlocked.type_word = true;
      if (current.bestScores.type_word >= 80) current.unlocked.complete_sentence = true;
      if (current.bestScores.complete_sentence >= 80) current.unlocked.challenge = true;
      if (current.bestScores.challenge >= 80) {
        current.unlocked.unit_completed = true;
        current.completed = true;
      }
    }

    current.lastPracticedAt = new Date().toISOString();
    allUnitProgress[key] = current;
    this.setStorage('vocab_unit_progress', allUnitProgress);

    // Save as quiz attempt for teacher dashboard
    const activityNameMap: Record<string, string> = {
      match: 'Nối từ với nghĩa',
      choose_meaning: 'Chọn nghĩa đúng',
      listen_and_choose: 'Nghe và chọn từ',
      type_word: 'Viết từ',
      complete_sentence: 'Điền từ vào câu',
      challenge: 'Vocabulary Challenge',
      review_wrong_words: 'Ôn từ hay sai',
    };

    const xpEarned = result.passed ? 20 : 5;
    this.recordQuizAttempt({
      studentId: result.studentId,
      unit: result.unit,
      module: 'vocabulary',
      activityId: `u${result.unit}-vocab-${result.practiceType}`,
      activityName: `Vocab Practice: ${activityNameMap[result.practiceType] || result.practiceType}`,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      xpEarned,
    });

    // Update overall StudentProgress vocabularyProgress
    const unlockedCount = Object.values(current.unlocked).filter(Boolean).length;
    // 6 exercises + completion = 7 stages
    const vocabProg = Math.min(100, Math.round((unlockedCount / 7) * 100));
    this.updateModuleProgress(result.studentId, result.unit, 'vocabulary', vocabProg);

    return current;
  }

  // Word Mastery Engine
  public getWordMasteryMap(studentId: string): Record<string, WordMasteryItem> {
    const allMastery = this.getStorage<Record<string, Record<string, WordMasteryItem>>>('word_mastery', {});
    return allMastery[studentId] || {};
  }

  public recordWordPractice(
    studentId: string,
    unit: number,
    wordId: number | string,
    word: string,
    meaningVi: string,
    ipa: string = '',
    isCorrect: boolean,
    isFirstAttempt: boolean = true
  ): WordMasteryItem {
    const allMastery = this.getStorage<Record<string, Record<string, WordMasteryItem>>>('word_mastery', {});
    if (!allMastery[studentId]) {
      allMastery[studentId] = {};
    }

    const key = `u${unit}_${wordId}_${word.toLowerCase().replace(/\s+/g, '_')}`;
    let item: WordMasteryItem = allMastery[studentId][key] || {
      unit,
      wordId,
      word,
      ipa,
      meaningVi,
      audioText: word,
      correctCount: 0,
      wrongCount: 0,
      consecutiveCorrect: 0,
      bestStreak: 0,
      mastered: false,
      needsReview: false,
      lastPractisedAt: null,
    };

    if (isCorrect) {
      item.correctCount += 1;
      if (isFirstAttempt) {
        item.consecutiveCorrect += 1;
        item.bestStreak = Math.max(item.bestStreak, item.consecutiveCorrect);
        // Mastered rule: 3 consecutive correct answers
        if (item.consecutiveCorrect >= 3) {
          item.mastered = true;
          item.needsReview = false;
        }
      }
    } else {
      item.wrongCount += 1;
      item.consecutiveCorrect = 0;
      item.needsReview = true;
      item.mastered = false;

      // Also record into system mistakes for mistake book
      this.recordMistake({
        studentId,
        unit,
        module: 'vocabulary',
        questionId: `vocab-${key}`,
        question: `Từ vựng: "${word}" (${meaningVi})`,
        studentAnswer: 'Chưa nhớ từ',
        correctAnswer: `${word} (${meaningVi})`,
        explanationVi: `"${word}" nghĩa là: ${meaningVi}. Cần luyện lại phát âm và cách viết.`,
      });
    }

    item.lastPractisedAt = new Date().toISOString();
    allMastery[studentId][key] = item;
    this.setStorage('word_mastery', allMastery);

    // Sync status into vocabulary status map
    let status: VocabularyStatus = 'new';
    if (item.mastered) {
      status = 'mastered';
    } else if (item.consecutiveCorrect >= 1 || item.correctCount >= 2) {
      status = 'learning';
    } else if (item.wrongCount > 0) {
      status = 'learning';
    }
    this.updateVocabStatus(studentId, `u${unit}-v${wordId}`, status);

    return item;
  }

  public getWordMasteryList(studentId: string, unit?: number): WordMasteryItem[] {
    const map = this.getWordMasteryMap(studentId);
    const list = Object.values(map);
    if (unit && unit > 0) {
      return list.filter(w => w.unit === unit);
    }
    return list;
  }

  public getWordsNeedingReview(studentId: string, unit?: number, limit: number = 20): WordMasteryItem[] {
    const list = this.getWordMasteryList(studentId, unit);
    const reviewList = list.filter(w => w.needsReview && !w.mastered);

    // Sort: highest wrongCount DESC, oldest lastPractisedAt ASC
    reviewList.sort((a, b) => {
      if (b.wrongCount !== a.wrongCount) {
        return b.wrongCount - a.wrongCount;
      }
      const timeA = a.lastPractisedAt ? new Date(a.lastPractisedAt).getTime() : 0;
      const timeB = b.lastPractisedAt ? new Date(b.lastPractisedAt).getTime() : 0;
      return timeA - timeB;
    });

    return reviewList.slice(0, limit);
  }

  public getVocabPracticeSummary(studentId: string) {
    const masteryList = this.getWordMasteryList(studentId);
    const masteredWords = masteryList.filter(w => w.mastered).length;
    const reviewWords = masteryList.filter(w => w.needsReview && !w.mastered).length;
    const totalCorrect = masteryList.reduce((acc, w) => acc + w.correctCount, 0);
    const totalWrong = masteryList.reduce((acc, w) => acc + w.wrongCount, 0);

    const attempts = this.getQuizAttempts(studentId).filter(a => a.module === 'vocabulary');
    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0;

    let completedUnits = 0;
    for (let u = 1; u <= 12; u++) {
      const prog = this.getVocabularyUnitPracticeProgress(studentId, u);
      if (prog.completed || prog.challengeScore >= 80) {
        completedUnits += 1;
      }
    }

    return {
      studentId,
      completedUnits,
      masteredWords,
      reviewWords,
      totalCorrect,
      totalWrong,
      averageScore,
      totalTrackedWords: masteryList.length,
    };
  }

  // Export reports to CSV/XLSX format

  public exportReportCSV(type: 'scores' | 'logins' | 'progress'): string {
    const analytics = this.getTeacherAnalytics();
    const attempts = this.getQuizAttempts();
    const sessions = this.getSessions();

    let headers = '';
    let rows: string[] = [];

    if (type === 'scores') {
      headers = 'Học sinh,Lớp,Ngày làm,Unit,Kỹ năng,Bài kiểm tra,Điểm,Điểm tối đa,Tỉ lệ (%),Lần làm';
      rows = attempts.map(a => {
        const student = analytics.students.find(s => s.id === a.studentId);
        const dateStr = new Date(a.submittedAt).toLocaleDateString('vi-VN');
        return `"${student?.name || 'N/A'}","${student?.className || '9A'}","${dateStr}","Unit ${a.unit}","${a.module}","${a.activityName}",${a.score},${a.maxScore},${a.percentage}%,Attempt ${a.attemptNumber}`;
      });
    } else if (type === 'logins') {
      headers = 'Học sinh,Lớp,Thời gian đăng nhập,Thời gian đăng xuất,Thời lượng (phút),Thiết bị';
      rows = sessions.map(s => {
        const loginStr = new Date(s.loginTime).toLocaleString('vi-VN');
        const logoutStr = s.logoutTime ? new Date(s.logoutTime).toLocaleString('vi-VN') : 'Đang hoạt động';
        const mins = Math.round(s.sessionDurationSeconds / 60);
        return `"${s.studentName}","${s.className}","${loginStr}","${logoutStr}",${mins},"${s.deviceType}"`;
      });
    } else {
      headers = 'Học sinh,Lớp,Email,Tiến độ Unit 1 (%),Điểm TB,Điểm cao nhất,Bài đã làm,XP,Trạng thái';
      rows = analytics.students.map(s => {
        return `"${s.name}","${s.className}","${s.email}",${s.progress}%,${s.avgScore}%,${s.highestScore}%,${s.quizzesDone},${s.xp},"${s.statusBadge}"`;
      });
    }

    return [headers, ...rows].join('\n');
  }
}

export const store = new AppStore();
