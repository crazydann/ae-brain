'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';
import type { GleanResult } from '@/lib/glean';

export function EmailPanel() {
  const { t } = useLang();
  const [emails, setEmails] = useState<GleanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ingest').then(r => r.json()).then(d => {
      setEmails(d.emails || []);
      setLoading(false);
    });
  }, []);

  return (
    <Card title={`✉️ ${t('emailPanel')}`} className="h-full">
      {loading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : emails.length === 0 ? (
        <p className="text-sm text-gray-400">{t('noData')}</p>
      ) : (
        <ul className="space-y-2.5">
          {emails.slice(0, 8).map((e, i) => (
            <li key={i} className="group">
              <a href={e.url !== '#' ? e.url : undefined} target="_blank" rel="noreferrer"
                className="block rounded-lg hover:bg-gray-50 transition-colors -mx-1 px-1 py-1">
                <p className="text-xs font-medium text-gray-800 line-clamp-1">{e.title}</p>
                {e.snippet && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{e.snippet}</p>}
                {e.author && <p className="text-xs text-gray-400 mt-0.5">{e.author}</p>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
