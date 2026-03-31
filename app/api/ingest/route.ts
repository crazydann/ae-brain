import { NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { fetchRecentEmails, fetchRecentSlack, fetchCalendar } from '@/lib/glean';
import { ingestGleanResults } from '@/lib/intelligence';

export async function POST() {
  const user = await getSession();
  if (!user || !isOwner(user)) {
    return NextResponse.json({ error: 'Owner only' }, { status: 403 });
  }

  const [emails, slacks, calendar] = await Promise.all([
    fetchRecentEmails(7),
    fetchRecentSlack(48),
    fetchCalendar(),
  ]);

  const [emailStats, slackStats, calStats] = await Promise.all([
    ingestGleanResults(emails, 'email'),
    ingestGleanResults(slacks, 'slack'),
    ingestGleanResults(calendar, 'calendar'),
  ]);

  return NextResponse.json({
    email: emailStats,
    slack: slackStats,
    calendar: calStats,
    total: {
      saved: emailStats.saved + slackStats.saved + calStats.saved,
      duplicates: emailStats.duplicates + slackStats.duplicates + calStats.duplicates,
    },
  });
}

// 최근 수집 데이터 조회 (각 패널용)
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [emails, slacks, calendar] = await Promise.all([
    fetchRecentEmails(7),
    fetchRecentSlack(48),
    fetchCalendar(),
  ]);

  return NextResponse.json({ emails, slacks, calendar });
}
