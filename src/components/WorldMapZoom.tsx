import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import worldMap from "@/assets/kindness-map/world-map-watercolor.png";
import worldMapFrame from "@/assets/kindness-map/world-map-watercolor-frame.png";
import starUnivers from "@/assets/kindness-map/star-univers.png";
import book from "@/assets/kindness-map/Book.png";
import Star from "@/components/Star";

// Star colors for different states
const STAR_COLORS = {
  gold: "#ffd700",
  blue: "#4da6ff",
  silver: "#c0c0c0",
  orange: "#ff8c00",
};

// Stars to display on states (state key, color, size, glowIntensity, content for book)
const STATE_STARS: Array<{
  state: string;
  color: string;
  size: number;
  glow: number;
  title: string;
  description: string;
  image?: string;
}> = [
  {
    state: "california",
    color: STAR_COLORS.gold,
    size: 55,
    glow: 0.9,
    title: "California Kindness",
    description: "A heartwarming story of community support in the Golden State. Neighbors came together to help rebuild after the wildfires.",
  },
  {
    state: "texas",
    color: STAR_COLORS.orange,
    size: 50,
    glow: 0.85,
    title: "Texas Generosity",
    description: "Local volunteers organized food drives that fed over 10,000 families during the holiday season.",
  },
  {
    state: "florida",
    color: STAR_COLORS.blue,
    size: 45,
    glow: 0.8,
    title: "Florida Sunshine",
    description: "Beach cleanup initiatives brought together thousands of volunteers to protect marine life.",
  },
  {
    state: "illinois",
    color: STAR_COLORS.silver,
    size: 35,
    glow: 0.7,
    title: "Illinois Unity",
    description: "Chicago communities united to create safe spaces for youth education and mentorship.",
  },
  {
    state: "washington",
    color: STAR_COLORS.gold,
    size: 38,
    glow: 0.75,
    title: "Washington Wonder",
    description: "Tech companies partnered with schools to provide laptops for underprivileged students.",
  },
  {
    state: "colorado",
    color: STAR_COLORS.blue,
    size: 32,
    glow: 0.65,
    title: "Colorado Care",
    description: "Mountain rescue teams volunteered countless hours to keep hikers safe.",
  },
  {
    state: "georgia",
    color: STAR_COLORS.orange,
    size: 40,
    glow: 0.8,
    title: "Georgia Grace",
    description: "Southern hospitality shone bright as communities welcomed refugees with open arms.",
  },
  {
    state: "arizona",
    color: STAR_COLORS.silver,
    size: 30,
    glow: 0.6,
    title: "Arizona Hope",
    description: "Desert communities created water stations to help travelers in need.",
  },
  {
    state: "massachusetts",
    color: STAR_COLORS.gold,
    size: 28,
    glow: 0.7,
    title: "Massachusetts Magic",
    description: "Historic towns preserved their heritage while building inclusive communities.",
  },
  {
    state: "michigan",
    color: STAR_COLORS.blue,
    size: 42,
    glow: 0.75,
    title: "Michigan Miracle",
    description: "Auto workers raised funds to support families affected by plant closures.",
  },
];

// Path connections from main star (New York) to other stars
// Each path defines: target state, color, and curve direction (1 = curve up, -1 = curve down)
const STAR_PATHS: Array<{ from: string; to: string; color: string; curveDirection: number }> = [
  // Direct connections from New York (main starUnivers)
  { from: "newYork", to: "california", color: STAR_COLORS.silver, curveDirection: -1 },
  { from: "newYork", to: "texas", color: STAR_COLORS.silver, curveDirection: 1 },
  { from: "newYork", to: "florida", color: STAR_COLORS.silver, curveDirection: 1 },
  { from: "newYork", to: "michigan", color: STAR_COLORS.silver, curveDirection: -1 },
  // Secondary connections (star to star)
  { from: "california", to: "washington", color: STAR_COLORS.silver, curveDirection: -1 },
  { from: "california", to: "arizona", color: STAR_COLORS.silver, curveDirection: 1 },
  { from: "texas", to: "colorado", color: STAR_COLORS.silver, curveDirection: -1 },
  { from: "michigan", to: "illinois", color: STAR_COLORS.silver, curveDirection: 1 },
  { from: "florida", to: "georgia", color: STAR_COLORS.silver, curveDirection: -1 },
  { from: "newYork", to: "massachusetts", color: STAR_COLORS.silver, curveDirection: -1 },
];

// Helper function to generate curved path between two points
const generateCurvedPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curveDirection: number = 1
): string => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Calculate perpendicular offset for curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Curve intensity based on distance (more curve for longer paths)
  const curveIntensity = Math.min(distance * 0.25, 50);

  // Perpendicular vector (normalized)
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Control point offset
  const controlX = midX + perpX * curveIntensity * curveDirection;
  const controlY = midY + perpY * curveIntensity * curveDirection;

  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
};

// US State coordinates (based on New York at x: 420, y: 480)
// Offset: -345 on x, -25 on y from original coordinates
const US_STATE_COORDINATES: Record<string, { x: number; y: number; name: string }> = {
  // Northeast
  maine: { x: 450, y: 460, name: "Maine" },
  newHampshire: { x: 440, y: 470, name: "New Hampshire" },
  vermont: { x: 430, y: 465, name: "Vermont" },
  massachusetts: { x: 445, y: 480, name: "Massachusetts" },
  rhodeIsland: { x: 447, y: 485, name: "Rhode Island" },
  connecticut: { x: 440, y: 487, name: "Connecticut" },
  newYork: { x: 420, y: 480, name: "New York" },
  newJersey: { x: 433, y: 495, name: "New Jersey" },
  pennsylvania: { x: 415, y: 495, name: "Pennsylvania" },

  // Southeast
  delaware: { x: 430, y: 503, name: "Delaware" },
  maryland: { x: 423, y: 505, name: "Maryland" },
  virginia: { x: 410, y: 515, name: "Virginia" },
  westVirginia: { x: 403, y: 510, name: "West Virginia" },
  northCarolina: { x: 410, y: 530, name: "North Carolina" },
  southCarolina: { x: 405, y: 540, name: "South Carolina" },
  georgia: { x: 395, y: 550, name: "Georgia" },
  florida: { x: 400, y: 585, name: "Florida" },

  // Midwest
  ohio: { x: 390, y: 500, name: "Ohio" },
  michigan: { x: 375, y: 475, name: "Michigan" },
  indiana: { x: 375, y: 510, name: "Indiana" },
  illinois: { x: 360, y: 510, name: "Illinois" },
  wisconsin: { x: 355, y: 475, name: "Wisconsin" },
  minnesota: { x: 335, y: 460, name: "Minnesota" },
  iowa: { x: 335, y: 495, name: "Iowa" },
  missouri: { x: 340, y: 525, name: "Missouri" },
  northDakota: { x: 305, y: 455, name: "North Dakota" },
  southDakota: { x: 305, y: 475, name: "South Dakota" },
  nebraska: { x: 300, y: 500, name: "Nebraska" },
  kansas: { x: 305, y: 525, name: "Kansas" },

  // South
  kentucky: { x: 383, y: 523, name: "Kentucky" },
  tennessee: { x: 375, y: 535, name: "Tennessee" },
  alabama: { x: 375, y: 555, name: "Alabama" },
  mississippi: { x: 360, y: 560, name: "Mississippi" },
  arkansas: { x: 340, y: 545, name: "Arkansas" },
  louisiana: { x: 345, y: 575, name: "Louisiana" },
  oklahoma: { x: 305, y: 545, name: "Oklahoma" },
  texas: { x: 285, y: 575, name: "Texas" },

  // Mountain
  montana: { x: 250, y: 455, name: "Montana" },
  wyoming: { x: 260, y: 485, name: "Wyoming" },
  colorado: { x: 265, y: 520, name: "Colorado" },
  newMexico: { x: 255, y: 555, name: "New Mexico" },
  idaho: { x: 225, y: 470, name: "Idaho" },
  utah: { x: 235, y: 510, name: "Utah" },
  arizona: { x: 230, y: 550, name: "Arizona" },
  nevada: { x: 210, y: 510, name: "Nevada" },

  // Pacific
  washington: { x: 200, y: 450, name: "Washington" },
  oregon: { x: 195, y: 475, name: "Oregon" },
  california: { x: 190, y: 525, name: "California" },

  // Non-contiguous
  alaska: { x: 135, y: 395, name: "Alaska" },
  hawaii: { x: 175, y: 615, name: "Hawaii" },

  // DC
  districtOfColumbia: { x: 425, y: 507, name: "Washington D.C." },
};

// Country coordinates on the map (x, y positions on the 2000x1200 image)
const COUNTRY_COORDINATES: Record<string, { x: number; y: number; name: string }> = {
  // North America
  usa: { x: 680, y: 560, name: "United States" },
  canada: { x: 400, y: 250, name: "Canada" },
  mexico: { x: 350, y: 480, name: "Mexico" },

  // South America
  brazil: { x: 620, y: 680, name: "Brazil" },
  argentina: { x: 560, y: 820, name: "Argentina" },
  colombia: { x: 520, y: 560, name: "Colombia" },
  peru: { x: 500, y: 640, name: "Peru" },
  chile: { x: 520, y: 780, name: "Chile" },

  // Europe
  uk: { x: 930, y: 290, name: "United Kingdom" },
  france: { x: 950, y: 340, name: "France" },
  germany: { x: 1000, y: 310, name: "Germany" },
  italy: { x: 1010, y: 370, name: "Italy" },
  spain: { x: 920, y: 380, name: "Spain" },
  poland: { x: 1040, y: 300, name: "Poland" },
  ukraine: { x: 1120, y: 310, name: "Ukraine" },
  netherlands: { x: 970, y: 295, name: "Netherlands" },
  sweden: { x: 1020, y: 220, name: "Sweden" },
  norway: { x: 990, y: 200, name: "Norway" },

  // Asia
  russia: { x: 1300, y: 220, name: "Russia" },
  china: { x: 1450, y: 400, name: "China" },
  japan: { x: 1620, y: 380, name: "Japan" },
  india: { x: 1320, y: 480, name: "India" },
  southKorea: { x: 1560, y: 390, name: "South Korea" },
  indonesia: { x: 1500, y: 620, name: "Indonesia" },
  thailand: { x: 1420, y: 520, name: "Thailand" },
  vietnam: { x: 1460, y: 510, name: "Vietnam" },
  philippines: { x: 1560, y: 520, name: "Philippines" },
  singapore: { x: 1440, y: 590, name: "Singapore" },
  malaysia: { x: 1440, y: 570, name: "Malaysia" },

  // Middle East
  uae: { x: 1220, y: 460, name: "United Arab Emirates" },
  saudiArabia: { x: 1180, y: 450, name: "Saudi Arabia" },
  israel: { x: 1120, y: 410, name: "Israel" },
  turkey: { x: 1100, y: 370, name: "Turkey" },

  // Africa
  egypt: { x: 1080, y: 440, name: "Egypt" },
  southAfrica: { x: 1080, y: 780, name: "South Africa" },
  nigeria: { x: 990, y: 540, name: "Nigeria" },
  kenya: { x: 1120, y: 600, name: "Kenya" },
  morocco: { x: 920, y: 420, name: "Morocco" },

  // Oceania
  australia: { x: 1580, y: 740, name: "Australia" },
  newZealand: { x: 1750, y: 850, name: "New Zealand" },
};

// Default country to focus on
const DEFAULT_COUNTRY = "usa";

const WorldMapZoom: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStar, setSelectedStar] = useState<string | null>(null);
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Get selected star data
  const selectedStarData = STATE_STARS.find((s) => s.state === selectedStar);

  // Handle star click
  const handleStarClick = (state: string) => {
    setSelectedStar(state);
    setIsBookOpen(true);
  };

  // Close book
  const handleCloseBook = () => {
    setIsBookOpen(false);
    setTimeout(() => setSelectedStar(null), 300); // Clear selection after animation
  };

  // Fixed image dimensions
  const IMAGE_WIDTH = 2500;
  const IMAGE_HEIGHT = 1200;

  // Function to calculate transform for focusing on a country
  const getCountryTransform = (countryCode: string, scale: number, viewportWidth: number, viewportHeight: number) => {
    const country = COUNTRY_COORDINATES[countryCode] || COUNTRY_COORDINATES[DEFAULT_COUNTRY];

    // Calculate the translation to center the country in the viewport
    const x = viewportWidth / 2 - country.x * scale;
    const y = viewportHeight / 2 - country.y * scale;

    return d3.zoomIdentity.translate(x, y).scale(scale);
  };

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const g = d3.select<SVGGElement, unknown>(gRef.current);

    const width = window.innerWidth;
    const height = window.innerHeight;

    svg
      .attr("width", width)
      .attr("height", height);

    // Calculate minimum scale to cover the entire viewport
    const scaleX = width / IMAGE_WIDTH;
    const scaleY = height / IMAGE_HEIGHT;
    const minScale = Math.max(scaleX, scaleY); // Use max to ensure full coverage

    // Default scale is 1.5x the minimum scale (50% zoomed in from minimum coverage)
    const defaultScale = minScale * 2;

    // Function to constrain transform to keep image covering viewport
    const constrainTransform = (transform: d3.ZoomTransform) => {
      const scale = transform.k;
      const scaledWidth = IMAGE_WIDTH * scale;
      const scaledHeight = IMAGE_HEIGHT * scale;

      let x = transform.x;
      let y = transform.y;

      // If image is wider than viewport, allow horizontal panning
      if (scaledWidth > width) {
        // Can pan left (negative x) until right edge reaches viewport right
        const minX = width - scaledWidth;
        // Can pan right (positive x) until left edge reaches viewport left
        const maxX = 0;
        x = Math.max(minX, Math.min(maxX, x));
      } else {
        // Center horizontally if image is smaller than viewport
        x = (width - scaledWidth) / 2;
      }

      // If image is taller than viewport, allow vertical panning
      if (scaledHeight > height) {
        // Can pan up (negative y) until bottom edge reaches viewport bottom
        const minY = height - scaledHeight;
        // Can pan down (positive y) until top edge reaches viewport top
        const maxY = 0;
        y = Math.max(minY, Math.min(maxY, y));
      } else {
        // Center vertically if image is smaller than viewport
        y = (height - scaledHeight) / 2;
      }

      return d3.zoomIdentity.translate(x, y).scale(scale);
    };

    // Create zoom behavior with constrained transform
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([minScale, 8]) // Minimum scale ensures full coverage, max is 8x
      .on("start", () => {
        setIsDragging(true);
      })
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const constrainedTransform = constrainTransform(event.transform);
        g.attr("transform", constrainedTransform.toString());

        // Update the zoom transform to match constrained values
        if (constrainedTransform.toString() !== event.transform.toString()) {
          svg.call(zoom.transform, constrainedTransform);
        }
      })
      .on("end", () => {
        setIsDragging(false);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // Calculate initial transform - focus on USA by default
    const initialTransform = constrainTransform(
      getCountryTransform(DEFAULT_COUNTRY, defaultScale, width, height)
    );

    // Apply initial transform
    svg.call(zoom.transform, initialTransform);

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      svg.attr("width", newWidth).attr("height", newHeight);

      // Recalculate and apply constraints on resize
      const currentTransform = d3.zoomTransform(svgRef.current!);
      const newConstrainedTransform = constrainTransform(currentTransform);
      svg.call(zoom.transform, newConstrainedTransform);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Zoom in function
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  // Zoom out function
  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
  };

  // Reset zoom to default (focus on USA)
  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Recalculate minimum scale and default scale
    const scaleX = width / IMAGE_WIDTH;
    const scaleY = height / IMAGE_HEIGHT;
    const minScale = Math.max(scaleX, scaleY);
    const defaultScale = minScale * 1.5;

    // Focus on USA
    const initialTransform = getCountryTransform(DEFAULT_COUNTRY, defaultScale, width, height);

    svg.transition().duration(500).call(zoomBehaviorRef.current.transform, initialTransform);
  };

  // Function to zoom to a specific country
  const zoomToCountry = (countryCode: string) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Use a higher zoom level when focusing on a country
    const scaleX = width / IMAGE_WIDTH;
    const scaleY = height / IMAGE_HEIGHT;
    const minScale = Math.max(scaleX, scaleY);
    const countryScale = minScale * 2.5; // Zoom in more for country view

    const countryTransform = getCountryTransform(countryCode, countryScale, width, height);

    svg.transition().duration(700).call(zoomBehaviorRef.current.transform, countryTransform);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "80vh", overflow: "hidden" }}>
      {/* Background SVG for the zoomable map */}
      <svg
        ref={svgRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#0b0f1a",
          display: "block",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* Movable/Zoomable Map Layer */}
        <g ref={gRef}>
          {/* MAP IMAGE - Zoomable and Pannable */}
          <image
            href={worldMap}
            x={0}
            y={0}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            preserveAspectRatio="none"
            style={{ pointerEvents: "none", userSelect: "none" }}
          />

          {/* Simple glow filter */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Paths Layer - Simple curved connections between stars */}
          <g id="paths-layer">
            {STAR_PATHS.map(({ from, to, color, curveDirection }, index) => {
              const fromCoords = US_STATE_COORDINATES[from];
              const toCoords = US_STATE_COORDINATES[to];
              if (!fromCoords || !toCoords) return null;

              const pathD = generateCurvedPath(
                fromCoords.x,
                fromCoords.y,
                toCoords.x,
                toCoords.y,
                curveDirection
              );

              return (
                <g key={`${from}-${to}-${index}`}>
                  {/* Glow layer */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={4}
                    strokeOpacity={0.4}
                    filter="url(#glow)"
                    strokeLinecap="round"
                  />
                  {/* Core line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeOpacity={0.8}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>

          {/* Stars Layer - Fixed on map, moves with zoom/pan */}
          <g id="stars-layer">
            {/* Star Universe image on New York */}
            <image
              href={starUnivers}
              x={US_STATE_COORDINATES.newYork.x - 25}
              y={US_STATE_COORDINATES.newYork.y - 25}
              width={50}
              height={50}
              style={{ pointerEvents: "none" }}
            />

            {/* Star SVG components on different states with varying sizes and glow */}
            {STATE_STARS.map(({ state, color, size, glow }) => {
              const coords = US_STATE_COORDINATES[state];
              if (!coords) return null;
              return (
                <g
                  key={state}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarClick(state);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Invisible clickable circle for better hit area */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={size / 2 + 5}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                  />
                  <foreignObject
                    x={coords.x - size / 2}
                    y={coords.y - size / 2}
                    width={size * 1.5}
                    height={size * 1.5}
                    style={{ overflow: "visible", pointerEvents: "none" }}
                  >
                    <Star size={size} color={color} glowIntensity={glow} />
                  </foreignObject>
                </g>
              );
            })}
          </g>

          <g id="balloons-layer" />
          <g id="tooltip-layer" />
        </g>
      </svg>

      {/* Fixed Frame Overlay - Always stays in place on top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        <img
          src={worldMapFrame}
          alt="Map Frame"
          style={{
            width: "1104px",
            height: "80vh",
            userSelect: "none",
            display: "block",
          }}
        />
      </div>

      {/* Zoom Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(11, 15, 26, 0.9)",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(11, 15, 26, 1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(11, 15, 26, 0.9)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(11, 15, 26, 0.9)",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(11, 15, 26, 1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(11, 15, 26, 0.9)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "8px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(11, 15, 26, 0.9)",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(11, 15, 26, 1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(11, 15, 26, 0.9)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Reset Zoom"
        >
          ⟲
        </button>
      </div>

      {/* Book Container - Bottom Right */}
      {isBookOpen && selectedStarData && (
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "45%",
            zIndex: 9999,
            opacity: 1,
            transform: "translateY(0) scale(1)",
            transition: "all 0.3s ease-out",
            pointerEvents: "auto",
          }}
        >
          {/* Book Background Image */}
          <div
            style={{
              position: "relative",
              width: "300px",
              height: "210px",
            }}
          >
            <img
              src={book}
              alt="Book"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
              }}
            />

            {/* Book Content Overlay */}
            <div
              style={{
                position: "absolute",
                top: "18px",
                left: "15px",
                right: "15px",
                bottom: "24px",
                display: "flex",
                gap: "10px",
              }}
            >
              {/* Left Page - Image */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,140,0,0.1) 100%)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,215,0,0.3)",
                  }}
                >
                  <Star
                    size={70}
                    color={selectedStarData.color}
                    glowIntensity={0.8}
                  />
                </div>
              </div>

              {/* Right Page - Text */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  color: "#2c1810",
                  fontFamily: "Georgia, serif",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#1a0f0a",
                    borderBottom: "1px solid rgba(44, 24, 16, 0.3)",
                    paddingBottom: "4px",
                  }}
                >
                  {selectedStarData.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "8px",
                    lineHeight: "1.4",
                    color: "#3d2317",
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  {selectedStarData.description}
                </p>
                <div
                  style={{
                    marginTop: "auto",
                    fontSize: "7px",
                    color: "#6b4423",
                    fontStyle: "italic",
                  }}
                >
                  — {US_STATE_COORDINATES[selectedStarData.state]?.name}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseBook}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(44, 24, 16, 0.7)",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(44, 24, 16, 0.9)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(44, 24, 16, 0.7)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMapZoom;
