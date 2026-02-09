import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, CreditCard, Activity, TrendingUp, Globe, Heart, Share2, Award } from 'lucide-react';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 1234,
      activeUsers: 892,
      totalRipples: 5678,
      totalCards: 345,
      engagement: 78
    },
    userGrowth: [],
    rippleActivity: [],
    regionData: [],
    categoryBreakdown: []
  });

  useEffect(() => {
    // Generate sample analytics data
    const userGrowth = [
      { date: 'Jan 14', users: 120, ripples: 45 },
      { date: 'Jan 15', users: 132, ripples: 52 },
      { date: 'Jan 16', users: 145, ripples: 61 },
      { date: 'Jan 17', users: 158, ripples: 58 },
      { date: 'Jan 18', users: 170, ripples: 72 },
      { date: 'Jan 19', users: 185, ripples: 89 },
      { date: 'Jan 20', users: 198, ripples: 95 }
    ];

    const rippleActivity = [
      { hour: '00:00', ripples: 12 },
      { hour: '04:00', ripples: 8 },
      { hour: '08:00', ripples: 45 },
      { hour: '12:00', ripples: 78 },
      { hour: '16:00', ripples: 65 },
      { hour: '20:00', ripples: 52 }
    ];

    const regionData = [
      { region: 'North America', users: 450, percentage: 36.5 },
      { region: 'Europe', users: 320, percentage: 26 },
      { region: 'Asia', users: 280, percentage: 22.7 },
      { region: 'South America', users: 120, percentage: 9.7 },
      { region: 'Other', users: 64, percentage: 5.1 }
    ];

    const categoryBreakdown = [
      { category: 'Helping', value: 35, color: '#3b82f6' },
      { category: 'Environment', value: 25, color: '#10b981' },
      { category: 'Community', value: 20, color: '#f59e0b' },
      { category: 'Education', value: 15, color: '#8b5cf6' },
      { category: 'Other', value: 5, color: '#6b7280' }
    ];

    setAnalytics({
      overview: {
        totalUsers: 1234,
        activeUsers: 892,
        totalRipples: 5678,
        totalCards: 345,
        engagement: 78
      },
      userGrowth,
      rippleActivity,
      regionData,
      categoryBreakdown
    });
  }, [timeRange]);

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Analytics & Reporting
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">72% of total users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ripples</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalRipples}</div>
            <p className="text-xs text-muted-foreground">+45% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Generated</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCards}</div>
            <p className="text-xs text-muted-foreground">+8% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.engagement}%</div>
            <p className="text-xs text-muted-foreground">+5% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth & Ripple Activity</CardTitle>
            <CardDescription>Daily trends over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: { label: "Users", color: "hsl(var(--primary))" },
                ripples: { label: "Ripples", color: "hsl(var(--secondary))" }
              }}
            >
              <LineChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="ripples" stroke="hsl(var(--secondary))" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Ripple Categories</CardTitle>
            <CardDescription>Distribution by type of kindness acts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Percentage", color: "hsl(var(--primary))" }
              }}
            >
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {analytics.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.category}</span>
                  </div>
                  <span className="font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>User distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: { label: "Users", color: "hsl(var(--primary))" }
              }}
            >
              <BarChart data={analytics.regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="hsl(var(--primary))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Time of Day</CardTitle>
            <CardDescription>When users are most active</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ripples: { label: "Ripples", color: "hsl(var(--secondary))" }
              }}
            >
              <AreaChart data={analytics.rippleActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="ripples" 
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary))" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}