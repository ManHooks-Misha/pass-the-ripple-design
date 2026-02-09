import React from "react";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, Trophy, Star, ChevronRight, Edit, Trash2 } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";
import { cn } from "@/lib/utils";

export interface DigitalCardProps {
    name: string;
    description?: string;
    card_type: "daily" | "weekly" | "monthly" | "ripple";
    icon_path?: string | null;
    badge_name?: string | null;
    earned_at?: string | null;
    count?: number;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
    isClickable?: boolean;
}

const typeStyles = {
    daily: {
        bg: "from-blue-500/20 via-indigo-500/10 to-transparent",
        border: "border-blue-400/30",
        glow: "shadow-blue-500/20",
        label: "Daily Activity",
        chip: "bg-blue-500 text-white",
    },
    weekly: {
        bg: "from-emerald-500/20 via-teal-500/10 to-transparent",
        border: "border-emerald-400/30",
        glow: "shadow-emerald-500/20",
        label: "Weekly Goal",
        chip: "bg-emerald-500 text-white",
    },
    monthly: {
        bg: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
        border: "border-purple-400/30",
        glow: "shadow-purple-500/20",
        label: "Monthly Master",
        chip: "bg-purple-500 text-white",
    },
    ripple: {
        bg: "from-orange-500/20 via-rose-500/10 to-transparent",
        border: "border-orange-400/30",
        glow: "shadow-orange-500/20",
        label: "Ripple Power",
        chip: "bg-orange-500 text-white",
    },
};

export const DigitalCard: React.FC<DigitalCardProps> = ({
    name,
    description,
    card_type,
    icon_path,
    badge_name,
    earned_at,
    count,
    onEdit,
    onDelete,
    className,
    isClickable = false,
}) => {
    const style = typeStyles[card_type] || typeStyles.daily;

    return (
        <div
            className={cn(
                "relative group perspective-1000 w-full max-w-[300px] aspect-[2/3] mx-auto",
                className
            )}
        >
            <div
                className={cn(
                    "relative w-full h-full premium-card-container",
                    "rounded-[2rem] p-1.5 bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden cursor-pointer",
                    "border border-white/40",
                    style.glow
                )}
            >
                {/* Image Container (Full Size Back) */}
                <div className="absolute inset-0 z-0">
                    {icon_path ? (
                        <div className="w-full h-full relative">
                            <img
                                src={getImageUrl(icon_path)}
                                alt={name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Overlay Gradient to ensure text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", style.bg)} />
                        </div>
                    ) : (
                        <div className={cn("w-full h-full bg-gradient-to-br", style.bg, "flex items-center justify-center")}>
                            <CreditCard className="w-24 h-24 text-white/20" />
                        </div>
                    )}
                </div>

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col p-5 z-10 text-white">
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-4">
                        <Badge className={cn("font-bold uppercase tracking-widest text-[10px] py-1 px-3 rounded-full border-none", style.chip)}>
                            {style.label}
                        </Badge>
                        {count !== undefined && count > 1 && (
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xs font-black">
                                x{count}
                            </div>
                        )}
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 animate-shine" />
                    </div>

                    {/* Bottom Content Area */}
                    <div className="mt-auto space-y-3">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none drop-shadow-lg">
                                {name}
                            </h3>
                            {description && (
                                <p className="text-[11px] text-white/70 line-clamp-2 italic font-medium leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/20">
                            {badge_name ? (
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1 rounded-full bg-yellow-400">
                                        <Trophy className="w-3 h-3 text-black" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{badge_name}</span>
                                </div>
                            ) : earned_at ? (
                                <span className="text-[10px] text-white/50 font-medium">
                                    {new Date(earned_at).toLocaleDateString()}
                                </span>
                            ) : <div />}

                            <Sparkles className="w-4 h-4 text-white/40" />
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {(onEdit || onDelete) && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-2 z-30">
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-xl border border-white/30 text-white shadow-2xl transition-all active:scale-95 group/btn"
                                    title="Edit Card"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="p-2.5 rounded-xl bg-red-500/40 hover:bg-red-500/60 backdrop-blur-xl border border-red-400/30 text-white shadow-2xl transition-all active:scale-95 group/btn"
                                    title="Delete Card"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Glass Border Effect */}
                <div className={cn("absolute inset-0 pointer-events-none rounded-[2rem] border-2", style.border)} />
            </div>
        </div>
    );
};
