import { NextResponse } from 'next/server';

// In-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchRSS(url: string): Promise<{ title: string; link: string; pubDate: string; source: string }[]> {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InsuranceMonitor/1.0)' },
        next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items: { title: string; link: string; pubDate: string; source: string }[] = [];

    // Extract <item> blocks
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
        const block = match[1];
        const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim() || '';
        const link = (block.match(/<link>([^<]+)<\/link>/) || block.match(/<link[^>]*href="([^"]+)"/) || [])[1]?.trim() || '';
        const pubDate = (block.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1]?.trim() || '';
        if (title) {
            items.push({ title, link, pubDate, source: '' });
        }
        if (items.length >= 20) break;
    }
    return items;
}

const FEEDS: Record<string, { name: string; url: string; category: string; badge?: string }[]> = {
    irdai: [
        { name: 'IRDAI', url: 'https://www.irdai.gov.in/rss/feed/notifications.xml', category: 'regulatory', badge: 'REGULATORY' },
        { name: 'PIB Insurance', url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1', category: 'regulatory', badge: 'GOVT' },
        { name: 'RBI Releases', url: 'https://www.rbi.org.in/scripts/RSS.aspx?Id=1', category: 'regulatory', badge: 'RBI' },
    ],
    industry: [
        { name: 'ET Insurance', url: 'https://economictimes.indiatimes.com/industry/banking/insurance/rssfeeds/13357143.cms', category: 'industry' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_top_stories.rss', category: 'industry' },
        { name: 'LiveMint', url: 'https://www.livemint.com/rss/economy', category: 'industry' },
        { name: 'Financial Express', url: 'https://www.financialexpress.com/industry/banking-finance/feed/', category: 'industry' },
    ],
    competitor: [
        { name: 'PolicyBazaar', url: 'https://news.google.com/rss/search?q="PolicyBazaar"+OR+"PB+Fintech"+when:7d&hl=en-IN&gl=IN&ceid=IN:en', category: 'competitor' },
        { name: 'InsuranceDekho', url: 'https://news.google.com/rss/search?q="InsuranceDekho"+OR+"Girnar+Insurance"+when:7d&hl=en-IN&gl=IN&ceid=IN:en', category: 'competitor' },
        { name: 'Zopper', url: 'https://news.google.com/rss/search?q="Zopper"+insurance+when:14d&hl=en-IN&gl=IN&ceid=IN:en', category: 'competitor' },
        { name: 'LIC India', url: 'https://news.google.com/rss/search?q="LIC+India"+when:3d&hl=en-IN&gl=IN&ceid=IN:en', category: 'competitor' },
        { name: 'HDFC Life', url: 'https://news.google.com/rss/search?q="HDFC+Life"+when:3d&hl=en-IN&gl=IN&ceid=IN:en', category: 'competitor' },
    ],
    broking: [
        { name: 'Bima Sugam', url: 'https://news.google.com/rss/search?q="Bima+Sugam"+IRDAI+when:14d&hl=en-IN&gl=IN&ceid=IN:en', category: 'broking', badge: 'PLATFORM' },
        { name: 'Broking News', url: 'https://news.google.com/rss/search?q="insurance+broking"+India+when:7d&hl=en-IN&gl=IN&ceid=IN:en', category: 'broking' },
    ],
    reinsurance: [
        { name: 'Insurance Journal', url: 'https://www.insurancejournal.com/feed/', category: 'reinsurance' },
        { name: 'Artemis (ILS)', url: 'https://www.artemis.bm/feed/', category: 'reinsurance' },
        { name: 'Reinsurance News', url: 'https://www.reinsurancene.ws/feed/', category: 'reinsurance' },
        { name: 'Global Reinsurance', url: 'https://news.google.com/rss/search?q="swiss+re"+OR+"munich+re"+OR+"lloyds"+reinsurance+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'reinsurance' },
    ],
    digital: [
        { name: 'Insurtech India', url: 'https://news.google.com/rss/search?q=insurtech+India+OR+"Bima+Sugam"+OR+"embedded+insurance"+India+when:7d&hl=en-IN&gl=IN&ceid=IN:en', category: 'digital' },
        { name: 'Fintech India', url: 'https://inc42.com/feed/', category: 'digital' },
    ],
    macro: [
        { name: 'RBI Policy', url: 'https://news.google.com/rss/search?q=RBI+policy+rate+OR+repo+rate+India+when:7d&hl=en-IN&gl=IN&ceid=IN:en', category: 'macro' },
        { name: 'India Economy', url: 'https://news.google.com/rss/search?q=India+GDP+OR+inflation+CPI+India+when:3d&hl=en-IN&gl=IN&ceid=IN:en', category: 'macro' },
    ],
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'industry';

    const cacheKey = category;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    const feedList = FEEDS[category] || FEEDS.industry;
    const results: { title: string; link: string; pubDate: string; source: string; badge?: string }[] = [];

    await Promise.allSettled(
        feedList.map(async (feed) => {
            try {
                const items = await fetchRSS(feed.url);
                for (const item of items.slice(0, 8)) {
                    results.push({ ...item, source: feed.name, badge: feed.badge });
                }
            } catch {
                // Feed failed silently
            }
        })
    );

    // Sort by date descending
    results.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
    });

    const response = results.slice(0, 30);
    cache.set(cacheKey, { data: response, ts: Date.now() });

    return NextResponse.json(response);
}
