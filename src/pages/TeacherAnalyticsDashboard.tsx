import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Users, Award, Activity, Filter, Download, RefreshCw,
  School, UserCheck, TrendingUp, CheckCircle, Clock, AlertCircle,
  BookOpen, Target, Star, ThumbsUp, MessageCircle, Trophy, Sparkles
} from 'lucide-react';
import { apiFetch, API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/lib/auth-token';
import { toast } from '@/hooks/use-toast';
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherAnalyticsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

interface MetricValue {
  value: number;
  change: number;
}

interface TeacherSummary {
  total_students: MetricValue;
  active_students: MetricValue;
  student_ripples: MetricValue;
  pending_approvals: MetricValue;
  total_points: MetricValue;
  badges_earned: MetricValue;
}

interface Classroom {
  id: number;
  name: string;
  grade: string;
  section: string;
  student_count: number;
}

interface Student {
  id: number;
  nickname: string;
  full_name: string;
  total_points: number;
}

interface TeacherAnalyticsData {
  summary: TeacherSummary;
  classrooms: Classroom[];
  top_students: Student[];
  activity_timeline: Array<{ date: string; count: number }>;
}

const TeacherAnalyticsDashboard: React.FC = () => {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_analytics_dashboard_tutorial_completed",
    steps: teacherAnalyticsTutorialSteps,
  });
  const [period, setPeriod] = useState<string>('30days');
  const [data, setData] = useState<TeacherAnalyticsData | null>(null);
  const [personalData, setPersonalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('overview');

  // Ensure overview view is active when tutorial starts
  useEffect(() => {
    if (isActive && activeView !== 'overview') {
      setActiveView('overview');
    }
  }, [isActive, activeView]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  useEffect(() => {
    loadData();
    loadPersonalActivity();
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

  const loadPersonalActivity = async () => {
    try {
      const response: any = await apiFetch(`/analytics/my-personal-activity?period=${period}`);
      if (response?.success && response.data) {
        setPersonalData(response.data);
      } else {
        console.warn('Personal activity response:', response);
      }
    } catch (err: any) {
      console.error('Error loading personal activity:', err);
      // Don't show error toast for personal activity as it's not critical
    }
  };

  const handleExport = async () => {
    try {
      toast({ title: 'Exporting...', description: 'Preparing analytics report' });

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Try teacher-specific endpoint first, fallback to general analytics export
      let response = await fetch(`${API_BASE_URL}/teacher/analytics/export?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv'
        }
      });

      // If teacher endpoint doesn't exist, try the general analytics export
      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_BASE_URL}/analytics/export?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/csv'
          }
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Export failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Exported file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: 'Success',
        description: 'Analytics exported successfully',
      });
    } catch (err: any) {
      console.error('Export error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to export analytics',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <School className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600 animate-pulse" size={32} />
          </div>
          <p className="mt-6 text-lg text-gray-700 font-semibold">Loading Teacher Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-yellow-500 mx-auto" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mt-6">No Data Available</h2>
          <button onClick={loadData} className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
            <RefreshCw size={20} className="inline mr-2" /> Refresh
          </button>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Students',
      value: data.summary.total_students,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Active Students',
      value: data.summary.active_students,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Student Ripples',
      value: data.summary.student_ripples,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Pending Approvals',
      value: data.summary.pending_approvals,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'Total Points Earned',
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
  ];

  const MetricCard = ({ title, value, icon: Icon, color, bgColor, iconBg }: any) => {
    const displayValue = typeof value === 'object' ? value.value : value;
    const change = typeof value === 'object' ? value.change : 0;
    const hasChange = typeof value === 'object' && change !== 0;

    return (
      <div className={`${bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}>
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className={`p-2 sm:p-3 ${iconBg} rounded-lg sm:rounded-xl shadow-sm`}>
            <Icon className={color} size={20} />
          </div>
          {hasChange && (
            <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-bold flex-shrink-0 ${
              change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendingUp size={12} className={change < 0 ? 'rotate-180' : ''} />
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-1 sm:mb-2">{displayValue.toLocaleString()}</div>
        <div className="text-xs sm:text-sm text-gray-700 font-semibold truncate">{title}</div>
      </div>
    );
  };

  const ChartSection = ({ title, children, className = '', actions, ...props }: any) => (
    <div className={`bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-2xl transition-all ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <Seo title="Analytics Dashboard - Teacher Panel" description="Get deep insights into your classroom's kindness journey" />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_analytics_dashboard_tutorial_completed"
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Get deep insights into your classroom's kindness journey
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={startTutorial}
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
              title="Take a tour of this page"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8" data-tutorial-target="analytics-stats">
          {metricCards.map((card, index) => (
            <MetricCard key={index} {...card} />
          ))}
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
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium transition-all hover:border-purple-300 text-sm sm:text-base"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>

                <div className="w-full overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                  <div className="flex gap-2 min-w-max sm:min-w-0">
                    {['overview', 'classrooms-students', 'my-activity'].map((view) => (
                      <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                          activeView === view
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {view === 'classrooms-students' ? 'Classrooms & Students' : view.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <>
            {/* Activity Timeline */}
            <ChartSection title="Student Activity Timeline" className="mb-8" data-tutorial-target="analytics-charts">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.activity_timeline}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#a855f7" fill="url(#colorActivity)" strokeWidth={3} name="Activities" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Top Students & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-tutorial-target="student-performance">
              {/* Top Performing Students */}
              <ChartSection title={
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-500" size={28} />
                  {/* <span>Top Performing Students</span> */}
                  <span>Shining Stars</span>
                </div>
              }>
                <div className="space-y-3">
                  {data.top_students.slice(0, 10).map((student, index) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 shadow-lg' :
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400 shadow-md' :
                        index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400 shadow-md' :
                        'bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-500 text-white shadow-lg' :
                          index === 1 ? 'bg-gray-400 text-white shadow-md' :
                          index === 2 ? 'bg-orange-500 text-white shadow-md' :
                          'bg-purple-600 text-white'
                        }`}>
                          {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{student.nickname}</div>
                          <div className="text-sm text-gray-600">{student.full_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="text-yellow-600" size={20} />
                        <span className="font-bold text-2xl text-purple-600">{student.total_points.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartSection>

              {/* Classroom Overview */}
              <ChartSection title={
                <div className="flex items-center gap-3">
                  <BookOpen className="text-blue-500" size={28} />
                  <span>My Classrooms</span>
                </div>
              }>
                <div className="space-y-4">
                  {data.classrooms.map((classroom) => (
                    <div key={classroom.id} className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{classroom.name}</div>
                          <div className="text-sm text-gray-600">
                            Grade {classroom.grade} - Section {classroom.section}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                          <Users className="text-blue-600" size={20} />
                          <span className="font-bold text-gray-900 text-lg">{classroom.student_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserCheck size={16} className="text-green-600" />
                        <span>{classroom.student_count} students enrolled</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartSection>
            </div>
          </>
        )}

        {/* Classrooms & Students Combined View */}
        {activeView === 'classrooms-students' && (
          <div className="space-y-6">
            {/* Classrooms Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-purple-600" size={28} />
                My Classrooms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.classrooms?.map((classroom: any) => (
                  <div key={classroom.id} className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{classroom.name}</h3>
                        <p className="text-xs text-gray-600">Grade {classroom.grade} - Sec {classroom.section}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <span className="text-xs font-semibold text-gray-700">Students</span>
                      <span className="text-xl font-black text-blue-600">{classroom.student_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Students */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-600" size={28} />
                Top Performing Students
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {data.top_students?.map((student: any, index: number) => (
                  <div key={student.id} className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                        index < 3
                          ? index === 0 ? 'bg-yellow-500 text-white'
                            : index === 1 ? 'bg-gray-400 text-white'
                            : 'bg-orange-500 text-white'
                          : 'bg-purple-600 text-white'
                      } shadow-lg`}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : student.nickname?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{student.nickname}</h3>
                        <p className="text-xs text-gray-600">{student.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Award className="text-yellow-600" size={16} />
                        <span className="text-xs font-semibold text-gray-700">Points</span>
                      </div>
                      <span className="text-xl font-black text-yellow-600">{student.total_points?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Stories Chart */}
            {data.top_ripples && data.top_ripples.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="text-pink-600" size={28} />
                  Most Liked Student Stories
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.top_ripples?.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="title"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="likes_count" fill="#ec4899" name="Likes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Student Engagement Radar Chart */}
            {data.engagement_metrics && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="text-purple-600" size={28} />
                  Student Engagement Overview
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { metric: 'Likes', value: data.engagement_metrics?.total_likes || 0, fullMark: Math.max(data.engagement_metrics?.total_likes || 100, 100) },
                    { metric: 'Comments', value: data.engagement_metrics?.total_comments || 0, fullMark: Math.max(data.engagement_metrics?.total_comments || 100, 100) },
                    { metric: 'Shares', value: data.engagement_metrics?.total_shares || 0, fullMark: Math.max(data.engagement_metrics?.total_shares || 100, 100) },
                  ]}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#374151', fontWeight: 600 }} />
                    <PolarRadiusAxis />
                    <Radar name="Engagement" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trending Student Stories - Time Period Tabs */}
            {data.trending_stories && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-orange-600" size={28} />
                  Trending Student Stories
                </h2>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {['today', 'week', 'month', 'year', 'all_time'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setActiveView('classrooms-students')}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 text-gray-800 font-semibold text-sm transition-all"
                    >
                      {period === 'all_time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.trending_stories?.all_time?.slice(0, 6).map((story: any, index: number) => (
                    <div key={story.id} className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-100">
                      {index < 3 && <span className="text-2xl mb-2 block">{['🥇', '🥈', '🥉'][index]}</span>}
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">by {story.user_name}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-pink-600">
                          <ThumbsUp size={14} />
                          {story.likes_count}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <MessageCircle size={14} />
                          {story.comments_count}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Target size={14} />
                          {story.shares_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Shared Stories */}
            {data.most_shared_stories && data.most_shared_stories.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="text-green-600" size={28} />
                  Most Shared Student Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.most_shared_stories.slice(0, 6).map((story: any) => (
                    <div key={story.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Target className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{story.title}</h4>
                        <p className="text-xs text-gray-600">by {story.user_name}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                        {story.shares_count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Activity View */}
        {activeView === 'my-activity' && personalData && (
          <div className="space-y-6">
            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'My Ripples', value: personalData.summary.total_ripples, icon: Activity, color: 'purple' },
                { label: 'Total Likes', value: personalData.summary.total_likes, icon: ThumbsUp, color: 'pink' },
                { label: 'Comments', value: personalData.summary.total_comments, icon: MessageCircle, color: 'blue' },
                { label: 'Shares', value: personalData.summary.total_shares, icon: Target, color: 'green' },
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
                  <div key={story.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 hover:shadow-lg transition-all">
                    {index < 3 && (
                      <span className="text-3xl mb-2 block">{['🥇', '🥈', '🥉'][index]}</span>
                    )}
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={16} className="text-pink-500" />
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

            {/* All-Time Top Liked Stories */}
            {personalData.all_time_top_liked && personalData.all_time_top_liked.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="text-yellow-500" size={24} />
                  My All-Time Most Liked Stories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personalData.all_time_top_liked.map((story: any, index: number) => (
                    <div key={story.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                      {index < 3 && <span className="text-3xl mb-2 block">{['🥇', '🥈', '🥉'][index]}</span>}
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-pink-600 font-bold">
                          <ThumbsUp size={16} />
                          {story.likes_count}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Target size={16} />
                          {story.shares_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All-Time Most Shared Stories */}
            {personalData.all_time_top_shared && personalData.all_time_top_shared.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="text-green-500" size={24} />
                  My All-Time Most Shared Stories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personalData.all_time_top_shared.map((story: any) => (
                    <div key={story.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Target className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{story.title}</h4>
                      </div>
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full font-bold">{story.shares_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending My Stories */}
            {personalData.trending && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-orange-500" size={24} />
                  My Trending Stories
                </h3>
                <div className="space-y-4">
                  {[
                    { period: 'today', label: 'Today', color: 'orange' },
                    { period: 'week', label: 'This Week', color: 'purple' },
                    { period: 'month', label: 'This Month', color: 'blue' },
                    { period: 'year', label: 'This Year', color: 'green' },
                  ].map(({ period, label, color }) => (
                    personalData.trending[period] && personalData.trending[period].length > 0 && (
                      <div key={period}>
                        <h4 className="font-bold text-gray-800 mb-2">{label}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {personalData.trending[period].slice(0, 3).map((story: any) => (
                            <div key={story.id} className={`p-3 bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-lg border border-${color}-200`}>
                              <h5 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{story.title}</h5>
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <ThumbsUp size={12} /> {story.likes_count} likes
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Story Location Reach */}
            {personalData.story_location_reach && personalData.story_location_reach.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="text-blue-500" size={24} />
                  Where My Stories Reached
                </h3>
                <p className="text-sm text-gray-600 mb-4">Locations where people engaged with my stories</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personalData.story_location_reach.map((location: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <div>
                        <span className="font-semibold text-gray-900">{location.city}, {location.country}</span>
                        <p className="text-xs text-gray-600">{location.user_count} users, {location.interaction_count} interactions</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">{location.interaction_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referral Geographic Reach */}
            {personalData.referral_location_reach && personalData.referral_location_reach.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="text-green-500" size={24} />
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
                  {personalData.referral_location_reach.map((location: any, index: number) => (
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
    </>
  );
};

export default TeacherAnalyticsDashboard;
