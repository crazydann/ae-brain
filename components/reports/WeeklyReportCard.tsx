'use client';
import { Badge, PriorityBadge } from '@/components/ui/Badge';
import { useLang } from '@/lib/i18n';
import type { WeeklyIntelligence } from '@/lib/supabase';

export function WeeklyReportCard({ report }: { report: WeeklyIntelligence }) {
  const { t } = useLang();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{report.week_label}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {new Date(report.week_start).toLocaleDateString('ko-KR')} – {new Date(report.week_end).toLocaleDateString('ko-KR')}
            </p>
          </div>
          {/* 메트릭 뱃지 */}
          <div className="flex gap-2 text-xs">
            {Object.entries(report.metrics || {}).map(([k, v]) => (
              <span key={k} className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
                {k} {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* 전체 요약 */}
        <p className="text-sm text-gray-700 leading-relaxed">{report.claude_synthesis}</p>

        {/* 핵심 테마 */}
        {report.key_themes?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('keyThemes')}</p>
            <div className="flex flex-wrap gap-1.5">
              {report.key_themes.map((theme, i) => <Badge key={i} label={theme} variant="purple" />)}
            </div>
          </div>
        )}

        {/* 딜 업데이트 */}
        {report.deal_updates?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('dealUpdates')}</p>
            <div className="space-y-2">
              {report.deal_updates.map((deal, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{deal.account}</p>
                      <Badge label={deal.stage} variant="blue" />
                      {deal.change && <Badge label={deal.change} variant="green" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{deal.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 아이템 */}
        {report.action_items?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('actionItems')}</p>
            <ul className="space-y-1.5">
              {report.action_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <PriorityBadge priority={item.priority} />
                  <span className="text-sm text-gray-700 flex-1">{item.item}</span>
                  {item.due && <span className="text-xs text-gray-400">{item.due}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
