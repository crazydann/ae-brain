/**
 * 메모 API
 * - GET: 메모 목록
 * - POST: 메모 저장 (AI 처리 없음 - 저장만)
 *
 * AI 태깅/요약이 필요하면:
 *   → Claude Code 세션에서 "최근 메모 정리해줘" 요청
 *   → Claude Code가 분석 후 metadata 업데이트
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { saveEntry } from '@/lib/intelligence';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const { data } = await getSupabaseAdmin()
    .from('intelligence_entries')
    .select('*')
    .eq('type', 'memo')
    .eq('is_duplicate', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  return NextResponse.json({ memos: data || [] });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || !isOwner(user)) {
    return NextResponse.json({ error: 'Owner only' }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  const { id, isDuplicate } = await saveEntry({ type: 'memo', content });

  return NextResponse.json({ id, content, isDuplicate, created_at: new Date().toISOString() });
}
