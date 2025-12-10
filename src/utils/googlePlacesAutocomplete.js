/**
 * Google Places Autocomplete con cálculo de distancia real
 */

let autocompleteInstances = new Map();

/**
 * Inicializar Google Places Autocomplete en un input
 */
export function initGooglePlacesAutocomplete(inputId, options = {}) {
  const input = document.getElementById(inputId);
  
  if (!input) {
    console.error(`Input with id "${inputId}" not found`);
    return null;
  }

  // Verificar que Google Maps esté cargado
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    console.error('Google Maps Places library not loaded');
    return null;
  }

  // Opciones por defecto
  const defaultOptions = {
    componentRestrictions: { country: 'us' }, // Solo USA
    fields: ['formatted_address', 'geometry', 'name', 'place_id'],
    types: ['address'] // Puedes cambiar a ['geocode'] para más general
  };

  const autocompleteOptions = { ...defaultOptions, ...options };

  // Crear instancia de Autocomplete
  const autocomplete = new google.maps.places.Autocomplete(input, autocompleteOptions);

  // Guardar referencia
  autocompleteInstances.set(inputId, autocomplete);

  // Listener para cuando se selecciona un lugar
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      console.error('No geometry data for selected place');
      return;
    }

    // Guardar datos en el input como data attributes
    input.dataset.placeId = place.place_id;
    input.dataset.lat = place.geometry.location.lat();
    input.dataset.lng = place.geometry.location.lng();
    input.dataset.formattedAddress = place.formatted_address;

    // Disparar evento personalizado
    input.dispatchEvent(new CustomEvent('placeSelected', {
      detail: {
        placeId: place.place_id,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        formattedAddress: place.formatted_address,
        name: place.name
      }
    }));

    console.log('Place selected:', place.formatted_address);
  });

  return autocomplete;
}

/**
 * Calcular distancia entre dos lugares usando Distance Matrix API
 */
export async function calculateDistance(origin, destination) {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.maps) {
      reject(new Error('Google Maps not loaded'));
      return;
    }

    const service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL, // Millas
        avoidHighways: false,
        avoidTolls: false
      },
      (response, status) => {
        if (status === 'OK') {
          const result = response.rows[0].elements[0];

          if (result.status === 'OK') {
            const distanceInMeters = result.distance.value;
            const distanceInMiles = distanceInMeters * 0.000621371;
            const durationInSeconds = result.duration.value;

            resolve({
              success: true,
              distance: distanceInMiles,
              distanceText: result.distance.text,
              duration: result.duration.text,
              durationValue: durationInSeconds,
              origin: response.originAddresses[0],
              destination: response.destinationAddresses[0]
            });
          } else {
            reject(new Error(`Distance calculation failed: ${result.status}`));
          }
        } else {
          reject(new Error(`Distance Matrix API error: ${status}`));
        }
      }
    );
  });
}

/**
 * Obtener instancia de autocomplete
 */
export function getAutocompleteInstance(inputId) {
  return autocompleteInstances.get(inputId);
}

/**
 * Limpiar instancia de autocomplete
 */
export function clearAutocomplete(inputId) {
  const instance = autocompleteInstances.get(inputId);
  if (instance) {
    google.maps.event.clearInstanceListeners(instance);
    autocompleteInstances.delete(inputId);
  }
}

/**
 * Limpiar todas las instancias
 */
export function clearAllAutocompletes() {
  autocompleteInstances.forEach((instance, inputId) => {
    google.maps.event.clearInstanceListeners(instance);
  });
  autocompleteInstances.clear();
}