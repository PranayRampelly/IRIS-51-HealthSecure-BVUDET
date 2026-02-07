import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  MapPin,
  RefreshCw,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import bioAuraService from '@/services/bioAuraService';

type DashboardOverview = Awaited<ReturnType<typeof bioAuraService.getDashboardOverview>>;

const BioAuraDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await bioAuraService.getDashboardOverview();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load BioAura dashboard:', err);
      setError('Unable to load BioAura dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading BioAura AI dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData || error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error ?? 'Dashboard data unavailable'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { bioAuraIndex, agents, regionalInsights, predictions } = dashboardData;

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-health-danger';
      case 'medium':
        return 'bg-health-warning';
      default:
        return 'bg-health-success';
    }
  };

  const agentStatusData = agents.map(agent => ({
    name: agent.name.replace(' Agent', ''),
    value: agent.dataPoints,
    status: agent.status,
  }));

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Brain className="h-8 w-8 mr-3" />
              BioAura AI - Predictive Health Intelligence
            </h1>
            <p className="text-white/90 mt-2">
              Advanced AI system monitoring regional health patterns and predicting risks before they become crises
            </p>
          </div>
        </div>
      </div>

      {/* BioAura Index Card */}
      <Card className="bg-gradient-to-br from-health-teal to-health-aqua text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Overall BioAura Health Index</span>
              </div>
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-5xl font-bold">{bioAuraIndex.index}</span>
                <span className="text-xl opacity-80">/ 100</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={`${getRiskColor(bioAuraIndex.riskLevel)} text-white`}>
                  {bioAuraIndex.riskLevel.toUpperCase()} RISK
                </Badge>
                <div className="flex items-center space-x-1 text-sm opacity-90">
                  <MapPin className="h-4 w-4" />
                  <span>Monitoring {regionalInsights.length} Regions</span>
                </div>
                <div className="flex items-center space-x-1 text-sm opacity-90">
                  <Globe className="h-4 w-4" />
                  <span>{agentStatusData.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()} data points</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80 mb-1">Health Resonance</div>
              <Progress value={bioAuraIndex.index} className="w-32 h-3 bg-white/20" />
              <div className="text-xs opacity-70 mt-2">Updated {new Date(bioAuraIndex.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Active Agents</p>
                <p className="text-2xl font-bold text-health-teal">{agents.filter(a => a.status === 'active').length}</p>
              </div>
              <Brain className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Total Data Points</p>
                <p className="text-2xl font-bold text-health-teal">
                  {agents.reduce((sum, a) => sum + a.dataPoints, 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Active Alerts</p>
                <p className="text-2xl font-bold text-health-teal">{regionalInsights.reduce((sum, r) => sum + r.alerts, 0)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-health-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-health-blue-gray">Predictions</p>
                <p className="text-2xl font-bold text-health-teal">{predictions.length}</p>
              </div>
              <Target className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="regions">Regional Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Agents Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-health-teal" />
                  AI Agents Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-health-blue-gray/20">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-health-success' : 'bg-health-danger'}`} />
                        <div>
                          <p className="font-medium text-health-charcoal">{agent.name}</p>
                          <p className="text-xs text-health-blue-gray">Last update: {agent.lastUpdate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-health-teal">{agent.dataPoints.toLocaleString()}</p>
                        <p className="text-xs text-health-blue-gray">data points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regional Health Index */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-health-teal" />
                  Regional Health Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regionalInsights.map((region, index) => (
                    <div key={index} className="p-3 rounded-lg border border-health-blue-gray/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-health-charcoal">{region.region}</span>
                        <div className="flex items-center space-x-2">
                          {region.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-health-warning" />}
                          {region.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-health-success" />}
                          {region.trend === 'stable' && <CheckCircle className="h-4 w-4 text-health-aqua" />}
                          <Badge className={region.index >= 60 ? 'bg-health-warning' : 'bg-health-success'}>{region.index}</Badge>
                        </div>
                      </div>
                      <Progress value={region.index} className="h-2" />
                      {region.alerts > 0 && (
                        <p className="text-xs text-health-warning mt-1">{region.alerts} active alert(s)</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-health-teal" />
                Recent Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((pred, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-health-warning bg-yellow-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-health-charcoal capitalize">{pred.type} Risk</h3>
                        <p className="text-sm text-health-blue-gray">Timeframe: {pred.timeframe}</p>
                      </div>
                      <Badge className="bg-health-warning">{pred.probability}% probability</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-health-charcoal mb-1">
                        <strong>Affected Regions:</strong> {pred.affectedRegions.join(', ')}
                      </p>
                      <p className="text-sm text-health-blue-gray">
                        <strong>Recommendation:</strong> {pred.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{agent.name}</span>
                    <Badge className={agent.status === 'active' ? 'bg-health-success' : 'bg-health-danger'}>
                      {agent.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-health-blue-gray">Data Points Collected</p>
                      <p className="text-2xl font-bold text-health-teal">{agent.dataPoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-health-blue-gray">Last Update</p>
                      <p className="text-sm font-medium text-health-charcoal">{agent.lastUpdate}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-health-blue-gray">
                        {agent.name === 'Environment Agent' && 'Monitoring air quality, temperature, and humidity'}
                        {agent.name === 'Wearable Agent' && 'Tracking sleep, stress, and heart rate patterns'}
                        {agent.name === 'Pharma Agent' && 'Analyzing pharmacy sales trends and medication demand'}
                        {agent.name === 'Hospital Agent' && 'Observing outpatient queues and hospital loads'}
                        {agent.name === 'Sentiment Agent' && 'Monitoring social media and search trends'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Regional Insights Tab */}
        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Health Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={regionalInsights}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="index" fill="#0D7377" name="Health Index" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Risk Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((pred, index) => (
                  <Card key={index} className="border-l-4 border-health-warning">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-health-charcoal capitalize">{pred.type} Risk Prediction</h3>
                          <p className="text-sm text-health-blue-gray">Expected timeframe: {pred.timeframe}</p>
                        </div>
                        <Badge className="bg-health-warning text-white text-lg px-3 py-1">{pred.probability}%</Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-health-charcoal">Affected Regions:</p>
                          <p className="text-sm text-health-blue-gray">{pred.affectedRegions.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-health-charcoal">Recommendation:</p>
                          <p className="text-sm text-health-blue-gray">{pred.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Health Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bioAuraIndex.recommendations.map((rec, index) => (
                  <Alert key={index} className={rec.severity === 'high' ? 'border-health-danger' : 'border-health-warning'}>
                    <AlertTriangle className={`h-4 w-4 ${rec.severity === 'high' ? 'text-health-danger' : 'text-health-warning'}`} />
                    <AlertDescription>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{rec.message}</span>
                        <Badge className={rec.severity === 'high' ? 'bg-health-danger' : 'bg-health-warning'}>
                          {rec.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                        {rec.actions.map((action, i) => (
                          <li key={i} className="text-health-blue-gray">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BioAuraDashboard;

