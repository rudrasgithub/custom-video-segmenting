// Environment-based configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Debug: Log all environment variables
console.log('All env vars:', import.meta.env);
console.log('VITE_BACKEND_URL from env:', import.meta.env.VITE_BACKEND_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

// Backend URL configuration
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (isDevelopment ? "http://localhost:3000" : "https://custom-video-segmenting-backend.vercel.app");

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
  backendUrl: BACKEND_URL,
  envBackendUrl: import.meta.env.VITE_BACKEND_URL
};

console.log('Environment Config:', ENV_INFO);