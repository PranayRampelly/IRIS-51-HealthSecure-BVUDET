import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface RiskBreakdownProps {
    temperature: number;
    rainfall: number;
    humidity: number;
    seasonal: number;
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({
    temperature,
    rainfall,
    humidity,
    seasonal
}) => {
    const data = [
        { name: 'Temperature', value: temperature, color: '#F59E0B' },
        { name: 'Rainfall', value: rainfall, color: '#3B82F6' },
        { name: 'Humidity', value: humidity, color: '#8B5CF6' },
        { name: 'Seasonal', value: seasonal, color: '#10B981' }
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
                >
                    <p className="font-semibold" style={{ color: payload[0].payload.color }}>
                        {payload[0].name}
                    </p>
                    <p className="text-sm text-gray-600">
                        Contribution: {payload[0].value.toFixed(1)}%
                    </p>
                </motion.div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskBreakdown;
