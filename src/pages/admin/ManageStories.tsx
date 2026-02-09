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
  RefreshCw,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
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
import { getAvatarImage } from '@/utils/avatars';
import { Link } from 'react-router-dom';
import { FormattedContent, RichTextEditor } from '@/components/ui/RichTextEditor';
import { getPlainText } from '@/utils/textUtils';

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
    profile_image_url?: string | null;
    profile_image_path?: string | null;
    avatar_id?: number | null;
    custom_avatar?: string | null;
  };
}

// Define types for Ripple Actions (Stories)
interface RippleActionItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  action_type: string;
  photo_path: string | null;
  performed_at: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  ripple_category_id: number | null;
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
    email?: string;
    full_name?: string;
    profile_image_path?: string | null;
    avatar_id?: number | null;
  };
  category?: {
    id: number;
    name: string;
    icon?: string | null;
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
  const [submissions, setSubmissions] = useState<RippleActionItem[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<RippleActionItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

  // Edit modal
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<RippleActionItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    action_type: '',
    status: 'pending' as 'pending' | 'published',
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

  // Nomination dialog (Hero Wall Request)
  const [isNominationDialogOpen, setIsNominationDialogOpen] = useState(false);
  const [nominationSubmission, setNominationSubmission] = useState<RippleActionItem | null>(null);
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
      icon: Eye,
      color: 'orange' as const,
    },
    {
      title: 'Published',
      value: counts.approved,
      description: 'Live stories',
      icon: Check,
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
      if (status !== "all") {
        params.append("status", status);
      }
      if (category !== "all") params.append("category_id", category);
      if (heroWall === "true") params.append("is_hero_wall_pinned", "1");
      else if (heroWall === "false") params.append("is_hero_wall_pinned", "0");
      if (from) params.append("date_from", from);
      if (to) params.append("date_to", to);

      const apiUrl = `/admin/ripple-actions?${params.toString()}`;
      const response = await apiFetch<any>(apiUrl);

      if (response.success && response.data?.data) {
        const submissionsData = response.data.data || [];

        // Map API data to RippleActionItem interface
        const items: RippleActionItem[] = submissionsData.map((a: any) => {
          return {
            id: a.id,
            user_id: a.user_id,
            title: a.title,
            description: a.description,
            action_type: a.action_type,
            photo_path: a.photo_path,
            performed_at: a.performed_at,
            created_at: a.created_at,
            status: a.status,
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

    // Get counts from ripple-actions/counts endpoint
    const response = await apiFetch<any>('/admin/ripple-actions/counts');

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

      await apiFetch(`/admin/ripple-actions/${id}/status`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadSubmissions(pagination.currentPage, debouncedSearchQuery, filterStatus, filterCategory, filterHeroWall, dateFrom, dateTo, false);
      await loadCounts();
      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
      toast({ title: 'Success', description: `Story ${actionText} successfully.` });
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
    // Note: For Hero Wall submissions, we don't have a 'flagged' status, so we skip this check
    // if (action === 'approve' && submission?.status === 'flagged') {
    //   await showWarningDialog(
    //     'Cannot Publish',
    //     'This submission is flagged. Unflag it first.'
    //   );
    //   return;
    // }

    // Map internal actions to user-friendly terms
    const actionText = action === 'approve' ? 'publish' : action === 'reject' ? 'unpublish' : action;
    const actionTitle = action === 'approve' ? 'Publish' : action === 'reject' ? 'Unpublish' : action;

    const result = await showConfirmationDialog({
      title: `Are you sure?`,
      text: `Do you want to ${actionText} this submission?`,
      icon: action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning',
      confirmButtonText: `Yes, ${actionText}`,
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

  const openEditDialog = (submission: RippleActionItem) => {
    setEditingSubmission(submission);
    setEditForm({
      title: submission.title || '',
      description: submission.description || '',
      action_type: submission.category?.name || submission.action_type || '',
      status: submission.status === 'approved' ? 'published' : 'pending',
    });
    setEditImageFile(null);
    setEditImagePreview(submission.photo_path ? getImageUrl(submission.photo_path) : null);
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
          // Note: HeroWallSubmission doesn't have categoryId property
          // We'll rely on action_type for now
        }

        formData.append('status', editForm.status);

        if (editImageFile) {
          formData.append('photo', editImageFile);
        } else if (removeExistingImage) {
          formData.append('remove_photo', '1');
        }

        await apiFetchFormData(`/admin/ripple-actions/${editingSubmission.id}`, {
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
          // Note: HeroWallSubmission doesn't have categoryId property
          // We'll rely on action_type for now
        }

        await apiFetch(`/admin/ripple-actions/${editingSubmission.id}`, {
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
      title: 'Unpublish submission?',
      text: "You'll need to provide a reason.",
      icon: 'warning',
      confirmButtonText: 'Yes, unpublish',
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
      toast({ title: 'Error', description: 'Please provide unpublish reason', variant: 'destructive' });
      return;
    }
    await updateSubmissionStatus(submissionToReject, 'reject', rejectReason.trim());
    setRejectDialogOpen(false);
    setSubmissionToReject(null);
    setRejectReason('');
    setSelectedSubmission(null);
  };

  // === Hero Wall Nomination Functions ===
  const submitNomination = async () => {
    if (!nominationSubmission) return;

    setNominationLoading(true);
    try {
      // Use the admin hero wall request endpoint
      const response: any = await apiFetch(`/admin/ripple-actions/${nominationSubmission.id}/hero-wall-request`, {
        method: 'POST',
        body: JSON.stringify({
          teacher_quote: nominationForm.teacher_quote || null,
          teacher_comment: nominationForm.teacher_comment || null,
        }),
      });

      if (response.success) {
        toast({ title: 'Success', description: 'Hero Wall request submitted successfully!' });
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
        // Use the admin hero wall requests endpoint
        const response: any = await apiFetch(`/admin/hero-wall/requests/${requestId}`, {
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

  const openNominationDialog = (submission: RippleActionItem) => {
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
      is_hero_wall_pinned: filterHeroWall === "true" ? "1" : filterHeroWall === "false" ? "0" : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      per_page: perPage === "all" ? undefined : perPage,
      page: perPage === "all" ? "all" : 1,
    };

    exportData({
      exportEndpoint: "/admin/ripple-actions?export=true",
      listEndpoint: "/admin/ripple-actions",
      dataKey: "data",
      fileNamePrefix: "admin-stories",
      filters: exportFilters,
      columns: [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" },
        {
          key: "user",
          label: "User",
          formatter: (user: any) => user?.full_name || user?.nickname || "Unknown",
        },
        {
          key: "category",
          label: "Category",
          formatter: (cat: any) => cat?.name || "N/A",
        },
        { key: "likes_count", label: "Likes" },
        { key: "comments_count", label: "Comments" },
        { key: "is_hero_wall_pinned", label: "Hero Wall", formatter: (v: any) => v ? "Yes" : "No" },
        {
          key: "created_at",
          label: "Submitted At",
          formatter: (v: any) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  // === Helper Functions ===
  const getAvatarSource = (user: Submission['user']) => {
    if (!user) return null;

    // Priority: custom_avatar > profile_image_url > profile_image_path > avatar_id (using utils)
    if (user.custom_avatar) {
      return user.custom_avatar;
    }
    if (user.profile_image_url) {
      return user.profile_image_url;
    }
    if (user.profile_image_path) {
      return user.profile_image_path;
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

  const UserAvatar = ({ submission }: { submission: RippleActionItem }) => {
    const displayName = submission.user?.full_name || submission.user?.nickname || 'Unknown User';
    const avatarSource = submission.user?.profile_image_path ? getImageUrl(submission.user.profile_image_path) :
      submission.user?.avatar_id ? getAvatarImage(submission.user.avatar_id, null) : null;

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

  const EngagementMetrics = ({ submission }: { submission: RippleActionItem }) => {
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

  const CategoryDisplay = ({ submission }: { submission: RippleActionItem }) => {
    const categoryName = submission.category?.name || submission.action_type || 'Uncategorized';
    const categoryColor = '#6366F1'; // Default indigo
    const IconComponent = submission.category?.icon ? getIconByName(submission.category.icon) : null;

    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${categoryColor}20` }}>
          {IconComponent ? (
            <IconComponent className="w-3 h-3" style={{ color: categoryColor }} />
          ) : (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor }} />
          )}
        </div>
        <Badge variant="outline">
          {categoryName}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Manage All Stories
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and manage all ripple stories submitted by students
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
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
        title="All Stories List"
        icon={Filter}
        loading={searchLoading}
        loadingMessage="Searching..."
        dataAttribute="data-submissions-list"
        actions={<ViewToggle viewType={viewType} onViewChange={setViewType} disabled={searchLoading} />}
      >
        {searchLoading && <LoadingOverlay message="Loading stories..." />}
        {tableLoading && <LoadingOverlay message="Updating table..." />}

        {/* Search and Filters Section - 2 Row Layout */}
        <div className="space-y-4 mb-6">
          {/* First Row: Per-Page (Top Left), Search Bar, and Date Fields */}
          <div className="flex flex-col lg:flex-row gap-3 items-end">
            {/* Per-Page Selector - Top Left */}
            <div className="flex items-center gap-2 lg:w-auto">
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
                  name="date_from"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full sm:w-40 h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="date-to" className="text-sm text-gray-700 font-medium">To</Label>
                <Input
                  id="date-to"
                  name="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="w-full sm:w-40 h-10 border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Status, Category, Hero Wall Filters and Clear Button */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={filterStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Published</SelectItem>
                  <SelectItem value="rejected">Unpublished</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10">
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
                <SelectTrigger className="w-full sm:w-48 h-10">
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

        {viewType === "list" ? (
          submissions.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Ripple Type / Hero-Wall</th>
                      <th className="px-4 py-3 text-left font-semibold">Engagement</th>
                      <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 max-w-xs truncate">
                          <Link to={`/story/${sub.id}`} className='text-blue-800' target='_blank'> {sub.title} </Link>
                          <UserAvatar submission={sub} />
                        </td>
                        <td className="px-4 py-3">
                          <CategoryDisplay submission={sub} />
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
                            {sub.hero_wall_status === 'approved' && (
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
                        <td className="px-4 py-3">
                          <EngagementMetrics submission={sub} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(sub.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-upper">
                          <Badge
                            variant={
                              sub.status === 'approved'
                                ? 'default'
                                : sub.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {sub.status === 'approved' ? 'Approved' :
                              sub.status === 'pending' ? 'Pending' :
                                sub.status === 'rejected' ? 'Rejected' :
                                  sub.status}
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
                                  <DropdownMenuItem onClick={() => confirmAndUpdateStatus(sub.id, 'reject')}>
                                    <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sub.status === 'approved' && (
                                <DropdownMenuItem onClick={() => confirmAndUpdateStatus(sub.id, 'reject')}>
                                  <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                                </DropdownMenuItem>
                              )}
                              {sub.status === 'rejected' && (
                                <DropdownMenuItem onClick={() => confirmAndUpdateStatus(sub.id, 'restore')}>
                                  <RefreshCw className="h-4 w-4 text-blue-600 mr-2" /> Restore
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {/* <DropdownMenuItem
                                onClick={() => confirmAndToggleHeroWall(sub.id, sub.is_hero_wall_pinned)}>
                                <Trophy className="h-4 w-4 mr-2" />
                                {sub.is_hero_wall_pinned ? 'Remove from Hero Wall' : 'Add to Hero Wall'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmAndOverrideFlag(sub.id, sub.is_flagged)}>
                                <Flag className="h-4 w-4 mr-2" />
                                {sub.is_flagged ? 'Unflag' : 'Flag'}
                              </DropdownMenuItem> */}

                              {/* Hero Wall Nomination Actions */}
                              <DropdownMenuSeparator />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <Card
                  key={sub.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  {/* Image Section */}
                  {sub.photo_path && (
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={getImageUrl(sub.photo_path)}
                        alt={sub.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {sub.is_hero_wall_pinned && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            <Trophy className="h-3 w-3 mr-1" />
                            Hero Wall
                          </Badge>
                        )}
                        {sub.is_flagged && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
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
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); confirmAndUpdateStatus(sub.id, 'reject'); }}>
                                <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {sub.status === 'approved' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); confirmAndUpdateStatus(sub.id, 'reject'); }}>
                              <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                            </DropdownMenuItem>
                          )}
                          {sub.status === 'rejected' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); confirmAndUpdateStatus(sub.id, 'restore'); }}>
                              <RefreshCw className="h-4 w-4 text-blue-600 mr-2" /> Restore
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); confirmAndToggleHeroWall(sub.id, sub.is_hero_wall_pinned); }}>
                            <Trophy className="h-4 w-4 mr-2" />
                            {sub.is_hero_wall_pinned ? 'Remove from Hero Wall' : 'Add to Hero Wall'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); confirmAndOverrideFlag(sub.id, sub.is_flagged); }}>
                            <Flag className="h-4 w-4 mr-2" />
                            {sub.is_flagged ? 'Unflag' : 'Flag'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getPlainText(sub.description)}
                    </p>

                    <div className="flex items-center justify-between">
                      <UserAvatar submission={sub} />
                      <Badge
                        variant={
                          sub.status === 'approved'
                            ? 'default'
                            : sub.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="capitalize"
                      >
                        {sub.status === 'approved' ? 'Approved' :
                          sub.status === 'pending' ? 'Pending' :
                            sub.status === 'rejected' ? 'Rejected' :
                              sub.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <EngagementMetrics submission={sub} />
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(sub.created_at).toLocaleDateString()}
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
      </DataCard>

      {/* === Modals === */}
      {/* View Submission Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Story Review
              </DialogTitle>
              <DialogDescription>
                Review and manage this story submission
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={
                    selectedSubmission.status === 'approved' ? 'default' :
                      selectedSubmission.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {selectedSubmission.status === 'approved' ? 'APPROVED' :
                      selectedSubmission.status === 'pending' ? 'PENDING' :
                        selectedSubmission.status === 'rejected' ? 'REJECTED' :
                          selectedSubmission.status.toUpperCase()}
                  </Badge>
                  {selectedSubmission.is_hero_wall_pinned && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <Trophy className="h-3 w-3 mr-1" />
                      HERO WALL
                    </Badge>
                  )}
                  {selectedSubmission.is_flagged && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      <Flag className="h-3 w-3 mr-1" />
                      FLAGGED
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedSubmission.title}</h2>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {(() => {
                      const avatarSource = selectedSubmission.user?.profile_image_path ? getImageUrl(selectedSubmission.user.profile_image_path) :
                        selectedSubmission.user?.avatar_id ? getAvatarImage(selectedSubmission.user.avatar_id, null) : null;
                      const displayName = selectedSubmission.user?.full_name || selectedSubmission.user?.nickname || 'U';
                      return avatarSource ? (
                        <img
                          src={avatarSource}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedSubmission.user?.full_name || selectedSubmission.user?.nickname || 'Unknown User'}
                    </p>
                    {selectedSubmission.user?.full_name && selectedSubmission.user?.nickname && (
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
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#6366F120' }}>
                        {(() => {
                          const IconComp = selectedSubmission.category?.icon ? getIconByName(selectedSubmission.category.icon) : null;
                          return IconComp ? (
                            <IconComp className="w-3 h-3" style={{ color: '#6366F1' }} />
                          ) : (
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366F1' }} />
                          );
                        })()}
                      </div>
                      <Badge variant="outline">
                        {selectedSubmission.category?.name || selectedSubmission.action_type || 'Uncategorized'}
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
                          className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Comments
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
                          {new Date(selectedSubmission.created_at).toLocaleDateString('en-US', {
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
                            selectedSubmission.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {selectedSubmission.status === 'approved' ? 'Approved' :
                            selectedSubmission.status === 'pending' ? 'Pending' :
                              selectedSubmission.status === 'rejected' ? 'Rejected' :
                                selectedSubmission.status}
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
                        onClick={() => confirmAndToggleHeroWall(selectedSubmission.id, selectedSubmission.is_hero_wall_pinned)}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        {selectedSubmission.is_hero_wall_pinned ? 'Remove from Hero Wall' : 'Add to Hero Wall'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => confirmAndOverrideFlag(selectedSubmission.id, selectedSubmission.is_flagged)}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        {selectedSubmission.is_flagged ? 'Unflag' : 'Flag'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(selectedSubmission.created_at).toLocaleDateString()}
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
                        onClick={() => {
                          confirmAndUpdateStatus(selectedSubmission.id, 'reject');
                          setSelectedSubmission(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedSubmission.status === 'approved' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        confirmAndUpdateStatus(selectedSubmission.id, 'reject');
                        setSelectedSubmission(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  {selectedSubmission.status === 'rejected' && (
                    <Button
                      variant="default"
                      onClick={() => {
                        confirmAndUpdateStatus(selectedSubmission.id, 'restore');
                        setSelectedSubmission(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  )}
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
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as 'pending' | 'published' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Approved</SelectItem>
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
            <DialogTitle>Unpublish Submission</DialogTitle>
            <DialogDescription>Provide a reason for unpublishing. An email will be sent to the author explaining why it was unpublished.</DialogDescription>
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
              Unpublish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hero Wall Nomination Dialog */}
      <Dialog open={isNominationDialogOpen} onOpenChange={setIsNominationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Nominate for Hero Wall
            </DialogTitle>
            <DialogDescription>
              Submit this story for Hero Wall consideration. Add your quote or comment to highlight why this story deserves recognition.
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
                  Provide context for review (max 2000 characters)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">What happens next?</p>
                    <p className="mt-1">Your nomination will be reviewed and either approved or rejected. The submitter will be notified of the decision.</p>
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
  );
}