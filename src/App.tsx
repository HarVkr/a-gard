/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import questionBankJson from '../resources/45-questions-bank-2_bb0ff086.json';
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

const QUESTION_BANK = questionBankJson as RawQuestion[];

export default function App() {
  const [screen, setScreen] = useState<Screen>('hero');
  const [roundNumber, setRoundNumber] = useState(1);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  const autostartHandledRef = useRef(false);

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
    if (autostartHandledRef.current || QUESTION_BANK.length === 0) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      autostartHandledRef.current = true;
      startRound(QUESTION_BANK, [], 1);
    }
  }, [startRound]);

  const handleStartFirstCheck = () => {
    if (QUESTION_BANK.length === 0) return;
    startRound(QUESTION_BANK, [], 1);
  };

  const handleStartNextRound = () => {
    if (QUESTION_BANK.length === 0) return;
    startRound(QUESTION_BANK, usedIds, roundNumber + 1);
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
        isLoading={false}
        onStart={handleStartFirstCheck}
        onGoHome={handleGoHome}
      />

      {screen === 'hero' && (
        <HeroSection
          onStart={handleStartFirstCheck}
          isLoading={false}
          loadError={null}
          onRetryLoad={() => undefined}
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
        Gard · Goethe Readiness Diagnostic (Goethe-Zertifikat A1)
      </footer>
    </div>
  );
}
