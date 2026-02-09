import { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Ban,
  CheckCircle,
  Loader2,
  Search as SearchIcon,
  Filter,
  Eye,
  ImageIcon,
  Upload,
  Users,
  UserCheck,
  UserX,
  Smile,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData, UPLOAD_BASE_URL } from '@/config/api';
import { showConfirmationDialog, showWarningDialog } from '@/components/ui/confirmation-dialog';
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

// ✅ Admin Shared Components
import { PageHeader } from '@/components/admin/PageHeader';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { SearchBar } from '@/components/admin/SearchBar';
import { ViewToggle } from '@/components/admin/ViewToggle';
import { DataCard } from '@/components/admin/DataCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import { LoadingOverlay } from '@/components/admin/LoadingOverlay';
import { Pagination } from '@/components/admin/Pagination';

// ✅ Shared Hooks
import { useDebounce } from '@/hooks/useDebounce';

interface Avatar {
  id: number;
  name: string;
  emoji: string;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Avatar Image Component with Error Handling
const AvatarImage = ({ avatar, imageUrl }: { avatar: Avatar; imageUrl: string }) => {
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset error state when imageUrl changes
  useEffect(() => {
    setHasError(false);
    setImageLoaded(false);

    // Preload image to check if it exists
    if (imageUrl && imageUrl.trim() !== '') {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('❌ Image failed to preload:', imageUrl);
        setHasError(true);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // If no URL or error occurred, show emoji fallback only
  if (!imageUrl || imageUrl.trim() === '' || hasError) {
    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl border-2 border-border flex-shrink-0">
        {avatar.emoji || '😊'}
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      {/* Emoji fallback - shown while image is loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl border-2 border-border" style={{ zIndex: 1 }}>
          {avatar.emoji || '😊'}
        </div>
      )}

      {/* Image - always render, but control visibility */}
      <img
        src={imageUrl}
        alt={avatar.name}
        className="w-20 h-20 rounded-full object-cover border-2 border-border"
        style={{
          position: 'relative',
          zIndex: 2,
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onError={(e) => {
          console.error('❌ Avatar image failed to load:', {
            avatarName: avatar.name,
            avatarId: avatar.id,
            imageUrl: imageUrl,
            error: e
          });
          setHasError(true);
          setImageLoaded(false);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
    </div>
  );
};

export default function AvatarManagement() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newAvatar, setNewAvatar] = useState<Partial<Avatar>>({
    name: '',
    emoji: '😊',
    image_url: null,
    image_path: null,
    is_active: true,
    display_order: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewType, setViewType] = useState<"list" | "grid">("grid");
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(100);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const editEmojiPickerRef = useRef<HTMLDivElement>(null);

  // ✅ Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchAvatars();
  }, []);

  useEffect(() => {
    filterAndSortAvatars();
  }, [avatars, debouncedSearchQuery, filterStatus, sortBy]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (editEmojiPickerRef.current && !editEmojiPickerRef.current.contains(event.target as Node)) {
        setShowEditEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiSelect = (emoji: any) => {
    setNewAvatar({ ...newAvatar, emoji: emoji.native });
    setShowEmojiPicker(false);
  };

  const handleEditEmojiSelect = (emoji: any) => {
    if (selectedAvatar) {
      setSelectedAvatar({ ...selectedAvatar, emoji: emoji.native });
      setShowEditEmojiPicker(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAvatars(page);
  };

  const fetchAvatars = async (page: number = currentPage) => {
    try {
      setLoading(true);
      // Add cache-buster to prevent stale data
      const timestamp = new Date().getTime();
      const res = await apiFetch<any>(`/admin/avatars?page=${page}&per_page=${perPage}&_t=${timestamp}`);

      let avatarsList: any[] = [];

      if (Array.isArray(res.data)) {
        avatarsList = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        avatarsList = res.data.data;
      } else if (Array.isArray(res)) {
        avatarsList = res;
      }

      const mappedAvatars = avatarsList.map((avatar: any) => ({
        id: avatar.id,
        name: avatar.name || '',
        emoji: avatar.emoji || '😊',
        image_url: avatar.image_url || null,
        image_path: avatar.image_path || null,
        is_active: avatar.is_active === 1 || avatar.is_active === true,
        display_order: avatar.display_order || 0,
        created_at: avatar.created_at,
        updated_at: avatar.updated_at,
      }));

      setAvatars(mappedAvatars);
      // Removed redundant setFilteredAvatars as it's handled by useEffect dependency [avatars]

      if (res.data?.meta) {
        setCurrentPage(res.data.meta.current_page || page);
        setTotalPages(res.data.meta.last_page || 1);
      } else if (res.meta) {
        setCurrentPage(res.meta.current_page || page);
        setTotalPages(res.meta.last_page || 1);
      }
    } catch (error: any) {
      console.error('Error fetching avatars:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to fetch avatars. Please try again.',
        variant: 'destructive',
      });
      setAvatars([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAvatars = () => {
    setSearchLoading(true);
    let filtered = [...avatars];

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (avatar) =>
          avatar.name.toLowerCase().includes(query) ||
          avatar.emoji.includes(query)
      );
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter((avatar) => avatar.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((avatar) => !avatar.is_active);
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'order':
        filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
          const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
          return dateB - dateA;
        });
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredAvatars(filtered);
    setSearchLoading(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only JPEG and PNG images are allowed',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddAvatar = async () => {
    if (!newAvatar.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in the avatar name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', newAvatar.name.trim());
      formData.append('emoji', newAvatar.emoji || '😊');
      formData.append('is_active', newAvatar.is_active ? '1' : '0');
      formData.append('display_order', String(newAvatar.display_order || 0));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await apiFetchFormData('/admin/avatars', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        toast({
          title: 'Avatar Added',
          description: response.message || 'New avatar has been created successfully.',
        });

        setIsAddDialogOpen(false);
        resetForm();
        // Crucial: Await the refresh
        await fetchAvatars();
      } else {
        throw new Error(response.message || 'Failed to create avatar');
      }
    } catch (error: any) {
      console.error(error);
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(', ');
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to add avatar',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!selectedAvatar || !selectedAvatar.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in the avatar name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      if (imageFile) {
        const formData = new FormData();
        formData.append('name', selectedAvatar.name.trim());
        formData.append('emoji', selectedAvatar.emoji || '😊');
        formData.append('is_active', selectedAvatar.is_active ? '1' : '0');
        formData.append('display_order', String(selectedAvatar.display_order || 0));
        formData.append('image', imageFile);
        formData.append('_method', 'PUT');

        const response = await apiFetchFormData(`/admin/avatars/${selectedAvatar.id}`, {
          method: 'POST',
          body: formData,
        });

        if (response.success) {
          toast({
            title: 'Avatar Updated',
            description: response.message || 'Avatar has been updated successfully.',
          });

          setIsEditDialogOpen(false);
          setSelectedAvatar(null);
          resetForm();
          await fetchAvatars();
        } else {
          throw new Error(response.message || 'Failed to update avatar');
        }
      } else {
        const response = await apiFetch(`/admin/avatars/${selectedAvatar.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: selectedAvatar.name.trim(),
            emoji: selectedAvatar.emoji || '😊',
            is_active: selectedAvatar.is_active ? 1 : 0,
            display_order: selectedAvatar.display_order || 0,
          }),
        });

        if (response.success) {
          toast({
            title: 'Avatar Updated',
            description: response.message || 'Avatar has been updated successfully.',
          });

          setIsEditDialogOpen(false);
          setSelectedAvatar(null);
          resetForm();
          await fetchAvatars();
        } else {
          throw new Error(response.message || 'Failed to update avatar');
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(', ');
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to update avatar',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAvatar = async (id: number) => {
    const avatar = avatars.find((a) => a.id === id);
    if (!avatar) return;

    const result = await showConfirmationDialog({
      title: 'Are you sure?',
      text: `This avatar "${avatar.name}" will be permanently deleted.`,
      icon: 'warning',
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        const response = await apiFetch(`/admin/avatars/${id}`, { method: 'DELETE' });

        if (response.success) {
          // Update local state immediately - remove from list
          setAvatars(prev => prev.filter(a => a.id !== id));
          setFilteredAvatars(prev => prev.filter(a => a.id !== id));

          toast({
            title: 'Deleted',
            description: response.message || `Avatar "${avatar.name}" has been deleted.`,
          });
        } else {
          throw new Error(response.message || 'Failed to delete avatar');
        }
      } catch (error: any) {
        // Handle specific error codes
        if (error.error_code === 'AVATAR_IN_USE') {
          toast({
            title: 'Cannot Delete Avatar',
            description: error.message || 'This avatar is currently in use by one or more users.',
            variant: 'destructive',
          });
        } else if (error.message?.includes('not found')) {
          toast({
            title: 'Avatar Not Found',
            description: error.message || 'The avatar you are trying to delete does not exist.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: error?.message || 'Failed to delete avatar',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    const avatar = avatars.find((a) => a.id === id);
    if (!avatar) return;

    const isActivating = !avatar.is_active;
    const action = isActivating ? 'activate' : 'deactivate';
    const actionTitle = isActivating ? 'Activate' : 'Deactivate';

    const result = await showConfirmationDialog({
      title: `${actionTitle} Avatar?`,
      text: `Are you sure you want to ${action} the avatar "${avatar.name}"? ${isActivating ? 'This will make it visible in the registration page.' : 'This will hide it from the registration page.'}`,
      icon: isActivating ? 'question' : 'warning',
      confirmButtonText: `Yes, ${actionTitle}!`,
      confirmButtonColor: isActivating ? '#10b981' : '#ef4444',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await apiFetch(`/admin/avatars/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: avatar.name,
          emoji: avatar.emoji,
          is_active: !avatar.is_active ? 1 : 0,
          display_order: avatar.display_order || 0,
        }),
      });

      if (response.success) {
        // Update local state immediately - toggle is_active status
        const newActiveStatus = !avatar.is_active;
        setAvatars(prev => prev.map(a =>
          a.id === id ? { ...a, is_active: newActiveStatus } : a
        ));
        setFilteredAvatars(prev => prev.map(a =>
          a.id === id ? { ...a, is_active: newActiveStatus } : a
        ));

        toast({
          title: 'Status Updated',
          description: response.message || `Avatar "${avatar.name}" has been ${action}d.`,
        });
      } else {
        throw new Error(response.message || 'Failed to update avatar status');
      }
    } catch (error: any) {
      console.error(error);

      // Handle validation errors
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(', ');
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to update avatar status',
          variant: 'destructive',
        });
      }
    }
  };

  const editAvatar = (avatar: Avatar) => {
    setSelectedAvatar({ ...avatar });
    setImagePreview(avatar.image_url || null);
    setImageFile(null);
    setIsEditDialogOpen(true);
  };

  const viewAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setNewAvatar({
      name: '',
      emoji: '😊',
      image_url: null,
      image_path: null,
      is_active: true,
      display_order: 0,
    });
    setImagePreview(null);
    setImageFile(null);
    setShowEmojiPicker(false);
    setShowEditEmojiPicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stats = [
    {
      title: 'Total Avatars',
      value: avatars.length,
      description: 'All avatars',
      icon: Users,
      color: 'blue' as const,
    },
    {
      title: 'Active',
      value: avatars.filter((a) => a.is_active).length,
      description: 'Visible in registration',
      icon: UserCheck,
      color: 'green' as const,
    },
    {
      title: 'Inactive',
      value: avatars.filter((a) => !a.is_active).length,
      description: 'Hidden from registration',
      icon: UserX,
      color: 'red' as const,
    },
  ];

  const getImageUrl = (avatar: Avatar): string => {
    // Check image_url first (preferred) - this is usually the full URL from API
    if (avatar.image_url && avatar.image_url.trim() !== '') {
      // If already a full URL, return as is
      if (avatar.image_url.startsWith('http://') || avatar.image_url.startsWith('https://')) {
        return avatar.image_url;
      }
      // Construct URL manually to avoid default placeholder
      const cleanUrl = avatar.image_url.startsWith('/') ? avatar.image_url.substring(1) : avatar.image_url;
      const baseUrl = UPLOAD_BASE_URL?.endsWith('/') ? UPLOAD_BASE_URL.slice(0, -1) : UPLOAD_BASE_URL;
      return `${baseUrl}/${cleanUrl}`;
    }

    // Fallback to image_path
    if (avatar.image_path && avatar.image_path.trim() !== '') {
      // Construct URL manually to avoid default placeholder
      const cleanPath = avatar.image_path.startsWith('/') ? avatar.image_path.substring(1) : avatar.image_path;
      const baseUrl = UPLOAD_BASE_URL?.endsWith('/') ? UPLOAD_BASE_URL.slice(0, -1) : UPLOAD_BASE_URL;
      return `${baseUrl}/${cleanPath}`;
    }

    return '';
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Avatar Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create, edit, and manage avatars used in user registration
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Avatar</span>
          </Button>
        </div>
      </div>

      <StatsGrid stats={stats} loading={loading} grid_count={3} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search avatars..."
                loading={searchLoading}
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="order">Display Order</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle viewType={viewType} onViewChange={setViewType} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {searchLoading ? (
            <LoadingOverlay />
          ) : filteredAvatars.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No avatars found"
              description={searchQuery ? 'Try adjusting your search filters' : 'Get started by creating your first avatar'}
            />
          ) : viewType === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAvatars.map((avatar) => {
                const imageUrl = getImageUrl(avatar);
                return (
                  <Card key={avatar.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Avatar display similar to register page */}
                      <div className="relative rounded-xl border-2 border-border p-2 bg-white mb-3">
                        <div className="relative w-16 h-16 mx-auto">
                          {imageUrl && imageUrl.trim() !== '' ? (
                            <>
                              <img
                                src={imageUrl}
                                alt={avatar.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              {/* Emoji fallback - hidden by default, shown on error */}
                              <div
                                className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl"
                                style={{ display: 'none' }}
                              >
                                {avatar.emoji || '😊'}
                              </div>
                            </>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl">
                              {avatar.emoji || '😊'}
                            </div>
                          )}
                          {/* Emoji badge in top-right corner */}
                          <span className="absolute -top-1 -right-1 text-sm bg-white/90 rounded-full px-1 shadow-sm border border-border">
                            {avatar.emoji || '😊'}
                          </span>
                        </div>
                        {/* Name below avatar */}
                        <p className="text-xs mt-1 font-semibold text-center">{avatar.name}</p>
                      </div>

                      {/* Badge and Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={avatar.is_active ? 'default' : 'secondary'} className="text-xs">
                          {avatar.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewAvatar(avatar)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editAvatar(avatar)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(avatar.id)}
                            >
                              {avatar.is_active ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteAvatar(avatar.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAvatars.map((avatar) => {
                const imageUrl = getImageUrl(avatar);

                return (
                  <div
                    key={avatar.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar display similar to register page */}
                      <div className="relative rounded-xl border-2 border-border p-2 bg-white flex-shrink-0 min-w-[80px]">
                        <div className="relative w-16 h-16 mx-auto">
                          {imageUrl && imageUrl.trim() !== '' ? (
                            <>
                              <img
                                src={imageUrl}
                                alt={avatar.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  // Hide image and show emoji fallback if image fails
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              {/* Emoji fallback - hidden by default, shown on error */}
                              <div
                                className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl"
                                style={{ display: 'none' }}
                              >
                                {avatar.emoji || '😊'}
                              </div>
                            </>
                          ) : (
                            /* Emoji fallback - shown when no image URL */
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl">
                              {avatar.emoji || '😊'}
                            </div>
                          )}
                          {/* Emoji badge in top-right corner */}
                          <span className="absolute -top-1 -right-1 text-sm bg-white/90 rounded-full px-1 shadow-sm border border-border">
                            {avatar.emoji || '😊'}
                          </span>
                        </div>
                        {/* Name below avatar */}
                        <p className="text-xs mt-1 font-semibold text-center">{avatar.name}</p>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={avatar.is_active ? 'default' : 'secondary'}>
                            {avatar.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Display Order: {avatar.display_order || 0}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewAvatar(avatar)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editAvatar(avatar)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(avatar.id)}
                        >
                          {avatar.is_active ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteAvatar(avatar.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          setShowEmojiPicker(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Avatar</DialogTitle>
            <DialogDescription>
              Create a new avatar that will be available in the registration page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Avatar Name *</Label>
              <Input
                id="name"
                value={newAvatar.name}
                onChange={(e) => setNewAvatar({ ...newAvatar, name: e.target.value })}
                placeholder="e.g., Sunny, Star, Rainbow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji</Label>
              <div className="relative" ref={emojiPickerRef}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full justify-start"
                  >
                    <span className="text-2xl mr-2">{newAvatar.emoji || '😊'}</span>
                    <Smile className="h-4 w-4" />
                    <span className="ml-2">Select Emoji</span>
                  </Button>
                </div>
                {showEmojiPicker && (
                  <div className="absolute z-50 mt-2 shadow-2xl rounded-lg overflow-hidden">
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                      previewPosition="none"
                      skinTonePosition="none"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={newAvatar.display_order || 0}
                onChange={(e) => setNewAvatar({ ...newAvatar, display_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Avatar Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={newAvatar.is_active}
                onChange={(e) => setNewAvatar({ ...newAvatar, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (visible in registration)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAvatar} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setShowEditEmojiPicker(false);
          setSelectedAvatar(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Avatar</DialogTitle>
            <DialogDescription>
              Update avatar details.
            </DialogDescription>
          </DialogHeader>
          {selectedAvatar && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Avatar Name *</Label>
                <Input
                  id="edit_name"
                  value={selectedAvatar.name}
                  onChange={(e) => setSelectedAvatar({ ...selectedAvatar, name: e.target.value })}
                  placeholder="e.g., Sunny, Star, Rainbow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_emoji">Emoji</Label>
                <div className="relative" ref={editEmojiPickerRef}>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
                      className="w-full justify-start"
                    >
                      <span className="text-2xl mr-2">{selectedAvatar.emoji || '😊'}</span>
                      <Smile className="h-4 w-4" />
                      <span className="ml-2">Select Emoji</span>
                    </Button>
                  </div>
                  {showEditEmojiPicker && (
                    <div className="absolute z-50 mt-2 shadow-2xl rounded-lg overflow-hidden">
                      <Picker
                        data={data}
                        onEmojiSelect={handleEditEmojiSelect}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_display_order">Display Order</Label>
                <Input
                  id="edit_display_order"
                  type="number"
                  value={selectedAvatar.display_order || 0}
                  onChange={(e) => setSelectedAvatar({ ...selectedAvatar, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image">Avatar Image</Label>
                <Input
                  id="edit_image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imageFile ? 'Change Image' : 'Upload New Image'}
                  </Button>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2"
                    />
                  )}
                  {!imagePreview && selectedAvatar.image_url && (
                    <img
                      src={getImageUrl(selectedAvatar)}
                      alt="Current"
                      className="w-20 h-20 rounded-full object-cover border-2"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={selectedAvatar.is_active}
                  onChange={(e) => setSelectedAvatar({ ...selectedAvatar, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit_is_active" className="cursor-pointer">
                  Active (visible in registration)
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAvatar} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Avatar Details</DialogTitle>
          </DialogHeader>
          {selectedAvatar && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                {getImageUrl(selectedAvatar) ? (
                  <img
                    src={getImageUrl(selectedAvatar)}
                    alt={selectedAvatar.name}
                    className="w-32 h-32 rounded-full object-cover border-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl border-4">
                    {selectedAvatar.emoji}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold">{selectedAvatar.name}</h3>
                <p className="text-4xl">{selectedAvatar.emoji}</p>
                <Badge variant={selectedAvatar.is_active ? 'default' : 'secondary'}>
                  {selectedAvatar.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <div className="text-sm text-muted-foreground space-y-1 pt-4">
                  <p>Display Order: {selectedAvatar.display_order || 0}</p>
                  {selectedAvatar.created_at && (
                    <p>Created: {new Date(selectedAvatar.created_at).toLocaleDateString()}</p>
                  )}
                  {selectedAvatar.updated_at && (
                    <p>Updated: {new Date(selectedAvatar.updated_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedAvatar && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                editAvatar(selectedAvatar);
              }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

