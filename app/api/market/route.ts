import { NextResponse } from 'next/server';
import type { MarketQuote } from '@/types';

// In-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
            },
            next: { revalidate: 300 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose || meta.chartPreviousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;
        return { price, change, changePercent };
    } catch {
        return null;
    }
}

const INSTRUMENTS: { symbol: string; label: string; currency: string; type: MarketQuote['type'] }[] = [
    { symbol: '^NSEI', label: 'Nifty 50', currency: 'INR', type: 'index' },
    { symbol: '^BSESN', label: 'Sensex', currency: 'INR', type: 'index' },
    { symbol: 'NIFTYBANK.NS', label: 'Nifty Bank', currency: 'INR', type: 'index' },
    { symbol: 'INDIAVIX.NS', label: 'India VIX', currency: 'INR', type: 'index' },
    { symbol: 'INR=X', label: 'USD/INR', currency: 'INR', type: 'forex' },
    { symbol: 'EURINR=X', label: 'EUR/INR', currency: 'INR', type: 'forex' },
    { symbol: '^TNX', label: 'US 10Y', currency: 'USD', type: 'bond' },
    { symbol: 'LICI.NS', label: 'LIC India', currency: 'INR', type: 'equity' },
    { symbol: 'HDFCLIFE.NS', label: 'HDFC Life', currency: 'INR', type: 'equity' },
    { symbol: 'SBILIFE.NS', label: 'SBI Life', currency: 'INR', type: 'equity' },
    { symbol: 'ICICIPRULI.NS', label: 'ICICI Pru Life', currency: 'INR', type: 'equity' },
    { symbol: 'STARHEALTH.NS', label: 'Star Health', currency: 'INR', type: 'equity' },
    { symbol: 'POLICYBZR.NS', label: 'PB Fintech', currency: 'INR', type: 'equity' },
];

export async function GET() {
    const cacheKey = 'market-all';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    const quotes = await Promise.all(
        INSTRUMENTS.map(async (inst) => {
            const data = await fetchQuote(inst.symbol);
            return {
                ...inst,
                price: data?.price ?? null,
                change: data?.change ?? null,
                changePercent: data?.changePercent ?? null,
            } as MarketQuote;
        })
    );

    cache.set(cacheKey, { data: quotes, ts: Date.now() });
    return NextResponse.json(quotes);
}
