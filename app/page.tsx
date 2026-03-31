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
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<{ saved: number; duplicates: number } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) router.replace('/login');
        else setUser(data.user);
        setAuthLoading(false);
      });
  }, [router]);

  async function handleIngest() {
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const data = await res.json();
      setIngestResult(data.total);
    } finally {
      setIngesting(false);
    }
  }

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
          <div>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 리포트 링크 */}
            <Link
              href="/reports"
              className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
            >
              📊 {t('weeklyReports')}
            </Link>

            {/* 데이터 수집 (오너만) */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {ingestResult && (
                  <span className="text-xs text-green-600">
                    +{ingestResult.saved} 저장, {ingestResult.duplicates} 중복
                  </span>
                )}
                <button
                  onClick={handleIngest}
                  disabled={ingesting}
                  className="flex items-center gap-1.5 text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
                >
                  {ingesting ? <Spinner size="sm" /> : <span>↓</span>}
                  {ingesting ? t('ingesting') : t('ingest')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 좌: AI 브리핑 */}
          <div className="lg:col-span-1">
            <DailyBriefPanel />
          </div>

          {/* 우: 메모 */}
          <div className="lg:col-span-2">
            <MemoPanel isOwner={isOwner} />
          </div>
        </div>

        {/* 하단 그리드: 이메일 + 슬랙 + 캘린더 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmailPanel />
          <SlackPanel />
          <CalendarPanel />
        </div>
      </main>
    </div>
  );
}
