import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Users, 
  TrendingUp, 
  Award,
  BarChart3,
  Sparkles,
  Heart,
  Calendar,
  Filter,
  Pin,
  MessageCircle,
  Activity,
  Trophy,
  Target,
  ArrowRight,
  Clock,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import { getImageUrl } from '@/utils/imageUrl';
import { getPlainText } from '@/utils/textUtils';
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherRippleChainTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
import Seo from "@/components/Seo";

interface Classroom {
  id: number;
  name: string;
  grade?: string;
  section?: string;
}

interface OverviewData {
  total_ripples: number;
  total_students: number;
  active_students: number;
  participation_rate: number;
  total_engagement: number;
  average_ripples_per_student: number;
  total_likes: number;
  total_comments: number;
}

interface ChainLink {
  student: string;
  student_avatar?: string;
  action: string;
  description?: string;
  performed_at: string;
  photo_path?: string;
}

interface RippleChain {
  id: number;
  initiator: string;
  initiator_avatar?: string;
  action: string;
  description: string;
  category?: string;
  category_color?: string;
  performed_at: string;
  photo_path?: string;
  chain: ChainLink[];
  total_reach: number;
  likes_count: number;
  status: string;
}

interface TopInfluencer {
  id: number;
  full_name: string;
  nickname?: string;
  profile_image_path?: string;
  inspired_count: number;
  latest_inspiration: string;
}

interface CategoryBreakdown {
  id: number;
  category_name: string;
  icon?: string;
  action_count: number;
  unique_students: number;
}

export default function TeacherRippleChain() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_ripple_chain_tutorial_completed",
    steps: teacherRippleChainTutorialSteps,
  });
  const [selectedClass, setSelectedClass] = useState('all');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [rippleChains, setRippleChains] = useState<RippleChain[]>([]);
  const [topInfluencers, setTopInfluencers] = useState<TopInfluencer[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinReason, setPinReason] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [selectedClass]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClassrooms(),
        fetchOverview(),
        fetchRippleChains(),
        fetchTopInfluencers(),
        fetchCategoryBreakdown()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load ripple chain data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    const res = await apiFetch<any>('/teacher/ripple-chains/classrooms');
    if (res.success) {
      setClassrooms(res.data);
    }
  };

  const fetchOverview = async () => {
    const params = selectedClass !== 'all' ? `?classroom_id=${selectedClass}` : '';
    const res = await apiFetch<any>(`/teacher/ripple-chains/overview${params}`);
    if (res.success) {
      setOverview(res.data);
    }
  };

  const fetchRippleChains = async () => {
    const params = selectedClass !== 'all' ? `?classroom_id=${selectedClass}` : '';
    const res = await apiFetch<any>(`/teacher/ripple-chains/chains${params}`);
    if (res.success) {
      setRippleChains(res.data);
    }
  };

  const fetchTopInfluencers = async () => {
    const res = await apiFetch<any>('/teacher/ripple-chains/top-influencers');
    if (res.success) {
      setTopInfluencers(res.data);
    }
  };

  const fetchCategoryBreakdown = async () => {
    const res = await apiFetch<any>('/teacher/ripple-chains/category-breakdown');
    if (res.success) {
      setCategoryBreakdown(res.data);
    }
  };

  const handleSuggestPin = async (chainId: number) => {
    try {
      const res = await apiFetch<any>('/teacher/ripple-chains/suggest-pin', {
        method: 'POST',
        body: JSON.stringify({
          ripple_chain_id: chainId,
          reason: pinReason
        })
      });

      if (res.success) {
        toast({
          title: "Success!",
          description: "Ripple chain suggested for hero wall pinning.",
        });
        setPinReason('');
        setSelectedChainId(null);
      } else {
        throw new Error((res as any).message || 'Failed to suggest pin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suggest pin",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  const getInfluencerLevel = (count: number) => {
    if (count >= 20) return { level: 5, label: 'Legend', color: 'text-purple-600' };
    if (count >= 15) return { level: 4, label: 'Master', color: 'text-blue-600' };
    if (count >= 10) return { level: 3, label: 'Expert', color: 'text-green-600' };
    if (count >= 5) return { level: 2, label: 'Rising Star', color: 'text-yellow-600' };
    return { level: 1, label: 'Beginner', color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <GitBranch className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ripple chains...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo title="Ripple Chain - Teacher Panel" description="Visualize how kindness spreads through your classroom and beyond" />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_ripple_chain_tutorial_completed"
        />
      )}
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Ripple Chain Analytics
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track how kindness spreads and creates impact across your classroom
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
            <Badge variant="outline" className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto justify-center">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
              <span className="font-semibold">{rippleChains.length} Active Chains</span>
            </Badge>
          </div>
        </div>

      {/* How It Works Button */}
      <Card className="border-2 border-dashed border-primary/30 mb-6">
        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-base sm:text-lg mb-1">Want to see how Ripple Chains work?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click the button below to see a visual example of how kindness spreads
              </p>
            </div>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant={showPreview ? "outline" : "default"}
              className={showPreview 
                ? "min-w-[140px] sm:min-w-[180px]" 
                : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 min-w-[140px] sm:min-w-[180px]"
              }
              size="lg"
            >
              {showPreview ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mock Ripple Chain Preview */}
      {showPreview && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 animate-in fade-in-50 slide-in-from-top-4 duration-300 mb-6">
          <CardHeader className="p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  How Ripple Chains Work
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  See how kindness spreads from one student to another
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Preview
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-7">
            <div className="space-y-4">
              {/* Mock Chain Visualization */}
              <div className="relative">
                {/* Chain Flow */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pb-6">
                  {/* Initiator */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary ring-4 ring-primary/20">
                        <AvatarFallback className="bg-primary text-white font-bold text-sm sm:text-base">
                          EM
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-xs sm:text-sm">Emma</p>
                      <p className="text-xs text-muted-foreground">Started</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center justify-center flex-1">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="h-0.5 bg-gradient-to-r from-primary to-purple-500 flex-1"></div>
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <div className="h-0.5 bg-gradient-to-r from-purple-500 to-primary flex-1"></div>
                    </div>
                  </div>
                  <div className="sm:hidden flex items-center justify-center w-full py-2">
                    <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                  </div>

                  {/* Link 1 */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-purple-400 ring-2 ring-purple-400/20">
                      <AvatarFallback className="bg-purple-400 text-white font-semibold text-xs sm:text-sm">
                        JM
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-xs">James</p>
                      <p className="text-xs text-muted-foreground">Inspired</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center justify-center flex-1">
                    <div className="flex items-center gap-2 text-purple-500">
                      <div className="h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 flex-1"></div>
                      <ArrowRight className="h-5 w-5 text-purple-500" />
                      <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 flex-1"></div>
                    </div>
                  </div>
                  <div className="sm:hidden flex items-center justify-center w-full py-2">
                    <ArrowRight className="h-5 w-5 text-purple-500 rotate-90" />
                  </div>

                  {/* Link 2 */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-blue-400 ring-2 ring-blue-400/20">
                      <AvatarFallback className="bg-blue-400 text-white font-semibold text-xs sm:text-sm">
                        SO
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-xs">Sophia</p>
                      <p className="text-xs text-muted-foreground">Inspired</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center justify-center flex-1">
                    <div className="flex items-center gap-2 text-blue-500">
                      <div className="h-0.5 bg-gradient-to-r from-blue-400 to-green-400 flex-1"></div>
                      <ArrowRight className="h-5 w-5 text-blue-500" />
                      <div className="h-0.5 bg-gradient-to-r from-green-400 to-blue-400 flex-1"></div>
                    </div>
                  </div>
                  <div className="sm:hidden flex items-center justify-center w-full py-2">
                    <ArrowRight className="h-5 w-5 text-blue-500 rotate-90" />
                  </div>

                  {/* Link 3 */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-green-400 ring-2 ring-green-400/20">
                      <AvatarFallback className="bg-green-400 text-white font-semibold text-xs sm:text-sm">
                        NO
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-xs">Noah</p>
                      <p className="text-xs text-muted-foreground">Inspired</p>
                    </div>
                  </div>
                </div>

                {/* Chain Details */}
                <div className="mt-6 p-4 sm:p-5 bg-background rounded-lg border border-primary/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-sm sm:text-base mb-1">Helping Others</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Emma helped a classmate, inspiring 3 others to do the same
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        4 students
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Heart className="h-3 w-3 text-red-500" />
                        12 likes
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Started 2 days ago • Still growing</span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                      What is a Ripple Chain?
                    </p>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                      When students perform similar kindness actions within a week, they automatically form a chain. 
                      This shows how one act of kindness inspires others, creating a ripple effect across your classroom!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-2 mb-6">
        <CardContent className="pt-6 sm:pt-6 p-6 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <Select value={selectedClass} onValueChange={(value) => {
              setSelectedClass(value);
            }}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id.toString()}>
                    {classroom.name} {classroom.grade && `- Grade ${classroom.grade}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-8 sm:space-y-10">
        <div className="w-full overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="chains" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">
              <GitBranch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Ripple Chains ({rippleChains.length})</span>
              <span className="sm:hidden">Chains ({rippleChains.length})</span>
            </TabsTrigger>
            <TabsTrigger value="influencers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Top Influencers</span>
              <span className="sm:hidden">Influencers</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 sm:space-y-10">
          {overview && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-3">
                      <GitBranch className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      <Badge variant="secondary" className="text-xs">{overview.average_ripples_per_student}/student</Badge>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">{overview.total_ripples}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Ripple Actions</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                      <Badge variant="secondary" className="text-xs">{overview.participation_rate}%</Badge>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1">{overview.active_students}/{overview.total_students}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Active Students</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                      <div className="flex gap-1">
                        <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">{overview.total_engagement}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Engagement</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-3">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-500 mb-1">{rippleChains.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Ripple Chains</p>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <Card>
                  <CardHeader className="p-6 sm:p-7">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-7 space-y-5 sm:space-y-6">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Total Likes</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">From all actions</p>
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-red-500 flex-shrink-0">{overview.total_likes}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Total Comments</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Conversations started</p>
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-500 flex-shrink-0">{overview.total_comments}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-6 sm:p-7">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                      Participation Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-7 space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Participation Rate</span>
                        <span className="font-semibold">{overview.participation_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-purple-600 h-2 sm:h-3 rounded-full transition-all"
                          style={{ width: `${overview.participation_rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 sm:gap-6 pt-5 sm:pt-6">
                      <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{overview.active_students}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-gray-100 rounded-lg">
                        <p className="text-xl sm:text-2xl font-bold text-gray-600">{overview.total_students - overview.active_students}</p>
                        <p className="text-xs text-muted-foreground">Not Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Preview */}
              <Card>
                <CardHeader className="p-6 sm:p-7">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    Recent Ripple Activity
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Latest kindness actions creating impact</CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-7">
                  {rippleChains.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <GitBranch className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm sm:text-base text-muted-foreground">No ripple chains yet</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {rippleChains.slice(0, 5).map((chain) => (
                        <div key={chain.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-5 sm:p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary flex-shrink-0">
                            <AvatarImage src={getImageUrl(chain.initiator_avatar)} />
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {getInitials(chain.initiator)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold truncate text-sm sm:text-base">{chain.initiator}</p>
                              {chain.category && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: chain.category_color ? `${chain.category_color}20` : undefined,
                                    color: chain.category_color || undefined 
                                  }}
                                >
                                  {chain.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{chain.action}</p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm w-full sm:w-auto justify-between sm:justify-end">
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <Users className="h-3 w-3" />
                              {chain.total_reach}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Heart className="h-3 w-3 text-red-500" />
                              {chain.likes_count}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(chain.performed_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Ripple Chains Tab */}
        <TabsContent value="chains" className="space-y-4">
          {rippleChains.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <GitBranch className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No Ripple Chains Yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                  When students perform kindness actions in the same category within a week, they form ripple chains that appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            rippleChains.map((chain) => (
              <Card key={chain.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary flex-shrink-0">
                        <AvatarImage src={getImageUrl(chain.initiator_avatar)} />
                        <AvatarFallback className="bg-primary text-white font-bold text-xs sm:text-sm">
                          {getInitials(chain.initiator)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{chain.initiator}'s Ripple Chain</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(chain.performed_at)}
                          </span>
                          {chain.category && (
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                              style={{ 
                                backgroundColor: chain.category_color ? `${chain.category_color}20` : undefined,
                                color: chain.category_color || undefined 
                              }}
                            >
                              {chain.category}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        <span className="hidden sm:inline">{chain.total_reach} reached</span>
                        <span className="sm:hidden">{chain.total_reach}</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Heart className="h-3 w-3 text-red-500" />
                        {chain.likes_count}
                      </Badge>
                      {/* <Dialog open={selectedChainId === chain.id} onOpenChange={(open) => setSelectedChainId(open ? chain.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1 text-xs sm:text-sm">
                            <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Suggest Pin</span>
                            <span className="sm:hidden">Pin</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-4 sm:p-6">
                          <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl">Suggest for Hero Wall</DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                              Recommend this inspiring chain to be featured on the Hero Wall
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="p-3 sm:p-4 bg-accent rounded-lg">
                              <p className="font-semibold mb-1 text-sm sm:text-base">{chain.initiator}'s Chain</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{chain.action}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Reached {chain.total_reach} students • {chain.likes_count} likes
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm sm:text-base">Why is this ripple chain special?</Label>
                              <Textarea
                                value={pinReason}
                                onChange={(e) => setPinReason(e.target.value)}
                                placeholder="Explain the impact this ripple chain has had on your classroom community..."
                                rows={4}
                                className="mt-2 text-sm"
                              />
                            </div>
                            <Button 
                              onClick={() => handleSuggestPin(chain.id)} 
                              className="w-full text-sm sm:text-base"
                              disabled={!pinReason.trim()}
                            >
                              <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                              Send to Admin for Review
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog> */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h4 className="font-semibold text-base sm:text-lg mb-2">{chain.action}</h4>
                    <p className="text-sm sm:text-base text-muted-foreground">{getPlainText(chain.description || '')}</p>
                  </div>

                  {/* Visual Chain */}
                  <div className="relative pl-6 sm:pl-10">
                    <div className="absolute left-3 sm:left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-transparent" />
                    
                    {/* Initial Action */}
                    <div className="relative flex items-start gap-2 sm:gap-4 mb-6 sm:mb-8">
                      <div className="absolute left-[-14px] sm:left-[-18px] w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg z-10">
                        1
                      </div>
                      <div className="flex-1 ml-1 sm:ml-2">
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border-2 border-primary/20">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border-2 border-primary">
                              <AvatarImage src={getImageUrl(chain.initiator_avatar)} />
                              <AvatarFallback className="text-xs">{getInitials(chain.initiator)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-sm sm:text-base">{chain.initiator}</p>
                            <Badge variant="secondary" className="ml-auto text-xs">Started</Badge>
                          </div>
                          <p className="text-xs sm:text-sm font-medium mb-1">{chain.action}</p>
                          {chain.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{getPlainText(chain.description)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chain Members */}
                    {chain.chain.map((link, idx) => (
                      <div key={idx} className="relative flex items-start gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="absolute left-[-14px] sm:left-[-18px] w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg z-10">
                          {idx + 2}
                        </div>
                        <div className="flex-1 ml-1 sm:ml-2">
                          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border border-blue-500">
                                <AvatarImage src={getImageUrl(link.student_avatar)} />
                                <AvatarFallback className="text-xs">{getInitials(link.student)}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium text-xs sm:text-sm">{link.student}</p>
                              <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium mb-1">{link.action}</p>
                            {link.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{getPlainText(link.description)}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(link.performed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chain Impact Summary */}
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                      <span className="text-muted-foreground">Chain Impact</span>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          <span className="font-semibold">{chain.total_reach} students</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                          <span className="font-semibold">{chain.likes_count} likes</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Top Influencers Tab */}
        <TabsContent value="influencers">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                Top Kindness Influencers
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Students creating the most positive impact</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {topInfluencers.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Award className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base text-muted-foreground">No influencer data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topInfluencers.map((influencer, index) => {
                    const level = getInfluencerLevel(influencer.inspired_count);
                    return (
                      <div key={influencer.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-lg flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary flex-shrink-0">
                          <AvatarImage src={getImageUrl(influencer.profile_image_path)} />
                          <AvatarFallback className="text-xs">
                            {getInitials(influencer.nickname || influencer.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{influencer.nickname || influencer.full_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {influencer.inspired_count} kindness actions
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant="secondary" className={`mb-1 text-xs ${level.color}`}>
                            <Sparkles className="h-3 w-3 mr-1" />
                            {level.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Level {level.level}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                Kindness Categories
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Breakdown of ripple actions by category</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {categoryBreakdown.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base text-muted-foreground">No category data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryBreakdown.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0"
                                                  >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base sm:text-lg truncate">{category.category_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {category.unique_students} students • {category.action_count} actions
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl sm:text-3xl font-bold text-primary">{category.action_count}</p>
                        <p className="text-xs text-muted-foreground">total actions</p>
                      </div>
                    </div>
                  ))}
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