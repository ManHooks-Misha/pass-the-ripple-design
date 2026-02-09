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
  Filter,
  Users,
  Award,
  Clock,
  CheckCircle,
  Ban,
  Pin,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import { getAuthToken } from '@/lib/auth-token';
import { showConfirmationDialog } from '@/components/ui/confirmation-dialog';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Admin Components
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination as AdminPagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { DataCard } from "@/components/admin/DataCard";

// Hooks
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useExportData } from "@/hooks/useExportData";
import { getImageUrl } from '@/utils/imageUrl';

interface HeroWallSubmission {
  id: number;
  ripple_action_id: number;
  user_id: number;
  classroom_id: number;
  featured_title: string | null;
  featured_description: string | null;
  featured_at: string | null;
  submitted_at: string;
  updated_at: string;
  ripple_title: string;
  ripple_description: string;
  performed_at: string;
  photo_path: string | null;
  student_full_name: string;
  student_nickname: string;
  nominated_by: string;
  student_profile_image: string | null;
  student_avatar_id: number | null;
  classroom_name: string;
  classroom_grade: string | null;
  classroom_section: string | null;
  teacher_full_name: string;
  teacher_nickname: string;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
  status: 'published' | 'pending';
  likes_count: number;
  comments_count: number;
}

interface Classroom {
  id: number;
  name: string;
  grade: string | null;
  section: string | null;
}

interface Stats {
  total: number;
  published: number;
  pending: number;
  recent_submissions: number;
}

export default function AdminRequestHeroWall() {
  const [submissions, setSubmissions] = useState<HeroWallSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<HeroWallSubmission | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    pending: 0,
    recent_submissions: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending', // Default to pending
    classroom_id: 'all',
    date_from: '',
    date_to: '',
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'published'>('pending'); // Default to pending

  // Loading states
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Modals
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submissionToReject, setSubmissionToReject] = useState<number | null>(null);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [submissionToUnpublish, setSubmissionToUnpublish] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<HeroWallSubmission | null>(null);
  const [editForm, setEditForm] = useState({
    featured_title: '',
    featured_description: '',
  });

  // Hooks
  const debouncedSearch = useDebounce(filters.search, 500);
  const { pagination, updatePagination, resetPagination } = usePagination(20);
  const { exporting, exportData } = useExportData();

  // Stats for dashboard
  const statsData = [
    {
      title: 'Total Submissions',
      value: stats.total,
      description: 'All time submissions',
      icon: Trophy,
      color: 'blue' as const,
    },
    {
      title: 'Published',
      value: stats.published,
      description: 'Currently on Hero Wall',
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      description: 'Awaiting approval',
      icon: Clock,
      color: 'orange' as const,
    },
    {
      title: 'Recent (7 days)',
      value: stats.recent_submissions,
      description: 'New submissions',
      icon: Award,
      color: 'purple' as const,
    },
  ];

  // === API Methods ===
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: Stats }>('/admin/hero-wall/stat');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load stats',
        variant: 'destructive',
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadClassrooms = async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: Classroom[] }>('/admin/hero-wall/classrooms');
      if (res.success) {
        setClassrooms(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load classrooms:', err);
    }
  };

  const loadSubmissions = async (page: number = 1, isSearch: boolean = false) => {
    if (page === 1 && !isSearch) {
      setLoading(true);
    } else {
      setSearchLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.classroom_id !== 'all') params.append('classroom_id', filters.classroom_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const res = await apiFetch<{
        success: boolean;
        data: {
          data: HeroWallSubmission[];
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
          from: number;
          to: number;
        }
      }>(`/admin/hero-wall/submissions?${params}`);

      if (res.success) {
        setSubmissions(res.data.data);
        updatePagination({
          currentPage: res.data.current_page,
          lastPage: res.data.last_page,
          total: res.data.total,
          perPage: res.data.per_page,
          from: res.data.from,
          to: res.data.to,
        });
      } else {
        throw new Error(res.message || 'Failed to load submissions');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const loadSubmissionDetails = async (id: number) => {
    try {
      const res = await apiFetch<{ success: boolean; data: HeroWallSubmission }>(
        `/admin/hero-wall/submissions/${id}`
      );
      if (res.success) {
        setSelectedSubmission(res.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load submission details',
        variant: 'destructive',
      });
    }
  };

  const approveSubmission = async (id: number, data?: { featured_title?: string; featured_description?: string }) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/admin/hero-wall/submissions/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });

      if (res.success) {
        toast({
          title: 'Success!',
          description: 'Submission approved and published to Hero Wall.',
        });
        await loadSubmissions(pagination.currentPage, false);
        await loadStats();
        setEditDialogOpen(false);
        setEditingSubmission(null);
      } else {
        throw new Error(res.message || 'Approval failed');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectSubmission = async (id: number, reason: string) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/admin/hero-wall/submissions/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (res.success) {
        toast({
          title: 'Submission Rejected',
          description: 'The submission has been rejected. An email has been sent to the author.',
        });
        await loadSubmissions(pagination.currentPage, false);
        await loadStats();
        setRejectDialogOpen(false);
        setSubmissionToReject(null);
        setRejectReason('');
      } else {
        throw new Error(res.message || 'Rejection failed');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const unpublishSubmission = async (id: number, reason: string) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/admin/hero-wall/submissions/${id}/unpublish`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (res.success) {
        toast({
          title: 'Submission Unpublished',
          description: 'The submission has been removed from Hero Wall. An email has been sent to the author.',
        });
        await loadSubmissions(pagination.currentPage, false);
        await loadStats();
        setSelectedSubmission(null);
      } else {
        throw new Error(res.message || 'Unpublish failed');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to unpublish submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSubmission = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/admin/hero-wall/submissions/${id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        toast({
          title: 'Submission Deleted',
          description: 'The submission has been permanently deleted.',
        });
        await loadSubmissions(pagination.currentPage, false);
        await loadStats();
        setSelectedSubmission(null);
      } else {
        throw new Error(res.message || 'Deletion failed');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // === Effects ===
  useEffect(() => {
    loadStats();
    loadClassrooms();
    loadSubmissions(1, false);
  }, []);

  useEffect(() => {
    loadSubmissions(1, true);
  }, [debouncedSearch, filters.status, filters.classroom_id, filters.date_from, filters.date_to]);

  // === Handlers ===
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    resetPagination();
  };

  const handlePageChange = (page: number) => {
    loadSubmissions(page, false);
  };

  const handleRefresh = () => {
    loadSubmissions(pagination.currentPage, false);
    loadStats();
    toast({
      title: 'Refreshed',
      description: 'Data updated successfully.',
    });
  };


  const handleApprove = async (submission: HeroWallSubmission) => {
    const result = await showConfirmationDialog({
      title: 'Approve Submission',
      text: 'This story will be published to the Hero Wall. Are you sure?',
      icon: 'question',
      confirmButtonText: 'Yes, Approve',
      confirmButtonColor: '#10b981',
    });
    if (result.isConfirmed) {
      await approveSubmission(submission.id);
    }
  };

  const handleReject = async (id: number) => {
    const result = await showConfirmationDialog({
      title: 'Reject Submission',
      text: "You'll need to provide a reason for rejection.",
      icon: 'warning',
      confirmButtonText: 'Continue',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      setSubmissionToReject(id);
      setRejectReason('');
      setRejectDialogOpen(true);
    }
  };

  const handleUnpublish = async (id: number) => {
    setSubmissionToUnpublish(id);
    setUnpublishReason('');
    setUnpublishDialogOpen(true);
  };

  const submitUnpublish = async () => {
    if (!submissionToUnpublish || !unpublishReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for unpublishing',
        variant: 'destructive'
      });
      return;
    }
    await unpublishSubmission(submissionToUnpublish, unpublishReason.trim());
    setUnpublishDialogOpen(false);
    setSubmissionToUnpublish(null);
    setUnpublishReason('');
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmationDialog({
      title: 'Delete Submission',
      text: 'This action cannot be undone. The submission will be permanently deleted.',
      icon: 'error',
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      await deleteSubmission(id);
    }
  };

  const handleEdit = (submission: HeroWallSubmission) => {
    setEditingSubmission(submission);
    setEditForm({
      featured_title: submission.featured_title || submission.ripple_title,
      featured_description: submission.featured_description || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingSubmission) return;

    const result = await showConfirmationDialog({
      title: 'Approve with Edits',
      text: 'This will approve the submission with your changes and publish it to the Hero Wall.',
      icon: 'question',
      confirmButtonText: 'Yes, Approve with Changes',
      confirmButtonColor: '#10b981',
    });

    if (result.isConfirmed) {
      await approveSubmission(editingSubmission.id, editForm);
    }
  };

  const handleExport = () => {
    exportData({
      exportEndpoint: '/admin/hero-wall/submissions?export=true',
      listEndpoint: '/admin/hero-wall/submissions',
      dataKey: 'data',
      fileNamePrefix: 'hero-wall-submissions',
      filters: {
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        classroom_id: filters.classroom_id !== 'all' ? filters.classroom_id : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      },
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'featured_title', label: 'Featured Title' },
        { key: 'ripple_title', label: 'Original Title' },
        { key: 'student_full_name', label: 'Student Name' },
        { key: 'student_nickname', label: 'Student Nickname' },
        { key: 'classroom_name', label: 'Classroom' },
        { key: 'teacher_full_name', label: 'Teacher' },
        { key: 'category_name', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'likes_count', label: 'Likes' },
        { key: 'comments_count', label: 'Comments' },
        { key: 'submitted_at', label: 'Submitted At' },
        { key: 'featured_at', label: 'Published At' },
      ],
    });
  };

  // === Render Helpers ===
  const renderStatusBadge = (status: string) => {
    const variants = {
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Published' },
      published: { variant: 'default' as const, icon: CheckCircle, text: 'Published' },
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const renderMediaPreview = (submission: HeroWallSubmission) => {
    if (!submission.photo_path) return null;

    return (
      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
        <img
          src={getImageUrl(submission.photo_path)}
          alt="Story media"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const renderCategoryBadge = (submission: HeroWallSubmission) => {
    if (!submission.category_name) return null;

    return (
      <Badge
        variant="outline"
        style={{
          borderColor: submission.category_color || undefined,
          color: submission.category_color || undefined
        }}
      >
        {submission.category_name}
      </Badge>
    );
  };

  // === Main Render ===
  if (loading) {
    return <LoadingState message="Loading Hero Wall submissions..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Hero Wall Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and manage stories submitted for the Hero Wall
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleExport} size="sm" disabled={exporting} className="flex items-center gap-2">
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={statsData} loading={statsLoading} grid_count={4} />

      {/* Submissions List */}
      <DataCard
        title="Hero Wall Submissions"
        icon={Trophy}
        loading={searchLoading}
        loadingMessage="Searching submissions..."
      >
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1 lg:max-w-md">
              <SearchBar
                value={filters.search}
                onChange={(value) => handleFilterChange('search', value)}
                placeholder="Search submissions..."
                loading={searchLoading}
              />
            </div>

            {/* Tabs for filtering */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('all');
                  handleFilterChange('status', 'all');
                }}
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                All ({stats.total})
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('pending');
                  handleFilterChange('status', 'pending');
                }}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Pending ({stats.pending})
              </Button>
              <Button
                variant={activeTab === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTab('published');
                  handleFilterChange('status', 'published');
                }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Published ({stats.published})
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Status filter is now controlled by tabs, but keeping the select for other statuses if needed */}
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.classroom_id}
                onValueChange={(value) => handleFilterChange('classroom_id', value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Classrooms" />
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

              {/* Date Filters */}
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full sm:w-32"
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full sm:w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {submissions.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold">Story</th>
                      <th className="px-4 py-3 text-left font-semibold">Student & Classroom</th>
                      <th className="px-4 py-3 text-left font-semibold">Engagement</th>
                      <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            {renderMediaPreview(submission)}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2 mb-1">
                                <h4 className="font-semibold text-sm line-clamp-2">
                                  {submission.featured_title || submission.ripple_title}
                                </h4>
                                {renderCategoryBadge(submission)}
                              </div>
                              {submission.featured_description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {submission.featured_description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {submission.student_nickname}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {submission.classroom_name}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              by {submission.nominated_by}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{submission.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{submission.comments_count}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {renderStatusBadge(submission.status)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => loadSubmissionDetails(submission.id)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>

                              {submission.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(submission)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit & Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(submission)}
                                    disabled={actionLoading === submission.id}
                                  >
                                    <Check className="h-4 w-4 text-green-600 mr-2" />
                                    {actionLoading === submission.id ? 'Approving...' : 'Approve'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(submission.id)}>
                                    <X className="h-4 w-4 text-red-600 mr-2" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {submission.status === 'published' && (
                                <DropdownMenuItem onClick={() => handleUnpublish(submission.id)}>
                                  <Ban className="h-4 w-4 text-orange-600 mr-2" /> Unpublish
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(submission.id)}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" /> Delete
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

            {/* Pagination */}
            <AdminPagination
              currentPage={pagination.currentPage}
              lastPage={pagination.lastPage}
              total={pagination.total}
              perPage={pagination.perPage}
              onPageChange={handlePageChange}
              loading={searchLoading}
            />
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No submissions found"
            description={
              filters.search || filters.status !== 'all' || filters.classroom_id !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No stories have been submitted to the Hero Wall yet.'
            }
            action={
              filters.search || filters.status !== 'all' || filters.classroom_id !== 'all' ? {
                label: 'Clear filters',
                onClick: () => {
                  setFilters({
                    search: '',
                    status: 'all',
                    classroom_id: 'all',
                    date_from: '',
                    date_to: '',
                  });
                },
              } : undefined
            }
          />
        )}
      </DataCard>

      {/* View Details Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Hero Wall Submission Details</DialogTitle>
              <DialogDescription>
                Review this story before publishing to the Hero Wall
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {renderStatusBadge(selectedSubmission.status)}
                  <h2 className="text-2xl font-bold">
                    {selectedSubmission.featured_title || selectedSubmission.ripple_title}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    <b>Quote by {selectedSubmission.nominated_by}:</b> {selectedSubmission.teacher_quote}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(selectedSubmission)}
                        disabled={actionLoading === selectedSubmission.id}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {actionLoading === selectedSubmission.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(selectedSubmission.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedSubmission.status === 'published' && (
                    <Button
                      variant="outline"
                      onClick={() => handleUnpublish(selectedSubmission.id)}
                      disabled={actionLoading === selectedSubmission.id}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {actionLoading === selectedSubmission.id ? 'Unpublishing...' : 'Unpublish'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Media */}
              {selectedSubmission.photo_path && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedSubmission.photo_path)}
                    alt="Story media"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Featured Description */}
                  {selectedSubmission.featured_description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Teacher's Recommendation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedSubmission.featured_description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Original Story */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Original Story</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Title</Label>
                        <p className="text-muted-foreground">{selectedSubmission.ripple_title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedSubmission.ripple_description}
                        </p>
                      </div>
                      {selectedSubmission.category_name && (
                        <div>
                          <Label className="text-sm font-medium">Category</Label>
                          {renderCategoryBadge(selectedSubmission)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Student & Classroom Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Student & Classroom</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Student</Label>
                        <p className="text-muted-foreground">

                          {selectedSubmission.student_full_name} ({selectedSubmission.student_nickname})
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Classroom</Label>
                        <p className="text-muted-foreground">{selectedSubmission.classroom_name}</p>
                        {selectedSubmission.classroom_grade && (
                          <p className="text-sm text-muted-foreground">
                            Grade {selectedSubmission.classroom_grade}
                            {selectedSubmission.classroom_section && `, Section ${selectedSubmission.classroom_section}`}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Teacher</Label>
                        <p className="text-muted-foreground">
                          {selectedSubmission.teacher_full_name} ({selectedSubmission.teacher_nickname})
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Likes</span>
                        <Badge variant="outline">
                          <Heart className="h-3 w-3 mr-1" />
                          {selectedSubmission.likes_count}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Comments</span>
                        <Badge variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {selectedSubmission.comments_count}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Story Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedSubmission.performed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Submitted</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedSubmission.featured_at && (
                        <div>
                          <Label className="text-sm font-medium">Published</Label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedSubmission.featured_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit & Approve Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit & Approve Submission</DialogTitle>
            <DialogDescription>
              Customize how this story will appear on the Hero Wall
            </DialogDescription>
          </DialogHeader>

          {editingSubmission && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="featured_title">Featured Title</Label>
                <Input
                  id="featured_title"
                  value={editForm.featured_title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, featured_title: e.target.value }))}
                  placeholder="Enter a compelling title for the Hero Wall..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to use the original title: "{editingSubmission.ripple_title}"
                </p>
              </div>

              <div>
                <Label htmlFor="featured_description">Teacher's Recommendation</Label>
                <Textarea
                  id="featured_description"
                  value={editForm.featured_description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, featured_description: e.target.value }))}
                  placeholder="Explain why this story deserves to be on the Hero Wall..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be featured alongside the story on the Hero Wall
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Preview</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {editForm.featured_title || editingSubmission.ripple_title}</p>
                  {editForm.featured_description && (
                    <p><strong>Description:</strong> {editForm.featured_description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={actionLoading === editingSubmission?.id}
            >
              <Check className="h-4 w-4 mr-2" />
              {actionLoading === editingSubmission?.id ? 'Approving...' : 'Approve with Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this Hero Wall submission. An email will be sent to the author.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => submissionToReject && rejectSubmission(submissionToReject, rejectReason)}
              disabled={!rejectReason.trim() || actionLoading === submissionToReject}
            >
              <X className="h-4 w-4 mr-2" />
              {actionLoading === submissionToReject ? 'Rejecting...' : 'Reject Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish Dialog */}
      <Dialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpublish Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for unpublishing this Hero Wall submission. An email will be sent to the author explaining why it was unpublished.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter unpublish reason..."
              value={unpublishReason}
              onChange={(e) => setUnpublishReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnpublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitUnpublish}
              disabled={!unpublishReason.trim() || (submissionToUnpublish !== null && actionLoading === submissionToUnpublish)}
            >
              <Ban className="h-4 w-4 mr-2" />
              {submissionToUnpublish !== null && actionLoading === submissionToUnpublish ? 'Unpublishing...' : 'Unpublish Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}