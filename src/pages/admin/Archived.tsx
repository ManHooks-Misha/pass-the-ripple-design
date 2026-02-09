import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Archive,
  Users,
  FileText,
  MessageSquare,
  Trophy,
  Award,
  BookOpen,
  RotateCcw,
  Eye,
  Trash2,
  Calendar,
  Mail,
  User,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Filter,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import Swal from "sweetalert2";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/admin/LoadingState";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination as AdminPagination } from "@/components/admin/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useExportData } from "@/hooks/useExportData";
import { getAvatarImage } from "@/utils/avatars";
import { getImageUrl } from "@/utils/imageUrl";

// Types for archived data
interface ArchivedUser {
  id: number;
  nickname: string;
  email: string;
  full_name?: string | null;
  role: string;
  age_group?: string | null;
  address?: string | null;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  avatar_id?: number | null;
  custom_avatar?: string | null;
  is_block?: number;
  is_delete?: number;
  account_status?: string;
  registration_status?: string;
  created_at: string;
  updated_at: string; // This is the deletion date
  last_active?: string | null;
  deleted_at?: string; // May not be present in API response
  deleted_by?: string; // May not be present in API response
}

interface ArchivedStory {
  id: number;
  title: string;
  description: string;
  action_type: string;
  status: string;
  performed_at: string;
  photo_path?: string | null;
  photo_url?: string | null;
  is_anonymous: boolean;
  ripple_category_id?: number;
  category_id?: number;
  is_canceled: boolean;
  is_approved: boolean;
  is_flagged: boolean;
  is_under_review: boolean;
  chain_level?: number;
  chain_position?: number;
  chain_description?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    nickname: string;
    email: string;
    full_name?: string;
    profile_image_path?: string;
    avatar_id?: number;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
  };
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

interface ArchivedContact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

interface ArchivedChallenge {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  badge_criteria?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface ArchivedBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  icon_path?: string;
  icon_url?: string;
  required_points: number;
  required_actions: number;
  required_streak: number;
  is_active: boolean;
  display_order: number;
  criteria_type: string;
  criteria_value: number;
  criteria_text: string;
  points: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface ArchivedCategory {
  id: number;
  name: string;
  description?: string;
  icon: string;
  is_active: boolean;
  is_deleted: boolean;
  ripple_count: number;
  created_at: string;
  updated_at: string;
}

interface ArchivedFAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_active: number;
  created_at: string;
  deleted_at: string;
  deleted_by: string;
}

const Archived = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<{ [key: string]: boolean }>({});

  // Data states for each section
  const [archivedUsers, setArchivedUsers] = useState<ArchivedUser[]>([]);
  const [archivedStories, setArchivedStories] = useState<ArchivedStory[]>([]);
  const [archivedContacts, setArchivedContacts] = useState<ArchivedContact[]>([]);
  const [archivedChallenges, setArchivedChallenges] = useState<ArchivedChallenge[]>([]);
  const [archivedBadges, setArchivedBadges] = useState<ArchivedBadge[]>([]);
  const [archivedCategories, setArchivedCategories] = useState<ArchivedCategory[]>([]);

  // Filter states for each tab
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [perPage, setPerPage] = useState<number | "all">(50);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState<any>(null);

  // Additional filter states for other tabs
  const [storiesSearchQuery, setStoriesSearchQuery] = useState("");
  const [storiesFilterStatus, setStoriesFilterStatus] = useState<string>("all");
  const [storiesPerPage, setStoriesPerPage] = useState<number | "all">(50);

  const [contactsSearchQuery, setContactsSearchQuery] = useState("");
  const [contactsFilterStatus, setContactsFilterStatus] = useState<string>("all");
  const [contactsPerPage, setContactsPerPage] = useState<number | "all">(50);

  const [challengesSearchQuery, setChallengesSearchQuery] = useState("");
  const [challengesFilterStatus, setChallengesFilterStatus] = useState<string>("all");
  const [challengesPerPage, setChallengesPerPage] = useState<number | "all">(50);

  const [badgesSearchQuery, setBadgesSearchQuery] = useState("");
  const [badgesFilterStatus, setBadgesFilterStatus] = useState<string>("all");
  const [badgesPerPage, setBadgesPerPage] = useState<number | "all">(50);

  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState("");
  const [categoriesFilterStatus, setCategoriesFilterStatus] = useState<string>("all");
  const [categoriesPerPage, setCategoriesPerPage] = useState<number | "all">(50);

  // Stats
  const [stats, setStats] = useState({
    users: 0,
    stories: 0,
    contacts: 0,
    challenges: 0,
    badges: 0,
    categories: 0,
  });

  // Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedStoriesSearchQuery = useDebounce(storiesSearchQuery, 500);
  const debouncedContactsSearchQuery = useDebounce(contactsSearchQuery, 500);
  const debouncedChallengesSearchQuery = useDebounce(challengesSearchQuery, 500);
  const debouncedBadgesSearchQuery = useDebounce(badgesSearchQuery, 500);
  const debouncedCategoriesSearchQuery = useDebounce(categoriesSearchQuery, 500);
  
  const { pagination, updatePagination, resetPagination } = usePagination(typeof perPage === "number" ? perPage : 50);
  const { exporting, exportData } = useExportData();

  // Load archived data for a specific section with filters
  const loadArchivedData = async (section: string, filters: any = {}) => {
    setLoading(true);
    try {
      // Map section names to correct API endpoints
      const endpointMap: { [key: string]: string } = {
        stories: '/admin/ripple-actions/deleted',
        contacts: '/admin/contacts/deleted',
        challenges: '/admin/challenges/deleted',
        badges: '/admin/badges/deleted',
        categories: '/admin/categories/deleted',
      };

      const endpoint = endpointMap[section];
      if (!endpoint) {
        throw new Error(`Unknown section: ${section}`);
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.records_per_page) params.append('records_per_page', filters.records_per_page.toString());
      if (filters.page) params.append('page', filters.page.toString());

      const url = `${endpoint}?${params.toString()}`;
      const response = await apiFetch(url, {
        method: "GET",
      });

      if (response.success && response.data) {
        // Handle the consistent API response structure: response.data.[section_name].data
        let itemsData = [];
        let placeholder = null;

        // Extract data based on section
        const dataKey = section === 'stories' ? 'ripple_actions' : section;
        if (response.data[dataKey] && response.data[dataKey].data && Array.isArray(response.data[dataKey].data)) {
          itemsData = response.data[dataKey].data;
        } else if (Array.isArray(response.data)) {
          itemsData = response.data;
        } else {
          itemsData = [];
        }

        // Extract placeholder information
        if (response.data.placeholder) {
          placeholder = response.data.placeholder;
        }

        // Set the appropriate state based on section
        switch (section) {
          case "stories":
            setArchivedStories(itemsData);
            break;
          case "contacts":
            setArchivedContacts(itemsData);
            break;
          case "challenges":
            setArchivedChallenges(itemsData);
            break;
          case "badges":
            setArchivedBadges(itemsData);
            break;
          case "categories":
            setArchivedCategories(itemsData);
            break;
        }
      }
    } catch (error: any) {
      console.error(`Error loading archived ${section}:`, error);
      toast({
        title: "Error",
        description: `Failed to load archived ${section}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // New function to load archived users with new API
  const loadArchivedUsers = async (
    page: number = 1,
    search: string = "",
    role: string = "all",
    isSearch: boolean = false,
    isPerPageChange: boolean = false,
    customPerPage?: number
  ) => {
    if (page === 1 && !search && role === "all" && !isSearch) {
      setLoading(true);
    } else if (isPerPageChange) {
      setTableLoading(true);
    } else {
      setSearchLoading(true);
    }

    try {
      const params = new URLSearchParams({
        records_per_page: (customPerPage || perPage).toString(),
      });
      
      if (search.trim()) params.append("search", search.trim());
      if (role !== "all") params.append("role", role);

      const apiUrl = `/admin/users/deleted?${params.toString()}`;
      const response = await apiFetch<any>(apiUrl);

      if (response.success && response.data) {
        // Handle the specific API response structure: response.data.users.data
        let usersData = [];
        
        if (response.data.users && response.data.users.data && Array.isArray(response.data.users.data)) {
          // Correct structure: response.data.users.data
          usersData = response.data.users.data;
        } else if (Array.isArray(response.data)) {
          // Direct array response (fallback)
          usersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Paginated response with data array (fallback)
          usersData = response.data.data;
        } else {
          // Fallback - ensure we always have an array
          usersData = [];
        }
        
        setArchivedUsers(usersData);

        // Handle placeholder information for empty states
        if (response.data.placeholder) {
          setPlaceholder(response.data.placeholder);
        } else {
          setPlaceholder(null);
        }

        // Handle pagination if available - check both response.data.users and response.data
        const paginationData = response.data.users || response.data;
        if (paginationData && paginationData.current_page) {
          updatePagination({
            currentPage: paginationData.current_page || 1,
            lastPage: paginationData.last_page || 1,
            total: paginationData.total || 0,
            perPage: typeof (customPerPage || perPage) === "number" ? (customPerPage || perPage) as number : 50,
            from: paginationData.from || 0,
            to: paginationData.to || 0,
          });
        }
      } else {
        throw new Error(response.message || "Failed to fetch archived users");
      }
    } catch (err: any) {
      console.error("Fetch archived users error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load archived users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setTableLoading(false);
    }
  };

  // Export functions for each section
  const handleExportArchivedUsers = () => {
    const exportFilters = {
      q: searchQuery.trim() || undefined, // Use 'q' parameter for export API
      role: filterRole !== "all" ? filterRole : undefined,
      records_per_page: perPage === "all" ? "all" : perPage,
    };
    
    exportData({
      exportEndpoint: "/admin/users/deleted/export",
      listEndpoint: "/admin/users/deleted",
      dataKey: "users",
      fileNamePrefix: "archived-users",
      filters: exportFilters,
      columns: [
        { key: "id", label: "ID" },
        { key: "nickname", label: "Nickname" },
        { key: "email", label: "Email" },
        { key: "full_name", label: "Full Name" },
        { key: "role", label: "Role" },
        { key: "age_group", label: "Age Group" },
        { key: "address", label: "Address" },
        { key: "ripple_id", label: "Ripple ID" },
        { key: "account_status", label: "Account Status" },
        { key: "registration_status", label: "Registration Status" },
        {
          key: "created_at",
          label: "Created At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "updated_at",
          label: "Deleted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        { key: "deleted_by", label: "Deleted By" },
      ],
    });
  };

  const handleExportArchivedStories = () => {
    exportData({
      exportEndpoint: "/admin/ripple-actions/deleted/export",
      listEndpoint: "/admin/ripple-actions/deleted",
      dataKey: "ripple_actions",
      fileNamePrefix: "archived-stories",
      filters: {
        q: storiesSearchQuery.trim() || undefined,
        status: storiesFilterStatus !== "all" ? storiesFilterStatus : undefined,
        records_per_page: storiesPerPage === "all" ? "all" : storiesPerPage,
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
          formatter: (user) => user?.full_name || user?.nickname || "Unknown",
        },
        {
          key: "category",
          label: "Category",
          formatter: (cat) => cat?.name || "N/A",
        },
        {
          key: "performed_at",
          label: "Performed At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "updated_at",
          label: "Deleted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  const handleExportArchivedContacts = () => {
    exportData({
      exportEndpoint: "/admin/contacts/deleted/export",
      listEndpoint: "/admin/contacts/deleted",
      dataKey: "contacts",
      fileNamePrefix: "archived-contacts",
      filters: {
        q: contactsSearchQuery.trim() || undefined,
        status: contactsFilterStatus !== "all" ? contactsFilterStatus : undefined,
        records_per_page: contactsPerPage === "all" ? "all" : contactsPerPage,
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message" },
        { key: "status", label: "Status" },
        {
          key: "created_at",
          label: "Created At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "updated_at",
          label: "Deleted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  const handleExportArchivedChallenges = () => {
    exportData({
      exportEndpoint: "/admin/challenges/deleted/export",
      listEndpoint: "/admin/challenges/deleted",
      dataKey: "challenges",
      fileNamePrefix: "archived-challenges",
      filters: {
        q: challengesSearchQuery.trim() || undefined,
        status: challengesFilterStatus !== "all" ? challengesFilterStatus : undefined,
        records_per_page: challengesPerPage === "all" ? "all" : challengesPerPage,
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        { key: "status", label: "Status" },
        { key: "badge_criteria", label: "Badge Criteria" },
        {
          key: "created_at",
          label: "Created At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "updated_at",
          label: "Deleted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  const handleExportArchivedBadges = () => {
    exportData({
      exportEndpoint: "/admin/badges/deleted/export",
      listEndpoint: "/admin/badges/deleted",
      dataKey: "badges",
      fileNamePrefix: "archived-badges",
      filters: {
        q: badgesSearchQuery.trim() || undefined,
        status: badgesFilterStatus !== "all" ? badgesFilterStatus : undefined,
        records_per_page: badgesPerPage === "all" ? "all" : badgesPerPage,
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "points", label: "Points" },
        { key: "criteria_text", label: "Criteria" },
        { key: "is_active", label: "Active" },
        { key: "display_order", label: "Display Order" },
        {
          key: "created_at",
          label: "Created At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "updated_at",
          label: "Deleted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  const handleExportArchivedCategories = () => {
    exportData({
      exportEndpoint: "/admin/categories/deleted/export",
      listEndpoint: "/admin/categories/deleted",
      dataKey: "categories",
      fileNamePrefix: "archived-categories",
      filters: {
        q: categoriesSearchQuery.trim() || undefined,
        status: categoriesFilterStatus !== "all" ? categoriesFilterStatus : undefined,
        records_per_page: categoriesPerPage === "all" ? "all" : categoriesPerPage,
      },
      columns: [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "icon", label: "Icon" },
        { key: "is_active", label: "Active" },
        { key: "ripple_count", label: "Ripple Count" },
        {
          key: "created_at",
          label: "Created At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
        {
          key: "updated_at",
          label: "Deleted At",
          formatter: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
        },
      ],
    });
  };

  // Helper function to get avatar source
  const getAvatarSource = (user: ArchivedUser) => {
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

  // Load stats by fetching each endpoint and counting results
  const loadStats = async () => {
    try {
      const endpoints = [
        { key: 'users', url: '/admin/users/deleted?records_per_page=all' },
        { key: 'stories', url: '/admin/ripple-actions/deleted?records_per_page=all' },
        { key: 'contacts', url: '/admin/contacts/deleted?records_per_page=all' },
        { key: 'challenges', url: '/admin/challenges/deleted?records_per_page=all' },
        { key: 'badges', url: '/admin/badges/deleted?records_per_page=all' },
        { key: 'categories', url: '/admin/categories/deleted?records_per_page=all' },
      ];

      const statsData = {
        users: 0,
        stories: 0,
        contacts: 0,
        challenges: 0,
        badges: 0,
        categories: 0,
      };

      // Fetch stats for each endpoint
      await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const response = await apiFetch(url);
            if (response.success && response.data) {
              const dataKey = key === 'stories' ? 'ripple_actions' : key;
              if (response.data[dataKey] && response.data[dataKey].data) {
                statsData[key as keyof typeof statsData] = response.data[dataKey].data.length;
              } else if (response.data[dataKey] && response.data[dataKey].total) {
                statsData[key as keyof typeof statsData] = response.data[dataKey].total;
              }
            }
          } catch (error) {
            console.error(`Error loading stats for ${key}:`, error);
          }
        })
      );

      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading archived stats:", error);
    }
  };

  // Restore item
  const restoreItem = async (section: string, id: number) => {
    const result = await Swal.fire({
      title: "Restore Item",
      text: `Are you sure you want to restore this ${section.slice(0, -1)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, restore it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setRestoring(prev => ({ ...prev, [`${section}-${id}`]: true }));

    try {
      const response = await apiFetch(`/admin/archived/${section}/${id}/restore`, {
        method: "PUT",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${section.slice(0, -1)} restored successfully`,
        });

        // Reload data
        if (section === "users") {
          await loadArchivedUsers(pagination.currentPage, debouncedSearchQuery, filterRole, false);
        } else {
          await loadArchivedData(section);
        }
        await loadStats();
      } else {
        throw new Error(response.message || "Failed to restore item");
      }
    } catch (error: any) {
      console.error(`Error restoring ${section}:`, error);
      toast({
        title: "Error",
        description: `Failed to restore ${section.slice(0, -1)}`,
        variant: "destructive",
      });
    } finally {
      setRestoring(prev => ({ ...prev, [`${section}-${id}`]: false }));
    }
  };

  // Permanently delete item
  const permanentDelete = async (section: string, id: number) => {
    const result = await Swal.fire({
      title: "Permanently Delete",
      text: `Are you sure you want to permanently delete this ${section.slice(0, -1)}? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete permanently!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiFetch(`/admin/archived/${section}/${id}/permanent-delete`, {
        method: "DELETE",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${section.slice(0, -1)} permanently deleted`,
        });

        // Reload data
        if (section === "users") {
          await loadArchivedUsers(pagination.currentPage, debouncedSearchQuery, filterRole, false);
        } else {
          await loadArchivedData(section);
        }
        await loadStats();
      } else {
        throw new Error(response.message || "Failed to delete item");
      }
    } catch (error: any) {
      console.error(`Error permanently deleting ${section}:`, error);
      toast({
        title: "Error",
        description: `Failed to permanently delete ${section.slice(0, -1)}`,
        variant: "destructive",
      });
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab) {
      if (activeTab === "users") {
        loadArchivedUsers();
      } else {
        loadArchivedData(activeTab);
      }
    }
  }, [activeTab]);

  // Load archived users when search or filters change
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    if (activeTab === "users") {
      loadArchivedUsers(1, debouncedSearchQuery, filterRole, true);
    }
  }, [debouncedSearchQuery, filterRole]);

  // Load archived stories when search or filters change
  useEffect(() => {
    if (debouncedStoriesSearchQuery !== storiesSearchQuery) return;
    if (activeTab === "stories") {
      loadArchivedData("stories", {
        search: debouncedStoriesSearchQuery,
        status: storiesFilterStatus,
        records_per_page: storiesPerPage,
      });
    }
  }, [debouncedStoriesSearchQuery, storiesFilterStatus, storiesPerPage]);

  // Load archived contacts when search or filters change
  useEffect(() => {
    if (debouncedContactsSearchQuery !== contactsSearchQuery) return;
    if (activeTab === "contacts") {
      loadArchivedData("contacts", {
        search: debouncedContactsSearchQuery,
        status: contactsFilterStatus,
        records_per_page: contactsPerPage,
      });
    }
  }, [debouncedContactsSearchQuery, contactsFilterStatus, contactsPerPage]);

  // Load archived challenges when search or filters change
  useEffect(() => {
    if (debouncedChallengesSearchQuery !== challengesSearchQuery) return;
    if (activeTab === "challenges") {
      loadArchivedData("challenges", {
        search: debouncedChallengesSearchQuery,
        status: challengesFilterStatus,
        records_per_page: challengesPerPage,
      });
    }
  }, [debouncedChallengesSearchQuery, challengesFilterStatus, challengesPerPage]);

  // Load archived badges when search or filters change
  useEffect(() => {
    if (debouncedBadgesSearchQuery !== badgesSearchQuery) return;
    if (activeTab === "badges") {
      loadArchivedData("badges", {
        search: debouncedBadgesSearchQuery,
        status: badgesFilterStatus,
        records_per_page: badgesPerPage,
      });
    }
  }, [debouncedBadgesSearchQuery, badgesFilterStatus, badgesPerPage]);

  // Load archived categories when search or filters change
  useEffect(() => {
    if (debouncedCategoriesSearchQuery !== categoriesSearchQuery) return;
    if (activeTab === "categories") {
      loadArchivedData("categories", {
        search: debouncedCategoriesSearchQuery,
        status: categoriesFilterStatus,
        records_per_page: categoriesPerPage,
      });
    }
  }, [debouncedCategoriesSearchQuery, categoriesFilterStatus, categoriesPerPage]);

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Handler functions for archived users
  const handleRoleFilter = (role: string) => {
    setFilterRole(role);
    loadArchivedUsers(1, debouncedSearchQuery, role, true);
  };

  const handlePageChange = (page: number) => {
    loadArchivedUsers(page, debouncedSearchQuery, filterRole, false);
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = value === "all" ? "all" : parseInt(value);
    setPerPage(newPerPage);
    resetPagination();
    loadArchivedUsers(1, debouncedSearchQuery, filterRole, false, true, typeof newPerPage === "number" ? newPerPage : undefined);
  };

  const handleRefresh = () => {
    if (activeTab === "users") {
      loadArchivedUsers(pagination.currentPage, debouncedSearchQuery, filterRole, false);
    } else {
      loadArchivedData(activeTab);
    }
    // Also refresh stats
    loadStats();
  };

  // Handler functions for stories tab
  const handleStoriesStatusFilter = (status: string) => {
    setStoriesFilterStatus(status);
  };

  const handleStoriesPerPageChange = (value: string) => {
    const newPerPage = value === "all" ? "all" : parseInt(value);
    setStoriesPerPage(newPerPage);
  };

  // Handler functions for contacts tab
  const handleContactsStatusFilter = (status: string) => {
    setContactsFilterStatus(status);
  };

  const handleContactsPerPageChange = (value: string) => {
    const newPerPage = value === "all" ? "all" : parseInt(value);
    setContactsPerPage(newPerPage);
  };

  // Handler functions for challenges tab
  const handleChallengesStatusFilter = (status: string) => {
    setChallengesFilterStatus(status);
  };

  const handleChallengesPerPageChange = (value: string) => {
    const newPerPage = value === "all" ? "all" : parseInt(value);
    setChallengesPerPage(newPerPage);
  };

  // Handler functions for badges tab
  const handleBadgesStatusFilter = (status: string) => {
    setBadgesFilterStatus(status);
  };

  const handleBadgesPerPageChange = (value: string) => {
    const newPerPage = value === "all" ? "all" : parseInt(value);
    setBadgesPerPage(newPerPage);
  };

  // Handler functions for categories tab
  const handleCategoriesStatusFilter = (status: string) => {
    setCategoriesFilterStatus(status);
  };

  const handleCategoriesPerPageChange = (value: string) => {
    const newPerPage = value === "all" ? "all" : parseInt(value);
    setCategoriesPerPage(newPerPage);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case "blocked":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Archived Data
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage all deleted data across the platform
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={() => {
              switch (activeTab) {
                case "users":
                  handleExportArchivedUsers();
                  break;
                case "stories":
                  handleExportArchivedStories();
                  break;
                case "contacts":
                  handleExportArchivedContacts();
                  break;
                case "challenges":
                  handleExportArchivedChallenges();
                  break;
                case "badges":
                  handleExportArchivedBadges();
                  break;
                case "categories":
                  handleExportArchivedCategories();
                  break;
                default:
                  break;
              }
            }} 
            size="sm" 
            disabled={exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Users</p>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.users.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Stories</p>
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.stories.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Contacts</p>
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.contacts.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Challenges</p>
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.challenges.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Badges</p>
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.badges.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Categories</p>
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.categories.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <TabsList className="grid w-full grid-cols-6 gap-1 sm:gap-2 min-w-max sm:min-w-0">
            <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Stories</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Badges</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Archived Users
              </CardTitle>
              <CardDescription>
                View and manage deleted user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters Section */}
              <div className="space-y-4 mb-6">
                {/* First Row: Per-Page, Search Bar */}
                <div className="flex flex-col lg:flex-row gap-3 items-end">
                  {/* Per-Page Selector */}
                  <div className="flex items-center gap-2 lg:w-auto">
                    <Label htmlFor="per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</Label>
                    <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
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
                      placeholder="Search archived users..."
                      loading={searchLoading}
                    />
                  </div>
                </div>

                {/* Second Row: Role Filter and Clear Button */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <Select value={filterRole} onValueChange={handleRoleFilter}>
                      <SelectTrigger className="w-full sm:w-48 h-10">
                        <SelectValue placeholder="Filter by Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(searchQuery || filterRole !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterRole('all');
                        loadArchivedUsers(1, '', 'all', false);
                      }}
                      className="whitespace-nowrap self-end sm:self-auto"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>

              {loading ? (
                <LoadingState message="Loading archived users..." />
              ) : !Array.isArray(archivedUsers) || archivedUsers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={placeholder?.title || (searchQuery || filterRole !== 'all' ? 'No archived users found' : 'No Archived Users')}
                  description={
                    placeholder?.message || (
                      searchQuery || filterRole !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'There are no deleted users to display'
                    )
                  }
                  action={
                    searchQuery || filterRole !== 'all'
                      ? {
                          label: 'Clear filters',
                          onClick: () => {
                            setSearchQuery('');
                            setFilterRole('all');
                            loadArchivedUsers(1, '', 'all', false);
                          },
                        }
                      : undefined
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">User</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                            <TableHead className="text-xs sm:text-sm">Role</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Created</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Deleted At</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Deleted By</TableHead>
                            <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {Array.isArray(archivedUsers) && archivedUsers.map((user) => {
                          const displayName = user.full_name || user.nickname;
                          const avatarSource = getAvatarSource(user);
                          
                          return (
                            <TableRow key={user.id}>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  {avatarSource ? (
                                    <img
                                      src={avatarSource}
                                      alt={displayName}
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${avatarSource ? 'hidden' : ''}`}>
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-xs sm:text-sm truncate">{displayName}</div>
                                    <div className="text-xs text-gray-500 truncate">@{user.nickname}</div>
                                    <div className="text-xs text-gray-500 sm:hidden mt-1 truncate">{user.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{user.email}</TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <Badge variant="outline" className="text-xs">{user.role}</Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                                {getStatusBadge(user.is_block === 1 ? "Blocked" : user.account_status || "Active")}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{formatDate(user.created_at)}</TableCell>
                              <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{formatDate(user.updated_at)}</TableCell>
                              <TableCell className="text-xs sm:text-sm hidden xl:table-cell">{user.deleted_by || 'System'}</TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreItem("users", user.id)}
                                    disabled={restoring[`users-${user.id}`]}
                                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                                  >
                                    {restoring[`users-${user.id}`] ? (
                                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                                    )}
                                    <span className="hidden sm:inline ml-1">Restore</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => permanentDelete("users", user.id)}
                                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline ml-1">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {Array.isArray(archivedUsers) && archivedUsers.length > 0 && pagination.lastPage > 1 && (
                    <AdminPagination
                      currentPage={pagination.currentPage}
                      lastPage={pagination.lastPage}
                      total={pagination.total}
                      perPage={pagination.perPage}
                      onPageChange={handlePageChange}
                      loading={searchLoading}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Archived Stories
              </CardTitle>
              <CardDescription>
                View and manage deleted ripple stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="stories-search" className="text-sm font-medium mb-2 block">
                      Search Stories
                    </Label>
                    <SearchBar
                      placeholder="Search stories by title, description, or user..."
                      value={storiesSearchQuery}
                      onChange={setStoriesSearchQuery}
                      loading={searchLoading}
                    />
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-40">
                      <Label htmlFor="stories-status-filter" className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select value={storiesFilterStatus} onValueChange={handleStoriesStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor="stories-per-page" className="text-sm font-medium mb-2 block">
                        Per Page
                      </Label>
                      <Select value={storiesPerPage.toString()} onValueChange={handleStoriesPerPageChange}>
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingState message="Loading archived stories..." />
              ) : archivedStories.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Archived Stories"
                  description="There are no deleted stories to display"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Performed At</TableHead>
                          <TableHead>Deleted At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedStories.map((story) => (
                        <TableRow key={story.id}>
                          <TableCell className="font-medium">{story.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{story.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                                {story.user.nickname.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{story.user.full_name || story.user.nickname}</div>
                                <div className="text-sm text-gray-500">@{story.user.nickname}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {story.category ? (
                              <Badge variant="outline">
                                {story.category.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline">{story.action_type}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(story.status)}
                          </TableCell>
                          <TableCell>{formatDate(story.performed_at)}</TableCell>
                          <TableCell>{formatDate(story.updated_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreItem("stories", story.id)}
                                disabled={restoring[`stories-${story.id}`]}
                              >
                                {restoring[`stories-${story.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => permanentDelete("stories", story.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Archived Contact Enquiries
              </CardTitle>
              <CardDescription>
                View and manage deleted contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="contacts-search" className="text-sm font-medium mb-2 block">
                      Search Contacts
                    </Label>
                    <SearchBar
                      placeholder="Search contacts by name, email, or subject..."
                      value={contactsSearchQuery}
                      onChange={setContactsSearchQuery}
                      loading={searchLoading}
                    />
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-40">
                      <Label htmlFor="contacts-status-filter" className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select value={contactsFilterStatus} onValueChange={handleContactsStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor="contacts-per-page" className="text-sm font-medium mb-2 block">
                        Per Page
                      </Label>
                      <Select value={contactsPerPage.toString()} onValueChange={handleContactsPerPageChange}>
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingState message="Loading archived contacts..." />
              ) : archivedContacts.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No Archived Contacts"
                  description="There are no deleted contact enquiries to display"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deleted At</TableHead>
                        <TableHead>Deleted By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.id}</TableCell>
                          <TableCell>{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell className="max-w-xs truncate">{contact.subject}</TableCell>
                          <TableCell>
                            {getStatusBadge(contact.status)}
                          </TableCell>
                          <TableCell>{formatDate(contact.deleted_at)}</TableCell>
                          <TableCell>{contact.deleted_by}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreItem("contacts", contact.id)}
                                disabled={restoring[`contacts-${contact.id}`]}
                              >
                                {restoring[`contacts-${contact.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => permanentDelete("contacts", contact.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Archived Challenges
              </CardTitle>
              <CardDescription>
                View and manage deleted challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="challenges-search" className="text-sm font-medium mb-2 block">
                      Search Challenges
                    </Label>
                    <SearchBar
                      placeholder="Search challenges by name or description..."
                      value={challengesSearchQuery}
                      onChange={setChallengesSearchQuery}
                      loading={searchLoading}
                    />
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-40">
                      <Label htmlFor="challenges-status-filter" className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select value={challengesFilterStatus} onValueChange={handleChallengesStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor="challenges-per-page" className="text-sm font-medium mb-2 block">
                        Per Page
                      </Label>
                      <Select value={challengesPerPage.toString()} onValueChange={handleChallengesPerPageChange}>
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingState message="Loading archived challenges..." />
              ) : archivedChallenges.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No Archived Challenges"
                  description="There are no deleted challenges to display"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Badge Criteria</TableHead>
                          <TableHead>Deleted At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedChallenges.map((challenge) => (
                        <TableRow key={challenge.id}>
                          <TableCell className="font-medium">{challenge.id}</TableCell>
                          <TableCell>{challenge.name}</TableCell>
                          <TableCell>{formatDate(challenge.start_date)}</TableCell>
                          <TableCell>{formatDate(challenge.end_date)}</TableCell>
                          <TableCell>
                            {getStatusBadge(challenge.status)}
                          </TableCell>
                          <TableCell>
                            {challenge.badge_criteria ? (
                              <span className="text-sm text-gray-600">{challenge.badge_criteria}</span>
                            ) : (
                              <span className="text-sm text-gray-400">No criteria</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(challenge.updated_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreItem("challenges", challenge.id)}
                                disabled={restoring[`challenges-${challenge.id}`]}
                              >
                                {restoring[`challenges-${challenge.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => permanentDelete("challenges", challenge.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Archived Badges
              </CardTitle>
              <CardDescription>
                View and manage deleted badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="badges-search" className="text-sm font-medium mb-2 block">
                      Search Badges
                    </Label>
                    <SearchBar
                      placeholder="Search badges by name or description..."
                      value={badgesSearchQuery}
                      onChange={setBadgesSearchQuery}
                      loading={searchLoading}
                    />
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-40">
                      <Label htmlFor="badges-status-filter" className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select value={badgesFilterStatus} onValueChange={handleBadgesStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="deleted">Deleted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor="badges-per-page" className="text-sm font-medium mb-2 block">
                        Per Page
                      </Label>
                      <Select value={badgesPerPage.toString()} onValueChange={handleBadgesPerPageChange}>
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingState message="Loading archived badges..." />
              ) : archivedBadges.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No Archived Badges"
                  description="There are no deleted badges to display"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Criteria</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Display Order</TableHead>
                          <TableHead>Deleted At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedBadges.map((badge) => (
                        <TableRow key={badge.id}>
                          <TableCell className="font-medium">{badge.id}</TableCell>
                          <TableCell>{badge.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{badge.points} pts</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{badge.criteria_text}</TableCell>
                          <TableCell>
                            {getStatusBadge(badge.is_active ? "Active" : "Inactive")}
                          </TableCell>
                          <TableCell>{badge.display_order}</TableCell>
                          <TableCell>{formatDate(badge.updated_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreItem("badges", badge.id)}
                                disabled={restoring[`badges-${badge.id}`]}
                              >
                                {restoring[`badges-${badge.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => permanentDelete("badges", badge.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Archived Categories
              </CardTitle>
              <CardDescription>
                View and manage deleted ripple categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="categories-search" className="text-sm font-medium mb-2 block">
                      Search Categories
                    </Label>
                    <SearchBar
                      placeholder="Search categories by name, code, or description..."
                      value={categoriesSearchQuery}
                      onChange={setCategoriesSearchQuery}
                      loading={searchLoading}
                    />
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-40">
                      <Label htmlFor="categories-status-filter" className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select value={categoriesFilterStatus} onValueChange={handleCategoriesStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="deleted">Deleted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor="categories-per-page" className="text-sm font-medium mb-2 block">
                        Per Page
                      </Label>
                      <Select value={categoriesPerPage.toString()} onValueChange={handleCategoriesPerPageChange}>
                        <SelectTrigger className="w-full">
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
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingState message="Loading archived categories..." />
              ) : archivedCategories.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Archived Categories"
                  description="There are no deleted categories to display"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Icon</TableHead>
                          <TableHead>Ripple Count</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Deleted At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.id}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>
                            <span className="text-lg"><img src={getImageUrl(category.icon)} alt={category.name} className="w-5 h-5" /></span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{category.ripple_count}</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(category.is_active ? "Active" : "Inactive")}
                          </TableCell>
                          <TableCell>{formatDate(category.updated_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreItem("categories", category.id)}
                                disabled={restoring[`categories-${category.id}`]}
                              >
                                {restoring[`categories-${category.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => permanentDelete("categories", category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Archived;
