import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/session'

export async function middleware(request: NextRequest) {
    // 1. Update Supabase Session first (refreshes tokens)
    let response = await updateSession(request);
    const { pathname } = request.nextUrl;

    // --- Portfolio Gate ---
    if (pathname.startsWith('/new')) {
        const authCookie = request.cookies.get('portfolio-password');

        if (!authCookie || authCookie.value !== process.env.PORTFOLIO_PASSWORD) {
            // Redirect to root gate - preserve Supabase cookies by creating redirect from standard response
            const gateUrl = new URL('/', request.url);
            const redirectResponse = NextResponse.redirect(gateUrl);

            // Copy cookies from standard response to redirect response
            response.cookies.getAll().forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, {
                    ...cookie,
                    // Ensure options are serialized correctly
                } as any);
            });

            return redirectResponse;
        }
    }

    // Redirect from gate to /new if already authenticated
    if (pathname === '/') {
        const authCookie = request.cookies.get('portfolio-password');
        if (authCookie && authCookie.value === process.env.PORTFOLIO_PASSWORD) {
            const redirectResponse = NextResponse.redirect(new URL('/new', request.url));
            response.cookies.getAll().forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie as any);
            });
            return redirectResponse;
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
