/**
 * PHARMACY INTELLIGENCE DASHBOARD
 * Comprehensive view of pharmacy data for disease outbreak detection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Activity,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Package,
    ShoppingCart,
    BarChart3,
    MapPin,
    Pill,
    Heart
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import AdvancedDiseaseMap from '@/components/maps/AdvancedDiseaseMap';

const COLORS = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const PharmacyIntelligence: React.FC = () => {
    const [intelligenceData, setIntelligenceData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState('All');

    useEffect(() => {
        fetchIntelligenceData();
        const interval = setInterval(fetchIntelligenceData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [selectedCity]);

    const fetchIntelligenceData = async () => {
        try {
            setLoading(true);
            setError(null);

            const url = selectedCity === 'All'
                ? '/api/bioaura/pharmacy-intelligence'
                : `/api/bioaura/pharmacy-intelligence?city=${selectedCity}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setIntelligenceData(data);
            } else {
                throw new Error('Failed to fetch pharmacy intelligence');
            }
        } catch (err) {
            console.error('Error fetching pharmacy intelligence:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getHealthIndexColor = (index: number) => {
        if (index >= 70) return 'text-green-600 bg-green-50';
        if (index >= 40) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-red-500" />;
        if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-health-navy flex items-center gap-2">
                        <Pill className="h-8 w-8 text-health-teal" />
                        Pharmacy Intelligence
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Real-time disease outbreak detection from pharmacy sales data
                    </p>
                </div>
                {loading && (
                    <Badge variant="outline" className="animate-pulse">
                        <Activity className="h-3 w-3 mr-1" />
                        Updating...
                    </Badge>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">AI Overview</TabsTrigger>
                    <TabsTrigger value="outbreaks">Disease Alerts</TabsTrigger>
                    <TabsTrigger value="health">Health Index</TabsTrigger>
                    <TabsTrigger value="demand">Demand Patterns</TabsTrigger>
                    <TabsTrigger value="map">Regional Map</TabsTrigger>
                </TabsList>

                {/* AI Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Alerts</p>
                                        <p className="text-3xl font-bold text-red-600">
                                            {intelligenceData?.outbreak_signals?.filter((s: any) => s.alert_level === 'HIGH').length || 0}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-10 w-10 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Signals</p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {intelligenceData?.outbreak_signals?.length || 0}
                                        </p>
                                    </div>
                                    <Activity className="h-10 w-10 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Health Index</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {intelligenceData?.health_indices?.length > 0
                                                ? Math.round(intelligenceData.health_indices.reduce((sum: number, h: any) => sum + h.health_index, 0) / intelligenceData.health_indices.length)
                                                : 0}
                                        </p>
                                    </div>
                                    <Heart className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Monitored Cities</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {intelligenceData?.health_indices?.length || 0}
                                        </p>
                                    </div>
                                    <MapPin className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Outbreak Signals */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Recent Outbreak Signals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {intelligenceData?.outbreak_signals?.slice(0, 5).map((signal: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <Badge variant={signal.alert_level === 'HIGH' ? 'destructive' : 'default'}>
                                                {signal.alert_level}
                                            </Badge>
                                            <div>
                                                <p className="font-semibold">{signal.disease}</p>
                                                <p className="text-sm text-gray-600">{signal.city}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-red-600">
                                                +{signal.spike_percentage}% spike
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Confidence: {signal.confidence}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Disease Alerts Tab */}
                <TabsContent value="outbreaks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Disease Outbreak Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {intelligenceData?.outbreak_signals?.map((signal: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg">{signal.disease}</h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {signal.city}
                                                </p>
                                            </div>
                                            <Badge variant={signal.alert_level === 'HIGH' ? 'destructive' : 'default'}>
                                                {signal.alert_level} RISK
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Medicine Type</p>
                                                <p className="font-semibold">{signal.medicine_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Sales Spike</p>
                                                <p className="font-semibold text-red-600">+{signal.spike_percentage}%</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Confidence</p>
                                                <p className="font-semibold">{signal.confidence}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Health Index Tab */}
                <TabsContent value="health" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {intelligenceData?.health_indices?.map((health: any, index: number) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{health.city}</span>
                                        <Badge className={getHealthIndexColor(health.health_index)}>
                                            {health.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Health Index</span>
                                                <span className="text-2xl font-bold">{health.health_index}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${health.health_index >= 70 ? 'bg-green-500' :
                                                            health.health_index >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${health.health_index}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-gray-600">Total Medicine Sales</p>
                                            <p className="font-semibold">{health.total_medicine_sales?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Demand Patterns Tab */}
                <TabsContent value="demand" className="space-y-4">
                    {intelligenceData?.demand_patterns?.map((cityData: any, cityIndex: number) => (
                        <Card key={cityIndex}>
                            <CardHeader>
                                <CardTitle>{cityData.city} - Medicine Demand Patterns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {cityData.patterns?.map((pattern: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {getTrendIcon(pattern.trend)}
                                                <div>
                                                    <p className="font-semibold">{pattern.medicine_type}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {pattern.related_diseases.join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{pattern.current_demand}</p>
                                                <p className={`text-sm ${pattern.change_percentage > 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {pattern.change_percentage > 0 ? '+' : ''}{pattern.change_percentage}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Regional Map Tab */}
                <TabsContent value="map">
                    <AdvancedDiseaseMap />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PharmacyIntelligence;
