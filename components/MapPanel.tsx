'use client';

import { useEffect, useRef, useState } from 'react';
import type { CatEvent } from '@/types';

export default function MapPanel() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<import('leaflet').Map | null>(null);
    const [layers, setLayers] = useState({
        hotspots: true,
        catEvents: true,
    });
    const hotspotLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
    const catLayerRef = useRef<import('leaflet').LayerGroup | null>(null);

    useEffect(() => {
        if (hotspotLayerRef.current) {
            const map = mapRef.current;
            if (!map) return;
            if (layers.hotspots) hotspotLayerRef.current.addTo(map);
            else hotspotLayerRef.current.remove();
        }
    }, [layers.hotspots]);

    useEffect(() => {
        if (catLayerRef.current) {
            const map = mapRef.current;
            if (!map) return;
            if (layers.catEvents) catLayerRef.current.addTo(map);
            else catLayerRef.current.remove();
        }
    }, [layers.catEvents]);

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        let destroyed = false;

        (async () => {
            const L = (await import('leaflet')).default;
            // Fix Leaflet default marker icon path issue with bundlers
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            if (destroyed || !mapContainer.current) return;

            const map = L.map(mapContainer.current, {
                center: [23.5937, 78.9629],
                zoom: 4,
                zoomControl: false,
            });
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap Contributors',
                opacity: 0.35,
                className: 'map-tiles-dark',
            }).addTo(map);

            L.control.zoom({ position: 'topright' }).addTo(map);

            // Hotspot markers
            const hotspots = [
                { name: 'Mumbai Corridor', lat: 19.0760, lng: 72.8777, risk: 'high' },
                { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, risk: 'high' },
                { name: 'Bangalore Tech Center', lat: 12.9716, lng: 77.5946, risk: 'medium' },
            ];

            const hotspotLayer = L.layerGroup();
            hotspots.forEach(h => {
                const color = h.risk === 'high' ? '#ef4444' : '#f59e0b';
                const icon = L.divIcon({
                    className: '',
                    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color};"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                });
                L.marker([h.lat, h.lng], { icon })
                    .bindPopup(`<b>${h.name}</b><br/>Severity: ${h.risk.toUpperCase()}`)
                    .addTo(hotspotLayer);
            });
            hotspotLayerRef.current = hotspotLayer;
            if (layers.hotspots) hotspotLayer.addTo(map);

            // Cat event markers
            const catLayer = L.layerGroup();
            catLayerRef.current = catLayer;
            if (layers.catEvents) catLayer.addTo(map);

            try {
                const res = await fetch('/api/catevents');
                const events: CatEvent[] = await res.json();
                const catColors: Record<CatEvent['severity'], string> = {
                    critical: '#991b1b', high: '#ef4444', medium: '#f59e0b', low: '#10b981',
                };
                const catIcons: Record<CatEvent['type'], string> = {
                    earthquake: '🌋', flood: '🌊', cyclone: '🌀', fire: '🔥', other: '📍',
                };

                events.forEach(ev => {
                    const icon = L.divIcon({
                        className: '',
                        html: `<div style="width:20px;height:20px;border-radius:50%;background:${catColors[ev.severity]};border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;">${catIcons[ev.type]}</div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                    });
                    L.marker([ev.lat, ev.lng], { icon })
                        .bindPopup(`<b>${ev.title}</b><br/>Severity: ${ev.severity.toUpperCase()}<br/>Source: ${ev.source}`)
                        .addTo(catLayer);
                });
            } catch {
                // Cat events failed silently
            }
        })();

        return () => {
            destroyed = true;
            mapRef.current?.remove();
            mapRef.current = null;
            hotspotLayerRef.current = null;
            catLayerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <style>{`
                .map-tiles-dark { filter: invert(1) hue-rotate(180deg) brightness(0.4) saturate(0.3); }
                .leaflet-popup-content-wrapper { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
                .leaflet-popup-tip { background: #1e293b; }
            `}</style>

            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* Map legend/controls overlay */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: '#0f172aee',
                border: '1px solid var(--border-bright)',
                borderRadius: '6px',
                padding: '10px',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                width: '160px',
            }}>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Map Layers
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(Object.entries(layers) as [keyof typeof layers, boolean][]).map(([key, val]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={val}
                                onChange={() => setLayers(prev => ({ ...prev, [key]: !val }))}
                                style={{ accentColor: 'var(--accent-blue)' }}
                            />
                            <span style={{ fontSize: '10px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                        </label>
                    ))}
                </div>
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>SEVERITY LEGEND</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> High Risk
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} /> Elevated
                    </div>
                </div>
            </div>
        </div>
    );
}