import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { AnswerMap, QuizQuestion, RawQuestion } from '../types/quiz';
import {
  buildPracticeFocus,
  calculateAggregatedQuizResult,
  calculateQuizResult,
  CATEGORY_PRACTICE_TIPS,
  EXAM_IMPACT_COPY,
  sampleQuizQuestions,
} from './quizLogic';

const bankPath = path.resolve(
  process.cwd(),
  'public/assets/aistudio/45-questions-bank-2_bb0ff086.json',
);
const questionBank: RawQuestion[] = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

test('sampleQuizQuestions selects exactly 15 questions (5V, 5G, 5R) and shuffles options', () => {
  const round1 = sampleQuizQuestions(questionBank, [], seededRng(42));
  assert.equal(round1.questions.length, 15);
  assert.equal(round1.poolReset, false);

  const vocabCount = round1.questions.filter((q) => q.category === 'vocabulary').length;
  const grammarCount = round1.questions.filter((q) => q.category === 'grammar').length;
  const readingCount = round1.questions.filter((q) => q.category === 'reading').length;

  assert.equal(vocabCount, 5);
  assert.equal(grammarCount, 5);
  assert.equal(readingCount, 5);

  for (const q of round1.questions) {
    assert.equal(q.shuffledOptions.length, 4);
    assert.deepEqual([...q.shuffledOptions].sort(), [...q.options].sort());
    assert.ok(q.shuffledOptions.includes(q.correct_answer));
  }
});

test('Round 2 and Round 3 sample completely non-overlapping questions from the 45-question bank', () => {
  const rng = seededRng(101);
  const round1 = sampleQuizQuestions(questionBank, [], rng);
  const round2 = sampleQuizQuestions(questionBank, round1.nextUsedIds, rng);
  const round3 = sampleQuizQuestions(questionBank, round2.nextUsedIds, rng);

  assert.equal(round1.poolReset, false);
  assert.equal(round2.poolReset, false);
  assert.equal(round3.poolReset, false);

  const ids1 = new Set(round1.questions.map((q) => q.id));
  const ids2 = new Set(round2.questions.map((q) => q.id));
  const ids3 = new Set(round3.questions.map((q) => q.id));

  for (const id of ids2) {
    assert.equal(ids1.has(id), false, `Round 2 repeated Round 1 question ${id}`);
  }
  for (const id of ids3) {
    assert.equal(ids1.has(id), false, `Round 3 repeated Round 1 question ${id}`);
    assert.equal(ids2.has(id), false, `Round 3 repeated Round 2 question ${id}`);
  }

  const allSampled = new Set([...ids1, ...ids2, ...ids3]);
  assert.equal(allSampled.size, 45);

  const round4 = sampleQuizQuestions(questionBank, round3.nextUsedIds, rng);
  assert.equal(round4.poolReset, true);
  assert.equal(round4.questions.length, 15);
});

function buildAnswersForCounts(
  questions: readonly QuizQuestion[],
  correctCounts: { vocabulary: number; grammar: number; reading: number },
): AnswerMap {
  const answers: AnswerMap = {};
  const remaining = { ...correctCounts };

  for (const q of questions) {
    if (remaining[q.category] > 0) {
      answers[q.id] = q.correct_answer;
      remaining[q.category] -= 1;
    } else {
      const wrong = q.shuffledOptions.find((o) => o !== q.correct_answer) ?? 'WRONG';
      answers[q.id] = wrong;
    }
  }
  return answers;
}

test('STATE GREEN requires total >= 12 and all subscores >= 3 and identifies single weakest category', () => {
  const { questions } = sampleQuizQuestions(questionBank, [], seededRng(7));
  const answers = buildAnswersForCounts(questions, {
    vocabulary: 4,
    grammar: 5,
    reading: 3,
  });

  const result = calculateQuizResult(questions, answers);
  assert.equal(result.isAggregated, false);
  assert.equal(result.totalScore, 12);
  assert.equal(result.totalPercentage, 80);
  assert.equal(result.readinessState, 'green');
  assert.equal(result.readinessHeadline, "You're ready to book with confidence.");
  assert.ok(result.practiceFocus);
  assert.equal(result.practiceFocus.category, 'reading');
  assert.equal(result.practiceFocus.hasTie, false);
  assert.equal(result.practiceFocus.tieContextMessage, null);
  assert.equal(result.practiceFocus.examImpact, EXAM_IMPACT_COPY.reading);
  assert.deepEqual(result.practiceFocus.practiceTips, CATEGORY_PRACTICE_TIPS.reading);
  assert.equal(result.practiceFocus.practiceTips.length, 3);
});

test('STATE YELLOW triggers for 12+ total when a subscore is <= 2 (bottleneck)', () => {
  const { questions } = sampleQuizQuestions(questionBank, [], seededRng(9));
  const answers = buildAnswersForCounts(questions, {
    vocabulary: 5,
    grammar: 5,
    reading: 2,
  });

  const result = calculateQuizResult(questions, answers);
  assert.equal(result.totalScore, 12);
  assert.equal(result.readinessState, 'yellow');
  assert.ok(result.practiceFocus);
  assert.equal(result.practiceFocus.category, 'reading');
  assert.equal(result.practiceFocus.hasTie, false);
});

test('Tie-breaker follows Vocabulary > Grammar > Reading hierarchy and includes italic tie context', () => {
  // Vocab + Grammar tie -> Vocabulary wins
  const vocabGrammarTie = buildPracticeFocus([
    { category: 'vocabulary', label: 'Vocabulary', score: 2, total: 5, percentage: 40 },
    { category: 'grammar', label: 'Grammar', score: 2, total: 5, percentage: 40 },
    { category: 'reading', label: 'Reading', score: 4, total: 5, percentage: 80 },
  ]);
  assert.ok(vocabGrammarTie);
  assert.equal(vocabGrammarTie.category, 'vocabulary');
  assert.equal(vocabGrammarTie.hasTie, true);
  assert.equal(
    vocabGrammarTie.tieContextMessage,
    'You have a few areas to work on, but Vocabulary is your most critical foundation right now. Fix this first.',
  );
  assert.deepEqual(vocabGrammarTie.practiceTips, CATEGORY_PRACTICE_TIPS.vocabulary);

  // Grammar + Reading tie -> Grammar wins
  const grammarReadingTie = buildPracticeFocus([
    { category: 'vocabulary', label: 'Vocabulary', score: 4, total: 5, percentage: 80 },
    { category: 'grammar', label: 'Grammar', score: 1, total: 5, percentage: 20 },
    { category: 'reading', label: 'Reading', score: 1, total: 5, percentage: 20 },
  ]);
  assert.ok(grammarReadingTie);
  assert.equal(grammarReadingTie.category, 'grammar');
  assert.equal(grammarReadingTie.hasTie, true);
  assert.equal(
    grammarReadingTie.tieContextMessage,
    'You have a few areas to work on, but Grammar is your most critical foundation right now. Fix this first.',
  );
  assert.deepEqual(grammarReadingTie.practiceTips, CATEGORY_PRACTICE_TIPS.grammar);

  // Perfect score -> null
  const perfect = buildPracticeFocus([
    { category: 'vocabulary', label: 'Vocabulary', score: 5, total: 5, percentage: 100 },
    { category: 'grammar', label: 'Grammar', score: 5, total: 5, percentage: 100 },
    { category: 'reading', label: 'Reading', score: 5, total: 5, percentage: 100 },
  ]);
  assert.equal(perfect, null);
});

test('Aggregated Round 2 STATE GREEN (True Ready): total >= 24 and all subscores >= 6', () => {
  const rng = seededRng(21);
  const r1 = sampleQuizQuestions(questionBank, [], rng);
  const r2 = sampleQuizQuestions(questionBank, r1.nextUsedIds, rng);

  const a1 = buildAnswersForCounts(r1.questions, { vocabulary: 4, grammar: 3, reading: 5 });
  const a2 = buildAnswersForCounts(r2.questions, { vocabulary: 4, grammar: 3, reading: 5 });

  const result = calculateAggregatedQuizResult([
    { roundNumber: 1, questions: r1.questions, answers: a1 },
    { roundNumber: 2, questions: r2.questions, answers: a2 },
  ]);

  assert.equal(result.isAggregated, true);
  assert.equal(result.totalScore, 24);
  assert.equal(result.totalQuestions, 30);
  assert.equal(result.totalPercentage, 80);
  assert.equal(result.readinessState, 'green');
  assert.equal(result.readinessTitle, 'True Ready');
  assert.ok(result.practiceFocus);
  assert.equal(result.practiceFocus.category, 'grammar');
  assert.equal(result.practiceFocus.score, 6);
  assert.equal(result.practiceFocus.total, 10);
  assert.equal(result.practiceFocus.hasTie, false);
});

test('Aggregated Round 2 STATE YELLOW (Borderline) for 24+ total with bottleneck <= 5/10', () => {
  const rng = seededRng(23);
  const r1 = sampleQuizQuestions(questionBank, [], rng);
  const r2 = sampleQuizQuestions(questionBank, r1.nextUsedIds, rng);

  const a1 = buildAnswersForCounts(r1.questions, { vocabulary: 5, grammar: 3, reading: 5 });
  const a2 = buildAnswersForCounts(r2.questions, { vocabulary: 5, grammar: 2, reading: 4 });

  const result = calculateAggregatedQuizResult([
    { roundNumber: 1, questions: r1.questions, answers: a1 },
    { roundNumber: 2, questions: r2.questions, answers: a2 },
  ]);

  assert.equal(result.totalScore, 24);
  assert.equal(result.totalQuestions, 30);
  assert.equal(result.readinessState, 'yellow');
  assert.equal(result.readinessTitle, 'Borderline');
  assert.ok(result.practiceFocus);
  assert.equal(result.practiceFocus.category, 'grammar');
  assert.equal(result.practiceFocus.score, 5);
  assert.equal(result.practiceFocus.total, 10);
  assert.deepEqual(result.practiceFocus.practiceTips, CATEGORY_PRACTICE_TIPS.grammar);
});

test('Aggregated Round 2 STATE RED (Not Ready) applies tie-breaker when multiple categories tie lowest', () => {
  const rng = seededRng(27);
  const r1 = sampleQuizQuestions(questionBank, [], rng);
  const r2 = sampleQuizQuestions(questionBank, r1.nextUsedIds, rng);

  const a1 = buildAnswersForCounts(r1.questions, { vocabulary: 2, grammar: 4, reading: 2 });
  const a2 = buildAnswersForCounts(r2.questions, { vocabulary: 2, grammar: 4, reading: 2 });

  const result = calculateAggregatedQuizResult([
    { roundNumber: 1, questions: r1.questions, answers: a1 },
    { roundNumber: 2, questions: r2.questions, answers: a2 },
  ]);

  assert.equal(result.totalScore, 16);
  assert.equal(result.readinessState, 'red');
  assert.equal(result.readinessTitle, 'Not Ready');
  assert.ok(result.practiceFocus);
  // Vocabulary (4/10) ties with Reading (4/10) -> Vocabulary wins
  assert.equal(result.practiceFocus.category, 'vocabulary');
  assert.equal(result.practiceFocus.hasTie, true);
  assert.equal(
    result.practiceFocus.tieContextMessage,
    'You have a few areas to work on, but Vocabulary is your most critical foundation right now. Fix this first.',
  );
  assert.deepEqual(result.practiceFocus.practiceTips, CATEGORY_PRACTICE_TIPS.vocabulary);
});
