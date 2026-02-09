import React from "react";
import { Skeleton } from "@/components/ui/skeleton";


const InfoCardSkeleton: React.FC = () => {
  return (
    <div className="info-card-skeleton">
      <Skeleton className="info-card-skeleton-icon" />
      <Skeleton className="info-card-skeleton-title" />
      <Skeleton className="info-card-skeleton-text" />
      <Skeleton className="info-card-skeleton-text-line2" />
    </div>
  );
};

export default InfoCardSkeleton;
