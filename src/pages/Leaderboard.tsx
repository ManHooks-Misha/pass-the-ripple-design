import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import { UserIdentity } from "@/components/UserIdentity";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { leaderboardTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

interface Location {
  city: string | null;
  state: string | null;
  country: string | null;
}

interface User {
  id: number;
  full_name: string | null;
  nickname: string;
  profile_image_path: string | null;
  custom_avatar: string | null;
  ripple_id: string | null;
  avatar_id: string | null;
  location: Location;
}

interface Stats {
  points: number;
  current_streak: number;
  longest_streak: number;
  total_actions: number;
  total_badges: number;
}

interface LeaderboardEntry {
  rank: number;
  user: User;
  stats: Stats;
  is_current_user: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  current_user?: LeaderboardEntry; // Make current_user optional
  pagination: {
    current_page: number;
    per_page: number;
    total_users: number;
    total_pages: number;
  };
  filters: {
    category: string;
    timeframe: string;
    limit: number;
  };
}

const Leaderboard = () => {
  // Hooks must be called before any early returns
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_my_leaderboard_tutorial_completed",
    steps: leaderboardTutorialSteps,
  });

  const [activeTab, setActiveTab] = useState("global");
  const [category, setCategory] = useState("points");
  const [timeframe, setTimeframe] = useState("all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [category, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiFetch<any>("/leaderboard", {
        method: "GET",
      });

      if (res.success) {
        setLeaderboardData(res.data);
      } else {
        setError("Failed to load leaderboard data");
      }
    } catch (err) {
      setError("An error occurred while fetching leaderboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getAvatarEmoji = (userId: number) => {
    const emojis = ["🌟", "⭐", "✨", "💫", "🌊", "🌈", "☀️", "🦄", "🎭", "👑"];
    return emojis[userId % emojis.length];
  };

  const getLocationString = (location: Location) => {
    if (location.city && location.state && location.country) {
      return `${location.city}, ${location.state}`;
    }
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    if (location.country) {
      return location.country;
    }
    return "Unknown Location";
  };

  const filterLeaderboardByRegion = (data: LeaderboardEntry[]) => {
    if (!leaderboardData?.current_user?.user?.location?.state) return data;
    const userState = leaderboardData.current_user.user.location.state;
    return data.filter(entry => entry.user.location.state === userState);
  };

  const LeaderRow = ({ leader, showRegion = false }: { leader: LeaderboardEntry; showRegion?: boolean }) => (
    <div className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all hover:border-primary/50 ${
      leader.is_current_user ? 'bg-primary/5 border-primary/20' : ''
    }`}>
      <div className="text-lg sm:text-2xl font-bold min-w-[2rem] sm:min-w-[3rem] text-center flex-shrink-0">
        {getRankIcon(leader.rank)}
      </div>
      <div className="flex-1 min-w-0">
        <UserIdentity
            avatar_id={leader.user.avatar_id}
            profile_image_path={leader.user.profile_image_path}
            nickname={leader.user.nickname}
            ripple_id={leader.user.ripple_id}
          />
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {leader.is_current_user && (
              <Badge variant="secondary" className="text-xs">You</Badge>
            )}
            {showRegion && (
              <p className="text-xs text-muted-foreground">{getLocationString(leader.user.location)}</p>
            )}
          </div>
      </div>
      <div className="text-right space-y-1 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
          <span className="whitespace-nowrap">⚡ {leader.stats.points}</span>
          <span className="whitespace-nowrap">🔥 {leader.stats.current_streak}</span>
          <span className="whitespace-nowrap">🏆 {leader.stats.total_badges}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error || !leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-muted-foreground">{error || "Unable to load leaderboard"}</p>
        </div>
      </div>
    );
  }

  const { leaderboard, current_user } = leaderboardData;
  const regionalLeaders = filterLeaderboardByRegion(leaderboard);
  const isAuthenticated = !!current_user;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-5 lg:p-6">
      <Seo
        title="Leaderboard — Pass The Ripple"
        description="See how your kindness ranks among kids spreading ripples worldwide."
        canonical={`${window.location.origin}/leaderboard`}
      />
      
      {/* Tutorial Component */}
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_my_leaderboard_tutorial_completed"
        />
      )}
      
      <div className="space-y-4 sm:space-y-5 md:space-y-6 max-w-4xl mx-auto">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Kindness Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
            Celebrating the ripples spreading the furthest or Kindness Leaderboard, Shouting out kids whose kindness is going everywhere!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>

        {/* Current User Position - Only show if authenticated */}
        {isAuthenticated && current_user && (
          <Card className="shadow-elevated border-primary/20" data-tutorial-target="your-ranking">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
              <CardTitle className="text-center text-lg sm:text-xl">Your Position</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="text-3xl sm:text-4xl">{getAvatarEmoji(current_user.user.id)}</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">{current_user.user.nickname}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Ranked #{current_user.rank} globally</p>
                </div>
                <div className="flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-primary">{current_user.stats.points}</div>
                    <div className="text-muted-foreground">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-primary">{current_user.stats.current_streak}</div>
                    <div className="text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-primary">{current_user.stats.total_badges}</div>
                    <div className="text-muted-foreground">Badges</div>
                  </div>
                </div>
                {current_user.rank <= Math.ceil(leaderboardData.pagination.total_users * 0.05) && (
                  <div className="bg-primary/5 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-primary font-medium">
                      🎯 You're in the top 5% of kindness spreaders worldwide!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Prompt for Unauthenticated Users */}
        {!isAuthenticated && (
          <Card className="shadow-elevated border-primary/20">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔐</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Join the Leaderboard!</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Sign in to see your position and track your progress among kindness spreaders worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a 
                  href="/login" 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
                >
                  Sign In
                </a>
                <a 
                  href="/age-gate" 
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm sm:text-base"
                >
                  Create Account
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2">
            <TabsTrigger value="global" className="text-xs sm:text-sm px-2 sm:px-4">🌍 Global</TabsTrigger>
            <TabsTrigger value="regional" disabled={!isAuthenticated} className="text-xs sm:text-sm px-2 sm:px-4">
              📍 Regional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <Card className="shadow-elevated">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Global Leaderboard</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Top kindness spreaders from around the world</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2" data-tutorial-target="leaderboard-list">
                {leaderboard.map((leader) => (
                  <LeaderRow key={leader.user.id} leader={leader} showRegion={true} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <Card className="shadow-elevated">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  {isAuthenticated && current_user?.user?.location?.state 
                    ? `${current_user.user.location.state} Leaderboard`
                    : "Regional Leaderboard"
                  }
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {isAuthenticated 
                    ? "Top kindness spreaders in your region" 
                    : "Sign in to see regional rankings"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2">
                {isAuthenticated ? (
                  regionalLeaders.length > 0 ? (
                    regionalLeaders.map((leader) => (
                      <LeaderRow key={leader.user.id} leader={leader} showRegion={true}/>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground">
                      No users in your region yet. Be the first to spread kindness!
                    </div>
                  )
                ) : (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground">
                    Please sign in to view regional rankings
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Motivational Messages - Only show if authenticated */}
        {isAuthenticated && current_user && (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <Card className="text-center bg-gradient-subtle">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl mb-2">🚀</div>
                <h3 className="font-bold mb-1 text-sm sm:text-base">Keep Going!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You've completed {current_user.stats.total_actions} actions. Keep spreading kindness!
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-subtle">
              <CardContent className="p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl mb-2">🔥</div>
                <h3 className="font-bold mb-1 text-sm sm:text-base">Amazing Streak!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Current streak: {current_user.stats.current_streak} days. Longest: {current_user.stats.longest_streak} days!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;