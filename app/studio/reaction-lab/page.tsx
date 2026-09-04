'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STREAK_KEY = 'mindmatrix-streak';
const STREAK_EVENT = 'mindmatrix:streak-updated';
const BEST_AVG_KEY = 'mindmatrix-reaction-lab-bestavg';
const ROUNDS_PER_SESSION = 5;
const MIN_DELAY_MS = 1200;
const MAX_DELAY_MS = 4000;

type Phase = 'idle' | 'waiting' | 'ready' | 'too-soon' | 'result' | 'session-complete';

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

function readBestAvg(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(BEST_AVG_KEY);
  return raw ? parseInt(raw, 10) : null;
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function ratingForTime(ms: number): { label: string; color: string } {
  if (ms < 200) return { label: 'Lightning', color: 'text-emerald-500' };
  if (ms < 250) return { label: 'Excellent', color: 'text-emerald-500' };
  if (ms < 300) return { label: 'Great', color: 'text-indigo-500' };
  if (ms < 400) return { label: 'Good', color: 'text-indigo-500' };
  if (ms < 500) return { label: 'Average', color: 'text-amber-500' };
  return { label: 'Keep Practicing', color: 'text-amber-500' };
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is a good average reaction time?',
    answer:
      'The average human visual reaction time is typically between 250ms and 300ms. Trained individuals, including many competitive gamers and athletes, often average closer to 200ms. Reaction times under 150ms usually indicate an anticipated response (a guess) rather than a true reaction to the visual stimulus.',
  },
  {
    question: 'Why do I get a "Too Soon" result sometimes?',
    answer:
      'A "Too Soon" result means you clicked before the target actually appeared, which means you were anticipating rather than reacting. This is excluded from your average because it does not reflect a genuine response to a visual stimulus — the goal is to measure how quickly your brain processes and responds to something unpredictable, not how well you can guess timing.',
  },
  {
    question: 'Does reaction time actually reflect brain health?',
    answer:
      'Reaction time is one of the most well-established proxy measures for processing speed, a core component of overall cognitive function. Simple reaction time tasks like this one are widely used in psychological and clinical research because they isolate the speed of sensory processing and motor response from more complex reasoning, making them a clean, repeatable benchmark you can track over time.',
  },
  {
    question: 'Can I improve my reaction time with practice?',
    answer:
      'Yes, to a meaningful degree. While there is a biological floor determined by nerve conduction speed, most people can meaningfully reduce their average reaction time through consistent practice, better sleep, reduced fatigue, and minimizing distractions during the test. Regular short sessions tend to produce more consistent improvement than occasional long ones.',
  },
];

export default function ReactionLabPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [bestAvg, setBestAvg] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyTimestamp = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    setBestAvg(readBestAvg());
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scheduleReady = useCallback(() => {
    setPhase('waiting');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      readyTimestamp.current = Date.now();
      setPhase('ready');
    }, randomDelay());
  }, []);

  const startSession = useCallback(() => {
    setRound(0);
    setTimes([]);
    setLastTime(null);
    scheduleReady();
  }, [scheduleReady]);

  const handleZoneClick = useCallback(() => {
    if (phase === 'waiting') {
      // Clicked too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase('too-soon');
      return;
    }

    if (phase === 'ready') {
      const reactionMs = Date.now() - readyTimestamp.current;
      setLastTime(reactionMs);
      const newTimes = [...times, reactionMs];
      setTimes(newTimes);

      if (newTimes.length >= ROUNDS_PER_SESSION) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        setPhase('session-complete');
        updateDailyStreak();
        setBestAvg((prev) => {
          if (prev === null || avg < prev) {
            window.localStorage.setItem(BEST_AVG_KEY, String(avg));
            return avg;
          }
          return prev;
        });
      } else {
        setRound((r) => r + 1);
        setPhase('result');
      }
      return;
    }

    if (phase === 'idle') {
      startSession();
      return;
    }

    if (phase === 'too-soon' || phase === 'session-complete') {
      startSession();
    }
  }, [phase, times, startSession]);

  const handleNextRound = useCallback(() => {
    scheduleReady();
  }, [scheduleReady]);

  const currentAvg =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const zoneConfig: Record<Phase, { bg: string; text: string; label: string }> = {
    idle: {
      bg: 'bg-indigo-600 hover:bg-indigo-700',
      text: 'text-white',
      label: 'Click to Start',
    },
    waiting: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: 'Wait for green...',
    },
    ready: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      label: 'Click now!',
    },
    'too-soon': {
      bg: 'bg-amber-500',
      text: 'text-white',
      label: 'Too soon! Click to try again',
    },
    result: {
      bg: 'bg-indigo-600 hover:bg-indigo-700',
      text: 'text-white',
      label: 'Click for next round',
    },
    'session-complete': {
      bg: 'bg-indigo-600 hover:bg-indigo-700',
      text: 'text-white',
      label: 'Click to play again',
    },
  };

  const zone = zoneConfig[phase];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Reaction Lab: Processing Speed Trainer
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          A free, precise reaction-time test. Wait for the signal, click as fast as you can, and
          track your processing speed across 5 rounds — no sign-up, no timer pressure to start.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Round
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {phase === 'idle' ? '—' : `${Math.min(round + 1, ROUNDS_PER_SESSION)}/${ROUNDS_PER_SESSION}`}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Last Time
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {lastTime !== null ? `${lastTime}ms` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Session Avg
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {currentAvg > 0 ? `${currentAvg}ms` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Best Avg
          </div>
          <div className="text-2xl font-bold text-emerald-500" suppressHydrationWarning>
            {mounted && bestAvg !== null ? `${bestAvg}ms` : '—'}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <button
          type="button"
          onClick={phase === 'result' ? handleNextRound : handleZoneClick}
          className={`flex h-64 w-full select-none items-center justify-center rounded-2xl text-2xl font-bold shadow-lg transition-colors duration-150 sm:h-80 sm:text-3xl ${zone.bg} ${zone.text}`}
        >
          {zone.label}
        </button>
      </div>

      {phase === 'session-complete' && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-bold text-slate-900 dark:text-white">
            Session average: {currentAvg}ms —{' '}
            <span className={ratingForTime(currentAvg).color}>{ratingForTime(currentAvg).label}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Individual times: {times.join('ms, ')}ms
          </p>
        </div>
      )}

      <article className="prose prose-slate mx-auto mt-16 max-w-3xl dark:prose-invert">
        <h2>Processing Speed: The Foundation of Cognitive Performance</h2>
        <p>
          Processing speed refers to the amount of time it takes your brain to receive
          information, interpret it, and initiate a physical response. It is one of the most
          fundamental building blocks of overall cognitive function, because nearly every complex
          mental task — reading comprehension, decision-making, driving, sports performance, even
          following a fast-paced conversation — depends on how quickly your nervous system can
          move from sensory input to motor output. Reaction Lab measures a specific, well-defined
          slice of this ability known as simple visual reaction time.
        </p>
        <p>
          Simple reaction time tasks like this one are among the oldest and most rigorously
          studied paradigms in experimental psychology, dating back over a century. Their appeal
          lies in their simplicity: because there is only one possible stimulus (the screen turning
          green) and only one possible response (clicking), the task isolates raw processing
          speed from more complex decision-making. This is different from choice reaction time
          tasks, which require you to select between multiple possible responses and therefore
          measure decision speed in addition to raw processing speed.
        </p>
        <h3>What a "Good" Reaction Time Actually Looks Like</h3>
        <p>
          Human visual simple reaction time typically falls between 200 and 300 milliseconds for
          most healthy adults, with well-trained individuals — competitive gamers, certain
          athletes, and pilots, for example — sometimes averaging closer to 150 to 200
          milliseconds. Reaction times faster than roughly 100 to 150 milliseconds usually indicate
          an anticipated click rather than a genuine reaction, since human nerve conduction and
          muscle response alone typically require more time than that to complete the full
          sensory-to-motor pathway. This is exactly why Reaction Lab flags early clicks as "Too
          Soon" and excludes them from your average — an anticipated guess is not a measurement of
          true processing speed.
        </p>
        <h3>Why the Random Delay Matters</h3>
        <p>
          The delay before the screen turns green is deliberately randomized within a range each
          round, rather than fixed. If the delay were predictable, players would naturally begin
          timing their clicks based on rhythm or memorized duration rather than genuinely reacting
          to the visual signal, which would defeat the purpose of the exercise. By keeping the
          delay unpredictable within a set window, Reaction Lab ensures that every recorded time
          genuinely reflects your nervous system's response to an unexpected visual change —
          closely mirroring real-world scenarios like braking for a pedestrian who steps into the
          road unexpectedly, or reacting to a sudden change during a fast-paced task.
        </p>
        <h3>Factors That Influence Your Results Session to Session</h3>
        <p>
          Reaction time is sensitive to a range of temporary factors, which is part of why your
          results may vary noticeably between sessions even without any change in your underlying
          cognitive ability. Fatigue, sleep quality, caffeine intake, screen brightness, input
          device (touchscreen versus mouse versus trackpad), and even ambient distractions can all
          shift your measured reaction time by tens of milliseconds. For this reason, tracking your
          personal best average over many sessions, rather than judging yourself on any single
          round, provides a much more reliable picture of your baseline processing speed and how
          it may be improving with consistent practice.
        </p>
        <h3>Practical Ways to Improve</h3>
        <p>
          While there is a biological floor to how fast any human nervous system can respond,
          determined by factors like nerve conduction velocity, most people have meaningful room
          to improve their measured reaction time through consistent practice. Improvements often
          come not from making individual neurons fire faster, but from reducing hesitation,
          building familiarity with the specific task format, and minimizing mental noise or
          overthinking in the moment of response. Regular short practice sessions, adequate sleep,
          and testing in a distraction-free environment are the most evidence-backed ways to see
          steady improvement in your average over time.
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