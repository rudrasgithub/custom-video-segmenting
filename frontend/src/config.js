// Environment-based configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Backend URL configuration
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (isDevelopment ? "http://localhost:3000" : "https://your-backend-app.vercel.app");

// API endpoints
export const API_ENDPOINTS = {
  GET_VIDEO: `${BACKEND_URL}/getVideo`,
  DOWNLOAD_VIDEO: `${BACKEND_URL}/downloadVideo`,
  DOWNLOAD_CLIP: `${BACKEND_URL}/downloadClip`
};

// Environment info (for debugging)
export const ENV_INFO = {
  mode: import.meta.env.MODE,
  isDevelopment,
  isProduction,
  backendUrl: BACKEND_URL
};

console.log('Environment:', ENV_INFO);