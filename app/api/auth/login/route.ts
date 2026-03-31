import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from '@/lib/auth';
import type { SessionUser } from '@/lib/auth';
import crypto from 'crypto';

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw + process.env.JWT_SECRET).digest('hex');
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('ae_users')
    .select('*')
    .eq('email', email)
    .eq('password_hash', hashPassword(password))
    .single();

  if (error || !user) {
    return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
  };

  const token = await createSession(sessionUser);

  const res = NextResponse.json({ user: sessionUser });
  res.cookies.set('ae_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
