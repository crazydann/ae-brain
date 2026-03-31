'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { WeeklyReportCard } from '@/components/reports/WeeklyReportCard';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';
import Link from 'next/link';
import type { SessionUser } from '@/lib/auth';
import type { WeeklyIntelligence } from '@/lib/supabase';

export default function ReportsPage() {
  const { t } = useLang();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [reports, setReports] = useState<WeeklyIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) router.replace('/login');
        else setUser(data.user);
      });

    fetch('/api/reports')
      .then(r => r.json())
      .then(data => { setReports(data.reports || []); setLoading(false); });
  }, [router]);

  async function generateReport() {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/weekly-report', { method: 'POST' });
      const data = await res.json();
      if (data.report) {
        setReports(prev => [data.report, ...prev.filter(r => r.week_label !== data.report.week_label)]);
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userName={user?.name} role={user?.role} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-sm text-blue-600 hover:underline">{t('backToDashboard')}</Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1">📊 {t('reports')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">누적 주간 인텔리전스 — 삭제 없이 계속 쌓입니다</p>
          </div>

          {user?.role === 'owner' && (
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? <><Spinner size="sm" />{t('generating')}</> : `✨ ${t('generateReport')}`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p>{t('noReports')}</p>
            {user?.role === 'owner' && (
              <p className="text-sm mt-2">위 버튼으로 이번 주 리포트를 생성해보세요.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map(report => (
              <WeeklyReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
