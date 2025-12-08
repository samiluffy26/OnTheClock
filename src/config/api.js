// src/config/api.js
export const API_URL = (
  import.meta.env.PUBLIC_API_URL 
    ? import.meta.env.PUBLIC_API_URL.replace(/\/+$/,'') 
    : (import.meta.env.DEV 
      ? 'http://localhost:3001' 
      : 'https://ontheclock-96ip.onrender.com')
);

console.log('🔗 Using API_URL:', API_URL); // Para debug

export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log('📡 Fetching:', url); // Para debug
    
    const response = await fetch(url, {
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