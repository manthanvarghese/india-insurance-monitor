'use client';

import { useEffect, useState } from 'react';

const TICKER_ITEMS = [
    { label: 'IRDAI', text: 'IRDAI mandates enhanced cyber risk disclosures for all insurers from FY25' },
    { label: 'MARKET', text: 'Nifty Private Bank index rebounds 1.2% as RBI signals accommodative stance' },
    { label: 'CAT', text: 'IMD issues cyclone watch for Bay of Bengal — estimated landfall in 72 hours' },
    { label: 'INDUSTRY', text: 'India non-life insurance premium crosses ₹3 lakh crore milestone in FY25' },
    { label: 'REINS', text: 'Swiss Re estimates India nat-cat losses at $4.8B for 2024' },
    { label: 'DIGITAL', text: 'Bima Sugam onboarding resumes — 18 insurers integrated as of March 2025' },
    { label: 'HEALTH', text: 'Medical inflation in India at 14.2% YoY — actuarial teams under pressure' },
    { label: 'MOTOR', text: 'Motor TP premium revision expected in H1 FY26 — IRDAI working group in session' },
    { label: 'M&A', text: 'PE interest in general insurance space rises; 3 deals at due diligence stage' },
    { label: 'MACRO', text: 'India 10Y G-Sec yield at 6.82% — ALM implications for life insurers flagged' },
];

export default function TickerBar() {
    const text = TICKER_ITEMS.map(i => `  ◆  ${i.label}   ${i.text}`).join('');

    return (
        <div style={{
            background: '#06091a',
            borderBottom: '1px solid #1e2d4a',
            height: '28px',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
        }}>
            <div style={{
                background: '#1d4ed8',
                padding: '0 12px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                borderRight: '1px solid #2563eb',
            }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#bfdbfe', textTransform: 'uppercase' }}>
                    INTELLIGENCE FEED
                </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="ticker-inner" style={{ color: '#94a3b8', fontSize: '11px' }}>
                    <span>{text}</span>
                    <span style={{ paddingLeft: '40px' }}>{text}</span>
                </div>
            </div>
        </div>
    );
}
