// components/admin/AdminLeaderboards.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';

// ✅ Admin Shared Components
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { DataCard } from '@/components/admin/DataCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarImage } from '@/utils/avatars';
import { UserAvatarOnly, UserIdentity } from '@/components/UserIdentity';


type User = {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  account_status: string;
  registration_status: string;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  avatar_id?: number | null;
  custom_avatar?: string | null;
  created_at: string;
  last_active: string | null;
  age_group?: string | null;
  address?: string;
  is_block?: number;
  is_delete?: number;
};
// Avatar fallback
const Avatar = ({ src, name, size = 'w-8 h-8' }: { src?: string; name: string; size?: string }) => {
  const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];
  return (
    <div className={`${size} rounded-full ${bg} flex items-center justify-center text-white font-medium text-sm`}>
      {getInitials(name)}
    </div>
  );
};


// Match your actual API response shape
interface LeaderboardItem {
  id: number;
  full_name: string | null;
  nickname: string;
  avatar_id: number | null;
  ripple_id: string | null;
  role: string | null;
  profile_image_path: string | null;
  ripples: number;
  likes: number;
  shares: number;
  badges: number;
  points: number;
  rank: number;
  streak: number;
}

interface RankingsResponse {
  success: boolean;
  data: {
    period: string;
    weights: Record<string, number>;
    items: LeaderboardItem[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

interface SummaryResponse {
  success: boolean;
  data: {
    leaders: {
      daily?: LeaderboardItem;
      weekly?: LeaderboardItem;
      monthly?: LeaderboardItem;
      all_time?: LeaderboardItem;
    };
    weights: Record<string, number>;
  };
}

export default function AdminLeaderboards() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [summary, setSummary] = useState<SummaryResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Map UI labels to API periods
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('daily');

  // Map for UI display
  const periodLabels: Record<typeof period, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    all_time: 'All Time',
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<RankingsResponse>(`/leaderboard/rankings?period=${period}&page=${currentPage}`);
      if (res.success) {
        setItems(res.data.items);
        setTotalPages(res.data.pagination.last_page);
      } else {
        throw new Error('Failed to load rankings');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load leaderboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await apiFetch<SummaryResponse>('/leaderboard/summary');
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      // Silent fail or log if needed
    }
  };

  useEffect(() => {
    fetchRankings();
    if (currentPage === 1) {
      fetchSummary();
    }
  }, [period, currentPage]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const handleRefresh = () => {
    fetchRankings();
    fetchSummary();
    toast({ title: 'Refreshed', description: 'Leaderboard reloaded.' });
  };

  // Stats cards using actual summary data
  const statCards = [
    {
      title: 'All-Time Leader',
      value: summary?.leaders.all_time?.nickname || 'N/A',
      description: `${summary?.leaders.all_time?.points || 0} points`,
      icon: TrendingUp,
      color: 'green' as const,
    },
    {
      title: 'Weekly Leader',
      value: summary?.leaders.weekly?.nickname || 'N/A',
      description: `${summary?.leaders.weekly?.points || 0} points`,
      icon: Star,
      color: 'blue' as const,
    },
    {
      title: 'Monthly Leader',
      value: summary?.leaders.monthly?.nickname || 'N/A',
      description: `${summary?.leaders.monthly?.points || 0} points`,
      icon: Medal,
      color: 'orange' as const,
    },
    {
      title: 'Daily Leader',
      value: summary?.leaders.daily?.nickname || 'N/A',
      description: `${summary?.leaders.daily?.points || 0} points`,
      icon: Trophy,
      color: 'yellow' as const,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Leaderboards
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track top performers across timeframes
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ✅ Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
            loading={loading && !summary}
          />
        ))}
      </div>

      {/* ✅ Leaderboard Table */}
      <DataCard
        title={`Rankings (${periodLabels[period]})`}
        description="Top kindness contributors"
        icon={Trophy}
        actions={
          <Select value={period} onValueChange={(v) => { setPeriod(v as any); setCurrentPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Ripples</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Badges</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(item.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserIdentity avatar_id={item.avatar_id} profile_image_path={item.profile_image_path} nickname={item.nickname} ripple_id={item.ripple_id} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.points}</TableCell>
                    <TableCell className="text-right">{item.ripples}</TableCell>
                    <TableCell className="text-right">{item.likes}</TableCell>
                    <TableCell className="text-right">{item.shares}</TableCell>
                    <TableCell className="text-right">{item.badges}</TableCell>
                    <TableCell className="text-right">
                      {item.streak > 0 && (
                        <div className="flex items-center justify-end gap-1 text-orange-500">
                          <TrendingUp className="h-4 w-4" />
                          <span>{item.streak}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No leaderboard data"
            description="No users have earned points yet."
          />
        )}

        {/* ✅ Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DataCard>
    </div>
  );
}