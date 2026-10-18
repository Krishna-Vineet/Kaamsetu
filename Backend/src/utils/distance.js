// Cache for distance calculations to avoid repeated API calls
const distanceCache = new Map();

/**
 * Calculate straight-line distance using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate road distance using OpenRouteService API with fallback to Haversine
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {Promise<number>} Distance in kilometers
 */
export async function calculateRoadDistance(lat1, lon1, lat2, lon2) {
  const cacheKey = `${lat1},${lon1}-${lat2},${lon2}`;
  
  // Check cache first
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey);
  }

  // Never hardcode API keys — set OPENROUTESERVICE_API_KEY in the environment.
  // Without a key we fall back to straight-line (Haversine) distance.
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    const fallback = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    distanceCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    // Use OpenRouteService API for road distance (native fetch with 5s timeout)
    const url = new URL('https://api.openrouteservice.org/v2/directions/driving-car');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('start', `${lon1},${lat1}`);
    url.searchParams.set('end', `${lon2},${lat2}`);

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features[0]) {
        const distanceMeters = data.features[0].properties.segments[0].distance;
        const distanceKm = distanceMeters / 1000;

        // Cache the result
        distanceCache.set(cacheKey, distanceKm);
        return distanceKm;
      }
    }
  } catch (error) {
    console.log('OpenRouteService API failed, falling back to Haversine:', error.message);
  }

  // Fallback to Haversine distance
  const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  distanceCache.set(cacheKey, distance);
  return distance;
}

/**
 * Validate if coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export function isValidCoordinates(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
         lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 &&
         !isNaN(lat) && !isNaN(lon);
}

/**
 * Calculate distances from worker location to multiple jobs
 * @param {Object} workerLocation - Worker's location {lat, lon}
 * @param {Array} jobs - Array of job objects with address.location
 * @returns {Promise<Object>} Object with jobId as key and distance as value
 */
export async function calculateJobDistances(workerLocation, jobs) {
  const distances = {};
  
  if (!workerLocation || !isValidCoordinates(workerLocation.lat, workerLocation.lon)) {
    return distances;
  }

  for (const job of jobs) {
    if (job.address && job.address.location && 
        isValidCoordinates(job.address.location.lat, job.address.location.lon)) {
      try {
        const distance = await calculateRoadDistance(
          workerLocation.lat,
          workerLocation.lon,
          job.address.location.lat,
          job.address.location.lon
        );
        distances[job._id] = distance;
      } catch (error) {
        console.error(`Error calculating distance for job ${job._id}:`, error);
        // Use Haversine as fallback
        distances[job._id] = calculateHaversineDistance(
          workerLocation.lat,
          workerLocation.lon,
          job.address.location.lat,
          job.address.location.lon
        );
      }
    }
  }

  return distances;
}
