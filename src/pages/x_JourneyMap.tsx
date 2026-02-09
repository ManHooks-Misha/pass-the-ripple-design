"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";

interface JourneyNode {
  id: string;
  lat: number;
  lng: number;
  icon: string;
  label: string;
}
interface JourneyEdge {
  id: string;
  from: string;
  to: string;
  distance: string;
}
interface JourneyStory {
  action: string;
  date: string;
  location: string;
}

// --- Stars config ---
const stars = [
  { id: 1, top: "10%", left: "20%", size: "2xl", delay: 0 },
  { id: 2, top: "15%", right: "25%", size: "xl", delay: 0.5 },
  { id: 3, bottom: "20%", left: "15%", size: "lg", delay: 1 },
  { id: 4, bottom: "25%", right: "20%", size: "2xl", delay: 1.5 },
  { id: 5, top: "30%", left: "40%", size: "xl", delay: 2 },
];
const sizeMap: Record<string, string> = {
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

// --- Transform journey recursively ---
const transformJourney = (
  journey: any,
  nodeMap = new Map<string, JourneyNode>(),
  storiesObj: Record<string, JourneyStory> = {}
): { nodes: JourneyNode[]; edges: JourneyEdge[]; stories: Record<string, JourneyStory> } => {
  const edgesArr: JourneyEdge[] = [];

  const addNode = (
    id: string,
    lat: number,
    lng: number,
    icon: string,
    label: string,
    story: JourneyStory
  ) => {
    const uniqueId = `${id}-${lat}-${lng}`;
    if (!nodeMap.has(uniqueId)) {
      nodeMap.set(uniqueId, { id: uniqueId, lat, lng, icon, label });
      storiesObj[uniqueId] = story;
    }
    return uniqueId;
  };

  if (journey?.referrer?.location) {
    const rloc = journey.referrer.location;
    addNode(
      `referrer-${journey.referrer.id}`,
      rloc.latitude,
      rloc.longitude,
      journey.referrer.role === "admin" ? "👑" : "🧑",
      journey.referrer.nickname,
      {
        action: "Referred",
        date: new Date(journey.referred_at).toLocaleDateString(),
        location: `${rloc.city}, ${rloc.country}`,
      }
    );
  }

  let refereeId = "";
  if (journey?.referee?.location) {
    const loc = journey.referee.location;
    refereeId = addNode(
      `referee-${journey.referee.id}`,
      loc.latitude,
      loc.longitude,
      journey.referee.role === "admin" ? "👑" : "👶",
      journey.referee.nickname,
      {
        action: "Joined",
        date: new Date(journey.referred_at).toLocaleDateString(),
        location: `${loc.city}, ${loc.country}`,
      }
    );

    if (journey.referrer?.location) {
      const fromId = `referrer-${journey.referrer.id}-${journey.referrer.location.latitude}-${journey.referrer.location.longitude}`;
      edgesArr.push({
        id: `edge-${fromId}-${refereeId}`,
        from: fromId,
        to: refereeId,
        distance: journey.distance_km ? `+${journey.distance_km} km` : "",
      });
    }
  }

  if (Array.isArray(journey.children)) {
    journey.children.forEach((child: any) => {
      const childData = transformJourney(child, nodeMap, storiesObj);
      edgesArr.push(...childData.edges);
    });
  }

  return { nodes: Array.from(nodeMap.values()), edges: edgesArr, stories: storiesObj };
};

export default function RippleJourneyMap() {
  const [nodes, setNodes] = useState<JourneyNode[]>([]);
  const [edges, setEdges] = useState<JourneyEdge[]>([]);
  const [stories, setStories] = useState<Record<string, JourneyStory>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false); // ✅ moved inside component
  const mapRef = useRef<google.maps.Map | null>(null);

  const getNode = (id: string) => nodes.find((n) => n.id === id);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const token = getAuthToken() || "";
        const tokenType = localStorage.getItem("tokenType") || "Bearer";

        const res = await apiFetch<any>("/ripple-journey", {
          headers: { Authorization: `${tokenType} ${token}` },
        });

        const apiJourneys = res?.data?.journeys ?? [];
        const nodeMap = new Map<string, JourneyNode>();
        const storiesObj: Record<string, JourneyStory> = {};
        const allEdges: JourneyEdge[] = [];

        apiJourneys.forEach((j) => {
          const transformed = transformJourney(j, nodeMap, storiesObj);
          allEdges.push(...transformed.edges);
        });

        setNodes(Array.from(nodeMap.values()));
        setEdges(allEdges);
        setStories(storiesObj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, []);

  // ✅ Fit bounds only when both map and nodes are ready
  useEffect(() => {
    if (mapLoaded && mapRef.current && nodes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      nodes.forEach((n) => bounds.extend({ lat: n.lat, lng: n.lng }));
      mapRef.current.fitBounds(bounds);
    }
  }, [mapLoaded, nodes]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl font-bold text-purple-600">
        🌈 Loading Ripple Journey...
      </div>
    );

  return (
    <div className="flex-1 grid lg:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        {/* Map */}
        <div className="relative rounded-2xl shadow-lg bg-white/90 p-4 flex flex-col overflow-hidden">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">
            🌈 Ripple Journey Map
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click on a name to highlight their story
          </p>

          {/* Clouds */}
          <motion.div
            className="absolute top-10 left-0 text-4xl opacity-30"
            animate={{ x: [0, 80, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          >
            ☁️
          </motion.div>
          <motion.div
            className="absolute top-20 right-0 text-5xl opacity-30"
            animate={{ x: [0, -100, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          >
            ☁️
          </motion.div>

          {/* Stars */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className={`absolute text-yellow-400 ${sizeMap[star.size]}`}
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

          {/* Google Map */}
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
            <LoadScript googleMapsApiKey="AIzaSyBn5gHHZP-V3517BQ163GxfuGZFckbefq8">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{ lat: 20, lng: 0 }}
                zoom={3}
                onLoad={(map) => {
                  mapRef.current = map;
                  setMapLoaded(true); // ✅ trigger fitBounds when map is ready
                }}
              >
                {/* Polylines */}
                {edges.map((e) => {
                  const from = getNode(e.from);
                  const to = getNode(e.to);
                  if (!from || !to) return null;
                  return (
                    <Polyline
                      key={e.id}
                      path={[
                        { lat: from.lat, lng: from.lng },
                        { lat: to.lat, lng: to.lng },
                      ]}
                      options={{
                        strokeColor: "#ec4899",
                        strokeOpacity: 0.8,
                        strokeWeight: 3,
                        geodesic: true,
                      }}
                    />
                  );
                })}

                {/* Markers */}
                {nodes.map((n) => (
                  <Marker
                    key={n.id}
                    position={{ lat: n.lat, lng: n.lng }}
                    label={{ text: n.icon, fontSize: "24px" }}
                    onClick={() => setSelected(n.id)}
                  />
                ))}

                {/* InfoWindow */}
                {selected && stories[selected] && (
                  <InfoWindow
                    position={{
                      lat: getNode(selected)?.lat ?? 0,
                      lng: getNode(selected)?.lng ?? 0,
                    }}
                    onCloseClick={() => setSelected(null)}
                  >
                    <div className="p-2 text-sm">
                      <strong>{getNode(selected)?.label}</strong>
                      <p>{stories[selected].action}</p>
                      <p className="text-xs text-gray-500">
                        {stories[selected].location} • {stories[selected].date}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl shadow-lg bg-white/90 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">
            ✨ Ripple Stories
          </h2>
          <div className="space-y-4">
            {nodes.map((node) => {
              const story = stories[node.id];
              const edge = edges.find((e) => e.to === node.id);
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-4 rounded-xl border bg-gradient-to-r from-pink-50 to-purple-50 shadow-md transition-all ${
                    selected === node.id
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
                      {story && (
                        <>
                          <p className="text-sm text-gray-700">
                            {story.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {story.location} • {story.date}
                            {edge && (
                              <span className="ml-2 font-semibold text-pink-600">
                                {edge.distance}
                              </span>
                            )}
                          </p>
                        </>
                      )}
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