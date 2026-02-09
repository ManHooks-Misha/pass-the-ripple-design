import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Award,
  Layers,
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
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface TierFormData {
  name: string;
  display_order: number;
  is_active: boolean;
}

// ======================
// TIER DIALOG COMPONENT
// ======================

interface TierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  tierForm: TierFormData;
  onFormChange: <T extends keyof TierFormData>(
    field: T,
    value: TierFormData[T]
  ) => void;
  onSubmit: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  loading: boolean;
}

const TierDialog: React.FC<TierDialogProps> = ({
  open,
  onOpenChange,
  isEdit,
  tierForm,
  onFormChange,
  onSubmit,
  onFileChange,
  onRemoveImage,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {isEdit ? "Edit Tier" : "Create New Tier"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tier Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tier Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Bronze, Silver, Gold, Ultimate"
              value={tierForm.name}
              onChange={(e) => onFormChange("name", e.target.value)}
            />
          </div>

          {/* Level */}
          {/* <div className="space-y-2">
            <Label htmlFor="level">
              Level <span className="text-red-500">*</span>
            </Label>
            <Input
              id="level"
              type="number"
              min="1"
              placeholder="e.g., 1, 2, 3, 4"
              value={tierForm.level}
              onChange={(e) => onFormChange("level", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Tier level (1 = lowest, higher numbers = higher tiers)
            </p>
          </div> */}

          {/* Color */}
          {/* <div className="space-y-2">
            <Label htmlFor="color">Tier Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={tierForm.color}
                onChange={(e) => onFormChange("color", e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={tierForm.color}
                onChange={(e) => onFormChange("color", e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div> */}

          {/* Description */}
          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this tier level..."
              value={tierForm.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              rows={3}
            />
          </div> */}

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min="0"
              value={tierForm.display_order}
              onChange={(e) =>
                onFormChange("display_order", parseInt(e.target.value) || 0)
              }
            />
            <p className="text-xs text-muted-foreground">
              Order in which this tier appears in lists
            </p>
          </div>

          {/* Icon Upload */}
          {/* <div className="space-y-2">
            <Label>Tier Icon (Optional)</Label>
            <div className="flex items-center gap-4">
              {tierForm.iconPreview && (
                <div className="relative">
                  <img
                    src={tierForm.iconPreview}
                    alt="Icon preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={onRemoveImage}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={onFileChange}
              />
            </div>
          </div> */}

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={tierForm.is_active}
              onChange={(e) => onFormChange("is_active", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active (Available for use)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Tier" : "Create Tier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ======================
// MAIN COMPONENT
// ======================

const Tiers: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [tierForm, setTierForm] = useState<TierFormData>({
    name: "",
    display_order: 0,
    is_active: true,
  });

  // Fetch tiers
  const fetchTiers = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await apiFetch("/admin/tiers?q="+Date.now());
      if (response.success) {
        setTiers(response.data || []);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch tiers",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  // Handle form changes
  const handleFormChange = <T extends keyof TierFormData>(
    field: T,
    value: TierFormData[T]
  ) => {
    setTierForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTierForm((prev) => ({
        ...prev,
      }));
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setTierForm((prev) => ({
      ...prev,
    }));
  };

  // Reset form
  const resetForm = () => {
    setTierForm({
      name: "",
      display_order: 0,
      is_active: true,
    });
    setIsEdit(false);
    setEditingId(null);
  };

  // Open create dialog
  const handleCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (tier: Tier) => {
    setIsEdit(true);
    setEditingId(tier.id);
    setTierForm({
      name: tier.name,
      display_order: tier.display_order,
      is_active: tier.is_active
    });
    setDialogOpen(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!tierForm.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Tier name is required",
      });
      return;
    }

    if (tierForm.level < 1) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Level must be at least 1",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", tierForm.name);
      // formData.append("level", tierForm.level.toString());
      // formData.append("color", tierForm.color);
      // formData.append("description", tierForm.description);
      formData.append("display_order", tierForm.display_order.toString());
      formData.append("is_active", tierForm.is_active ? "1" : "0");

      if (tierForm.icon) {
        formData.append("icon", tierForm.icon);
      }

      const endpoint = isEdit
        ? `/admin/tiers/${editingId}`
        : "/admin/tiers";

      if (isEdit) {
        formData.append("_method", "PUT");
      }

      const response = await apiFetchFormData(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || `Tier ${isEdit ? "updated" : "created"} successfully`,
        });
        setDialogOpen(false);
        resetForm();
        fetchTiers();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEdit ? "update" : "create"} tier`,
      });
    } finally {
      setLoading(false);
      fetchTiers();
    }
  };

  // Delete tier
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This tier will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await apiFetch(`/admin/tiers/${id}`, {
          method: "DELETE",
        });

        if (response.success) {
          toast({
            title: "Success",
            description: "Tier deleted successfully",
          });
          fetchTiers(true);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to delete tier",
        });
      }
    }
  };

  // Toggle status
  const handleToggleStatus = async (id: number) => {
    try {
      const response = await apiFetch(`/admin/tiers/${id}/toggle-status`, {
        method: "POST",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Tier status updated",
        });
        fetchTiers(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8" />
            Tier Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage progression tier levels for the gamification system
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Tier
        </Button>
      </div>

      {/* Tiers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tiers</CardTitle>
          <CardDescription>
            View and manage all tier levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && tiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tiers...
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tiers found. Create your first tier to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>Level</TableHead> */}
                  <TableHead>Name</TableHead>
                  {/* <TableHead>Color</TableHead> */}
                  {/* <TableHead>Icon</TableHead> */}
                  {/* <TableHead>Description</TableHead> */}
                  <TableHead>Display Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    {/* <TableCell>
                      <Badge variant="outline">{tier.level}</Badge>
                    </TableCell> */}
                    <TableCell className="font-medium">
                      {tier.name}
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: tier.color || "#000" }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {tier.color}
                        </span>
                      </div>
                    </TableCell> */}
                    {/* <TableCell>
                      {tier.icon_path ? (
                        <img
                          src={getImageUrl(tier.icon_path)}
                          alt={tier.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No icon
                        </span>
                      )}
                    </TableCell> */}
                    {/* <TableCell className="max-w-xs truncate">
                      {tier.description || "—"}
                    </TableCell> */}
                    <TableCell>{tier.display_order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tier.is_active ? "default" : "secondary"}
                      >
                        {tier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleStatus(tier.id)}
                          title={tier.is_active ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(tier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(tier.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tier Dialog */}
      <TierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isEdit={isEdit}
        tierForm={tierForm}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
        onRemoveImage={handleRemoveImage}
        loading={loading}
      />
    </div>
  );
};

export default Tiers;
