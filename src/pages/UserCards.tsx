import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, TrendingUp } from "lucide-react";
import { apiFetch } from "@/config/api";
import { getImageUrl } from "@/utils/imageUrl";
import { DigitalCard } from "@/components/gamification/DigitalCard";

interface CardItem {
  id: number;
  card_id: number;
  card_name: string;
  earned_at: string;
  icon_path?: string;
}

interface CardCollection {
  [key: string]: {
    type: string;
    count: number;
    cards: CardItem[];
  };
}

interface CardStats {
  total_earned: number;
  unconsumed: number;
  consumed: number;
  by_type: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    ripple?: number;
  };
}

export default function UserCards() {
  const [collection, setCollection] = useState<CardCollection>({});
  const [stats, setStats] = useState<CardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  const tokenType =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("tokenType") || "Bearer"
      : "Bearer";

  const getHeaders = () => {
    return token ? { Authorization: `${tokenType} ${token}` } : {};
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const [collectionRes, statsRes] = await Promise.all([
        apiFetch<any>("/user/cards", { method: "GET", headers: getHeaders() }),
        apiFetch<any>("/user/cards/stats", { method: "GET", headers: getHeaders() }),
      ]);

      setCollection(collectionRes?.data || {});
      setStats(statsRes?.data || null);
    } catch (e: any) {
      console.error("Failed to load cards:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const getCardTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      daily: "bg-blue-100 text-blue-800 border-blue-200",
      weekly: "bg-green-100 text-green-800 border-green-200",
      monthly: "bg-purple-100 text-purple-800 border-purple-200",
      ripple: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return "☀️";
      case "weekly":
        return "📅";
      case "monthly":
        return "🗓️";
      case "ripple":
        return "🌊";
      default:
        return "🎴";
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
          My Card Collection
        </h1>
        <p className="text-muted-foreground">
          Collect cards by completing challenges and use them to unlock badge tiers
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">{stats.total_earned}</p>
                </div>
                <CreditCard className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.unconsumed}</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Used for Tiers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.consumed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Types Collected</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.by_type).length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Card Collection by Type */}
      {loading ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 mx-auto text-muted-foreground/50 animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading your collection...</p>
        </div>
      ) : Object.keys(collection).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">No Cards Yet</h3>
            <p className="text-muted-foreground mt-2">
              Complete challenges to start earning cards!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(collection).map(([type, data]) => (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCardTypeIcon(type)}</span>
                    <div>
                      <CardTitle className="capitalize">{type} Cards</CardTitle>
                      <CardDescription>
                        You have {data.count} {type} card{data.count !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getCardTypeColor(type)}>
                    {data.count} cards
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {data.cards.map((card) => (
                    <DigitalCard
                      key={card.id}
                      name={card.card_name}
                      card_type={type as any}
                      icon_path={card.icon_path}
                      earned_at={card.earned_at}
                      isClickable
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">How Cards Work</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete challenges to earn cards</li>
                <li>• Collect cards to unlock badge tiers (Bronze, Silver, Gold, Ultimate)</li>
                <li>• Cards are consumed when used to unlock a tier</li>
                <li>• Different card types (daily/weekly/monthly/ripple) unlock different badges</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
