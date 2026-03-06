'use client';

import { useState } from 'react';

// YouTube live stream video IDs for Indian financial news channels.
// These are 24/7 live stream video IDs — update if a channel changes its stream.
const CHANNELS = [
    {
        name: 'CNBC TV18',
        videoId: 'CHMP_8CsqFE',
        watchUrl: 'https://www.youtube.com/@cnbctv18news/live',
        badge: 'CNBC TV18',
        color: '#e11d48',
    },
    {
        name: 'NDTV Profit',
        videoId: 'vN1Oc4lEIdo',
        watchUrl: 'https://www.youtube.com/@NDTVProfitNews/live',
        badge: 'NDTV Profit',
        color: '#f97316',
    },
    {
        name: 'ET Now',
        videoId: 'hSC6_2FJ4x8',
        watchUrl: 'https://www.youtube.com/@ETNow/live',
        badge: 'ET Now',
        color: '#0ea5e9',
    },
    {
        name: 'Bloomberg',
        videoId: 'dp8PhLsUcFE',
        watchUrl: 'https://www.youtube.com/@BloombergTV/live',
        badge: 'Bloomberg',
        color: '#6366f1',
    },
];

export default function LiveNewsPanel() {
    const [active, setActive] = useState(0);
    const channel = CHANNELS[active];
    const src = `https://www.youtube.com/embed/${channel.videoId}?autoplay=1&mute=1`;

    return (
        <>
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>📺</span>
                    <span className="panel-title">Live Market News</span>
                </div>
                <span className="badge badge-live">LIVE</span>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap' }}>
                {CHANNELS.map((ch, i) => (
                    <button
                        key={ch.videoId}
                        onClick={() => setActive(i)}
                        style={{
                            padding: '2px 7px',
                            fontSize: '9px',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            border: `1px solid ${i === active ? ch.color : 'transparent'}`,
                            borderRadius: '2px',
                            background: i === active ? `${ch.color}22` : 'transparent',
                            color: i === active ? ch.color : 'var(--text-muted)',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                        }}
                    >
                        {ch.badge}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <iframe
                    key={channel.videoId}
                    src={src}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                {/* Fallback link always visible at bottom */}
                <a
                    href={channel.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: '#000000cc',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '3px',
                        textDecoration: 'none',
                        letterSpacing: '0.06em',
                        border: '1px solid #333',
                    }}
                >
                    ▶ WATCH ON YOUTUBE
                </a>
            </div>
        </>
    );
}