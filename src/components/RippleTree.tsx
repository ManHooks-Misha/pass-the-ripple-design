"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Search, X, Home, Users, TrendingUp, ChevronDown, ChevronRight, Highlighter } from "lucide-react";

interface Node {
  id: string;
  icon: string;
  label: string;
  streak: number;
  parent?: string;
}

interface Edge {
  from: string;
  to: string;
  distance: string;
}

interface Story {
  action: string;
  date: string;
  location: string;
}

interface RippleJourneyData {
  nodes: Node[];
  edges: Edge[];
  stories: Record<string, Story>;
  totalDistance: string;
  higestDistance: string;
  rippleId: string;
}

interface ImprovedRippleTreeProps {
  data: RippleJourneyData;
  onNodeClick?: (id: string) => void;
}

export default function RippleTree({ data, onNodeClick }: ImprovedRippleTreeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set<string>());
  const [layoutType, setLayoutType] = useState<"radial" | "vertical">("radial");
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  const transformRef = useRef(d3.zoomIdentity);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 1000,
          height: rect.height || 800
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNodes([]);
      setSelectedId(null);
    } else {
      const filtered = data.nodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNodes(filtered);
      if (filtered.length === 1) {
        setSelectedId(filtered[0].id);
        centerOnNode(filtered[0].id);
      }
    }
  }, [searchTerm, data.nodes]);

  // Build hierarchy
  const buildHierarchy = () => {
    const rootNode = data.nodes.find(n => !n.parent) || data.nodes[0];
    
    const hierarchy = d3.hierarchy(rootNode, (d: any) => {
      if (collapsedNodes.has(d.id)) return [];
      return data.nodes.filter(n => n.parent === d.id);
    });

    if (layoutType === "radial") {
      const tree = d3.tree()
        .size([2 * Math.PI, Math.min(dimensions.width, dimensions.height) / 3])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
      
      tree(hierarchy);
      
      hierarchy.descendants().forEach(d => {
        const angle = d.x;
        const radius = d.y;
        (d as any).x = radius * Math.cos(angle - Math.PI / 2);
        (d as any).y = radius * Math.sin(angle - Math.PI / 2);
      });
    } else {
      d3.tree().nodeSize([120, 150])(hierarchy);
    }

    return hierarchy;
  };

  const hierarchy = buildHierarchy();
  const flatNodes = hierarchy.descendants();
  const flatEdges = hierarchy.links();

  // Zoom controls
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Initial center
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const initialTransform = d3.zoomIdentity.translate(centerX, centerY);
    transformRef.current = initialTransform;
    svg.call(zoom.transform, initialTransform);

    return () => {
      svg.on(".zoom", null);
    };
  }, [dimensions, layoutType]);

  const zoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  };

  const zoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  };

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const resetTransform = d3.zoomIdentity.translate(centerX, centerY);
    svg.transition().duration(500).call(zoomRef.current.transform, resetTransform);
  };

  const centerOnNode = (nodeId: string) => {
    const node = flatNodes.find(n => n.data.id === nodeId);
    if (!node || !svgRef.current || !zoomRef.current) return;

    const svg = d3.select(svgRef.current);
    const x = -(node as any).x * transformRef.current.k + dimensions.width / 2;
    const y = -(node as any).y * transformRef.current.k + dimensions.height / 2;
    const newTransform = d3.zoomIdentity.translate(x, y).scale(transformRef.current.k);
    
    svg.transition().duration(750).call(zoomRef.current.transform, newTransform);
  };

  const toggleCollapse = (nodeId: string) => {
    const newCollapsed = new Set(collapsedNodes);
    if (newCollapsed.has(nodeId)) {
      newCollapsed.delete(nodeId);
    } else {
      newCollapsed.add(nodeId);
    }
    setCollapsedNodes(newCollapsed);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedId(nodeId);
    centerOnNode(nodeId);
    if (onNodeClick) onNodeClick(nodeId);
  };

  const getNodeInfo = (nodeId: string) => {
    const node = data.nodes.find(n => n.id === nodeId);
    const story = data.stories[nodeId];
    const children = data.nodes.filter(n => n.parent === nodeId);
    return { node, story, children };
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedId(null);
  };

  const hoveredInfo = hoveredNode ? getNodeInfo(hoveredNode) : null;
  const selectedInfo = selectedId ? getNodeInfo(selectedId) : null;

  return (
    <div 
      ref={containerRef}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'w-full h-full'}`}
    >
      {/* Header Controls */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full sm:max-w-md" data-tutorial-target="search-users">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none bg-white shadow-lg text-sm sm:text-base"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 sm:px-4 py-2 border-2 border-purple-200" data-tutorial-target="journey-stats">
          <Users size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600" />
          <span className="text-xs sm:text-sm font-semibold text-purple-900">{data.nodes.length} Users</span>
          <span className="text-gray-300 mx-1 sm:mx-2">|</span>
          <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-green-600" />
          <span className="text-xs sm:text-sm font-semibold text-green-900">{data.totalDistance}</span>
          <span className="text-gray-300 mx-1 sm:mx-2">|</span>
          <Highlighter size={16} className="sm:w-[18px] sm:h-[18px] text-primary-600" />
          <span className="text-xs sm:text-sm font-semibold text-primary-900">{data.higestDistance}</span>
        </div>

        {/* Layout Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setLayoutType(layoutType === "radial" ? "vertical" : "radial")}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all text-xs sm:text-sm font-medium"
          >
            {layoutType === "radial" ? "🌳 Tree" : "⭕ Radial"}
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-28 sm:top-20 right-3 sm:right-4 z-20 flex flex-col gap-2" data-tutorial-target="zoom-controls">
        <button
          onClick={zoomIn}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2.5 sm:p-3 rounded-lg shadow-lg transition-all border-2 border-gray-200"
          title="Zoom in"
        >
          <ZoomIn size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2.5 sm:p-3 rounded-lg shadow-lg transition-all border-2 border-gray-200"
          title="Zoom out"
        >
          <ZoomOut size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={resetZoom}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2.5 sm:p-3 rounded-lg shadow-lg transition-all border-2 border-gray-200"
          title="Reset view"
        >
          <Home size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-purple-500 hover:bg-purple-600 text-white p-2.5 sm:p-3 rounded-lg shadow-lg transition-all"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={18} className="sm:w-5 sm:h-5" /> : <Maximize2 size={18} className="sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Search Results */}
      {searchTerm && filteredNodes.length > 0 && (
        <div className="absolute top-28 sm:top-20 left-3 sm:left-4 z-20 bg-white rounded-lg shadow-xl p-3 sm:p-4 max-w-xs border-2 border-purple-300 max-h-64 overflow-y-auto">
          <h3 className="font-bold text-purple-900 mb-2">Search Results ({filteredNodes.length})</h3>
          {filteredNodes.map(node => (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className="w-full text-left px-3 py-2 rounded hover:bg-purple-50 flex items-center gap-2 transition-colors"
            >
              <span className="text-2xl">{node.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{node.label}</div>
                <div className="text-xs text-gray-500">🔥 {node.streak} streak</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredInfo && hoveredInfo.node && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl p-4 border-2 border-purple-300 min-w-[280px]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{hoveredInfo.node.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{hoveredInfo.node.label}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🔥 {hoveredInfo.node.streak} day streak</span>
              </div>
            </div>
          </div>
          {hoveredInfo.story && (
            <div className="text-sm space-y-1 pt-2 border-t border-gray-200">
              <div className="text-gray-600">📍 {hoveredInfo.story.location}</div>
              <div className="text-gray-600">📅 {hoveredInfo.story.date}</div>
              <div className="text-purple-600 font-medium">{hoveredInfo.story.action}</div>
            </div>
          )}
          {hoveredInfo.children.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">👥 {hoveredInfo.children.length} referral{hoveredInfo.children.length !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full cursor-move bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
        style={{ touchAction: "none" }}
        data-tutorial-target="ripple-tree"
      >
        <defs>
          <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        <g ref={gRef}>
          {/* Edges */}
          {flatEdges.map((edge, i) => {
            const edgeData = data.edges.find(
              e => e.from === edge.source.data.id && e.to === edge.target.data.id
            );
            const isHighlighted = selectedId === edge.source.data.id || selectedId === edge.target.data.id;
            
            return (
              <g key={i}>
                <path
                  d={`M${(edge.source as any).x},${(edge.source as any).y} 
                      C${(edge.source as any).x},${((edge.source as any).y + (edge.target as any).y) / 2} 
                      ${(edge.target as any).x},${((edge.source as any).y + (edge.target as any).y) / 2} 
                      ${(edge.target as any).x},${(edge.target as any).y}`}
                  stroke={isHighlighted ? "#ec4899" : "#d8b4fe"}
                  strokeWidth={isHighlighted ? 3 : 2}
                  fill="none"
                  opacity={isHighlighted ? 1 : 0.6}
                  strokeDasharray={isHighlighted ? "0" : "5,5"}
                />
                {edgeData?.distance && (
                  <text
                    x={((edge.source as any).x + (edge.target as any).x) / 2}
                    y={((edge.source as any).y + (edge.target as any).y) / 2}
                    textAnchor="middle"
                    fill="#7c3aed"
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {edgeData.distance}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {flatNodes.map((node) => {
            const nodeId = node.data.id;
            const isSelected = selectedId === nodeId;
            const isHovered = hoveredNode === nodeId;
            const nodeData = data.nodes.find(n => n.id === nodeId);
            const hasChildren = data.nodes.some(n => n.parent === nodeId);
            const isCollapsed = collapsedNodes.has(nodeId);
            const isSearchMatch = filteredNodes.some(n => n.id === nodeId);

            if (!nodeData) return null;

            return (
              <g
                key={nodeId}
                className="cursor-pointer transition-all"
                onClick={() => handleNodeClick(nodeId)}
                onMouseEnter={() => setHoveredNode(nodeId)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow effect for selected */}
                {isSelected && (
                  <circle
                    cx={(node as any).x}
                    cy={(node as any).y}
                    r={35}
                    fill="#ec4899"
                    opacity="0.2"
                    filter="url(#glow)"
                  />
                )}

                {/* Search highlight */}
                {isSearchMatch && (
                  <circle
                    cx={(node as any).x}
                    cy={(node as any).y}
                    r={30}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    strokeDasharray="4,4"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="8"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={(node as any).x}
                  cy={(node as any).y}
                  r={24}
                  fill="url(#grad-purple)"
                  stroke={isSelected ? "#ec4899" : "#c084fc"}
                  strokeWidth={isSelected ? 4 : 2}
                  filter="url(#shadow)"
                  style={{
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transformOrigin: `${(node as any).x}px ${(node as any).y}px`,
                    transition: 'transform 0.2s'
                  }}
                />

                {/* Icon */}
                <text
                  x={(node as any).x}
                  y={(node as any).y + 8}
                  textAnchor="middle"
                  fontSize="24"
                  className="pointer-events-none"
                >
                  {nodeData.icon}
                </text>

                {/* Streak badge */}
                <g transform={`translate(${(node as any).x + 16}, ${(node as any).y - 20})`}>
                  <rect
                    x="-18"
                    y="-10"
                    width="36"
                    height="20"
                    rx="10"
                    fill="#fef3c7"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="4"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#b45309"
                    textAnchor="middle"
                  >
                    🔥{nodeData.streak}
                  </text>
                </g>

                {/* Label */}
                <text
                  x={(node as any).x}
                  y={(node as any).y + 45}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill="#1f2937"
                  className="pointer-events-none"
                >
                  {nodeData.label}
                </text>

                {/* Collapse/Expand indicator */}
                {hasChildren && (
                  <g
                    transform={`translate(${(node as any).x}, ${(node as any).y + 28})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(nodeId);
                    }}
                    className="cursor-pointer"
                  >
                    <circle r="10" fill="#8b5cf6" />
                    <text
                      y="4"
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                    >
                      {isCollapsed ? '+' : '−'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Node Info Panel */}
      {selectedInfo && selectedInfo.node && !isFullscreen && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-6 border-2 border-purple-300 max-w-md mx-auto">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{selectedInfo.node.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedInfo.node.label}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="bg-orange-100 px-2 py-1 rounded-full">🔥 {selectedInfo.node.streak} day streak</span>
              </div>
              {selectedInfo.story && (
                <div className="space-y-2 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-medium">{selectedInfo.story.action}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>📍 {selectedInfo.story.location}</span>
                    <span>📅 {new Date(selectedInfo.story.date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              {selectedInfo.children.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    👥 Referred {selectedInfo.children.length} user{selectedInfo.children.length !== 1 ? 's' : ''}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.children.slice(0, 5).map(child => (
                      <button
                        key={child.id}
                        onClick={() => handleNodeClick(child.id)}
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded-full text-xs font-medium text-purple-900 transition-colors"
                      >
                        {child.icon} {child.label}
                      </button>
                    ))}
                    {selectedInfo.children.length > 5 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{selectedInfo.children.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}