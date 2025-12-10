// Búsqueda de direcciones SIN usar Google Maps
// Usa OpenStreetMap (Nominatim) - GRATIS, sin límites estrictos

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export function initSimpleAddressSearch(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  let suggestionsContainer = document.getElementById(`${inputId}-suggestions`);
  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = `${inputId}-suggestions`;
    suggestionsContainer.className = 'autocomplete-suggestions';
    input.parentNode.appendChild(suggestionsContainer);
  }
  
  let debounceTimer;
  
  input.addEventListener('input', function(e) {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      return;
    }
    
    suggestionsContainer.innerHTML = '<div class="suggestion-item">Searching...</div>';
    suggestionsContainer.classList.add('active');
    
    debounceTimer = setTimeout(async () => {
      await searchWithNominatim(query, suggestionsContainer, input);
    }, 500);
  });
  
  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });
}

async function searchWithNominatim(query, container, input) {
  try {
    // Nominatim requiere un User-Agent
    const url = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: 1,
      countrycodes: 'us', // Solo USA
      limit: 5
    });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LifeRide/1.0' // Requerido por Nominatim
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      displayNominatimResults(data, container, input);
    } else {
      container.innerHTML = '<div class="suggestion-item">No results found</div>';
    }
  } catch (error) {
    console.error('Error searching:', error);
    container.innerHTML = '<div class="suggestion-item">Error searching. Try again.</div>';
  }
}

function displayNominatimResults(results, container, input) {
  container.innerHTML = '';
  
  results.forEach(result => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    
    const mainText = document.createElement('div');
    mainText.className = 'suggestion-main';
    mainText.textContent = result.display_name;
    
    item.appendChild(mainText);
    
    item.addEventListener('click', function() {
      input.value = result.display_name;
      input.dataset.lat = result.lat;
      input.dataset.lon = result.lon;
      
      container.classList.remove('active');
      
      input.dispatchEvent(new CustomEvent('addressSelected', {
        detail: {
          address: result.display_name,
          lat: result.lat,
          lon: result.lon
        }
      }));
    });
    
    container.appendChild(item);
  });
  
  container.classList.add('active');
}

// Calcular distancia entre dos coordenadas (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radio de la Tierra en millas
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

export async function getDistanceBetweenAddresses(origin, destination) {
  try {
    // Geocodificar origen
    const originUrl = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
      q: origin,
      format: 'json',
      limit: 1
    });
    
    const originResponse = await fetch(originUrl, {
      headers: { 'User-Agent': 'LifeRide/1.0' }
    });
    const originData = await originResponse.json();
    
    if (!originData || originData.length === 0) {
      throw new Error('Origin not found');
    }
    
    // Geocodificar destino
    const destUrl = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
      q: destination,
      format: 'json',
      limit: 1
    });
    
    const destResponse = await fetch(destUrl, {
      headers: { 'User-Agent': 'LifeRide/1.0' }
    });
    const destData = await destResponse.json();
    
    if (!destData || destData.length === 0) {
      throw new Error('Destination not found');
    }
    
    // Calcular distancia
    const distance = calculateDistance(
      parseFloat(originData[0].lat),
      parseFloat(originData[0].lon),
      parseFloat(destData[0].lat),
      parseFloat(destData[0].lon)
    );
    
    return {
      success: true,
      distance: distance,
      origin: originData[0].display_name,
      destination: destData[0].display_name
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    return {
      success: false,
      error: error.message
    };
  }
}