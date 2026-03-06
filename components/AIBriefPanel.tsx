'use client';

import { useState, useEffect } from 'react';

export default function AIBriefPanel() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setProgress(prev => (prev >= 100 ? 100 : prev + 5));
            }, 100);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 2500);
            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [loading]);

    return (
        <>
            <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>🤖</span>
                    <span className="panel-title">AI Situational Brief</span>
                </div>
                <span className="badge badge-new">BETA</span>
            </div>

            <div className="panel-body" style={{ padding: '16px' }}>
                {loading ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            Synthesizing industry signals & regulatory impacts...
                        </div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${progress}%`, transition: 'width 0.2s linear' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                            <span>Step 2/4: Analyzing risk priority</span>
                            <span>{progress}%</span>
                        </div>
                    </div>
                ) : (
                    <div className="panel-enter">
                        <div style={{
                            background: 'linear-gradient(135deg, #1e3a5f22 0%, #0d1f0d22 100%)',
                            border: '1px solid var(--border-bright)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="live-dot" style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                                EXECUTIVE SUMMARY — MARCH 2025
                            </div>
                            <p style={{ fontSize: '11px', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0 }}>
                                Industry focus is heavily weighted toward IRDAI&apos;s new cyber disclosure framework. Reinsurance markets are signaling a 12% rise in nat-cat capacity for India, though medical inflation continues to exceed actuarial baselines. Motor TP revision discussions are surfacing as a key H1 priority.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ fontSize: '14px', marginTop: '2px' }}>📢</div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#fcd34d', marginBottom: '2px' }}>REGULATORY ALERT</div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>
                                        IRDAI committee report on Bima Sugam integration due in 48h. Expect technical compliance deadlines.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ fontSize: '14px', marginTop: '2px' }}>⛈️</div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '2px' }}>WEATHER EXPOSURE</div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>
                                        Bay of Bengal cyclone formation indicates 14% increase in crop/property exposure for Odisha desk.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ fontSize: '14px', marginTop: '2px' }}>🏢</div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '2px' }}>COMPETITOR MOVE</div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>
                                        HDFC Life&apos;s new term product is gaining 4x social traction; potential pricing war in Tier-2 markets.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button style={{
                            marginTop: '16px',
                            width: '100%',
                            padding: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}>
                            REFRESH ANALYSIS
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
