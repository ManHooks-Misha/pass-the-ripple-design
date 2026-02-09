// components/NotificationToast.tsx
import { useState, useEffect, useCallback } from 'react';
import { X, Bell } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ToastNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  timestamp: string;
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    badge: "🌟",
    ripple: "📍",
    consent: "🎉",
    achievement: "🏆",
    message: "💬",
    alert: "⚠️",
    reminder: "⏰",
    system: "🔔",
    default: "📢",
  };
  
  return icons[type?.toLowerCase()] || icons.default;
};

interface NotificationToastItemProps {
  notification: ToastNotification;
  onClose: (id: number) => void;
  onClick?: (link: string) => void;
}

const NotificationToastItem = ({ notification, onClose, onClick }: NotificationToastItemProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const handleClick = () => {
    if (notification.link && onClick) {
      onClick(notification.link);
      handleClose();
    }
  };

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Alert
      className={`mb-3 cursor-pointer transition-all duration-300 shadow-lg border-l-4 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      } hover:shadow-xl hover:scale-[1.02]`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </span>
        
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-sm font-semibold mb-1">
            {notification.title}
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            {notification.message}
          </AlertDescription>
          {notification.link && (
            <p className="text-xs text-primary mt-1">Click to view →</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

interface NotificationToastContainerProps {
  onNavigate?: (path: string) => void;
}

export const NotificationToastContainer = ({ onNavigate }: NotificationToastContainerProps) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const navigate = useNavigate();

  const addToast = useCallback((notification: ToastNotification) => {
    setToasts((prev) => [notification, ...prev].slice(0, 3)); // Keep only 3 toasts max
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleToastClick = (link: string) => {
    if (onNavigate) {
      onNavigate(link);
    } else {
      navigate(link);
    }
  };

  // Listen for new notifications via polling or WebSocket
  useEffect(() => {
    let lastNotificationId = parseInt(localStorage.getItem('lastNotificationId') || '0');

    const checkForNewNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?limit=1&offset=0', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const latestNotification = data.data.notifications[0];

        if (latestNotification && latestNotification.id > lastNotificationId) {
          // New notification detected
          addToast({
            id: latestNotification.id,
            type: latestNotification.type,
            title: latestNotification.title,
            message: latestNotification.message,
            link: latestNotification.link,
            timestamp: latestNotification.created_at,
          });

          lastNotificationId = latestNotification.id;
          localStorage.setItem('lastNotificationId', String(lastNotificationId));
        }
      } catch (error) {
        console.error('Error checking for new notifications:', error);
      }
    };

    // Check immediately on mount
    checkForNewNotifications();

    // Then poll every 10 seconds
    const interval = setInterval(checkForNewNotifications, 10000);

    return () => clearInterval(interval);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <NotificationToastItem
          key={toast.id}
          notification={toast}
          onClose={removeToast}
          onClick={handleToastClick}
        />
      ))}
    </div>
  );
};

// Context Provider for global notification management
import { createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  showNotification: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationToast = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationToast must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showNotification = useCallback((notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 3));
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <NotificationToastItem
            key={toast.id}
            notification={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Usage example in your App.tsx or main layout:
/*
import { NotificationProvider, NotificationToastContainer } from '@/components/NotificationToast';

function App() {
  return (
    <NotificationProvider>
      <YourAppContent />
      <NotificationToastContainer />
    </NotificationProvider>
  );
}

// Then in any component:
import { useNotificationToast } from '@/components/NotificationToast';

function SomeComponent() {
  const { showNotification } = useNotificationToast();
  
  const handleAction = () => {
    showNotification({
      type: 'success',
      title: 'Success!',
      message: 'Your action was completed',
      link: '/dashboard'
    });
  };
}
*/