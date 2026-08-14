/**
 * PROGRESS SERVICE FOR "ENGLISH 9 - MISS HIEN"
 * Handles calculation of student overall progress, skill scores,
 * auto-saving learning log results, word reviews, and sync to Google Sheets.
 */

import { UserProfile, VocabPracticeResult, ListeningAssessmentResult } from '../types';
import { googleSheetsService } from './googleSheetsService';
import { studentService } from './studentService';
import { store } from './store';

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
      vocabularyScore: vocabScore || (u1Prog.vocabularyProgress > 0 ? 85 : 0),
      grammarScore: grammarScore || (u1Prog.grammarProgress > 0 ? 80 : 0),
      pronunciationScore: pronScore || (u1Prog.pronunciationProgress > 0 ? 80 : 0),
      listeningScore: listeningScore || (u1Prog.practiceProgress > 0 ? 85 : 0),
      vocabularyProgress: u1Prog.vocabularyProgress,
      grammarProgress: u1Prog.grammarProgress,
      pronunciationProgress: u1Prog.pronunciationProgress,
      listeningProgress: u1Prog.practiceProgress,
    };
  }

  /**
   * Auto-save full student progress to Google Sheets (STUDENTS sheet)
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

    // Update local storage and store
    store.updateUser(updatedStudent);
    studentService.saveCurrentStudent(updatedStudent);

    // Call Google Sheets
    await googleSheetsService.saveProgress({
      studentId: student.id,
      name: student.name,
      className: student.className || '9A',
      overallProgress,
      xp: student.xp,
      streak: student.streak,
      ...skillScores,
      lastActivity: lastActivityDescription || 'Học bài',
    });
  }

  /**
   * Auto-save exercise completion to LEARNING_LOG sheet and update STUDENTS summary
   */
  public async recordExerciseResult(payload: ExerciseResultPayload) {
    const { student, unit, skill, exercise, score, correct, total, passed, xpEarned, attempt = 1 } = payload;
    if (!student || !student.id) return;

    // 1. Award XP to student in local store
    if (xpEarned > 0) {
      store.addXP(student.id, xpEarned);
    }

    // 2. Save result to Google Apps Script (LEARNING_LOG sheet)
    const logPromise = googleSheetsService.saveResult({
      studentId: student.id,
      name: student.name,
      className: student.className || '9A',
      unit: unit,
      skill: skill,
      exercise: exercise,
      score: score,
      correct: correct,
      total: total,
      passed: passed,
      xpEarned: xpEarned,
      attempt: attempt,
    });

    // 3. Auto-save student progress summary
    const freshUser = store.getUsers().find(u => u.id === student.id) || student;
    const actDesc = `${skill} Unit ${unit}: ${exercise} (${score}đ)`;
    await this.autoSaveStudentProgress(freshUser, actDesc);

    await logPromise;
  }

  /**
   * Auto-save word review state to WORD_REVIEW sheet
   */
  public async recordWordReview(payload: WordReviewPayload) {
    const { student, unit, word, correctCount, wrongCount, needsReview, mastered } = payload;
    if (!student || !student.id) return;

    await googleSheetsService.saveWordReview({
      studentId: student.id,
      name: student.name,
      unit,
      word,
      correctCount,
      wrongCount,
      needsReview,
      mastered,
    });
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
