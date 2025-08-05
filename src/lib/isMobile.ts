// src/utils/isMobile.ts
export const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
};

