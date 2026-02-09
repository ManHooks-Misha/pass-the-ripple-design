import React, { useState } from "react";
import { motion } from "framer-motion";

// --- Node & Edge Data ---
const nodes = [
  { id: "A", x: 250, y: 50, icon: "🐦", label: "Emma (A)", streak: 5 },
  { id: "B", x: 100, y: 200, icon: "🦁", label: "Noah (B)", streak: 3 },
  { id: "C", x: 400, y: 200, icon: "🐰", label: "Sophia (C)", streak: 2 },
  { id: "D", x: -20, y: 350, icon: "🦊", label: "Liam (D)", streak: 7 },
  { id: "E", x: 180, y: 350, icon: "🦉", label: "Mia (E)", streak: 1 },
  { id: "F", x: 380, y: 350, icon: "🐼", label: "Ava (F)", streak: 4 },
  // 🔹 Extra kids for analysis
  { id: "G", x: 50, y: 500, icon: "🐸", label: "Lucas (G)", streak: 6 },
  { id: "H", x: 200, y: 500, icon: "🐵", label: "Ella (H)", streak: 2 },
  { id: "I", x: 350, y: 500, icon: "🐱", label: "James (I)", streak: 8 },
  { id: "J", x: 500, y: 500, icon: "🦄", label: "Grace (J)", streak: 3 },
];

const edges = [
  { id: "A-B", from: "A", to: "B", distance: "+215 km" },
  { id: "A-C", from: "A", to: "C", distance: "+320 km" },
  { id: "B-D", from: "B", to: "D", distance: "+120 km" },
  { id: "B-E", from: "B", to: "E", distance: "+150 km" },
  { id: "C-F", from: "C", to: "F", distance: "+210 km" },
  // 🔹 New edges for added kids
  { id: "D-G", from: "D", to: "G", distance: "+90 km" },
  { id: "D-H", from: "D", to: "H", distance: "+130 km" },
  { id: "E-I", from: "E", to: "I", distance: "+75 km" },
  { id: "F-J", from: "F", to: "J", distance: "+110 km" },
];

// --- Stories ---
const stories: Record<
  string,
  { action: string; date: string; location: string }
> = {
  A: { action: "Started the ripple by helping a classmate", date: "Jan 15, 2024", location: "New York, USA" },
  B: { action: "Shared lunch with a friend", date: "Jan 17, 2024", location: "Boston, USA" },
  C: { action: "Helped clean up the playground", date: "Jan 20, 2024", location: "Philadelphia, USA" },
  D: { action: "Donated old toys", date: "Jan 22, 2024", location: "Chicago, USA" },
  E: { action: "Planted a tree", date: "Jan 25, 2024", location: "Miami, USA" },
  F: { action: "Wrote a thank-you card", date: "Jan 28, 2024", location: "Dallas, USA" },
  G: { action: "Helped teacher carry books", date: "Jan 30, 2024", location: "Denver, USA" },
  H: { action: "Shared toys with sibling", date: "Feb 1, 2024", location: "Seattle, USA" },
  I: { action: "Made a birthday card for grandma", date: "Feb 3, 2024", location: "Austin, USA" },
  J: { action: "Volunteered at animal shelter", date: "Feb 5, 2024", location: "San Diego, USA" },
};

// --- Star Positions ---
const stars = [
  { id: 1, top: "10%", left: "20%", size: "2xl", delay: 0 },
  { id: 2, top: "15%", right: "25%", size: "xl", delay: 0.5 },
  { id: 3, bottom: "20%", left: "15%", size: "lg", delay: 1 },
  { id: 4, bottom: "25%", right: "20%", size: "2xl", delay: 1.5 },
  { id: 5, top: "30%", left: "40%", size: "xl", delay: 2 },
];

const calcGroupStreak = () => Math.min(...nodes.map((n) => n.streak));

export default function RippleJourneySVG() {
  const [selected, setSelected] = useState<string | null>(null);
  const getNode = (id: string) => nodes.find((n) => n.id === id)!;
  const groupStreak = calcGroupStreak();

  return (
    <div className="grid lg:grid-cols-2 gap-6 min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6">
      
      {/* Left: Ripple Tree */}
      <div className="relative rounded-2xl shadow-lg bg-white/90 p-4 flex flex-col overflow-hidden">
        <h2 className="text-2xl font-bold text-purple-700 mb-1">🌈 Ripple Journey Tree</h2>
        <p className="text-sm text-gray-600 mb-2">Click a name to highlight their story</p>

        {/* Group Streak Banner */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-pink-200 to-purple-200 text-center shadow-md">
          <span className="text-lg font-bold text-purple-800">
            🌟 Family Ripple Streak: {groupStreak} days 🔥
          </span>
        </div>

        {/* Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className={`absolute text-yellow-400 text-${star.size}`}
            style={{ top: star.top, left: star.left, right: star.right, bottom: star.bottom }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2 + star.delay, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
          >
            ⭐
          </motion.div>
        ))}

        {/* SVG Graph */}
        <svg viewBox="0 0 600 600" className="relative w-full h-[600px]">
          {/* Edges */}
          {edges.map((edge) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={edge.id}>
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#ec4899"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                />
                <text x={midX} y={midY - 5} textAnchor="middle" fill="#db2777" fontWeight="bold" fontSize="11">
                  {edge.distance}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id} onClick={() => setSelected(node.id)} className="cursor-pointer">
              <circle
                cx={node.x}
                cy={node.y}
                r={18}
                fill="url(#grad)"
                stroke={selected === node.id ? "#ec4899" : "#9333ea"}
                strokeWidth={selected === node.id ? 4 : 2}
              />
              <text x={node.x} y={node.y + 7} textAnchor="middle" fontSize="18">
                {node.icon}
              </text>
              {/* 🔥 Compact streak badge closer to node */}
              <rect x={node.x + 12} y={node.y - 22} width="28" height="16" rx="6" fill="#fee2e2" stroke="#ef4444" />
              <text x={node.x + 26} y={node.y - 10} fontSize="10" fontWeight="bold" fill="#ef4444" textAnchor="middle">
                🔥{node.streak}
              </text>
              <text x={node.x} y={node.y + 50} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#111">
                {node.label}
              </text>
            </g>
          ))}
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f9a8d4" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Right: Timeline */}
      <div className="rounded-2xl shadow-lg bg-white/90 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">✨ Ripple Stories</h2>
        <div className="space-y-4">
          {Object.entries(stories).map(([id, story]) => {
            const node = getNode(id);
            const edge = edges.find((e) => e.to === id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-xl border bg-gradient-to-r from-pink-50 to-purple-50 shadow-md transition-all ${
                  selected === id ? "border-pink-500 ring-2 ring-pink-400" : "border-pink-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-purple-400 text-white text-2xl">
                    {node.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{node.label}</h3>
                    <p className="text-sm text-gray-700">{story.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {story.location} • {story.date}
                      {edge && <span className="ml-2 font-semibold text-pink-600">{edge.distance}</span>}
                    </p>
                    <p className="text-xs font-semibold text-red-500 mt-1">🔥 {node.streak}-day streak</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
