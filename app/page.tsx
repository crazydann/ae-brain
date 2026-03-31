'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { DailyBriefPanel } from '@/components/panels/DailyBriefPanel';
import { EmailPanel } from '@/components/panels/EmailPanel';
import { SlackPanel } from '@/components/panels/SlackPanel';
import { CalendarPanel } from '@/components/panels/CalendarPanel';
import { MemoPanel } from '@/components/panels/MemoPanel';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';
import type { SessionUser } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const { t } = useLang();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) router.replace('/login');
        else setUser(data.user);
        setAuthLoading(false);
      });
  }, [router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const isOwner = user.role === 'owner';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userName={user.name} role={user.role} />

      <main className="max-w-screen-2xl mx-auto px-4 py-5 space-y-4">
        {/* 상단 바 */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          <Link
            href="/reports"
            className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
          >
            📊 {t('weeklyReports')}
          </Link>
        </div>

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <DailyBriefPanel />
          </div>
          <div className="lg:col-span-2">
            <MemoPanel isOwner={isOwner} />
          </div>
        </div>

        {/* 하단: 이메일 + 슬랙 + 캘린더 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmailPanel />
          <SlackPanel />
          <CalendarPanel />
        </div>
      </main>
    </div>
  );
}
