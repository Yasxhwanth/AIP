import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY =
    process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// ── Session Management ────────────────────────────────────────────────────────
// A singleton Promise ensures parallel tile requests don't all try to create
// a new session simultaneously (stampede). The first request creates it;
// all others await the same Promise.

let sessionToken: string | null = null;
let sessionExpiry = 0;
let sessionPromise: Promise<string> | null = null;

async function _createSession(): Promise<string> {
    const res = await fetch(
        `https://tile.googleapis.com/v1/createSession?key=${GOOGLE_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mapType: 'satellite', language: 'en-US', region: 'US', overlay: false }),
        }
    );
    if (!res.ok) throw new Error(`Session create failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    if (!data.session) throw new Error('No session in response');
    sessionExpiry = (parseInt(data.expiry ?? '0', 10) - 3600) * 1000;
    sessionToken = data.session as string;
    console.info('[TileProxy] Session created, expires:', new Date(sessionExpiry).toISOString());
    return sessionToken;
}

async function getSession(): Promise<string> {
    if (sessionToken && Date.now() < sessionExpiry) return sessionToken;
    // Re-use in-flight promise to prevent stampede
    if (!sessionPromise) {
        sessionPromise = _createSession().finally(() => { sessionPromise = null; });
    }
    return sessionPromise;
}

// ── In-Memory Tile Cache ──────────────────────────────────────────────────────
// Avoids re-fetching identical tiles on pan/zoom-back. Max 1000 entries, 1h TTL.
// Using a Map maintains insertion order so we can evict the oldest entry.

const TILE_CACHE_MAX = 1000;
const TILE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry { buf: ArrayBuffer; ct: string; t: number }
const tileCache = new Map<string, CacheEntry>();

function cacheGet(key: string): CacheEntry | null {
    const entry = tileCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.t > TILE_CACHE_TTL) { tileCache.delete(key); return null; }
    // Move to end (LRU)
    tileCache.delete(key);
    tileCache.set(key, entry);
    return entry;
}

function cacheSet(key: string, buf: ArrayBuffer, ct: string) {
    if (tileCache.size >= TILE_CACHE_MAX) {
        // Evict oldest (first) entry
        const first = tileCache.keys().next().value;
        if (first) tileCache.delete(first);
    }
    tileCache.set(key, { buf, ct, t: Date.now() });
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ coords: string[] }> }
) {
    if (!GOOGLE_API_KEY) {
        return new NextResponse('Missing GOOGLE_MAPS_API_KEY', { status: 500 });
    }

    const { coords } = await params;
    const [z, x, y] = coords;
    if (!z || !x || !y) {
        return new NextResponse('Expected /api/tiles/{z}/{x}/{y}', { status: 400 });
    }

    const cacheKey = `${z}/${x}/${y}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
        return new NextResponse(cached.buf, {
            headers: {
                'Content-Type': cached.ct,
                'Cache-Control': 'public, max-age=86400, immutable',
                'X-Cache': 'HIT',
            },
        });
    }

    const fetchTile = async (session: string) =>
        fetch(`https://tile.googleapis.com/v1/2dtiles/${z}/${x}/${y}?session=${session}&key=${GOOGLE_API_KEY}`);

    try {
        let session = await getSession();
        let tileRes = await fetchTile(session);

        // Session expired → force a new one and retry once
        if (!tileRes.ok && (tileRes.status === 401 || tileRes.status === 403)) {
            sessionToken = null;
            sessionPromise = null;
            session = await getSession();
            tileRes = await fetchTile(session);
        }

        if (!tileRes.ok) {
            return new NextResponse(`Tile fetch ${tileRes.status}`, { status: tileRes.status });
        }

        const ct = tileRes.headers.get('content-type') || 'image/jpeg';
        const buf = await tileRes.arrayBuffer();

        cacheSet(cacheKey, buf, ct);

        return new NextResponse(buf, {
            headers: {
                'Content-Type': ct,
                'Cache-Control': 'public, max-age=86400, immutable',
                'X-Cache': 'MISS',
            },
        });
    } catch (err: any) {
        console.error('[TileProxy]', err?.message);
        return new NextResponse(`Proxy error: ${err?.message}`, { status: 500 });
    }
}
