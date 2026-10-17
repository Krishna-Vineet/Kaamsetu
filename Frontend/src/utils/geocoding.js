// Geocoding utility functions
export const geocodeAddress = async (address) => {
  try {
    // Using OpenStreetMap's Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    
    if (!response.ok) {
      throw new Error('Failed to geocode address')
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        success: true,
        coordinates: {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          lng: parseFloat(result.lon)
        },
        formatted: result.display_name,
        formattedAddress: result.display_name,
        city: result.display_name.split(',')[0].trim()
      }
    } else {
      throw new Error('Address not found')
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return {
      success: false,
      error: error.message || 'Failed to geocode address'
    }
  }
}

export const reverseGeocode = async (lat, lng) => {
  try {
    // Using OpenStreetMap's Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Failed to reverse geocode coordinates')
    }
    
    const data = await response.json()
    
    if (data && data.display_name) {
      return {
        success: true,
        address: data.display_name,
        details: data.address || {}
      }
    } else {
      throw new Error('Location not found')
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return {
      success: false,
      error: error.message || 'Failed to reverse geocode coordinates'
    }
  }
}

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          
          // Get address from coordinates
          const reverseResult = await reverseGeocode(lat, lon)
          
          if (reverseResult.success) {
            const cityArea = reverseResult.details.city || 
                           reverseResult.details.town || 
                           reverseResult.details.village || 
                           reverseResult.details.suburb || 
                           reverseResult.address.split(',')[0].trim()
            
            resolve({
              success: true,
              coordinates: { lat, lon, lng: lon },
              city: cityArea,
              formatted: reverseResult.address,
              accuracy: position.coords.accuracy
            })
          } else {
            resolve({
              success: false,
              error: reverseResult.error || 'Could not determine location'
            })
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Failed to get location details'
          })
        }
      },
      (error) => {
        let errorMessage = 'An unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        resolve({
          success: false,
          error: errorMessage
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  })
}