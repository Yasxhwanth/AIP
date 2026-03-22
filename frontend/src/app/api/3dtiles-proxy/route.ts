import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY =
    process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const GOOGLE_TILE_ORIGIN = 'https://tile.googleapis.com';

/**
 * Rewrites all absolute tile.googleapis.com URLs found in a JSON string so they
 * point back to our proxy endpoint.  Cesium fetches child tiles from the URLs it
 * finds inside the root.json / sub-tileset JSON; by rewriting them here we ensure
 * every subsequent request also passes through the server and bypasses the browser proxy.
 */
function rewriteGoogleUrls(json: string, proxyBase: string): string {
    // Match any quoted string that starts with https://tile.googleapis.com
    return json.replace(
        /"(https:\/\/tile\.googleapis\.com[^"\\]*)"/g,
        (_, url) => `"${proxyBase}${encodeURIComponent(url)}"`
    );
}

export async function GET(req: NextRequest) {
    if (!GOOGLE_API_KEY) {
        return new NextResponse('GOOGLE_MAPS_API_KEY not configured on server', { status: 500 });
    }

    const { searchParams, origin } = new URL(req.url);
    const encodedUrl = searchParams.get('url');

    if (!encodedUrl) {
        return new NextResponse('Missing ?url= parameter', { status: 400 });
    }

    const targetUrl = decodeURIComponent(encodedUrl);

    // Safety check — only proxy Google tile requests
    if (!targetUrl.startsWith(GOOGLE_TILE_ORIGIN)) {
        return new NextResponse('Only tile.googleapis.com URLs are proxied', { status: 403 });
    }

    // Inject API key if the URL doesn't already carry it
    const parsed = new URL(targetUrl);
    if (!parsed.searchParams.has('key')) {
        parsed.searchParams.set('key', GOOGLE_API_KEY);
    }

    try {
        const res = await fetch(parsed.toString(), {
            headers: { Accept: '*/*' },
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            return new NextResponse(`Upstream ${res.status}: ${errBody}`, { status: res.status });
        }

        const contentType = res.headers.get('content-type') ?? 'application/octet-stream';

        if (contentType.includes('json')) {
            // Rewrite all Google URLs so the next layer of tiles is also proxied
            const text = await res.text();
            const proxyBase = `${origin}/api/3dtiles-proxy?url=`;
            const rewritten = rewriteGoogleUrls(text, proxyBase);

            return new NextResponse(rewritten, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=3600',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } else {
            // Binary tile data (glb, cmpt, b3dm, etc.) — pass through unchanged
            const buffer = await res.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400, immutable',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    } catch (err: any) {
        console.error('[3DTilesProxy] Error fetching', parsed.toString(), ':', err?.message);
        return new NextResponse(`Proxy error: ${err?.message}`, { status: 500 });
    }
}
