import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Ban,
  TrendingUp,
  CheckCircle,
  Archive,
  Type,
  Download,
  Loader2,
  Search as SearchIcon,
  Filter,
  Eye,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import { showConfirmationDialog, showWarningDialog } from '@/components/ui/confirmation-dialog';

// ✅ Admin Shared Components
import { PageHeader } from '@/components/admin/PageHeader';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { SearchBar } from '@/components/admin/SearchBar';
import { ViewToggle } from '@/components/admin/ViewToggle';
import { DataCard } from '@/components/admin/DataCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import { LoadingOverlay } from '@/components/admin/LoadingOverlay';

// ✅ Shared Hooks
import { useDebounce } from '@/hooks/useDebounce';
import { useExportData } from "@/hooks/useExportData";

interface RippleCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  symbol: string; // Changed from icon to symbol
  icon_url: string; // Added for icon file URL
  order: number;
  active: boolean;
  rippleCount: number;
}

export default function RippleCategories() {
  const [categories, setCategories] = useState<RippleCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<RippleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<RippleCategory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<RippleCategory>>({
    name: '',
    description: '',
    icon_url: '',
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(100);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [editIconPreview, setEditIconPreview] = useState<string>('');

  // ✅ Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { exporting, exportData } = useExportData();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortCategories();
  }, [categories, debouncedSearchQuery, filterStatus, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCategories(page);
  };

    const fetchCategories = async (page: number = currentPage) => {
      try {
        setLoading(true);
        const res = await apiFetch<any>(`/admin/categories?page=${page}&per_page=${perPage}`);
        const cats = res.data.map((cat: any, index: number) => ({
          id: cat.id.toString(),
          name: cat.name,
          description: cat.description || '',
          icon_url: cat.icon_url || '',
          order: cat.order || index + 1,
          active: cat.is_active === true || cat.is_active === 1,
          rippleCount: cat.ripple_count || 0,
        }));
        setCategories(cats);
        setFilteredCategories(cats);
        
        // Update pagination metadata
        if (res.meta) { // Changed from res.data.meta to res.meta
          setCurrentPage(res.meta.current_page);
          setTotalPages(res.meta.last_page);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

  const filterAndSortCategories = () => {
    setSearchLoading(true);
    let filtered = [...categories];

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description.toLowerCase().includes(query) ||
          cat.symbol.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter((cat) => cat.active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((cat) => !cat.active);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'ripples':
        filtered.sort((a, b) => b.rippleCount - a.rippleCount);
        break;
      case 'order':
      default:
        filtered.sort((a, b) => a.order - b.order);
        break;
    }

    setFilteredCategories(filtered);
    setSearchLoading(false);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size should be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    if (type === 'add') {
      setIconFile(file);
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    } else {
      setEditIconFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditIconPreview(previewUrl);
    }
  };

  const handleRemoveIcon = (type: 'add' | 'edit') => {
    if (type === 'add') {
      setIconFile(null);
      setIconPreview('');
      setNewCategory({ ...newCategory, icon_url: '' });
    } else {
      setEditIconFile(null);
      setEditIconPreview('');
      if (selectedCategory) {
        setSelectedCategory({ ...selectedCategory, icon_url: '' });
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name?.trim()) { // Remove description and symbol checks
      toast({
        title: 'Error',
        description: 'Please fill in the category name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description || '');
      formData.append('is_active', newCategory.active ? '1' : '0');
      // Remove order field
      
      if (iconFile) {
        formData.append('icon', iconFile); // Field name is 'icon'
      }

      const response = await apiFetchFormData('/admin/categories', { // Changed endpoint
        method: 'POST',
        body: formData,
      });

      toast({
        title: 'Ripple Symbol Type Added',
        description: 'New Ripple symbol type has been created successfully.',
      });

      setIsAddDialogOpen(false);
      resetAddForm();
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add Ripple symbol',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const formData = new FormData();
      formData.append('name', selectedCategory.name);
      formData.append('description', selectedCategory.description || '');
      formData.append('is_active', selectedCategory.active ? '1' : '0');
      
      // Add clear_icon flag if icon was removed
      if (selectedCategory.icon_url === '' && !editIconFile) {
        formData.append('clear_icon', '1');
      }
      
      if (editIconFile) {
        formData.append('icon', editIconFile);
      }

      const response = await apiFetchFormData(`/admin/update-categories/${selectedCategory.id}`, { // Changed endpoint
        method: 'POST',
        body: formData,
      });

      toast({
        title: 'Ripple Symbol Updated',
        description: 'Ripple Symbol has been updated successfully.',
      });

      setIsEditDialogOpen(false);
      resetEditForm();
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update Ripple symbol',
        variant: 'destructive',
      });
    }
  };

 const resetAddForm = () => {
    setNewCategory({
      name: '',
      description: '',
      icon_url: '',
      active: true,
    });
    setIconFile(null);
    setIconPreview('');
  };

  const resetEditForm = () => {
    setEditIconFile(null);
    setEditIconPreview('');
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    if (category.rippleCount > 0) {
      await showWarningDialog(
        'Cannot Delete Symbol',
        `This Ripple symbol "${category.name}" has ${category.rippleCount} associated ripple(s) and cannot be deleted.`
      );
      return;
    }

    const result = await showConfirmationDialog({
      title: 'Are you sure?',
      text: `This Ripple symbol "${category.name}" will be permanently deleted.`,
      icon: 'warning',
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/trash-categories/${id}`, { method: 'DELETE' });
        toast({
          title: 'Deleted',
          description: `Ripple Symbol "${category.name}" has been deleted.`,
        });
        fetchCategories();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete Ripple symbol',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    if (category.active && category.rippleCount > 0) {
      await showWarningDialog(
        'Cannot Deactivate Ripple Symbol',
        `This Ripple symbol has ${category.rippleCount} ripples and cannot be deactivated.`
      );
      return;
    }

    try {
      await apiFetch(`/admin/update-categories/${id}`, {
        method: 'POST',
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          is_active: category.active ? 0 : 1,
        }),
      });

      toast({
        title: category.active ? 'Ripple Symbol Deactivated' : 'Ripple Symbol Activated',
        description: `${category.name} has been ${category.active ? 'deactivated' : 'activated'}.`,
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex((cat) => cat.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === categories.length - 1)) return;

    const newCategories = [...categories];
    const swapIndex = direction === 'up' ? index - 1 : direction === 'down' ? index + 1 : index;

    const tempOrder = newCategories[index].order;
    newCategories[index].order = newCategories[swapIndex].order;
    newCategories[swapIndex].order = tempOrder;

    [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];

    setCategories(newCategories);
  };

  const handleExport = () => {
    exportData({
      exportEndpoint: "/admin/categories?export=true",
      listEndpoint: "/admin/categories",
      dataKey: "data",
      fileNamePrefix: 'ripple-categories',
      filters: {
        search: searchQuery.trim() || undefined,
        is_active: filterStatus !== 'all' ? (filterStatus === 'active' ? 'true' : 'false') : undefined,
        per_page: perPage === "all" ? undefined : perPage,
        page: perPage === "all" ? "all" : 1,
      },
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'symbol', label: 'Symbol' },
        { key: 'icon_url', label: 'Icon URL' },
        { key: 'color', label: 'Color' },
        { key: 'order', label: 'Order' },
        { key: 'status', label: 'Status' },
        { key: 'ripple_count', label: 'Ripple Count' },
      ],
    });
  };

  const handleRefresh = () => {
    fetchCategories();
    toast({ title: 'Refreshed', description: 'Ripple symbols reloaded successfully.' });
  };

  const totalRipples = categories.reduce((acc, cat) => acc + cat.rippleCount, 0);
  const activeCount = categories.filter((c) => c.active).length;
  const mostPopular = [...categories].sort((a, b) => b.rippleCount - a.rippleCount)[0];

  const stats = [
    {
      title: 'Total Ripple Symbols',
      value: categories.length,
      description: 'All ripple symbols',
      icon: Type,
      color: 'blue' as const,
    },
    {
      title: 'Active',
      value: activeCount,
      description: 'Currently enabled',
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      title: 'Most Popular',
      value: mostPopular?.name || 'N/A',
      description: `${mostPopular?.rippleCount || 0} ripples`,
      icon: Archive,
      color: 'orange' as const,
    },
  ];

  if (loading && !searchLoading) {
    return <LoadingState message="Loading ripple symbols..." />;
  }

  const CategoryIcon = ({ category }: { category: RippleCategory }) => {
    if (category.icon_url) {
      return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-muted">
          <img 
            src={category.icon_url} 
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }
    
    // Fallback when no icon
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted">
        <Type className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Ripple Symbols
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage symbols for ripple actions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleExport} size="sm" variant="outline" disabled={exporting} className="flex items-center gap-2">
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
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Ripple Symbol Type</span>
          </Button>
        </div>
      </div>

      {/* ✅ Stats Grid */}
      <StatsGrid stats={stats} loading={loading} grid_count={3} />

      {/* ✅ Ripple Symbols List */}
      <DataCard
        title="Ripple Symbol List"
        description="Manage and organize ripple symbols"
        icon={Filter}
        loading={searchLoading}
        loadingMessage="Loading ripple symbols..."
        actions={<ViewToggle viewType={viewType} onViewChange={setViewType} disabled={searchLoading} />}
      >
        {searchLoading && <LoadingOverlay message="Filtering ripple symbols..." />}

        {/* 2-Row Layout with proper alignment */}
        <div className="space-y-4 mb-6">
          {/* First Row: Per-page selector, Search bar, and Sort dropdown */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex items-center gap-2">
              <Label htmlFor="per-page" className="text-sm font-medium text-gray-700">Show:</Label>
              <Select value={perPage.toString()} onValueChange={(value) => {
                const newPerPage = value === "all" ? "all" : parseInt(value);
                setPerPage(newPerPage);
                setCurrentPage(1);
                fetchCategories(1);
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
              <span className="text-sm text-gray-600">per page</span>
            </div>
            <div className="flex-1 lg:max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search ripple symbols by name, symbol, or description..."
                loading={searchLoading}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 h-10">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="ripples">Most Ripples</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Second Row: Status filter and Clear filters button */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 h-10">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setSortBy('order');
              }}
              className="w-full sm:w-auto"
            >
              Clear All Filters
            </Button>
          </div>
        </div>

        {viewType === "list" ? (
          filteredCategories.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">S.No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Symbol</th>
                    <th className="px-4 py-3 text-left font-semibold">Ripples</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveCategory(category.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            ↑
                          </Button>
                          <span className="font-medium">{category.order}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveCategory(category.id, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{category.description}</td>
                      <td className="px-4 py-3">
                        {category.icon_url ? (
                          <img 
                            src={category.icon_url} 
                            alt={category.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded flex items-center justify-center bg-muted">
                            <Type className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{category.rippleCount}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={category.active ? 'default' : 'secondary'}>
                          {category.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCategory(category);
                                setEditIconPreview(category.icon_url || '');
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(category.id)}
                              disabled={category.active && category.rippleCount > 0}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {category.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`text-destructive ${category.rippleCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={category.rippleCount > 0}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
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
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState
                icon={searchQuery || filterStatus !== 'all' ? SearchIcon : Type}
                title={searchQuery || filterStatus !== 'all' ? 'No ripple symbols found' : 'No ripple symbols yet'}
                description={
                  searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Create your first ripple symbol to get started.'
                }
                action={
                  searchQuery || filterStatus !== 'all'
                    ? {
                        label: 'Clear filters',
                        onClick: () => {
                          setSearchQuery('');
                          setFilterStatus('all');
                        },
                      }
                    : {
                        label: 'Add Ripple Symbol Type',
                        onClick: () => setIsAddDialogOpen(true),
                      }
                }
              />
            </div>
          )
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CategoryIcon category={category} />
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
                              setSelectedCategory(category);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(category);
                              setEditIconPreview(category.icon_url || '');
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(category.id);
                            }}
                            disabled={category.active && category.rippleCount > 0}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            {category.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`text-destructive ${category.rippleCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category.id);
                            }}
                            disabled={category.rippleCount > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        <Badge variant="outline">{category.symbol}</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-xs font-mono text-muted-foreground">{category.color}</span>
                      </div>
                      <Badge variant={category.active ? 'default' : 'secondary'}>
                        {category.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ripples</span>
                      <Badge variant="outline">{category.rippleCount}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={searchQuery || filterStatus !== 'all' ? SearchIcon : Type}
                  title={searchQuery || filterStatus !== 'all' ? 'No ripple symbols found' : 'No ripple symbols yet'}
                  description={
                    searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Create your first ripple symbol to get started.'
                  }
                  action={
                    searchQuery || filterStatus !== 'all'
                      ? {
                          label: 'Clear filters',
                          onClick: () => {
                            setSearchQuery('');
                            setFilterStatus('all');
                          },
                        }
                      : {
                          label: 'Add Ripple Symbol Type',
                          onClick: () => setIsAddDialogOpen(true),
                        }
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DataCard>

      {/* ✅ Edit Category Dialog */}
      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Ripple Symbol</DialogTitle>
              <DialogDescription>Update Ripple symbol information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ripple Symbol Name *</Label>
                <Input
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="space-y-2">
                  {selectedCategory.icon_url || editIconPreview ? (
                    <div className="relative w-20 h-20 rounded overflow-hidden border">
                      <img 
                        src={editIconPreview || selectedCategory.icon_url} 
                        alt="Icon preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveIcon('edit')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="edit-icon-upload"
                      className="cursor-pointer border rounded-md px-3 py-2 flex items-center gap-2 hover:bg-muted"
                    >
                      <Upload className="h-4 w-4" />
                      {editIconFile ? 'Change Icon' : 'Upload Icon'}
                    </Label>
                    <input
                      id="edit-icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleIconUpload(e, 'edit')}
                      className="hidden"
                    />
                    {editIconFile && (
                      <span className="text-sm text-muted-foreground">
                        {editIconFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a small icon image (max 2MB). Recommended: 64x64px PNG/SVG
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={selectedCategory.active}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, active: e.target.checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ✅ Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Ripple Symbol</DialogTitle>
            <DialogDescription>Create a new ripple symbol</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Symbol Name *</Label>
              <Input
                value={newCategory.name || ''}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Kindness"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={newCategory.description || ''}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Briefly describe this category..."
              />
            </div>
            
            <div>
              <Label>Icon</Label>
              <div className="space-y-2">
                {iconPreview ? (
                  <div className="relative w-20 h-20 rounded overflow-hidden border">
                    <img 
                      src={iconPreview} 
                      alt="Icon preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveIcon('add')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="icon-upload"
                    className="cursor-pointer border rounded-md px-3 py-2 flex items-center gap-2 hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    {iconFile ? 'Change Icon' : 'Upload Icon'}
                  </Label>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIconUpload(e, 'add')}
                    className="hidden"
                  />
                  {iconFile && (
                    <span className="text-sm text-muted-foreground">
                      {iconFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a small icon image (max 2MB). Recommended: 64x64px PNG/SVG
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="add-active"
                checked={newCategory.active ?? true}
                onChange={(e) => setNewCategory({ ...newCategory, active: e.target.checked })}
              />
              <Label htmlFor="add-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetAddForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedCategory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCategory.name}</DialogTitle>
                <DialogDescription>Ripple Symbol details</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="flex items-start gap-4">
                  <CategoryIcon category={selectedCategory} />
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Symbol</p>
                      <p className="font-medium text-lg">{selectedCategory.symbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={selectedCategory.active ? 'default' : 'secondary'}>
                        {selectedCategory.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{selectedCategory.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ripple Count</p>
                    <p className="font-medium">{selectedCategory.rippleCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Icon</p>
                    <div className="mt-1">
                      {selectedCategory.icon_url ? (
                        <img 
                          src={selectedCategory.icon_url} 
                          alt="Category icon"
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">No icon</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}