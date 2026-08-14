export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  className: string;
  xp: number;
  streak: number;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export type VocabularyStatus = 'new' | 'learning' | 'good' | 'mastered';

export interface VocabularyItem {
  id: string;
  unit: number;
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  example: string;
  audioUrl?: string;
  status?: VocabularyStatus;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'matching'
  | 'sentence_rewrite'
  | 'true_false'
  | 'listening_gap_fill'
  | 'sound_classification';

export interface Exercise {
  id: string;
  unit: number;
  module: 'vocabulary' | 'grammar' | 'pronunciation' | 'practice';
  type: ExerciseType;
  level?: 1 | 2 | 3; // 1: Recognise, 2: Apply, 3: Produce
  topic?: string;
  question: string;
  options?: string[];
  answer: string | string[];
  hint?: string;
  explanationVi: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  audioWord?: string;
  contextSentence?: string;
}

export interface PronunciationWord {
  word: string;
  ipa: string;
  sound: '/æ/' | '/ɑː/' | '/e/';
  meaningVi: string;
}

export interface ListeningItem {
  id: string;
  title: string;
  audioScript: string;
  durationSeconds: number;
  blanks: {
    index: number;
    beforeText: string;
    afterText: string;
    correctAnswer: string;
    hint: string;
  }[];
  transcript: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  unit: number;
  module: 'vocabulary' | 'grammar' | 'pronunciation' | 'practice' | 'challenge';
  activityId: string;
  activityName: string;
  score: number;
  maxScore: number;
  percentage: number;
  attemptNumber: number;
  submittedAt: string;
  xpEarned: number;
}

export interface MistakeItem {
  id: string;
  studentId: string;
  unit: number;
  module: 'vocabulary' | 'grammar' | 'pronunciation' | 'practice' | 'challenge';
  questionId: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanationVi: string;
  attemptCount: number;
  lastAttempt: string;
  resolved?: boolean;
}

export interface LoginSession {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  loginTime: string;
  logoutTime: string | null;
  sessionDurationSeconds: number;
  deviceType: string;
  lastHeartbeat: string;
}

export interface LearningEvent {
  id: string;
  studentId: string;
  eventType:
    | 'login'
    | 'logout'
    | 'open_unit'
    | 'start_lesson'
    | 'complete_lesson'
    | 'start_quiz'
    | 'submit_quiz'
    | 'review_mistakes'
    | 'complete_unit';
  unit?: number;
  module?: string;
  activityId?: string;
  createdAt: string;
}

export interface StudentProgress {
  studentId: string;
  unit: number;
  vocabularyProgress: number; // 0-100
  grammarProgress: number; // 0-100
  pronunciationProgress: number; // 0-100
  practiceProgress: number; // 0-100
  unitProgress: number; // 0-100 (Vocab: 25%, Grammar: 25%, Pron: 20%, Practice: 30%)
  averageScore: number;
  lastActivity: string;
}

export interface UnitInfo {
  id: number;
  title: string;
  vietnameseTitle: string;
  description: string;
  topics: {
    vocabulary: string[];
    grammar: string[];
    pronunciation: string[];
    listening: string[];
  };
  vocabularyCount: number;
  grammarCount: number;
  pronunciationCount: number;
  practiceCount: number;
  isActive: boolean;
}

// Pronunciation Practice Types
export type PronunciationItemType =
  | 'single_word'
  | 'word_pair'
  | 'word_stress'
  | 'sentence_rhythm'
  | 'sentence_stress'
  | 'intonation';

export interface PronunciationSubItem {
  text: string;
  ipa?: string;
  targetSound?: string;
  stressSyllable?: string;
  stressedWords?: string[];
  targetStressWord?: string;
  targetIntonation?: 'rising' | 'falling';
  intonationSymbol?: '↗' | '↘';
  meaningVi?: string;
  audioUrl?: string;
  studentScore?: number;
  bestScore?: number;
  attempts?: number;
  passed?: boolean;
}

export interface PronunciationPracticeItem {
  id: string;
  unit: number;
  type: PronunciationItemType;
  title: string;
  instructionVi: string;
  passingScore: number;
  word1?: PronunciationSubItem;
  word2?: PronunciationSubItem;
  sentence1?: PronunciationSubItem;
  sentence2?: PronunciationSubItem;
  statement?: PronunciationSubItem;
  question?: PronunciationSubItem;
  singleWord?: PronunciationSubItem;
}

export interface PronunciationAssessmentResult {
  itemId: string;
  subItemKey?: string;
  studentId: string;
  targetText: string;
  targetIPA?: string;
  spokenTranscript: string;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  overallScore: number;
  requiredScore: number;
  attempt: number;
  bestScore: number;
  passed: boolean;
  nextItemUnlocked: boolean;
  feedback: {
    status: 'excellent' | 'passed' | 'almost' | 'retry';
    icon: string;
    title: string;
    message: string;
    canProceed: boolean;
    incorrectSounds?: string[];
    suggestion?: string;
  };
  recordedAudioUrl?: string;
  createdAt: string;
}

export interface UnitPronunciationProgress {
  unit: number;
  completed: boolean;
  averageScore: number;
  completedItems: number;
  totalItems: number;
  highestScore: number;
  totalAttempts: number;
}

// Listening - Fill in the Blanks Types
export interface ListeningBlank {
  blank: number;
  answer: string;
  acceptedAnswers: string[];
}

export interface ListeningAudioConfig {
  mode: 'tts' | 'audio';
  audioUrl?: string;
  audioScript: string;
}

export interface ListeningLesson {
  id: string;
  title: string;
  audio: ListeningAudioConfig;
  displayText: string;
  blanks: ListeningBlank[];
}

export interface ListeningUnit {
  unit: number;
  title: string;
  lessons: ListeningLesson[];
}

export interface BlankCheckResult {
  blank: number;
  studentAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  acceptedAnswers: string[];
}

export interface ListeningAssessmentResult {
  lessonId: string;
  studentId: string;
  unit: number;
  score: number;
  maxScore: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  blankResults: BlankCheckResult[];
  attempt: number;
  bestScore: number;
  latestScore: number;
  createdAt: string;
}

export interface UnitListeningProgress {
  unit: number;
  completed: boolean;
  lesson1Score: number;
  lesson2Score: number;
  averageScore: number;
  totalAttempts: number;
}

// Vocabulary Practice Module Types
export type VocabPracticeType =
  | 'match'
  | 'choose_meaning'
  | 'listen_and_choose'
  | 'type_word'
  | 'complete_sentence'
  | 'challenge';

export interface WordMasteryItem {
  unit: number;
  wordId: number | string;
  word: string;
  ipa?: string;
  meaningVi: string;
  audioText?: string;
  correctCount: number;
  wrongCount: number;
  consecutiveCorrect: number;
  bestStreak: number;
  mastered: boolean;
  needsReview: boolean;
  lastPractisedAt: string | null;
}

export interface VocabularyUnitPracticeProgress {
  unit: number;
  studentId: string;
  matchScore: number;
  chooseMeaningScore: number;
  listenChooseScore: number;
  typeWordScore: number;
  completeSentenceScore: number;
  challengeScore: number;
  bestScores: Record<VocabPracticeType, number>;
  latestScores: Record<VocabPracticeType, number>;
  attempts: Record<VocabPracticeType, number>;
  unlocked: {
    match: boolean;
    choose_meaning: boolean;
    listen_and_choose: boolean;
    type_word: boolean;
    complete_sentence: boolean;
    challenge: boolean;
    unit_completed: boolean;
  };
  completed: boolean;
  lastPracticedAt: string;
}

export interface UnitContextQuestion {
  id: string;
  sentence: string;
  answer: string;
}

export interface UnitContextQuestionBank {
  unit: number;
  title: string;
  questions: UnitContextQuestion[];
}

export interface VocabPracticeResult {
  unit: number;
  studentId: string;
  practiceType: VocabPracticeType | 'review_wrong_words';
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  bestScore: number;
  latestScore: number;
  correctCount: number;
  totalQuestions: number;
  wordsPracticed: {
    word: string;
    isCorrect: boolean;
    retried?: boolean;
  }[];
  createdAt: string;
}
