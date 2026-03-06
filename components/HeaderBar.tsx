'use client';

interface HeaderBarProps {
    time: Date | null;
}

export default function HeaderBar({ time }: HeaderBarProps) {
    const isWeekend = time ? time.getDay() === 0 || time.getDay() === 6 : false;

    return (
        <div style={{
            background: '#06091a',
            borderBottom: '1px solid #1e2d4a',
            padding: '0 16px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 100,
        }}>
            {/* Left: Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: '#00ff00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#000',
                    fontWeight: 900,
                }}>
                    T
                </div>
                <div>
                    <div style={{
                        fontSize: '10px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        color: '#fff',
                        textTransform: 'uppercase',
                    }}>
                        Turtlemint CEO Monitor
                    </div>
                    <div style={{ fontSize: '8px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                        Situational Intelligence · Insurance Broking Focus
                    </div>
                </div>
            </div>

            {/* Center: Status pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#0d1f0d',
                    border: '1px solid #1a3a1a',
                    borderRadius: '5px',
                    padding: '4px 10px',
                }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                    }} className="live-dot" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em' }}>LIVE</span>
                </div>

                <div style={{
                    background: '#1a0a0a',
                    border: '1px solid #3a1a1a',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#f97316',
                    letterSpacing: '0.08em',
                }}>
                    🇮🇳 INDIA FOCUS
                </div>

                <div style={{
                    background: '#0a0a2a',
                    border: '1px solid #1a1a4a',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                }}>
                    {isWeekend ? '🔴 MARKETS CLOSED' : '🟢 MARKETS OPEN'}
                </div>
            </div>

            {/* Right: Clock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#e2e8f0',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.05em',
                    }}>
                        {time ? time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--'} IST
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>
                        {time ? time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#475569' }}>
                    <span>NYC {time ? time.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                    <span>LDN {time ? time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                    <span>ZRH {time ? time.toLocaleTimeString('de-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                </div>
            </div>
        </div>
    );
}
