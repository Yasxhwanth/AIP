import { NextResponse } from 'next/server';

// Server-side proxy for Celestrak TLE data — avoids CORS issues in the browser
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group') ?? 'visual';

    const URLS = [
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`,
        `https://celestrak.org/NORAD/elements/visual.txt`,
    ];

    for (const url of URLS) {
        try {
            const res = await fetch(url, {
                next: { revalidate: 3600 }, // Cache TLEs for 1 hour
                headers: { 'Accept': 'text/plain', 'User-Agent': 'AIP-GeoIntel/1.0' },
                signal: AbortSignal.timeout(10_000),
            });
            if (res.ok) {
                const text = await res.text();
                if (text.trim().length > 30) {
                    return new NextResponse(text, {
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8',
                            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
                        },
                    });
                }
            }
        } catch { /* try next URL */ }
    }

    return NextResponse.json({ error: 'All TLE sources failed' }, { status: 502 });
}
