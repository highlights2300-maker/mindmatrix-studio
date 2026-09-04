'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const STREAK_KEY = 'mindmatrix-streak';
const STREAK_EVENT = 'mindmatrix:streak-updated';
const HIGH_SCORE_KEY = 'mindmatrix-focus-matrix-highscore';

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const STARTING_SEQUENCE_LENGTH = 3;

type Phase = 'idle' | 'showing' | 'input' | 'round-success' | 'gameover';

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
      // Already counted today, no change.
    } else if (data.lastDate === yesterdayStr) {
      data = { count: data.count + 1, lastDate: todayStr };
    } else {
      data = { count: 1, lastDate: todayStr };
    }

    window.localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(STREAK_EVENT));
  } catch {
    // localStorage may be unavailable; fail silently.
  }
}

function readHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

function generateSequence(length: number): number[] {
  const seq: number[] = [];
  let last = -1;
  for (let i = 0; i < length; i++) {
    let next = Math.floor(Math.random() * TOTAL_CELLS);
    while (next === last) {
      next = Math.floor(Math.random() * TOTAL_CELLS);
    }
    seq.push(next);
    last = next;
  }
  return seq;
}

function flashDurationForLevel(level: number): number {
  return Math.max(280, 750 - level * 35);
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does the Focus Matrix improve spatial memory?',
    answer:
      'Each round forces your brain to encode a sequence of grid positions, hold that sequence in working memory, and then retrieve it in the correct order. This encode-hold-retrieve cycle is the same mechanism used in clinical spatial span tests, and repeating it regularly is associated with stronger visuospatial working memory over time.',
  },
  {
    question: 'What is a good starting level for beginners?',
    answer:
      'Everyone starts at Level 1 with a 3-cell sequence. Most new users comfortably reach Level 4-6 within their first few sessions. If you find yourself losing focus after Level 3, try shorter, more frequent sessions rather than one long session — recall accuracy is more strongly tied to attention than to raw memory capacity.',
  },
  {
    question: 'Is my score or progress saved anywhere online?',
    answer:
      'No. The Focus Matrix runs entirely in your browser. Your current level, high score, and daily streak are saved only in your browser\'s local storage on your own device — nothing is uploaded to a server or shared with a third party as part of the game\'s own functionality.',
  },
  {
    question: 'Why does the flash speed get faster at higher levels?',
    answer:
      'Increasing presentation speed at higher levels intentionally raises the load on executive function, not just memory. It forces faster visual processing and quicker encoding, which better reflects real-world tasks like driving or multitasking, where information must be processed under time pressure rather than at your own pace.',
  },
];

export default function FocusMatrixPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [totalClicks, setTotalClicks] = useState(0);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const lastClickTimestamp = useRef<number>(0);

  const cancelRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setHighScore(readHighScore());
  }, []);

  const playSequence = useCallback(async (seq: number[]) => {
    cancelRef.current = false;
    const duration = flashDurationForLevel(level);
    await new Promise((r) => setTimeout(r, 500));

    for (let i = 0; i < seq.length; i++) {
      if (cancelRef.current) return;
      setActiveCell(seq[i]);
      await new Promise((r) => setTimeout(r, duration));
      if (cancelRef.current) return;
      setActiveCell(null);
      await new Promise((r) => setTimeout(r, Math.max(120, duration * 0.35)));
    }

    if (cancelRef.current) return;
    lastClickTimestamp.current = Date.now();
    setPhase('input');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const startGame = useCallback(() => {
    setLevel(1);
    setTotalClicks(0);
    setCorrectClicks(0);
    setReactionTimes([]);
    const seq = generateSequence(STARTING_SEQUENCE_LENGTH);
    setSequence(seq);
    setUserInput([]);
    setPhase('showing');
  }, []);

  const startNextRound = useCallback((nextLevel: number) => {
    const seq = generateSequence(STARTING_SEQUENCE_LENGTH + (nextLevel - 1));
    setSequence(seq);
    setUserInput([]);
    setPhase('showing');
  }, []);

  useEffect(() => {
    if (phase === 'showing') {
      playSequence(sequence);
    }
    return () => {
      cancelRef.current = true;
    };
  }, [phase, sequence, playSequence]);

  const endGame = useCallback((finalLevel: number) => {
    cancelRef.current = true;
    setPhase('gameover');
    const roundsCompleted = finalLevel - 1;
    setHighScore((prev) => {
      if (roundsCompleted > prev) {
        window.localStorage.setItem(HIGH_SCORE_KEY, String(roundsCompleted));
        return roundsCompleted;
      }
      return prev;
    });
    updateDailyStreak();
  }, []);

  const handleCellClick = useCallback(
    (cellIndex: number) => {
      if (phase !== 'input') return;

      const now = Date.now();
      const reactionMs = now - lastClickTimestamp.current;
      lastClickTimestamp.current = now;

      const expectedIndex = userInput.length;
      const isCorrect = sequence[expectedIndex] === cellIndex;

      setTotalClicks((c) => c + 1);
      setReactionTimes((r) => [...r, reactionMs]);

      if (!isCorrect) {
        endGame(level);
        return;
      }

      setCorrectClicks((c) => c + 1);
      const nextInput = [...userInput, cellIndex];
      setUserInput(nextInput);

      if (nextInput.length === sequence.length) {
        setPhase('round-success');
        const nextLevel = level + 1;
        setTimeout(() => {
          setLevel(nextLevel);
          startNextRound(nextLevel);
        }, 700);
      }
    },
    [phase, sequence, userInput, level, endGame, startNextRound]
  );

  const accuracy = totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0;
  const avgReaction =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  const statusText: Record<Phase, string> = {
    idle: 'Press Start to begin the sequence.',
    showing: 'Watch closely...',
    input: 'Repeat the sequence — click the cells in order.',
    'round-success': 'Correct! Loading next level...',
    gameover: 'Sequence broken.',
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Focus Matrix: Spatial Logic Engine
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          A free, deterministic spatial-sequence memory trainer. No sign-up, no timer pressure to
          start — just click Start and train your visuospatial working memory.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Level
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{level}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            High Score
          </div>
          <div className="text-2xl font-bold text-emerald-500" suppressHydrationWarning>
            {mounted ? highScore : 0}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Accuracy
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{accuracy}%</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Avg Reaction
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgReaction > 0 ? `${avgReaction}ms` : '—'}
          </div>
        </div>
      </div>

      <p
        className="mx-auto mt-6 max-w-2xl text-center text-sm font-semibold text-slate-600 dark:text-slate-300"
        aria-live="polite"
      >
        {statusText[phase]}
      </p>

      <div className="mx-auto mt-4 grid max-w-md grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
          const isActive = activeCell === i;
          const isClickable = phase === 'input';
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleCellClick(i)}
              disabled={!isClickable}
              aria-label={`Grid cell ${i + 1}`}
              className={`aspect-square rounded-lg border-2 transition-all duration-150 ${
                isActive
                  ? 'scale-95 border-indigo-500 bg-indigo-500 shadow-lg shadow-indigo-500/50'
                  : isClickable
                  ? 'border-slate-300 bg-slate-100 hover:border-indigo-400 hover:bg-indigo-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500 dark:hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
              }`}
            />
          );
        })}
      </div>

      <div className="mx-auto mt-8 flex max-w-md justify-center gap-3">
        {(phase === 'idle' || phase === 'gameover') && (
          <button
            type="button"
            onClick={startGame}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700 active:scale-95"
          >
            {phase === 'gameover' ? 'Play Again' : 'Start Training'}
          </button>
        )}
      </div>

      {phase === 'gameover' && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-bold text-slate-900 dark:text-white">
            Final result: Level {level} — {level - 1} rounds completed
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Accuracy: {accuracy}% · Avg reaction: {avgReaction > 0 ? `${avgReaction}ms` : '—'}
          </p>
        </div>
      )}

      <article className="prose prose-slate mx-auto mt-16 max-w-3xl dark:prose-invert">
        <h2>Spatial Memory and Executive Function: Why This Exercise Matters</h2>
        <p>
          Spatial memory is the cognitive system responsible for encoding, storing, and recalling
          information about the position of objects and locations in an environment. It is one of
          the oldest and most heavily studied forms of working memory, and it plays a far larger
          role in everyday life than most people realize. Remembering where you parked your car,
          navigating a building you have visited only once, mentally rotating furniture to see if
          it will fit through a doorway, and recalling the layout of a grocery store all draw on
          the same underlying spatial memory circuitry centered on the hippocampus and parietal
          cortex.
        </p>
        <p>
          The Focus Matrix exercise on this page is a deliberately simplified, gamified version of
          the spatial span tasks used in cognitive psychology research, most notably the Corsi
          Block-Tapping Test. In the classic version of that test, a participant watches a
          researcher tap a sequence of blocks arranged on a board, then must reproduce the same
          sequence from memory. Performance on this task correlates strongly with visuospatial
          working memory capacity and has been used for decades to assess cognitive function
          across age groups, from children to older adults recovering from injury.
        </p>
        <h3>The Role of Executive Function</h3>
        <p>
          While spatial memory handles the storage of location information, executive function is
          the broader set of mental processes that control how that information is used. Executive
          function includes inhibitory control (ignoring distractions), cognitive flexibility
          (switching between mental tasks), and working memory management (holding and
          manipulating information over short periods). The Focus Matrix specifically challenges
          working memory management: as the sequence grows longer with each level, you must hold
          an increasing number of spatial positions in mind simultaneously while also preparing to
          execute a precise motor response — clicking the cells in the correct order.
        </p>
        <p>
          The increasing flash speed at higher levels adds a second executive demand: processing
          speed under time pressure. Real-world tasks rarely allow unlimited time to observe
          information before acting. Whether you are merging into traffic, following a live
          conversation, or tracking a fast-moving sports play, your brain must encode spatial and
          sequential information quickly and reliably. Training with a shrinking presentation
          window helps build tolerance for exactly this kind of cognitive load.
        </p>
        <h3>Why Deterministic, Skill-Based Design Matters</h3>
        <p>
          Every sequence in the Focus Matrix is generated using a straightforward
          random-cell-selection algorithm, but this randomness only determines which cells you
          need to remember — it never introduces chance into your outcome. Your success or failure
          is determined entirely by whether you correctly recall and reproduce the sequence you
          were shown. There are no random rewards, no probability-based bonuses, and no mechanics
          that could resemble a game of chance. This design choice keeps the focus squarely on
          measurable skill development rather than variable, chance-driven reinforcement.
        </p>
        <h3>How to Get the Most Out of Regular Practice</h3>
        <p>
          Cognitive training research generally supports short, frequent practice sessions over
          long, infrequent ones. A few minutes on the Focus Matrix each day is more likely to
          produce noticeable improvement in your spatial span than a single hour-long session once
          a week. The daily streak tracker built into this site is designed to support that
          rhythm: it rewards consistency, not intensity, and every completed session — win or lose
          — is saved locally the moment you finish a round. Because everything runs client-side in
          your browser with no account required, there is zero friction between deciding to
          practice and actually starting a session, which removes one of the biggest barriers to
          building a sustainable cognitive training habit.
        </p>
        <p>
          As you progress through levels, pay attention not just to your level reached but to your
          accuracy and average reaction time, both shown above the grid. A high level reached with
          low accuracy suggests you may be relying on guessing near the end of long sequences,
          while a lower level with high accuracy and fast reaction times suggests strong, reliable
          encoding. Balancing these two qualities — reach and precision — is the real goal of
          spatial memory training, and tracking both over time gives you a far more complete
          picture of your progress than a single score ever could.
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