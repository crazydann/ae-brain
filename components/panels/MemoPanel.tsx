'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/i18n';

interface Memo {
  id: string;
  content: string;
  metadata: {
    ai_summary?: string;
    ai_tags?: string[];
    action_items?: string[];
    contacts?: string[];
  };
  created_at: string;
}

interface MemoPanelProps {
  isOwner: boolean;
}

export function MemoPanel({ isOwner }: MemoPanelProps) {
  const { t } = useLang();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadMemos = useCallback(async () => {
    const res = await fetch('/api/memo?limit=15');
    const data = await res.json();
    setMemos(data.memos || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadMemos(); }, [loadMemos]);


  async function saveMemo() {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      // 낙관적 업데이트
      setMemos(prev => [{ id: data.id, content: text, metadata: {}, created_at: new Date().toISOString() }, ...prev]);
      setText('');
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveMemo();
  }

  async function deleteMemo(id: string) {
    await fetch(`/api/memo/${id}`, { method: 'DELETE' });
    setMemos(prev => prev.filter(m => m.id !== id));
  }

  return (
    <Card title={`📝 ${t('memoPanel')}`} className="h-full flex flex-col">
      {/* 입력 영역 (오너만) */}
      {isOwner && (
        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('memoPlaceholder')}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400"
          />
          <div className="flex justify-end mt-1.5">
            <button
              onClick={saveMemo}
              disabled={!text.trim() || saving}
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Spinner size="sm" /> : null}
              {t('memoSave')}
            </button>
          </div>
        </div>
      )}

      {/* 메모 목록 */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('recentMemos')}</p>
        {loading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : memos.length === 0 ? (
          <p className="text-sm text-gray-400">{t('memoEmpty')}</p>
        ) : (
          memos.map(memo => (
            <div key={memo.id} className="group bg-gray-50 rounded-lg p-3 relative">
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{memo.content}</p>

              {/* AI 처리 결과 */}
              {memo.metadata?.ai_summary && (
                <p className="text-xs text-gray-500 mt-1.5 italic">&ldquo;{memo.metadata.ai_summary}&rdquo;</p>
              )}
              {memo.metadata?.ai_tags?.length ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memo.metadata.ai_tags.map((tag, i) => (
                    <Badge key={i} label={tag} variant="blue" />
                  ))}
                </div>
              ) : null}

              {memo.metadata?.action_items?.length ? (
                <ul className="mt-2 space-y-0.5">
                  {memo.metadata.action_items.map((a, i) => (
                    <li key={i} className="text-xs text-orange-700 flex items-start gap-1">
                      <span className="mt-1 h-1 w-1 rounded-full bg-orange-400 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{new Date(memo.created_at).toLocaleString('ko-KR')}</p>
                {isOwner && (
                  <button
                    onClick={() => deleteMemo(memo.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-opacity"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
