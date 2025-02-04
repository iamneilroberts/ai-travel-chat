import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Travel Assistant',
  description: 'Your personal AI travel planner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200`}>
        <div className="fixed top-4 right-16 z-50">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
