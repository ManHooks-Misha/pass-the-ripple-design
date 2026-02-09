import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Heart,
  TrendingUp,
  Award,
  Download,
  MapPin,
  Activity,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Target,
  Sprout,
  Building,
  Users2,
  BarChart as LucideBarChart,
  Palette,
  Search,
  Zap,
  Shield
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/config/api';
import Seo from '@/components/Seo';
import JoyrideTutorial from '@/components/JoyrideTutorial';
import { usePageTutorial } from '@/hooks/usePageTutorial';
import { teacherDashboardTutorialSteps } from '@/hooks/usePageTutorialSteps';
import { HelpCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_dashboard_tutorial_completed",
    steps: teacherDashboardTutorialSteps,
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [actsPerStudent, setActsPerStudent] = useState<any[]>([]);
  const [studentStatus, setStudentStatus] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('Starting teacher dashboard data fetch...');
      
      // Try individual API calls to see which ones work
      let overviewRes, teachingMilestonesRes, studentAchievementsRes, summaryMetricsRes, inspiringMessageRes, recentActivitiesRes, pendingReviewsRes, trendRes, actsPerStudentRes, studentStatusRes;
      
      try {
        overviewRes = await apiFetch<any>('/teacher/dashboard/overview');
        console.log('Overview API success:', overviewRes);
      } catch (err) {
        console.error('Overview API failed:', err);
        overviewRes = { data: {} };
      }
      
      try {
        teachingMilestonesRes = await apiFetch<any>('/teacher/dashboard/teaching-milestones');
        console.log('Teaching milestones API success:', teachingMilestonesRes);
      } catch (err) {
        console.error('Teaching milestones API failed:', err);
        teachingMilestonesRes = { data: { milestones: [] } };
      }
      
      try {
        studentAchievementsRes = await apiFetch<any>('/teacher/dashboard/student-achievements?limit=10');
        console.log('Student achievements API success:', studentAchievementsRes);
      } catch (err) {
        console.error('Student achievements API failed:', err);
        studentAchievementsRes = { data: { achievements: [] } };
      }
      
      try {
        summaryMetricsRes = await apiFetch<any>('/teacher/dashboard/summary-metrics');
        console.log('Summary metrics API success:', summaryMetricsRes);
      } catch (err) {
        console.error('Summary metrics API failed:', err);
        summaryMetricsRes = { data: { metrics: {} } };
      }
      
      try {
        inspiringMessageRes = await apiFetch<any>('/teacher/dashboard/inspiring-message');
        console.log('Inspiring message API success:', inspiringMessageRes);
      } catch (err) {
        console.error('Inspiring message API failed:', err);
        inspiringMessageRes = { data: { message: {} } };
      }
      
      try {
        recentActivitiesRes = await apiFetch<any>('/teacher/dashboard/recent-activities?limit=5');
        console.log('Recent activities API success:', recentActivitiesRes);
      } catch (err) {
        console.error('Recent activities API failed:', err);
        recentActivitiesRes = { data: [] };
      }
      
      try {
        pendingReviewsRes = await apiFetch<any>('/teacher/dashboard/pending-reviews?limit=5');
        console.log('Pending reviews API success:', pendingReviewsRes);
      } catch (err) {
        console.error('Pending reviews API failed:', err);
        pendingReviewsRes = { data: [] };
      }
      
      try {
        trendRes = await apiFetch<any>('/teacher/dashboard/trend?interval=daily');
        console.log('Trend API success:', trendRes);
      } catch (err) {
        console.error('Trend API failed:', err);
        trendRes = { data: [] };
      }
      
      try {
        actsPerStudentRes = await apiFetch<any>('/teacher/dashboard/acts-per-student?per_page=10');
        console.log('Acts per student API success:', actsPerStudentRes);
      } catch (err) {
        console.error('Acts per student API failed:', err);
        actsPerStudentRes = { data: { data: [] } };
      }
      
      try {
        studentStatusRes = await apiFetch<any>('/teacher/dashboard/student-status');
        console.log('Student status API success:', studentStatusRes);
      } catch (err) {
        console.error('Student status API failed:', err);
        studentStatusRes = { data: {} };
      }

      console.log('API Responses:', {
        overview: overviewRes,
        teachingMilestones: teachingMilestonesRes,
        studentAchievements: studentAchievementsRes,
        summaryMetrics: summaryMetricsRes,
        inspiringMessage: inspiringMessageRes,
        recentActivities: recentActivitiesRes,
        pendingReviews: pendingReviewsRes,
        trend: trendRes,
        actsPerStudent: actsPerStudentRes,
        studentStatus: studentStatusRes
      });

      // Process overview data using the correct API structure
      const overviewData = overviewRes?.data || {};
      console.log('Overview data:', overviewData);
      setOverview(overviewData);

      // Process teaching milestones from overview data (it's already there!)
      const overviewMilestones = overviewData?.teaching_milestones || [];
      const separateMilestones = teachingMilestonesRes?.data?.milestones || [];
      const milestonesData = overviewMilestones.length > 0 ? overviewMilestones : separateMilestones;
      console.log('Teaching milestones data:', milestonesData);
      console.log('Overview milestones:', overviewMilestones);
      console.log('Separate milestones:', separateMilestones);
      
      if (milestonesData.length === 0) {
        // Fallback to static milestones if API returns empty
        const staticMilestones = [
          {
            title: "Learning Facilitator",
            status: "achieved",
            progress_pct: 100,
            current: 20,
            target: 10,
            description: "Successfully guided 10+ students",
            icon: "books",
            color: "blue"
          },
          {
            title: "Student Motivator",
            status: "achieved",
            progress_pct: 100,
            current: 100,
            target: 100,
            description: "Inspired 100+ student actions",
            icon: "star",
            color: "purple"
          },
          {
            title: "Classroom Champion",
            status: "achieved",
            progress_pct: 100,
            current: 100,
            target: 100,
            description: "All students actively engaged",
            icon: "trophy",
            color: "green"
          }
        ];
        setMilestones(staticMilestones);
        console.log('Using static milestones fallback');
      } else {
        setMilestones(milestonesData);
      }

      // Process student achievements from overview data (it's already there!)
      const overviewActivities = overviewData?.recent_activities || [];
      const separateAchievements = studentAchievementsRes?.data?.achievements || [];
      const achievementsData = overviewActivities.length > 0 ? overviewActivities : separateAchievements;
      console.log('Student achievements data:', achievementsData);
      console.log('Overview activities:', overviewActivities);
      console.log('Separate achievements:', separateAchievements);
      setRecentActivities(achievementsData);

      // Process pending reviews
      const pendingData = pendingReviewsRes?.data || [];
      console.log('Pending reviews data:', pendingData);
      setPendingReviews(pendingData);

      // Process trend data
      const trendData = trendRes?.data || [];
      console.log('Trend data:', trendData);
      setTrend(trendData);

      // Process acts per student
      const actsData = actsPerStudentRes?.data?.data || [];
      console.log('Acts per student data:', actsData);
      setActsPerStudent(actsData);

      // Process student status
      const statusData = studentStatusRes?.data || {};
      console.log('Student status data:', statusData);
      setStudentStatus(statusData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const handleExportReport = () => {
    const report = {
      overview,
      recentActivities,
      pendingReviews,
      trend,
      actsPerStudent,
      studentStatus,
      milestones,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-dashboard-report-${Date.now()}.json`;
    a.click();
  };

  const pieData = studentStatus
    ? [
        { name: 'Total Students', value: studentStatus.total_students, color: 'hsl(var(--primary))' },
        { name: 'Consent Verified', value: studentStatus.consent_verified, color: 'hsl(var(--secondary))' },
        { name: 'Consent Pending', value: studentStatus.consent_pending, color: 'hsl(var(--warning))' },
        { name: 'Active This Week', value: studentStatus.active_this_week, color: 'hsl(var(--accent))' },
        { name: 'Inactive', value: studentStatus.inactive, color: 'hsl(var(--muted))' },
      ]
    : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Seo
        title="Teacher Dashboard — Pass The Ripple"
        description="Track your students' kindness journey and classroom growth"
        canonical={`${window.location.origin}/teacher/dashboard`}
      />
      
      {/* Tutorial Component */}
      <JoyrideTutorial
        isActive={isActive}
        steps={tutorialSteps}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
      
      {/* Header with Help Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <span className="text-xl sm:text-3xl">Your Classroom Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your students' kindness journey and classroom growth</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startTutorial}
          className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2 flex-shrink-0"
          title="Take a tour of this page"
          aria-label="Start tutorial"
        >
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Help</span>
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mb-4">
        <Button variant="outline" asChild className="w-full sm:w-auto text-sm sm:text-base">
          <Link to="/teacher/ripple-chain">
            <MapPin className="mr-2 h-4 w-4" />
            View Ripple Map
          </Link>
        </Button>
        <Button onClick={handleExportReport} className="w-full sm:w-auto text-sm sm:text-base">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Quick Actions Alert */}
      {pendingReviews.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingReviews.length} pending submissions to review.
            <Link to="/teacher/hero-wall" className="ml-2 font-semibold text-primary hover:underline">
              Review now →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Classroom Impact Summary */}
      {overview && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Your Classroom Impact</h3>
              <p className="text-xs sm:text-sm text-gray-600">Track your students' kindness journey and achievements</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4" data-tutorial-target="dashboard-stats">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{overview.cards.total_students}</div>
                <p className="text-xs text-gray-500 mt-1">In your classroom</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Ready to Learn</CardTitle>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{overview.cards.consent_verified}</div>
                <p className="text-xs text-gray-500 mt-1">Consent verified</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Awaiting Setup</CardTitle>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{overview.cards.consent_pending}</div>
                <p className="text-xs text-gray-500 mt-1">Consent pending</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Learners</CardTitle>
                <Sprout className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{overview.cards.active_students}</div>
                <p className="text-xs text-gray-500 mt-1">Engaged this week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Kindness Actions</CardTitle>
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{overview.cards.total_ripples}</div>
                <p className="text-xs text-gray-500 mt-1">Student achievements</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Classroom Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Student Activities</span>
            <span className="sm:hidden">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <LucideBarChart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Teaching Insights</span>
            <span className="sm:hidden">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Student Activities */}
            <Card data-tutorial-target="recent-activities">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Recent Student Activities
                  </div>
                  <Link to="/teacher/hero-wall" className="text-sm font-normal text-primary hover:underline">
                    View all
                  </Link>
                </CardTitle>
                <CardDescription>Your students' latest kindness actions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>ST</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.student || activity.user_name}</p>
                          <p className="text-sm text-muted-foreground">{activity.action || activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{activity.time || activity.created_at}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Student Submissions to Review */}
            <Card data-tutorial-target="pending-reviews">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    Student Submissions to Review
                  </div>
                  <Badge variant="secondary">{pendingReviews.length}</Badge>
                </CardTitle>
                <CardDescription>Student submissions awaiting your review and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {pendingReviews.map((review, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{review.student || review.user_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{review.action || review.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{review.submitted || review.created_at}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Classroom Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Classroom Activity Trend
              </CardTitle>
              <CardDescription>Your students' kindness actions and achievements this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height="200">
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="actions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" opacity={0.6} />
                  <Area type="monotone" dataKey="ripples" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" opacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teaching Insights */}
        <TabsContent value="insights" className="space-y-4">
          {/* Teaching Analytics Overview */}
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <LucideBarChart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Teaching Analytics</h3>
                <p className="text-sm text-gray-600">Insights into your classroom's kindness journey</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Student Engagement Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-blue-600" />
                  Student Engagement Status
                </CardTitle>
                <CardDescription>How your students are participating in the kindness program</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Kindness Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Student Kindness Progress
                </CardTitle>
                <CardDescription>Individual student achievements and kindness actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <RechartsBarChart data={actsPerStudent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="student" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="acts" fill="hsl(var(--primary))" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Classroom Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Classroom Milestones
              </CardTitle>
              <CardDescription>Your class achievements and progress toward kindness goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{m.title}</p>
                      <p className="text-sm text-muted-foreground">{m.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={m.progress_pct} className="w-24" />
                      <span className="text-sm font-medium">
                        {m.current}/{m.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teaching Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Teaching Insights
              </CardTitle>
              <CardDescription>Key observations about your classroom's kindness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
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
                    Students with pending consent need your attention. Reach out to parents to complete the setup process.
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
      </Tabs>
    </div>
  );
}