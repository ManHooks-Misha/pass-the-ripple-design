// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/config/api';

interface UserProfile {
  nickname: string;
  avatar_id?: number | null;
  profile_image_path?: string | null;
  custom_avatar?: string | null;
  ripple_id?: string | null;
  email?: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    nickname: user?.nickname || 'User',
    avatar_id: user?.avatar_id || null,
    profile_image_path: user?.profile_image_path || null,
    custom_avatar: user?.custom_avatar || null,
    ripple_id: user?.ripple_id || null,
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch fresh profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/admin/profile') as any;
      if (response.success && response.data) {
        setProfile({
          nickname: response.data.nickname,
          avatar_id: response.data.avatar_id,
          profile_image_path: response.data.profile_image_url,
          custom_avatar: response.data.profile_image_url,
          ripple_id: response.data.ripple_id,
          email: response.data.email,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile when auth context changes
  useEffect(() => {
    if (user) {
      setProfile({
        nickname: user.nickname || 'User',
        avatar_id: user.avatar_id || null,
        profile_image_path: user.profile_image_path || null,
        custom_avatar: user.custom_avatar || null,
        ripple_id: user.ripple_id || null,
        email: user.email || '',
      });
    }
  }, [user]);

  return { ...profile, loading, refetch: fetchProfile };
}