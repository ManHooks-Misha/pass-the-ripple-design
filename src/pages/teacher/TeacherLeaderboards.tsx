import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, Award, Flame, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import { getAuthToken } from '@/lib/auth-token';
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherLeaderboardsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
import Seo from "@/components/Seo";

interface Classroom {
  id: number;
  name: string;
  grade?: string;
  section?: string;
}

interface LeaderboardStudent {
  id: number;
  rank: number;
  nickname: string;
  full_name?: string;
  profile_image_path?: string;
  avatar_id?: number;
  ripples: number;
  likes: number;
  shares: number;
  badges: number;
  badge_list: string[];
  points: number;
  streak: number;
  classrooms: Classroom[];
}

interface Milestone {
  type: string;
  name: string;
  progress: number;
  target: number;
  achieved: boolean;
}

interface ClassroomMilestone {
  classroom_id: number;
  classroom_name: string;
  grade?: string;
  section?: string;
  milestones: Milestone[];
}

interface InspiringRipple {
  id: number;
  student_name: string;
  description: string;
  likes_count: number;
  comments_count: number;
  engagement_score: number;
  profile_image?: string;
  avatar_id?: number;
  classrooms: Classroom[];
  performed_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function TeacherLeaderboards() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_students_leaderboard_tutorial_completed",
    steps: teacherLeaderboardsTutorialSteps,
  });
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [timeframe, setTimeframe] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  
  // State for data
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardStudent[]>([]);
  const [milestones, setMilestones] = useState<ClassroomMilestone[]>([]);
  const [inspiringRipples, setInspiringRipples] = useState<InspiringRipple[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ 
    current_page: 1, 
    last_page: 1,
    total: 0,
    per_page: 25
  });

  // Fetch classrooms on mount
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (activeTab === 'students') {
      fetchLeaderboardData();
    } else if (activeTab === 'milestones') {
      fetchMilestones();
    } else if (activeTab === 'inspiring') {
      fetchInspiringRipples();
    }
  }, [selectedClassroom, timeframe, activeTab]);

  const fetchClassrooms = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await apiFetch<any>('/teacher/classrooms');
      
      if (response.success) {
        const classroomData = response.data?.data || response.data || [];
        setClassrooms(classroomData);
      }
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classrooms',
        variant: 'destructive'
      });
    }
  };

  const fetchLeaderboardData = async (page = 1) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please login again.",
          variant: "destructive",
        });
        return;
      }

      const params = new URLSearchParams({
        period: timeframe,
        per_page: '25',
        page: page.toString()
      });

      if (selectedClassroom !== 'all') {
        params.append('classroom_id', selectedClassroom);
      }

      const response = await apiFetch<any>(`/teacher/leaderboards/top-students?${params.toString()}`);

      if (response.success) {
        setLeaderboardData(response.data?.items || []);
        setPagination(response.data?.pagination || {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 25
        });
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive'
      });
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (selectedClassroom !== 'all') {
        params.append('classroom_id', selectedClassroom);
      }

      const response = await apiFetch<any>(`/teacher/leaderboards/class-milestones?${params.toString()}`);

      if (response.success) {
        setMilestones(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching milestones:', error);
      toast({
        title: 'Error',
        description: 'Failed to load milestones',
        variant: 'destructive'
      });
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspiringRipples = async (page = 1) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        period: timeframe,
        per_page: '10',
        page: page.toString()
      });

      if (selectedClassroom !== 'all') {
        params.append('classroom_id', selectedClassroom);
      }

      const response = await apiFetch<any>(`/teacher/leaderboards/most-inspiring?${params.toString()}`);

      if (response.success) {
        setInspiringRipples(response.data?.items || []);
        setPagination(response.data?.pagination || {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 10
        });
      }
    } catch (error: any) {
      console.error('Error fetching inspiring ripples:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inspiring ripples',
        variant: 'destructive'
      });
      setInspiringRipples([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'students') {
      fetchLeaderboardData(pagination.current_page);
    } else if (activeTab === 'milestones') {
      fetchMilestones();
    } else if (activeTab === 'inspiring') {
      fetchInspiringRipples(pagination.current_page);
    }
    toast({
      title: 'Refreshed',
      description: 'Data refreshed successfully.'
    });
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'total_acts':
        return Users;
      case 'gratitude':
        return Star;
      case 'weekly':
        return Trophy;
      default:
        return Award;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handlePageChange = (newPage: number) => {
    if (activeTab === 'students') {
      fetchLeaderboardData(newPage);
    } else if (activeTab === 'inspiring') {
      fetchInspiringRipples(newPage);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Seo title="Students Leaderboard - Teacher Panel" description="Track and celebrate your students' kindness achievements" />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_students_leaderboard_tutorial_completed"
        />
      )}
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 bg-gray-50 min-h-screen">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Classroom Leaderboards
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track and celebrate your students' kindness achievements
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
            <Button onClick={handleRefresh} size="sm" variant="outline" disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="Select classroom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classrooms</SelectItem>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id.toString()}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full sm:w-40 bg-white">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Today</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-tutorial-target="leaderboard-tabs">
        <TabsList className="grid grid-cols-3 w-full gap-1 sm:gap-2">
          <TabsTrigger value="students" className="text-xs sm:text-sm px-2 sm:px-4">Top Students</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs sm:text-sm px-2 sm:px-4">Class Milestones</TabsTrigger>
          <TabsTrigger value="inspiring" className="text-xs sm:text-sm px-2 sm:px-4">Most Inspiring</TabsTrigger>
        </TabsList>

        {/* Top Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-white p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                Ripple Champions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Students who have started the most ripples in {timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : timeframe === 'monthly' ? 'this month' : 'all time'}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8 sm:p-12">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Data Available</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedClassroom !== 'all' 
                      ? 'No students found in this classroom for the selected time period.'
                      : 'No student activity found for the selected time period.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0" data-tutorial-target="leaderboard-list">
                  {leaderboardData.map((student, index) => (
                    <div 
                      key={student.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
                      data-tutorial-target={index === 0 ? "your-ranking" : undefined}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 flex-1 w-full sm:w-auto">
                        <div className={`text-lg sm:text-2xl font-bold ${getRankColor(student.rank)} min-w-[1.5rem] sm:min-w-[2rem] text-center flex-shrink-0`}>
                          #{student.rank}
                        </div>
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          {student.profile_image_path ? (
                            <AvatarImage src={student.profile_image_path} alt={student.nickname} />
                          ) : null}
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(student.full_name || student.nickname)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-sm sm:text-base">{student.full_name || student.nickname}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.classrooms.map((classroom, idx) => (
                              <span key={idx} className="text-xs text-muted-foreground">
                                {classroom.name}
                                {idx < student.classrooms.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          {student.streak > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm font-semibold">{student.streak}</span>
                            </div>
                          )}
                          <div className="flex gap-1 flex-wrap">
                            {student.badge_list.slice(0, 2).map((badge, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                            {student.badge_list.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{student.badge_list.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6">
                          <div className="text-right">
                            <p className="text-xl sm:text-2xl font-bold text-primary">{student.ripples}</p>
                            <p className="text-xs text-muted-foreground">Ripples</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base sm:text-lg font-semibold">{student.points}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && leaderboardData.length > 0 && pagination.last_page > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-t">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} students
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8 sm:p-12">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : milestones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Milestones</h3>
                <p className="text-sm sm:text-base text-muted-foreground">No classroom milestones available for the selected filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {milestones.map((milestone, idx) => (
                <Card key={idx}>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <span className="flex items-center gap-2 text-base sm:text-lg">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        {milestone.classroom_name}
                      </span>
                      {milestone.grade && milestone.section && (
                        <Badge variant="outline" className="text-xs">
                          Grade {milestone.grade}-{milestone.section}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {milestone.milestones.map((m, mIdx) => {
                      const Icon = getMilestoneIcon(m.type);
                      const percentage = (m.progress / m.target) * 100;
                      return (
                        <div key={mIdx} className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                              <span className="font-medium text-sm sm:text-base truncate">{m.name}</span>
                            </div>
                            <Badge variant={m.achieved ? "default" : "secondary"} className="text-xs flex-shrink-0">
                              {m.progress} / {m.target}
                            </Badge>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          {m.achieved && (
                            <p className="text-xs sm:text-sm text-green-600 font-semibold flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Milestone Achieved!
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Most Inspiring Tab */}
        <TabsContent value="inspiring" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-white p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                Most Inspiring Ripples
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Stories that touched the most hearts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8 sm:p-12">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : inspiringRipples.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Inspiring Ripples Yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Inspiring ripple stories will appear here when students share their acts of kindness.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {inspiringRipples.map((ripple) => (
                    <div key={ripple.id} className="p-3 sm:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            {ripple.profile_image ? (
                              <AvatarImage src={ripple.profile_image} alt={ripple.student_name} />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                              {getInitials(ripple.student_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base truncate">{ripple.student_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {ripple.classrooms.map(c => c.name).join(', ')}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimeAgo(ripple.performed_at)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-3">{ripple.description}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
                          {ripple.likes_count} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {ripple.comments_count} comments
                        </span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Score: {ripple.engagement_score}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && inspiringRipples.length > 0 && pagination.last_page > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-t">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Page {pagination.current_page} of {pagination.last_page}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}