import React from "react";
import { Skeleton } from "@/components/ui/skeleton";


const HeroSectionSkeleton: React.FC = () => {
  return (
    <div className="hero-section-skeleton">
      <div className="hero-content-wrapper-skeleton">
        {/* Left side - Character image skeleton */}
        <div className="hero-characters-left-skeleton">
          <Skeleton className="hero-character-skeleton" />
        </div>

        {/* Right side - Content skeleton */}
        <div className="hero-content-right-skeleton">
          {/* Title skeleton */}
          <Skeleton className="hero-title-skeleton" />

          {/* Subtitle skeleton */}
          <Skeleton className="hero-subtitle-skeleton" />
          <Skeleton className="hero-subtitle-line2-skeleton" />
        </div>
      </div>
    </div>
  );
};

export default HeroSectionSkeleton;
