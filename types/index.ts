export interface CatEvent {
    id: string;
    title: string;
    type: 'earthquake' | 'flood' | 'cyclone' | 'fire' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    lat: number;
    lng: number;
    time: string;
    source: string;
    url?: string;
}

export interface MarketQuote {
    symbol: string;
    label: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    currency: string;
    type: 'index' | 'bond' | 'forex' | 'equity';
}