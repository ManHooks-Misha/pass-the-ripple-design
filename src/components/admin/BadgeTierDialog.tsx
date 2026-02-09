import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Sparkles, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiFetchFormData } from "@/config/api";
import Swal from "sweetalert2";
import { getImageUrl } from "@/utils/imageUrl";

interface SystemTier {
  id: number;
  name: string;
  level: number;
  color: string;
  icon_path?: string;
  description?: string;
}

interface BadgeTier {
  id?: number;
  tier_level: number;
  tier_name: string;
  cards_required: number;
  card_type_required: "daily" | "weekly" | "monthly" | "ripple" | "any";
  points_reward: number;
  description?: string;
  badge_image_path?: string;
}

interface TierFormData {
  selected: boolean;
  cards_required: number;
  points_reward: number;
  badge_image: File | null;
  badge_image_preview: string;
  existing_badge_image_path?: string;
}

interface BadgeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badgeId: number;
  badgeName: string;
  onSuccess?: () => void;
}

export function BadgeTierDialog({
  open,
  onOpenChange,
  badgeId,
  badgeName,
  onSuccess,
}: BadgeTierDialogProps) {
  const [systemTiers, setSystemTiers] = useState<SystemTier[]>([]);
  const [existingTiers, setExistingTiers] = useState<BadgeTier[]>([]);
  const [tierForms, setTierForms] = useState<Record<number, TierFormData>>({});
  const [cardTypeRequired, setCardTypeRequired] = useState<"daily" | "weekly" | "monthly" | "ripple" | "any">("any");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load available system tiers
  const loadSystemTiers = async () => {
    try {
      const response = await apiFetch<any>("/admin/available-tiers");
      const tiers = response.data || [];
      setSystemTiers(tiers);

      // Initialize tier forms with default values
      const defaultForms: Record<number, TierFormData> = {};
      tiers.forEach((tier: SystemTier) => {
        defaultForms[tier.level] = {
          selected: false,
          cards_required: tier.level * 10,
          points_reward: tier.level * 100,
          badge_image: null,
          badge_image_preview: "",
        };
      });
      setTierForms(defaultForms);
    } catch (e: any) {
      console.error("Failed to load system tiers:", e);
      toast({
        title: "Error",
        description: "Failed to load system tiers",
        variant: "destructive",
      });
    }
  };

  // Load existing badge tiers
  const loadExistingTiers = async () => {
    if (!badgeId) return;

    setLoading(true);
    try {
      const response = await apiFetch<any>(`/admin/badges/${badgeId}/tiers`);
      const tiersData: BadgeTier[] = Array.isArray(response?.data) ? response.data : [];
      setExistingTiers(tiersData);

      // Update tier forms based on existing data
      if (tiersData.length > 0) {
        const updatedForms = { ...tierForms };

        tiersData.forEach((tier) => {
          updatedForms[tier.tier_level] = {
            selected: true,
            cards_required: tier.cards_required,
            points_reward: tier.points_reward || 0,
            badge_image: null,
            badge_image_preview: tier.badge_image_path ? getImageUrl(tier.badge_image_path) : "",
            existing_badge_image_path: tier.badge_image_path,
          };
        });

        setTierForms(updatedForms);

        // Set card type from first tier
        if (tiersData[0]) {
          setCardTypeRequired(tiersData[0].card_type_required);
        }
      }
    } catch (e: any) {
      console.error("Failed to load existing tiers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && badgeId) {
      loadSystemTiers().then(() => {
        loadExistingTiers();
      });
    }
  }, [open, badgeId]);

  const handleTierToggle = (level: number, checked: boolean) => {
    setTierForms({
      ...tierForms,
      [level]: {
        ...tierForms[level],
        selected: checked,
      },
    });
  };

  const handleTierFieldChange = (level: number, field: keyof TierFormData, value: any) => {
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

  const handleSaveAll = async () => {
    const selectedTiers = systemTiers.filter(
      (tier) => tierForms[tier.level]?.selected
    );

    if (selectedTiers.length === 0) {
      toast({
        title: "No Tiers Selected",
        description: "Please select at least one tier",
        variant: "destructive",
      });
      return;
    }

    // Validate that all selected tiers have badge images
    for (const tier of selectedTiers) {
      const form = tierForms[tier.level];
      if (!form.badge_image && !form.existing_badge_image_path) {
        toast({
          title: "Missing Badge Image",
          description: `Please upload a badge image for ${tier.name} tier`,
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      // Delete all existing tiers first
      for (const existing of existingTiers) {
        await apiFetch(`/admin/badges/${badgeId}/tiers/${existing.id}`, {
          method: "DELETE",
        });
      }

      // Create new tiers for selected levels
      for (const tier of selectedTiers) {
        const form = tierForms[tier.level];
        const formData = new FormData();

        formData.append("tier_level", tier.level.toString());
        formData.append("tier_name", tier.name);
        formData.append("cards_required", form.cards_required.toString());
        formData.append("card_type_required", cardTypeRequired);
        formData.append("points_reward", form.points_reward.toString());
        formData.append("description", tier.description || "");

        // Add badge image if new file selected
        if (form.badge_image) {
          formData.append("badge_image", form.badge_image);
        }

        await apiFetchFormData(`/admin/badges/${badgeId}/tiers`, {
          method: "POST",
          body: formData,
        });
      }

      toast({
        title: "Success",
        description: "Badge tiers configured successfully!",
      });

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save tiers",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    const updatedForms = { ...tierForms };
    systemTiers.forEach((tier) => {
      updatedForms[tier.level] = {
        ...updatedForms[tier.level],
        selected: true,
      };
    });
    setTierForms(updatedForms);
  };

  const handleDeselectAll = () => {
    const updatedForms = { ...tierForms };
    systemTiers.forEach((tier) => {
      updatedForms[tier.level] = {
        ...updatedForms[tier.level],
        selected: false,
      };
    });
    setTierForms(updatedForms);
  };

  const getTierColor = (color: string) => {
    return {
      backgroundColor: `${color}20`,
      borderColor: color,
      color: color,
    };
  };

  const selectedCount = Object.values(tierForms).filter((f) => f.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configure Tiers for "{badgeName}"
          </DialogTitle>
          <DialogDescription>
            Select which tiers this badge supports and upload badge images for each tier.
            Users will earn different badge images as they progress through tiers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tiers...</p>
            </div>
          ) : (
            <>
              {/* Card Type Selection */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="text-sm font-semibold">Card Type Required</Label>
                <Select value={cardTypeRequired} onValueChange={(value: any) => setCardTypeRequired(value)}>
                  <SelectTrigger className="mt-2">
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
                <p className="text-xs text-muted-foreground mt-2">
                  Which type of cards users need to collect to unlock tiers
                </p>
              </div>

              {/* Tier Selection Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold">Select Tiers ({selectedCount} selected)</h3>
                  <p className="text-xs text-muted-foreground">Choose which tiers this badge will have</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              {/* Tier Grid */}
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
                      className={`border-2 rounded-lg p-4 transition-all ${
                        form.selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                    >
                      {/* Tier Header with Checkbox */}
                      <div className="flex items-center gap-3 mb-4">
                        <Checkbox
                          checked={form.selected}
                          onCheckedChange={(checked) =>
                            handleTierToggle(tier.level, checked as boolean)
                          }
                          className="h-5 w-5"
                        />
                        <div
                          className="px-3 py-1 rounded-full text-sm font-semibold border-2"
                          style={getTierColor(tier.color)}
                        >
                          Tier {tier.level} - {tier.name}
                        </div>
                      </div>

                      {form.selected && (
                        <div className="space-y-3 mt-4 pl-8">
                          {/* Badge Image Upload */}
                          <div>
                            <Label className="text-xs font-semibold">
                              Badge Image <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                              {form.badge_image_preview ? (
                                <div className="relative inline-block">
                                  <img
                                    src={form.badge_image_preview}
                                    alt={`${tier.name} badge`}
                                    className="w-24 h-24 object-cover rounded-lg border-2"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => handleRemoveImage(tier.level)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                                  <ImageIcon className="h-8 w-8" />
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(tier.level, e)}
                                className="mt-2 text-xs"
                              />
                            </div>
                          </div>

                          {/* Cards Required */}
                          <div>
                            <Label className="text-xs">Cards Required</Label>
                            <Input
                              type="number"
                              min="1"
                              value={form.cards_required}
                              onChange={(e) =>
                                handleTierFieldChange(
                                  tier.level,
                                  "cards_required",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Points Reward */}
                          <div>
                            <Label className="text-xs">Points Reward</Label>
                            <Input
                              type="number"
                              min="0"
                              value={form.points_reward}
                              onChange={(e) =>
                                handleTierFieldChange(
                                  tier.level,
                                  "points_reward",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Summary */}
                          <div className="text-xs bg-muted p-2 rounded">
                            <strong>{form.cards_required}</strong>{" "}
                            {cardTypeRequired === "any"
                              ? "cards"
                              : `${cardTypeRequired} cards`}{" "}
                            → <strong>{form.points_reward}</strong> points
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedCount === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No Tiers Selected</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select at least one tier to configure this badge
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={saving || selectedCount === 0}
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : `Save Tiers (${selectedCount} selected)`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
