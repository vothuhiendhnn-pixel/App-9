/**
 * PROGRESS SERVICE FOR "ENGLISH 9 - MISS HIEN"
 * Handles calculation of student overall progress, skill scores,
 * local progress persistence. Supabase upload requires a secure server RPC.
 */

import { UserProfile, VocabPracticeResult, ListeningAssessmentResult } from '../types';
import { studentService } from './studentService';
import { store } from './store';
import { supabase } from '../lib/supabaseClient';

export interface ExerciseResultPayload {
  student: UserProfile;
  unit: number;
  skill: 'Vocabulary' | 'Grammar' | 'Pronunciation' | 'Listening' | 'Practice' | 'Challenge';
  exercise: string;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  attempt?: number;
  clientAttemptId?: string;
}

export interface WordReviewPayload {
  student: UserProfile;
  unit: number;
  word: string;
  correctCount: number;
  wrongCount: number;
  needsReview: boolean;
  mastered: boolean;
}

class ProgressService {
  /**
   * Calculates overall progress % across all modules for a student
   */
  public calculateOverallProgress(studentId: string): number {
    let totalUnitPercentages = 0;
    for (let u = 1; u <= 12; u++) {
      const prog = store.getStudentProgress(studentId, u);
      totalUnitPercentages += prog.unitProgress;
    }
    return Math.round(totalUnitPercentages / 12);
  }

  /**
   * Calculates average skill scores (0-100) for student
   */
  public getSkillScores(studentId: string) {
    const attempts = store.getQuizAttempts(studentId);

    const getAvgFor = (moduleName: string) => {
      const filtered = attempts.filter(a => a.module === moduleName);
      if (filtered.length === 0) return 0;
      return Math.round(filtered.reduce((sum, a) => sum + a.percentage, 0) / filtered.length);
    };

    const vocabScore = getAvgFor('vocabulary');
    const grammarScore = getAvgFor('grammar');
    const pronScore = getAvgFor('pronunciation');
    const listeningScore = getAvgFor('practice');

    const u1Prog = store.getStudentProgress(studentId, 1);

    return {
      vocabularyScore: vocabScore,
      grammarScore: grammarScore,
      pronunciationScore: pronScore,
      listeningScore: listeningScore,
      vocabularyProgress: u1Prog.vocabularyProgress,
      grammarProgress: u1Prog.grammarProgress,
      pronunciationProgress: u1Prog.pronunciationProgress,
      listeningProgress: u1Prog.practiceProgress,
    };
  }

  /**
   * Save local student progress (cloud persistence pending secure endpoint)
   */
  public async autoSaveStudentProgress(student: UserProfile, lastActivityDescription?: string) {
    if (!student || !student.id) return;

    const overallProgress = this.calculateOverallProgress(student.id);
    const skillScores = this.getSkillScores(student.id);

    const updatedStudent: UserProfile = {
      ...student,
      overallProgress,
      ...skillScores,
      lastActivity: lastActivityDescription || student.lastActivity || 'Học bài',
      lastLoginAt: new Date().toISOString(),
    };

    // Progress remains local until secured Supabase persistence is configured.
    // Never report a successful cloud sync without confirmation.
    updatedStudent.syncStatus = 'pending';
    store.updateUser(updatedStudent);
    studentService.saveCurrentStudent(updatedStudent);
  }

  /**
   * Store one completed exercise on Supabase. Each call creates one submission.
   * Browser-calculated scores remain UNVERIFIED pending trusted server grading.
   * A SECURITY DEFINER RPC must validate the student credential for every submission.
   */
  public async recordExerciseResult(payload: ExerciseResultPayload): Promise<void> {
    const { student, unit, skill, exercise, score, correct, total, passed, xpEarned, attempt, clientAttemptId } = payload;
    if (!student?.id) throw new Error('Không tìm thấy học sinh.');

    const credentials = studentService.getSubmissionCredential(student.id);
    if (!credentials) throw new Error('Phiên học sinh đã hết. Hãy đăng xuất, đăng nhập lại và nộp bài mới.');

    // The server checks the student code/password itself before writing the row.
    // Client score is UNVERIFIED; never mistake this for teacher-graded marks.
    const { data, error } = await supabase.rpc('student_submit_result', {
      p_student_code: credentials.code,
      p_password: credentials.password,
      p_student_id: student.id,
      p_unit: unit,
      p_skill: skill.toLowerCase(),
      p_exercise: exercise,
      p_score: score,
      p_correct: correct,
      p_total: total,
      p_passed: passed,
      p_attempt: attempt ?? 1,
      p_xp: xpEarned,
      p_client_attempt_id: clientAttemptId ?? '',
    });
    if (error) {
      console.error('Submission RPC failed:', { code: error.code, message: error.message });
      throw new Error('Chưa ghi nhận trên Supabase: ' + error.message);
    }
    if (!data) throw new Error('Máy chủ chưa xác nhận nhận bài; không đánh dấu đã nộp.');

    // Update local display only after server has acknowledged the submission.
    // Do not award XP twice: store.recordQuizAttempt already awards XP.
    const freshUser = store.getUsers().find(u => u.id === student.id) || student;
    await this.autoSaveStudentProgress(freshUser, `${skill} Unit ${unit}: ${exercise} (đã nộp)`);
  }

  public async submitAttempt(student: UserProfile, attempt: {
    id?: string; unit: number; module: string; activityName: string; score: number; maxScore: number;
    percentage: number; xpEarned: number; attemptNumber: number;
  }): Promise<void> {
    const map: Record<string, ExerciseResultPayload['skill']> = {
      vocabulary: 'Vocabulary', grammar: 'Grammar', practice: 'Practice',
      listening: 'Listening', challenge: 'Practice', pronunciation: 'Pronunciation',
    };
    const skill = map[attempt.module];
    if (!skill) return;
    this.emitSaveStatus('saving', 'Đang gửi bài lên Supabase…');
    try {
      await this.recordExerciseResult({
        student, unit: attempt.unit, skill, exercise: attempt.activityName,
        score: attempt.percentage, correct: attempt.score, total: attempt.maxScore,
        passed: attempt.percentage >= 80, xpEarned: attempt.xpEarned,
        attempt: attempt.attemptNumber, clientAttemptId: attempt.id ?? '',
      });
      this.emitSaveStatus('success', 'Đã lưu bài thật lên Supabase.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không lưu được bài lên Supabase.';
      this.emitSaveStatus('error', message);
      // Do not erase the local attempt; the student may need to retry after login.
    }
  }

  /** Retry the CURRENT student's locally stored results, without deleting them.
   * Server-side clientAttemptId deduplicates submissions already received. */
  public async resendLocalAttempts(student: UserProfile): Promise<{ sent: number; failed: number }> {
    const attempts = store.getQuizAttempts(student.id).filter(a =>
      a.studentId === student.id && a.id && a.score >= 0 && a.maxScore > 0
    );
    let sent = 0, failed = 0;
    this.emitSaveStatus('saving', `Đang đối chiếu ${attempts.length} bài trên thiết bị…`);
    for (const attempt of attempts) {
      const skillMap: Record<string, ExerciseResultPayload['skill']> = {
        vocabulary: 'Vocabulary', grammar: 'Grammar', practice: 'Practice',
        challenge: 'Practice', pronunciation: 'Pronunciation',
      };
      const skill = skillMap[attempt.module];
      if (!skill) continue;
      try {
        await this.recordExerciseResult({
          student, unit: attempt.unit, skill, exercise: attempt.activityName,
          score: attempt.percentage, correct: attempt.score, total: attempt.maxScore,
          passed: attempt.percentage >= 80, xpEarned: attempt.xpEarned,
          attempt: attempt.attemptNumber, clientAttemptId: attempt.id,
        });
        sent++;
      } catch (error) {
        failed++;
        console.warn('Local submission retry failed:', error instanceof Error ? error.message : error);
      }
    }
    this.emitSaveStatus(failed ? 'error' : 'success',
      `Đối chiếu Supabase: ${sent} bài đã được máy chủ xác nhận, ${failed} bài chưa gửi được.`);
    return { sent, failed };
  }

  private emitSaveStatus(status: 'saving' | 'success' | 'error', message: string) {
    window.dispatchEvent(new CustomEvent('english9:submission-status', { detail: { status, message } }));
  }

  /**
   * Word review hook (cloud persistence pending)
   */
  public async recordWordReview(payload: WordReviewPayload) {
    const { student, unit, word, correctCount, wrongCount, needsReview, mastered } = payload;
    if (!student || !student.id) return;

    // Word-review state is stored by the local store. No external write yet.
    void unit; void word; void correctCount; void wrongCount;
    void needsReview; void mastered;
  }

  /**
   * Hook for vocabulary practice exercise completion
   */
  public async handleVocabPracticeCompleted(student: UserProfile, result: VocabPracticeResult) {
    const activityNames: Record<string, string> = {
      match: 'Nối từ với nghĩa',
      choose_meaning: 'Chọn nghĩa đúng',
      listen_and_choose: 'Nghe và chọn từ',
      type_word: 'Viết từ',
      complete_sentence: 'Điền từ vào câu',
      challenge: 'Vocabulary Challenge',
      review_wrong_words: 'Ôn từ hay sai',
    };

    const xpEarned = result.passed ? 20 : 5;

    this.emitSaveStatus('saving', 'Đang gửi bài Từ vựng lên Supabase…');
    try {
      await this.recordExerciseResult({
        student,
        unit: result.unit,
        skill: 'Vocabulary',
        exercise: activityNames[result.practiceType] || result.practiceType,
        score: result.percentage,
        correct: result.correctCount,
        total: result.totalQuestions,
        passed: result.passed,
        xpEarned,
        attempt: result.attemptNumber,
        clientAttemptId: `vocab-${result.studentId}-${result.unit}-${result.practiceType}-${result.createdAt}`,
      });
      this.emitSaveStatus('success', 'Đã gửi bài Từ vựng thật lên Supabase.');
    } catch (error) {
      this.emitSaveStatus('error', error instanceof Error ? error.message : 'Không gửi được bài từ vựng.');
    }
  }

  /**
   * Hook for listening assessment completion
   */
  public async handleListeningCompleted(student: UserProfile, result: ListeningAssessmentResult) {
    const xpEarned = result.passed ? 20 : 5;
    await this.recordExerciseResult({
      student,
      unit: result.unit,
      skill: 'Listening',
      exercise: `Listening ${result.lessonId}`,
      score: result.score,
      correct: result.correctCount,
      total: result.totalCount,
      passed: result.passed,
      xpEarned,
      attempt: result.attempt,
    });
  }

  /**
   * Hook for pronunciation assessment completion
   */
  public async handlePronunciationCompleted(student: UserProfile, unit: number, itemTitle: string, overallScore: number, passed: boolean, attempt: number = 1) {
    const xpEarned = passed ? 15 : 5;
    await this.recordExerciseResult({
      student,
      unit,
      skill: 'Pronunciation',
      exercise: itemTitle,
      score: overallScore,
      correct: passed ? 1 : 0,
      total: 1,
      passed,
      xpEarned,
      attempt,
    });
  }
}

export const progressService = new ProgressService();
