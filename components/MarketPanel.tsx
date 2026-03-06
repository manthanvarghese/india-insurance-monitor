'use client';

import { useEffect, useState } from 'react';

interface MarketQuote {
    symbol: string;
    label: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    currency: string;
    type: 'index' | 'bond' | 'forex' | 'equity';
}

function formatPrice(price: number | null, currency: string): string {
    if (price === null) return '—';
    if (currency === 'INR' && price > 1000) return price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    return price.toFixed(2);
}

function ChangeIndicator({ pct }: { pct: number | null }) {
    if (pct === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    const up = pct >= 0;
    return (
        <span style={{ color: up ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700, fontSize: '10px' }}>
            {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
        </span>
    );
}

export default function MarketPanel() {
    const [quotes, setQuotes] = useState<MarketQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'index' | 'equity' | 'forex'>('index');

    useEffect(() => {
        fetch('/api/market')
            .then(r => r.json())
            .then(d => { setQuotes(d); setLoading(false); })
            .catch(() => setLoading(false));

        const iv = setInterval(() => {
            fetch('/api/market').then(r => r.json()).then(d => setQuotes(d)).catch(() => { });
        }, 5 * 60 * 1000);
        return () => clearInterval(iv);
    }, []);

    const filtered = quotes.filter(q =>
        activeTab === 'index' ? q.type === 'index' || q.type === 'bond' :
            activeTab === 'equity' ? q.type === 'equity' :
                q.type === 'forex'
    );

    return (
        <>
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>📈</span>
                    <span className="panel-title">India Market Pulse</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {(['index', 'equity', 'forex'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'index' ? 'Indices' : tab === 'equity' ? 'Stocks' : 'FX'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="panel-body">
                {loading ? (
                    <div style={{ padding: '8px' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="loading-shimmer" style={{ height: '36px', borderRadius: '4px', marginBottom: '4px' }} />
                        ))}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Instrument', 'Price', 'Change'].map(h => (
                                    <th key={h} style={{ padding: '6px 12px', fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Instrument' ? 'left' : 'right', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((q, i) => (
                                <tr key={q.symbol} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={{ padding: '8px 12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{q.label}</div>
                                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{q.symbol}</div>
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                                            {formatPrice(q.price, q.currency)}
                                        </div>
                                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{q.currency}</div>
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                        <ChangeIndicator pct={q.changePercent} />
                                        {q.change !== null && (
                                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                                                {q.change >= 0 ? '+' : ''}{q.change?.toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
