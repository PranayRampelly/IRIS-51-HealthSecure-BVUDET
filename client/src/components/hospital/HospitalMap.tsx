import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Navigation, ExternalLink, Phone, Mail, 
  Clock, Car, Route, X, Share2, User
} from 'lucide-react';
import { Hospital } from '@/services/hospitalServicesService';
import { Location } from '@/types/appointment';
import { toast } from 'sonner';

interface HospitalMapProps {
  hospital: Hospital;
  userLocation: Location | null;
  onClose: () => void;
}

const HospitalMap: React.FC<HospitalMapProps> = ({ hospital, userLocation, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [routeType, setRouteType] = useState<'driving' | 'walking' | 'transit'>('driving');

  useEffect(() => {
    if (mapRef.current && hospital.coordinates) {
      initializeMap();
    }
  }, [hospital.coordinates]);

  const initializeMap = () => {
    // Using OpenStreetMap with Leaflet (free alternative to Google Maps)
    const L = (window as any).L;
    
    if (!L) {
      // Load Leaflet CSS and JS dynamically
      loadLeaflet();
      return;
    }

    const hospitalLat = hospital.coordinates.lat;
    const hospitalLng = hospital.coordinates.lng;

    // Create map
    const mapInstance = L.map(mapRef.current).setView([hospitalLat, hospitalLng], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add hospital marker
    const hospitalMarker = L.marker([hospitalLat, hospitalLng])
      .addTo(mapInstance)
      .bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${hospital.name}</h3>
          <p class="text-sm text-gray-600">${hospital.address}</p>
          <p class="text-sm text-gray-600">${hospital.phone}</p>
        </div>
      `);

    // Add user location marker if available
    if (userLocation?.latitude && userLocation?.longitude) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude])
        .addTo(mapInstance)
        .bindPopup('Your Location')
        .setIcon(L.divIcon({
          className: 'user-location-marker',
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
          iconSize: [16, 16]
        }));

      // Calculate and display route
      calculateRoute(mapInstance, userLocation, hospital.coordinates);
    }

    setMap(mapInstance);

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  };

  const loadLeaflet = () => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);
  };

  const calculateRoute = async (mapInstance: any, from: Location, to: { lat: number; lng: number }) => {
    try {
      // Using OSRM (Open Source Routing Machine) for route calculation
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${routeType}/${from.longitude},${from.latitude};${to.lng},${to.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setDistance(route.distance / 1000); // Convert to km
        setDuration(Math.round(route.duration / 60).toString()); // Convert to minutes

        // Draw route on map
        const L = (window as any).L;
        if (L) {
          L.geoJSON(route.geometry, {
            style: {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7
            }
          }).addTo(mapInstance);
        }
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Unable to calculate route');
    }
  };

  const handleGetDirections = () => {
    if (hospital.coordinates) {
      const { lat, lng } = hospital.coordinates;
      let fromCoords = '';
      
      // Get user's current location if available
      if (userLocation?.latitude && userLocation?.longitude) {
        fromCoords = `${userLocation.longitude},${userLocation.latitude}`;
      }
      
      // OpenStreetMap expects longitude,latitude format
      const toCoords = `${lng},${lat}`;
      const url = `https://www.openstreetmap.org/directions?from=${fromCoords}&to=${toCoords}`;
      window.open(url, '_blank');
    }
  };

  const handleOpenInMaps = () => {
    if (hospital.coordinates) {
      const { lat, lng } = hospital.coordinates;
      // Try to open in native maps app
      if (navigator.userAgent.includes('Mobile')) {
        // Mobile - try to open in native maps
        window.open(`geo:${lat},${lng}?q=${encodeURIComponent(hospital.name)}`, '_blank');
      } else {
        // Desktop - open in OpenStreetMap
        window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`, '_blank');
      }
    }
  };

  const handleShareLocation = async () => {
    if (navigator.share && hospital.coordinates) {
      try {
        await navigator.share({
          title: hospital.name,
          text: `Check out ${hospital.name} at ${hospital.address}`,
          url: `https://www.openstreetmap.org/?mlat=${hospital.coordinates.lat}&mlon=${hospital.coordinates.lng}#map=15/${hospital.coordinates.lat}/${hospital.coordinates.lng}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy coordinates
      const coords = `${hospital.coordinates.lat},${hospital.coordinates.lng}`;
      navigator.clipboard.writeText(coords);
      toast.success('Coordinates copied to clipboard');
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatDuration = (minutes: string | number) => {
    const minutesNum = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    if (minutesNum < 60) {
      return `${minutesNum} min`;
    }
    const hours = Math.floor(minutesNum / 60);
    const remainingMinutes = minutesNum % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-health-teal" />
              <span>Hospital Location & Directions</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div 
                ref={mapRef} 
                className="w-full h-96 rounded-lg border border-gray-200"
                style={{ minHeight: '400px' }}
              />
              
              {/* Route Type Selector */}
              {userLocation && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
                  <div className="flex space-x-1">
                    <Button
                      variant={routeType === 'driving' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRouteType('driving')}
                      className="text-xs"
                    >
                      <Car className="h-3 w-3 mr-1" />
                      Drive
                    </Button>
                    <Button
                      variant={routeType === 'walking' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRouteType('walking')}
                      className="text-xs"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Walk
                    </Button>
                    <Button
                      variant={routeType === 'transit' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRouteType('transit')}
                      className="text-xs"
                    >
                      <Route className="h-3 w-3 mr-1" />
                      Transit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hospital Info & Actions */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{hospital.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-health-teal mt-0.5 flex-shrink-0" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-health-teal" />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-health-teal" />
                    <span>{hospital.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-health-teal" />
                    <span>24/7 Emergency</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Info */}
            {distance && duration && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Route Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{formatDistance(distance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{formatDuration(duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode:</span>
                      <Badge variant="outline" className="capitalize">
                        {routeType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={handleGetDirections}
                className="w-full bg-health-teal hover:bg-health-aqua"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleOpenInMaps}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Maps
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleShareLocation}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Location
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalMap; 