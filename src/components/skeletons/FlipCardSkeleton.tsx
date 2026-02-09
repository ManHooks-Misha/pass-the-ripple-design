import React from "react";
import { Skeleton } from "@/components/ui/skeleton";


const FlipCardSkeleton: React.FC = () => {
  return (
    <div className="flip-card-skeleton ripple-card">
      {/* Header with date skeleton */}
      <div className="ripple-card-header">
        <Skeleton className="skeleton-date" />
      </div>

      {/* Image skeleton */}
      <div className="ripple-card-image-wrapper skeleton-image-wrapper">
        <Skeleton className="skeleton-image" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="skeleton-title" />
      <Skeleton className="skeleton-title-line2" />

      {/* Stat skeleton */}
      <Skeleton className="skeleton-stat" />

      {/* Footer with Ripple ID skeleton */}
      <div className="ripple-card-footer">
        <Skeleton className="skeleton-ripple-id" />
      </div>
    </div>
  );
};

export default FlipCardSkeleton;
