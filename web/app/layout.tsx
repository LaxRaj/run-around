import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'run-around — every run, a new loop',
  description:
    'Generate dynamic round-trip running routes from your exact GPS location. Pick your distance, pick your difficulty, and go.',
  openGraph: {
    title: 'run-around',
    description: 'Every run, a new loop.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
