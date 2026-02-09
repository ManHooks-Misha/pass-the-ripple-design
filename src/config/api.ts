import { getAuthToken } from "@/lib/auth-token";
import { getConfig } from "./runtime-config";

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
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const SESSION_WARNING_TIME = 15 * 60 * 1000; // Warn 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

interface StoredAuthData {
  user: any;
  token: string;
  expiresAt: number;
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// ===== NEW: Session Monitoring =====
let sessionCheckInterval: NodeJS.Timeout | null = null;
let sessionWarningShown = false;

// ===== Request Queue Management =====
interface QueuedRequest {
  key: string;
  promise: Promise<any>;
  timestamp: number;
}

const requestQueue: Map<string, QueuedRequest> = new Map();
const QUEUE_TIMEOUT = 5000; // 5 seconds

// ===== Rate Limiting =====
interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number;
}

const rateLimitConfig: RateLimitConfig = {
  maxRequests: 50,
  timeWindow: 60000,
};

const requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > rateLimitConfig.timeWindow) {
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= rateLimitConfig.maxRequests) {
    console.warn('Rate limit exceeded. Please slow down requests.');
    return false;
  }
  
  requestTimestamps.push(now);
  return true;
}

// ===== Request Deduplication =====
function getRequestKey(endpoint: string, options: RequestInit): string {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${endpoint}:${body}`;
}

function deduplicateRequest<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const existing = requestQueue.get(key);
  
  if (existing && Date.now() - existing.timestamp < QUEUE_TIMEOUT) {
    console.log(`Deduplicating request: ${key}`);
    return existing.promise;
  }
  
  const promise = fetchFn().finally(() => {
    requestQueue.delete(key);
  });
  
  requestQueue.set(key, {
    key,
    promise,
    timestamp: Date.now(),
  });
  
  return promise;
}

// ===== Abort Controller Management =====
const abortControllers: Map<string, AbortController> = new Map();

function getAbortController(key: string): AbortController {
  const existing = abortControllers.get(key);
  if (existing) {
    existing.abort();
  }
  
  const controller = new AbortController();
  abortControllers.set(key, controller);
  
  return controller;
}

/**
 * Update last activity timestamp
 */
function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  sessionWarningShown = false; // Reset warning when user is active
}

/**
 * Check if session has expired based on 2-hour activity window
 */
function isSessionExpired(): boolean {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return true;
  
  const lastActivityTime = parseInt(lastActivity, 10);
  const timeSinceActivity = Date.now() - lastActivityTime;
  return timeSinceActivity > SESSION_DURATION;
}

/**
 * Get remaining session time in milliseconds
 */
function getRemainingSessionTime(): number {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return 0;
  
  const lastActivityTime = parseInt(lastActivity, 10);
  const elapsed = Date.now() - lastActivityTime;
  return Math.max(0, SESSION_DURATION - elapsed);
}

/**
 * Check if session is about to expire
 */
function isSessionExpiringSoon(): boolean {
  const remaining = getRemainingSessionTime();
  return remaining > 0 && remaining <= SESSION_WARNING_TIME;
}

/**
 * Clear auth data and redirect to login
 */
function forceLogout(reason: string = 'Session expired'): void {
  console.log(`Logging out: ${reason}`);
  stopSessionMonitoring();
  localStorage.removeItem("dailyTasksLastShown");
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  window.location.href = "/login";
}

/**
 * ===== NEW: Background session monitoring =====
 * Monitors session expiration and warns user before logout
 */
function monitorSession(): void {
  // Check if user is logged in
  const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedData) {
    return;
  }

  // Check if session has expired
  if (isSessionExpired()) {
    forceLogout('Session expired due to inactivity');
    return;
  }

  // Check if session is expiring soon and show warning
  if (isSessionExpiringSoon() && !sessionWarningShown) {
    sessionWarningShown = true;
    const remainingMinutes = Math.ceil(getRemainingSessionTime() / 60000);
    
    // Show warning to user (you can customize this)
    console.warn(`Session expiring in ${remainingMinutes} minutes. Move your mouse or interact with the page to stay logged in.`);
    
    // Optional: Show a toast notification or modal
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('session-warning', {
        detail: { remainingMinutes }
      }));
    }
  }
}

/**
 * Start background session monitoring
 */
function startSessionMonitoring(): void {
  if (sessionCheckInterval) {
    return; // Already running
  }

  // Initial check
  monitorSession();

  // Set up periodic checks
  sessionCheckInterval = setInterval(monitorSession, SESSION_CHECK_INTERVAL);
}

/**
 * Stop background session monitoring
 */
function stopSessionMonitoring(): void {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}

/**
 * Refresh the authentication token with session validation
 */
async function refreshAuthToken(): Promise<string | null> {
  // ===== REMOVED: Don't check session expiration here =====
  // The background monitor handles session expiration
  // This function only handles token refresh for 401 responses

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

      if (!res.ok) {
        forceLogout('Token refresh failed');
        isRefreshing = false;
        return null;
      }

      const data = await res.json();

      if (data.success && data.data) {
        const newToken = data.data.access_token;
        const newUser = data.data.user;
        const expiresIn = data.data.expires_in;

        let expiresAt: number;
        if (typeof expiresIn === 'object' && expiresIn?.date) {
          expiresAt = new Date(expiresIn.date).getTime();
        } else if (typeof expiresIn === 'number') {
          expiresAt = Date.now() + (expiresIn * 1000);
        } else {
          // Default to 90 days (matching backend config)
          expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000);
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
      forceLogout('Token refresh error');
      isRefreshing = false;
      return null;
    }
  })();

  return refreshPromise;
}

/**
 * Set up activity tracking to update last activity timestamp
 */
function setupActivityTracking(): void {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  // Throttle activity updates to avoid excessive localStorage writes
  let activityTimeout: NodeJS.Timeout | null = null;
  
  const updateActivity = () => {
    if (!activityTimeout) {
      updateLastActivity();
      activityTimeout = setTimeout(() => {
        activityTimeout = null;
      }, 1000); // Update at most once per second
    }
  };

  events.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });

  updateLastActivity();
  startSessionMonitoring(); // Start background monitoring
}

// Initialize activity tracking and session monitoring
if (typeof window !== 'undefined') {
  setupActivityTracking();
  
  // Also start monitoring when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      monitorSession();
    }
  });
}

// Simple in-memory cache for GET requests
const fetchCache: Record<string, { timestamp: number, data: any }> = {};
const CACHE_TTL = 60000; // 1 minute

// Generic retry with exponential backoff
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
        res.type === 'error' ||
        (res.status === 0 && !res.ok)
      ) {
        throw new Error('Retryable error');
      }
      return res;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, backoff * 2 ** attempt));
    }
    attempt++;
  }
  throw new Error('Retry attempts exceeded');
}

interface ApiFetchOptions {
  disableCache?: boolean;
  disableDeduplication?: boolean;
  disableRateLimit?: boolean;
  cancelPrevious?: boolean;
}

// Enhanced JSON API fetch
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  opts?: ApiFetchOptions
): Promise<T> {
  // ===== REMOVED: Don't check session here, let background monitor handle it =====
  // This prevents premature logouts when user is active but not making API calls

  // Rate limiting check (can be disabled per request)
  if (!opts?.disableRateLimit && !checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }

  const token = getAuthToken();
  const tokenType = 'Bearer';

  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };
  
  if (token) {
    (mergedHeaders as Record<string, string>)["Authorization"] = `${tokenType} ${token}`;
  }

  const isGet = (options.method || 'GET').toUpperCase() === 'GET';
  const requestKey = getRequestKey(endpoint, options);
  const cacheKey = `${endpoint}|${JSON.stringify(options.body || {})}|${JSON.stringify(mergedHeaders)}`;

  // Check cache for GET requests
  if (isGet && !opts?.disableCache && fetchCache[cacheKey]) {
    const { timestamp, data } = fetchCache[cacheKey];
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log(`Cache hit for: ${endpoint}`);
      return data as T;
    }
  }

  // Request deduplication
  if (!opts?.disableDeduplication) {
    return deduplicateRequest(requestKey, async () => {
      return executeRequest<T>(endpoint, options, mergedHeaders, opts, isGet, cacheKey);
    });
  }

  return executeRequest<T>(endpoint, options, mergedHeaders, opts, isGet, cacheKey);
}

// Helper function to execute the actual request
async function executeRequest<T>(
  endpoint: string,
  options: RequestInit,
  mergedHeaders: HeadersInit,
  opts: ApiFetchOptions | undefined,
  isGet: boolean,
  cacheKey: string
): Promise<T> {
  let controller: AbortController | undefined;
  if (opts?.cancelPrevious) {
    const requestKey = getRequestKey(endpoint, options);
    controller = getAbortController(requestKey);
  }

  let res = await fetchWithRetry(
    () => fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: mergedHeaders,
      ...options,
      signal: controller?.signal,
      credentials: "include",
    })
  );

  // Handle 401 and token refresh
  if (res.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/refresh-token')) {
    const newToken = await refreshAuthToken();

    if (newToken) {
      (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      res = await fetchWithRetry(
        () => fetch(`${getApiBaseUrl()}${endpoint}`, {
          headers: mergedHeaders,
          ...options,
          signal: controller?.signal,
          credentials: "include",
        })
      );
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw data || { message: "API request failed" };
  }
  
  updateLastActivity();
  
  // Store in cache
  if (isGet && !opts?.disableCache) {
    fetchCache[cacheKey] = { timestamp: Date.now(), data };
  }
  
  return data;
}

// Enhanced FormData fetch
export async function apiFetchFormData<T>(
  endpoint: string,
  options: RequestInit = {},
  opts?: ApiFetchOptions
): Promise<T> {
  // ===== REMOVED: Session check moved to background monitor =====

  // Rate limiting
  if (!opts?.disableRateLimit && !checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }

  const token = getAuthToken();
  const tokenType = 'Bearer';

  const method = options.method || 'POST';
  
  // For FormData, don't set Content-Type - browser will set it with boundary
  const mergedHeaders: HeadersInit = {
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  // Remove Content-Type if it exists for FormData requests
  if (options.body instanceof FormData && 'Content-Type' in mergedHeaders) {
    delete (mergedHeaders as Record<string, string>)['Content-Type'];
  }

  if (token) {
    (mergedHeaders as Record<string, string>)["Authorization"] = `${tokenType} ${token}`;
  }
  
  // Destructure to avoid overriding method and headers
  const { method: _, headers: __, ...restOptions } = options;
  
  let res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method,
    headers: mergedHeaders,
    ...restOptions,
    body: options.body,
    credentials: "include",
  });

  if (res.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/refresh-token')) {
    const newToken = await refreshAuthToken();

    if (newToken) {
      (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;

      res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method,
        headers: mergedHeaders,
        ...restOptions,
        body: options.body,
        credentials: "include",
      });
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw data || { message: "API request failed" };
  }
  
  updateLastActivity();
  
  return data;
}

export async function apiJoinChallenge(challengeId: string) {
  return apiFetch(`/challenges/${challengeId}/join`, { method: 'POST' });
}

// Utility to clear cache
export function clearApiCache(pattern?: string): void {
  if (pattern) {
    Object.keys(fetchCache).forEach(key => {
      if (key.includes(pattern)) {
        delete fetchCache[key];
      }
    });
  } else {
    Object.keys(fetchCache).forEach(key => delete fetchCache[key]);
  }
}

// Utility to cancel all pending requests
export function cancelAllRequests(): void {
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
  requestQueue.clear();
}

// Configure rate limiting
export function configureRateLimit(maxRequests: number, timeWindow: number): void {
  rateLimitConfig.maxRequests = maxRequests;
  rateLimitConfig.timeWindow = timeWindow;
}

export const sessionManager = {
  updateLastActivity,
  isSessionExpired,
  forceLogout,
  getRemainingSessionTime,
  startSessionMonitoring,
  stopSessionMonitoring,
  monitorSession,
};