/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { QuizView } from './components/QuizView';
import { ResultsDashboard } from './components/ResultsDashboard';
import type { AnswerMap, CompletedRound, QuizQuestion, RawQuestion } from './types/quiz';
import {
  calculateAggregatedQuizResult,
  calculateQuizResult,
  sampleQuizQuestions,
} from './utils/quizLogic';

type Screen = 'hero' | 'quiz' | 'results';

const QUESTIONS_DATASET_URL = '/assets/aistudio/45-questions-bank-2_bb0ff086.json';

export default function App() {
  const [bank, setBank] = useState<RawQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [screen, setScreen] = useState<Screen>('hero');
  const [roundNumber, setRoundNumber] = useState(1);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  const autostartHandledRef = useRef(false);

  const loadQuestionBank = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(QUESTIONS_DATASET_URL);
      if (!response.ok) {
        throw new Error(`Unable to load question bank (${response.status})`);
      }
      const data: unknown = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Question bank is empty or invalid.');
      }
      setBank(data as RawQuestion[]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestionBank();
  }, [loadQuestionBank]);

  const startRound = useCallback(
    (sourceBank: RawQuestion[], currentUsedIds: string[], nextRoundNumber: number) => {
      const sampled = sampleQuizQuestions(sourceBank, currentUsedIds);
      setQuestions(sampled.questions);
      setUsedIds(sampled.nextUsedIds);
      setAnswers({});
      if (nextRoundNumber === 1 || sampled.poolReset) {
        setCompletedRounds([]);
        setRoundNumber(1);
      } else {
        setRoundNumber(nextRoundNumber);
      }
      setScreen('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [],
  );

  useEffect(() => {
    if (autostartHandledRef.current || isLoading || bank.length === 0) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      autostartHandledRef.current = true;
      startRound(bank, [], 1);
    }
  }, [bank, isLoading, startRound]);

  const handleStartFirstCheck = () => {
    if (bank.length === 0) return;
    startRound(bank, [], 1);
  };

  const handleStartNextRound = () => {
    if (bank.length === 0) return;
    startRound(bank, usedIds, roundNumber + 1);
  };

  const handleGoHome = () => {
    setScreen('hero');
    setQuestions([]);
    setAnswers({});
    setUsedIds([]);
    setCompletedRounds([]);
    setRoundNumber(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => {
      if (prev[questionId] !== undefined) {
        return prev;
      }
      return { ...prev, [questionId]: option };
    });
  };

  const handleSubmitTest = () => {
    setCompletedRounds((prev) => {
      const filtered = prev.filter((r) => r.roundNumber !== roundNumber);
      return [...filtered, { roundNumber, questions, answers }];
    });
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const result = useMemo(() => {
    if (screen !== 'results' || questions.length === 0) {
      return null;
    }
    if (completedRounds.length >= 2) {
      return calculateAggregatedQuizResult(completedRounds);
    }
    return calculateQuizResult(questions, answers);
  }, [screen, questions, answers, completedRounds]);

  return (
    <div
      className="flex min-h-screen flex-col bg-white text-[#181c7b]"
      data-screen={screen}
      data-round={roundNumber}
    >
      <Header
        screen={screen}
        roundNumber={roundNumber}
        isLoading={isLoading}
        onStart={handleStartFirstCheck}
        onGoHome={handleGoHome}
      />

      {screen === 'hero' && (
        <HeroSection
          onStart={handleStartFirstCheck}
          isLoading={isLoading}
          loadError={loadError}
          onRetryLoad={() => void loadQuestionBank()}
        />
      )}

      {screen === 'quiz' && (
        <QuizView
          key={`round-${roundNumber}-${questions[0]?.id ?? 'empty'}`}
          questions={questions}
          answers={answers}
          roundNumber={roundNumber}
          onSelectOption={handleSelectOption}
          onSubmitTest={handleSubmitTest}
        />
      )}

      {screen === 'results' && result && (
        <ResultsDashboard
          result={result}
          roundNumber={roundNumber}
          onStartNextRound={handleStartNextRound}
          onRestartFresh={handleStartFirstCheck}
          onGoHome={handleGoHome}
        />
      )}

      <footer className="mt-auto border-t border-[#181c7b]/10 bg-white py-5 text-center text-xs text-[#071b36]/60">
        Globio · Goethe-Zertifikat A1 Readiness Diagnostic
      </footer>
    </div>
  );
}
