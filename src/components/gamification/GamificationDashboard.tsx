import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Zap, Users, Heart, MessageCircle, Share2, Lock, Target, TrendingUp, Sparkles } from 'lucide-react';
import { apiFetch } from '@/config/api';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/imageUrl';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  user: {
    id: number;
    nickname: string;
    full_name: string;
    profile_image_path: string;
    role: string;
  };
  points: {
    total_points: number;
    current_points: number;
    lifetime_points: number;
  };
  earning_opportunities: Array<{
    activity: string;
    title: string;
    description: string;
    points: number;
    action: string;
    action_url?: string;
    icon: string;
    is_available: boolean;
    stories_posted?: number;
  }>;
  recent_activities: Array<{
    id: number;
    activity_name: string;
    points: number;
    description: string;
    earned_at: string;
    time_ago: string;
  }>;
  badges: {
    earned: Array<{
      id: number;
      name: string;
      icon: string;
      points: number;
      icon_path: string;
      earned_at: string;
    }>;
    next_to_unlock: Array<{
      id: number;
      name: string;
      description: string;
      icon_path: string;
      icon: string;
      required_points: number;
      points_needed: number;
      progress_percentage: number;
    }>;
    total_earned: number;
  };
  activity_breakdown: Array<{
    activity_name: string;
    display_name: string;
    total_points: number;
    count: number;
  }>;
  milestone_progress: {
    current_milestone: number | null;
    next_milestone: number;
    current_points: number;
    points_to_next: number;
    progress_percentage: number;
  };
  stats: {
    stories_posted: number;
    pending_stories: number;
    likes_received: number;
    comments_received: number;
    referrals_made: number;
  };
}

export const GamificationDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: DashboardData }>(
        '/user/gamification/dashboard'
      );

      if (response.success) {
        setData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast.error(error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconString: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '🎯': <Target className="w-6 h-6 text-primary" />,
      '📝': <Zap className="w-6 h-6 text-primary" />,
      '❤️': <Heart className="w-6 h-6 text-pink-500" />,
      '💬': <MessageCircle className="w-6 h-6 text-blue-500" />,
      '📤': <Share2 className="w-6 h-6 text-green-500" />,
      '👥': <Users className="w-6 h-6 text-purple-500" />,
      '🔗': <Share2 className="w-6 h-6 text-cyan-500" />,
    };
    return iconMap[iconString] || <Zap className="w-6 h-6 text-primary" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getRoleBasedActionUrl = (actionUrl) => {
    if (!actionUrl) return '/dashboard';
    
    const role = user?.role || 'user';
    const url = actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`;
    
    // If URL already has role prefix, use as is
    if (url.startsWith('/admin/') || url.startsWith('/teacher/')) {
      return url;
    }
    
    // Add role prefix if needed
    switch (role) {
      case 'admin':
        return `/admin${url}`;
      case 'teacher':
        return `/teacher${url}`;
      default:
        return url;
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="shadow-elevated bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Your Points
          </CardTitle>
          <CardDescription className="text-white/80 text-base">
            Keep earning to unlock amazing badges!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold mb-4">{data.points.lifetime_points}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {data.milestone_progress.next_milestone}</span>
              <span>{data.milestone_progress.points_to_next} points to go</span>
            </div>
            <Progress
              value={data.milestone_progress.progress_percentage}
              className="h-3 bg-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Earning Opportunities */}
      <div>
        <h2 className="text-2xl font-bold text-gradient-primary mb-4">Ways to Earn Points</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.earning_opportunities.map((opp) => (
            <Card
              key={opp.activity}
              className={`shadow-elevated hover:shadow-glow transition-shadow ${
                !opp.is_available ? 'opacity-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getIconComponent(opp.icon)}
                    <div>
                      <CardTitle className="text-lg">{opp.title}</CardTitle>
                      <CardDescription>{opp.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold bg-yellow-100 text-yellow-800">
                    +{opp.points}
                  </Badge>
                </div>
              </CardHeader>
              {opp.action_url && opp.is_available && (
                <CardContent>
                  <Button
                    onClick={() => {
                      // Link referral-related actions to ripple card page for teachers
                      if (user?.role === 'teacher' && (opp.title?.toLowerCase().includes('invite') || opp.title?.toLowerCase().includes('referral') || opp.title?.toLowerCase().includes('share'))) {
                        navigate('/teacher/ripple-card');
                      } else {
                        navigate(getRoleBasedActionUrl(opp.action_url));
                      }
                    }}
                    className="w-full"
                    variant="hero"
                  >
                    {opp.action === 'post_story' ? '📝 Post Now' : '✨ Get Started'}
                  </Button>
                </CardContent>
              )}
              {opp.stories_posted !== undefined && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {opp.stories_posted} stories posted
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>


          {/* Next Badges */}
      {data.badges.earned.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary mb-4">Badges Unlocked</h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.badges.earned.map((badge) => (
              
              <Card key={badge.id} className="shadow-elevated hover:shadow-glow transition-shadow">
                <CardHeader className="relative p-0">
                    <div className="aspect-[16/14] overflow-hidden bg-muted/30">
                      <img
                        src={getImageUrl(badge.icon_path)}
                        alt={badge.icon_path}
                        className="w-full h-full object-cover"
                      />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                        <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          {badge.name}
                        </CardTitle>
                  <Progress value={100} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {badge.points} points needed
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Next Badges */}
      {data.badges.next_to_unlock.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary mb-4">Next Badges to Unlock</h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.badges.next_to_unlock.map((badge) => (
              <Card key={badge.id} className="shadow-elevated hover:shadow-glow transition-shadow">
                <CardHeader className="relative p-0">
                    <div className="aspect-[16/14] overflow-hidden bg-muted/30">
                    {badge.icon_path ? (
                      <img
                        src={getImageUrl(badge.icon_path)}
                        alt={badge.icon_path}
                        className="w-full h-full object-cover opacity-50 grayscale"
                      />
                      ) : (
                        <Trophy className="w-24 h-24 text-gray-400" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-12 h-12 text-gray-600" />
                      </div>
                    </div>
                
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    {badge.name}
                  </CardTitle>
                  <Progress value={badge.progress_percentage} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {badge.points_needed} points needed
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stats */}
        <Card className="shadow-elevated bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Stories Posted</span>
              <span className="font-bold text-cyan-700 text-lg">{data.stats.stories_posted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Stories</span>
              <span className="font-bold text-orange-600 text-lg">{data.stats.pending_stories}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">❤️ Likes Received</span>
              <span className="font-bold text-pink-600 text-lg">{data.stats.likes_received}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">💬 Comments Received</span>
              <span className="font-bold text-blue-600 text-lg">{data.stats.comments_received}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">👥 Referrals Made</span>
              <span className="font-bold text-purple-600 text-lg">{data.stats.referrals_made}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-elevated bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent_activities.length > 0 ? (
              <div className="space-y-3">
                {data.recent_activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.time_ago}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                      +{activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent activity yet. Start earning points!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
