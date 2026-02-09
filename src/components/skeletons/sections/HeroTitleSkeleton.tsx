import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import "../FlipCardSkeleton.css";

interface HeroTitleSkeletonProps {
  showSubtitle?: boolean;
  showDescription?: boolean;
}

const HeroTitleSkeleton: React.FC<HeroTitleSkeletonProps> = ({
  showSubtitle = true,
  showDescription = true,
}) => {
  return (
    <div className="hero-title-skeleton-wrapper" style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <Skeleton style={{ width: '60%', maxWidth: '600px', height: '120px', margin: '0 auto 1.5rem' }} />
      {showSubtitle && (
        <Skeleton style={{ width: '50%', maxWidth: '400px', height: '2rem', margin: '0 auto 1rem' }} />
      )}
      {showDescription && (
        <>
          <Skeleton style={{ width: '70%', maxWidth: '600px', height: '1.5rem', margin: '0 auto 0.5rem' }} />
          <Skeleton style={{ width: '65%', maxWidth: '550px', height: '1.5rem', margin: '0 auto' }} />
        </>
      )}
    </div>
  );
};

export default HeroTitleSkeleton;
