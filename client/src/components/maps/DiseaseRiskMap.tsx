import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CityData {
    city: string;
    risk: number;
    nextMonthRisk: number;
}

interface DiseaseRiskMapProps {
    regionalData: CityData[];
    diseaseColor: string;
    diseaseName: string;
    onCityClick: (city: string) => void;
}

// City coordinates for Indian cities
const CITY_COORDINATES: Record<string, [number, number]> = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Chennai': [13.0827, 80.2707],
    'Bangalore': [12.9716, 77.5946],
    'Kolkata': [22.5726, 88.3639],
    'Pune': [18.5204, 73.8567],
    'Hyderabad': [17.3850, 78.4867],
    'Ahmedabad': [23.0225, 72.5714],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Visakhapatnam': [17.6868, 83.2185],
    'Vijayawada': [16.5062, 80.6480]
};

// Component to fit bounds when data changes
const FitBounds: React.FC<{ coordinates: [number, number][] }> = ({ coordinates }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map]);

    return null;
};

const DiseaseRiskMap: React.FC<DiseaseRiskMapProps> = ({
    regionalData,
    diseaseColor,
    diseaseName,
    onCityClick
}) => {
    const getRiskColor = (risk: number): string => {
        if (risk > 70) return '#DC2626'; // red
        if (risk > 40) return '#F59E0B'; // yellow
        return '#10B981'; // green
    };

    const getRiskLabel = (risk: number): string => {
        if (risk > 70) return 'HIGH';
        if (risk > 40) return 'MEDIUM';
        return 'LOW';
    };

    const getMarkerRadius = (risk: number): number => {
        if (risk > 70) return 25;
        if (risk > 40) return 20;
        return 15;
    };

    // Get all coordinates for fitting bounds
    const allCoordinates = regionalData
        .map(city => CITY_COORDINATES[city.city])
        .filter(Boolean);

    return (
        <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-health-teal/20">
            <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds coordinates={allCoordinates} />

                {regionalData.map((cityData) => {
                    const coordinates = CITY_COORDINATES[cityData.city];
                    if (!coordinates) return null;

                    const riskColor = getRiskColor(cityData.risk);
                    const riskLabel = getRiskLabel(cityData.risk);
                    const radius = getMarkerRadius(cityData.risk);

                    return (
                        <CircleMarker
                            key={cityData.city}
                            center={coordinates}
                            radius={radius}
                            pathOptions={{
                                fillColor: riskColor,
                                fillOpacity: 0.7,
                                color: riskColor,
                                weight: 3,
                                opacity: 1
                            }}
                            eventHandlers={{
                                click: () => onCityClick(cityData.city)
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-lg">{cityData.city}</h4>
                                        <Badge
                                            className="text-white text-xs"
                                            style={{ backgroundColor: riskColor }}
                                        >
                                            {riskLabel}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Risk Level:</span>
                                            <span className="font-bold" style={{ color: diseaseColor }}>
                                                {cityData.risk}%
                                            </span>
                                        </div>

                                        <Progress value={cityData.risk} className="h-2" />

                                        <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                                            <span>Next Month:</span>
                                            <span className="flex items-center">
                                                {cityData.nextMonthRisk > cityData.risk ? (
                                                    <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                                                ) : cityData.nextMonthRisk < cityData.risk ? (
                                                    <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                                                ) : (
                                                    <Activity className="h-3 w-3 text-gray-500 mr-1" />
                                                )}
                                                {cityData.nextMonthRisk}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t text-xs text-gray-500">
                                        <p className="font-semibold">{diseaseName}</p>
                                        <p className="mt-1">Click marker to view full details</p>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default DiseaseRiskMap;
