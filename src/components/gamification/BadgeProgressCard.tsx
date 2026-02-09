import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Sparkles, TrendingUp } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

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

interface BadgeProgressCardProps {
  progress: BadgeProgressData;
  badgeIcon?: string;
}

export function BadgeProgressCard({ progress, badgeIcon }: BadgeProgressCardProps) {
  const getTierColor = (tier: number) => {
    const colors = [
      "bg-orange-100 text-orange-800 border-orange-200", // Tier 1 - Bronze
      "bg-gray-200 text-gray-800 border-gray-300", // Tier 2 - Silver
      "bg-yellow-100 text-yellow-800 border-yellow-200", // Tier 3 - Gold
      "bg-purple-100 text-purple-800 border-purple-200", // Tier 4 - Ultimate
    ];
    return colors[tier - 1] || "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getTierEmoji = (tier: number) => {
    const emojis = ["🥉", "🥈", "🥇", "👑"];
    return emojis[tier - 1] || "🏆";
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {badgeIcon ? (
              <img
                src={getImageUrl(badgeIcon)}
                alt={progress.badge_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{progress.badge_name}</CardTitle>
              <CardDescription className="text-xs">
                {progress.max_tier_reached
                  ? "Maximum tier reached!"
                  : `Progress to ${progress.next_tier_name}`}
              </CardDescription>
            </div>
          </div>

          {progress.current_tier > 0 && (
            <Badge className={getTierColor(progress.current_tier)}>
              {getTierEmoji(progress.current_tier)}{" "}
              {progress.current_tier_name || `Tier ${progress.current_tier}`}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!progress.max_tier_reached ? (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {progress.current_cards} / {progress.required_cards} cards
                </span>
              </div>
              <Progress value={progress.progress_percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.progress_percentage.toFixed(0)}% complete</span>
                <span>{progress.cards_needed} cards needed</span>
              </div>
            </div>

            {/* Next Tier Info */}
            {progress.next_tier && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    Next: {progress.next_tier_name}
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Collect {progress.cards_needed} more card
                  {progress.cards_needed !== 1 ? "s" : ""} to unlock!
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-semibold text-purple-900">Maximum Tier Reached!</p>
            <p className="text-xs text-purple-700 mt-1">
              You've unlocked all tiers for this badge
            </p>
          </div>
        )}

        {/* Tier Indicator */}
        {progress.current_tier === 0 && !progress.max_tier_reached && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Start collecting cards to unlock your first tier!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
