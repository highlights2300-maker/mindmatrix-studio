import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | MindMatrix Studio',
  description:
    'MindMatrix Studio privacy policy: 100% client-side brain training tools with zero account data collection, localStorage-only progress tracking, and third-party advertising cookie disclosures.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: January 2025</p>

      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <h2>1. Our Core Privacy Principle: Local-First Processing</h2>
        <p>
          MindMatrix Studio is architected as a 100% client-side application. Every brain-training
          tool, game engine, timer, and scoring system runs entirely inside your web browser using
          JavaScript. We do not operate a backend database, we do not use user accounts, and we do
          not require sign-ups or logins of any kind to use any tool on this site.
        </p>

        <h2>2. What We Do Not Collect</h2>
        <p>We do not collect, transmit, or store on any server:</p>
        <ul>
          <li>Your name, email address, or any personally identifying information</li>
          <li>Your gameplay scores, session history, or performance statistics</li>
          <li>Your daily streak counts or practice history</li>
          <li>Any biometric, health, or cognitive assessment data</li>
        </ul>

        <h2>3. What Is Stored, and Where</h2>
        <p>
          To let you keep your high scores and daily streak between visits, MindMatrix Studio uses
          your browser&apos;s built-in <code>localStorage</code>. This data is written to and read
          from your device only. It is never transmitted to us or to any third party as part of our
          own functionality. You can clear this data at any time by clearing your browser&apos;s
          site data, using private/incognito browsing, or using the reset controls provided within
          individual tools.
        </p>

        <h2>4. Cookies and Third-Party Advertising</h2>
        <p>
          MindMatrix Studio may display advertisements served by third-party vendors, including
          Google, through the Google AdSense program. These vendors may use cookies, web beacons,
          or similar tracking technologies to serve ads based on your prior visits to this website
          or other websites. Google&apos;s use of advertising cookies enables it and its partners to
          serve ads based on your visit to this site and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting Google&apos;s Ads Settings, and
          you may opt out of third-party vendor use of cookies for personalized advertising by
          visiting{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            www.aboutads.info/choices
          </a>
          . We do not control third-party advertising cookies, and this policy does not extend to
          the data practices of advertising vendors, which are governed by their own privacy
          policies.
        </p>

        <h2>5. Analytics</h2>
        <p>
          We may use privacy-conscious, aggregate web analytics to understand overall traffic
          patterns (such as page views) in order to improve the site. Where analytics are used,
          they are configured to avoid collecting personally identifying information and are not
          combined with any gameplay data, which never leaves your device.
        </p>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          MindMatrix Studio is designed to be usable by teens, adults, and seniors. Because no
          account, name, email, or personal information is ever requested or required to use any
          tool, we do not knowingly collect personal information from children. Parents and
          guardians supervising younger users should be aware that any third-party advertising
          cookies described in Section 4 are governed by the advertiser&apos;s own policies.
        </p>

        <h2>7. Data Security</h2>
        <p>
          Because gameplay and progress data lives exclusively in your browser&apos;s local storage
          and is never transmitted to our servers, there is no central database of user data that
          could be exposed in a server-side breach. Your device&apos;s own security settings are the
          primary safeguard for this locally stored data.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our tools or
          legal requirements. The &quot;Last updated&quot; date above will always reflect the most
          recent revision.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about this policy can be directed to us via the contact information on our{' '}
          <Link href="/about">About page</Link>.
        </p>
      </div>
    </main>
  );
}