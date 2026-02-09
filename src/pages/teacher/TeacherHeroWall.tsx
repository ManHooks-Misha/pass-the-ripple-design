import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Star,
  Heart,
  MessageCircle,
  Send,
  Pin,
  Eye,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Users,
  User,
  Calendar,
  Award,
  Image as ImageIcon,
  Video,
  Plus,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { getImageUrl } from "@/utils/imageUrl";
import { UserAvatarOnly } from "@/components/UserIdentity";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherHeroWallTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import Seo from "@/components/Seo";

// ================== INTERFACES ==================

interface Classroom {
  id: number;
  name: string;
  grade: string | null;
  section: string | null;
}

interface SpotlightStory {
  id: number;
  ripple_action_id: number;
  user_id: number;
  classroom_id: number;
  featured_title: string | null;
  featured_description: string | null;
  featured_at: string | null;
  submitted_at: string;
  ripple_title: string;
  ripple_description: string;
  performed_at: string;
  photo_path: string | null;
  user_full_name: string;
  user_nickname: string;
  profile_image_path: string | null;
  avatar_id: number | null;
  classroom_name: string;
  classroom_grade: string | null;
  category_name: string | null;
  category_color: string | null;
  likes_count: number;
  comments_count: number;
  status: "published" | "pending";
}

interface PendingNomination {
  id: number;
  user_id: number;
  title: string;
  description: string;
  performed_at: string;
  photo_path: string | null;
  ripple_category_id: number | null;
  user_full_name: string;
  user_nickname: string;
  profile_image_path: string | null;
  avatar_id: number | null;
  classroom_id: number;
  classroom_name: string;
  classroom_grade: string | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  likes_count: number;
}

interface SubmittedStory {
  id: number;
  ripple_action_id: number;
  user_id: number;
  classroom_id: number;
  featured_title: string | null;
  featured_description: string | null;
  featured_at: string | null;
  submitted_at: string;
  ripple_title: string;
  ripple_description: string;
  performed_at: string;
  photo_path: string | null;
  user_full_name: string;
  user_nickname: string;
  profile_image_path: string | null;
  avatar_id: number | null;
  classroom_name: string;
  classroom_grade: string | null;
  category_name: string | null;
  category_color: string | null;
  status: "published" | "pending";
}

// ================== MAIN COMPONENT ==================

export default function TeacherHeroWall() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_hero_wall_tutorial_completed",
    steps: teacherHeroWallTutorialSteps,
  });
  const [activeTab, setActiveTab] = useState("submitted"); // Set to submitted since we only show submitted stories now
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    classroom_id: "all",
    status: "all",
  });

  // Data states
  const [submittedStories, setSubmittedStories] = useState<SubmittedStory[]>([]);

  // Loading states
  const [loadingSubmitted, setLoadingSubmitted] = useState(true);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);

  // Modal states
  const [selectedPreview, setSelectedPreview] = useState<SubmittedStory | null>(null);
  const [selectedNomination, setSelectedNomination] = useState<PendingNomination | null>(null);
  const [nominationData, setNominationData] = useState({ featured_title: "", featured_description: "" });

  // ================== FETCH FUNCTIONS ==================

  const fetchClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Classroom[] }>(
        "/teacher/hero-wall/classrooms"
      );
      if (res.success) {
        setClassrooms(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const fetchSubmittedStories = async () => {
    setLoadingSubmitted(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("q", filters.search);
      if (filters.classroom_id && filters.classroom_id !== "all") params.append("classroom_id", filters.classroom_id);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);

      const res = await apiFetch<{
        success: boolean;
        data: { data: SubmittedStory[] };
      }>(`/teacher/hero-wall/submitted?${params}`);

      if (res.success) {
        setSubmittedStories(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch submitted stories:", err);
      toast({
        title: "Error",
        description: "Could not load submitted stories.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmitted(false);
    }
  };

  // ================== EFFECTS ==================

  useEffect(() => {
    fetchClassrooms();
    fetchSubmittedStories(); // Load submitted stories on initial mount
  }, []);

  useEffect(() => {
    fetchSubmittedStories(); // Reload when filters change
  }, [filters]);

  // ================== HANDLERS ==================

  const handleSubmitNomination = async (nomination: PendingNomination) => {
    try {
      const res: any = await apiFetch("/teacher/hero-wall/submit", {
        method: "POST",
        body: JSON.stringify({
          ripple_action_id: nomination.id,
          featured_title: nominationData.featured_title || nomination.title,
          featured_description: nominationData.featured_description,
          classroom_id: nomination.classroom_id,
        }),
      });

      if (res.success) {
        toast({
          title: "Success!",
          description: "Story submitted for Hero Wall consideration.",
        });
        setSelectedNomination(null);
        setNominationData({ featured_title: "", featured_description: "" });
        fetchPendingNominations();
        fetchSpotlightStories();
      } else {
        throw new Error(res.message || "Submission failed");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit story.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (id: number, type: "spotlight" | "nomination") => {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>(
        `/teacher/hero-wall/preview/${id}`
      );
      if (res.success && res.data) {
        setSelectedPreview(res.data);
      } else {
        throw new Error("Preview not available");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load preview.",
        variant: "destructive",
      });
    }
  };

  // ================== RENDER HELPERS ==================

  const renderMediaPreview = (item: any) => {
    // if (!item.photo_path) return null;

    return (
      <div className="w-full sm:w-24 sm:h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden aspect-square sm:aspect-auto sm:h-24">
        <img
          src={getImageUrl(item.photo_path)}
          alt="Story media"
          className={`w-full h-full object-cover ${
                !item.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
          }`}
        />
      </div>
    );
  };

  const renderCategoryBadge = (item: any) => {
    if (!item.category_name) return null;
    
    return (
      <Badge 
        variant="secondary" 
        className="text-xs"
        style={{ 
          backgroundColor: item.category_color ? `${item.category_color}20` : undefined,
          color: item.category_color || undefined 
        }}
      >
        {item.category_name}
      </Badge>
    );
  };

  const renderSpotlightContent = () => {
    if (loadingSpotlight) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (spotlightStories.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Spotlight Stories</h3>
          <p className="text-muted-foreground">
            {filters.search || (filters.classroom_id !== "all") || (filters.status !== "all")
              ? "No stories match your filters." 
              : "No stories have been submitted to the Hero Wall yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        {spotlightStories.map((story) => (
          <Card key={story.id} className="overflow-hidden">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <UserAvatarOnly nickname={story.user_nickname} avatar_id={story.avatar_id} profile_image_path={story.profile_image_path} />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base truncate">{story.user_nickname}</CardTitle>
                    <CardDescription className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{story.classroom_name}</span>
                      <Calendar className="h-3 w-3 ml-1 sm:ml-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">{new Date(story.performed_at).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge variant={story.status === "published" ? "default" : "secondary"} className="text-xs">
                    {story.status === "published" ? (
                      <Pin className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {story.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3 sm:pb-4 p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {renderMediaPreview(story)}
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
                    {story.featured_title || story.ripple_title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {story.featured_description || story.ripple_description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    {renderCategoryBadge(story)}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                        {story.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        {story.comments_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/50 px-4 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(story.ripple_action_id, "spotlight")}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Full Story
              </Button>
              
              {story.status === "pending" && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs w-full sm:w-auto justify-center">
                  <Clock className="h-3 w-3" />
                  Under Review
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderPendingContent = () => {
    if (loadingPending) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (pendingNominations.length === 0) {
      return (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Nominations</h3>
          <p className="text-muted-foreground mb-4">
            All approved stories from your classrooms are shown here for Hero Wall nomination.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-6">
        {pendingNominations.map((nomination) => (
          <Card key={nomination.id} className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {renderMediaPreview(nomination)}
                <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <UserAvatarOnly nickname={nomination.user_nickname} avatar_id={nomination.avatar_id} profile_image_path={nomination.profile_image_path} />
                        </Avatar>
                        <span className="font-semibold text-sm sm:text-base truncate">{nomination.user_nickname}</span>
                        <Badge variant="outline" className="text-xs">{nomination.classroom_name}</Badge>
                        {renderCategoryBadge(nomination)}
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{nomination.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3">
                        {nomination.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(nomination.performed_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {nomination.likes_count} likes
                      </span>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(nomination.id, "nomination")}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedNomination(nomination)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Nominate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSubmittedContent = () => {
    if (loadingSubmitted) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (submittedStories.length === 0) {
      return (
        <div className="text-center py-12">
          <Send className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Submitted Stories</h3>
          <p className="text-muted-foreground">
            Stories you submit for Hero Wall consideration will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-6">
        {submittedStories.map((story) => (
          <Card key={story.id} className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {renderMediaPreview(story)}
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <UserAvatarOnly nickname={story.user_nickname} avatar_id={story.avatar_id} profile_image_path={story.profile_image_path} />
                        </Avatar>
                        <span className="font-semibold text-sm sm:text-base truncate">{story.user_nickname}</span>
                        <Badge variant="outline" className="text-xs">{story.classroom_name}</Badge>
                        {renderCategoryBadge(story)}
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
                        {story.featured_title || story.ripple_title}
                      </h3>
                      {story.featured_description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-3">
                          {story.featured_description}
                        </p>
                      )}
                    </div>
                    <Badge variant={story.status === "published" ? "default" : "secondary"} className="text-xs flex-shrink-0">
                      {story.status === "published" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {story.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span>
                      Submitted on {new Date(story.submitted_at).toLocaleDateString()}
                    </span>
                    {story.status === "pending" && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">Awaiting admin approval</span>
                        <span className="sm:hidden">Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full lg:w-auto">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stories..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="pl-9 w-full"
        />
      </div>
      
      <Select
        value={filters.classroom_id}
        onValueChange={(value) => setFilters(prev => ({ ...prev, classroom_id: value }))}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Classes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id.toString()}>
              {classroom.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeTab !== "nominations" && (
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );

  // ================== RENDER ==================

  return (
    <>
      <Seo title="Hero Wall - Teacher Panel" description="Spotlight exceptional acts of kindness from your classrooms" />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_hero_wall_tutorial_completed"
        />
      )}
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Hero Wall
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Spotlight exceptional acts of kindness from your classrooms
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              asChild
              size="sm"
              className="flex items-center gap-2"
            >
              <Link to="/teacher/post-story">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add New Story</span>
              </Link>
            </Button>
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

      <div className="space-y-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedStories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {submittedStories.filter(s => s.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {submittedStories.filter(s => s.status === 'published').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Your Hero Wall Submissions
              </CardTitle>
              {renderFilters()}
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubmitted ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : submittedStories.length > 0 ? (
              <div className="space-y-4">
                {submittedStories.map((story) => (
                  <div 
                    key={story.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPreview(story)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Story Image */}
                      {story.photo_path && (
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(story.photo_path)}
                            alt="Story"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Story Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {story.featured_title || story.ripple_title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={story.status === 'published' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {story.status === 'published' ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Published
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                        
                        {story.featured_description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {story.featured_description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {story.user_nickname}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {story.classroom_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(story.submitted_at).toLocaleDateString()}
                          </span>
                          {story.category_name && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {story.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex-shrink-0 pt-2 sm:pt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreview(story);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Wall Requests Yet</h3>
                <p className="text-gray-500 mb-4">
                  Submit your students' stories to the Hero Wall to inspire others with acts of kindness.
                </p>
                <Button asChild>
                  <Link to="/teacher/manage-student-stories">
                    <Plus className="h-4 w-4 mr-2" />
                    Nominate Stories
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedPreview} onOpenChange={() => setSelectedPreview(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Story Preview</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              How this story will appear on the Hero Wall
            </DialogDescription>
          </DialogHeader>
          {selectedPreview && (
            <div className="space-y-3 sm:space-y-4">
              {selectedPreview.photo_path && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedPreview.photo_path)}
                    alt="Story media"
                    className={`w-full h-full object-cover ${
                            !selectedPreview.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
                      }`}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <UserAvatarOnly nickname={selectedPreview.user_nickname} avatar_id={selectedPreview.avatar_id} profile_image_path={selectedPreview.profile_image_path} />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{selectedPreview.user_nickname}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <span className="truncate">{selectedPreview.classroom_name}</span> • {new Date(selectedPreview.performed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-2">
                  {selectedPreview.featured_title || selectedPreview.ripple_title}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {selectedPreview.featured_description || selectedPreview.ripple_description}
                </p>
              </div>

              {selectedPreview.category_name && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Category:</span>
                  {renderCategoryBadge(selectedPreview)}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {selectedPreview.likes_count || 0} likes
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}

function setLoadingSpotlight(arg0: boolean) {
  throw new Error("Function not implemented.");
}
