'use client';

import { useEffect, useState, useCallback } from 'react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    badge?: string;
}

interface NewsFeedPanelProps {
    title: string;
    category: string;
    badge: string;
    badgeColor: string;
    icon: string;
}

function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsFeedPanel({ title, category, badge, badgeColor, icon }: NewsFeedPanelProps) {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchFeeds = useCallback(async () => {
        try {
            const res = await fetch(`/api/feeds?category=${category}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
                setLastUpdated(new Date());
            }
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchFeeds();
        const interval = setInterval(fetchFeeds, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchFeeds]);

    return (
        <>
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{icon}</span>
                    <span className="panel-title">{title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                            {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                    )}
                    <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: `${badgeColor}22`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}44`,
                        letterSpacing: '0.08em',
                    }}>
                        {badge}
                    </span>
                    <button
                        onClick={fetchFeeds}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', padding: '0 2px' }}
                        title="Refresh"
                    >
                        ↻
                    </button>
                </div>
            </div>

            <div className="panel-body">
                {loading ? (
                    <div style={{ padding: '0' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                                <div className="loading-shimmer" style={{ height: '12px', borderRadius: '4px', marginBottom: '6px', width: `${70 + i * 5}%` }} />
                                <div className="loading-shimmer" style={{ height: '10px', borderRadius: '4px', width: '40%' }} />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
                        No feed data available
                    </div>
                ) : (
                    items.map((item, i) => (
                        <a
                            key={item.link || `${item.source}-${i}`}
                            href={item.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="news-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.4',
                                        flex: 1,
                                    }}>
                                        {item.title}
                                    </div>
                                    {item.badge && (
                                        <span style={{
                                            fontSize: '8px',
                                            fontWeight: 700,
                                            padding: '1px 5px',
                                            borderRadius: '2px',
                                            background: `${badgeColor}22`,
                                            color: badgeColor,
                                            flexShrink: 0,
                                            letterSpacing: '0.05em',
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                                        {item.source}
                                    </span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {timeAgo(item.pubDate)}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </>
    );
}
