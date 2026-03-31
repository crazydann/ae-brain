import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 지연 초기화 (빌드 타임에 env 없어도 오류 안 남)
let _admin: SupabaseClient | null = null;
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _admin;
}

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

// 하위 호환 alias
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof SupabaseClient],
});
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => getSupabaseClient()[prop as keyof SupabaseClient],
});

export type IntelligenceEntry = {
  id: string;
  type: 'email' | 'slack' | 'calendar' | 'memo' | 'glean';
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  week_year: string;
  is_duplicate: boolean;
  duplicate_of: string | null;
  created_at: string;
};

export type WeeklyIntelligence = {
  id: string;
  week_label: string;
  week_start: string;
  week_end: string;
  claude_synthesis: string;
  key_themes: string[];
  deal_updates: DealUpdate[];
  action_items: ActionItem[];
  relationship_map: Record<string, string>;
  metrics: Record<string, number>;
  prev_week_id: string | null;
  source_entry_ids: string[];
  created_at: string;
};

export type DealUpdate = {
  account: string;
  stage: string;
  notes: string;
  change?: string;
};

export type ActionItem = {
  priority: 'high' | 'medium' | 'low';
  item: string;
  due?: string;
  account?: string;
};

export type AeUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'viewer';
  language: 'ko' | 'en';
};

/** ISO 주 레이블 반환 e.g. '2026-W14' */
export function getWeekLabel(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
  );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** 주의 시작(월)/종료(일) 날짜 반환 */
export function getWeekRange(weekLabel: string): { start: Date; end: Date } {
  const [year, week] = weekLabel.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const start = new Date(startOfWeek1);
  start.setDate(startOfWeek1.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}
