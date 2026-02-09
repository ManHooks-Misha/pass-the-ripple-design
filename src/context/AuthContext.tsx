// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { UserProfile } from "@/types";
import { setAuthToken, clearAuthToken } from "@/lib/auth-token";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (userData: UserProfile, token: string, expiresIn: number | string | null) => void;
  logout: () => void;
  loading: boolean;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "ripple_auth_data";

interface StoredAuthData {
  user: UserProfile;
  token: string;
  expiresAt: number;
}

// Helper to calculate expiry timestamp
function calculateExpiresAt(expiresIn: number | string | null | undefined | any): number {
  // Handle Laravel Carbon/DateTime object with { date: "2024-...", timezone_type: 3, timezone: "UTC" }
  if (typeof expiresIn === 'object' && expiresIn?.date) {
    return new Date(expiresIn.date).getTime();
  }
  // Handle timestamp object (Carbon serialization format)
  if (typeof expiresIn === 'object' && expiresIn?.timestamp) {
    return expiresIn.timestamp * 1000;
  }
  // Handle number (seconds)
  if (typeof expiresIn === 'number') {
    return Date.now() + (expiresIn * 1000);
  }
  // Handle ISO string
  if (typeof expiresIn === 'string') {
    const parsed = new Date(expiresIn).getTime();
    // If parsed date is in the future, it's an absolute date
    if (parsed > Date.now()) {
      return parsed;
    }
    // Otherwise treat as seconds (edge case)
    const seconds = parseInt(expiresIn, 10);
    if (!isNaN(seconds)) {
      return Date.now() + (seconds * 1000);
    }
    return parsed;
  }
  // Default to 90 days (matching backend config)
  console.warn('Could not parse expiresIn, using 90-day default:', expiresIn);
  return Date.now() + (90 * 24 * 60 * 60 * 1000);
}

// Helper to get runtime API base URL
function getApiBaseUrl(): string {
  try {
    const { getConfig } = require('@/config/runtime-config');
    return getConfig().apiBaseUrl;
  } catch {
    return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Clear any scheduled refresh
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    console.log('Logging out...');

    // Clear state
    setUser(null);
    setToken(null);

    // Clear timers
    clearRefreshTimer();

    // Clear all storage
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("role");
    localStorage.removeItem("ripple_last_activity");
    localStorage.removeItem("dailyTasksLastShown");
    sessionStorage.clear();

    // Clear token cache
    clearAuthToken();

    isRefreshingRef.current = false;
  }, [clearRefreshTimer]);

  // Refresh token function (simplified - no apiFetch dependency)
  const refreshToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      console.log('Token refresh already in progress, skipping');
      return;
    }

    try {
      isRefreshingRef.current = true;
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!storedData) {
        console.log('No stored auth data, skipping refresh');
        return;
      }

      const authData: StoredAuthData = JSON.parse(storedData);
      console.log('Attempting to refresh token...');

      // Use native fetch to avoid circular dependencies with apiFetch
      const response = await fetch(`${getApiBaseUrl()}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${authData.token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        logout();
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        const newToken = data.data.access_token;
        const newUser = data.data.user;
        const expiresIn = data.data.expires_in;
        const expiresAt = calculateExpiresAt(expiresIn);

        const newAuthData: StoredAuthData = {
          user: newUser,
          token: newToken,
          expiresAt,
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
        setUser(newUser);
        setToken(newToken);
        setAuthToken(newToken);

        console.log('Token refreshed successfully');

        // Schedule next refresh (7 days before expiry)
        scheduleNextRefresh(expiresAt);
      } else {
        console.error('Token refresh returned no data');
        logout();
      }
    } catch (error: any) {
      console.error("Token refresh error:", error);
      // Only logout on auth errors, not network errors
      if (error?.status === 401 || error?.message?.includes('Unauthenticated')) {
        logout();
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [logout]);

  // Schedule the next token refresh
  const scheduleNextRefresh = useCallback((expiresAt: number) => {
    clearRefreshTimer();

    // Refresh 7 days before expiry
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const timeUntilRefresh = expiresAt - Date.now() - sevenDaysInMs;

    if (timeUntilRefresh > 0) {
      console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60 / 60 / 24)} days`);
      refreshTimerRef.current = setTimeout(() => {
        refreshToken();
      }, timeUntilRefresh);
    } else if (Date.now() < expiresAt) {
      // Token expires soon but hasn't expired yet, refresh now
      console.log('Token expiring soon, refreshing immediately');
      refreshToken();
    } else {
      // Token already expired
      console.log('Token expired, logging out');
      logout();
    }
  }, [clearRefreshTimer, refreshToken, logout]);

  // Login function
  const login = useCallback((userData: UserProfile, accessToken: string, expiresIn?: number | string | null) => {
    console.log('Logging in user:', userData.email || userData.nickname);

    const expiresAt = calculateExpiresAt(expiresIn);

    const authData: StoredAuthData = {
      user: userData,
      token: accessToken,
      expiresAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setUser(userData);
    setToken(accessToken);
    setAuthToken(accessToken);

    scheduleNextRefresh(expiresAt);
  }, [scheduleNextRefresh]);

  // Update user profile
  const updateUser = useCallback((userData: Partial<UserProfile>) => {
    setUser((prevUser) => {
      if (!prevUser) {
        console.warn('No user to update');
        return null;
      }

      const normalizedData = { ...userData };
      if ('avatar_id' in normalizedData) {
        if (normalizedData.avatar_id === null || normalizedData.avatar_id === undefined) {
          normalizedData.avatar_id = null;
        } else if (typeof normalizedData.avatar_id === 'string') {
          normalizedData.avatar_id = Number(normalizedData.avatar_id);
        }
      }

      const updatedUser = { ...prevUser, ...normalizedData };

      // Update localStorage
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedData) {
        try {
          const authData: StoredAuthData = JSON.parse(storedData);
          authData.user = updatedUser;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } catch (e) {
          console.error("Failed to update stored user data:", e);
        }
      }

      return updatedUser;
    });
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedData = localStorage.getItem(AUTH_STORAGE_KEY);

        if (storedData) {
          const authData: StoredAuthData = JSON.parse(storedData);

          // Check for rejected consent
          const consentStatus = authData.user?.consent_status || authData.user?.parent_consent_status;
          if (consentStatus === "rejected" || consentStatus === "denied") {
            console.log('Consent rejected, clearing auth');
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
          }

          // Check if token needs refresh
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
          const needsRefresh = Date.now() >= authData.expiresAt - sevenDaysInMs;

          if (needsRefresh) {
            console.log('Token needs refresh on init');
            await refreshToken();
          } else {
            console.log('Token valid, setting user');
            setUser(authData.user);
            setToken(authData.token);
            setAuthToken(authData.token);
            scheduleNextRefresh(authData.expiresAt);
          }
        }
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      clearRefreshTimer();
    };
  }, []); // Empty deps - only run once on mount

  // Sync auth across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        if (e.newValue) {
          const authData: StoredAuthData = JSON.parse(e.newValue);
          setUser(authData.user);
          setToken(authData.token);
          setAuthToken(authData.token);
          scheduleNextRefresh(authData.expiresAt);
        } else {
          setUser(null);
          setToken(null);
          clearAuthToken();
          clearRefreshTimer();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [scheduleNextRefresh, clearRefreshTimer]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshToken, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
