import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Cloud,
  Thermometer,
  Droplets,
  AlertTriangle,
  RefreshCw,
  Activity,
  Search,
  ZoomIn,
  ZoomOut,
  Layers,
  Filter,
  Info,
  Download,
  Share2,
  Maximize,
  Minimize,
  Printer,
  Ruler,
  Wind,
  Gauge,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import bioAuraService from '@/services/bioAuraService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type RegionalMapData = Awaited<ReturnType<typeof bioAuraService.getRegionalEnvironmentMap>>;

const RegionalEnvironmentMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapData, setMapData] = useState<RegionalMapData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapView, setMapView] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false); // Alerts disabled
  const [showClusters, setShowClusters] = useState(true);
  const [aqiRange, setAqiRange] = useState<[number, number]>([0, 500]);
  const [tempRange, setTempRange] = useState<[number, number]>([0, 50]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const alertMarkersRef = useRef<L.Marker[]>([]);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const loadMapData = useCallback(async (silent = false, forceRefresh = false, retryCount = 0) => {
    try {
      setError(null);
      if (!silent) {
        setLoading(true);
      }
      const data = await bioAuraService.getRegionalEnvironmentMap(forceRefresh);
      setMapData(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to load regional environment data:', err);

      // Check if it's a connection error and retry
      if ((err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED') || err.message?.includes('NetworkError')) && retryCount < 3) {
        console.log(`Retrying connection (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => {
          loadMapData(silent, forceRefresh, retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      setError(err.message || 'Failed to load map data. Please check if the server is running on port 5000.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Initialize and update map
  useEffect(() => {
    if (!mapData || !mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // Center of India
        zoom: 5,
        zoomControl: false,
        minZoom: 3,
        maxZoom: 18,
      });

      // Add zoom controls
      L.control.zoom({
        position: 'bottomright',
      }).addTo(map);

      // Add scale control
      L.control.scale({
        position: 'bottomleft',
        imperial: false,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '© OpenStreetMap contributors';

    if (mapView === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '© Esri';
    } else if (mapView === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '© OpenTopoMap contributors';
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];
    alertMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    alertMarkersRef.current = [];

    // Remove heat layer if exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Filter regions
    const filteredRegions = mapData.regions.filter((region) => {
      if (riskFilter !== 'all' && region.healthRisk !== riskFilter) return false;
      if (searchQuery && !region.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !region.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (region.aqi < aqiRange[0] || region.aqi > aqiRange[1]) return false;
      if (region.temperature < tempRange[0] || region.temperature > tempRange[1]) return false;
      return true;
    });

    // Create heat map layer if enabled
    if (showHeatMap && filteredRegions.length > 0) {
      const heatData: [number, number, number][] = filteredRegions.map((r) => [
        r.lat,
        r.lng,
        r.aqi,
      ]);

      // Simple heat map using circles (can be enhanced with leaflet.heat plugin)
      const heatLayer = L.layerGroup();
      heatData.forEach(([lat, lng, intensity]) => {
        const radius = Math.max(20000, Math.min(100000, intensity * 500));
        const opacity = Math.min(0.6, intensity / 300);
        const color = intensity > 200 ? '#dc2626' : intensity > 150 ? '#f59e0b' : intensity > 100 ? '#eab308' : '#22c55e';

        L.circle([lat, lng], {
          radius,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.8,
          fillOpacity: opacity,
        }).addTo(heatLayer);
      });
      heatLayer.addTo(map);
      heatLayerRef.current = heatLayer;
    }

    // Create custom icons based on health risk
    const createCustomIcon = (risk: string, aqi: number, isSelected: boolean) => {
      let color = '#22c55e'; // green
      if (risk === 'high' || risk === 'critical') color = '#ef4444'; // red
      else if (risk === 'medium') color = '#eab308'; // yellow

      const size = isSelected ? 40 : 32;
      const borderWidth = isSelected ? 4 : 3;

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: ${borderWidth}px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            ${isSelected ? 'animation: pulse 2s infinite;' : ''}
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: ${isSelected ? '14px' : '12px'};
            ">${aqi}</span>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: rotate(-45deg) scale(1); }
              50% { transform: rotate(-45deg) scale(1.1); }
            }
          </style>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });
    };

    // Add markers for each region
    filteredRegions.forEach((region) => {
      const isSelected = selectedRegion === region.name;
      const marker = L.marker([region.lat, region.lng], {
        icon: createCustomIcon(region.healthRisk, region.aqi, isSelected),
      }).addTo(map);

      const getAQICategory = (aqi: number) => {
        if (aqi > 300) return 'Hazardous';
        if (aqi > 200) return 'Very Unhealthy';
        if (aqi > 150) return 'Unhealthy';
        if (aqi > 100) return 'Unhealthy for Sensitive Groups';
        if (aqi > 50) return 'Moderate';
        return 'Good';
      };

      const getRiskColor = (risk: string) => {
        if (risk === 'high' || risk === 'critical') return '#ef4444';
        if (risk === 'medium') return '#eab308';
        return '#22c55e';
      };

      const popupContent = `
        <div style="min-width: 280px; padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: center; justify-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
            <h3 style="font-weight: bold; font-size: 18px; margin: 0; color: #0D7377;">
              ${region.name}
            </h3>
            <span style="
              background-color: ${getRiskColor(region.healthRisk)};
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
            ">${region.healthRisk.toUpperCase()}</span>
          </div>
          
          <div style="margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-weight: 600; color: #64748b; font-size: 13px;">AQI:</span>
              <span style="font-weight: bold; font-size: 20px; color: ${getRiskColor(region.healthRisk)};">
                ${region.aqi}
              </span>
              <span style="font-size: 12px; color: #64748b;">(${getAQICategory(region.aqi)})</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div>
                <span style="font-size: 11px; color: #64748b;">PM2.5:</span>
                <span style="font-weight: 600; margin-left: 4px;">${region.pm25} µg/m³</span>
              </div>
              <div>
                <span style="font-size: 11px; color: #64748b;">PM10:</span>
                <span style="font-weight: 600; margin-left: 4px;">${region.pm10} µg/m³</span>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 10px; padding: 8px; background-color: #f8fafc; border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #64748b; font-size: 13px;">🌡️ Temperature:</span>
              <span style="font-weight: bold;">${region.temperature}°C</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #64748b; font-size: 13px;">💧 Humidity:</span>
              <span style="font-weight: bold;">${region.humidity}%</span>
            </div>
            ${region.windSpeed > 0 ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #64748b; font-size: 13px;">💨 Wind:</span>
              <span style="font-weight: bold;">${region.windSpeed} m/s</span>
            </div>
            ` : ''}
            ${region.pressure > 0 ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 600; color: #64748b; font-size: 13px;">📊 Pressure:</span>
              <span style="font-weight: bold;">${region.pressure} hPa</span>
            </div>
            ` : ''}
          </div>

          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            <div>Source: ${region.source}</div>
            <div>Updated: ${new Date(region.lastUpdated).toLocaleString()}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
      });

      marker.on('click', () => {
        setSelectedRegion(region.name);
      });

      markersRef.current.push(marker);
    });

    // Alerts are completely disabled - no alert markers will be shown
    // Alert functionality has been disabled

    // Fit map to show all markers
    if (filteredRegions.length > 0) {
      const bounds = L.latLngBounds(
        filteredRegions.map((r) => [r.lat, r.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup handled by component unmount
    };
  }, [mapData, riskFilter, searchQuery, mapView, showHeatMap, showAlerts, aqiRange, tempRange, selectedRegion]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMapData(false, true);
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!mapData) return;

    const data = {
      timestamp: new Date().toISOString(),
      summary: mapData.summary,
      regions: mapData.regions.map((r) => ({
        name: r.name,
        aqi: r.aqi,
        temperature: r.temperature,
        humidity: r.humidity,
        healthRisk: r.healthRisk,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environment-map-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Regional Environment Map',
          text: `Check out the environmental conditions across ${mapData?.regions.length || 0} regions`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      mapRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitBounds = () => {
    if (mapData && mapInstanceRef.current) {
      const filteredRegions = mapData.regions.filter((region) => {
        if (riskFilter !== 'all' && region.healthRisk !== riskFilter) return false;
        if (searchQuery && !region.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (region.aqi < aqiRange[0] || region.aqi > aqiRange[1]) return false;
        if (region.temperature < tempRange[0] || region.temperature > tempRange[1]) return false;
        return true;
      });

      if (filteredRegions.length > 0) {
        const bounds = L.latLngBounds(
          filteredRegions.map((r) => [r.lat, r.lng])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi > 300) return 'bg-red-700';
    if (aqi > 200) return 'bg-red-500';
    if (aqi > 150) return 'bg-orange-500';
    if (aqi > 100) return 'bg-yellow-500';
    if (aqi > 50) return 'bg-yellow-300';
    return 'bg-green-500';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
      case 'critical':
        return 'bg-health-danger';
      case 'medium':
        return 'bg-health-warning';
      default:
        return 'bg-health-success';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
          <p className="mt-4 text-health-blue-gray">Loading Regional Environment Map...</p>
        </div>
      </div>
    );
  }

  if (error && !mapData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">{error || 'Failed to load regional environment data.'}</p>
              <p className="text-sm text-health-blue-gray">
                {error?.includes('Connection refused')
                  ? 'Please ensure the server is running on http://localhost:5000'
                  : 'Please check your network connection and try again.'}
              </p>
              <div className="flex gap-2 mt-3">
                <Button onClick={() => loadMapData(false, true)} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { regions, alerts, summary } = mapData;
  const filteredRegions = regions.filter((region) => {
    if (riskFilter !== 'all' && region.healthRisk !== riskFilter) return false;
    if (searchQuery && !region.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !region.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (region.aqi < aqiRange[0] || region.aqi > aqiRange[1]) return false;
    if (region.temperature < tempRange[0] || region.temperature > tempRange[1]) return false;
    return true;
  });

  return (
    <div className="space-y-6 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-health-teal to-health-aqua rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <MapPin className="h-8 w-8 mr-3" />
              Regional Environment Map
            </h1>
            <p className="text-white/90 mt-2">
              Interactive map showing environmental conditions and health risks across {summary.totalRegions} regions
            </p>
            {lastUpdate && (
              <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                {refreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-health-blue-gray">Total Regions</p>
                <p className="text-2xl font-bold text-health-teal">{summary.totalRegions}</p>
              </div>
              <MapPin className="h-6 w-6 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-health-blue-gray">High Risk</p>
                <p className="text-2xl font-bold text-health-danger">{summary.highRiskRegions}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-health-danger" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-health-blue-gray">Medium Risk</p>
                <p className="text-2xl font-bold text-health-warning">{summary.mediumRiskRegions}</p>
              </div>
              <Activity className="h-6 w-6 text-health-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-health-blue-gray">Avg AQI</p>
                <p className="text-2xl font-bold text-health-teal">{summary.averageAQI}</p>
              </div>
              <Cloud className="h-6 w-6 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-health-blue-gray">Avg Temp</p>
                <p className="text-2xl font-bold text-health-teal">{summary.averageTemperature}°C</p>
              </div>
              <Thermometer className="h-6 w-6 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
        {/* Alerts card removed - alerts are disabled */}
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-health-teal" />
              <h3 className="font-semibold">Filters & Controls</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-health-blue-gray" />
                  <Input
                    placeholder="Search regions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={mapView} onValueChange={(v: 'standard' | 'satellite' | 'terrain') => setMapView(v)}>
                  <SelectTrigger>
                    <Layers className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Map View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleFitBounds}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    AQI Range: {aqiRange[0]} - {aqiRange[1]}
                  </Label>
                  <Slider
                    value={aqiRange}
                    onValueChange={(value) => setAqiRange(value as [number, number])}
                    min={0}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Temperature Range: {tempRange[0]}°C - {tempRange[1]}°C
                  </Label>
                  <Slider
                    value={tempRange}
                    onValueChange={(value) => setTempRange(value as [number, number])}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="heatmap"
                    checked={showHeatMap}
                    onCheckedChange={setShowHeatMap}
                  />
                  <Label htmlFor="heatmap" className="text-sm">Show Heat Map</Label>
                </div>
                {/* Alerts are disabled */}
                {/* <div className="flex items-center space-x-2">
                  <Switch
                    id="alerts"
                    checked={showAlerts}
                    onCheckedChange={setShowAlerts}
                  />
                  <Label htmlFor="alerts" className="text-sm">Show Alerts</Label>
                </div> */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="clusters"
                    checked={showClusters}
                    onCheckedChange={setShowClusters}
                  />
                  <Label htmlFor="clusters" className="text-sm">Marker Clustering</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-health-teal" />
              Regional Overview
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-health-blue-gray">
              <Info className="h-4 w-4" />
              <span>{filteredRegions.length} of {regions.length} regions displayed</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="w-full h-[600px] rounded-lg"
            style={{ zIndex: 1 }}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-health-danger border-2 border-white shadow-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">AQI</span>
              </div>
              <div>
                <p className="font-semibold text-sm">High Risk</p>
                <p className="text-xs text-health-blue-gray">AQI &gt; 150</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-health-warning border-2 border-white shadow-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">AQI</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Medium Risk</p>
                <p className="text-xs text-health-blue-gray">AQI 100-150</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-health-success border-2 border-white shadow-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">AQI</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Low Risk</p>
                <p className="text-xs text-health-blue-gray">AQI &lt; 100</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md animate-pulse"></div>
              <div>
                <p className="font-semibold text-sm">Alert Marker</p>
                <p className="text-xs text-health-blue-gray">Critical/Warning alerts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Data Grid */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Regions ({filteredRegions.length})</TabsTrigger>
          <TabsTrigger value="high">High Risk ({regions.filter((r) => r.healthRisk === 'high' || r.healthRisk === 'critical').length})</TabsTrigger>
          {/* Alerts tab removed - alerts are disabled */}
        </TabsList>

        <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredRegions.map((region, index) => (
            <Card
              key={index}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedRegion === region.name ? 'ring-2 ring-health-teal' : ''
                }`}
              onClick={() => {
                setSelectedRegion(region.name);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([region.lat, region.lng], 10);
                  const marker = markersRef.current.find((m) => {
                    const latlng = m.getLatLng();
                    return Math.abs(latlng.lat - region.lat) < 0.001 && Math.abs(latlng.lng - region.lng) < 0.001;
                  });
                  if (marker) {
                    marker.openPopup();
                  }
                }
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-health-teal" />
                    {region.name}
                  </CardTitle>
                  <Badge className={`${getRiskColor(region.healthRisk)} text-white`}>
                    {region.healthRisk.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-health-aqua" />
                      <span className="text-sm text-health-blue-gray">AQI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-semibold ${region.aqi > 150 ? 'text-red-500' : region.aqi > 100 ? 'text-yellow-500' : 'text-green-500'
                          }`}
                      >
                        {region.aqi}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${getAQIColor(region.aqi)}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-health-aqua" />
                      <span className="text-sm text-health-blue-gray">Temperature</span>
                    </div>
                    <span className="font-medium">{region.temperature}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-health-aqua" />
                      <span className="text-sm text-health-blue-gray">Humidity</span>
                    </div>
                    <span className="font-medium">{region.humidity}%</span>
                  </div>
                  {region.windSpeed > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wind className="h-4 w-4 text-health-aqua" />
                        <span className="text-sm text-health-blue-gray">Wind</span>
                      </div>
                      <span className="font-medium">{region.windSpeed} m/s</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="high" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regions
            .filter((r) => r.healthRisk === 'high' || r.healthRisk === 'critical')
            .map((region, index) => (
              <Card key={index} className="border-health-danger">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{region.name}</CardTitle>
                    <Badge className="bg-health-danger text-white">HIGH RISK</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-health-blue-gray">AQI:</span>
                      <span className="font-bold text-red-500">{region.aqi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-health-blue-gray">PM2.5:</span>
                      <span className="font-medium">{region.pm25} µg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-health-blue-gray">PM10:</span>
                      <span className="font-medium">{region.pm10} µg/m³</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Alerts tab content removed - alerts are disabled */}
      </Tabs>
    </div>
  );
};

export default RegionalEnvironmentMap;
