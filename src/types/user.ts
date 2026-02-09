export type User = {
  id: number;
  email: string;
  nickname: string;
  full_name?: string | null;
  role: string;
  account_status: string;
  registration_status: string;
  ripple_id?: string | null;
  profile_image_path?: string | null;
  created_at: string;
  last_active: string | null;
  age_group?: string | null;
  address?: string;
  is_block?: number;
  is_delete?: number;
  referral_stats?: {
    referred_by?: {
      id: number;
      nickname: string;
      full_name?: string | null;
      email: string;
      ripple_id: string;
    };
    referred_users?: Array<{
      id: number;
      nickname: string;
      email: string;
      role: string;
      created_at: string;
      referral_status: string;
    }>;
    referral_distance?: string;
  };
};

export type UserActivity = {
  rippleStories: number;
  postsLiked: number;
  comments: number;
  badgesEarned: number;
  challengesCompleted: number;
  accountCreatedBy: string;
  rippleJourney: any[];
  recentLikes?: any[];
  recentComments?: any[];
  recentStories?: any[];
};