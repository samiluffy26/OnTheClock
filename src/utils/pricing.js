// Sistema de cálculo de tarifas
// NOTA: Estos son precios de prueba. Actualiza según los precios reales de la empresa.

const PRICING_CONFIG = {
  // Tarifa base por milla
  baseFarePerMile: 3.5,
  
  // Tarifa mínima
  minimumFare: 25.00,
  
  // Multiplicadores por tipo de vehículo
  vehicleMultipliers: {
    'standard': 1.0,
    'wheelchair': 1.2,
    'ambulance': 1.8
  },
  
  // Cargos adicionales
  additionalCharges: {
    returnTrip: 0.9, // 90% del precio original para viaje de regreso
    waitTime: 0.5, // $0.50 por minuto de espera
    bedService: {
      'bed-to-room': 15.00,
      'room-to-bed': 15.00,
      'bed-to-bed': 25.00
    },
    equipment: {
      'electric-stair-chair': 10.00,
      'oxygen-tank': 15.00
    },
    additionalAssistance: 20.00
  },
  
  // Estimación de distancia (simulada - en producción usar Google Maps API)
  estimatedMilesPerLocation: 10 // Millas promedio por defecto
};

export function calculateDistance(pickup, dropoff) {
  // SIMULACIÓN: En producción, usar Google Maps Distance Matrix API
  // Por ahora retorna una distancia simulada basada en la longitud del texto
  const baseDistance = PRICING_CONFIG.estimatedMilesPerLocation;
  const variation = Math.random() * 5; // Variación de 0-5 millas
  return Math.round((baseDistance + variation) * 10) / 10;
}

export function calculateFare(bookingData) {
  const {
    pickupLocation,
    dropoffLocation,
    vehicleType = 'standard',
    returnTrip = false,
    bedService = 'none',
    equipment = [],
    additionalAssistance = false
  } = bookingData;

  // Calcular distancia
  const distance = calculateDistance(pickupLocation, dropoffLocation);
  
  // Tarifa base
  let baseFare = distance * PRICING_CONFIG.baseFarePerMile;
  
  // Aplicar tarifa mínima
  if (baseFare < PRICING_CONFIG.minimumFare) {
    baseFare = PRICING_CONFIG.minimumFare;
  }
  
  // Multiplicador por tipo de vehículo
  const vehicleMultiplier = PRICING_CONFIG.vehicleMultipliers[vehicleType] || 1.0;
  let totalFare = baseFare * vehicleMultiplier;
  
  // Cargos adicionales
  let additionalCosts = 0;
  
  // Servicio de cama
  if (bedService !== 'none' && PRICING_CONFIG.additionalCharges.bedService[bedService]) {
    additionalCosts += PRICING_CONFIG.additionalCharges.bedService[bedService];
  }
  
  // Equipo adicional
  if (equipment && equipment.length > 0) {
    equipment.forEach(item => {
      if (PRICING_CONFIG.additionalCharges.equipment[item]) {
        additionalCosts += PRICING_CONFIG.additionalCharges.equipment[item];
      }
    });
  }
  
  // Asistencia adicional
  if (additionalAssistance) {
    additionalCosts += PRICING_CONFIG.additionalCharges.additionalAssistance;
  }
  
  // Calcular viaje de ida
  const oneWayTotal = totalFare + additionalCosts;
  
  // Calcular viaje de regreso si aplica
  let returnTripCost = 0;
  if (returnTrip) {
    returnTripCost = oneWayTotal * PRICING_CONFIG.additionalCharges.returnTrip;
  }
  
  // Total final
  const finalTotal = oneWayTotal + returnTripCost;
  
  return {
    distance: distance,
    baseFare: baseFare.toFixed(2),
    vehicleType: vehicleType,
    vehicleCharge: (baseFare * vehicleMultiplier - baseFare).toFixed(2),
    additionalCosts: additionalCosts.toFixed(2),
    oneWayTotal: oneWayTotal.toFixed(2),
    returnTripCost: returnTripCost > 0 ? returnTripCost.toFixed(2) : null,
    finalTotal: finalTotal.toFixed(2)
  };
}