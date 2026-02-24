import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/session'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Portfolio Gate ---
    // All /new/* routes require the 'portfolio-password' cookie.
    // The gate is at / and APIs are at /api/* (public).
    if (pathname.startsWith('/new')) {
        const authCookie = request.cookies.get('portfolio-password');

        if (!authCookie || authCookie.value !== process.env.PORTFOLIO_PASSWORD) {
            // Redirect to the root gate page
            const gateUrl = new URL('/', request.url);
            return NextResponse.redirect(gateUrl);
        }
    }

    // If accessing the gate at / but already have a valid cookie, redirect to /new
    if (pathname === '/') {
        const authCookie = request.cookies.get('portfolio-password');
        if (authCookie && authCookie.value === process.env.PORTFOLIO_PASSWORD) {
            return NextResponse.redirect(new URL('/new', request.url));
        }
    }

    // --- Supabase Session ---
    // This handles Auth for admin routes etc.
    return await updateSession(request);
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
