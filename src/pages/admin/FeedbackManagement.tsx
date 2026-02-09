import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Archive,
  RotateCcw,
  MessageSquare,
  Calendar,
  User,
  GraduationCap,
  UserCircle,
  Download,
  Loader2,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/config/api';
import Swal from 'sweetalert2';
import { SearchBar } from '@/components/admin/SearchBar';
import { Label } from '@/components/ui/label';
import { useExportData } from '@/hooks/useExportData';
import { getUserDisplayName, getUserAvatarUrl, getUserInitials } from '@/utils/userDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Seo from '@/components/Seo';

interface FeedbackUser {
  id: number;
  nickname: string;
  email: string;
  full_name: string | null;
  role: string;
  profile_image_path: string | null;
  avatar_id: number | null;
}

interface Feedback {
  id: number;
  user_id: number;
  form_type: 'student' | 'teacher';
  question_1: string | null;
  question_2: string | null;
  question_3: string | null;
  question_4: string | null;
  question_5: string | null;
  question_6: string | null;
  question_7: string | null;
  status: 'new' | 'read' | 'archived';
  created_at: string;
  updated_at: string;
  user: FeedbackUser;
}

interface FeedbackStats {
  total: number;
  new: number;
  read: number;
  archived: number;
  student: number;
  teacher: number;
}

interface FeedbackResponse {
  feedbacks: {
    current_page: number;
    data: Feedback[];
    last_page: number;
    total: number;
  };
  stats: FeedbackStats;
  status_options: {
    new: string;
    read: string;
    archived: string;
  };
  form_type_options: {
    student: string;
    teacher: string;
  };
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [archivedFeedbacks, setArchivedFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [archivedTotalPages, setArchivedTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(15);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  
  const { exportData, exporting } = useExportData();

  useEffect(() => {
    if (activeTab === 'active') {
      loadFeedbacks();
      loadStats();
    } else {
      loadArchivedFeedbacks();
    }
  }, [currentPage, archivedPage, searchQuery, statusFilter, formTypeFilter, dateFrom, dateTo, activeTab]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(formTypeFilter !== 'all' && { form_type: formTypeFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      const response = await apiFetch<{ data: FeedbackResponse }>(`/admin/feedbacks?${params}`);
      
      if (response.data?.feedbacks) {
        setFeedbacks(response.data.feedbacks.data || []);
        setTotalPages(response.data.feedbacks.last_page || 1);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error: any) {
      console.error('Failed to load feedbacks:', error);
      toast({
        title: "Error",
        description: "Failed to load feedbacks",
        variant: "destructive",
      });
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadArchivedFeedbacks = async () => {
    try {
      setArchivedLoading(true);
      const params = new URLSearchParams({
        page: archivedPage.toString(),
        per_page: perPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(formTypeFilter !== 'all' && { form_type: formTypeFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        sort_by: 'updated_at',
        sort_order: 'desc'
      });

      const response = await apiFetch<{ data: { feedbacks: { current_page: number; data: Feedback[]; last_page: number; total: number } } }>(`/admin/feedbacks/deleted?${params}`);
      
      if (response.data?.feedbacks) {
        setArchivedFeedbacks(response.data.feedbacks.data || []);
        setArchivedTotalPages(response.data.feedbacks.last_page || 1);
      }
    } catch (error: any) {
      console.error('Failed to load archived feedbacks:', error);
      toast({
        title: "Error",
        description: "Failed to load archived feedbacks",
        variant: "destructive",
      });
      setArchivedFeedbacks([]);
    } finally {
      setArchivedLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiFetch<{ data: FeedbackStats }>('/admin/feedbacks/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleViewFeedback = async (id: number) => {
    try {
      const response = await apiFetch<{ data: Feedback }>(`/admin/feedbacks/${id}`);
      setSelectedFeedback(response.data);
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load feedback details:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    // Get old status before updating
    const oldStatus = activeTab === 'active' 
      ? feedbacks.find(f => f.id === id)?.status 
      : archivedFeedbacks.find(f => f.id === id)?.status;

    // Optimistic update - update UI immediately
    if (activeTab === 'active') {
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(feedback => 
          feedback.id === id ? { ...feedback, status: newStatus as any } : feedback
        )
      );
    } else {
      setArchivedFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(feedback => 
          feedback.id === id ? { ...feedback, status: newStatus as any } : feedback
        )
      );
    }
    
    // Update selected feedback if it's the one being updated
    if (selectedFeedback?.id === id) {
      setSelectedFeedback({ ...selectedFeedback, status: newStatus as any });
    }

    // Update stats optimistically
    if (stats && activeTab === 'active' && oldStatus) {
      setStats(prevStats => {
        if (!prevStats) return prevStats;
        const updatedStats = { ...prevStats };
        
        // Decrease old status count
        if (oldStatus === 'new' && updatedStats.new > 0) updatedStats.new--;
        if (oldStatus === 'read' && updatedStats.read > 0) updatedStats.read--;
        if (oldStatus === 'archived' && updatedStats.archived > 0) updatedStats.archived--;
        
        // Increase new status count
        if (newStatus === 'new') updatedStats.new++;
        if (newStatus === 'read') updatedStats.read++;
        if (newStatus === 'archived') updatedStats.archived++;
        
        return updatedStats;
      });
    }

    try {
      await apiFetch(`/admin/feedbacks/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      // Refresh data to ensure consistency
      if (activeTab === 'active') {
        loadFeedbacks();
      } else {
        loadArchivedFeedbacks();
      }
      loadStats();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      
      // Revert optimistic update on error
      if (activeTab === 'active') {
        loadFeedbacks();
      } else {
        loadArchivedFeedbacks();
      }
      loadStats();
      
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleArchiveFeedback = async (id: number) => {
    const result = await Swal.fire({
      title: 'Archive Feedback?',
      text: "This feedback will be moved to archived section.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, archive it!'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/feedbacks/${id}`, {
          method: 'DELETE'
        });

        toast({
          title: "Success",
          description: "Feedback archived successfully",
        });

        loadFeedbacks();
        loadStats();
        if (selectedFeedback?.id === id) {
          setViewDialogOpen(false);
          setSelectedFeedback(null);
        }
      } catch (error: any) {
        console.error('Failed to archive feedback:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to archive feedback",
          variant: "destructive",
        });
      }
    }
  };

  const handleRestoreFeedback = async (id: number) => {
    try {
      await apiFetch(`/admin/archived/feedbacks/${id}/restore`, {
        method: 'PUT'
      });

      toast({
        title: "Success",
        description: "Feedback restored successfully",
      });

      loadArchivedFeedbacks();
      loadStats();
      if (selectedFeedback?.id === id) {
        setViewDialogOpen(false);
        setSelectedFeedback(null);
      }
    } catch (error: any) {
      console.error('Failed to restore feedback:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to restore feedback",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Permanently Delete?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete permanently!'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/archived/feedbacks/${id}/permanent-delete`, {
          method: 'DELETE'
        });

        toast({
          title: "Success",
          description: "Feedback permanently deleted",
        });

        loadArchivedFeedbacks();
      } catch (error: any) {
        console.error('Failed to delete feedback:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete feedback",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'New' },
      read: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Read' },
      archived: { color: 'bg-gray-100 text-gray-800', icon: Archive, label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getFormTypeBadge = (formType: string) => {
    const isTeacher = formType === 'teacher';
    return (
      <Badge className={isTeacher ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
        {isTeacher ? (
          <>
            <GraduationCap className="h-3 w-3 mr-1" />
            Teacher
          </>
        ) : (
          <>
            <UserCircle className="h-3 w-3 mr-1" />
            Student
          </>
        )}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionLabels = (formType: 'student' | 'teacher') => {
    if (formType === 'teacher') {
      return {
        question_1: 'How engaged were your students during Pass The Ripple activities?',
        question_2: 'Did Pass The Ripple help promote kindness and empathy in your classroom?',
        question_3: 'How easy was Pass The Ripple platform to use with your class?',
        question_4: 'How likely are you to recommend Pass The Ripple to other teachers?',
        question_5: "Did Pass The Ripple activities fit well with your school's values or curriculum?",
        question_6: "What changes did you notice in your students' behavior or teamwork?",
        question_7: 'What improvements or new features would you like to see in Pass The Ripple for teachers?'
      };
    } else {
      return {
        question_1: 'How happy did you feel after doing a Pass The Ripple activity?',
        question_2: 'Was Pass The Ripple website easy to use?',
        question_3: 'How much did you enjoy doing Pass The Ripple challenges?',
        question_4: 'Did Pass The Ripple help you learn more about kindness?',
        question_5: 'Would you like to do more Pass The Ripple challenges in the future?',
        question_6: 'What was your favorite Pass The Ripple activity or moment?',
        question_7: 'What can we do to make Pass The Ripple more fun for you?'
      };
    }
  };

  const handleExportStudent = () => {
    const formType = 'student';
    const questionLabels = getQuestionLabels(formType);

    // Transform function to extract user data
    const transformRow = (row: any) => {
      return {
        id: row.id,
        user_name: getUserDisplayName(row.user),
        user_email: row.user?.email || '',
        form_type: 'Student',
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        question_1: row.question_1 || '',
        question_2: row.question_2 || '',
        question_3: row.question_3 || '',
        question_4: row.question_4 || '',
        question_5: row.question_5 || '',
        question_6: row.question_6 || '',
        question_7: row.question_7 || '',
      };
    };

    // Create columns with student question labels
    const columns = [
      { key: "id", label: "ID" },
      { key: "user_name", label: "User Name" },
      { key: "user_email", label: "User Email" },
      { key: "form_type", label: "Form Type" },
      { key: "question_1", label: questionLabels.question_1 },
      { key: "question_2", label: questionLabels.question_2 },
      { key: "question_3", label: questionLabels.question_3 },
      { key: "question_4", label: questionLabels.question_4 },
      { key: "question_5", label: questionLabels.question_5 },
      { key: "question_6", label: questionLabels.question_6 },
      { key: "question_7", label: questionLabels.question_7 },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created At" },
    ];

    if (activeTab === 'archived') {
      columns.push({ key: "updated_at", label: "Updated At" });
    }

    const baseFilters = activeTab === 'archived' 
      ? {
          q: searchQuery.trim() || undefined,
          form_type: formType,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }
      : {
          search: searchQuery.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          form_type: formType,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          per_page: perPage === "all" ? undefined : perPage,
          page: perPage === "all" ? "all" : 1,
        };

    if (activeTab === 'archived') {
      exportData({
        exportEndpoint: "/admin/feedbacks/deleted/export",
        listEndpoint: "/admin/feedbacks/deleted",
        dataKey: "feedbacks",
        fileNamePrefix: "archived-student-feedbacks",
        filters: baseFilters,
        columns,
        transformRow,
      });
    } else {
      exportData({
        exportEndpoint: "/admin/feedbacks?export=true",
        listEndpoint: "/admin/feedbacks",
        dataKey: "feedbacks",
        fileNamePrefix: "student-feedbacks",
        filters: baseFilters,
        columns,
        transformRow,
      });
    }
  };

  const handleExportTeacher = () => {
    const formType = 'teacher';
    const questionLabels = getQuestionLabels(formType);

    // Transform function to extract user data
    const transformRow = (row: any) => {
      return {
        id: row.id,
        user_name: getUserDisplayName(row.user),
        user_email: row.user?.email || '',
        form_type: 'Teacher',
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        question_1: row.question_1 || '',
        question_2: row.question_2 || '',
        question_3: row.question_3 || '',
        question_4: row.question_4 || '',
        question_5: row.question_5 || '',
        question_6: row.question_6 || '',
        question_7: row.question_7 || '',
      };
    };

    // Create columns with teacher question labels
    const columns = [
      { key: "id", label: "ID" },
      { key: "user_name", label: "User Name" },
      { key: "user_email", label: "User Email" },
      { key: "form_type", label: "Form Type" },
      { key: "question_1", label: questionLabels.question_1 },
      { key: "question_2", label: questionLabels.question_2 },
      { key: "question_3", label: questionLabels.question_3 },
      { key: "question_4", label: questionLabels.question_4 },
      { key: "question_5", label: questionLabels.question_5 },
      { key: "question_6", label: questionLabels.question_6 },
      { key: "question_7", label: questionLabels.question_7 },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created At" },
    ];

    if (activeTab === 'archived') {
      columns.push({ key: "updated_at", label: "Updated At" });
    }

    const baseFilters = activeTab === 'archived'
      ? {
          q: searchQuery.trim() || undefined,
          form_type: formType,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }
      : {
          search: searchQuery.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          form_type: formType,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          per_page: perPage === "all" ? undefined : perPage,
          page: perPage === "all" ? "all" : 1,
        };

    if (activeTab === 'archived') {
      exportData({
        exportEndpoint: "/admin/feedbacks/deleted/export",
        listEndpoint: "/admin/feedbacks/deleted",
        dataKey: "feedbacks",
        fileNamePrefix: "archived-teacher-feedbacks",
        filters: baseFilters,
        columns,
        transformRow,
      });
    } else {
      exportData({
        exportEndpoint: "/admin/feedbacks?export=true",
        listEndpoint: "/admin/feedbacks",
        dataKey: "feedbacks",
        fileNamePrefix: "teacher-feedbacks",
        filters: baseFilters,
        columns,
        transformRow,
      });
    }
  };

  const currentFeedbacks = activeTab === 'active' ? feedbacks : archivedFeedbacks;
  const currentLoading = activeTab === 'active' ? loading : archivedLoading;
  const currentPageNum = activeTab === 'active' ? currentPage : archivedPage;
  const currentTotalPages = activeTab === 'active' ? totalPages : archivedTotalPages;
  const setCurrentPageNum = activeTab === 'active' ? setCurrentPage : setArchivedPage;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      <Seo
        title="Feedback Management | Admin Panel"
        description="Manage and review user feedback submissions"
      />
      
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Feedback Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and review feedback submissions from students and teachers
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={exporting} size="sm" variant="outline" className="flex items-center gap-2">
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
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportStudent} disabled={exporting}>
              <UserCircle className="h-4 w-4 mr-2" />
              Export Student Feedback
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportTeacher} disabled={exporting}>
              <GraduationCap className="h-4 w-4 mr-2" />
              Export Teacher Feedback
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>

      {/* Statistics Cards */}
      {stats && activeTab === 'active' && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedbacks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.new}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Archived</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
                </div>
                <Archive className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Feedbacks</TabsTrigger>
          <TabsTrigger value="archived">Archived Feedbacks</TabsTrigger>
        </TabsList>

        {/* Filters and Search */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 items-end">
                <div className="flex items-center gap-2 lg:w-auto">
                  <Label htmlFor="per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</Label>
                  <Select value={perPage.toString()} onValueChange={(value) => {
                    const newPerPage = value === "all" ? "all" : parseInt(value);
                    setPerPage(newPerPage);
                    setCurrentPage(1);
                    setArchivedPage(1);
                  }}>
                    <SelectTrigger className="w-20 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
                </div>
                
                <div className="flex-1 lg:max-w-md">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search feedbacks..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="date-from" className="text-sm text-gray-700 font-medium">From</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                        setArchivedPage(1);
                      }}
                      className="w-full sm:w-40 h-10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="date-to" className="text-sm text-gray-700 font-medium">To</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                        setArchivedPage(1);
                      }}
                      className="w-full sm:w-40 h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                {activeTab === 'active' && (
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-full sm:w-48 h-10">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={formTypeFilter} onValueChange={(value) => {
                  setFormTypeFilter(value);
                  setCurrentPage(1);
                  setArchivedPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48 h-10">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchQuery || statusFilter !== 'all' || formTypeFilter !== 'all' || dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setFormTypeFilter('all');
                      setDateFrom('');
                      setDateTo('');
                      setCurrentPage(1);
                      setArchivedPage(1);
                    }}
                    className="whitespace-nowrap"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Feedbacks Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Active Feedbacks ({feedbacks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading feedbacks...</p>
                </div>
              ) : currentFeedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedbacks found</h3>
                  <p className="text-gray-600">No feedbacks match your current filters.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">User</TableHead>
                          <TableHead className="min-w-[100px]">Type</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[150px]">Submitted</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentFeedbacks.map((feedback) => (
                          <TableRow key={feedback.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage 
                                    src={getUserAvatarUrl(feedback.user) || undefined} 
                                    alt={getUserDisplayName(feedback.user)}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials(feedback.user)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{getUserDisplayName(feedback.user)}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 truncate">{feedback?.user?.email || ''}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getFormTypeBadge(feedback.form_type)}</TableCell>
                            <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{formatDate(feedback.created_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewFeedback(feedback.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {feedback.status === 'new' && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'read')}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Mark as Read
                                    </DropdownMenuItem>
                                  )}
                                  {feedback.status === 'read' && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(feedback.id, 'new')}>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Mark as New
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleArchiveFeedback(feedback.id)}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {currentTotalPages > 1 && (
                    <div className="flex items-center justify-center sm:justify-end mt-6">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageNum(prev => Math.max(prev - 1, 1))}
                          disabled={currentPageNum === 1}
                          className="w-full sm:w-auto"
                        >
                          Previous
                        </Button>
                        <span className="text-sm whitespace-nowrap">
                          Page {currentPageNum} of {currentTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageNum(prev => Math.min(prev + 1, currentTotalPages))}
                          disabled={currentPageNum === currentTotalPages}
                          className="w-full sm:w-auto"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archived Feedbacks Tab */}
        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Feedbacks ({archivedFeedbacks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading archived feedbacks...</p>
                </div>
              ) : archivedFeedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No archived feedbacks</h3>
                  <p className="text-gray-600">No archived feedbacks match your current filters.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">User</TableHead>
                          <TableHead className="min-w-[100px]">Type</TableHead>
                          <TableHead className="min-w-[150px]">Archived Date</TableHead>
                          <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedFeedbacks.map((feedback) => (
                          <TableRow key={feedback.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage 
                                    src={getUserAvatarUrl(feedback.user) || undefined} 
                                    alt={getUserDisplayName(feedback.user)}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials(feedback.user)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{getUserDisplayName(feedback.user)}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 truncate">{feedback?.user?.email || ''}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getFormTypeBadge(feedback.form_type)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{formatDate(feedback.updated_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewFeedback(feedback.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRestoreFeedback(feedback.id)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handlePermanentDelete(feedback.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {archivedTotalPages > 1 && (
                    <div className="flex items-center justify-end mt-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchivedPage(prev => Math.max(prev - 1, 1))}
                          disabled={archivedPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {archivedPage} of {archivedTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchivedPage(prev => Math.min(prev + 1, archivedTotalPages))}
                          disabled={archivedPage === archivedTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Feedback Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback Details
            </DialogTitle>
            <DialogDescription>
              View complete feedback submission
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={getUserAvatarUrl(selectedFeedback.user) || undefined} 
                        alt={getUserDisplayName(selectedFeedback.user)}
                      />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(selectedFeedback.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{getUserDisplayName(selectedFeedback.user)}</div>
                      <div className="text-sm text-gray-500">{selectedFeedback?.user?.email || ''}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Form Type</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getFormTypeBadge(selectedFeedback.form_type)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusBadge(selectedFeedback.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(selectedFeedback.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Questions & Answers</h3>
                {(() => {
                  const labels = getQuestionLabels(selectedFeedback.form_type);
                  return Object.entries(labels).map(([key, label]) => {
                    const answer = selectedFeedback[key as keyof Feedback] as string | null;
                    if (!answer) return null;
                    
                    const isTextAnswer = key === 'question_6' || key === 'question_7';
                    return (
                      <div key={key} className="space-y-2 p-4 bg-gray-50 rounded-lg">
                        <label className="text-sm font-medium text-gray-700">{label}</label>
                        <div className={`${isTextAnswer ? 'p-3 bg-white rounded border' : ''}`}>
                          <p className={isTextAnswer ? 'text-gray-800 whitespace-pre-wrap' : 'font-medium text-gray-900'}>
                            {answer}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedFeedback.status === 'new' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedFeedback.id, 'read')}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                {selectedFeedback.status === 'read' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedFeedback.id, 'new')}
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as New
                  </Button>
                )}
                {selectedFeedback.status !== 'archived' && (
                  <Button
                    onClick={() => handleArchiveFeedback(selectedFeedback.id)}
                    variant="outline"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
                {selectedFeedback.status === 'archived' && (
                  <>
                    <Button
                      onClick={() => handleRestoreFeedback(selectedFeedback.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      onClick={() => handlePermanentDelete(selectedFeedback.id)}
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;

