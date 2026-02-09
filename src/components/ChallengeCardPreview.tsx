import React, { useMemo } from 'react';
import ChallengeCardDisplay from '@/components/admin/ChallengeCardDisplay';
import { Challenge } from '@/types/Challenge';

interface ChallengeCardPreviewProps {
    challenge: Challenge;
    scale?: number;
    width?: number;
    height?: number;
}

const DEFAULT_ELEMENTS: any[] = [];

export function ChallengeCardPreview({
    challenge,
    scale = 0.5,
    width = 600,
    height = 900
}: ChallengeCardPreviewProps) {

    // Parse card configuration
    const config = useMemo(() => {
        try {
            if (!challenge.card_config) return {};
            return typeof challenge.card_config === 'string'
                ? JSON.parse(challenge.card_config)
                : challenge.card_config;
        } catch (e) {
            console.error('Failed to parse card config for challenge', challenge.id, e);
            return {};
        }
    }, [challenge.card_config]);

    // Extract elements
    const elements = Array.isArray(config) ? config : (config.elements || DEFAULT_ELEMENTS);

    // Extract dynamic fields from config if available, or fall back to challenge data
    const actionItems = config.action_items?.map((a: any) => a.text) || [];
    const tagline = config.tagline || "Join the Ripple!";
    const weekNumber = config.period_number || 1;

    return (
        <ChallengeCardDisplay
            layoutColor={challenge.layout_color || '#ffffff'}
            title={challenge.name}
            description={challenge.description}
            badgeName={challenge.badge?.name || challenge.name}
            badgeImageUrl={challenge.badge?.badge_image_path}
            weekNumber={weekNumber}
            actionItems={actionItems}
            tagline={tagline}
            elements={elements}
            width={width}
            height={height}
            scale={scale}
        />
    );
}
