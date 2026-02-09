"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Globe, Network, Layers, Target, Users, ZoomIn, ZoomOut, Home, Maximize2, Minimize2, Search, X } from 'lucide-react';

interface Node {
  id: number;
  avatar_id: number;
  profile_full_image: string | null;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  label: string;
  streak: number | { current_streak: number };
  parent: number | null;
}

interface Edge {
  from: number;
  to: number;
  distance: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface Story {
  action: string;
  date: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  location: string;
}

interface RippleJourneyData {
  success: boolean;
  data: {
    ripple_id: string;
    nodesData: Node[];
    edgesData: Edge[];
    stories: Record<string, Story>;
    total_distance_covered: string;
  };
  message?: string;
}

interface MapRippleTreeProps {
  data: RippleJourneyData | null;
  googleMapsApiKey: string;
}

// Avatar mapping for different icons
const avatarIcons: Record<number, string> = {
  1: '👤', 2: '👨', 3: '👩', 4: '🧑', 5: '🧔'
};

// Declare google in window
declare global {
  interface Window {
    google: any;
  }
}

export default function MapRippleTree({ data, googleMapsApiKey }: MapRippleTreeProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized data access to prevent unnecessary re-renders
  const { nodesData, edgesData, stories, rippleId, totalDistance } = useMemo(() => {
    if (!data?.success) {
      return {
        nodesData: [],
        edgesData: [],
        stories: {},
        rippleId: 'Unknown',
        totalDistance: '0 km'
      };
    }
    
    return {
      nodesData: data.data.nodesData || [],
      edgesData: data.data.edgesData || [],
      stories: data.data.stories || {},
      rippleId: data.data.ripple_id || 'Unknown',
      totalDistance: data.data.total_distance_covered || '0 km'
    };
  }, [data]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        setIsLoading(true);
        
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
            initializeMap();
            return;
        }

        // Set up callback for when script loads
        (window as any).initMap = initializeMap;

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        
        // Use onload instead of callback
        script.onload = () => {
            initializeMap();
        };

        script.onerror = () => {
            setError('Failed to load Google Maps');
            setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps.');
        setIsLoading(false);
      }
    };

    const initializeMap = () => {
      try {
        if (!mapRef.current) return;

        const googleMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          mapTypeId: 'satellite',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        // Enable 45° imagery
        googleMap.setTilt(45);
        setMap(googleMap);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map.');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();

    // Cleanup function
    return () => {
      if ((window as any).initMap) {
        delete (window as any).initMap;
        }
    };
  }, [googleMapsApiKey]);

  // Create markers and routes
  useEffect(() => {
    if (!map || !window.google || nodesData.length === 0) {
      return;
    }

    let isMounted = true;
    const markers: any[] = [];
    const polylines: google.maps.Polyline[] = [];
    const infoWindows: google.maps.InfoWindow[] = [];

    try {
      // Create markers for all nodes
      nodesData.forEach(node => {
        if (!node.latitude || !node.longitude || node.latitude === 'null' || node.longitude === 'null') {
          return;
        }

        const lat = parseFloat(node.latitude);
        const lng = parseFloat(node.longitude);

        if (isNaN(lat) || isNaN(lng)) {
          return;
        }

        const avatarIcon = avatarIcons[node.avatar_id] || '👤';
        const streak = typeof node.streak === 'object' ? node.streak.current_streak : (node.streak || 0);

        // Create custom marker with HTML
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            <div style="
              background: ${node.parent === null ? 
                'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 
                'linear-gradient(135deg, #4ecdc4, #44a08d)'};
              border: 3px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              color: white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              transition: all 0.3s ease;
            ">${avatarIcon}</div>
            ${streak > 0 ? `
              <div style="
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ffd700;
                color: #000;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                border: 2px solid white;
              ">${streak}</div>
            ` : ''}
            <div style="
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              margin-top: 8px;
              white-space: nowrap;
              backdrop-filter: blur(10px);
              max-width: 120px;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${node.label}</div>
          </div>
        `;

        // Use OverlayView for custom markers to ensure compatibility
        class CustomMarker extends google.maps.OverlayView {
          private position: google.maps.LatLng;
          private content: HTMLElement;
          private pane: keyof google.maps.MapPanes = 'floatPane';

          constructor(position: google.maps.LatLng, content: HTMLElement) {
            super();
            this.position = position;
            this.content = content;
          }

          onAdd() {
            this.getPanes()![this.pane].appendChild(this.content);
            
            // Add click listener
            this.content.addEventListener('click', () => {
              if (isMounted) {
                setSelectedNode(node);
                map.panTo(this.position);
                map.setZoom(8);
              }
            });
          }

          draw() {
            const projection = this.getProjection();
            const point = projection.fromLatLngToDivPixel(this.position);
            
            if (point) {
              this.content.style.left = point.x - 20 + 'px';
              this.content.style.top = point.y - 20 + 'px';
              this.content.style.position = 'absolute';
            }
          }

          onRemove() {
            if (this.content.parentNode) {
              this.content.parentNode.removeChild(this.content);
            }
          }
        }

        const position = new google.maps.LatLng(lat, lng);
        const marker = new CustomMarker(position, markerElement);
        marker.setMap(map);
        markers.push(marker);

      });

      // Create curved airline routes for edges
      edgesData.forEach(edge => {
        const fromNode = nodesData.find(n => n.id === edge.from);
        const toNode = nodesData.find(n => n.id === edge.to);

        if (!fromNode || !toNode || !fromNode.latitude || !fromNode.longitude || !toNode.latitude || !toNode.longitude) {
          return;
        }

        const startLat = parseFloat(fromNode.latitude);
        const startLng = parseFloat(fromNode.longitude);
        const endLat = parseFloat(toNode.latitude);
        const endLng = parseFloat(toNode.longitude);

        if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
          return;
        }

        const start = new google.maps.LatLng(startLat, startLng);
        const end = new google.maps.LatLng(endLat, endLng);

        // Calculate curved path for airline route effect
        const curvePoints = calculateCurve(start, end, 0.3);

        const polyline = new google.maps.Polyline({
          path: curvePoints,
          geodesic: true,
          strokeColor: '#ff6b6b',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          icons: [{
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              strokeColor: '#ff6b6b'
            },
            offset: '100%',
            repeat: '100px'
          }]
        });

        polyline.setMap(map);
        polylines.push(polyline);

        // Add distance label at midpoint
        const midpoint = curvePoints[Math.floor(curvePoints.length / 2)];
        const distanceLabel = new google.maps.InfoWindow({
          content: `
            <div style="
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 8px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: bold;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.2);
            ">
              ${edge.distance}
            </div>
          `,
          position: midpoint,
          disableAutoPan: true
        });

        distanceLabel.open(map);
        infoWindows.push(distanceLabel);
      });

      // Fit bounds to show all markers
      if (nodesData.some(node => node.latitude && node.longitude)) {
        const bounds = new google.maps.LatLngBounds();
        nodesData.forEach(node => {
          if (node.latitude && node.longitude) {
            const lat = parseFloat(node.latitude);
            const lng = parseFloat(node.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              bounds.extend(new google.maps.LatLng(lat, lng));
            }
          }
        });
        map.fitBounds(bounds, 100);
      }

    } catch (err) {
      console.error('Error creating map visualization:', err);
      if (isMounted) {
        setError('Failed to create map visualization.');
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      // Clean up markers
      markers.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
      // Clean up polylines
      polylines.forEach(polyline => {
        polyline.setMap(null);
      });
      // Clean up info windows
      infoWindows.forEach(infoWindow => {
        infoWindow.close();
      });
    };
  }, [map, nodesData, edgesData]);

  // Calculate curved path for airline routes
  const calculateCurve = useCallback((start: google.maps.LatLng, end: google.maps.LatLng, curvature: number) => {
    const points = [];
    const numPoints = 50;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Calculate intermediate point with curve
      const lat = start.lat() + (end.lat() - start.lat()) * t;
      const lng = start.lng() + (end.lng() - start.lng()) * t;
      
      // Add curvature to make it arc
      const curve = Math.sin(Math.PI * t) * curvature;
      const curvedLat = lat + curve;
      
      points.push(new google.maps.LatLng(curvedLat, lng));
    }

    return points;
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNodes([]);
    } else {
      const filtered = nodesData.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.city && node.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.country && node.country.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNodes(filtered);
    }
  }, [searchTerm, nodesData]);

  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
    if (map && node.latitude && node.longitude) {
      const lat = parseFloat(node.latitude);
      const lng = parseFloat(node.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.panTo({ lat, lng });
        map.setZoom(10);
      }
    }
  }, [map]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSelectedNode(null);
  }, []);

  const resetView = useCallback(() => {
    if (map && nodesData.some(node => node.latitude && node.longitude)) {
      const bounds = new google.maps.LatLngBounds();
      nodesData.forEach(node => {
        if (node.latitude && node.longitude) {
          const lat = parseFloat(node.latitude);
          const lng = parseFloat(node.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend(new google.maps.LatLng(lat, lng));
          }
        }
      });
      
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 100);
        map.setTilt(is3DMode ? 45 : 0);
      }
    }
  }, [map, nodesData, is3DMode]);

  const toggle3DMode = useCallback(() => {
    if (map) {
      setIs3DMode(!is3DMode);
      map.setTilt(!is3DMode ? 45 : 0);
    }
  }, [map, is3DMode]);

  const zoomIn = useCallback(() => {
    if (map) {
      map.setZoom(map.getZoom()! + 1);
    }
  }, [map]);

  const zoomOut = useCallback(() => {
    if (map) {
      map.setZoom(map.getZoom()! - 1);
    }
  }, [map]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Map Loading Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!data || !data.success || nodesData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="text-gray-400 text-6xl mb-4">🌊</div>
          <h3 className="text-xl font-bold mb-2">No Ripple Data</h3>
          <p className="text-gray-300">
            {data?.message || 'No referral journey data available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'w-full h-full'}`}>
      {/* Header Controls */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users, cities, countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border-2 border-purple-400 focus:border-purple-500 focus:outline-none bg-gray-900 text-white shadow-2xl backdrop-blur-sm text-sm sm:text-base"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-3 bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-400">
          <Users size={16} className="sm:w-[18px] sm:h-[18px] text-purple-400" />
          <span className="text-xs sm:text-sm font-semibold text-white">{nodesData.length} Users</span>
          <span className="text-gray-500 mx-1 sm:mx-2">|</span>
          <Globe size={16} className="sm:w-[18px] sm:h-[18px] text-green-400" />
          <span className="text-xs sm:text-sm font-semibold text-green-400">{totalDistance}</span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={toggle3DMode}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-2xl transition-all text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2"
          >
            <Layers size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">{is3DMode ? '2D' : '3D'}</span>
            <span className="sm:hidden">{is3DMode ? '2D' : '3D'}</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-2xl transition-all"
          >
            {isFullscreen ? <Minimize2 size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Maximize2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-28 sm:top-24 right-3 sm:right-4 z-20 flex flex-col gap-2 sm:gap-3">
        <button
          onClick={zoomIn}
          className="bg-gray-900/80 hover:bg-gray-800 text-white p-2.5 sm:p-3 rounded-xl shadow-2xl transition-all border-2 border-purple-400 backdrop-blur-sm"
          title="Zoom in"
        >
          <ZoomIn size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-gray-900/80 hover:bg-gray-800 text-white p-2.5 sm:p-3 rounded-xl shadow-2xl transition-all border-2 border-purple-400 backdrop-blur-sm"
          title="Zoom out"
        >
          <ZoomOut size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={resetView}
          className="bg-gray-900/80 hover:bg-gray-800 text-white p-2.5 sm:p-3 rounded-xl shadow-2xl transition-all border-2 border-purple-400 backdrop-blur-sm"
          title="Reset view"
        >
          <Home size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Search Results */}
      {searchTerm && filteredNodes.length > 0 && (
        <div className="absolute top-28 sm:top-24 left-3 sm:left-4 z-20 bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-2xl p-3 sm:p-4 max-w-xs border-2 border-purple-400 max-h-64 overflow-y-auto">
          <h3 className="font-bold text-purple-400 mb-2">Search Results ({filteredNodes.length})</h3>
          {filteredNodes.map(node => (
            <button
              key={node.id}
              onClick={() => handleNodeSelect(node)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-900/50 flex items-center gap-3 transition-colors mb-2 last:mb-0"
            >
              <span className="text-2xl">{avatarIcons[node.avatar_id] || '👤'}</span>
              <div className="flex-1">
                <div className="font-medium text-white">{node.label}</div>
                <div className="text-xs text-gray-400">
                  {node.city && `${node.city}, `}{node.country}
                </div>
                <div className="text-xs text-yellow-400">
                  🔥 {typeof node.streak === 'object' ? node.streak.current_streak : (node.streak || 0)} streak
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />

      {/* Selected Node Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 border-2 border-purple-400 max-w-md mx-auto">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{avatarIcons[selectedNode.avatar_id] || '👤'}</span>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-white mb-1">{selectedNode.label}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                <span className="bg-yellow-600 px-3 py-1 rounded-full text-yellow-100">
                  🔥 {typeof selectedNode.streak === 'object' ? selectedNode.streak.current_streak : (selectedNode.streak || 0)} day streak
                </span>
              </div>
              
              <div className="space-y-2 p-3 bg-purple-900/50 rounded-lg mb-3">
                <div className="text-purple-300 font-medium">
                  📍 {selectedNode.city && `${selectedNode.city}, `}{selectedNode.state && `${selectedNode.state}, `}{selectedNode.country}
                </div>
                {stories[selectedNode.id] && (
                  <div className="text-gray-300 text-sm">
                    <div>📅 Joined: {new Date(stories[selectedNode.id].date).toLocaleDateString()}</div>
                    <div>🎯 {stories[selectedNode.id].action}</div>
                  </div>
                )}
              </div>

              {/* Referral Info */}
              {selectedNode.parent !== null && (
                <div className="text-sm text-gray-300">
                  <span>👤 Referred by: </span>
                  <button
                    onClick={() => {
                      const parent = nodesData.find(n => n.id === selectedNode.parent);
                      if (parent) handleNodeSelect(parent);
                    }}
                    className="text-purple-300 hover:text-purple-200 underline"
                  >
                    {nodesData.find(n => n.id === selectedNode.parent)?.label}
                  </button>
                </div>
              )}

              {/* Referrals */}
              {nodesData.filter(n => n.parent === selectedNode.id).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-sm font-medium text-purple-300 mb-2">
                    👥 Referred {nodesData.filter(n => n.parent === selectedNode.id).length} users
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ripple ID Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl px-4 py-2 border-2 border-purple-400">
        <div className="text-sm font-mono text-purple-300">
          🌊 {rippleId}
        </div>
      </div>
    </div>
  );
}