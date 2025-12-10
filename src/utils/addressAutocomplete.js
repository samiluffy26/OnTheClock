// Autocompletado usando OpenStreetMap Nominatim (100% GRATIS)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

let debounceTimers = {};

export function initAddressAutocomplete(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  let suggestionsContainer = document.getElementById(`${inputId}-suggestions`);
  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = `${inputId}-suggestions`;
    suggestionsContainer.className = 'autocomplete-suggestions';
    
    // Insertar después del input
    if (input.parentNode.classList.contains('autocomplete-wrapper')) {
      input.parentNode.appendChild(suggestionsContainer);
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'autocomplete-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(suggestionsContainer);
    }
  }
  
  input.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    if (debounceTimers[inputId]) {
      clearTimeout(debounceTimers[inputId]);
    }
    
    if (query.length < 3) {
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      return;
    }
    
    suggestionsContainer.innerHTML = '<div class="suggestion-item">Searching...</div>';
    suggestionsContainer.classList.add('active');
    
    debounceTimers[inputId] = setTimeout(async () => {
      await searchAddress(query, suggestionsContainer, input);
    }, 500);
  });
  
  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });
  
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      suggestionsContainer.classList.remove('active');
    }
  });
}

async function searchAddress(query, container, input) {
  try {
    const url = `${NOMINATIM_BASE_URL}/search?` + new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      countrycodes: 'us',
      limit: '5'
    });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LifeRideApp/1.0'
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      displaySuggestions(data, container, input);
    } else {
      container.innerHTML = '<div class="suggestion-item">No results found. Try: "Miami, FL" or "123 Main St, New York"</div>';
      container.classList.add('active');
    }
  } catch (error) {
    console.error('Error searching address:', error);
    container.innerHTML = '<div class="suggestion-item">Error searching. Please try again.</div>';
    container.classList.add('active');
  }
}

function displaySuggestions(results, container, input) {
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
      input.dataset.osmId = result.osm_id;
      
      container.classList.remove('active');
      container.innerHTML = '';
      
      input.dispatchEvent(new CustomEvent('addressSelected', {
        detail: {
          address: result.display_name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        }
      }));
    });
    
    container.appendChild(item);
  });
  
  container.classList.add('active');
}