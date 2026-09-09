const API_BASE_URL = 'https://mining-equipment-backend.onrender.com/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
const LEGACY_UPLOAD_PREFIX = /^\/?uploads\//i;

export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
};

export const normalizeImageList = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images.map(normalizeImageUrl).filter(Boolean);
};

export const isLegacyUploadUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return LEGACY_UPLOAD_PREFIX.test(url.trim()) || LEGACY_UPLOAD_PREFIX.test(url.replace(API_ORIGIN, '').trim());
};

export const createImageFallbackHandler = (setImageError, setCurrentSrc, fallbackSrc) => (event) => {
  if (event?.target && event.target.src !== fallbackSrc) {
    event.target.src = fallbackSrc;
  }

  if (typeof setCurrentSrc === 'function') {
    setCurrentSrc(fallbackSrc);
  }

  if (typeof setImageError === 'function') {
    setImageError(true);
  }
};
