import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Award,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Calendar,
  CreditCard,
  Search,
  Grid, List, Image, X, GripVertical, Sparkles, Clock, CalendarDays, Repeat, ArrowRight, Info, Star,
  Heart, Flame, BookOpen, Handshake, CheckCircle2, ShieldCheck, Eye, EyeOff, Hash, Menu
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiFetchFormData } from "@/config/api";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { getImageUrl } from "@/utils/imageUrl";
import { formatDateForInput } from "@/utils/dateFormat";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// ======================
// TYPES - NEW GAMIFICATION FLOW
// ======================

interface CardItem {
  id: number;
  name: string;
  card_type: "daily" | "weekly" | "monthly" | "ripple";
  badge_id?: number;
  icon_path?: string | null;
  badge?: { id: number; name: string };
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  badge_category: string;
  max_tier: number;
  is_active: boolean;
  icon_path?: string | null;
  display_order?: number;
  created_at: string;
}

interface ChallengeAction {
  id?: number;
  title: string;
  description: string;
  order: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "archived" | "upcoming" | "completed";
  challenge_type: "daily" | "weekly" | "monthly" | "ripple";
  card_id?: number | string;
  badge_id?: number | string;
  age_group?: string;
  participants?: number;
  image_path?: string | null;
  created_at: string;
  updated_at: string;
  actions?: ChallengeAction[];
  target_value: number;
  reward_points?: number;
  target_metric?: string;
  badge_criteria?: string;
  is_public_before_live?: boolean;
  is_deleted?: boolean;
  card?: CardItem;
  badge?: BadgeItem;
}

interface ChallengeFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  challenge_type: "daily" | "weekly" | "monthly" | "ripple";
  card_id: string;
  badge_id: string;
  age_group: string;
  status: "draft" | "active" | "archived" | "upcoming" | "completed";
  is_public_before_live: boolean;
  image?: File | null;
  actions: ChallengeAction[];
  target_value: number;
  reward_points: number;
  target_metric: string;
  badge_criteria: string;
}

type ChallengeStatus = "draft" | "active" | "archived";

interface ChallengeFilters {
  search: string;
  status: string;
  type: string;
  date_from: string;
  date_to: string;
}

// Challenge Type Configuration - NEW FLOW
const CHALLENGE_TYPES = {
  daily: {
    label: "Daily",
    icon: Sparkles,
    description: "Resets every 24 hours",
    color: "bg-blue-100 text-blue-800",
  },
  weekly: {
    label: "Weekly",
    icon: Clock,
    description: "Resets every 7 days",
    color: "bg-green-100 text-green-800",
  },
  monthly: {
    label: "Monthly",
    icon: CalendarDays,
    description: "Resets every 30 days",
    color: "bg-purple-100 text-purple-800",
  },
  ripple: {
    label: "Ripple",
    icon: Repeat,
    description: "Multi-step challenge",
    color: "bg-orange-100 text-orange-800",
  },
};

// Metric Configuration for pretty display
const METRIC_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  kindness_count: { label: "Kindness Acts", icon: Heart, color: "text-rose-400", bgColor: "bg-rose-500/10" },
  stories_created: { label: "Stories Shared", icon: BookOpen, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  login_streak: { label: "Day Streak", icon: Flame, color: "text-orange-400", bgColor: "bg-orange-500/10" },
  helping_hands_count: { label: "Helping Hands", icon: Handshake, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  actions_completed: { label: "Missions", icon: CheckCircle2, color: "text-amber-400", bgColor: "bg-amber-500/10" },
  ripple_actions_count: { label: "Ripple Actions", icon: Sparkles, color: "text-purple-400", bgColor: "bg-purple-500/10" },
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "upcoming", label: "Upcoming", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "draft", label: "Draft", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "completed", label: "Completed", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { value: "archived", label: "Archived", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
];

// ======================
// MAIN COMPONENT
// ======================

export default function RewardChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showEditChallengeDialog, setShowEditChallengeDialog] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
    from: 0,
    to: 0
  });

  const [filters, setFilters] = useState<ChallengeFilters>({
    search: "",
    status: "all",
    type: "all",
    date_from: "",
    date_to: ""
  });

  const [challengeForm, setChallengeForm] = useState<ChallengeFormData>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    challenge_type: "daily",
    card_id: "",
    badge_id: "",
    age_group: "",
    status: "draft",
    is_public_before_live: false,
    image: null,
    actions: [],
    target_value: 1,
    reward_points: 100,
    target_metric: "ripple_actions_count",
    badge_criteria: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filters.search, 500);

  // ======================
  // DATA FETCHING
  // ======================

  const loadAll = async () => {
    setLoading(true);
    try {
      const [challengesRes, cardsRes, badgesRes] = await Promise.all([
        apiFetch<{ data: { data: Challenge[], current_page: number, last_page: number, total: number, from: number, to: number } | Challenge[] }>("/admin/challenges"),
        apiFetch<{ data: CardItem[] }>("/admin/cards"),
        apiFetch<{ data: BadgeItem[] }>("/admin/badges"),
      ]);

      const challengesData = challengesRes?.data;
      setChallenges(Array.isArray(challengesData) ? challengesData : (challengesData as { data: Challenge[] })?.data || []);
      setCards(cardsRes?.data || []);
      setBadges(badgesRes?.data || []);

      if (challengesRes?.data && !Array.isArray(challengesRes.data)) {
        const paginatedData = challengesRes.data;
        setPagination(prev => ({
          ...prev,
          currentPage: paginatedData.current_page || 1,
          lastPage: paginatedData.last_page || 1,
          total: paginatedData.total || 0,
          from: paginatedData.from || 0,
          to: paginatedData.to || 0,
        }));
      }
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast({
        title: "Error",
        description: e?.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = useCallback(async (page: number = 1) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.perPage.toString(),
      });

      if (filters.search) params.append('q', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await apiFetch<{ success: boolean; data: { data: Challenge[], current_page: number, last_page: number, total: number, from: number, to: number } }>(`/admin/challenges?${params.toString()}`);

      if (response.success && response.data) {
        setChallenges(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.current_page || 1,
          lastPage: response.data.last_page || 1,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0,
        }));
      }
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast({
        title: "Error",
        description: e?.message || "Failed to load challenges",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  }, [filters, pagination.perPage]);

  // ======================
  // FORM HANDLERS
  // ======================

  const resetChallengeForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setChallengeForm({
      name: "",
      description: "",
      start_date: today,
      end_date: nextWeek,
      challenge_type: "daily",
      card_id: "",
      badge_id: "",
      age_group: "",
      status: "draft",
      is_public_before_live: false,
      image: null,
      actions: [],
      target_value: 1,
      reward_points: 100,
      target_metric: "ripple_actions_count",
      badge_criteria: "",
    });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChallengeForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setChallengeForm(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  // ======================
  // RIPPLE ACTIONS HANDLERS
  // ======================

  const addAction = () => {
    setChallengeForm(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          title: "",
          description: "",
          order: prev.actions.length + 1,
        }
      ]
    }));
  };

  const updateAction = (index: number, field: keyof ChallengeAction, value: string | number) => {
    setChallengeForm(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setChallengeForm(prev => ({
      ...prev,
      actions: prev.actions
        .filter((_, i) => i !== index)
        .map((action, i) => ({ ...action, order: i + 1 }))
    }));
  };

  // ======================
  // CRUD OPERATIONS
  // ======================

  const createChallenge = async () => {
    if (!challengeForm.name || !challengeForm.description) {
      toast({
        title: "Validation error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    if (challengeForm.challenge_type === "ripple" && challengeForm.actions.length === 0) {
      toast({
        title: "Validation error",
        description: "Ripple challenges require at least one action",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', challengeForm.name);
      formData.append('description', challengeForm.description);
      formData.append('start_date', challengeForm.start_date);
      formData.append('end_date', challengeForm.end_date);
      formData.append('challenge_type', challengeForm.challenge_type);
      formData.append('status', challengeForm.status);
      formData.append('is_public_before_live', challengeForm.is_public_before_live ? '1' : '0');

      if (challengeForm.card_id) formData.append('card_id', challengeForm.card_id);
      if (challengeForm.badge_id) formData.append('badge_id', challengeForm.badge_id);
      if (challengeForm.age_group) formData.append('age_group', challengeForm.age_group);
      if (challengeForm.image) formData.append('image', challengeForm.image);
      formData.append('target_value', challengeForm.target_value.toString());
      formData.append('reward_points', challengeForm.reward_points.toString());
      formData.append('target_metric', challengeForm.challenge_type === 'ripple' ? 'actions_completed' : challengeForm.target_metric);

      // Create challenge
      const response = await apiFetchFormData<{ success: boolean; message?: string; data?: { id: string } }>("/admin/challenges", {
        method: "POST",
        body: formData,
      });

      if (response.success) {
        // If ripple challenge, add actions
        if (challengeForm.challenge_type === "ripple" && challengeForm.actions.length > 0) {
          const challengeId = response.data?.id;
          for (const action of challengeForm.actions) {
            await apiFetch<{ success: boolean }>(`/admin/challenges/${challengeId}/actions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(action),
            });
          }
        }

        setShowChallengeDialog(false);
        resetChallengeForm();
        loadChallenges(1);
        toast({ title: "Challenge created successfully!" });
      } else {
        throw new Error(response.message || "Failed to create challenge");
      }
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast({
        title: "Error",
        description: e?.message || "Failed to create challenge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChallenge = async () => {
    if (!editingChallenge || !challengeForm.name || !challengeForm.description) {
      toast({
        title: "Validation error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', challengeForm.name);
      formData.append('description', challengeForm.description);
      formData.append('start_date', challengeForm.start_date);
      formData.append('end_date', challengeForm.end_date);
      formData.append('challenge_type', challengeForm.challenge_type);
      formData.append('status', challengeForm.status);
      formData.append('is_public_before_live', challengeForm.is_public_before_live ? '1' : '0');
      formData.append('_method', 'PUT');

      if (challengeForm.card_id) formData.append('card_id', challengeForm.card_id);
      if (challengeForm.badge_id) formData.append('badge_id', challengeForm.badge_id);
      if (challengeForm.age_group) formData.append('age_group', challengeForm.age_group);
      if (challengeForm.image) formData.append('image', challengeForm.image);
      formData.append('target_value', challengeForm.target_value.toString());
      formData.append('reward_points', challengeForm.reward_points.toString());
      formData.append('target_metric', challengeForm.challenge_type === 'ripple' ? 'actions_completed' : challengeForm.target_metric);

      const response = await apiFetchFormData<{ success: boolean; message?: string }>(`/admin/update-challenges/${editingChallenge.id}`, {
        method: "POST",
        body: formData,
      });

      if (response.success) {
        setShowEditChallengeDialog(false);
        setEditingChallenge(null);
        resetChallengeForm();
        loadChallenges(pagination.currentPage);
        toast({ title: "Challenge updated successfully!" });
      } else {
        throw new Error(response.message || "Failed to update challenge");
      }
    } catch (error: unknown) {
      const e = error as { message?: string };
      toast({
        title: "Error",
        description: e?.message || "Failed to update challenge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this challenge?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await apiFetch<{ success: boolean; message?: string }>(`/admin/delete-challenges/${challengeId}`, {
        method: "DELETE",
      });

      if (response.success) {
        setChallenges(prev => prev.filter(c => c.id !== challengeId));
        Swal.fire("Deleted!", "Challenge removed successfully.", "success");
      } else {
        throw new Error(response.message || "Failed to delete challenge");
      }
    } catch (error: unknown) {
      const e = error as { message?: string };
      Swal.fire("Error", e?.message || "Failed to delete challenge", "error");
    } finally {
      setLoading(false);
    }
  };

  const editChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setChallengeForm({
      name: challenge.name,
      description: challenge.description,
      start_date: formatDateForInput(challenge.start_date),
      end_date: formatDateForInput(challenge.end_date),
      challenge_type: challenge.challenge_type,
      card_id: challenge.card_id?.toString() || "",
      badge_id: challenge.badge_id?.toString() || "",
      age_group: challenge.age_group || "",
      status: challenge.status,
      is_public_before_live: challenge.is_public_before_live || false,
      image: null,
      actions: challenge.actions || [],
      target_value: challenge.target_value || 1,
      reward_points: challenge.reward_points || 100,
      target_metric: challenge.target_metric || "ripple_actions_count",
      badge_criteria: challenge.badge_criteria || "",
    });
    setImagePreview(challenge.image_path || null);
    setShowEditChallengeDialog(true);
  };

  // ======================
  // HELPERS
  // ======================

  const getTypeBadgeClass = (type: string) => {
    return CHALLENGE_TYPES[type as keyof typeof CHALLENGE_TYPES]?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusBadgeClass = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const handleFilterChange = (key: keyof ChallengeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      type: "all",
      date_from: "",
      date_to: ""
    });
  };

  const filteredCards = useMemo(() => {
    if (!challengeForm.challenge_type) return cards;
    return cards.filter(card => card.card_type === challengeForm.challenge_type);
  }, [cards, challengeForm.challenge_type]);

  const hasActiveFilters = useMemo(() => {
    return filters.search !== "" || filters.status !== "all" || filters.type !== "all" || filters.date_from !== "" || filters.date_to !== "";
  }, [filters]);

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadChallenges(1);
  }, [loadChallenges, debouncedSearch, filters.status, filters.type, filters.date_from, filters.date_to]);

  // ======================
  // RENDER
  // ======================

  if (loading && !searchLoading) {
    return <LoadingState message="Loading challenges..." />;
  }

  // Challenge Form Dialog Content (shared between create and edit)
  const ChallengeFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-8 py-4 px-1">
      {/* Section 1: Basic Identity */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Info className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Basic Information</h3>
        </div>

        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider ml-1">Challenge Type *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(CHALLENGE_TYPES).map(([key, config]) => {
              const IconComponent = config.icon;
              const isActive = challengeForm.challenge_type === key;
              return (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-auto py-4 flex flex-col items-center gap-2 rounded-2xl transition-all",
                    isActive
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setChallengeForm(prev => ({
                    ...prev,
                    challenge_type: key as "daily" | "weekly" | "monthly" | "ripple",
                    card_id: "",
                    actions: key === "ripple" ? prev.actions : [],
                  }))}
                >
                  <IconComponent className={cn("h-6 w-6", isActive ? "text-white" : "text-indigo-400")} />
                  <div className="text-center">
                    <div className="font-bold text-xs uppercase tracking-tight">{config.label}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Challenge Name *</Label>
            <Input
              placeholder="e.g., Kindness Adventurer"
              value={challengeForm.name}
              onChange={(e) => setChallengeForm(prev => ({ ...prev, name: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Target Value *</Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={challengeForm.target_value}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
                className="h-11 rounded-xl pl-10"
              />
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Point Reward *</Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                value={challengeForm.reward_points}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, reward_points: parseInt(e.target.value) || 0 }))}
                className="h-11 rounded-xl pl-10"
              />
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Success Metric *</Label>
            <Select
              value={challengeForm.target_metric}
              onValueChange={(value) => setChallengeForm(prev => ({ ...prev, target_metric: value }))}
              disabled={challengeForm.challenge_type === 'ripple'}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ripple_actions_count">Ripple Actions Count</SelectItem>
                <SelectItem value="login_streak">Login Streak</SelectItem>
                <SelectItem value="helping_hands_count">Helping Hands</SelectItem>
                <SelectItem value="kindness_count">Kindness Acts</SelectItem>
                <SelectItem value="stories_created">Stories Told</SelectItem>
                <SelectItem value="actions_completed">Steps (Ripple Only)</SelectItem>
              </SelectContent>
            </Select>
            {challengeForm.challenge_type === 'ripple' && (
              <p className="text-[10px] text-muted-foreground italic">Locked to 'Steps Completed' for Ripple type</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Badge Award Criteria (Optional)</Label>
            <div className="relative">
              <Input
                placeholder="Describe how users earn the linked badge (e.g., Complete with 100% accuracy)"
                value={challengeForm.badge_criteria}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, badge_criteria: e.target.value }))}
                className="h-11 rounded-xl pl-10"
              />
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider ml-1">Mission Description *</Label>
          <Textarea
            placeholder="What should users do to complete this challenge?"
            value={challengeForm.description}
            onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Section 2: Rewards */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Rewards Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 ml-1">
              <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
              Card Reward
            </Label>
            <Select
              value={challengeForm.card_id}
              onValueChange={(value) => setChallengeForm(prev => ({ ...prev, card_id: value }))}
            >
              <SelectTrigger className="h-14 rounded-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    {challengeForm.card_id && challengeForm.card_id !== "none" ? (
                      (() => {
                        const card = cards.find(c => c.id.toString() === challengeForm.card_id);
                        return card?.icon_path ? (
                          <img src={getImageUrl(card.icon_path)} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : <CreditCard className="h-5 w-5 text-indigo-400" />;
                      })()
                    ) : <X className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <SelectValue placeholder="Choose reward card" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredCards.length === 0 ? (
                  <SelectItem value="none" disabled>No {challengeForm.challenge_type} cards available</SelectItem>
                ) : (
                  filteredCards.map((card) => (
                    <SelectItem key={card.id} value={card.id.toString()} className="py-2.5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {card.icon_path ? (
                            <img src={getImageUrl(card.icon_path)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <CreditCard className="h-6 w-6 opacity-30" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{card.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">{card.card_type} card</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 ml-1">
              <Award className="h-3.5 w-3.5 text-purple-400" />
              Linked Badge (Optional)
            </Label>
            <Select
              value={challengeForm.badge_id || "none"}
              onValueChange={(value) => setChallengeForm(prev => ({ ...prev, badge_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger className="h-14 rounded-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    {challengeForm.badge_id && challengeForm.badge_id !== "none" ? (
                      (() => {
                        const badge = badges.find(b => b.id.toString() === challengeForm.badge_id);
                        return badge?.icon_path ? (
                          <img src={getImageUrl(badge.icon_path)} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : <Award className="h-5 w-5 text-purple-400" />;
                      })()
                    ) : <X className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <SelectValue placeholder="Select optional badge" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="none" className="py-2.5 italic text-muted-foreground">No linked badge</SelectItem>
                {badges.map((badge) => (
                  <SelectItem key={badge.id} value={badge.id.toString()} className="py-2.5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {badge.icon_path ? (
                          <img src={getImageUrl(badge.icon_path)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Award className="h-6 w-6 opacity-30" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{badge.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{badge.badge_category}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 3: Timeline & Media */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Timeline & Media</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Start Date *</Label>
            <Input
              type="date"
              value={challengeForm.start_date}
              onChange={(e) => setChallengeForm(prev => ({ ...prev, start_date: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">End Date *</Label>
            <Input
              type="date"
              value={challengeForm.end_date}
              onChange={(e) => setChallengeForm(prev => ({ ...prev, end_date: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Status *</Label>
            <Select
              value={challengeForm.status}
              onValueChange={(value) => setChallengeForm(prev => ({ ...prev, status: value as ChallengeStatus }))}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-bold", option.color)}>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider ml-1">Challenge Cover Image</Label>
            <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed p-4 hover:bg-muted/50 transition-all">
              {imagePreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id={isEdit ? "edit-challenge-image" : "challenge-image"}
                  />
                  <Label
                    htmlFor={isEdit ? "edit-challenge-image" : "challenge-image"}
                    className="cursor-pointer flex flex-col items-center justify-center py-6 gap-3"
                  >
                    <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Image className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">Upload Graphics</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PNG, JPG or WEBP (Max 10MB)</p>
                    </div>
                  </Label>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider ml-1">Target Group</Label>
              <Input
                placeholder="e.g., Everyone, Students, Kids"
                value={challengeForm.age_group}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, age_group: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="p-4 rounded-2xl border space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-users" className="text-xs font-bold uppercase tracking-wider">Public Countdown</Label>
                <input
                  type="checkbox"
                  id="notify-users"
                  checked={challengeForm.is_public_before_live}
                  onChange={e => setChallengeForm(prev => ({ ...prev, is_public_before_live: e.target.checked }))}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                When enabled, users can view this challenge and join it before it becomes officially active. A mission countdown will be displayed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Ripple Actions (Sequential Steps) */}
      {challengeForm.challenge_type === "ripple" && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Repeat className="h-4 w-4 text-orange-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Sequential Actions</h3>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addAction}
              className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg px-3 py-1.5 h-auto text-[10px] font-bold uppercase tracking-wider gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Add Mission
            </Button>
          </div>

          <div className="space-y-4">
            {challengeForm.actions.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed">
                <Repeat className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Missions Defined</p>
                <p className="text-[10px] text-muted-foreground mt-1">Ripple challenges require at least one sequential step.</p>
              </div>
            ) : (
              challengeForm.actions.map((action, index) => (
                <div key={index} className="group flex gap-4 hover:bg-muted/50 p-4 rounded-2xl border transition-all">
                  <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
                    <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 w-0.5 bg-border group-last:bg-transparent rounded-full" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Mission Title (e.g., Share a Smile)"
                      value={action.title}
                      onChange={(e) => updateAction(index, 'title', e.target.value)}
                      className="rounded-xl h-10 font-bold"
                    />
                    <Textarea
                      placeholder="Specific instructions for this step..."
                      value={action.description}
                      onChange={(e) => updateAction(index, 'description', e.target.value)}
                      rows={2}
                      className="rounded-xl text-xs py-2"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-xl hover:text-red-400 hover:bg-red-400/10 shrink-0 self-start mt-0"
                    onClick={() => removeAction(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Challenge Management
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Design and deploy engaging kindness challenges. Reward your community with premium digital cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-3 items-center mr-2">
            <div className="h-10 w-10 rounded-full bg-indigo-500/20 border-2 border-background flex items-center justify-center backdrop-blur-xl shadow-xl">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-500/20 border-2 border-background flex items-center justify-center backdrop-blur-xl shadow-xl">
              <Trophy className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="flex flex-col items-end mr-4">
            <span className="text-2xl font-bold text-white">{challenges.reduce((sum, c) => sum + (c.participants || 0), 0).toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Active Participants</span>
          </div>

          <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />

          <Link to="/admin/reward-cards">
            <Button variant="outline" className="h-11 px-4 bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-xl gap-2 font-medium">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Card Vault</span>
            </Button>
          </Link>

          <Button
            onClick={() => { resetChallengeForm(); setShowChallengeDialog(true); }}
            className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] border-none text-white rounded-xl gap-2 font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Create Challenge
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-4 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Search</Label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  placeholder="Find challenges..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-10 bg-white/5 border-white/10 group-hover:bg-white/10 transition-all rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-xl">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-xl">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(CHALLENGE_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">From Date</Label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors z-10" />
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="pl-10 h-10 bg-white/5 border-white/10 group-hover:bg-white/10 transition-all rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">To Date</Label>
              <div className="relative group">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors z-10" />
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="pl-10 h-10 bg-white/5 border-white/10 group-hover:bg-white/10 transition-all rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 lg:pt-0">
            <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/10">
              <Button
                variant={viewType === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewType("list")}
                className={cn("h-8 w-8 p-0 rounded-lg transition-all", viewType === "list" && "bg-white/10 text-white")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewType("grid")}
                className={cn("h-8 w-8 p-0 rounded-lg transition-all", viewType === "grid" && "bg-white/10 text-white")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground hover:text-white"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 gap-1 sm:gap-2">
          <TabsTrigger onClick={() => handleFilterChange('status', 'all')} value="all">All</TabsTrigger>
          <TabsTrigger onClick={() => handleFilterChange('status', 'active')} value="active">Active</TabsTrigger>
          <TabsTrigger onClick={() => handleFilterChange('status', 'draft')} value="draft">Draft</TabsTrigger>
          <TabsTrigger onClick={() => handleFilterChange('status', 'archived')} value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4 sm:mt-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              {searchLoading && <LoadingState message="Searching challenges..." />}

              {challenges.length === 0 && !searchLoading ? (
                <EmptyState
                  icon={Target}
                  title="No challenges found"
                  description={
                    hasActiveFilters
                      ? "No challenges match your current filters."
                      : "Create your first challenge to get started."
                  }
                  action={
                    hasActiveFilters
                      ? { label: "Clear filters", onClick: clearFilters }
                      : undefined
                  }
                />
              ) : viewType === "list" ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[1200px]">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-white/10 uppercase tracking-widest">
                          <TableHead className="w-[80px] text-[10px] font-bold">ID</TableHead>
                          <TableHead className="text-[10px] font-bold">Challenge Details</TableHead>
                          <TableHead className="text-[10px] font-bold">Type & Scale</TableHead>
                          <TableHead className="text-[10px] font-bold">Requirement</TableHead>
                          <TableHead className="text-[10px] font-bold">Rewards</TableHead>
                          <TableHead className="text-[10px] font-bold">Timeline</TableHead>
                          <TableHead className="text-[10px] font-bold text-center">Visibility</TableHead>
                          <TableHead className="text-[10px] font-bold">Status</TableHead>
                          <TableHead className="text-right text-[10px] font-bold pr-6">Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {challenges.map((challenge) => {
                          const metric = METRIC_CONFIG[challenge.target_metric || ""] || { label: "Actions", icon: Target, color: "text-white", bgColor: "bg-white/5" };
                          return (
                            <TableRow key={challenge.id} className="group border-white/5 hover:bg-white/[0.03] transition-all duration-300">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50">
                                  <Hash className="h-3 w-3" />
                                  <span>{challenge.id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg group-hover:border-indigo-500/50 transition-colors">
                                    {challenge.image_path ? (
                                      <img
                                        src={getImageUrl(challenge.image_path)}
                                        alt={challenge.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-white/20" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{challenge.name}</p>
                                      {challenge.is_public_before_live && (
                                        <Badge variant="outline" className="h-4 px-1 rounded text-[8px] bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase font-black">Teaser</Badge>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">
                                      {challenge.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      {challenge.age_group && (
                                        <div className="flex items-center gap-1 text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                                          <Users className="h-2.5 w-2.5" />
                                          <span>{challenge.age_group}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                                        <Clock className="h-2.5 w-2.5" />
                                        <span>Added {new Date(challenge.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1.5">
                                  <Badge className={cn("w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border-none", getTypeBadgeClass(challenge.challenge_type))}>
                                    {CHALLENGE_TYPES[challenge.challenge_type]?.label || challenge.challenge_type}
                                  </Badge>
                                  {challenge.challenge_type === 'ripple' && challenge.actions && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold bg-orange-400/10 px-1.5 py-0.5 rounded-md w-fit">
                                      <Repeat className="h-3 w-3" />
                                      <span>{challenge.actions.length} Missions</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 w-fit group-hover:bg-white/10 transition-colors">
                                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-inner", metric.bgColor)}>
                                    <metric.icon className={cn("h-4 w-4", metric.color)} />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-sm font-black text-white">{challenge.target_value}</span>
                                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Required</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground uppercase font-medium">{metric.label}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-2 max-w-[200px]">
                                  {challenge.card ? (
                                    <div className="flex items-center gap-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 p-1.5 rounded-lg transition-colors group/card">
                                      <div className="h-7 w-7 rounded bg-slate-900 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                                        {challenge.card.icon_path ? (
                                          <img src={getImageUrl(challenge.card.icon_path)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white leading-tight">{challenge.card.name}</span>
                                        <span className="text-[8px] text-muted-foreground/70 uppercase font-black">Card</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-9 w-9 rounded-lg border border-dashed border-white/10 flex items-center justify-center opacity-30">
                                      <CreditCard className="h-4 w-4" />
                                    </div>
                                  )}

                                  {challenge.badge ? (
                                    <div className="flex items-center gap-2 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 p-1.5 rounded-lg transition-colors">
                                      <div className="h-7 w-7 rounded bg-slate-900 border border-purple-500/20 flex items-center justify-center overflow-hidden">
                                        {challenge.badge.icon_path ? (
                                          <img src={getImageUrl(challenge.badge.icon_path)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <Award className="h-3.5 w-3.5 text-purple-400" />
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white leading-tight">{challenge.badge.name}</span>
                                        <span className="text-[8px] text-muted-foreground/70 uppercase font-black">Badge</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-9 w-9 rounded-lg border border-dashed border-white/10 flex items-center justify-center opacity-30">
                                      <Award className="h-4 w-4" />
                                    </div>
                                  )}

                                  {challenge.reward_points && challenge.reward_points > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                                      <Star className="h-3 w-3 fill-amber-400/20" />
                                      <span className="text-[10px] font-black">{challenge.reward_points}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                      <CalendarDays className="h-3.5 w-3.5 text-indigo-400" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                                        {new Date(challenge.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                      <span className="text-[8px] text-muted-foreground uppercase font-black">Launch</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                      <Clock className="h-3.5 w-3.5 text-rose-400" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                                        {Math.ceil((new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime()) / (1000 * 60 * 60 * 24))} Days
                                      </span>
                                      <span className="text-[8px] text-muted-foreground uppercase font-black">Expiring</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  {challenge.is_deleted ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className="h-8 w-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                            <Trash2 className="h-4 w-4 text-rose-400" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Soft Deleted</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : challenge.status === 'draft' ? (
                                    <div className="h-8 w-8 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center" title="Private Draft">
                                      <EyeOff className="h-4 w-4 text-slate-400" />
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center" title="Publicly Visible">
                                      <Eye className="h-4 w-4 text-emerald-400" />
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm", getStatusBadgeClass(challenge.status))}>
                                  {challenge.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end pr-2 gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                      <span className="text-xs font-black text-white">{challenge.participants || 0}</span>
                                      <span className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">Engaged</span>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all bg-white/5 border border-white/5">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white shadow-2xl p-2 min-w-[160px]">
                                        <div className="px-2 py-1.5 mb-1 pb-2 border-b border-white/5">
                                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Management</p>
                                        </div>
                                        <DropdownMenuItem onClick={() => editChallenge(challenge)} className="focus:bg-white/10 cursor-pointer rounded-lg py-2">
                                          <Edit className="h-4 w-4 mr-2 text-indigo-400" /> Edit Specs
                                        </DropdownMenuItem>
                                        {challenge.badge_criteria && (
                                          <DropdownMenuItem className="focus:bg-white/10 cursor-pointer rounded-lg py-2">
                                            <ShieldCheck className="h-4 w-4 mr-2 text-emerald-400" /> View Criteria
                                          </DropdownMenuItem>
                                        )}
                                        <div className="h-px bg-white/5 my-1" />
                                        <DropdownMenuItem
                                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg py-2"
                                          onClick={() => deleteChallenge(challenge.id)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" /> {challenge.is_deleted ? 'Purge Data' : 'Retire Mission'}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="h-1 w-20 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" style={{ width: `${Math.min(100, ((challenge.participants || 0) / 100) * 100)}%` }}></div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {pagination.lastPage > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={pagination.currentPage}
                        lastPage={pagination.lastPage}
                        total={pagination.total}
                        perPage={pagination.perPage}
                        onPageChange={loadChallenges}
                        loading={searchLoading}
                      />
                    </div>
                  )}
                </>
              ) : (
                // Grid View - Premium Challenge Cards
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {challenges.map((challenge) => {
                    const metric = METRIC_CONFIG[challenge.target_metric || ""] || { label: "Actions", icon: Target, color: "text-white", bgColor: "bg-white/5" };
                    return (
                      <div key={challenge.id} className="group relative">
                        {/* Improved ID Badge */}
                        <div className="absolute -top-3 -left-3 z-30 px-3 py-1 bg-slate-900 border border-white/10 rounded-lg shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center gap-1.5">
                            <Hash className="h-3 w-3 text-indigo-400" />
                            <span className="text-[10px] font-mono font-bold text-white">{challenge.id}</span>
                          </div>
                        </div>

                        {/* Floating Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                        <Card className="relative h-full overflow-hidden bg-white/[0.03] backdrop-blur-2xl border-white/10 rounded-[2rem] flex flex-col transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                          {/* Image / Header Section */}
                          <div className="relative h-56 overflow-hidden">
                            {challenge.image_path ? (
                              <img
                                src={getImageUrl(challenge.image_path)}
                                alt={challenge.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-115"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/40 flex items-center justify-center p-12">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150"></div>
                                  <Trophy className="h-20 w-20 text-white/10 relative" />
                                </div>
                              </div>
                            )}

                            {/* Top Overlays */}
                            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                              <div className="flex items-center gap-2">
                                <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/10 shadow-lg", getTypeBadgeClass(challenge.challenge_type))}>
                                  {CHALLENGE_TYPES[challenge.challenge_type]?.label || challenge.challenge_type}
                                </Badge>
                                {challenge.is_public_before_live && (
                                  <div className="h-7 px-2.5 rounded-full bg-amber-500/90 backdrop-blur-xl border border-amber-400/50 flex items-center gap-1.5 shadow-lg animate-pulse" title="Public Teaser / Countdown Active">
                                    <Clock className="h-3 w-3 text-amber-950" />
                                    <span className="text-[9px] font-black text-amber-950 uppercase tracking-tighter">Live Teaser</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {challenge.is_deleted && (
                                  <Badge variant="destructive" className="h-8 px-2 rounded-lg bg-rose-500 font-bold uppercase text-[9px]">Deleted</Badge>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110">
                                      <Menu className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white p-2">
                                    <DropdownMenuItem onClick={() => editChallenge(challenge)} className="rounded-lg">
                                      <Edit className="h-4 w-4 mr-2 text-indigo-400" /> Edit Detail
                                    </DropdownMenuItem>
                                    {challenge.badge_criteria && (
                                      <DropdownMenuItem className="rounded-lg">
                                        <Info className="h-4 w-4 mr-2 text-emerald-400" /> Criteria
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem
                                      className="text-red-400 focus:text-red-400 rounded-lg"
                                      onClick={() => deleteChallenge(challenge.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Status Bottom Overlay */}
                            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/60 to-transparent">
                              <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-indigo-400" />
                                    <span className="text-sm font-black text-white tracking-widest uppercase shadow-sm">
                                      {challenge.participants || 0}
                                    </span>
                                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">Participants</span>
                                  </div>
                                  <div className="h-1 w-24 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '40%' }}></div>
                                  </div>
                                </div>
                                <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xl", getStatusBadgeClass(challenge.status))}>
                                  {challenge.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Content Section */}
                          <CardContent className="p-6 flex-1 flex flex-col gap-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="text-xl font-black text-white leading-tight group-hover:text-indigo-400 transition-colors flex-1 line-clamp-2">
                                  {challenge.name}
                                </h3>
                                {challenge.challenge_type === 'ripple' && challenge.actions && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-black bg-orange-400/10 px-2.5 py-1 rounded-full shrink-0 border border-orange-400/20">
                                    <Repeat className="h-3.5 w-3.5" />
                                    <span>{challenge.actions.length}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 min-h-[40px]">
                                {challenge.description}
                              </p>

                              <div className="flex flex-wrap gap-2 pt-1">
                                {challenge.age_group && (
                                  <div className="flex items-center gap-2 text-[9px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                    <Users className="h-3 w-3" />
                                    <span>{challenge.age_group}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                                  <Clock className="h-3 w-3" />
                                  <span>{Math.ceil((new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime()) / (1000 * 60 * 60 * 24))} Days</span>
                                </div>
                              </div>
                            </div>

                            {/* Target & Rewards Section */}
                            <div className="mt-auto space-y-4 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 group-hover:bg-white/10 transition-colors">
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner", metric.bgColor)}>
                                  <metric.icon className={cn("h-6 w-6", metric.color)} />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-black text-white">{challenge.target_value}</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{metric.label}</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Mission Requirement</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] ml-1">Unlock Rewards</p>
                                <div className="grid grid-cols-2 gap-3">
                                  {challenge.card ? (
                                    <div className="flex flex-col gap-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 p-3 rounded-2xl transition-all group/rew shadow-sm">
                                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-indigo-500/20 flex items-center justify-center overflow-hidden shadow-inner group-hover/rew:scale-110 transition-transform">
                                        {challenge.card.icon_path ? (
                                          <img src={getImageUrl(challenge.card.icon_path)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <CreditCard className="h-5 w-5 text-indigo-400" />
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black text-white truncate">{challenge.card.name}</span>
                                        <span className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">{challenge.card.card_type} Card</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-white/10 opacity-20 grayscale">
                                      <CreditCard className="h-6 w-6" />
                                      <span className="text-[8px] font-black uppercase">No Card</span>
                                    </div>
                                  )}

                                  {challenge.badge ? (
                                    <div className="flex flex-col gap-2 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 p-3 rounded-2xl transition-all group/rew shadow-sm">
                                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-purple-500/20 flex items-center justify-center overflow-hidden shadow-inner group-hover/rew:scale-110 transition-transform">
                                        {challenge.badge.icon_path ? (
                                          <img src={getImageUrl(challenge.badge.icon_path)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <Award className="h-5 w-5 text-purple-400" />
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black text-white truncate">{challenge.badge.name}</span>
                                        <span className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">Epic Badge</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-white/10 opacity-20 grayscale">
                                      <Award className="h-6 w-6" />
                                      <span className="text-[8px] font-black uppercase">No Badge</span>
                                    </div>
                                  )}
                                </div>
                                {challenge.reward_points && challenge.reward_points > 0 && (
                                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shadow-sm">
                                    <Star className="h-4 w-4 fill-amber-400 animate-pulse" />
                                    <span className="text-xs font-black tracking-widest">{challenge.reward_points} REWARD POINTS</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Footer Date Tracker */}
                            <div className="mt-2 pt-4 flex items-center justify-between text-[10px] font-black text-muted-foreground border-t border-white/5 uppercase tracking-widest">
                              <div className="flex flex-col">
                                <span className="text-[8px] opacity-50 mb-0.5">Start</span>
                                <div className="flex items-center gap-1.5 text-white/80">
                                  <CalendarDays className="h-3 w-3 text-indigo-400" />
                                  <span>{new Date(challenge.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                              <div className="h-8 w-[1px] bg-white/5" />
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] opacity-50 mb-0.5">Created</span>
                                <span className="text-white/60 font-mono">{new Date(challenge.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Challenge Dialog */}
      <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Create New Challenge
            </DialogTitle>
          </DialogHeader>
          <ChallengeFormContent />
          <Button
            className="w-full mt-4"
            onClick={createChallenge}
            disabled={loading}
            size="lg"
          >
            {loading ? "Creating..." : "Create Challenge"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit Challenge Dialog */}
      <Dialog open={showEditChallengeDialog} onOpenChange={setShowEditChallengeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Challenge
            </DialogTitle>
          </DialogHeader>
          <ChallengeFormContent isEdit />
          <Button
            className="w-full mt-4"
            onClick={updateChallenge}
            disabled={loading}
            size="lg"
          >
            {loading ? "Updating..." : "Update Challenge"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}