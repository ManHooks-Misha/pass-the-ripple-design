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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  Eye,
  Power,
  PowerOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/config/api";

interface PointActivities {
  id: string;
  activity_name: string;
  display_name: string;
  description: string;
  points: number;
  activity_type: string;
  delay_minutes: number | null;
  conditions: any;
  is_active: boolean;
  display_order: number;
}

interface PointActivitiesFormData {
  display_name: string;
  description: string;
  points: number;
  delay_minutes: number | null;
  conditions: any;
  is_active: boolean;
}

// Predefined conditions based on activity_name
const getConditionsByActivityName = (activityName: string) => {
  switch (activityName) {
    case "like_received":
      return {
        tiers: [
          { threshold: 5, points: 2, description: "First 5 likes" },
          { threshold: 10, points: 1, description: "Next 5 likes (6-10)" },
          { threshold: 50, points: 1, recurring: true, description: "Every 50 likes after" }
        ]
      };
    case "comment_received":
      return {
        tiers: [
          { threshold: 3, points: 5, description: "First 3 comments" },
          { threshold: 10, points: 3, description: "Next 7 comments (4-10)" },
          { threshold: 25, points: 2, recurring: true, description: "Every 25 comments after" }
        ]
      };
    case "share_received":
      return {
        tiers: [
          { threshold: 2, points: 10, description: "First 2 shares" },
          { threshold: 5, points: 5, description: "Next 3 shares (3-5)" },
          { threshold: 20, points: 3, recurring: true, description: "Every 20 shares after" }
        ]
      };
    case "story_reach_views":
      return {
        metric: "views",
        per_unit: 100,
        max_per_story: 10,
        description: "1 point per 100 views (max 10 points per story)"
      };
    case "story_reach_distance":
      return {
        metric: "distance_km",
        per_unit: 10,
        max_per_story: 20,
        description: "1 point per 10km reach (max 20 points per story)"
      };
    case "story_creation":
      return {
        award_on_first_like: true,
        delay_check: true,
        description: "Award after 30 min or first like"
      };
    case "daily_login":
      return {
        once_per_day: true,
        streak_bonus: {
          7: 10,
          30: 50,
          90: 150
        },
        description: "Once per day with streak bonuses"
      };
    case "achieving_milestones":
      return {
        milestone_based: true,
        milestones: {
          stories_created: [10, 50, 100, 500],
          referrals_completed: [5, 20, 50, 100],
          total_engagement: [100, 500, 1000, 5000]
        },
        description: "Based on reaching specific milestones"
      };
    default:
      return null;
  }
};

export default function RewardPointManage() {
  const [pointActivities, setPointActivities] = useState<PointActivities[]>([]);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewingActivity, setViewingActivity] = useState<PointActivities | null>(null);
  const [editingActivity, setEditingActivity] = useState<PointActivities | null>(null);
  const [formData, setFormData] = useState<PointActivitiesFormData>({
    display_name: "",
    description: "",
    points: 0,
    delay_minutes: null,
    conditions: null,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string, variant: "success" | "error" = "success") => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const loadPointActivities = async () => {
    setLoading(true);
    try {
      const result = await apiFetch<any>("/admin/point-activities", {
        method: "GET",
      });
      
      const data = result?.data?.data || result?.data || [];

      setPointActivities(
        data.map((item: any) => ({
          id: String(item.id),
          activity_name: item.activity_name,
          display_name: item.display_name,
          description: item.description,
          points: item.points,
          activity_type: item.activity_type,
          delay_minutes: item.delay_minutes,
          conditions: item.conditions,
          is_active: item.is_active,
          display_order: item.display_order,
        }))
      );
    } catch (e: any) {
      showToast(e?.message || "Failed to load point activities", "error");
    } finally {
      setLoading(false);
    }
  };

  const viewActivity = (activity: PointActivities) => {
    setViewingActivity(activity);
    setShowViewDialog(true);
  };

  const editActivity = (activity: PointActivities) => {
    setEditingActivity(activity);
    setFormData({
      display_name: activity.display_name,
      description: activity.description,
      points: activity.points,
      delay_minutes: activity.delay_minutes,
      conditions: activity.conditions,
      is_active: activity.is_active,
    });
    setShowEditDialog(true);
  };

  const updateActivity = async () => {
    if (!editingActivity || !formData.display_name || !formData.description) {
      showToast("Display name and description are required", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        display_name: formData.display_name,
        description: formData.description,
        points: formData.points,
        delay_minutes: formData.delay_minutes,
        conditions: formData.conditions,
        is_active: formData.is_active,
      };

      const response = await apiFetch<any>(`/admin/point-activities/${editingActivity.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to update");

      setPointActivities((prev) =>
        prev.map((item) =>
          item.id === editingActivity.id
            ? { ...item, ...payload }
            : item
        )
      );

      setShowEditDialog(false);
      setEditingActivity(null);
      setFormData({
        display_name: "",
        description: "",
        points: 0,
        delay_minutes: null,
        conditions: null,
        is_active: true,
      });

      showToast("Point activity updated successfully!");
    } catch (e: any) {
      showToast(e?.message || "Failed to update point activity", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (activityId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setLoading(true);

    // Optimistically update
    setPointActivities(prev =>
      prev.map(item =>
        item.id === activityId ? { ...item, is_active: newStatus } : item
      )
    );

    try {
      const response = await apiFetch<any>(`/admin/point-activities/${activityId}/toggle-status`, {
        method: "POST",
      });

      if (!response.success) throw new Error("Toggle failed");

      showToast(`Point activity ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (e: any) {
      // Revert on error
      setPointActivities(prev =>
        prev.map(item =>
          item.id === activityId ? { ...item, is_active: currentStatus } : item
        )
      );
      showToast(e?.message || "Failed to toggle status", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = (activity: PointActivities) => {
    const defaultConditions = getConditionsByActivityName(activity.activity_name);
    
    if (defaultConditions) {
      setFormData({
        ...formData,
        conditions: defaultConditions,
      });
      showToast("Conditions reset to default values");
    } else {
      showToast("No default conditions available for this activity", "error");
    }
  };

  const renderConditions = (conditions: any, activityName: string) => {
    if (!conditions) return <span className="text-gray-500">None</span>;

    try {
      const condObj = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;

      if (condObj.tiers) {
        return (
          <div className="space-y-1">
            {condObj.tiers.map((tier: any, idx: number) => (
              <div key={idx} className="text-xs">
                <Badge variant="outline" className="mr-1">
                  {tier.threshold} {activityName.includes('like') ? 'likes' : activityName.includes('comment') ? 'comments' : 'shares'}
                </Badge>
                = {tier.points} pts {tier.recurring && <span className="text-blue-600">(recurring)</span>}
              </div>
            ))}
          </div>
        );
      }

      if (condObj.metric) {
        return (
          <div className="text-xs">
            <div>{condObj.metric}: 1 pt per {condObj.per_unit} units</div>
            {condObj.max_per_story && <div className="text-gray-500">Max: {condObj.max_per_story} pts/story</div>}
          </div>
        );
      }

      if (condObj.once_per_day) {
        return (
          <div className="text-xs">
            <div>Once per day</div>
            {condObj.streak_bonus && (
              <div className="mt-1 text-gray-500">
                Streaks: {Object.entries(condObj.streak_bonus).map(([days, pts]) => 
                  `${days}d:+${pts}pts`
                ).join(', ')}
              </div>
            )}
          </div>
        );
      }

      if (condObj.milestone_based) {
        return <Badge variant="secondary">Milestone-based</Badge>;
      }

      return <pre className="text-xs overflow-auto max-w-xs">{JSON.stringify(condObj, null, 2)}</pre>;
    } catch {
      return <span className="text-xs text-gray-500">Invalid format</span>;
    }
  };

  useEffect(() => {
    loadPointActivities();
  }, []);

  return (
    <div>
      {toastMsg && (
        <div className="fixed top-3 sm:top-4 right-3 sm:right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-4 z-50 text-xs sm:text-sm max-w-[calc(100vw-2rem)]">
          {toastMsg}
        </div>
      )}
      
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Reward Point Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage reward point activities and conditions
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{pointActivities.filter(p => p.is_active).length} / {pointActivities.length} Active</span>
            </Badge>
          </div>
        </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg sm:text-xl">Point Activities</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage reward point configurations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Activity</TableHead>
                <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Type</TableHead>
                <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Base Points</TableHead>
                <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Conditions</TableHead>
                <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-right px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pointActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 px-3 sm:px-4 py-4 sm:py-6 text-sm sm:text-base">
                    {loading ? "Loading..." : "No point activities found"}
                  </TableCell>
                </TableRow>
              ) : (
                pointActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{activity.display_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                          {activity.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">{activity.activity_type}</Badge>
                        {activity.delay_minutes && (
                          <span className="text-xs text-gray-500">
                            ({activity.delay_minutes}min)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                      <span className="font-semibold text-base sm:text-lg">{activity.points}</span>
                    </TableCell>
                    <TableCell className="max-w-xs px-3 sm:px-4 py-2 sm:py-3">
                      <div className="text-xs sm:text-sm">
                        {renderConditions(activity.conditions, activity.activity_name)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={activity.is_active}
                            onChange={() => toggleStatus(activity.id, activity.is_active)}
                            disabled={loading}
                          />
                          <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <Badge
                          variant={activity.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {activity.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-3 sm:px-4 py-2 sm:py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" disabled={loading} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewActivity(activity)} className="text-xs sm:text-sm">
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => editActivity(activity)} className="text-xs sm:text-sm">
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleStatus(activity.id, activity.is_active)}
                            className="text-xs sm:text-sm"
                          >
                            {activity.is_active ? (
                              <>
                                <PowerOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Activity Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Complete information about this reward point activity
            </DialogDescription>
          </DialogHeader>
          {viewingActivity && (
            <div className="space-y-3 sm:space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-gray-500">Activity Name</Label>
                  <p className="font-medium text-sm sm:text-base mt-1">{viewingActivity.display_name}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-500">Type</Label>
                  <p className="mt-1"><Badge className="text-xs">{viewingActivity.activity_type}</Badge></p>
                </div>
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">Description</Label>
                <p className="text-sm sm:text-base mt-1">{viewingActivity.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-gray-500">Base Points</Label>
                  <p className="font-semibold text-base sm:text-lg mt-1">{viewingActivity.points}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-500">Delay</Label>
                  <p className="text-sm sm:text-base mt-1">{viewingActivity.delay_minutes ? `${viewingActivity.delay_minutes} minutes` : "Immediate"}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">Conditions</Label>
                <div className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm">
                  {renderConditions(viewingActivity.conditions, viewingActivity.activity_name)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-gray-500">Status</Label>
                  <p className="mt-1">
                    <Badge variant={viewingActivity.is_active ? "default" : "secondary"} className="text-xs">
                      {viewingActivity.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-gray-500">Display Order</Label>
                  <p className="text-sm sm:text-base mt-1">{viewingActivity.display_order}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Point Activity</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the configuration for this reward point activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 mt-4">
            <div>
              <Label className="text-xs sm:text-sm">Display Name</Label>
              <Input
                placeholder="Enter display name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                className="mt-1.5 text-sm sm:text-base"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Description</Label>
              <Textarea
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1.5 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm">Base Points</Label>
                <Input
                  type="number"
                  value={formData.points === 0 ? '' : formData.points}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for clearing
                    if (value === '') {
                      setFormData({ ...formData, points: 0 });
                      return;
                    }
                    // Parse the number and remove leading zeros
                    const parsed = parseInt(value, 10);
                    if (!isNaN(parsed)) {
                      setFormData({ ...formData, points: parsed });
                    }
                  }}
                  placeholder="Enter points"
                  min="0"
                  className="mt-1.5 text-sm sm:text-base"
                />
              </div>
              <div className="hidden">
                <Label className="text-xs sm:text-sm">Delay (minutes)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for immediate"
                  value={formData.delay_minutes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delay_minutes: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="mt-1.5 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="hidden">
              <div className="flex justify-between items-center mb-2">
                <Label>Conditions (JSON)</Label>
                {editingActivity && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetToDefault(editingActivity)}
                  >
                    Reset to Default
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Enter conditions as JSON"
                value={
                  typeof formData.conditions === 'string'
                    ? formData.conditions
                    : JSON.stringify(formData.conditions, null, 2)
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, conditions: parsed });
                  } catch {
                    setFormData({ ...formData, conditions: e.target.value });
                  }
                }}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label className="text-xs sm:text-sm">Active</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 text-xs sm:text-sm"
                onClick={updateActivity}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Activity"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}