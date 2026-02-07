import { useState, useEffect, useCallback } from 'react';
import { Location } from '@/types/appointment';

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const detectLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        setLastUpdated(new Date());
        setLoading(false);
        
        console.log('📍 Location detected:', {
          lat: newLocation.latitude,
          lng: newLocation.longitude,
          accuracy: `${position.coords.accuracy}m`,
          timestamp: new Date(position.timestamp).toLocaleString()
        });
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Please enter your pincode to find nearby doctors';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      options
    );
  }, []);

  // Watch for location changes
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        // Only update if location changed significantly (more than 10 meters)
        if (location) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            newLocation.latitude,
            newLocation.longitude
          );
          
          if (distance > 0.01) { // 10 meters
            console.log('📍 Location updated:', {
              lat: newLocation.latitude,
              lng: newLocation.longitude,
              accuracy: `${position.coords.accuracy}m`,
              distance: `${(distance * 1000).toFixed(0)}m from previous location`
            });
            
            setLocation(newLocation);
            setAccuracy(position.coords.accuracy);
            setLastUpdated(new Date());
          }
        }
      },
      (error) => {
        console.warn('⚠️ Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute cache for watch
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [location]);

  const setLocationByPincode = useCallback(async (pincode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert pincode to approximate coordinates (you can integrate with a real API)
      // For now, using some common Indian city coordinates as fallback
      const pincodeCoordinates: { [key: string]: { lat: number; lng: number } } = {
        '400001': { lat: 19.0760, lng: 72.8777 }, // Mumbai
        '110001': { lat: 28.7041, lng: 77.1025 }, // Delhi
        '700001': { lat: 22.5726, lng: 88.3639 }, // Kolkata
        '600001': { lat: 13.0827, lng: 80.2707 }, // Chennai
        '500001': { lat: 17.3850, lng: 78.4867 }, // Hyderabad
        '560001': { lat: 12.9716, lng: 77.5946 }, // Bangalore
        '380001': { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
        '302001': { lat: 26.9124, lng: 75.7873 }, // Jaipur
        '226001': { lat: 26.8467, lng: 80.9462 }, // Lucknow
        '800001': { lat: 25.5941, lng: 85.1376 }  // Patna
      };
      
      const coordinates = pincodeCoordinates[pincode];
      
      if (coordinates) {
        const newLocation = {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          pincode,
          accuracy: 1000, // Approximate accuracy for pincode-based location
          timestamp: Date.now()
        };
        
        setLocation(newLocation);
        setAccuracy(1000);
        setLastUpdated(new Date());
        setLoading(false);
        
        console.log('📍 Location set by pincode:', {
          pincode,
          lat: coordinates.lat,
          lng: coordinates.lng,
          accuracy: '~1km (pincode-based)'
        });
      } else {
        // Fallback to generic coordinates
        const newLocation = {
          latitude: 20.5937, // Center of India
          longitude: 78.9629,
          pincode,
          accuracy: 5000, // Low accuracy for unknown pincode
          timestamp: Date.now()
        };
        
        setLocation(newLocation);
        setAccuracy(5000);
        setLastUpdated(new Date());
        setLoading(false);
        
        console.log('📍 Location set by pincode (fallback):', {
          pincode,
          lat: newLocation.latitude,
          lng: newLocation.longitude,
          accuracy: '~5km (fallback)'
        });
      }
    } catch (err) {
      setError('Invalid pincode');
      setLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(() => {
    console.log('🔄 Refreshing location...');
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return {
    location,
    loading,
    error,
    accuracy,
    lastUpdated,
    detectLocation,
    setLocationByPincode,
    refreshLocation
  };
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
} 