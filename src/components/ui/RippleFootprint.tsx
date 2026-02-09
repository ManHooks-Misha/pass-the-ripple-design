import { cn } from "@/lib/utils";

interface RippleFootprintProps {
    className?: string;
    fillColor?: string;    // Main fill color (default: soft pink)
    strokeColor?: string;  // Outline color (default: gray)
    size?: number;         // in pixels
    rotation?: number;     // degrees
}

/**
 * A cute SVG rabbit/animal paw print with 3 toe pads and a main pad.
 * Style matches the reference: soft pink fill with gray outline.
 */
const RippleFootprint = ({
    className,
    fillColor = "#FFB8C6",    // Soft pink
    strokeColor = "#9CA3AF",  // Gray outline
    size = 40,
    rotation = 0,
}: RippleFootprintProps) => {
    return (
        <svg
            width={size}
            height={size * 1.2}
            viewBox="0 0 50 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("pointer-events-none select-none", className)}
            style={{ transform: `rotate(${rotation}deg)` }}
            aria-hidden="true"
        >
            {/* Main Pad - rounded with slight heart shape */}
            <ellipse
                cx="25"
                cy="42"
                rx="16"
                ry="14"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
            />

            {/* Left Toe Pad */}
            <ellipse
                cx="10"
                cy="18"
                rx="7"
                ry="10"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
                transform="rotate(-20 10 18)"
            />

            {/* Middle Toe Pad (largest) */}
            <ellipse
                cx="25"
                cy="12"
                rx="8"
                ry="11"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
            />

            {/* Right Toe Pad */}
            <ellipse
                cx="40"
                cy="18"
                rx="7"
                ry="10"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
                transform="rotate(20 40 18)"
            />
        </svg>
    );
};

export default RippleFootprint;
