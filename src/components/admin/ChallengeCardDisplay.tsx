import React from 'react';
import { CardElement } from './CardCanvas';
import { getImageUrl } from '@/utils/imageUrl';

interface ChallengeCardDisplayProps {
    layoutColor: string;
    title: string;
    description: string | null;
    badgeName: string;
    badgeImageUrl?: string | null;
    weekNumber: number;
    actionItems: string[];
    tagline: string;
    elements: CardElement[];
    width?: number;
    height?: number;
    scale?: number;
}

export default function ChallengeCardDisplay({
    layoutColor,
    title,
    description,
    badgeName,
    badgeImageUrl,
    weekNumber,
    actionItems,
    tagline,
    elements,
    width = 600,
    height = 900,
    scale = 1
}: ChallengeCardDisplayProps) {

    const renderElementContent = (element: CardElement) => {
        const cssStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            borderRadius: `${element.style.borderRadius}px`,
            borderWidth: `${element.style.borderWidth}px`,
            borderColor: element.style.borderColor,
            borderStyle: element.style.borderStyle,
            backgroundColor: element.style.backgroundColor,
            opacity: element.style.opacity / 100,
            transform: `rotate(${element.style.rotation}deg)`,
            textAlign: element.style.textAlign,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            fontFamily: element.style.fontFamily || 'Inter',
            fontSize: `${element.style.fontSize || 16}px`,
            letterSpacing: `${element.style.letterSpacing || 0}px`,
            lineHeight: element.style.lineHeight || 1.5,
            WebkitTextStroke: element.style.textStrokeWidth ? `${element.style.textStrokeWidth}px ${element.style.textStrokeColor || 'transparent'}` : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.style.textAlign === 'center' ? 'center' :
                element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
            overflow: 'hidden',
            color: element.style.color || '#000000',
            textShadow: element.style.textShadowColor && element.style.textShadowColor !== 'transparent' ?
                `${element.style.textShadowOffsetX || 0}px ${element.style.textShadowOffsetY || 0}px ${element.style.textShadowBlur || 0}px ${element.style.textShadowColor}` : undefined
        };

        const renderTextContent = (text: string) => {
            if (element.style.isCurved) {
                const radius = element.style.curveRadius || 100;
                const pathId = `curve-path-${element.id}-${Math.random().toString(36).substr(2, 9)}`;
                const w = element.size.width;
                const h = element.size.height;
                const r = radius;

                return (
                    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
                        <path id={pathId} d={`M 0,${h / 2 + r / 4} Q ${w / 2},${-r / 2} ${w},${h / 2 + r / 4}`} fill="transparent" />
                        <text width={w}>
                            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle" style={{
                                fill: element.style.color || '#000000',
                                fontSize: element.style.fontSize,
                                fontFamily: element.style.fontFamily,
                                fontWeight: element.style.fontWeight,
                                letterSpacing: element.style.letterSpacing,
                            }}>
                                {text}
                            </textPath>
                        </text>
                    </svg>
                );
            }
            return text;
        };

        switch (element.type) {
            case 'week':
                return (
                    <div style={cssStyle} className="text-white font-bold justify-center bg-amber-500 rounded-full flex-col">
                        <div className="text-center">
                            <div className="text-[0.6em] uppercase tracking-wider">Week</div>
                            <div className="text-[1.5em] leading-none" style={{ color: cssStyle.color, textShadow: cssStyle.textShadow }}>{element.content || weekNumber}</div>
                        </div>
                    </div>
                );
            case 'title':
                return (
                    <div style={cssStyle} className="text-white drop-shadow-md">
                        {renderTextContent(element.content || title || 'Challenge Title')}
                    </div>
                );
            case 'badge':
                return (
                    <div style={{ ...cssStyle, flexDirection: 'column' }} className="rounded-lg">
                        {element.content ? (
                            <img src={getImageUrl(element.content)} alt="Badge" className="w-[80%] h-[80%] object-contain" />
                        ) : badgeImageUrl ? (
                            <img src={getImageUrl(badgeImageUrl)} alt="Badge" className="w-[80%] h-[80%] object-contain" />
                        ) : (
                            <span className="text-[0.8em] text-center w-full truncate px-1">Win: {badgeName || 'Badge'}</span>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div style={cssStyle} className="bg-gradient-to-br from-blue-200 to-purple-200">
                        {element.content ? <img src={element.content} className="w-full h-full object-cover" alt="Challenge" /> : <div className="text-muted-foreground text-xs p-2 text-center">Image Placeholder</div>}
                    </div>
                );
            case 'description':
                return (
                    <div style={cssStyle} className="text-gray-800">
                        <div>
                            <strong>What the challenge is:</strong>
                            <div className="mt-1">{renderTextContent(element.content || description || 'Description text...')}</div>
                        </div>
                    </div>
                );
            case 'tagline':
                return (
                    <div style={cssStyle} className="text-white drop-shadow-sm italic">
                        {renderTextContent(element.content || tagline || 'Tagline')}
                    </div>
                );
            case 'layout-image':
                return (
                    <img
                        src={element.content}
                        alt="Layout Background"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ ...cssStyle, pointerEvents: 'none' }}
                    />
                );
            case 'actions-detail':
                return (
                    <div
                        style={cssStyle}
                        className="text-gray-800"
                        dangerouslySetInnerHTML={{ __html: element.content }}
                    />
                );
            case 'text':
                return (
                    <div style={cssStyle} className="text-gray-800 flex items-center">
                        {/* Only show star for legacy text elements if needed, or remove it to be clean */}
                        {element.id.startsWith('action-') && <span className="mr-2">🌟</span>}
                        {renderTextContent(element.content)}
                    </div>
                );
            default:
                return (
                    <div style={cssStyle} className="text-gray-800">
                        {renderTextContent(element.content)}
                    </div>
                );
        }
    };

    // Sort layers - layout-image should be at bottom (first), rest by Z-index or order
    // But CardCanvas usually renders in order of array.
    // In CardCanvas: elements.map, so first in array is bottom.
    // Ensure layout-image is first if it exists.

    return (
        <div
            className="relative overflow-hidden shadow-lg bg-white"
            style={{
                width: width * scale,
                height: height * scale,
                backgroundColor: layoutColor,
            }}
        >
            <div
                className="absolute origin-top-left"
                style={{
                    width: width,
                    height: height,
                    transform: `scale(${scale})`,
                }}
            >
                {elements.map(element => (
                    <div
                        key={element.id}
                        style={{
                            position: 'absolute',
                            left: element.position.x,
                            top: element.position.y,
                            width: element.size.width,
                            height: element.size.height,
                            display: element.visible ? 'block' : 'none',

                        }}
                    >
                        {renderElementContent(element)}
                    </div>
                ))}
            </div>
        </div>
    );
}
