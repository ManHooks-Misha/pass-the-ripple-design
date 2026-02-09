import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ImageIcon,
  Award,
  Grid3x3,
  List,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiFetchFormData } from "@/config/api";
import Swal from "sweetalert2";
import { getImageUrl } from "@/utils/imageUrl";

// ======================
// TYPES
// ======================

interface Tier {
  id: number;
  name: string;
  level: number;
  color: string;
}

interface BadgeData {
  id: number;
  name: string;
  required_count: number;
  badge_image_path?: string;
  tier_id: number;
  tier?: Tier;
  status: 'draft' | 'published' | 'unpublished';
  // is_active: boolean;
  display_order: number;
  created_at: string;
}

// ======================
// MAIN COMPONENT
// ======================

export default function RewardBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    required_count: 10,
    tier_id: "",
    status: "draft" as 'draft' | 'published' | 'unpublished',
    // is_active: true,
    display_order: 0,
  });
  const [badgeImage, setBadgeImage] = useState<File | null>(null);
  const [badgeImagePreview, setBadgeImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Load badges and tiers
  const loadBadges = async () => {
    setLoading(true);

    try {
      setBadges([]);
      console.log('update time');
      // Use admin endpoint to get all badges (including drafts/inactive)
      // const response = await apiFetch<any>("/admin/badges");
      const response = await apiFetch<any>(`/admin/badges?t=${Date.now()}`);
      let badgesData = Array.isArray(response) ? response : response?.data || [];
      // If response.data is pagination object, extract data array
      if (response?.data && response?.data.data && Array.isArray(response.data.data)) {
        badgesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        badgesData = response.data;
      }

      setBadges(badgesData);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e?.message || "Failed to load badges",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTiers = async () => {
    try {
      const response = await apiFetch<any>("/admin/tiers?q="+Date.now());
      const tiersData = Array.isArray(response) ? response : response?.data || [];
      setTiers(tiersData);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e?.message || "Failed to load tiers",
      });
    }
  };

  useEffect(() => {
    loadBadges();
    loadTiers();
  }, []);

  // Handle create new badge
  const handleCreate = () => {
    setEditingBadge(null);
    setFormData({
      name: "",
      required_count: 10,
      tier_id: "",
      status: "draft",
      // is_active: true,
      display_order: 0,
    });
    setBadgeImage(null);
    setBadgeImagePreview("");
    setDialogOpen(true);
  };

  // Handle edit badge
  const handleEdit = (badge: BadgeData) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      required_count: badge.required_count,
      tier_id: badge.tier_id?.toString() || "",
      status: badge.status,
      // is_active: badge.is_active,
      display_order: badge.display_order,
    });
    setBadgeImage(null);
    setBadgeImagePreview(badge.badge_image_path ? getImageUrl(badge.badge_image_path) : "");
    setDialogOpen(true);
  };

  // Handle delete badge
  const handleDelete = async (badge: BadgeData) => {
    const result = await Swal.fire({
      title: "Delete Badge?",
      text: `Are you sure you want to delete "${badge.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/delete-badges/${badge.id}`, { method: "DELETE" });
        toast({ title: "Success", description: "Badge deleted successfully" });
        loadBadges();
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: e?.message || "Failed to delete badge",
        });
      }
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBadgeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBadgeImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Badge name is required",
      });
      return;
    }

    if (!formData.tier_id) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a tier",
      });
      return;
    }

    setSaving(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("required_count", formData.required_count.toString());
      submitFormData.append("tier_id", formData.tier_id);
      submitFormData.append("status", formData.status);
      // submitFormData.append("is_active", formData.is_active ? "1" : "0");
      submitFormData.append("display_order", formData.display_order.toString());

      if (badgeImage) {
        submitFormData.append("badge_image", badgeImage);
      }

      if (editingBadge) {
        await apiFetchFormData(`/admin/update-badges/${editingBadge.id}`, {
          method: "POST",
          body: submitFormData,
        });
        toast({ title: "Success", description: "Badge updated successfully" });
      } else {
        await apiFetchFormData("/admin/create-badges", {
          method: "POST",
          body: submitFormData,
        });
        toast({ title: "Success", description: "Badge created successfully" });
      }

      setDialogOpen(false);
      loadBadges();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e?.message || "Failed to save badge",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get tier color
  const getTierColor = (tier?: Tier) => {
    if (!tier) return "bg-gray-500";
    return tier.color || "bg-gray-500";
  };

  // Group badges by tier
  const badgesByTier = badges.reduce((acc, badge) => {
    const tierName = badge.tier?.name || "No Tier";
    if (!acc[tierName]) acc[tierName] = [];
    acc[tierName].push(badge);
    return acc;
  }, {} as Record<string, BadgeData[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Badge Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage badges and assign them to tiers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Award className="h-4 w-4 mr-2" />
            {badges.length} Badges
          </Badge>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Badge
          </Button>
        </div>
      </div>

      {/* Badges Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 border-2 border-dashed rounded-xl bg-muted/30">
          <div className="bg-primary/10 p-6 rounded-full">
            <Award className="h-12 w-12 text-primary" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-semibold">No badges found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first badge. Badges are awarded to users for completing challenges and reaching new tiers.
            </p>
          </div>
          <Button onClick={handleCreate} className="mt-6" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create First Badge
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(badgesByTier).map(([tierName, tierBadges]) => (
            <div key={tierName}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {tierName}
                  <Badge variant="outline">{tierBadges.length} badge{tierBadges.length !== 1 ? 's' : ''}</Badge>
                </h2>
                <div className="h-1 w-20 bg-primary rounded-full mt-2" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {tierBadges.map((badge) => (
                  <Card key={badge.id} className="hover:shadow-xl transition-all duration-300 border overflow-hidden group">
                    {/* Badge Image */}
                    <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 p-4 aspect-square">
                      {badge.badge_image_path ? (
                        <img
                          src={getImageUrl(badge.badge_image_path)}
                          alt={badge.name}
                          className="w-full h-full object-cover rounded-lg"
                          title={badge.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {/* Status Indicator */}
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ring-2 ring-white shadow-md ${badge.status === 'published' ? 'bg-green-500' :
                        badge.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} title={badge.status} />
                    </div>

                    {/* Badge Info */}
                    <CardContent className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1" title={badge.name}>
                        {badge.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className={`h-5 text-[10px] px-1.5 capitalize ${badge.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                          badge.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                          {badge.status}
                        </Badge>
                        <Badge variant="outline" className={`h-5 text-[10px] px-1.5 capitalize bg-gray-50 text-gray-700 border-gray-200'}`}>
                         Need Card : {badge.required_count}
                        </Badge>
                      </div>
                    </CardContent>

                    {/* Action Buttons */}
                    <CardFooter className="p-2 pt-0 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(badge)} className="flex-1 h-7 text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(badge)} className="h-7 px-2">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Badges</CardTitle>
            <CardDescription>Complete list of all badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Badge Image */}
                  <div className="flex-shrink-0">
                    {badge.badge_image_path ? (
                      <img
                        src={getImageUrl(badge.badge_image_path)}
                        alt={badge.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg border-2 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base">{badge.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{badge.required_count}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`capitalize ${badge.status === 'published' ? 'bg-green-100 text-green-800' :
                        badge.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {badge.status}
                      </Badge>
                      {badge.tier && (
                        <Badge variant="outline">
                          {badge.tier.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(badge)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(badge)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBadge ? "Edit Badge" : "Create New Badge"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Badge Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Badge Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Community Champion"
              />
            </div>

            {/* Description */}
            {/* <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this badge represents..."
                rows={3}
              />
            </div> */}

            {/* Tier Selection */}
            <div className="space-y-2">
              <Label htmlFor="tier">Tier *</Label>
              <Select
                value={formData.tier_id}
                onValueChange={(value) => setFormData({ ...formData, tier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id.toString()}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_count">Collection of Challenge Cards Required *</Label>
              <Input
                id="required_count"
                value={formData.required_count}
                onChange={(e) => setFormData({ ...formData, required_count: e.target.valueAsNumber })}
                placeholder="e.g., Community Champion"
                type="number"
              />
            </div>

            {/* Badge Image */}
            <div className="space-y-2">
              <Label htmlFor="badge_image">Badge Image</Label>
              <Input
                id="badge_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {badgeImagePreview && (
                <div className="mt-2">
                  <img
                    src={badgeImagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">Active</Label>
            </div> */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingBadge ? "Update Badge" : "Create Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
