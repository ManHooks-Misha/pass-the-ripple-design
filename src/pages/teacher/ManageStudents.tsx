import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  MoreVertical,
  Eye,
  Download,
  Users,
  Edit,
  Filter,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  UserCheck,
  UserPlus,
  Loader2,
  Copy,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Trash,
  AlertCircle,
  X,
  FileDown,
  School,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, API_BASE_URL } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import * as XLSX from "xlsx";

// Shared Components
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SearchBar } from "@/components/admin/SearchBar";
import { ViewToggle } from "@/components/admin/ViewToggle";
import { Pagination as AdminPagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { Avatar } from "@/components/admin/Avatar";
import { LoadingState } from "@/components/admin/LoadingState";
import { LoadingOverlay } from "@/components/admin/LoadingOverlay";
import { DataCard } from "@/components/admin/DataCard";

// Shared Hooks
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserAvatarOnly } from "@/components/UserIdentity";
import Seo from "@/components/Seo";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { manageStudentsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { HelpCircle } from "lucide-react";


import { EditStudentModal } from "./EditStudentModal";

type ConsentStatus = "approved" | "pending" | "denied";

type Classroom = {
  id: number;
  name: string;
  grade: string;
  section: string;
};

type Student = {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  consent_status: ConsentStatus;
  parent_email?: string | null;
  avatar_id?: number | null;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  created_at: string;
  last_active: string | null;
  age_group?: string | null;
  date_of_birth?: string | null;
  acts_logged?: number;
  badges_earned?: number;
  enrolled_classrooms?: Classroom[];
};

export default function ManageStudents() {
  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_manage_students_tutorial_completed",
    steps: manageStudentsTutorialSteps,
  });
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [counts, setCounts] = useState<{
    total: number;
    consent_approved: number;
    consent_pending: number;
    active_this_week: number;
  }>({
    total: 0,
    consent_approved: 0,
    consent_pending: 0,
    active_this_week: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { pagination, updatePagination, resetPagination } = usePagination(20);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterAgeGroup !== "all") count++;
    if (filterClass !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [filterStatus, filterAgeGroup, filterClass, startDate, endDate]);

  const fetchClassrooms = useCallback(async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to view classrooms.',
            variant: 'destructive',
          });
          return;
        }
  
        const response = await apiFetch<any>('/teacher/classrooms', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response?.success && response?.data?.data) {
          setClassrooms(response.data.data);
        } else {
          throw new Error(response?.message || 'Failed to fetch classrooms');
        }
      } catch (err: any) {
        console.error('Fetch classrooms error:', err);
        toast({
          title: 'Error',
          description: err?.message || 'Failed to load classrooms.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }, []);

  const fetchStudents = useCallback(async (
    page: number = 1,
    search: string = "",
    status: string = "all",
    ageGroup: string = "all",
    grade: string = "all",
    start: string = "",
    end: string = "",
    isSearch: boolean = false
  ) => {
    if (page === 1 && !search && status === "all" && ageGroup === "all" && grade === "all" && !start && !end && !isSearch) {
      setLoading(true);
    } else {
      setSearchLoading(true);
    }

    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please log in to view students.",
          variant: "destructive",
        });
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
        sort_by: "created_at",
        sort_order: "desc",
      });
      if (search.trim()) params.append("search", search.trim());
      if (status !== "all") params.append("consent_status", status);
      if (ageGroup !== "all") params.append("age_group", ageGroup);
      if (grade !== "all") params.append("grade", grade);
      if (start) params.append("start_date", start);
      if (end) params.append("end_date", end);

      const apiUrl = `/teacher/students?${params.toString()}`;
      const response = await apiFetch<any>(apiUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.success && response.data?.students) {
        const studentsData = response.data?.students?.data || [];
        setStudents(studentsData);
        const paginationData = response.data?.students || {};

        updatePagination({
          currentPage: paginationData.current_page || 1,
          lastPage: paginationData.last_page || 1,
          total: paginationData.total || 0,
          perPage: paginationData.per_page || 20,
          from: paginationData.from || 0,
          to: paginationData.to || 0,
        });
      } else {
        throw new Error(response.message || "Failed to fetch students");
      }
    } catch (err: any) {
      console.error("Fetch students error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load students.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [updatePagination]);

  const fetchStudentCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiFetch<any>("/teacher/students/counts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.success && response.data) {
        setCounts({
          total: response.data.total || 0,
          consent_approved: response.data.consent_approved || 0,
          consent_pending: response.data.consent_pending || 0,
          active_this_week: response.data.active_this_week || 0,
        });
      }
    } catch (err: any) {
      console.error("Fetch student counts error:", err);
      setCounts({ total: 0, consent_approved: 0, consent_pending: 0, active_this_week: 0 });
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchStudentCounts();
    fetchClassrooms();
  }, []);

  const handleApplyFilters = useCallback(() => {
    fetchStudents(1, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, true);
    setFiltersOpen(false);
  }, [debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, fetchStudents]);

  const handleClearFilters = useCallback(() => {
    setFilterStatus("all");
    setFilterAgeGroup("all");
    setFilterClass("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    fetchStudents(1, "", "all", "all", "all", "", "", false);
    setFiltersOpen(false);
  }, [fetchStudents]);

  const handlePageChange = useCallback((page: number) => {
    fetchStudents(page, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, false);
    const studentListCard = document.querySelector('[data-student-list]');
    if (studentListCard) {
      studentListCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, fetchStudents]);

  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const params = new URLSearchParams({
        export: "true",
        format: "excel",
        sort_by: "created_at",
        sort_order: "desc",
      });
      
      if (debouncedSearchTerm.trim()) params.append("search", debouncedSearchTerm.trim());
      if (filterStatus !== "all") params.append("consent_status", filterStatus);
      if (filterAgeGroup !== "all") params.append("age_group", filterAgeGroup);
      if (filterClass !== "all") params.append("classroom_id", filterClass);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      // Use native fetch for file downloads to access Response object
      const response = await fetch(`${API_BASE_URL}/teacher/students?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export API error:", errorText);
        let errorMessage = `Export failed: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // If not JSON, use the text as is
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type") || "";
      const blob = await response.blob();
      console.log("Blob received:", blob.size, "bytes", "Content-Type:", contentType);

      if (blob.size === 0) {
        throw new Error("Exported file is empty");
      }

      let finalBlob: Blob;
      const fileName = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Check if backend returned CSV instead of Excel
      if (contentType.includes("text/csv") || contentType.includes("application/csv")) {
        // Convert CSV to Excel using XLSX's built-in CSV parser
        const text = await blob.text();
        const csvWorkbook = XLSX.read(text, { type: 'string' });
        const workbook = XLSX.utils.book_new();
        const worksheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]];
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        finalBlob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
      } else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || 
                 contentType.includes("application/vnd.ms-excel")) {
        // Already Excel format
        finalBlob = blob;
      } else {
        // Try to parse as CSV as fallback (backend might not set correct Content-Type)
        try {
          const text = await blob.text();
          // Check if it looks like CSV (contains commas and newlines)
          if (text.includes(',') && text.includes('\n')) {
            const csvWorkbook = XLSX.read(text, { type: 'string' });
            const workbook = XLSX.utils.book_new();
            const worksheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]];
            XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            finalBlob = new Blob([excelBuffer], { 
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
          } else {
            // Doesn't look like CSV, use original blob
            finalBlob = blob;
          }
        } catch (parseError) {
          console.error("Error parsing file:", parseError);
          // Fallback to original blob
          finalBlob = blob;
        }
      }

      const url = window.URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({ title: "Success", description: "Students exported successfully." });
    } catch (err: any) {
      console.error("Export error:", err);
      
      let errorMessage = "Failed to export students.";
      if (err.message.includes("Failed to fetch")) {
        errorMessage = "Network error: Cannot connect to server.";
      } else if (err.message.includes("401")) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.message.includes("403")) {
        errorMessage = "You don't have permission to export students.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setExportLoading(false);
    }
  }, [debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate]);

  const handleSendReminder = useCallback(async (student: Student) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const res = await apiFetch<any>(`/teacher/students/send-consent-reminder`, {
        method: "POST",
        body: JSON.stringify({ student_user_id: student.id }),
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.success) {
        toast({ title: "Success", description: "Reminder sent to parent." });
      } else {
        throw new Error(res.message || "Failed to send reminder");
      }
    } catch (err: any) {
      console.error("Error sending reminder:", err);
      toast({ title: "Error", description: err.message || "Failed to send reminder.", variant: "destructive" });
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchStudents(pagination.currentPage, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, false);
    fetchStudentCounts();
    toast({ title: "Refreshed", description: "Data has been refreshed successfully." });
  }, [fetchStudents, fetchStudentCounts, pagination.currentPage, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate]);

  const handleEdit = useCallback((student: Student) => {
      setSelectedStudent(student);
  }, []);

  const handleStudentUpdated = useCallback(() => {
    fetchStudents(pagination.currentPage, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, false);
    fetchStudentCounts();
    setSelectedStudent(null);
  }, [pagination.currentPage, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, fetchStudents, fetchStudentCounts]);

  const handleDelete = useCallback((student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedStudent) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const response = await apiFetch<any>(`/teacher/students/${selectedStudent.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.success) {
        toast({ title: "Success", description: "Student deleted successfully" });
        setDeleteDialogOpen(false);
        setSelectedStudent(null);
        fetchStudents(pagination.currentPage, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, false);
        fetchStudentCounts();
      } else {
        throw new Error(response.message || "Failed to delete student");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  }, [selectedStudent, pagination.currentPage, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, startDate, endDate, fetchStudents, fetchStudentCounts]);

  const getConsentIcon = useCallback((status: ConsentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "denied":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  }, []);

  const stats = useMemo(() => [
    {
      title: "Total Students",
      value: countsLoading ? "—" : counts.total,
      description: "All registered students",
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Consent Approved",
      value: countsLoading ? "—" : counts.consent_approved,
      description: "Ready to participate",
      icon: CheckCircle,
      color: "green" as const,
    },
    {
      title: "Consent Pending",
      value: countsLoading ? "—" : counts.consent_pending,
      description: "Awaiting parent approval",
      icon: Clock,
      color: "orange" as const,
    },
    {
      title: "Active This Week",
      value: countsLoading ? "—" : counts.active_this_week,
      description: "Recently active students",
      icon: TrendingUp,
      color: "purple" as const,
    },
  ], [countsLoading, counts]);

  if (loading && !searchLoading) {
    return <LoadingState message="Loading students..." />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Seo
        title="Manage Students — Pass The Ripple"
        description="View and manage your classroom students"
        canonical={`${window.location.origin}/teacher/manage-students`}
      />
      
      {/* Tutorial Component */}
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="manage_students_tutorial_completed"
        />
      )}
      
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Manage Students
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage your classroom students
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
            title="Take a tour of this page"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help</span>
          </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={exportLoading || students.length === 0}
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            >
              {exportLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span>Export</span>
                </>
              )}
            </Button>
            <Link to="/teacher/add-student">
              <Button size="sm" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>Add Student</span>
              </Button>
            </Link>
          </div>
      </div>

      <StatsGrid stats={stats} loading={countsLoading} grid_count={4} />

      <DataCard
        title="Student List"
        icon={Filter}
        loading={searchLoading}
        loadingMessage="Loading students..."
        actions={<ViewToggle viewType={viewType} onViewChange={setViewType} disabled={searchLoading} />}
        dataAttribute="data-student-list"
      >
        {searchLoading && <LoadingOverlay message="Loading students..." />}

        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, or Ripple ID..."
              loading={searchLoading}
              className="flex-1"
              data-tutorial-target="search-bar"
            />
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="relative"
              data-tutorial-target="filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {filtersOpen && (
            <Card className="border-2 border-primary/20" data-tutorial-target="filters">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Consent Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Age Group</Label>
                    <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Ages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="below_13">Under 13</SelectItem>
                        <SelectItem value="above_13">13 and Above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Classes</Label>
                    <Select value={filterClass} onValueChange={setFilterClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classrooms.length === 0 ? (
                          <SelectItem value="none" disabled>No classrooms available</SelectItem>
                        ) : (
                          classrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id.toString()}>
                              {classroom.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End"
                      min={startDate}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={handleClearFilters} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button onClick={handleApplyFilters} size="sm">
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filterStatus}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilterStatus("all");
                      fetchStudents(1, debouncedSearchTerm, "all", filterAgeGroup, filterClass, startDate, endDate, true);
                    }}
                  />
                </Badge>
              )}
              {filterAgeGroup !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Age: {filterAgeGroup === "below_13" ? "Under 13" : "13+"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilterAgeGroup("all");
                      fetchStudents(1, debouncedSearchTerm, filterStatus, "all", filterClass, startDate, endDate, true);
                    }}
                  />
                </Badge>
              )}
              {filterClass !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Grade: {filterClass}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setFilterClass("all");
                      fetchStudents(1, debouncedSearchTerm, filterStatus, filterAgeGroup, "all", startDate, endDate, true);
                    }}
                  />
                </Badge>
              )}
              {(startDate || endDate) && (
                <Badge variant="secondary" className="gap-1">
                  Date: {startDate || "..."} to {endDate || "..."}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      fetchStudents(1, debouncedSearchTerm, filterStatus, filterAgeGroup, filterClass, "", "", true);
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {viewType === "list" ? (
          <div className="rounded-lg border overflow-hidden" data-tutorial-target="students-table">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Profile</TableHead>
                  <TableHead className="font-semibold">Name / Ripple ID</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Classrooms</TableHead>
                  <TableHead className="font-semibold">Consent Status</TableHead>
                  <TableHead className="font-semibold">Acts</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <UserAvatarOnly
                          avatar_id={student.avatar_id}
                          profile_image_path={student.profile_image_path}
                          nickname={student.nickname}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          {student.nickname}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {student.ripple_id || "N/A"}
                          </span>
                          {student.ripple_id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(student.ripple_id!);
                                toast({
                                  title: "Copied!",
                                  description: "Ripple ID copied to clipboard.",
                                });
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Copy Ripple ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {student.enrolled_classrooms && student.enrolled_classrooms.length > 0 ? (
                            student.enrolled_classrooms.slice(0, 2).map((classroom) => (
                              <div key={classroom.id} className="flex items-center gap-1">
                                <School className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  {classroom.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No classrooms</span>
                          )}
                          {student.enrolled_classrooms && student.enrolled_classrooms.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{student.enrolled_classrooms.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getConsentIcon(student.consent_status)}
                          <Badge
                            variant={student.consent_status === "approved" ? "default" : student.consent_status === "pending" ? "secondary" : "destructive"}
                          >
                            {student.consent_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{student.acts_logged ?? 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0" 
                              data-tutorial-target={index === 0 ? "student-actions" : undefined}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Link style={{display:"flex"}}
                                to={`/teacher/student/${student.id}`} 
                              >
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(student)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit Student
                            </DropdownMenuItem>
                            {student.consent_status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleSendReminder(student)}>
                                  <Send className="h-4 w-4 mr-2" /> Send Reminder
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(student)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64">
                      {searchTerm || activeFiltersCount > 0 ? (
                        <EmptyState
                          icon={Search}
                          title="No students found"
                          description={
                            searchTerm
                              ? `No students match "${searchTerm}". Try different search terms.`
                              : "No students match the current filters. Try changing your filter criteria."
                          }
                          action={{
                            label: "Clear all filters",
                            onClick: handleClearFilters,
                          }}
                        />
                      ) : (
                        <EmptyState
                          icon={Users}
                          title="No students yet"
                          description="Add students to your classroom to get started."
                          action={{
                            label: "Add Student",
                            onClick: () => window.location.href = "/teacher/add-student",
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.length > 0 ? (
              students.map((student) => (
                <Card
                  key={student.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Avatar
                        src={student.profile_image_url || student.profile_image_path}
                        name={student.nickname}
                        size="w-12 h-12"
                      />
                      <Badge
                        variant={student.consent_status === "approved" ? "default" : student.consent_status === "pending" ? "secondary" : "destructive"}
                        className="capitalize"
                      >
                        {student.consent_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{student.nickname}</h3>
                      <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                    </div>
                    {student.ripple_id && (
                      <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded truncate">
                        ID: {student.ripple_id}
                      </div>
                    )}
                    {student.enrolled_classrooms && student.enrolled_classrooms.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <School className="h-3 w-3 mr-1" />
                          Classrooms
                        </div>
                        {student.enrolled_classrooms.slice(0, 2).map((classroom) => (
                          <div key={classroom.id} className="text-xs bg-muted px-2 py-1 rounded truncate">
                            {classroom.name}
                          </div>
                        ))}
                        {student.enrolled_classrooms.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{student.enrolled_classrooms.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {student.acts_logged ?? 0} acts
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={Users}
                  title="No students yet"
                  description="Add students to your classroom to get started."
                />
              </div>
            )}
          </div>
        )}

        {students.length > 0 && (
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

      {/* Edit Student Dialog */}
      <EditStudentModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
        onStudentUpdated={handleStudentUpdated}
      />

      {/* Delete Student Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Are you sure you want to delete <strong>{selectedStudent?.nickname}</strong>?
              This action cannot be undone. All student data including ripple actions and progress will be permanently deleted.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}