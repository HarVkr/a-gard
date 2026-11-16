import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
  isLoading: boolean;
  loadError: string | null;
  onRetryLoad: () => void;
}

const FEATURE_STRIP = [
  {
    title: '15 questions',
    subtitle: 'Just the right amount',
    icon: HelpCircle,
  },
  {
    title: '3 skill areas',
    subtitle: 'Words, grammar & reading',
    icon: BookOpen,
  },
  {
    title: 'Honest results',
    subtitle: 'Know where you stand',
    icon: Compass,
  },
  {
    title: 'A fresh start',
    subtitle: 'Round 2 ready anytime',
    icon: RefreshCw,
  },
];

const MONOGRAMS = [
  { letter: 'R', bg: 'bg-emerald-100 text-emerald-900' },
  { letter: 'A', bg: 'bg-[#ffc233]/35 text-[#181c7b]' },
  { letter: 'S', bg: 'bg-[#2328be]/15 text-[#2328be]' },
  { letter: 'M', bg: 'bg-[#f7f7f5] text-[#071b36]' },
];

export function HeroSection({
  onStart,
  isLoading,
  loadError,
  onRetryLoad,
}: HeroSectionProps) {
  return (
    <main className="flex w-full flex-1 flex-col">
      {/* Split Hero Section */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Copy & Primary CTA */}
        <div className="animate-fade-up lg:col-span-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#2328be] uppercase">
            <Sparkles className="h-4 w-4 text-[#ffc233]" aria-hidden="true" />
            <span>A small step toward Germany · Goethe-Zertifikat A1</span>
          </div>

          <h1 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-[#181c7b] sm:text-5xl">
            Are you actually ready for the{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span>Goethe A1 exam?</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 280 14"
                fill="none"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full"
              >
                <path
                  d="M3 10.5C72 3.5 198 2.5 277 8.5"
                  stroke="#ffc233"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#071b36]/80 sm:text-lg">
            Don&apos;t risk your crucial time and the ₹10,000 exam fee. Take our 5-minute
            diagnostic check to see your true exam readiness across Vocabulary, Grammar, and
            Reading.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4">
            {loadError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4">
                <p className="text-sm font-medium text-rose-900">{loadError}</p>
                <button
                  type="button"
                  onClick={onRetryLoad}
                  className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#2328be] px-5 py-2.5 text-sm font-semibold text-white transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  Retry Loading Questions
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStart}
                disabled={isLoading}
                className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-2xl border-b-4 border-[#181c7b] bg-[#2328be] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-6px_#2328be55] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.015] hover:bg-[#1e23a8] active:translate-y-0.5 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2328be] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg whitespace-nowrap cursor-pointer"
              >
                <span>{isLoading ? 'Loading Diagnostic...' : 'Start Readiness Check'}</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#071b36]/70 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#2328be]" aria-hidden="true" />
                About 5 minutes
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#2328be]" aria-hidden="true" />
                No sign-up needed
              </span>
              <span aria-hidden="true">·</span>
              <span>100% free</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3.5 border-t border-[#181c7b]/10 pt-6">
            <div className="flex -space-x-2 shrink-0" aria-hidden="true">
              {MONOGRAMS.map((m) => (
                <span
                  key={m.letter}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold ${m.bg}`}
                >
                  {m.letter}
                </span>
              ))}
            </div>
            <p className="text-xs font-medium text-[#071b36]/75 sm:text-sm">
              Made for professionals building their{' '}
              <strong className="font-semibold text-[#181c7b]">next chapter in Germany.</strong>
            </p>
          </div>
        </div>

        {/* Right Column: Bespoke Framed Editorial Showcase Card */}
        <div className="relative lg:col-span-6">
          <div className="relative mx-auto max-w-lg rounded-[28px] border border-[#181c7b]/10 bg-white p-3 shadow-[0_22px_50px_-14px_#0000001a]">
            <div className="relative flex min-h-[370px] flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-[#181c7b] via-[#2328be] to-[#2e35d8] p-7 text-white sm:min-h-[410px]">
              {/* Subtle golden atmospheric glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#ffc233]/25 blur-2xl"
              />

              {/* Top location row */}
              <div className="relative z-10 flex items-center justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-[#ffc233]" aria-hidden="true" />
                  <span>Berlin, Germany</span>
                </span>
              </div>

              {/* Architectural Brandenburg Gate Vector Motif */}
              <svg
                aria-hidden="true"
                viewBox="0 0 420 180"
                fill="none"
                className="pointer-events-none absolute inset-x-0 bottom-20 mx-auto w-[92%] opacity-25"
              >
                <rect x="35" y="45" width="350" height="10" rx="2" fill="#ffc233" />
                <rect x="52" y="32" width="316" height="9" rx="2" fill="white" />
                <rect x="165" y="14" width="90" height="14" rx="3" fill="#ffc233" />
                <circle cx="210" cy="11" r="7" fill="white" />
                <rect x="55" y="59" width="22" height="110" rx="2" fill="white" />
                <rect x="115" y="59" width="22" height="110" rx="2" fill="white" />
                <rect x="175" y="59" width="22" height="110" rx="2" fill="white" />
                <rect x="223" y="59" width="22" height="110" rx="2" fill="white" />
                <rect x="283" y="59" width="22" height="110" rx="2" fill="white" />
                <rect x="343" y="59" width="22" height="110" rx="2" fill="white" />
                <rect x="25" y="166" width="370" height="6" rx="3" fill="#ffc233" />
              </svg>

              {/* Editorial Foreground Text */}
              <div className="relative z-10 mt-auto pt-24">
                <p className="text-xs font-semibold tracking-widest text-[#ffc233] uppercase">
                  Your future, in focus
                </p>
                <p className="mt-2 text-2xl font-semibold leading-snug text-white sm:text-3xl">
                  New country. New possibilities.
                </p>
                <p className="mt-1 text-xl font-semibold text-[#ffc233] sm:text-2xl">
                  Du schaffst das.
                </p>
              </div>
            </div>

            {/* Floating Micro-cards (positioned cleanly on desktop, stacked on mobile) */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-0 sm:block">
              <div className="flex items-center gap-3 rounded-2xl border border-[#181c7b]/10 bg-white px-4 py-3 shadow-[0_12px_28px_-6px_#0000001a] sm:absolute sm:-left-6 sm:top-10 sm:max-w-[235px]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffc233]/25 text-[#181c7b]">
                  <Zap className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#181c7b]">Your next chapter</p>
                  <p className="text-[11px] text-[#071b36]/75">Starts with a little confidence</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#181c7b]/10 bg-white px-4 py-3 shadow-[0_12px_28px_-6px_#0000001a] sm:absolute sm:-right-5 sm:bottom-10 sm:max-w-[235px]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#181c7b]">A little more ready</p>
                  <p className="text-[11px] text-[#071b36]/75">One question at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom 4-Column Feature Strip */}
      <section
        id="how-it-works"
        aria-label="How the readiness check works"
        className="w-full border-y border-[#181c7b]/8 bg-[#f7f7f5]"
      >
        <div
          id="skill-areas"
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-9 sm:grid-cols-2 sm:px-8 lg:grid-cols-4"
        >
          {FEATURE_STRIP.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#181c7b]/10 bg-white text-[#2328be] shadow-[0_4px_12px_-4px_#0000001a]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#181c7b]">{item.title}</p>
                  <p className="text-xs text-[#071b36]/75">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Closing Note */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-[#071b36]/75 sm:text-base">
          The Goethe A1 exam is a meaningful milestone. Take a breath, see what you already know,
          and find a kind, clear next step.
        </p>
        <button
          type="button"
          onClick={onStart}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2328be] transition-colors hover:text-[#181c7b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2328be] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Your new beginning starts here</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}
