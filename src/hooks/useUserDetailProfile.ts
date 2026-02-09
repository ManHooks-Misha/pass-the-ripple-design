import { useState, useEffect } from 'react';
import { apiFetch } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { User, UserActivity } from '@/types/user';

export const useUserDetailProfile = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<UserActivity>({
    rippleStories: 0,
    postsLiked: 0,
    comments: 0,
    badgesEarned: 0,
    challengesCompleted: 0,
    accountCreatedBy: 'self',
    rippleJourney: [],
    recentLikes: [],
    recentComments: [],
    recentStories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFetch<any>(`/users/${userId}`);
      setUser(response.data);
      try {
        const [likesRes, commentsRes, storiesRes, badgesRes, challengesRes] = await Promise.allSettled([
          apiFetch<any>(`/users/${userId}/likes`).catch(() => ({ data: { total_likes: 0, likes: { data: [] } } })),
          apiFetch<any>(`/users/${userId}/comments`).catch(() => ({ data: { total_comments: 0, comments: { data: [] } } })),
          apiFetch<any>(`/users/${userId}/ripple-stories`).catch(() => ({ data: { total_stories: 0, stories: { data: [] } } })),
          apiFetch<any>(`/users/${userId}/badges`).catch(() => ({ data: { total_badges: 0 } })),
          apiFetch<any>(`/users/${userId}/challenges`).catch(() => ({ data: { completed_challenges: 0 } })),
        ]);

        const userActivity = {
          rippleStories: storiesRes.status === 'fulfilled' ? (storiesRes.value.data?.total_stories || 0) : 0,
          postsLiked: likesRes.status === 'fulfilled' ? (likesRes.value.data?.total_likes || 0) : 0,
          comments: commentsRes.status === 'fulfilled' ? (commentsRes.value.data?.total_comments || 0) : 0,
          badgesEarned: badgesRes.status === 'fulfilled' ? (badgesRes.value.data?.total_badges || 0) : 0,
          challengesCompleted: challengesRes.status === 'fulfilled' ? (challengesRes.value.data?.completed_challenges || 0) : 0,
          accountCreatedBy: 'self',
          rippleJourney: [],
          recentLikes: likesRes.status === 'fulfilled' ? (likesRes.value.data?.likes?.data || []) : [],
          recentComments: commentsRes.status === 'fulfilled' ? (commentsRes.value.data?.comments?.data || []) : [],
          recentStories: storiesRes.status === 'fulfilled' ? (storiesRes.value.data?.stories?.data || []) : [],
        };
        setActivity(userActivity);
      } catch (activityError) {
        console.warn('Activity data not available, using defaults:', activityError);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return { user, activity, loading, error, refetch: fetchUserDetails };
};