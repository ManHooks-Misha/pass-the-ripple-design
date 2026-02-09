// src/config/avatars.ts
import char1 from "@/assets/characters/char1.png";
import char2 from "@/assets/characters/char2.png";
import char3 from "@/assets/characters/char3.png";
import char4 from "@/assets/characters/char4.png";
import char5 from "@/assets/characters/char5.png";
import char7 from "@/assets/characters/char7.png";
import { getImageUrl } from "./imageUrl";
import { getAvatarImageFromCache, fetchAvatarById, initializeAvatarCache } from "./avatarCache";

export interface CharacterAvatar {
  id: number;
  name: string;
  image: string;
  emoji: string;
}

interface UserProfile {
  nickname?: string;
  avatar_id?: number | null; 
  custom_avatar?: string | null; // ✅ include here too
  profile_image_path?: string | null; // ✅ include profile_image_path
}

// Static fallback avatars (used when API is unavailable)
export const characterAvatars: CharacterAvatar[] = [
  { id: 1, name: "Sunny", image: char1, emoji: "☀️" },
  { id: 2, name: "Star", image: char2, emoji: "⭐" },
  { id: 3, name: "Rainbow", image: char3, emoji: "🌈" },
  { id: 4, name: "Moon", image: char4, emoji: "🌙" },
  { id: 5, name: "Heart", image: char5, emoji: "❤️" },
];

// Static fallback map (used when API is unavailable)
const avatarMap: Record<number, string> = {
  1: char1,
  2: char2,
  3: char3,
  4: char4,
  5: char5,
  7: char7,
};

/**
 * Get avatar image URL dynamically from API cache, with static fallback
 */
export async function getAvatarImageAsync(
  avatarId?: number | null,
  customAvatar?: string | null
): Promise<string | null> {
  if (customAvatar) {
    return getImageUrl(customAvatar);
  }
  
  if (avatarId) {
    // Try to initialize cache if not already done
    await initializeAvatarCache();
    
    // First try to get from API cache
    const cachedImage = getAvatarImageFromCache(avatarId);
    if (cachedImage) {
      return cachedImage;
    }
    
    // If not in cache, try to fetch it
    const avatar = await fetchAvatarById(avatarId);
    if (avatar?.image) {
      return avatar.image;
    }
    
    // Fallback to static mappings
    if (avatarMap[avatarId]) {
      return avatarMap[avatarId];
    }
    
    // Final fallback to first character avatar
    return characterAvatars[0]?.image || null;
  }
  
  return null;
}

/**
 * Get avatar image URL (synchronous version - uses cache if available, falls back to static)
 * This is the preferred function for synchronous contexts
 */
export const getAvatarImage = (
  avatarId?: number | null,
  customAvatar?: string | null
): string | null => {
  if (customAvatar) {
    return getImageUrl(customAvatar);
  }
  
  if (avatarId) {
    // First try to get from API cache (synchronous check)
    const cachedImage = getAvatarImageFromCache(avatarId);
    if (cachedImage) {
      return cachedImage;
    }
    
    // Fallback to static mappings if cache not available
    if (avatarMap[avatarId]) {
      return avatarMap[avatarId];
    }
    
    // Final fallback to first character avatar
    return characterAvatars[0]?.image || null;
  }
  
  return null;
};

/**
 * Get user display with dynamic avatar support
 * This function will use API cache if available, otherwise falls back to static
 */
export function getUserDisplay(user: UserProfile) {
  let avatar: string | undefined;

  // Priority 1: custom_avatar (user uploaded) - check this first
  if (user.custom_avatar) {
    avatar = getImageUrl(user.custom_avatar);
  } 
  // Priority 2: profile_image_path (if exists and not null)
  else if (user.profile_image_path) {
    avatar = getImageUrl(user.profile_image_path);
  } 
  // Priority 3: avatar_id (try dynamic cache first, then static fallback)
  else if (user.avatar_id) {
    // Try dynamic cache first
    const cachedImage = getAvatarImageFromCache(user.avatar_id);
    if (cachedImage) {
      avatar = cachedImage;
    } 
    // Fallback to static map
    else if (avatarMap[user.avatar_id]) {
      avatar = avatarMap[user.avatar_id];
    }
  }

  const nickname = user.nickname || "User"; // fallback nickname
  return { avatar, nickname };
}

// Helper function to get avatar by ID (from static array - for backwards compatibility)
export const getAvatarById = (id: number): CharacterAvatar | undefined => {
  return characterAvatars.find(avatar => avatar.id === id);
};