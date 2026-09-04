import Link from 'next/link';

const TOOL_LINKS = [
  { label: 'Focus Matrix', href: '/studio/focus-matrix' },
  { label: 'Memory Grid', href: '/studio/memory-grid' },
  { label: 'Reaction Lab', href: '/studio/reaction-lab' },
  { label: 'Word Recall', href: '/studio/word-recall' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function UniversalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-indigo-600 dark:text-indigo-400">Mind</span>
              <span className="text-emerald-500 dark:text-emerald-400">Matrix</span>
              <span className="ml-1 font-medium text-slate-500 dark:text-slate-400">Studio</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-slate-600 dark:text-slate-400">
              Free, browser-based brain training for teens, adults, and seniors. No sign-ups, no
              subscriptions, no servers — every session runs entirely on your device.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
              Brain Studio Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
              Local-First Privacy
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>✓ No account or sign-up required</li>
              <li>✓ Scores stored only in your browser&apos;s localStorage</li>
              <li>✓ No gameplay data is ever sent to a server</li>
              <li>✓ Clear all data anytime via your browser settings</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500 sm:flex-row">
          <p>&copy; {year} MindMatrix Studio. All rights reserved.</p>
          <p>100% client-side. $0 server cost. Built for every mind, every age.</p>
        </div>
      </div>
    </footer>
  );
}