import { NextResponse } from 'next/server';
import type { CatEvent } from '@/types';

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchEarthquakes(): Promise<CatEvent[]> {
    try {
        const res = await fetch(
            'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.0&minlatitude=8&maxlatitude=37&minlongitude=68&maxlongitude=98&limit=20&orderby=time',
            { next: { revalidate: 600 } }
        );
        const data = await res.json();
        return (data.features || []).map((f: { id: string; properties: { title: string; mag: number; time: number; url: string }; geometry: { coordinates: [number, number] } }) => ({
            id: f.id,
            title: f.properties.title,
            type: 'earthquake' as const,
            severity: f.properties.mag >= 6 ? 'critical' : f.properties.mag >= 5 ? 'high' : f.properties.mag >= 4.5 ? 'medium' : 'low',
            location: f.properties.title.replace(/^M[\d.]+ - /, ''),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            time: new Date(f.properties.time).toISOString(),
            source: 'USGS',
            url: f.properties.url,
        }));
    } catch {
        return [];
    }
}

async function fetchGDACS(): Promise<CatEvent[]> {
    try {
        const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 600 },
        });
        const xml = await res.text();
        const events: CatEvent[] = [];
        const items = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
        let i = 0;
        for (const match of items) {
            const block = match[1];
            const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim() || '';
            const link = (block.match(/<link>([^<]+)/) || [])[1]?.trim() || '';
            const pubDate = (block.match(/<pubDate>([^<]+)/) || [])[1]?.trim() || '';
            const lat = parseFloat((block.match(/geo:lat>([^<]+)/) || [])[1] || '20');
            const lng = parseFloat((block.match(/geo:long>([^<]+)/) || [])[1] || '78');
            const alertLevel = (block.match(/gdacs:alertlevel>([^<]+)/) || [])[1]?.trim().toLowerCase() || 'green';
            const eventType = (block.match(/gdacs:eventtype>([^<]+)/) || [])[1]?.trim().toLowerCase() || 'other';

            if (title) {
                events.push({
                    id: `gdacs-${i++}`,
                    title,
                    type: eventType.includes('fl') ? 'flood' : eventType.includes('cy') || eventType.includes('tc') ? 'cyclone' : eventType.includes('eq') ? 'earthquake' : 'other',
                    severity: alertLevel === 'red' ? 'critical' : alertLevel === 'orange' ? 'high' : 'medium',
                    location: title,
                    lat: isNaN(lat) ? 20 : lat,
                    lng: isNaN(lng) ? 78 : lng,
                    time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                    source: 'GDACS',
                    url: link,
                });
            }
            if (events.length >= 15) break;
        }
        return events;
    } catch {
        return [];
    }
}

export async function GET() {
    const cacheKey = 'cat-events';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    const [earthquakes, gdacs] = await Promise.all([fetchEarthquakes(), fetchGDACS()]);
    const all = [...earthquakes, ...gdacs].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    cache.set(cacheKey, { data: all, ts: Date.now() });
    return NextResponse.json(all);
}
