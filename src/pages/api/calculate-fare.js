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
    
    // Calcular tarifa
    const fareDetails = calculateFare(data);
    
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