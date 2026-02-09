import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width = '100%',
  height = '300px',
  borderRadius = '1rem',
  className = '',
}) => {
  return (
    <Skeleton
      className={className}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};

export default ImageSkeleton;
