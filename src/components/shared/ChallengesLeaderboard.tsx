import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Target,
  Users,
  TrendingUp,
  Award,
  Flame,
  Crown,
  Star,
  Zap,
  Calendar,
  Gift,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Hourglass,
  Play,
  PlusCircle,
  AudioWaveform,
  AudioWaveformIcon,
  History,
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { apiFetch } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { UserIdentity } from "@/components/UserIdentity";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";
import { useParams, useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUrl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import ChallengeJoinSuccess from "@/components/gamification/ChallengeJoinSuccess";
import ChallengeTutorial from "@/components/gamification/ChallengeTutorial";
import ChallengeActivityViewer from "@/components/gamification/ChallengeActivityViewer";

interface Challenge {
  id: number;
  name: string;
  description: string;
  challenge_type: string;
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
}

interface LeaderboardParticipant {
  global_rank: number;
  user_id: number;
  nickname: string;
  full_name: string | null;
  ripple_id: string | null;
  avatar_id: number | null;
  profile_image_path: string | null;
  challenge_id: number;
  challenge_name: string;
  user_progress: number;
  target_value: number;
  completion_percentage: number;
  is_completed: boolean;
  completed_at: string | null;
  last_updated: string;
  estimated_points: number;
  time_to_complete: string | null;
}

interface UserPosition {
  has_participation: any;
  global_rank: number;
  total_participants: number;
  user_id: number;
  nickname: string;
  challenge_id: number;
  challenge_name: string;
  user_progress: number;
  target_value: number;
  completion_percentage: number;
  is_completed: boolean;
  estimated_points: number;
  percentile: number;
}

interface LeaderboardStats {
  total_participants: number;
  total_challenges: number;
  completed_challenges: number;
  total_points_distributed: number;
  average_completion_rate: number;
  top_performers_count: number;
  most_popular_challenge: {
    id: number;
    name: string;
    participant_count: number;
  } | null;
  recent_activity: number;
}

interface CommunityCompleter {
  user_id: number;
  nickname: string;
  full_name: string | null;
  avatar_id: number | null;
  profile_image_path: string | null;
  ripple_id: string | null;
  completed_challenges: number;
  total_challenges: number;
  total_points_earned: number;
  completed_at: string;
  is_community_champion: boolean;
}

export default function ChallengesLeaderboard() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<LeaderboardParticipant[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>("all");
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "all_time">("all_time");
  const [currentPage, setCurrentPage] = useState(1);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("running");

  // New states for upcoming and completed challenges
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [completedLoading, setCompletedLoading] = useState(false);

  // Separate states for completed challenges leaderboard
  const [completedParticipants, setCompletedParticipants] = useState<LeaderboardParticipant[]>([]);
  const [completedUserPosition, setCompletedUserPosition] = useState<UserPosition | null>(null);
  const [completedStats, setCompletedStats] = useState<LeaderboardStats | null>(null);
  const [completedLoadingData, setCompletedLoadingData] = useState(false);

  // Timer state for single challenge countdown
  const [timeLeft, setTimeLeft] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Congratulations popup state
  const [showCongrats, setShowCongrats] = useState(false);
  const [joinedChallenge, setJoinedChallenge] = useState<Challenge | null>(null);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);

  // Activity viewer state
  const [showActivity, setShowActivity] = useState(false);

  // Community completers state
  const [communityCompleters, setCommunityCompleters] = useState<CommunityCompleter[]>([]);
  const [communityCompletersLoading, setCommunityCompletersLoading] = useState(false);
  const [totalCommunityCompleters, setTotalCommunityCompleters] = useState(0);
  const [activityChallenge, setActivityChallenge] = useState<Challenge | null>(null);

  // live countdown update for selectedChallengeData
  useEffect(() => {
    const selectedChallengeData = challenges.find(
      (c) => c.id.toString() === selectedChallenge
    );
    if (!selectedChallengeData) return;
    if (selectedChallenge === "all") return;
    function updateCountdown() {
      const now = new Date();
      const endDate = new Date(selectedChallengeData.end_date);
      const diff = endDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d > 0 ? d + 'd ' : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }
    updateCountdown();
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(updateCountdown, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [challenges, selectedChallenge]);

  // Function to search for challenge across all types
  const findChallengeAcrossAllTypes = async (challengeId: string) => {
    // Search in current running challenges
    const inRunning = challenges.find(c => c.id.toString() === challengeId);
    if (inRunning) {
      const index = challenges.findIndex(c => c.id.toString() === challengeId);
      setCurrentSlide(index);
      setActiveTab("running");
      setSelectedChallenge(challengeId);
      return true;
    }

    // Search in upcoming challenges - always fetch if not already loaded
    setUpcomingLoading(true);
    try {
      const upcomingRes = await apiFetch<{ success: boolean; data: Challenge[] }>("/challenges-leaderboard/upcoming-challenges");
      if (upcomingRes.success) {
        setUpcomingChallenges(upcomingRes.data);
        const inUpcoming = upcomingRes.data.find(c => c.id.toString() === challengeId);
        if (inUpcoming) {
          const index = upcomingRes.data.findIndex(c => c.id.toString() === challengeId);
          setCurrentSlide(index);
          setActiveTab("upcoming");
          setSelectedChallenge(challengeId);
          setUpcomingLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Error fetching upcoming challenges:", error);
    } finally {
      setUpcomingLoading(false);
    }

    // Search in completed challenges - always fetch if not already loaded
    setCompletedLoading(true);
    try {
      const completedRes = await apiFetch<{ success: boolean; data: Challenge[] }>("/challenges-leaderboard/completed-challenges");
      if (completedRes.success) {
        setCompletedChallenges(completedRes.data);
        const inCompleted = completedRes.data.find(c => c.id.toString() === challengeId);
        if (inCompleted) {
          const index = completedRes.data.findIndex(c => c.id.toString() === challengeId);
          setCurrentSlide(index);
          setActiveTab("completed");
          setSelectedChallenge(challengeId);
          // Fetch leaderboard data for this completed challenge
          await fetchCompletedLeaderboard(inCompleted.id.toString());
          setCompletedLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Error fetching completed challenges:", error);
    } finally {
      setCompletedLoading(false);
    }

    // Challenge not found in any category
    return false;
  };

  // Initialize selected challenge based on URL parameter - search across all challenge types
  useEffect(() => {
    if (id) {
      handleChallengeSelect(id);
      // findChallengeAcrossAllTypes(id).then(found => {
      //   if (!found) {
      //     toast({
      //       title: "Challenge Not Found",
      //       description: "The requested challenge could not be found.",
      //       variant: "destructive"
      //     });
      //     navigate("/challenges-leaderboard");
      //   }
      // });
    } else {
      setSelectedChallenge("all");
    }
  }, [id]);

  // Check if user has seen tutorial
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("challengeTutorialCompleted");
    if (!tutorialCompleted && challenges.length > 0) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [challenges]);

  // Whenever tab changes, reset slider position
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentSlide(0);
    setSelectedChallenge("all"); // Reset selected challenge when switching tabs
    if (value === "completed" && completedChallenges.length > 0) {
      // Fetch leaderboard for the first completed challenge if available
      const currentCompletedChallenge = completedChallenges[0];
      if (currentCompletedChallenge) {
        fetchCompletedLeaderboard(currentCompletedChallenge.id.toString());
      }
    }
  };

  const fetchChallengesCompleted = async () => {
    setCompletedLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Challenge[] }>("/challenges-leaderboard/completed-challenges");
      if (res.success) {
        setCompletedChallenges(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch completed challenges:", error);
    } finally {
      setCompletedLoading(false);
    }
  };

  const fetchChallenges = async () => {
    setChallengesLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Challenge[] }>("/challenges-leaderboard/active-challenges");
      if (res.success) {
        setChallenges(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setChallengesLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeframe,
        page: currentPage.toString(),
        ...(selectedChallenge !== "all" && { challenge_id: selectedChallenge }),
      });

      const [leaderboardRes, statsRes] = await Promise.all([
        apiFetch<{ success: boolean; data: { participants: LeaderboardParticipant[]; user_position: UserPosition | null } }>(`/challenges-leaderboard/global?${params}`),
        apiFetch<{ success: boolean; data: LeaderboardStats }>(`/challenges-leaderboard/stats?${params}`),
      ]);

      if (leaderboardRes.success) {
        setParticipants(leaderboardRes.data.participants);
        setUserPosition(leaderboardRes.data.user_position);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch completed challenges leaderboard
  const fetchCompletedLeaderboard = async (challengeId?: string) => {
    setCompletedLoadingData(true);
    try {
      const params = new URLSearchParams({
        timeframe: "all_time",
        page: currentPage.toString(),
        ...(challengeId && { challenge_id: challengeId }),
      });

      const [leaderboardRes, statsRes] = await Promise.all([
        apiFetch<{ success: boolean; data: { participants: LeaderboardParticipant[]; user_position: UserPosition | null } }>(`/challenges-leaderboard/completed-challenges?${params}`),
        apiFetch<{ success: boolean; data: LeaderboardStats }>(`/challenges-leaderboard/stats?${params}`),
      ]);

      if (leaderboardRes.success) {
        setCompletedParticipants(leaderboardRes.data.participants);
        setCompletedUserPosition(leaderboardRes.data.user_position);
      }

      if (statsRes.success) {
        setCompletedStats(statsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch completed leaderboard:", error);
    } finally {
      setCompletedLoadingData(false);
    }
  };

  const fetchUserPosition = async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams({
        timeframe,
        ...(selectedChallenge !== "all" && { challenge_id: selectedChallenge }),
      });
      const res = await apiFetch<{ success: boolean; data: UserPosition }>(
        `/challenges-leaderboard/user-position?${params}`
      );
      if (res.success && res.data) {
        setUserPosition(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch user position:", error);
    }
  };

  // Fetch community completers - users who completed all challenges
  const fetchCommunityCompleters = async () => {
    setCommunityCompletersLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: {
          completers: CommunityCompleter[];
          total_challenges: number;
          total_completers: number;
        }
      }>("/challenges-leaderboard/community-completers");

      if (res.success && res.data) {
        setCommunityCompleters(res.data.completers);
        setTotalCommunityCompleters(res.data.total_completers);
      }
    } catch (error) {
      console.error("Failed to fetch community completers:", error);
    } finally {
      setCommunityCompletersLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "upcoming" && upcomingChallenges.length === 0) {
      setUpcomingLoading(true);
      apiFetch<{ success: boolean; data: Challenge[] }>("/challenges-leaderboard/upcoming-challenges")
        .then(res => {
          if (res.success) setUpcomingChallenges(res.data);
        })
        .finally(() => setUpcomingLoading(false));
    } else if (activeTab === "completed" && completedChallenges.length === 0) {
      fetchChallengesCompleted();
    }
  }, [activeTab]);

  // Fetch all challenge types on initial load
  useEffect(() => {
    const fetchAllChallenges = async () => {
      // Fetch running challenges
      await fetchChallenges();

      // Fetch upcoming challenges
      setUpcomingLoading(true);
      try {
        const upcomingRes = await apiFetch<{ success: boolean; data: Challenge[] }>("/challenges-leaderboard/upcoming-challenges");
        if (upcomingRes.success) {
          setUpcomingChallenges(upcomingRes.data);
        }
      } catch (error) {
        console.error("Error fetching upcoming challenges:", error);
      } finally {
        setUpcomingLoading(false);
      }

      // Fetch completed challenges
      await fetchChallengesCompleted();

      // Fetch community completers (users who completed all challenges)
      await fetchCommunityCompleters();
    };

    fetchAllChallenges();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === "running") {
      fetchLeaderboard();
    } else if (activeTab === "completed" && selectedChallenge !== "all") {
      fetchCompletedLeaderboard(selectedChallenge);
    }
  }, [timeframe, selectedChallenge, activeTab]);

  useEffect(() => {
    if (user && activeTab === "running") {
      fetchUserPosition();
    }
  }, [user, timeframe, selectedChallenge, activeTab]);

  // Handle challenge selection with URL update
  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    if (challengeId === "all") {
      navigate("/challenges-leaderboard");
    } else {
      navigate(`/challenges/${challengeId}/leaderboard`);
      // Update slider to show selected challenge based on active tab
      let challengeIndex = -1;
      if (activeTab === "running") {
        challengeIndex = challenges.findIndex(c => c.id.toString() === challengeId);
      } else if (activeTab === "upcoming") {
        challengeIndex = upcomingChallenges.findIndex(c => c.id.toString() === challengeId);
      } else if (activeTab === "completed") {
        challengeIndex = completedChallenges.findIndex(c => c.id.toString() === challengeId);
        // Fetch leaderboard for the selected completed challenge
        fetchCompletedLeaderboard(challengeId);
      }

      if (challengeIndex !== -1) {
        setCurrentSlide(challengeIndex);
      }
    }
  };

  // Manual slider navigation
  const nextSlide = () => {
    if (activeTab === "running") {
      setCurrentSlide((prev) => (prev + 1) % challenges.length);
    } else if (activeTab === "upcoming") {
      setCurrentSlide((prev) => (prev + 1) % upcomingChallenges.length);
    } else if (activeTab === "completed") {
      setCurrentSlide((prev) => (prev + 1) % completedChallenges.length);
    }
  };

  const prevSlide = () => {
    if (activeTab === "running") {
      setCurrentSlide((prev) => (prev - 1 + challenges.length) % challenges.length);
    } else if (activeTab === "upcoming") {
      setCurrentSlide((prev) => (prev - 1 + upcomingChallenges.length) % upcomingChallenges.length);
    } else if (activeTab === "completed") {
      setCurrentSlide((prev) => (prev - 1 + completedChallenges.length) % completedChallenges.length);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    let challengeId = "";
    if (activeTab === "running") {
      challengeId = challenges[index].id.toString();
    } else if (activeTab === "upcoming") {
      challengeId = upcomingChallenges[index].id.toString();
    } else if (activeTab === "completed") {
      challengeId = completedChallenges[index].id.toString();
      // Fetch leaderboard for the selected completed challenge
      fetchCompletedLeaderboard(challengeId);
    }
    handleChallengeSelect(challengeId);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
    if (rank === 3)
      return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    if (rank <= 10) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getChallengeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      creation: <Zap className="w-4 h-4" />,
      engagement: <Users className="w-4 h-4" />,
      growth: <TrendingUp className="w-4 h-4" />,
      consistency: <Flame className="w-4 h-4" />,
      milestone: <Trophy className="w-4 h-4" />,
    };
    return icons[type] || <Target className="w-4 h-4" />;
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      stories_created: "Stories",
      likes_received: "Likes",
      comments_received: "Comments",
      views_received: "Views",
      login_streak: "Login Days",
      distance_traveled: "Distance",
      referrals_completed: "Referrals",
      story_reach: "Reach",
    };
    return labels[metric] || metric.replace(/_/g, " ");
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  // Get current challenge based on active tab
  const getCurrentChallenge = () => {
    if (activeTab === "running" && challenges.length > 0) {
      return challenges[currentSlide];
    } else if (activeTab === "upcoming" && upcomingChallenges.length > 0) {
      return upcomingChallenges[currentSlide];
    } else if (activeTab === "completed" && completedChallenges.length > 0) {
      return completedChallenges[currentSlide];
    }
    return null;
  };

  const currentChallenge = getCurrentChallenge();
  const selectedChallengeData = challenges.find(c => c.id.toString() === selectedChallenge);
  const selectedCompletedChallenge = completedChallenges.find(c => c.id.toString() === selectedChallenge);

  // Join challenge function
  const handleJoinChallenge = async () => {
    if (isJoining) return;

    // Check if user is logged in
    if (!user) {
      navigate('/login', {
        state: {
          from: `/challenges/${currentChallenge?.id}/leaderboard`,
          message: 'Please login to join this challenge'
        }
      });
      return;
    }

    if (!currentChallenge) return;

    setIsJoining(true);
    try {
      const response = await apiFetch('/challenges-leaderboard/join', {
        method: 'POST',
        body: JSON.stringify({
          challenge_id: currentChallenge.id,
          user_id: user.id
        })
      }) as any;

      if (response.success) {
        // Update the current challenge's user_joined status immediately in all challenge lists
        setChallenges(prev => prev.map(c =>
          c.id === currentChallenge.id ? { ...c, user_joined: true, participants: c.participants + 1 } : c
        ));
        setUpcomingChallenges(prev => prev.map(c =>
          c.id === currentChallenge.id ? { ...c, user_joined: true, participants: c.participants + 1 } : c
        ));
        setCompletedChallenges(prev => prev.map(c =>
          c.id === currentChallenge.id ? { ...c, user_joined: true, participants: c.participants + 1 } : c
        ));

        // Show congratulations popup
        setJoinedChallenge(currentChallenge);
        setShowCongrats(true);

        // Small delay to let the backend process the join
        await new Promise(resolve => setTimeout(resolve, 300));

        // Refresh only leaderboard and user position (not challenges to preserve the optimistic update)
        await Promise.all([
          fetchLeaderboard(),
          fetchUserPosition()
        ]);
      } else {
        toast({
          title: 'Failed to join challenge!',
          description: response?.message || 'Failed to join challenge',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to join challenge!',
        description: 'An error occurred while joining the challenge',
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Render leaderboard table component (reusable)
  const renderLeaderboardTable = (
    participants: LeaderboardParticipant[],
    userPosition: UserPosition | null,
    stats: LeaderboardStats | null,
    loading: boolean,
    isCompleted?: boolean
  ) => {
    const currentParticipants = isCompleted ? completedParticipants : participants;
    const currentUserPosition = isCompleted ? completedUserPosition : userPosition;
    const currentStats = isCompleted ? completedStats : stats;
    const currentLoading = isCompleted ? completedLoadingData : loading;

    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        {currentStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                      {currentStats.total_participants.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      Total Participants
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                      {currentStats.completed_challenges.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      Completed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                      {isNaN(currentStats.average_completion_rate) || currentStats.average_completion_rate === null || currentStats.average_completion_rate === undefined
                        ? '0'
                        : Math.round(currentStats.average_completion_rate)}%
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      Avg Progress
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                      {currentStats.top_performers_count.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      Top Performers
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  <span className="truncate">
                    {selectedChallenge === "all"
                      ? `${isCompleted ? "Historical" : "Global"} Challenges Leaderboard`
                      : `${isCompleted ? selectedCompletedChallenge?.name : selectedChallengeData?.name} Leaderboard`}
                  </span>
                  {isCompleted && <History className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />}
                </CardTitle>
                {selectedChallengeData && !isCompleted && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {selectedChallengeData.description}
                  </p>
                )}
                {selectedCompletedChallenge && isCompleted && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {selectedCompletedChallenge.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {!isCompleted && (
                  <Select
                    value={timeframe}
                    onValueChange={(value: any) => setTimeframe(value)}
                  >
                    <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Today</SelectItem>
                      <SelectItem value="weekly">This Week</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="all_time">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={isCompleted ? () => fetchCompletedLeaderboard(selectedChallenge) : fetchLeaderboard} className="text-xs sm:text-sm px-2 sm:px-4">
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* User Position Sticky Bar */}
            {user && currentUserPosition && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg sticky top-16 sm:top-20 z-10 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getRankBadge(
                        currentUserPosition.global_rank
                      )}`}
                    >
                      {getRankIcon(currentUserPosition.global_rank || 0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base">Your Position</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
                        Rank {currentUserPosition.global_rank || 0} of{" "}
                        {currentUserPosition.total_participants || 0} • Top{" "}
                        {isNaN(currentUserPosition.percentile) || currentUserPosition.percentile === null || currentUserPosition.percentile === undefined
                          ? '0'
                          : Math.round(currentUserPosition.percentile)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="font-semibold text-sm sm:text-base">
                      {isNaN(currentUserPosition.completion_percentage) || currentUserPosition.completion_percentage === null || currentUserPosition.completion_percentage === undefined
                        ? '0'
                        : Math.round(currentUserPosition.completion_percentage)}% Complete
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {currentUserPosition.user_progress || 0}/{currentUserPosition.target_value || 0}
                    </div>
                  </div>
                </div>
                <Progress
                  value={isNaN(currentUserPosition.completion_percentage) || currentUserPosition.completion_percentage === null || currentUserPosition.completion_percentage === undefined
                    ? 0
                    : Math.max(0, Math.min(100, currentUserPosition.completion_percentage))}
                  className="mt-2 sm:mt-3 h-1.5 sm:h-2"
                />
              </div>
            )}

            {/* Leaderboard Table */}
            {currentLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : currentParticipants && currentParticipants.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12 sm:w-16">Rank</TableHead>
                        <TableHead className="min-w-[150px]">Participant</TableHead>
                        {selectedChallenge === "all" && (
                          <TableHead className="min-w-[120px]">Challenge</TableHead>
                        )}
                        <TableHead className="text-center min-w-[120px]">Progress</TableHead>
                        <TableHead className="text-center min-w-[100px]">Status</TableHead>
                        <TableHead className="text-right min-w-[80px]">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentParticipants.map((participant) => (
                        <TableRow
                          key={`${participant.user_id}-${participant.challenge_id}`}
                          className={
                            user && participant.user_id === user?.id
                              ? "bg-primary/5 border-l-4 border-l-primary"
                              : ""
                          }
                        >
                          <TableCell>
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${getRankBadge(
                                participant.global_rank
                              )}`}
                            >
                              {getRankIcon(participant.global_rank)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <UserIdentity
                              avatar_id={participant.avatar_id}
                              profile_image_path={participant.profile_image_path}
                              nickname={participant.nickname}
                              ripple_id={participant.ripple_id}
                            />
                          </TableCell>
                          {selectedChallenge === "all" && (
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {participant.challenge_name}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="space-y-1 min-w-[100px] sm:min-w-[120px]">
                              <div className="flex justify-between text-xs">
                                <span>
                                  {participant.user_progress || 0}/
                                  {participant.target_value || 0}
                                </span>
                                <span>
                                  {isNaN(participant.completion_percentage) || participant.completion_percentage === null || participant.completion_percentage === undefined
                                    ? '0'
                                    : Math.round(participant.completion_percentage)}%
                                </span>
                              </div>
                              <Progress
                                value={isNaN(participant.completion_percentage) || participant.completion_percentage === null || participant.completion_percentage === undefined
                                  ? 0
                                  : Math.max(0, Math.min(100, participant.completion_percentage))}
                                className="h-1.5 sm:h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {participant.is_completed ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">Done</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-orange-200 text-orange-700 text-xs"
                              >
                                <Flame className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">In Progress</span>
                                <span className="sm:hidden">Active</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary text-xs sm:text-sm">
                            +{participant.estimated_points || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedChallenge === "all"
                    ? "No Leaderboard Data Yet"
                    : isCompleted
                      ? "No Participants Found"
                      : "No Active Participants Yet"}
                </h3>
                <p className="text-muted-foreground">
                  {selectedChallenge === "all"
                    ? "Join a challenge and start making progress to appear on the leaderboard!"
                    : isCompleted
                      ? "No one participated in this challenge or made any progress."
                      : selectedChallengeData && selectedChallengeData.participants > 0
                        ? `${selectedChallengeData.participants} ${selectedChallengeData.participants === 1 ? 'person has' : 'people have'} joined, but no one has made progress yet. Be the first to start!`
                        : "No one has joined this challenge yet. Be the first to participate!"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {/* {!currentLoading && currentParticipants && currentParticipants.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {currentParticipants.length} participants
                  {selectedChallenge !== "all" && (
                    <span> in {isCompleted ? selectedCompletedChallenge?.name : selectedChallengeData?.name}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentParticipants.length < 100}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render challenge slider based on active tab
  const renderChallengeSlider = () => {
    const currentChallenges = activeTab === "running" ? challenges :
      activeTab === "upcoming" ? upcomingChallenges :
        completedChallenges;

    if (currentChallenges.length === 0) return null;

    return (
      <div className="mb-6 sm:mb-8">
        {/* Main Slider */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl min-h-[400px] sm:min-h-[450px] md:min-h-[500px] h-auto sm:h-80 md:h-96">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: currentChallenge?.image_path
                ? `url(${getImageUrl(currentChallenge.image_path)})`
                : activeTab === "running"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : activeTab === "upcoming"
                    ? "linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)"
                    : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
          />

          {/* Overlay */}
          <div className={`absolute inset-0 ${activeTab === "running" ? "bg-black/40" :
            activeTab === "upcoming" ? "bg-blue-900/30" :
              "bg-gray-900/40"
            }`} />

          {/* Content */}
          <div className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[500px] flex items-center overflow-y-auto py-4 sm:py-6 md:py-8">
            <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="max-w-2xl text-white space-y-3 sm:space-y-4">
                <Badge className="mb-2 sm:mb-3 md:mb-4 bg-white/20 backdrop-blur-sm border-0 text-white text-xs sm:text-sm">
                  {getChallengeIcon(currentChallenge?.challenge_type || "")}
                  <span className="ml-1 sm:ml-2 capitalize">
                    {currentChallenge?.challenge_type}
                  </span>
                  {selectedChallenge === currentChallenge?.id.toString() && (
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 sm:ml-2 text-yellow-400" />
                  )}
                  {activeTab === "upcoming" && <Hourglass className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 sm:ml-2 text-yellow-400" />}
                  {activeTab === "completed" && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 sm:ml-2 text-green-400" />}
                </Badge>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {currentChallenge?.name}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-3 sm:mb-4 md:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {currentChallenge?.description}
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      {currentChallenge?.participants} participants
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      {currentChallenge?.target_value}{" "}
                      {currentChallenge ? getMetricLabel(currentChallenge.target_metric) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>+{currentChallenge?.reward_points} pts</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">
                      {activeTab === "upcoming" ? "Starts" : activeTab === "completed" ? "Ended" : "Ends In"} {currentChallenge && formatDate(
                        activeTab === "upcoming" ? currentChallenge.start_date : currentChallenge.end_date
                      )}
                    </span>
                    <span className="sm:hidden">
                      {currentChallenge && formatDate(
                        activeTab === "upcoming" ? currentChallenge.start_date : currentChallenge.end_date
                      )}
                    </span>
                  </div>
                </div>

                {/* Countdown Timer */}
                {activeTab === "running" && currentChallenge && (
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2 sm:gap-3 inline-flex">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Ends in:</span>
                      <span className="tabular-nums tracking-wide font-mono">{timeLeft}</span>
                    </div>
                  </div>
                )}

                {activeTab === "upcoming" && currentChallenge && (
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base md:text-lg font-semibold flex items-center gap-2 sm:gap-3 inline-flex">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Starts in:</span>
                      <span className="tabular-nums tracking-wide font-mono">
                        <UpcomingCountdown startDate={currentChallenge.start_date} />
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-0">
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs sm:text-sm sm:size-lg w-full sm:w-auto"
                    onClick={() => currentChallenge && handleChallengeSelect(currentChallenge.id.toString())}
                  >
                    {selectedChallenge === currentChallenge?.id.toString() ? (
                      <>
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">{activeTab === "completed" ? "Viewing Results" : "Viewing Leaderboard"}</span>
                        <span className="sm:hidden">{activeTab === "completed" ? "Viewing" : "Viewing"}</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">{activeTab === "completed" ? "View Results" : "View Leaderboard"}</span>
                        <span className="sm:hidden">{activeTab === "completed" ? "View" : "View"}</span>
                      </>
                    )}
                  </Button>

                  {/* View Activity Button - Only show if user has joined */}
                  {currentChallenge?.user_joined && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs sm:text-sm sm:size-lg w-full sm:w-auto hover:scale-105 transition-transform"
                      onClick={() => {
                        setActivityChallenge(currentChallenge);
                        setShowActivity(true);
                      }}
                    >
                      <History className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">View My Activity</span>
                      <span className="sm:hidden">Activity</span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 !text-white bg-white/10 hover:bg-white/20 hover:!text-white text-xs sm:text-sm sm:size-lg w-full sm:w-auto hover:scale-105 transition-transform"
                    onClick={nextSlide}
                    style={{ color: 'white' }}
                  >
                    <span className="hidden sm:inline !text-white" style={{ color: 'white' }}>Next Challenge</span>
                    <span className="sm:hidden !text-white" style={{ color: 'white' }}>Next</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 !text-white" style={{ color: 'white' }} />
                  </Button>

                  {activeTab === "running" && currentChallenge && !currentChallenge.user_joined && (
                    <Button
                      size="sm"
                      data-tutorial-target="join-button"
                      className="group relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg border-0 font-semibold overflow-hidden transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm sm:size-lg w-full sm:w-auto hover:scale-110 hover:shadow-2xl"
                      onClick={handleJoinChallenge}
                      disabled={isJoining}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <span className="relative z-10 flex items-center">
                        {isJoining ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="hidden sm:inline">Joining...</span>
                            <span className="sm:hidden">Joining...</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 transition-transform group-hover:scale-110 animate-pulse" />
                            <span className="hidden sm:inline">Join Challenge</span>
                            <span className="sm:hidden">Join</span>
                            <AudioWaveformIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
                          </>
                        )}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="relative mt-4 sm:mt-6">
          {/* Navigation Arrows */}
          {currentChallenges.length > 4 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-10 bg-background border shadow-lg hover:bg-muted h-7 w-7 sm:h-10 sm:w-10"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-10 bg-background border shadow-lg hover:bg-muted h-7 w-7 sm:h-10 sm:w-10"
                onClick={nextSlide}
                disabled={currentSlide === currentChallenges.length - 1}
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </>
          )}

          {/* Slider Container with Centering Logic */}
          <div className="flex justify-center overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }} data-tutorial-target="challenges-list">
            <div
              className="flex gap-2 sm:gap-3 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(calc(18% - ${(currentSlide * 150)}px))`
              }}
            >
              {currentChallenges.map((challenge, index) => {
                const isSelected = index === currentSlide;
                const isActive = selectedChallenge === challenge.id.toString();
                const isFirstChallenge = index === 0;

                return (
                  <button
                    key={challenge.id}
                    data-tutorial-target={isFirstChallenge ? "challenge-card" : undefined}
                    className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 md:p-4 m-2 sm:m-3 md:m-4 rounded-lg sm:rounded-xl transition-all duration-300 min-w-[90px] sm:min-w-[100px] md:min-w-[120px] flex-shrink-0 relative ${isSelected
                      ? activeTab === "running"
                        ? "bg-primary text-primary-foreground shadow-xl scale-105 sm:scale-110 border-2 border-primary"
                        : activeTab === "upcoming"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl scale-105 sm:scale-110 border-2 border-blue-400"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl scale-105 sm:scale-110 border-2 border-green-400"
                      : "bg-muted/50 hover:bg-muted border border-muted hover:border-muted-foreground/30"
                      } ${isActive ? "ring-2 ring-yellow-400 ring-offset-1 sm:ring-offset-2" : ""}`}
                    onClick={() => goToSlide(index)}
                  >
                    {/* Challenge Icon and Name */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 w-full">
                      <div
                        className={`p-0.5 sm:p-1 rounded-lg flex-shrink-0 ${isSelected
                          ? "bg-white/20"
                          : "bg-muted-foreground/10"
                          }`}
                      >
                        {getChallengeIcon(challenge.challenge_type)}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-medium line-clamp-2 text-center ${isSelected ? "text-white" : "text-foreground"
                          }`}
                      >
                        {challenge.name}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted-foreground/20 rounded-full h-1 sm:h-1.5">
                      <div
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-700 ${isSelected ? "bg-white" :
                          activeTab === "running" ? "bg-green-500" :
                            activeTab === "upcoming" ? "bg-blue-400" :
                              "bg-green-400"
                          }`}
                        style={{
                          width: `${Math.min(
                            challenge.completion_rate,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between w-full text-[10px] sm:text-xs">
                      <span
                        className={
                          isSelected
                            ? "text-white/80"
                            : "text-muted-foreground"
                        }
                      >
                        {Math.round(challenge.completion_rate)}%
                      </span>
                      <span
                        className={
                          isSelected
                            ? "text-white/80"
                            : "text-muted-foreground"
                        }
                      >
                        {challenge.participants} 👥
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    {isActive && (
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400 animate-pulse" />
                    )}

                    {/* Status Badge */}
                    <div
                      className={`absolute -top-1 -left-1 sm:-top-2 sm:-left-2 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${isSelected
                        ? activeTab === "upcoming" ? "bg-cyan-400 text-white" :
                          activeTab === "completed" ? "bg-green-400 text-white" :
                            "bg-yellow-500 text-white"
                        : activeTab === "upcoming" ? "bg-cyan-500/10 text-cyan-700" :
                          activeTab === "completed" ? "bg-green-500/10 text-green-700" :
                            "bg-yellow-500/10 text-yellow-700"
                        }`}
                    >
                      {activeTab === "upcoming" ? (
                        <>
                          <Hourglass className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Soon</span>
                        </>
                      ) : activeTab === "completed" ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Ended</span>
                        </>
                      ) : (
                        `+${challenge.reward_points}`
                      )}
                    </div>

                    {/* Reward Badge for running challenges */}
                    {/* {activeTab === "running" && (
                      <div
                        className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                          isSelected
                            ? "bg-yellow-500 text-white"
                            : "bg-yellow-500/10 text-yellow-700"
                        }`}
                      >
                        +{challenge.reward_points}
                      </div>
                    )} */}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Indicators */}
          {currentChallenges.length > 4 && (
            <div className="flex justify-center mt-4 gap-1.5">
              {Array.from({ length: Math.ceil(currentChallenges.length / 4) }).map(
                (_, pageIndex) => (
                  <button
                    key={pageIndex}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${Math.floor(currentSlide / 4) === pageIndex
                      ? activeTab === "running" ? "bg-primary scale-125" :
                        activeTab === "upcoming" ? "bg-blue-500 scale-125" :
                          "bg-green-500 scale-125"
                      : "bg-muted hover:bg-muted-foreground/50"
                      }`}
                    onClick={() => {
                      const newIndex = pageIndex * 4;
                      setCurrentSlide(
                        Math.min(newIndex, currentChallenges.length - 1)
                      );
                    }}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="w-full py-3 sm:py-4 md:py-8 relative">
      <Seo
        title="Challenges Leaderboard"
        description="Compete in challenges and track your progress on the leaderboard. Join running challenges, see upcoming events, and view completed competitions."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col items-center">
        {/* Tutorial & Help Button with mascot */}
        <div className="w-full px-4 mb-4 flex justify-between items-center gap-2">
          {/* Fun Mascot Helper */}
          {/* <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl px-3 py-2 animate-float">
            <div className="text-2xl animate-wiggle">🦄</div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-purple-700">Challenge Unicorn</p>
              <p className="text-xs text-purple-600">Your guide to success!</p>
            </div>
          </div> */}

          {/* <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTutorial(true)}
            className="border-2 border-purple-400 text-purple-700 hover:bg-purple-50 font-semibold hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            <span className="hidden sm:inline">How Challenges Work</span>
            <span className="sm:hidden">Tutorial</span>
          </Button> */}

          <Button size="sm" variant="outline" onClick={() => setShowTutorial(true)} className=" relative font-semibold text-purple-700 hover:scale-110 transition-transform " > <span className="absolute inset-0 rounded-md border-4 border-purple-500 animate-ping opacity-50"></span> <span className="absolute inset-0 rounded-md border-2 border-purple-400"></span> <Sparkles className="w-4 h-4 mr-2 animate-pulse" /> <span className="hidden sm:inline">How Challenges Work</span> <span className="sm:hidden">Tutorial</span> </Button>
        </div>

        <div className="w-full mb-6 sm:mb-10 px-4">
          <TabsList className="w-full grid grid-cols-3 bg-gradient-to-r from-blue-600 to-pink-400 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg gap-1 sm:gap-2 relative h-auto min-h-[44px]">
            <TabsTrigger
              value="running"
              className="flex items-center justify-center text-xs sm:text-base px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 font-bold tracking-wide whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:relative data-[state=inactive]:text-white/90 data-[state=inactive]:flex data-[state=inactive]:items-center data-[state=inactive]:justify-center hover:text-white hover:bg-white/20 transition-all rounded-lg cursor-pointer h-full"
            >
              Running
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex items-center justify-center text-xs sm:text-base px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 font-bold tracking-wide whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:relative data-[state=inactive]:text-white/90 data-[state=inactive]:flex data-[state=inactive]:items-center data-[state=inactive]:justify-center hover:text-white hover:bg-white/20 transition-all rounded-lg cursor-pointer h-full"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center justify-center text-xs sm:text-base px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 font-bold tracking-wide whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:relative data-[state=inactive]:text-white/90 data-[state=inactive]:flex data-[state=inactive]:items-center data-[state=inactive]:justify-center hover:text-white hover:bg-white/20 transition-all rounded-lg cursor-pointer h-full"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Running Challenges Tab */}
        <TabsContent value="running" className="w-full">
          {challengesLoading ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Slider Skeleton */}
              <Skeleton className="w-full h-80 md:h-96 rounded-2xl" />

              {/* Selected Challenge Info Skeleton */}
              <div className="space-y-4">
                <Skeleton className="w-full h-48 rounded-xl" />
                <div className="flex justify-center">
                  <Skeleton className="h-14 w-64 rounded-xl" />
                </div>
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 sm:h-32 rounded-xl" />
                ))}
              </div>

              {/* Table Skeleton */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="rounded-lg border p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : challenges.length > 0 ? (
            <>
              {renderChallengeSlider()}

              {/* Selected Challenge Display */}
              {selectedChallengeData && selectedChallenge !== "all" && (
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl flex-shrink-0">
                            {getChallengeIcon(selectedChallengeData.challenge_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate">
                              {selectedChallengeData.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                              {selectedChallengeData.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Progress
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {Math.round(selectedChallengeData.completion_rate)}%
                          </div>
                          <Progress
                            value={selectedChallengeData.completion_rate}
                            className="w-full sm:w-32 mt-1 h-1.5 sm:h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Countdown Timer for Selected Challenge */}
              {selectedChallenge !== "all" && selectedChallengeData && (
                <div className="flex items-center justify-center my-3 sm:my-4">
                  <div
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shadow-lg text-sm sm:text-base md:text-lg font-semibold
                      ${(() => {
                        const left = (new Date(selectedChallengeData.end_date).getTime() - Date.now());
                        return left < 1000 * 60 * 60 * 24 ? "bg-pink-100 text-pink-600 border-2 border-pink-300 animate-pulse" : "bg-gradient-to-r from-blue-200 to-blue-100 text-blue-800 border-2 border-blue-300"
                      })()}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                      <span className="hidden sm:inline">Ends in:</span>
                      <span className="tabular-nums tracking-wide">{timeLeft}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0 opacity-70" />
                      <span>{formatDate(selectedChallengeData.end_date)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Content */}
              {renderLeaderboardTable(participants, userPosition, stats, loading, false)}

              {/* Community Champions Section - Users who completed all challenges */}
              {(communityCompleters.length > 0 || communityCompletersLoading) && (
                <div className="mt-8 sm:mt-10">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        🏆 Community Champions
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Heroes who completed ALL challenges
                      </p>
                    </div>
                    {totalCommunityCompleters > 0 && (
                      <Badge className="ml-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                        {totalCommunityCompleters} Champion{totalCommunityCompleters !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {communityCompletersLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {communityCompleters.map((completer, index) => (
                        <Card
                          key={completer.user_id}
                          className="relative overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition-all"
                        >
                          {/* Champion Badge */}
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-xs font-bold">
                              <Crown className="w-3 h-3" />
                              #{index + 1}
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <UserIdentity
                                avatar_id={completer.avatar_id}
                                profile_image_path={completer.profile_image_path}
                                nickname={completer.nickname}
                                ripple_id={completer.ripple_id}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  Challenges
                                </span>
                                <span className="font-semibold text-green-600">
                                  {completer.completed_challenges}/{completer.total_challenges}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  Points Earned
                                </span>
                                <span className="font-bold text-orange-600">
                                  +{completer.total_points_earned}
                                </span>
                              </div>

                              <Progress value={100} className="h-1.5 bg-yellow-100" />

                              <div className="text-center pt-1">
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  All Challenges Complete!
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No Running Challenges
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  There are no active challenges at the moment. Check back later for new competitions!
                </p>
                <Button
                  onClick={() => setActiveTab("upcoming")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Upcoming Challenges
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Upcoming Challenges Tab */}
        <TabsContent value="upcoming" className="w-full overflow-visible">
          {upcomingLoading ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Slider Skeleton */}
              <Skeleton className="w-full h-80 md:h-96 rounded-2xl" />

              {/* Selected Challenge Info Skeleton */}
              <div className="space-y-4">
                <Skeleton className="w-full h-48 rounded-xl" />
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 sm:h-32 rounded-xl" />
                ))}
              </div>
            </div>
          ) : upcomingChallenges.length > 0 ? (
            <>
              {renderChallengeSlider()}

              {/* Selected Upcoming Challenge Details */}
              {currentChallenge && (
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 overflow-visible">
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <div className="p-2 sm:p-3 bg-blue-100 rounded-xl flex-shrink-0">
                            {getChallengeIcon(currentChallenge.challenge_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 break-words">
                              {currentChallenge.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-blue-600/80 mt-1 break-words">
                              {currentChallenge.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                          <div className="text-xs sm:text-sm text-blue-600 mb-1">Starts In</div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-700 font-mono break-words">
                            <UpcomingCountdown startDate={currentChallenge.start_date} />
                          </div>
                          <div className="text-xs sm:text-sm text-blue-600 mt-1 break-words">
                            on {formatDate(currentChallenge.start_date)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <Hourglass className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No Upcoming Challenges
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Check back later for new challenges! We're always cooking up exciting new competitions.
                </p>
                <Button
                  onClick={() => setActiveTab("running")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Running Challenges
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Completed Challenges Tab */}
        <TabsContent value="completed" className="w-full overflow-visible">
          {completedLoading ? (
            <div className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-lg text-muted-foreground">Loading completed challenges...</p>
            </div>
          ) : completedChallenges.length > 0 ? (
            <>
              {renderChallengeSlider()}

              {/* Completed Challenges Leaderboard */}
              {renderLeaderboardTable(completedParticipants, completedUserPosition, completedStats, completedLoadingData, true)}
            </>
          ) : (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">No Completed Challenges</h3>
              <p className="text-muted-foreground text-lg">Completed challenges will appear here once they finish.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Congratulations Popup */}
      <ChallengeJoinSuccess
        open={showCongrats}
        onOpenChange={setShowCongrats}
        challenge={joinedChallenge}
        userProgress={0}
      />

      {/* Tutorial */}
      <ChallengeTutorial
        open={showTutorial}
        onOpenChange={setShowTutorial}
      />

      {/* Activity Viewer */}
      <ChallengeActivityViewer
        open={showActivity}
        onOpenChange={setShowActivity}
        challenge={activityChallenge}
      />
    </main>
  );
}

// Countdown component for upcoming challenges
function UpcomingCountdown({ startDate }: { startDate: string }) {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    function update() {
      const now = new Date();
      const start = new Date(startDate);
      const diff = start.getTime() - now.getTime();
      if (diff <= 0) setTime("00:00:00");
      else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTime(`${d > 0 ? d + 'd ' : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [startDate]);
  return <span className="tabular-nums tracking-wide">{time}</span>;
}