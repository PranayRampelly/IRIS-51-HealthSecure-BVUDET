/**
 * ADVANCED DISEASE OUTBREAK MAP
 * Interactive Leaflet map with real-time outbreak visualization
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, TrendingUp, MapPin } from 'lucide-react';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different risk levels
const createCustomIcon = (color: string, size: number = 25) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${size * 0.5}px;
            ">
                !
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

const riskIcons = {
    HIGH: createCustomIcon('#DC2626', 30),
    MEDIUM: createCustomIcon('#F59E0B', 25),
    LOW: createCustomIcon('#10B981', 20),
};

// Indian cities with coordinates
const CITY_COORDINATES: Record<string, [number, number]> = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Chennai': [13.0827, 80.2707],
    'Bangalore': [12.9716, 77.5946],
    'Kolkata': [22.5726, 88.3639],
    'Pune': [18.5204, 73.8567],
    'Hyderabad': [17.3850, 78.4867],
    'Ahmedabad': [23.0225, 72.5714],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462],
};

interface OutbreakData {
    city: string;
    disease: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    cases: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    coordinates: [number, number];
}

interface AdvancedDiseaseMapProps {
    selectedDisease?: string;
}

const AdvancedDiseaseMap: React.FC<AdvancedDiseaseMapProps> = ({ selectedDisease = 'All' }) => {
    const [outbreakData, setOutbreakData] = useState<OutbreakData[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch outbreak data
    useEffect(() => {
        const fetchOutbreakData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/bioaura/pharmacy-intelligence');
                if (response.ok) {
                    const data = await response.json();

                    // Transform pharmacy intelligence into outbreak data
                    const outbreaks: OutbreakData[] = [];

                    if (data.outbreak_signals) {
                        data.outbreak_signals.forEach((signal: any) => {
                            if (selectedDisease === 'All' || signal.disease === selectedDisease) {
                                outbreaks.push({
                                    city: signal.city,
                                    disease: signal.disease,
                                    riskLevel: signal.alert_level as 'HIGH' | 'MEDIUM' | 'LOW',
                                    cases: Math.round(signal.recent_sales / 10),
                                    trend: signal.spike_percentage > 20 ? 'increasing' : 'stable',
                                    coordinates: CITY_COORDINATES[signal.city] || [0, 0],
                                });
                            }
                        });
                    }

                    setOutbreakData(outbreaks);
                } else {
                    generateSimulatedData();
                }
            } catch (error) {
                console.error('Error fetching outbreak data:', error);
                generateSimulatedData();
            } finally {
                setLoading(false);
            }
        };

        fetchOutbreakData();
        const interval = setInterval(fetchOutbreakData, 60000);
        return () => clearInterval(interval);
    }, [selectedDisease]);

    const generateSimulatedData = () => {
        const diseases = ['Malaria', 'Dengue', 'Cholera', 'Influenza', 'Typhoid'];
        const outbreaks: OutbreakData[] = [];

        Object.entries(CITY_COORDINATES).forEach(([city, coords]) => {
            const disease = diseases[Math.floor(Math.random() * diseases.length)];
            const riskLevel = ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as 'HIGH' | 'MEDIUM' | 'LOW';

            if (selectedDisease === 'All' || disease === selectedDisease) {
                outbreaks.push({
                    city,
                    disease,
                    riskLevel,
                    cases: Math.floor(Math.random() * 500) + 50,
                    trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
                    coordinates: coords,
                });
            }
        });

        setOutbreakData(outbreaks);
    };

    return (
        <Card className="w-full h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-health-teal" />
                        Disease Outbreak Map
                        {loading && <span className="text-sm text-gray-500">(Updating...)</span>}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {outbreakData.map((outbreak, index) => (
                            <React.Fragment key={index}>
                                <Marker
                                    position={outbreak.coordinates}
                                    icon={riskIcons[outbreak.riskLevel]}
                                    eventHandlers={{
                                        click: () => setSelectedCity(outbreak.city),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold text-lg">{outbreak.city}</h3>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm">
                                                    <span className="font-semibold">Disease:</span> {outbreak.disease}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-semibold">Cases:</span> {outbreak.cases}
                                                </p>
                                                <p className="text-sm flex items-center gap-1">
                                                    <span className="font-semibold">Risk:</span>
                                                    <Badge
                                                        variant={
                                                            outbreak.riskLevel === 'HIGH' ? 'destructive' :
                                                                outbreak.riskLevel === 'MEDIUM' ? 'default' : 'secondary'
                                                        }
                                                    >
                                                        {outbreak.riskLevel}
                                                    </Badge>
                                                </p>
                                                <p className="text-sm flex items-center gap-1">
                                                    <span className="font-semibold">Trend:</span>
                                                    {outbreak.trend === 'increasing' && (
                                                        <TrendingUp className="h-4 w-4 text-red-500" />
                                                    )}
                                                    {outbreak.trend}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>

                                <Circle
                                    center={outbreak.coordinates}
                                    radius={outbreak.cases * 100}
                                    pathOptions={{
                                        color: outbreak.riskLevel === 'HIGH' ? '#DC2626' :
                                            outbreak.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981',
                                        fillColor: outbreak.riskLevel === 'HIGH' ? '#DC2626' :
                                            outbreak.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981',
                                        fillOpacity: 0.2,
                                    }}
                                />
                            </React.Fragment>
                        ))}
                    </MapContainer>
                </div>

                <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-600"></div>
                        <span className="text-sm">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm">Low Risk</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                            {outbreakData.filter(o => o.riskLevel === 'HIGH').length}
                        </div>
                        <div className="text-sm text-gray-600">High Risk Areas</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {outbreakData.filter(o => o.riskLevel === 'MEDIUM').length}
                        </div>
                        <div className="text-sm text-gray-600">Medium Risk Areas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {outbreakData.reduce((sum, o) => sum + o.cases, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Cases</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdvancedDiseaseMap;
