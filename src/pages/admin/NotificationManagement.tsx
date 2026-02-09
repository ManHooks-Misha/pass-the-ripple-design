import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash, Bell, Users, Mail, Loader2, AlertCircle, X, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/config/api';
import { getAuthToken } from '@/lib/auth-token';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserNotification {
  id: number;
  user_id: number;
  from_user_id: number | null;
  notification_id: number | null;
  type: string;
  notifiable_type: string;
  notifiable_id: number | null;
  data: any;
  read_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  from_user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  notifications_by_type: Record<string, number>;
  recent_activity: UserNotification[];
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<UserNotification | null>(null);
  const [viewingNotification, setViewingNotification] = useState<UserNotification | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<UserNotification | null>(null);
  const [markAllConfirmOpen, setMarkAllConfirmOpen] = useState(false);
  
  // Form state - Updated to match actual database structure
  const [formData, setFormData] = useState({
    user_ids: [] as number[],
    type: '',
    notifiable_type: 'App\\Models\\User',
    notifiable_id: '',
    data_activity: '',
    data_message: '',
    data_points_awarded: '',
    data_total_points: '',
    data_badge_name: '',
    data_badge_icon: '',
    data_badge_description: '',
    target_type: 'users', // users, roles, all
    roles: [] as string[],
    send_email: false,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Fetch notifications and stats
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view notifications.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch notifications
      const notificationsResponse = await apiFetch<any>('/notifications?limit=50', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch stats
      const statsResponse = await apiFetch<any>('/notifications/stats', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (notificationsResponse?.success) {
        setNotifications(notificationsResponse.data?.notifications || []);
      }

      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }

    } catch (err: any) {
      console.error('Fetch notifications error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to load notifications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    const errors: Record<string, string[]> = {};
    
    if (!formData.type.trim()) {
      errors.type = ['Notification type is required'];
    }
    
    if (!formData.data_activity.trim()) {
      errors.data_activity = ['Activity description is required'];
    }
    
    if (!formData.data_message.trim()) {
      errors.data_message = ['Message is required'];
    }
    
    if (formData.target_type === 'users' && formData.user_ids.length === 0) {
      errors.user_ids = ['Please select at least one user'];
    }
    
    if (formData.target_type === 'roles' && formData.roles.length === 0) {
      errors.roles = ['Please select at least one role'];
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in');
      }

      // Prepare data according to actual database structure
      const payload: any = {
        type: formData.type,
        notifiable_type: formData.notifiable_type,
        notifiable_id: formData.notifiable_id || null,
        data: {
          activity: formData.data_activity,
          message: formData.data_message,
          points_awarded: formData.data_points_awarded ? parseInt(formData.data_points_awarded) : null,
          total_points: formData.data_total_points ? parseInt(formData.data_total_points) : null,
        },
        send_email: formData.send_email,
      };

      // Add badge data if provided
      if (formData.data_badge_name) {
        payload.data.badge = {
          name: formData.data_badge_name,
          icon: formData.data_badge_icon,
          description: formData.data_badge_description,
        };
      }

      // Add target-specific data
      if (formData.target_type === 'users') {
        payload.user_ids = formData.user_ids;
      } else if (formData.target_type === 'roles') {
        payload.roles = formData.roles;
      } else if (formData.target_type === 'all') {
        payload.target_type = 'all';
      }

      const response: any = await apiFetch('/notifications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Notification created successfully',
        });
        fetchNotifications();
        handleDialogClose();
      } else {
        throw new Error(response?.message || 'Failed to create notification');
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred';

      if (err.response?.data?.errors || err?.errors) {
        setFormErrors(err.response?.data?.errors || err?.errors);
        errorMessage = Object.values(err.response?.data?.errors || err?.errors)
          .flat()
          .join(' • ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in');
      }

      const response: any = await apiFetch(`/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Notification marked as read',
        });
        fetchNotifications();
      } else {
        throw new Error(response?.message || 'Failed to mark notification as read');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in');
      }

      const response: any = await apiFetch('/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success) {
        toast({
          title: 'Success',
          description: `Marked ${response.data?.marked_count} notifications as read`,
        });
        fetchNotifications();
        setMarkAllConfirmOpen(false);
      } else {
        throw new Error(response?.message || 'Failed to mark all notifications as read');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notification: UserNotification) => {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in');
      }

      const response: any = await apiFetch(`/notifications/${notificationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Notification deleted successfully',
        });
        fetchNotifications();
      } else {
        throw new Error(response?.message || 'Failed to delete notification');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete notification',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleView = (notification: UserNotification) => {
    setViewingNotification(notification);
    setIsViewDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingNotification(null);
    setFormData({
      user_ids: [],
      type: '',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: '',
      data_activity: '',
      data_message: '',
      data_points_awarded: '',
      data_total_points: '',
      data_badge_name: '',
      data_badge_icon: '',
      data_badge_description: '',
      target_type: 'users',
      roles: [],
      send_email: false,
    });
    setFormErrors({});
  };

  const handleDialogOpen = () => {
    setEditingNotification(null);
    setFormData({
      user_ids: [],
      type: '',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: '',
      data_activity: '',
      data_message: '',
      data_points_awarded: '',
      data_total_points: '',
      data_badge_name: '',
      data_badge_icon: '',
      data_badge_description: '',
      target_type: 'users',
      roles: [],
      send_email: false,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const getStatusBadge = (readAt: string | null) => {
    return readAt ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Read
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Unread
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      user_registration: 'bg-purple-50 text-purple-700 border-purple-200',
      daily_login: 'bg-green-50 text-green-700 border-green-200',
      story_creation: 'bg-blue-50 text-blue-700 border-blue-200',
      like_received: 'bg-pink-50 text-pink-700 border-pink-200',
      comment_received: 'bg-orange-50 text-orange-700 border-orange-200',
      share_received: 'bg-teal-50 text-teal-700 border-teal-200',
      referral_signup: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    return (
      <Badge variant="outline" className={typeColors[type] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  // Helper to extract message from data
  const getNotificationMessage = (notification: UserNotification) => {
    if (typeof notification.data === 'object') {
      return notification.data.message || notification.data.activity || 'Notification';
    }
    try {
      const data = JSON.parse(notification.data);
      return data.message || data.activity || 'Notification';
    } catch {
      return 'Notification';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Notification Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and send system notifications
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setMarkAllConfirmOpen(true)}
            disabled={notifications.filter(n => !n.read_at).length === 0}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Mark All as Read</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
            <DialogTrigger asChild>
              <Button onClick={handleDialogOpen} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Notification</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">
                      Notification Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user_registration">User Registration</SelectItem>
                        <SelectItem value="daily_login">Daily Login</SelectItem>
                        <SelectItem value="story_creation">Story Creation</SelectItem>
                        <SelectItem value="like_received">Like Received</SelectItem>
                        <SelectItem value="comment_received">Comment Received</SelectItem>
                        <SelectItem value="share_received">Share Received</SelectItem>
                        <SelectItem value="referral_signup">Referral Signup</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.type && (
                      <p className="text-sm text-red-500">{formErrors.type.join(', ')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_type">Target Audience</Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value) => handleInputChange('target_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Specific Users</SelectItem>
                        <SelectItem value="roles">User Roles</SelectItem>
                        <SelectItem value="all">All Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_activity">
                    Activity Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="data_activity"
                    value={formData.data_activity}
                    onChange={(e) => handleInputChange('data_activity', e.target.value)}
                    placeholder="e.g., Story Creation, User Registration"
                    disabled={submitting}
                  />
                  {formErrors.data_activity && (
                    <p className="text-sm text-red-500">{formErrors.data_activity.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="data_message"
                    value={formData.data_message}
                    onChange={(e) => handleInputChange('data_message', e.target.value)}
                    placeholder="Enter notification message that users will see"
                    rows={3}
                    disabled={submitting}
                  />
                  {formErrors.data_message && (
                    <p className="text-sm text-red-500">{formErrors.data_message.join(', ')}</p>
                  )}
                </div>

                {/* <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_points_awarded">Points Awarded</Label>
                    <Input
                      id="data_points_awarded"
                      type="number"
                      value={formData.data_points_awarded}
                      onChange={(e) => handleInputChange('data_points_awarded', e.target.value)}
                      placeholder="0"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_total_points">Total Points</Label>
                    <Input
                      id="data_total_points"
                      type="number"
                      value={formData.data_total_points}
                      onChange={(e) => handleInputChange('data_total_points', e.target.value)}
                      placeholder="0"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">Badge Information (Optional)</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      placeholder="Badge Name"
                      value={formData.data_badge_name}
                      onChange={(e) => handleInputChange('data_badge_name', e.target.value)}
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Badge Icon URL"
                      value={formData.data_badge_icon}
                      onChange={(e) => handleInputChange('data_badge_icon', e.target.value)}
                      disabled={submitting}
                    />
                    <Input
                      placeholder="Badge Description"
                      value={formData.data_badge_description}
                      onChange={(e) => handleInputChange('data_badge_description', e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div> */}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send_email"
                    checked={formData.send_email}
                    onChange={(e) => handleInputChange('send_email', e.target.checked)}
                    className="rounded border-gray-300"
                    disabled={submitting}
                  />
                  <Label htmlFor="send_email" className="text-sm font-medium leading-none">
                    Send as email notification
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Notification'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_notifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unread_notifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.read_notifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Types</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.notifications_by_type).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Manage system notifications and user alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">#{notification.id}</TableCell>
                      <TableCell>
                        {getTypeBadge(notification.type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">User #{notification.user_id}</div>
                          {notification.from_user_id && (
                            <div className="text-muted-foreground">
                              From: User #{notification.from_user_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notification.read_at)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm">
                          {typeof notification.data === 'object' 
                            ? notification.data.message || notification.data.activity || 'Notification'
                            : 'Notification'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.created_at).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!notification.read_at && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(notification)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Notification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {viewingNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <p className="text-sm">#{viewingNotification.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="mt-1">
                    {getTypeBadge(viewingNotification.type)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-sm">{viewingNotification.user_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(viewingNotification.read_at)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Data</Label>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto max-h-60">
                  {JSON.stringify(viewingNotification.data, null, 2)}
                </pre>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">
                    {new Date(viewingNotification.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm">
                    {new Date(viewingNotification.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Are you sure you want to delete notification <strong>#{notificationToDelete?.id}</strong>?
              This action cannot be undone.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark All as Read Confirmation Dialog */}
      <Dialog open={markAllConfirmOpen} onOpenChange={setMarkAllConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark All as Read</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Are you sure you want to mark all {notifications.filter(n => !n.read_at).length} unread notifications as read?
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMarkAllConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}