import { VITE_API_BASE_URL } from './env';

const MEDIA_BASE_URL = VITE_API_BASE_URL || "http://localhost:3001";

export function getFullMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, '')}`;
}