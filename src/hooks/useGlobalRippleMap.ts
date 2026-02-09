import { useState, useEffect } from "react";
import { apiFetch } from "@/config/api";

export interface Testimonial {
  id: number;
  user: {
    name: string;
    age: number;
    location: string;
    avatarId: number | null;
    profileImage: string | null;
    initials: string;
  };
  quote: string;
  category: string;
  tags: string[];
}

export interface GlobalRippleMapData {
  stats?: {
    countriesReached?: number;
    actsOfKindness?: number;
    youngHeroes?: number;
  };
  liveRipples?: number;
  testimonials?: Testimonial[];
  userData?: any;
}

// Shared state to prevent multiple API calls
let cachedData: GlobalRippleMapData | null = null;
let fetchPromise: Promise<GlobalRippleMapData | null> | null = null;
let isLoading = false;

export const useGlobalRippleMap = () => {
  const [data, setData] = useState<GlobalRippleMapData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If data is already cached, use it
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (fetchPromise) {
      fetchPromise
        .then((result) => {
          if (result) {
            setData(result);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
      return;
    }

    // Start a new fetch
    isLoading = true;
    setLoading(true);
    fetchPromise = (async () => {
      try {
        const response = await apiFetch<{ success: boolean; data: GlobalRippleMapData }>(
          "/global-ripple-map",
          { method: "GET" },
          { disableCache: true }
        );

        if (response && response.success && response.data) {
          // Filter out invalid testimonials (fix for first record issue)
          if (response.data.testimonials) {
            response.data.testimonials = response.data.testimonials.filter(
              (testimonial) => 
                testimonial && 
                testimonial.id && 
                testimonial.user && 
                testimonial.user.name && 
                testimonial.user.name.trim().length > 0 &&
                testimonial.quote && 
                testimonial.quote.trim().length > 0
            );
          }
          
          cachedData = response.data;
          return response.data;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching global ripple map data:", err);
        throw err;
      } finally {
        isLoading = false;
        fetchPromise = null;
      }
    })();

    fetchPromise
      .then((result) => {
        if (result) {
          setData(result);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading,
    error,
    // Helper functions
    countriesReached: typeof data?.stats?.countriesReached === 'number' ? data.stats.countriesReached : undefined,
    actsOfKindness: typeof data?.stats?.actsOfKindness === 'number' ? data.stats.actsOfKindness : undefined,
    youngHeroes: typeof data?.stats?.youngHeroes === 'number' ? data.stats.youngHeroes : undefined,
    activeRipples: typeof data?.liveRipples === 'number' ? data.liveRipples : undefined,
    testimonials: data?.testimonials || [],
  };
};

