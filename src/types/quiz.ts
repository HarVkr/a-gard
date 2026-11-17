export type QuestionCategory = 'vocabulary' | 'grammar' | 'reading';

export interface RawQuestion {
  id: string;
  category: QuestionCategory;
  question_german: string;
  question_english_hint: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  image_url?: string;
}

export interface QuizQuestion extends RawQuestion {
  shuffledOptions: string[];
}

export type AnswerMap = Record<string, string>;

export interface CompletedRound {
  roundNumber: number;
  questions: readonly QuizQuestion[];
  answers: AnswerMap;
}

export type ReadinessState = 'green' | 'yellow' | 'red';

export interface CategoryScore {
  category: QuestionCategory;
  label: string;
  score: number;
  total: number;
  percentage: number;
}

export interface PracticeFocusGuide {
  category: QuestionCategory;
  label: string;
  score: number;
  total: number;
  percentage: number;
  examImpact: string;
  hasTie: boolean;
  tieContextMessage: string | null;
  practiceTips: [string, string, string];
}

export interface QuizResult {
  isAggregated: boolean;
  totalScore: number;
  totalQuestions: number;
  totalPercentage: number;
  readinessState: ReadinessState;
  readinessTitle: string;
  readinessHeadline: string;
  readinessMessage: string;
  categoryScores: CategoryScore[];
  practiceFocus: PracticeFocusGuide | null;
}
