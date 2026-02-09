/**
 * User Display Utilities
 *
 * Centralized utilities for displaying user information consistently across the app.
 * Handles the priority logic for names and avatars.
 */

import { getAvatarImage } from "./avatars";
import { getImageUrl } from "./imageUrl";

export interface UserDisplayData {
  nickname?: string | null;
  full_name?: string | null;
  avatar_id?: number | null;
  custom_avatar?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
}

/**
 * Get the display name for a user
 * Priority: nickname > full_name > fallback
 *
 * @param user - User object with nickname and/or full_name
 * @param fallback - Fallback text if no name is available (default: "User")
 * @returns The display name to show
 *
 * @example
 * getUserDisplayName({ nickname: "coolkid123", full_name: "John Doe" }) // "coolkid123"
 * getUserDisplayName({ full_name: "John Doe" }) // "John Doe"
 * getUserDisplayName({}) // "User"
 * getUserDisplayName({}, "Guest") // "Guest"
 */
export function getUserDisplayName(
  user: UserDisplayData | null | undefined,
  fallback: string = "User"
): string {
  if (!user) return fallback;

  // Priority 1: nickname
  if (user.nickname && user.nickname.trim()) {
    return user.nickname.trim();
  }

  // Priority 2: full_name
  if (user.full_name && user.full_name.trim()) {
    return user.full_name.trim();
  }

  // Fallback
  return fallback;
}

/**
 * Get the avatar URL for a user
 * Priority: custom_avatar > profile_image_path > profile_image_url > avatar_id character > null
 *
 * @param user - User object with avatar information
 * @returns The avatar URL or null if no avatar
 *
 * @example
 * getUserAvatarUrl({ custom_avatar: "/uploads/avatar.jpg" }) // Full URL to custom avatar
 * getUserAvatarUrl({ avatar_id: 3 }) // Character avatar #3
 * getUserAvatarUrl({}) // null (will show fallback initials)
 */
export function getUserAvatarUrl(
  user: UserDisplayData | null | undefined
): string | null {
  if (!user) return null;

  // Priority 1: avatar_id (character avatar)
  if (user.avatar_id) {
    return getAvatarImage(user.avatar_id, null);
  }

  // Priority 2: custom_avatar (user uploaded) - check this first
  if (user.custom_avatar) {
    const url = getImageUrl(user.custom_avatar);
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      // console.log('Avatar URL (custom_avatar):', {
      //   original: user.custom_avatar,
      //   processed: url,
      //   user: user.nickname || user.full_name
      // });
    }
    return url;
  }

  // Priority 3: profile_image_path (backend stored)
  if (user.profile_image_path) {
    const url = getImageUrl(user.profile_image_path);
    if (process.env.NODE_ENV === 'development') {
      // console.log('Avatar URL (profile_image_path):', {
      //   original: user.profile_image_path,
      //   processed: url,
      //   user: user.nickname || user.full_name
      // });
    }
    return url;
  }

  // Priority 4: profile_image_url (direct URL)
  if (user.profile_image_url) {
    return user.profile_image_url;
  }

  // No avatar available
  return null;
}

/**
 * Get the initials from a user's name
 * Used as fallback when no avatar image is available
 *
 * @param user - User object with name information
 * @returns 1-2 character initials
 *
 * @example
 * getUserInitials({ nickname: "coolkid123" }) // "C"
 * getUserInitials({ full_name: "John Doe" }) // "JD"
 * getUserInitials({ nickname: "A" }) // "A"
 * getUserInitials({}) // "U"
 */
export function getUserInitials(
  user: UserDisplayData | null | undefined
): string {
  const displayName = getUserDisplayName(user, "User");

  const words = displayName.trim().split(/\s+/);

  if (words.length === 1) {
    // Single word: take first character
    return words[0].charAt(0).toUpperCase();
  } else if (words.length >= 2) {
    // Multiple words: take first character of first and last word
    return (
      words[0].charAt(0).toUpperCase() +
      words[words.length - 1].charAt(0).toUpperCase()
    );
  }

  return "U"; // Ultimate fallback
}

/**
 * Get complete user display information
 * Convenience function that returns both name, avatar, and initials
 *
 * @param user - User object
 * @param nameFallback - Fallback for display name
 * @returns Object with displayName, avatarUrl, and initials
 *
 * @example
 * const { displayName, avatarUrl, initials } = getUserDisplay(user);
 * <Avatar src={avatarUrl} alt={displayName}>{initials}</Avatar>
 * <span>{displayName}</span>
 */
export function getUserDisplay(
  user: UserDisplayData | null | undefined,
  nameFallback: string = "User"
) {
  return {
    displayName: getUserDisplayName(user, nameFallback),
    avatarUrl: getUserAvatarUrl(user),
    initials: getUserInitials(user),
  };
}

/**
 * Check if user has a custom avatar (uploaded image)
 *
 * @param user - User object
 * @returns true if user has uploaded a custom avatar
 */
export function hasCustomAvatar(
  user: UserDisplayData | null | undefined
): boolean {
  if (!user) return false;
  return !!(user.custom_avatar || user.profile_image_path || user.profile_image_url);
}

/**
 * Check if user has a character avatar (avatar_id)
 *
 * @param user - User object
 * @returns true if user has selected a character avatar
 */
export function hasCharacterAvatar(
  user: UserDisplayData | null | undefined
): boolean {
  if (!user) return false;
  return !!user.avatar_id;
}
