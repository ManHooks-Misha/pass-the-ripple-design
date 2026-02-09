/**
 * Avatar Cache Utility
 * 
 * Provides a global cache for avatar data fetched from the API.
 * This allows utility functions to access avatar images dynamically
 * without needing to be React components or hooks.
 */

import { Avatar } from '@/hooks/useAvatars';
import { apiFetch } from '@/config/api';

// Global cache for avatars
const avatarCache: Map<number, Avatar> = new Map();
let avatarCachePromise: Promise<Avatar[]> | null = null;
let isCacheInitialized = false;

/**
 * Initialize the avatar cache by fetching all avatars from the API
 */
export async function initializeAvatarCache(): Promise<void> {
  if (isCacheInitialized && avatarCache.size > 0) {
    return;
  }

  // If a fetch is already in progress, wait for it
  if (avatarCachePromise) {
    await avatarCachePromise;
    return;
  }

  avatarCachePromise = (async () => {
    try {
      const response = await apiFetch<{
        success: boolean;
        data: Avatar[];
        message?: string;
      }>('/avatars');

      if (response.success && response.data) {
        avatarCache.clear();
        response.data.forEach((avatar) => {
          avatarCache.set(avatar.id, avatar);
        });
        isCacheInitialized = true;
      }
    } catch (err) {
      console.error('Error initializing avatar cache:', err);
      // Don't throw - allow fallback to static avatars
    } finally {
      avatarCachePromise = null;
    }
  })();

  await avatarCachePromise;
}

/**
 * Get avatar by ID from cache
 * Returns null if not found
 */
export function getAvatarFromCache(avatarId: number): Avatar | null {
  return avatarCache.get(avatarId) || null;
}

/**
 * Get avatar image URL from cache
 * Returns null if not found
 */
export function getAvatarImageFromCache(avatarId: number): string | null {
  const avatar = avatarCache.get(avatarId);
  return avatar?.image || null;
}

/**
 * Pre-fetch a specific avatar by ID
 */
export async function fetchAvatarById(avatarId: number): Promise<Avatar | null> {
  // Check cache first
  const cached = avatarCache.get(avatarId);
  if (cached) {
    return cached;
  }

  try {
    const response = await apiFetch<{
      success: boolean;
      data: Avatar;
      message?: string;
    }>(`/avatars/${avatarId}`);

    if (response.success && response.data) {
      avatarCache.set(avatarId, response.data);
      return response.data;
    }
  } catch (err) {
    console.error(`Error fetching avatar ${avatarId}:`, err);
  }

  return null;
}

/**
 * Clear the avatar cache (useful for testing or refresh)
 */
export function clearAvatarCache(): void {
  avatarCache.clear();
  isCacheInitialized = false;
  avatarCachePromise = null;
}

/**
 * Check if cache is initialized
 */
export function isAvatarCacheInitialized(): boolean {
  return isCacheInitialized && avatarCache.size > 0;
}






