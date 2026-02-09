import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  X,
  Flag,
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
  Facebook,
  Twitter,
  Mail,
  Link2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
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
import { Link } from 'react-router-dom';
import { FormattedContent, RichTextEditor } from '@/components/ui/RichTextEditor';
import { ShareStoryDialog } from '@/components/shared/ShareStoryDialog';
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { teacherMyStoriesTutorialSteps } from "@/hooks/usePageTutorialSteps";
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

interface Submission {
  id: number;
  userId: number;
  userName: string;
  userFullName?: string;
  userImage?: string;
  type: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string | null;
  photo_path?: string | null;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  tags: string[];
  heroWall: boolean;
  categoryId?: string;
  category?: Category;
  comments?: Comment[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  user?: {
    id: number;
    nickname: string;
    email: string;
    full_name?: string;
    profile_image?: string;
  };
}

export default function ManageStories() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_my_stories_tutorial_completed",
    steps: teacherMyStoriesTutorialSteps,
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [storyToShare, setStoryToShare] = useState<{ id: number; slug?: string; title: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterHeroWall, setFilterHeroWall] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [perPage, setPerPage] = useState<number | "all">(50);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewType, setViewType] = useState<"list" | "grid">("list");

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

  // Edit modal
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    action_type: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'flagged',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reject modal
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submissionToReject, setSubmissionToReject] = useState<number | null>(null);

  // ✅ Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { pagination, updatePagination, resetPagination } = usePagination(20);
  const { exporting, exportData } = useExportData();

  // Stats
  const stats = [
    {
      title: 'Pending',
      value: counts.pending,
      description: 'Awaiting review',
      icon: Eye,
      color: 'orange' as const,
    },
    {
      title: 'Approved',
      value: counts.approved,
      description: 'Published',
      icon: Check,
      color: 'green' as const,
    },
    {
      title: 'Rejected',
      value: counts.rejected,
      description: 'Declined',
      icon: X,
      color: 'red' as const,
    },
    {
      title: 'Flagged',
      value: counts.flagged,
      description: 'Under review',
      icon: Flag,
      color: 'yellow' as const,
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
    isSearch: boolean = false
  ) => {
    if (page === 1 && !search && status === 'all' && category === 'all' && heroWall === 'all' && !from && !to && !isSearch) {
      setLoading(true);
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
        per_page: perPage.toString(),
        fetch_type: "user"
      });
      if (search.trim()) params.append("search", search.trim());
      if (status !== "all") params.append("status", status);
      if (category !== "all") params.append("category_id", category);
      if (heroWall === "true") params.append("is_hero_wall_pinned", "1");
      else if (heroWall === "false") params.append("is_hero_wall_pinned", "0");
      if (from) params.append("date_from", from);
      if (to) params.append("date_to", to);

      const apiUrl = `/teacher/my-stories?${params.toString()}`;
      const response = await apiFetch<any>(apiUrl);

      if (response.success && response.data?.data) {
        const submissionsData = response.data.data || [];
        
        // Map API data to Submission interface
        const items: Submission[] = submissionsData.map((a: any) => {
          const category = a.category || categories.find(cat => cat.id === a.ripple_category_id?.toString());
          return {
            id: a.id,
            userId: a.user_id,
            userName: a.user?.nickname || a.user?.email || 'Unknown',
            userFullName: a.user?.full_name || null,
            userImage: a.user?.profile_image || null,
            type: a.action_type || 'story',
            title: a.title || '',
            description: a.description || '',
            content: a.description || '',
            imageUrl: getImageUrl(a.photo_path),
            photo_path: a.photo_path,
            submittedAt: a.created_at,
            status: a.is_flagged === 1 ? 'flagged' : a.status,
            tags: [],
            heroWall: a.is_hero_wall_pinned || false,
            categoryId: a.ripple_category_id?.toString(),
            category,
            comments: a.comments || [],
            likes_count: a.likes_count || 0,
            comments_count: a.comments_count || 0,
            shares_count: a.shares_count || 0,
            user: a.user,
          };
        });

        setSubmissions(items);

        const paginationData = response.data;
        updatePagination({
          currentPage: paginationData.current_page || 1,
          lastPage: paginationData.last_page || 1,
          total: paginationData.total || 0,
          perPage: paginationData.per_page || 20,
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

    const response = await apiFetch<any>(`/teacher/my-stories/counts?fetch_type=user`);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch counts");
    }

    const counts = response.data?.counts || {};

    return {
      pending: counts.pending ?? 0,
      approved: counts.approved ?? 0,
      rejected: counts.rejected ?? 0,
      flagged: counts.flagged ?? 0,
    };
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

  useEffect(() => {
    loadCategories();
    loadSubmissions();
    loadCounts();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, true);
  }, [debouncedSearchQuery]);

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    loadSubmissions(1, debouncedSearchQuery, status, filterCategory, filterHeroWall, dateFrom, dateTo, true);
  };

  const handleCategoryFilter = (category: string) => {
    setFilterCategory(category);
    loadSubmissions(1, debouncedSearchQuery, filterStatus, category, filterHeroWall, dateFrom, dateTo, true);
  };

  const handleHeroWallFilter = (heroWall: string) => {
    setFilterHeroWall(heroWall);
    loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, heroWall, dateFrom, dateTo, true);
  };

  const handleDateFromChange = (from: string) => {
    setDateFrom(from);
    loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, from, dateTo, true);
  };

  const handleDateToChange = (to: string) => {
    setDateTo(to);
    loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, to, true);
  };

  // === Actions ===
  const updateSubmissionStatus = async (
    id: number,
    action: 'approve' | 'reject' | 'flag' | 'restore',
    reason?: string,
    heroWall?: boolean,
    isFlagged?: boolean
  ) => {
    try {
      const payload: any = { action };
      if (reason) payload.reason = reason;
      if (heroWall !== undefined) payload.hero_wall = heroWall;
      if (isFlagged !== undefined) payload.is_flagged = isFlagged;

      await apiFetch(`/teacher/my-stories/${id}/update-status`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadSubmissions(pagination.currentPage, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
      toast({ title: 'Success', description: `Submission ${action}d successfully.` });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const confirmAndUpdateStatus = async (
    id: number,
    action: 'approve' | 'reject' | 'flag' | 'restore',
    reason?: string,
    heroWall?: boolean,
    isFlagged?: boolean
  ) => {
    const submission = submissions.find(s => s.id === id);
    if (action === 'approve' && submission?.status === 'flagged') {
      await showWarningDialog(
        'Cannot Approve',
        'This submission is flagged. Unflag it first.'
      );
      return;
    }

    const result = await showConfirmationDialog({
      title: `Are you sure?`,
      text: `Do you want to ${action} this submission?`,
      icon: action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning',
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === 'approve' ? '#10b981' : action === 'reject' ? '#ef4444' : '#f59e0b',
    });

    if (result.isConfirmed) {
      await updateSubmissionStatus(id, action, reason, heroWall, isFlagged);
    }
  };

  const toggleHeroWall = async (id: number, current: boolean) => {
    await updateSubmissionStatus(id, 'approve', undefined, !current);
  };

  const confirmAndToggleHeroWall = async (id: number, isCurrentlyOnHeroWall: boolean) => {
    const result = await showConfirmationDialog({
      title: 'Are you sure?',
      text: `Do you want to ${isCurrentlyOnHeroWall ? 'remove from' : 'add to'} the Hero Wall?`,
      icon: 'question',
      confirmButtonText: 'Yes',
    });
    if (result.isConfirmed) {
      await toggleHeroWall(id, isCurrentlyOnHeroWall);
    }
  };

  const overrideFlagStatus = async (id: number, isCurrentlyFlagged: boolean) => {
    await updateSubmissionStatus(id, 'flag', undefined, undefined, !isCurrentlyFlagged);
  };

  const confirmAndOverrideFlag = async (id: number, isCurrentlyFlagged: boolean) => {
    const result = await showConfirmationDialog({
      title: 'Are you sure?',
      text: `Do you want to ${isCurrentlyFlagged ? 'unflag' : 'flag'} this submission?`,
      icon: 'warning',
      confirmButtonText: 'Yes',
      confirmButtonColor: '#f59e0b',
    });
    if (result.isConfirmed) {
      await overrideFlagStatus(id, isCurrentlyFlagged);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Error', description: 'Please select a valid image file', variant: 'destructive' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'Image size must be less than 5MB', variant: 'destructive' });
        return;
      }
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveExistingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    setRemoveExistingImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditDialog = (submission: Submission) => {
    setEditingSubmission(submission);
    setEditForm({
      title: submission.title || '',
      description: submission.description || '',
      action_type: submission.category?.name || submission.type,
      status: submission.status,
    });
    setEditImageFile(null);
    setEditImagePreview(submission.imageUrl || null);
    setRemoveExistingImage(false);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingSubmission) return;
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }

    setEditLoading(true);
    try {
      // Use FormData if there's an image to upload
      if (editImageFile || removeExistingImage) {
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('description', editForm.description);
        
        // Find the category by name to get its ID
        const selectedCategory = categories.find(cat => cat.name === editForm.action_type);
        if (selectedCategory) {
          formData.append('category_id', selectedCategory.id);
          formData.append('action_type', selectedCategory.name);
        } else {
          formData.append('action_type', editForm.action_type);
          if (editingSubmission.categoryId) {
            formData.append('category_id', editingSubmission.categoryId);
          }
        }
        
        formData.append('status', editForm.status);

        if (editImageFile) {
          formData.append('photo', editImageFile);
        } else if (removeExistingImage) {
          formData.append('remove_photo', '1');
        }

        await apiFetchFormData(`/teacher/my-stories/${editingSubmission.id}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use JSON if no image changes
        const jsonPayload: any = {
          title: editForm.title,
          description: editForm.description,
          action_type: editForm.action_type,
          status: editForm.status,
        };
        
        // Find the category by name to get its ID
        const selectedCategory = categories.find(cat => cat.name === editForm.action_type);
        if (selectedCategory) {
          jsonPayload.category_id = selectedCategory.id;
          jsonPayload.action_type = selectedCategory.name;
        } else {
          if (editingSubmission.categoryId) {
            jsonPayload.category_id = editingSubmission.categoryId;
          }
        }

        await apiFetch(`/teacher/my-stories/${editingSubmission.id}`, {
          method: 'POST',
          body: JSON.stringify(jsonPayload),
        });
      }

      toast({ title: 'Success', description: 'Submission updated.' });
      setIsEditDialogOpen(false);
      setEditingSubmission(null);
      await loadSubmissions(pagination.currentPage, searchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to update submission', variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleRejectWithReason = async (id: number) => {
    const result = await showConfirmationDialog({
      title: 'Reject submission?',
      text: "You'll need to provide a reason.",
      icon: 'warning',
      confirmButtonText: 'Yes, reject',
      confirmButtonColor: '#ef4444',
    });
    if (result.isConfirmed) {
      setSubmissionToReject(id);
      setRejectReason('');
      setRejectDialogOpen(true);
    }
  };

  const submitRejection = async () => {
    if (!submissionToReject || !rejectReason.trim()) {
      toast({ title: 'Error', description: 'Please provide a rejection reason', variant: 'destructive' });
      return;
    }
    await updateSubmissionStatus(submissionToReject, 'reject', rejectReason.trim());
    setRejectDialogOpen(false);
    setSubmissionToReject(null);
    setRejectReason('');
    setSelectedSubmission(null);
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
    exportData({
      exportEndpoint: "/teacher/my-stories?export=true",
      listEndpoint: "/teacher/my-stories",
      dataKey: "data",
      fileNamePrefix: "teacher-my-stories",
      filters: {
        search: searchQuery.trim() || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        category_id: filterCategory !== "all" ? filterCategory : undefined,
        is_hero_wall_pinned: filterHeroWall === "true" ? "1" : filterHeroWall === "false" ? "0" : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: perPage === "all" ? undefined : perPage,
        page: perPage === "all" ? "all" : 1,
        fetch_type: "user"
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { key: "action_type", label: "Action Type" },
        { key: "status", label: "Status" },
        {
          key: "user",
          label: "User",
          formatter: (user) => user?.full_name || user?.nickname || user?.email || "Unknown",
        },
        {
          key: "category",
          label: "Category",
          formatter: (cat) => cat?.name || "N/A",
        },
        {
          key: "is_hero_wall_pinned",
          label: "Hero Wall",
          formatter: (val) => (val ? "Yes" : "No"),
        },
        { key: "likes_count", label: "Likes" },
        { key: "comments_count", label: "Comments" },
        { key: "shares_count", label: "Shares" },
        {
          key: "created_at",
          label: "Submitted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  // === Render ===
  if (loading && !searchLoading) {
    return <LoadingState message="Loading stories..." />;
  }

  const UserAvatar = ({ submission }: { submission: Submission }) => {
    const user = submission.user;
    const displayName = user?.full_name || submission.userName;
    const profileImage = user?.profile_image || submission.userImage;
    
    return (
      <div className="flex items-center gap-2">
        {profileImage ? (
          <img
            src={profileImage}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium ${profileImage ? 'hidden' : ''}`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm">{displayName}</span>
      </div>
    );
  };

  const EngagementMetrics = ({ submission }: { submission: Submission }) => {
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

  const CategoryDisplay = ({ submission }: { submission: Submission }) => {
    const cat = submission.category || {
      name: submission.type,
      icon: '',
    };
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center">
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
      <Seo title="My Stories - Teacher Panel" description="View and manage your own ripple stories" />
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_my_stories_tutorial_completed"
        />
      )}
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              My Ripple Journey
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View and manage your own ripple stories
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
      <StatsGrid stats={stats} loading={loading} grid_count={4} />

      {/* ✅ Submissions List */}
      <DataCard
        title="Stories List"
        icon={Filter}
        loading={searchLoading}
        loadingMessage="Searching..."
        dataAttribute="data-submissions-list"
        actions={<ViewToggle viewType={viewType} onViewChange={setViewType} disabled={searchLoading} />}
      >
        <div data-tutorial-target="stories-list">
        {searchLoading && <LoadingOverlay message="Loading stories..." />}

        {/* Search and Filters Section - 2 Row Layout */}
        <div className="space-y-4 mb-6">
          {/* First Row: Per-Page, Search Bar and Date Fields */}
          <div className="flex flex-col lg:flex-row gap-3 items-end">
            {/* Per-Page Selector */}
            <div className="flex items-center gap-2 lg:w-auto">
              <Label htmlFor="per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</Label>
              <Select value={perPage.toString()} onValueChange={(value) => {
                const newPerPage = value === "all" ? "all" : parseInt(value);
                setPerPage(newPerPage);
                loadSubmissions(1, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
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
            <div className="flex-1 lg:max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search stories..."
                loading={searchLoading}
              />
            </div>
            
            {/* Date Fields */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="date-from" className="text-sm text-gray-700 font-medium">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full sm:w-40 h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="date-to" className="text-sm text-gray-700 font-medium">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="w-full sm:w-40 h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Status, Category, Hero Wall Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={filterStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {viewType === "list" ? (
          submissions.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Category</th>
                      <th className="px-4 py-3 text-left font-semibold">Engagement</th>
                      <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="space-y-2">
                            <Link to={`/story/${sub.id}`} className='text-blue-800 block truncate' target='_blank'> {sub.title} </Link>
                            <UserAvatar submission={sub} />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5"
                              onClick={() => {
                                setStoryToShare({ id: sub.id, slug: (sub as any).slug, title: sub.title });
                                setShareDialogOpen(true);
                              }}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              Share
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <CategoryDisplay submission={sub} />
                        </td>
                        <td className="px-4 py-3">
                          <EngagementMetrics submission={sub} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-upper">
                          <Badge
                            variant={
                              sub.status === 'approved'
                                ? 'default'
                                : sub.status === 'rejected'
                                ? 'destructive'
                                : sub.status === 'flagged'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setSelectedSubmission(sub)}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(sub)}>
                                <Edit2 className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {sub.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => confirmAndUpdateStatus(sub.id, 'approve')}>
                                    <Check className="h-4 w-4 text-green-600 mr-2" /> Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejectWithReason(sub.id)}>
                                    <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sub.status === 'approved' && (
                                <DropdownMenuItem onClick={() => handleRejectWithReason(sub.id)}>
                                  <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                                </DropdownMenuItem>
                              )}
                              {sub.status === 'rejected' && (
                                <DropdownMenuItem onClick={() => confirmAndUpdateStatus(sub.id, 'approve')}>
                                  <Check className="h-4 w-4 text-green-600 mr-2" /> Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => confirmAndOverrideFlag(sub.id, sub.status === 'flagged')}
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                {sub.status === 'flagged' ? 'Unflag' : 'Flag'}
                              </DropdownMenuItem>
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
                icon={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? SearchIcon : Eye}
                title={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? 'No stories found' : 'No stories yet'}
                description={
                  searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Stories will appear here once users post.'
                }
                action={
                  searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.length > 0 ? (
              submissions.map((sub, index) => (
                <Card
                  key={sub.id}
                  data-tutorial-target={index === 0 ? "story-card" : undefined}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  {/* Image Section */}
                  {sub.imageUrl && (
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={sub.imageUrl}
                        alt={sub.title}
                        className={`w-full h-full object-cover ${
                            !sub.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
                        }`}
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-2 mb-2">{sub.title}</h3>
                        <CategoryDisplay submission={sub} />
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
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(sub); }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {sub.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); confirmAndUpdateStatus(sub.id, 'approve'); }}>
                                <Check className="h-4 w-4 text-green-600 mr-2" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRejectWithReason(sub.id); }}>
                                <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {sub.status === 'approved' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRejectWithReason(sub.id); }}>
                              <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                            </DropdownMenuItem>
                          )}
                          {sub.status === 'rejected' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); confirmAndUpdateStatus(sub.id, 'approve'); }}>
                              <Check className="h-4 w-4 text-green-600 mr-2" /> Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); confirmAndOverrideFlag(sub.id, sub.status === 'flagged'); }}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            {sub.status === 'flagged' ? 'Unflag' : 'Flag'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sub.description}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStoryToShare({ id: sub.id, slug: (sub as any).slug, title: sub.title });
                          setShareDialogOpen(true);
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <UserAvatar submission={sub} />
                      <Badge
                        variant={
                          sub.status === 'approved'
                            ? 'default'
                            : sub.status === 'rejected'
                            ? 'destructive'
                            : sub.status === 'flagged'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="capitalize"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <EngagementMetrics submission={sub} />
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? SearchIcon : Eye}
                  title={searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? 'No stories found' : 'No stories yet'}
                  description={
                    searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Stories will appear here once users post.'
                  }
                  action={
                    searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                      ? {
                          label: 'Clear filters',
                          onClick: () => {
                            setSearchQuery('');
                            setFilterStatus('all');
                            setFilterCategory('all');
                            setFilterHeroWall('all');
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

        {submissions.length > 0 && (
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
                Ripple Submission Stories Review
              </DialogTitle>
              <DialogDescription>
                Review and manage this ripple submission stories
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    selectedSubmission.status === 'approved' ? 'default' :
                    selectedSubmission.status === 'rejected' ? 'destructive' :
                    selectedSubmission.status === 'flagged' ? 'secondary' : 'outline'
                  }>
                    {selectedSubmission.status.toUpperCase()}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedSubmission.title}</h2>
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedSubmission.user?.profile_image ? (
                      <img 
                        src={selectedSubmission.user.profile_image} 
                        alt="User" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {selectedSubmission.user?.nickname?.charAt(0).toUpperCase() || selectedSubmission.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedSubmission.user?.full_name || selectedSubmission.user?.nickname || selectedSubmission.userName}
                    </p>
                    {selectedSubmission.user?.full_name && (
                      <p className="text-sm text-gray-500">@{selectedSubmission.user.nickname}</p>
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
                        content={selectedSubmission.description} 
                        className="text-gray-900 leading-relaxed"
                      />
                  </div>

                  {/* Category Details */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-green-700 mb-3 block">Category Details</Label>
                    <CategoryDisplay submission={selectedSubmission} />
                  </div>

                  {/* Image */}
                  {selectedSubmission.imageUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Attached Image</Label>
                      <div className="relative">
                        <img 
                          src={selectedSubmission.imageUrl} 
                          alt="Submission" 
                          className={`w-full max-h-96 object-contain rounded-lg border border-gray-200 ${
                            !selectedSubmission.photo_path ? 'filter grayscale brightness-90 opacity-80' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Comments ({selectedSubmission.comments?.length || 0})
                    </Label>
                    <div className="space-y-4">
                      {selectedSubmission.comments && selectedSubmission.comments.length > 0 ? (
                        selectedSubmission.comments.map((comment) => (
                          <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {comment.user.profile_image ? (
                                  <img 
                                    src={comment.user.profile_image} 
                                    alt="User" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-gray-600">
                                    {comment.user.nickname.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {comment.user.full_name || comment.user.nickname}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                                
                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-3 space-y-3">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="flex items-start gap-3 ml-4">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {reply.user.profile_image ? (
                                            <img 
                                              src={reply.user.profile_image} 
                                              alt="User" 
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <span className="text-xs font-medium text-gray-600">
                                              {reply.user.nickname.charAt(0).toUpperCase()}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xs font-medium text-gray-900">
                                              {reply.user.full_name || reply.user.nickname}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                              {new Date(reply.created_at).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No comments yet</p>
                        </div>
                      )}
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Shares</span>
                        </div>
                        <span className="font-semibold">{selectedSubmission.shares_count || 0}</span>
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
                          {new Date(selectedSubmission.submittedAt).toLocaleDateString('en-US', {
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
                          selectedSubmission.status === 'approved' ? 'default' :
                          selectedSubmission.status === 'rejected' ? 'destructive' :
                          selectedSubmission.status === 'flagged' ? 'secondary' : 'outline'
                        }>
                          {selectedSubmission.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-orange-700 mb-3 block">Quick Actions</Label>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => openEditDialog(selectedSubmission)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Story
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                    Close
                  </Button>
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <Button 
                        variant="default" 
                        onClick={() => { 
                          confirmAndUpdateStatus(selectedSubmission.id, 'approve'); 
                          setSelectedSubmission(null); 
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleRejectWithReason(selectedSubmission.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedSubmission.status === 'approved' && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleRejectWithReason(selectedSubmission.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  {selectedSubmission.status === 'rejected' && (
                    <Button 
                      variant="default" 
                      onClick={() => { 
                        confirmAndUpdateStatus(selectedSubmission.id, 'approve'); 
                        setSelectedSubmission(null); 
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    onClick={() => { 
                      confirmAndOverrideFlag(selectedSubmission.id, selectedSubmission.status === 'flagged'); 
                      setSelectedSubmission(null); 
                    }}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {selectedSubmission.status === 'flagged' ? 'Unflag' : 'Flag'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
          </DialogHeader>
          {editingSubmission && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <RichTextEditor
                  value={editForm.description}
                  onChange={(value) => setEditForm({ ...editForm, description: value })}
                  placeholder="Write the story details..."
                  minHeight="200px"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Story Image</Label>
                {editImagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload an image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div>
                <Label>Ripple Type</Label>
                <Select value={editForm.action_type} onValueChange={(v) => setEditForm({ ...editForm, action_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as 'pending' | 'approved' | 'rejected' | 'flagged' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejection}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      {storyToShare && (
        <ShareStoryDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          story={storyToShare}
        />
      )}
    </div>
    </>
  );
}