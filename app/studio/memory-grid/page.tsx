'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STREAK_KEY = 'mindmatrix-streak';
const STREAK_EVENT = 'mindmatrix:streak-updated';
const BEST_TIME_KEY = 'mindmatrix-memory-grid-besttime';
const BEST_MOVES_KEY = 'mindmatrix-memory-grid-bestmoves';

// 8 pairs = 16 cards = 4x4 grid. Each symbol appears exactly twice.
const SYMBOLS = ['🌙', '⭐', '🔥', '🌊', '🍀', '⚡', '🎯', '🧩'];

type Phase = 'idle' | 'playing' | 'won';

interface CardData {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface StreakData {
  count: number;
  lastDate: string;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function updateDailyStreak(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const todayStr = toDateStr(today);
    const yesterdayStr = toDateStr(yesterday);

    const raw = window.localStorage.getItem(STREAK_KEY);
    let data: StreakData = raw ? (JSON.parse(raw) as StreakData) : { count: 0, lastDate: '' };

    if (data.lastDate === todayStr) {
      // already counted today
    } else if (data.lastDate === yesterdayStr) {
      data = { count: data.count + 1, lastDate: todayStr };
    } else {
      data = { count: 1, lastDate: todayStr };
    }

    window.localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(STREAK_EVENT));
  } catch {
    // fail silently
  }
}

function readBest(key: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  return raw ? parseInt(raw, 10) : null;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(): CardData[] {
  const doubled = [...SYMBOLS, ...SYMBOLS];
  const shuffled = shuffle(doubled);
  return shuffled.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What cognitive skills does Memory Grid train?',
    answer:
      'Memory Grid primarily exercises visual working memory and associative recall — the ability to encode where specific items are located and retrieve that spatial-visual pairing later. It also engages selective attention, since ignoring already-matched or previously seen cards efficiently improves your move count.',
  },
  {
    question: 'What is a good move count to aim for?',
    answer:
      'With 8 pairs (16 cards), the mathematical minimum is 8 moves if you had perfect memory from the very first flip. Most players average between 14 and 22 moves on their first few attempts. Consistently finishing under 12 moves suggests strong visual working memory.',
  },
  {
    question: 'Is there a time limit?',
    answer:
      'No. Memory Grid tracks your time and move count for your own reference, but there is no countdown or penalty for taking your time. This keeps the exercise low-pressure and accessible, including for users who prefer a slower, more deliberate pace.',
  },
  {
    question: 'Are my best time and move count saved?',
    answer:
      'Yes, entirely in your browser. Your personal best time and lowest move count are saved locally via localStorage and will persist between visits on the same browser and device, with no account or sign-up required.',
  },
];

export default function MemoryGridPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setBestTime(readBest(BEST_TIME_KEY));
    setBestMoves(readBest(BEST_MOVES_KEY));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setCards(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setElapsedMs(0);
    setPhase('playing');
    lockRef.current = false;

    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 250);
  }, []);

  const handleCardClick = useCallback(
    (id: number) => {
      if (phase !== 'playing' || lockRef.current) return;

      const clickedCard = cards.find((c) => c.id === id);
      if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
      if (flippedIds.length === 2) return;

      const newFlippedIds = [...flippedIds, id];
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));
      setFlippedIds(newFlippedIds);

      if (newFlippedIds.length === 2) {
        lockRef.current = true;
        setMoves((m) => m + 1);
        const [firstId, secondId] = newFlippedIds;
        const firstCard = cards.find((c) => c.id === firstId);
        const secondCard = clickedCard;

        if (firstCard && secondCard.symbol === firstCard.symbol) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
              )
            );
            setFlippedIds([]);
            lockRef.current = false;
          }, 400);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
              )
            );
            setFlippedIds([]);
            lockRef.current = false;
          }, 800);
        }
      }
    },
    [phase, cards, flippedIds]
  );

  useEffect(() => {
    if (phase === 'playing' && cards.length > 0 && cards.every((c) => c.isMatched)) {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalTime = Date.now() - startTimeRef.current;
      setElapsedMs(finalTime);
      setPhase('won');
      updateDailyStreak();

      setBestTime((prev) => {
        if (prev === null || finalTime < prev) {
          window.localStorage.setItem(BEST_TIME_KEY, String(finalTime));
          return finalTime;
        }
        return prev;
      });
      setBestMoves((prev) => {
        if (prev === null || moves + 1 < prev) {
          window.localStorage.setItem(BEST_MOVES_KEY, String(moves + 1));
          return moves + 1;
        }
        return prev;
      });
    }
  }, [cards, phase, moves]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Memory Grid: Visual Pair Matching
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          A free, deterministic card-matching game. Flip two cards at a time, find every pair, and
          train your visual working memory — no timer pressure, no sign-up.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Moves
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{moves}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Time
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatTime(elapsedMs)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Best Time
          </div>
          <div className="text-2xl font-bold text-emerald-500" suppressHydrationWarning>
            {mounted && bestTime !== null ? formatTime(bestTime) : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Best Moves
          </div>
          <div className="text-2xl font-bold text-emerald-500" suppressHydrationWarning>
            {mounted && bestMoves !== null ? bestMoves : '—'}
          </div>
        </div>
      </div>

      {phase === 'idle' && (
        <div className="mx-auto mt-8 flex max-w-md justify-center">
          <button
            type="button"
            onClick={startGame}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700 active:scale-95"
          >
            Start Game
          </button>
        </div>
      )}

      {phase !== 'idle' && (
        <div className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-2 sm:gap-3">
          {cards.map((card) => {
            const showSymbol = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={phase !== 'playing' || card.isMatched}
                aria-label={showSymbol ? `Card showing ${card.symbol}` : 'Hidden card'}
                className={`flex aspect-square items-center justify-center rounded-lg border-2 text-2xl transition-all duration-200 sm:text-3xl ${
                  card.isMatched
                    ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                    : showSymbol
                    ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10'
                    : 'border-slate-300 bg-slate-100 hover:border-indigo-400 hover:bg-indigo-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500 dark:hover:bg-slate-700'
                }`}
              >
                {showSymbol ? card.symbol : ''}
              </button>
            );
          })}
        </div>
      )}

      {phase === 'won' && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-bold text-slate-900 dark:text-white">
            Solved in {moves} moves and {formatTime(elapsedMs)}!
          </p>
          <button
            type="button"
            onClick={startGame}
            className="mt-3 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700 active:scale-95"
          >
            Play Again
          </button>
        </div>
      )}

      <article className="prose prose-slate mx-auto mt-16 max-w-3xl dark:prose-invert">
        <h2>Visual Working Memory and Associative Recall</h2>
        <p>
          Card-matching games like Memory Grid are one of the most accessible and widely studied
          formats for training visual working memory — the mental system responsible for briefly
          holding and manipulating visual information. Unlike verbal working memory, which relies
          heavily on inner speech and language centers, visual working memory depends more on the
          occipital and parietal regions of the brain associated with processing shape, color, and
          spatial location. Every time you flip a card and try to remember both what you saw and
          where you saw it, you are actively exercising this system.
        </p>
        <p>
          What makes matching games particularly effective as a training tool is the requirement
          for associative recall: you are not simply memorizing isolated facts, but binding two
          pieces of information together — a symbol and a location — into a single retrievable
          unit. This binding process, sometimes called relational memory, is a distinct cognitive
          skill from simple recognition memory, and it is one of the memory functions most
          sensitive to age-related decline, which is part of why matching-style exercises are
          frequently used in cognitive assessments for older adults.
        </p>
        <h3>Why Move Count Matters More Than Speed</h3>
        <p>
          Memory Grid intentionally does not impose a time limit or countdown. Cognitive training
          research suggests that time pressure can push players toward guessing rather than
          genuine recall, which weakens the actual memory-strengthening effect of the exercise.
          Instead, Memory Grid measures your move count as the primary skill indicator: the fewer
          moves it takes you to find every pair, the more accurately your visual memory encoded
          and retained each card's identity and position on your very first look at it.
        </p>
        <p>
          With 8 pairs on the board, the mathematically perfect outcome is 8 total moves — meaning
          every single flip results in an immediate match. In practice, this is extremely rare
          even for highly trained players, because it requires perfect first-pass encoding of all
          16 card positions. A more realistic benchmark for strong performance is finishing in the
          12-to-16 move range, which indicates that most pairs were recalled correctly after only
          one or two exposures.
        </p>
        <h3>The Strategy Layer: Search Patterns and Chunking</h3>
        <p>
          Beyond raw memory capacity, skilled players tend to develop a systematic search strategy
          rather than flipping cards randomly. Common effective strategies include scanning the
          grid in a consistent order (left-to-right, top-to-bottom) on your first pass to build an
          initial mental map, and mentally chunking the board into smaller sub-regions (such as
          quadrants) rather than trying to hold all 16 positions as a single undifferentiated set.
          Chunking is a well-documented memory technique that reduces cognitive load by grouping
          individual items into fewer, larger units, and it transfers directly to real-world
          memory tasks such as remembering multi-digit numbers or complex instructions.
        </p>
        <h3>A Low-Pressure, High-Frequency Training Tool</h3>
        <p>
          Because a single round of Memory Grid typically takes only one to three minutes to
          complete, it is well suited to frequent, short practice sessions — the format most
          strongly associated with measurable cognitive improvement over time, compared to
          occasional long sessions. Combined with the daily streak tracker built into this site,
          Memory Grid is designed to fit naturally into a short daily routine: a quick break
          between tasks, a few minutes before bed, or a mental warm-up first thing in the morning.
          Every session's data, including your best time and lowest move count, is saved privately
          to your own device the moment you finish, so your personal progress is always visible
          without requiring any account or ongoing subscription.
        </p>
      </article>

      <section className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.question}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}