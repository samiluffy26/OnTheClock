/**
 * Google Maps - Autocomplete y Distance Calculator
 * 100% Frontend - No requiere backend
 */

/**
 * Esperar a que Google Maps se cargue
 */
export function waitForGoogleMaps() {
  return new Promise((resolve, reject) => {
    // Si ya está cargado
    if (window.googleMapsLoaded && window.google && window.google.maps) {
      resolve();
      return;
    }

    // Esperar al evento
    window.addEventListener('googleMapsLoaded', () => {
      resolve();
    }, { once: true });

    // Timeout de 10 segundos
    setTimeout(() => {
      reject(new Error('Google Maps loading timeout'));
    }, 10000);
  });
}

/**
 * Inicializar Google Places Autocomplete
 */
export function initAutocomplete(inputId, onPlaceSelected) {
  const input = document.getElementById(inputId);
  
  if (!input) {
    console.error(`Input ${inputId} not found`);
    return null;
  }

  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps Places not loaded');
    return null;
  }

  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: 'us' },
    fields: ['formatted_address', 'geometry', 'name', 'place_id'],
    types: ['address']
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      console.error('No geometry for place');
      return;
    }

    // Guardar datos en el input
    input.dataset.placeId = place.place_id;
    input.dataset.lat = place.geometry.location.lat();
    input.dataset.lng = place.geometry.location.lng();
    input.dataset.address = place.formatted_address;

    // Callback
    if (onPlaceSelected) {
      onPlaceSelected({
        placeId: place.place_id,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
        name: place.name
      });
    }

    console.log('✅ Place selected:', place.formatted_address);
  });

  return autocomplete;
}

/**
 * Calcular distancia entre dos lugares
 */
export function calculateDistance(origin, destination) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps not loaded'));
      return;
    }

    const service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        if (status === 'OK') {
          const result = response.rows[0].elements[0];

          if (result.status === 'OK') {
            const distanceInMeters = result.distance.value;
            const distanceInMiles = distanceInMeters * 0.000621371;

            resolve({
              success: true,
              distance: distanceInMiles,
              distanceText: result.distance.text,
              duration: result.duration.text,
              durationSeconds: result.duration.value,
              origin: response.originAddresses[0],
              destination: response.destinationAddresses[0]
            });
          } else {
            reject(new Error(`Cannot calculate route: ${result.status}`));
          }
        } else {
          reject(new Error(`Distance Matrix error: ${status}`));
        }
      }
    );
  });
}

/**
 * Calcular precio basado en distancia
 */
export function calculateFare(distanceInMiles, options = {}) {
  const {
    returnTrip = false,
    vehicleType = 'standard',
    waitTime = 0, // en horas
  } = options;

  // Primeras 10 millas: $28
  const BASE_FARE = 28.00;
  // Millas adicionales: $1.75/milla
  const ADDITIONAL_MILE_RATE = 1.75;
  // Tiempo de espera: $25/hora
  const WAIT_TIME_RATE = 25.00;

  // Multiplicadores por tipo de vehículo
  const VEHICLE_MULTIPLIERS = {
    standard: 1.0,
    wheelchair: 1.2,
    ambulance: 1.8
  };

  let fare = 0;

  // Calcular tarifa base
  if (distanceInMiles <= 10) {
    fare = BASE_FARE;
  } else {
    const additionalMiles = distanceInMiles - 10;
    fare = BASE_FARE + (additionalMiles * ADDITIONAL_MILE_RATE);
  }

  // Aplicar multiplicador de vehículo
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
  fare = fare * multiplier;

  // Agregar tiempo de espera
  const waitTimeCost = waitTime * WAIT_TIME_RATE;
  fare += waitTimeCost;

  // Viaje de regreso (se cobra distancia total)
  const returnFare = returnTrip ? fare : 0;
  const totalFare = fare + returnFare;

  return {
    distance: distanceInMiles.toFixed(2),
    baseFare: BASE_FARE.toFixed(2),
    additionalMiles: Math.max(0, distanceInMiles - 10).toFixed(2),
    oneWayFare: fare.toFixed(2),
    returnFare: returnFare > 0 ? returnFare.toFixed(2) : '0.00',
    waitTimeCost: waitTimeCost.toFixed(2),
    totalFare: totalFare.toFixed(2),
    vehicleType,
    vehicleMultiplier: multiplier
  };
}