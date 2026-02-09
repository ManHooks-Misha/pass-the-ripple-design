// src/lib/auth-token.ts
const AUTH_STORAGE_KEY = "ripple_auth_data";

interface StoredAuthData {
  user: any;
  token: string;
  expiresAt: number;
}

let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  // console.log('🔑 setAuthToken called:', token ? 'token set' : 'token cleared');
  currentToken = token;
};

export const getAuthToken = (): string | null => {
  if (currentToken) return currentToken;

  // Get token from new storage structure
  try {
    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedData) {
      const authData: StoredAuthData = JSON.parse(storedData);

      // Return the token even if expired - let the API/AuthContext handle refresh
      // This prevents "Unauthenticated" errors before refresh can happen
      // The AuthContext will handle token refresh on app load if needed
      currentToken = authData.token;
      return authData.token;
    }
  } catch (e) {
    console.error("Failed to get auth token:", e);
  }

  // Fallback to old storage (for backward compatibility during migration)
  return sessionStorage.getItem("authToken");
};

// 🔥 NEW: Clear the in-memory token cache
export const clearAuthToken = () => {
  // console.log('🗑️ Clearing in-memory auth token');
  currentToken = null;
};