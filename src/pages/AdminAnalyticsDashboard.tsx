import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  TrendingUp, Users, Award, Activity, Target, Download, Filter,
  Heart, MessageCircle, Share2, Star, MapPin, Globe, Clock,
  ArrowUp, ArrowDown, Sparkles, Trophy, UserCheck, Eye, RefreshCw,
  UserPlus, School, Users2, CheckCircle, AlertCircle, BarChart3, TrendingDown
} from 'lucide-react';
import { apiFetch } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Types
interface MetricValue {
  value: number;
  change: number;
}

interface AnalyticsSummary {
  total_users: MetricValue;
  active_users: MetricValue;
  total_ripples: MetricValue;
  approved_ripples: MetricValue;
  pending_ripples: MetricValue;
  total_points: MetricValue;
  badges_earned: MetricValue;
  hero_wall_posts: MetricValue;
  total_likes: MetricValue;
  total_comments: MetricValue;
  total_shares: MetricValue;
  avg_engagement: MetricValue;
  countries_reached: MetricValue;
  cities_reached: MetricValue;
  total_distance: MetricValue;
  active_challenges: number;
  completed_challenges: number;
}

interface AdminAnalyticsData {
  summary: AnalyticsSummary;
  users_by_role: Array<{ role: string; count: number }>;
  ripples_by_status: Array<{ status: string; count: number }>;
  ripples_by_category: Array<{ name: string; count: number; color: string }>;
  engagement_metrics: { likes: number; comments: number; shares: number; views: number };
  top_users: Array<{ id: number; nickname: string; full_name: string; total_points: number }>;
  top_ripples: Array<{ id: number; title: string; likes_count: number; user_name: string }>;
  growth_trends: Array<{ date: string; new_users: number; active_users: number }>;
  ripple_trends: Array<{ date: string; count: number; approved: number; pending: number }>;
  points_distribution: Array<{ activity: string; points: number; count: number }>;
  badge_distribution: Array<{ name: string; count: number }>;
  geographic_data: Array<{ country: string; city: string; count: number }>;
  challenge_progress: Array<{ name: string; participants: number; completion_rate: number }>;
  hourly_activity: Array<{ hour: string; count: number }>;
  streak_data: Array<{ range: string; users: number }>;
  recent_activities: Array<{ id: number; user: string; action: string; title: string; time: string; status: string }>;
}

const AdminAnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<string>('30days');
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [personalData, setPersonalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('overview');

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  useEffect(() => {
    loadData();
    loadPersonalActivity();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response: any = await apiFetch(`/analytics/dashboard?period=${period}`);

      if (response?.success && response.data) {
        setData(enrichData(response.data));
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

  const enrichData = (data: any): AdminAnalyticsData => {
    if (data.ripples_by_category) {
      data.ripples_by_category = data.ripples_by_category.map((cat: any, idx: number) => ({
        ...cat,
        color: cat.color || COLORS[idx % COLORS.length]
      }));
    }
    return data;
  };

  const loadPersonalActivity = async () => {
    try {
      const response: any = await apiFetch(`/analytics/my-personal-activity?period=${period}`);
      if (response?.success && response.data) {
        setPersonalData(response.data);
      }
    } catch (err: any) {
      console.error('Error loading personal activity:', err);
    }
  };

  const handleExport = async () => {
    try {
      toast({ title: 'Exporting...', description: 'Preparing analytics report' });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/analytics/export?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'text/csv'
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Analytics exported successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to export analytics',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <BarChart3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={32} />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold">Loading Admin Analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-yellow-500 mx-auto" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mt-6">No Data Available</h2>
          <button onClick={loadData} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            <RefreshCw size={20} className="inline mr-2" /> Refresh
          </button>
        </div>
      </div>
    );
  }

  // Metric Cards Configuration
  const metricCards = [
    {
      title: 'Total Users',
      value: data.summary.total_users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: data.summary.active_users,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Total Teachers',
      value: { value: data.users_by_role.find(r => r.role === 'teacher')?.count || 0, change: 0 },
      icon: School,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Total Ripples',
      value: data.summary.total_ripples,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-100'
    },
    {
      title: 'Approved Ripples',
      value: data.summary.approved_ripples,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-100'
    },
    {
      title: 'Pending Approvals',
      value: data.summary.pending_ripples,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'Total Points',
      value: data.summary.total_points,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Badges Earned',
      value: data.summary.badges_earned,
      icon: Trophy,
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100',
      iconBg: 'bg-pink-100'
    },
    {
      title: 'Hero Wall Posts',
      value: data.summary.hero_wall_posts,
      icon: Star,
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100',
      iconBg: 'bg-rose-100'
    },
    {
      title: 'Countries Reached',
      value: data.summary.countries_reached,
      icon: Globe,
      color: 'text-cyan-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      iconBg: 'bg-cyan-100'
    },
  ];

  const MetricCard = ({ title, value, icon: Icon, color, bgColor, iconBg }: any) => {
    const displayValue = typeof value === 'object' ? value.value : value;
    const change = typeof value === 'object' ? value.change : 0;
    const isPositive = change >= 0;

    return (
      <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${iconBg} rounded-xl shadow-sm`}>
            <Icon className={color} size={28} />
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-3xl font-black text-gray-900 mb-2">{displayValue.toLocaleString()}</div>
        <div className="text-sm text-gray-700 font-semibold">{title}</div>
      </div>
    );
  };

  const ChartSection = ({ title, description, children, className = '', actions }: any) => (
    <div className={`bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-2xl transition-all ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
          {description && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="max-w-[2000px] mx-auto">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Comprehensive platform insights and metrics
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {metricCards.map((card, index) => (
            <MetricCard key={index} {...card} />
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl my-3 sm:my-4 shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="text-gray-500 flex-shrink-0" size={18} />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium transition-all hover:border-indigo-300 text-sm sm:text-base"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              <div className="w-full overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex gap-2 min-w-max sm:min-w-0">
                  {['overview', 'engagement', 'users', 'performance', 'my-activity'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm whitespace-nowrap ${
                        activeView === view
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
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
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
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
            {/* Growth & Ripple Trends */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <ChartSection title="User Growth" description="Monthly registration trends">
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-36 sm:h-44 md:h-48 flex items-end justify-between gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide px-1 sm:px-2 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {data.growth_trends?.length > 0 ? (
                      data.growth_trends.map((item: any, index: number) => {
                        const maxCount = Math.max(...data.growth_trends.map((m: any) => m.new_users || 0));
                        const height = maxCount > 0 ? ((item.new_users || 0) / maxCount) * 180 : 0;
                        // Format date to YYYY-MM format
                        const formatDate = (dateStr: string) => {
                          try {
                            const date = new Date(dateStr);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            return `${year}-${month}`;
                          } catch {
                            // If date is already in YYYY-MM format, return as is
                            return dateStr.length > 7 ? dateStr.substring(0, 7) : dateStr;
                          }
                        };
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t"
                              style={{ height: `${height}px` }}
                            />
                            <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                            <span className="text-xs font-medium">{item.new_users || 0}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-8">No data available</div>
                    )}
                  </div>
                  {(() => {
                    const totalRegistrations = data.growth_trends.reduce((sum, item) => sum + (item.new_users || 0), 0);
                    const monthlyAverage = data.growth_trends.length > 0 ? (totalRegistrations / data.growth_trends.length).toFixed(1) : '0';
                    const isGrowing = data.growth_trends.length >= 2 && 
                      (data.growth_trends[data.growth_trends.length - 1].new_users || 0) > (data.growth_trends[data.growth_trends.length - 2].new_users || 0);
                    return (
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t mt-2 sm:mt-3">
                        <div className="text-center">
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{totalRegistrations}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Registrations</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{monthlyAverage}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly Average</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={isGrowing ? 'default' : 'secondary'} className="text-[10px] sm:text-xs uppercase">
                            {isGrowing ? 'Growing' : 'Declining'}
                          </Badge>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Growth Trend</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </ChartSection>

              <ChartSection title="Ripple Activity Timeline">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.ripple_trends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="approved" fill="#10b981" radius={[8, 8, 0, 0]} name="Approved" />
                    <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>
            </div>

            {/* Users by Role & Ripples by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <ChartSection title="User Distribution by Role">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.users_by_role}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      dataKey="count"
                    >
                      {data.users_by_role.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartSection>

              <ChartSection title="Ripples by Category">
                <div className="space-y-4">
                  {data.ripples_by_category.map((category, index) => {
                    const total = data.ripples_by_category.reduce((sum, cat) => sum + cat.count, 0) || 1;
                    const percentage = (category.count / total) * 100;
                    return (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800">{category.name}</span>
                          <span className="text-2xl font-black" style={{ color: category.color }}>{category.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: category.color
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 mt-1 font-medium">{percentage.toFixed(1)}% of total</div>
                      </div>
                    );
                  })}
                </div>
              </ChartSection>
            </div>
          </>
        )}

        {/* Engagement View */}
        {activeView === 'engagement' && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {/* Engagement Metrics Cards */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <ChartSection title="Engagement Overview" className="h-full">
                  <div className="space-y-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <Heart className="text-red-600" size={20} />
                        <span className="text-2xl sm:text-3xl font-black text-red-600">{data.engagement_metrics.likes.toLocaleString()}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 font-semibold">Total Likes</div>
                    </div>

                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <MessageCircle className="text-blue-600" size={20} />
                        <span className="text-2xl sm:text-3xl font-black text-blue-600">{data.engagement_metrics.comments.toLocaleString()}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 font-semibold">Total Comments</div>
                    </div>

                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <Share2 className="text-green-600" size={20} />
                        <span className="text-2xl sm:text-3xl font-black text-green-600">{data.engagement_metrics.shares.toLocaleString()}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 font-semibold">Total Shares</div>
                    </div>

                    <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="text-purple-600" size={20} />
                        <span className="text-2xl sm:text-3xl font-black text-purple-600">{data.engagement_metrics.views.toLocaleString()}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 font-semibold">Total Views</div>
                    </div>
                  </div>
                </ChartSection>
              </div>

              {/* Points Distribution */}
              <ChartSection title="Points Distribution" className="xl:col-span-2">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.points_distribution} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number" 
                      stroke="#6b7280" 
                      domain={[0,Math.round(Math.max(...data.points_distribution.map(item => item.points)) * 1.1)]} // Calculate max with padding
                    />
                    <YAxis 
                      dataKey="activity" 
                      type="category" 
                      width={150} 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }} 
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="points" radius={[0, 8, 8, 0]}>
                      {data.points_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>
            </div>

            {/* Hourly Activity */}
            <ChartSection title="Hourly Activity Pattern">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.hourly_activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} name="Activities" />
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>
          </>
        )}

        {/* Users View */}
        {activeView === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Top Performers */}
            <ChartSection title={
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-500" size={28} />
                <span>Top Performers</span>
              </div>
            }>
              <div className="space-y-3">
                {data.top_users.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 shadow-lg' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400 shadow-md' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400 shadow-md' :
                      'bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${
                        index === 0 ? 'bg-yellow-500 text-white shadow-lg' :
                        index === 1 ? 'bg-gray-400 text-white shadow-md' :
                        index === 2 ? 'bg-orange-500 text-white shadow-md' :
                        'bg-indigo-600 text-white'
                      }`}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{user.nickname}</div>
                        <div className="text-sm text-gray-600">{user.full_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="text-yellow-600" size={24} />
                      <span className="font-black text-2xl text-indigo-600">{user.total_points.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartSection>

            {/* Geographic Distribution */}
            <ChartSection title={
              <div className="flex items-center gap-3">
                <Globe className="text-blue-500" size={28} />
                <span>Geographic Reach</span>
              </div>
            }>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {data.geographic_data.map((location, index) => (
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
                        style={{ width: `${(location.count / Math.max(...data.geographic_data.map(g => g.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartSection>
          </div>
        )}

        {/* Performance View */}
        {activeView === 'performance' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {/* Challenge Progress */}
              <ChartSection title={
                <div className="flex items-center gap-3">
                  <Target className="text-indigo-500" size={28} />
                  <span>Active Challenges</span>
                </div>
              }>
                <div className="space-y-4">
                  {data.challenge_progress.map((challenge, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-gray-900">{challenge.name}</div>
                        <div className="flex items-center gap-2">
                          <Users2 className="text-indigo-600" size={18} />
                          <span className="text-sm font-bold text-indigo-600">{challenge.participants}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-indigo-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${challenge.completion_rate}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-lg font-black text-indigo-600">{challenge.completion_rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartSection>

              {/* Top Ripples */}
              <ChartSection title={
                <div className="flex items-center gap-3">
                  <Star className="text-pink-500" size={28} />
                  <span>Trending Ripples</span>
                </div>
              }>
                <div className="space-y-3">
                  {data.top_ripples.map((ripple, index) => (
                    <div key={ripple.id} className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 mb-1">{ripple.title}</div>
                          <div className="text-sm text-gray-600">by {ripple.user_name}</div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                          <Heart className="text-red-500" size={18} fill="#ef4444" />
                          <span className="font-bold text-gray-900">{ripple.likes_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartSection>
            </div>

            {/* Badge Distribution & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <ChartSection title="Badge Distribution">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.badge_distribution} margin={{ top: 5, right: 10, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>

              <ChartSection title="Recent Activities">
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {data.recent_activities.map((activity) => (
                    <div key={activity.id} className="relative pl-6 pb-4 border-l-2 border-indigo-200 last:pb-0">
                      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${
                        activity.status === 'approved' ? 'bg-green-500' :
                        activity.status === 'completed' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-semibold text-gray-900">{activity.user}</div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        {/* <div className="text-sm text-gray-600 mb-1">{activity.action}</div> */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-indigo-600">{activity.title}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
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
          </>
        )}

        {/* My Activity View */}
        {activeView === 'my-activity' && personalData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Personal Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {[
                { label: 'My Ripples', value: personalData.summary.total_ripples, icon: Activity, color: 'indigo' },
                { label: 'Total Likes', value: personalData.summary.total_likes, icon: Heart, color: 'pink' },
                { label: 'Comments', value: personalData.summary.total_comments, icon: MessageCircle, color: 'blue' },
                { label: 'Shares', value: personalData.summary.total_shares, icon: Share2, color: 'green' },
                { label: 'Points Earned', value: personalData.summary.total_points, icon: Star, color: 'yellow' },
              ].map((stat) => {
                const Icon = stat.icon;
                const displayValue = typeof stat.value === 'object' ? stat.value.value : stat.value;
                const change = typeof stat.value === 'object' ? stat.value.change : 0;

                return (
                  <div key={stat.label} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-2xl p-5 shadow-lg border border-white/50`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`text-${stat.color}-600`} size={24} />
                      <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
                    </div>
                    <p className={`text-3xl font-black text-${stat.color}-600`}>{displayValue?.toLocaleString()}</p>
                    {change !== 0 && (
                      <p className={`text-sm font-bold mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Top Stories */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} />
                My Top Stories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalData.top_stories?.map((story: any, index: number) => (
                  <div key={story.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 hover:shadow-lg transition-all">
                    {index < 3 && (
                      <span className="text-3xl mb-2 block">{['🥇', '🥈', '🥉'][index]}</span>
                    )}
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Heart size={16} className="text-pink-500" />
                        {story.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={16} className="text-blue-500" />
                        {story.comments_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Reach */}
            {personalData.geographic_reach && personalData.geographic_reach.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="text-green-500" size={24} />
                  My Referral Reach
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Total Referrals</p>
                    <p className="text-3xl font-black text-green-600">{personalData.referral_stats?.total_referrals || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Countries Reached</p>
                    <p className="text-3xl font-black text-blue-600">{personalData.referral_stats?.countries_reached || 0}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {personalData.geographic_reach.map((location: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <span className="font-semibold text-gray-900">{location.city}, {location.country}</span>
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">{location.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges Earned */}
            {personalData.badges_earned && personalData.badges_earned.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="text-purple-500" size={24} />
                  Recent Badges Earned
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {personalData.badges_earned.map((badge: any, index: number) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center text-3xl">
                        🏆
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{new Date(badge.earned_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
