'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';
import type { GleanResult } from '@/lib/glean';

export function CalendarPanel() {
  const { t } = useLang();
  const [events, setEvents] = useState<GleanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ingest').then(r => r.json()).then(d => {
      setEvents(d.calendar || []);
      setLoading(false);
    });
  }, []);

  function formatTime(ts?: string) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  function isToday(ts?: string) {
    if (!ts) return false;
    const d = new Date(ts);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  return (
    <Card title={`🗓 ${t('calendarPanel')}`} className="h-full">
      {loading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400">{t('noData')}</p>
      ) : (
        <ul className="space-y-2">
          {events.slice(0, 8).map((e, i) => (
            <li key={i} className="flex items-start gap-3 py-1">
              <div className="flex-shrink-0 text-center min-w-[40px]">
                <p className="text-xs font-bold text-blue-600">{formatTime(e.timestamp)}</p>
                {isToday(e.timestamp) && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 rounded px-1">{t('today')}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 line-clamp-1">{e.title}</p>
                {e.snippet && <p className="text-xs text-gray-500 line-clamp-1">{e.snippet}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
