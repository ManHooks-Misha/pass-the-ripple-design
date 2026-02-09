// components/admin/ManageUsers.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  MoreVertical,
  Ban,
  Trash2,
  Eye,
  Download,
  Users,
  Edit,
  Filter,
  Mail,
  Calendar,
  Shield,
  Activity,
  TrendingUp,
  UserCheck,
  UserPlus,
  Loader2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { getAuthToken } from "@/lib/auth-token";
import { API_BASE_URL } from "@/config/api";

// ✅ Admin Shared Components
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

// ✅ Shared Hooks
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
import { useExportData } from "@/hooks/useExportData";
import { UserAvatarOnly, UserRippleCopy } from "@/components/UserIdentity";

type Role = "teacher" | "admin" | "user";

type User = {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  role: Role;
  account_status: string;
  registration_status: string;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  avatar_id?: number | null;
  custom_avatar?: string | null;
  created_at: string;
  last_active: string | null;
  age_group?: string | null;
  address?: string;
  is_block?: number;
  is_delete?: number;
};

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [counts, setCounts] = useState<{
    teacher: number;
    admin: number;
    user: number;
    total: number;
  }>({
    teacher: 0,
    admin: 0,
    user: 0,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [perPage, setPerPage] = useState<number | "all">(50);
  const { exporting, exportData } = useExportData();
  
  // Edit user modal state
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    nickname: "",
    full_name: "",
    role: "user" as Role,
    account_status: "active",
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // ✅ Use shared hooks
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { pagination, updatePagination, resetPagination } = usePagination(20);

   const getFinalStatus = useCallback((u: User) => {
    if (u.account_status) return u.account_status;
    if (u.is_delete === 1) return "deleted";
    if (u.is_block === 1) return "blocked";
    return "active";
  }, []);
  

  // Helper function to get the best avatar source
  
  const fetchUsers = useCallback(async (
    page: number = 1,
    search: string = "",
    role: string = "all",
    status: string = "all",
    from: string = "",
    to: string = "",
    isSearch: boolean = false
  ) => {
    if (page === 1 && !search && role === "all" && status === "all" && !from && !to && !isSearch) {
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
        sort_by: "created_at",
        sort_order: "desc",
      });
      if (search.trim()) params.append("search", search.trim());
      if (role !== "all") params.append("role", role);
      if (status !== "all") params.append("status", status);
      if (from) params.append("date_from", from);
      if (to) params.append("date_to", to);

      const apiUrl = `/admin/users/list?${params.toString()}`;
      const response = await apiFetch<any>(apiUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.success && response.data?.users) {
        const usersData = response.data.users.data || [];
        setUsers(usersData);
        
        const paginationData = response.data.users;
        updatePagination({
          currentPage: paginationData.current_page || 1,
          lastPage: paginationData.last_page || 1,
          total: paginationData.total || 0,
          perPage: paginationData.per_page || 20,
          from: paginationData.from || 0,
          to: paginationData.to || 0,
        });
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Fetch users error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
      }
  }, [updatePagination]);

  const fetchUserCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await apiFetch<any>("/admin/users/role-counts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.success && response.data?.role_counts) {
          setCounts({
          teacher: response.data.role_counts.teacher || 0,
          admin: response.data.role_counts.admin || 0,
          user: response.data.role_counts.user || 0,
          total: response.data.total || 0,
        });
      }
    } catch (err: any) {
      console.error("Fetch user counts error:", err);
      setCounts({ teacher: 0, admin: 0, user: 0, total: 0 });
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchUserCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount


  const handleRoleFilter = useCallback((role: string) => {
    setFilterRole(role);
    fetchUsers(1, debouncedSearchTerm, role, filterStatus, dateFrom, dateTo, true);
  }, [debouncedSearchTerm, filterStatus, dateFrom, dateTo, fetchUsers]);

  const handleStatusFilter = useCallback((status: string) => {
    setFilterStatus(status);
    fetchUsers(1, debouncedSearchTerm, filterRole, status, dateFrom, dateTo, true);
  }, [debouncedSearchTerm, filterRole, dateFrom, dateTo, fetchUsers]);

  const handleDateFromChange = useCallback((from: string) => {
    setDateFrom(from);
    fetchUsers(1, debouncedSearchTerm, filterRole, filterStatus, from, dateTo, true);
  }, [debouncedSearchTerm, filterRole, filterStatus, dateTo, fetchUsers]);

  const handleDateToChange = useCallback((to: string) => {
    setDateTo(to);
    fetchUsers(1, debouncedSearchTerm, filterRole, filterStatus, dateFrom, to, true);
  }, [debouncedSearchTerm, filterRole, filterStatus, dateFrom, fetchUsers]);

  const handlePageChange = useCallback((page: number) => {
    fetchUsers(page, debouncedSearchTerm, filterRole, filterStatus, dateFrom, dateTo, false);
    const userListCard = document.querySelector('[data-user-list]');
    if (userListCard) {
      userListCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [debouncedSearchTerm, filterRole, filterStatus, dateFrom, dateTo, fetchUsers]);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    fetchUsers(1, debouncedSearchTerm, filterRole, filterStatus, dateFrom, dateTo, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]); // Only trigger on debounced search change

  // === Actions ===
  const handleBlockUser = useCallback(async (user: User) => {
    const isBlocked = getFinalStatus(user) === "blocked";
    const action = isBlocked ? "unblock" : "block";
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const res = await apiFetch<any>(`/admin/users/${user.id}/status`, {
          method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.success) throw new Error(res.message || `Failed to ${action} user`);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { 
                  ...u, 
                  is_block: action === "block" ? 1 : 0,
                account_status: action === "block" ? "blocked" : "active",
                }
              : u
          )
        );
      
      toast({ title: "Success", description: `User ${action}ed successfully.` });
      Swal.fire("Success", `User ${action}ed successfully.`, "success");
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      toast({ title: "Error", description: err.message || `Failed to ${action} user.`, variant: "destructive" });
    }
  }, [getFinalStatus]);

  const handleDeleteOrRestoreUser = useCallback(async (user: User) => {
    const isDeleted = getFinalStatus(user) === "deleted";
    const action = isDeleted ? "restore" : "delete";
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const res = await apiFetch<any>(`/admin/users/${user.id}/status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.success) {
        if (action === "delete") {
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          fetchUserCounts(); // refresh counts
        } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
                ? { ...u, is_delete: 0, account_status: "active" }
              : u
          )
        );
        }
        toast({ title: "Success", description: `User ${action}d successfully.` });
        Swal.fire("Success", `User ${action}d successfully.`, "success");
      } else {
        throw new Error(res.message || `Failed to ${action} user`);
      }
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      toast({ title: "Error", description: err.message || `Failed to ${action} user.`, variant: "destructive" });
    }
  }, [getFinalStatus, fetchUserCounts]);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setEditFormData({
      nickname: user.nickname || "",
      full_name: user.full_name || "",
      role: user.role,
      account_status: user.account_status || "active",
    });
    setEditUserOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editingUser) return;
    setEditLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const response = await apiFetch<any>(`/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.success) {
        setUsers((prev) => 
          prev.map((u) => 
            u.id === editingUser.id 
              ? { ...u, ...editFormData, role: editFormData.role }
              : u
          )
        );
        toast({ title: "Success", description: "User updated successfully." });
        setEditUserOpen(false);
        setEditingUser(null);
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (err: any) {
      console.error("Error updating user:", err);
      toast({ title: "Error", description: err.message || "Failed to update user.", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  }, [editingUser, editFormData]);

  const handleExportUsers = useCallback(() => {
    exportData({
      exportEndpoint: "/admin/users?export=true",
      listEndpoint: "/admin/users",
      dataKey: "users",
      fileNamePrefix: "users",
      filters: {
        search: searchTerm.trim() || undefined,
        role: filterRole !== "all" ? filterRole : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page: perPage === "all" ? undefined : perPage,
        page: perPage === "all" ? "all" : 1,
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "nickname", label: "Nickname" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        {
          key: "age_group",
          label: "Age Group",
          formatter: (value) => (value === "below_13" ? "Under 13" : value === "above_13" ? "Above 13" : "Not specified"),
        },
        { key: "address", label: "Address", formatter: (v) => v || "Not provided" },
        { key: "ripple_id", label: "Ripple ID", formatter: (v) => v || "N/A" },
        {
          key: "status",
          label: "Account Status",
          formatter: (_, row) => (row.is_block === 1 ? "Blocked" : "Active"),
        },
        { key: "registration_status", label: "Registration Status" },
        {
          key: "created_at",
          label: "Created At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "last_active",
          label: "Last Active",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
      transformRow: (user) => ({
        ...user,
        status: user.is_block === 1 ? "Blocked" : "Active", // expose for formatter
      }),
    });
  }, [exportData, searchTerm, filterRole, filterStatus, dateFrom, dateTo]);

  const handleRefresh = useCallback(() => {
    fetchUsers(pagination.currentPage, debouncedSearchTerm, filterRole, filterStatus, dateFrom, dateTo, false);
    fetchUserCounts();
    toast({ title: "Refreshed", description: "Data has been refreshed successfully." });
  }, [fetchUsers, fetchUserCounts, pagination.currentPage, debouncedSearchTerm, filterRole, filterStatus, dateFrom, dateTo]);

  // ✅ Stats Data - Memoized to prevent recalculation
  const stats = useMemo(() => [
    {
      title: "Teachers",
      value: countsLoading ? "—" : counts.teacher,
      description: "Total educators",
      icon: Shield,
      color: "blue" as const,
    },
    {
      title: "Admins",
      value: countsLoading ? "—" : counts.admin,
      description: "System administrators",
      icon: UserCheck,
      color: "purple" as const,
    },
    {
      title: "Users",
      value: countsLoading ? "—" : counts.user,
      description: "Active students",
      icon: Users,
      color: "green" as const,
    },
    {
      title: "Total Users",
      value: countsLoading ? "—" : counts.total,
      description: "All registered users",
      icon: TrendingUp,
      color: "indigo" as const,
    },
  ], [countsLoading, counts.teacher, counts.admin, counts.user, counts.total]);

  // ✅ Initial loading
  if (loading && !searchLoading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Manage Users
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleExportUsers} disabled={exporting} size="sm" className="flex items-center gap-2">
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

      {/* ✅ Stats Grid */}
      <StatsGrid stats={stats} loading={countsLoading} grid_count={4} />

      {/* ✅ User List Card */}
      <DataCard
        title="User List"
        icon={Filter}
        loading={searchLoading}
        loadingMessage="Loading users..."
        actions={<ViewToggle viewType={viewType} onViewChange={setViewType} disabled={searchLoading} />}
        dataAttribute="data-user-list"
      >
        {searchLoading && <LoadingOverlay message="Loading users..." />}

        <div className="flex flex-col gap-3 sm:gap-4 mb-6">
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, or Ripple ID..."
              loading={searchLoading}
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={filterRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 flex-1">
                <Label htmlFor="date-from" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full sm:w-40 h-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 flex-1">
                <Label htmlFor="date-to" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="w-full sm:w-40 h-10"
                />
              </div>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(searchTerm || filterRole !== "all" || filterStatus !== "all" || dateFrom || dateTo) && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
                setFilterStatus("all");
                setDateFrom("");
                setDateTo("");
                fetchUsers(1, "", "all", "all", "", "", false);
              }}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
            </div>
          )}
        </div>

        {viewType === "list" ? (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[800px]">
            <TableHeader>
                <TableRow className="bg-muted/50">
                  {/* <TableHead className="font-semibold">ID</TableHead> */}
                  <TableHead className="font-semibold">Profile</TableHead>
                  <TableHead className="font-semibold">Name <br/>/ Ripple ID</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Last Active</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                  users.map((user, idx) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      {/* <TableCell className="font-medium">{user.id}</TableCell> */}
                      <TableCell>
                        <UserAvatarOnly avatar_id={user.avatar_id} profile_image_path={user.profile_image_path} nickname={user.nickname} />

                      </TableCell>
                      <TableCell className="font-medium">
                          <Link
                            className="text-blue-900"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                            to={`/admin/users/${user.id}`}
                          >
                            {user.nickname}
                          </Link>
                          <UserRippleCopy ripple_id={user.ripple_id || "N/A"} />
                            
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : user.role === "teacher" ? "secondary" : "outline"}
                        >
                          {user.role}
                        </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getFinalStatus(user) === "active" ? "default" : "destructive"}
                    >
                      {getFinalStatus(user)}
                    </Badge>
                  </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Activity className="h-3 w-3 mr-1 text-muted-foreground" />
                          {user.last_active ? new Date(user.last_active).toLocaleDateString() : "Never"}
                        </div>
                      </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem >
                              <Link style={{display:"flex"}}
                                to={`/admin/users/${user.id}`} 
                              >
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </Link>
                              
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBlockUser(user)}>
                          <Ban className="h-4 w-4 mr-2" />
                              {getFinalStatus(user) === "blocked" ? "Unblock User" : "Block User"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={getFinalStatus(user) === "active" ? "text-destructive" : ""}
                          onClick={() => handleDeleteOrRestoreUser(user)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                              {getFinalStatus(user) === "deleted" ? "Restore User" : "Delete User"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={10} className="h-64">
                      {searchTerm || filterRole !== "all" || filterStatus !== "all" || dateFrom || dateTo ? (
                        <EmptyState
                          icon={Search}
                          title="No users found"
                          description={
                            searchTerm
                              ? `No users match "${searchTerm}". Try different search terms.`
                                : "No users match the current filters. Try changing your filter criteria."
                              }
                          action={{
                            label: "Clear all filters",
                            onClick: () => {
                                setSearchTerm("");
                                setFilterRole("all");
                                setFilterStatus("all");
                              setDateFrom("");
                              setDateTo("");
                              fetchUsers(1, "", "all", "all", "", "", false);
                            },
                          }}
                        />
                      ) : (
                        <EmptyState
                          icon={Users}
                          title="No users yet"
                          description="Users will appear here once they register."
                        />
                      )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.length > 0 ? (
              users.map((user, idx) => (
                <Card
                  key={user.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <UserAvatarOnly avatar_id={user.avatar_id} profile_image_path={user.profile_image_path} nickname={user.nickname} size="w-12 h-12" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockUser(user);
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            {getFinalStatus(user) === "blocked" ? "Unblock" : "Block"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={getFinalStatus(user) === "active" ? "text-destructive" : ""}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrRestoreUser(user);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {getFinalStatus(user) === "deleted" ? "Restore" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
          </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{user.nickname}</h3>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
                    <div className="flex items-center justify-between">
                    <Badge 
                        variant={user.role === "admin" ? "default" : user.role === "teacher" ? "secondary" : "outline"}
                        className="capitalize"
                    >
                        {user.role}
                    </Badge>
                        <Badge 
                        variant={getFinalStatus(user) === "active" ? "default" : "destructive"}
                        className="capitalize"
                        >
                        {getFinalStatus(user)}
                        </Badge>
                      </div>
                    {user.ripple_id && (
                      <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded truncate">
                        ID: {user.ripple_id}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.created_at).toLocaleDateString()}
                    </div>
                      <div className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {user.last_active ? "Active" : "Inactive"}
                    </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                {searchTerm || filterRole !== "all" || filterStatus !== "all" || dateFrom || dateTo ? (
                  <EmptyState
                    icon={Search}
                    title="No users found"
                    description={
                      searchTerm
                        ? `No users match "${searchTerm}".`
                        : "No users match the current filters."
                    }
                    action={{
                      label: "Clear all filters",
                      onClick: () => {
                        setSearchTerm("");
                        setFilterRole("all");
                        setFilterStatus("all");
                        setDateFrom("");
                        setDateTo("");
                        fetchUsers(1, "", "all", "all", "", "", false);
                      },
                    }}
                  />
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No users yet"
                    description="Users will appear here once they register."
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ✅ Pagination */}
        {users.length > 0 && (
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

      {/* ✅ Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information. Email cannot be changed.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={editingUser.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname *</Label>
                <Input
                  id="nickname"
                  value={editFormData.nickname}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Enter nickname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, role: value as Role }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_status">Account Status *</Label>
                <Select
                  value={editFormData.account_status}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, account_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={editLoading || !editFormData.nickname.trim()}
            >
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}