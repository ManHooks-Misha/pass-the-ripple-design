import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Globe, Users, TrendingUp, Loader2, Navigation, Zap, Heart, Share2, HelpCircle, User, UserPlus, ArrowRight, ArrowRightCircle, QrCode, Plus, Filter, Building2 } from "lucide-react";
import Seo from "@/components/Seo";
import { apiFetch } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { rippleTrackerTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";
import { useAuth } from "@/context/AuthContext";
import { UserAvatarOnly } from "@/components/UserIdentity";

// Google Maps components - we'll use dynamic import
let GoogleMap, LoadScript, Marker, InfoWindow, Polyline;

const getMapContainerStyle = () => {
  if (typeof window === 'undefined') {
    return { width: '100%', height: '500px' };
  }
  const width = window.innerWidth;
  if (width < 640) {
    return { width: '100%', height: '300px' };
  } else if (width < 768) {
    return { width: '100%', height: '400px' };
  } else if (width < 1024) {
    // iPad portrait and landscape
    return { width: '100%', height: '500px' };
  } else if (width < 1280) {
    return { width: '100%', height: '600px' };
  }
  return { width: '100%', height: '700px' };
};

const defaultCenter = {
  lat: 20,
  lng: 0
};

const RippleMapold = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [viewMode, setViewMode] = useState<"individual" | "grouped">("grouped");
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [highlightedConnection, setHighlightedConnection] = useState(null);
  const [userConnections, setUserConnections] = useState([]);
  const [mapStats, setMapStats] = useState({
    totalDistance: 0,
    peopleReached: 0,
    countries: 0,
    activeUsers: 0,
    userStats: {
      userReferrals: 0,
    },
  });
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(2);
  // Location filter state
  const [locationFilter, setLocationFilter] = useState({ country: "", state: "", city: "" });
  const [locationOptions, setLocationOptions] = useState({ countries: [], states: [], cities: [] });
  const [locationGroups, setLocationGroups] = useState([]);
  const [groupedUsers, setGroupedUsers] = useState([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const usersListRef = useRef(null);

  // Load Google Maps dynamically
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const googleMapsModule = await import('@react-google-maps/api');
        GoogleMap = googleMapsModule.GoogleMap;
        LoadScript = googleMapsModule.LoadScript;
        Marker = googleMapsModule.Marker;
        InfoWindow = googleMapsModule.InfoWindow;
        Polyline = googleMapsModule.Polyline;
        setIsGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        toast({
          title: "Error",
          description: "Failed to load map features",
          variant: "destructive"
        });
      }
    };

    loadGoogleMaps();
  }, []);

  // Fetch user map data
  const fetchUserData = async (filter = "all") => {
    try {
      setLoading(true);
      const url = `/user-map${filter !== "all" ? `?filter=${filter}` : ""}`;
      const response = await apiFetch(url, {
        method: "GET"
      }) as any;

      if (response.success) {
        const userData = response.data.users || [];

        // Sort users by network metrics (high to low)
        const sortedUsers = [...userData].sort((a, b) => {
          // Primary sort: Network size
          const networkDiff = (b.total_network || 0) - (a.total_network || 0);
          if (networkDiff !== 0) return networkDiff;

          // Secondary sort: Downline count
          const downlineDiff = (b.downline_count || 0) - (a.downline_count || 0);
          if (downlineDiff !== 0) return downlineDiff;

          // Tertiary sort: Total stories
          const storiesDiff = (b.total_stories || 0) - (a.total_stories || 0);
          if (storiesDiff !== 0) return storiesDiff;

          // Quaternary sort: Total likes
          return (b.total_likes || 0) - (a.total_likes || 0);
        });

        setUsers(sortedUsers);
        setMapStats(response.data.stats || {});
        setUserConnections(response.data.userConnections || []);
        setUserLocation(response.data.userLocation);

        // Set map center to user's location or first user (now sorted by network size)
        if (response.data.userLocation) {
          setMapCenter(response.data.userLocation);
          setMapZoom(8);
        } else if (sortedUsers.length > 0) {
          setMapCenter({
            lat: sortedUsers[0].latitude,
            lng: sortedUsers[0].longitude
          });
          setMapZoom(3);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load user map data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Unable to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData(selectedFilter);
  }, [selectedFilter]);

  // Fetch grouped location data
  const fetchGroupedData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (locationFilter.country) params.append('country', locationFilter.country);
      if (locationFilter.state) params.append('state', locationFilter.state);
      if (locationFilter.city) params.append('city', locationFilter.city);

      const url = `/user-map-grouped${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiFetch(url, { method: "GET" }) as any;

      if (response.success) {
        setLocationGroups(response.data.locations || []);
        setGroupedUsers(response.data.users || []);
        setLocationOptions(response.data.filterOptions || { countries: [], states: [], cities: [] });
        setMapStats(response.data.stats || {});

        // Set map center to first location group
        if (response.data.locations?.length > 0) {
          const firstLocation = response.data.locations[0];
          if (firstLocation.latitude && firstLocation.longitude) {
            setMapCenter({ lat: firstLocation.latitude, lng: firstLocation.longitude });
            setMapZoom(locationFilter.city ? 10 : locationFilter.state ? 7 : locationFilter.country ? 5 : 3);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching grouped data:", error);
      toast({
        title: "Error",
        description: "Unable to load location data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch grouped data when location filter changes
  useEffect(() => {
    if (viewMode === "grouped") {
      fetchGroupedData();
    }
  }, [locationFilter, viewMode]);

  // Handle location filter changes
  const handleCountryChange = (value: string) => {
    setLocationFilter({ country: value === "all" ? "" : value, state: "", city: "" });
  };

  const handleStateChange = (value: string) => {
    setLocationFilter({ ...locationFilter, state: value === "all" ? "" : value, city: "" });
  };

  const handleCityChange = (value: string) => {
    setLocationFilter({ ...locationFilter, city: value === "all" ? "" : value });
  };

  const clearLocationFilters = () => {
    setLocationFilter({ country: "", state: "", city: "" });
  };

  // Handle filter change
  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setSelectedUser(null);
  };

  // Get user badge color based on age group or status
  const getUserBadgeConfig = (userData) => {
    const ageGroup = userData.age_group?.toLowerCase();
    const status = userData.account_status?.toLowerCase();

    if (status === 'active') {
      return { color: '#10B981', bgColor: 'bg-green-500', label: 'Active' };
    }
    if (status === 'pending') {
      return { color: '#F59E0B', bgColor: 'bg-orange-500', label: 'Pending' };
    }

    // Age group based colors
    const configs = {
      'child': { color: '#3B82F6', bgColor: 'bg-blue-500', label: 'Child' },
      'teen': { color: '#8B5CF6', bgColor: 'bg-purple-500', label: 'Teen' },
      'adult': { color: '#10B981', bgColor: 'bg-green-500', label: 'Adult' },
      'senior': { color: '#F59E0B', bgColor: 'bg-orange-500', label: 'Senior' }
    };

    return configs[ageGroup] || { color: '#6B7280', bgColor: 'bg-gray-500', label: 'User' };
  };

  // Safe custom marker icon creation
  const createCustomIcon = (userData, isCurrentUser = false) => {
    const config = getUserBadgeConfig(userData);

    // Create SVG without emojis to avoid encoding issues
    const svgString = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${config.color}" stroke="${isCurrentUser ? '#FF6B6B' : '#ffffff'}" stroke-width="3"/>
        <circle cx="20" cy="16" r="6" fill="white"/>
        <path d="M14 26 L20 32 L26 26" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `;

    // Use encodeURIComponent to safely encode the SVG
    const encodedSvg = encodeURIComponent(svgString);

    // Check if google.maps is available
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return {
        url: `data:image/svg+xml;utf8,${encodedSvg}`,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      };
    }

    // Return a fallback icon if google.maps is not available
    return null;
  };

  // Handle map load
  const onMapLoad = (map) => {
    mapRef.current = map;
    setMapLoading(false);
  };

  // Fit map to users
  const fitMapToUsers = () => {
    if (mapRef.current && users.length > 0 && window.google && window.google.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      users.forEach(user => {
        bounds.extend({ lat: user.latitude, lng: user.longitude });
      });
      mapRef.current.fitBounds(bounds);
    }
  };

  // Share user profile
  const shareUserProfile = (userData) => {
    if (navigator.share) {
      navigator.share({
        title: `${userData.nickname || userData.full_name}'s Ripple Profile`,
        text: `Check out ${userData.nickname || userData.full_name}'s ripple journey!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${userData.nickname || userData.full_name}'s Ripple Profile`);
      toast({
        title: "Copied!",
        description: "Profile info copied to clipboard",
      });
    }
  };

  const rippleId = user?.ripple_id || "";
  const hasRippleId = Boolean(user?.ripple_id);
  const referralCount = mapStats.userStats?.userReferrals || 0;

  // Helper function to get profile route based on user role
  const getProfileRoute = () => {
    if (!user) return '/ripple-card';
    return user.role === 'admin' ? '/admin/ripple-card' : user.role === 'teacher' ? '/teacher/ripple-card' : '/ripple-card';
  };

  const handleCreateRippleCard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(getProfileRoute());
  };

  const handleShareRippleId = async () => {
    if (!hasRippleId) {
      toast({
        title: "No Ripple ID",
        description: "Create your Ripple Card first to get your unique ID.",
        variant: "destructive"
      });
      return;
    }

    const shareText = `Join my Ripple kindness network! Use my Ripple ID: ${rippleId} when signing up at ${window.location.origin}`;

    // Try native share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join My Ripple Network",
          text: shareText,
          url: window.location.origin,
        });
        toast({
          title: "✓ Shared Successfully!",
          description: "Thanks for spreading kindness!",
        });
        return;
      } catch (error) {
        // User cancelled share or error occurred, fall back to clipboard
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(rippleId);
      toast({
        title: "✓ Copied!",
        description: `Ripple ID "${rippleId}" copied to clipboard. Share it with friends!`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try manually: " + rippleId,
        variant: "destructive"
      });
    }
  };

  const handleShowRippleQr = () => {
    if (!hasRippleId) {
      toast({
        title: "No Ripple ID",
        description: "Create your Ripple Card first to generate your QR code.",
        variant: "destructive"
      });
      return;
    }

    navigate(getProfileRoute());
  };

  const rippleGuideSteps = [
    {
      id: "1",
      title: hasRippleId ? "Ripple Card Ready" : "Create Your Ripple Card",
      description: hasRippleId
        ? `Your Ripple ID ${rippleId} is live. Keep it handy when you meet new members.`
        : "Set up your card to unlock a unique Ripple ID + QR code for invites.",
      icon: QrCode,
      primaryAction: !hasRippleId && user ? {
        label: "Create Card",
        onClick: handleCreateRippleCard,
      } : null,
      badge: hasRippleId ? `ID: ${rippleId}` : "Not created",
    },
    {
      id: "2",
      title: "Invite With ID or QR",
      description: hasRippleId
        ? "Copy your ID, flash your QR, or tap Share so friends can sign up in seconds."
        : "Once your card is ready, quick actions will appear here for instant sharing.",
      icon: Share2,
      secondaryActions: hasRippleId ? [
        { label: "Copy ID", onClick: handleShareRippleId },
        { label: "Show QR", onClick: handleShowRippleQr },
      ] : [],
    },
    {
      id: "3",
      title: "Add Your Downline",
      description: "Ask friends to type your Ripple ID while joining so they enter your chain.",
      icon: UserPlus,
      statLabel: referralCount > 0 ? "Active referrals" : "Ready to start",
      statValue: referralCount,
      showStat: true,
    },
    {
      id: "4",
      title: "Watch The Chain Grow",
      description: "Each new member unlocks more reach. Track stories, likes, and locations on the map.",
      icon: TrendingUp,
      statLabel: (mapStats.peopleReached || 0) > 0 ? "People reached" : "Building your network",
      statValue: mapStats.peopleReached || 0,
      showStat: true,
    },
  ];

  // Calculate user connection path
  const getUserConnectionPath = () => {
    if (userConnections.length < 2) return [];

    return userConnections.map(connection => ({
      lat: connection.latitude,
      lng: connection.longitude
    }));
  };

  // Generate referral connection lines - creates lines from referrer to referrals
  const getReferralConnections = useMemo(() => {
    const connections = [];

    // Create a map of users by ripple_id for quick lookup
    const userMap = new Map();
    users.forEach(user => {
      if (user.ripple_id) {
        userMap.set(user.ripple_id, user);
      }
    });

    // For each user, if they have a referrer, create a connection line
    users.forEach(user => {
      if (user.referred_by_ripple_id) {
        const referrer = userMap.get(user.referred_by_ripple_id);
        if (referrer && referrer.latitude && referrer.longitude && user.latitude && user.longitude) {
          connections.push({
            from: { lat: referrer.latitude, lng: referrer.longitude },
            to: { lat: user.latitude, lng: user.longitude },
            referrerName: referrer.nickname || referrer.full_name,
            refereeName: user.nickname || user.full_name,
            level: user.referral_level || 1, // Use level to vary colors
          });
        }
      }
    });

    return connections;
  }, [users]);

  // Get color for referral line based on level
  const getReferralLineColor = (level) => {
    const colors = [
      '#10B981', // green - level 1
      '#3B82F6', // blue - level 2
      '#8B5CF6', // purple - level 3
      '#F59E0B', // amber - level 4
      '#EF4444', // red - level 5+
    ];
    return colors[Math.min(level - 1, colors.length - 1)] || colors[0];
  };

  // Get referral chain for a user (upline chain)
  const getUserReferralChain = (userData) => {
    const chain = [userData];
    let currentUserId = userData.referred_by_ripple_id;

    // Create a map for quick lookup
    const userMap = new Map();
    users.forEach(u => {
      if (u.ripple_id) {
        userMap.set(u.ripple_id, u);
      }
    });

    // Follow the chain upward
    while (currentUserId) {
      const referrer = userMap.get(currentUserId);
      if (referrer) {
        chain.unshift(referrer); // Add to beginning
        currentUserId = referrer.referred_by_ripple_id;
      } else {
        break;
      }
    }

    return chain;
  };

  // Get downline connections for a user
  const getUserDownlineConnections = (userData) => {
    if (!userData.ripple_id) return [];

    return getReferralConnections.filter(conn => {
      // Find connections where this user is the referrer
      const referrer = users.find(u =>
        u.latitude === conn.from.lat &&
        u.longitude === conn.from.lng
      );
      return referrer && referrer.ripple_id === userData.ripple_id;
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Safe animation getter
  const getMarkerAnimation = () => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return window.google.maps.Animation.DROP;
    }
    return undefined;
  };

  // Check if only current user is present
  const isOnlyCurrentUser = useMemo(() => {
    if (!user || !user.id || users.length === 0 || loading) return false;

    // Check if all users belong to the current user
    if (userConnections.length > 0 && userConnections.length === users.length) {
      return true;
    }

    // Check if all users have isCurrentUser flag or belong to current user
    const allUsersAreCurrentUser = users.every(userData => {
      return userData.isCurrentUser === true || userData.id === user.id;
    });

    return allUsersAreCurrentUser;
  }, [users, userConnections, user, loading]);

  // Generate dynamic tutorial steps based on whether only current user is present
  const dynamicTutorialSteps = useMemo(() => {
    const baseSteps = [...rippleTrackerTutorialSteps];

    // If only current user is present, replace the final step with encouragement
    if (isOnlyCurrentUser && baseSteps.length > 0 && !loading) {
      const finalStepIndex = baseSteps.length - 1;
      baseSteps[finalStepIndex] = {
        ...baseSteps[finalStepIndex],
        title: "Create Your Ripple Card! 💳",
        content: "Great start! Right now, only your profile is showing. Create and share your Ripple Card with friends and family! When they register using your Ripple ID, you'll both earn awesome points! The more people join your ripple network, the more your kindness spreads! 🌟",
        placement: "center",
        disableBeacon: true,
      };
    }

    return baseSteps;
  }, [isOnlyCurrentUser, loading]);

  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "ripple_tracker_tutorial_completed",
    steps: dynamicTutorialSteps,
  });

  // Scroll to user in list when selected on map
  useEffect(() => {
    if (selectedUser && usersListRef.current) {
      const userElement = document.getElementById(`user-${selectedUser.id}`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <Seo
        title="Ripple Network Map — Ripple Quest"
        description="Explore the network of kindness spreading around the world."
        canonical={`${window.location.origin}/user-map`}
      />

      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="ripple_tracker_tutorial_completed"
      />

      <main className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Kindness Network
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with people spreading kindness across the globe
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={startTutorial}
              className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all shadow-md flex items-center gap-2"
              title="Take a tour of this page"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Creative Stats Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" data-tutorial-target="ripple-stats">
                {/* Total Distance - Large Feature Card */}
                <Card className="lg:col-span-1 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 border-0 shadow-2xl overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  <CardContent className="p-5 sm:p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Navigation className="h-7 w-7 text-white" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider">
                        Kindness Traveled
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl sm:text-5xl font-black text-white">
                          {mapStats.totalDistance?.toLocaleString() || 0}
                        </h3>
                        <span className="text-lg font-bold text-white/80">miles</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Your kindness has traveled around the world, creating ripples of positive impact
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* People Connected & Countries - Side by Side */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* People Connected */}
                  <Card className="bg-gradient-to-br from-white to-green-50/50 border-2 border-green-200/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-10 -mt-10" />
                    <CardContent className="p-5 sm:p-6 relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                          People Connected
                        </p>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {mapStats.peopleReached || 0}
                          </h3>
                          <span className="text-sm font-bold text-green-600">ambassadors</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min((mapStats.peopleReached || 0) / 100 * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-green-600">
                            {Math.min((mapStats.peopleReached || 0), 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Countries */}
                  <Card className="bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-10 -mt-10" />
                    <CardContent className="p-5 sm:p-6 relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                          Countries Reached
                        </p>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {mapStats.countries || 0}
                          </h3>
                          <span className="text-sm font-bold text-purple-600">nations</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {[...Array(Math.min(mapStats.countries || 0, 10))].map((_, i) => (
                            <div
                              key={i}
                              className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md"
                              style={{
                                animation: `fadeIn 0.3s ease-in-out ${i * 0.1}s both`
                              }}
                            >
                              <MapPin className="h-3 w-3 text-white" />
                            </div>
                          ))}
                          {(mapStats.countries || 0) > 10 && (
                            <div className="h-6 px-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                              <span className="text-xs font-bold text-white">+{(mapStats.countries || 0) - 10}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <style>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: scale(0);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
              `}</style>

              {/* Ripple Growth Guide */}
              <Card className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 backdrop-blur-sm border-primary/20 shadow-xl overflow-hidden">
                <CardHeader className="p-5 sm:p-7 bg-gradient-to-r from-primary/5 to-cyan-500/5 border-b border-primary/10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs uppercase tracking-wider text-primary font-bold">
                          Build Your Ripple Network
                        </p>
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                        Grow Your Kindness Network
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600 max-w-2xl">
                        Follow these simple steps to create your Ripple Card, invite friends and family, and watch your kindness network expand across the globe.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-primary border-primary/30 text-xs px-3 py-1 shadow-sm">
                        {hasRippleId ? (
                          <div className="flex items-center gap-1.5">
                            <QrCode className="h-3 w-3" />
                            <span className="font-mono font-semibold">{rippleId}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Plus className="h-3 w-3" />
                            <span>No ID yet</span>
                          </div>
                        )}
                      </Badge>
                      <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 text-xs px-3 py-1 shadow-sm">
                        <UserPlus className="h-3 w-3 mr-1" />
                        {referralCount} {referralCount === 1 ? 'Referral' : 'Referrals'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-7">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <div className="relative pl-8 sm:pl-10">
                        <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-cyan-400 to-transparent rounded-full opacity-30" />
                        <div className="space-y-5">
                          {rippleGuideSteps.map((step, index) => {
                            const isCompleted = step.id === "1" && hasRippleId;
                            return (
                              <div
                                key={step.id}
                                className={`relative rounded-2xl border-2 ${isCompleted
                                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md'
                                  : 'border-gray-100 bg-white/80 hover:border-primary/20'
                                  } shadow-sm p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group`}
                              >
                                <span className={`absolute -left-7 sm:-left-8 top-6 h-10 w-10 rounded-full ${isCompleted
                                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white border-2 border-green-300'
                                  : 'bg-gradient-to-br from-primary to-cyan-500 text-white border-2 border-white'
                                  } flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                                  {isCompleted ? '✓' : index + 1}
                                </span>
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex items-start gap-4 flex-1">
                                      <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCompleted
                                        ? 'bg-gradient-to-br from-green-100 to-green-50'
                                        : 'bg-gradient-to-br from-primary/10 to-cyan-500/5'
                                        }`}>
                                        <step.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${isCompleted ? 'text-green-600' : 'text-primary'
                                          }`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
                                          {step.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                          {step.description}
                                        </p>
                                      </div>
                                    </div>
                                    {step.badge && (
                                      <Badge className={`text-xs px-3 py-1 font-semibold whitespace-nowrap ${isCompleted
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-primary/10 text-primary border-primary/20'
                                        }`}>
                                        {step.badge}
                                      </Badge>
                                    )}
                                  </div>

                                  {(step.primaryAction || (step.secondaryActions && step.secondaryActions.length > 0)) && (
                                    <div className="flex flex-wrap gap-2">
                                      {step.primaryAction && (
                                        <Button
                                          size="sm"
                                          className="text-xs h-9 px-4 bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-500 shadow-sm"
                                          onClick={step.primaryAction.onClick}
                                        >
                                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                                          {step.primaryAction.label}
                                        </Button>
                                      )}
                                      {step.secondaryActions && step.secondaryActions.length > 0 && step.secondaryActions.map((action, idx) => (
                                        <Button
                                          key={action.label}
                                          size="sm"
                                          variant="outline"
                                          className="text-xs h-9 px-4 hover:bg-primary/5 hover:border-primary/30"
                                          onClick={action.onClick}
                                        >
                                          {idx === 0 ? (
                                            <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                          ) : (
                                            <QrCode className="h-3.5 w-3.5 mr-1.5" />
                                          )}
                                          {action.label}
                                        </Button>
                                      ))}
                                    </div>
                                  )}

                                  {step.showStat && (
                                    <div className={`rounded-xl border p-4 flex items-center justify-between ${step.statValue > 0
                                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50/50 border-blue-200'
                                      : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                                      }`}>
                                      <div className="flex items-center gap-2">
                                        {step.statValue > 0 ? (
                                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                                            <TrendingUp className="h-4 w-4 text-white" />
                                          </div>
                                        ) : (
                                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <UserPlus className="h-4 w-4 text-gray-400" />
                                          </div>
                                        )}
                                        <span className={`text-sm font-semibold ${step.statValue > 0 ? 'text-gray-700' : 'text-gray-500'
                                          }`}>{step.statLabel}</span>
                                      </div>
                                      <span className={`text-2xl font-bold ${step.statValue > 0
                                        ? 'bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent'
                                        : 'text-gray-400'
                                        }`}>
                                        {step.statValue}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-cyan-50 via-blue-50/50 to-white p-5 sm:p-6 shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ArrowRightCircle className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-primary font-bold">
                            Network Growth
                          </p>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Your Ripple Path
                        </h4>
                        <p className="text-xs text-gray-600 mb-4">
                          Track how your network expands through levels
                        </p>
                        <div className="flex items-center justify-between gap-1.5 mb-5 overflow-x-auto pb-2">
                          {[1, 2, 3, 4].map((level) => (
                            <div key={level} className="flex items-center gap-1.5 flex-shrink-0">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-md ${level <= 2
                                ? 'bg-gradient-to-br from-primary to-cyan-500 text-white'
                                : 'bg-white border-2 border-gray-200 text-gray-400'
                                }`}>
                                L{level}
                              </div>
                              {level < 4 && <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="rounded-xl bg-white border border-primary/20 p-4 text-center shadow-sm">
                            <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                            <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Direct Referrals</p>
                            <p className="text-2xl font-bold text-primary">{referralCount}</p>
                          </div>
                          <div className="rounded-xl bg-white border border-cyan-200 p-4 text-center shadow-sm">
                            <Globe className="h-5 w-5 text-cyan-600 mx-auto mb-2" />
                            <p className="text-[10px] uppercase text-gray-500 font-semibold mb-1">Total Reach</p>
                            <p className="text-2xl font-bold text-cyan-600">{mapStats.peopleReached || 0}</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            <strong className="text-primary">Impact:</strong> Every person you invite creates a ripple effect, extending your network to new cities and countries worldwide.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-br from-primary via-cyan-500 to-blue-600 text-white p-6 shadow-xl space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5" />
                            <h4 className="text-xl font-bold">Ready to Grow?</h4>
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed mb-4">
                            Share your Ripple Card regularly to keep your kindness momentum alive and inspire more people to join your network.
                          </p>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="h-10 text-white hover:bg-white/95 font-semibold shadow-md"
                              onClick={hasRippleId ? handleShareRippleId : handleCreateRippleCard}
                            >
                              {hasRippleId ? (
                                <>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Copy Ripple ID
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Ripple Card
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-10 bg-white/10 text-white border-white/40 hover:bg-white/20 hover:border-white/60 backdrop-blur-sm"
                              onClick={() =>
                                toast({
                                  title: "💡 Pro Network Tips",
                                  description: "Share a personal kindness story with every invite to create deeper connections and boost engagement!",
                                })
                              }
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Growth Tips
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="w-full overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                    <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:max-w-lg grid-cols-3 gap-1 sm:gap-2">
                      <TabsTrigger value="map" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0 whitespace-nowrap">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Network Map</span>
                        <span className="sm:hidden">Map</span>
                      </TabsTrigger>
                      <TabsTrigger value="locations" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0 whitespace-nowrap">
                        <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">By Location</span>
                        <span className="sm:hidden">Locations</span>
                      </TabsTrigger>
                      <TabsTrigger value="profiles" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0 whitespace-nowrap">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">User Profiles</span>
                        <span className="sm:hidden">Profiles</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Location Filters - Show on locations tab */}
                {activeTab === "locations" && (
                  <Card className="bg-gradient-to-br from-white to-green-50/30 border-green-200/50 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-700">Filter by Location:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1">
                          <Select value={locationFilter.country || "all"} onValueChange={handleCountryChange}>
                            <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs sm:text-sm">
                              <SelectValue placeholder="All Countries" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Countries</SelectItem>
                              {locationOptions.countries.map((country: string) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={locationFilter.state || "all"}
                            onValueChange={handleStateChange}
                            disabled={!locationFilter.country}
                          >
                            <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs sm:text-sm">
                              <SelectValue placeholder="All States" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All States</SelectItem>
                              {locationOptions.states.map((state: string) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={locationFilter.city || "all"}
                            onValueChange={handleCityChange}
                            disabled={!locationFilter.state}
                          >
                            <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs sm:text-sm">
                              <SelectValue placeholder="All Cities" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Cities</SelectItem>
                              {locationOptions.cities.map((city: string) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {(locationFilter.country || locationFilter.state || locationFilter.city) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearLocationFilters}
                              className="h-9 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <TabsContent value="map" className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Map Section */}
                    <div className="lg:col-span-2">
                      <Card className="h-full flex flex-col bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-xl overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/30 border-b border-blue-100">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                  <Globe className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Global Kindness Network
                                  </CardTitle>
                                  <CardDescription className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                    {users.length} {users.length === 1 ? 'ambassador' : 'ambassadors'} spreading kindness worldwide
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={fitMapToUsers}
                                disabled={mapLoading || !isGoogleMapsLoaded}
                                className="text-xs sm:text-sm px-3 sm:px-4 h-9 flex-1 sm:flex-initial border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Center View</span>
                                <span className="sm:hidden">Center</span>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col">
                          <div className="relative flex-1" data-tutorial-target="ripple-map">
                            {!isGoogleMapsLoaded ? (
                              <div className="h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center">
                                <div className="text-center">
                                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4" />
                                  <p className="text-xs sm:text-sm text-muted-foreground">Loading map...</p>
                                </div>
                              </div>
                            ) : (
                              <LoadScript
                                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                loadingElement={
                                  <div className="h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
                                  </div>
                                }
                              >
                                <GoogleMap
                                  mapContainerStyle={getMapContainerStyle()}
                                  center={mapCenter}
                                  zoom={mapZoom}
                                  onLoad={onMapLoad}
                                  options={{
                                    styles: [
                                      {
                                        featureType: "poi",
                                        elementType: "labels",
                                        stylers: [{ visibility: "off" }]
                                      }
                                    ],
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    fullscreenControl: true,
                                  }}
                                >
                                  {/* Referral Connection Lines */}
                                  {window.google && getReferralConnections.map((connection, index) => {
                                    // Check if this connection is part of selected user's network
                                    const isHighlighted = selectedUser && (
                                      (connection.from.lat === selectedUser.latitude && connection.from.lng === selectedUser.longitude) ||
                                      (connection.to.lat === selectedUser.latitude && connection.to.lng === selectedUser.longitude)
                                    );

                                    return (
                                      <Polyline
                                        key={`referral-${index}`}
                                        path={[connection.from, connection.to]}
                                        options={{
                                          strokeColor: isHighlighted ? '#FFD700' : getReferralLineColor(connection.level),
                                          strokeOpacity: isHighlighted ? 1 : 0.7,
                                          strokeWeight: isHighlighted ? 5 : 3,
                                          icons: [{
                                            icon: {
                                              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                              scale: isHighlighted ? 4 : 3,
                                              strokeColor: isHighlighted ? '#FFD700' : getReferralLineColor(connection.level),
                                              strokeOpacity: 0.9,
                                              strokeWeight: 2,
                                              fillColor: isHighlighted ? '#FFD700' : getReferralLineColor(connection.level),
                                              fillOpacity: isHighlighted ? 1 : 0.8,
                                            },
                                            offset: '50%',
                                          }],
                                          geodesic: true,
                                          clickable: true,
                                          zIndex: isHighlighted ? 1000 : 100,
                                        }}
                                        onClick={() => {
                                          // Find the users connected by this line
                                          const toUser = users.find(u =>
                                            u.latitude === connection.to.lat &&
                                            u.longitude === connection.to.lng
                                          );
                                          if (toUser) {
                                            setSelectedUser(toUser);
                                            setMapCenter({ lat: toUser.latitude, lng: toUser.longitude });
                                            setMapZoom(8);
                                            toast({
                                              title: "Referral Connection",
                                              description: `${connection.referrerName} → ${connection.refereeName}`,
                                            });
                                          }
                                        }}
                                        onMouseOver={(e) => {
                                          setHighlightedConnection(index);
                                        }}
                                        onMouseOut={() => {
                                          setHighlightedConnection(null);
                                        }}
                                      />
                                    );
                                  })}

                                  {/* User markers */}
                                  {users.map((userData) => {
                                    const icon = createCustomIcon(userData, userData.isCurrentUser);
                                    return (
                                      <Marker
                                        key={userData.id}
                                        position={{ lat: userData.latitude, lng: userData.longitude }}
                                        icon={icon || undefined}
                                        onClick={() => setSelectedUser(userData)}
                                        animation={getMarkerAnimation()}
                                      />
                                    );
                                  })}

                                  {/* Selected user info window */}
                                  {selectedUser && window.google && (
                                    <InfoWindow
                                      position={{
                                        lat: selectedUser.latitude,
                                        lng: selectedUser.longitude
                                      }}
                                      onCloseClick={() => setSelectedUser(null)}
                                    >
                                      <div className="max-w-sm p-2">
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                            <UserAvatarOnly
                                              avatar_id={selectedUser.avatar_id}
                                              profile_image_path={selectedUser.profile_image_path}
                                              nickname={selectedUser.nickname}
                                              size="w-12 h-12"
                                            />
                                            <div>
                                              <h3 className="font-semibold text-lg">
                                                {selectedUser.nickname || selectedUser.full_name}
                                              </h3>
                                              <p className="text-sm text-muted-foreground">
                                                {selectedUser.city}, {selectedUser.country}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex gap-2 flex-wrap">
                                            <Badge className={getUserBadgeConfig(selectedUser).bgColor}>
                                              {getUserBadgeConfig(selectedUser).label}
                                            </Badge>
                                            {selectedUser.ripple_id && (
                                              <Badge variant="outline">
                                                ID: {selectedUser.ripple_id}
                                              </Badge>
                                            )}
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                            <div>
                                              <p className="font-medium">Stories</p>
                                              <p className="text-muted-foreground">{selectedUser.total_stories || 0}</p>
                                            </div>
                                            <div>
                                              <p className="font-medium">Likes</p>
                                              <p className="text-muted-foreground">{selectedUser.total_likes || 0}</p>
                                            </div>
                                            <div>
                                              <p className="font-medium">Downline</p>
                                              <p className="text-green-600 font-semibold">{selectedUser.downline_count || 0}</p>
                                            </div>
                                            <div>
                                              <p className="font-medium">Network</p>
                                              <p className="text-amber-600 font-semibold">{selectedUser.total_network || 0}</p>
                                            </div>
                                          </div>

                                          {selectedUser.referred_by_ripple_id && (
                                            <div className="mb-2 p-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                                              <p className="text-[10px] text-indigo-600 font-semibold uppercase">Referred By</p>
                                              <p className="text-xs font-bold text-indigo-700 font-mono">#{selectedUser.referred_by_ripple_id}</p>
                                            </div>
                                          )}

                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                              <p className="font-medium">Joined</p>
                                              <p className="text-muted-foreground">{formatDate(selectedUser.created_at)}</p>
                                            </div>
                                            <div>
                                              <p className="font-medium">Status</p>
                                              <p className="text-muted-foreground capitalize">{selectedUser.account_status}</p>
                                            </div>
                                          </div>

                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => shareUserProfile(selectedUser)}
                                            >
                                              <Share2 className="h-4 w-4 mr-1" />
                                              Share
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={() => setSelectedUser(null)}
                                            >
                                              Close
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </InfoWindow>
                                  )}
                                </GoogleMap>
                              </LoadScript>
                            )}

                            {/* Referral Network Legend */}
                            {getReferralConnections.length > 0 && (
                              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-2xl border-2 border-primary/20 max-w-[160px] sm:max-w-none">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                                    <TrendingUp className="h-3 w-3 text-white" />
                                  </div>
                                  <h4 className="font-bold text-xs sm:text-sm text-gray-900">Referral Network</h4>
                                </div>
                                <div className="space-y-1.5 text-[10px] sm:text-xs">
                                  {[
                                    { level: 1, label: 'Direct', color: '#10B981' },
                                    { level: 2, label: 'Level 2', color: '#3B82F6' },
                                    { level: 3, label: 'Level 3', color: '#8B5CF6' },
                                    { level: 4, label: 'Level 4', color: '#F59E0B' },
                                    { level: 5, label: 'Level 5+', color: '#EF4444' },
                                  ].map(({ level, label, color }) => {
                                    const hasLevel = getReferralConnections.some(conn => conn.level === level || (level === 5 && conn.level >= 5));
                                    if (!hasLevel && level > 2) return null;
                                    return (
                                      <div key={level} className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-1">
                                          <div
                                            className="w-4 h-0.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: color }}
                                          />
                                          <div
                                            className="w-1.5 h-1.5 rounded-full border-2 flex-shrink-0"
                                            style={{ borderColor: color, backgroundColor: color }}
                                          />
                                        </div>
                                        <span className="text-gray-700 font-medium truncate">{label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-[9px] sm:text-[10px] text-gray-500 leading-tight">
                                    <strong className="text-primary">{getReferralConnections.length}</strong> referral connections
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Users List Section */}
                    <div className="lg:col-span-1">
                      <Card className="h-[520px] sm:h-[620px] md:h-[660px] lg:h-[720px] flex flex-col bg-gradient-to-br from-white to-purple-50/20 border-purple-200/50 shadow-xl overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-r from-purple-50/40 to-pink-50/30 border-b border-purple-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                                Community Members
                                <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 font-semibold">
                                  {users.length}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                                Sorted by Network Size • Click to view on map
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                          {/* Users List */}
                          <div
                            ref={usersListRef}
                            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent min-h-0"
                          >
                            <div className="space-y-2 p-4">
                              {users.length === 0 ? (
                                <div className="text-center py-12">
                                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-10 w-10 text-purple-400" />
                                  </div>
                                  <p className="text-base font-semibold text-gray-700 mb-2">No Members Yet</p>
                                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                    {user ? "Be the first to share your Ripple Card and grow the kindness network!" : "Login to discover community members"}
                                  </p>
                                </div>
                              ) : (
                                users.map((userData, index) => {
                                  // Determine rank badge for top 3
                                  const getRankBadge = () => {
                                    if (index === 0) return { emoji: '👑', color: 'from-yellow-400 to-amber-500', text: 'Top Network' };
                                    if (index === 1) return { emoji: '🥈', color: 'from-gray-300 to-gray-400', text: '2nd Network' };
                                    if (index === 2) return { emoji: '🥉', color: 'from-orange-400 to-amber-600', text: '3rd Network' };
                                    return null;
                                  };
                                  const rankBadge = getRankBadge();

                                  return (
                                    <div
                                      key={userData.id}
                                      id={`user-${userData.id}`}
                                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${selectedUser?.id === userData.id
                                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg scale-[1.02]'
                                        : 'bg-white/80 border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md'
                                        }`}
                                      onClick={() => {
                                        setSelectedUser(userData);
                                        setMapCenter({ lat: userData.latitude, lng: userData.longitude });
                                        setMapZoom(8);
                                      }}
                                    >
                                      {/* Rank Badge for Top 3 */}
                                      {rankBadge && (
                                        <div className="absolute -top-2 -right-2 z-10">
                                          <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${rankBadge.color} border-2 border-white shadow-lg flex items-center justify-center text-sm`}>
                                            {rankBadge.emoji}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          <UserAvatarOnly
                                            avatar_id={userData.avatar_id}
                                            profile_image_path={userData.profile_image_path}
                                            nickname={userData.nickname}
                                            size="w-12 h-12"
                                          />
                                          {selectedUser?.id === userData.id && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center">
                                              <MapPin className="h-2.5 w-2.5 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1.5">
                                            <h4 className="font-bold text-sm truncate text-gray-900">
                                              {userData.nickname || userData.full_name}
                                            </h4>
                                            {userData.isCurrentUser && (
                                              <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                                You
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                                              <Globe className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-blue-600 font-semibold uppercase">Stories</p>
                                                <p className="text-sm font-bold text-blue-700 leading-none">{userData.total_stories || 0}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                                              <Heart className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-red-600 font-semibold uppercase">Likes</p>
                                                <p className="text-sm font-bold text-red-700 leading-none">{userData.total_likes || 0}</p>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Referral Network Stats */}
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                              <UserPlus className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-green-600 font-semibold uppercase">Downline</p>
                                                <p className="text-sm font-bold text-green-700 leading-none">{userData.downline_count || 0}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
                                              <TrendingUp className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[9px] text-amber-600 font-semibold uppercase">Network</p>
                                                <p className="text-sm font-bold text-amber-700 leading-none">{userData.total_network || 0}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <MapPin className="h-3 w-3 text-purple-400 flex-shrink-0" />
                                            <span className="truncate">{userData.city}</span>
                                          </div>
                                          {userData.ripple_id && (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200 font-mono">
                                              #{userData.ripple_id}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      {/* Upline/Referrer Information */}
                                      {userData.referred_by_ripple_id && (
                                        <div className="mt-2 p-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                                          <div className="flex items-center gap-1.5">
                                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                                              <User className="h-2.5 w-2.5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-[9px] text-indigo-600 font-semibold uppercase leading-tight">Upline</p>
                                              <p className="text-xs font-bold text-indigo-700 font-mono">#{userData.referred_by_ripple_id}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Referral Indicator */}
                                      {user && userData.referred_by_ripple_id === user.ripple_id && (
                                        <div className="mt-2.5 pt-2.5 border-t border-purple-100">
                                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-100 hover:to-emerald-100 text-xs border border-green-200">
                                            <UserPlus className="h-3 w-3 mr-1" />
                                            Your Referral
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Quick Actions Footer */}
                          {user && (
                            <div className="border-t border-blue-100 p-4 bg-blue-50/60">
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
                                  onClick={handleShareRippleId}
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share ID
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-xs h-9 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => navigate(getProfileRoute())}
                                >
                                  <User className="h-3 w-3 mr-1" />
                                  My Profile
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Locations Tab Content */}
                <TabsContent value="locations" className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Location Groups */}
                    <div className="lg:col-span-2">
                      <Card className="bg-gradient-to-br from-white to-green-50/30 border-green-200/50 shadow-xl overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/30 border-b border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Users by Location
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                {locationGroups.length} {locationGroups.length === 1 ? 'location' : 'locations'} with active users
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          {loading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            </div>
                          ) : locationGroups.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-10 w-10 text-green-400" />
                              </div>
                              <p className="text-base font-semibold text-gray-700 mb-2">No Locations Found</p>
                              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                Try adjusting your filters or check back later as more users join.
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                              {locationGroups.map((location: any, index: number) => (
                                <div
                                  key={`${location.country}-${location.state}-${location.city}-${index}`}
                                  className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                  onClick={() => {
                                    if (location.city) {
                                      setLocationFilter({ country: location.country, state: location.state, city: location.city });
                                    } else if (location.state) {
                                      setLocationFilter({ country: location.country, state: location.state, city: "" });
                                    } else if (location.country) {
                                      setLocationFilter({ country: location.country, state: "", city: "" });
                                    }
                                    if (location.latitude && location.longitude) {
                                      setMapCenter({ lat: location.latitude, lng: location.longitude });
                                      setMapZoom(location.city ? 10 : location.state ? 7 : 5);
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {location.user_count}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-sm text-gray-900 leading-tight">
                                          {location.location_label}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                          {location.user_count} {location.user_count === 1 ? 'user' : 'users'}
                                        </p>
                                      </div>
                                    </div>
                                    <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="px-2 py-1.5 bg-blue-50 rounded-lg">
                                      <p className="text-[10px] text-blue-600 font-semibold uppercase">Stories</p>
                                      <p className="text-sm font-bold text-blue-700">{location.total_stories || 0}</p>
                                    </div>
                                    <div className="px-2 py-1.5 bg-amber-50 rounded-lg">
                                      <p className="text-[10px] text-amber-600 font-semibold uppercase">Referrals</p>
                                      <p className="text-sm font-bold text-amber-700">{location.total_referrals || 0}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Users in Selected Location */}
                    <div className="lg:col-span-1">
                      <Card className="h-[500px] lg:h-[600px] flex flex-col bg-gradient-to-br from-white to-teal-50/20 border-teal-200/50 shadow-xl overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 pb-3 bg-gradient-to-r from-teal-50/40 to-cyan-50/30 border-b border-teal-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                                Users in Location
                                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-semibold">
                                  {groupedUsers.length}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="text-xs text-gray-600 mt-0.5">
                                {locationFilter.city || locationFilter.state || locationFilter.country || 'Select a location'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                          <div className="space-y-2 p-4">
                            {groupedUsers.length === 0 ? (
                              <div className="text-center py-8">
                                <p className="text-sm text-gray-500">Select a country, state, or city to see users</p>
                              </div>
                            ) : (
                              groupedUsers.map((userData: any) => (
                                <div
                                  key={userData.id}
                                  className="p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-teal-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setActiveTab('map');
                                    if (userData.latitude && userData.longitude) {
                                      setMapCenter({ lat: userData.latitude, lng: userData.longitude });
                                      setMapZoom(10);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <UserAvatarOnly
                                      avatar_id={userData.avatar_id}
                                      profile_image_path={userData.profile_image_path}
                                      nickname={userData.nickname}
                                      size="w-10 h-10"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm truncate text-gray-900">
                                        {userData.nickname || userData.full_name}
                                      </h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{userData.total_stories || 0} stories</span>
                                        <span>•</span>
                                        <span>{userData.downline_count || 0} referrals</span>
                                      </div>
                                    </div>
                                    {userData.isCurrentUser && (
                                      <Badge className="text-[10px] bg-teal-500 text-white border-0">You</Badge>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="profiles" className="space-y-4 sm:space-y-6">
                  {/* User Profiles Grid */}
                  <Card className="bg-gradient-to-br from-white to-orange-50/20 border-orange-200/50 shadow-xl overflow-hidden">
                    <CardHeader className="p-5 sm:p-7 bg-gradient-to-r from-orange-50/40 to-amber-50/30 border-b border-orange-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Community Profiles
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                            Sorted by Network Size • {users.length} kindness ambassadors spreading joy worldwide
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-7">
                      {users.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-5">
                            <Users className="h-12 w-12 text-orange-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 mb-2">No Profiles Yet</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            {user ? "Share your Ripple Card to connect with others and build your kindness network!" : "Login to explore community profiles"}
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                          {users.map((userData, index) => {
                            // Determine rank badge for top 3
                            const getRankBadge = () => {
                              if (index === 0) return { emoji: '👑', color: 'from-yellow-400 to-amber-500', text: 'Top Network' };
                              if (index === 1) return { emoji: '🥈', color: 'from-gray-300 to-gray-400', text: '2nd Network' };
                              if (index === 2) return { emoji: '🥉', color: 'from-orange-400 to-amber-600', text: '3rd Network' };
                              return null;
                            };
                            const rankBadge = getRankBadge();

                            return (
                              <Card
                                key={userData.id}
                                className="group cursor-pointer bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
                                onClick={() => {
                                  setSelectedUser(userData);
                                  setActiveTab('map');
                                  setMapCenter({ lat: userData.latitude, lng: userData.longitude });
                                  setMapZoom(8);
                                }}
                              >
                                {/* Rank Badge for Top 3 */}
                                {rankBadge && (
                                  <div className="absolute top-3 right-3 z-10">
                                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${rankBadge.color} border-2 border-white shadow-xl flex items-center justify-center text-base`}>
                                      {rankBadge.emoji}
                                    </div>
                                  </div>
                                )}

                                <CardContent className="p-5">
                                  <div className="space-y-4">
                                    {/* Header with Avatar */}
                                    <div className="flex items-start gap-3">
                                      <div className="relative">
                                        <UserAvatarOnly
                                          avatar_id={userData.avatar_id}
                                          profile_image_path={userData.profile_image_path}
                                          nickname={userData.nickname}
                                          size="w-14 h-14"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <MapPin className="h-3 w-3 text-white" />
                                        </div>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2 mb-1">
                                          <h4 className="font-bold text-base leading-tight text-gray-900 flex-1 truncate">
                                            {userData.nickname || userData.full_name}
                                          </h4>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <Badge className={`text-[10px] px-2 py-0.5 ${getUserBadgeConfig(userData).bgColor} text-white border-0`}>
                                            {getUserBadgeConfig(userData).label}
                                          </Badge>
                                          {userData.isCurrentUser && (
                                            <Badge className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                                              You
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                          <MapPin className="h-3 w-3 text-orange-400 flex-shrink-0" />
                                          <span className="truncate">{userData.city}, {userData.country}</span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl text-center border border-blue-100">
                                        <Globe className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-semibold text-blue-600 uppercase mb-0.5">Stories</p>
                                        <p className="text-lg font-bold text-blue-700">{userData.total_stories || 0}</p>
                                      </div>
                                      <div className="p-3 bg-gradient-to-br from-red-50 to-pink-100/50 rounded-xl text-center border border-red-100">
                                        <Heart className="h-4 w-4 text-red-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-semibold text-red-600 uppercase mb-0.5">Likes</p>
                                        <p className="text-lg font-bold text-red-700">{userData.total_likes || 0}</p>
                                      </div>
                                      <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl text-center border border-purple-100">
                                        <TrendingUp className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-semibold text-purple-600 uppercase mb-0.5">Since</p>
                                        <p className="text-[10px] font-bold text-purple-700 leading-tight">
                                          {formatDate(userData.created_at).split(',')[0]}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Referral Network Stats */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-xl text-center border border-green-100">
                                        <UserPlus className="h-4 w-4 text-green-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-semibold text-green-600 uppercase mb-0.5">Downline</p>
                                        <p className="text-lg font-bold text-green-700">{userData.downline_count || 0}</p>
                                      </div>
                                      <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-100/50 rounded-xl text-center border border-amber-100">
                                        <Users className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                                        <p className="text-[10px] font-semibold text-amber-600 uppercase mb-0.5">Network</p>
                                        <p className="text-lg font-bold text-amber-700">{userData.total_network || 0}</p>
                                      </div>
                                    </div>

                                    {/* Upline Info */}
                                    {userData.referred_by_ripple_id && (
                                      <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                                        <div className="flex items-center justify-center gap-2">
                                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                                            <User className="h-3 w-3 text-white" />
                                          </div>
                                          <div className="text-center">
                                            <p className="text-[9px] text-indigo-600 font-semibold uppercase">Referred By</p>
                                            <p className="text-xs font-bold text-indigo-700 font-mono">#{userData.referred_by_ripple_id}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Footer */}
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                      {userData.ripple_id ? (
                                        <Badge variant="outline" className="text-[10px] px-2 py-1 bg-orange-50 text-orange-700 border-orange-200 font-mono font-semibold">
                                          #{userData.ripple_id}
                                        </Badge>
                                      ) : (
                                        <span className="text-xs text-gray-400">No ID</span>
                                      )}
                                      <div className="text-xs text-orange-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View on Map
                                        <ArrowRight className="h-3 w-3" />
                                      </div>
                                    </div>

                                    {/* Referral Badge */}
                                    {user && userData.referred_by_ripple_id === user.ripple_id && (
                                      <div className="pt-3 border-t border-green-100">
                                        <Badge className="w-full justify-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-100 hover:to-emerald-100 text-xs border border-green-200 py-1.5">
                                          <UserPlus className="h-3 w-3 mr-1.5" />
                                          Your Referral
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RippleMapold;