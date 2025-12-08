// src/lib/config.ts
export const config = {
  apiUrl: import.meta.env.PUBLIC_API_URL || 'https://ontheclock-96ip.onrender.com/',
  apiEndpoint: function() {
    return `${this.apiUrl}/api`;
  }
};