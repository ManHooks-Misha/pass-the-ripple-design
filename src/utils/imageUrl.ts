// src/utils/imageUrl.ts
import { UPLOAD_BASE_URL } from "@/config/api";
import placeholderImage from "@/assets/defaults/image-placeholder.png";
import defaultPost from "@/assets/defaults/default-post.jpg";
import defaultAvatar from "@/assets/defaults/image-placeholder.png";
import defaultAvatarBw from "@/assets/defaults/image-placeholder-b&w.png";

/**
 * Default placeholder images for different contexts
 * Using actual imported image files for blur/grey placeholders
 */
export const DEFAULT_IMAGES = {
  // User/Profile placeholders
  avatar: defaultAvatar,
  profile: defaultAvatar,
  
  // Content placeholders
  submission: defaultPost,
  ripple: defaultPost,
  post: defaultPost,
  
  // General placeholders
  image: defaultAvatarBw,
  thumbnail: defaultAvatarBw,
  
  // Company/Organization
  company: placeholderImage,
  logo: placeholderImage,
  
  // Category/Icon
  category: placeholderImage,
  icon: placeholderImage,
} as const;

/**
 * CSS classes for placeholder images
 */
export const PLACEHOLDER_CLASSES = {
  // Grey filter with slight blur
  greyBlur: 'filter grayscale(80%) blur(0.5px) opacity-90',
  
  // Just grey filter
  grey: 'filter grayscale(100%) opacity-80',
  
  // Strong blur
  blur: 'filter blur(1px) opacity-90',
  
  // Light grey
  lightGrey: 'filter grayscale(60%) opacity-70',
} as const;

/**
 * Check if an image URL is a default placeholder
 */
export function isPlaceholderImage(url: string): boolean {
  return Object.values(DEFAULT_IMAGES).includes(url);
}

/**
 * Get CSS classes for placeholder images
 */
export function getPlaceholderClasses(url: string | undefined): string {
  if (!url || isPlaceholderImage(url)) {
    return PLACEHOLDER_CLASSES.greyBlur;
  }
  return '';
}

/**
 * Constructs the full image URL from a path
 * If the path already contains http:// or https://, return as is
 * Otherwise, prepend the UPLOAD_BASE_URL
 * If path is null/undefined, returns default image
 */
export function getImageUrl(
  path: string | null | undefined,
  defaultImage: keyof typeof DEFAULT_IMAGES | string = 'image'
): string {
  // If path doesn't exist, return default image
  if (!path || path.trim() === '') {
    if (defaultImage in DEFAULT_IMAGES) {
      return DEFAULT_IMAGES[defaultImage as keyof typeof DEFAULT_IMAGES];
    }
    return defaultImage;
  }

  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash if present
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // Handle case where path already includes 'storage/' and UPLOAD_BASE_URL ends with '/storage'
  // Example: UPLOAD_BASE_URL = 'https://example.com/storage', path = '/storage/avatars/image.jpg'
  // Result should be: 'https://example.com/storage/avatars/image.jpg' (not 'https://example.com/storage/storage/avatars/image.jpg')
  const baseUrl = UPLOAD_BASE_URL?.endsWith('/') ? UPLOAD_BASE_URL.slice(0, -1) : UPLOAD_BASE_URL;
  if (baseUrl && baseUrl.endsWith('/storage') && cleanPath.startsWith('storage/')) {
    // Remove the 'storage/' prefix from the path since it's already in the base URL
    cleanPath = cleanPath.substring('storage/'.length);
  }

  // Construct full URL, ensuring no double slashes
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Get image URL with placeholder classes
 * Returns both URL and CSS classes
 */
export function getImageWithPlaceholder(
  path: string | null | undefined,
  defaultImage: keyof typeof DEFAULT_IMAGES | string = 'image'
): { url: string; className: string } {
  const url = getImageUrl(path, defaultImage);
  const className = getPlaceholderClasses(url);
  return { url, className };
}

/**
 * Get user avatar URL with default avatar placeholder and classes
 */
export function getAvatarUrl(path: string | null | undefined): { url: string; className: string } {
  return getImageWithPlaceholder(path, 'avatar');
}

/**
 * Get user profile image URL with default profile placeholder and classes
 */
export function getProfileImageUrl(path: string | null | undefined): { url: string; className: string } {
  return getImageWithPlaceholder(path, 'profile');
}

/**
 * Get submission/ripple image URL with default submission placeholder and classes
 */
export function getSubmissionImageUrl(path: string | null | undefined): { url: string; className: string } {
  return getImageWithPlaceholder(path, 'submission');
}

/**
 * Get company logo URL with default logo placeholder and classes
 */
export function getCompanyLogoUrl(path: string | null | undefined): { url: string; className: string } {
  return getImageWithPlaceholder(path, 'logo');
}

/**
 * Get category icon URL with default category placeholder
 */
export function getCategoryIconUrl(path: string | null | undefined): string {
  return getImageUrl(path, 'category');
}

/**
 * Get thumbnail URL with default thumbnail placeholder
 */
export function getThumbnailUrl(path: string | null | undefined): string {
  return getImageUrl(path, 'thumbnail');
}

/**
 * Validate if image URL is accessible (client-side check)
 * Returns a Promise that resolves to true if image loads, false otherwise
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Get image URL with validation fallback
 * If the image fails to load, it will return the default image
 */
export async function getValidatedImageUrl(
  path: string | null | undefined,
  defaultImage: keyof typeof DEFAULT_IMAGES | string = 'image'
): Promise<string> {
  const url = getImageUrl(path, defaultImage);
  
  // If it's already a default image, return it
  if (url === defaultImage || Object.values(DEFAULT_IMAGES).includes(url as any)) {
    return url;
  }
  
  // Try to validate the URL
  const isValid = await validateImageUrl(url);
  
  if (isValid) {
    return url;
  }
  
  // Return default if validation fails
  if (defaultImage in DEFAULT_IMAGES) {
    return DEFAULT_IMAGES[defaultImage as keyof typeof DEFAULT_IMAGES];
  }
  return defaultImage;
}

/**
 * Get initials from name for avatar placeholder
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Check if a path is a default placeholder image
 */
export function isDefaultImage(url: string | undefined): boolean {
  if (!url) return true;
  return Object.values(DEFAULT_IMAGES).includes(url as any);
}

/**
 * Extract filename from image path
 */
export function getImageFilename(path: string | null | undefined): string {
  if (!path) return '';
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Get file extension from image path
 */
export function getImageExtension(path: string | null | undefined): string {
  if (!path) return '';
  const filename = getImageFilename(path);
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is an image based on extension
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const ext = getImageExtension(filename);
  return imageExtensions.includes(ext);
}