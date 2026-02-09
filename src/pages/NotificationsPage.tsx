// src/pages/NotificationsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, Filter, ExternalLink, RefreshCw, Users, Heart, MessageCircle, Share, UserPlus, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/config/api";
import { formatDateTime, getMeaningfulNotificationMessage } from "@/utils/notificationHelpers";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { notificationsTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

// Notification API Service
const notificationService = {
  async getNotifications(filters = {}) {
    const params = new URLSearchParams();
    
    // Add all filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
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

// Enhanced notification icon mapper with Lucide icons
const getNotificationIcon = (type) => {
  const icons = {
    user_registration: <UserPlus className="h-5 w-5 text-blue-500" />,
    daily_login: <Bell className="h-5 w-5 text-green-500" />,
    story_creation: <BookOpen className="h-5 w-5 text-purple-500" />,
    like_received: <Heart className="h-5 w-5 text-red-500" />,
    comment_received: <MessageCircle className="h-5 w-5 text-orange-500" />,
    share_received: <Share className="h-5 w-5 text-teal-500" />,
    referral_signup: <Users className="h-5 w-5 text-indigo-500" />,
    like_received_removed: <Heart className="h-5 w-5 text-gray-400" />,
  };
  
  return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
};

// Notification type options for filter
const NOTIFICATION_TYPES = [
  { value: '', label: 'All Types', icon: '🔔' },
  { value: 'user_registration', label: 'Registrations', icon: '👤' },
  { value: 'daily_login', label: 'Daily Logins', icon: '🔑' },
  { value: 'story_creation', label: 'Story Creations', icon: '📖' },
  { value: 'like_received', label: 'Likes', icon: '❤️' },
  { value: 'comment_received', label: 'Comments', icon: '💬' },
  { value: 'share_received', label: 'Shares', icon: '🔄' },
  { value: 'referral_signup', label: 'Referrals', icon: '👥' },
  { value: 'like_received_removed', label: 'Like Removals', icon: '💔' },
];

// Enhanced Notification Card Component - NO API CALLS
const NotificationCard = ({ notification, onMarkAsRead, onDelete, onClick, userRole, currentUserId }) => {
  const isUnread = !notification.read_at;

  // Extract data for parsing
  let notificationData: any = {};
  if (typeof notification.data === 'string') {
    try {
      notificationData = JSON.parse(notification.data);
    } catch {
      notificationData = {};
    }
  } else if (typeof notification.data === 'object') {
    notificationData = notification.data;
  }

  // Get meaningful message using helper (no API calls)
  const [messageData, setMessageData] = useState<any>(null);

  useEffect(() => {
    getMeaningfulNotificationMessage(notification, currentUserId).then(setMessageData);
  }, [notification, currentUserId]);

  const title = messageData?.message || notification.title || notificationData.title || notification.type?.replace(/_/g, ' ') || 'Notification';
  const message = notification.message || notificationData.message || '';

  const handleClick = async () => {
    if (isUnread) {
      await onMarkAsRead(notification.id);
    }

    // Extract link from notification.link or data.link
    const link = notification.link || notificationData?.link;

    if (link) {
      onClick(link);
    }
  };

  // Show author info only for admin/teacher when viewing others' notifications
  const showAuthorInfo = ['admin', 'teacher'].includes(userRole) &&
                          notification.from_user &&
                          notification.from_user_id !== notification.user_id;

  // Extract points data
  const pointsAwarded = notificationData?.points_awarded;
  const pointsRemoved = notificationData?.points_removed;
  const badgeData = notificationData?.badge;

  return (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer ${
        isUnread ? 'border-l-4 border-l-primary bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          {/* Notification Icon */}
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-muted rounded-full">
            <div className="h-4 w-4 sm:h-5 sm:w-5">
              {getNotificationIcon(notification.type)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h4 className="text-sm sm:text-base md:text-base font-semibold text-foreground mb-1 break-words">
                  {title}
                </h4>

                {/* Full Message - show if different from title */}
                {message && message !== title && (
                  <p className="text-xs sm:text-sm text-foreground/90 mb-2 leading-relaxed break-words">
                    {message}
                  </p>
                )}

                {/* Show author info only for admin/teacher when viewing others' notifications */}
                {showAuthorInfo && notification.from_user && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={notification.from_user.profile_image_path} />
                      <AvatarFallback className="text-xs">
                        {notification.from_user.nickname?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      By: {notification.from_user.nickname || notification.from_user.full_name || `User #${notification.from_user_id}`}
                    </span>
                  </div>
                )}
                
                {/* Points and Badges */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {pointsAwarded && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      +{pointsAwarded} points
                    </Badge>
                  )}
                  {pointsRemoved && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      {pointsRemoved} points removed
                    </Badge>
                  )}
                  {badgeData && (
                    <Badge variant="secondary" className="text-xs">
                      🏆 {badgeData.name}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    title="Mark as read"
                    className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                    data-tutorial-target="mark-read-button"
                  >
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
                  data-tutorial-target="delete-button"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            
            {/* Footer with timestamp and type */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 md:gap-0 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                <span className="whitespace-nowrap">{formatDateTime(notification.created_at)}</span>
                {notification.type && (
                  <Badge variant="outline" className="text-xs capitalize whitespace-nowrap">
                    {notification.type.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              
              {/* Show click to view if there's a link */}
              {notificationData?.link && (
                <span className="flex items-center gap-1 text-primary whitespace-nowrap flex-shrink-0">
                  View <ExternalLink className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Notifications Page Component
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || 'user';

  // Role-based page title and description
  const getPageTitle = () => {
    switch (userRole) {
      case 'admin': return 'All Notifications';
      case 'teacher': return 'Notifications';
      default: return 'Your Notifications';
    }
  };

  const getPageDescription = () => {
    switch (userRole) {
      case 'admin': return 'Monitor all system activities and user notifications';
      case 'teacher': return 'View and manage notifications about your classroom and students';
      default: return 'Stay updated with your latest activities and achievements';
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (status = 'all', type = '', showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const filters = {
        status: status === 'all' ? '' : status,
        type: type || '',
        limit: '50'
      };
      
      const data = await notificationService.getNotifications(filters);
      
      if (data?.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      if (data?.success) {
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Apply filters whenever notifications or filter criteria change
  useEffect(() => {
    let filtered = notifications;
    
    // Apply status filter
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read_at);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.read_at);
    }
    
    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(n => n.type === filterType);
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, filterType]);

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
      
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
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
      navigate(link);
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (type) => {
    setFilterType(type);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications(activeTab, filterType, true);
    fetchUnreadCount();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterType('');
    setActiveTab('all');
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications('all', '');
    fetchUnreadCount();
  }, [fetchNotifications]);

  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "teacher_notifications_tutorial_completed",
    steps: notificationsTutorialSteps,
  });

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Tutorial Component */}
      {tutorialSteps && tutorialSteps.length > 0 && (
        <KidFriendlyTutorial
          isActive={isActive}
          steps={convertStepsToTutorialSteps(tutorialSteps)}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          storageKey="teacher_notifications_tutorial_completed"
        />
      )}
      
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1" data-tutorial-target="notifications-header">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {getPageDescription()}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Help/Tutorial Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
            title="Take a tour of this page"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help</span>
          </Button>
        </div>
      </div>
      
      {/* Filter and Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        {/* Active Filters Display */}
            {(filterType || activeTab !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Filters:</span>
                {filterType && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {NOTIFICATION_TYPES.find(t => t.value === filterType)?.label}
                  </Badge>
                )}
                {activeTab !== 'all' && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {activeTab === 'unread' ? 'Unread Only' : 'Read Only'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 sm:h-8 text-xs flex-shrink-0"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-shrink-0" data-tutorial-target="filter-dropdown">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden md:inline">{NOTIFICATION_TYPES.find(t => t.value === filterType)?.label || 'All Types'}</span>
                  <span className="md:hidden">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {NOTIFICATION_TYPES.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => handleTypeFilterChange(type.value)}
                    className={filterType === type.value ? 'bg-accent' : ''}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 flex-shrink-0"
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden md:inline">Mark all read</span>
                <span className="md:hidden">Mark all</span>
              </Button>
            )}
          </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>{unreadCount} unread</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span>{notifications.length - unreadCount} read</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>{notifications.length} total</span>
          </div>
          {filterType && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>{filteredNotifications.length} filtered</span>
            </div>
          )}
        </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4 sm:mb-5 md:mb-6" data-tutorial-target="notification-tabs">
        <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2">
          <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4">
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 border-b-2 border-primary" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 p-4 sm:p-5 md:p-6">
            <Bell className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg md:text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-xs sm:text-sm md:text-sm text-muted-foreground text-center max-w-md">
              {activeTab === 'unread' 
                ? "You're all caught up! No unread notifications."
                : filterType
                ? `No ${NOTIFICATION_TYPES.find(t => t.value === filterType)?.label?.toLowerCase()} notifications`
                : "You don't have any notifications yet."}
            </p>
            {(filterType || activeTab !== 'all') && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="mt-4 text-xs sm:text-sm"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4 md:space-y-5" data-tutorial-target="notifications-list">
          {filteredNotifications.map((notification, index) => (
            <div key={notification.id} data-tutorial-target={index === 0 ? "notification-item" : undefined}>
              <NotificationCard
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClick={handleNotificationClick}
                userRole={userRole}
                currentUserId={user?.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;