import { BarChart3, Bell, Globe, BookOpen, CreditCard, FileCheck, FileText, GitBranch, GraduationCap, HelpCircle, Home, LayoutDashboard, LucideIcon, Map, Medal, MessageSquare, Settings, Trophy, Users, FileEdit, User, Archive, UserCheck, Settings2Icon, Badge, Gamepad, Coins, BadgeCheck, BookCheck, BellElectric, BellMinusIcon, UserCircle, ChartBarBig, MessageCircle, Image as ImageIcon, Search, Award, Target, Layers, Layout } from "lucide-react";

// Define a reusable type for sidebar items
// export interface SidebarItem {
//   title: string;
//   href: string;
//   icon: LucideIcon; // This ensures only Lucide icons are used
// }

interface SidebarItem {
  title: string;
  href?: string;
  target?: string;
  icon: any;
  children?: SidebarItem[];
  isHelp?: boolean;
}

// Export your admin sidebar config
export const ADMIN_SIDEBAR: SidebarItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },

  {
    title: 'My Actions',
    icon: UserCheck,
    children: [
      { title: 'Post Story', href: '/admin/post-story', icon: FileEdit },
      { title: 'My Stories', href: '/admin/my-stories', icon: Medal },
      // { title: 'My Leaderboard', href: '/admin/my-leaderboard', icon: Trophy }, // disabled
      { title: 'My Journey', href: '/admin/my-journey-map', icon: Map },
      { title: 'Ripple Card', href: '/admin/ripple-card', icon: CreditCard },
    ]
  },
  { title: 'Manage Stories', href: '/admin/manage-ripples', icon: FileCheck },
  { title: 'Ripple Symbol', href: '/admin/ripple-symbol', icon: BookOpen },
  { title: 'Hero Wall Request', href: '/admin/herowall-request', icon: BookCheck },
  // { title: 'Leaderboards', href: '/admin/leaderboards', icon: BarChart3 }, // disabled
  { title: 'Manage Users', href: '/admin/manage-users', icon: Users },
  { title: 'Contact Enquiries', href: '/admin/contact-enquiries', icon: MessageSquare },
  { title: 'Feedback Management', href: '/admin/feedback-management', icon: MessageCircle },

  {
    title: 'Manage Challenge',
    icon: Trophy,
    children: [
      { title: 'Tiers', href: '/admin/tiers', icon: Layers },
      { title: 'Badges', href: '/admin/badges', icon: BadgeCheck },
      { title: 'Challenge Cards', href: '/admin/challenge-cards', icon: CreditCard },
      // { title: 'Card Layouts', href: '/admin/challenge-card-layouts', icon: Layout },
      // { title: 'Challenges', href: '/admin/challenges', icon: Gamepad },
      // { title: 'Challenge Types', href: '/admin/challenge-type', icon: Layers },
      { title: 'Challenge Master', href: '/admin/challenge-master', icon: Layers },
      { title: 'Point Management', href: '/admin/point-management', icon: Coins },
    ]
  },
  { title: 'Analytics', href: '/admin/analytics', icon: ChartBarBig },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Site Settings', href: '/admin/settings', icon: Settings2Icon },
      { title: 'Avatar Management', href: '/admin/avatar-management', icon: UserCircle },
      // { title: 'Slider Management', href: '/admin/slider-management', icon: ImageIcon },
      { title: 'Manage-Notifications', href: '/admin/manage-notifications', icon: BellMinusIcon },
      { title: 'Notifications', href: '/admin/notifications', icon: BellElectric },
      { title: 'Content Management', href: '/admin/content-management', icon: FileText },
      { title: 'FAQ Management', href: '/admin/faq-management', icon: HelpCircle },
      { title: 'SEO Management', href: '/admin/seo-management', icon: Search },
    ]
  },
  { title: 'Archived', href: '/admin/archived', icon: Archive },
];

// Export your user sidebar config
export const USER_SIDEBAR: SidebarItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Website', href: '/', icon: Globe, target: '_blank' },
  { title: 'Post Story', href: '/post-story', icon: FileEdit },
  { title: 'My Stories', href: '/my-hero-wall', icon: BookOpen },
  { title: 'Ripple Tracker', href: '/my-journey-map', icon: Map },
  // { title: 'Leaderboard', href: '/my-leaderboard', icon: Trophy }, // disabled
  // { title: 'Challenges', href: '/my-challenges', icon: Target },
  { title: 'Challenges', href: '/challenges-leaderboard', icon: Target },
  { title: 'My Cards', href: '/my-cards', icon: CreditCard },
  { title: 'Badge Progress', href: '/badge-progress', icon: Award },
  { title: 'Ripple Card', href: '/ripple-card', icon: BookOpen },
  { title: 'Notifications', href: '/notifications', icon: BellElectric },
  { title: 'Analytics', href: '/analytics', icon: ChartBarBig },
  { title: 'Feedback', href: '/feedback', icon: MessageCircle },
  { title: 'Settings', href: '/settings', icon: Settings },
];

// Export your teacher sidebar config
export const TEACHER_SIDEBAR: SidebarItem[] = [
  { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  {
    title: 'Student Management',
    icon: Users,
    children: [
      { title: 'Classroom Setup', href: '/teacher/classroom-setup', icon: GraduationCap },
      { title: 'Add Student', href: '/teacher/add-student', icon: User },
      { title: 'Manage Students', href: '/teacher/manage-students', icon: Users },
    ]
  },
  {
    title: 'Stories',
    icon: FileEdit,
    children: [
      { title: 'Post Story', href: '/teacher/post-story', icon: FileEdit },
      { title: 'My Stories', href: '/teacher/my-stories', icon: Medal },
      { title: 'Manage Student Stories', href: '/teacher/manage-student-stories', icon: FileCheck },
    ]
  },
  {
    title: 'Engagement',
    icon: Trophy,
    children: [
      { title: 'Hero Wall', href: '/teacher/hero-wall', icon: BookOpen },
      // { title: 'My Leaderboard', href: '/teacher/my-leaderboard', icon: Trophy }, // disabled
      // { title: 'Students Leaderboard', href: '/teacher/leaderboards', icon: Trophy }, // disabled
    ]
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    children: [
      { title: 'Ripple Chain', href: '/teacher/ripple-chain', icon: GitBranch },
      { title: 'Ripple Map', href: '/teacher/ripple-map', icon: Map },
      { title: 'Analytics Dashboard', href: '/teacher/analytics', icon: ChartBarBig },
      // { title: 'Reports', href: '/teacher/reports', icon: BarChart3 },
    ]
  },
  { title: 'Ripple Card', href: '/teacher/ripple-card', icon: CreditCard },
  { title: 'Notifications', href: '/teacher/notifications', icon: BellElectric },
  { title: 'Feedback', href: '/teacher/feedback', icon: MessageCircle },
  { title: 'Settings', href: '/teacher/settings', icon: Settings },
];