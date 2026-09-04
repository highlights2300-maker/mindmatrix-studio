import type { Metadata } from "next";
import "./globals.css";
import UniversalHeader from "@/components/UniversalHeader";
import UniversalFooter from "@/components/UniversalFooter";

export const metadata: Metadata = {
  title: "MindMatrix Studio — Free Brain Training Games",
  description:
    "Free, browser-based brain training tools. No sign-up, no subscription, no servers — spatial memory, focus, and logic games that run entirely in your browser.",
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
      </body>
    </html>
  );
}