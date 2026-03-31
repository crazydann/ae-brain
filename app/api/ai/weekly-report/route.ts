/**
 * 주간 리포트 API
 * - POST: Claude Code가 생성한 리포트를 저장 (누적, 절대 삭제 안 함)
 *
 * 워크플로우:
 *   1. 사용자가 Claude Code에 "이번 주 리포트 만들어줘" 요청
 *   2. Claude Code가 Supabase에서 데이터 읽어서 분석
 *   3. Claude Code가 POST /api/ai/weekly-report 로 결과 저장
 *   4. 웹앱 /reports 페이지에서 확인
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { getSupabaseAdmin, getWeekLabel, getWeekRange } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || !isOwner(user)) return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  const body = await req.json();
  const weekLabel = body.week_label || getWeekLabel();
  const { start, end } = getWeekRange(weekLabel);

  // 이미 이번 주 리포트 있으면 업데이트 (upsert)
  const { data } = await getSupabaseAdmin()
    .from('weekly_intelligence')
    .upsert({
      week_label:       weekLabel,
      week_start:       start.toISOString().split('T')[0],
      week_end:         end.toISOString().split('T')[0],
      claude_synthesis: body.synthesis || '',
      key_themes:       body.key_themes || [],
      deal_updates:     body.deal_updates || [],
      action_items:     body.action_items || [],
      relationship_map: body.relationship_map || {},
      metrics:          body.metrics || {},
      prev_week_id:     body.prev_week_id || null,
      source_entry_ids: body.source_entry_ids || [],
    }, { onConflict: 'week_label' })
    .select()
    .single();

  return NextResponse.json({ report: data });
}
