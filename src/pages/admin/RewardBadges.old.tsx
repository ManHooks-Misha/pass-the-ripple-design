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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Award,
  ImageIcon,
  X,
  Layers,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiFetchFormData } from "@/config/api";
import Swal from "sweetalert2";
import { getImageUrl } from "@/utils/imageUrl";

// ======================
// TYPES
// ======================

interface SystemTier {
  id: number;
  name: string;
  level: number;
  color: string;
  description?: string;
}

interface BadgeTierForm {
  selected: boolean;
  cards_required: number;
  points_reward: number;
  badge_image: File | null;
  badge_image_preview: string;
}

interface BadgeData {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
  tier_count: number;
  created_at: string;
}

interface BadgeFormData {
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

// ======================
// BADGE FORM DIALOG
// ======================

interface BadgeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: BadgeData | null;
  onSuccess: () => void;
}

const BadgeFormDialog: React.FC<BadgeFormDialogProps> = ({
  open,
  onOpenChange,
  badge,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<BadgeFormData>({
    name: "",
    description: "",
    is_active: true,
    display_order: 0,
  });
  const [systemTiers, setSystemTiers] = useState<SystemTier[]>([]);
  const [tierForms, setTierForms] = useState<Record<number, BadgeTierForm>>({});
  const [cardTypeRequired, setCardTypeRequired] = useState<string>("any");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load system tiers
  const loadSystemTiers = async () => {
    try {
      const response = await apiFetch<any>("/admin/available-tiers");
      const tiers = response.data || [];
      setSystemTiers(tiers);

      // Initialize tier forms
      const defaultForms: Record<number, BadgeTierForm> = {};
      tiers.forEach((tier: SystemTier) => {
        defaultForms[tier.level] = {
          selected: false,
          cards_required: tier.level === 1 ? 5 : tier.level === 2 ? 15 : tier.level === 3 ? 30 : 60,
          points_reward: tier.level * 100,
          badge_image: null,
          badge_image_preview: "",
        };
      });
      setTierForms(defaultForms);
    } catch (e: any) {
      console.error("Failed to load tiers:", e);
    }
  };

  // Load existing badge data if editing
  const loadBadgeData = async () => {
    if (!badge) return;

    setLoading(true);
    try {
      // Set badge basic data
      setFormData({
        name: badge.name,
        description: badge.description,
        is_active: badge.is_active,
        display_order: badge.display_order,
      });

      // Load badge tiers
      const response = await apiFetch<any>(`/admin/badges/${badge.id}/tiers`);
      const tiersData = Array.isArray(response?.data) ? response.data : [];

      if (tiersData.length > 0) {
        const updatedForms = { ...tierForms };

        tiersData.forEach((tier: any) => {
          updatedForms[tier.tier_level] = {
            selected: true,
            cards_required: tier.cards_required,
            points_reward: tier.points_reward || 0,
            badge_image: null,
            badge_image_preview: tier.badge_image_path ? getImageUrl(tier.badge_image_path) : "",
          };
        });

        setTierForms(updatedForms);

        if (tiersData[0]) {
          setCardTypeRequired(tiersData[0].card_type_required);
        }
      }
    } catch (e: any) {
      console.error("Failed to load badge data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSystemTiers().then(() => {
        if (badge) {
          loadBadgeData();
        } else {
          // Reset for new badge
          setFormData({
            name: "",
            description: "",
            is_active: true,
            display_order: 0,
          });
          setCardTypeRequired("any");
        }
      });
    }
  }, [open, badge]);

  const handleTierToggle = (level: number, checked: boolean) => {
    setTierForms({
      ...tierForms,
      [level]: {
        ...tierForms[level],
        selected: checked,
      },
    });
  };

  const handleTierFieldChange = (level: number, field: keyof BadgeTierForm, value: any) => {
    setTierForms({
      ...tierForms,
      [level]: {
        ...tierForms[level],
        [field]: value,
      },
    });
  };

  const handleImageChange = (level: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTierForms({
        ...tierForms,
        [level]: {
          ...tierForms[level],
          badge_image: file,
          badge_image_preview: URL.createObjectURL(file),
        },
      });
    }
  };

  const handleRemoveImage = (level: number) => {
    setTierForms({
      ...tierForms,
      [level]: {
        ...tierForms[level],
        badge_image: null,
        badge_image_preview: "",
      },
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Badge name is required",
      });
      return;
    }

    const selectedTiers = systemTiers.filter((tier) => tierForms[tier.level]?.selected);

    if (selectedTiers.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least one tier",
      });
      return;
    }

    // Validate badge images
    for (const tier of selectedTiers) {
      const form = tierForms[tier.level];
      if (!form.badge_image && !form.badge_image_preview) {
        toast({
          variant: "destructive",
          title: "Missing Badge Image",
          description: `Please upload a badge image for ${tier.name} tier`,
        });
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Create/Update Badge
      let badgeId = badge?.id;

      if (badge) {
        // Update existing badge
        await apiFetch(`/admin/update-badges/${badge.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new badge
        const badgeResponse = await apiFetch("/admin/create-badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        badgeId = badgeResponse.data?.id || badgeResponse.badge?.id;
      }

      if (!badgeId) {
        throw new Error("Failed to get badge ID");
      }

      // 2. Delete existing tiers if updating
      if (badge) {
        const existingTiers = await apiFetch<any>(`/admin/badges/${badgeId}/tiers`);
        const tiersData = Array.isArray(existingTiers?.data) ? existingTiers.data : [];

        for (const tier of tiersData) {
          await apiFetch(`/admin/badges/${badgeId}/tiers/${tier.id}`, {
            method: "DELETE",
          });
        }
      }

      // 3. Create new tiers
      for (const tier of selectedTiers) {
        const form = tierForms[tier.level];
        const formDataTier = new FormData();

        formDataTier.append("tier_level", tier.level.toString());
        formDataTier.append("tier_name", tier.name);
        formDataTier.append("cards_required", form.cards_required.toString());
        formDataTier.append("card_type_required", cardTypeRequired);
        formDataTier.append("points_reward", form.points_reward.toString());
        formDataTier.append("description", tier.description || "");

        if (form.badge_image) {
          formDataTier.append("badge_image", form.badge_image);
        }

        await apiFetchFormData(`/admin/badges/${badgeId}/tiers`, {
          method: "POST",
          body: formDataTier,
        });
      }

      toast({
        title: "Success",
        description: badge ? "Badge updated successfully!" : "Badge created successfully!",
      });

      onSuccess();
      onOpenChange(false);
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

  const selectedCount = Object.values(tierForms).filter((f) => f.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            {badge ? "Edit Badge" : "Create New Badge"}
          </DialogTitle>
          <DialogDescription>
            Configure badge details and select tiers with their requirements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Badge Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Badge Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Star of Kindness"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this badge..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (Available for earning)
              </Label>
            </div>
          </div>

          {/* Card Type */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <Label className="text-sm font-semibold mb-2 block">Card Type Required</Label>
            <Select value={cardTypeRequired} onValueChange={setCardTypeRequired}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Card Type</SelectItem>
                <SelectItem value="daily">Daily Cards Only</SelectItem>
                <SelectItem value="weekly">Weekly Cards Only</SelectItem>
                <SelectItem value="monthly">Monthly Cards Only</SelectItem>
                <SelectItem value="ripple">Ripple Cards Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tiers Configuration */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Configure Tiers ({selectedCount} selected)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select which tiers and upload badge images
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemTiers.map((tier) => {
                const form = tierForms[tier.level] || {
                  selected: false,
                  cards_required: tier.level * 10,
                  points_reward: tier.level * 100,
                  badge_image: null,
                  badge_image_preview: "",
                };

                return (
                  <div
                    key={tier.id}
                    className={`border-2 rounded-lg p-4 transition-all ${form.selected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox
                        checked={form.selected}
                        onCheckedChange={(checked) => handleTierToggle(tier.level, checked as boolean)}
                        className="h-5 w-5"
                      />
                      <div
                        className="px-3 py-1 rounded-full text-sm font-semibold border-2 flex-1"
                        style={{
                          backgroundColor: `${tier.color}20`,
                          borderColor: tier.color,
                          color: tier.color,
                        }}
                      >
                        Tier {tier.level} - {tier.name}
                      </div>
                    </div>

                    {form.selected && (
                      <div className="space-y-3 pl-8">
                        <div>
                          <Label className="text-xs font-semibold">
                            Badge Image <span className="text-red-500">*</span>
                          </Label>
                          <div className="mt-2 flex items-start gap-3">
                            {form.badge_image_preview ? (
                              <div className="relative">
                                <img
                                  src={form.badge_image_preview}
                                  alt={tier.name}
                                  className="w-20 h-20 object-cover rounded-lg border-2"
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                                  onClick={() => handleRemoveImage(tier.level)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(tier.level, e)}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Cards Required</Label>
                            <Input
                              type="number"
                              min="1"
                              value={form.cards_required}
                              onChange={(e) =>
                                handleTierFieldChange(tier.level, "cards_required", parseInt(e.target.value) || 1)
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Points Reward</Label>
                            <Input
                              type="number"
                              min="0"
                              value={form.points_reward}
                              onChange={(e) =>
                                handleTierFieldChange(tier.level, "points_reward", parseInt(e.target.value) || 0)
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="text-xs bg-muted p-2 rounded">
                          Need <strong>{form.cards_required}</strong> cards → Get <strong>{form.points_reward}</strong> points
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedCount === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg mt-4">
                <Layers className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Select at least one tier</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || selectedCount === 0}>
            {saving ? "Saving..." : badge ? "Update Badge" : "Create Badge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ======================
// MAIN COMPONENT
// ======================

export default function RewardBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<any>("/badges");
      const data = Array.isArray(response) ? response : response?.data || [];
      setBadges(data);
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

  useEffect(() => {
    loadBadges();
  }, []);

  const handleCreate = () => {
    setSelectedBadge(null);
    setDialogOpen(true);
  };

  const handleEdit = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setDialogOpen(true);
  };

  const handleDelete = async (badge: BadgeData) => {
    const result = await Swal.fire({
      title: "Delete Badge?",
      text: `This will permanently delete "${badge.name}" and all its tiers.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/admin/delete-badges/${badge.id}`, { method: "DELETE" });
        toast({
          title: "Success",
          description: "Badge deleted successfully",
        });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8" />
            Badge Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage badges with tier-based progression
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Badge
        </Button>
      </div>

      {/* Badges Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Badges</CardTitle>
          <CardDescription>View and manage all badge configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading badges...</div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Badges Yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first badge to get started
              </p>
              <Button onClick={handleCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create First Badge
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tiers</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges.map((badge) => (
                  <TableRow key={badge.id}>
                    <TableCell className="font-medium">{badge.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{badge.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {badge.tier_count} tiers
                      </Badge>
                    </TableCell>
                    <TableCell>{badge.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={badge.is_active ? "default" : "secondary"}>
                        {badge.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(badge)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(badge)}
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

      {/* Badge Form Dialog */}
      <BadgeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        badge={selectedBadge}
        onSuccess={loadBadges}
      />
    </div>
  );
}
