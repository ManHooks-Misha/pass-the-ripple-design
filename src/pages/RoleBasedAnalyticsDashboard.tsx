import React from 'react';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import TeacherAnalyticsDashboard from './TeacherAnalyticsDashboard';
import UserAnalyticsDashboard from './UserAnalyticsDashboard';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Role-based Analytics Dashboard Router
 *
 * This component automatically renders the appropriate analytics dashboard
 * based on the authenticated user's role:
 * - Admin: Comprehensive platform analytics with all metrics
 * - Teacher: Student-focused analytics for classroom management
 * - User/Student: Personal progress and achievement tracking
 */
const RoleBasedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();

  // Loading state while auth is being determined
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminAnalyticsDashboard />;

    case 'teacher':
      return <TeacherAnalyticsDashboard />;

    case 'user':
    case 'student':
    case 'parent':
    default:
      return <UserAnalyticsDashboard />;
  }
};

export default RoleBasedAnalyticsDashboard;
