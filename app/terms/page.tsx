import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | MindMatrix Studio',
  description:
    'Terms of Service for MindMatrix Studio, a free, browser-based, client-side brain training platform with no accounts, no gambling mechanics, and no financial interest calculations.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: January 2025</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using MindMatrix Studio (&quot;the Service&quot;), you agree to be bound
          by these Terms of Service. If you do not agree to these terms, please discontinue use of
          the Service.
        </p>

        <h2>2. Description of the Service</h2>
        <p>
          MindMatrix Studio provides free, browser-based cognitive training tools, including
          pattern recognition, memory, reaction-time, and word-recall exercises. All tools execute
          entirely within your browser using client-side JavaScript. No account, subscription, or
          payment is required to access any tool.
        </p>

        <h2>3. No Gambling or Chance-Based Mechanics</h2>
        <p>
          All tools on MindMatrix Studio are strictly deterministic and skill-based. The Service
          does not include, and will never include, mystery boxes, randomized reward wheels, loot
          mechanics, or any feature that awards outcomes based on chance rather than user skill or
          performance.
        </p>

        <h2>4. No Interest-Based Financial Calculations</h2>
        <p>
          Where the Service includes any planning or growth-tracking tools, such tools are limited
          strictly to equity, contribution, and asset-growth style calculations. The Service does
          not calculate, display, or promote debt interest, APR, or similar interest-based
          financial mechanics.
        </p>

        <h2>5. Not Medical or Diagnostic Advice</h2>
        <p>
          MindMatrix Studio&apos;s tools are provided for general cognitive exercise, engagement,
          and entertainment purposes only. They are not medical devices and are not intended to
          diagnose, treat, cure, or prevent any disease or cognitive condition, including dementia
          or Alzheimer&apos;s disease. Always consult a qualified healthcare professional regarding
          any cognitive health concerns.
        </p>

        <h2>6. Local Data and No Account Responsibility</h2>
        <p>
          Because the Service does not use accounts, all scores, streaks, and progress are stored
          only in your browser&apos;s local storage as described in our{' '}
          <Link href="/privacy">Privacy Policy</Link>. You are solely responsible for backing up or
          preserving this data; clearing your browser data, switching devices, or using private
          browsing will reset your locally stored progress. We are not responsible for any loss of
          locally stored data.
        </p>

        <h2>7. Advertising</h2>
        <p>
          The Service may be supported by third-party advertising, including through Google
          AdSense. Advertisements are served by third parties, and MindMatrix Studio is not
          responsible for the content, accuracy, or practices of advertisers or their linked sites.
        </p>

        <h2>8. Acceptable Use</h2>
        <p>
          You agree not to misuse the Service, including by attempting to disrupt its
          functionality, scrape or republish its content without permission, or use automated
          systems to interact with the tools in a manner inconsistent with normal human use.
        </p>

        <h2>9. Intellectual Property</h2>
        <p>
          All software, design, text, and educational content on MindMatrix Studio is the
          property of MindMatrix Studio or its licensors and is protected by applicable
          intellectual property laws. You may use the Service for personal, non-commercial
          cognitive training purposes.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
          of any kind, express or implied, including but not limited to accuracy, reliability, or
          fitness for a particular purpose.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, MindMatrix Studio shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of, or inability to
          use, the Service.
        </p>

        <h2>12. Changes to These Terms</h2>
        <p>
          We may revise these Terms from time to time. Continued use of the Service after changes
          are posted constitutes acceptance of the revised Terms.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions about these Terms can be directed to us via the contact information on our{' '}
          <Link href="/about">About page</Link>.
        </p>
      </div>
    </main>
  );
}