import React from 'react';
import { getImageUrl } from '@/utils/imageUrl';

export interface CardConfig {
    title: {
        x: number;
        y: number;
        fontSize: number;
        color: string;
        visible: boolean;
    };
    badge: {
        x: number;
        y: number;
        size: number;
        visible: boolean;
    };
    description: {
        x: number;
        y: number;
        fontSize: number;
        color: string;
        visible: boolean;
    };
    background: {
        overlayColor: string | null;
        overlayOpacity: number;
    };
}

export const DEFAULT_CARD_CONFIG: CardConfig = {
    title: { x: 50, y: 50, fontSize: 28, color: '#ffffff', visible: true },
    badge: { x: 480, y: 50, size: 80, visible: true },
    description: { x: 50, y: 120, fontSize: 14, color: '#cccccc', visible: true },
    background: { overlayColor: null, overlayOpacity: 0.3 }
};

interface CardPreviewProps {
    layoutImageUrl?: string | null;
    layoutColor: string;
    title: string;
    description?: string;
    badgeImageUrl?: string | null;
    config: CardConfig;
    width?: number;
    height?: number;
}

export default function CardPreview({
    layoutImageUrl,
    layoutColor,
    title,
    description,
    badgeImageUrl,
    config,
    width = 600,
    height = 400
}: CardPreviewProps) {
    const scale = width / 600; // Scale factor based on default 600px width

    return (
        <div
            className="relative overflow-hidden rounded-lg border-2 border-border shadow-lg"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: layoutColor
            }}
        >
            {/* Background Image */}
            {layoutImageUrl && (
                <img
                    src={layoutImageUrl.startsWith('http') ? layoutImageUrl : getImageUrl(layoutImageUrl)}
                    alt="Layout"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Background Overlay */}
            {config.background.overlayColor && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: config.background.overlayColor,
                        opacity: config.background.overlayOpacity
                    }}
                />
            )}

            {/* Title */}
            {config.title.visible && title && (
                <div
                    className="absolute font-bold truncate max-w-[80%]"
                    style={{
                        left: `${config.title.x * scale}px`,
                        top: `${config.title.y * scale}px`,
                        fontSize: `${config.title.fontSize * scale}px`,
                        color: config.title.color,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}
                >
                    {title}
                </div>
            )}

            {/* Badge */}
            {config.badge.visible && badgeImageUrl && (
                <img
                    src={badgeImageUrl.startsWith('http') ? badgeImageUrl : getImageUrl(badgeImageUrl)}
                    alt="Badge"
                    className="absolute rounded-full border-2 border-white shadow-md object-cover"
                    style={{
                        left: `${config.badge.x * scale}px`,
                        top: `${config.badge.y * scale}px`,
                        width: `${config.badge.size * scale}px`,
                        height: `${config.badge.size * scale}px`
                    }}
                />
            )}

            {/* Description */}
            {config.description.visible && description && (
                <div
                    className="absolute max-w-[70%] line-clamp-3"
                    style={{
                        left: `${config.description.x * scale}px`,
                        top: `${config.description.y * scale}px`,
                        fontSize: `${config.description.fontSize * scale}px`,
                        color: config.description.color,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                >
                    {description}
                </div>
            )}

            {/* Empty State */}
            {!title && !description && !badgeImageUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/50 text-lg">Fill form to preview card</p>
                </div>
            )}
        </div>
    );
}
