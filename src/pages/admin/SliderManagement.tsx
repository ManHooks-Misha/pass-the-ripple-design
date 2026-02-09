import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  RefreshCw, 
  Loader2, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  ArrowUpDown,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import { showConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { SearchBar } from '@/components/admin/SearchBar';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import { useDebounce } from '@/hooks/useDebounce';

interface Slider {
  id: number;
  heading: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  image_path: string | null;
  image_url: string;
  status: 'active' | 'inactive';
  sort_order: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  creator?: {
    id: number;
    nickname: string;
    email: string;
  };
  updater?: {
    id: number;
    nickname: string;
    email: string;
  };
}

interface SliderStats {
  total_sliders: number;
  active_sliders: number;
  inactive_sliders: number;
  recent_sliders: Slider[];
}

export default function SliderManagement() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [stats, setStats] = useState<SliderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Form state
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    button_text: '',
    button_link: '',
    status: 'active' as 'active' | 'inactive',
    sort_order: 0,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch sliders
  const fetchSliders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await apiFetch<{
        success: boolean;
        data: {
          sliders: {
            data: Slider[];
            current_page: number;
            last_page: number;
            total: number;
          };
          counts: {
            total: number;
            active: number;
            inactive: number;
          };
        };
      }>(`/sliders?${params.toString()}`);

      if (response.success && response.data) {
        setSliders(response.data.sliders.data);
        setCurrentPage(response.data.sliders.current_page);
        setTotalPages(response.data.sliders.last_page);
        setTotal(response.data.sliders.total);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch sliders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, statusFilter, sortBy, sortOrder, debouncedSearch]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiFetch<{
        success: boolean;
        data: SliderStats;
      }>('/sliders/stats');

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
    fetchStats();
  }, [fetchSliders, fetchStats]);

  // Reset form
  const resetForm = () => {
    setFormData({
      heading: '',
      description: '',
      button_text: '',
      button_link: '',
      status: 'active',
      sort_order: 0,
    });
    setImagePreview(null);
    setImageFile(null);
    setSelectedSlider(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open add dialog
  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (slider: Slider) => {
    setSelectedSlider(slider);
    setFormData({
      heading: slider.heading || '',
      description: slider.description || '',
      button_text: slider.button_text || '',
      button_link: slider.button_link || '',
      status: slider.status,
      sort_order: slider.sort_order,
    });
    setImagePreview(slider.image_url || null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // Open view dialog
  const handleView = (slider: Slider) => {
    setSelectedSlider(slider);
    setIsViewDialogOpen(true);
  };

  // Handle image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Image is required for new sliders, or if editing and no existing image
    if (!selectedSlider && !imageFile && !imagePreview) {
      newErrors.image = 'Image is required';
    } else if (selectedSlider && !imageFile && !imagePreview && !selectedSlider.image_url) {
      newErrors.image = 'Image is required';
    }

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.button_text.trim()) {
      newErrors.button_text = 'Button text is required';
    }

    if (!formData.button_link.trim()) {
      newErrors.button_link = 'Button link is required';
    } else if (!/^https?:\/\/.+/.test(formData.button_link)) {
      newErrors.button_link = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save slider
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const formDataToSend = new FormData();
      
      formDataToSend.append('heading', formData.heading);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('button_text', formData.button_text);
      formDataToSend.append('button_link', formData.button_link);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('sort_order', formData.sort_order.toString());

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (selectedSlider) {
        response = await apiFetchFormData<{
          success: boolean;
          message: string;
          data: Slider;
        }>(`/sliders/${selectedSlider.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        response = await apiFetchFormData<{
          success: boolean;
          message: string;
          data: Slider;
        }>('/sliders', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || (selectedSlider ? 'Slider updated successfully' : 'Slider created successfully'),
        });
        setIsDialogOpen(false);
        resetForm();
        fetchSliders();
        fetchStats();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save slider',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete slider
  const handleDelete = async (slider: Slider) => {
    const confirmed = await showConfirmationDialog({
      title: 'Delete Slider',
      text: `Are you sure you want to delete this slider? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
      }>(`/sliders/${slider.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Slider deleted successfully',
        });
        fetchSliders();
        fetchStats();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete slider',
        variant: 'destructive',
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (slider: Slider) => {
    const newStatus = slider.status === 'active' ? 'inactive' : 'active';
    const action = slider.status === 'active' ? 'deactivate' : 'activate';
    
    const confirmed = await showConfirmationDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Slider?`,
      text: `Are you sure you want to ${action} this slider? The slider will be ${newStatus} and ${newStatus === 'active' ? 'will be' : 'will not be'} visible on the homepage.`,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      icon: 'question',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: { id: number; status: string };
      }>(`/sliders/${slider.id}/toggle-status`, {
        method: 'PUT',
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Slider status updated successfully',
        });
        fetchSliders();
        fetchStats();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update slider status',
        variant: 'destructive',
      });
    }
  };

  // Stats data
  const statsData = stats ? [
    { title: 'Total Sliders', value: stats.total_sliders.toString(), icon: ImageIcon, color: 'blue' as const },
    { title: 'Active', value: stats.active_sliders.toString(), icon: Eye, color: 'green' as const },
    { title: 'Inactive', value: stats.inactive_sliders.toString(), icon: EyeOff, color: 'red' as const },
  ] : [];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Slider Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage homepage slider images and content
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={fetchSliders} variant="outline" size="sm" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Slider</span>
          </Button>
        </div>
      </div>

      {stats && <StatsGrid stats={statsData} grid_count={3} />}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search sliders..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sort_order">Sort Order</SelectItem>
                  <SelectItem value="heading">Heading</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort {sortOrder === 'asc' ? 'Desc' : 'Asc'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sliders List */}
      <Card>
        <CardHeader className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sliders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {total} slider{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState />
          ) : sliders.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No sliders found"
              description="Get started by creating a new slider"
              action={{
                label: "Add Slider",
                onClick: handleAdd,
                icon: Plus
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Image</th>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Heading</th>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium hidden sm:table-cell">Description</th>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium hidden md:table-cell">Button</th>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Status</th>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium hidden lg:table-cell">Order</th>
                    <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sliders.map((slider) => (
                    <tr key={slider.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          {slider.image_url ? (
                            <img
                              src={slider.image_url}
                              alt={slider.heading || 'Slider'}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-xs sm:text-sm">{slider.heading || '—'}</div>
                      </td>
                      <td className="p-3 sm:p-4 hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-muted-foreground max-w-xs truncate" title={slider.description || ''}>
                          {slider.description || '—'}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        {slider.button_text ? (
                          <span className="text-xs sm:text-sm text-gray-700">{slider.button_text}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge
                          variant={slider.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {slider.status}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4 hidden lg:table-cell">
                        <span className="text-xs sm:text-sm text-muted-foreground">{slider.sort_order}</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 sm:w-48">
                              <DropdownMenuItem onClick={() => handleView(slider)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(slider)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(slider)}>
                                {slider.status === 'active' ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(slider)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && sliders.length > 0 && totalPages > 1 && (
            <div className="p-4 sm:p-5 md:p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSlider ? 'Edit Slider' : 'Add New Slider'}</DialogTitle>
            <DialogDescription>
              {selectedSlider ? 'Update slider information' : 'Create a new slider for the homepage'}
            </DialogDescription>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-red-500 mr-1">*</span>
              indicates required fields
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Slider Image
                <span className="text-red-500">*</span>
              </Label>
              {imagePreview ? (
                <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-muted border-2 border-dashed">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-full h-48 sm:h-64 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Click to upload image (Max 2MB)
                  </p>
                </div>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image}</p>
              )}
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <Label htmlFor="heading" className="flex items-center gap-1">
                Heading
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="heading"
                value={formData.heading}
                onChange={(e) => {
                  setFormData({ ...formData, heading: e.target.value });
                  if (errors.heading) {
                    setErrors({ ...errors, heading: '' });
                  }
                }}
                placeholder="Enter slider heading"
                maxLength={255}
                className={errors.heading ? 'border-destructive' : ''}
              />
              {errors.heading && (
                <p className="text-xs text-destructive">{errors.heading}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                Description
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: '' });
                  }
                }}
                placeholder="Enter slider description"
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <Label htmlFor="button_text" className="flex items-center gap-1">
                Button Text
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="button_text"
                value={formData.button_text}
                onChange={(e) => {
                  setFormData({ ...formData, button_text: e.target.value });
                  if (errors.button_text) {
                    setErrors({ ...errors, button_text: '' });
                  }
                }}
                placeholder="Enter button text"
                maxLength={100}
                className={errors.button_text ? 'border-destructive' : ''}
              />
              {errors.button_text && (
                <p className="text-xs text-destructive">{errors.button_text}</p>
              )}
            </div>

            {/* Button Link */}
            <div className="space-y-2">
              <Label htmlFor="button_link" className="flex items-center gap-1">
                Button Link
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="button_link"
                value={formData.button_link}
                onChange={(e) => {
                  setFormData({ ...formData, button_link: e.target.value });
                  if (errors.button_link) {
                    setErrors({ ...errors, button_link: '' });
                  }
                }}
                placeholder="https://example.com"
                maxLength={500}
                className={errors.button_link ? 'border-destructive' : ''}
              />
              {errors.button_link && (
                <p className="text-xs text-destructive">{errors.button_link}</p>
              )}
            </div>

            {/* Status and Sort Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Slider Details</DialogTitle>
            <DialogDescription>View slider information</DialogDescription>
          </DialogHeader>
          {selectedSlider && (
            <div className="space-y-4">
              <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-muted">
                {selectedSlider.image_url ? (
                  <img
                    src={selectedSlider.image_url}
                    alt={selectedSlider.heading || 'Slider'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground font-bold">Heading</Label>
                  <p className="font-medium mt-2">{selectedSlider.heading || '—'}</p>
                </div>
                <div className="mb-6">
                  <Label className="text-muted-foreground font-bold block mb-3">Status</Label>
                  <Badge
                    variant={selectedSlider.status === 'active' ? 'default' : 'secondary'}
                  >
                    {selectedSlider.status}
                  </Badge>
                </div>
                <div className="sm:col-span-2 mt-4">
                  <Label className="text-muted-foreground font-bold">Description</Label>
                  <p className="font-medium whitespace-pre-wrap mt-2">
                    {selectedSlider.description || '—'}
                  </p>
                </div>
                <div className="mt-4">
                  <Label className="text-muted-foreground font-bold">Button Text</Label>
                  <p className="font-medium mt-2">{selectedSlider.button_text || '—'}</p>
                </div>
                <div className="mt-4">
                  <Label className="text-muted-foreground">Sort Order</Label>
                  <p className="font-medium mt-2">{selectedSlider.sort_order}</p>
                </div>
                {selectedSlider.button_link && (
                  <div className="sm:col-span-2 mt-4">
                    <Label className="text-muted-foreground">Button Link</Label>
                    <a
                      href={selectedSlider.button_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all block mt-2"
                    >
                      {selectedSlider.button_link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedSlider && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEdit(selectedSlider);
              }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

