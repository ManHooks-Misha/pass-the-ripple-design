import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  X,
  Eye,
  Trophy,
  MoreVertical,
  Edit2,
  Search as SearchIcon,
  Download,
  Loader2,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  FileText,
  Upload,
  Image as ImageIcon,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';

// Define API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
import { getIconByName } from '@/config/icons';
import { getAuthToken } from '@/lib/auth-token';
import { showConfirmationDialog, showWarningDialog } from '@/components/ui/confirmation-dialog';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ✅ Admin Shared Components
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SearchBar } from "@/components/admin/SearchBar";
import { ViewToggle } from "@/components/admin/ViewToggle";
import { Pagination as AdminPagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { LoadingOverlay } from "@/components/admin/LoadingOverlay";
import { DataCard } from "@/components/admin/DataCard";

// ✅ Shared Hooks
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useExportData } from "@/hooks/useExportData";
import { getImageUrl } from '@/utils/imageUrl';
import { getAvatarImage } from '@/utils/avatars';
import { Link } from 'react-router-dom';
import { FormattedContent, RichTextEditor } from '@/components/ui/RichTextEditor';
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { manageStudentStoriesTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";
import Seo from "@/components/Seo";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  is_active: boolean;
}

interface Comment {
  id: number;
  body: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    nickname: string;
    full_name?: string;
    profile_image?: string;
  };
  replies?: Comment[];
}

interface StudentStory {
  id: number;
  user_id: number;
  title: string;
  description: string;
  action_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  performed_at: string;
  created_at: string;
  photo_path?: string | null;
  ripple_category_id?: number;
  is_approved: boolean;
  is_flagged: boolean;
  is_under_review: boolean;
  is_hero_wall_pinned: boolean;
  is_canceled: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  user?: {
    id: number;
    nickname: string;
    email: string;
    full_name?: string;
    profile_image_path?: string | null;
    avatar_id?: number | null;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
  };
  // Hero Wall Request fields
  hero_wall_status?: 'pending' | 'approved' | 'rejected' | 'published' | null;
  hero_wall_request_id?: number;
  hero_wall_id?: number;
  hero_wall_featured_at?: string;
  hero_wall_teacher_quote?: string;
  hero_wall_rejection_reason?: string;
  can_nominate_hero_wall?: boolean;
}

export default function ManageStories() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_manage_student_stories_tutorial_completed",
    steps: manageStudentStoriesTutorialSteps,
  });

  const [submissions, setSubmissions] = useState<StudentStory[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentStory | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending'); // Default to pending
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterHeroWall, setFilterHeroWall] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [perPage, setPerPage] = useState<number | "all">(50);

  const [counts, setCounts] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
  }>({
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
  });

  const [countsLoading, setCountsLoading] = useState(true);

  // Nomination dialog (Hero Wall Request)
  const [isNominationDialogOpen, setIsNominationDialogOpen] = useState(false);
  const [nominationSubmission, setNominationSubmission] = useState<StudentStory | null>(null);
  const [nominationForm, setNominationForm] = useState({
    teacher_quote: '',
    teacher_comment: '',
  });
  const [nominationLoading, setNominationLoading] = useState(false);

  // ✅ Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { pagination, updatePagination, resetPagination } = usePagination(typeof perPage === "number" ? perPage : 50);
  const { exporting, exportData } = useExportData();


  // Stats
  const stats = [
    {
      title: 'Pending',
      value: counts.pending,
      description: 'Awaiting review',
      icon: Clock,
      color: 'orange' as const,
    },
    {
      title: 'Published',
      value: counts.approved,
      description: 'Live stories',
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      title: 'Submitted',
      value: counts.pending + counts.approved,
      description: 'Total nominations',
      icon: Send,
      color: 'blue' as const,
    },
  ];

  // === API Methods ===
  const loadCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      let res;
      try {
        res = await apiFetch<{ data: Category[] }>('/categories');
      } catch {
        res = await apiFetch<{ data: Category[] }>('/admin/categories');
      }
      if (res?.data) setCategories(res.data);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
    }
  };

  const loadSubmissions = async (
    page: number = 1,
    search: string = '',
    status: string = 'all',
    category: string = 'all',
    heroWall: string = 'all',
    from: string = '',
    to: string = '',
    isSearch: boolean = false,
    isPerPageChange: boolean = false,
    customPerPage?: number
  ) => {
    if (page === 1 && !search && status === 'all' && category === 'all' && heroWall === 'all' && !from && !to && !isSearch) {
      setLoading(true);
    } else if (isPerPageChange) {
      setTableLoading(true);
    } else {
      setSearchLoading(true);
    }

    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "No auth token found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (customPerPage || perPage).toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (status !== "all") params.append("status", status);
      if (category !== "all") params.append("category_id", category);
      if (heroWall !== "all") params.append("is_hero_wall_pinned", heroWall === "true" ? "1" : "0");
      if (from) params.append("date_from", from);
      if (to) params.append("date_to", to);

      const apiUrl = `/teacher/stories?${params.toString()}`;
      const response = await apiFetch<any>(apiUrl);

      if (response.success && response.data?.data) {
        const submissionsData = response.data.data || [];

        // Map API data to StudentStory interface
        const items: StudentStory[] = submissionsData.map((a: any) => {
          return {
            id: a.id,
            user_id: a.user_id,
            title: a.title,
            description: a.description,
            action_type: a.action_type,
            status: a.status,
            performed_at: a.performed_at,
            created_at: a.created_at,
            photo_path: a.photo_path,
            ripple_category_id: a.ripple_category_id,
            is_approved: a.is_approved,
            is_flagged: a.is_flagged,
            is_under_review: a.is_under_review,
            is_hero_wall_pinned: a.is_hero_wall_pinned,
            is_canceled: a.is_canceled,
            likes_count: a.likes_count || 0,
            comments_count: a.comments_count || 0,
            shares_count: a.shares_count || 0,
            user: a.user,
            category: a.category,
            // Hero Wall Request fields
            hero_wall_status: a.hero_wall_status || null,
            hero_wall_request_id: a.hero_wall_request_id,
            hero_wall_id: a.hero_wall_id,
            hero_wall_featured_at: a.hero_wall_featured_at,
            hero_wall_teacher_quote: a.hero_wall_teacher_quote,
            hero_wall_rejection_reason: a.hero_wall_rejection_reason,
            can_nominate_hero_wall: a.can_nominate_hero_wall ?? false,
          };
        });

        setSubmissions(items);

        const paginationData = response.data;
        updatePagination({
          currentPage: paginationData.current_page || 1,
          lastPage: paginationData.last_page || 1,
          total: paginationData.total || 0,
          perPage: typeof (customPerPage || perPage) === "number" ? (customPerPage || perPage) as number : 50,
          from: paginationData.from || 0,
          to: paginationData.to || 0,
        });
      } else {
        throw new Error(response.message || "Failed to fetch stories");
      }
    } catch (err: any) {
      console.error("Fetch stories error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load stories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setTableLoading(false);
    }
  };

  const fetchSubmissionCounts = async (): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
  }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    // Get counts from all student stories
    const response = await apiFetch<any>('/teacher/stories/counts');

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch counts");
    }

    const data = response.data?.counts || {};
    const counts = {
      pending: data.pending || 0,
      approved: data.approved || 0,
      rejected: data.rejected || 0,
      flagged: data.flagged || 0,
    };

    return counts;
  };


  const loadCounts = async () => {
    setCountsLoading(true);
    try {
      const data = await fetchSubmissionCounts();
      setCounts(data);
    } catch (err: any) {
      console.error("Failed to load counts:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load stats.",
        variant: "destructive",
      });
      // Optionally reset to zeros or keep previous
    } finally {
      setCountsLoading(false);
    }
  };

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSubmissions();
    loadCounts();
    setFiltersInitialized(true);
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    if (!filtersInitialized) return;
    resetPagination();
    loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, true);
  }, [debouncedSearchQuery]);

  // Watch for filter changes and reload data dynamically
  useEffect(() => {
    if (!filtersInitialized) return;

    // Reset pagination when filters change
    resetPagination();
    loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo]);

  // handleStatusFilter is now handled by the tab buttons directly

  const handleCategoryFilter = (category: string) => {
    setFilterCategory(category);
    // Data will reload via useEffect
  };

  const handleHeroWallFilter = (heroWall: string) => {
    setFilterHeroWall(heroWall);
    // Data will reload via useEffect
  };

  const handleDateFromChange = (from: string) => {
    setDateFrom(from);
    // Data will reload via useEffect
  };

  const handleDateToChange = (to: string) => {
    setDateTo(to);
    // Data will reload via useEffect
  };

  // === Actions ===


  const submitNomination = async () => {
    if (!nominationSubmission) return;

    setNominationLoading(true);
    try {
      // Use the new hero wall request endpoint
      const response: ApiResponse = await apiFetch(`/teacher/stories/${nominationSubmission.id}/hero-wall-request`, {
        method: 'POST',
        body: JSON.stringify({
          teacher_quote: nominationForm.teacher_quote || null,
          teacher_comment: nominationForm.teacher_comment || null,
        }),
      });

      if (response.success) {
        toast({ title: 'Success', description: 'Hero Wall request submitted! Admin will review your nomination.' });
        setIsNominationDialogOpen(false);
        setNominationSubmission(null);
        setNominationForm({ teacher_quote: '', teacher_comment: '' });
        await loadSubmissions(pagination.currentPage, searchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
      } else {
        throw new Error(response.message || 'Failed to submit nomination');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit nomination', variant: 'destructive' });
    } finally {
      setNominationLoading(false);
    }
  };

  const withdrawNomination = async (requestId: number) => {
    const result = await showConfirmationDialog({
      title: 'Withdraw Hero Wall Request',
      text: 'Are you sure you want to withdraw this Hero Wall request? This action cannot be undone.',
      icon: 'warning',
      confirmButtonText: 'Yes, Withdraw',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        // Use the new hero wall requests endpoint
        const response: ApiResponse = await apiFetch(`/teacher/hero-wall/requests/${requestId}`, {
          method: 'DELETE',
        });

        if (response.success) {
          toast({ title: 'Success', description: 'Hero Wall request withdrawn successfully.' });
          await loadSubmissions(pagination.currentPage, searchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
        } else {
          throw new Error(response.message || 'Failed to withdraw request');
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to withdraw request', variant: 'destructive' });
      }
    }
  };



  const openNominationDialog = (submission: StudentStory) => {
    setNominationSubmission(submission);
    setNominationForm({
      teacher_quote: '',
      teacher_comment: '',
    });
    setIsNominationDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    loadSubmissions(page, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
    const card = document.querySelector('[data-submissions-list]');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRefresh = () => {
    loadSubmissions(pagination.currentPage, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
    toast({ title: 'Refreshed', description: 'Data refreshed successfully.' });
  };

  const handleExport = () => {
    const exportFilters = {
      search: searchQuery.trim() || undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      category_id: filterCategory !== "all" ? filterCategory : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      per_page: perPage === "all" ? undefined : perPage, // If "all", don't send per_page parameter
      page: perPage === "all" ? "all" : 1, // If "all", export all pages, otherwise just page 1
    };


    exportData({
      exportEndpoint: "/teacher/hero-wall/submitted?export=true",
      listEndpoint: "/teacher/hero-wall/submitted",
      dataKey: "data",
      fileNamePrefix: "teacher-hero-wall-nominations",
      filters: exportFilters,
      columns: [
        { key: "id", label: "ID" },
        { key: "ripple_title", label: "Title" },
        { key: "ripple_description", label: "Description" },
        { key: "status", label: "Status" },
        {
          key: "user_full_name",
          label: "User",
          formatter: (name) => name || "Unknown",
        },
        {
          key: "classroom_name",
          label: "Classroom",
          formatter: (name) => name || "N/A",
        },
        {
          key: "category_name",
          label: "Category",
          formatter: (name) => name || "N/A",
        },
        { key: "likes_count", label: "Likes" },
        { key: "comments_count", label: "Comments" },
        {
          key: "submitted_at",
          label: "Submitted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  // === Helper Functions ===
  const getAvatarSource = (user: StudentStory['user']) => {
    if (!user) return null;

    // Priority: profile_image_path > avatar_id (using utils)
    if (user.profile_image_path) {
      return getImageUrl(user.profile_image_path);
    }
    if (user.avatar_id) {
      // Use the avatar utility to get the character avatar image
      return getAvatarImage(user.avatar_id, null);
    }
    return null;
  };

  // === Render ===
  if (loading && !searchLoading) {
    return <LoadingState message="Loading stories..." />;
  }

  const UserAvatar = ({ submission }: { submission: StudentStory }) => {
    const user = submission.user;
    const displayName = user?.nickname || user?.full_name || 'Unknown Student';
    const avatarSource = getAvatarSource(user);

    return (
      <div className="flex items-center gap-2">
        {avatarSource ? (
          <img
            src={avatarSource}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium ${avatarSource ? 'hidden' : ''}`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm">{displayName}</span>
      </div>
    );
  };

  const EngagementMetrics = ({ submission }: { submission: StudentStory }) => {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>{submission.likes_count || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{submission.comments_count || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="h-3 w-3" />
          <span>{submission.shares_count || 0}</span>
        </div>
      </div>
    );
  };

  const CategoryDisplay = ({ submission }: { submission: StudentStory }) => {
    const cat = submission.category || {
      name: submission.action_type,
      icon: 'heart'
    };
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0" >
          <img src={cat.icon ? getImageUrl(cat.icon) : '/icons/heart.svg'} alt={cat.name} className="w-4 h-4" />
        </div>
        <Badge variant="outline">
          {cat.name}
        </Badge>
      </div>
    );
  };

  return (
    <>
      <Seo title="Manage Student Stories - Teacher Panel" description="Review and moderate user submissions stories" />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_manage_student_stories_tutorial_completed"
        />
      )}
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Manage Student Ripples Stories
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review and moderate user submissions stories
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
            <Button onClick={handleExport} size="sm" disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ✅ Stats */}
        <StatsGrid stats={stats} loading={loading} grid_count={3} />

        {/* ✅ Submissions List */}
        <DataCard
          title="Student Stories List"
          icon={Filter}
          loading={searchLoading}
          loadingMessage="Searching..."
          dataAttribute="data-submissions-list"
          actions={<ViewToggle viewType={viewType} onViewChange={setViewType} disabled={searchLoading} />}
        >
          {searchLoading && <LoadingOverlay message="Loading stories..." />}
          {tableLoading && <LoadingOverlay message="Updating table..." />}

          {/* Search and Filters Section - 2 Row Layout */}
          <div className="space-y-4 mb-6 overflow-hidden" data-tutorial-target="filters">
            {/* First Row: Per-Page (Top Left), Search Bar, and Date Fields */}
            <div className="flex flex-col xl:flex-row gap-3 items-end w-full">
              {/* Per-Page Selector - Top Left */}
              <div className="flex items-center gap-2 w-full xl:w-auto flex-shrink-0">
                <Label htmlFor="per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</Label>
                <Select value={perPage.toString()} onValueChange={(value) => {
                  const newPerPage = value === "all" ? "all" : parseInt(value);
                  setPerPage(newPerPage);
                  // Reset pagination and reload data with new perPage
                  resetPagination();
                  loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false, true, typeof newPerPage === "number" ? newPerPage : undefined);
                }}>
                  <SelectTrigger className="w-20 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
              </div>

              {/* Search Bar */}
              <div className="flex-1 w-full xl:max-w-md min-w-0">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search stories..."
                  loading={searchLoading}
                />
              </div>

              {/* Date Fields - Separate row on iPad */}
              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-shrink-0 max-w-full">
                <div className="flex flex-col gap-1 flex-1 sm:flex-initial sm:w-32 md:w-36 xl:w-40 min-w-0">
                  <Label htmlFor="date-from" className="text-xs sm:text-sm text-gray-700 font-medium">From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    name="date_from"
                    value={dateFrom}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className={`w-full h-9 sm:h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 text-sm ${dateFrom ? 'border-blue-500 bg-blue-50/50' : ''
                      }`}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1 sm:flex-initial sm:w-32 md:w-36 xl:w-40 min-w-0">
                  <Label htmlFor="date-to" className="text-xs sm:text-sm text-gray-700 font-medium">To</Label>
                  <Input
                    id="date-to"
                    name="date_to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className={`w-full h-9 sm:h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 text-sm ${dateTo ? 'border-blue-500 bg-blue-50/50' : ''
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Tabs for different statuses */}
            <div className="flex flex-wrap gap-2 mb-4 border-b">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  resetPagination();
                  loadSubmissions(1, debouncedSearchQuery, 'all', filterCategory, filterHeroWall, dateFrom, dateTo, true);
                }}
                className="px-3 py-1.5 text-sm"
              >
                All ({counts.pending + counts.approved})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setFilterStatus('pending');
                  resetPagination();
                  loadSubmissions(1, debouncedSearchQuery, 'pending', filterCategory, filterHeroWall, dateFrom, dateTo, true);
                }}
                className="px-3 py-1.5 text-sm"
              >
                Pending ({counts.pending})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setFilterStatus('approved');
                  resetPagination();
                  loadSubmissions(1, debouncedSearchQuery, 'approved', filterCategory, filterHeroWall, dateFrom, dateTo, true);
                }}
                className="px-3 py-1.5 text-sm"
              >
                Approved ({counts.approved})
              </Button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <Select value={filterCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className={`w-full sm:w-44 md:w-48 h-9 sm:h-10 text-sm ${filterCategory !== 'all' ? 'border-blue-500 bg-blue-50/50' : ''
                    }`}>
                    <SelectValue placeholder="Filter by Ripple Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ripple Types</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterHeroWall} onValueChange={handleHeroWallFilter}>
                  <SelectTrigger className={`w-full sm:w-44 md:w-48 h-9 sm:h-10 text-sm ${filterHeroWall !== 'all' ? 'border-blue-500 bg-blue-50/50' : ''
                    }`}>
                    <SelectValue placeholder="Filter by Hero Wall" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stories</SelectItem>
                    <SelectItem value="true">Hero Wall Only</SelectItem>
                    <SelectItem value="false">Not Hero Wall</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setFilterHeroWall('all');
                    setDateFrom('');
                    setDateTo('');
                    loadSubmissions(1, '', 'all', 'all', 'all', '', '', false);
                  }}
                  className="whitespace-nowrap self-end sm:self-auto"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>

          <div data-tutorial-target="stories-list">
            {viewType === "list" ? (
              submissions.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full min-w-[600px] md:min-w-[800px]">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm">Title</th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm">Ripple Type / Hero-Wall</th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm">Engagement</th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm">Submitted</th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm">Status</th>
                          <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub, index) => (
                          <tr key={sub.id} className="border-b hover:bg-muted/30">
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 max-w-[200px] sm:max-w-xs truncate">
                              <Link to={`/story/${sub.id}`} className='text-blue-800 text-xs sm:text-sm' target='_blank'> {sub.title} </Link>
                              <div className="flex items-center gap-2">
                                {sub.user?.profile_image_path ? (
                                  <img
                                    src={getImageUrl(sub.user.profile_image_path)}
                                    alt={sub.user.nickname}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : (
                                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium`}>
                                    {sub.user.nickname.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm">{sub.user.nickname}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0" >
                                  <img src={getIconByName(sub.category?.icon || 'heart')} alt={sub.category?.name || 'Uncategorized'} className="w-4 h-4" />
                                </div>
                                <Badge variant="outline">
                                  {sub.category?.name || 'Uncategorized'}
                                </Badge>
                              </div>
                              {/* Hero Wall Request Status Badge */}
                              <div className='mt-1 sm:mt-2'>
                                {sub.hero_wall_status === 'published' && (
                                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] sm:text-xs">
                                    <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    Hero Wall
                                  </Badge>
                                )}
                                {sub.hero_wall_status === 'pending' && (
                                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    Pending Review
                                  </Badge>
                                )}
                                {sub.status === 'approved' && (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] sm:text-xs">
                                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {sub.hero_wall_status === 'rejected' && (
                                  <Badge className="bg-red-100 text-red-700 text-[10px] sm:text-xs" title={sub.hero_wall_rejection_reason || 'Rejected'}>
                                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{sub.likes_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{sub.comments_count || 0}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                              <div className="flex items-center text-xs sm:text-sm">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{new Date(sub.created_at).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-upper">
                              <Badge
                                variant={
                                  sub.status === 'published'
                                    ? 'default'
                                    : sub.status === 'pending'
                                      ? 'secondary'
                                      : 'outline'
                                }
                                className="text-[10px] sm:text-xs"
                              >
                                {sub.status === 'published' ? 'Published' :
                                  sub.status === 'pending' ? 'Pending' :
                                    sub.status}
                              </Badge>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => setSelectedSubmission(sub)}>
                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {/* Hero Wall Actions based on status */}
                                  {sub.can_nominate_hero_wall && (
                                    <DropdownMenuItem onClick={() => openNominationDialog(sub)}>
                                      <Send className="h-4 w-4 text-blue-600 mr-2" /> Nominate for Hero Wall
                                    </DropdownMenuItem>
                                  )}

                                  {sub.hero_wall_status === 'pending' && sub.hero_wall_request_id && (
                                    <DropdownMenuItem onClick={() => withdrawNomination(sub.hero_wall_request_id!)} className="text-red-600">
                                      <X className="h-4 w-4 mr-2" /> Withdraw Request
                                    </DropdownMenuItem>
                                  )}

                                  {sub.hero_wall_status === 'published' && (
                                    <DropdownMenuItem disabled className="text-green-600">
                                      <Trophy className="h-4 w-4 mr-2" /> On Hero Wall
                                    </DropdownMenuItem>
                                  )}

                                  {sub.hero_wall_status === 'rejected' && (
                                    <>
                                      <DropdownMenuItem disabled className="text-red-600 text-xs">
                                        <AlertTriangle className="h-4 w-4 mr-2" /> Rejected: {sub.hero_wall_rejection_reason?.substring(0, 30) || 'No reason'}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openNominationDialog(sub)}>
                                        <Send className="h-4 w-4 text-blue-600 mr-2" /> Re-submit for Hero Wall
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {!sub.hero_wall_status && sub.status !== 'approved' && (
                                    <DropdownMenuItem disabled className="text-gray-400 text-xs">
                                      <AlertTriangle className="h-4 w-4 mr-2" /> Approve story first to nominate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <EmptyState
                    icon={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo ? SearchIcon : Eye}
                    title={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo ? 'No stories found' : 'No stories yet'}
                    description={
                      searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo
                        ? 'Try adjusting your filters or search terms.'
                        : 'Stories will appear here once users post.'
                    }
                    action={
                      searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo
                        ? {
                          label: 'Clear filters',
                          onClick: () => {
                            setSearchQuery('');
                            setFilterStatus('all');
                            setFilterCategory('all');
                            setFilterHeroWall('all');
                            setDateFrom('');
                            setDateTo('');
                            loadSubmissions(1, '', 'all', 'all', 'all', '', '', false);
                          },
                        }
                        : undefined
                    }
                  />
                </div>
              )
            ) : (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <Card
                      key={sub.id}
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      {/* Image Section */}
                      {sub.photo_path && (
                        <div className="relative w-full h-40 sm:h-44 md:h-48 bg-muted overflow-hidden">
                          <img
                            src={getImageUrl(sub.photo_path)}
                            alt={sub.ripple_title}
                            className={`w-full h-full object-cover ${!sub.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
                              }`}
                          />
                          {sub.status === 'published' && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] sm:text-xs">
                                <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                Hero Wall
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1 sm:mb-2">{sub.featured_title || sub.ripple_title}</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0" >
                                <img src={'/icons/heart.svg'} alt={sub.category_name || 'Uncategorized'} className="w-4 h-4" />
                              </div>
                              <Badge variant="outline">
                                {sub.category_name || 'Uncategorized'}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedSubmission(sub); }}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {sub.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openNominationDialog(sub); }}>
                                    <Send className="h-4 w-4 text-blue-600 mr-2" /> Nominate for Hero Wall
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); withdrawNomination(sub.id); }} className="text-red-600">
                                    <X className="h-4 w-4 mr-2" /> Withdraw Nomination
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sub.status === 'published' && (
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Published on Hero Wall
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 md:p-6 pt-0">
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {sub.ripple_description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sub.user?.profile_image_path ? (
                              <img
                                src={getImageUrl(sub.user.profile_image_path)}
                                alt={sub.user_nickname}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : (
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium`}>
                                {sub.user_nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm">{sub.user_nickname}</span>
                          </div>
                          <Badge
                            variant={
                              sub.status === 'published'
                                ? 'default'
                                : sub.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="capitalize text-[10px] sm:text-xs"
                          >
                            {sub.status === 'published' ? 'Published' :
                              sub.status === 'pending' ? 'Pending' :
                                sub.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{sub.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{sub.comments_count || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(sub.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo ? SearchIcon : Eye}
                      title={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo ? 'No stories found' : 'No stories yet'}
                      description={
                        searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo
                          ? 'Try adjusting your filters or search terms.'
                          : 'Stories will appear here once users post.'
                      }
                      action={
                        searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterHeroWall !== 'all' || dateFrom || dateTo
                          ? {
                            label: 'Clear filters',
                            onClick: () => {
                              setSearchQuery('');
                              setFilterStatus('all');
                              setFilterCategory('all');
                              setFilterHeroWall('all');
                              setDateFrom('');
                              setDateTo('');
                              loadSubmissions(1, '', 'all', 'all', 'all', '', '', false);
                            },
                          }
                          : undefined
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {submissions.length > 0 && pagination.lastPage > 1 && (
              <AdminPagination
                currentPage={pagination.currentPage}
                lastPage={pagination.lastPage}
                total={pagination.total}
                perPage={pagination.perPage}
                onPageChange={handlePageChange}
                loading={searchLoading}
              />
            )}
          </div>
        </DataCard>

        {/* === Modals === */}
        {/* View Submission Dialog */}
        {selectedSubmission && (
          <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Hero Wall Story Review
                </DialogTitle>
                <DialogDescription>
                  Review and nominate this story for Hero Wall
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Header Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      selectedSubmission.status === 'published' ? 'default' :
                        selectedSubmission.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {selectedSubmission.status === 'published' ? 'PUBLISHED' :
                        selectedSubmission.status === 'pending' ? 'PENDING' :
                          selectedSubmission.status}
                    </Badge>
                    {selectedSubmission.status === 'published' && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        HERO WALL
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedSubmission.featured_title || selectedSubmission.ripple_title}</h2>

                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {(() => {
                        const avatarSource = selectedSubmission.profile_image_path ? getImageUrl(selectedSubmission.profile_image_path) : null;
                        return avatarSource ? (
                          <img
                            src={avatarSource}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {selectedSubmission.user_nickname.charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedSubmission.user_nickname}
                      </p>
                      {selectedSubmission.user_nickname && (
                        <p className="text-sm text-gray-500">@{selectedSubmission.user_nickname}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
                      <FormattedContent
                        content={selectedSubmission.ripple_description}
                        className="text-gray-900 leading-relaxed"
                      />
                    </div>

                    {/* Category Details */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-green-700 mb-3 block">Category Details</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0" >
                          <img src={'/icons/heart.svg'} alt={selectedSubmission.category_name || 'Uncategorized'} className="w-4 h-4" />
                        </div>
                        <Badge variant="outline">
                          {selectedSubmission.category_name || 'Uncategorized'}
                        </Badge>
                      </div>
                    </div>

                    {/* Image */}
                    {selectedSubmission.photo_path && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">Attached Image</Label>
                        <div className="relative">
                          <img
                            src={getImageUrl(selectedSubmission.photo_path)}
                            alt="Submission"
                            className={`w-full max-h-96 object-contain rounded-lg border border-gray-200 ${!selectedSubmission.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
                              }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comments ({selectedSubmission.comments_count || 0})
                      </Label>
                      <div className="text-center py-6">
                        <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Comments are not displayed in this view</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Metadata */}
                  <div className="space-y-6">
                    {/* Engagement Stats */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-blue-700 mb-3 block">Engagement</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Likes</span>
                          </div>
                          <span className="font-semibold">{selectedSubmission.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Comments</span>
                          </div>
                          <span className="font-semibold">{selectedSubmission.comments_count || 0}</span>
                        </div>

                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-purple-700 mb-3 block">Timeline</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Submitted:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedSubmission.submitted_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge variant={
                            selectedSubmission.status === 'published' ? 'default' :
                              selectedSubmission.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {selectedSubmission.status === 'published' ? 'Published' :
                              selectedSubmission.status === 'pending' ? 'Pending' :
                                selectedSubmission.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-orange-700 mb-3 block">Quick Actions</Label>
                      <div className="space-y-2">


                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                      Close
                    </Button>
                    {selectedSubmission.status === 'pending' && (
                      <Button
                        variant="default"
                        onClick={() => openNominationDialog(selectedSubmission)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Nominate for Hero Wall
                      </Button>
                    )}
                    {selectedSubmission.status === 'published' && (
                      <Button
                        variant="outline"
                        onClick={() => toast({ title: 'Info', description: 'This story is already published on Hero Wall.' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Published on Hero Wall
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Hero Wall Nomination Dialog */}
        <Dialog open={isNominationDialogOpen} onOpenChange={setIsNominationDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Nominate for Hero Wall
              </DialogTitle>
              <DialogDescription>
                Submit this student's story for Hero Wall consideration. Add your quote or comment to highlight why this story deserves recognition.
              </DialogDescription>
            </DialogHeader>

            {nominationSubmission && (
              <div className="space-y-4 mt-4">
                {/* Story Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {nominationSubmission.photo_path && (
                      <img
                        src={getImageUrl(nominationSubmission.photo_path)}
                        alt={nominationSubmission.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{nominationSubmission.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {nominationSubmission.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {nominationSubmission.user?.nickname || nominationSubmission.user?.full_name || 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Quote */}
                <div className="space-y-2">
                  <Label htmlFor="teacher_quote" className="text-sm font-medium">
                    Your Quote <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="teacher_quote"
                    placeholder="e.g., 'This act of kindness truly inspired our class!'"
                    value={nominationForm.teacher_quote}
                    onChange={(e) => setNominationForm({ ...nominationForm, teacher_quote: e.target.value })}
                    maxLength={500}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    A short inspiring quote about this story (max 500 characters)
                  </p>
                </div>

                {/* Teacher Comment */}
                <div className="space-y-2">
                  <Label htmlFor="teacher_comment" className="text-sm font-medium">
                    Your Comment <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="teacher_comment"
                    placeholder="Share why this story deserves to be on the Hero Wall. What impact did it have? How did it inspire others?"
                    value={nominationForm.teacher_comment}
                    onChange={(e) => setNominationForm({ ...nominationForm, teacher_comment: e.target.value })}
                    maxLength={2000}
                    rows={4}
                    className="w-full resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide context for the admin reviewer (max 2000 characters)
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">What happens next?</p>
                      <p className="mt-1">Your nomination will be sent to the admin for review. They will approve or reject the request, and you'll be notified of the decision.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNominationDialogOpen(false);
                  setNominationSubmission(null);
                  setNominationForm({ teacher_quote: '', teacher_comment: '' });
                }}
                disabled={nominationLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={submitNomination}
                disabled={nominationLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {nominationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Nomination
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}