/**
 * Intelligence 파이프라인 (AI API 없는 버전)
 * - 중복 제거: SHA256 해시 기반 (정확 중복)
 * - 검색: PostgreSQL FTS (전문 검색)
 * - AI 분석: Claude Code가 직접 수행 후 Supabase에 저장
 */

import { createHash } from 'crypto';
import { getSupabaseAdmin, getWeekLabel } from './supabase';
import type { GleanResult } from './glean';

function hashContent(content: string): string {
  return createHash('sha256').update(content.trim().toLowerCase()).digest('hex').slice(0, 16);
}

// ─── 엔트리 저장 (해시 기반 중복 제거) ──────────────────────────────────
export async function saveEntry(params: {
  type: 'email' | 'slack' | 'calendar' | 'memo' | 'glean';
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string; isDuplicate: boolean }> {
  const weekYear = getWeekLabel();
  const contentHash = hashContent(params.content);

  // 중복 확인 (동일 해시)
  const { data: existing } = await getSupabaseAdmin()
    .from('intelligence_entries')
    .select('id')
    .eq('content_hash', contentHash)
    .eq('is_duplicate', false)
    .maybeSingle();

  if (existing) {
    return { id: existing.id, isDuplicate: true };
  }

  const { data } = await getSupabaseAdmin()
    .from('intelligence_entries')
    .insert({
      type: params.type,
      content: params.content,
      content_hash: contentHash,
      metadata: params.metadata || {},
      week_year: weekYear,
      is_duplicate: false,
    })
    .select('id')
    .single();

  return { id: data?.id, isDuplicate: false };
}

// ─── Glean 결과 일괄 수집 ────────────────────────────────────────────────
export async function ingestGleanResults(
  results: GleanResult[],
  type: 'email' | 'slack' | 'calendar'
): Promise<{ saved: number; duplicates: number }> {
  let saved = 0, duplicates = 0;

  for (const r of results) {
    const content = [r.title, r.snippet].filter(Boolean).join('\n');
    if (!content.trim()) continue;

    const { isDuplicate } = await saveEntry({
      type,
      content,
      metadata: { title: r.title, url: r.url, author: r.author, timestamp: r.timestamp, source: r.source },
    });

    if (isDuplicate) { duplicates++; } else { saved++; }
  }

  await getSupabaseAdmin()
    .from('intelligence_state')
    .upsert({ key: 'last_ingest', value: JSON.stringify(new Date().toISOString()), updated_at: new Date().toISOString() });

  return { saved, duplicates };
}

// ─── 키워드 검색 (FTS) ───────────────────────────────────────────────────
export async function searchEntries(query: string, opts?: { type?: string; limit?: number }) {
  const { data } = await getSupabaseAdmin().rpc('search_intelligence_entries', {
    search_query: query,
    filter_type: opts?.type ?? null,
    result_limit: opts?.limit ?? 20,
  });
  return data || [];
}

// ─── 최근 엔트리 조회 ────────────────────────────────────────────────────
export async function getRecentEntries(type?: string, hours = 24) {
  const since = new Date(Date.now() - hours * 3600000).toISOString();
  let q = getSupabaseAdmin()
    .from('intelligence_entries')
    .select('*')
    .eq('is_duplicate', false)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  if (type) q = q.eq('type', type);
  const { data } = await q;
  return data || [];
}

// ─── 이번 주 전체 엔트리 조회 ────────────────────────────────────────────
export async function getWeekEntries(weekYear?: string) {
  const week = weekYear || getWeekLabel();
  const { data } = await getSupabaseAdmin()
    .from('intelligence_entries')
    .select('*')
    .eq('week_year', week)
    .eq('is_duplicate', false)
    .order('created_at', { ascending: false });
  return data || [];
}

// ─── intelligence_state 읽기/쓰기 ────────────────────────────────────────
export async function getState(key: string) {
  const { data } = await getSupabaseAdmin()
    .from('intelligence_state')
    .select('value')
    .eq('key', key)
    .single();
  if (!data) return null;
  try { return JSON.parse(data.value as string); } catch { return data.value; }
}

export async function setState(key: string, value: unknown) {
  await getSupabaseAdmin()
    .from('intelligence_state')
    .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() });
}
