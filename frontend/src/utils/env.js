const isNode = typeof process !== 'undefined' && process.env;

export const VITE_API_BASE_URL = isNode
  ? process.env.VITE_API_BASE_URL || "http://localhost:3001"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const VITE_BACKEND_URL = isNode
  ? process.env.VITE_BACKEND_URL || "http://localhost:3001"
  : import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const VITE_KHALTI_PUBLIC_KEY = isNode
  ? process.env.VITE_KHALTI_PUBLIC_KEY || "test_public_key_617c4c6fe77c441d88451ec1408a0c0e"
  : import.meta.env.VITE_KHALTI_PUBLIC_KEY || "test_public_key_617c4c6fe77c441d88451ec1408a0c0e";

export const VITE_KHALTI_SECRET_KEY = isNode
  ? process.env.VITE_KHALTI_SECRET_KEY || "test_secret_key_3f78fb6364ef4bd1b5fc670ce33a06f5"
  : import.meta.env.VITE_KHALTI_SECRET_KEY || "test_secret_key_3f78fb6364ef4bd1b5fc670ce33a06f5"; 