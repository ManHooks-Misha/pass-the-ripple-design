import React from "react";

interface StarProps {
  size?: number; // Size in pixels (default: 100)
  color?: string; // Base color for the star (default: "#8bbcff" - blue)
  glowIntensity?: number; // Glow intensity 0-1 (default: 0.5)
  className?: string;
  style?: React.CSSProperties;
}

const Star: React.FC<StarProps> = ({
  size = 100,
  color = "#8bbcff",
  glowIntensity = 0.5,
  className,
  style,
}) => {
  // Generate unique IDs for SVG elements to avoid conflicts when multiple stars are used
  const uniqueId = React.useId().replace(/:/g, "");

  // Convert hex color to RGB for gradient manipulation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 139, g: 188, b: 255 }; // Default blue
  };

  const rgb = hexToRgb(color);
  const lightColor = `rgba(${Math.min(rgb.r + 50, 255)}, ${Math.min(rgb.g + 50, 255)}, ${Math.min(rgb.b + 50, 255)}, 1)`;
  const midColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;

  // Scale factor based on original 220x220 viewBox
  const viewBoxSize = 220;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Outer soft glow */}
        <filter id={`softGlow-${uniqueId}`}>
          <feGaussianBlur stdDeviation="18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Core bloom */}
        <radialGradient id={`coreGlow-${uniqueId}`}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={lightColor} />
          <stop offset="75%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Spark ray gradient */}
        <radialGradient
          id={`rayGlow-${uniqueId}`}
          gradientUnits="userSpaceOnUse"
          cx="110"
          cy="110"
          r="110"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="30%" stopColor="white" />
          <stop offset="55%" stopColor={midColor} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Core bloom */}
      <circle
        cx="110"
        cy="110"
        opacity={glowIntensity}
        r="28"
        fill={`url(#coreGlow-${uniqueId})`}
        filter={`url(#softGlow-${uniqueId})`}
      />

      {/* Spark wedges (soft rays) */}
      <g fill={`url(#rayGlow-${uniqueId})`} filter={`url(#softGlow-${uniqueId})`}>
        <ellipse cx="110" cy="110" rx="6" ry="90" transform="rotate(0 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="80" transform="rotate(15 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="90" transform="rotate(30 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="80" transform="rotate(45 110 110)" />
        <ellipse cx="110" cy="110" rx="5" ry="85" transform="rotate(60 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="80" transform="rotate(75 110 110)" />
        <ellipse cx="110" cy="110" rx="4" ry="75" transform="rotate(90 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="80" transform="rotate(105 110 110)" />
        <ellipse cx="110" cy="110" rx="5" ry="85" transform="rotate(120 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="80" transform="rotate(135 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="90" transform="rotate(150 110 110)" />
        <ellipse cx="110" cy="110" rx="6" ry="90" transform="rotate(165 110 110)" />
      </g>

      {/* Inner intense sparkle */}
      <circle cx="110" cy="110" r="10" fill="white" opacity="0.9" />
    </svg>
  );
};

export default Star;
