import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Gift,
  Star,
  Flame,
  Users,
  Award,
  Activity,
  BarChart3,
  History,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/config/api";

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
  user_progress: number;
  completion_rate: number;
  is_completed: boolean;
  completed_at: string | null;
  days_remaining: number;
}

interface ActivityEntry {
  id: number;
  date: string;
  activity_type: string;
  progress_added: number;
  total_progress: number;
  description: string;
}

interface ChallengeActivityViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
}

export default function ChallengeActivityViewer({
  open,
  onOpenChange,
  challenge,
}: ChallengeActivityViewerProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && challenge) {
      fetchActivities();
    }
  }, [open, challenge]);

  const fetchActivities = async () => {
    if (!challenge) return;

    setLoading(true);
    try {
      // Simulated activity data - replace with actual API call
      // const response = await apiFetch(`/user/challenges/${challenge.id}/activities`);

      // For now, generate sample activities based on progress
      const sampleActivities: ActivityEntry[] = [];
      const progressPerDay = Math.ceil(challenge.user_progress / Math.max(1, 30 - challenge.days_remaining));

      for (let i = 0; i < Math.min(challenge.user_progress, 10); i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        sampleActivities.push({
          id: i + 1,
          date: date.toISOString(),
          activity_type: getActivityType(challenge.target_metric),
          progress_added: Math.floor(Math.random() * 3) + 1,
          total_progress: (i + 1) * progressPerDay,
          description: getActivityDescription(challenge.target_metric),
        });
      }

      setActivities(sampleActivities.reverse());
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityType = (metric: string) => {
    const types: Record<string, string> = {
      stories_created: "Story Created",
      likes_received: "Likes Earned",
      comments_received: "Comments Received",
      views_received: "Views Gained",
      login_streak: "Daily Login",
      referrals_completed: "Friend Invited",
    };
    return types[metric] || "Progress Made";
  };

  const getActivityDescription = (metric: string) => {
    const descriptions: Record<string, string[]> = {
      stories_created: [
        "Created an awesome story!",
        "Shared a cool adventure!",
        "Posted a fun moment!",
        "Made something amazing!",
      ],
      likes_received: [
        "Your story got likes!",
        "People loved your post!",
        "Your content is popular!",
      ],
      comments_received: [
        "Got comments on your story!",
        "Friends are talking about your post!",
      ],
    };
    const list = descriptions[metric] || ["Made progress!"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const getChallengeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      creation: <Zap className="w-5 h-5" />,
      engagement: <Users className="w-5 h-5" />,
      growth: <TrendingUp className="w-5 h-5" />,
      consistency: <Flame className="w-5 h-5" />,
      milestone: <Trophy className="w-5 h-5" />,
    };
    return icons[type] || <Target className="w-5 h-5" />;
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      stories_created: "Stories",
      likes_received: "Likes",
      comments_received: "Comments",
      views_received: "Views",
      login_streak: "Login Days",
      referrals_completed: "Referrals",
    };
    return labels[metric] || metric.replace(/_/g, " ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const completionPercentage = challenge && challenge.target_value > 0
    ? Math.min(((challenge.user_progress || 0) / challenge.target_value) * 100, 100)
    : 0;

  if (!challenge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-4 border-blue-400 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl text-white shadow-lg">
              {getChallengeIcon(challenge.challenge_type)}
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-2xl font-bold text-purple-900">
                {challenge.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">
                Track your amazing progress!
              </DialogDescription>
            </div>
            {challenge.is_completed && (
              <Badge className="bg-green-500 text-white animate-pulse">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Completed!
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 dark:bg-gray-800 mb-4 p-1">
            <TabsTrigger 
              value="progress" 
              className="font-bold text-base antialiased data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:bg-gray-700 dark:data-[state=inactive]:text-gray-200"
              style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              My Progress
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="font-bold text-base antialiased data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-50 dark:data-[state=inactive]:bg-gray-700 dark:data-[state=inactive]:text-gray-200"
              style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4 mt-4" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
            {/* Overall Progress Card */}
            <Card className="border-2 border-purple-300 bg-white" style={{ isolation: 'isolate' }}>
              <CardContent className="p-6" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', willChange: 'auto' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div className="flex-1" style={{ textRendering: 'optimizeLegibility' }}>
                    <h3 className="text-lg font-bold text-gray-900 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textShadow: '0 0 0 transparent' }}>Your Goal</h3>
                    <p className="text-sm text-gray-700 antialiased font-semibold" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textShadow: '0 0 0 transparent' }}>
                      {challenge.target_value} {getMetricLabel(challenge.target_metric)}
                    </p>
                  </div>
                  <div className="text-right" style={{ textRendering: 'optimizeLegibility' }}>
                    <div className="text-3xl font-bold text-purple-700 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 0 0 transparent' }}>
                      {isNaN(completionPercentage) || completionPercentage === null || completionPercentage === undefined
                        ? '0'
                        : completionPercentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={isNaN(completionPercentage) || completionPercentage === null || completionPercentage === undefined
                    ? 0
                    : Math.max(0, Math.min(100, completionPercentage))} 
                  className="h-4 bg-white mb-2" 
                />
                <div className="flex justify-between text-sm font-semibold text-gray-800 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 0 0 transparent' }}>
                  <span style={{ WebkitFontSmoothing: 'antialiased', textShadow: '0 0 0 transparent' }}>{challenge.user_progress || 0} done</span>
                  <span style={{ WebkitFontSmoothing: 'antialiased', textShadow: '0 0 0 transparent' }}>
                    {isNaN(challenge.target_value - (challenge.user_progress || 0)) || (challenge.target_value - (challenge.user_progress || 0)) < 0
                      ? '0'
                      : challenge.target_value - (challenge.user_progress || 0)} to go
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-2 border-green-300 bg-white" style={{ isolation: 'isolate' }}>
                <CardContent className="p-4" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-bold text-gray-900 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textShadow: '0 0 0 transparent' }}>Progress Made</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 0 0 transparent' }}>
                    {challenge.user_progress || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-300 bg-white" style={{ isolation: 'isolate' }}>
                <CardContent className="p-4" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textShadow: '0 0 0 transparent' }}>Days Left</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 0 0 transparent' }}>
                    {challenge.days_remaining || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-300 bg-white" style={{ isolation: 'isolate' }}>
                <CardContent className="p-4" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs font-bold text-gray-900 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textShadow: '0 0 0 transparent' }}>Reward Points</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 0 0 transparent' }}>
                    {challenge.reward_points || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-pink-300 bg-white" style={{ isolation: 'isolate' }}>
                <CardContent className="p-4" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-pink-600" />
                    <span className="text-xs font-bold text-gray-900 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textShadow: '0 0 0 transparent' }}>Your Rank</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-700 antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 0 0 transparent' }}>
                    {isNaN(completionPercentage) || completionPercentage === null || completionPercentage === undefined
                      ? 'N/A'
                      : Math.floor(completionPercentage / 10) + 1}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Motivational Message with Milestones */}
            <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white overflow-hidden relative" style={{ isolation: 'isolate' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              <CardContent className="p-5 text-center relative z-10" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                <div className="flex justify-center items-center gap-3 mb-3">
                  <Sparkles className="w-10 h-10 animate-spin-slow text-white" />
                  {completionPercentage >= 100 && <Trophy className="w-10 h-10 animate-bounce text-white" />}
                  {completionPercentage >= 50 && completionPercentage < 100 && <Star className="w-10 h-10 fill-yellow-200 text-yellow-200 animate-pulse" />}
                </div>
                <p className="text-lg font-bold mb-1 antialiased text-white" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)' }}>
                  {completionPercentage >= 100
                    ? "🎉 Amazing! You did it! 🎉"
                    : completionPercentage >= 75
                    ? "🌟 Almost there! You're so close!"
                    : completionPercentage >= 50
                    ? "💪 Great job! Keep it up!"
                    : completionPercentage >= 25
                    ? "🚀 You're making progress!"
                    : "✨ Every step counts! You got this!"}
                </p>
                <p className="text-sm font-semibold mb-3 antialiased text-white" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)' }}>
                  {completionPercentage >= 100
                    ? "You're a superstar! Claim your reward!"
                    : `Just ${isNaN(challenge.target_value - (challenge.user_progress || 0)) || (challenge.target_value - (challenge.user_progress || 0)) < 0
                      ? 0
                      : challenge.target_value - (challenge.user_progress || 0)} more to go!`}
                </p>

                {/* Milestones */}
                <div className="flex justify-center gap-2 mt-3">
                  {[25, 50, 75, 100].map((milestone) => (
                    <div
                      key={milestone}
                      className={`flex flex-col items-center transition-all duration-300 ${
                        completionPercentage >= milestone
                          ? "opacity-100 scale-110"
                          : "opacity-60 scale-90"
                      }`}
                      style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          completionPercentage >= milestone
                            ? "bg-yellow-300 text-yellow-900 shadow-lg animate-bounce-small"
                            : "bg-white/30 text-white border border-white/40"
                        }`}
                        style={{ textShadow: completionPercentage >= milestone ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        {completionPercentage >= milestone ? "✓" : milestone}
                      </div>
                      <span className="text-xs mt-1 text-white font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{milestone}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-3 mt-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Loading your activities...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {activities.map((activity, index) => (
                  <Card
                    key={activity.id}
                    className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white transform hover:scale-102 hover:-translate-y-1"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Activity Icon */}
                        <div className="bg-gradient-to-br from-blue-400 to-purple-400 p-2 rounded-lg text-white flex-shrink-0 animate-float">
                          <Zap className="w-5 h-5" />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-blue-900">
                              {activity.activity_type}
                            </span>
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              +{activity.progress_added}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(activity.date)}</span>
                            <span className="mx-1">•</span>
                            <span className="font-semibold text-purple-600">
                              Total: {activity.total_progress}
                            </span>
                          </div>
                        </div>

                        {/* Achievement Badge */}
                        {index === 0 && (
                          <div className="flex-shrink-0 relative">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                            <span className="absolute -top-1 -right-1 text-xs">✨</span>
                          </div>
                        )}
                        {index === activities.length - 1 && activities.length > 1 && (
                          <div className="flex-shrink-0">
                            <Trophy className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">
                  No Activities Yet
                </h3>
                <p className="text-gray-500">
                  Start making progress to see your activity log!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Close Button */}
        <div className="pt-4 border-t-2 border-purple-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Got It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
