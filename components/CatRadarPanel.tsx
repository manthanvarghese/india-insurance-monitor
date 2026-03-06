'use client';

import { useEffect, useState } from 'react';
import type { CatEvent } from '@/types';

const SEVERITY_COLORS = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#991b1b',
};

const TYPE_ICONS = {
    earthquake: '🌋',
    flood: '🌊',
    cyclone: '🌀',
    fire: '🔥',
    other: '📍',
};

export default function CatRadarPanel() {
    const [events, setEvents] = useState<CatEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/catevents')
            .then(r => r.json())
            .then(d => { setEvents(d); setLoading(false); })
            .catch(() => setLoading(false));

        const iv = setInterval(() => {
            fetch('/api/catevents').then(r => r.json()).then(d => setEvents(d)).catch(() => { });
        }, 10 * 60 * 1000);
        return () => clearInterval(iv);
    }, []);

    return (
        <>
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>🌪️</span>
                    <span className="panel-title">Catastrophe Radar</span>
                </div>
                <span className="badge badge-alert">ACTIVE MONITORING</span>
            </div>

            <div className="panel-body">
                {loading ? (
                    <div style={{ padding: '12px' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="loading-shimmer" style={{ height: '48px', borderRadius: '4px', marginBottom: '8px' }} />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No recent major events detected
                    </div>
                ) : (
                    events.slice(0, 10).map((ev) => (
                        <div key={ev.id} className="news-item" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{
                                fontSize: '18px',
                                width: '32px',
                                height: '32px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: `1px solid ${SEVERITY_COLORS[ev.severity]}33`,
                            }}>
                                {TYPE_ICONS[ev.type]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {ev.location}
                                    </span>
                                    <span style={{
                                        fontSize: '8px',
                                        fontWeight: 900,
                                        color: SEVERITY_COLORS[ev.severity],
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {ev.severity}
                                    </span>
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                    {ev.title}
                                </div>
                                <div className="severity-bar" style={{
                                    width: '100%',
                                    background: 'var(--border)',
                                }}>
                                    <div className="severity-bar" style={{
                                        width: ev.severity === 'critical' ? '100%' : ev.severity === 'high' ? '70%' : ev.severity === 'medium' ? '40%' : '15%',
                                        background: SEVERITY_COLORS[ev.severity],
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{ev.source}</span>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
