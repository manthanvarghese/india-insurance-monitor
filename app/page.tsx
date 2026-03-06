'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NewsFeedPanel from '@/components/NewsFeedPanel';
import MarketPanel from '@/components/MarketPanel';
import CatRadarPanel from '@/components/CatRadarPanel';
import CompetitorPanel from '@/components/CompetitorPanel';
import ReinsurancePanel from '@/components/ReinsurancePanel';
import MacroPanel from '@/components/MacroPanel';
import HeaderBar from '@/components/HeaderBar';
import TickerBar from '@/components/TickerBar';
import LiveNewsPanel from '@/components/LiveNewsPanel';

const MapPanel = dynamic(() => import('@/components/MapPanel'), { ssr: false });

export default function Dashboard() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <HeaderBar time={time} />

      {/* Ticker */}
      <TickerBar />

      {/* Main grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '2fr 1.4fr 1.4fr 1.3fr',
        gridTemplateRows: '1fr 1fr',
        gap: '6px',
        padding: '6px',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Row 1, Col 1: Map (spans 2 rows) */}
        <div style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }} className="panel">
          <MapPanel />
        </div>

        {/* Row 1, Col 2: IRDAI Watch */}
        <div style={{ gridRow: '1 / 2', gridColumn: '2 / 3' }} className="panel">
          <NewsFeedPanel
            title="IRDAI & Regulatory Watch"
            category="irdai"
            badge="REGULATORY"
            badgeColor="#8b5cf6"
            icon="⚖️"
          />
        </div>

        {/* Row 1, Col 3: Catastrophe Radar */}
        <div style={{ gridRow: '1 / 2', gridColumn: '3 / 4' }} className="panel">
          <CatRadarPanel />
        </div>

        {/* Row 1, Col 4: Live News */}
        <div style={{ gridRow: '1 / 2', gridColumn: '4 / 5' }} className="panel">
          <LiveNewsPanel />
        </div>

        {/* Row 2, Col 2: Market Pulse */}
        <div style={{ gridRow: '2 / 3', gridColumn: '2 / 3' }} className="panel">
          <MarketPanel />
        </div>

        {/* Row 2, Col 3: Competitor Intel */}
        <div style={{ gridRow: '2 / 3', gridColumn: '3 / 4' }} className="panel">
          <CompetitorPanel />
        </div>

        {/* Row 2, Col 4: Industry News */}
        <div style={{ gridRow: '2 / 3', gridColumn: '4 / 5' }} className="panel">
          <NewsFeedPanel
            title="India Industry News"
            category="industry"
            badge="INDUSTRY"
            badgeColor="#10b981"
            icon="📰"
          />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '6px',
        padding: '0 6px 6px',
        height: '190px',
        flexShrink: 0,
      }}>
        <div className="panel">
          <NewsFeedPanel
            title="Broking Intelligence"
            category="broking"
            badge="BROKING"
            badgeColor="#00ff00"
            icon="🤝"
          />
        </div>
        <div className="panel">
          <ReinsurancePanel />
        </div>
        <div className="panel">
          <NewsFeedPanel
            title="Digital Insurance & Insurtech"
            category="digital"
            badge="INSURTECH"
            badgeColor="#06b6d4"
            icon="🔮"
          />
        </div>
      </div>
    </div>
  );
}
