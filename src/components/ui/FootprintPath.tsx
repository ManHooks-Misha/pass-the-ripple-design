import RippleFootprint from "./RippleFootprint";

interface FootprintPathProps {
    className?: string;
    // Array of footprint configs: each has position (top, left as %), rotation, color, size
    footprints?: Array<{
        top: string;
        left: string;
        rotation: number;
        color: string;
        size?: number;
    }>;
}

/**
 * A decorative trail of footprints, typically positioned absolutely within a relative container.
 * Includes default footprints if none are provided.
 */
const FootprintPath = ({ className, footprints }: FootprintPathProps) => {
    // Default colorful footprints path
    const defaultFootprints = [
        { top: "25%", left: "22%", rotation: -25, color: "#ec4899", size: 36 },  // Pink
        { top: "45%", left: "30%", rotation: 15, color: "#a855f7", size: 40 },   // Purple
        { top: "20%", left: "55%", rotation: -10, color: "#3b82f6", size: 38 },  // Blue
        { top: "50%", left: "62%", rotation: 30, color: "#22c55e", size: 36 },   // Green
        { top: "35%", left: "75%", rotation: -20, color: "#f97316", size: 40 },  // Orange
    ];

    const pathFootprints = footprints || defaultFootprints;

    return (
        <div className={className}>
            {pathFootprints.map((fp, index) => (
                <div
                    key={index}
                    className="absolute hidden md:block opacity-30 hover:opacity-50 transition-opacity duration-300"
                    style={{ top: fp.top, left: fp.left }}
                >
                    <RippleFootprint
                        color={fp.color}
                        size={fp.size || 40}
                        rotation={fp.rotation}
                    />
                </div>
            ))}
        </div>
    );
};

export default FootprintPath;
