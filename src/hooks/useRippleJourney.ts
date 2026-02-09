"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/config/api";

// Fallback emojis if no avatar
const emojis = ["🐦", "🦁", "🐰", "🦊", "🦉", "🐼", "🐸", "🐵", "🐱", "🦄"];

interface StreakObject {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_action_date: string;
  created_at: string;
  updated_at: string;
}

interface RawNodeData {
  id: number;
  avatar_id: number | null;
  profile_full_image: string | null;
  label: string;
  streak: StreakObject | number;
  parent: number | null;
}

interface RawEdgeData {
  from: number;
  to: number;
  distance: string;
}

interface Story {
  action: string;
  date: string;
  location: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data: {
    ripple_id: string;
    nodesData: RawNodeData[];
    edgesData: RawEdgeData[];
    stories: Record<string, Story>;
    total_distance_covered: string;
    higest_distance: string;
  };
}

export interface TransformedNode {
  id: string;
  icon: string;
  label: string;
  streak: number;
  parent?: string;
}

export interface TransformedEdge {
  from: string;
  to: string;
  distance: string;
}

export interface RippleJourneyData {
  nodes: TransformedNode[];
  edges: TransformedEdge[];
  stories: Record<string, Story>;
  totalDistance: string;
  higestDistance: string;
  rippleId: string;
}

export interface UseRippleJourneyOptions {
  /**
   * Optional ripple ID to fetch journey for a specific user.
   * If not provided, fetches the journey for the authenticated user.
   */
  rippleId?: string | null;
  /**
   * Base API endpoint (default: "/ripple-journey")
   */
  apiEndpoint?: string;
  /**
   * Whether to fetch data immediately on mount (default: true)
   */
  immediate?: boolean;
}

/**
 * Custom hook to fetch ripple journey data
 * 
 * @example
 * // Fetch for authenticated user
 * const { data, loading, error } = useRippleJourney();
 * 
 * @example
 * // Fetch for specific ripple ID
 * const { data, loading, error } = useRippleJourney({ rippleId: "123" });
 * 
 * @example
 * // Custom endpoint
 * const { data, loading, error } = useRippleJourney({ 
 *   rippleId: "123",
 *   apiEndpoint: "/api/v2/ripple-journey"
 * });
 * 
 * @example
 * // Manual fetching
 * const { data, loading, refetch } = useRippleJourney({ immediate: false });
 * // Later: refetch("456");
 */
export function useRippleJourney(options: UseRippleJourneyOptions = {}) {
  const {
    rippleId: initialRippleId = null,
    apiEndpoint = "/ripple-journey",
    immediate = true,
  } = options;

  const [data, setData] = useState<RippleJourneyData | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [currentRippleId, setCurrentRippleId] = useState<string | null>(
    initialRippleId
  );

  const fetchData = async (rippleId?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      // Build the URL with optional rippleId parameter
      const url = rippleId 
        ? `${apiEndpoint}/${rippleId}` 
        : apiEndpoint;

      const res: ApiResponse = await apiFetch(url);

      if (res.success && res.data) {
        const { nodesData, edgesData, stories, total_distance_covered, higest_distance, ripple_id } = res.data;

        // Transform nodes
        const transformedNodes: TransformedNode[] = nodesData.map((node) => {
          const streakValue =
            typeof node.streak === "object"
              ? node.streak.current_streak
              : node.streak || 0;

          let icon = "👤";
          if (node.profile_full_image) {
            icon = node.profile_full_image;
          } else if (node.avatar_id !== null) {
            icon = emojis[node.avatar_id % emojis.length];
          } else {
            icon = emojis[Math.floor(Math.random() * emojis.length)];
          }

          return {
            id: String(node.id),
            icon,
            label: node.label,
            streak: streakValue,
            parent: node.parent ? String(node.parent) : undefined,
          };
        });

        // Transform edges
        const transformedEdges: TransformedEdge[] = edgesData.map((edge) => ({
          from: String(edge.from),
          to: String(edge.to),
          distance: edge.distance,
        }));

        setData({
          nodes: transformedNodes,
          edges: transformedEdges,
          stories,
          totalDistance: total_distance_covered,
          higestDistance: higest_distance,
          rippleId: ripple_id,
        });
      } else {
        throw new Error(res.message || "Invalid API response");
      }
    } catch (err: any) {
      console.error("Error fetching ripple data:", err);
      setError(err?.message || "Failed to load ripple journey.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData(currentRippleId);
    }
  }, [currentRippleId, apiEndpoint, immediate]);

  /**
   * Refetch data with optional new ripple ID
   * @param newRippleId - Optional ripple ID to fetch. If not provided, uses current rippleId
   */
  const refetch = (newRippleId?: string | null) => {
    if (newRippleId !== undefined) {
      setCurrentRippleId(newRippleId);
    }
    fetchData(newRippleId !== undefined ? newRippleId : currentRippleId);
  };

  return { 
    data, 
    loading, 
    error, 
    refetch,
    /**
     * Current ripple ID being displayed
     */
    rippleId: data?.rippleId || currentRippleId,
  };
}