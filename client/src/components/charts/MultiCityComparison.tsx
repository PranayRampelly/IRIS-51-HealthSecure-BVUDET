import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CityData {
    city: string;
    risk: number;
    temp: number;
    rain: number;
}

interface MultiCityComparisonProps {
    disease: string;
    cities: CityData[];
}

const MultiCityComparison: React.FC<MultiCityComparisonProps> = ({ disease, cities }) => {
    // Sort cities by risk (descending)
    const sortedCities = [...cities].sort((a, b) => b.risk - a.risk);

    const getRiskColor = (risk: number) => {
        if (risk > 70) return '#DC2626'; // High - red
        if (risk > 40) return '#F59E0B'; // Medium - orange
        if (risk > 20) return '#FCD34D'; // Low-medium - yellow
        return '#10B981'; // Low - green
    };

    const getRiskLevel = (risk: number) => {
        if (risk > 70) return 'HIGH';
        if (risk > 40) return 'MEDIUM';
        if (risk > 20) return 'LOW-MED';
        return 'LOW';
    };

    const getRiskBadgeColor = (risk: number) => {
        if (risk > 70) return 'bg-red-100 text-red-800 border-red-300';
        if (risk > 40) return 'bg-orange-100 text-orange-800 border-orange-300';
        if (risk > 20) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-green-100 text-green-800 border-green-300';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-health-charcoal mb-2">
                        {data.city}
                    </p>
                    <div className="space-y-1 text-sm">
                        <p className="text-health-danger font-medium">
                            {disease} Risk: {data.risk}%
                        </p>
                        <p className="text-orange-600">
                            Temperature: {data.temp}°C
                        </p>
                        <p className="text-blue-600">
                            Rainfall: {data.rain}mm
                        </p>
                        <p className="text-gray-600 mt-2">
                            Risk Level: <span className="font-semibold">{getRiskLevel(data.risk)}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Find highest and lowest risk cities
    const highestRisk = sortedCities[0];
    const lowestRisk = sortedCities[sortedCities.length - 1];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-health-teal" />
                    Multi-City {disease} Risk Comparison
                </CardTitle>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        <span className="text-gray-600">Highest:</span>
                        <span className="font-semibold text-health-charcoal">{highestRisk.city} ({highestRisk.risk}%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Lowest:</span>
                        <span className="font-semibold text-health-charcoal">{lowestRisk.city} ({lowestRisk.risk}%)</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Bar Chart */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedCities}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="city"
                                stroke="#6B7280"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6B7280"
                                label={{ value: 'Risk (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="risk"
                                radius={[8, 8, 0, 0]}
                            >
                                {sortedCities.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* City Cards */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sortedCities.map((city, index) => (
                        <div
                            key={city.city}
                            className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm text-health-charcoal">
                                    {city.city}
                                </span>
                                <span className="text-xs text-gray-500">
                                    #{index + 1}
                                </span>
                            </div>
                            <div className="text-2xl font-bold mb-1" style={{ color: getRiskColor(city.risk) }}>
                                {city.risk}%
                            </div>
                            <Badge className={`text-xs ${getRiskBadgeColor(city.risk)}`}>
                                {getRiskLevel(city.risk)}
                            </Badge>
                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                                <div>{city.temp}°C</div>
                                <div>{city.rain}mm rain</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Average Risk</p>
                        <p className="text-2xl font-bold text-health-charcoal">
                            {(cities.reduce((sum, c) => sum + c.risk, 0) / cities.length).toFixed(1)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">High Risk Cities</p>
                        <p className="text-2xl font-bold text-red-600">
                            {cities.filter(c => c.risk > 70).length}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Low Risk Cities</p>
                        <p className="text-2xl font-bold text-green-600">
                            {cities.filter(c => c.risk <= 20).length}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MultiCityComparison;
