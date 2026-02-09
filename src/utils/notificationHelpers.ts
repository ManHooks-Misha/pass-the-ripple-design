// src/utils/notificationHelpers.ts
import { apiFetch } from "@/config/api";

// Cache for user data to avoid duplicate API calls
const userCache = new Map();
const storyCache = new Map();
const teacherStudentCache = new Map();

export const getUserDetails = async (userId: number) => {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  try {
    const response = await apiFetch(`/users/${userId}`, {
      method: 'GET',
    });
    
    if (response?.success) {
      userCache.set(userId, response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
  
  return null;
};

export const getStoryDetails = async (storyId: number) => {
  if (storyCache.has(storyId)) {
    return storyCache.get(storyId);
  }

  try {
    const response = await apiFetch(`/stories/${storyId}`, {
      method: 'GET',
    });
    
    if (response?.success) {
      storyCache.set(storyId, response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching story details:', error);
  }
  
  return null;
};

// Check if a student belongs to a teacher
const isTeacherStudent = async (teacherId: number, studentId: number): Promise<boolean> => {
  const cacheKey = `${teacherId}-${studentId}`;
  
  if (teacherStudentCache.has(cacheKey)) {
    return teacherStudentCache.get(cacheKey);
  }

  try {
    const response = await apiFetch(`/teachers/${teacherId}/students`, {
      method: 'GET',
    });
    
    if (response?.success) {
      const isStudent = response.data.some((s: any) => s.id === studentId);
      teacherStudentCache.set(cacheKey, isStudent);
      return isStudent;
    }
  } catch (error) {
    console.error('Error checking teacher-student relationship:', error);
  }
  
  return false;
};

// Enhanced date formatting with AM/PM
export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // For recent notifications (less than 24 hours)
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older notifications, show full date with time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get meaningful notification message based on type, data, and user role
export const getMeaningfulNotificationMessage = async (notification: any, currentUserId?: number) => {
  const { type, data, user_id, from_user_id } = notification;
  
  // Parse data if it's a string
  const notificationData = typeof data === 'string' ? JSON.parse(data) : data;
  
  let message = '';
  let userDetails = null;
  let fromUserDetails = null;
  let storyDetails = null;

  // Use embedded user details from notification (already loaded by backend)
  userDetails = notification.user || null;
  fromUserDetails = notification.from_user || null;

  // Use story details from notification data if available
  if (notificationData?.story_title) {
    storyDetails = { title: notificationData.story_title };
  }

  // Determine context
  const isOwnNotification = currentUserId && user_id === currentUserId;
  const isFromCurrentUser = currentUserId && from_user_id === currentUserId;
  
  // Check if current user is a teacher viewing their student's activity
  let isStudentOfTeacher = false;
  if (currentUserId && user_id && !isOwnNotification && userDetails?.role === 'student') {
    isStudentOfTeacher = await isTeacherStudent(currentUserId, user_id);
  }

  // Get names with fallbacks
  const userName = userDetails?.nickname || userDetails?.name || userDetails?.username || 'A user';
  const fromUserName = fromUserDetails?.nickname || fromUserDetails?.name || fromUserDetails?.username || 'Someone';
  const storyTitle = storyDetails?.title || 'a story';
  
  // Get points data
  const pointsAwarded = notificationData?.points_awarded;
  const pointsRemoved = notificationData?.points_removed;
  const badgeName = notificationData?.badge?.name || notificationData?.badge_name;

  // Helper function to get classroom context
  const getClassroomContext = () => {
    if (isStudentOfTeacher) {
      if (userDetails?.classroom_name) {
        return ` in ${userDetails.classroom_name}`;
      }
      return ' (your student)';
    }
    return '';
  };

  // Helper function to format points
  const formatPoints = () => {
    if (pointsAwarded) {
      return ` (+${pointsAwarded} points)`;
    }
    if (pointsRemoved) {
      return ` (${pointsRemoved} points removed)`;
    }
    return '';
  };

  // Generate context-aware messages
  switch (type) {
    case 'user_registration':
      if (isOwnNotification) {
        message = `🎉 Welcome! You started your kindness journey${formatPoints()}`;
        if (badgeName) {
          message += ` and earned the "${badgeName}" badge!`;
        }
      } else if (isStudentOfTeacher) {
        message = `🎉 ${userName} joined the platform${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `🎉 ${userName} started their kindness journey${formatPoints()}`;
      }
      break;
      
    case 'daily_login':
      if (isOwnNotification) {
        message = `🔑 Welcome back! You checked in today${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        message = `🔑 ${userName} checked in today${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `🔑 ${userName} checked in today${formatPoints()}`;
      }
      break;
      
    case 'story_creation':
      if (isOwnNotification) {
        message = `📖 You created a new story: "${storyTitle}"${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        message = `📖 ${userName} created a new story: "${storyTitle}"${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `📖 ${userName} created a new story: "${storyTitle}"${formatPoints()}`;
      }
      break;
      
    case 'like_received':
      if (isOwnNotification) {
        message = `❤️ ${fromUserName} liked your story "${storyTitle}"${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        message = `❤️ ${fromUserName} liked ${userName}'s story "${storyTitle}"${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `❤️ ${fromUserName} liked ${userName}'s story "${storyTitle}"${formatPoints()}`;
      }
      break;
      
    case 'comment_received':
      if (isOwnNotification) {
        message = `💬 ${fromUserName} commented on your story "${storyTitle}"${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        message = `💬 ${fromUserName} commented on ${userName}'s story "${storyTitle}"${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `💬 ${fromUserName} commented on ${userName}'s story "${storyTitle}"${formatPoints()}`;
      }
      break;
      
    case 'share_received':
      if (isOwnNotification) {
        message = `🔄 ${fromUserName} shared your story "${storyTitle}"${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        message = `🔄 ${fromUserName} shared ${userName}'s story "${storyTitle}"${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `🔄 ${fromUserName} shared ${userName}'s story "${storyTitle}"${formatPoints()}`;
      }
      break;
      
    case 'referral_signup':
      if (isOwnNotification) {
        // Current user received points because someone joined through their referral
        message = `👥 ${fromUserName} joined through your referral${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        // Teacher viewing: their student referred someone
        message = `👥 ${fromUserName} joined through ${userName}'s referral${getClassroomContext()}${formatPoints()}`;
      } else {
        // Admin or other user viewing
        message = `👥 ${fromUserName} joined through ${userName}'s referral${formatPoints()}`;
      }
      break;
      
    case 'like_received_removed':
      if (isOwnNotification) {
        message = `💔 ${fromUserName} unliked your story "${storyTitle}"${formatPoints()}`;
      } else if (isStudentOfTeacher) {
        message = `💔 ${fromUserName} unliked ${userName}'s story "${storyTitle}"${getClassroomContext()}${formatPoints()}`;
      } else {
        message = `💔 ${fromUserName} unliked ${userName}'s story "${storyTitle}"${formatPoints()}`;
      }
      break;

    case 'badge_earned':
      if (isOwnNotification) {
        message = `🏆 Congratulations! You earned the "${badgeName}" badge!`;
      } else if (isStudentOfTeacher) {
        message = `🏆 ${userName} earned the "${badgeName}" badge${getClassroomContext()}!`;
      } else {
        message = `🏆 ${userName} earned the "${badgeName}" badge!`;
      }
      break;

    case 'hero_wall_pinned':
      if (isOwnNotification) {
        message = `🌟 Your story "${storyTitle}" was pinned to the Hero Wall!`;
      } else if (isStudentOfTeacher) {
        message = `🌟 ${userName}'s story "${storyTitle}" was pinned to the Hero Wall${getClassroomContext()}!`;
      } else {
        message = `🌟 ${userName}'s story "${storyTitle}" was pinned to the Hero Wall!`;
      }
      break;

    case 'level_up':
      const level = notificationData?.new_level || notificationData?.level;
      if (isOwnNotification) {
        message = `🚀 Level up! You reached level ${level}!`;
      } else if (isStudentOfTeacher) {
        message = `🚀 ${userName} leveled up to level ${level}${getClassroomContext()}!`;
      } else {
        message = `🚀 ${userName} leveled up to level ${level}!`;
      }
      break;

    case 'achievement_unlocked':
      const achievement = notificationData?.achievement_name || notificationData?.achievement;
      if (isOwnNotification) {
        message = `🎯 Achievement unlocked: ${achievement}!`;
      } else if (isStudentOfTeacher) {
        message = `🎯 ${userName} unlocked achievement: ${achievement}${getClassroomContext()}!`;
      } else {
        message = `🎯 ${userName} unlocked achievement: ${achievement}!`;
      }
      break;

    case 'system':
      message = notificationData?.message || notificationData?.title || 'System notification';
      break;
      
    default:
      // Fallback for unknown notification types
      if (notificationData?.message) {
        message = notificationData.message;
      } else if (notificationData?.activity) {
        message = notificationData.activity;
      } else if (isOwnNotification) {
        message = 'You have a new notification';
      } else {
        message = `${userName} has new activity`;
      }
  }

  return {
    message,
    userDetails,
    fromUserDetails,
    storyDetails
  };
};

// Clear caches (useful for testing or when user logs out)
export const clearNotificationCaches = () => {
  userCache.clear();
  storyCache.clear();
  teacherStudentCache.clear();
};