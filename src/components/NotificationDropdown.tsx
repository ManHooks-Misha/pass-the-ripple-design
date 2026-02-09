// src/components/NotificationDropdown.tsx
import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { getMeaningfulNotificationMessage } from "@/utils/notificationHelpers";

// Enhanced Notification API Service
const notificationService = {
  async getNotifications(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || 'all',
      limit: filters.limit || '10',
      offset: filters.offset || '0',
    });
    
    return apiFetch(`/notifications?${params}`, {
      method: 'GET',
    });
  },

  async getUnreadCount() {
    return apiFetch('/notifications/count', {
      method: 'GET',
    });
  },

  async markAsRead(notificationId) {
    return apiFetch(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead() {
    return apiFetch('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  async deleteNotification(notificationId) {
    return apiFetch(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// Enhanced notification icon mapper
const getNotificationIcon = (type, data = null) => {
  const icons = {
    user_registration: "👤",
    daily_login: "🔑",
    story_creation: "📖",
    story_approved: "✅",
    story_pending: "⏳",
    story_rejected: "❌",
    story_review_needed: "👀",
    like_received: "❤️",
    comment_received: "💬",
    share_received: "🔄",
    referral_signup: "👥",
    like_received_removed: "💔",
    system: "🔔",
    default: "📢",
  };

  if (data?.badge) return "🏆";
  if (data?.points_awarded || data?.points_removed) return "⭐";

  return icons[type?.toLowerCase()] || icons.default;
};

// Get notification title - IMPROVED
const getNotificationTitle = (notification) => {
  // Use notification.message if it exists (from backend)
  if (notification.message) {
    return notification.message;
  }

  // Use notification.title if it exists
  if (notification.title) {
    return notification.title;
  }

  // Try to get from data
  if (typeof notification.data === 'object') {
    return notification.data.activity || notification.data.title || notification.type?.replace(/_/g, ' ') || 'New notification';
  }

  if (typeof notification.data === 'string') {
    try {
      const parsedData = JSON.parse(notification.data);
      return parsedData.activity || parsedData.title || notification.type?.replace(/_/g, ' ') || 'New notification';
    } catch {
      return notification.type?.replace(/_/g, ' ') || 'New notification';
    }
  }

  return notification.type?.replace(/_/g, ' ') || 'New notification';
};

// Format relative time
const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

// Individual Notification Item Component - IMPROVED
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onClick, userRole, currentUserId }) => {
  const isUnread = !notification.read_at;

  // Extract data for parsing
  let parsedData: any = {};
  if (typeof notification.data === 'object') {
    parsedData = notification.data;
  } else if (typeof notification.data === 'string') {
    try {
      parsedData = JSON.parse(notification.data);
    } catch {}
  }

  // Get meaningful message using helper (no API calls)
  const [messageData, setMessageData] = useState<any>(null);

  useEffect(() => {
    getMeaningfulNotificationMessage(notification, currentUserId).then(setMessageData);
  }, [notification, currentUserId]);

  const title = messageData?.message || notification.title || parsedData.title || getNotificationTitle(notification);
  const message = notification.message || parsedData.message;

  const handleClick = async () => {
    if (isUnread) {
      await onMarkAsRead(notification.id);
    }

    // Extract link from notification.link field or data.link
    const link = notification.link || parsedData.link;

    if (link) {
      onClick(link);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await onDelete(notification.id);
  };

  // Show author info only for admin/teacher when there's a fromUser and it's different from recipient
  const showAuthorInfo = ['admin', 'teacher'].includes(userRole) &&
                          notification.from_user &&
                          notification.from_user_id !== notification.user_id;

  // Extract points data
  const pointsAwarded = parsedData?.points_awarded;
  const pointsRemoved = parsedData?.points_removed;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${
        isUnread ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      }`}
      onClick={handleClick}
    >
      <span className="text-2xl flex-shrink-0">
        {getNotificationIcon(notification.type, notification.data)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`font-medium text-sm ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
              {title}
            </p>

            {/* Show full message if available and different from title */}
            {message && message !== title && (
              <p className="text-xs text-foreground/90 mt-1.5 leading-relaxed">
                {message}
              </p>
            )}

            {/* Show author info only for admin/teacher when viewing others' notifications */}
            {showAuthorInfo && (
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  By: {notification.from_user.nickname || notification.from_user.full_name || `User #${notification.from_user_id}`}
                </span>
              </div>
            )}

            {/* Show points if available */}
            {pointsAwarded && (
              <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700 border-green-200">
                +{pointsAwarded} points
              </Badge>
            )}
            {pointsRemoved && (
              <Badge variant="outline" className="mt-2 text-xs bg-red-50 text-red-700 border-red-200">
                {pointsRemoved} points
              </Badge>
            )}
          </div>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground">
            {getRelativeTime(notification.created_at)}
          </span>
          {/* Show view link if available */}
          {(notification.link || parsedData?.link) && (
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              View <ExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        title="Delete notification"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

// Main Notification Dropdown Component
export const NotificationDropdown = ({ onNavigate, basePath = "" }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role || 'user';

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ limit: 10 });
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      if (data.success) {
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Get notifications URL based on role and basePath
  const getNotificationsUrl = () => {
    if (basePath) {
      return `${basePath}/notifications`;
    }
    
    switch (userRole) {
      case 'admin':
        return '/admin/notifications';
      case 'teacher':
        return '/teacher/notifications';
      default:
        return '/notifications';
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (link) => {
    if (link) {
      setOpen(false);
      if (onNavigate) {
        onNavigate(link);
      } else {
        window.location.href = link;
      }
    }
  };

  // Role-based notification title
  const getNotificationTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'All Notifications';
      case 'teacher':
        return 'Classroom Activity';
      default:
        return 'Your Notifications';
    }
  };

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] max-w-[95vw]">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="text-lg font-semibold p-0">
            {getNotificationTitle()}
          </DropdownMenuLabel>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userRole === 'teacher' 
                ? "You'll see notifications when your students are active"
                : "You'll see notifications here when you have them"}
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-1 px-2 py-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onClick={handleNotificationClick}
                    userRole={userRole}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="justify-center cursor-pointer"
            >
              <Link 
                to={getNotificationsUrl()} 
                className="w-full text-center font-medium py-3"
                onClick={() => setOpen(false)}
              >
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;