import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.set('x-invoke-path', url.pathname);

    return NextResponse.next({
        request: {
            headers
        }
    });
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
