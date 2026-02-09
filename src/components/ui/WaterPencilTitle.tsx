import { cn } from "@/lib/utils";
import waterPencilTexture from "@/assets/water-pencil-texture.png";

interface WaterPencilTitleProps {
    text: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "default" | "lite";
}

const WaterPencilTitle = ({ text, className, size = "lg", variant = "default" }: WaterPencilTitleProps) => {
    // Enhanced storybook-style colors with more watercolor authenticity
    const colors = [
        { name: "pink", hex: "#f472b6", light: "#fce7f3", shadow: "#ec4899", blend: "rgba(244, 114, 182, 0.85)" },
        { name: "purple", hex: "#c084fc", light: "#f3e8ff", shadow: "#a855f7", blend: "rgba(192, 132, 252, 0.85)" },
        { name: "blue", hex: "#60a5fa", light: "#dbeafe", shadow: "#3b82f6", blend: "rgba(96, 165, 250, 0.85)" },
        { name: "teal", hex: "#5eead4", light: "#ccfbf1", shadow: "#14b8a6", blend: "rgba(94, 234, 212, 0.85)" },
        { name: "green", hex: "#4ade80", light: "#dcfce7", shadow: "#22c55e", blend: "rgba(74, 222, 128, 0.85)" },
        { name: "yellow", hex: "#fbbf24", light: "#fef3c7", shadow: "#f59e0b", blend: "rgba(251, 191, 36, 0.85)" },
        { name: "orange", hex: "#fb923c", light: "#fed7aa", shadow: "#f97316", blend: "rgba(251, 146, 60, 0.85)" },
        { name: "rose", hex: "#fb7185", light: "#ffe4e6", shadow: "#f43f5e", blend: "rgba(251, 113, 133, 0.85)" },
    ];

    const sizeClasses = {
        sm: "text-2xl sm:text-3xl md:text-4xl",
        md: "text-3xl sm:text-4xl md:text-5xl",
        lg: "text-4xl sm:text-5xl md:text-6xl lg:text-[60px]",
        xl: "text-5xl sm:text-6xl md:text-7xl lg:text-[96px]",
    };

    return (
        <div className={cn("relative inline-block select-none", className)}>
            {/* Enhanced Watercolor Filters for Authentic Storybook Look */}
            {variant === "default" && (
                <svg width="0" height="0" className="absolute">
                    <defs>
                        {/* Primary Watercolor Bleed Filter */}
                        <filter id="watercolorBleed" x="-50%" y="-50%" width="200%" height="200%">
                            {/* Organic paper texture distortion */}
                            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.05" numOctaves="4" seed="2" result="turbulence" />
                            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="4" xChannelSelector="R" yChannelSelector="G" result="displaced" />

                            {/* Watercolor bloom effect */}
                            <feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />

                            {/* Pencil edge definition */}
                            <feMorphology operator="dilate" radius="0.5" in="SourceGraphic" result="thickened" />
                            <feGaussianBlur in="thickened" stdDeviation="0.3" result="pencilEdge" />

                            {/* Combine watercolor + pencil */}
                            <feComposite in="blurred" in2="pencilEdge" operator="over" result="combined" />

                            {/* Color intensity variation */}
                            <feComponentTransfer in="combined" result="enhanced">
                                <feFuncA type="gamma" amplitude="1" exponent="0.9"/>
                            </feComponentTransfer>

                            <feMerge>
                                <feMergeNode in="enhanced" />
                            </feMerge>
                        </filter>

                        {/* Soft shadow filter for depth */}
                        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                            <feOffset in="blur" dx="2" dy="3" result="offsetBlur"/>
                            <feFlood floodColor="#000000" floodOpacity="0.15"/>
                            <feComposite in2="offsetBlur" operator="in" result="shadow"/>
                            <feMerge>
                                <feMergeNode in="shadow"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>

                        {/* Paper texture overlay */}
                        <filter id="paperTexture">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
                            <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="1" result="paper">
                                <feDistantLight azimuth="45" elevation="60"/>
                            </feDiffuseLighting>
                            <feBlend in="SourceGraphic" in2="paper" mode="multiply"/>
                        </filter>
                    </defs>
                </svg>
            )}

            <h1 className={cn("font-lilita font-bold leading-[1.15] tracking-wide flex flex-wrap justify-center gap-x-2 sm:gap-x-3 md:gap-x-4", sizeClasses[size])} aria-label={text}>
                {text.split(" ").map((word, wordIndex) => (
                    <span key={wordIndex} className="inline-flex whitespace-nowrap gap-0.5 relative">
                        {word.split("").map((char, charIndex) => {
                            // Enhanced color cycling for more variety
                            const colorIndex = (wordIndex * 7 + charIndex * 3) % colors.length;
                            const color = colors[colorIndex];

                            // Random rotation for authentic hand-drawn feel
                            const rotation = Math.sin(wordIndex * 13 + charIndex * 7) * 4;
                            const yOffset = Math.cos(wordIndex * 11 + charIndex * 5) * 2;

                            return (
                                <span key={charIndex} className="relative inline-block group">
                                    {/* Watercolor Bleed Background Layer */}
                                    {variant === "default" && (
                                        <span
                                            className="absolute inset-0 z-0 select-none opacity-20"
                                            aria-hidden="true"
                                            style={{
                                                color: color.light,
                                                filter: 'blur(4px)',
                                                transform: `scale(1.3) translateY(${yOffset}px)`,
                                            }}
                                        >
                                            {char}
                                        </span>
                                    )}

                                    {/* Soft Shadow Layer for Depth */}
                                    <span
                                        className="absolute z-[1] select-none"
                                        aria-hidden="true"
                                        style={{
                                            color: color.shadow,
                                            opacity: variant === "default" ? 0.25 : 0.2,
                                            filter: variant === "default" ? 'blur(2px)' : 'blur(1px)',
                                            top: '3px',
                                            left: '3px',
                                            transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                                        }}
                                    >
                                        {char}
                                    </span>

                                    {/* Main Text Layer - Enhanced Watercolor Pencil Effect */}
                                    <span
                                        className="relative z-10 block"
                                        style={variant === "default" ? {
                                            // Authentic watercolor blend with paper texture
                                            backgroundImage: `
                                                linear-gradient(135deg, ${color.hex} 0%, ${color.blend} 50%, ${color.hex} 100%),
                                                url(${waterPencilTexture})
                                            `,
                                            backgroundSize: 'cover, 250px',
                                            backgroundPosition: `center, ${charIndex * 20}% ${wordIndex * 15}%`,
                                            backgroundBlendMode: 'multiply, normal',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            color: 'transparent',

                                            // Handwritten character variation
                                            transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                                            display: 'inline-block',

                                            // Enhanced watercolor filter
                                            filter: 'url(#watercolorBleed) drop-shadow(0px 1px 2px rgba(0,0,0,0.08))',
                                        } : {
                                            // Lite Variant: Clean solid color
                                            color: color.hex,
                                            transform: `rotate(${rotation * 0.5}deg) translateY(${yOffset * 0.5}px)`,
                                            display: 'inline-block',
                                        }}
                                    >
                                        {char}
                                    </span>

                                    {/* Watercolor Highlight Shine (Default only) */}
                                    {variant === "default" && (
                                        <>
                                            {/* Primary highlight */}
                                            <span
                                                className="absolute top-[12%] left-[20%] w-[35%] h-[18%] bg-white rounded-full z-20 pointer-events-none opacity-25 mix-blend-overlay"
                                                style={{
                                                    filter: 'blur(2px)',
                                                    transform: `rotate(${rotation}deg)`,
                                                }}
                                                aria-hidden="true"
                                            />
                                            {/* Secondary highlight for depth */}
                                            <span
                                                className="absolute top-[25%] right-[15%] w-[20%] h-[12%] bg-white rounded-full z-20 pointer-events-none opacity-15 mix-blend-overlay"
                                                style={{
                                                    filter: 'blur(1.5px)',
                                                    transform: `rotate(${-rotation * 0.5}deg)`,
                                                }}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}
                                </span>
                            );
                        })}
                    </span>
                ))}
            </h1>
        </div>
    );
};

export default WaterPencilTitle;
