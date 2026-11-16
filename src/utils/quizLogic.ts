import type {
  AnswerMap,
  CategoryScore,
  CompletedRound,
  PracticeFocusGuide,
  QuestionCategory,
  QuizQuestion,
  QuizResult,
  RawQuestion,
  ReadinessState,
} from '../types/quiz';

// Pedagogical tie-breaker order: Vocabulary > Grammar > Reading
const CATEGORIES: QuestionCategory[] = ['vocabulary', 'grammar', 'reading'];
const QUESTIONS_PER_CATEGORY = 5;

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  reading: 'Reading',
};

export const EXAM_IMPACT_COPY: Record<QuestionCategory, string> = {
  vocabulary:
    'Exam Impact: A low vocabulary score heavily risks your Hören (Listening) and Lesen (Reading) exam modules.',
  grammar:
    'Exam Impact: A low grammar score heavily risks your Schreiben (Writing) and Sprechen (Speaking) exam modules.',
  reading:
    'Exam Impact: Reading requires mixed skills. A low score here risks your overall exam comprehension under time pressure.',
};

export const CATEGORY_PRACTICE_TIPS: Record<QuestionCategory, [string, string, string]> = {
  vocabulary: [
    'Practice days, months, and time phrases.',
    'Memorize common places (station, pharmacy, etc.).',
    'Review basic food and shopping terms.',
  ],
  grammar: [
    'Review regular and irregular verb conjugations (sein, haben, etc.).',
    'Practice identifying gendered articles (der/die/das).',
    'Brush up on the accusative case (den/einen).',
  ],
  reading: [
    'Practice reading short public signs and identifying open/close times.',
    'Read short SMS messages to identify who is meeting whom and where.',
    "Look for negative keywords (kein, nicht) that change a sentence's meaning.",
  ],
};

export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface SampledRound {
  questions: QuizQuestion[];
  nextUsedIds: string[];
  poolReset: boolean;
}

export function sampleQuizQuestions(
  bank: readonly RawQuestion[],
  usedIds: readonly string[],
  rng: () => number = Math.random,
): SampledRound {
  const usedSet = new Set(usedIds);
  let poolReset = false;

  const canSampleFresh = CATEGORIES.every((cat) => {
    const unusedInCat = bank.filter((q) => q.category === cat && !usedSet.has(q.id));
    return unusedInCat.length >= QUESTIONS_PER_CATEGORY;
  });

  const activeUsedSet = canSampleFresh ? usedSet : new Set<string>();
  if (!canSampleFresh) {
    poolReset = true;
  }

  const selectedRaw: RawQuestion[] = [];

  for (const cat of CATEGORIES) {
    const available = bank.filter((q) => q.category === cat && !activeUsedSet.has(q.id));
    const picked = shuffleArray(available, rng).slice(0, QUESTIONS_PER_CATEGORY);
    selectedRaw.push(...picked);
  }

  const interleaved = shuffleArray(selectedRaw, rng).map((q) => ({
    ...q,
    shuffledOptions: shuffleArray(q.options, rng),
  }));

  const nextUsedIds = [
    ...Array.from(activeUsedSet),
    ...interleaved.map((q) => q.id),
  ];

  return {
    questions: interleaved,
    nextUsedIds,
    poolReset,
  };
}

export function determineReadinessState(
  totalScore: number,
  categoryScores: readonly CategoryScore[],
): {
  state: ReadinessState;
  title: string;
  headline: string;
  message: string;
} {
  const hasCriticalBottleneck = categoryScores.some((c) => c.score <= 2);
  const allSubscoresPass = categoryScores.every((c) => c.score >= 3);

  if (totalScore >= 12 && allSubscoresPass) {
    return {
      state: 'green',
      title: 'Exam Ready',
      headline: "You're ready to book with confidence.",
      message: "You're Exam Ready! Earning your Goethe certificate is well within reach.",
    };
  }

  if (totalScore <= 8) {
    return {
      state: 'red',
      title: 'Keep Practicing',
      headline: 'Your next step is closer than you think.',
      message: "Booking the exam right now is a financial risk. Let's fix your foundations first.",
    };
  }

  if ((totalScore >= 9 && totalScore <= 11) || (totalScore >= 12 && hasCriticalBottleneck)) {
    return {
      state: 'yellow',
      title: 'Almost There',
      headline: "You're close—just one gap to steady first.",
      message:
        'You are hovering near the pass mark, but you have a critical bottleneck. Booking now is risky.',
    };
  }

  return {
    state: 'yellow',
    title: 'Almost There',
    headline: "You're close—just one gap to steady first.",
    message:
      'You are hovering near the pass mark, but you have a critical bottleneck. Booking now is risky.',
  };
}

export function determineAggregatedReadinessState(
  totalScore: number,
  categoryScores: readonly CategoryScore[],
): {
  state: ReadinessState;
  title: string;
  headline: string;
  message: string;
} {
  const hasCriticalBottleneck = categoryScores.some((c) => c.score <= 5);
  const allSubscoresPass = categoryScores.every((c) => c.score >= 6);

  if (totalScore >= 24 && allSubscoresPass) {
    return {
      state: 'green',
      title: 'True Ready',
      headline: "You're ready to book with confidence.",
      message:
        'Across 30 calibrated questions, your foundation is steady in every module. Earning your Goethe certificate is well within reach.',
    };
  }

  if (totalScore <= 17) {
    return {
      state: 'red',
      title: 'Not Ready',
      headline: 'Your next step is closer than you think.',
      message:
        "Across both rounds, booking the exam right now is a financial risk. Let's strengthen your core foundations first.",
    };
  }

  if ((totalScore >= 18 && totalScore <= 23) || (totalScore >= 24 && hasCriticalBottleneck)) {
    return {
      state: 'yellow',
      title: 'Borderline',
      headline: "You're close—just one gap to steady first.",
      message:
        'Your combined score sits near the pass mark with a specific bottleneck. Clear the weak module below before booking.',
    };
  }

  return {
    state: 'yellow',
    title: 'Borderline',
    headline: "You're close—just one gap to steady first.",
    message:
      'Your combined score sits near the pass mark with a specific bottleneck. Clear the weak module below before booking.',
  };
}

/**
 * Selects the single weakest category using pedagogical priority:
 * Vocabulary > Grammar > Reading.
 * Returns null only if every category achieved 100%.
 */
export function buildPracticeFocus(
  categoryScores: readonly CategoryScore[],
): PracticeFocusGuide | null {
  if (categoryScores.length === 0) return null;

  const allPerfect = categoryScores.every((c) => c.score >= c.total);
  if (allPerfect) {
    return null;
  }

  const minScore = Math.min(...categoryScores.map((c) => c.score));
  const tiedLowest = categoryScores.filter((c) => c.score === minScore);

  // CATEGORIES is ordered Vocabulary > Grammar > Reading
  const winningCategory =
    CATEGORIES.map((cat) => tiedLowest.find((c) => c.category === cat)).find(
      (c): c is CategoryScore => c !== undefined,
    ) ?? tiedLowest[0];

  const hasTie = tiedLowest.length > 1;
  const tieContextMessage = hasTie
    ? `You have a few areas to work on, but ${winningCategory.label} is your most critical foundation right now. Fix this first.`
    : null;

  return {
    category: winningCategory.category,
    label: winningCategory.label,
    score: winningCategory.score,
    total: winningCategory.total,
    percentage: winningCategory.percentage,
    examImpact: EXAM_IMPACT_COPY[winningCategory.category],
    hasTie,
    tieContextMessage,
    practiceTips: CATEGORY_PRACTICE_TIPS[winningCategory.category],
  };
}

export function calculateQuizResult(
  questions: readonly QuizQuestion[],
  answers: AnswerMap,
): QuizResult {
  const totalQuestions = questions.length;

  const categoryScores: CategoryScore[] = CATEGORIES.map((cat) => {
    const catQuestions = questions.filter((q) => q.category === cat);
    const score = catQuestions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correct_answer ? 1 : 0);
    }, 0);
    const total = catQuestions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      score,
      total,
      percentage,
    };
  });

  const totalScore = categoryScores.reduce((acc, c) => acc + c.score, 0);
  const totalPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const readiness = determineReadinessState(totalScore, categoryScores);
  const practiceFocus = buildPracticeFocus(categoryScores);

  return {
    isAggregated: false,
    totalScore,
    totalQuestions,
    totalPercentage,
    readinessState: readiness.state,
    readinessTitle: readiness.title,
    readinessHeadline: readiness.headline,
    readinessMessage: readiness.message,
    categoryScores,
    practiceFocus,
  };
}

export function calculateAggregatedQuizResult(
  rounds: readonly CompletedRound[],
): QuizResult {
  const combinedItems = rounds.flatMap((round) =>
    round.questions.map((question) => ({
      roundNumber: round.roundNumber,
      question,
      selectedAnswer: round.answers[question.id] ?? null,
    })),
  );

  const totalQuestions = combinedItems.length;

  const categoryScores: CategoryScore[] = CATEGORIES.map((cat) => {
    const catItems = combinedItems.filter((item) => item.question.category === cat);
    const score = catItems.reduce((acc, item) => {
      return acc + (item.selectedAnswer === item.question.correct_answer ? 1 : 0);
    }, 0);
    const total = catItems.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      score,
      total,
      percentage,
    };
  });

  const totalScore = categoryScores.reduce((acc, c) => acc + c.score, 0);
  const totalPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const readiness = determineAggregatedReadinessState(totalScore, categoryScores);
  const practiceFocus = buildPracticeFocus(categoryScores);

  return {
    isAggregated: true,
    totalScore,
    totalQuestions,
    totalPercentage,
    readinessState: readiness.state,
    readinessTitle: readiness.title,
    readinessHeadline: readiness.headline,
    readinessMessage: readiness.message,
    categoryScores,
    practiceFocus,
  };
}
