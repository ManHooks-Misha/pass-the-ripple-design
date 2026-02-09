import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface InfoBoxesGridSkeletonProps {
  count?: number;
  columns?: number;
}

const InfoBoxesGridSkeleton: React.FC<InfoBoxesGridSkeletonProps> = ({
  count = 3,
  columns = 1,
}) => {
  return (
    <div
      className="info-boxes-grid-skeleton"
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
            height: '200px',
            borderRadius: '1rem'
          }}
        />
      ))}
    </div>
  );
};

export default InfoBoxesGridSkeleton;
