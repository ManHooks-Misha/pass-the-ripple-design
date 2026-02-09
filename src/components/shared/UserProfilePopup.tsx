import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Waves, Award, Flame, Activity, Eye, FileText, ExternalLink } from "lucide-react";
import { apiFetch } from "@/config/api";
import { getAvatarImage } from "@/utils/avatars";
import { getUserDisplayName } from "@/utils/userDisplay";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUrl";

interface UserProfilePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  user?: {
    id: number;
    nickname: string;
    full_name?: string | null;
    avatar_id?: number | null;
    profile_image_path?: string | null;
    profile_image_url?: string | null;
    is_profile_public?: boolean;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      formatted_address?: string;
    } | null;
    class?: string | {
      id: number;
      name: string;
      grade?: string;
      section?: string;
    } | null;
    day_streak?: number;
    total_ripples?: number;
    badges?: Array<{
      id: number;
      name: string;
      description: string;
      icon: string | null;
      earned_at: string;
    }>;
  };
}

interface UserStats {
  ripples: {
    total: number;
    approved_actions?: number;
  };
  badges: {
    count: number;
    earned_count?: number;
  };
  streaks: {
    current: number;
    longest?: number;
  };
  points?: {
    current: number;
    total?: number;
  };
}

interface RecentActivity {
  id: number;
  title: string;
  description?: string;
  photo_path?: string | null;
  created_at: string;
  category?: {
    name: string;
    color?: string;
  };
}

export const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  open,
  onOpenChange,
  userId,
  user: initialUser,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(initialUser || null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");

  useEffect(() => {
    if (open && userId) {
      fetchUserProfile();
    }
  }, [open, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // If initial user data has the new structure with stats, use it directly
      if (initialUser && (initialUser.total_ripples !== undefined || initialUser.day_streak !== undefined || initialUser.badges)) {
        setUser(initialUser);
        setStats({
          ripples: {
            total: initialUser.total_ripples || 0,
            approved_actions: initialUser.total_ripples || 0,
          },
          badges: {
            count: initialUser.badges?.length || 0,
            earned_count: initialUser.badges?.length || 0,
          },
          streaks: {
            current: initialUser.day_streak || 0,
            longest: initialUser.day_streak || 0,
          },
          points: {
            current: 0,
            total: 0,
          },
        });
        setLoading(false);
        return;
      }

      // Otherwise, fetch from API
      const [userRes, storiesRes, badgesRes] = await Promise.allSettled([
        apiFetch<any>(`/users/${userId}`).catch(() => ({ data: null })),
        apiFetch<any>(`/users/${userId}/ripple-stories`).catch(() => ({ data: { total_stories: 0, stories: { data: [] } } })),
        apiFetch<any>(`/users/${userId}/badges`).catch(() => ({ data: { total_badges: 0 } })),
      ]);

      // Set user data
      if (userRes.status === "fulfilled" && userRes.value?.data) {
        const userData = userRes.value.data;
        setUser(userData);
        
        // Use data from API response if available
        const storiesTotal = storiesRes.status === "fulfilled" ? (storiesRes.value?.data?.total_stories || 0) : 0;
        const badgesTotal = badgesRes.status === "fulfilled" ? (badgesRes.value?.data?.total_badges || 0) : 0;
        
        setStats({
          ripples: {
            total: userData.total_ripples || storiesTotal,
            approved_actions: userData.total_ripples || storiesTotal,
          },
          badges: {
            count: userData.badges?.length || badgesTotal,
            earned_count: userData.badges?.length || badgesTotal,
          },
          streaks: {
            current: userData.day_streak || 0,
            longest: userData.day_streak || 0,
          },
          points: {
            current: 0,
            total: 0,
          },
        });
      } else if (initialUser) {
        setUser(initialUser);
        setStats({
          ripples: { total: initialUser.total_ripples || 0 },
          badges: { count: initialUser.badges?.length || 0 },
          streaks: { current: initialUser.day_streak || 0 },
          points: { current: 0 },
        });
      }

      // Set recent activity from stories
      const storiesData = storiesRes.status === "fulfilled" ? storiesRes.value.data : null;
      if (storiesData?.stories?.data && Array.isArray(storiesData.stories.data)) {
        setRecentActivity(storiesData.stories.data.slice(0, 5).map((story: any) => ({
          id: story.id,
          title: story.title || story.ripple_title || "Untitled",
          description: story.description || story.ripple_description,
          photo_path: story.photo_path || story.imageUrl,
          created_at: story.created_at || story.submittedAt || story.performed_at,
          category: story.category,
        })));
      } else if (Array.isArray(storiesData?.data)) {
        setRecentActivity(storiesData.data.slice(0, 5).map((story: any) => ({
          id: story.id,
          title: story.title || story.ripple_title || "Untitled",
          description: story.description || story.ripple_description,
          photo_path: story.photo_path || story.imageUrl,
          created_at: story.created_at || story.submittedAt || story.performed_at,
          category: story.category,
        })));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Set default stats on error
      setStats({
        ripples: { total: 0 },
        badges: { count: 0 },
        streaks: { current: 0 },
        points: { current: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHeroWall = () => {
    if (user?.id) {
      navigate(`/hero-wall?user=${user.id}`);
      onOpenChange(false);
    }
  };

  const handleViewDetails = () => {
    if (user?.id) {
      navigate(`/user/${user.id}`);
      onOpenChange(false);
    }
  };

  const avatarImage = user
    ? getAvatarImage(user.avatar_id, user.profile_image_path || user.profile_image_url)
    : null;
  const displayName = user ? getUserDisplayName(user, "Anonymous") : "User";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View profile information and activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <Avatar className="w-16 h-16">
                {avatarImage && <AvatarImage src={avatarImage} alt={displayName} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
                {user?.full_name && user.full_name !== user.nickname && (
                  <p className="text-sm text-gray-600">{user.full_name}</p>
                )}
                {user?.location && (user.location.city || user.location.formatted_address) && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {user.location.city || user.location.formatted_address}
                    {user.location.state && `, ${user.location.state}`}
                    {user.location.country && `, ${user.location.country}`}
                  </p>
                )}
                {user?.class && (
                  <p className="text-xs text-gray-500 mt-1">
                    🎓 {typeof user.class === 'string' ? user.class : user.class?.name || 'Class'}
                    {typeof user.class === 'object' && user.class?.grade && ` - Grade ${user.class.grade}`}
                    {typeof user.class === 'object' && user.class?.section && ` - Section ${user.class.section}`}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Waves className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.ripples.total || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Total Ripples</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.badges.count || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Badges</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.streaks.current || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Day Streak</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

