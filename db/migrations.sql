-- AE Brain Dashboard - Supabase Migration
-- 기존 Supabase 프로젝트에 실행 (ae_ 접두사로 기존 테이블과 충돌 없음)
-- pgvector 불필요 - Claude Code가 직접 AI 역할

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS ae_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'viewer')),
  language      TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en')),
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 통합 지식 엔트리 (이메일/슬랙/캘린더/메모)
CREATE TABLE IF NOT EXISTS intelligence_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL CHECK (type IN ('email', 'slack', 'calendar', 'memo', 'glean')),
  content      TEXT NOT NULL,
  content_hash TEXT,                -- SHA256 기반 중복 제거 (AI 없이)
  metadata     JSONB DEFAULT '{}',
  week_year    TEXT,                -- '2026-W14'
  is_duplicate BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS ie_type_idx      ON intelligence_entries(type);
CREATE INDEX IF NOT EXISTS ie_week_idx      ON intelligence_entries(week_year);
CREATE INDEX IF NOT EXISTS ie_hash_idx      ON intelligence_entries(content_hash);
CREATE INDEX IF NOT EXISTS ie_created_idx   ON intelligence_entries(created_at DESC);
-- 전문 검색 (벡터 대신 PostgreSQL 내장 FTS)
CREATE INDEX IF NOT EXISTS ie_fts_idx
  ON intelligence_entries USING gin(to_tsvector('simple', content));

-- 3. 주간 인텔리전스 리포트 (누적 저장 - 절대 삭제 안 함)
CREATE TABLE IF NOT EXISTS weekly_intelligence (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_label       TEXT UNIQUE NOT NULL,  -- '2026-W14'
  week_start       DATE NOT NULL,
  week_end         DATE NOT NULL,
  claude_synthesis TEXT NOT NULL,         -- Claude Code가 작성한 분석
  key_themes       TEXT[]  DEFAULT '{}',
  deal_updates     JSONB   DEFAULT '[]',
  action_items     JSONB   DEFAULT '[]',
  relationship_map JSONB   DEFAULT '{}',
  metrics          JSONB   DEFAULT '{}',
  prev_week_id     UUID REFERENCES weekly_intelligence(id),
  source_entry_ids UUID[]  DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wi_week_idx ON weekly_intelligence(week_start DESC);

-- 4. Claude Code 작업 기억 (키-값 저장소)
-- Claude Code가 분석한 결과를 여기에 저장 → 웹앱이 읽어서 표시
CREATE TABLE IF NOT EXISTS intelligence_state (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO intelligence_state (key, value) VALUES
  ('active_deals',   '[]'),
  ('key_contacts',   '[]'),
  ('running_themes', '[]'),
  ('last_brief',     'null'),
  ('last_ingest',    'null')
ON CONFLICT (key) DO NOTHING;

-- 5. 전문 검색 함수 (벡터 없이 키워드 기반)
CREATE OR REPLACE FUNCTION search_intelligence_entries(
  search_query TEXT,
  filter_type  TEXT DEFAULT NULL,
  result_limit INT  DEFAULT 20
)
RETURNS TABLE (
  id         UUID,
  type       TEXT,
  content    TEXT,
  metadata   JSONB,
  week_year  TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT ie.id, ie.type, ie.content, ie.metadata, ie.week_year, ie.created_at
  FROM intelligence_entries ie
  WHERE
    ie.is_duplicate = FALSE
    AND (filter_type IS NULL OR ie.type = filter_type)
    AND to_tsvector('simple', ie.content) @@ plainto_tsquery('simple', search_query)
  ORDER BY ie.created_at DESC
  LIMIT result_limit;
END;
$$;
