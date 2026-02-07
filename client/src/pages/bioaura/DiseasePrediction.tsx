// Disease Prediction System - Climate-based disease outbreak prediction
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Activity,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    MapPin,
    Cloud,
    Droplets,
    ThermometerSun,
    Wind,
    Calendar,
    Target,
    CheckCircle,
    XCircle,
    Info,
    ArrowRight,
    BarChart3,
    Globe,
    Zap,
    BrainCircuit,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import DiseaseRiskMap from '@/components/maps/DiseaseRiskMap';
import mlMetrics from '@/data/comprehensive_ml_metrics.json';
import AdvancedForecastChart from '@/components/charts/AdvancedForecastChart';
import FeatureImportanceChart from '@/components/charts/FeatureImportanceChart';
import MultiCityComparison from '@/components/charts/MultiCityComparison';
import { weatherService, WeatherData, ForecastData } from '@/services/weatherService';
import TrendIndicator from '@/components/charts/TrendIndicator';
import AutoRefresh from '@/components/realtime/AutoRefresh';
import AnimatedGauge from '@/components/charts/AnimatedGauge';
import MultiAxisChart from '@/components/charts/MultiAxisChart';
import RiskBreakdown from '@/components/charts/RiskBreakdown';

// Disease types with climate correlation
const DISEASES = {
    malaria: {
        name: 'Malaria',
        icon: Droplets,
        color: '#DC2626',
        optimalTemp: { min: 20, max: 30 },
        rainfallFactor: 'high',
        description: 'Mosquito-borne disease highly correlated with temperature and rainfall patterns'
    },
    dengue: {
        name: 'Dengue',
        icon: Droplets,
        color: '#EA580C',
        optimalTemp: { min: 22, max: 32 },
        rainfallFactor: 'high',
        description: 'Vector-borne disease with strong seasonal patterns during monsoon'
    },
    cholera: {
        name: 'Cholera',
        icon: Droplets,
        color: '#0891B2',
        optimalTemp: { min: 15, max: 35 },
        rainfallFactor: 'very-high',
        description: 'Waterborne disease linked to flooding and contaminated water sources'
    },
    heatStroke: {
        name: 'Heat-Related Illness',
        icon: ThermometerSun,
        color: '#DC2626',
        optimalTemp: { min: 35, max: 50 },
        rainfallFactor: 'low',
        description: 'Direct correlation with extreme temperature events'
    },
    respiratory: {
        name: 'Respiratory Diseases',
        icon: Wind,
        color: '#7C3AED',
        optimalTemp: { min: 10, max: 25 },
        rainfallFactor: 'medium',
        description: 'Linked to air quality, temperature variations, and seasonal changes'
    }
};

// Indian cities with historical data
const INDIAN_CITIES = [
    'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata',
    'Pune', 'Hyderabad', 'Ahmedabad', 'Coimbatore', 'Madurai',
    'Visakhapatnam', 'Vijayawada'
];

// Calculate disease risk using REAL API data + live weather
const calculateDiseaseRisk = (city: string, disease: string, month: number, apiData?: any, liveData?: WeatherData | null) => {
    // PRIORITY 1: Use real API data if available
    if (apiData && apiData[city] && apiData[city][disease] && apiData[city][disease][month] !== undefined) {
        let baseRisk = apiData[city][disease][month];

        // If we have live weather data, adjust the risk slightly based on current conditions
        if (liveData) {
            const isCurrentMonth = month === new Date().getMonth();
            if (isCurrentMonth) {
                // Adjust risk based on live data vs historical average
                const temp = liveData.temp;
                const rainfall = liveData.rain;

                // Small adjustments based on live conditions
                if (disease === 'Malaria' || disease === 'Dengue') {
                    if (rainfall > 100) baseRisk = Math.min(baseRisk + 10, 100);
                    if (temp >= 25 && temp <= 30) baseRisk = Math.min(baseRisk + 5, 100);
                } else if (disease === 'Heat Stroke') {
                    if (temp > 40) baseRisk = Math.min(baseRisk + 15, 100);
                } else if (disease === 'Respiratory Diseases') {
                    if (temp < 20) baseRisk = Math.min(baseRisk + 10, 100);
                }
            }
        }

        return Math.round(baseRisk);
    }

    // PRIORITY 2: Fallback to simulation if API data not available
    const climatePatterns: Record<string, any> = {
        Delhi: {
            temp: [15, 18, 23, 30, 35, 38, 35, 33, 32, 28, 22, 17],
            rainfall: [25, 20, 15, 10, 15, 65, 210, 250, 150, 10, 5, 15]
        },
        Mumbai: {
            temp: [24, 25, 27, 29, 30, 29, 27, 27, 27, 28, 27, 25],
            rainfall: [1, 1, 1, 1, 18, 485, 868, 540, 264, 64, 13, 3]
        },
        Chennai: {
            temp: [25, 26, 28, 31, 33, 33, 32, 31, 30, 29, 27, 25],
            rainfall: [24, 12, 13, 28, 51, 53, 86, 120, 119, 267, 309, 139]
        },
        Bangalore: {
            temp: [21, 23, 25, 27, 27, 25, 24, 24, 24, 24, 22, 21],
            rainfall: [5, 9, 18, 72, 109, 75, 90, 122, 173, 178, 66, 22]
        },
        Kolkata: {
            temp: [20, 23, 28, 31, 31, 30, 29, 29, 29, 28, 24, 20],
            rainfall: [10, 20, 30, 50, 130, 300, 350, 320, 280, 150, 20, 5]
        },
        Pune: {
            temp: [21, 23, 26, 29, 30, 28, 26, 25, 26, 26, 23, 21],
            rainfall: [2, 1, 2, 5, 25, 150, 200, 150, 180, 80, 20, 5]
        },
        Hyderabad: {
            temp: [22, 25, 28, 31, 33, 30, 28, 27, 27, 27, 24, 22],
            rainfall: [5, 8, 15, 25, 35, 110, 160, 150, 140, 100, 25, 5]
        },
        Ahmedabad: {
            temp: [20, 23, 28, 32, 34, 33, 30, 29, 30, 29, 25, 21],
            rainfall: [2, 1, 1, 2, 5, 80, 280, 200, 100, 20, 5, 1]
        }
    };

    const cityData = climatePatterns[city] || climatePatterns.Delhi;
    const isCurrentMonth = month === new Date().getMonth();
    const temp = (isCurrentMonth && liveData) ? liveData.temp : cityData.temp[month];
    const rainfall = (isCurrentMonth && liveData) ? liveData.rain : cityData.rainfall[month];

    const diseaseInfo = DISEASES[disease as keyof typeof DISEASES];
    if (!diseaseInfo) return 0;

    let risk = 0;

    // Temperature-based risk
    if (temp >= diseaseInfo.optimalTemp.min && temp <= diseaseInfo.optimalTemp.max) {
        risk += 40;
    } else if (Math.abs(temp - (diseaseInfo.optimalTemp.min + diseaseInfo.optimalTemp.max) / 2) < 5) {
        risk += 25;
    }

    // Rainfall-based risk
    if (diseaseInfo.rainfallFactor === 'very-high' && rainfall > 200) risk += 40;
    else if (diseaseInfo.rainfallFactor === 'high' && rainfall > 100) risk += 35;
    else if (diseaseInfo.rainfallFactor === 'medium' && rainfall > 50) risk += 20;
    else if (diseaseInfo.rainfallFactor === 'low' && rainfall < 50) risk += 30;

    // Seasonal patterns
    if (disease === 'malaria' && (month >= 6 && month <= 9)) risk += 20;
    if (disease === 'dengue' && (month >= 6 && month <= 10)) risk += 20;
    if (disease === 'cholera' && (month >= 5 && month <= 9)) risk += 15;
    if (disease === 'heatStroke' && (month >= 4 && month <= 6)) risk += 30;
    if (disease === 'respiratory' && (month >= 10 || month <= 2)) risk += 25;

    return Math.min(Math.max(risk, 0), 100);
};

const DiseasePrediction: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [selectedDisease, setSelectedDisease] = useState('Malaria');
    const [forecastMonths, setForecastMonths] = useState(12);
    const [activeTab, setActiveTab] = useState('overview');
    const [climateData, setClimateData] = useState<any>(null);
    const [diseaseRisks, setDiseaseRisks] = useState<any>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [liveWeatherData, setLiveWeatherData] = useState<WeatherData | null>(null);
    const [liveForecastData, setLiveForecastData] = useState<ForecastData[] | null>(null);
    const [previousRisk, setPreviousRisk] = useState<number>(0);

    // Advanced analytics state
    const [featureImportance, setFeatureImportance] = useState<any>(null);
    const [multiCityData, setMultiCityData] = useState<any>(null);
    const [advancedForecast, setAdvancedForecast] = useState<any>(null);

    const currentMonth = new Date().getMonth();

    // Fetch climate data and disease risks on component mount
    useEffect(() => {
        const fetchClimateData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/bioaura/disease-prediction/data');
                if (response.ok) {
                    const data = await response.json();
                    setClimateData(data.climateData);
                    setDiseaseRisks(data.diseaseRisks);
                    setMetadata(data.metadata);
                }
            } catch (err) {
                console.error('Error fetching climate data:', err);
                setError('Failed to load climate data');
            } finally {
                setLoading(false);
            }
        };
        fetchClimateData();
    }, []);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch live weather data when city changes
    useEffect(() => {
        const fetchWeather = async () => {
            const data = await weatherService.getCityWeather(selectedCity);
            setLiveWeatherData(data);
        };
        fetchWeather();
    }, [selectedCity]);

    // Fetch live forecast data when city changes
    useEffect(() => {
        const fetchForecast = async () => {
            const data = await weatherService.getCityForecast(selectedCity);
            setLiveForecastData(data);
        };
        fetchForecast();
    }, [selectedCity]);

    // Fetch feature importance when disease changes
    useEffect(() => {
        const fetchFeatureImportance = async () => {
            try {
                const response = await fetch(`/api/bioaura/feature-importance/${selectedDisease}`);
                if (response.ok) {
                    const data = await response.json();
                    setFeatureImportance(data);
                }
            } catch (err) {
                console.error('Error fetching feature importance:', err);
            }
        };
        fetchFeatureImportance();
    }, [selectedDisease]);

    // Fetch multi-city comparison when disease changes
    useEffect(() => {
        const fetchMultiCity = async () => {
            try {
                const response = await fetch(`/api/bioaura/multi-city-comparison/${selectedDisease}`);
                if (response.ok) {
                    const data = await response.json();
                    setMultiCityData(data);
                }
            } catch (err) {
                console.error('Error fetching multi-city data:', err);
            }
        };
        fetchMultiCity();
    }, [selectedDisease]);

    // Fetch 12-month forecast when city or disease changes
    useEffect(() => {
        const fetchAdvancedForecast = async () => {
            try {
                const response = await fetch(`/api/bioaura/ml-forecast/${selectedCity}?disease=${selectedDisease}&months=12`);
                if (response.ok) {
                    const data = await response.json();
                    setAdvancedForecast(data);
                }
            } catch (err) {
                console.error('Error fetching advanced forecast:', err);
            }
        };
        fetchAdvancedForecast();
    }, [selectedCity, selectedDisease]);

    // Handle refresh for auto-update
    const handleRefresh = async () => {
        // Store current risk as previous before fetching new data
        if (diseaseRisks && diseaseRisks[selectedCity] && diseaseRisks[selectedCity][selectedDisease]) {
            const currentRiskValue = diseaseRisks[selectedCity][selectedDisease][currentMonth];
            setPreviousRisk(currentRiskValue);
        }

        // Fetch fresh weather data
        const weather = await weatherService.getCityWeather(selectedCity);
        setLiveWeatherData(weather);

        const forecast = await weatherService.getCityForecast(selectedCity);
        setLiveForecastData(forecast);
    };

    // Generate forecast data using ML forecast endpoint (proper 12-month predictions)
    const generateForecast = () => {
        // PRIORITY 1: Use advancedForecast from ML forecast endpoint if available
        if (advancedForecast && Array.isArray(advancedForecast) && advancedForecast.length > 0) {
            return advancedForecast.slice(0, forecastMonths).map((item: any) => ({
                month: item.month,
                risk: item.risk || 0,
                temp: item.temp_max || item.temp || 0,
                rainfall: item.rainfall || 0,
                riskLevel: (item.risk || 0) > 70 ? 'High' : (item.risk || 0) > 40 ? 'Medium' : 'Low',
                isLive: item.source?.includes('API') || item.source?.includes('OpenWeather')
            }));
        }

        // FALLBACK: Use diseaseRisks if forecast not available
        if (!diseaseRisks || !diseaseRisks[selectedCity] || !diseaseRisks[selectedCity][selectedDisease]) {
            return [];
        }

        const forecast = [];
        const riskScores = diseaseRisks[selectedCity][selectedDisease];

        for (let i = 0; i < forecastMonths; i++) {
            const month = (currentMonth + i) % 12;
            let risk = riskScores[month];

            // If we have live forecast data for this period, use it to adjust the risk
            if (liveForecastData && i < liveForecastData.length) {
                const forecastDay = liveForecastData[i];
                // Create a temporary WeatherData object from ForecastData
                const tempWeatherData: WeatherData = {
                    temp: forecastDay.temp,
                    humidity: forecastDay.humidity,
                    rain: forecastDay.rain,
                    condition: forecastDay.condition,
                    icon: '' // Not needed for risk calculation
                };
                // Calculate risk using live forecast data + API data
                risk = calculateDiseaseRisk(selectedCity, selectedDisease, month, diseaseRisks, tempWeatherData);
            } else {
                // Use API data without live weather
                risk = calculateDiseaseRisk(selectedCity, selectedDisease, month, diseaseRisks);
            }

            // Get climate data for this month from climateData API
            let temp = 0;
            let rainfall = 0;

            if (climateData && climateData[selectedCity]) {
                const cityClimate = climateData[selectedCity];
                temp = cityClimate.avgTemp?.[month] || 0;
                rainfall = cityClimate.avgRainfall?.[month] || 0;
            }

            // If we have live forecast data, use it for temp/rainfall
            if (liveForecastData && i < liveForecastData.length) {
                const forecastDay = liveForecastData[i];
                temp = forecastDay.temp;
                rainfall = forecastDay.rain;
            }

            forecast.push({
                month: monthNames[month],
                risk,
                temp,
                rainfall,
                riskLevel: risk > 70 ? 'High' : risk > 40 ? 'Medium' : 'Low',
                isLive: liveForecastData && i < liveForecastData.length
            });
        }
        return forecast;
    };

    // Generate multi-disease comparison using real data
    const generateMultiDiseaseData = () => {
        if (!diseaseRisks || !diseaseRisks[selectedCity]) {
            return [];
        }

        const data = [];
        for (let i = 0; i < 6; i++) {
            const month = (currentMonth + i) % 12;
            const entry: any = { month: monthNames[month] };

            // Map disease names to match the data structure
            const diseaseMapping: Record<string, string> = {
                'malaria': 'Malaria',
                'dengue': 'Dengue',
                'cholera': 'Cholera',
                'heatStroke': 'Heat Stroke',
                'respiratory': 'Respiratory Diseases'
            };

            Object.keys(DISEASES).forEach(diseaseKey => {
                const diseaseName = diseaseMapping[diseaseKey];
                if (diseaseRisks[selectedCity][diseaseName]) {
                    entry[diseaseKey] = diseaseRisks[selectedCity][diseaseName][month];
                }
            });
            data.push(entry);
        }
        return data;
    };

    // Generate regional comparison using real data
    const generateRegionalData = () => {
        if (!diseaseRisks) {
            return [];
        }

        return INDIAN_CITIES.map(city => {
            const cityRisks = diseaseRisks[city];
            if (!cityRisks || !cityRisks[selectedDisease]) {
                return { city, risk: 0, nextMonthRisk: 0 };
            }

            return {
                city,
                risk: cityRisks[selectedDisease][currentMonth],
                nextMonthRisk: cityRisks[selectedDisease][(currentMonth + 1) % 12]
            };
        }).sort((a, b) => b.risk - a.risk);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto mb-4"></div>
                    <p className="text-health-blue-gray">Loading climate data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert className="max-w-md border-health-danger">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="font-semibold mb-2">Error Loading Data</div>
                        <p className="text-sm">{error}</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const forecastData = generateForecast();
    const multiDiseaseData = generateMultiDiseaseData();
    const regionalData = generateRegionalData();

    // Calculate current risk using live data if available
    const currentRisk = liveWeatherData
        ? calculateDiseaseRisk(selectedCity, selectedDisease, currentMonth, diseaseRisks, liveWeatherData)
        : (forecastData[0]?.risk || 0);

    const getRiskColor = (risk: number) => {
        if (risk > 70) return 'bg-health-danger';
        if (risk > 40) return 'bg-health-warning';
        return 'bg-health-success';
    };

    const getRiskTextColor = (risk: number) => {
        if (risk > 70) return 'text-health-danger';
        if (risk > 40) return 'text-health-warning';
        return 'text-health-success';
    };


    const getRecommendations = (disease: string, risk: number) => {
        // Map real disease names to recommendation keys
        const diseaseKey = disease.toLowerCase().replace(/[- ]/g, '');
        const keyMapping: Record<string, string> = {
            'malaria': 'malaria',
            'dengue': 'dengue',
            'cholera': 'cholera',
            'heatstroke': 'heatStroke',
            'respiratorydiseases': 'respiratory'
        };

        const recommendations: Record<string, string[]> = {
            malaria: [
                'Increase mosquito control measures in high-risk areas',
                'Distribute mosquito nets to vulnerable populations',
                'Conduct awareness campaigns about preventive measures',
                'Stock up on anti-malarial medications',
                'Monitor standing water sources'
            ],
            dengue: [
                'Intensify vector control programs',
                'Eliminate mosquito breeding sites',
                'Increase public awareness about dengue symptoms',
                'Ensure adequate hospital bed capacity',
                'Stock diagnostic kits and IV fluids'
            ],
            cholera: [
                'Ensure safe drinking water supply',
                'Improve sanitation infrastructure',
                'Stock oral rehydration salts (ORS)',
                'Conduct hygiene awareness programs',
                'Monitor water quality in flood-prone areas'
            ],
            heatStroke: [
                'Issue heat wave warnings',
                'Set up cooling centers in urban areas',
                'Advise outdoor activity restrictions',
                'Ensure adequate hydration facilities',
                'Monitor vulnerable populations (elderly, children)'
            ],
            respiratory: [
                'Monitor air quality levels',
                'Advise mask usage during poor air quality',
                'Stock respiratory medications',
                'Reduce outdoor activities during pollution peaks',
                'Increase ventilation in indoor spaces'
            ]
        };

        const key = keyMapping[diseaseKey] || diseaseKey;
        return recommendations[key] || [];
    };

    // Map selected disease to DISEASES object
    const getDiseaseInfo = (diseaseName: string) => {
        const mapping: Record<string, keyof typeof DISEASES> = {
            'Malaria': 'malaria',
            'Dengue': 'dengue',
            'Cholera': 'cholera',
            'Heat Stroke': 'heatStroke',
            'Respiratory Diseases': 'respiratory'
        };

        const key = mapping[diseaseName] || 'malaria';
        return DISEASES[key];
    };

    const DiseaseInfo = getDiseaseInfo(selectedDisease);

    return (
        <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center">
                            <Target className="h-8 w-8 mr-3" />
                            Disease Prediction System
                        </h1>
                        <p className="text-white/90 mt-2">
                            Climate-based disease outbreak prediction for Indian cities using environmental data analysis
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-health-teal" />
                        Prediction Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-health-charcoal mb-2 block">Select City</label>
                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {INDIAN_CITIES.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-health-charcoal mb-2 block">Select Disease</label>
                            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Malaria">Malaria</SelectItem>
                                    <SelectItem value="Dengue">Dengue</SelectItem>
                                    <SelectItem value="Cholera">Cholera</SelectItem>
                                    <SelectItem value="Heat Stroke">Heat Stroke</SelectItem>
                                    <SelectItem value="Respiratory Diseases">Respiratory Diseases</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-health-charcoal mb-2 block">Forecast Period</label>
                            <Select value={forecastMonths.toString()} onValueChange={(v) => setForecastMonths(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Month</SelectItem>
                                    <SelectItem value="2">2 Months</SelectItem>
                                    <SelectItem value="3">3 Months</SelectItem>
                                    <SelectItem value="4">4 Months</SelectItem>
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="12">12 Months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Current Risk Card with Advanced Features */}
                <Card className="lg:col-span-2 border-l-4" style={{ borderLeftColor: DiseaseInfo.color }}>
                    <CardContent className="p-6">
                        {/* Auto-refresh indicator */}
                        <div className="flex justify-end mb-4">
                            <AutoRefresh onRefresh={handleRefresh} interval={300000} />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-full bg-opacity-10`} style={{ backgroundColor: DiseaseInfo.color }}>
                                    <DiseaseInfo.icon className="h-8 w-8" style={{ color: DiseaseInfo.color }} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-health-charcoal">{DiseaseInfo.name} Risk in {selectedCity}</h3>
                                    <p className="text-sm text-health-blue-gray">{DiseaseInfo.description}</p>
                                    {/* Trend Indicator */}
                                    {previousRisk > 0 && (
                                        <div className="mt-2">
                                            <TrendIndicator current={currentRisk} previous={previousRisk} label="vs previous" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Animated Gauge instead of static progress */}
                            <div className="flex flex-col items-center gap-2">
                                <AnimatedGauge
                                    value={currentRisk}
                                    size={140}
                                    thickness={14}
                                    color={DiseaseInfo.color}
                                />
                                <Badge className={`${getRiskColor(currentRisk)} text-white text-sm px-4 py-1`}>
                                    {currentRisk > 70 ? 'HIGH RISK' : currentRisk > 40 ? 'MEDIUM RISK' : 'LOW RISK'}
                                </Badge>
                                {liveWeatherData && (
                                    <Badge variant="outline" className="border-health-teal text-health-teal flex items-center gap-1 mt-1">
                                        <Zap className="h-3 w-3" /> Live Data Active
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Weather Card */}
                {liveWeatherData ? (
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium flex items-center gap-1">
                                        <Cloud className="h-3 w-3" /> Live Weather
                                    </p>
                                    <h3 className="text-2xl font-bold mt-1">{selectedCity}</h3>
                                    <p className="text-blue-100 text-xs capitalize">{liveWeatherData.condition}</p>
                                </div>
                                <img
                                    src={`http://openweathermap.org/img/wn/${liveWeatherData.icon}@2x.png`}
                                    alt="Weather icon"
                                    className="w-16 h-16 -mt-2 -mr-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <ThermometerSun className="h-5 w-5 mx-auto mb-1 opacity-90" />
                                    <span className="text-lg font-bold">{Math.round(liveWeatherData.temp)}°C</span>
                                    <p className="text-[10px] opacity-70">Temp</p>
                                </div>
                                <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Droplets className="h-5 w-5 mx-auto mb-1 opacity-90" />
                                    <span className="text-lg font-bold">{liveWeatherData.humidity}%</span>
                                    <p className="text-[10px] opacity-70">Humidity</p>
                                </div>
                                <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Cloud className="h-5 w-5 mx-auto mb-1 opacity-90" />
                                    <span className="text-lg font-bold">{liveWeatherData.rain}mm</span>
                                    <p className="text-[10px] opacity-70">Rain</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-gray-100 border-dashed border-2 flex items-center justify-center">
                        <div className="text-center p-6 text-gray-400">
                            <Cloud className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Live weather unavailable</p>
                            <p className="text-xs">Using historical data</p>
                        </div>
                    </Card>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">Forecast</TabsTrigger>
                    <TabsTrigger value="map">Risk Map</TabsTrigger>
                    <TabsTrigger value="ai-model">AI Insights</TabsTrigger>
                    <TabsTrigger value="comparison">Multi-Disease</TabsTrigger>
                    <TabsTrigger value="regional">Regional View</TabsTrigger>
                    <TabsTrigger value="recommendations">Actions</TabsTrigger>
                    <TabsTrigger value="advanced">
                        <BrainCircuit className="h-4 w-4 mr-1" />
                        Advanced ML
                    </TabsTrigger>
                </TabsList>

                {/* Forecast Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-health-teal" />
                                {forecastMonths}-Month Risk Forecast with Climate Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Advanced Multi-Axis Chart */}
                            <MultiAxisChart
                                data={forecastData}
                                riskKey="risk"
                                tempKey="temp"
                                rainfallKey="rainfall"
                                riskColor={DiseaseInfo.color}
                            />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {forecastData.map((data, index) => (
                                    <Card key={index} className="border-l-4" style={{ borderLeftColor: DiseaseInfo.color }}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm font-medium text-health-blue-gray">{data.month}</div>
                                                {data.isLive && (
                                                    <Badge variant="outline" className="border-health-teal text-health-teal text-[10px] px-1 py-0 h-4">
                                                        <Zap className="h-2 w-2 mr-0.5" /> Live
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold mt-1" style={{ color: DiseaseInfo.color }}>{data.risk}%</div>
                                            <Badge className={`${getRiskColor(data.risk)} text-white text-xs mt-2`}>
                                                {data.riskLevel}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Interactive Risk Map Tab */}
                <TabsContent value="map" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="h-5 w-5 mr-2 text-health-teal" />
                                Real-Time Disease Risk Map - {DiseaseInfo.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Leaflet Map */}
                            <DiseaseRiskMap
                                regionalData={regionalData}
                                diseaseColor={DiseaseInfo.color}
                                diseaseName={DiseaseInfo.name}
                                onCityClick={(city) => setSelectedCity(city)}
                            />

                            {/* Statistics Grid Below Map */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <Card className="border-l-4 border-health-danger">
                                    <CardContent className="p-4">
                                        <div className="text-sm text-health-blue-gray">High Risk Cities</div>
                                        <div className="text-3xl font-bold text-health-danger mt-1">
                                            {regionalData.filter(c => c.risk > 70).length}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-health-warning">
                                    <CardContent className="p-4">
                                        <div className="text-sm text-health-blue-gray">Medium Risk Cities</div>
                                        <div className="text-3xl font-bold text-health-warning mt-1">
                                            {regionalData.filter(c => c.risk > 40 && c.risk <= 70).length}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-health-success">
                                    <CardContent className="p-4">
                                        <div className="text-sm text-health-blue-gray">Low Risk Cities</div>
                                        <div className="text-3xl font-bold text-health-success mt-1">
                                            {regionalData.filter(c => c.risk <= 40).length}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-health-teal">
                                    <CardContent className="p-4">
                                        <div className="text-sm text-health-blue-gray">Average Risk</div>
                                        <div className="text-3xl font-bold text-health-teal mt-1">
                                            {Math.round(regionalData.reduce((sum, c) => sum + c.risk, 0) / regionalData.length)}%
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>



                {/* AI Model Insights Tab */}
                <TabsContent value="ai-model" className="space-y-6">
                    {mlMetrics[selectedDisease as keyof typeof mlMetrics] ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-br from-health-teal to-health-aqua text-white border-none">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                        <BrainCircuit className="h-10 w-10 mb-2 opacity-90" />
                                        <div className="text-4xl font-bold mb-1">
                                            {mlMetrics[selectedDisease as keyof typeof mlMetrics].accuracy}%
                                        </div>
                                        <div className="text-sm font-medium opacity-90">Model Accuracy</div>
                                        <Badge className="mt-2 bg-white/20 hover:bg-white/30 text-white border-none">
                                            Random Forest
                                        </Badge>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                        <Target className="h-8 w-8 mb-2 text-health-blue-gray" />
                                        <div className="text-3xl font-bold text-health-charcoal mb-1">
                                            {mlMetrics[selectedDisease as keyof typeof mlMetrics].precision}%
                                        </div>
                                        <div className="text-sm text-health-blue-gray">Precision Score</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                        <Zap className="h-8 w-8 mb-2 text-health-warning" />
                                        <div className="text-3xl font-bold text-health-charcoal mb-1">
                                            {mlMetrics[selectedDisease as keyof typeof mlMetrics].recall}%
                                        </div>
                                        <div className="text-sm text-health-blue-gray">Recall Score</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                        <Calendar className="h-8 w-8 mb-2 text-health-success" />
                                        <div className="text-3xl font-bold text-health-charcoal mb-1">
                                            {(mlMetrics[selectedDisease as keyof typeof mlMetrics].samples / 1000).toFixed(1)}k
                                        </div>
                                        <div className="text-sm text-health-blue-gray">Training Records</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <BarChart3 className="h-5 w-5 mr-2 text-health-teal" />
                                            Feature Importance Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart
                                                data={Object.entries(mlMetrics[selectedDisease as keyof typeof mlMetrics].feature_importance)
                                                    .map(([name, value]) => ({ name, value }))
                                                    .sort((a, b) => b.value - a.value)}
                                                layout="vertical"
                                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" domain={[0, 100]} unit="%" />
                                                <YAxis dataKey="name" type="category" width={100} />
                                                <Tooltip
                                                    formatter={(value: number) => [`${value}%`, 'Importance']}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="value" fill={DiseaseInfo.color} radius={[0, 4, 4, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <p className="text-sm text-health-blue-gray mt-4 text-center">
                                            Top Predictor: <span className="font-bold text-health-charcoal">{mlMetrics[selectedDisease as keyof typeof mlMetrics].top_feature}</span> has the highest impact on {selectedDisease} outbreaks.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Info className="h-5 w-5 mr-2 text-health-teal" />
                                            Model Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 bg-health-light-gray/50 rounded-lg">
                                            <h4 className="font-semibold text-health-charcoal mb-2">Algorithm</h4>
                                            <p className="text-sm text-health-blue-gray">
                                                Random Forest Classifier (Ensemble Learning)
                                            </p>
                                        </div>
                                        <div className="p-4 bg-health-light-gray/50 rounded-lg">
                                            <h4 className="font-semibold text-health-charcoal mb-2">Training Methodology</h4>
                                            <p className="text-sm text-health-blue-gray">
                                                Trained on 70+ years of historical climate data (1951-2024) correlated with epidemiological risk factors.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-health-light-gray/50 rounded-lg">
                                            <h4 className="font-semibold text-health-charcoal mb-2">Validation</h4>
                                            <p className="text-sm text-health-blue-gray">
                                                Validated using 80/20 train-test split with k-fold cross-validation to ensure robustness.
                                            </p>
                                        </div>
                                        <Button className="w-full bg-health-teal hover:bg-health-teal/90">
                                            Download Model Report
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                AI Model metrics are currently unavailable for this disease.
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-health-teal" />
                                Multi-Disease Risk Comparison - {selectedCity}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={multiDiseaseData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    {Object.entries(DISEASES).map(([key, disease]) => (
                                        <Bar key={key} dataKey={key} fill={disease.color} name={disease.name} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                {Object.entries(DISEASES).map(([key, disease]) => {
                                    const Icon = disease.icon;
                                    const risk = calculateDiseaseRisk(selectedCity, key, currentMonth);
                                    return (
                                        <Card key={key} className="border-l-4" style={{ borderLeftColor: disease.color }}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Icon className="h-5 w-5" style={{ color: disease.color }} />
                                                        <span className="font-medium text-health-charcoal">{disease.name}</span>
                                                    </div>
                                                    <span className="text-xl font-bold" style={{ color: disease.color }}>{risk}%</span>
                                                </div>
                                                <Progress value={risk} className="h-2 mt-2" />
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Regional Comparison Tab */}
                <TabsContent value="regional" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="h-5 w-5 mr-2 text-health-teal" />
                                Regional Risk Assessment - {DiseaseInfo.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {regionalData.map((data, index) => {
                                    const trend = data.nextMonthRisk > data.risk ? 'up' : data.nextMonthRisk < data.risk ? 'down' : 'stable';
                                    return (
                                        <div key={data.city} className="p-4 rounded-lg border border-health-blue-gray/20 hover:bg-health-light-gray/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-2xl font-bold text-health-blue-gray">#{index + 1}</div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="h-4 w-4 text-health-teal" />
                                                            <span className="font-semibold text-health-charcoal">{data.city}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {trend === 'up' && <TrendingUp className="h-4 w-4 text-health-danger" />}
                                                            {trend === 'down' && <TrendingDown className="h-4 w-4 text-health-success" />}
                                                            {trend === 'stable' && <Activity className="h-4 w-4 text-health-blue-gray" />}
                                                            <span className="text-xs text-health-blue-gray">
                                                                Next month: {data.nextMonthRisk}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <div className="text-3xl font-bold" style={{ color: DiseaseInfo.color }}>{data.risk}%</div>
                                                        <Badge className={`${getRiskColor(data.risk)} text-white text-xs mt-1`}>
                                                            {data.risk > 70 ? 'High' : data.risk > 40 ? 'Medium' : 'Low'}
                                                        </Badge>
                                                    </div>
                                                    <div className="w-32">
                                                        <Progress value={data.risk} className="h-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-6">
                    <Alert className={`border-l-4 ${currentRisk > 70 ? 'border-health-danger' : currentRisk > 40 ? 'border-health-warning' : 'border-health-success'}`}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-semibold mb-2">
                                Risk Level: {currentRisk > 70 ? 'HIGH' : currentRisk > 40 ? 'MEDIUM' : 'LOW'} - Immediate action {currentRisk > 70 ? 'required' : currentRisk > 40 ? 'recommended' : 'not required'}
                            </div>
                            <p className="text-sm">
                                Based on climate data analysis for {selectedCity}, the following preventive measures are recommended:
                            </p>
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-health-teal" />
                                Recommended Actions for {DiseaseInfo.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {getRecommendations(selectedDisease, currentRisk).map((recommendation, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-health-light-gray/50">
                                        <div className={`mt-1 ${getRiskColor(currentRisk)} rounded-full p-1`}>
                                            <ArrowRight className="h-4 w-4 text-white" />
                                        </div>
                                        <p className="text-health-charcoal flex-1">{recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ThermometerSun className="h-5 w-5 mr-2 text-health-teal" />
                                Climate Factors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border border-health-blue-gray/20">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <ThermometerSun className="h-5 w-5 text-health-warning" />
                                        <span className="font-medium text-health-charcoal">Optimal Temperature Range</span>
                                    </div>
                                    <p className="text-2xl font-bold text-health-teal">
                                        {DiseaseInfo.optimalTemp.min}°C - {DiseaseInfo.optimalTemp.max}°C
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border border-health-blue-gray/20">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Cloud className="h-5 w-5 text-health-aqua" />
                                        <span className="font-medium text-health-charcoal">Rainfall Impact</span>
                                    </div>
                                    <p className="text-2xl font-bold text-health-teal capitalize">
                                        {DiseaseInfo.rainfallFactor.replace('-', ' ')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Advanced ML Analytics Tab */}
                <TabsContent value="advanced" className="space-y-6">
                    {/* 12-Month Advanced Forecast */}
                    {advancedForecast && advancedForecast.forecast && (
                        <AdvancedForecastChart
                            data={advancedForecast.forecast}
                            disease={selectedDisease}
                            city={selectedCity}
                        />
                    )}

                    {/* Feature Importance */}
                    {featureImportance && featureImportance.top_features && (
                        <FeatureImportanceChart
                            disease={selectedDisease}
                            features={featureImportance.top_features}
                            totalFeatures={featureImportance.total_features || 70}
                        />
                    )}

                    {/* Multi-City Comparison */}
                    {multiCityData && multiCityData.cities && (
                        <MultiCityComparison
                            disease={selectedDisease}
                            cities={multiCityData.cities}
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Data Source Attribution */}
            {
                metadata && (
                    <Card className="mt-6 bg-health-light-gray/50">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <Info className="h-5 w-5 text-health-teal mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-health-charcoal mb-2">Data Source</h4>
                                    <p className="text-sm text-health-blue-gray mb-2">
                                        {metadata.description}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-health-blue-gray">
                                        <div>
                                            <span className="font-medium">Data Period:</span> {metadata.yearsOfData}
                                        </div>
                                        <div>
                                            <span className="font-medium">Cities:</span> {metadata.cities?.length || 0} Indian cities
                                        </div>
                                        <div>
                                            <span className="font-medium">Last Updated:</span> {new Date(metadata.generatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-xs text-health-blue-gray mt-2 italic">
                                        {metadata.dataSource}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }
        </div>
    );
};

export default DiseasePrediction;
