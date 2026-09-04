import type { Metadata } from "next";
import "./globals.css";
import UniversalHeader from "@/components/UniversalHeader";
import UniversalFooter from "@/components/UniversalFooter";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL('https://mindmatrix-studio.vercel.app'),
  title: {
    default: 'MindMatrix Studio — Free Brain Training Games',
    template: '%s | MindMatrix Studio',
  },
  description:
    'Free, browser-based brain training tools. No sign-up, no subscription, no servers — spatial memory, focus, and logic games that run entirely in your browser.',
  openGraph: {
    title: 'MindMatrix Studio — Free Brain Training Games',
    description:
      'Free, browser-based brain training tools. No sign-up, no subscription required.',
    url: 'https://mindmatrix-studio.vercel.app',
    siteName: 'MindMatrix Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindMatrix Studio — Free Brain Training Games',
    description:
      'Free, browser-based brain training tools. No sign-up, no subscription required.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UniversalHeader />
        {children}
        <UniversalFooter />
        <Analytics />
      </body>
    </html>
  );
}