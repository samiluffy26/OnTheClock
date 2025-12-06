import { calculateFare } from '../../utils/pricing.js';

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.pickupLocation || !data.dropoffLocation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Pickup and dropoff locations are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Si no viene la distancia, calcularla
    let distance = data.distance;
    if (!distance) {
      // Calcular distancia usando Google Maps
      const distanceResponse = await fetch(`${new URL(request.url).origin}/api/calculate-distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: data.pickupLocation,
          destination: data.dropoffLocation
        })
      });
      
      const distanceData = await distanceResponse.json();
      
      if (distanceData.success) {
        distance = distanceData.distance;
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: 'Could not calculate distance'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Calcular tarifa
    const fareDetails = calculateFare({
      ...data,
      distance: distance
    });
    
    return new Response(JSON.stringify({
      success: true,
      fare: fareDetails
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error calculating fare:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error calculating fare'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}