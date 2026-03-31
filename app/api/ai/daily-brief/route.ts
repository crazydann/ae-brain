/**
 * 일일 브리핑 API
 * - GET: Supabase intelligence_state['last_brief']에 저장된 브리핑 반환
 * - POST: 브리핑 내용을 직접 저장 (Claude Code가 생성 후 호출)
 *
 * AI 생성은 Claude Code 세션에서 직접 수행:
 *   → Claude Code가 데이터 분석
 *   → POST /api/ai/daily-brief 로 결과 저장
 *   → 웹앱이 GET으로 읽어서 표시
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { getState, setState } from '@/lib/intelligence';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const brief = await getState('last_brief');
  return NextResponse.json({ brief, cached: true });
}

// Claude Code가 브리핑 생성 후 저장
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || !isOwner(user)) return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  const body = await req.json();
  const brief = {
    ...body,
    generatedAt: new Date().toISOString(),
  };

  await setState('last_brief', brief);
  return NextResponse.json({ brief });
}
