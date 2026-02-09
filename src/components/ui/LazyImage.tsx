import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  wrapperClassName?: string;
  showSkeleton?: boolean; // New prop to enable/disable skeleton
  skeletonClassName?: string; // Custom skeleton styling
}

/**
 * LazyImage Component
 *
 * A performant lazy-loading image component that uses Intersection Observer API
 * to load images only when they enter the viewport.
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Blur-up placeholder effect
 * - Native lazy loading fallback
 * - Fade-in animation on load
 * - Error handling
 *
 * @param src - Image source URL
 * @param alt - Alternative text for the image
 * @param placeholder - Optional placeholder image (low-res or data URL)
 * @param threshold - Intersection observer threshold (0-1)
 * @param rootMargin - Root margin for intersection observer
 * @param onLoad - Callback when image loads
 * @param onError - Callback when image fails to load
 * @param wrapperClassName - Additional classes for wrapper div
 * @param showSkeleton - Show skeleton loader while image loads (default: true)
 * @param skeletonClassName - Custom classes for skeleton loader
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  threshold = 0.01,
  rootMargin = '50px',
  onLoad,
  onError,
  className = '',
  wrapperClassName = '',
  showSkeleton = true,
  skeletonClassName = '',
  style,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if browser supports IntersectionObserver
    if (!window.IntersectionObserver) {
      // Fallback: load image immediately
      setImageSrc(src);
      setIsInView(true);
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setImageSrc(src);
            if (observerRef.current && imageRef) {
              observerRef.current.unobserve(imageRef);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Start observing
    if (imageRef) {
      observerRef.current.observe(imageRef);
    }

    // Cleanup
    return () => {
      if (observerRef.current && imageRef) {
        observerRef.current.unobserve(imageRef);
      }
    };
  }, [imageRef, src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  // Only wrap with skeleton container if skeleton is enabled
  if (!showSkeleton) {
    return (
      <img
        ref={setImageRef}
        src={imageSrc || src}
        alt={alt}
        loading="lazy"
        className={`lazy-image ${className} ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded || !isInView ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          ...style,
        }}
        {...props}
      />
    );
  }

  return (
    <div
      className={`lazy-image-wrapper ${wrapperClassName}`}
      style={{
        position: 'relative',
        display: style?.display || 'inline-block',
        width: style?.width || '100%',
        height: style?.height || 'auto',
      }}
    >
      {/* Skeleton Loader */}
      {!isLoaded && !hasError && (
        <Skeleton
          className={`lazy-image-skeleton ${skeletonClassName}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />
      )}

      {/* Actual Image */}
      <img
        ref={setImageRef}
        src={imageSrc || src}
        alt={alt}
        loading="lazy"
        className={`lazy-image ${className} ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded || !isInView ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'block',
          width: '100%',
          position: 'relative',
          zIndex: 2,
          ...style,
        }}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
