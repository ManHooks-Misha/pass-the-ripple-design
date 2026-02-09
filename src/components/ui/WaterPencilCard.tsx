import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface WaterPencilCardProps {
    variant?: 'pink' | 'purple' | 'blue' | 'green' | 'orange';
    shape?: 1 | 2 | 3;
    className?: string;
    children: React.ReactNode;
}

const WaterPencilCard = ({
    variant = 'pink',
    shape,
    className,
    children
}: WaterPencilCardProps) => {

    // Color configuration
    const variantStyles = {
        pink: {
            fill: "#FDF2F8", // pink-50
            stroke: "#DB2777", // pink-600
        },
        purple: {
            fill: "#FAF5FF", // purple-50
            stroke: "#9333EA", // purple-600
        },
        blue: {
            fill: "#EFF6FF", // blue-50
            stroke: "#2563EB", // blue-600
        },
        green: {
            fill: "#F0FDF4", // green-50
            stroke: "#16A34A", // green-600
        },
        orange: {
            fill: "#FFF7ED", // orange-50
            stroke: "#EA580C", // orange-600
        }
    };

    const colors = variantStyles[variant];

    // 3 Different "Hand Drawn" Rectangular Shapes
    // We use percentages or 0-100 coordinates that we stretch
    // These paths are roughly rectangular but "wobbly"
    const shapes = {
        1: {
            // Rough rectangle 1
            path: "M2,2 L98,4 L100,98 L3,96 Z", // Simplified placeholder, actual SVG below uses distinct paths
            id: "shape1"
        },
        2: {
            id: "shape2"
        },
        3: {
            id: "shape3"
        }
    };

    // Deterministic shape selection
    const selectedShapeIndex = useMemo(() => {
        if (shape) return shape;
        // Random-ish but stable based on content length or variant
        return 1;
    }, [shape]);

    // We will use 3 distinct SVGs to ensure they resize "okay"
    // Using vector-effect="non-scaling-stroke" to keep border width consistent

    const BackgroundSvg = () => {
        if (selectedShapeIndex === 1) {
            return (
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 300">
                    {/* Fill */}
                    <path d="M5,5 Q200,2 395,8 Q398,150 392,295 Q200,298 5,292 Q2,150 5,5 Z"
                        fill={colors.fill} stroke="none" />
                    {/* Stroke (Sketchy double line) */}
                    <path d="M5,5 Q200,2 395,8 Q398,150 392,295 Q200,298 5,292 Q2,150 5,5 Z"
                        fill="none" stroke={colors.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.6" />
                    <path d="M8,8 Q200,6 392,11 Q394,150 389,292 Q200,294 8,289 Q6,150 8,8 Z"
                        fill="none" stroke={colors.stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.4" strokeDasharray="10 5" />
                </svg>
            )
        }
        if (selectedShapeIndex === 2) {
            return (
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 300">
                    <path d="M8,12 Q200,5 390,10 Q395,150 388,288 Q200,295 12,290 Q5,150 8,12 Z"
                        fill={colors.fill} stroke="none" />
                    <path d="M8,12 Q200,5 390,10 Q395,150 388,288 Q200,295 12,290 Q5,150 8,12 Z"
                        fill="none" stroke={colors.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.6" />
                    <path d="M12,15 Q200,9 386,14 Q391,150 384,284 Q200,291 16,286 Q9,150 12,15 Z"
                        fill="none" stroke={colors.stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.4" />
                </svg>
            )
        }
        // Shape 3
        return (
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 300">
                <path d="M10,5 Q200,3 395,12 Q392,150 390,290 Q200,292 10,295 Q14,150 10,5 Z"
                    fill={colors.fill} stroke="none" />
                <path d="M10,5 Q200,3 395,12 Q392,150 390,290 Q200,292 10,295 Q14,150 10,5 Z"
                    fill="none" stroke={colors.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.6" />
                <path d="M14,9 Q200,7 391,16 Q388,150 386,286 Q200,288 14,291 Q18,150 14,9 Z"
                    fill="none" stroke={colors.stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.4" strokeDasharray="20 10" />
            </svg>
        )
    }

    return (
        <div className={cn("relative p-8 md:p-10 transition-transform hover:scale-[1.01] duration-300", className)}>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none drop-shadow-sm">
                <BackgroundSvg />
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default WaterPencilCard;
