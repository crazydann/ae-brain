import { NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { saveEntry } from '@/lib/intelligence';
import { getGoogleAccessToken } from '@/lib/google';

async function syncGmail(accessToken: string): Promise<number> {
  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=newer_than:2d',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const listData = await listRes.json();
  if (listData.error || !listData.messages) return 0;

  let count = 0;
  for (const { id } of listData.messages.slice(0, 15)) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const msg = await msgRes.json();
    if (msg.error) continue;

    const hdrs: { name: string; value: string }[] = msg.payload?.headers || [];
    const subject = hdrs.find(h => h.name === 'Subject')?.value || '(no subject)';
    const from = hdrs.find(h => h.name === 'From')?.value || '';
    const date = hdrs.find(h => h.name === 'Date')?.value || '';

    await saveEntry({
      type: 'email',
      content: `[EMAIL] Subject: ${subject} | From: ${from} | ${msg.snippet || ''}`,
      metadata: { subject, from, date, message_id: id, source: 'gmail' },
    });
    count++;
  }
  return count;
}

async function syncCalendar(accessToken: string): Promise<number> {
  const now = new Date().toISOString();
  const next14d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${next14d}&maxResults=20&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  if (data.error || !data.items) return 0;

  let count = 0;
  for (const event of data.items) {
    const start = event.start?.dateTime || event.start?.date || '';
    const end = event.end?.dateTime || event.end?.date || '';
    const title = event.summary || '(제목 없음)';
    const location = event.location ? ` | 장소: ${event.location}` : '';
    const desc = event.description ? ` | ${String(event.description).substring(0, 200)}` : '';

    await saveEntry({
      type: 'calendar',
      content: `[CALENDAR] ${title} | ${start} ~ ${end}${location}${desc}`,
      metadata: { title, start, end, location: event.location || '', event_id: event.id, source: 'google_calendar' },
    });
    count++;
  }
  return count;
}

export async function POST() {
  const session = await getSession();
  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = await getGoogleAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Google not connected. Visit /api/auth/google to connect.' }, { status: 400 });
  }

  const [emails, events] = await Promise.all([
    syncGmail(accessToken),
    syncCalendar(accessToken),
  ]);

  return NextResponse.json({ success: true, emails, events });
}
