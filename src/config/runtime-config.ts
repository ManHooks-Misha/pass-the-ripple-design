/**
 * Runtime Configuration Manager
 *
 * This module handles loading configuration from the backend at runtime,
 * allowing environment variables to be changed without rebuilding the frontend.
 *
 * Usage:
 *   import { getConfig, loadConfig } from '@/config/runtime-config';
 *
 *   // Load config first (usually in main.tsx)
 *   await loadConfig();
 *
 *   // Then use config anywhere
 *   const config = getConfig();
 *   console.log(config.apiBaseUrl);
 */

export interface RuntimeConfig {
  apiBaseUrl: string;
  uploadBaseUrl: string;
  googleMapsKey: string;
  appName?: string;
  appEnv?: string;
}

let config: RuntimeConfig | null = null;
let configPromise: Promise<RuntimeConfig> | null = null;

/**
 * Fallback configuration using relative URLs
 * Used if the runtime config fails to load
 * Since frontend and backend are on the same domain, we use relative URLs
 */
function getFallbackConfig(): RuntimeConfig {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    uploadBaseUrl: import.meta.env.VITE_UPLOAD_BASE_URL || '/storage',
    googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    appName: 'Ripple',
    appEnv: import.meta.env.MODE || 'development',
  };
}

/**
 * Determines the config endpoint URL
 * Uses relative URL since frontend and backend are on the same domain
 */
function getConfigEndpoint(): string {
  // Use relative URL - works across all environments
  return '/api/config';
}

/**
 * Load configuration from the backend
 * This should be called once when the application starts
 *
 * @returns Promise that resolves to the loaded configuration
 */
export async function loadConfig(): Promise<RuntimeConfig> {
  // Return existing promise if already loading
  if (configPromise) {
    return configPromise;
  }

  // Return cached config if already loaded
  if (config) {
    return Promise.resolve(config);
  }

  // Create new loading promise
  configPromise = fetch(getConfigEndpoint(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // Don't include credentials for the config endpoint
    // This is a public endpoint that doesn't require authentication
  })
    .then(async (response) => {
      if (!response.ok) {
        console.warn('Failed to load runtime config from backend, using fallback:', response.statusText);
        return getFallbackConfig();
      }

      const data = await response.json();

      // Validate the response has required fields
      if (!data.apiBaseUrl || !data.uploadBaseUrl) {
        console.warn('Invalid runtime config response, using fallback');
        return getFallbackConfig();
      }

      config = data;
      console.log('Runtime configuration loaded successfully');
      return config;
    })
    .catch((error) => {
      console.error('Error loading runtime config, using fallback:', error);
      return getFallbackConfig();
    })
    .finally(() => {
      // Clear the promise so subsequent calls can be made if needed
      configPromise = null;
    });

  return configPromise;
}

/**
 * Get the current configuration
 *
 * @returns The current runtime configuration (uses fallback if not loaded)
 */
export function getConfig(): RuntimeConfig {
  if (!config) {
    // Silently use fallback - this is expected during initial app load
    config = getFallbackConfig();
  }
  return config;
}

/**
 * Check if configuration has been loaded
 *
 * @returns true if config is loaded, false otherwise
 */
export function isConfigLoaded(): boolean {
  return config !== null;
}

/**
 * Force reload the configuration from the backend
 * Useful if you need to refresh the config after it's been changed
 *
 * @returns Promise that resolves to the reloaded configuration
 */
export async function reloadConfig(): Promise<RuntimeConfig> {
  config = null;
  configPromise = null;
  return loadConfig();
}

/**
 * Set configuration manually (useful for testing)
 *
 * @param newConfig The configuration to set
 */
export function setConfig(newConfig: RuntimeConfig): void {
  config = newConfig;
}
