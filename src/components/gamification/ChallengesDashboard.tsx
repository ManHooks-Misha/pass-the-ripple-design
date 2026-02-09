import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  Gift,
  Sparkles,
  Users,
  Image as ImageIcon,
  BarChart3,
  Activity,
  Compass
} from 'lucide-react';
import { apiFetch } from '@/config/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/utils/imageUrl';
import ChallengeActivityViewer from './ChallengeActivityViewer';

interface Challenge {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'upcoming' | 'completed';
  challenge_type: string;
  target_metric: string;
  target_value: number;
  reward_points: number;
  badge_criteria: string | null;
  image_path: string | null;
  participants: number;
  user_progress: number;
  completed_at: string | null;
  completion_rate: number;
  is_completed: boolean;
  days_remaining: number;
  is_public_before_live?: boolean;
  user_joined?: boolean;
}

interface ChallengeStats {
  total_challenges_attempted: number;
  completed_challenges: number;
  completion_rate: number;
  total_points_earned: number;
  active_challenges: number;
  favorite_type?: string;
}

export default function ChallengesDashboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Activity viewer state
  const [showActivity, setShowActivity] = useState(false);
  const [activityChallenge, setActivityChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
    fetchStats();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Challenge[] }>(
        '/user/challenges'
      );
      if (response.success) {
        console.log('All challenges from API:', response.data);
        console.log('Joined challenges:', response.data.filter(c => c.user_joined === true));
        setChallenges(response.data);
      } else {
        toast.error('Failed to load challenges');
      }
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: ChallengeStats }>(
        '/user/challenges/stats'
      );
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter to only show joined challenges
  const joinedChallenges = challenges.filter(c => c.user_joined === true);

  // Separate running and completed challenges
  const runningChallenges = joinedChallenges.filter(c =>
    c.status === 'active' && !c.is_completed
  );
  const completedChallenges = joinedChallenges.filter(c =>
    c.is_completed
  );

  // Debug logging
  console.log('=== CHALLENGE DASHBOARD DEBUG ===');
  console.log('Total challenges loaded:', challenges.length);
  console.log('Joined challenges count:', joinedChallenges.length);
  console.log('Running challenges:', runningChallenges.length);
  console.log('Completed challenges:', completedChallenges.length);

  const handleViewLeaderboard = (challengeId: number) => {
    navigate(`/challenges/${challengeId}/leaderboard`);
  };

  if (loading) {
    return (
      <Card className="shadow-elevated">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading challenges...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      

      {/* Challenges Tabs */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Your Challenges
          </CardTitle>
          <CardDescription className="text-base">
            Complete challenges to earn points and unlock exclusive badges
          </CardDescription>
        </CardHeader>
        <CardContent>
        
        {/* Stats Overview */}
        {stats && (
            <div className="grid gap-4 md:grid-cols-5">
            <Card className="shadow-elevated bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none">
                <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-8 h-8" />
                    <div>
                    <div className="text-3xl font-bold">{stats.active_challenges}</div>
                    <div className="text-sm opacity-90">Active Challenges</div>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="shadow-elevated bg-gradient-to-br from-green-500 to-emerald-500 text-white border-none">
                <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                    <div>
                    <div className="text-3xl font-bold">{stats.completed_challenges}</div>
                    <div className="text-sm opacity-90">Completed</div>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="shadow-elevated bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
                <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Target className="w-8 h-8" />
                    <div>
                    <div className="text-3xl font-bold">
                      {isNaN(stats.completion_rate) || stats.completion_rate === null || stats.completion_rate === undefined 
                        ? '0' 
                        : Math.round(stats.completion_rate)}%
                    </div>
                    <div className="text-sm opacity-90">Success Rate</div>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="shadow-elevated bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-none">
                <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-8 h-8" />
                    <div>
                    <div className="text-3xl font-bold">{stats.total_points_earned}</div>
                    <div className="text-sm opacity-90">Points Earned</div>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card className="shadow-elevated bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none">
                <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="w-8 h-8" />
                    <div>
                    <div className="text-3xl font-bold">{stats.total_challenges_attempted}</div>
                    <div className="text-sm opacity-90">Total Attempted</div>
                    </div>
                </div>
                </CardContent>
            </Card>
            </div>
        )}
          {/* Running Challenges Slider */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Running Challenges
            </h3>
            {runningChallenges.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-4 sm:gap-6" style={{ minWidth: 'min-content' }}>
                  {runningChallenges.map((challenge) => (
                    <div key={challenge.id} className="w-[320px] sm:w-[380px] flex-shrink-0">
                      <ChallengeCard
                        challenge={challenge}
                        onViewLeaderboard={handleViewLeaderboard}
                        onViewActivity={(challenge) => {
                          setActivityChallenge(challenge);
                          setShowActivity(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <Flame className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">No running challenges at the moment</p>
              </div>
            )}
          </div>

          {/* Completed Challenges Slider */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Completed Challenges
            </h3>
            {completedChallenges.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-4 sm:gap-6" style={{ minWidth: 'min-content' }}>
                  {completedChallenges.map((challenge) => (
                    <div key={challenge.id} className="w-[320px] sm:w-[380px] flex-shrink-0">
                      <ChallengeCard
                        challenge={challenge}
                        onViewLeaderboard={handleViewLeaderboard}
                        onViewActivity={(challenge) => {
                          setActivityChallenge(challenge);
                          setShowActivity(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">No completed challenges yet</p>
              </div>
            )}
          </div>

          {/* Empty State - Show only if no challenges at all */}
          {joinedChallenges.length === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={<Trophy className="w-16 h-16 text-purple-400" />}
                title="No Challenges Joined Yet!"
                description="You haven't joined any challenges yet. Browse all available challenges to find exciting ones and start earning points!"
                action={
                  <Button
                    onClick={() => navigate('/challenges-leaderboard')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Compass className="w-5 h-5 mr-2" />
                    Browse All Challenges
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Viewer */}
      <ChallengeActivityViewer
        open={showActivity}
        onOpenChange={setShowActivity}
        challenge={activityChallenge}
      />
    </div>
  );
}

function ChallengeCard({
  challenge,
  onViewLeaderboard,
  onViewActivity
}: {
  challenge: Challenge;
  onViewLeaderboard: (challengeId: number) => void;
  onViewActivity?: (challenge: Challenge) => void;
}) {
  const getTypeColor = (type: string) => {
    const colors = {
      creation: 'from-purple-500 to-pink-500',
      engagement: 'from-blue-500 to-cyan-500',
      growth: 'from-green-500 to-emerald-500',
      consistency: 'from-orange-500 to-red-500',
      milestone: 'from-yellow-500 to-orange-500',
    };
    return colors[type as keyof typeof colors] || colors.milestone;
  };

  const getChallengeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      creation: <Zap className="w-6 h-6" />,
      engagement: <Users className="w-6 h-6" />,
      growth: <TrendingUp className="w-6 h-6" />,
      consistency: <Flame className="w-6 h-6" />,
      milestone: <Trophy className="w-6 h-6" />,
    };
    return icons[type] || <Target className="w-6 h-6" />;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      stories_created: 'Stories Created',
      likes_received: 'Likes Received',
      comments_received: 'Comments Received',
      views_received: 'Views Received',
      login_streak: 'Login Streak',
      distance_traveled: 'Distance Traveled',
      referrals_completed: 'Referrals Completed',
      story_reach: 'Story Reach',
    };
    return labels[metric] || metric.replace(/_/g, ' ').toUpperCase();
  };

  const handleTrackProgress = async () => {
    try {
      const response = await apiFetch(`/user/challenges/${challenge.id}/track-progress`, {
        method: 'POST',
        body: JSON.stringify({ progress: 1 })
      });

      if (response.success) {
        toast.success('Progress updated!');
        window.location.reload();
      } else {
        toast.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error tracking progress:', error);
      toast.error('Failed to update progress');
    }
  };

  return (
    <Card className={`shadow-elevated hover:shadow-glow transition-all duration-300 group h-full flex flex-col ${challenge.is_completed ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardHeader className="relative pb-3 flex-shrink-0 p-4 sm:p-6">
        {/* Challenge Image/Icon Background */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getTypeColor(challenge.challenge_type)} opacity-10 rounded-bl-full`} />
        
        {/* Challenge Image */}
        {/* {challenge.image_path && ( */}
          <div className="relative h-32 sm:h-40 mb-4 rounded-lg overflow-hidden">
            <img 
              src={getImageUrl(challenge.image_path)} 
              alt={challenge.name}
              className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 ${
                  !challenge.image_path ? 'filter grayscale brightness-90 opacity-80' : ''
                }`}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        {/* )} */}

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-2 sm:gap-3 flex-1">
            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${getTypeColor(challenge.challenge_type)} text-white shadow-lg flex-shrink-0`}>
              <div className="w-5 h-5 sm:w-6 sm:h-6">
                {getChallengeIcon(challenge.challenge_type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {challenge.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-2">
                {challenge.description}
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 items-end">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none font-bold shadow-lg animate-pulse text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            JOINED
          </Badge>
          <Badge className={`text-xs ${
            challenge.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
            challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {challenge.status === 'active' && <Flame className="w-3 h-3 mr-1" />}
            {challenge.status === 'upcoming' && <Clock className="w-3 h-3 mr-1" />}
            {challenge.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            <span className="hidden sm:inline">{challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col p-4 sm:p-6">
        {/* Progress Section */}
        {challenge.status !== 'upcoming' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {getMetricLabel(challenge.target_metric)}
              </span>
              <span className="font-semibold">
                {challenge.user_progress || 0} / {challenge.target_value || 0}
                <span className="text-muted-foreground ml-1">
                  ({isNaN(challenge.completion_rate) || challenge.completion_rate === null || challenge.completion_rate === undefined 
                    ? '0' 
                    : Math.round(challenge.completion_rate)}%)
                </span>
              </span>
            </div>
            <Progress 
              value={isNaN(challenge.completion_rate) || challenge.completion_rate === null || challenge.completion_rate === undefined 
                ? 0 
                : Math.max(0, Math.min(100, challenge.completion_rate))} 
              className={`h-2 ${challenge.is_completed ? 'bg-green-200' : ''}`}
            />
            {challenge.is_completed && challenge.completed_at && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Completed on {formatDate(challenge.completed_at)}
              </div>
            )}
          </div>
        )}

        {/* Challenge Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="font-medium truncate">
                {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
            <Gift className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Reward</div>
              <div className="font-bold text-primary">+{challenge.reward_points} pts</div>
            </div>
          </div>
        </div>

        {/* Target Metric */}
        <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
          <Target className="w-4 h-4 text-primary" />
          <div className="text-sm">
            <span className="text-muted-foreground">Goal: </span>
            <span className="font-semibold">
              {challenge.target_value} {getMetricLabel(challenge.target_metric).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Participants & Days Remaining */}
        <div className="flex items-center justify-between text-sm pt-2 border-t mt-auto">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{challenge.participants} participating</span>
          </div>
          {challenge.status === 'active' ? (
            <div className="flex items-center gap-2">
              {challenge.days_remaining > 0 ? (
                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                  <Clock className="w-3 h-3 mr-1" />
                  {challenge.days_remaining}d left
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                  Ending soon
                </Badge>
              )}
            </div>
          ) : null}
          {challenge.status === 'upcoming' && (
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              <Clock className="w-3 h-3 mr-1" />
              Upcoming
            </Badge>
          )}
        </div>

        {/* Badge Preview */}
        {challenge.badge_criteria && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm min-w-0">
              <span className="text-muted-foreground">Unlock: </span>
              <span className="font-semibold text-yellow-800 truncate">
                {challenge.badge_criteria}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewLeaderboard(challenge.id)}>
            <BarChart3 className="w-4 h-4 mr-2" />Leaderboard
          </Button>
          {challenge.status !== 'upcoming' && onViewActivity && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              onClick={() => onViewActivity(challenge)}
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon: JSX.Element;
  title: string;
  description: string;
  action?: JSX.Element;
}) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-4">{description}</p>
      {action && <div className="flex justify-center mt-6">{action}</div>}
    </div>
  );
}

// Add this CSS to your global styles for smooth scrolling and hiding scrollbar
const styles = `
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}