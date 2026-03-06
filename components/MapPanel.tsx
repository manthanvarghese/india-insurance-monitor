'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { CatEvent } from '@/types';

export default function MapPanel() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const hotspotMarkers = useRef<maplibregl.Marker[]>([]);
    const catEventMarkers = useRef<maplibregl.Marker[]>([]);
    const [layers, setLayers] = useState({
        hotspots: true,
        catEvents: true,
        hospitals: false,
    });

    // Toggle marker visibility when layer state changes
    useEffect(() => {
        hotspotMarkers.current.forEach(m => {
            (m.getElement() as HTMLElement).style.display = layers.hotspots ? 'block' : 'none';
        });
    }, [layers.hotspots]);

    useEffect(() => {
        catEventMarkers.current.forEach(m => {
            (m.getElement() as HTMLElement).style.display = layers.catEvents ? 'block' : 'none';
        });
    }, [layers.catEvents]);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors',
                    }
                },
                layers: [
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm',
                        paint: {
                            'raster-opacity': 0.3,
                            'raster-hue-rotate': 180,
                            'raster-brightness-max': 0.4,
                            'raster-saturation': -0.8,
                        }
                    }
                ],
            },
            center: [78.9629, 23.5937],
            zoom: 4,
            pitch: 0,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', async () => {
            // Hotspot markers
            const hotspots = [
                { name: 'Mumbai Corridor', coords: [72.8777, 19.0760] as [number, number], risk: 'high' },
                { name: 'Delhi NCR', coords: [77.2090, 28.6139] as [number, number], risk: 'high' },
                { name: 'Bangalore Tech Center', coords: [77.5946, 12.9716] as [number, number], risk: 'medium' },
            ];

            hotspots.forEach(h => {
                const el = document.createElement('div');
                el.className = 'live-dot';
                el.style.width = '12px';
                el.style.height = '12px';
                el.style.borderRadius = '50%';
                el.style.background = h.risk === 'high' ? '#ef4444' : '#f59e0b';
                el.style.boxShadow = `0 0 10px ${h.risk === 'high' ? '#ef4444' : '#f59e0b'}`;

                const marker = new maplibregl.Marker(el)
                    .setLngLat(h.coords)
                    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${h.name}</b><br/>Severity: ${h.risk.toUpperCase()}`))
                    .addTo(map.current!);
                hotspotMarkers.current.push(marker);
            });

            // Cat event markers from API
            try {
                const res = await fetch('/api/catevents');
                const events: CatEvent[] = await res.json();
                const catColors: Record<CatEvent['severity'], string> = {
                    critical: '#991b1b',
                    high: '#ef4444',
                    medium: '#f59e0b',
                    low: '#10b981',
                };
                const catIcons: Record<CatEvent['type'], string> = {
                    earthquake: '🌋', flood: '🌊', cyclone: '🌀', fire: '🔥', other: '📍',
                };

                events.forEach(ev => {
                    const el = document.createElement('div');
                    el.title = ev.title;
                    el.style.width = '20px';
                    el.style.height = '20px';
                    el.style.borderRadius = '50%';
                    el.style.background = catColors[ev.severity];
                    el.style.border = '2px solid rgba(255,255,255,0.3)';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.fontSize = '10px';
                    el.style.cursor = 'pointer';
                    el.textContent = catIcons[ev.type];

                    const marker = new maplibregl.Marker(el)
                        .setLngLat([ev.lng, ev.lat])
                        .setPopup(
                            new maplibregl.Popup({ offset: 25 }).setHTML(
                                `<b>${ev.title}</b><br/>Severity: ${ev.severity.toUpperCase()}<br/>Source: ${ev.source}`
                            )
                        )
                        .addTo(map.current!);
                    catEventMarkers.current.push(marker);
                });
            } catch {
                // Cat events failed silently
            }
        });

        return () => {
            map.current?.remove();
            map.current = null;
            hotspotMarkers.current = [];
            catEventMarkers.current = [];
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} id="map-container" />

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
                zIndex: 10,
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
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} /> High Risk
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} /> Elevated
                    </div>
                </div>
            </div>
        </div>
    );
}