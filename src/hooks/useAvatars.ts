// src/hooks/useAvatars.ts
import { useState, useEffect } from 'react';
import { apiFetch } from '@/config/api';
import { initializeAvatarCache } from '@/utils/avatarCache';

export interface Avatar {
  id: number;
  name: string;
  emoji: string;
  image: string;
  display_order?: number;
}

interface UseAvatarsReturn {
  avatars: Avatar[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all active avatars from the backend API
 * Replaces the static characterAvatars configuration
 * Also populates the global avatar cache for use by utility functions
 */
export function useAvatars(): UseAvatarsReturn {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: Avatar[];
        message?: string;
      }>('/avatars');

      if (response.success && response.data) {
        setAvatars(response.data);
        // Also populate the global cache for utility functions
        await initializeAvatarCache();
      } else {
        throw new Error(response.message || 'Failed to fetch avatars');
      }
    } catch (err: any) {
      console.error('Error fetching avatars:', err);
      setError(err?.message || 'Failed to load avatars');
      // Set empty array on error so components don't break
      setAvatars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  return {
    avatars,
    loading,
    error,
    refetch: fetchAvatars,
  };
}

/**
 * Hook to fetch a single avatar by ID
 */
export function useAvatar(id: number | null | undefined) {
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAvatar(null);
      setLoading(false);
      return;
    }

    const fetchAvatar = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFetch<{
          success: boolean;
          data: Avatar;
          message?: string;
        }>(`/avatars/${id}`);

        if (response.success && response.data) {
          setAvatar(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch avatar');
        }
      } catch (err: any) {
        console.error('Error fetching avatar:', err);
        setError(err?.message || 'Failed to load avatar');
        setAvatar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [id]);

  return {
    avatar,
    loading,
    error,
  };
}

/**
 * Get avatar by ID from a list of avatars (helper function)
 */
export function getAvatarById(avatars: Avatar[], id: number): Avatar | undefined {
  return avatars.find(avatar => avatar.id === id);
}
