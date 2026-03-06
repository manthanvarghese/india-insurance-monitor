'use client';

import { useState } from 'react';

const CHANNELS = [
    { name: 'CNBC TV18', channelId: 'UCo5Zx2Kj5f4RAe0UtSwGDmw', badge: 'CNBC', color: '#e11d48' },
    { name: 'NDTV Profit', channelId: 'UCmF9KCi64QLdoZvAHEHtnJQ', badge: 'NDTV', color: '#f97316' },
    { name: 'ET Now', channelId: 'UCDt_0-U3hoDOkJHDANnLwgQ', badge: 'ET', color: '#0ea5e9' },
];

export default function LiveNewsPanel() {
    const [active, setActive] = useState(0);

    const channel = CHANNELS[active];
    const src = `https://www.youtube.com/embed/live_stream?channel=${channel.channelId}&autoplay=1&mute=1&enablejsapi=1`;

    return (
        <>
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>📺</span>
                    <span className="panel-title">Live Market News</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="badge badge-live">LIVE</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                {CHANNELS.map((ch, i) => (
                    <button
                        key={ch.channelId}
                        onClick={() => setActive(i)}
                        style={{
                            padding: '2px 8px',
                            fontSize: '9px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
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

            <div style={{ flex: 1, minHeight: 0 }}>
                <iframe
                    key={channel.channelId}
                    src={src}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </>
    );
}