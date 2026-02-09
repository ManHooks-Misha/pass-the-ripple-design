import { useEffect, useRef } from "react";

export default function UsePageZoom() {
  const scaleRef = useRef(1);

  useEffect(() => {
    const html = document.documentElement;

    const applyScale = () => {
      html.style.transform = `scale(${scaleRef.current})`;
      html.style.transformOrigin = "0 0";
    };

    const resizeInc = () => {
      scaleRef.current = Math.min(scaleRef.current + 0.1, 2);
      applyScale();
    };

    const resizeDec = () => {
      scaleRef.current = Math.max(scaleRef.current - 0.1, 0.6);
      applyScale();
    };

    const reset = () => {
      scaleRef.current = 1;
      applyScale();
    };

    const keyHandler = (e) => {
      if (!e.ctrlKey) return;

      if (["+", "=", "Add"].includes(e.key)) {
        e.preventDefault();
        resizeInc();
      }

      if (["-", "Subtract"].includes(e.key)) {
        e.preventDefault();
        resizeDec();
      }

      if (e.key === "0") {
        e.preventDefault();
        reset();
      }
    };

    const wheelHandler = (e) => {
      if (!e.ctrlKey) return;

      e.preventDefault();
      e.deltaY < 0 ? resizeInc() : resizeDec();
    };

    document.addEventListener("keydown", keyHandler);
    document.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("wheel", wheelHandler);
    };
  }, []);
}
