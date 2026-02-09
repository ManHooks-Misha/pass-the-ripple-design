// hooks/useNotifications.ts
import { apiFetch } from '@/config/api';
import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: number;
  user_id: number;
  from_user_id?: number;
  notification_id?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  link?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationFilters {
  status?: 'all' | 'read' | 'unread';
  limit?: number;
  offset?: number;
  type?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotifications = (autoFetch = true): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        status: filters.status || 'all',
        limit: String(filters.limit || 20),
        offset: String(filters.offset || 0),
        ...(filters.type && { type: filters.type }),
      });

      const response = await apiFetch(`/notifications?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiFetch('/notifications/count', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      setUnreadCount(data.data.unread_count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await apiFetch(`/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiFetch('/notifications/mark-all-read', {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await apiFetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (autoFetch) {
      refresh();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [autoFetch, refresh, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
};

// utils/notificationHelpers.ts

export const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    badge: "🌟",
    ripple: "📍",
    consent: "🎉",
    achievement: "🏆",
    message: "💬",
    alert: "⚠️",
    reminder: "⏰",
    system: "🔔",
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    error: "❌",
    default: "📢",
  };
  
  return icons[type?.toLowerCase()] || icons.default;
};

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatFullDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const groupNotificationsByDate = (notifications: Notification[]): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at);
    
    if (date >= today) {
      groups.Today.push(notification);
    } else if (date >= yesterday) {
      groups.Yesterday.push(notification);
    } else if (date >= weekAgo) {
      groups['This Week'].push(notification);
    } else if (date >= monthAgo) {
      groups['This Month'].push(notification);
    } else {
      groups.Older.push(notification);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
};

// services/notificationService.ts

interface SendNotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
  link?: string;
  send_email?: boolean;
}

export const notificationService = {
  async sendToUsers(userIds: number[], notificationData: SendNotificationData) {
    const response = await apiFetch('/notifications/send-to-users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: userIds,
        ...notificationData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return response.json();
  },

  async sendToRoles(roles: string[], notificationData: SendNotificationData) {
    const response = await apiFetch('/notifications/send-to-roles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roles,
        ...notificationData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return response.json();
  },

  async sendEmailToUsers(userIds: number[], notificationData: SendNotificationData) {
    const response = await apiFetch('/notifications/send-email-to-users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: userIds,
        ...notificationData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    return response.json();
  },

  async sendEmailToRoles(roles: string[], notificationData: SendNotificationData) {
    const response = await apiFetch('/notifications/send-email-to-roles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roles,
        ...notificationData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    return response.json();
  },

  async sendBroadcast(notificationData: SendNotificationData) {
    const response = await apiFetch('/notifications/send-email-broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to send broadcast');
    }

    return response.json();
  },

  async getStats() {
    const response = await apiFetch('/notifications/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification stats');
    }

    return response.json();
  },
};