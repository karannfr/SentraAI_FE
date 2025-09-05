import type { Metadata } from 'next';
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.js Chat',
  description: 'A ChatGPT-like interface built with Next.js and Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          /* Basic TailwindCSS-like reset */
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

