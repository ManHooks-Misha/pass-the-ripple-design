// src/components/Seo.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApplicationSettings, useSocialSettings } from "@/hooks/useSettingsGroups";
import { getImageUrl } from "@/utils/imageUrl";
import { apiFetch } from "@/config/api";
import socialMediaPreview from "@/assets/social-media-preview.png";

// Default fallback values
const FALLBACK_TITLE = "Pass The Ripple — Spread Kindness, One Ripple at a Time";
const FALLBACK_DESCRIPTION =
  "Join thousands of young heroes creating magical ripples of kindness around the world. Every act of kindness starts a beautiful chain reaction!";
const FALLBACK_CANONICAL = typeof window !== "undefined"
  ? `${window.location.origin}/`
  : "https://kindnessripple.pms.mishainfotech.com/";

interface SeoProps {
  title?: string; // Optional now
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any>;
  image?: string; // Open Graph image
  imageAlt?: string; // Image alt text
  type?: string; // Open Graph type (default: website)
  url?: string; // Open Graph URL
}

const ensureMeta = (selector: string, createEl: () => HTMLElement) => {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = createEl();
    document.head.appendChild(el);
  }
  return el;
};

interface SEOMetadata {
  id: number;
  page_path: string;
  page_name: string;
  title: string;
  meta_description: string;
  og_title: string | null;
  og_description: string | null;
  og_image_path: string | null;
  og_image_url: string;
  og_url: string | null;
  is_active: boolean;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonical,
  jsonLd,
  image,
  imageAlt,
  type = "website",
  url,
}) => {
  const location = useLocation();
  const { settings: appSettings } = useApplicationSettings();
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata | null>(null);
  const [loadingSeo, setLoadingSeo] = useState(false);

  // Fetch SEO metadata for current page path from backend
  useEffect(() => {
    const fetchSeoMetadata = async () => {
      const currentPath = location.pathname || '/';

      // Skip SEO API call for authenticated/internal routes (admin, teacher, user, auth pages)
      // These routes don't need dynamic SEO metadata and shouldn't make extra API calls
      const skipSeoForPaths = [
        '/admin',
        '/teacher',
        '/user',
        '/dashboard',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/verify-consent',
        '/parent-consent',
        '/age-gate'
      ];
      const shouldSkipSeo = skipSeoForPaths.some(prefix => currentPath.startsWith(prefix));

      if (shouldSkipSeo) {
        setSeoMetadata(null);
        return;
      }

      try {
        setLoadingSeo(true);
        const response = await apiFetch<{
          success: boolean;
          data: SEOMetadata;
        }>(`/seo-metadata/by-path?page_path=${encodeURIComponent(currentPath)}`, {}, {
          disableCache: true,
        });

        if (response.success && response.data && response.data.is_active) {
          setSeoMetadata(response.data);
        } else {
          // Clear metadata if not found or inactive
          setSeoMetadata(null);
        }
      } catch (error) {
        // Silently fail - use fallbacks (static defaults)
        setSeoMetadata(null);
        console.debug('SEO metadata not found for path:', currentPath, '- using default static settings');
      } finally {
        setLoadingSeo(false);
      }
    };

    fetchSeoMetadata();
  }, [location.pathname]);

  // Get dynamic values from settings
  const appName = appSettings?.app_name || appSettings?.application_name || "Pass The Ripple";
  const headerLogoPath = (appSettings as any)?.header_logo;
  const faviconPath = (appSettings as any)?.favicon;
  const socialMediaPreviewPath = (appSettings as any)?.social_media_preview_image;

  // Convert paths to full URLs
  const headerLogo = getImageUrl(headerLogoPath);
  const faviconUrl = getImageUrl(faviconPath);
  const socialMediaPreviewFromSettings = getImageUrl(socialMediaPreviewPath);

  // Build dynamic defaults
  const DEFAULT_TITLE = `${appName} — Spread Kindness, One Ripple at a Time`;
  const DEFAULT_DESCRIPTION = FALLBACK_DESCRIPTION;
  const DEFAULT_CANONICAL = FALLBACK_CANONICAL;

  // Priority: SEO metadata from API (highest) > explicit props > settings > static defaults (lowest)
  // This allows Admin to override hardcoded values without code changes.
  const finalTitle = seoMetadata?.title || title || DEFAULT_TITLE;
  const finalDescription = seoMetadata?.meta_description || description || DEFAULT_DESCRIPTION;

  // Canonical should be the current page URL, not og_url
  const finalCanonical = canonical || (typeof window !== "undefined" ? `${window.location.origin}${location.pathname}` : DEFAULT_CANONICAL);

  // Ensure image is an absolute URL for Open Graph sharing
  // Priority: SEO metadata OG image (highest) > passed image prop > social_media_preview_image setting > header_logo > default logo
  let finalImage = seoMetadata?.og_image_url || image;

  if (!finalImage) {
    finalImage = socialMediaPreviewFromSettings || headerLogo;
  }

  // If no image is set, use a default that's publicly accessible
  if (!finalImage) {
    const defaultImagePath = '/social-media-preview.png';
    finalImage = `${window.location.origin}${defaultImagePath}`;
  }

  // Convert relative URLs to absolute URLs
  if (finalImage && !finalImage.startsWith('http://') && !finalImage.startsWith('https://')) {
    if (finalImage.includes('/src/') || finalImage.includes('assets/')) {
      finalImage = `${window.location.origin}/social-media-preview.png`;
    } else {
      finalImage = `${window.location.origin}${finalImage.startsWith('/') ? '' : '/'}${finalImage}`;
    }
  }

  const finalImageAlt = imageAlt || seoMetadata?.page_name || `${appName} - Kindness Ripple Tracker`;

  // Priority: SEO metadata OG URL > props > canonical
  const finalUrl = seoMetadata?.og_url || url || finalCanonical;

  // Use SEO metadata OG title/description if available, otherwise use final values
  const finalOgTitle = seoMetadata?.og_title || finalTitle;
  const finalOgDescription = seoMetadata?.og_description || finalDescription;

  useEffect(() => {
    // Set document title
    document.title = finalTitle;

    // Meta description
    const metaDesc = ensureMeta('meta[name="description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    });
    metaDesc.setAttribute("content", finalDescription);

    // Open Graph: title & description
    const ogTitle = ensureMeta('meta[property="og:title"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:title");
      return m;
    });
    ogTitle.setAttribute("content", finalOgTitle);

    const ogDesc = ensureMeta('meta[property="og:description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:description");
      return m;
    });
    ogDesc.setAttribute("content", finalOgDescription);

    // Open Graph: type, url, site_name, image
    const ogType = ensureMeta('meta[property="og:type"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:type");
      return m;
    });
    ogType.setAttribute("content", type);

    const ogUrl = ensureMeta('meta[property="og:url"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:url");
      return m;
    });
    ogUrl.setAttribute("content", finalUrl);

    const ogSiteName = ensureMeta('meta[property="og:site_name"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:site_name");
      return m;
    });
    ogSiteName.setAttribute("content", appName);

    const ogImage = ensureMeta('meta[property="og:image"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image");
      return m;
    });
    ogImage.setAttribute("content", finalImage);

    const ogImageAlt = ensureMeta('meta[property="og:image:alt"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image:alt");
      return m;
    });
    ogImageAlt.setAttribute("content", finalImageAlt);

    const ogImageWidth = ensureMeta('meta[property="og:image:width"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image:width");
      return m;
    });
    ogImageWidth.setAttribute("content", "1200");

    const ogImageHeight = ensureMeta('meta[property="og:image:height"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:image:height");
      return m;
    });
    ogImageHeight.setAttribute("content", "630");

    // Twitter Card
    const twitterCard = ensureMeta('meta[name="twitter:card"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:card");
      return m;
    });
    twitterCard.setAttribute("content", "summary_large_image");

    const twitterTitle = ensureMeta('meta[name="twitter:title"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:title");
      return m;
    });
    twitterTitle.setAttribute("content", finalTitle);

    const twitterDesc = ensureMeta('meta[name="twitter:description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:description");
      return m;
    });
    twitterDesc.setAttribute("content", finalDescription);

    const twitterImage = ensureMeta('meta[name="twitter:image"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:image");
      return m;
    });
    twitterImage.setAttribute("content", finalImage);

    const twitterImageAlt = ensureMeta('meta[name="twitter:image:alt"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "twitter:image:alt");
      return m;
    });
    twitterImageAlt.setAttribute("content", finalImageAlt);

    // Canonical URL
    const linkCanonical = ensureMeta('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }) as HTMLLinkElement;
    linkCanonical.setAttribute("href", finalCanonical);

    // Favicon
    if (faviconUrl) {
      const linkFavicon = ensureMeta('link[rel="icon"]', () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "icon");
        return l;
      }) as HTMLLinkElement;
      linkFavicon.setAttribute("href", faviconUrl);
    }

    // JSON-LD Structured Data
    if (jsonLd) {
      let script = document.getElementById("jsonld") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "jsonld";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonLd);
    } else {
      // Optional: remove existing JSON-LD if none provided
      const existing = document.getElementById("jsonld");
      if (existing) existing.remove();
    }
  }, [finalTitle, finalDescription, finalCanonical, finalImage, finalImageAlt, finalUrl, finalOgTitle, finalOgDescription, type, jsonLd, faviconUrl, appName, image, seoMetadata]);

  return null;
};

export default Seo;