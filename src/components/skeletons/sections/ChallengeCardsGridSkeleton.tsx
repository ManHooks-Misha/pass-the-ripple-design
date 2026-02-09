import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChallengeCardsGridSkeletonProps {
  count?: number;
  columns?: number;
}

const ChallengeCardsGridSkeleton: React.FC<ChallengeCardsGridSkeletonProps> = ({
  count = 6,
  columns = 3,
}) => {
  return (
    <div
      className="challenge-cards-grid-skeleton"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '2rem',
        marginBottom: '3rem'
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          style={{
            width: '100%',
            height: '400px',
            borderRadius: '1rem'
          }}
        />
      ))}
    </div>
  );
};

export default ChallengeCardsGridSkeleton;
