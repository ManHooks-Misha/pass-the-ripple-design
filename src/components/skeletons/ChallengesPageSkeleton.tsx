import React from "react";
import { Skeleton } from "@/components/ui/skeleton";


const ChallengesPageSkeleton: React.FC = () => {
  return (
    <div className="challenges-page-skeleton">
      <section className="challenges-page-container container">
        {/* Hero Section Skeleton */}
        <section className="challenges-hero-skeleton">
          <Skeleton className="hero-title-skeleton" />
          <Skeleton className="hero-subtitle-skeleton" />
          <Skeleton className="hero-description-skeleton" />
          <Skeleton className="hero-description-line2-skeleton" />
        </section>

        {/* Main Content Section Skeleton */}
        <section className="main-content-skeleton">
          <div className="row">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Map Skeleton */}
              <div className="map-skeleton-wrapper">
                <Skeleton className="map-image-skeleton" />
              </div>

              {/* Info Boxes Skeleton */}
              <div className="info-boxes-skeleton-wrapper">
                <Skeleton className="info-box-skeleton orange" />
                <Skeleton className="info-box-skeleton blue" />
                <Skeleton className="info-box-skeleton purple" />
              </div>
            </div>
          </div>
        </section>

        {/* Step Message Skeleton */}
        <section className="step-message-skeleton">
          <Skeleton className="step-msg-skeleton" />
        </section>

        {/* Badges Section Skeleton */}
        <section className="badges-skeleton">
          <Skeleton className="badges-title-skeleton" />
          <Skeleton className="badges-image-skeleton" />
        </section>

        {/* Carousel Section Skeleton */}
        <section className="carousel-skeleton">
          <Skeleton className="carousel-title-skeleton" />
          <div className="carousel-items-skeleton">
            <Skeleton className="carousel-card-skeleton" />
            <Skeleton className="carousel-card-skeleton" />
            <Skeleton className="carousel-card-skeleton" />
          </div>
        </section>

        {/* Challenge Cards Grid Skeleton */}
        <section className="challenge-cards-skeleton">
          <Skeleton className="cards-title-skeleton" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="challenge-card-skeleton" />
            <Skeleton className="challenge-card-skeleton" />
            <Skeleton className="challenge-card-skeleton" />
            <Skeleton className="challenge-card-skeleton" />
            <Skeleton className="challenge-card-skeleton" />
            <Skeleton className="challenge-card-skeleton" />
          </div>
        </section>

        {/* CTA Buttons Skeleton */}
        <section className="cta-buttons-skeleton">
          <Skeleton className="cta-button-skeleton blue-btn" />
          <Skeleton className="cta-button-skeleton green-btn" />
        </section>

        {/* Footer Skeleton */}
        <section className="footer-skeleton">
          <Skeleton className="footer-image-skeleton" />
        </section>
      </section>
    </div>
  );
};

export default ChallengesPageSkeleton;
