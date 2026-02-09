import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Heart,
  Clock,
  RefreshCw,
  Award,
  School,
  BarChart3,
  Calendar,
  Filter,
  Settings,
  UserPlus,
  UserMinus,
  Zap,
  Shield,
  BookOpen,
  Target,
  Sprout,
  Building,
  Users2,
  BarChart,
  Palette,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Seo from '@/components/Seo';

// Activity Section Component
const ActivitySection = ({ activities, type, color, icon: Icon }: { 
  activities: any[], 
  type: string, 
  color: string, 
  icon: any 
}) => {
  const colorClasses = {
    red: 'from-red-50 to-transparent border-red-200 bg-red-100 text-red-600',
    blue: 'from-blue-50 to-transparent border-blue-200 bg-blue-100 text-blue-600',
    green: 'from-green-50 to-transparent border-green-200 bg-green-100 text-green-600',
    purple: 'from-purple-50 to-transparent border-purple-200 bg-purple-100 text-purple-600',
    yellow: 'from-yellow-50 to-transparent border-yellow-200 bg-yellow-100 text-yellow-600'
  };

  const badgeColors = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-700'
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Icon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No {type.replace('_', ' ')} activities</p>
        <p className="text-xs text-gray-400 mt-1">Activities will appear here as they happen</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Count indicator */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          Showing <span className="font-medium">{activities.length}</span> {type.replace('_', ' ')} activities
        </p>
      </div>
      
        {activities.map((activity: any, index: number) => (
        <div key={activity.id || index} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-gray-50 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}>
          <div className="flex items-start gap-2 sm:gap-3 w-full sm:w-auto min-w-0 flex-1">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <p className="font-medium text-xs sm:text-sm truncate">{activity.user?.full_name || activity.user?.nickname || 'System'}</p>
                {activity.user?.role && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1 py-0">
                    {activity.user.role}
                  </Badge>
                )}
                <Badge variant="secondary" className={`text-[10px] sm:text-xs px-1 py-0 ${badgeColors[color as keyof typeof badgeColors]}`}>
                  {type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">{activity.title}</p>
              {activity.description && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
              )}
              {activity.category?.name && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] sm:text-xs text-gray-400">Category:</span>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                    {activity.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 mt-2 sm:mt-0 ml-auto sm:ml-0">
            <Badge 
              variant={
                activity.status === 'approved' ? 'default' : 
                activity.status === 'under_review' ? 'secondary' : 
                activity.status === 'new' ? 'destructive' :
                'outline'
              } 
              className="text-[10px] sm:text-xs"
            >
              {activity.action_type || activity.type.replace('_', ' ')}
            </Badge>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {new Date(activity.activity_date).toLocaleDateString()}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">
              {new Date(activity.activity_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any>(null);
  const [monthlyGrowthChart, setMonthlyGrowthChart] = useState<any>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Activity filter states (kept for potential future use)
  const [activityPeriod, setActivityPeriod] = useState('this_week');
  const [activityType, setActivityType] = useState('support');
  const [activityLimit, setActivityLimit] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch activities when tab changes to activity
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data sequentially to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Core dashboard data first
      try {
        const overviewRes = await apiFetch<any>('/admin/dashboard/overview');
        if (overviewRes.success) setOverview(overviewRes.data);
        await delay(100); // Small delay between requests
      } catch (err) {
        console.warn('Overview fetch failed:', err);
      }

      // Activities data
      try {
        const activitiesRes = await apiFetch<any>('/admin/dashboard/recent-activities');
        if (activitiesRes.success) setRecentActivities(activitiesRes.data.activities || []);
        await delay(100);
      } catch (err) {
        console.warn('Recent activities fetch failed:', err);
      }

      // User growth data
      try {
        const userGrowthRes = await apiFetch<any>('/admin/dashboard/user-growth');
        if (userGrowthRes.success) setUserGrowth(userGrowthRes.data);
        await delay(100);
      } catch (err) {
        console.warn('User growth fetch failed:', err);
      }

      // Engagement metrics
      try {
        const engagementRes = await apiFetch<any>('/admin/dashboard/engagement-metrics');
        if (engagementRes.success) setEngagementMetrics(engagementRes.data);
        await delay(100);
      } catch (err) {
        console.warn('Engagement metrics fetch failed:', err);
      }

      // Top performers
      try {
        const topPerformersRes = await apiFetch<any>('/admin/dashboard/top-performers');
        if (topPerformersRes.success) setTopPerformers(topPerformersRes.data);
        await delay(100);
      } catch (err) {
        console.warn('Top performers fetch failed:', err);
      }

      // Monthly growth chart
      try {
        const monthlyGrowthRes = await apiFetch<any>('/admin/dashboard/monthly-growth-chart');
        if (monthlyGrowthRes.success) setMonthlyGrowthChart(monthlyGrowthRes.data);
      } catch (err) {
        console.warn('Monthly growth chart fetch failed:', err);
      }

    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      if (err.message?.includes('RATE_LIMIT_EXCEEDED')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please check your authentication.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const activitiesRes = await apiFetch<any>('/admin/dashboard/recent-activities');
      if (activitiesRes.success) setRecentActivities(activitiesRes.data.activities || []);
    } catch (err: any) {
      console.error('Activities fetch error:', err);
      if (err.message?.includes('RATE_LIMIT_EXCEEDED')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load activities data.",
          variant: "destructive",
        });
      }
    }
  };

  const fetchActivitiesByType = async (type: string) => {
    try {
      const activitiesRes = await apiFetch<any>('/admin/dashboard/recent-activities');
      if (activitiesRes.success) {
        setRecentActivities(activitiesRes.data.activities || []);
      }
    } catch (err: any) {
      console.error('Activities fetch error:', err);
      if (err.message?.includes('RATE_LIMIT_EXCEEDED')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load activities data.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: 'Dashboard refreshed',
      description: 'Latest data has been loaded'
    });
  };

  // Mock data for chart
  const chartData = [
    { month: 'Jan', value: 5 },
    { month: 'Feb', value: 20 },
    { month: 'Mar', value: 15 },
    { month: 'Apr', value: 30 },
    { month: 'May', value: 28 },
    { month: 'Jun', value: 20 },
    { month: 'Jul', value: 100 },
    { month: 'Aug', value: 120 },
    { month: 'Sep', value: 70 },
    { month: 'Oct', value: 90 },
    { month: 'Nov', value: 100 },
    { month: 'Dec', value: 140 },
  ];

  return (
    <>
      <Seo
        title="Admin Dashboard — Pass The Ripple"
        description="Manage and moderate Pass The Ripple platform"
        canonical={`${window.location.origin}/admin-dashboard`}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Pass The Ripple Admin Dashboard' }}
      />
      
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              System overview and management
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              <span className="sm:hidden">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{overview?.cards?.total_users?.toLocaleString() || '3,542'}</p>
                  <p className="text-[10px] sm:text-xs text-green-600 mt-1">+127 this week</p>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{overview?.cards?.active_users?.toLocaleString() || '2,891'}</p>
                  <div className="mt-2">
                    <Progress value={75} className="h-1 sm:h-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-pink-50 to-pink-100/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Ripples</p>
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{overview?.cards?.total_ripples?.toLocaleString() || '15,234'}</p>
                  {/* <p className="text-xs text-green-600 mt-1">+342 today</p> */}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Pending Reviews</p>
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{overview?.cards?.pending_reviews?.toLocaleString() || '23'}</p>
                  <Badge className="mt-2 text-[10px] sm:text-xs bg-cyan-500 text-white hover:bg-cyan-600">
                    Requires action
                  </Badge>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto mb-4 sm:mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <TabsList className="grid w-full min-w-max grid-cols-4 gap-1 sm:gap-2">
              <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">Recent Activity</TabsTrigger>
              <TabsTrigger value="growth" className="text-xs sm:text-sm whitespace-nowrap">Growth Charts</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm whitespace-nowrap">Analytics</TabsTrigger>
            {/* Commented out tabs - System Health and Pending Reviews */}
            {/* 
            <TabsTrigger value="reviews">
              Pending Reviews
              {!loading && pendingReviews.length > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            */}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* User Growth Chart */}
              <Card>
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">{userGrowth?.title || 'User Growth'}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{userGrowth?.subtitle || 'Monthly registration trends'}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
                  {loading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="space-y-4">
                    <div className="h-48 flex items-end justify-between gap-2">
                        {userGrowth?.months?.length > 0 ? (
                          userGrowth.months.map((item: any, index: number) => {
                            const maxCount = Math.max(...userGrowth.months.map((m: any) => m.count));
                            const height = (item.count / maxCount) * 180;
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                  className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t"
                                  style={{ height: `${height}px` }}
                                />
                                <span className="text-xs text-muted-foreground">{item.month}</span>
                                <span className="text-xs font-medium">{item.count}</span>
                              </div>
                            );
                          })
                        ) : (
                          chartData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t"
                            style={{ height: `${item.value * 1.5}px` }}
                          />
                          <span className="text-xs text-muted-foreground">{item.month}</span>
                        </div>
                          ))
                        )}
                      </div>
                      {userGrowth && (
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t mt-2 sm:mt-3">
                          <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{userGrowth.total_registrations}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Registrations</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{userGrowth.average_monthly}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly Average</p>
                          </div>
                          <div className="text-center">
                            <Badge variant={userGrowth.growth_trend === 'growing' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                              {userGrowth.growth_trend}
                            </Badge>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Growth Trend</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">{engagementMetrics?.title || 'Engagement Metrics'}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{engagementMetrics?.subtitle || 'Platform activity overview'}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Daily Active Users</span>
                        <span className="text-sm sm:text-base font-semibold">
                          {engagementMetrics?.metrics?.daily_active_users?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Avg Session Duration</span>
                        <span className="text-sm sm:text-base font-semibold">
                          {engagementMetrics?.metrics?.avg_session_duration_minutes || 0} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Ripples Per User</span>
                        <span className="text-sm sm:text-base font-semibold">
                          {engagementMetrics?.metrics?.ripples_per_user || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Challenge Completion</span>
                        <span className="text-sm sm:text-base font-semibold">
                          {engagementMetrics?.metrics?.challenge_completion_rate_pct || 0}%
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{topPerformers?.title || 'Top Performers This Month'}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{topPerformers?.subtitle || 'Most active users and classrooms'}</CardDescription>
                  </div>
                  <Button 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {/* Top Students */}
                  <div>
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h4 className="font-medium text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                        {topPerformers?.top_students?.title || 'Top Students'}
                      </h4>
                      {topPerformers?.top_students?.students?.length > 0 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {topPerformers.top_students.students.length} students
                        </Badge>
                      )}
                    </div>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topPerformers?.top_students?.students?.length > 0 ? (
                          topPerformers.top_students.students.slice(0, 5).map((student: any, index: number) => (
                            <div key={student.id || index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 block truncate">{student.name}</span>
                                  <div className="text-[10px] sm:text-xs text-gray-500">Student ID: {student.id}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <span className="text-xs sm:text-sm font-semibold text-blue-600">{student.points} points</span>
                                <div className="text-[10px] sm:text-xs text-gray-500">This month</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No student performance data available</p>
                            <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
                            </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Top Classrooms */}
                  <div>
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h4 className="font-medium text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        <School className="h-3 w-3 sm:h-4 sm:w-4" />
                        {topPerformers?.top_classrooms?.title || 'Top Classrooms'}
                      </h4>
                      {topPerformers?.top_classrooms?.classrooms?.length > 0 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {topPerformers.top_classrooms.classrooms.length} classrooms
                        </Badge>
                      )}
                    </div>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topPerformers?.top_classrooms?.classrooms?.length > 0 ? (
                          topPerformers.top_classrooms.classrooms.slice(0, 5).map((classroom: any, index: number) => (
                            <div key={classroom.id || index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 block truncate">{classroom.name}</span>
                                  <div className="text-[10px] sm:text-xs text-gray-500">Classroom ID: {classroom.id}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <span className="text-xs sm:text-sm font-semibold text-green-600">{classroom.ripples} ripples</span>
                                <div className="text-[10px] sm:text-xs text-gray-500">This month</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <School className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No classroom performance data available</p>
                            <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
                            </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {/* Classroom Impact Summary */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Your Classroom Impact</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Track your students' kindness journey</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">Student Actions</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-600">
                      {recentActivities.filter(a => a.type === 'ripple_action').length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Kindness activities completed</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Sprout className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium">New Students</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600">
                      {recentActivities.filter(a => a.type === 'user_registration').length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Students joined your class</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      <span className="text-xs sm:text-sm font-medium">Support Requests</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-red-600">
                      {recentActivities.filter(a => a.type === 'contact_inquiry').length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Questions & assistance</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Building className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      <span className="text-xs sm:text-sm font-medium">Classroom Updates</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-1 text-purple-600">
                      {recentActivities.filter(a => a.type === 'admin_action').length}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Management activities</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Activity Sections */}
            <div className="space-y-4 sm:space-y-6">
              {/* Support & Contact Activities */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        Support & Contact
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Questions from parents, students, and colleagues</CardDescription>
                    </div>
                    <Button 
                      onClick={() => fetchActivitiesByType('support')} 
                      disabled={refreshing}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ActivitySection 
                      activities={recentActivities.filter(a => a.type === 'contact_inquiry')} 
                      type="contact_inquiry"
                      color="red"
                      icon={Heart}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Student Kindness Actions */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Student Kindness Actions
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Your students' acts of kindness and community service</CardDescription>
                    </div>
                    <Button 
                      onClick={() => fetchActivitiesByType('ripple_actions')} 
                      disabled={refreshing}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ActivitySection 
                      activities={recentActivities.filter(a => a.type === 'ripple_action')} 
                      type="ripple_action"
                      color="blue"
                      icon={Zap}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Classroom Growth */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Sprout className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        Classroom Growth
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">New students joining and classroom updates</CardDescription>
                    </div>
                    <Button 
                      onClick={() => fetchActivitiesByType('user_management')} 
                      disabled={refreshing}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ActivitySection 
                      activities={recentActivities.filter(a => a.type === 'user_registration' || a.type === 'user_update')} 
                      type="user_management"
                      color="green"
                      icon={Users}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Teaching Management */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        Teaching Management
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Your classroom management and teaching activities</CardDescription>
                    </div>
                    <Button 
                      onClick={() => fetchActivitiesByType('admin_actions')} 
                      disabled={refreshing}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ActivitySection 
                      activities={recentActivities.filter(a => a.type === 'admin_action')} 
                      type="admin_action"
                      color="purple"
                      icon={Shield}
                    />
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Commented out - Pending Reviews Tab */}
          {/*
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Content awaiting moderation</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : pendingReviews.length > 0 ? (
                  <div className="space-y-3">
                    {pendingReviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.author}</p>
                            <p className="text-sm text-muted-foreground">{review.school || 'Unknown School'}</p>
                          </div>
                          <Badge variant="outline">{review.type || 'submission'}</Badge>
                        </div>
                        <p className="text-sm mb-3">{review.content}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">Approve</Button>
                          <Button size="sm" variant="outline">Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No pending reviews</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          */}

          <TabsContent value="growth" className="space-y-4">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Monthly Growth Chart */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    {monthlyGrowthChart?.title || 'Monthly Growth Chart'}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{monthlyGrowthChart?.subtitle || 'Detailed monthly growth analysis'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="space-y-4">
                      <div className="h-64 flex items-end justify-between gap-2">
                        {monthlyGrowthChart?.months?.length > 0 ? (
                          monthlyGrowthChart.months.map((item: any, index: number) => {
                            const maxCount = Math.max(...monthlyGrowthChart.months.map((m: any) => m.count));
                            const height = (item.count / maxCount) * 200;
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                                  style={{ height: `${height}px` }}
                                />
                                <span className="text-xs text-muted-foreground">{item.month}</span>
                                <span className="text-xs font-medium">{item.count}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                            No growth data available
                          </div>
                        )}
                      </div>
                      {monthlyGrowthChart && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t mt-2 sm:mt-3">
                          <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{monthlyGrowthChart.total_registrations || 0}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Registrations</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{monthlyGrowthChart.average_monthly || 0}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly Average</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Growth Summary */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Growth Summary
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Key growth indicators and trends</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-green-50">
                        <span className="text-xs sm:text-sm font-medium">Peak Month</span>
                        <span className="text-xs sm:text-sm font-semibold text-green-600">
                          {userGrowth?.peak_month?.month_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-blue-50">
                        <span className="text-xs sm:text-sm font-medium">Peak Count</span>
                        <span className="text-xs sm:text-sm font-semibold text-blue-600">
                          {userGrowth?.peak_month?.count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-purple-50">
                        <span className="text-xs sm:text-sm font-medium">Growth Trend</span>
                        <Badge variant={userGrowth?.growth_trend === 'growing' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                          {userGrowth?.growth_trend || 'stable'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-amber-50">
                        <span className="text-xs sm:text-sm font-medium">Total Users</span>
                        <span className="text-xs sm:text-sm font-semibold text-amber-600">
                          {userGrowth?.total_registrations || 0}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Teaching Analytics Overview */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Teaching Analytics</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Insights into your classroom's kindness journey</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Student Engagement Metrics */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Student Engagement
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How actively your students are participating</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-blue-50">
                    <span className="text-xs sm:text-sm font-medium">Active Students</span>
                    <span className="text-xs sm:text-sm font-semibold text-blue-600">
                      {engagementMetrics?.metrics?.daily_active_users || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-green-50">
                    <span className="text-xs sm:text-sm font-medium">Avg Session Time</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-600">
                      {engagementMetrics?.metrics?.avg_session_duration_minutes || 0} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-purple-50">
                    <span className="text-xs sm:text-sm font-medium">Kindness Actions per Student</span>
                    <span className="text-xs sm:text-sm font-semibold text-purple-600">
                      {engagementMetrics?.metrics?.ripples_per_user || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Classroom Achievement Progress */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    Classroom Achievements
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your class milestones and progress</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-yellow-50">
                    <span className="text-xs sm:text-sm font-medium">Challenge Completion Rate</span>
                    <span className="text-xs sm:text-sm font-semibold text-yellow-600">
                      {engagementMetrics?.metrics?.challenge_completion_rate_pct || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-orange-50">
                    <span className="text-xs sm:text-sm font-medium">Total Kindness Actions</span>
                    <span className="text-xs sm:text-sm font-semibold text-orange-600">
                      {recentActivities.filter(a => a.type === 'ripple_action').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-pink-50">
                    <span className="text-xs sm:text-sm font-medium">Classroom Growth</span>
                    <span className="text-xs sm:text-sm font-semibold text-pink-600">
                      {recentActivities.filter(a => a.type === 'user_registration').length} new students
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Teaching Insights */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Teaching Insights
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Key observations about your classroom's kindness journey</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Focus Area</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Your students are most active in kindness challenges. Consider introducing more community service activities.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Growth Opportunity</span>
                    </div>
                    <p className="text-xs text-green-700">
                      New students are joining regularly. Great job creating an inclusive classroom environment!
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Teaching Tip</span>
                    </div>
                    <p className="text-xs text-purple-700">
                      Students respond well to kindness challenges. Try creating weekly themed activities to boost engagement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commented out - System Health Tab */}
          {/*
          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Infrastructure and performance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Server Status</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Database</span>
                    <Badge variant="secondary">98% capacity</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>API Response Time</span>
                    <Badge variant="default">145ms avg</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Error Rate</span>
                    <Badge variant="default">0.02%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          */}
        </Tabs>
      </div>
    </>
  );
}