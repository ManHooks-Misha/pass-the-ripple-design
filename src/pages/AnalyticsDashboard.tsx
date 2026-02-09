import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Award, Activity, Target, Calendar, Download, Filter,
  Heart, MessageCircle, Share2, Star, MapPin, Globe, Zap, Clock,
  ArrowUp, ArrowDown, Sparkles, Trophy, UserCheck, Eye, RefreshCw,
  UserPlus, ThumbsUp, AlertCircle, CheckCircle, School, Users2
} from 'lucide-react';
import { apiFetch } from '@/config/api';
import { toast } from '@/hooks/use-toast';
// Type Definitions
interface AnalyticsSummary {
  total_users?: { value: number; change: number };
  active_users?: { value: number; change: number };
  total_ripples?: { value: number; change: number };
  approved_ripples?: { value: number; change: number };
  pending_ripples?: { value: number; change: number };
  total_points?: { value: number; change: number };
  badges_earned?: { value: number; change: number };
  hero_wall_posts?: { value: number; change: number };
  total_likes?: { value: number; change: number };
  total_comments?: { value: number; change: number };
  total_shares?: { value: number; change: number };
  avg_engagement?: { value: number; change: number };
  countries_reached?: { value: number; change: number };
  cities_reached?: { value: number; change: number };
  total_distance?: { value: number; change: number };
  active_challenges?: number;
  completed_challenges?: number;
  total_students?: number;
  active_students?: number;
  student_ripples?: number;
  pending_approvals?: number;
  total_children?: number;
  current_streak?: number;
  longest_streak?: number;
  ripple_count?: number;
  badges_count?: number;
}
interface UserRoleData {
  role: string;
  count: number;
}
interface RippleStatusData {
  status: string;
  count: number;
}
interface RippleCategoryData {
  name: string;
  count: number;
  color?: string;
}
interface TopUser {
  id: number;
  nickname: string;
  full_name: string;
  total_points: number;
  avatar?: string;
}
interface TopRipple {
  id: number;
  title: string;
  likes_count: number;
  user_name: string;
}
interface GrowthTrend {
  date: string;
  new_users: number;
  active_users: number;
}
interface RippleTrend {
  date: string;
  count: number;
  approved: number;
  pending: number;
}
interface PointsDistribution {
  activity: string;
  points: number;
  count: number;
}
interface BadgeDistribution {
  name: string;
  count: number;
}
interface GeographicData {
  country: string;
  city: string;
  count: number;
}
interface ChallengeProgress {
  name: string;
  participants: number;
  completion_rate: number;
}
interface HourlyActivity {
  hour: string;
  count: number;
}
interface StreakData {
  range: string;
  users: number;
}
interface RecentActivity {
  id: number;
  user: string;
  action: string;
  title: string;
  time: string;
  status: string;
}
interface AnalyticsData {
  summary: AnalyticsSummary;
  users_by_role?: UserRoleData[];
  ripples_by_status?: RippleStatusData[];
  ripples_by_category?: RippleCategoryData[];
  engagement_metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  top_users?: TopUser[];
  top_ripples?: TopRipple[];
  growth_trends?: GrowthTrend[];
  ripple_trends?: RippleTrend[];
  points_distribution?: PointsDistribution[];
  badge_distribution?: BadgeDistribution[];
  geographic_data?: GeographicData[];
  challenge_progress?: ChallengeProgress[];
  hourly_activity?: HourlyActivity[];
  streak_data?: StreakData[];
  recent_activities?: RecentActivity[];
}
interface MetricCardProps {
  title: string;
  value: number | { value: number; change: number };
  icon: any;
  color: string;
  bgColor: string;
}
// Main Component
const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<string>('30days');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  useEffect(() => {
    loadData();
  }, [period]);
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
     
      const response = await apiFetch(`/analytics/dashboard?period=${period}`);
     
      if (response && response.success && response.data) {
        const enrichedData = enrichData(response.data);
        setData(enrichedData);
      } else {
        throw new Error(response?.message || 'Failed to load analytics data');
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const enrichData = (data: AnalyticsData): AnalyticsData => {
    // Add default colors if missing
    if (data.ripples_by_category) {
      const defaultColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
      data.ripples_by_category = data.ripples_by_category.map((category, index) => ({
        ...category,
        color: category.color || defaultColors[index % defaultColors.length]
      }));
    }
    // Ensure all arrays exist to prevent runtime errors
    return {
      summary: data.summary || {},
      users_by_role: data.users_by_role || [],
      ripples_by_status: data.ripples_by_status || [],
      ripples_by_category: data.ripples_by_category || [],
      engagement_metrics: data.engagement_metrics || { likes: 0, comments: 0, shares: 0, views: 0 },
      top_users: data.top_users || [],
      top_ripples: data.top_ripples || [],
      growth_trends: data.growth_trends || [],
      ripple_trends: data.ripple_trends || [],
      points_distribution: data.points_distribution || [],
      badge_distribution: data.badge_distribution || [],
      geographic_data: data.geographic_data || [],
      challenge_progress: data.challenge_progress || [],
      hourly_activity: data.hourly_activity || [],
      streak_data: data.streak_data || [],
      recent_activities: data.recent_activities || [],
    };
  };
  const handleRefresh = () => {
    loadData();
  };
  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting data...',
        description: 'Preparing your analytics report',
      });
      // Add export functionality here
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };
  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={32} />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Loading analytics...</p>
          <p className="text-gray-500 mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }
  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <AlertCircle className="text-red-500 mx-auto" size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-6">Oops! Something went wrong</h2>
          <p className="text-gray-600 mt-2 max-w-md">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition mx-auto"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-yellow-500 mx-auto" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mt-6">No Data Available</h2>
          <p className="text-gray-600 mt-2">No analytics data found for the selected period</p>
          <button
            onClick={handleRefresh}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition mx-auto"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>
    );
  }
  // Metric Cards Data
  const metricCards: MetricCardProps[] = [
    {
      title: 'Total Users',
      value: data.summary.total_users || { value: 0, change: 0 },
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'Active Users',
      value: data.summary.active_users || { value: 0, change: 0 },
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    },
    {
      title: 'Total Ripples',
      value: data.summary.total_ripples || { value: 0, change: 0 },
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    },
    {
      title: 'Total Points',
      value: data.summary.total_points || { value: 0, change: 0 },
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    },
    {
      title: 'Badges Earned',
      value: data.summary.badges_earned || { value: 0, change: 0 },
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
    },
    {
      title: 'Hero Wall Posts',
      value: data.summary.hero_wall_posts || { value: 0, change: 0 },
      icon: Star,
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100',
    },
  ];
  // Metric Card Component
  const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
  }) => {
    const displayValue = typeof value === 'object' ? value.value : value;
    const change = typeof value === 'object' ? value.change : 0;
    const trend = change > 0 ? 'up' : 'down';

    return (
      <div className={`${bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className={`p-2 sm:p-3 ${color} bg-opacity-10 rounded-lg sm:rounded-xl`}>
            <Icon className={color} size={18} />
          </div>
          <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}</div>
        <div className="text-xs sm:text-sm text-gray-600 font-medium truncate">{title}</div>
      </div>
    );
  };
  // Chart Section Component
  const ChartSection: React.FC<{
    title: string | React.ReactNode;
    children: React.ReactNode;
    className?: string;
  }> = ({ title, children, className = '' }) => (
    <div className={`bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-200 ${className}`}>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">{title}</h3>
      {children}
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
       
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-1">
                Real-time insights and performance metrics
              </p>
            </div>
          </div>
          {/* Filters and Actions */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-200">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="text-gray-400 flex-shrink-0" size={18} />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium transition text-sm sm:text-base"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>
               
                <div className="w-full overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                  <div className="flex gap-2 min-w-max sm:min-w-0">
                    {['overview', 'engagement', 'users', 'geography'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
             
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition shadow-lg hover:shadow-xl font-medium text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl font-medium text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {metricCards.map((card, index) => (
            <MetricCard key={index} {...card} />
          ))}
        </div>
        {/* Main Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Growth Trends */}
          <ChartSection
            title="Growth & Activity Trends"
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.growth_trends}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="new_users" stroke="#6366f1" fill="url(#colorNew)" strokeWidth={3} />
                <Area type="monotone" dataKey="active_users" stroke="#10b981" fill="url(#colorActive)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartSection>
          {/* Users by Role */}
          <ChartSection title="Users by Role">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.users_by_role}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="count"
                >
                  {data.users_by_role.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>
        {/* Ripple Activity & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Ripple Trends */}
          <ChartSection title="Ripple Activity Timeline">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.ripple_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
          {/* Ripple Categories */}
          <ChartSection title="Ripples by Category">
            <div className="space-y-4">
              {data.ripples_by_category.map((category, index) => {
                const total = data.ripples_by_category.reduce((sum, cat) => sum + cat.count, 0) || 1;
                const percentage = (category.count / total) * 100;
                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">{category.name}</span>
                      <span className="text-2xl font-bold" style={{ color: category.color }}>{category.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{percentage.toFixed(1)}% of total</div>
                  </div>
                );
              })}
            </div>
          </ChartSection>
        </div>
        {/* Points Distribution & Engagement */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Points Distribution */}
          <ChartSection
            title="Points Distribution by Activity"
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.points_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="activity" type="category" width={100} stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="points" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                  {data.points_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
          {/* Engagement Metrics */}
          <ChartSection title="Engagement Metrics">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <Heart className="text-red-600 flex-shrink-0" size={20} />
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">{data.engagement_metrics.likes}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">Total Likes</div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Across all ripples</div>
              </div>
             
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <MessageCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{data.engagement_metrics.comments}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">Total Comments</div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Active discussions</div>
              </div>
             
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <Share2 className="text-green-600 flex-shrink-0" size={20} />
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{data.engagement_metrics.shares}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">Total Shares</div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Community reach</div>
              </div>
            </div>
          </ChartSection>
        </div>
        {/* Top Performers & Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Top Users Leaderboard */}
          <ChartSection title={
            <div className="flex items-center justify-between w-full">
              <span>Top Performers</span>
              <Trophy className="text-yellow-500 flex-shrink-0" size={20} />
            </div>
          }>
            <div className="space-y-2 sm:space-y-3">
              {data.top_users.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all hover:scale-[1.02] ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400' :
                    'bg-gradient-to-r from-indigo-50 to-purple-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-indigo-600 text-white'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{user.nickname}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">{user.full_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Award className="text-yellow-600 flex-shrink-0" size={16} />
                    <span className="font-bold text-lg sm:text-xl md:text-2xl text-indigo-600">{user.total_points}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartSection>
          {/* Geographic Distribution */}
          <ChartSection title={
            <div className="flex items-center justify-between w-full">
              <span>Geographic Reach</span>
              <Globe className="text-blue-500 flex-shrink-0" size={20} />
            </div>
          }>
            <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
              {data.geographic_data.map((location, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <MapPin className="text-blue-600 flex-shrink-0" size={16} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{location.city}</div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">{location.country}</div>
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 flex-shrink-0">{location.count}</div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(location.count / 28) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartSection>
        </div>
        {/* Challenge Progress & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Challenge Progress */}
          <ChartSection title={
            <div className="flex items-center justify-between w-full">
              <span>Active Challenges</span>
              <Target className="text-indigo-500 flex-shrink-0" size={20} />
            </div>
          }>
            <div className="space-y-3 sm:space-y-4">
              {data.challenge_progress.map((challenge, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-200">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                    <div className="font-bold text-gray-900 text-sm sm:text-base truncate flex-1">{challenge.name}</div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <Users className="text-indigo-600 flex-shrink-0" size={14} />
                      <span className="text-xs sm:text-sm font-medium text-indigo-600">{challenge.participants}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-indigo-200 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${challenge.completion_rate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-indigo-600 flex-shrink-0">{challenge.completion_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartSection>
          {/* Recent Activities */}
          <ChartSection title={
            <div className="flex items-center justify-between w-full">
              <span>Recent Activities</span>
              <Activity className="text-blue-500 flex-shrink-0" size={20} />
            </div>
          }>
            <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
              {data.recent_activities.map((activity) => (
                <div key={activity.id} className="relative pl-4 sm:pl-6 pb-3 sm:pb-4 border-l-2 border-indigo-200 last:pb-0">
                  <div className={`absolute left-[-7px] sm:left-[-9px] top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-500' :
                    activity.status === 'completed' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate flex-1">{activity.user}</div>
                      <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">{activity.action}</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm font-medium text-indigo-600 truncate flex-1">{activity.title}</div>
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                        activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                        activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartSection>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;