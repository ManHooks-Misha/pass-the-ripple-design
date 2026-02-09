import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Gift,
  Target,
  Calendar,
  Users,
  Sparkles,
  PartyPopper,
  Star,
  Zap,
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { useNavigate } from "react-router-dom";

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
  days_remaining: number;
  image_path: string | null;
}

interface ChallengeJoinSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  userProgress?: number;
}

export default function ChallengeJoinSuccess({
  open,
  onOpenChange,
  challenge,
  userProgress = 0,
}: ChallengeJoinSuccessProps) {
  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = React.useState(false);

  // Show confetti when popup opens
  React.useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!challenge) return null;

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const completionPercentage = Math.min(
    (userProgress / challenge.target_value) * 100,
    100
  );

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-4 border-purple-300 shadow-2xl animate-scale-in">
          {/* Header with animated icons */}
          <DialogHeader className="text-center space-y-4 pb-4">
            <div className="flex justify-center items-center gap-3">
              <div className="animate-bounce animation-delay-100">
                <PartyPopper className="w-12 h-12 text-pink-500" />
              </div>
              <div className="animate-float">
                <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-lg" />
              </div>
              <div className="animate-bounce animation-delay-200">
                <Sparkles className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <DialogTitle className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
              🎉 Congratulations! 🎉
            </DialogTitle>

            <DialogDescription className="text-lg sm:text-xl font-semibold text-purple-700 animate-fade-in">
              You've joined an awesome challenge!
            </DialogDescription>
          </DialogHeader>

          {/* Challenge Details Card */}
          <div className="space-y-6 mt-4">
            {/* Challenge Name & Type */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-md">
                  {getChallengeIcon(challenge.challenge_type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-purple-900">
                    {challenge.name}
                  </h3>
                  <Badge className="mt-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white capitalize">
                    {challenge.challenge_type} Challenge
                  </Badge>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {challenge.description}
              </p>
            </div>

            {/* Your Mission Card */}
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-blue-600" />
                <h4 className="text-xl font-bold text-blue-900">Your Mission</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow">
                  <span className="text-gray-700 font-medium">Goal:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {challenge.target_value} {getMetricLabel(challenge.target_metric)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow">
                  <span className="text-gray-700 font-medium">Your Progress:</span>
                  <span className="text-xl font-bold text-green-600">
                    {userProgress} / {challenge.target_value}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{completionPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={completionPercentage}
                    className="h-3 bg-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Rewards & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reward Card */}
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-5 border-2 border-yellow-300 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-orange-600" />
                  <h5 className="font-bold text-orange-900">Reward</h5>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-orange-600">
                    +{challenge.reward_points}
                  </span>
                  <span className="text-orange-700">points</span>
                </div>
              </div>

              {/* Participants Card */}
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-300 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <h5 className="font-bold text-green-900">Players</h5>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {challenge.participants}
                  </span>
                  <span className="text-green-700">joined</span>
                </div>
              </div>

              {/* Time Left Card */}
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-5 border-2 border-pink-300 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-pink-600" />
                  <h5 className="font-bold text-pink-900">Time Left</h5>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-pink-500" />
                  <span className="text-xl font-bold text-pink-600">
                    {challenge.days_remaining} days
                  </span>
                </div>
              </div>

              {/* End Date Card */}
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-5 border-2 border-indigo-300 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <h5 className="font-bold text-indigo-900">Ends On</h5>
                </div>
                <div className="text-lg font-bold text-indigo-600">
                  {formatDate(challenge.end_date)}
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl p-6 text-white text-center shadow-xl border-2 border-white overflow-hidden relative animate-glow">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <div className="relative z-10">
                <div className="flex justify-center items-center gap-2 mb-3">
                  <Sparkles className="w-8 h-8 animate-spin-slow" />
                  <Star className="w-10 h-10 fill-yellow-300 text-yellow-300 animate-pulse" />
                  <Sparkles className="w-8 h-8 animate-spin-slow" />
                </div>
                <p className="text-lg sm:text-xl font-bold mb-2 animate-bounce-small">
                  You're Amazing! 🌟
                </p>
                <p className="text-sm sm:text-base opacity-90">
                  Complete this challenge to earn <span className="font-bold text-yellow-300 animate-pulse">{challenge.reward_points} points</span> and show everyone how awesome you are!
                </p>
                <div className="mt-3 flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-300 text-yellow-300"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Let's Go!
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate('/challenges-leaderboard');
                }}
                variant="outline"
                className="flex-1 border-2 border-purple-400 text-purple-700 hover:bg-purple-50 font-bold py-6 text-lg"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View My Challenges
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
