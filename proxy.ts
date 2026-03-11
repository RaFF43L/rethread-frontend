import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'rethread_admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      redirectResponse.cookies.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'rethread_admin_token');
      return redirectResponse;
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*',
};
