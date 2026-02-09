import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Sparkles, Settings } from "lucide-react";
import { UPLOAD_BASE_URL } from "@/config/api";

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  badge_category: string;
  max_tier: number;
  is_active: boolean;
  icon_path?: string | null;
  display_order?: number;
  created_at: string;
}

interface BadgeCardProps {
  badge: BadgeItem;
  editBadge: (badge: BadgeItem) => void;
  deleteBadge: (id: string) => void;
  loading?: boolean;
  onConfigureTiers?: (badge: BadgeItem) => void;
}

const FALLBACK_ICON =
  "https://cdn-icons-png.flaticon.com/128/4168/4168977.png";

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  editBadge,
  deleteBadge,
  loading = false,
  onConfigureTiers,
}) => {

  const imageSrc = badge.icon_path
    ? `${UPLOAD_BASE_URL}/${badge.icon_path}`
    : FALLBACK_ICON;

  return (
    <Card className="group relative rounded-3xl overflow-hidden border border-indigo-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
      {/* Header / Icon Area */}
      <div className="relative aspect-square flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 to-white">
        {/* Decorative Ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-indigo-400" />
          </svg>
        </div>

        {/* Shine Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 animate-shine" />
        </div>

        {/* Badge Icon */}
        <div className="relative z-10 w-full h-full p-2">
          <div className="w-full h-full rounded-full bg-white shadow-inner flex items-center justify-center p-3 border border-indigo-50 group-hover:shadow-indigo-200 group-hover:shadow-lg transition-all duration-500">
            <img
              src={imageSrc}
              alt={badge.name}
              className="w-full h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
              onError={(e) => (e.currentTarget.src = FALLBACK_ICON)}
            />
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 rounded-full shadow-lg border-white/50 backdrop-blur-md"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => editBadge(badge)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              {onConfigureTiers && (
                <DropdownMenuItem onClick={() => onConfigureTiers(badge)}>
                  <Settings className="h-4 w-4 mr-2" /> Tiers
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => deleteBadge(badge.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Top-Left Category Badge */}
        <div className="absolute top-2 left-2 z-30">
          <div className="px-2 py-0.5 rounded-full bg-indigo-600/10 backdrop-blur-sm text-indigo-600 text-[9px] font-bold uppercase tracking-tight border border-indigo-100">
            {badge.badge_category || "General"}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 text-center space-y-1 bg-white border-t border-indigo-50/50">
        <h4 className="text-sm font-black text-indigo-900 line-clamp-1 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
          {badge.name}
        </h4>

        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-4 bg-indigo-100" />
          <Badge variant="outline" className="h-auto p-0 border-none text-[10px] font-bold text-indigo-400 shadow-none hover:bg-transparent">
            MAX TIER: {badge.max_tier || 4}
          </Badge>
          <div className="h-px w-4 bg-indigo-100" />
        </div>

        {!badge.is_active && (
          <div className="text-[10px] font-bold text-destructive/70 uppercase">Inactive</div>
        )}
      </div>
    </Card>
  );
};
