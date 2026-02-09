import React from "react";
import { Skeleton } from "@/components/ui/skeleton";


const IndexPageSkeleton: React.FC = () => {
  return (
    <div className="index-page-skeleton">
      {/* Mobile Skeleton */}
      <div className="desktop-none">
        <div className="container mobile-skeleton-wrapper">
          {/* Welcome Section Skeleton */}
          <div className="welcome-skeleton-mobile">
            <Skeleton className="welcome-title-skeleton" />
            <Skeleton className="welcome-text-skeleton" />
            <Skeleton className="welcome-text-skeleton-line2" />
            <Skeleton className="banner-img-skeleton-mobile" />
          </div>

          {/* About Section Skeleton */}
          <div className="about-skeleton-mobile">
            <Skeleton className="about-img-skeleton" />
            <div className="about-text-skeleton-wrapper">
              <Skeleton className="about-text-line" />
              <Skeleton className="about-text-line" />
              <Skeleton className="about-text-line" />
              <Skeleton className="about-text-line" />
            </div>
          </div>

          {/* What is Ripple Section Skeleton */}
          <div className="ripple-info-skeleton-mobile">
            <Skeleton className="ripple-character-img-skeleton" />
            <div className="ripple-text-box-skeleton">
              <Skeleton className="ripple-heading-skeleton" />
              <Skeleton className="ripple-text-line" />
              <Skeleton className="ripple-text-line" />
              <Skeleton className="ripple-text-line" />
            </div>
          </div>

          {/* How To Section Skeleton */}
          <div className="how-to-skeleton-mobile">
            <Skeleton className="how-to-heading-skeleton" />
            <Skeleton className="carousel-skeleton-mobile" />
          </div>

          {/* Why Luma Carousel Skeleton */}
          <div className="why-luma-skeleton-mobile">
            <Skeleton className="why-luma-carousel-skeleton" />
          </div>

          {/* CTA Section Skeleton */}
          <div className="cta-skeleton-mobile">
            <Skeleton className="cta-button-skeleton" />
            <Skeleton className="cta-button-skeleton" />
            <Skeleton className="cta-button-skeleton" />
          </div>
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className="mobile-none">
        <div className="container desktop-skeleton-wrapper">
          {/* Welcome Section Skeleton - Desktop */}
          <div className="welcome-skeleton-desktop">
            <div className="welcome-left-skeleton">
              <Skeleton className="welcome-title-skeleton-desktop" />
              <Skeleton className="welcome-text-skeleton-desktop" />
              <Skeleton className="welcome-text-skeleton-desktop-line2" />
            </div>
            <div className="welcome-right-skeleton">
              <Skeleton className="banner-img-skeleton-desktop" />
            </div>
          </div>

          {/* About Section Skeleton - Desktop */}
          <div className="about-skeleton-desktop">
            <Skeleton className="about-banner-img-skeleton" />
            <div className="about-text-overlay-skeleton">
              <Skeleton className="about-text-line-desktop" />
              <Skeleton className="about-text-line-desktop" />
              <Skeleton className="about-text-line-desktop" />
              <Skeleton className="about-text-line-desktop" />
            </div>
          </div>

          {/* Info Boxes Section Skeleton - Desktop */}
          <div className="info-boxes-skeleton-desktop">
            <div className="info-box-skeleton">
              <Skeleton className="info-box-img-skeleton" />
              <div className="info-box-content-skeleton">
                <Skeleton className="info-box-heading-skeleton" />
                <Skeleton className="info-box-text-skeleton" />
                <Skeleton className="info-box-text-skeleton" />
              </div>
            </div>
            <div className="info-box-skeleton">
              <Skeleton className="info-box-img-skeleton" />
              <div className="info-box-content-skeleton">
                <Skeleton className="info-box-heading-skeleton" />
                <Skeleton className="info-box-text-skeleton" />
                <Skeleton className="info-box-text-skeleton" />
              </div>
            </div>
          </div>

          {/* How To Carousel Section Skeleton - Desktop */}
          <div className="how-to-skeleton-desktop">
            <Skeleton className="how-to-heading-skeleton-desktop" />
            <Skeleton className="carousel-skeleton-desktop" />
          </div>

          {/* Why Luma Section Skeleton - Desktop */}
          <div className="why-luma-skeleton-desktop">
            <div className="why-luma-grid-skeleton">
              <Skeleton className="why-luma-card-skeleton" />
              <Skeleton className="why-luma-card-skeleton" />
              <Skeleton className="why-luma-card-skeleton" />
              <Skeleton className="why-luma-card-skeleton" />
            </div>
          </div>

          {/* Banner Section Skeleton - Desktop */}
          <div className="banner-section-skeleton-desktop">
            <Skeleton className="banner-img-large-skeleton" />
          </div>

          {/* CTA Section Skeleton - Desktop */}
          <div className="cta-skeleton-desktop">
            <Skeleton className="cta-box-skeleton" />
            <Skeleton className="cta-button-large-skeleton" />
            <Skeleton className="cta-button-large-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPageSkeleton;
