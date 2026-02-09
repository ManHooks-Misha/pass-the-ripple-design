import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { cn } from "@/lib/utils";

interface ActivityDay {
  date: string;
  level: number;
  tasks: number;
  points: number;
}

const ActivityHeatmap = () => {
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityHistory();
  }, []);

  const fetchActivityHistory = async () => {
    try {
      const token = getAuthToken();
      const tokenType = localStorage.getItem("tokenType") || "Bearer";
      const res = await apiFetch<any>("/user/activity-history", {
        method: "GET",
        headers: token ? { Authorization: `${tokenType} ${token}` } : {},
      });

      if (res?.success && res?.data) {
        setActivityHistory(res.data.history || []);
      }
    } catch (e) {
      console.error("Error fetching activity history:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (): ActivityDay[] => {
    const days: ActivityDay[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const historyItem = activityHistory.find(h => h.date === dateStr);

      days.push({
        date: dateStr,
        level: historyItem ? Math.min(4, Math.floor(historyItem.completion_rate / 25)) : 0,
        tasks: historyItem?.tasks_completed || 0,
        points: historyItem?.points_earned || 0
      });
    }
    return days;
  };

  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-200 dark:bg-gray-700';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-400';
      case 3: return 'bg-green-600';
      case 4: return 'bg-green-800';
      default: return 'bg-gray-200';
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="shadow-elevated border-primary/10">
      <CardHeader className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            30-Day Activity Streak
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className="hidden sm:inline">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-sm", getHeatmapColor(level))} />
            ))}
            <span className="hidden sm:inline">More</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1">
          {heatmapData.map((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-sm transition-all hover:ring-2 hover:ring-primary cursor-pointer hover:scale-110",
                  getHeatmapColor(day.level)
                )}
                title={`${formattedDate} (${dayOfWeek})\n${day.tasks} tasks completed\n${day.points} points earned`}
              />
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 justify-center text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {activityHistory.reduce((sum, day) => sum + (day.tasks_completed || 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {activityHistory.reduce((sum, day) => sum + (day.points_earned || 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Points</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {activityHistory.filter(day => day.tasks_completed > 0).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
