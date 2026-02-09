import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy, Target, Calendar, Clock, Users, Award,
  Play, CheckCircle, Star, Flame, Gift, CreditCard,
  ArrowRight, Sparkles, TrendingUp, Heart
} from "lucide-react";
import { apiFetch } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { getImageUrl } from "@/utils/imageUrl";

interface Challenge {
  id: number;
  name: string;
  description: string;
  challenge_type: "daily" | "weekly" | "monthly" | "ripple";
  target_metric: string;
  target_value: number;
  reward_points: number;
  start_date: string;
  end_date: string;
  participants: number;
  completion_rate: number;
  days_remaining: number;
  image_path: string | null;
  user_joined?: boolean;
  card_id?: number;
  card?: {
    id: number;
    name: string;
    card_type: string;
    icon_path?: string;
  };
}

interface UserCardStats {
  total_cards: number;
  unconsumed_cards: number;
  cards_by_type: {
    daily: number;
    weekly: number;
    monthly: number;
    ripple: number;
  };
}

interface BadgeProgress {
  badge_id: number;
  badge_name: string;
  current_tier: number;
  current_tier_name: string;
  next_tier_level: number | null;
  next_tier_name: string | null;
  cards_collected: number;
  cards_needed: number;
  progress_percentage: number;
}

export default function ModernChallenges() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [runningChallenges, setRunningChallenges] = useState<Challenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);

  const [cardStats, setCardStats] = useState<UserCardStats | null>(null);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);

  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // Fetch challenges
  useEffect(() => {
    fetchChallenges();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);

      // Fetch all challenge types
      const [runningRes, upcomingRes, completedRes] = await Promise.all([
        apiFetch<any>("/challenges?status=running"),
        apiFetch<any>("/challenges?status=upcoming"),
        apiFetch<any>("/challenges?status=completed"),
      ]);

      setRunningChallenges(runningRes?.data || []);
      setUpcomingChallenges(upcomingRes?.data || []);
      setCompletedChallenges(completedRes?.data || []);
    } catch (error: any) {
      console.error("Error fetching challenges:", error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [cardsRes, badgesRes] = await Promise.all([
        apiFetch<any>("/user/cards/stats"),
        apiFetch<any>("/user/badges/progress"),
      ]);

      setCardStats(cardsRes?.data || null);
      setBadgeProgress(badgesRes?.data || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    if (!user) {
      navigate("/age-gate");
      return;
    }

    try {
      setJoiningId(challengeId);

      await apiFetch(`/challenges/${challengeId}/join`, {
        method: "POST",
      });

      toast({
        title: "Success!",
        description: "You've joined the challenge!",
      });

      // Refresh challenges
      await fetchChallenges();
      if (user) await fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join challenge",
        variant: "destructive",
      });
    } finally {
      setJoiningId(null);
    }
  };

  const getChallengeTypeColor = (type: string) => {
    const colors = {
      daily: "bg-blue-500",
      weekly: "bg-green-500",
      monthly: "bg-purple-500",
      ripple: "bg-orange-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const getChallengeTypeIcon = (type: string) => {
    const icons = {
      daily: Calendar,
      weekly: Target,
      monthly: Trophy,
      ripple: Sparkles,
    };
    const Icon = icons[type as keyof typeof icons] || Target;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <>
      <Seo
        title="Kindness Challenges - Pass The Ripple"
        description="Join challenges, earn cards, and unlock badge tiers!"
        canonical={`${window.location.origin}/challenges`}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Kindness Challenges
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete challenges to earn cards and unlock badge tiers!
            </p>
          </div>

          {/* User Stats (if logged in) */}
          {user && cardStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Total Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{cardStats.total_cards}</div>
                  <p className="text-xs opacity-80 mt-1">
                    {cardStats.unconsumed_cards} available
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Daily Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{cardStats.cards_by_type.daily}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Weekly Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{cardStats.cards_by_type.weekly}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Ripple Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{cardStats.cards_by_type.ripple}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Links */}
          {user && (
            <div className="flex gap-4 justify-center mb-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/my-cards">
                  <CreditCard className="mr-2 h-4 w-4" />
                  My Cards
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/badge-progress">
                  <Award className="mr-2 h-4 w-4" />
                  Badge Progress
                </Link>
              </Button>
            </div>
          )}

          {/* Challenge Tabs */}
          <Tabs defaultValue="running" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="running" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Active ({runningChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({completedChallenges.length})
              </TabsTrigger>
            </TabsList>

            {/* Running Challenges */}
            <TabsContent value="running">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : runningChallenges.length === 0 ? (
                <Card className="p-12 text-center">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Challenges</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back soon for new challenges!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {runningChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      isJoining={joiningId === challenge.id}
                      user={user}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Upcoming Challenges */}
            <TabsContent value="upcoming">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <Skeleton className="h-64 w-full" />
                    </Card>
                  ))}
                </div>
              ) : upcomingChallenges.length === 0 ? (
                <Card className="p-12 text-center">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Challenges</h3>
                  <p className="text-muted-foreground">
                    New challenges will appear here soon!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      isJoining={joiningId === challenge.id}
                      user={user}
                      isUpcoming
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Completed Challenges */}
            <TabsContent value="completed">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <Skeleton className="h-64 w-full" />
                    </Card>
                  ))}
                </div>
              ) : completedChallenges.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Completed Challenges</h3>
                  <p className="text-muted-foreground">
                    Complete challenges to see them here!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      isJoining={false}
                      user={user}
                      isCompleted
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* CTA for non-logged in users */}
          {!user && (
            <Card className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <CardContent className="p-8 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Join the Kindness Movement!</h2>
                <p className="text-lg mb-6 opacity-90">
                  Sign up to complete challenges, earn cards, and unlock badge tiers!
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/age-gate">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (id: number) => void;
  isJoining: boolean;
  user: any;
  isUpcoming?: boolean;
  isCompleted?: boolean;
}

function ChallengeCard({ challenge, onJoin, isJoining, user, isUpcoming, isCompleted }: ChallengeCardProps) {
  const navigate = useNavigate();

  const getChallengeTypeColor = (type: string) => {
    const colors = {
      daily: "from-blue-500 to-blue-600",
      weekly: "from-green-500 to-green-600",
      monthly: "from-purple-500 to-purple-600",
      ripple: "from-orange-500 to-orange-600",
    };
    return colors[type as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const getChallengeTypeLabel = (type: string) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      ripple: "Ripple",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {challenge.image_path && (
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
          <img
            src={getImageUrl(challenge.image_path)}
            alt={challenge.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className={`bg-gradient-to-r ${getChallengeTypeColor(challenge.challenge_type)} text-white border-0`}>
              {getChallengeTypeLabel(challenge.challenge_type)}
            </Badge>
          </div>
          {challenge.user_joined && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90">
                <CheckCircle className="h-3 w-3 mr-1" />
                Joined
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="line-clamp-1">{challenge.name}</span>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {challenge.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{challenge.participants} joined</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>{challenge.reward_points} pts</span>
          </div>
        </div>

        {/* Card Reward */}
        {challenge.card && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Gift className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Earn: {challenge.card.name}</span>
          </div>
        )}

        {/* Progress (if joined and running) */}
        {challenge.user_joined && !isCompleted && !isUpcoming && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(challenge.completion_rate)}%</span>
            </div>
            <Progress value={challenge.completion_rate} />
          </div>
        )}

        {/* Days Remaining */}
        {!isCompleted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {isUpcoming
                ? `Starts in ${challenge.days_remaining} days`
                : `${challenge.days_remaining} days remaining`
              }
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isCompleted ? (
          <Button variant="outline" className="w-full" onClick={() => navigate(`/challenges/${challenge.id}/leaderboard`)}>
            View Leaderboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : challenge.user_joined ? (
          <Button className="w-full" onClick={() => navigate(`/challenges/${challenge.id}/leaderboard`)}>
            View Progress
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onJoin(challenge.id)}
            disabled={isJoining || isUpcoming}
          >
            {isJoining ? "Joining..." : isUpcoming ? "Coming Soon" : "Join Challenge"}
            {!isJoining && !isUpcoming && <Play className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
