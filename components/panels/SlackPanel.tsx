'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';
import type { GleanResult } from '@/lib/glean';

export function SlackPanel() {
  const { t } = useLang();
  const [messages, setMessages] = useState<GleanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ingest').then(r => r.json()).then(d => {
      setMessages(d.slacks || []);
      setLoading(false);
    });
  }, []);

  return (
    <Card title={`💬 ${t('slackPanel')}`} className="h-full">
      {loading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-gray-400">{t('noData')}</p>
      ) : (
        <ul className="space-y-2.5">
          {messages.slice(0, 8).map((m, i) => (
            <li key={i} className="group">
              <a href={m.url !== '#' ? m.url : undefined} target="_blank" rel="noreferrer"
                className="block rounded-lg hover:bg-gray-50 transition-colors -mx-1 px-1 py-1">
                <p className="text-xs font-medium text-indigo-600 line-clamp-1">{m.title}</p>
                {m.snippet && <p className="text-xs text-gray-700 line-clamp-2 mt-0.5">{m.snippet}</p>}
                {m.author && <p className="text-xs text-gray-400 mt-0.5">{m.author}</p>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
