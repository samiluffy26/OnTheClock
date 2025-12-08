// src/config/api.js
export const API_URL = import.meta.env.PUBLIC_API_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:3001' 
    : 'https://ontheclock-96ip.onrender.com'); // ⚠️ Usa tu URL real de Render

export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
