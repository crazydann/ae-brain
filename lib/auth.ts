import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ae-brain-change-this-secret'
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'viewer';
  language: 'ko' | 'en';
}

export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('ae_session')?.value;
  if (!token) return null;
  return verifySession(token);
}

export function isOwner(user: SessionUser | null): boolean {
  return user?.role === 'owner';
}
