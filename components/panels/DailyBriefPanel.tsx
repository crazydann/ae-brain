'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';

interface Brief {
  focus: string[];
  followUps: string[];
  meetingPrep: string[];
  summary: string;
  generatedAt?: string;
}

export function DailyBriefPanel() {
  const { t, lang } = useLang();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/daily-brief');
      const data = await res.json();
      setBrief(data.brief);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const emptyGuide = lang === 'ko'
    ? 'Claude Code 세션에서 "오늘 브리핑 만들어줘"라고 입력하면 여기에 표시됩니다.'
    : 'Ask Claude Code "generate today\'s brief" and it will appear here.';

  return (
    <Card title={`🤖 ${t('dailyBrief')}`} className="h-full">
      {loading ? (
        <div className="flex items-center justify-center py-8"><Spinner size="md" /></div>
      ) : brief ? (
        <div className="space-y-4 text-sm">
          {brief.summary && (
            <p className="text-gray-600 bg-blue-50 rounded-lg p-3 text-xs leading-relaxed">{brief.summary}</p>
          )}
          <Section title={`🎯 ${t('focus')}`} items={brief.focus} color="blue" />
          <Section title={`📬 ${t('followUps')}`} items={brief.followUps} color="orange" />
          <Section title={`📋 ${t('meetingPrep')}`} items={brief.meetingPrep} color="purple" />
          {brief.generatedAt && (
            <p className="text-xs text-gray-400 pt-1">
              {new Date(brief.generatedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-3xl mb-3">🧠</p>
          <p className="text-xs text-gray-500 leading-relaxed">{emptyGuide}</p>
        </div>
      )}
    </Card>
  );
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items?.length) return null;
  const dot = { blue: 'bg-blue-500', orange: 'bg-orange-400', purple: 'bg-purple-500' }[color] || 'bg-gray-400';
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
