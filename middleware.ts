import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 공개 경로는 통과
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // API 라우트는 각 핸들러에서 인증 처리
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 페이지 요청: 세션 확인
  const token = req.cookies.get('ae_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = await verifySession(token);
  if (!user) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('ae_session');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
