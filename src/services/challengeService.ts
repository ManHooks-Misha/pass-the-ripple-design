import { apiFetch } from "@/config/api";
import { Challenge, ChallengeStats, UserChallenge } from "@/types/Challenge";

export const challengeService = {
    // Get active challenges (public)
    getActiveChallenges: async (): Promise<Challenge[]> => {
        // const response = await apiFetch<{ data: any }>("/challenges?status=active");
        const response = await apiFetch<{ data: any }>(
            `/challenges?status=active&t=${Date.now()}`
        );

        // Handle paginated response which puts data inside another data property
        if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        return Array.isArray(response.data) ? response.data : [];
    },

    // Get user's challenges (my challenges)
    getUserChallenges: async (): Promise<UserChallenge[]> => {
        // const response = await apiFetch<{ data: UserChallenge[] }>("/challenges/my-challenges");
        const response = await apiFetch<{ data: UserChallenge[] }>(
            `/challenges/my-challenges?t=${Date.now()}`
        );

        return response.data;
    },

    // Get user's challenge stats
    getUserChallengeStats: async (): Promise<ChallengeStats> => {
        const response = await apiFetch<{ data: ChallengeStats }>("/challenges/stats");
        return response.data;
    },

    // Get completed challenges
    getCompletedChallenges: async (): Promise<UserChallenge[]> => {
        const response = await apiFetch<{ data: UserChallenge[] }>("/challenges/completed");
        return response.data;
    },

    // Join a challenge
    joinChallenge: async (challengeId: number, userId: number): Promise<any> => {
        const response = await apiFetch("/challenges/join", {
            method: 'POST',
            body: JSON.stringify({ challenge_id: challengeId, user_id: userId })
        });
        return response;
    },

    // Track progress (if manual tracking needed)
    trackProgress: async (challengeId: number, progressIncrement: number = 1): Promise<any> => {
        const response = await apiFetch("/challenges/progress", {
            method: 'POST',
            body: JSON.stringify({
                challenge_id: challengeId,
                progress_increment: progressIncrement
            })
        });
        return response;
    },

    // Get user badges
    getUserBadges: async (userId: number): Promise<any> => {
        const response = await apiFetch<{ data: any }>(`/users/${userId}/badges`);
        return response.data;
    },

    // Get single challenge
    getChallenge: async (id: number): Promise<Challenge> => {
        const response = await apiFetch<{ data: Challenge }>(`/challenges/${id}`);
        return response.data;
    }
};
