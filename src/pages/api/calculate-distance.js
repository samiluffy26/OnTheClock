const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

function calculateDistanceHaversine(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

async function geocodeAddress(address) {
  try {
    const url = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1'
    });
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OnTheClockTransportation/1.0' }
    });
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };
  } catch (error) {
    console.error('Error geocoding:', error);
    return null;
  }
}

export async function POST({ request }) {
  try {
    const { origin, destination } = await request.json();
    
    console.log('📍 Calculando distancia:', origin, '→', destination);
    
    if (!origin || !destination) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Origin and destination are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const originGeo = await geocodeAddress(origin);
    const destGeo = await geocodeAddress(destination);
    
    if (!originGeo) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Origin address not found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!destGeo) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Destination address not found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const straightDistance = calculateDistanceHaversine(
      originGeo.lat,
      originGeo.lon,
      destGeo.lat,
      destGeo.lon
    );
    
    const distance = straightDistance * 1.3;
    
    const durationHours = distance / 45;
    const durationMinutes = Math.round(durationHours * 60);
    
    let durationText;
    if (durationMinutes < 60) {
      durationText = `${durationMinutes} mins`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const mins = durationMinutes % 60;
      durationText = mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
    }
    
    console.log('✅ Distancia calculada:', distance.toFixed(1), 'mi');
    
    return new Response(JSON.stringify({
      success: true,
      distance: distance,
      duration: durationText,
      distanceText: `${distance.toFixed(1)} mi`,
      origin: originGeo.display_name,
      destination: destGeo.display_name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}