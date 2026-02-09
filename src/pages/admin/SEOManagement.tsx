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
import { Switch } from '@/components/ui/switch';
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
  X,
  Search,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import { showConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { SearchBar } from '@/components/admin/SearchBar';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';

interface SEOMetadata {
  id: number;
  page_path: string;
  page_name: string;
  title: string;
  meta_description: string;
  og_title: string | null;
  og_description: string | null;
  og_image_path: string | null;
  og_image_url: string;
  og_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SEOStats {
  total_metadata: number;
  active_metadata: number;
  inactive_metadata: number;
}

export default function SEOManagement() {
  const [metadata, setMetadata] = useState<SEOMetadata[]>([]);
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<SEOMetadata | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter inputs (not applied yet)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilterInput, setStatusFilterInput] = useState<string>('all');
  const [sortByInput, setSortByInput] = useState<string>('created_at');
  
  // Applied filters (used for API calls)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>('all');
  const [appliedSortBy, setAppliedSortBy] = useState<string>('created_at');
  const [appliedSortOrder, setAppliedSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    page_path: '',
    page_name: '',
    title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_url: '',
    is_active: true,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch metadata
  const fetchMetadata = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: appliedSortBy,
        sort_order: appliedSortOrder,
      });

      if (appliedStatusFilter !== 'all') {
        params.append('is_active', appliedStatusFilter === 'active' ? 'true' : 'false');
      }

      if (appliedSearchQuery) {
        params.append('search', appliedSearchQuery);
      }

      const response = await apiFetch<{
        success: boolean;
        data: {
          metadata: {
            data: SEOMetadata[];
            current_page: number;
            last_page: number;
            total: number;
          };
        };
      }>(`/admin/seo-metadata?${params.toString()}`);

      if (response.success && response.data) {
        setMetadata(response.data.metadata.data);
        setCurrentPage(response.data.metadata.current_page);
        setTotalPages(response.data.metadata.last_page);
        setTotal(response.data.metadata.total);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch SEO metadata',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, appliedStatusFilter, appliedSortBy, appliedSortOrder, appliedSearchQuery]);
  
  // Handle Apply Filters button
  const handleApplyFilters = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedStatusFilter(statusFilterInput);
    setAppliedSortBy(sortByInput);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiFetch<{
        success: boolean;
        data: SEOStats;
      }>('/admin/seo-metadata/stats');

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
    fetchStats();
  }, [fetchMetadata, fetchStats]);

  // Reset form
  const resetForm = () => {
    setFormData({
      page_path: '',
      page_name: '',
      title: '',
      meta_description: '',
      og_title: '',
      og_description: '',
      og_url: '',
      is_active: true,
    });
    setOgImagePreview(null);
    setOgImageFile(null);
    setSelectedMetadata(null);
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
  const handleEdit = (item: SEOMetadata) => {
    setSelectedMetadata(item);
    setFormData({
      page_path: item.page_path,
      page_name: item.page_name,
      title: item.title,
      meta_description: item.meta_description,
      og_title: item.og_title || '',
      og_description: item.og_description || '',
      og_url: item.og_url || '',
      is_active: item.is_active,
    });
    setOgImagePreview(item.og_image_url || null);
    setOgImageFile(null);
    setIsDialogOpen(true);
  };

  // Open view dialog
  const handleView = (item: SEOMetadata) => {
    setSelectedMetadata(item);
    setIsViewDialogOpen(true);
  };

  // Handle OG image upload
  const handleOgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setOgImageFile(file);
    if (errors.og_image) {
      setErrors({ ...errors, og_image: '' });
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setOgImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove OG image
  const handleRemoveOgImage = () => {
    setOgImageFile(null);
    setOgImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.page_path.trim()) {
      newErrors.page_path = 'Page path is required';
    } else if (!formData.page_path.startsWith('/')) {
      newErrors.page_path = 'Page path must start with /';
    }

    if (!formData.page_name.trim()) {
      newErrors.page_name = 'Page name is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 60) {
      newErrors.title = 'Title must be 60 characters or less';
    }

    if (!formData.meta_description.trim()) {
      newErrors.meta_description = 'Meta description is required';
    } else if (formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta description must be 160 characters or less';
    }

    if (formData.og_url && !/^https?:\/\/.+/.test(formData.og_url)) {
      newErrors.og_url = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save metadata
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const formDataToSend = new FormData();
      
      formDataToSend.append('page_path', formData.page_path);
      formDataToSend.append('page_name', formData.page_name);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('meta_description', formData.meta_description);
      
      if (formData.og_title) {
        formDataToSend.append('og_title', formData.og_title);
      }
      if (formData.og_description) {
        formDataToSend.append('og_description', formData.og_description);
      }
      if (formData.og_url) {
        formDataToSend.append('og_url', formData.og_url);
      }
      
      // Send as lowercase string "true" or "false" to match Laravel boolean validation
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');

      if (ogImageFile) {
        formDataToSend.append('og_image', ogImageFile);
      }

      // If editing and removing image
      if (selectedMetadata && !ogImageFile && !ogImagePreview && selectedMetadata.og_image_path) {
        formDataToSend.append('remove_og_image', 'true');
      }

      let response;
      if (selectedMetadata) {
        response = await apiFetchFormData<{
          success: boolean;
          message: string;
          data: SEOMetadata;
        }>(`/admin/seo-metadata/${selectedMetadata.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        response = await apiFetchFormData<{
          success: boolean;
          message: string;
          data: SEOMetadata;
        }>('/admin/seo-metadata', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (response.success && response.data) {
        toast({
          title: 'Success',
          description: response.message || (selectedMetadata ? 'SEO metadata updated successfully' : 'SEO metadata created successfully'),
        });
        
        // Update local state immediately without page reload
        if (selectedMetadata) {
          // Update existing item - create new array and new object to ensure React detects the change
          setMetadata(prev => {
            const newArray = prev.map(item => {
              if (item.id === selectedMetadata.id) {
                // Create a completely new object with updated data
                const updatedItem: SEOMetadata = {
                  ...item,
                  ...response.data,
                  // Preserve og_image_url if response doesn't include it
                  og_image_url: response.data.og_image_url || item.og_image_url || '',
                };
                return updatedItem;
              }
              return item;
            });
            // Return new array to ensure React detects the change
            return [...newArray];
          });
        } else {
          // Add new item to the beginning of the list
          setMetadata(prev => [response.data, ...prev]);
          setTotal(prev => prev + 1);
          // If we're not on page 1, navigate to page 1 to see the new item
          if (currentPage !== 1) {
            setCurrentPage(1);
          }
        }
        
        // Update stats immediately
        if (stats) {
          setStats(prev => {
            if (!prev) return prev;
            if (selectedMetadata) {
              // If toggling status, update counts
              if (selectedMetadata.is_active !== response.data.is_active) {
                return {
                  ...prev,
                  active_metadata: response.data.is_active 
                    ? prev.active_metadata + 1 
                    : prev.active_metadata - 1,
                  inactive_metadata: response.data.is_active 
                    ? prev.inactive_metadata - 1 
                    : prev.inactive_metadata + 1,
                };
              }
            } else {
              // New item added
              return {
                ...prev,
                total_metadata: prev.total_metadata + 1,
                active_metadata: response.data.is_active 
                  ? prev.active_metadata + 1 
                  : prev.active_metadata,
                inactive_metadata: response.data.is_active 
                  ? prev.inactive_metadata 
                  : prev.inactive_metadata + 1,
              };
            }
            return prev;
          });
        }
        
        setIsDialogOpen(false);
        resetForm();
        
        // Don't refetch for create/update - optimistic update is sufficient
        // Only refetch stats to ensure consistency
        fetchStats().catch(console.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save SEO metadata',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete metadata
  const handleDelete = async (item: SEOMetadata) => {
    const confirmed = await showConfirmationDialog({
      title: 'Delete SEO Metadata',
      text: `Are you sure you want to delete SEO metadata for "${item.page_name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
      }>(`/admin/seo-metadata/${item.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'SEO metadata deleted successfully',
        });
        
        // Update local state immediately
        setMetadata(prev => prev.filter(meta => meta.id !== item.id));
        setTotal(prev => prev - 1);
        
        // Update stats immediately
        if (stats) {
          setStats(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              total_metadata: prev.total_metadata - 1,
              active_metadata: item.is_active ? prev.active_metadata - 1 : prev.active_metadata,
              inactive_metadata: item.is_active ? prev.inactive_metadata : prev.inactive_metadata - 1,
            };
          });
        }
        
        // Don't refetch - optimistic update is sufficient and immediate
        // Only refetch stats to ensure consistency
        fetchStats().catch(console.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete SEO metadata',
        variant: 'destructive',
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (item: SEOMetadata) => {
    const newStatus = !item.is_active;
    const action = item.is_active ? 'deactivate' : 'activate';
    
    const confirmed = await showConfirmationDialog({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} SEO Metadata?`,
      text: `Are you sure you want to ${action} SEO metadata for "${item.page_name}"?`,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      icon: 'question',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: { id: number; is_active: boolean };
      }>(`/admin/seo-metadata/${item.id}/toggle-status`, {
        method: 'PUT',
      });

      if (response.success && response.data) {
        toast({
          title: 'Success',
          description: response.message || 'SEO metadata status updated successfully',
        });
        
        // Update local state immediately
        setMetadata(prev => prev.map(meta => 
          meta.id === item.id 
            ? { ...meta, is_active: response.data.is_active }
            : meta
        ));
        
        // Update stats immediately
        if (stats) {
          setStats(prev => {
            if (!prev) return prev;
            const wasActive = item.is_active;
            const isNowActive = response.data.is_active;
            
            if (wasActive !== isNowActive) {
              return {
                ...prev,
                active_metadata: isNowActive 
                  ? prev.active_metadata + 1 
                  : prev.active_metadata - 1,
                inactive_metadata: isNowActive 
                  ? prev.inactive_metadata - 1 
                  : prev.inactive_metadata + 1,
              };
            }
            return prev;
          });
        }
        
        // Optionally refetch to ensure consistency (in background)
        fetchMetadata().catch(console.error);
        fetchStats().catch(console.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update SEO metadata status',
        variant: 'destructive',
      });
    }
  };

  // Stats data
  const statsData = stats ? [
    { title: 'Total Metadata', value: stats.total_metadata.toString(), icon: Search, color: 'blue' as const },
    { title: 'Active', value: stats.active_metadata.toString(), icon: Eye, color: 'green' as const },
    { title: 'Inactive', value: stats.inactive_metadata.toString(), icon: EyeOff, color: 'red' as const },
  ] : [];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            SEO Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage SEO metadata and Open Graph tags for pages
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={fetchMetadata} variant="outline" size="sm" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create SEO Metadata</span>
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
                placeholder="Search by page path or name..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <Select value={statusFilterInput} onValueChange={setStatusFilterInput}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortByInput} onValueChange={setSortByInput}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page_path">Page Path</SelectItem>
                  <SelectItem value="page_name">Page Name</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleApplyFilters}
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Filter className="h-4 w-4" />
                <span>Apply</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata List */}
      <Card>
        <CardHeader className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEO Metadata</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState />
          ) : metadata.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No SEO metadata found"
              description="Get started by creating SEO metadata for a page"
              action={{
                label: "Create SEO Metadata",
                onClick: handleAdd,
                icon: Plus
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-foreground">Page Path</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-foreground">Page Name</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-foreground hidden md:table-cell">Title</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-foreground">Status</th>
                    <th className="text-right p-3 sm:p-4 text-sm sm:text-base font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {metadata.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-xs sm:text-sm">{item.page_path}</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-xs sm:text-sm">{item.page_name}</div>
                      </td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <div className="text-xs sm:text-sm text-muted-foreground max-w-xs truncate" title={item.title}>
                          {item.title}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge
                          variant={item.is_active ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
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
                              <DropdownMenuItem onClick={() => handleView(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                                {item.is_active ? (
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
                                onClick={() => handleDelete(item)}
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
          {!loading && metadata.length > 0 && totalPages > 1 && (
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMetadata ? 'Edit SEO Metadata' : 'Create SEO Metadata'}</DialogTitle>
            <DialogDescription>
              {selectedMetadata ? 'Update SEO metadata for this page' : 'Create SEO metadata for a new page'}
            </DialogDescription>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-red-500 mr-1">*</span>
              indicates required fields
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {/* Page Path */}
            <div className="space-y-2">
              <Label htmlFor="page_path" className="flex items-center gap-1">
                Page Path
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="page_path"
                value={formData.page_path}
                onChange={(e) => {
                  setFormData({ ...formData, page_path: e.target.value });
                  if (errors.page_path) {
                    setErrors({ ...errors, page_path: '' });
                  }
                }}
                placeholder="/about-us"
                className={errors.page_path ? 'border-destructive' : ''}
              />
              {errors.page_path && (
                <p className="text-xs text-destructive">{errors.page_path}</p>
              )}
            </div>

            {/* Page Name */}
            <div className="space-y-2">
              <Label htmlFor="page_name" className="flex items-center gap-1">
                Page Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="page_name"
                value={formData.page_name}
                onChange={(e) => {
                  setFormData({ ...formData, page_name: e.target.value });
                  if (errors.page_name) {
                    setErrors({ ...errors, page_name: '' });
                  }
                }}
                placeholder="About Us"
                className={errors.page_name ? 'border-destructive' : ''}
              />
              {errors.page_name && (
                <p className="text-xs text-destructive">{errors.page_name}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                Title
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: '' });
                  }
                }}
                placeholder="Page Title (max 60 characters)"
                maxLength={60}
                className={errors.title ? 'border-destructive' : ''}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/60 characters
                </p>
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta_description" className="flex items-center gap-1">
                Meta Description
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => {
                  setFormData({ ...formData, meta_description: e.target.value });
                  if (errors.meta_description) {
                    setErrors({ ...errors, meta_description: '' });
                  }
                }}
                placeholder="Meta description (max 160 characters)"
                rows={3}
                maxLength={160}
                className={errors.meta_description ? 'border-destructive' : ''}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 characters
                </p>
                {errors.meta_description && (
                  <p className="text-xs text-destructive">{errors.meta_description}</p>
                )}
              </div>
            </div>

            {/* Open Graph Tags Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Open Graph Tags</h3>

              {/* OG Title */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="og_title">OG Title</Label>
                <Input
                  id="og_title"
                  value={formData.og_title}
                  onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                  placeholder="Open Graph title"
                />
              </div>

              {/* OG Description */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="og_description">OG Description</Label>
                <Textarea
                  id="og_description"
                  value={formData.og_description}
                  onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                  placeholder="Open Graph description"
                  rows={3}
                />
              </div>

              {/* OG Image Upload */}
              <div className="space-y-2 mb-4">
                <Label>OG Image</Label>
                {ogImagePreview ? (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-muted border-2 border-dashed">
                    <img
                      src={ogImagePreview}
                      alt="OG Image Preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveOgImage}
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
                      Click to upload OG image (Max 5MB)
                    </p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleOgImageSelect}
                  className="hidden"
                />
                {errors.og_image && (
                  <p className="text-xs text-destructive">{errors.og_image}</p>
                )}
              </div>

              {/* OG URL */}
              <div className="space-y-2">
                <Label htmlFor="og_url">OG URL</Label>
                <Input
                  id="og_url"
                  value={formData.og_url}
                  onChange={(e) => {
                    setFormData({ ...formData, og_url: e.target.value });
                    if (errors.og_url) {
                      setErrors({ ...errors, og_url: '' });
                    }
                  }}
                  placeholder="https://kindnessripple.pms.mishainfotech.com/about-us"
                  className={errors.og_url ? 'border-destructive' : ''}
                />
                {errors.og_url && (
                  <p className="text-xs text-destructive">{errors.og_url}</p>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  When active, this SEO metadata will be used for the page
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
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
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : selectedMetadata ? (
                'Update SEO Metadata'
              ) : (
                'Create SEO Metadata'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SEO Metadata Details</DialogTitle>
            <DialogDescription>View SEO metadata information</DialogDescription>
          </DialogHeader>
          {selectedMetadata && (
            <div className="space-y-4">
              {selectedMetadata.og_image_url && (
                <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedMetadata.og_image_url}
                    alt="OG Image"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground font-bold">Page Path</Label>
                  <p className="font-medium mt-2">{selectedMetadata.page_path}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-bold">Page Name</Label>
                  <p className="font-medium mt-2">{selectedMetadata.page_name}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground font-bold">Title</Label>
                  <p className="font-medium mt-2">{selectedMetadata.title}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground font-bold">Meta Description</Label>
                  <p className="font-medium whitespace-pre-wrap mt-2">{selectedMetadata.meta_description}</p>
                </div>
                {selectedMetadata.og_title && (
                  <div className="sm:col-span-2">
                    <Label className="text-muted-foreground font-bold">OG Title</Label>
                    <p className="font-medium mt-2">{selectedMetadata.og_title}</p>
                  </div>
                )}
                {selectedMetadata.og_description && (
                  <div className="sm:col-span-2">
                    <Label className="text-muted-foreground font-bold">OG Description</Label>
                    <p className="font-medium whitespace-pre-wrap mt-2">{selectedMetadata.og_description}</p>
                  </div>
                )}
                {selectedMetadata.og_url && (
                  <div className="sm:col-span-2">
                    <Label className="text-muted-foreground font-bold">OG URL</Label>
                    <a
                      href={selectedMetadata.og_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all block mt-2"
                    >
                      {selectedMetadata.og_url}
                    </a>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground font-bold block mb-3">Status</Label>
                  <Badge
                    variant={selectedMetadata.is_active ? 'default' : 'secondary'}
                  >
                    {selectedMetadata.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedMetadata && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEdit(selectedMetadata);
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

