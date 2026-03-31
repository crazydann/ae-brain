'use client';

import { createContext, useContext, useState, ReactNode, createElement } from 'react';

export type Lang = 'ko' | 'en';

const dict = {
  ko: {
    appName: 'AE Brain',
    subtitle: '한국 시장',
    logout: '로그아웃',
    login: '로그인',
    loginTitle: 'AE Brain 로그인',
    email: '이메일',
    password: '비밀번호',
    loginBtn: '로그인',
    dailyBrief: '오늘의 브리핑',
    refresh: '새로고침',
    focus: '오늘 포커스',
    followUps: '팔로업 필요',
    meetingPrep: '미팅 준비',
    emailPanel: '이메일',
    slackPanel: '슬랙',
    calendarPanel: '캘린더',
    memoPanel: '메모',
    memoPlaceholder: '자유롭게 입력하세요... (Cmd+Enter 저장)',
    memoSave: '저장',
    memoEmpty: '아직 메모가 없습니다.',
    recentMemos: '최근 메모',
    weeklyReports: '주간 리포트',
    generateReport: '이번 주 리포트 생성',
    keyThemes: '핵심 테마',
    dealUpdates: '딜 업데이트',
    actionItems: '액션 아이템',
    relationships: '관계 맵',
    metrics: '활동 지표',
    ingest: '데이터 수집',
    ingesting: '수집 중...',
    noData: '데이터 없음',
    loading: '로딩 중...',
    generating: '생성 중...',
    saved: '저장됨',
    error: '오류 발생',
    high: '높음',
    medium: '보통',
    low: '낮음',
    today: '오늘',
    thisWeek: '이번 주',
    viewAll: '전체 보기',
    reports: '리포트 히스토리',
    backToDashboard: '← 대시보드',
    noReports: '아직 생성된 리포트가 없습니다.',
    emails: '이메일',
    meetings: '미팅',
    memos: '메모',
    duplicate: '중복',
    owner: '오너',
    viewer: '뷰어',
    readOnly: '읽기 전용',
  },
  en: {
    appName: 'AE Brain',
    subtitle: 'Korea Market',
    logout: 'Logout',
    login: 'Login',
    loginTitle: 'AE Brain Login',
    email: 'Email',
    password: 'Password',
    loginBtn: 'Sign In',
    dailyBrief: "Today's Brief",
    refresh: 'Refresh',
    focus: "Today's Focus",
    followUps: 'Follow-ups',
    meetingPrep: 'Meeting Prep',
    emailPanel: 'Email',
    slackPanel: 'Slack',
    calendarPanel: 'Calendar',
    memoPanel: 'Memo',
    memoPlaceholder: 'Type freely... (Cmd+Enter to save)',
    memoSave: 'Save',
    memoEmpty: 'No memos yet.',
    recentMemos: 'Recent Memos',
    weeklyReports: 'Weekly Reports',
    generateReport: 'Generate This Week\'s Report',
    keyThemes: 'Key Themes',
    dealUpdates: 'Deal Updates',
    actionItems: 'Action Items',
    relationships: 'Relationship Map',
    metrics: 'Activity Metrics',
    ingest: 'Sync Data',
    ingesting: 'Syncing...',
    noData: 'No data',
    loading: 'Loading...',
    generating: 'Generating...',
    saved: 'Saved',
    error: 'Error',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    today: 'Today',
    thisWeek: 'This Week',
    viewAll: 'View All',
    reports: 'Report History',
    backToDashboard: '← Dashboard',
    noReports: 'No reports generated yet.',
    emails: 'Emails',
    meetings: 'Meetings',
    memos: 'Memos',
    duplicate: 'Duplicate',
    owner: 'Owner',
    viewer: 'Viewer',
    readOnly: 'Read Only',
  },
} as const;

export type TranslationKey = keyof typeof dict.ko;
export type Translations = typeof dict.ko;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'ko',
  setLang: () => {},
  t: (k) => dict.ko[k],
});

export function LangProvider({ children, initialLang = 'ko' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = (key: TranslationKey): string => dict[lang][key] ?? dict.ko[key];
  return createElement(LangContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useLang() {
  return useContext(LangContext);
}
