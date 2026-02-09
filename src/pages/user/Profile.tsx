import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Seo from "@/components/Seo";
import { Heart, Sparkles, Trophy, Target, Calendar, MapPin, Edit, Share2, Award, TrendingUp, Star, Gift, HelpCircle, UserPlus, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import char3 from "@/assets/characters/char3.png";
import char5 from "@/assets/characters/char5.png";
import { apiFetch, UPLOAD_BASE_URL } from "@/config/api";
import { getAvatarImage } from "@/utils/avatars";
import { encryptRippleId } from "@/utils/encryption";
import { useAuth } from "@/context/AuthContext";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { settingsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  badge_category: string;
  max_tier: number;
  is_active: boolean;
  icon_path?: string | null;
  display_order?: number;
  created_at: string;
}

interface UserStats {
  points: {
    total: number;
    current: number;
    lifetime: number;
  };
  streaks: {
    current: number;
    longest: number;
    last_action_date: string;
  };
  ripples: {
    total: number;
    travel_count: number;
  };
  badges: {
    count: number;
    next_badge_points: number;
  };
}

interface RecentAction {
  id: number;
  title: string;
  description: string;
  photo_path: string | null;
  action_type: string;
  performed_at: string;
  performed_at_formatted: string;
  is_hero_wall_pinned: number;
  is_pinned: boolean;
}

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  full_name: string;
  date_of_birth: string;
  avatar_id: number | null;
  custom_avatar: string | null;
  profile_image_path: string | null;
  ripple_id: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  created_at: string;
  created_at_formatted: string;
}

interface ReferralInfo {
  referrer_name?: string | null;
  referrer_nickname?: string | null;
  referrer_ripple_id?: string | null;
  referred_at?: string;
  referred_at_formatted?: string;
  referral_distance_km?: number;
  referral_status?: string;
}

const Profile = () => {
  const [isOwnProfile] = useState(true);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const { user } = useAuth();

  const FALLBACK_ICON = "https://cdn-icons-png.flaticon.com/128/4168/4168977.png";

  const handleShare = async () => {
    if (!userProfile?.ripple_id) {
      toast({
        title: "Error",
        description: "Profile not ready yet",
        variant: "destructive"
      });
      return;
    }

    try {
      // Encrypt the ripple_id for the share link
      const encryptedRippleId = encryptRippleId(userProfile.ripple_id);
      const shareUrl = `${window.location.origin}/age-gate?ref=${encryptedRippleId}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Ripple Profile',
            text: 'Check out my kindness journey!',
            url: shareUrl,
          });
        } catch (err) {
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Profile link copied!",
            description: "Share your kindness journey with others"
          });
        }
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Profile link copied!",
          description: "Share your kindness journey with others"
        });
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      toast({
        title: "Error",
        description: "Failed to share profile",
        variant: "destructive"
      });
    }
  };

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, badgesRes] = await Promise.all([
        apiFetch<{ data: { user: UserProfile; stats: UserStats; recent_actions: RecentAction[]; referral_info: ReferralInfo } }>("/profile", { method: "GET" }),
        apiFetch<BadgeItem[]>("/badges", { method: "GET" }),
      ]);

      if (profileRes.data) {
        setUserProfile(profileRes.data.user);
        setStats(profileRes.data.stats);
        setRecentActions(profileRes.data.recent_actions || []);
        setReferralInfo(profileRes.data.referral_info || null);
      }

      setBadges(badgesRes || []);
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast({
        title: "Error",
        description: error?.message || "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // Profile tutorial hook - MUST be called before any early returns
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "profile_tutorial_completed",
    steps: settingsTutorialSteps, // Reuse settings tutorial steps
  });

  if (loading || !userProfile || !stats) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Calculate level based on points (example: 100 points per level)
  const currentLevel = Math.floor(stats.points.total / 100) + 1;
  const progressToNextLevel = (stats.points.total % 100);

  // Get avatar image
  const avatarImage = getAvatarImage(
    userProfile.avatar_id,
    userProfile.profile_image_path
  );

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'helped someone':
        return Heart;
      case 'showed care':
        return Heart;
      case 'shared something':
        return Gift;
      default:
        return Star;
    }
  };

  const achievements = [
    {
      title: `${stats.badges.count} Badges Earned`,
      description: "Keep collecting!",
      icon: Trophy,
      color: "text-primary"
    },
    {
      title: `${stats.streaks.current} Day Streak`,
      description: stats.streaks.current > 0 ? "Keep it going!" : "Start your streak!",
      icon: Target,
      color: "text-secondary"
    },
    {
      title: `${stats.ripples.total} Total Ripples`,
      description: "Making waves!",
      icon: Heart,
      color: "text-accent"
    }
  ];

  const urlPrefix = user.role == "user" || user.role == "child" ? '' : '/' + user.role;

  return (
    <div className="w-full px-3 sm:px-4 py-4 sm:py-6 max-w-7xl mx-auto relative">
      <Seo
        title="Profile | Pass The Ripple"
        description="View your kindness journey and achievements"
      />

      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="profile_tutorial_completed"
      />

      <main className="w-full relative">
        {/* Floating decorations */}
        <Sparkles className="hidden sm:block absolute top-10 left-10 text-primary/20 w-8 h-8 animate-pulse" />
        <Sparkles className="hidden sm:block absolute top-32 right-20 text-accent/20 w-6 h-6 animate-pulse delay-700" />

        {/* Help Button */}
        <div className="absolute top-0 right-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
            title="Take a tour of this page"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help</span>
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-4 sm:mb-8 shadow-elevated border-primary/10 bg-card/95 backdrop-blur relative overflow-hidden">
          <img
            src={char5}
            alt="Decoration"
            className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 w-16 h-16 sm:w-32 sm:h-32 opacity-10"
          />
          <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4 lg:min-w-0 lg:flex-shrink-0 w-full lg:w-auto">
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-2 sm:border-4 border-primary/30 shadow-glow">
                    <AvatarImage src={avatarImage} alt={userProfile.full_name} />
                    <AvatarFallback className="text-lg sm:text-xl lg:text-2xl">{userProfile.nickname.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base">
                    {currentLevel}
                  </div>
                </div>

                <div className="text-center lg:text-left w-full">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black leading-tight break-words">{userProfile.full_name}</h1>
                  <p className="text-sm sm:text-base text-gray-800 font-semibold mt-1">@{userProfile.nickname}</p>
                  <Badge className="mt-2 sm:mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg font-semibold text-xs sm:text-sm">
                    Level {currentLevel}
                  </Badge>
                </div>
              </div>

              {/* Stats Grid and Actions */}
              <div className="flex-1 flex flex-col gap-3 sm:gap-4 w-full">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Ripples Card */}
                  <div className="group relative text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 bg-blue-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:animate-pulse" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 mb-0.5 sm:mb-1 group-hover:text-black transition-colors duration-300">{stats.ripples.total}</div>
                      <div className="text-[10px] sm:text-xs font-bold text-blue-900 mb-0.5">Ripples</div>
                      <div className="text-[10px] sm:text-xs text-blue-800 font-medium leading-tight">Kindness waves</div>
                    </div>
                  </div>

                  {/* Points Card */}
                  <div className="group relative text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 bg-emerald-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:animate-pulse" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 mb-0.5 sm:mb-1 group-hover:text-black transition-colors duration-300">{stats.points.total}</div>
                      <div className="text-[10px] sm:text-xs font-bold text-emerald-900 mb-0.5">Points</div>
                      <div className="text-[10px] sm:text-xs text-emerald-800 font-medium leading-tight">Total earned</div>
                    </div>
                  </div>

                  {/* Streak Card */}
                  <div className="group relative text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 bg-orange-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-orange-500/25 group-hover:scale-110 transition-all duration-300">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:animate-pulse" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900 mb-0.5 sm:mb-1 group-hover:text-black transition-colors duration-300">{stats.streaks.current}</div>
                      <div className="text-[10px] sm:text-xs font-bold text-orange-900 mb-0.5">Day Streak</div>
                      <div className="text-[10px] sm:text-xs text-orange-800 font-medium leading-tight">Keep going!</div>
                    </div>
                  </div>

                  {/* Badges Card */}
                  <div className="group relative text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 bg-purple-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:animate-pulse" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 mb-0.5 sm:mb-1 group-hover:text-black transition-colors duration-300">{stats.badges.count}</div>
                      <div className="text-[10px] sm:text-xs font-bold text-purple-900 mb-0.5">Badges</div>
                      <div className="text-[10px] sm:text-xs text-purple-800 font-medium leading-tight">Achievements</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isOwnProfile && (
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <Link to={`${urlPrefix}/settings`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto border-primary/30 text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3">
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`${urlPrefix}/change-password`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto border-primary/30 text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3">
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Change Password</span>
                        <span className="sm:hidden">Password</span>
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleShare} className="w-full sm:w-auto border-primary/30 text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3">
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Referred By Section */}
            {referralInfo?.referrer_nickname && referralInfo?.referrer_ripple_id && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Referred By</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base text-gray-700 font-medium">
                    {referralInfo.referrer_name || referralInfo.referrer_nickname}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono bg-white px-2 sm:px-3 py-1 rounded-md border border-indigo-200 text-indigo-700 break-all">
                      {referralInfo.referrer_ripple_id}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          if (referralInfo.referrer_ripple_id) {
                            await navigator.clipboard.writeText(referralInfo.referrer_ripple_id);
                            toast({
                              title: "Copied!",
                              description: "Ripple ID copied to clipboard",
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to copy Ripple ID",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="h-7 sm:h-8 px-2 text-xs sm:text-sm border-indigo-200 hover:bg-indigo-50"
                      title="Copy Ripple ID"
                    >
                      <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Location and Join Date */}
            <div className="mt-4 sm:mt-6 flex flex-col md:flex-row gap-3 sm:gap-4 items-start md:items-center">
              <p className="text-sm sm:text-base text-gray-700 italic flex-1 font-medium leading-relaxed break-words">
                Spreading kindness one ripple at a time! 🌊
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 w-full md:w-auto">
                <span className="flex items-center gap-1 font-medium leading-tight">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate break-words">{userProfile.location.city}, {userProfile.location.state}</span>
                </span>
                <span className="flex items-center gap-1 font-medium leading-tight">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span>Joined {userProfile.created_at_formatted}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>



      </main>
    </div>
  );
};

export default Profile;