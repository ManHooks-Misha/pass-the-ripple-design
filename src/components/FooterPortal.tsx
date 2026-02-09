import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FIXED_FOOTER_ID = "fixedFooter";

/**
 * Renders children into #fixedFooter via React Portal so the footer stays
 * outside the zoomed content and has full-width background (zoom-safe layout).
 */
export default function FooterPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(FIXED_FOOTER_ID));
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}
