import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Award, Activity, Filter, Download, RefreshCw,
  TrendingUp, Target, Star, Trophy, Zap, Calendar,
  Heart, MessageCircle, CheckCircle, AlertCircle, Flame, Crown, Sparkles,
  MapPin, Globe, Eye, Share2, ThumbsUp, HelpCircle
} from 'lucide-react';
import { apiFetch } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/utils/imageUrl';
import { getPlainText } from '@/utils/textUtils';
import KidFriendlyTutorial from '@/components/KidFriendlyTutorial';
import { usePageTutorial } from '@/hooks/usePageTutorial';
import { analyticsTutorialSteps } from '@/hooks/usePageTutorialSteps';
import { convertStepsToTutorialSteps } from '@/utils/convertTutorialSteps';
import { Button } from '@/components/ui/button';

interface MetricValue {
  value: number;
  change: number;
}

interface UserSummary {
  total_points: MetricValue;
  current_streak: number;
  longest_streak: number;
  ripple_count: MetricValue;
  badges_count: MetricValue;
}

interface Story {
  id: number;
  title: string;
  description: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  status: string;
  created_at: string;
}

interface StoryEngagement {
  total_stories: number;
  approved_stories: number;
  pending_stories: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_views: number;
}

interface UserAnalyticsData {
  summary: UserSummary;
  badges: any[];
  challenges: any[];
  all_stories: Story[];
  top_stories: Story[];
  story_engagement: StoryEngagement;
  recent_activities: any[];
  points_history: Array<{ date: string; points: number }>;
  geographic_reach: Array<{ country: string; city: string; count: number }>;
}

const UserAnalyticsDashboard: React.FC = () => {
  // Hooks must be called before any early returns
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "analytics_tutorial_completed",
    steps: analyticsTutorialSteps,
  });

  const [period, setPeriod] = useState<string>('30days');
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('overview');

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/analytics/dashboard?period=${period}`);

      if (response?.success && response.data) {
        setData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load analytics');
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiFetch(`/analytics/export?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Analytics exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={32} />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-yellow-500 mx-auto" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mt-6">No Data Available</h2>
          <button onClick={loadData} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            <RefreshCw size={20} className="inline mr-2" /> Refresh
          </button>
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, color, bgColor, iconBg, suffix = '' }: any) => {
    return (
      <div className={`${bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}>
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
          <div className={`p-2 sm:p-3 ${iconBg} rounded-lg sm:rounded-xl shadow-sm`}>
            <Icon className={color} size={20} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2">
          {typeof value === 'object' ? value.value.toLocaleString() : value.toLocaleString()}
          {suffix && <span className="text-lg sm:text-xl md:text-2xl ml-1">{suffix}</span>}
        </div>
        <div className="text-xs sm:text-sm text-gray-700 font-semibold truncate">{title}</div>
      </div>
    );
  };

  const ChartSection = ({ title, children, className = '', actions }: any) => (
    <div className={`bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-2xl transition-all ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );

  const completedChallenges = data.challenges.filter(c => c.completed_at).length;
  const challengeCompletionRate = data.challenges.length > 0
    ? Math.round((completedChallenges / data.challenges.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="analytics_tutorial_completed"
      />
      
      <div className="max-w-[1800px] mx-auto">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Analytics
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your progress and achievements
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={startTutorial}
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
              title="Take a tour of this page"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8" data-tutorial-target="analytics-stats">
          <MetricCard
            title="Total Points"
            value={data.summary.total_points}
            icon={Award}
            color="text-yellow-600"
            bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
            iconBg="bg-yellow-100"
          />
          <MetricCard
            title="Current Streak"
            value={data.summary.current_streak}
            icon={Flame}
            color="text-orange-600"
            bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
            iconBg="bg-orange-100"
            suffix="days"
          />
          <MetricCard
            title="Longest Streak"
            value={data.summary.longest_streak}
            icon={Trophy}
            color="text-red-600"
            bgColor="bg-gradient-to-br from-red-50 to-red-100"
            iconBg="bg-red-100"
            suffix="days"
          />
          <MetricCard
            title="My Ripples"
            value={data.summary.ripple_count}
            icon={TrendingUp}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            iconBg="bg-blue-100"
          />
          <MetricCard
            title="Badges Earned"
            value={data.summary.badges_count}
            icon={Star}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            iconBg="bg-purple-100"
          />
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur-xl my-3 sm:my-4 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="text-gray-500 flex-shrink-0" size={18} />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              <div className="w-full overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex gap-2 min-w-max sm:min-w-0">
                  {['overview', 'my-stories', 'my-activity', 'challenges', 'achievements'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                        activeView === view
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {view.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8" data-tutorial-target="analytics-charts">
              <ChartSection title="Points Earned Over Time" className="xl:col-span-2">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.points_history}>
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="points" stroke="#3b82f6" fill="url(#colorPoints)" strokeWidth={3} name="Points" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartSection>

              <ChartSection title="Challenge Progress">
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                    <div className="text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {challengeCompletionRate}%
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">Completion Rate</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {completedChallenges} of {data.challenges.length} completed
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="text-green-600" size={28} />
                      <span className="text-3xl font-black text-green-600">{completedChallenges}</span>
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">Completed</div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="text-blue-600" size={28} />
                      <span className="text-3xl font-black text-blue-600">{data.challenges.length - completedChallenges}</span>
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">In Progress</div>
                  </div>
                </div>
              </ChartSection>
            </div>

            {/* Engagement Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Heart className="text-red-600" size={32} fill="#dc2626" />
                  <span className="text-4xl font-black text-red-600">{data.story_engagement.total_likes}</span>
                </div>
                <div className="text-sm text-gray-700 font-semibold">Total Likes</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <MessageCircle className="text-blue-600" size={32} />
                  <span className="text-4xl font-black text-blue-600">{data.story_engagement.total_comments}</span>
                </div>
                <div className="text-sm text-gray-700 font-semibold">Total Comments</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Share2 className="text-green-600" size={32} />
                  <span className="text-4xl font-black text-green-600">{data.story_engagement.total_shares}</span>
                </div>
                <div className="text-sm text-gray-700 font-semibold">Total Shares</div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Eye className="text-purple-600" size={32} />
                  <span className="text-4xl font-black text-purple-600">{data.story_engagement.total_views}</span>
                </div>
                <div className="text-sm text-gray-700 font-semibold">Total Views</div>
              </div>
            </div>
          </>
        )}

        {/* My Stories View */}
        {activeView === 'my-stories' && (
          <>
            {/* Story Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200">
                <div className="text-4xl font-black text-blue-600 mb-2">{data.story_engagement.total_stories}</div>
                <div className="text-sm text-gray-700 font-semibold">Total Stories</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl border border-green-200">
                <div className="text-4xl font-black text-green-600 mb-2">{data.story_engagement.approved_stories}</div>
                <div className="text-sm text-gray-700 font-semibold">Approved Stories</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-xl border border-yellow-200">
                <div className="text-4xl font-black text-yellow-600 mb-2">{data.story_engagement.pending_stories}</div>
                <div className="text-sm text-gray-700 font-semibold">Pending Stories</div>
              </div>
            </div>

            {/* Top Stories */}
            <ChartSection title="My Top Stories (Most Liked)" className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.top_stories.map((story, index) => (
                  <div key={story.id} className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {index < 3 && <span className="text-2xl">{['🥇', '🥈', '🥉'][index]}</span>}
                          <h4 className="font-bold text-gray-900">{story.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{getPlainText(story.description)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        story.status === 'approved' ? 'bg-green-100 text-green-700' :
                        story.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {story.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="text-red-500" size={16} fill="#ef4444" />
                        <span className="font-semibold">{story.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="text-blue-500" size={16} />
                        <span className="font-semibold">{story.comments_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="text-green-500" size={16} />
                        <span className="font-semibold">{story.shares_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="text-purple-500" size={16} />
                        <span className="font-semibold">{story.views_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartSection>

            {/* All Stories Table */}
            <ChartSection title="All My Stories">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Title</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Likes</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Comments</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Shares</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Views</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.all_stories.map((story) => (
                      <tr key={story.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{story.title}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            story.status === 'approved' ? 'bg-green-100 text-green-700' :
                            story.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {story.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{story.likes_count}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{story.comments_count}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{story.shares_count}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{story.views_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(story.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartSection>
          </>
        )}

        {/* My Activity View */}
        {activeView === 'my-activity' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Geographic Reach */}
              <ChartSection title={
                <div className="flex items-center gap-3">
                  <Globe className="text-blue-500" size={28} />
                  <span>My Geographic Reach</span>
                </div>
              }>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {data.geographic_reach && data.geographic_reach.length > 0 ? (
                    data.geographic_reach.map((location, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <MapPin className="text-blue-600" size={22} />
                            <div>
                              <div className="font-bold text-gray-900">{location.city}</div>
                              <div className="text-sm text-gray-600">{location.country}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-black text-blue-600">{location.count}</div>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(location.count / Math.max(...data.geographic_reach.map(g => g.count))) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Globe className="mx-auto text-gray-300" size={64} />
                      <p className="mt-4 text-gray-500">No geographic data available yet</p>
                      <p className="text-sm text-gray-400 mt-2">Refer friends to see where your ripples reach!</p>
                    </div>
                  )}
                </div>
              </ChartSection>

              {/* Recent Activities */}
              <ChartSection title="Recent Activities">
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {data.recent_activities.map((activity) => (
                    <div key={activity.id} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{activity.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{getPlainText(activity.description || '')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Heart className="text-red-500" size={16} />
                          <span className="font-semibold">{activity.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="text-blue-500" size={16} />
                          <span className="font-semibold">{activity.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <Calendar className="text-gray-400" size={14} />
                          <span className="text-xs">{new Date(activity.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartSection>
            </div>
          </>
        )}

        {/* Challenges View */}
        {activeView === 'challenges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.challenges.map((challenge) => {
              const progress = Math.min((challenge.progress / challenge.target_value) * 100, 100);
              const isCompleted = challenge.completed_at !== null;

              return (
                <div key={challenge.id} className={`p-6 rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{challenge.name}</h3>
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                          <CheckCircle size={16} />
                          <span>Completed!</span>
                        </div>
                      )}
                    </div>
                    {isCompleted && <Crown className="text-yellow-500" size={32} />}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">
                          {challenge.progress} / {challenge.target_value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-600 mt-1 font-semibold">
                        {progress.toFixed(0)}% Complete
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="pt-3 border-t border-green-200">
                        <div className="text-xs text-gray-600">
                          Completed on {new Date(challenge.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Achievements View */}
        {activeView === 'achievements' && (
          <div className="space-y-8">
            <ChartSection title={
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-500" size={28} />
                <span>My Badges</span>
              </div>
            }>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {data.badges.map((badge) => (
                  <div key={badge.id} className="group">
                    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-300 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                      <div className="text-center">
                        <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                          <img src={getImageUrl(badge.icon_path)} className='w-full h-full object-cover' alt={badge.name} />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{badge.name}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{badge.description}</p>
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <div className="text-xs text-gray-600">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartSection>

            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-xl border-2 border-yellow-300">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="text-yellow-600" size={40} />
                  <div className="text-4xl font-black text-yellow-600">{data.badges.length}</div>
                </div>
                <div className="text-lg font-bold text-gray-900">Total Badges</div>
                <div className="text-sm text-gray-600 mt-1">Keep collecting!</div>
              </div>

              <div className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl border-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <Star className="text-purple-600" size={40} />
                  <div className="text-4xl font-black text-purple-600">{completedChallenges}</div>
                </div>
                <div className="text-lg font-bold text-gray-900">Challenges Done</div>
                <div className="text-sm text-gray-600 mt-1">Amazing progress!</div>
              </div>

              <div className="p-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl shadow-xl border-2 border-blue-300">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="text-blue-600" size={40} />
                  <div className="text-4xl font-black text-blue-600">
                    {typeof data.summary.total_points === 'object' ? data.summary.total_points.value : data.summary.total_points}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">Total Points</div>
                <div className="text-sm text-gray-600 mt-1">You're doing great!</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;
