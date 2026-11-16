import { ArrowUpRight, Compass, RotateCcw } from 'lucide-react';

interface HeaderProps {
  screen: 'hero' | 'quiz' | 'results';
  roundNumber: number;
  isLoading: boolean;
  onStart: () => void;
  onGoHome: () => void;
}

export function Header({
  screen,
  roundNumber,
  isLoading,
  onStart,
  onGoHome,
}: HeaderProps) {
  return (
    <header className="w-full border-b border-[#181c7b]/10 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-5 py-4 sm:px-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={onGoHome}
          className="group flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2328be] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Globio home"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2328be] text-white shadow-[0_4px_12px_-2px_#2328be44] transition-transform duration-150 group-hover:scale-105"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" />
              <path
                d="M3.8 12H20.2M12 3.5C14.5 6.1 15.8 9 15.8 12C15.8 15 14.5 17.9 12 20.5C9.5 17.9 8.2 15 8.2 12C8.2 9 9.5 6.1 12 3.5Z"
                stroke="#ffc233"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xl font-semibold tracking-tight text-[#181c7b]">globio.</span>
        </button>

        {/* Zone 2: Clean single-line navigation / journey context */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#071b36]/80"
        >
          {screen === 'hero' ? (
            <>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-[#2328be] whitespace-nowrap shrink-0"
              >
                How it works
              </a>
              <a
                href="#skill-areas"
                className="transition-colors hover:text-[#2328be] whitespace-nowrap shrink-0"
              >
                Skill areas
              </a>
              <span className="inline-flex items-center gap-1.5 text-[#181c7b] font-semibold whitespace-nowrap shrink-0">
                <Compass className="h-4 w-4 text-[#2328be]" aria-hidden="true" />
                Your German journey starts here
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-2 text-[#181c7b] font-semibold whitespace-nowrap shrink-0 tabular-nums">
              <Compass className="h-4 w-4 text-[#2328be]" aria-hidden="true" />
              <span>Your German journey starts here · Round {roundNumber}</span>
            </span>
          )}
        </nav>

        {/* Zone 3: Single contextual primary/secondary action */}
        <div className="flex items-center shrink-0">
          {screen === 'hero' ? (
            <button
              type="button"
              onClick={onStart}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#181c7b]/15 bg-white px-4 py-2 text-sm font-semibold text-[#181c7b] shadow-[0_4px_12px_-4px_#0000001a] transition-all duration-150 hover:border-[#2328be] hover:text-[#2328be] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Try a free check</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#181c7b]/15 bg-[#f7f7f5] px-4 py-2 text-sm font-semibold text-[#181c7b] transition-colors duration-150 hover:bg-[#181c7b]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2328be] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
