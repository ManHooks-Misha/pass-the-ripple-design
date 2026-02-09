"use client";

import React from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  delay: number;
}

interface AnimatedStarsProps {
  stars?: Star[];
}

const defaultStars: Star[] = [
  { id: 1, top: "10%", left: "20%", size: "2xl", delay: 0 },
  { id: 2, top: "15%", right: "25%", size: "xl", delay: 0.5 },
  { id: 3, bottom: "20%", left: "15%", size: "lg", delay: 1 },
  { id: 4, bottom: "25%", right: "20%", size: "2xl", delay: 1.5 },
  { id: 5, top: "30%", left: "40%", size: "xl", delay: 2 },
];

export default function AnimatedStars({ stars = defaultStars }: AnimatedStarsProps) {
  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className={`absolute text-yellow-400 text-${star.size} pointer-events-none`}
          style={{
            top: star.top,
            left: star.left,
            right: star.right,
            bottom: star.bottom,
          }}
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 2 + star.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        >
          ⭐
        </motion.div>
      ))}
    </>
  );
}