// src/routes/lazyComponents.ts
import { lazy, LazyExoticComponent, ComponentType } from "react";

// Helper to enforce type safety for lazy components
export const lazyImport = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> => lazy(factory);

// Public Pages
export const LazyIndex = lazyImport(() => import("@/pages/Index"));
export const LazyNotFound = lazyImport(() => import("@/pages/NotFound"));
export const LazyPrivacy = lazyImport(() => import("@/pages/Privacy"));
export const LazyJourneyMap = lazyImport(() => import("@/pages/JourneyMap"));
export const LazyHeroWall = lazyImport(() => import("@/pages/HeroWall"));
export const LazyLogout = lazyImport(() => import("@/pages/Logout"));
export const LazyVerifyEmail = lazyImport(() => import("@/pages/auth/VerifyEmail"));
export const LazyVerifyConsent = lazyImport(() => import("@/pages/auth/VerifyConsent"));
export const LazyOnboarding = lazyImport(() => import("@/pages/Onboarding"));
export const LazyParentConsent = lazyImport(() => import("@/pages/auth/ParentConsent"));
export const LazyNotificationsPage = lazyImport(() => import("@/pages/NotificationsPage"));
export const LazyForTeachers = lazyImport(() => import("@/pages/ForTeachers")); // NEW: Public marketing page

export const LazyChallengesNew = lazyImport(() => import("@/pages/ChallengesNew"));
export const LazyModernChallenges = lazyImport(() => import("@/pages/ModernChallenges"));
export const LazyBadges = lazyImport(() => import("@/pages/Badges"));
export const LazyExchangeBadges = lazyImport(() => import("@/pages/ExchangeBadges"));
export const LazyHeroWallOld = lazyImport(() => import("@/pages/HeroWallOld"));


export const LazyGlobalChallengesLeaderboard = lazyImport(() => import("@/pages/GlobalChallengesLeaderboard"));
export const LazyPublicChallenges = lazyImport(() => import("@/pages/PublicChallenges"));

// Auth (Guest)
export const LazyAgeGate = lazyImport(() => import("@/pages/auth/AgeGate"));
export const LazyLogin = lazyImport(() => import("@/pages/auth/Login"));
export const LazyRegister = lazyImport(() => import("@/pages/auth/Register"));
export const LazyForgotPassword = lazyImport(() => import("@/pages/auth/ForgotPassword"));
export const LazyVerifyResetPasswordOTP = lazyImport(() => import("@/pages/auth/VerifyResetPasswordOTP"));
export const LazyResetPassword = lazyImport(() => import("@/pages/ResetPassword"));

export const LazyAnalyticsDashboard = lazyImport(() => import("@/pages/AnalyticsDashboard"));
export const LazyRoleBasedAnalyticsDashboard = lazyImport(() => import("@/pages/RoleBasedAnalyticsDashboard"));
export const LazyTeacherAnalyticsDashboard = lazyImport(() => import("@/pages/TeacherAnalyticsDashboard"));
export const LazyUserAnalyticsDashboard = lazyImport(() => import("@/pages/UserAnalyticsDashboard"));

// User Pages
export const LazyDashboard = lazyImport(() => import("@/pages/user/Dashboard"));
export const LazyMyJourneyMap = lazyImport(() => import("@/pages/user/MyJourneyMap"));
export const LazyUserChallenges = lazyImport(() => import("@/pages/user/UserChallenges"));
export const LazyMyHeroWall = lazyImport(() => import("@/pages/user/MyHeroWall"));
export const LazyLeaderboard = lazyImport(() => import("@/pages/Leaderboard"));
export const LazyPublicKindnessHighlights = lazyImport(() => import("@/pages/PublicKindnessHighlights"));
export const LazyProfile = lazyImport(() => import("@/pages/user/Profile"));
export const LazySettings = lazyImport(() => import("@/pages/user/Settings"));
export const LazyChangePassword = lazyImport(() => import("@/pages/user/ChangePassword"));
export const LazyUserFeedback = lazyImport(() => import("@/pages/user/Feedback"));
export const LazyUserCards = lazyImport(() => import("@/pages/UserCards"));
export const LazyBadgeProgress = lazyImport(() => import("@/pages/BadgeProgress"));
export const LazyLogAction = lazyImport(() => import("@/pages/user/LogAction"));
export const LazyRippleActionLog = lazyImport(() => import("@/pages/RippleActionLog"));
export const LazyPassForward = lazyImport(() => import("@/pages/PassForward"));
export const LazyTracker = lazyImport(() => import("@/pages/Tracker"));
export const LazyRippleMap = lazyImport(() => import("@/pages/RippleMap"));
export const LazyRippleMapNew = lazyImport(() => import("@/pages/RippleMapNew"));
export const LazyRippleMapOld = lazyImport(() => import("@/pages/RippleMapold"));
export const LazyStoryDetail = lazyImport(() => import("@/pages/StoryDetail"));
export const LazyCardGenerator = lazyImport(() => import("@/pages/CardGenerator"));
export const LazyRippleCard = lazyImport(() => import("@/pages/RippleCard"));
export const LazyResources = lazyImport(() => import("@/pages/Resources"));
export const LazyClassroom = lazyImport(() => import("@/pages/Classroom"));
export const LazyParentDashboard = lazyImport(() => import("@/pages/ParentDashboard"));
export const LazyContent = lazyImport(() => import("@/pages/Content"));
export const LazyAboutUs = lazyImport(() => import("@/pages/AboutUs"));
export const LazySafetySecurity = lazyImport(() => import("@/pages/SafetySecurity"));
export const LazyFAQ = lazyImport(() => import("@/pages/FAQ"));
export const LazyPrivacyPolicy = lazyImport(() => import("@/pages/PrivacyPolicy"));
export const LazyTermsOfService = lazyImport(() => import("@/pages/TermsOfService"));
export const LazyContactUs = lazyImport(() => import("@/pages/ContactUs"));

// Layouts
export const LazyGuestLayout = lazyImport(() => import("@/components/layouts/GuestLayout"));
export const LazyUserLayout = lazyImport(() => import("@/components/layouts/UserLayout"));
export const LazyAdminLayout = lazyImport(() => import("@/components/layouts/AdminLayout"));
export const LazyTeacherLayout = lazyImport(() => import("@/components/layouts/TeacherLayout"));

// Admin Pages
export const LazyAdminDashboard = lazyImport(() => import("@/pages/admin/AdminDashboard"));
export const LazyManageUsers = lazyImport(() => import("@/pages/admin/ManageUsers"));
export const LazyManageCards = lazyImport(() => import("@/pages/admin/ManageCards"));
export const LazyDigitalRippleCards = lazyImport(() => import("@/pages/admin/DigitalRippleCards"));
export const LazyManageRipples = lazyImport(() => import("@/pages/admin/ManageStories"));

export const LazyTiers = lazyImport(() => import("@/pages/admin/Tiers"));
export const LazyChallengeType = lazyImport(() => import("@/pages/admin/ChallengeType"));
export const LazyRewardBadges = lazyImport(() => import("@/pages/admin/RewardBadges"));
export const LazyRewardCards = lazyImport(() => import("@/pages/admin/RewardCards"));
export const LazyRewardChallenges = lazyImport(() => import("@/pages/admin/RewardChallenges"));
export const LazyRewardPointManage = lazyImport(() => import("@/pages/admin/RewardPointManage"));

// New Challenge Card System
export const LazyChallengeCards = lazyImport(() => import("@/pages/admin/ChallengeCards"));
export const LazyCreateChallengeCard = lazyImport(() => import("@/pages/admin/CreateChallengeCard"));
export const LazyEditChallengeCard = lazyImport(() => import("@/pages/admin/EditChallengeCard"));
export const LazyChallengeCardLayouts = lazyImport(() => import("@/pages/admin/ChallengeCardLayouts"));
export const LazyChallengeMaster = lazyImport(() => import("@/pages/admin/ChallengeMaster"));

export const LazyAdminHeroWall = lazyImport(() => import("@/pages/admin/AdminHeroWall"));
export const LazyAdminTeacherHeroWall = lazyImport(() => import("@/pages/admin/AdminRequestHeroWall"));
export const LazyContentManagement = lazyImport(() => import("@/pages/admin/ContentManagement"));
export const LazyAdminLeaderboards = lazyImport(() => import("@/pages/admin/AdminLeaderboards"));
export const LazyAdminAnalytics = lazyImport(() => import("@/pages/admin/AdminAnalytics"));
export const LazyAdminSettings = lazyImport(() => import("@/pages/admin/AdminSettings"));
export const LazyNotificationManagement = lazyImport(() => import("@/pages/admin/NotificationManagement"));
export const LazyAdminProfile = lazyImport(() => import("@/pages/admin/AdminProfile"));
export const LazyAdminChangePassword = lazyImport(() => import("@/pages/admin/AdminChangePassword"));
export const LazyRippleCategories = lazyImport(() => import("@/pages/admin/RippleCategories"));
export const LazyUserProfileDetails = lazyImport(() => import("@/pages/admin/UserProfileDetails"));
export const LazyContactEnquiries = lazyImport(() => import("@/pages/admin/ContactEnquiries"));
export const LazyFeedbackManagement = lazyImport(() => import("@/pages/admin/FeedbackManagement"));
export const LazyArchived = lazyImport(() => import("@/pages/admin/Archived"));
export const LazyAdminRippleCard = lazyImport(() => import("@/pages/admin/AdminRippleCard"));
export const LazyAdminLogAction = lazyImport(() => import("@/pages/admin/AdminLogAction"));
export const LazyFAQManagement = lazyImport(() => import("@/pages/admin/FAQManagement"));
export const LazyAvatarManagement = lazyImport(() => import("@/pages/admin/AvatarManagement"));
export const LazySliderManagement = lazyImport(() => import("@/pages/admin/SliderManagement"));
export const LazySEOManagement = lazyImport(() => import("@/pages/admin/SEOManagement"));
export const LazyAdminPanel = lazyImport(() => import("@/pages/admin/AdminPanel"));
export const LazyAdminAnalyticsDashboard = lazyImport(() => import("@/pages/AdminAnalyticsDashboard"));

// Teacher Pages
export const LazyTeacherDashboard = lazyImport(() => import("@/pages/teacher/TeacherDashboardNew"));
export const LazyClassroomSetup = lazyImport(() => import("@/pages/teacher/ClassroomSetup"));
export const LazyAddStudent = lazyImport(() => import("@/pages/teacher/AddStudent"));
export const LazyManageStudents = lazyImport(() => import("@/pages/teacher/ManageStudents"));
export const LazyManageStudentDetails = lazyImport(() => import("@/pages/teacher/UserProfileDetails"));
export const LazyStudentImport = lazyImport(() => import("@/pages/teacher/StudentImport"));
export const LazyTeacherLeaderboards = lazyImport(() => import("@/pages/teacher/TeacherLeaderboards"));
export const LazyTeacherReports = lazyImport(() => import("@/pages/teacher/TeacherReports"));
export const LazyTeacherHeroWall = lazyImport(() => import("@/pages/teacher/TeacherHeroWall"));
export const LazyTeacherRippleChain = lazyImport(() => import("@/pages/teacher/TeacherRippleChain"));
export const LazyTeacherRippleMap = lazyImport(() => import("@/pages/teacher/TeacherRippleMap"));
export const LazyRippleLearningActivities = lazyImport(() => import("@/pages/teacher/RippleLearningActivities"));
export const LazyTeacherSettings = lazyImport(() => import("@/pages/teacher/TeacherSettings"));
export const LazyTeacherFeedback = lazyImport(() => import("@/pages/teacher/Feedback"));
export const LazyTeacherManageStudentStories = lazyImport(() => import("@/pages/teacher/ManageStories"));
export const LazyTeacherManageStories = lazyImport(() => import("@/pages/teacher/MyStories"));
export const LazyTeacherLogAction = lazyImport(() => import("@/pages/teacher/TeacherLogAction"));
export const LazyTeacherProfile = lazyImport(() => import("@/pages/user/Profile"));
export const LazyTeacherChangePassword = lazyImport(() => import("@/pages/user/ChangePassword"));

