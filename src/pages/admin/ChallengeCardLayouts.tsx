import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Layout, Image as ImageIcon, Search, Filter, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import Swal from "sweetalert2";

interface ChallengeLayout {
  id: number;
  name: string;
  category: string;
  layout_image_path: string | null;
  image_url?: string;
  is_active: boolean;
}

const CATEGORIES = ['At Home', 'At School', 'Friendship', 'Gratitude', 'Daily', 'Weekly', 'Monthly'];

export default function ChallengeCardLayouts() {
  const [layouts, setLayouts] = useState<ChallengeLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      setLayouts([]);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      // const response = await apiFetch<{ data: ChallengeLayout[] }>(`/admin/challenge-layouts?${params.toString()}`);
      const response = await apiFetch<{ data: ChallengeLayout[] }>(
        `/admin/challenge-layouts?${params.toString()}&t=${Date.now()}`
      );

      setLayouts(response.data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch layouts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, [categoryFilter]);

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: '', category: '' });
    setImageFile(null);
    setImagePreview('');
    setDialogOpen(true);
  };

  const handleEdit = (layout: ChallengeLayout) => {
    setEditingId(layout.id);
    setFormData({ name: layout.name, category: layout.category });
    setImageFile(null);
    setImagePreview(layout.image_url || '');
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || (!imageFile && !editingId)) {
      toast({ title: 'Validation Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      if (imageFile) {
        data.append('layout_image', imageFile);
      }
      if (editingId) {
        data.append('_method', 'POST');
        await apiFetchFormData(`/admin/challenge-layouts/update/${editingId}`, {
          method: 'POST',
          body: data
        });
        toast({ title: 'Success', description: 'Layout updated successfully' });
      } else {
        await apiFetchFormData('/admin/challenge-layouts', {
          method: 'POST',
          body: data
        });
        toast({ title: 'Success', description: 'Layout created successfully' });
      }

      setDialogOpen(false);
      fetchLayouts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save layout', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Layout?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/challenge-layouts/${id}`, { method: 'DELETE' });
        toast({ title: 'Deleted!', description: 'Layout has been deleted.', variant: "default" });
        fetchLayouts();
      } catch (error: any) {
        toast({ title: 'Error', description: 'Failed to delete layout', variant: 'destructive' });
      }
    }
  };

  const filteredLayouts = layouts.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-4">
        {/* Header removed from Master integration */}
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Layout
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search layouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredLayouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 border-2 border-dashed rounded-xl bg-muted/30">
          <div className="bg-primary/10 p-6 rounded-full">
            <Layout className="h-12 w-12 text-primary" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-semibold">No layouts found</h3>
            <p className="text-muted-foreground">Upload your first layout template to get started.</p>
          </div>
          <Button onClick={handleCreate} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Layout
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredLayouts.map(layout => (
            <Card key={layout.id} className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="bg-muted relative">
                {layout.image_url ? (
                  <img
                    src={layout.image_url}
                    alt={layout.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button size="icon" variant="secondary" onClick={() => handleEdit(layout)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(layout.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg truncate">{layout.name}</h3>
                <p className="text-sm text-muted-foreground">{layout.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Layout' : 'New Layout'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Layout Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Blue Wave"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Layout Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2 border" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Uploading...' : 'Create Layout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}