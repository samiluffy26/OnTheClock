import { calculateFare } from '../../utils/pricing.js';

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    console.log('📥 Datos recibidos:', data);
    
    if (!data.pickupLocation || !data.dropoffLocation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Pickup and dropoff locations are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let distance = data.distance;
    
    if (!distance) {
      console.log('🔍 Calculando distancia...');
      
      const distanceResponse = await fetch(`${new URL(request.url).origin}/api/calculate-distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: data.pickupLocation,
          destination: data.dropoffLocation
        })
      });
      
      const distanceData = await distanceResponse.json();
      console.log('📏 Distancia:', distanceData);
      
      if (distanceData.success) {
        distance = distanceData.distance;
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: distanceData.error || 'Could not calculate distance'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log('💰 Calculando tarifa...');
    
    const fareDetails = calculateFare({
      ...data,
      distance: distance
    });
    
    console.log('✅ Tarifa calculada:', fareDetails);
    
    return new Response(JSON.stringify({
      success: true,
      fare: fareDetails
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error calculating fare: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}