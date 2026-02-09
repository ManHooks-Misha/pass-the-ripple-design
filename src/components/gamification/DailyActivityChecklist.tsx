import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Heart,
  Share2,
  Trophy,
  Sparkles,
  Flame,
  ArrowRight,
  Target,
  Star,
  Zap,
  ChevronRight,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyActivityChecklistProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  emoji: string;
  completed: boolean;
  action_type: 'daily_login' | 'post_story' | 'read_story' | 'like_story' | 'share_story' | 'complete_challenge';
  redirect_url?: string;
  required_count?: number;
  current_count?: number;
}

const DailyActivityChecklist = ({ isOpen: externalIsOpen, onOpenChange: externalOnOpenChange }: DailyActivityChecklistProps = {}) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [totalPointsToday, setTotalPointsToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  useEffect(() => {
    fetchDailyTasks();
    fetchActivityHistory();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      const token = getAuthToken();
      const tokenType = localStorage.getItem("tokenType") || "Bearer";
      const res = await apiFetch<any>("/user/daily-tasks", {
        method: "GET",
        headers: token ? { Authorization: `${tokenType} ${token}` } : {},
      });

      if (res?.success && res?.data) {
        const apiTasks = res.data.tasks || [];

        const taskMap: Record<string, any> = {
          'daily_login': { icon: Sparkles, redirect_url: '/dashboard', emoji: '🌟' },
          'post_story': { icon: Heart, redirect_url: '/post-story', emoji: '✍️' },
          'read_story': { icon: BookOpen, redirect_url: '/my-hero-wall', emoji: '📚' },
          'like_story': { icon: Heart, redirect_url: '/my-hero-wall', emoji: '💖' },
          'share_story': { icon: Share2, redirect_url: '/my-hero-wall', emoji: '🔗' },
          'complete_challenge': { icon: Trophy, redirect_url: '/dashboard', emoji: '🏆' }
        };

        const dynamicTasks = apiTasks.map((apiTask: any) => ({
          id: apiTask.action_type,
          title: apiTask.title || taskMap[apiTask.action_type]?.title || apiTask.action_type,
          description: apiTask.description || taskMap[apiTask.action_type]?.description || '',
          points: apiTask.points || 0,
          icon: taskMap[apiTask.action_type]?.icon || Target,
          emoji: taskMap[apiTask.action_type]?.emoji || '✨',
          completed: apiTask.completed || false,
          action_type: apiTask.action_type,
          redirect_url: taskMap[apiTask.action_type]?.redirect_url || '/dashboard',
          required_count: apiTask.required_count || 1,
          current_count: apiTask.current_count || 0
        }));

        const sortedTasks = dynamicTasks.sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });

        setTasks(sortedTasks);
        setTotalPointsToday(res.data.total_points_today || 0);
        setStreak(res.data.streak || 0);
      }
    } catch (e) {
      console.error("Error fetching daily tasks:", e);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const DialogTaskContent = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Stats Row */}
      <div className="flex items-center gap-3 justify-center">
        <div className="text-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-5 h-5 text-white" />
            <div className="text-2xl font-black text-white">{streak}</div>
          </div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide">Day Streak</div>
        </div>
        
        <div className="text-center bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center gap-1.5">
            <Star className="w-5 h-5 text-white" />
            <div className="text-2xl font-black text-white">{totalPointsToday}</div>
          </div>
          <div className="text-[10px] font-bold text-white/90 uppercase tracking-wide">Points Today</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3 bg-purple-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 font-bold">
            TASK PROGRESS
          </Badge>
          <span className="text-xl font-black text-gray-900">
            {completedTasks}/{totalTasks}
          </span>
        </div>
        
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-700">
            {Math.round(completionPercentage)}%
          </div>
        </div>
        
        {completedTasks === totalTasks && totalTasks > 0 && (
          <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-100 px-3 py-2 rounded-lg border-2 border-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <span>Perfect! All tasks completed today! 🌟</span>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const progress = task.required_count && task.current_count
            ? (task.current_count / task.required_count) * 100
            : 0;

          return (
            <Link key={task.id} to={task.redirect_url || '/dashboard'} onClick={() => setIsOpen(false)}>
              <div
                className={cn(
                  "relative rounded-xl border-2 transition-all cursor-pointer group overflow-hidden",
                  task.completed
                    ? "bg-gradient-to-r from-green-100 via-emerald-100 to-green-50 border-green-400 shadow-md"
                    : "bg-white border-purple-300 hover:border-purple-500 hover:shadow-xl hover:-translate-y-0.5"
                )}
              >
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)`,
                    color: task.completed ? '#10b981' : '#a855f7'
                  }}></div>
                </div>

                <div className="relative p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110",
                      task.completed 
                        ? "bg-gradient-to-br from-green-400 to-emerald-500" 
                        : "bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500"
                    )}>
                      {task.completed ? "✓" : task.emoji}
                    </div>
                    
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 shadow-md",
                      task.completed
                        ? "bg-green-50 border-green-400 text-green-700"
                        : "bg-purple-50 border-purple-400 text-purple-700"
                    )}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className={cn(
                          "text-sm font-black leading-tight mb-1",
                          task.completed ? "text-green-900" : "text-gray-900"
                        )}>
                          {task.title}
                        </h4>
                        <p className={cn(
                          "text-xs leading-relaxed",
                          task.completed ? "text-green-700" : "text-gray-600"
                        )}>
                          {task.description}
                        </p>
                      </div>

                      {task.required_count && task.required_count > 1 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className={cn(
                              "font-bold",
                              task.completed ? "text-green-700" : "text-gray-700"
                            )}>
                              Progress
                            </span>
                            <span className={cn(
                              "font-black",
                              task.completed ? "text-green-700" : "text-purple-600"
                            )}>
                              {task.current_count}/{task.required_count}
                            </span>
                          </div>
                          <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={cn(
                                "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                                task.completed
                                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                  : "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
                              )}
                              style={{ width: `${task.completed ? 100 : progress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-3 py-2 rounded-lg shadow-lg text-center min-w-[70px]",
                        task.completed
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : "bg-gradient-to-br from-amber-400 to-orange-500"
                      )}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-white" />
                          <span className="text-lg font-black text-white">
                            {task.points}
                          </span>
                        </div>
                        <div className="text-[8px] font-bold text-white/90 uppercase tracking-wide">
                          {task.completed ? "EARNED" : "REWARD"}
                        </div>
                      </div>

                      {!task.completed && (
                        <Button 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-4 py-4 font-bold shadow-lg"
                        >
                          <span className="mr-1 text-sm">GO</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}

                      {task.completed && (
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Button
          variant="outline"
          size="lg"
          disabled
          className="bg-white shadow-lg"
        >
          <div className="animate-spin w-5 h-5 border-3 border-purple-600 border-t-transparent rounded-full mr-2"></div>
          Loading Tasks...
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <div className="flex justify-center" data-tutorial-target="daily-tasks-button">
        <Button
          onClick={() => setIsOpen(true)}
          variant="default"
                size="sm"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md flex items-center gap-2 flex-shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative flex items-center gap-3">
            <Target className="w-4 h-4 animate-pulse" />
            <span>Daily Tasks</span>
            <Badge className="bg-white/20 text-white border-0 px-2 py-1">
              {completedTasks}/{totalTasks}
            </Badge>
            {completedTasks < totalTasks && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-gray-900">
                    Daily Quest
                    {completedTasks === totalTasks && totalTasks > 0 && (
                      <span className="ml-2 text-2xl animate-bounce">🎉</span>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Complete tasks to earn points and build your streak!
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6">
            <DialogTaskContent />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyActivityChecklist;