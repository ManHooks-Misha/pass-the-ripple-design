// Wrapper component that provides role context to shared components
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export type UserRole = 'admin' | 'teacher' | 'user' | 'student';

export interface RoleAwareProps {
  userRole: UserRole;
  userId?: number;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isRegularUser: boolean;
}

interface RoleAwareWrapperProps {
  children: (props: RoleAwareProps) => ReactNode;
}

export const RoleAwareWrapper = ({ children }: RoleAwareWrapperProps) => {
  const { user } = useAuth();

  const userRole = (user?.role as UserRole) || 'user';
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';
  const isRegularUser = userRole === 'user';

  const roleProps: RoleAwareProps = {
    userRole,
    userId: user?.id,
    isAdmin,
    isTeacher,
    isStudent,
    isRegularUser,
  };

  return <>{children(roleProps)}</>;
};

export default RoleAwareWrapper;
