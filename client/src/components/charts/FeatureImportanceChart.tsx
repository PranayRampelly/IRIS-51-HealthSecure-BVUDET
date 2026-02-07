import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BrainCircuit, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeatureData {
    feature: string;
    importance: number;
}

interface FeatureImportanceChartProps {
    disease: string;
    features: FeatureData[];
    totalFeatures: number;
}

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ disease, features, totalFeatures }) => {
    // Format feature names for display
    const formattedData = features.slice(0, 10).map(f => ({
        ...f,
        displayName: f.feature
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        importancePercent: (f.importance * 100).toFixed(2)
    }));

    // Color scale based on importance
    const getColor = (importance: number) => {
        if (importance > 0.15) return '#DC2626'; // High importance - red
        if (importance > 0.10) return '#F59E0B'; // Medium importance - orange
        if (importance > 0.05) return '#10B981'; // Low-medium importance - green
        return '#6B7280'; // Low importance - gray
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-health-charcoal mb-1">
                        {data.displayName}
                    </p>
                    <p className="text-sm text-gray-600">
                        Importance: {data.importancePercent}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Contribution to {disease} prediction
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-health-teal" />
                    ML Model Feature Importance - {disease}
                </CardTitle>
                <Alert className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        Top 10 of {totalFeatures} features that most influence {disease} predictions
                    </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={formattedData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                type="number"
                                domain={[0, 'dataMax']}
                                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                stroke="#6B7280"
                            />
                            <YAxis
                                type="category"
                                dataKey="displayName"
                                width={140}
                                stroke="#6B7280"
                                style={{ fontSize: '11px' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="importance"
                                radius={[0, 4, 4, 0]}
                            >
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.importance)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Color legend */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-600 rounded"></div>
                        <span>High (&gt;15%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>Medium (10-15%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Low-Med (5-10%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-500 rounded"></div>
                        <span>Low (&lt;5%)</span>
                    </div>
                </div>

                {/* Model info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Model Type:</strong> Random Forest Ensemble
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                        <strong>Training Data:</strong> 162,443 samples across 8 Indian cities
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                        <strong>Accuracy:</strong> {disease === 'Malaria' || disease === 'Heat Stroke' || disease === 'Respiratory Diseases' ? '100%' : disease === 'Dengue' ? '99.85%' : '99.28%'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default FeatureImportanceChart;
