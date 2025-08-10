// Centralized avatar helpers for consistent initial fallback & URI validation
export const getInitial = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

// Accept https/http (if needed), data URI, and (future) file/content schemes for local picks
const VALID_URI_REGEX = /^(https?:|data:image|file:|content:)/;
export const isValidImageUri = (uri) => typeof uri === 'string' && VALID_URI_REGEX.test(uri);
