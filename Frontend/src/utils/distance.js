// Distance calculation utilities

// Haversine formula to calculate distance between two coordinates
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// OpenRouteService API for more accurate road distances
const ORS_API_KEY = import.meta.env.REACT_APP_ORS_API_KEY || '5b3ce3597851110001cf6248a1c4c7b1d8c04c8e8b8f4c4c4c4c4c4c'; // Free tier key

export const calculateRoadDistance = async (startLat, startLon, endLat, endLon) => {
  try {
    // Use OpenRouteService Directions API
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startLon},${startLat}&end=${endLon},${endLat}`);
    
    if (!response.ok) {
      // Fallback to Haversine if API fails
      console.warn('Road distance API failed, using Haversine distance');
      return calculateHaversineDistance(startLat, startLon, endLat, endLon);
    }
    
    const data = await response.json();
    if (data.features && data.features[0] && data.features[0].properties) {
      const distanceInMeters = data.features[0].properties.segments[0].distance;
      const distanceInKm = distanceInMeters / 1000;
      return Math.round(distanceInKm * 10) / 10; // Round to 1 decimal place
    }
    
    // Fallback to Haversine if response format is unexpected
    return calculateHaversineDistance(startLat, startLon, endLat, endLon);
  } catch (error) {
    console.error('Error calculating road distance:', error);
    // Fallback to Haversine distance
    return calculateHaversineDistance(startLat, startLon, endLat, endLon);
  }
};

// Calculate distance with caching to avoid repeated API calls
const distanceCache = new Map();

export const calculateDistanceWithCache = async (startLat, startLon, endLat, endLon, useRoadDistance = true) => {
  const cacheKey = `${startLat},${startLon}-${endLat},${endLon}`;
  
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey);
  }
  
  let distance;
  if (useRoadDistance) {
    distance = await calculateRoadDistance(startLat, startLon, endLat, endLon);
  } else {
    distance = calculateHaversineDistance(startLat, startLon, endLat, endLon);
  }
  
  distanceCache.set(cacheKey, distance);
  return distance;
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

// Check if coordinates are valid
export const isValidCoordinates = (lat, lon) => {
  return lat !== null && lon !== null && 
         lat !== undefined && lon !== undefined &&
         lat >= -90 && lat <= 90 &&
         lon >= -180 && lon <= 180;
};
