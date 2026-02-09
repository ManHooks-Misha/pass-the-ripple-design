import React from "react";
import { Skeleton } from "@/components/ui/skeleton";


const CarouselSkeleton: React.FC = () => {
  return (
    <div className="carousel-skeleton">
      {/* Create 3 carousel item skeletons (visible items) */}
      {[1, 2, 3].map((index) => (
        <div key={index} className="carousel-item-skeleton">
          <Skeleton className="carousel-skeleton-image" />
        </div>
      ))}
    </div>
  );
};

export default CarouselSkeleton;
