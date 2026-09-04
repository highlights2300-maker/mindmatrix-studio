import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | MindMatrix Studio',
  description:
    'MindMatrix Studio is a free, browser-based brain training platform built for teens, adults, and seniors — no sign-ups, no subscriptions, no servers.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        About MindMatrix Studio
      </h1>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <p>
          MindMatrix Studio was built on a simple idea: cognitive training tools that genuinely
          help people should not require a monthly subscription, a login, or your personal data.
          Every tool on this site runs entirely inside your browser — no accounts, no servers, and
          no cost to you, ever.
        </p>

        <h2>Why We Built This</h2>
        <p>
          Existing brain-training platforms like Lumosity and BrainHQ are backed by genuine
          cognitive science, but they lock most of their value behind paid subscriptions and
          require you to create an account just to try a single exercise. We believe the core
          exercises that support memory, focus, and executive function should be freely accessible
          to everyone — from students studying for exams, to working adults managing daily
          cognitive load, to seniors looking to keep their minds active.
        </p>

        <h2>Our Design Principles</h2>
        <ul>
          <li>
            <strong>Zero friction:</strong> no sign-up, no email, no password, ever. Open a tool
            and start immediately.
          </li>
          <li>
            <strong>100% client-side:</strong> every game runs as JavaScript in your browser. Your
            scores and streaks are saved only on your device via local storage.
          </li>
          <li>
            <strong>Skill-based, not chance-based:</strong> every exercise is fully deterministic.
            Outcomes are decided entirely by your performance — never by random rewards or chance
            mechanics.
          </li>
          <li>
            <strong>Accessible by design:</strong> our tools are built to work for a wide range of
            ages and abilities, including dark mode and ongoing accessibility improvements.
          </li>
        </ul>

        <h2>Who This Is For</h2>
        <p>
          MindMatrix Studio is designed for anyone who wants to exercise their mind: teens
          building study focus, adults looking for a quick mental warm-up during a work break, and
          seniors seeking accessible, low-pressure cognitive engagement. No tool on this site
          requires prior experience or specialized equipment — just a web browser.
        </p>

        <h2>Get in Touch</h2>
        <p>
          Have feedback, a bug report, or an idea for a new tool? We&apos;d love to hear it. Read
          more about how we handle data in our{' '}
          <Link href="/privacy">Privacy Policy</Link> and the rules governing use of the site in
          our <Link href="/terms">Terms of Service</Link>.
        </p>
      </div>
    </main>
  );
}