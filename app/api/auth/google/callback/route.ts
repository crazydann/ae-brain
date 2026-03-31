import { NextResponse } from 'next/server';
import { setState } from '@/lib/intelligence';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=google_auth_failed`);
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();
  if (tokens.error || !tokens.access_token) {
    return NextResponse.redirect(`${appUrl}/?error=token_exchange_failed`);
  }

  await setState('google_refresh_token', tokens.refresh_token);
  await setState('google_access_token', tokens.access_token);
  await setState('google_token_expiry', Date.now() + tokens.expires_in * 1000);

  return NextResponse.redirect(`${appUrl}/?google=connected`);
}
