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


interface ChallengeType {
    id: number;
    label: string;
    value: string;
    icon?: string | null;
    status: string; // 'active' or 'inactive'
    created_at: string;
}

interface ChallengeTypeFormData {
    label: string;
    value: string;
    status: boolean; // managed as boolean in form
    icon: File | null;
    iconPreview: string;
}

// ======================
// CHALLENGE TYPE DIALOG COMPONENT
// ======================

interface ChallengeTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    tierForm: ChallengeTypeFormData;
    onFormChange: <T extends keyof ChallengeTypeFormData>(
        field: T,
        value: ChallengeTypeFormData[T]
    ) => void;
    onSubmit: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    loading: boolean;
}

const ChallengeTypeDialog: React.FC<ChallengeTypeDialogProps> = ({
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
                        {isEdit ? "Edit Challenge Type" : "Create New Challenge Type"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tier Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Challenge Type Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., Bronze, Silver, Gold, Ultimate"
                            value={tierForm.label}
                            onChange={(e) => onFormChange("label", e.target.value)}
                        />
                    </div>

                    {/* Value */}
                    <div className="space-y-2">
                        <Label htmlFor="value">
                            Value <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="value"
                            placeholder="e.g., Daily, Weekly, Monthly, Yearly"
                            value={tierForm.value}
                            onChange={(e) => onFormChange("value", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Challenge Type value (1 = lowest, higher numbers = higher tiers)
                        </p>
                    </div>

                    {/* Icon Upload */}
                    <div className="space-y-2">
                        <Label>Challenge Type Icon (Optional)</Label>
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
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="status"
                            checked={tierForm.status}
                            onChange={(e) => onFormChange("status", e.target.checked)}
                            className="rounded"
                        />
                        <Label htmlFor="status" className="cursor-pointer">
                            Active (Available for use)
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? "Saving..." : isEdit ? "Update Challenge Type" : "Create Challenge Type"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ======================
// MAIN COMPONENT
// ======================

const ChallengeType: React.FC = () => {
    const [tiers, setTiers] = useState<ChallengeType[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Filter States (Grid View Only)
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

    const [challengeTypeForm, setChallengeTypeForm] = useState<ChallengeTypeFormData>({
        label: "",
        value: "",
        status: true,
        icon: null,
        iconPreview: "",
    });

    // Fetch tiers
    const fetchTiers = async (forceRefresh = false) => {
        try {
            setLoading(true);
            const response = await apiFetch(
                `/admin/challenge-types?t=${Date.now()}`
            );

            if (response.success) {
                setTiers(response.data.data || response.data || []);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to fetch challenge types",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    // Filter Logic
    const filteredTiers = tiers.filter((tier) => {
        const matchesSearch = tier.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tier.value.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || tier.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Handle form changes
    const handleFormChange = <T extends keyof ChallengeTypeFormData>(
        field: T,
        value: ChallengeTypeFormData[T]
    ) => {
        setChallengeTypeForm((prev) => ({ ...prev, [field]: value }));
    };

    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setChallengeTypeForm((prev) => ({
                ...prev,
                icon: file,
                iconPreview: URL.createObjectURL(file),
            }));
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setChallengeTypeForm((prev) => ({
            ...prev,
            icon: null,
            iconPreview: "",
        }));
    };

    // Reset form
    const resetForm = () => {
        setChallengeTypeForm({
            label: "",
            value: "",
            status: true,
            icon: null,
            iconPreview: "",
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
    const handleEdit = (tier: ChallengeType) => {
        setIsEdit(true);
        setEditingId(tier.id);
        setChallengeTypeForm({
            label: tier.label,
            value: tier.value,
            status: tier.status === 'active',
            icon: null,
            iconPreview: tier.icon ? getImageUrl(tier.icon) : "",
        });
        setDialogOpen(true);
    };

    // Submit form
    const handleSubmit = async () => {
        if (!challengeTypeForm.label.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Challenge type name is required",
            });
            return;
        }

        if (!challengeTypeForm.value) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Value is required",
            });
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("label", challengeTypeForm.label);
            formData.append("value", challengeTypeForm.value.toString());
            // status: true -> active, false -> inactive
            formData.append("status", challengeTypeForm.status ? "active" : "inactive");

            if (challengeTypeForm.icon) {
                formData.append("icon", challengeTypeForm.icon);
            }

            const endpoint = isEdit
                ? `/admin/challenge-types/${editingId}`
                : "/admin/challenge-types";

            if (isEdit) {
                // For Laravel, PUT with file upload needs _method spoofing
                formData.append("_method", "PUT");
            }

            const response = await apiFetchFormData(endpoint, {
                method: "POST",
                body: formData,
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: response.message || `Challenge type ${isEdit ? "updated" : "created"} successfully`,
                });
                setDialogOpen(false);
                resetForm();
                fetchTiers();
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || `Failed to ${isEdit ? "update" : "create"} challenge type`,
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete tier
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This challenge type will be deleted permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await apiFetch(`/admin/challenge-types/${id}`, {
                    method: "DELETE",
                });

                if (response.success) {
                    toast({
                        title: "Success",
                        description: "Challenge type deleted successfully",
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
            const response = await apiFetch(`/admin/challenge-types/${id}/toggle-status`, {
                method: "POST",
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Challenge type status updated",
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
        <div className="space-y-6">
            {/* Header removed for Challenge Master integration */}
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Challenge Type
                </Button>
            </div>

            {/* Filters & View Toggle */}
            <Card className="bg-muted/30 border-none shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                            <Input
                                placeholder="Search by name or value..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-xs"
                            />
                            <select
                                className="h-10 w-full md:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {loading && tiers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p>Loading challenge types...</p>
                        </div>
                    </div>
                ) : filteredTiers.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        <Layers className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No challenge types found</p>
                        <p className="text-sm">Try adjusting your filters or create a new one.</p>
                    </div>
                ) : (
                    filteredTiers.map((tier) => (
                        <Card
                            key={tier.id}
                            className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 ${tier.status === 'active' ? 'border-t-green-500' : 'border-t-gray-300'
                                }`}
                        >
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm border">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => handleEdit(tier)}
                                        title="Edit"

                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(tier.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl transform group-hover:scale-110 transition-transform"></div>
                                    {tier.icon ? (
                                        <img
                                            src={getImageUrl(tier.icon)}
                                            alt={tier.label}
                                            className="relative w-32 h-32 object-contain drop-shadow-md transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                                            <Award className="h-16 w-16 text-muted-foreground/50" />
                                        </div>
                                    )}

                                    <div className="absolute -bottom-2 -right-2">
                                        <Badge
                                            className={`shadow-sm ${tier.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                                        >
                                            {tier.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-1 w-full">
                                    <h3 className="font-bold text-xl text-foreground">{tier.label}</h3>
                                    <div className="bg-muted/50 rounded-full px-3 py-1 inline-block">
                                        <span className="text-xs font-medium text-muted-foreground mr-1">Value:</span>
                                        <span className="text-sm font-semibold text-foreground">{tier.value}</span>
                                    </div>
                                </div>

                                {/* Status Toggle (Quick Action) */}
                                <div className="pt-2 w-full">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs h-8"
                                        onClick={() => handleToggleStatus(tier.id)}
                                    >
                                        <Power className={`h-3 w-3 mr-2 ${tier.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                                        {tier.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Tier Dialog */}
            <ChallengeTypeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                isEdit={isEdit}
                tierForm={challengeTypeForm}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onFileChange={handleFileChange}
                onRemoveImage={handleRemoveImage}
                loading={loading}
            />
        </div>
    );
};

export default ChallengeType;
