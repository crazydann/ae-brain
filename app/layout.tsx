import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'AE Brain - Amplitude Korea',
  description: 'Amplitude 한국 시장 AE 인텔리전스 대시보드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
