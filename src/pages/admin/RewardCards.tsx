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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CreditCard, ImageIcon, X, Edit, Trash, Award, Trophy, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiFetchFormData } from "@/config/api";
import Swal from "sweetalert2";
import { getImageUrl } from "@/utils/imageUrl";
import { Link } from "react-router-dom";
import { DigitalCard } from "@/components/gamification/DigitalCard";
import { Trash2 } from "lucide-react";

// Types
interface CardItem {
  id: string;
  name: string;
  description: string;
  card_type: "daily" | "weekly" | "monthly" | "ripple";
  badge_id?: number | null;
  icon_path?: string | null;
  card_value?: number;
  display_order?: number;
  is_active?: boolean;
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

interface CardFormData {
  name: string;
  description: string;
  card_type: "daily" | "weekly" | "monthly" | "ripple";
  badge_id: string;
  card_value: number;
  display_order: number;
  icon: File | null;
  iconPreview: string;
}

// Card Dialog Component
interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  cardForm: CardFormData;
  badges: BadgeItem[];
  onFormChange: <T extends keyof CardFormData>(field: T, value: CardFormData[T]) => void;
  onSubmit: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  loading: boolean;
}

const CardDialog = ({
  open,
  onOpenChange,
  isEdit,
  cardForm,
  badges,
  onFormChange,
  onSubmit,
  onFileChange,
  onRemoveImage,
  loading,
}: CardDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {isEdit ? "Edit Card" : "Create New Card"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor="card-name" className="text-xs sm:text-sm font-medium">
                Card Name *
              </Label>
              <Input
                id="card-name"
                placeholder="e.g., Daily Kindness Card"
                value={cardForm.name}
                onChange={(e) => onFormChange("name", e.target.value)}
                className="mt-1.5 text-sm sm:text-base"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor="card-desc" className="text-xs sm:text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="card-desc"
                placeholder="Describe what this card represents..."
                value={cardForm.description}
                onChange={(e) => onFormChange("description", e.target.value)}
                className="mt-1.5 min-h-[80px] text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="card-type" className="text-xs sm:text-sm font-medium">
                Card Type *
              </Label>
              <Select
                value={cardForm.card_type}
                onValueChange={(value) => onFormChange("card_type", value as "daily" | "weekly" | "monthly" | "ripple")}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="ripple">Ripple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="badge-id" className="text-xs sm:text-sm font-medium">
                Linked Badge
              </Label>
              <Select
                value={cardForm.badge_id}
                onValueChange={(value) => onFormChange("badge_id", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select badge (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {badges.map((badge) => (
                    <SelectItem key={badge.id} value={badge.id.toString()}>
                      {badge.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="card-value" className="text-xs sm:text-sm font-medium">
                Card Value
              </Label>
              <Input
                id="card-value"
                type="number"
                min="1"
                placeholder="1"
                value={cardForm.card_value || ""}
                onChange={(e) => onFormChange("card_value", Number(e.target.value) || 1)}
                className="mt-1.5 text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="display-order" className="text-xs sm:text-sm font-medium">
                Display Order
              </Label>
              <Input
                id="display-order"
                type="number"
                min="0"
                placeholder="0"
                value={cardForm.display_order || ""}
                onChange={(e) => onFormChange("display_order", Number(e.target.value) || 0)}
                className="mt-1.5 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs sm:text-sm font-medium">Card Icon</Label>
            <div className="mt-2 space-y-3">
              {cardForm.iconPreview ? (
                <div className="relative inline-block">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={getImageUrl(cardForm.iconPreview)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                    onClick={onRemoveImage}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              )}
              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
                onChange={onFileChange}
                className="cursor-pointer text-xs sm:text-sm"
              />
            </div>
          </div>

          <Button
            className="w-full mt-4 sm:mt-6 text-xs sm:text-sm"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : isEdit ? "Update Card" : "Create Card"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function RewardCards() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showEditCardDialog, setShowEditCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [cardForm, setCardForm] = useState<CardFormData>({
    name: "",
    description: "",
    card_type: "daily",
    badge_id: "",
    card_value: 1,
    display_order: 0,
    icon: null,
    iconPreview: "",
  });
  const [loading, setLoading] = useState(false);


  const loadAll = async () => {
    setLoading(true);
    try {
      const [cardsRes, badgesRes] = await Promise.all([
        apiFetch<{ data: CardItem[] } | CardItem[]>("/admin/cards", { method: "GET" }),
        apiFetch<{ data: BadgeItem[] } | BadgeItem[]>("/badges", { method: "GET" }),
      ]);

      const cardsData = (Array.isArray(cardsRes) ? cardsRes : (cardsRes as { data: CardItem[] })?.data || []) as CardItem[];
      const badgesData = (Array.isArray(badgesRes) ? badgesRes : (badgesRes as { data: BadgeItem[] })?.data || []) as BadgeItem[];

      setCards(cardsData);
      setBadges(badgesData);
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast({
        title: "Error",
        description: error?.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCardForm = () => {
    setCardForm({
      name: "",
      description: "",
      card_type: "daily",
      badge_id: "",
      card_value: 1,
      display_order: 0,
      icon: null,
      iconPreview: "",
    });
  };

  const createCard = async () => {
    if (!cardForm.name || !cardForm.card_type) {
      toast({
        title: "Validation error",
        description: "Name and card type are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", cardForm.name);
      formData.append("description", cardForm.description);
      formData.append("card_type", cardForm.card_type);
      if (cardForm.badge_id) formData.append("badge_id", cardForm.badge_id);
      formData.append("card_value", String(cardForm.card_value));
      formData.append("display_order", String(cardForm.display_order));

      if (cardForm.icon) {
        formData.append("icon_path", cardForm.icon);
      }

      const res = await apiFetchFormData<{ data: CardItem }>("/admin/cards", {
        method: "POST",
        body: formData,
      });

      const created = res?.data;
      if (created) {
        setCards((prev) => [...prev, created]);
      }
      setShowCardDialog(false);
      resetCardForm();
      toast({ title: "Success", description: "Card created successfully!" });
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast({
        title: "Error",
        description: error?.message || "Failed to create card",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async () => {
    if (!editingCard || !cardForm.name || !cardForm.card_type) {
      toast({
        title: "Validation error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", cardForm.name);
      formData.append("description", cardForm.description);
      formData.append("card_type", cardForm.card_type);
      if (cardForm.badge_id) formData.append("badge_id", cardForm.badge_id);
      formData.append("card_value", String(cardForm.card_value));
      formData.append("display_order", String(cardForm.display_order));

      if (cardForm.icon instanceof File) {
        formData.append("icon_path", cardForm.icon);
      }

      const response = await apiFetchFormData<{ data: CardItem }>(`/admin/cards/${editingCard.id}`, {
        method: "POST",
        body: formData,
      });

      const updatedData = response?.data;
      if (updatedData) {
        setCards((prev) => prev.map((card) => (card.id === editingCard.id ? updatedData : card)));
      }
      setShowEditCardDialog(false);
      setEditingCard(null);
      resetCardForm();
      toast({ title: "Success", description: "Card updated successfully!" });
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast({
        title: "Error",
        description: error?.message || "Failed to update card",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await apiFetch<{ success: boolean; message?: string }>(`/admin/cards/${cardId}`, {
        method: "DELETE",
      });
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      Swal.fire("Deleted!", "Card removed successfully.", "success");
    } catch (e: unknown) {
      const error = e as { message?: string };
      Swal.fire("Error", error?.message || "Failed to delete card", "error");
    } finally {
      setLoading(false);
    }
  };

  const editCard = (card: CardItem) => {
    setEditingCard(card);
    setCardForm({
      name: card.name,
      description: card.description || "",
      card_type: card.card_type,
      badge_id: card.badge_id ? card.badge_id.toString() : "",
      card_value: card.card_value || 1,
      display_order: card.display_order || 0,
      icon: null,
      iconPreview: card.icon_path || "",
    });
    setShowEditCardDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCardForm((prev) => ({
          ...prev,
          icon: file,
          iconPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCardForm((prev) => ({
      ...prev,
      icon: null,
      iconPreview: "",
    }));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const getCardTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      daily: "bg-blue-100 text-blue-800",
      weekly: "bg-green-100 text-green-800",
      monthly: "bg-purple-100 text-purple-800",
      ripple: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Reward Cards
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage collectible cards that users earn by completing challenges
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">{cards.length} Cards</span>
          </Badge>
          <Link to="/admin/challenges">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Challenges</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/admin/badges">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Badges</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Card Collection
              </CardTitle>
              <CardDescription className="mt-1.5 text-xs sm:text-sm">
                Create cards for daily, weekly, monthly, and ripple challenges
              </CardDescription>
            </div>
            <Button
              className="shadow-sm w-full sm:w-auto text-xs sm:text-sm"
              onClick={() => {
                resetCardForm();
                setShowCardDialog(true);
              }}
            >
              <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {cards.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">No cards yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Create your first card to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((card) => (
                <DigitalCard
                  key={card.id}
                  name={card.name}
                  description={card.description}
                  card_type={card.card_type}
                  icon_path={card.icon_path}
                  badge_name={card.badge?.name}
                  onEdit={() => editCard(card)}
                  onDelete={() => deleteCard(card.id)}
                  isClickable
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CardDialog
        open={showCardDialog}
        onOpenChange={setShowCardDialog}
        isEdit={false}
        cardForm={cardForm}
        badges={badges}
        onFormChange={(field, value) => setCardForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={createCard}
        onFileChange={handleFileChange}
        onRemoveImage={removeImage}
        loading={loading}
      />

      <CardDialog
        open={showEditCardDialog}
        onOpenChange={(open) => {
          setShowEditCardDialog(open);
          if (!open) {
            setEditingCard(null);
            resetCardForm();
          }
        }}
        isEdit={true}
        cardForm={cardForm}
        badges={badges}
        onFormChange={(field, value) => setCardForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={updateCard}
        onFileChange={handleFileChange}
        onRemoveImage={removeImage}
        loading={loading}
      />
    </div>
  );
}
