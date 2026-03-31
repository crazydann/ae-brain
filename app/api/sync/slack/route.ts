import { NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { saveEntry } from '@/lib/intelligence';

export async function POST() {
  const session = await getSession();
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.SLACK_USER_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Slack token not configured' }, { status: 400 });
  }

  // 최근 2일 메시지 검색 (xoxp user token 사용)
  const searchRes = await fetch(
    'https://slack.com/api/search.messages?query=after:yesterday&count=20&sort=timestamp&sort_dir=desc',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchRes.json();

  if (!searchData.ok || !searchData.messages?.matches) {
    return NextResponse.json({ error: searchData.error || 'Slack API failed' }, { status: 500 });
  }

  let count = 0;
  for (const msg of searchData.messages.matches as Array<{
    channel?: { name?: string };
    username?: string;
    user?: string;
    text?: string;
    ts?: string;
  }>) {
    if (!msg.text?.trim()) continue;
    const channel = msg.channel?.name || 'dm';
    const user = msg.username || msg.user || 'unknown';

    await saveEntry({
      type: 'slack',
      content: `[SLACK] #${channel} | ${user}: ${msg.text}`,
      metadata: { channel, user, ts: msg.ts, source: 'slack' },
    });
    count++;
  }

  return NextResponse.json({ success: true, messages: count });
}
