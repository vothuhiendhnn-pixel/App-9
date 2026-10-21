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
   * The RLS INSERT policy must require students.user_id = auth.uid().
   */
  public async recordExerciseResult(payload: ExerciseResultPayload): Promise<void> {
    const { student, unit, skill, exercise, score, correct, total, passed, xpEarned, attempt } = payload;
    if (!student?.id) throw new Error('Không tìm thấy học sinh.');

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !sessionData.user) {
      throw new Error('Chưa lưu được lên Supabase: đăng nhập bằng mã học sinh hiện chưa tạo phiên Supabase Auth. Bài chỉ có thể lưu khi cấu hình luồng nộp bài xác thực trên máy chủ.');
    }

    // Verify the Auth user owns the student profile before attempting INSERT.
    const { data: studentRow, error: studentError } = await supabase
      .from('students')
      .select('id, user_id, active')
      .eq('id', student.id)
      .eq('user_id', sessionData.user.id)
      .single();
    if (studentError || !studentRow || studentRow.active === false) {
      throw new Error('Tài khoản không có quyền nộp bài cho học sinh này.');
    }

    const submission = {
      student_id: student.id,
      submitted_by: sessionData.user.id,
      activity_id: `${skill.toLowerCase()}-u${unit}-${exercise}`,
      activity_type: skill.toLowerCase(),
      unit_number: unit,
      answers: {
        exercise,
        correct,
        total,
        passed,
        attempt: attempt ?? null,
        xpEarned,
        clientReportedScore: score,
        // These are only summary statistics. Answer-level data is not present
        // in ExerciseResultPayload, so do not claim full answers were captured.
      },
      // Browser scores must never be accepted as verified teacher grades.
      grading_status: 'pending',
    };
    const { error: insertError } = await supabase.from('submissions').insert(submission);
    if (insertError) {
      console.error('Supabase submission failure:', insertError);
      throw new Error(`Chưa lưu được bài lên Supabase: ${insertError.message}`);
    }

    // Update local display only after server has acknowledged the submission.
    // Do not award XP twice: store.recordQuizAttempt already awards XP.
    const freshUser = store.getUsers().find(u => u.id === student.id) || student;
    await this.autoSaveStudentProgress(freshUser, `${skill} Unit ${unit}: ${exercise} (đã nộp)`);
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

    await this.recordExerciseResult({
      student,
      unit: result.unit,
      skill: 'Vocabulary',
      exercise: activityNames[result.practiceType] || result.practiceType,
      score: result.score,
      correct: result.correctCount,
      total: result.totalQuestions,
      passed: result.passed,
      xpEarned,
      attempt: result.attemptNumber,
    });
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
