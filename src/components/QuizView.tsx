import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Languages,
  Lock,
  Send,
  XCircle,
} from 'lucide-react';
import type { AnswerMap, QuestionCategory, QuizQuestion } from '../types/quiz';
import { CATEGORY_LABELS } from '../utils/quizLogic';

interface QuizViewProps {
  questions: QuizQuestion[];
  answers: AnswerMap;
  roundNumber: number;
  onSelectOption: (questionId: string, option: string) => void;
  onSubmitTest: () => void;
}

const CATEGORY_ICONS: Record<QuestionCategory, typeof BookOpen> = {
  vocabulary: BookOpen,
  grammar: Languages,
  reading: FileText,
};

export function QuizView({
  questions,
  answers,
  roundNumber,
  onSelectOption,
  onSubmitTest,
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAnimatedId, setLastAnimatedId] = useState<string | null>(null);
  const [incompleteWarning, setIncompleteWarning] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.reduce(
    (count, q) => (answers[q.id] !== undefined ? count + 1 : count),
    0,
  );
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (!currentQuestion) {
    return null;
  }

  const CategoryIcon = CATEGORY_ICONS[currentQuestion.category];
  const selectedAnswer = answers[currentQuestion.id];
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && selectedAnswer === currentQuestion.correct_answer;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const firstUnansweredIndex = questions.findIndex((q) => answers[q.id] === undefined);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setLastAnimatedId(currentQuestion.id);
    setIncompleteWarning(false);
    onSelectOption(currentQuestion.id, option);
  };

  const handlePrevious = () => {
    setIncompleteWarning(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIncompleteWarning(false);
    setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  };

  const handleSubmit = () => {
    if (answeredCount < totalQuestions) {
      setIncompleteWarning(true);
      return;
    }
    onSubmitTest();
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-7 sm:px-8 sm:py-10">
      {/* Top Progress Header */}
      <section aria-label="Quiz progress" className="w-full">
        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-[#181c7b]">
          <span className="tabular-nums">
            Round {roundNumber} · {answeredCount} of {totalQuestions} answered
          </span>
          <span className="text-[#2328be] tabular-nums">{Math.round(progressPercent)}%</span>
        </div>

        <div
          className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full border border-[#181c7b]/10 bg-[#f7f7f5]"
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-label="Answered questions progress"
        >
          <div
            className="h-full rounded-full bg-[#2328be] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Step Strip */}
        <nav
          aria-label="Question navigator"
          className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))]"
        >
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const answered = ans !== undefined;
            const correct = answered && ans === q.correct_answer;
            const isCurrent = idx === currentIndex;

            let stepStyle =
              'border-[#181c7b]/15 bg-white text-[#071b36]/70 hover:border-[#2328be]/50';
            if (answered && correct) {
              stepStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800';
            } else if (answered && !correct) {
              stepStyle = 'border-rose-400 bg-rose-50 text-rose-800';
            }

            if (isCurrent) {
              stepStyle += ' ring-2 ring-[#2328be] ring-offset-1 font-semibold';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setIncompleteWarning(false);
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to question ${idx + 1}${answered ? (correct ? ', answered correctly' : ', answered incorrectly') : ', unanswered'}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex h-9 w-full items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-colors cursor-pointer sm:h-8 ${stepStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </nav>
      </section>

      {/* Main Question Card */}
      <section
        aria-labelledby="question-prompt"
        className="mt-6 rounded-2xl border border-[#181c7b]/10 bg-[#f7f7f5] p-6 shadow-[0_12px_30px_-8px_#0000001a] sm:p-9"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold tracking-wide text-[#071b36]/70">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#2328be] shadow-xs">
              <CategoryIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="tabular-nums">Question {currentIndex + 1} of {totalQuestions}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#2328be]">{CATEGORY_LABELS[currentQuestion.category]}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#071b36]/60">
            {isAnswered ? (
              <>
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Answer locked</span>
              </>
            ) : (
              <span>Single attempt</span>
            )}
          </span>
        </div>

        <h2
          id="question-prompt"
          className="mt-5 text-xl font-semibold leading-snug text-[#181c7b] sm:text-2xl"
        >
          {currentQuestion.question_german}
        </h2>

        <p className="mt-2.5 text-sm italic leading-relaxed text-[#071b36]/75 sm:text-base">
          {currentQuestion.question_english_hint}
        </p>

        {currentQuestion.image_url && !failedImages[currentQuestion.id] && (
          <div
            key={currentQuestion.id}
            className="mt-5 overflow-hidden rounded-2xl border border-[#181c7b]/10 bg-white p-2.5 shadow-[0_6px_18px_-6px_#00000014]"
          >
            <img
              src={currentQuestion.image_url}
              alt="Visual clue for this vocabulary question"
              loading="eager"
              onError={() =>
                setFailedImages((prev) => ({
                  ...prev,
                  [currentQuestion.id]: true,
                }))
              }
              className="mx-auto max-h-56 w-auto max-w-full rounded-xl object-contain sm:max-h-64"
            />
          </div>
        )}

        {/* Answer Options */}
        <div className="mt-6 grid grid-cols-1 gap-3.5" role="group" aria-label="Answer options">
          {currentQuestion.shuffledOptions.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isOptionCorrect = option === currentQuestion.correct_answer;
            const shouldAnimateThis = lastAnimatedId === currentQuestion.id;

            let cardClasses =
              'border-2 border-b-4 border-[#d9dce6] bg-white text-[#181c7b] hover:border-[#2328be] hover:bg-[#2328be]/[0.03] active:translate-y-0.5 cursor-pointer';
            let statusLabel: string | null = null;
            let animClass = '';

            if (isAnswered) {
              if (isOptionCorrect) {
                cardClasses =
                  'border-2 border-b-4 border-emerald-500 bg-emerald-50 text-emerald-950 cursor-default';
                statusLabel = 'Correct';
                if (isSelected && shouldAnimateThis) {
                  animClass = 'animate-option-success';
                }
              } else if (isSelected && !isOptionCorrect) {
                cardClasses =
                  'border-2 border-b-4 border-rose-500 bg-rose-50 text-rose-950 cursor-default';
                statusLabel = 'Incorrect';
                if (shouldAnimateThis) {
                  animClass = 'animate-option-shake';
                }
              } else {
                cardClasses =
                  'border-2 border-[#e5e7eb] bg-white/65 text-[#071b36]/45 cursor-default';
              }
            }

            const optionLetter = String.fromCharCode(65 + idx);

            return (
              <button
                key={option}
                type="button"
                disabled={isAnswered}
                onClick={() => handleOptionClick(option)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] ${cardClasses} ${animClass}`}
              >
                <span className="flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums ${
                      isAnswered && isOptionCorrect
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected && !isOptionCorrect
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#f7f7f5] text-[#181c7b]'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-base font-medium leading-snug">{option}</span>
                </span>

                {isAnswered && isOptionCorrect && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 shrink-0 whitespace-nowrap">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    <span>{statusLabel}</span>
                  </span>
                )}

                {isAnswered && isSelected && !isOptionCorrect && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 shrink-0 whitespace-nowrap">
                    <XCircle className="h-5 w-5" aria-hidden="true" />
                    <span>{statusLabel}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Note */}
        {isAnswered && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-5 rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${
              isCorrect
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
                : 'border-rose-200 bg-rose-50/80 text-rose-950'
            }`}
          >
            <p className="font-semibold">
              {isCorrect
                ? 'Nicely done — that is correct.'
                : `Not quite — the correct answer is "${currentQuestion.correct_answer}".`}
            </p>
            <p className="mt-1 text-[#071b36]/85">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Incomplete Submit Warning */}
        {incompleteWarning && firstUnansweredIndex !== -1 && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ffc233] bg-[#ffc233]/15 px-4 py-3 text-sm text-[#181c7b]"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#181c7b]" aria-hidden="true" />
              Please answer all {totalQuestions} questions before submitting (
              {totalQuestions - answeredCount} remaining).
            </span>
            <button
              type="button"
              onClick={() => {
                setIncompleteWarning(false);
                setCurrentIndex(firstUnansweredIndex);
              }}
              className="rounded-lg bg-[#2328be] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e23a8] whitespace-nowrap cursor-pointer"
            >
              Jump to Question {firstUnansweredIndex + 1}
            </button>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#181c7b]/10 pt-5">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#181c7b]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#181c7b] transition-colors hover:bg-[#181c7b]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Previous</span>
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-b-4 border-[#181c7b] bg-[#2328be] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-4px_#2328be55] transition-transform hover:bg-[#1e23a8] active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] whitespace-nowrap cursor-pointer"
            >
              <span>Submit Test</span>
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-b-4 border-[#181c7b] bg-[#2328be] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-4px_#2328be44] transition-transform hover:bg-[#1e23a8] active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] whitespace-nowrap cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
