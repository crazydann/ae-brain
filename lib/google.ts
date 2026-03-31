/**
 * Google OAuth 토큰 관리
 * - 토큰은 Supabase intelligence_state에 저장
 * - 환경변수 GOOGLE_REFRESH_TOKEN을 fallback으로 사용
 */

import { getState, setState } from './intelligence';

export async function getGoogleAccessToken(): Promise<string | null> {
  // 유효한 액세스 토큰이 있으면 재사용
  const expiry = await getState('google_token_expiry') as number | null;
  if (expiry && Date.now() < expiry - 60000) {
    const token = await getState('google_access_token') as string | null;
    if (token) return token;
  }

  // 리프레시 토큰 (Supabase 우선, 환경변수 fallback)
  let refreshToken = await getState('google_refresh_token') as string | null;
  if (!refreshToken) refreshToken = process.env.GOOGLE_REFRESH_TOKEN || null;
  if (!refreshToken) return null;

  // 토큰 갱신
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await res.json();
  if (tokens.error || !tokens.access_token) return null;

  await setState('google_access_token', tokens.access_token);
  await setState('google_token_expiry', Date.now() + tokens.expires_in * 1000);

  return tokens.access_token;
}

export async function isGoogleConnected(): Promise<boolean> {
  const fromDB = await getState('google_refresh_token');
  return !!(fromDB || process.env.GOOGLE_REFRESH_TOKEN);
}
