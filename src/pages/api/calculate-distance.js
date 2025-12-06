export async function POST({ request }) {
  try {
    const { origin, destination } = await request.json();
    
    if (!origin || !destination) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Origin and destination are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Usar Google Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const distanceInMeters = data.rows[0].elements[0].distance.value;
      const distanceInMiles = distanceInMeters * 0.000621371; // Convertir a millas
      const duration = data.rows[0].elements[0].duration.text;
      
      return new Response(JSON.stringify({
        success: true,
        distance: distanceInMiles,
        duration: duration,
        distanceText: data.rows[0].elements[0].distance.text
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not calculate distance'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error calculating distance:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error calculating distance'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}