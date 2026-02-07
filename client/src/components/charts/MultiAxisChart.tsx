import React from 'react';
import {
    ComposedChart,
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

interface MultiAxisChartProps {
    data: any[];
    riskKey: string;
    tempKey?: string;
    rainfallKey?: string;
    riskColor?: string;
    showLegend?: boolean;
}

export const MultiAxisChart: React.FC<MultiAxisChartProps> = ({
    data,
    riskKey,
    tempKey,
    rainfallKey,
    riskColor = '#0D9488',
    showLegend = true
}) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-4 rounded-lg shadow-lg border border-gray-200"
                >
                    <p className="font-semibold text-gray-700 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-medium">{entry.value.toFixed(1)}{entry.unit || ''}</span>
                        </div>
                    ))}
                </motion.div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={riskColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={riskColor} stopOpacity={0.1} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                <XAxis
                    dataKey="month"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />

                {/* Left Y-axis for Risk */}
                <YAxis
                    yAxisId="risk"
                    stroke={riskColor}
                    label={{ value: 'Risk (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    domain={[0, 100]}
                />

                {/* Right Y-axis for Temperature */}
                {tempKey && (
                    <YAxis
                        yAxisId="temp"
                        orientation="right"
                        stroke="#F59E0B"
                        label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
                    />
                )}

                {/* Right Y-axis for Rainfall (if no temp) */}
                {rainfallKey && !tempKey && (
                    <YAxis
                        yAxisId="rainfall"
                        orientation="right"
                        stroke="#3B82F6"
                        label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
                    />
                )}

                <Tooltip content={<CustomTooltip />} />

                {showLegend && (
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                )}

                {/* Risk Area Chart */}
                <Area
                    yAxisId="risk"
                    type="monotone"
                    dataKey={riskKey}
                    stroke={riskColor}
                    strokeWidth={3}
                    fill="url(#riskGradient)"
                    name="Disease Risk"
                    animationDuration={1000}
                />

                {/* Temperature Line */}
                {tempKey && (
                    <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey={tempKey}
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', r: 4 }}
                        name="Temperature"
                        animationDuration={1000}
                    />
                )}

                {/* Rainfall Bars */}
                {rainfallKey && (
                    <Bar
                        yAxisId={tempKey ? "temp" : "rainfall"}
                        dataKey={rainfallKey}
                        fill="#3B82F6"
                        opacity={0.6}
                        name="Rainfall"
                        animationDuration={1000}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default MultiAxisChart;
