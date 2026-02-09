import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { 
  Trophy, Heart, TrendingUp, Star, Sparkles, Gift, Target, Users, 
  BookOpen, UserPlus, RefreshCw, Activity, CheckCircle, Clock, 
  Award, Zap, TrendingDown, ArrowUp, ArrowDown, Minus,
  BarChart3, TargetIcon, Calendar, AwardIcon,
  UserCheck, UserX, PieChart, TrendingUpIcon, HelpCircle, PlayCircle
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { useUserProfile } from "@/hooks/useUserProfile";
import char2 from "@/assets/characters/char2.png";
import { GamificationDashboard } from "@/components/gamification/GamificationDashboard";
import ChallengesDashboard from "@/components/gamification/ChallengesDashboard";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherDashboardTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import TeacherDashboardTutorial from "@/components/TeacherDashboardTutorial";
import DailyActivityChecklist from "@/components/gamification/DailyActivityChecklist";

// Enhanced Types
interface DashboardData {
  period: {
    start: string;
    end: string;
    human_readable: string;
  };
  filters: {
    classroom_id: number | null;
    classroom_name: string;
  };
  summary_cards: {
    [key: string]: {
      count: number | string;
      label: string;
      icon: string;
      color: string;
      trend: string | number;
      description: string;
    };
  };
  analytics: {
    student_analytics: {
      total_students: number;
      active_students: number;
      inactive_students: number;
      students_with_points: number;
      students_with_badges: number;
      consent_verified: number;
      consent_pending: number;
      completion_rate: number;
      student_growth: number;
      activity_trend: string;
      completion_trend: string;
      top_performer: {
        name: string;
        points: number;
        profile_image_path: string | null;
        avatar_id: number | null;
      };
    };
    ripple_analytics: {
      total_ripples: number;
      active_students: number;
      avg_per_student: number;
      total_points: string;
      growth_rate: number;
      engagement_trend: string;
      daily_average: number;
      weekly_high: {
        count: number;
        week_start: string;
        week_end: string;
        week_label: string;
      };
      most_popular_category: string;
      category_distribution: Array<{
        name: string;
        count: number;
      }>;
      top_ripple_creators: Array<{
        full_name: string;
        nickname: string;
        ripple_count: number;
      }>;
      peak_day: string;
    };
    points_analytics: {
      total_points: string;
      average_points: number;
      max_points: number;
      min_points: number;
      points_per_student: number;
      recent_activities: Array<any>;
      points_by_type: Array<any>;
      top_points_earners: Array<{
        id: number;
        full_name: string;
        nickname: string;
        profile_image_path: string | null;
        total_points: number;
      }>;
      points_growth: number;
      total_activities: number;
    };
    badge_analytics: {
      total_badges_earned: number;
      badge_distribution: Array<any>;
      recent_badges: Array<any>;
      top_badge_earners: Array<any>;
      most_popular_badge: any;
      unique_badges_earned: number;
      badge_growth: number;
    };
    challenge_analytics: {
      active_challenges: Array<any>;
      recent_completions: Array<any>;
      total_challenges: number;
      active_challenges_count: number;
      total_participants: number;
      total_completions: number;
      overall_completion_rate: number;
    };
    streak_analytics: {
      average_streak: number;
      longest_streak: number;
      shortest_streak: number;
      impressive_streaks: number;
      streak_distribution: Array<{
        current_streak: number;
        longest_streak: number;
        last_action_date: string | null;
        full_name: string;
        nickname: string;
        profile_image_path: string | null;
      }>;
      top_streak_holders: Array<any>;
      total_tracked_streaks: number;
      streak_trend: string;
    };
    engagement_metrics: {
      active_students: number;
      total_students: number;
      engagement_rate: number;
      inactive_students: number;
      avg_daily_activities: number;
      engagement_level: string;
    };
  };
  recent_activities: {
    items: Array<any>;
    total: number;
    ripple_count: number;
    badge_count: number;
    latest_timestamp: string | null;
  };
  pending_reviews_list: Array<any>;
  leaderboards: {
    points_leaders: Array<any>;
    badge_leaders: Array<any>;
    streak_leaders: Array<any>;
    ripple_leaders: Array<any>;
  };
  quick_stats: {
    total_points_awarded: string;
    total_badges_earned: number;
    total_challenges: number;
    active_challenges: number;
    avg_streak_length: number;
    engagement_rate: number;
    top_performing_student: {
      name: string;
      points: number;
      profile_image_path: string | null;
      avatar_id: number | null;
    };
    most_active_day: string;
    most_popular_category: string;
  };
}

export default function TeacherDashboardNew() {
  const userProfile = useUserProfile();
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_dashboard_tutorial_completed",
    steps: teacherDashboardTutorialSteps,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showTeacherDashboardTutorial, setShowTeacherDashboardTutorial] = useState(false);
  const [showDailyTasks, setShowDailyTasks] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Use refs to track the actual state to prevent closure issues
  const modalStateRef = useRef({
    dailyTasks: false,
    dashboardTutorial: false,
    helpTutorial: false
  });

  // Update ref when state changes
  useEffect(() => {
    modalStateRef.current = {
      dailyTasks: showDailyTasks,
      dashboardTutorial: showTeacherDashboardTutorial,
      helpTutorial: isActive
    };
  }, [showDailyTasks, showTeacherDashboardTutorial, isActive]);

  // Debounced click handler with proper modal management
  const debouncedClick = useCallback((handler: () => void) => {
    if (isButtonDisabled) return;
    
    setIsButtonDisabled(true);
    
    // Close all other modals first
    setShowDailyTasks(false);
    setShowTeacherDashboardTutorial(false);
    
    // Small delay to ensure modals are closed before opening new one
    setTimeout(() => {
      handler();
      setTimeout(() => setIsButtonDisabled(false), 300);
    }, 50);
  }, [isButtonDisabled]);

  // Handle opening "How to Start" tutorial
  const handleHowToStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    debouncedClick(() => {
      console.log("Opening Teacher Dashboard Tutorial");
      setShowTeacherDashboardTutorial(true);
    });
  }, [debouncedClick]);

  // Handle opening help tutorial
  const handleHelpTutorial = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    debouncedClick(() => {
      console.log("Opening Help Tutorial");
      startTutorial();
    });
  }, [debouncedClick, startTutorial]);

  // Handle daily tasks with explicit control
  const handleDailyTasksToggle = useCallback((isOpen: boolean) => {
    console.log("Daily Tasks Toggle:", isOpen);
    
    if (isOpen) {
      // Close other modals when opening daily tasks
      setShowTeacherDashboardTutorial(false);
    }
    setShowDailyTasks(isOpen);
  }, []);

  // Standalone daily tasks button handler
  const handleDailyTasksClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    debouncedClick(() => {
      console.log("Opening Daily Tasks");
      setShowDailyTasks(true);
    });
  }, [debouncedClick]);

  const fetchTeacherDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const tokenType = localStorage.getItem("tokenType") || "Bearer";
      const headers = token ? { Authorization: `${tokenType} ${token}` } : {};

      const response = await apiFetch<{ success: boolean; data: DashboardData }>(
        "/teacher/dashboard/overview", 
        { method: "GET", headers }
      );

      if (response.success && response.data) {
        setDashboardData(response.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        console.error("Failed to load dashboard data");
      }

    } catch (error) {
      console.error("Error fetching teacher dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacherDashboard();
  }, [fetchTeacherDashboard]);

  const getTrendIcon = (trend: string | number) => {
    if (typeof trend === 'number') {
      return trend > 0 ? <ArrowUp className="h-4 w-4 text-green-600" /> : 
             trend < 0 ? <ArrowDown className="h-4 w-4 text-red-600" /> : 
             <Minus className="h-4 w-4 text-gray-500" />;
    }
    
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string | number) => {
    if (typeof trend === 'number') {
      return trend > 0 ? `+${trend}%` : `${trend}%`;
    }
    return trend;
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600',
      green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-600',
      pink: 'from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-600',
      purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-600',
      yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-600',
      orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-600',
      teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-600'
    };
    return colors[color] || colors.blue;
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      users: Users,
      activity: Activity,
      heart: Heart,
      'trending-up': TrendingUp,
      clock: Clock,
      'check-circle': CheckCircle,
      trophy: Trophy,
      award: Award,
      zap: Zap,
      star: Star,
      'bar-chart': BarChart3,
      target: TargetIcon,
      calendar: Calendar,
      'award-icon': AwardIcon,
      'user-check': UserCheck,
      'user-x': UserX,
      'pie-chart': PieChart
    };
    return icons[iconName] || Users;
  };

  const getEngagementLevelColor = (level: string) => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      moderate: 'text-yellow-600 bg-yellow-100',
      low: 'text-orange-600 bg-orange-100',
      very_low: 'text-red-600 bg-red-100'
    };
    return colors[level as keyof typeof colors] || colors.moderate;
  };

  // Calculate engagement insights
  const engagementInsights = useMemo(() => {
    if (!dashboardData) return null;
    
    const { engagement_metrics, student_analytics } = dashboardData.analytics;
    const totalStudents = student_analytics.total_students;
    const activeStudents = engagement_metrics.active_students;
    const engagementRate = engagement_metrics.engagement_rate;

    if (totalStudents === 0) return null;

    const inactivePercentage = ((totalStudents - activeStudents) / totalStudents) * 100;

    return {
      engagementRate,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
      inactivePercentage,
      level: engagement_metrics.engagement_level
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading your enhanced classroom dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">There was a problem loading your dashboard data.</p>
          <Button onClick={fetchTeacherDashboard} variant="hero">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { 
    summary_cards, 
    analytics,
    recent_activities, 
    pending_reviews_list,
    leaderboards,
    quick_stats,
    period,
    filters
  } = dashboardData;

  const {
    student_analytics,
    ripple_analytics,
    points_analytics,
    badge_analytics,
    streak_analytics,
    engagement_metrics
  } = analytics;

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Seo
        title="Enhanced Teacher Dashboard — Pass The Ripple"
        description="Comprehensive classroom management and student progress tracking"
        canonical={`${window.location.origin}/teacher`}
      />

      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="teacher_dashboard_tutorial_completed"
      />

      {/* Teacher Dashboard Tutorial */}
      <TeacherDashboardTutorial
        open={showTeacherDashboardTutorial}
        onOpenChange={setShowTeacherDashboardTutorial}
      />

      {/* Daily Activity Checklist - Fixed with proper z-index and event handling */}
      <div className="fixed z-50" style={{display:"none"}}>
        <DailyActivityChecklist 
          isOpen={showDailyTasks} 
          onOpenChange={handleDailyTasksToggle}
        />
      </div>

      <main className="container py-8 relative">
        {/* Floating decorations */}
        <Sparkles className="absolute top-10 left-10 text-primary/20 w-8 h-8 animate-pulse" />
        <Sparkles className="absolute top-32 right-20 text-accent/20 w-6 h-6 animate-pulse delay-700" />

        <div className="space-y-8">
          {/* Enhanced Header - Redesigned for better space utilization */}
          <div className="flex items-start justify-between gap-4 lg:gap-6">
            {/* Left Column: Welcome Section */}
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary">
                Welcome, Teacher {userProfile?.nickname ?? ""}!
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                You're guiding <strong>{student_analytics?.total_students ?? 0} students</strong> who've created{' '}
                <strong>{ripple_analytics?.total_ripples ?? 0} acts of kindness</strong>!
              </p>
            </div>

            {/* Right Column: Action Buttons and Info */}
            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* How to Start Button */}
                <Button
                  onClick={handleHowToStart}
                  variant="default"
                  size="sm"
                  disabled={isButtonDisabled}
                  className="rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold shadow-md flex items-center gap-2 flex-shrink-0"
                  title="Learn how to get started with the dashboard"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">How to Start</span>
                </Button>
                
                {/* Daily Tasks Button - Fixed to use our custom handler */}
                <Button
                  onClick={handleDailyTasksClick}
                  variant="outline"
                  size="sm"
                  disabled={isButtonDisabled}
                  className="rounded-full border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700 font-semibold shadow-md flex items-center gap-2"
                  title="View your daily tasks"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Daily Tasks</span>
                </Button>
                
                {/* Help Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHelpTutorial}
                  disabled={isButtonDisabled}
                  className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
                  title="Take a tour of this page"
                  aria-label="Start tutorial"
                >
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Help</span>
                </Button>
                
                {/* Refresh Button */}
                <Button
                  onClick={fetchTeacherDashboard}
                  disabled={loading || isButtonDisabled}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
              
              {/* Period, Classroom, and Last Updated Info */}
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {period.human_readable}
                </Badge>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {filters.classroom_name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Last updated: {lastUpdated}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rest of your dashboard content remains the same */}
          {/* Quick Actions */}
          <Card className="shadow-elevated border-primary/10 bg-card/95 backdrop-blur relative overflow-hidden">
            <img
              src={char2}
              alt="Action character"
              className="hidden sm:block absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 opacity-20"
            />
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-gradient-primary">Quick Actions</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your classroom and track progress efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <Link to="/teacher/add-student" className="flex-1 sm:flex-none">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto shadow-glow text-sm sm:text-base">
                    <UserPlus className="mr-2 w-4 h-4" />
                    Add Student
                  </Button>
                </Link>
                <Link to="/teacher/manage-students" className="flex-1 sm:flex-none">
                  <Button variant="magical" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                    <Users className="mr-2 w-4 w-4" />
                    Manage Students
                  </Button>
                </Link>
                <Link to="/teacher/hero-wall" className="flex-1 sm:flex-none" data-tutorial-target="pending-reviews">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 text-sm sm:text-base">
                    <BookOpen className="mr-2 w-4 w-4" />
                    Review Stories ({pending_reviews_list.length})
                  </Button>
                </Link>
                <Link to="/teacher/leaderboards" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-secondary/30 hover:bg-secondary/10 text-sm sm:text-base">
                    <Trophy className="mr-2 w-4 w-4" />
                    Leaderboards
                  </Button>
                </Link>
                <Link to="/teacher/reports" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-accent/30 hover:bg-accent/10 text-sm sm:text-base">
                    <Activity className="mr-2 w-4 w-4" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" data-tutorial-target="dashboard-stats">
            {Object.entries(summary_cards).map(([key, card]) => {
              const IconComponent = getIconComponent(card.icon);
              const colorClasses = getColorClasses(card.color);
              
              return (
                <Card key={key} className={`bg-gradient-to-br ${colorClasses} shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      <div className="flex items-center gap-1">
                        {getTrendIcon(card.trend)}
                        <span className="text-xs font-medium">
                          {getTrendText(card.trend)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold mb-1">{card.count}</div>
                    <div className="text-xs sm:text-sm font-medium">{card.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{card.description}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <GamificationDashboard />

          {/* Main Analytics Grid */}
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Student Engagement Overview */}
            <Card className="lg:col-span-2 xl:col-span-1 shadow-elevated border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Student Engagement
                </CardTitle>
                <CardDescription>
                  Classroom participation overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {engagement_metrics.active_students}
                    </div>
                    <div className="text-sm text-green-600">Active Students</div>
                    <div className="text-xs text-green-500 mt-1">
                      {engagement_metrics.engagement_rate}% Engagement
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {engagement_metrics.inactive_students}
                    </div>
                    <div className="text-sm text-orange-600">Inactive Students</div>
                    <div className="text-xs text-orange-500 mt-1">
                      Need Attention
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Engagement Level</span>
                    <Badge className={getEngagementLevelColor(engagement_metrics.engagement_level)}>
                      {engagement_metrics.engagement_level.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Daily Activities</span>
                    <span className="font-semibold">{engagement_metrics.avg_daily_activities}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Consent Verified</span>
                    <span className="font-semibold">
                      {student_analytics.consent_verified}/{student_analytics.total_students}
                    </span>
                  </div>
                </div>

                {/* Engagement Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Class Engagement</span>
                    <span>{engagement_metrics.engagement_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${engagement_metrics.engagement_rate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ripple Analytics */}
            <Card className="shadow-elevated border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  Kindness Analytics
                </CardTitle>
                <CardDescription>
                  Acts of kindness and impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="text-xl font-bold text-pink-600">
                      {ripple_analytics.total_ripples}
                    </div>
                    <div className="text-xs text-pink-600">Total Acts</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-xl font-bold text-purple-600">
                      {ripple_analytics.avg_per_student}
                    </div>
                    <div className="text-xs text-purple-600">Avg per Student</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Daily Average</span>
                    <span className="font-semibold">{ripple_analytics.daily_average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly High</span>
                    <span className="font-semibold">{ripple_analytics.weekly_high.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Popular Category</span>
                    <span className="font-semibold">{ripple_analytics.most_popular_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Day</span>
                    <span className="font-semibold">{ripple_analytics.peak_day}</span>
                  </div>
                </div>

                {/* Growth Indicator */}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-xs">Growth Rate</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(ripple_analytics.growth_rate)}
                    <span className={`text-xs font-semibold ${
                      ripple_analytics.growth_rate > 0 ? 'text-green-600' : 
                      ripple_analytics.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {ripple_analytics.growth_rate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Points & Badges Overview */}
            <Card className="shadow-elevated border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Rewards Overview
                </CardTitle>
                <CardDescription>
                  Points and badges distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-xl font-bold text-yellow-600">
                      {points_analytics.total_points}
                    </div>
                    <div className="text-xs text-yellow-600">Total Points</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-xl font-bold text-purple-600">
                      {badge_analytics.total_badges_earned}
                    </div>
                    <div className="text-xs text-purple-600">Badges Earned</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Avg Points/Student</span>
                    <span className="font-semibold">{points_analytics.points_per_student}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students with Points</span>
                    <span className="font-semibold">{student_analytics.students_with_points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Badges</span>
                    <span className="font-semibold">{badge_analytics.unique_badges_earned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Growth</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(points_analytics.points_growth)}
                      <span className="text-xs font-semibold">{points_analytics.points_growth}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboards and Recent Activities */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Top Performers */}
            <Card className="shadow-elevated border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Shining Stars
                </CardTitle>
                <CardDescription>
                  {/* Leading students in your classroom */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Points Leaders */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Points Leaders
                    </h4>
                    <div className="space-y-2">
                      {leaderboards.points_leaders.slice(0, 3).map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{student.nickname}</span>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50">
                            {student.total_points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Streak Leaders */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Streak Leaders
                    </h4>
                    <div className="space-y-2">
                      {streak_analytics.top_streak_holders.slice(0, 3).map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{student.nickname}</span>
                          </div>
                          <Badge variant="outline" className="bg-orange-50">
                            {student.current_streak} days
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="shadow-elevated border-blue-200" data-tutorial-target="recent-activities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Recent Activities
                  <Badge variant="secondary" className="ml-auto">
                    {recent_activities.total} Total
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Latest student actions and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recent_activities.items.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {activity.type === 'badge' ? (
                          <Award className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Heart className="w-4 h-4 text-pink-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {activity.title || 'Kindness Action'}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {activity.description || 'Student performed an act of kindness'}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">
                            {activity.user?.nickname || 'Student'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.time_ago}
                          </span>
                        </div>
                      </div>
                      {activity.reward && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          {activity.reward.display}
                        </Badge>
                      )}
                    </div>
                  ))}

                  {recent_activities.items.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">💝</div>
                      <p className="text-gray-500 text-sm">No recent activities yet</p>
                      <p className="text-gray-400 text-xs">Student activities will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classroom Insights */}
          <Card className="shadow-elevated border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Classroom Insights
              </CardTitle>
              <CardDescription>
                Key metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600">
                    {quick_stats.engagement_rate}%
                  </div>
                  <div className="text-sm text-purple-600">Engagement Rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <TrendingUpIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">
                    {quick_stats.avg_streak_length}
                  </div>
                  <div className="text-sm text-green-600">Avg Streak</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                  <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-600">
                    {student_analytics.students_with_badges}
                  </div>
                  <div className="text-sm text-blue-600">Badge Earners</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                  <AwardIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-600">
                    {quick_stats.top_performing_student.points}
                  </div>
                  <div className="text-sm text-orange-600">Top Student Points</div>
                </div>
              </div>

              {/* Top Performer Spotlight */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Top Performer Spotlight
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-lg">
                    👑
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {student_analytics.top_performer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student_analytics.top_performer.points} points • Top of the class
                    </div>
                  </div>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    #1 Rank
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <ChallengesDashboard/>
        </div>
      </main>
    </div>
  );
}