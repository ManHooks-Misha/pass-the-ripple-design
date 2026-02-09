import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface WaterPencilButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    variant?: 'pink' | 'purple' | 'blue' | 'green' | 'orange' | 'gradient' | 'white' | 'outline-white' | 'yellow';
    shape?: 1 | 2 | 3;
    className?: string;
    children: React.ReactNode;
}

const WaterPencilButton = ({
    href,
    variant = 'pink',
    shape,
    className,
    children,
    ...props
}: WaterPencilButtonProps) => {

    // Enhanced color configuration with gradients and new variants
    const variantStyles = {
        pink: {
            fill: "#FBCFE8", // pink-200
            stroke: "#BE185D", // pink-700
            text: "text-pink-900",
            hoverFill: "#F472B6", // pink-400
            hoverText: "text-pink-900",
            gradient: "from-pink-400 to-pink-600",
        },
        purple: {
            fill: "#E9D5FF", // purple-200
            stroke: "#7E22CE", // purple-700
            text: "text-purple-900",
            hoverFill: "#C084FC", // purple-400
            hoverText: "text-purple-900",
            gradient: "from-purple-400 to-purple-600",
        },
        blue: {
            fill: "#BFDBFE", // blue-200
            stroke: "#1D4ED8", // blue-700
            text: "text-blue-900",
            hoverFill: "#60A5FA", // blue-400
            hoverText: "text-blue-900",
            gradient: "from-blue-400 to-blue-600",
        },
        green: {
            fill: "#BBF7D0", // green-200
            stroke: "#15803D", // green-700
            text: "text-green-900",
            hoverFill: "#4ADE80", // green-400
            hoverText: "text-green-900",
            gradient: "from-green-400 to-green-600",
        },
        orange: {
            fill: "#FED7AA", // orange-200
            stroke: "#C2410C", // orange-700
            text: "text-orange-900",
            hoverFill: "#FB923C", // orange-400
            hoverText: "text-orange-900",
            gradient: "from-orange-400 to-orange-600",
        },
        yellow: {
            fill: "#FEF08A", // yellow-200
            stroke: "#CA8A04", // yellow-700
            text: "text-yellow-900",
            hoverFill: "#FACC15", // yellow-400
            hoverText: "text-yellow-900",
            gradient: "from-yellow-400 to-yellow-600",
        },
        gradient: {
            fill: "url(#button-gradient)", // Will be defined in SVG
            stroke: "#FFFFFF",
            text: "text-white",
            hoverFill: "url(#button-gradient-hover)",
            hoverText: "text-white",
            gradient: "from-pink-500 via-purple-500 to-blue-500",
        },
        white: {
            fill: "#FFFFFF",
            stroke: "#E5E7EB", // gray-300
            text: "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500",
            hoverFill: "#F3F4F6", // gray-100
            hoverText: "text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600",
        },
        'outline-white': {
            fill: "transparent",
            stroke: "#FFFFFF",
            text: "text-white",
            hoverFill: "#FFFFFF",
            hoverText: "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500",
            isOutline: true,
        }
    };

    const colors = variantStyles[variant] || variantStyles.pink;

    // 3 Different "Hand Drawn" Shapes - Enhanced with more personality
    const shapes = {
        1: {
            fillPath: "M15,10 C45,5 155,5 185,10 C200,12 203,25 200,35 C195,50 185,55 155,55 C125,55 55,58 25,55 C10,52 7,40 10,25 C13,15 15,12 25,10 Z",
            strokePath: "M18,12 C48,7 152,7 182,12 C197,14 198,25 195,35 C190,48 180,53 150,53 C120,53 52,56 22,53 C7,50 8,38 11,25 C14,16 16,14 26,12 Z",
            roughness: "5 3"
        },
        2: {
            fillPath: "M10,15 C35,5 165,8 190,12 C203,15 205,30 197,45 C185,58 165,52 145,52 C115,52 45,55 20,50 C5,45 3,30 10,18 C13,12 15,15 20,15 Z",
            strokePath: "M13,16 C38,8 162,10 187,14 C200,17 200,32 193,42 C183,55 163,50 143,50 C113,50 47,52 23,48 C10,45 7,32 13,20 C15,15 17,18 23,16 Z",
            roughness: "4 2"
        },
        3: {
            fillPath: "M20,8 C55,2 145,2 180,8 C195,10 200,20 195,40 C190,55 175,58 145,58 C115,58 65,58 30,55 C15,52 10,45 10,30 C10,15 15,12 30,8 Z",
            strokePath: "M22,10 C57,5 143,5 177,10 C193,12 197,22 193,38 C187,52 173,55 143,55 C113,55 67,55 33,52 C17,50 13,42 13,32 C13,18 17,15 32,10 Z",
            roughness: "6 4"
        }
    };

    // Deterministically pick a shape if not provided
    const selectedShapeIndex = useMemo(() => {
        if (shape) return shape;
        const seed = variant.length + (typeof children === 'string' ? children.length : 0);
        return (seed % 3) + 1 as 1 | 2 | 3;
    }, [shape, variant, children]);

    const selectedShape = shapes[selectedShapeIndex];

    const ButtonSvg = () => (
        <svg
            viewBox="0 0 200 65"
            className="absolute inset-0 w-full h-full drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-lg group-hover:scale-[1.03]"
            preserveAspectRatio="none"
        >
            {/* Gradient definitions for gradient variant */}
            {variant === 'gradient' && (
                <defs>
                    <linearGradient id="button-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EC4899" /> {/* pink-500 */}
                        <stop offset="50%" stopColor="#8B5CF6" /> {/* purple-500 */}
                        <stop offset="100%" stopColor="#3B82F6" /> {/* blue-500 */}
                    </linearGradient>
                    <linearGradient id="button-gradient-hover" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F472B6" /> {/* pink-400 */}
                        <stop offset="50%" stopColor="#A78BFA" /> {/* purple-400 */}
                        <stop offset="100%" stopColor="#60A5FA" /> {/* blue-400 */}
                    </linearGradient>
                </defs>
            )}

            {/* Subtle Shadow/Texture Layer */}
            <path
                d={selectedShape.fillPath}
                fill="black"
                opacity={variant === 'outline-white' ? "0.1" : "0.05"}
                transform="translate(2, 3)"
            />

            {/* Main Fill Layer */}
            <path
                d={selectedShape.fillPath}
                fill={colors.fill}
                className={`transition-all duration-300 ${variant === 'outline-white' ? 'opacity-0 group-hover:opacity-100' : ''}`}
                stroke={variant === 'outline-white' ? 'transparent' : 'none'}
                strokeWidth={variant === 'outline-white' ? '2' : '0'}
            />

            {/* Hover Fill Layer (Reveals on hover) */}
            {variant !== 'outline-white' && variant !== 'gradient' && (
                <path
                    d={selectedShape.fillPath}
                    fill={colors.hoverFill}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            )}

            {/* Gradient hover effect for gradient variant */}
            {variant === 'gradient' && (
                <path
                    d={selectedShape.fillPath}
                    fill={colors.hoverFill}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            )}

            {/* Pencil Stroke Layer - Enhanced sketchy feel */}
            <path
                d={selectedShape.strokePath}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
                strokeDasharray={selectedShape.roughness} // More controlled rough line look
                strokeDashoffset="0"
            />
            
            {/* Accent strokes for sketchy feel */}
            <path 
                d="M5,35 Q10,30 15,40" 
                stroke={colors.stroke} 
                strokeWidth="1" 
                fill="none" 
                opacity="0.4" 
                strokeDasharray="2 1"
            />
            <path 
                d="M190,25 Q200,20 195,35" 
                stroke={colors.stroke} 
                strokeWidth="1" 
                fill="none" 
                opacity="0.4"
                strokeDasharray="2 1"
            />
            <path 
                d="M50,15 Q55,10 60,20" 
                stroke={colors.stroke} 
                strokeWidth="0.8" 
                fill="none" 
                opacity="0.3"
                strokeDasharray="1 1"
            />
            <path 
                d="M140,55 Q145,50 150,60" 
                stroke={colors.stroke} 
                strokeWidth="0.8" 
                fill="none" 
                opacity="0.3"
                strokeDasharray="1 1"
            />

            {/* Highlight effect for white and outline-white variants */}
            {(variant === 'white' || variant === 'outline-white') && (
                <path
                    d={selectedShape.fillPath}
                    fill="white"
                    opacity="0.1"
                    transform="translate(-1, -1)"
                />
            )}
        </svg>
    );

    const content = (
        <span className={cn(
            "relative z-10 font-bold font-teachers text-lg px-8 py-4 flex items-center justify-center gap-2 transition-all duration-300",
            colors.text,
            variant === 'outline-white' && "group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500"
        )}>
            {children}
        </span>
    );

    const containerClasses = cn(
        "relative group inline-block min-w-[170px] cursor-pointer select-none transition-all duration-300 active:scale-95",
        "hover:transform hover:-translate-y-0.5",
        variant === 'outline-white' && "border-2 border-white/30 hover:border-white",
        className
    );

    if (href) {
        // If it's an external link or hash link
        if (href.startsWith('http') || href.startsWith('#')) {
            return (
                <a href={href} className={containerClasses}>
                    <ButtonSvg />
                    {content}
                </a>
            );
        }
        // Internal router link
        return (
            <Link to={href} className={containerClasses}>
                <ButtonSvg />
                {content}
            </Link>
        );
    }

    return (
        <button className={containerClasses} {...props}>
            <ButtonSvg />
            {content}
        </button>
    );
};

export default WaterPencilButton;