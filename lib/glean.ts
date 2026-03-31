/**
 * Glean API 클라이언트
 * https://developers.glean.com/docs/browser_api/search_api/
 */

const GLEAN_INSTANCE_URL = process.env.GLEAN_INSTANCE_URL || '';
const GLEAN_API_TOKEN = process.env.GLEAN_API_TOKEN || '';

export interface GleanResult {
  title: string;
  snippet: string;
  url: string;
  author?: string;
  timestamp?: string;
  source: string;
  docType?: string;
}

export interface GleanSearchOptions {
  query: string;
  datasources?: string[];
  pageSize?: number;
  startTimestamp?: number;
}

export async function gleanSearch(options: GleanSearchOptions): Promise<GleanResult[]> {
  if (!GLEAN_INSTANCE_URL || !GLEAN_API_TOKEN) {
    return getMockData(options.datasources?.[0] || 'gmail');
  }
  try {
    const res = await fetch(`${GLEAN_INSTANCE_URL}/api/index/v1/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GLEAN_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: options.query,
        pageSize: options.pageSize || 20,
        datasourceFilter: options.datasources,
        startTimestamp: options.startTimestamp,
      }),
    });
    if (!res.ok) throw new Error(`Glean ${res.status}`);
    return parseGleanResults(await res.json());
  } catch (e) {
    console.error('[Glean]', e);
    return getMockData(options.datasources?.[0] || 'gmail');
  }
}

function parseGleanResults(data: Record<string, unknown>): GleanResult[] {
  const results = (data.results as Array<Record<string, unknown>>) || [];
  return results.map((r) => {
    const doc = (r.document as Record<string, unknown>) || {};
    const meta = (doc.metadata as Record<string, unknown>) || {};
    return {
      title: (doc.title as string) || '',
      snippet: ((r.snippets as Array<{ snippet: { text: string } }>)?.[0]?.snippet?.text) || '',
      url: (doc.url as string) || '',
      author: (meta.author as string) || (meta.owner as string) || '',
      timestamp: (meta.updateTime as string) || (meta.createTime as string) || '',
      source: ((doc.datasource as string) || '').toLowerCase(),
      docType: (doc.docType as string) || '',
    };
  });
}

export async function fetchRecentEmails(days = 7): Promise<GleanResult[]> {
  return gleanSearch({ query: 'email', datasources: ['gmail'], pageSize: 30, startTimestamp: Math.floor(Date.now() / 1000) - days * 86400 });
}

export async function fetchRecentSlack(hours = 48): Promise<GleanResult[]> {
  return gleanSearch({ query: 'message', datasources: ['slack'], pageSize: 30, startTimestamp: Math.floor(Date.now() / 1000) - hours * 3600 });
}

export async function fetchCalendar(): Promise<GleanResult[]> {
  return gleanSearch({ query: 'meeting event', datasources: ['gcal'], pageSize: 20, startTimestamp: Math.floor(Date.now() / 1000) - 3600 });
}

// Mock 데이터 (Glean 미연결 시 UI 개발/데모용)
function getMockData(source: string): GleanResult[] {
  const now = new Date().toISOString();
  const mocks: Record<string, GleanResult[]> = {
    gmail: [
      { title: '[Amplitude] ABC Corp QBR 준비 요청', snippet: 'QBR 전 현재 사용 현황 데이터 공유 부탁드립니다.', url: '#', author: 'john@abccorp.com', timestamp: now, source: 'gmail' },
      { title: 'Re: XYZ Inc 온보딩 일정 확인', snippet: '다음 주 화요일 오전 10시로 확정하겠습니다.', url: '#', author: 'sarah@xyzinc.com', timestamp: now, source: 'gmail' },
      { title: 'DEF Co. 계약 갱신 건', snippet: '연간 계약 만료가 다음 달입니다. 미팅 일정 잡아주세요.', url: '#', author: 'cto@defco.kr', timestamp: now, source: 'gmail' },
    ],
    slack: [
      { title: '#korea-ae', snippet: '@dan ABC Corp QBR 자료 공유 부탁드립니다', url: '#', author: 'manager@amplitude.com', timestamp: now, source: 'slack' },
      { title: '#deals', snippet: 'ABC Corp stage → Negotiation 업데이트됨', url: '#', author: 'sfdc-bot', timestamp: now, source: 'slack' },
      { title: '#product-korea', snippet: '신규 기능 XYZ 한국 고객 피드백 수집 중', url: '#', author: 'pm@amplitude.com', timestamp: now, source: 'slack' },
    ],
    gcal: [
      { title: 'ABC Corp QBR', snippet: '10:00 – 11:00 | Zoom | 분기 리뷰 미팅', url: '#', timestamp: new Date(Date.now() + 3600000).toISOString(), source: 'gcal' },
      { title: 'Korea AE Team Sync', snippet: '14:00 – 15:00 | 주간 팀 싱크', url: '#', timestamp: new Date(Date.now() + 7200000).toISOString(), source: 'gcal' },
      { title: 'XYZ Inc 온보딩', snippet: '16:00 – 17:00 | 신규 고객 온보딩 세션', url: '#', timestamp: new Date(Date.now() + 86400000).toISOString(), source: 'gcal' },
    ],
  };
  return mocks[source] || mocks.gmail;
}
