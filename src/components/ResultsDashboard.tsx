import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  FileText,
  Home,
  Languages,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { QuestionCategory, QuizResult } from '../types/quiz';

interface ResultsDashboardProps {
  result: QuizResult;
  roundNumber: number;
  onStartNextRound: () => void;
  onRestartFresh: () => void;
  onGoHome: () => void;
}

const CATEGORY_META: Record<
  QuestionCategory,
  {
    icon: typeof BookOpen;
    iconBg: string;
    focusTitle: string;
  }
> = {
  vocabulary: {
    icon: BookOpen,
    iconBg: 'bg-[#ffc233]/25 text-[#181c7b]',
    focusTitle: 'A little more vocabulary practice',
  },
  grammar: {
    icon: Languages,
    iconBg: 'bg-[#2328be]/12 text-[#2328be]',
    focusTitle: 'Strengthening your grammar foundations',
  },
  reading: {
    icon: FileText,
    iconBg: 'bg-[#2328be]/12 text-[#2328be]',
    focusTitle: 'Sharpening your reading comprehension',
  },
};

export function ResultsDashboard({
  result,
  roundNumber,
  onStartNextRound,
  onRestartFresh,
  onGoHome,
}: ResultsDashboardProps) {
  const {
    isAggregated,
    readinessState,
    readinessTitle,
    readinessHeadline,
    readinessMessage,
    totalScore,
    totalQuestions,
    totalPercentage,
    practiceFocus,
  } = result;

  const stateTheme = {
    green: {
      topBar: 'bg-emerald-600',
      ringStroke: '#059669',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      cardShadow: 'shadow-[0_16px_38px_-12px_#0000001a]',
      Icon: CheckCircle2,
    },
    yellow: {
      topBar: 'bg-[#ffc233]',
      ringStroke: '#ffc233',
      badgeBg: 'bg-[#ffc233]/20 text-[#181c7b] border-[#ffc233]',
      cardShadow: 'shadow-[0_16px_38px_-10px_#ffc6364d]',
      Icon: AlertTriangle,
    },
    red: {
      topBar: 'bg-rose-600',
      ringStroke: '#e11d48',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      cardShadow: 'shadow-[0_16px_38px_-12px_#0000001a]',
      Icon: Sparkles,
    },
  }[readinessState];

  const StatusIcon = stateTheme.Icon;
  const isFinalRoundCompleted = roundNumber >= 2 || isAggregated;
  const perCategoryTotal = result.categoryScores[0]?.total ?? 5;

  // Circular SVG progress ring math
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (totalPercentage / 100) * circumference;

  const FocusIcon = practiceFocus ? CATEGORY_META[practiceFocus.category].icon : Award;
  const focusMeta = practiceFocus ? CATEGORY_META[practiceFocus.category] : null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
      {/* Snapshot Intro Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-[#071b36]/65 uppercase">
            <Compass className="h-3.5 w-3.5 text-[#2328be]" aria-hidden="true" />
            <span>
              {isAggregated
                ? 'Combined Round 1 & Round 2 Diagnostic'
                : 'A little clarity for your big next step'}
            </span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#181c7b] sm:text-3xl">
            {isAggregated ? 'True Readiness Report' : 'Your readiness snapshot'}
          </h1>
        </div>
        <span className="rounded-xl border border-[#181c7b]/12 bg-[#f7f7f5] px-3.5 py-1.5 text-xs font-medium text-[#181c7b] tabular-nums">
          {isAggregated ? 'Rounds 1 & 2 combined (30 questions)' : `Round ${roundNumber} complete`}
        </span>
      </div>

      {/* Verdict Card */}
      <section
        aria-labelledby="readiness-verdict"
        className={`animate-fade-up overflow-hidden rounded-2xl border border-[#181c7b]/10 bg-white ${stateTheme.cardShadow}`}
      >
        <div className={`h-1.5 w-full ${stateTheme.topBar}`} aria-hidden="true" />

        <div className="flex flex-col gap-8 p-6 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${stateTheme.badgeBg}`}
            >
              <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{readinessTitle}</span>
            </span>

            <h2
              id="readiness-verdict"
              className="mt-4 text-balance text-2xl font-semibold leading-tight tracking-tight text-[#181c7b] sm:text-4xl sm:leading-[1.16]"
            >
              {readinessHeadline}
            </h2>

            <p className="mt-3 text-base font-normal leading-relaxed text-[#071b36]/80 sm:text-lg">
              {readinessMessage}
            </p>
          </div>

          {/* Circular Score Ring */}
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 132 132" aria-hidden="true">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#f7f7f5"
                  strokeWidth="10"
                />
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke={stateTheme.ringStroke}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-semibold text-[#181c7b] tabular-nums">
                  {totalScore}
                  <span className="text-base font-medium text-[#071b36]/55">/{totalQuestions}</span>
                </span>
                <span className="mt-0.5 text-xs font-medium text-[#071b36]/70 tabular-nums">
                  {totalPercentage}% correct
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#181c7b]/8 bg-[#f7f7f5]/50 px-6 py-3.5 text-xs font-normal text-[#071b36]/70 sm:px-9">
          <span className="tabular-nums">{totalQuestions} calibrated questions</span>
          <span aria-hidden="true">·</span>
          <span>3 skill areas</span>
          <span aria-hidden="true">·</span>
          <span>
            {isAggregated
              ? 'Aggregated across Round 1 & Round 2'
              : 'Calibrated Goethe A1 benchmark'}
          </span>
        </div>
      </section>

      {/* Three Skill Areas Card */}
      <section
        aria-labelledby="section-breakdown-heading"
        className="rounded-2xl border border-[#181c7b]/10 bg-white p-6 shadow-[0_10px_28px_-10px_#0000001a] sm:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium tracking-wider text-[#071b36]/60 uppercase">
              A closer look
            </p>
            <h2
              id="section-breakdown-heading"
              className="mt-1 text-xl font-semibold tracking-tight text-[#181c7b]"
            >
              Your three skill areas
            </h2>
          </div>
          <p className="text-xs font-medium text-[#071b36]/65 tabular-nums">
            Out of {perCategoryTotal} each
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {result.categoryScores.map((cat) => {
            const meta = CATEGORY_META[cat.category];
            const Icon = meta.icon;

            const weakLimit = cat.total === 10 ? 5 : 2;
            const borderlineLimit = cat.total === 10 ? 7 : 3;

            let cardSurface = 'border-[#181c7b]/10 bg-[#f7f7f5]/45';
            let barFill = 'bg-[#2328be]';
            let statusText = 'Looking good';
            let statusColor = 'text-emerald-700';

            if (cat.score <= weakLimit) {
              cardSurface = 'border-[#ffc233]/70 bg-[#ffc233]/10';
              barFill = 'bg-[#ffc233]';
              statusText = 'A nice place to grow';
              statusColor = 'text-[#9a6700]';
            } else if (cat.score <= borderlineLimit) {
              cardSurface = 'border-[#ffc233]/45 bg-[#f7f7f5]';
              barFill = 'bg-[#ffc233]';
              statusText = 'Steady, room to sharpen';
              statusColor = 'text-[#9a6700]';
            }

            return (
              <div
                key={cat.category}
                className={`flex flex-col justify-between rounded-2xl border p-5 ${cardSurface}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold text-[#181c7b]">{cat.label}</h3>
                  </div>
                  <span className="text-base font-semibold text-[#181c7b] tabular-nums">
                    {cat.score}/{cat.total}
                  </span>
                </div>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full border border-[#181c7b]/10 bg-white">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${barFill}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs font-medium">
                  <span className={statusColor}>{statusText}</span>
                  <span className="text-[#071b36]/70 tabular-nums">{cat.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Actionable Practice Focus Section (Single Weakest Category, Strictly 3 Tips) */}
      <section aria-labelledby="practice-focus-heading" className="space-y-4">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#071b36]/60 uppercase">
            Practice Focus
          </p>
          <h2
            id="practice-focus-heading"
            className="mt-0.5 text-xl font-semibold tracking-tight text-[#181c7b]"
          >
            Your #1 priority before exam day
          </h2>
        </div>

        {!practiceFocus || !focusMeta ? (
          <div className="flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/75 p-6 shadow-[0_10px_28px_-10px_#0000001a]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Award className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[#181c7b]">
                Zero mistakes across all three modules
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#071b36]/85">
                {isFinalRoundCompleted
                  ? 'You answered every single Vocabulary, Grammar, and Reading question accurately across both rounds (30/30).'
                  : 'You answered every single Vocabulary, Grammar, and Reading question accurately. Take Round 2 below to confirm your consistency on a fresh set of questions.'}
              </p>
            </div>
          </div>
        ) : (
          <article className="rounded-2xl border border-[#181c7b]/10 bg-white p-6 shadow-[0_10px_28px_-10px_#0000001a] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${focusMeta.iconBg}`}
                >
                  <FocusIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium tracking-wider text-[#9a6700] uppercase">
                    A good place to focus · {practiceFocus.label}
                  </p>
                  <h3 className="mt-0.5 text-lg font-semibold text-[#181c7b] sm:text-xl">
                    {focusMeta.focusTitle}
                  </h3>
                </div>
              </div>

              <span className="rounded-xl bg-[#f7f7f5] px-3 py-1.5 text-sm font-semibold text-[#2328be] tabular-nums">
                {practiceFocus.score}/{practiceFocus.total} ({practiceFocus.percentage}%)
              </span>
            </div>

            {/* Top: Exam Impact Warning Badge */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#ffc233] bg-[#ffc233]/15 px-4 py-3.5 text-sm font-medium text-[#181c7b]">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#181c7b]" aria-hidden="true" />
              <p>{practiceFocus.examImpact}</p>
            </div>

            {/* Middle: Tie-Breaker Context Message (shown only when a tie occurred) */}
            {practiceFocus.hasTie && practiceFocus.tieContextMessage && (
              <p className="mt-4 text-sm italic leading-relaxed text-[#071b36]/80">
                {practiceFocus.tieContextMessage}
              </p>
            )}

            {/* Bottom: Exactly 3 Broad Practice Tips */}
            <div className="mt-5 border-t border-[#181c7b]/8 pt-5">
              <p className="text-xs font-medium tracking-wider text-[#071b36]/60 uppercase">
                2–3 things to practice
              </p>
              <ol className="mt-3 space-y-3">
                {practiceFocus.practiceTips.map((tip, index) => (
                  <li key={tip} className="flex items-start gap-3 text-sm leading-relaxed text-[#071b36]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2328be]/10 text-xs font-semibold text-[#2328be] tabular-nums">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        )}
      </section>

      {/* Round 2 Verification Hook OR Both Sets Completed State */}
      {isFinalRoundCompleted ? (
        <section
          aria-labelledby="both-rounds-complete-heading"
          className="rounded-2xl border border-[#181c7b]/12 bg-[#f7f7f5] p-7 shadow-[0_10px_28px_-10px_#0000001a] sm:p-9"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2328be]/10 text-[#2328be]">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="max-w-xl">
                <h2
                  id="both-rounds-complete-heading"
                  className="text-xl font-semibold tracking-tight text-[#181c7b] sm:text-2xl"
                >
                  You&apos;ve completed both fresh question sets.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#071b36]/80 sm:text-base">
                  You&apos;ve now had a look at all 45 questions in the bank. Use what felt tricky
                  as your next study focus.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onRestartFresh}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#181c7b]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#181c7b] transition-colors hover:bg-[#181c7b]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Retake Round 1</span>
              </button>
              <button
                type="button"
                onClick={onGoHome}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#2328be] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e23a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] whitespace-nowrap cursor-pointer"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="round-two-heading"
          className="rounded-2xl bg-[#2328be] p-7 text-white shadow-[0_14px_34px_-8px_#2328be55] sm:p-9"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 id="round-two-heading" className="text-xl font-semibold sm:text-2xl">
                Confirm Your Exam Readiness
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
                A single test is a great start, but taking a second round with fresh questions gives
                you complete confidence in your score.
              </p>
            </div>

            <button
              type="button"
              onClick={onStartNextRound}
              className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-[#d19700] bg-[#ffc233] px-6 py-3.5 text-sm font-semibold text-[#181c7b] shadow-[0_10px_26px_-6px_#ffc636] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[#ffcb4d] active:translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc233] sm:text-base whitespace-nowrap cursor-pointer"
            >
              <span>Verify My Score (Round 2)</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
