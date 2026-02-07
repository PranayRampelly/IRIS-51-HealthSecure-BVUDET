/**
 * Calculate distance between two points in kilometers using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
const toRad = (degrees) => {
  return degrees * Math.PI / 180;
};

/**
 * Get coordinates from pincode using external geocoding service
 * @param {string} pincode 
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCoordinatesFromPincode = async (pincode) => {
  try {
    // First try India Post API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {
      const postOffice = data[0].PostOffice[0];
      const lat = parseFloat(postOffice.Latitude);
      const lng = parseFloat(postOffice.Longitude);
      
      if (lat && lng && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }
    
    // Fallback to OpenStreetMap Nominatim API
    const nominatimResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${pincode},India&limit=1`,
      {
        headers: {
          'User-Agent': 'HealthSecure/1.0'
        }
      }
    );
    const nominatimData = await nominatimResponse.json();
    
    if (nominatimData && nominatimData[0]) {
      return {
        lat: parseFloat(nominatimData[0].lat),
        lng: parseFloat(nominatimData[0].lon)
      };
    }
    
    throw new Error('Invalid pincode');
  } catch (error) {
    console.error('Error getting coordinates from pincode:', error);
    throw new Error('Failed to get coordinates from pincode');
  }
};

/**
 * Validate Indian pincode format
 * @param {string} pincode 
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
  return /^\d{6}$/.test(pincode);
};

/**
 * Create a geospatial query for MongoDB
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} radiusInKm 
 * @returns {Object} MongoDB geospatial query
 */
export const createGeoQuery = (latitude, longitude, radiusInKm) => {
  return {
    'practiceLocations.location': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    }
  };
};

/**
 * Get address components from coordinates using reverse geocoding
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>}
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Using OpenStreetMap Nominatim API (free, but consider rate limits)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HealthSecure/1.0'
        }
      }
    );
    const data = await response.json();
    
    return {
      street: data.address.road || data.address.street || '',
      city: data.address.city || data.address.town || data.address.village || '',
      state: data.address.state || '',
      pincode: data.address.postcode || '',
      country: data.address.country || 'India'
    };
  } catch (error) {
    throw new Error('Failed to get address from coordinates');
  }
};

/**
 * Calculate slots between two times
 * @param {string} startTime - HH:mm format
 * @param {string} endTime - HH:mm format
 * @param {number} slotDuration - in minutes
 * @param {Object} breakTime - { start: 'HH:mm', end: 'HH:mm' }
 * @returns {Array<{start: string, end: string}>}
 */
export const calculateTimeSlots = (startTime, endTime, slotDuration, breakTime = null) => {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  let breakStart = null;
  let breakEnd = null;

  if (breakTime) {
    breakStart = new Date(`2000-01-01T${breakTime.start}`);
    breakEnd = new Date(`2000-01-01T${breakTime.end}`);
  }

  let currentSlot = new Date(start);
  while (currentSlot < end) {
    const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
    
    // Skip break time
    if (breakTime && currentSlot >= breakStart && currentSlot < breakEnd) {
      currentSlot = new Date(breakEnd);
      continue;
    }

    if (slotEnd <= end) {
      slots.push({
        start: currentSlot.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5)
      });
    }
    
    currentSlot = slotEnd;
  }

  return slots;
}; 