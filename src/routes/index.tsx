// src/routes/index.tsx
import React from "react";
import { RouteConfig } from "./types";
import {
  LazyIndex,
  LazyNotFound,
  LazyPrivacy,
  LazyJourneyMap,
  LazyHeroWallOld,
  LazyLogout,
  LazyVerifyEmail,
  LazyVerifyConsent,
  LazyOnboarding,
  LazyParentConsent,
  LazyForTeachers,

  LazyAgeGate,
  LazyLogin,
  LazyRegister,
  LazyForgotPassword,
  LazyVerifyResetPasswordOTP,
  LazyResetPassword,

  LazyUserLayout,
  LazyAdminLayout,
  LazyTeacherLayout,

  // User pages
  LazyDashboard,
  LazyMyJourneyMap,
  LazyMyHeroWall,
  LazyLeaderboard,
  LazyPublicKindnessHighlights,
  LazyProfile,
  LazySettings,
  LazyChangePassword,
  LazyLogAction,
  LazyRippleActionLog,
  LazyPassForward,
  LazyTracker,
  LazyRippleMap,
  LazyStoryDetail,
  LazyCardGenerator,
  LazyRippleCard,
  LazyResources,
  LazyClassroom,
  LazyParentDashboard,
  LazyContent,
  LazyAboutUs,
  LazyFAQ,
  LazyPrivacyPolicy,
  LazyTermsOfService,
  LazyContactUs,

  // Admin
  LazyAdminDashboard,
  LazyManageUsers,
  LazyManageCards,
  LazyDigitalRippleCards,
  LazyManageRipples,
  LazyTiers,
  LazyRewardBadges,
  LazyAdminHeroWall,
  LazyContentManagement,
  LazyAdminLeaderboards,
  LazyAdminAnalytics,
  LazyAdminSettings,
  LazyAdminProfile,
  LazyAdminChangePassword,
  LazyRippleCategories,
  LazyUserProfileDetails,
  LazyContactEnquiries,
  LazyFeedbackManagement,
  LazyArchived,
  LazyAdminRippleCard,
  LazyAdminLogAction,
  LazyFAQManagement,
  LazyAvatarManagement,
  LazySliderManagement,
  LazySEOManagement,
  LazyAdminPanel,

  // Teacher
  LazyTeacherDashboard,
  LazyClassroomSetup,
  LazyAddStudent,
  LazyManageStudents,
  LazyTeacherLeaderboards,
  LazyTeacherReports,
  LazyTeacherHeroWall,
  LazyTeacherRippleChain,
  LazyTeacherRippleMap,
  LazyRippleLearningActivities,
  LazyTeacherSettings,
  LazyTeacherManageStudentStories,
  LazyGuestLayout,
  LazyStudentImport,
  LazyTeacherManageStories,
  LazyTeacherLogAction,
  LazyRewardChallenges,
  LazyRewardPointManage,
  // LazyGlobalChallengesLeaderboard, // disabled
  LazyPublicChallenges,
  LazyUserChallenges,
  LazyAdminTeacherHeroWall,
  LazyTeacherProfile,
  LazyTeacherChangePassword,
  LazyManageStudentDetails,
  LazyNotificationManagement,
  LazyNotificationsPage,
  LazyAdminAnalyticsDashboard,
  LazyRoleBasedAnalyticsDashboard,
  LazyTeacherAnalyticsDashboard,
  LazyUserAnalyticsDashboard,
  LazyUserFeedback,
  LazyTeacherFeedback,
  LazyHeroWall,
  LazyChallengesNew,
  LazyModernChallenges,
  LazyBadges,
  LazySafetySecurity,
  LazyRewardCards,
  LazyUserCards,
  LazyBadgeProgress,

  // New Challenge Card System
  LazyChallengeCards,
  LazyCreateChallengeCard,
  LazyEditChallengeCard,
  LazyChallengeCardLayouts,
  LazyRippleMapNew,
  LazyRippleMapOld,
  LazyChallengeType,
  LazyChallengeMaster,
} from "./lazyComponents";

export const routes: RouteConfig[] = [
  // 🔓 Public routes
  {
    layout: LazyGuestLayout,
    children: [
      { path: "/", element: <LazyIndex />, public: true },
      { path: "/journey-map", element: <LazyJourneyMap />, public: true },
      { path: "/challenges", element: <LazyModernChallenges />, public: true },
      // { path: "/challenges/:id/leaderboard", element: <LazyGlobalChallengesLeaderboard />, public: true }, // disabled
      { path: "/challenges-leaderboard", element: <LazyChallengesNew />, public: true }, // disabled
      { path: "/challenges-old", element: <LazyChallengesNew />, public: true },
      { path: "/badges", element: <LazyBadges />, public: true },
      { path: "/exchange-badges", element: <LazyBadges />, public: true },
      { path: "/privacy", element: <LazyPrivacy />, public: true },
      { path: "/hero-wall", element: <LazyHeroWall />, public: true },
      { path: "/story/:id", element: <LazyStoryDetail />, public: true },
      { path: "/resources", element: <LazyResources />, public: true },
      { path: "/highlights", element: <LazyPublicKindnessHighlights />, public: true },
      { path: "ripple-map", element: <LazyRippleMap />, public: true },
      { path: "ripple-map-new", element: <LazyRippleMapNew />, public: true },
      { path: "ripple-map-old", element: <LazyRippleMapOld />, public: true },
      { path: "/content", element: <LazyContent />, public: true },
      { path: "/content", element: <LazyContent />, public: true },
      { path: "/about-us", element: <LazyAboutUs />, public: true },
      { path: "/safety-and-security-statement", element: <LazySafetySecurity />, public: true },
      { path: "/faq", element: <LazyFAQ />, public: true },
      { path: "/privacy-policy", element: <LazyPrivacyPolicy />, public: true },
      { path: "/terms-of-service", element: <LazyTermsOfService />, public: true },
      { path: "/contact-us", element: <LazyContactUs />, public: true },
      { path: "/teachers", element: <LazyForTeachers />, public: true }, // NEW: Public For Teachers page

      { path: "/hero-wall-old", element: <LazyHeroWallOld />, public: true },
      { path: "/challenges-old", element: <LazyPublicChallenges />, public: true },


      // 🚪 Guest-only routes
      { path: "/age-gate", element: <LazyAgeGate />, guestOnly: true },
      { path: "/login", element: <LazyLogin />, guestOnly: true },
      { path: "/register", element: <LazyRegister />, guestOnly: true },
      { path: "/forgot-password", element: <LazyForgotPassword />, guestOnly: true },
      { path: "/verify-otp", element: <LazyVerifyResetPasswordOTP />, guestOnly: true },
      { path: "/reset-password", element: <LazyResetPassword />, guestOnly: true },

      // ✉️ Email/consent (public but may require auth later)
      { path: "/verify-email", element: <LazyVerifyEmail />, guestOnly: true },
      { path: "/verify-consent", element: <LazyVerifyConsent />, guestOnly: true },
      { path: "/parent-consent", element: <LazyParentConsent />, guestOnly: true },
    ]
  },

  // 🔐 Protected standalone routes
  { path: "/classroom", element: <LazyClassroom />, roles: ["student", "teacher", "child"] },
  // { path: "/resources", element: <LazyResources />, roles: ["student", "teacher", "parent"] },
  { path: "/parent-dashboard", element: <LazyParentDashboard />, roles: ["child"] },

  // 👤 User layout (wrapped in layout + protected)
  {
    layout: LazyUserLayout,
    roles: ["student", "teacher", "child", "user"],
    children: [
      { path: "dashboard", element: <LazyDashboard /> },
      { path: "my-journey-map", element: <LazyMyJourneyMap /> },
      { path: "ripple-map", element: <LazyRippleMap /> },
      { path: "my-challenges", element: <LazyUserChallenges /> },
      { path: "my-cards", element: <LazyUserCards /> },
      { path: "badge-progress", element: <LazyBadgeProgress /> },
      { path: "my-hero-wall", element: <LazyMyHeroWall /> },
      // { path: "highlights", element: <LazyLeaderboard /> }, // disabled
      // { path: "my-leaderboard", element: <LazyLeaderboard /> }, // disabled
      { path: "ripple-card", element: <LazyRippleCard /> },
      { path: "referral", element: <LazyRippleCard /> },
      { path: "profile", element: <LazyProfile /> },
      { path: "settings", element: <LazySettings /> },
      { path: "notifications", element: <LazyNotificationsPage /> },
      { path: "change-password", element: <LazyChangePassword /> },
      { path: "cards/new", element: <LazyCardGenerator /> },
      { path: "post-story", element: <LazyLogAction /> },
      { path: "ripple-action-log", element: <LazyRippleActionLog /> },
      { path: "pass-forward", element: <LazyPassForward /> },
      { path: "ripple/track", element: <LazyTracker /> },
      { path: "my-story/:id", element: <LazyStoryDetail /> },
      { path: "logout", element: <LazyLogout /> },

      { path: "onboarding", element: <LazyOnboarding /> },
      { path: "analytics", element: <LazyUserAnalyticsDashboard /> },
      { path: "feedback", element: <LazyUserFeedback /> },
    ],
  },

  // 👨‍💼 Admin layout
  {
    path: "/admin",
    layout: LazyAdminLayout,
    roles: ["admin"],
    children: [
      { index: true, element: <LazyAdminDashboard /> },
      { path: "dashboard", element: <LazyAdminDashboard /> },
      { path: "post-story", element: <LazyAdminLogAction /> },
      { path: "ripple-card", element: <LazyAdminRippleCard /> },

      { path: "my-stories", element: <LazyAdminHeroWall /> },
      { path: "herowall-request", element: <LazyAdminTeacherHeroWall /> },

      // { path: "my-leaderboard", element: <LazyLeaderboard /> }, // disabled
      { path: "ripple-cards", element: <LazyDigitalRippleCards /> },
      { path: "manage-ripples", element: <LazyManageRipples /> },
      { path: "my-journey-map", element: <LazyMyJourneyMap /> },
      { path: "ripple-map", element: <LazyRippleMap /> },
      { path: "ripple-symbol", element: <LazyRippleCategories /> },

      { path: "tiers", element: <LazyTiers /> },
      { path: "badges", element: <LazyRewardBadges /> },
      { path: "reward-cards", element: <LazyRewardCards /> },

      // New Challenge Card System
      { path: "challenge-cards", element: <LazyChallengeCards /> },
      // { path: "challenge-type", element: <LazyChallengeType /> }, // Merged into Challenge Master
      // { path: "challenge-card-layouts", element: <LazyChallengeCardLayouts /> }, // Merged into Challenge Master

      { path: "challenge-master", element: <LazyChallengeMaster /> },
      { path: "challenge-type", element: <LazyChallengeMaster /> }, // Redirect/Alias legacy
      { path: "challenge-card-layouts", element: <LazyChallengeMaster /> }, // Redirect/Alias legacy

      { path: "challenge-cards/create", element: <LazyCreateChallengeCard /> },
      { path: "challenge-cards/:id/edit", element: <LazyEditChallengeCard /> },

      { path: "challenges", element: <LazyRewardChallenges /> },
      { path: "point-management", element: <LazyRewardPointManage /> },

      { path: "hero-wall", element: <LazyAdminHeroWall /> },
      { path: "content-management", element: <LazyContentManagement /> },
      // { path: "leaderboards", element: <LazyAdminLeaderboards /> }, // disabled
      { path: "manage-users", element: <LazyManageUsers /> },
      { path: "users/:userId", element: <LazyUserProfileDetails /> },
      { path: "contact-enquiries", element: <LazyContactEnquiries /> },
      { path: "feedback-management", element: <LazyFeedbackManagement /> },
      { path: "faq-management", element: <LazyFAQManagement /> },
      { path: "manage-cards", element: <LazyManageCards /> },
      { path: "cards", element: <LazyManageCards /> },
      { path: "profile", element: <LazyAdminProfile /> },
      { path: "change-password", element: <LazyAdminChangePassword /> },

      { path: "analytics", element: <LazyAdminAnalyticsDashboard /> },

      { path: "manage-notifications", element: <LazyNotificationManagement /> },
      { path: "notifications", element: <LazyNotificationsPage /> },
      { path: "settings", element: <LazyAdminSettings /> },
      { path: "avatar-management", element: <LazyAvatarManagement /> },
      { path: "slider-management", element: <LazySliderManagement /> },
      { path: "seo-management", element: <LazySEOManagement /> },
      { path: "archived", element: <LazyArchived /> },
    ],
  },


  // 👩‍🏫 Teacher layout
  {
    path: "/teacher",
    layout: LazyTeacherLayout,
    roles: ["teacher"],
    children: [
      { index: true, element: <LazyTeacherDashboard /> },
      { path: "dashboard", element: <LazyTeacherDashboard /> },
      { path: "add-student", element: <LazyAddStudent /> },
      { path: "import-student", element: <LazyStudentImport /> },
      { path: "manage-students", element: <LazyManageStudents /> },
      { path: "student/:userId", element: <LazyManageStudentDetails /> },
      { path: "classroom-setup", element: <LazyClassroomSetup /> },

      { path: "post-story", element: <LazyTeacherLogAction /> },
      { path: "ripple-card", element: <LazyRippleCard /> },
      { path: "profile", element: <LazyProfile /> },
      { path: "my-stories", element: <LazyTeacherManageStories /> },
      // { path: "my-leaderboard", element: <LazyLeaderboard /> }, // disabled
      { path: "manage-student-stories", element: <LazyTeacherManageStudentStories /> },

      // { path: "leaderboards", element: <LazyTeacherLeaderboards /> }, // disabled
      { path: "reports", element: <LazyTeacherReports /> },
      { path: "hero-wall", element: <LazyTeacherHeroWall /> },
      { path: "ripple-chain", element: <LazyTeacherRippleChain /> },
      { path: "ripple-map", element: <LazyTeacherRippleMap /> },
      { path: "learning-activities", element: <LazyRippleLearningActivities /> },
      { path: "settings", element: <LazyTeacherSettings /> },
      // Duplicate paths like "notifications" can just reuse dashboard if needed

      { path: "analytics", element: <LazyTeacherAnalyticsDashboard /> },

      { path: "profile", element: <LazyTeacherProfile /> },
      { path: "notifications", element: <LazyNotificationsPage /> },
      { path: "change-password", element: <LazyTeacherChangePassword /> },
      { path: "notifications", element: <LazyTeacherDashboard /> },
      { path: "feedback", element: <LazyTeacherFeedback /> },
    ],
  },

  // ❌ Catch-all
  { path: "*", element: <LazyNotFound /> },
];