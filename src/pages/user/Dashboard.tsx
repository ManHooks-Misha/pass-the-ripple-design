import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { Trophy, Heart, TrendingUp, Star, Sparkles, Gift, Target, HelpCircle, PlayCircle, Circle, BookOpen } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { getUserDisplay } from "@/utils/avatars";
import { GamificationDashboard } from "@/components/gamification/GamificationDashboard";
import ChallengesDashboard from "@/components/gamification/ChallengesDashboard";
import DailyActivityChecklist from "@/components/gamification/DailyActivityChecklist";
import ActivityHeatmap from "@/components/gamification/ActivityHeatmap";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { useDashboardTutorial, getDashboardTutorialSteps } from "@/hooks/useDashboardTutorial";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import DashboardTutorial from "@/components/DashboardTutorial";
import char3 from "@/assets/characters/char3.png";
import char4 from "@/assets/characters/char4.png";
import { Link } from "react-router-dom";

const badges = [
  { name: 'First Ripple', desc: 'Started your journey', icon: '💧', earned: true, color: 'bg-blue-100' },
  { name: 'Storyteller', desc: 'Shared your story', icon: '📖', earned: true, color: 'bg-purple-100' },
  { name: 'Helper', desc: 'Helped 3 friends', icon: '🤝', earned: true, color: 'bg-green-100' },
  { name: 'Explorer', desc: 'Ripple traveled far', icon: '🌍', earned: false, color: 'bg-gray-100' },
];

const recentActivity = [
  { id: 1, action: "Helped a neighbor carry groceries", date: "2 hours ago", ripples: 3, icon: Heart },
  { id: 2, action: "Shared lunch with a new friend", date: "Yesterday", ripples: 5, icon: Gift },
  { id: 3, action: "Made thank-you cards for teachers", date: "2 days ago", ripples: 8, icon: Star },
];

const Dashboard = () => {
  const { user } = useAuth();
  const userProfile = useUserProfile();
  const { nickname } = getUserDisplay(userProfile);
  const [stats, setStats] = useState<{ badgesEarned?: number; ripples?: number; streak?: number; miles?: number; points?: number; cities?: number } | null>(null);
  const [earnedBadgesFromApi, setEarnedBadgesFromApi] = useState<Array<{ name: string; desc: string; icon: string; color: string }>>([]);
  const [recentFromApi, setRecentFromApi] = useState<typeof recentActivity>([]);
  const [nextBadge, setNextBadge] = useState<any>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const token = getAuthToken();
      const tokenType = localStorage.getItem("tokenType") || "Bearer";
      const res = await apiFetch<any>("/user/dashboard", {
        method: "GET",
        headers: token ? { Authorization: `${tokenType} ${token}` } : {},
      });
      const d = res?.data || res || {};
      setStats({
        badgesEarned: Number(d?.badges?.earned_count ?? 0),
        ripples: Number(d?.ripples?.approved_actions ?? 0),
        streak: Number(d?.streak?.current ?? 0),
        miles: Number(d?.ripples?.travel?.max_distance ?? 0),
        points: Number(d?.points?.current ?? 0),
        cities: Number(d?.ripples?.travel?.cities_reached ?? 0),
      });

      const apiBadges = Array.isArray(d?.badges?.all_badges) ? d.badges.all_badges : [];
      if (apiBadges.length) {
        setEarnedBadgesFromApi(
          apiBadges.filter((b: any) => b.earned).map((b: any) => ({
            name: b?.name ?? "Badge",
            desc: b?.description ?? "",
            icon: b?.icon ?? "🏅",
            color: "bg-gray-100",
          }))
        );
        setAllBadges(apiBadges);
      }

      if (d?.badges?.next_badge) {
        setNextBadge(d.badges.next_badge);
      }

      const apiRecent = Array.isArray(d.recent_activities) ? d.recent_activities : [];
      if (apiRecent.length) {
        const mapIcon = (key: string) => {
          switch ((key || "").toLowerCase()) {
            case "heart": return Heart;
            case "gift": return Gift;
            case "star": return Star;
            default: return Heart;
          }
        };
        setRecentFromApi(
          apiRecent.map((r: any, idx: number) => ({
            id: r.id ?? idx,
            action: r.action ?? r.title ?? "",
            date: r.date ?? r.created_at ?? "",
            ripples: Number(r.ripples ?? r.points ?? 0),
            icon: mapIcon(r.icon ?? ""),
          }))
        );
      }
    } catch (e) {
      // Keep graceful fallbacks
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const earnedBadges = useMemo(() =>
    earnedBadgesFromApi.length
      ? earnedBadgesFromApi
      : badges.filter(badge => badge.earned),
    [earnedBadgesFromApi]
  );

  const displayedActivities = useMemo(() =>
    recentFromApi.length ? recentFromApi : recentActivity,
    [recentFromApi]
  );

  // Dashboard tutorial hook
  const { isActive, isMobile, startTutorial, completeTutorial, skipTutorial } = useDashboardTutorial();
  const tutorialSteps = getDashboardTutorialSteps(isMobile);

  // Modal state management - only one can be open at a time
  const [showOnboardingTutorial, setShowOnboardingTutorial] = useState(false);
  const [showDailyTasks, setShowDailyTasks] = useState(false);

  // Handle opening onboarding tutorial - close all other modals
  const handleOpenTutorial = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDailyTasks(false);
    setShowOnboardingTutorial(true);
  };

  // Handle opening help tutorial - close all other modals
  const handleStartTutorial = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDailyTasks(false);
    setShowOnboardingTutorial(false);
    startTutorial();
  };

  // Handle daily tasks toggle - close other modals
  const handleDailyTasksToggle = (open: boolean) => {
    if (open) {
      setShowOnboardingTutorial(false);
    }
    setShowDailyTasks(open);
  };
  
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Seo
        title="My Dashboard — Pass The Ripple"
        description="Track your Ripple Cards, earn badges, and see your kindness journey."
        canonical={`${window.location.origin}/dashboard`}
      />
      
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="dashboard_tutorial_completed"
      />

      {/* Dashboard Tutorial */}
      <DashboardTutorial
        open={showOnboardingTutorial}
        onOpenChange={setShowOnboardingTutorial}
      />
      
      <main className="container py-4 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6 relative">
        {/* Floating decorations */}
        <Sparkles className="hidden sm:block absolute top-10 left-4 sm:left-10 text-primary/20 w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
        <Sparkles className="hidden sm:block absolute top-32 right-4 sm:right-20 text-accent/20 w-4 h-4 sm:w-6 sm:h-6 animate-pulse delay-700" />
        
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary mb-2">
                Welcome, {userProfile.nickname ?? "Friend"}!
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground">
                Your kindness is making the world brighter! ✨
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* How to Start Button */}
              <Button
                onClick={handleOpenTutorial}
                variant="default"
                size="sm"
                className="rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-red-700 text-white font-semibold shadow-md flex items-center gap-2 flex-shrink-0 group relative overflow-hidden"
                title="Learn how to get started"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
                <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
                <span className="text-base sm:text-lg font-bold relative z-10">How to Start</span>
              </Button>
              
              {/* Help Button - separated to prevent conflicts */}
              <Button
                onClick={handleStartTutorial}
                variant="outline"
                size="sm"
                className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2 flex-shrink-0"
                title="Take a tour of this page"
                type="button"
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Help</span>
              </Button>
              
              {/* Daily Activity Checklist - rendered last to prevent z-index issues */}
              <div className="relative z-50">
                <DailyActivityChecklist 
                  isOpen={showDailyTasks} 
                  onOpenChange={handleDailyTasksToggle} 
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Link to="/post-story" data-tutorial-target="button-post-story">
              <Button className="w-full h-auto py-5 flex flex-col items-center gap-3 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl">
                <Heart className="w-7 h-7" />
                <span className="text-sm font-black">Post Story</span>
              </Button>
            </Link>

            <Link to="/my-journey-map" data-tutorial-target="button-view-journey">
              <Button className="w-full h-auto py-5 flex flex-col items-center gap-3 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl">
                <Circle className="w-7 h-7" />
                <span className="text-sm font-black">My Journey</span>
              </Button>
            </Link>

            <Link to="/my-hero-wall" data-tutorial-target="button-read-stories">
              <Button className="w-full h-auto py-5 flex flex-col items-center gap-3 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl">
                <BookOpen className="w-7 h-7" />
                <span className="text-sm font-black">Read Stories</span>
              </Button>
            </Link>

            <Link to="/my-leaderboard" data-tutorial-target="button-leaderboard">
              <Button className="w-full h-auto py-5 flex flex-col items-center gap-3 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl">
                <Trophy className="w-7 h-7" />
                <span className="text-sm font-black">Leaderboard</span>
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6" data-tutorial-target="stats-section">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-primary" />
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-primary">{stats?.badgesEarned ?? earnedBadges.length}</div>
                <div className="text-xs sm:text-xs md:text-sm text-muted-foreground font-medium">Badges Earned</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-secondary" />
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-secondary">{stats?.ripples ?? 16}</div>
                <div className="text-xs sm:text-xs md:text-sm text-muted-foreground font-medium">Ripples Created</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-accent" />
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-accent">{stats?.streak ?? 0}</div>
                <div className="text-xs sm:text-xs md:text-sm text-muted-foreground font-medium">Day Streak</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-purple-500">{stats?.miles ?? 0}</div>
                <div className="text-xs sm:text-xs md:text-sm text-muted-foreground font-medium">Miles Traveled</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 hover:scale-105 transition-transform">
              <CardContent className="p-2.5 sm:p-3 md:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-1 sm:mb-2">💎</div>
                <div className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-purple-700">{stats?.points ?? 0}</div>
                <div className="text-xs sm:text-xs md:text-sm text-purple-600">Kindness Points</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300 hover:scale-105 transition-transform">
              <CardContent className="p-2.5 sm:p-3 md:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-1 sm:mb-2">🗺️</div>
                <div className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-blue-700">{stats?.cities ?? 0}</div>
                <div className="text-xs sm:text-xs md:text-sm text-blue-600">Cities Reached</div>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Section with Animation */}
          <GamificationDashboard  />
          <ChallengesDashboard/>
          <Card className="shadow-elevated border-accent/20 bg-gradient-to-r from-purple-100 via-pink-100 to-cyan-100 relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-purple-300/30 rounded-full animate-pulse" />
              <div className="absolute bottom-10 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-pink-300/30 rounded-full animate-pulse delay-300" />
              <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-cyan-300/30 rounded-full animate-pulse delay-500" />
            </div>
            
            <CardContent className="p-4 sm:p-6 md:p-8 text-center relative z-10">
              <div className="relative inline-block">
                <img 
                  src={char4} 
                  alt="Motivation character" 
                  className="w-24 h-auto sm:w-28 md:w-32 mx-auto mb-3 sm:mb-4 animate-bounce"
                />
                <Sparkles className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-spin" />
                <Heart className="absolute bottom-0 left-0 w-4 h-4 sm:w-5 sm:h-5 text-pink-400 animate-pulse" />
              </div>
              
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-2 sm:mb-3">Keep Going, Superstar!</h3>
              <p className="text-sm sm:text-base md:text-lg text-foreground/80 max-w-md mx-auto mb-3 sm:mb-4">
                {stats?.streak ? (
                  <>
                    You're on a <span className="font-bold text-orange-500">{stats.streak}-day kindness streak!</span>
                    {(() => {
                      const streakBadges = allBadges.filter((b: any) =>
                        b.required_streak && !b.earned
                      ).sort((a: any, b: any) =>
                        (a.required_streak || 0) - (b.required_streak || 0)
                      );

                      const nextStreakBadge = streakBadges[0];

                      if (nextStreakBadge && nextStreakBadge.required_streak) {
                        const daysNeeded = nextStreakBadge.required_streak - (stats.streak || 0);
                        return (
                          <>
                            {' '}Just {daysNeeded > 0 ? daysNeeded : 0} more {daysNeeded === 1 ? 'day' : 'days'} to unlock the <span className="font-bold text-purple-600">"{nextStreakBadge.name}"</span> badge!
                          </>
                        );
                      }
                      return ' Keep up the amazing work!';
                    })()}
                  </>
                ) : (
                  "Start your kindness journey today!"
                )}
              </p>

              {/* Progress bar */}
              {(() => {
                const streakBadges = allBadges.filter((b: any) =>
                  b.required_streak && !b.earned
                ).sort((a: any, b: any) =>
                  (a.required_streak || 0) - (b.required_streak || 0)
                );

                const nextStreakBadge = streakBadges[0];

                if (nextStreakBadge && nextStreakBadge.required_streak && stats?.streak !== undefined) {
                  const currentStreak = stats.streak;
                  const targetStreak = nextStreakBadge.required_streak;
                  const progressPercentage = Math.min((currentStreak / targetStreak) * 100, 100);

                  return (
                    <div className="max-w-sm mx-auto px-2 sm:px-0">
                      <div className="flex justify-between text-xs sm:text-sm text-foreground/60 mb-1">
                        <span>{currentStreak} days</span>
                        <span>{targetStreak} days</span>
                      </div>
                      <div className="h-3 sm:h-4 bg-white/80 rounded-full overflow-hidden border-2 border-purple-300">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Encouraging emojis */}
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {['🌟', '💪', '🎉', '🚀', '✨'].map((emoji, i) => (
                  <span 
                    key={i} 
                    className="text-xl sm:text-2xl animate-bounce" 
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Activity Heatmap at Bottom */}
          <ActivityHeatmap />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;