import React from "react";

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const RippleCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const reduced = prefersReduced();
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}>
      <div className="ripple-layer">
        <span className={`ripple-ring ${reduced ? 'ripple-static' : ''}`} />
        <span className={`ripple-ring delay-300 ${reduced ? 'ripple-static' : ''}`} />
        <span className={`ripple-ring delay-700 ${reduced ? 'ripple-static' : ''}`} />
      </div>
    </div>
  );
};

export default RippleCanvas;
