import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Trophy, Heart, TrendingUp, Star, Sparkles, Gift, Target } from "lucide-react";
import { useUserProfile } from "../../hooks/useUserProfile";
import char2 from "@/assets/characters/char2.png";
import char3 from "@/assets/characters/char3.png";
import char4 from "@/assets/characters/char4.png";
import { getUserDisplay } from "@/utils/avatars";

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

const DashboardRedesigned = () => {
  const userProfile = useUserProfile();
  const { avatar, nickname } = getUserDisplay(userProfile);
  const earnedBadges = badges.filter(badge => badge.earned);
  
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Seo
        title="My Dashboard — Pass The Ripple"
        description="Track your Ripple Cards, earn badges, and see your kindness journey."
        canonical={`${window.location.origin}/dashboard`}
      />
      
      <main className="container py-10 relative">
        {/* Floating decorations */}
        <Sparkles className="absolute top-10 left-10 text-primary/20 w-8 h-8 animate-pulse" />
        <Sparkles className="absolute top-32 right-20 text-accent/20 w-6 h-6 animate-pulse delay-700" />
        
        <div className="space-y-8">
          {/* Welcome Header with Character */}
          <div className="text-center relative">
            <img
              src={avatar} alt={nickname}
              className="w-32 h-32 mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">
              Welcome, {userProfile.nickname ?? "Friend"}!
            </h1>
            <p className="text-lg text-muted-foreground">Your kindness is making the world brighter! ✨</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold text-primary">{earnedBadges.length}</div>
                <div className="text-sm text-muted-foreground font-medium">Badges Earned</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <div className="text-3xl font-bold text-secondary">16</div>
                <div className="text-sm text-muted-foreground font-medium">Ripples Created</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-3xl font-bold text-accent">12</div>
                <div className="text-sm text-muted-foreground font-medium">Day Streak</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 shadow-elevated hover:shadow-glow transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-3xl font-bold text-purple-500">635</div>
                <div className="text-sm text-muted-foreground font-medium">Miles Traveled</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions with Character */}
          <Card className="shadow-elevated border-primary/10 bg-card/95 backdrop-blur relative overflow-hidden">
            <img 
              src={char2} 
              alt="Action character" 
              className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
            />
            <CardHeader>
              <CardTitle className="text-2xl text-gradient-primary">Ready for Today's Adventure?</CardTitle>
              <CardDescription className="text-base">Choose your next kindness mission!</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-wrap gap-3">
                <Link to="/post-story">
                  <Button variant="hero" size="lg" className="shadow-glow">
                    <Heart className="mr-2 w-4 h-4" />
                    Log New Kindness
                  </Button>
                </Link>
                <Link to="/journey-map">
                  <Button variant="magical" size="lg">
                    View Your Journey
                  </Button>
                </Link>
                <Link to="/hero-wall">
                  <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/10">
                    Read Stories
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" size="lg" className="border-secondary/30 hover:bg-secondary/10">
                    Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Badges Section - More colorful and fun */}
            <Card className="shadow-elevated border-primary/10 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
                  <span className="text-gradient-primary">Your Magic Badges</span>
                </CardTitle>
                <CardDescription>Collect all the amazing badges!</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {earnedBadges.map((badge, index) => (
                  <div 
                    key={badge.name} 
                    className={`relative rounded-xl p-4 text-center ${badge.color} border-2 border-white shadow-lg hover:scale-110 transition-all cursor-pointer`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-400 animate-pulse" />
                    <div className="text-4xl mb-2 animate-bounce" style={{ animationDelay: `${index * 200}ms` }}>
                      {badge.icon}
                    </div>
                    <div className="font-bold text-sm text-foreground">{badge.name}</div>
                    <div className="text-xs text-foreground/70 mt-1">{badge.desc}</div>
                  </div>
                ))}
                {/* Locked badges preview */}
                <div className="rounded-xl p-4 text-center bg-gray-100 border-2 border-gray-300 opacity-60">
                  <div className="text-4xl mb-2 grayscale">🌍</div>
                  <div className="font-bold text-sm text-gray-500">World Traveler</div>
                  <div className="text-xs text-gray-400">Coming soon!</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity with Fun Design */}
            <Card className="shadow-elevated border-primary/10 bg-gradient-to-br from-cyan-50 to-blue-50 relative overflow-hidden">
              {/* Floating decorations */}
              <Heart className="absolute top-4 right-4 w-6 h-6 text-pink-300/50 animate-pulse" />
              <Star className="absolute bottom-4 left-4 w-5 h-5 text-yellow-300/50 animate-pulse delay-300" />
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-gradient-primary">Recent Adventures</span>
                </CardTitle>
                <CardDescription>Your amazing acts of kindness!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-md transition-all hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      <activity.icon className="w-6 h-6 text-cyan-600 mt-1 flex-shrink-0" />
                      <span className="absolute -top-1 -right-1 text-xs">✨</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{activity.action}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-foreground/60 flex items-center gap-1">
                          <span>📅</span> {activity.date}
                        </span>
                        <Badge className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white text-xs">
                          +{activity.ripples} ripples
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Character decoration */}
                <img 
                  src={char3} 
                  alt="Activity character" 
                  className="absolute -bottom-8 -right-8 w-32 h-32 opacity-30"
                />
              </CardContent>
            </Card>
          </div>

          {/* Fun Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-orange-700">12</div>
                <div className="text-sm text-orange-600">Day Streak</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🌱</div>
                <div className="text-2xl font-bold text-green-700">47</div>
                <div className="text-sm text-green-600">Kids Helped</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">💎</div>
                <div className="text-2xl font-bold text-purple-700">235</div>
                <div className="text-sm text-purple-600">Kindness Points</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300 hover:scale-105 transition-transform">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🗺️</div>
                <div className="text-2xl font-bold text-blue-700">5</div>
                <div className="text-sm text-blue-600">Cities Reached</div>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Section with Animation */}
          <Card className="shadow-elevated border-accent/20 bg-gradient-to-r from-purple-100 via-pink-100 to-cyan-100 relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-20 h-20 bg-purple-300/30 rounded-full animate-pulse" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/30 rounded-full animate-pulse delay-300" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-300/30 rounded-full animate-pulse delay-500" />
            </div>
            
            <CardContent className="p-8 text-center relative z-10">
              <div className="relative inline-block">
                <img 
                  src={char4} 
                  alt="Motivation character" 
                  className="w-32 h-32 mx-auto mb-4 animate-bounce"
                />
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-yellow-400 animate-spin" />
                <Heart className="absolute bottom-0 left-0 w-5 h-5 text-pink-400 animate-pulse" />
              </div>
              
              <h3 className="text-3xl font-bold text-gradient-primary mb-3">Keep Going, Superstar!</h3>
              <p className="text-lg text-foreground/80 max-w-md mx-auto mb-4">
                You're on a <span className="font-bold text-orange-500">12-day kindness streak!</span> 
                Just 3 more days to unlock the <span className="font-bold text-purple-600">"Kindness Master"</span> badge!
              </p>
              
              {/* Progress bar */}
              <div className="max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-foreground/60 mb-1">
                  <span>12 days</span>
                  <span>15 days</span>
                </div>
                <div className="h-4 bg-white/80 rounded-full overflow-hidden border-2 border-purple-300">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                    style={{ width: '80%' }}
                  />
                </div>
              </div>
              
              {/* Encouraging emojis */}
              <div className="flex justify-center gap-2 mt-4">
                {['🌟', '💪', '🎉', '🚀', '✨'].map((emoji, i) => (
                  <span 
                    key={i} 
                    className="text-2xl animate-bounce" 
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardRedesigned;