export interface ChallengeAsset {
    layout_image_path?: string;
    background_image_path?: string;
    assets?: Record<string, any>;
}

export interface Challenge {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: 'upcoming' | 'active' | 'completed';
    challenge_type: string;
    target_metric: string;
    target_value: number;
    reward_points: number;
    image_path?: string;
    background_image_path?: string;
    badge_id?: number;
    tier_id?: number;
    badge_count?: number;
    ripple_category_id?: number;
    layout_id?: number;
    final_card_image_path?: string;
    assets?: Record<string, any>;
    card_config?: any; // JSON structure for card elements
    layout_color?: string;
    badge?: {
        id: number;
        name: string;
        badge_image_path?: string;
    };

    // User progress fields (if loaded)
    user_progress?: number;
    completion_rate?: number;
    is_joined?: boolean;
    participants_count?: number;

    // Additional fields for frontend logic
    user_joined?: boolean;
}

export interface UserChallenge {
    id: number;
    user_id: number;
    challenge_id: number;
    status: 'active' | 'completed' | 'failed';
    progress: number;
    completed_at?: string;
    challenge?: Challenge;
}

export interface ChallengeStats {
    active_challenges_count: number;
    completed_challenges_count: number;
    total_points_earned: number;
    badges_earned?: number;
    current_tier?: {
        name: string;
        level: number;
    };
}
