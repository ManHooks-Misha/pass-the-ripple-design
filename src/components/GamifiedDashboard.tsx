import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Zap, Award, TrendingUp } from "lucide-react";

// Badge definitions
const badges = [
  { id: 1, name: "First Ripple", icon: "💧", description: "Started your first ripple", points: 10, earned: true },
  { id: 2, name: "Kindness Keeper", icon: "💖", description: "5 acts of kindness", points: 25, earned: true },
  { id: 3, name: "Gratitude Giver", icon: "🙏", description: "Gave thanks 10 times", points: 30, earned: true },
  { id: 4, name: "Ripple Rocket", icon: "🚀", description: "10 ripples passed", points: 50, earned: false },
  { id: 5, name: "Helper Hero", icon: "🦸", description: "Helped 20 people", points: 100, earned: false },
  { id: 6, name: "Global Kindness", icon: "🌍", description: "Ripples in 5 countries", points: 200, earned: false },
  { id: 7, name: "Daily Dynamo", icon: "⚡", description: "7 days streak", points: 75, earned: false },
  { id: 8, name: "Story Master", icon: "📖", description: "Shared 15 stories", points: 60, earned: false },
];

// Daily/Weekly challenges
const challenges = [
  { id: 1, title: "Daily Kindness", description: "Complete 1 act of kindness today", progress: 0, total: 1, reward: 5 },
  { id: 2, title: "Weekly Helper", description: "Help 5 people this week", progress: 3, total: 5, reward: 20 },
  { id: 3, title: "Gratitude Week", description: "Give thanks 7 times", progress: 4, total: 7, reward: 15 },
  { id: 4, title: "Environmental Hero", description: "3 eco-friendly actions", progress: 1, total: 3, reward: 25 },
];

const GamifiedDashboard = () => {
  const [userLevel, setUserLevel] = useState(3);
  const [userPoints, setUserPoints] = useState(165);
  const [levelProgress, setLevelProgress] = useState(65);
  const [userAvatar, setUserAvatar] = useState("🌟");
  const [userName, setUserName] = useState("KindnessHero");
  const [streak, setStreak] = useState(3);

  const earnedBadges = badges.filter(b => b.earned);
  const totalPossiblePoints = badges.reduce((acc, b) => acc + b.points, 0);
  const earnedPoints = earnedBadges.reduce((acc, b) => acc + b.points, 0);

  const getLevelTitle = (level: number) => {
    const titles = [
      "Kindness Beginner",
      "Ripple Starter",
      "Good Deed Doer",
      "Kindness Champion",
      "Ripple Master",
      "Global Change Maker"
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-7xl animate-bounce">{userAvatar}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className="text-muted-foreground mb-3">{getLevelTitle(userLevel)}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Level {userLevel}</span>
                  <span className="text-primary font-medium">{userPoints} points</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {100 - levelProgress} points to Level {userLevel + 1}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{streak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
              <div className="text-2xl mt-1">🔥</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{userPoints}</div>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{streak}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Total Ripples</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily/Weekly Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Challenges
          </CardTitle>
          <CardDescription>Complete challenges to earn bonus points!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{challenge.title}</p>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="secondary">+{challenge.reward} pts</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(challenge.progress / challenge.total) * 100} 
                  className="flex-1 h-2"
                />
                <span className="text-sm font-medium">
                  {challenge.progress}/{challenge.total}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Badge Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badge Collection
          </CardTitle>
          <CardDescription>
            {earnedBadges.length} of {badges.length} badges earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-lg border p-4 text-center transition-all ${
                  badge.earned 
                    ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/50 shadow-sm' 
                    : 'bg-muted/30 opacity-60 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-medium text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
                <div className="mt-2">
                  {badge.earned ? (
                    <Badge variant="default" className="text-xs">
                      Earned! +{badge.points}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Next Goals</CardTitle>
          <CardDescription>Keep going! You're doing amazing!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <p className="font-medium">Unlock "Ripple Rocket" Badge</p>
              <p className="text-sm text-muted-foreground">Pass 10 ripples (7/10 completed)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">⭐</div>
            <div className="flex-1">
              <p className="font-medium">Reach Level 4</p>
              <p className="text-sm text-muted-foreground">35 more points needed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div className="flex-1">
              <p className="font-medium">7-Day Streak</p>
              <p className="text-sm text-muted-foreground">Keep your streak going! (3/7 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedDashboard;