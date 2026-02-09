import React, { useState, useRef, useEffect } from 'react';

const WavyBanner = ({ children, color = '#c9f3c2', className = '', height: fixedHeight = null }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 50 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentHeight = contentRef.current.scrollHeight;

        // Calculate SVG dimensions based on actual container and content
        // Use more padding on mobile to prevent overflow
        const isMobile = window.innerWidth <= 768;
        const padding = isMobile ? 140 : 100; // Total padding (70 top + 70 bottom on mobile)

        const newWidth = Math.max(containerWidth, 400);
        const minHeight = isMobile ? 150 : 100; // Increase minimum height on mobile

        // Use fixed height if provided, otherwise calculate based on content
        const newHeight = fixedHeight !== null
          ? fixedHeight
          : Math.max(contentHeight + padding, minHeight);

        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    // Initial update
    updateDimensions();

    // Update after a short delay to ensure content is rendered
    const timer = setTimeout(updateDimensions, 100);

    // Update on window resize
    window.addEventListener('resize', updateDimensions);

    // Create ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [children, fixedHeight]);

  const { width, height } = dimensions;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* GREEN PAPER SHAPE (SOFT WAVY EDGE) - Scales with dimensions */}
        <path
          d={`
            M${width * 0.05} ${height * 0.24}
            L${width * 0.925} ${height * 0.24}
            C${width * 0.842} ${height * 0.22} ${width * 1.98} ${height * 0.278} ${width * 1.9} ${height * 0.417}
            C${width * 1.929} ${height * 0.322} ${width * 1.946} ${height * 0.556} ${width * 1.938} ${height * 0.639}
            C${width * 1.932} ${height * 0.878} ${width * 1.967} ${height * 0.789} ${width * 1.929} ${height * 0.889}
            L${width * 0.017} ${height * 0.833}
            C${width * 0.00} ${height * 0.806} ${width * 0.008} ${height * 0.733} ${width * 0.007} ${height * 0.667}
            C${width * 0.013} ${height * 0.6} ${width * 0.004} ${height * 0.528} ${width * 0.004} ${height * 0.444}
            C${width * 0.01} ${height * 0.361} ${width * 0.006} ${height * 0.289} ${width * 0.005} ${height * 0.22}
            Z
          `}
          fill={color}
        />

        {/* CLEAN BORDER RECTANGLE (TOP LAYER) - Scales with dimensions */}
        <rect
          x={width * 0.001}
          y={height * 0.22}
          width={width * 0.998}
          height={height * 0.667}
          fill="none"
          stroke="#666"
          strokeWidth="1"
        />
      </svg>

      {/* Content Container - Positioned inside the rectangle */}
      <div
        className="absolute"
        style={{
          left: `${(width * 0.01) / width * 100}%`,
          right: `${(width * 0.059) / width * 100}%`,
          top: `${(height * 0.22) / height * 100}%`,
          bottom: `${(height * 0.113) / height * 100}%`,
        }}
      >
        <div
          ref={contentRef}
          className="w-full h-full flex items-center justify-center px-3 sm:px-5 md:px-10 py-3 sm:py-4"
        >
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WavyBanner;