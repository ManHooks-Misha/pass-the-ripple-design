import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FIXED_HEADER_ID = "fixedHeader";

/**
 * Renders children into #fixedHeader via React Portal so the header stays
 * outside the zoomed content and is never scaled (browser zoom–safe layout).
 */
export default function HeaderPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(FIXED_HEADER_ID));
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}
