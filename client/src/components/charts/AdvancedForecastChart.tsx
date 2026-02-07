import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface ForecastDataPoint {
    date: string;
    month: string;
    risk: number;
    temp: number;
    temp_max: number;
    temp_min: number;
    rainfall: number;
    humidity: number;
    source?: string;
}

interface AdvancedForecastChartProps {
    data: ForecastDataPoint[];
    disease: string;
    city: string;
}

const AdvancedForecastChart: React.FC<AdvancedForecastChartProps> = ({ data, disease, city }) => {
    // Add confidence intervals (±10%)
    const dataWithConfidence = data.map(point => ({
        ...point,
        riskUpper: Math.min(point.risk + 10, 100),
        riskLower: Math.max(point.risk - 10, 0),
        displayMonth: point.month || point.date.split('-')[1]
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-health-charcoal mb-2">
                        {data.date || data.month}
                    </p>
                    <div className="space-y-1 text-sm">
                        <p className="text-health-danger font-medium">
                            Risk: {data.risk}% ({data.riskLower}-{data.riskUpper}%)
                        </p>
                        <p className="text-orange-600">
                            Temp: {data.temp}°C ({data.temp_min}-{data.temp_max}°C)
                        </p>
                        <p className="text-blue-600">
                            Rainfall: {data.rainfall}mm
                        </p>
                        <p className="text-teal-600">
                            Humidity: {data.humidity}%
                        </p>
                        {data.source && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                                Source: {data.source}
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-health-teal" />
                    12-Month {disease} Risk Forecast - {city}
                    <span className="text-sm font-normal text-gray-500 ml-auto">
                        ML-Powered Predictions
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataWithConfidence}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="displayMonth"
                                stroke="#6B7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#DC2626"
                                label={{ value: 'Risk (%)', angle: -90, position: 'insideLeft', style: { fill: '#DC2626' } }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#F59E0B"
                                label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight', style: { fill: '#F59E0B' } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />

                            {/* Confidence interval area */}
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="riskUpper"
                                stackId="1"
                                stroke="none"
                                fill="#FEE2E2"
                                fillOpacity={0.3}
                                name="Confidence Range"
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="riskLower"
                                stackId="1"
                                stroke="none"
                                fill="#FFFFFF"
                                fillOpacity={1}
                            />

                            {/* Main risk line */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="risk"
                                stroke="#DC2626"
                                strokeWidth={3}
                                dot={{ fill: '#DC2626', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Disease Risk"
                            />

                            {/* Temperature overlay */}
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="temp"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                fill="url(#colorTemp)"
                                name="Temperature"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend info */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-600 rounded"></div>
                        <span>Risk with ±10% confidence interval</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-200 rounded"></div>
                        <span>Temperature trend</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdvancedForecastChart;
