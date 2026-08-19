// frontend/src/utils/validators.js

/** Validate news article text */
export const validateText = (text) => {
  if (!text || !text.trim()) {
    return { valid: false, error: "Please enter some text." };
  }
  if (text.trim().length < 20) {
    return { valid: false, error: "Text too short (min 20 characters)." };
  }
  if (text.length > 50000) {
    return { valid: false, error: "Text too long (max 50,000 characters)." };
  }
  return { valid: true, error: null };
};

/** Validate URL */
export const validateUrl = (url) => {
  if (!url) return { valid: true, error: null }; // optional
  try {
    new URL(url);
    return { valid: true, error: null };
  } catch {
    return { valid: false, error: "Invalid URL format." };
  }
};