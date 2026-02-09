import { Avatar } from "@/components/admin/Avatar";
import { getUserDisplayName, getUserAvatarUrl } from "@/utils/userDisplay";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserIdentityProps {
  avatar_id?: number | null;
  custom_avatar?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  nickname?: string | null;
  full_name?: string | null;
  ripple_id?: string | null;
  size?: string;
  showRippleId?: boolean;
  showBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    avatar: "h-8 w-8",
    text: "text-sm",
    badge: "text-xs px-2 py-0.5",
  },
  md: {
    avatar: "h-10 w-10",
    text: "text-base",
    badge: "text-xs px-2 py-1",
  },
  lg: {
    avatar: "h-12 w-12",
    text: "text-lg",
    badge: "text-sm px-3 py-1",
  },
  xl: {
    avatar: "h-16 w-16",
    text: "text-xl",
    badge: "text-sm px-3 py-1",
  },
};

/**
 * UserIdentity Component
 *
 * A reusable component to display user identity information including:
 * - Avatar (character avatar or custom uploaded image)
 * - Nickname
 * - Ripple ID (optional)
 *
 * @param avatar_id - ID of the character avatar (1-5)
 * @param custom_avatar - Custom avatar URL or path
 * @param profile_image_path - Profile image path from backend
 * @param nickname - User's nickname
 * @param ripple_id - User's unique Ripple ID
 * @param size - Size variant: sm, md, lg, xl (default: md)
 * @param showRippleId - Whether to display the Ripple ID (default: true)
 * @param showBadge - Whether to display the Ripple ID as a badge (default: true)
 * @param className - Additional CSS classes
 */
export function UserIdentity({
  avatar_id,
  custom_avatar,
  profile_image_path,
  profile_image_url,
  nickname,
  full_name,
  ripple_id,
  size = "w-10 h-10",
  showRippleId = true,
  showBadge = true,
  className = "",
}: UserIdentityProps) {
  const displayName = getUserDisplayName({ nickname, full_name }, "User");
  const avatarSrc = getUserAvatarUrl({
    avatar_id,
    custom_avatar,
    profile_image_path,
    profile_image_url,
  });

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar src={avatarSrc} name={displayName} size={size} />

      <div className="flex flex-col">
        <span className={`font-semibold text-foreground md`}>
          {displayName}
        </span>

        {/* <div className="flex items-center gap-1 mt-1">
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {ripple_id || "N/A"}
          </span>
          {ripple_id && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(ripple_id);
                toast({
                  title: "Copied!",
                  description: "Ripple ID copied to clipboard.",
                });
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy Ripple ID"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div> */}
      </div>
    </div>
  );
}

/**
 * Compact version - Avatar only with tooltip
 */
interface UserAvatarOnlyProps {
  avatar_id?: number | null;
  custom_avatar?: string | null;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  nickname?: string | null;
  full_name?: string | null;
  size?: string;
  className?: string;
}

export function UserAvatarOnly({
  avatar_id,
  custom_avatar,
  profile_image_path,
  profile_image_url,
  nickname,
  full_name,
  size = "w-10 h-10",
  className = "",
}: UserAvatarOnlyProps) {
  const displayName = getUserDisplayName({ nickname, full_name }, "User");
  const avatarSrc = getUserAvatarUrl({
    avatar_id,
    custom_avatar,
    profile_image_path,
    profile_image_url,
  });

  return (
    <div className={className}>
      <Avatar src={avatarSrc} name={displayName} size={size} />
    </div>
  );
}

/**
 * LoggedInUserAvatar Component
 * 
 * Automatically displays the currently logged-in user's avatar from auth context.
 * No props needed - it pulls data directly from useAuth().
 * 
 * @param size - Avatar size (default: "w-10 h-10")
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <LoggedInUserAvatar size="w-12 h-12" />
 * ```
 */
interface LoggedInUserAvatarProps {
  size?: string;
  className?: string;
}

export function LoggedInUserAvatar({
  size = "w-10 h-10",
  className = "",
}: LoggedInUserAvatarProps) {
  const { user } = useAuth();

  if (!user) {
    return null; // Or return a default avatar
  }

  const displayName = getUserDisplayName(user, "User");
  const avatarSrc = getUserAvatarUrl(user);

  return (
    <div className={className}>
      <Avatar
        src={avatarSrc}
        name={displayName}
        size={size}
      />
    </div>
  );
}

/**
 * LoggedInUserIdentity Component
 * 
 * Displays the logged-in user's full identity (avatar + nickname + ripple ID).
 * Automatically pulls data from auth context.
 * 
 * @param showRippleId - Whether to show Ripple ID (default: true)
 * @param size - Avatar size (default: "w-10 h-10")
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <LoggedInUserIdentity showRippleId={false} size="w-12 h-12" />
 * ```
 */
interface LoggedInUserIdentityProps {
  showRippleId?: boolean;
  size?: string;
  className?: string;
}

export function LoggedInUserIdentity({
  showRippleId = true,
  size = "w-10 h-10",
  className = "",
}: LoggedInUserIdentityProps) {
  const { user } = useAuth();

  if (!user) {
    return null; // Or return a loading state
  }

  const displayName = getUserDisplayName(user, "User");
  const avatarSrc = getUserAvatarUrl(user);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar src={avatarSrc} name={displayName} size={size} />

      <div className="flex flex-col">
        <span className="font-semibold text-foreground">
          {displayName}
        </span>

        {showRippleId && user.ripple_id && (
          <div className="flex items-center gap-1 mt-1">
            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {user.ripple_id}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(user.ripple_id!);
                toast({
                  title: "Copied!",
                  description: "Ripple ID copied to clipboard.",
                });
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy Ripple ID"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * LoggedInUserName Component
 * 
 * Displays only the logged-in user's nickname.
 * Automatically pulls data from auth context.
 * 
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <LoggedInUserName className="text-lg font-bold" />
 * ```
 */
interface LoggedInUserNameProps {
  className?: string;
}

export function LoggedInUserName({ className = "" }: LoggedInUserNameProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user, "User");

  return (
    <span className={className}>
      {displayName}
    </span>
  );
}

interface UserRippleIdOnlyProps {
  ripple_id?: string | null;
}

export function UserRippleCopy({ ripple_id }: UserRippleIdOnlyProps) {
  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
        {ripple_id || "N/A"}
      </span>
      {ripple_id && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(ripple_id);
            toast({
              title: "Copied!",
              description: "Ripple ID copied to clipboard.",
            });
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy Ripple ID"
        >
          <Copy className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}