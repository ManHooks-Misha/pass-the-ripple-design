"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Story {
  action: string;
  date: string;
  location: string;
}

interface Node {
  id: string;
  icon: string;
  label: string;
  streak: number;
}

interface Edge {
  from: string;
  to: string;
  distance: string;
}

interface RippleTimelineProps {
  stories: Record<string, Story>;
  nodes: Node[];
  edges: Edge[];
  selectedId: string | null;
  onStoryClick?: (id: string) => void;
}

export default function RippleTimeline({
  stories,
  nodes,
  edges,
  selectedId,
  onStoryClick,
}: RippleTimelineProps) {
  const timelineRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll to selected card
  useEffect(() => {
    if (selectedId) {
      const el = timelineRefs.current[selectedId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedId]);

  const getNode = (id: string) => nodes.find((n) => n.id === id) || null;

  return (
    <div className="space-y-4">
      {Object.entries(stories).map(([id, story]) => {
        const node = getNode(id);
        if (!node) return null;

        const edge = edges.find((e) => e.to === id);

        return (
          <motion.div
            key={id}
            ref={(el) => (timelineRefs.current[id] = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => onStoryClick?.(id)}
            className={`p-4 rounded-xl border bg-gradient-to-r from-pink-50 to-purple-50 shadow-md transition-all cursor-pointer hover:shadow-lg ${
              selectedId === id
                ? "border-pink-500 ring-2 ring-pink-400"
                : "border-pink-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-purple-400 text-white text-2xl flex-shrink-0">
                {node.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{node.label}</h3>
                <p className="text-sm text-gray-700">{story.action}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {story.location} • {story.date}
                  {edge && (
                    <span className="ml-2 font-semibold text-pink-600">
                      {edge.distance}
                    </span>
                  )}
                </p>
                <p className="text-xs font-semibold text-red-500 mt-1">
                  🔥 {node.streak}-ripple challenge
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}