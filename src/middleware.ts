import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/session'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // 1. Update/Refresh Supabase session
    let response = await updateSession(request);
    const { pathname } = request.nextUrl;

    // 2. Obtain Supabase user for protection checks
    // We recreate a client using the cookies from the request and the response
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // This refreshes the session if needed and returns the user
    const { data: { user } } = await supabase.auth.getUser();

    // --- Portfolio Gate ---
    // if (pathname.startsWith('/new')) {
    //     const authCookie = request.cookies.get('portfolio-password');
    // 
    //     if (!authCookie || authCookie.value !== process.env.PORTFOLIO_PASSWORD) {
    //         const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    //         // Sync all cookies to the redirect
    //         response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c.name, c.value, c as any));
    //         return redirectResponse;
    //     }
    // }

    // --- Admin Protection ---
    // if (pathname.startsWith('/new/admin')) {
    //     if (!user) {
    //         const redirectResponse = NextResponse.redirect(new URL('/new/login', request.url));
    //         response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c.name, c.value, c as any));
    //         return redirectResponse;
    //     }
    // }

    // --- Login Redirect (if already logged in, skip login page) ---
    if (pathname === '/new/login' && user) {
        return NextResponse.redirect(new URL('/new/admin', request.url));
    }

    // Redirect from gate to /new if already authenticated at gate
    if (pathname === '/') {
        const authCookie = request.cookies.get('portfolio-password');
        if (authCookie && authCookie.value === process.env.PORTFOLIO_PASSWORD) {
            const redirectResponse = NextResponse.redirect(new URL('/new', request.url));
            response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c.name, c.value, c as any));
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
