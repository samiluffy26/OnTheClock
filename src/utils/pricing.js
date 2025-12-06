// Sistema de cálculo de tarifas actualizado
// Precios según especificaciones del cliente

const PRICING_CONFIG = {
  // Tarifa base: $28 por las primeras 10 millas
  baseFare10Miles: 28.00,
  
  // Tarifa adicional: $1.75 por milla después de las primeras 10
  additionalMileRate: 1.75,
  
  // Tiempo de espera: $25 por hora
  waitTimeRate: 25.00,
  
  // Multiplicadores por tipo de vehículo
  vehicleMultipliers: {
    'standard': 1.0,
    'wheelchair': 1.2,
    'ambulance': 1.8
  },
  
  // Cargos adicionales
  additionalCharges: {
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
  }
};

export function calculateFare(bookingData) {
  const {
    distance, // Distancia en millas (viene de Google Maps)
    vehicleType = 'standard',
    returnTrip = false,
    waitTime = 0, // En horas
    bedService = 'none',
    equipment = [],
    additionalAssistance = false
  } = bookingData;

  // Calcular tarifa base según distancia
  let baseFare;
  if (distance <= 10) {
    // Primeras 10 millas: $28
    baseFare = PRICING_CONFIG.baseFare10Miles;
  } else {
    // Primeras 10 millas + millas adicionales
    const additionalMiles = distance - 10;
    baseFare = PRICING_CONFIG.baseFare10Miles + (additionalMiles * PRICING_CONFIG.additionalMileRate);
  }
  
  // Aplicar multiplicador por tipo de vehículo
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
  
  // Tiempo de espera
  let waitTimeCost = 0;
  if (waitTime > 0) {
    waitTimeCost = waitTime * PRICING_CONFIG.waitTimeRate;
  }
  
  // Calcular viaje de ida
  const oneWayTotal = totalFare + additionalCosts + waitTimeCost;
  
  // Calcular viaje de regreso (se cobra la distancia total completa)
  let returnTripCost = 0;
  if (returnTrip) {
    // El regreso cuesta lo mismo que la ida (distancia total)
    returnTripCost = totalFare + additionalCosts;
  }
  
  // Total final
  const finalTotal = oneWayTotal + returnTripCost;
  
  return {
    distance: distance.toFixed(2),
    baseFare: baseFare.toFixed(2),
    vehicleType: vehicleType,
    vehicleCharge: ((totalFare - baseFare)).toFixed(2),
    additionalCosts: additionalCosts.toFixed(2),
    waitTimeCost: waitTimeCost > 0 ? waitTimeCost.toFixed(2) : '0.00',
    oneWayTotal: oneWayTotal.toFixed(2),
    returnTripCost: returnTripCost > 0 ? returnTripCost.toFixed(2) : null,
    finalTotal: finalTotal.toFixed(2),
    breakdown: {
      baseFare10Miles: distance <= 10 ? baseFare.toFixed(2) : PRICING_CONFIG.baseFare10Miles.toFixed(2),
      additionalMiles: distance > 10 ? (distance - 10).toFixed(2) : '0.00',
      additionalMilesCost: distance > 10 ? ((distance - 10) * PRICING_CONFIG.additionalMileRate).toFixed(2) : '0.00'
    }
  };
}