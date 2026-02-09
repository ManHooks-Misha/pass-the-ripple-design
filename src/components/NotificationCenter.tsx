import { useState, useEffect } from "react";
import { Bell, X, Check, Info, Trophy, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: "badge",
    icon: Trophy,
    title: "New Badge Earned!",
    message: "You've earned the 'Kindness Keeper' badge!",
    time: "2 hours ago",
    read: false,
    color: "text-yellow-500"
  },
  {
    id: 2,
    type: "ripple",
    icon: Heart,
    title: "Your Ripple Was Passed!",
    message: "Someone continued your ripple in San Francisco",
    time: "5 hours ago",
    read: false,
    color: "text-red-500"
  },
  {
    id: 3,
    type: "reminder",
    icon: Bell,
    title: "Daily Reminder",
    message: "Don't forget to log your act of kindness today!",
    time: "1 day ago",
    read: true,
    color: "text-blue-500"
  },
  {
    id: 4,
    type: "message",
    icon: MessageCircle,
    title: "New Comment",
    message: "Someone commented on your ripple story",
    time: "2 days ago",
    read: true,
    color: "text-green-500"
  },
  {
    id: 5,
    type: "admin",
    icon: Info,
    title: "Community Update",
    message: "New kindness challenge starting this week!",
    time: "3 days ago",
    read: true,
    color: "text-purple-500"
  }
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast({ title: "Notification removed" });
  };

  // Simulate new notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        type: "ripple",
        icon: Heart,
        title: "New Ripple Alert!",
        message: "Your kindness reached someone new!",
        time: "Just now",
        read: false,
        color: "text-red-500"
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      toast({
        title: "New Notification",
        description: "Your kindness reached someone new!",
      });
    }, 30000); // New notification every 30 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 ${notification.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex items-start gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full text-sm" onClick={() => setOpen(false)}>
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;