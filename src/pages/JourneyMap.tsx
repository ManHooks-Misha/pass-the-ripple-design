"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/MagicalHeader";
import FooterSection from "@/components/layouts/includes/FooterSection";

// --- Star animation
const stars = [
  { id: 1, top: "10%", left: "20%", size: "2xl", delay: 0 },
  { id: 2, top: "15%", right: "25%", size: "xl", delay: 0.5 },
  { id: 3, bottom: "20%", left: "15%", size: "lg", delay: 1 },
  { id: 4, bottom: "25%", right: "20%", size: "2xl", delay: 1.5 },
  { id: 5, top: "30%", left: "40%", size: "xl", delay: 2 },
];

function generateData(numNodes = 20) {
  const nodesData: any[] = [];
  const edgesData: any[] = [];
  const stories: Record<string, { action: string; date: string; location: string }> = {};

  const emojis = ["🐦","🦁","🐰","🦊","🦉","🐼","🐸","🐵","🐱","🦄"];
  const actions = ["Helped a friend", "Planted a tree", "Shared food", "Donated clothes", "Volunteered"];
  const locations = ["New York", "London", "Paris", "Berlin", "Tokyo", "Sydney"];

  nodesData.push({ id: "A", icon: "👑", label: "Root (A)", streak: Math.floor(Math.random() * 10) + 1 });
  stories["A"] = { action: "Started the ripple", date: "2024-01-01", location: "Global" };

  let idCounter = 1;
  for (let i = 0; i < numNodes - 1; i++) {
    const parent = nodesData[Math.floor(Math.random() * nodesData.length)];
    const newId = `N${idCounter}`;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const streak = Math.floor(Math.random() * 10) + 1;

    nodesData.push({ id: newId, icon: emoji, label: `User ${newId}`, streak, parent: parent.id });
    edgesData.push({ from: parent.id, to: newId, distance: `+${50 + Math.floor(Math.random() * 300)} km` });

    stories[newId] = {
      action: actions[Math.floor(Math.random() * actions.length)],
      date: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(
        Math.floor(Math.random() * 28) + 1
      ).padStart(2, "0")}`,
      location: locations[Math.floor(Math.random() * locations.length)],
    };
    idCounter++;
  }

  return { nodesData, edgesData, stories };
}

export default function RippleJourneySVG() {
  const [selected, setSelected] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<any>(null);
  const timelineRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const batchSize = 50;

  const { nodesData: allNodes, edgesData: allEdges, stories: allStories } = React.useMemo(() => generateData(20), []);

  const [flattenNodes, setFlattenNodes] = useState<any[]>([]);
  const [flattenEdges, setFlattenEdges] = useState<any[]>([]);
  const [activeNodes, setActiveNodes] = useState(allNodes);
  const [activeEdges, setActiveEdges] = useState(allEdges);
  const [activeStories, setActiveStories] = useState(allStories);

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // --- D3 Zoom setup
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform.toString());
      });
    svg.call(zoom as any);
    zoomRef.current = zoom;
  }, []);

  const zoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.2);
  };

  const zoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.8);
  };

  // Add a function to scroll timeline to a card
  const scrollToCard = (id: string) => {
    setSelected(id);
    const el = timelineRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // --- Build hierarchy and layout in batches
  useEffect(() => {
    const roots = activeNodes.filter((n) => !n.parent).map(function buildHierarchy(node: any) {
      const children = activeNodes.filter((n) => n.parent === node.id);
      if (children.length > 0) node.children = children.map(buildHierarchy);
      return node;
    });

    const fNodes: any[] = [];
    const fEdges: any[] = [];
    let i = 0;

    function renderBatch() {
      const batchRoots = roots.slice(i, i + batchSize);
      batchRoots.forEach((root) => {
        const hierarchy = d3.hierarchy(root);
        d3.tree().nodeSize([90, 100])(hierarchy);
        fNodes.push(...hierarchy.descendants());
        fEdges.push(...hierarchy.links());
      });
      setFlattenNodes([...fNodes]);
      setFlattenEdges([...fEdges]);

      i += batchSize;
      if (i < roots.length) {
        requestAnimationFrame(renderBatch);
      } else {
        // calculate offsets for centering
        const svgWidth = 800;
        const svgHeight = 600;
        const xValues = fNodes.map((n) => n.x);
        const yValues = fNodes.map((n) => n.y);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        setOffsetX(svgWidth / 2 - (minX + maxX) / 2);
        setOffsetY(svgHeight / 2 - (minY + maxY) / 2);
      }
    }

    renderBatch();
  }, [activeNodes]);

  const getNode = (id: string) => activeNodes.find((n) => n.id === id)!;

  return (
    <div className="min-h-screen">
      <Seo
        title="Hero Wall — Pass The Ripple"
        description="Discover inspiring stories of kindness from kids around the world."
        canonical={`${window.location.origin}/hero-wall`}
      />
      <Header />
      <main className="container py-10">
        <div className="space-y-8">
          <div className="text-center">
          </div>
      <div className="grid lg:grid-cols-2 gap-6 ">
      {/* Left: Ripple Tree */}
      <div className="relative rounded-2xl shadow-lg bg-white/90 p-4 flex flex-col overflow-hidden">
        <h2 className="text-2xl font-bold text-purple-700 mb-1">🌈 Ripple Journey Tree</h2>
        <p className="text-sm text-gray-600 mb-2">Click a name to highlight their story</p>

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

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button onClick={zoomIn} className="bg-blue-500 text-white px-3 py-1 rounded shadow">+</button>
          <button onClick={zoomOut} className="bg-blue-500 text-white px-3 py-1 rounded shadow">-</button>
        </div>

        {/* SVG */}
        <svg ref={svgRef} viewBox={`0 0 800 600`} className="relative w-full h-[600px]">
          <g ref={gRef} transform={`translate(${offsetX}, ${offsetY})`}>
            {/* Edges */}
            {flattenEdges.map((edge, i) => (
              <g key={i}>
                <motion.line
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke="#ec4899"
                  strokeWidth={3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                />
                <text
                  x={(edge.source.x + edge.target.x) / 2}
                  y={(edge.source.y + edge.target.y) / 2 - 15}
                  textAnchor="middle"
                  fill="#db2777"
                  fontWeight="bold"
                  fontSize="11"
                >
                  {activeEdges.find(e => e.from === edge.source.data.id && e.to === edge.target.data.id)?.distance}
                </text>
              </g>
            ))}

            {/* Nodes */}
            {flattenNodes.map((node) => (
              <g
                key={node.data.id}
                className="cursor-pointer"
                onClick={() => scrollToCard(node.data.id)} // ✅ scroll to card on node click
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill="url(#grad)"
                  stroke={selected === node.data.id ? "#ec4899" : "#9333ea"}
                  strokeWidth={selected === node.data.id ? 4 : 2}
                />
                <text x={node.x} y={node.y + 7} textAnchor="middle" fontSize="18">
                  {node.data.icon}
                </text>
                <rect x={node.x + 12} y={node.y - 22} width="28" height="16" rx="6" fill="#fee2e2" stroke="#ef4444" />
                <text x={node.x + 26} y={node.y - 10} fontSize="10" fontWeight="bold" fill="#ef4444" textAnchor="middle">
                  🔥{node.data.streak}
                </text>
                <text x={node.x} y={node.y + 50} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#111">
                  {node.data.label}
                </text>
              </g>
            ))}

            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f9a8d4" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </g>
        </svg>
      </div>

      {/* Right: Timeline */}
      <div className="rounded-2xl shadow-lg bg-white/90 p-6 h-[600px] overflow-y-auto">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">✨ Ripple Stories</h2>
        <div className="space-y-4">
          {Object.entries(activeStories).map(([id, story]) => {
            const node = getNode(id);
            const edge = activeEdges.find((e) => e.to === id);
            return (
              <motion.div
                key={id}
                ref={(el) => (timelineRefs.current[id] = el)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-xl border bg-gradient-to-r from-pink-50 to-purple-50 shadow-md transition-all
                  ${selected === id 
                    ? "border-pink-500 ring-2 ring-pink-400" 
                    : "border-pink-200"
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
                    <p className="text-xs font-semibold text-red-500 mt-1">🔥 {node.streak}-ripple</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div></div></div>
      </main>
      <FooterSection />
    </div>
  );
}
