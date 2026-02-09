import { useState } from "react";
import { Sparkles, Heart, RotateCcw } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrl";

interface StoryFlipCardProps {
  story: {
    id: number;
    title: string;
    description: string;
    photo_path: string | null;
    category: {
      name: string;
      color_code?: string;
    };
    action_type: string;
    performed_at_formatted: string;
  };
}

const StoryFlipCard = ({ story }: StoryFlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Helpers ---
  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getCategoryColor = (categoryName: string, colorCode?: string) => {
    if (colorCode) return colorCode;
    const colors: Record<string, string> = {
      "Shared Something": "#60A5FA",
      "Helped Someone": "#A78BFA",
      "Caring friends": "#34D399",
      "Environment": "#2DD4BF",
      "First Ripples": "#FB923C",
      "Creative Kindness": "#F472B6",
      "Thoughtful Moments": "#818CF8",
    };
    return colors[categoryName] || "#9CA3AF";
  };

  const categoryColor = getCategoryColor(
    story.category.name,
    story.category.color_code
  );

  // --- Handlers ---
  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full h-96 group perspective-1000">
      <div
        className={`relative w-full h-full transition-all duration-700 ease-out transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* ================= FRONT CARD ================= */}
        {/* Only clickable when NOT flipped to prevent accidental back-clicks */}
        <div
          onClick={!isFlipped ? handleFlip : undefined}
          className={`absolute inset-0 w-full h-full backface-hidden cursor-pointer ${
            isFlipped ? "pointer-events-none z-0" : "z-10"
          }`}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-transform duration-500 hover:scale-[1.02]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={getImageUrl(story.photo_path)}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80"></div>
            </div>

            {/* Watercolor Splash Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg
                className="absolute -top-10 -right-10 w-64 h-64 opacity-40 mix-blend-overlay"
                viewBox="0 0 200 200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill={categoryColor}
                  className="animate-pulse"
                  style={{ filter: "blur(40px)" }}
                />
              </svg>
            </div>

            {/* Sparkle Icon */}
            <div className="absolute top-6 right-6 animate-bounce-slow">
              <Sparkles
                className="w-8 h-8 text-yellow-300 drop-shadow-lg"
                fill="currentColor"
              />
            </div>

            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span
                className="px-4 py-1.5 rounded-full text-white font-bold text-xs shadow-md uppercase tracking-wider"
                style={{ backgroundColor: categoryColor }}
              >
                {story.category.name}
              </span>
            </div>

            {/* Front Content (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <h3 className="font-black text-2xl text-white mb-3 drop-shadow-md leading-tight line-clamp-2">
                {story.title}
              </h3>

              {/* Tap Indicator */}
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-sm font-bold text-white">
                  ✨ Tap to read story
                </span>
              </div> */}
            </div>
          </div>
        </div>

        {/* ================= BACK CARD ================= */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100 ${
            isFlipped ? "z-10" : "pointer-events-none z-0"
          }`}
        >
          {/* Flex Column to manage scroll area properly */}
          <div className="flex flex-col h-full">
            
            {/* 1. Header (Fixed) */}
            <div
              className="relative p-5 border-b border-dashed flex-shrink-0 bg-gray-50/50"
              style={{ borderColor: `${categoryColor}40` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                ></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {story.category.name}
                </span>
              </div>
              <h3 className="font-bold text-xl text-gray-800 leading-tight line-clamp-1">
                {story.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {story.performed_at_formatted}
              </p>
            </div>

            {/* 2. Scrollable Content (Flexible) */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
               {/* Background Watermark */}
               <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                 <Heart size={120} fill={categoryColor} />
               </div>

              <div className="relative text-gray-600 text-sm leading-relaxed font-medium">
                {/* Opening Quote */}
                <span
                  className="absolute -left-3 -top-3 text-4xl leading-none opacity-20 font-serif"
                  style={{ color: categoryColor }}
                >
                  “
                </span>
                
                {cleanDescription(story.description)}

                {/* Closing Quote */}
                <span
                  className="absolute -right-1 -bottom-3 text-4xl leading-none opacity-20 font-serif"
                  style={{ color: categoryColor }}
                >
                  ”
                </span>
              </div>
            </div>

            {/* 3. Footer / Action (Fixed) */}
            {/* Clicking this specific area triggers the flip back */}
            <div
              onClick={handleFlip}
              className="p-4 bg-gray-50 border-t border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0 group/backBtn"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                 <div className="flex items-center gap-2 text-gray-500">
                    {story.action_type === "Shared Something" && <Heart className="w-4 h-4 text-pink-400" />}
                    <span className="text-xs font-medium italic">
                        {story.action_type === "Shared Something" ? "Sharing is caring" : "Small act, big impact"}
                    </span>
                 </div>
                 
                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: categoryColor }}>
                  <RotateCcw className="w-4 h-4 transition-transform group-hover/backBtn:-rotate-180 duration-500" />
                  <span>Tap to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for 3D Transforms & Scrollbar */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StoryFlipCard;