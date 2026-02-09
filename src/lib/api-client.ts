import { getAuthToken } from "@/lib/auth-token";
import { getConfig } from "@/config/runtime-config";

// Use runtime config for API URLs with fallback to environment variables
export const getApiBaseUrl = (): string => {
  return getConfig().apiBaseUrl || import.meta.env.VITE_API_BASE_URL;
};

export const getUploadBaseUrl = (): string => {
  return getConfig().uploadBaseUrl || import.meta.env.VITE_UPLOAD_BASE_URL;
};

// Legacy exports for backward compatibility (now returns runtime config)
export const API_BASE_URL = getApiBaseUrl();
export const UPLOAD_BASE_URL = getUploadBaseUrl();

const AUTH_STORAGE_KEY = "ripple_auth_data";
const LAST_ACTIVITY_KEY = "ripple_last_activity";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours of inactivity

interface StoredAuthData {
  user: any;
  token: string;
  expiresAt: number;
}

// --- Token Refresh ---
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// --- Proactive Refresh ---
let proactiveRefreshInterval: NodeJS.Timeout | null = null;

// --- Activity Tracking ---
function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

function isSessionExpired(): boolean {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return true;
  const lastActivityTime = parseInt(lastActivity, 10);
  return Date.now() - lastActivityTime > SESSION_DURATION;
}

function forceLogout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  stopProactiveTokenRefresh();
  window.location.href = "/login";
}

async function refreshAuthToken(): Promise<string | null> {
  if (isSessionExpired()) {
    forceLogout();
    return null;
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedData) {
        isRefreshing = false;
        return null;
      }

      const authData: StoredAuthData = JSON.parse(storedData);

      const res = await fetch(`${getApiBaseUrl()}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${authData.token}`,
        },
        credentials: "include",
      });

      const errorData = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Detect refresh token expiry
        if (
          res.status === 401 ||
          res.status === 403 ||
          errorData.message?.includes("refresh") ||
          errorData.code === "TOKEN_EXPIRED"
        ) {
          console.warn("Refresh token expired or invalid");
        }
        forceLogout();
        isRefreshing = false;
        return null;
      }

      const data = await res.json();
      if (data.success && data.data) {
        const newToken = data.data.access_token;
        const newUser = data.data.user;
        const expiresIn = data.data.expires_in;

        let expiresAt: number;
        if (typeof expiresIn === "object" && expiresIn?.date) {
          expiresAt = new Date(expiresIn.date).getTime();
        } else if (typeof expiresIn === "number") {
          expiresAt = Date.now() + expiresIn * 1000;
        } else {
          expiresAt = Date.now() + 15 * 60 * 1000; // 10 min fallback
        }

        const newAuthData: StoredAuthData = {
          user: newUser,
          token: newToken,
          expiresAt,
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
        updateLastActivity();
        isRefreshing = false;
        return newToken;
      }

      isRefreshing = false;
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      forceLogout();
      isRefreshing = false;
      return null;
    }
  })();

  return refreshPromise;
}

// --- Proactive Refresh ---
export function startProactiveTokenRefresh() {
  if (proactiveRefreshInterval || typeof window === "undefined") return;

  const checkAndRefresh = async () => {
    if (isSessionExpired()) return;

    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;

    const authData: StoredAuthData = JSON.parse(stored);
    const timeLeft = authData.expiresAt - Date.now();

    // Refresh if < 5 minutes left
    if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
      await refreshAuthToken();
    }
  };

  // Check every minute
  proactiveRefreshInterval = setInterval(checkAndRefresh, 60 * 1000);
  checkAndRefresh(); // Initial check
}

export function stopProactiveTokenRefresh() {
  if (proactiveRefreshInterval) {
    clearInterval(proactiveRefreshInterval);
    proactiveRefreshInterval = null;
  }
}

// --- Activity Tracking ---
function setupActivityTracking(): void {
  const events = [
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click",
    "focus",
  ];

  const updateActivity = () => {
    updateLastActivity();
  };

  events.forEach((event) => {
    document.addEventListener(event, updateActivity, { passive: true });
  });

  // Tab visibility
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateLastActivity();
    }
  });

  // Heartbeat: every 5 min if tab is open
  setInterval(() => {
    if (document.visibilityState === "visible") {
      updateLastActivity();
    }
  }, 5 * 60 * 1000);

  // Cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key === LAST_ACTIVITY_KEY) {
      updateLastActivity();
    }
  });

  updateLastActivity();
}

// Initialize on load
if (typeof window !== "undefined") {
  setupActivityTracking();

  // Auto-start proactive refresh if logged in
  const initAuth = () => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const authData: StoredAuthData = JSON.parse(stored);
        if (authData.expiresAt > Date.now()) {
          startProactiveTokenRefresh();
        }
      } catch {
        // Invalid JSON
      }
    }
  };

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuth);
  } else {
    initAuth();
  }
}

// --- Cache & Retry ---
const fetchCache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchWithRetry(
  fetchFn: () => Promise<Response>,
  retries = 2,
  backoff = 400
): Promise<Response> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetchFn();
      if (
        res.status >= 500 ||
        res.status === 429 ||
        res.type === "error" ||
        (res.status === 0 && !res.ok)
      ) {
        throw new Error("Retryable");
      }
      return res;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, backoff * 2 ** attempt));
    }
    attempt++;
  }
  throw new Error("Max retries");
}

// --- Main API Fetch (JSON) ---
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  opts?: { disableCache?: boolean }
): Promise<T> {
  if (isSessionExpired()) {
    forceLogout();
    throw new Error("Session expired");
  }

  const token = getAuthToken();
  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const isGet = (options.method || "GET").toUpperCase() === "GET";
  const cacheKey = `${endpoint}|${JSON.stringify(options.body || {})}|${JSON.stringify(
    mergedHeaders
  )}`;

  // Cache hit
  if (isGet && !opts?.disableCache && fetchCache[cacheKey]) {
    const { timestamp, data } = fetchCache[cacheKey];
    if (Date.now() - timestamp < CACHE_TTL) {
      return data as T;
    }
  }

  let res = await fetchWithRetry(() =>
    fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: mergedHeaders,
      ...options,
      credentials: "include",
    })
  );

  // 401 → try refresh
  if (res.status === 401 && !endpoint.includes("/login") && !endpoint.includes("/refresh-token")) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      res = await fetchWithRetry(() =>
        fetch(`${getApiBaseUrl()}${endpoint}`, {
          headers: mergedHeaders,
          ...options,
          credentials: "include",
        })
      );
    } else {
      throw new Error("Authentication failed");
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw data || { message: "API request failed" };
  }

  updateLastActivity();

  // Cache result
  if (isGet && !opts?.disableCache) {
    fetchCache[cacheKey] = { timestamp: Date.now(), data };
  }

  return data;
}

// --- FormData Upload ---
export async function apiFetchFormData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (isSessionExpired()) {
    forceLogout();
    throw new Error("Session expired");
  }

  const token = getAuthToken();
  const mergedHeaders: HeadersInit = {
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: mergedHeaders,
    ...options,
    credentials: "include",
  });

  if (res.status === 401 && !endpoint.includes("/login") && !endpoint.includes("/refresh-token")) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: mergedHeaders,
        ...options,
        credentials: "include",
      });
    } else {
      throw new Error("Authentication failed");
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw data || { message: "Upload failed" };
  }

  updateLastActivity();
  return data;
}

// --- Example Usage ---
export async function apiJoinChallenge(challengeId: string) {
  return apiFetch(`/challenges/${challengeId}/join`, { method: "POST" });
}

// --- Session Manager ---
export const sessionManager = {
  updateLastActivity,
  isSessionExpired,
  forceLogout,
  getRemainingSessionTime: (): number => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return 0;
    const lastActivityTime = parseInt(lastActivity, 10);
    const elapsed = Date.now() - lastActivityTime;
    return Math.max(0, SESSION_DURATION - elapsed);
  },
  startProactiveTokenRefresh,
  stopProactiveTokenRefresh,
};

// --- Optional: Session Expiry Warning Hook (React) ---
export function useSessionWarning(thresholdMinutes = 5) {
  // Example: Show toast when < 5 min left
  // Implement in your UI layer
}