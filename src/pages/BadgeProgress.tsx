import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Sparkles, TrendingUp } from "lucide-react";
import { apiFetch } from "@/config/api";
import { BadgeProgressCard } from "@/components/gamification/BadgeProgressCard";

interface BadgeProgressData {
  badge_id: number;
  badge_name: string;
  current_tier: number;
  current_tier_name?: string;
  next_tier?: number;
  next_tier_name?: string;
  current_cards: number;
  required_cards: number;
  cards_needed: number;
  progress_percentage: number;
  max_tier_reached: boolean;
}

export default function BadgeProgress() {
  const [progress, setProgress] = useState<BadgeProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  const tokenType =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("tokenType") || "Bearer"
      : "Bearer";

  const getHeaders = () => {
    return token ? { Authorization: `${tokenType} ${token}` } : {};
  };

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<any>("/user/badges/progress", {
        method: "GET",
        headers: getHeaders(),
      });

      setProgress(response?.data || []);
    } catch (e: any) {
      console.error("Failed to load badge progress:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const getStats = () => {
    const totalBadges = progress.length;
    const activeBadges = progress.filter((p) => p.current_tier > 0).length;
    const maxedBadges = progress.filter((p) => p.max_tier_reached).length;
    const avgProgress =
      totalBadges > 0
        ? progress.reduce((sum, p) => sum + p.progress_percentage, 0) / totalBadges
        : 0;

    return { totalBadges, activeBadges, maxedBadges, avgProgress };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
          Badge Progress
        </h1>
        <p className="text-muted-foreground">
          Track your progress towards unlocking all badge tiers
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Badges</p>
                <p className="text-2xl font-bold">{stats.totalBadges}</p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unlocked</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeBadges}</p>
              </div>
              <Sparkles className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Maxed Out</p>
                <p className="text-2xl font-bold text-purple-600">{stats.maxedBadges}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.avgProgress.toFixed(0)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Progress Cards */}
      {loading ? (
        <div className="text-center py-12">
          <Award className="h-16 w-16 mx-auto text-muted-foreground/50 animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading your progress...</p>
        </div>
      ) : progress.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">No Badges Available</h3>
            <p className="text-muted-foreground mt-2">
              Complete challenges to start earning badges and tiers!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.map((badgeProgress) => (
            <BadgeProgressCard
              key={badgeProgress.badge_id}
              progress={badgeProgress}
            />
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Tier System</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>🥉 <strong>Bronze (Tier 1):</strong> First achievement level</li>
                <li>🥈 <strong>Silver (Tier 2):</strong> Intermediate mastery</li>
                <li>🥇 <strong>Gold (Tier 3):</strong> Advanced expertise</li>
                <li>👑 <strong>Ultimate (Tier 4):</strong> Master level</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Collect cards by completing challenges to unlock higher tiers and earn more
                rewards!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
