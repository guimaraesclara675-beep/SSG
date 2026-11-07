import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const restrito = path.startsWith('/app') || path.startsWith('/admin') || path.startsWith('/bem-vindo');
  if (restrito && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('volta', path);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = { matcher: ['/app/:path*', '/admin/:path*', '/bem-vindo', '/entrar', '/auth/:path*'] };
