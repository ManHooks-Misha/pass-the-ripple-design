import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, Eye, EyeOff, Key, Shield, MapPin, Scan, Users, Calendar, Image as ImageIcon, CheckCircle, XCircle, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/styles/pages/_register.scss";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import QrScanner from "qr-scanner";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { useAuth } from "@/context/AuthContext";
import { useAvatars } from "@/hooks/useAvatars";
import { decryptRippleId } from "@/utils/encryption";
import Captcha from "@/components/Captcha";
import EnhancedDatePicker from "@/components/EnhancedDatePicker";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const Register = () => {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();

  // Fetch dynamic avatars from API
  const { avatars, loading: avatarsLoading, error: avatarsError } = useAvatars();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 4;
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]); // Track which steps have been visited

  // 🚫 Block logged in users
  useEffect(() => {
    const profile = user;
    const token = getAuthToken();

    if (profile || token) {
      navigate("/dashboard", { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate, user]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarUploadRef = useRef<HTMLInputElement | null>(null);

  // form state
  const [rippleCode, setRippleCode] = useState<string | null>("");
  const [nickname, setNickname] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  // Set default avatar when avatars are loaded
  useEffect(() => {
    if (avatars.length > 0 && selectedAvatarId === null) {
      setSelectedAvatarId(avatars[0].id);
    }
  }, [avatars, selectedAvatarId]);

  // ✅ role from localStorage instead of hardcoding
  const [role, setRole] = useState<string>(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) return storedRole;

    if (user) {
      try {
        const parsed = user;
        return parsed.role || "user";
      } catch { }
    }

    return "user";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ageGroup, setAgeGroup] = useState<string>("above 13");
  const [rippleCheckLoading, setRippleCheckLoading] = useState(false);
  const [rippleValid, setRippleValid] = useState<boolean | null>(null);
  const rippleInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Nickname availability check
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const debouncedNickname = useDebounce(nickname, 500);

  const [userAddress, setUserAddress] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

  // Google Maps Geocoding function
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<any> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let city = '';
        let state = '';
        let country = '';
        let postal_code = '';
        const formatted_address = result.formatted_address;

        addressComponents.forEach((component: any) => {
          const types = component.types;

          if (types.includes('locality') || types.includes('postal_town')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          } else if (types.includes('postal_code')) {
            postal_code = component.long_name;
          }
        });

        return {
          formatted_address,
          city,
          state,
          country,
          postal_code,
          latitude: lat,
          longitude: lng,
          street: addressComponents.find((comp: any) => comp.types.includes('route'))?.long_name || '',
          street_number: addressComponents.find((comp: any) => comp.types.includes('street_number'))?.long_name || '',
          neighborhood: addressComponents.find((comp: any) => comp.types.includes('neighborhood'))?.long_name || ''
        };
      } else {
        throw new Error('Unable to get address from coordinates: ' + data.status);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  const getUserLocation = async (): Promise<{
    lat: number;
    lng: number;
    address: string;
    locationDetails: any;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationDetails = await getAddressFromCoordinates(latitude, longitude);

            resolve({
              lat: latitude,
              lng: longitude,
              address: locationDetails.formatted_address,
              locationDetails: locationDetails
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          let errorMessage = 'Location access denied';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Password requirements
  const passwordRequirements = [
    { text: "At least 8 characters long", met: password.length >= 8 },
    { text: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { text: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { text: "At least one number (0-9)", met: /\d/.test(password) },
    { text: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];

  const passwordStrength = passwordRequirements.filter(req => req.met).length;

  // location state
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  /** Effects **/

  // Clear any admin credentials from localStorage on register page load
  useEffect(() => {
    const rippleId = localStorage.getItem("rippleId");
    const userAgeData = localStorage.getItem("userAgeData");
    const role = localStorage.getItem("role");

    localStorage.clear();
    sessionStorage.clear();

    if (rippleId) localStorage.setItem("rippleId", rippleId);
    if (userAgeData) localStorage.setItem("userAgeData", userAgeData);
    if (role) localStorage.setItem("role", role);
  }, []);

  // Load parent email if under 13
  useEffect(() => {
    const parentConsentData = localStorage.getItem("parentConsents");
    const userAgeData = localStorage.getItem("userAgeData");
    if (userAgeData) {
      const consentData = JSON.parse(userAgeData).parent_data;
      if (consentData?.parentEmail) {
        setEmail(consentData.parentEmail);
      }
    }
    else if (parentConsentData) {
      const consentData = JSON.parse(parentConsentData);
      if (consentData?.[0]?.parentEmail) {
        setEmail(consentData[0].parentEmail);
      }
    }
  }, []);

  // Load Ripple ID from storage based on age
  useEffect(() => {
    const userAgeData = localStorage.getItem("userAgeData");
    if (userAgeData) {
      const parsedAgeData = JSON.parse(userAgeData);
      const storedAgeGroup = parsedAgeData?.data?.age_category || "above 13";
      setAgeGroup(storedAgeGroup);
      let rippleId = null;
      if (storedAgeGroup === "below 13") {
        rippleId = parsedAgeData?.data?.ripple_id || null;
      } else {
        rippleId = localStorage.getItem("rippleId");
      }
      if (rippleId) setRippleCode(rippleId);
    }
  }, []);

  useEffect(() => {
    const savedRipple = localStorage.getItem("rippleId");
    if (savedRipple) {
      setRippleCode(savedRipple);
      setRippleValid(true);
    }
  }, []);

  const checkRippleId = async (code: string) => {
    if (!code) return;
    try {
      setRippleCheckLoading(true);
      setRippleValid(null);

      const res = await apiFetch<any>("/check-ripple-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ripple_id: code }),
      });

      if (res.success) {
        setRippleValid(true);
        setActiveStep(2);
        toast({ title: "Ripple ID is valid!", description: code });
      } else {
        setRippleValid(false);
        setRippleCode("");
        rippleInputRef.current?.focus();
        toast({
          title: "Invalid Ripple ID",
          description: res.message || "Please check your code",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setRippleValid(false);
      setRippleCode("");

      // Enhanced error handling for 404
      let errorMessage = "Could not verify Ripple ID";
      if (err?.response?.status === 404 || err?.status === 404) {
        errorMessage = "Ripple ID verification endpoint not found. Please contact support.";
        console.error("404 Error - Endpoint not found:", {
          endpoint: "/check-ripple-id",
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
          fullUrl: `${import.meta.env.VITE_API_BASE_URL}/check-ripple-id`,
          error: err
        });
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRippleCheckLoading(false);
    }
  };

  // Get browser geolocation with address
  useEffect(() => {
    const fetchLocation = async () => {
      setIsGettingLocation(true);
      setLocationError("");

      try {
        const location = await getUserLocation();
        setGeo({ lat: location.lat, lng: location.lng });
        setUserAddress(location.address);

        setIpInfo(prev => ({
          ...prev,
          ip: prev?.ip,
          city: location.locationDetails.city,
          state: location.locationDetails.state,
          country: location.locationDetails.country,
          postal_code: location.locationDetails.postal_code,
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: location.address
        }));

      } catch (error: any) {
        console.warn("Location access denied or failed:", error.message);
        setLocationError(error.message);

        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => {
            setIpInfo({
              ip: data.ip,
              city: data.city,
              state: data.region,
              country: data.country_name,
              postal_code: data.postal,
              latitude: data.latitude,
              longitude: data.longitude,
              formatted_address: `${data.city}, ${data.region}, ${data.country_name}`
            });
            setUserAddress(`${data.city}, ${data.region}, ${data.country_name}`);
          })
          .catch(() => console.warn("Could not fetch IP info"));
      } finally {
        setIsGettingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  // Manual location refresh function
  const refreshLocation = async () => {
    setIsGettingLocation(true);
    setLocationError("");

    try {
      const location = await getUserLocation();
      setGeo({ lat: location.lat, lng: location.lng });
      setUserAddress(location.address);

      setIpInfo(prev => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: location.address
      }));

      toast({
        title: "Location Updated",
        description: "Your location has been refreshed successfully.",
      });
    } catch (error: any) {
      setLocationError(error.message);
      toast({
        title: "Location Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  /** Handlers **/

  const handleQRScan = () => fileInputRef.current?.click();

  const copyAdminRippleId = async () => {
    const adminRippleId = "PTR-0912-4";
    try {
      await navigator.clipboard.writeText(adminRippleId);
      toast({
        title: "Copied!",
        description: "Admin's Ripple ID copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      const result = await QrScanner.scanImage(imageUrl);

      let rippleId = result;
      try {
        const url = new URL(result);
        const encryptedRippleId = url.searchParams.get("ref") || result;
        try {
          rippleId = decryptRippleId(encryptedRippleId);
        } catch (decryptError) {
          console.error("Failed to decrypt ripple_id:", decryptError);
          rippleId = encryptedRippleId;
        }
      } catch {
        try {
          rippleId = decryptRippleId(result);
        } catch (decryptError) {
          console.error("Failed to decrypt ripple_id:", decryptError);
          rippleId = result;
        }
      }

      setRippleCode(rippleId);
      checkRippleId(rippleId || "");
      toast({
        title: "QR Code Scanned!",
        description: `Ripple ID: ${rippleId}`,
      });

      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      toast({
        title: "Scan Failed",
        description: "Could not read QR code from the image.",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 1MB",
        variant: "destructive",
      });
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;

      if (width < 200 || width > 300 || height < 200 || height > 300) {
        toast({
          title: "Invalid image dimensions",
          description: "Image dimensions should be between 200x200 to 300x300 pixels",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
        setSelectedAvatarId(0); // Set to 0 for custom avatar
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      toast({
        title: "Invalid image file",
        description: "Please select a valid image file",
        variant: "destructive",
      });
    };

    img.src = URL.createObjectURL(file);
  };

  // Check nickname availability
  const checkNicknameAvailability = async (nicknameToCheck: string) => {
    if (!nicknameToCheck || nicknameToCheck.length < 3) {
      setNicknameAvailable(null);
      return;
    }

    setNicknameCheckLoading(true);
    try {
      const response = await apiFetch<any>("/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nicknameToCheck }),
      });

      if (response.success && response.data?.is_available) {
        setNicknameAvailable(true);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
      } else {
        setNicknameAvailable(false);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors?.nickname) {
        setNicknameAvailable(false);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
      } else {
        setNicknameAvailable(null);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
      }
    } finally {
      setNicknameCheckLoading(false);
    }
  };

  // Check nickname availability when debounced value changes
  useEffect(() => {
    if (debouncedNickname && debouncedNickname.length >= 3) {
      checkNicknameAvailability(debouncedNickname);
    } else {
      setNicknameAvailable(null);
      setNicknameCheckLoading(false);
    }
  }, [debouncedNickname]);

  // Step-specific validation functions
  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nickname) {
      newErrors.nickname = "Nickname is required";
    } else if (nickname.length < 3) {
      newErrors.nickname = "Nickname must be at least 3 characters";
    } else if (nicknameAvailable === false) {
      newErrors.nickname = "Nickname is not available";
    } else if (nicknameAvailable === null && nickname.length >= 3) {
      newErrors.nickname = "Please wait while we check nickname availability";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
    } else {
      const today = new Date();
      const age = today.getFullYear() - dateOfBirth.getFullYear();
      const monthDiff = today.getMonth() - dateOfBirth.getMonth();
      const dayDiff = today.getDate() - dateOfBirth.getDate();

      const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (role === "teacher") {
        if (exactAge < 18) {
          newErrors.dateOfBirth = "Teachers must be at least 18 years old to register";
        }
      } else {
        const storedAgeData = localStorage.getItem("userAgeData");
        const parsedAgeData = storedAgeData ? JSON.parse(storedAgeData) : {};
        const userAgeGroup = parsedAgeData?.data?.age_category || "above 13";

        if (userAgeGroup === "below 13") {
          if (exactAge < 4 || exactAge >= 13) {
            newErrors.dateOfBirth = "For under 13 registration, you must be between 4-12 years old";
          }
        } else {
          if (exactAge < 13) {
            newErrors.dateOfBirth = "You must be at least 13 years old to register";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};

    if (ageGroup === "above 13") {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Invalid email format";
      }
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      }
    }

    if (!captchaValid) {
      newErrors.captcha = "Please complete the security verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- validation function ---
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!rippleCode) {
      newErrors.rippleCode = "Ripple Code is required";
    }

    if (!nickname) {
      newErrors.nickname = "Nickname is required";
    } else if (nickname.length < 3) {
      newErrors.nickname = "Nickname must be at least 3 characters";
    } else if (nicknameAvailable === false) {
      newErrors.nickname = "Nickname is not available";
    } else if (nicknameAvailable === null && nickname.length >= 3) {
      newErrors.nickname = "Please wait while we check nickname availability";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
    } else {
      const today = new Date();
      const age = today.getFullYear() - dateOfBirth.getFullYear();
      const monthDiff = today.getMonth() - dateOfBirth.getMonth();
      const dayDiff = today.getDate() - dateOfBirth.getDate();

      const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (role === "teacher") {
        if (exactAge < 18) {
          newErrors.dateOfBirth = "Teachers must be at least 18 years old to register";
        }
      } else {
        const storedAgeData = localStorage.getItem("userAgeData");
        const parsedAgeData = storedAgeData ? JSON.parse(storedAgeData) : {};
        const userAgeGroup = parsedAgeData?.data?.age_category || "above 13";

        if (userAgeGroup === "below 13") {
          // Allow ages 4-12 (inclusive)
          // Check if child is at least 4 years old (allowing for birthday not yet occurred this year)
          // A child who is 4 years old but hasn't had birthday yet would have exactAge = 3
          // So we check years since birth instead of exact age
          const yearsSinceBirth = today.getFullYear() - dateOfBirth.getFullYear();
          const isAtLeast4 = yearsSinceBirth >= 4;
          const isUnder13 = exactAge < 13;

          if (!isAtLeast4 || !isUnder13) {
            newErrors.dateOfBirth = "For under 13 registration, you must be between 4-12 years old";
          }
        } else {
          if (exactAge < 13) {
            newErrors.dateOfBirth = "You must be at least 13 years old to register";
          }
        }
      }
    }

    if (ageGroup === "above 13") {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Invalid email format";
      }
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      }
    }

    if (!consent) {
      newErrors.consent = "You must agree to continue";
    }

    if (!captchaValid) {
      newErrors.captcha = "Please complete the security verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const storedAgeData = localStorage.getItem("userAgeData");
    const parsedAgeData = storedAgeData ? JSON.parse(storedAgeData) : {};
    const ageGroup = parsedAgeData?.data?.age_category || "above 13";
    const isUnder13 = ageGroup === "below 13";

    const storedParentConsents = localStorage.getItem("parentConsents");
    const storeduserAgeData = localStorage.getItem("userAgeData");
    let parentEmail: string | null = null;

    if (storeduserAgeData) {
      try {
        const parentConsentData = JSON.parse(storeduserAgeData).parent_data;
        parentEmail = parentConsentData?.parentEmail || null;
      } catch {
        parentEmail = null;
      }
    } else if (storedParentConsents) {
      try {
        const parentConsentData = JSON.parse(storedParentConsents);
        parentEmail = parentConsentData?.[0]?.parentEmail || null;
      } catch {
        parentEmail = null;
      }
    }

    if (!nickname || !consent || !dateOfBirth || !role) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formattedDOB = dateOfBirth
      ? `${dateOfBirth.getFullYear()}-${String(
        dateOfBirth.getMonth() + 1
      ).padStart(2, "0")}-${String(dateOfBirth.getDate()).padStart(2, "0")}`
      : null;

    const payload = {
      email,
      parent_email: parentEmail,
      ripple_id: rippleCode,
      nickname,
      password,
      password_confirmation: password,
      date_of_birth: formattedDOB,
      terms_agreed: consent,
      role,
      avatar_id: customAvatar ? 0 : selectedAvatarId,
      custom_avatar: customAvatar,
      age_group: ageGroup,
      location: {
        ip: ipInfo?.ip,
        city: ipInfo?.city,
        state: ipInfo?.state,
        country: ipInfo?.country,
        postal_code: ipInfo?.postal_code,
        latitude: ipInfo?.latitude,
        longitude: ipInfo?.longitude,
        formatted_address: ipInfo?.formatted_address,
      },
    };

    sessionStorage.setItem("registrationPayload", JSON.stringify(payload));

    try {
      setLoading(true);

      if (!isUnder13 && email) {
        await apiFetch<any>("/send-email-otp-for-verification", {
          method: "POST",
          body: JSON.stringify({ email }),
        });

        navigate("/verify-email");
      } else {
        const data = await apiFetch<any>("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!data.success) {
          throw new Error(data.message || "Registration failed");
        }

        toast({
          title: "Registration Successful!",
          description: "Welcome to Pass The Ripple!",
        });

        setCaptchaValid(false);
        setCaptchaResetTrigger(prev => prev + 1);

        const userData = data.data?.user;
        const token = data.data?.access_token;
        const expiresIn = data.data?.expires_in;

        if (!userData || !token) {
          throw new Error("Invalid response from server");
        }

        login(userData, token, expiresIn);

        await new Promise(resolve => setTimeout(resolve, 100));

        navigate("/onboarding", { replace: true });

      }
    } catch (error: any) {
      let description = "Something went wrong";

      if (error?.errors && typeof error.errors === "object") {
        const allErrors = Object.values(error.errors).flat() as string[];
        description = allErrors.join("\n");
      } else if (error?.message) {
        description = error.message;
      } else if (typeof error === "string") {
        description = error;
      }

      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLocationInfo = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">Detected Location</span>
          <Badge variant={userAddress ? "default" : "secondary"} className="ml-2">
            {isGettingLocation ? "Detecting..." : userAddress ? "Live" : "Approximate"}
          </Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshLocation}
          disabled={isGettingLocation}
          className="h-8 px-3 text-xs"
        >
          {isGettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {isGettingLocation ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Getting your location...</p>
        </div>
      ) : userAddress ? (
        <div className="space-y-2 height-auto">
          <p className="text-sm font-medium text-gray-900">{userAddress}</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Lat: {geo?.lat?.toFixed(4)}</span>
            <span>Lng: {geo?.lng?.toFixed(4)}</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              ✓ Precise
            </Badge>
          </div>
        </div>
      ) : locationError ? (
        <div className="space-y-2 height-auto">
          <p className="text-sm text-red-600 font-medium">{locationError}</p>
          <p className="text-xs text-gray-600">
            Using approximate location from IP address
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Location not available</p>
      )}
    </div>
  );

  const renderStepProgress = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <Badge variant="outline" className="text-sm">
          Step {activeStep} of {totalSteps}
        </Badge>
      </div>
      <Progress value={(activeStep / totalSteps) * 100} className="h-2" />
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className={activeStep >= 1 ? "text-primary font-medium" : ""}>Ripple ID</span>
        <span className={activeStep >= 2 ? "text-primary font-medium" : ""}>Profile</span>
        <span className={activeStep >= 3 ? "text-primary font-medium" : ""}>Security</span>
        <span className={activeStep >= 4 ? "text-primary font-medium" : ""}>Review</span>
      </div>
    </div>
  );

  /** UI **/

  return (
    <main className="min-h-screen bg-white py-8 relative overflow-hidden">

      <Seo
        title="Register Your Ripple Card — Pass The Ripple"
        description="Register your unique Ripple Card and start your kindness journey."
        canonical={`${window.location.origin}/age-gate`}
      />

      {isCheckingAuth ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      ) : (
        <div className="container max-w-6xl mx-auto px-4">
          {renderStepProgress()}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 width-80 mx-auto">
            {/* Left Side - Instructions */}
            <div className="space-y-6 height-auto">
              <Card className="bg-white shadow-none relative" style={{
                borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
                border: '2px solid #374151',
                borderStyle: 'solid'
              }}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-3 font-black text-gray-900 font-fuzzy">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    How to Register & Create Your Ripple ID
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-700 border border-blue-200">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Enter Reference Ripple ID</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Enter the reference Ripple ID from an existing member, or use the admin's Ripple ID:
                          <span className="inline-flex items-center gap-2 ml-2">
                            <strong className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">PTR-0912-4</strong>
                            <button
                              type="button"
                              onClick={copyAdminRippleId}
                              className="text-blue-600 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded"
                              aria-label="Copy admin's Ripple ID"
                              title="Copy admin's Ripple ID"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center font-bold text-purple-700 border border-purple-200">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Complete Your Profile</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Fill in your nickname, date of birth, email, and choose your avatar. Make it unique and memorable!
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center font-bold text-green-700 border border-green-200">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Get Your Ripple ID</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          After registration, your unique Ripple ID will be created automatically. Share it with others to help them join the kindness journey!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">💡</span>
                      Quick Tips
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>No reference ID? Use admin's: </span>
                        <span className="inline-flex items-center gap-1">
                          <strong className="font-mono text-blue-600">PTR-0912-4</strong>
                          <button
                            type="button"
                            onClick={copyAdminRippleId}
                            className="text-blue-600 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded"
                            aria-label="Copy admin's Ripple ID"
                            title="Copy admin's Ripple ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Nickname: letters, numbers, underscores only</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Teachers: 18+ years | Users: 13+ years (or 4-12 with consent)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Your Ripple ID is created after registration</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Registration Form */}
            <Card className="bg-white shadow-none relative" style={{
              borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
              border: '2px solid #374151',
              borderStyle: 'solid'
            }}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-black text-gray-900 font-fuzzy">
                  Register Your Ripple Card
                </CardTitle>
                <CardDescription className="text-lg text-gray-900 mt-2">
                  Join the community and start your kindness journey
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs value={activeStep.toString()} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger
                      value="1"
                      className="text-xs"
                      onClick={() => setActiveStep(1)}
                    >
                      Ripple ID
                    </TabsTrigger>
                    <TabsTrigger
                      value="2"
                      className="text-xs"
                      onClick={() => visitedSteps.includes(2) && setActiveStep(2)}
                      disabled={!visitedSteps.includes(2)}
                    >
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="3"
                      className="text-xs"
                      onClick={() => visitedSteps.includes(3) && setActiveStep(3)}
                      disabled={!visitedSteps.includes(3)}
                    >
                      Security
                    </TabsTrigger>
                    <TabsTrigger
                      value="4"
                      className="text-xs"
                      onClick={() => visitedSteps.includes(4) && setActiveStep(4)}
                      disabled={!visitedSteps.includes(4)}
                    >
                      Review
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Ripple Code */}
                    <TabsContent value="1" className="space-y-6 mt-0">
                      <div className="text-center mb-6">
                        <Scan className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Enter Reference Ripple ID</h3>
                        <p className="text-gray-600 mt-1">Get started by entering your reference code</p>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="ripple-code" className="text-base font-semibold">
                          Reference Ripple ID <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-sm text-gray-600 -mt-2">
                          Enter the Ripple ID shared with you by an existing member
                        </p>
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <Input
                              id="ripple-code"
                              ref={rippleInputRef}
                              value={rippleCode || ""}
                              onChange={(e) => setRippleCode(e.target.value)}
                              onBlur={() => checkRippleId(rippleCode || "")}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  checkRippleId(rippleCode || "");
                                }
                              }}
                              placeholder="PTR-1234-12"
                              className="h-12 text-base placeholder:text-gray-400 pr-24"
                            />
                            {rippleCheckLoading && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                              </div>
                            )}
                            {rippleValid === true && (
                              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                            {rippleValid === false && (
                              <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleQRScan}
                            className="h-12 px-6 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                          >
                            <Scan className="w-5 h-5 mr-2" />
                            Scan QR
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>

                      {rippleValid === true && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-green-800 font-medium">Ripple ID is valid!</p>
                              <p className="text-green-700 text-sm">You can proceed to the next step</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/")}
                        >
                          Back to Home
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (rippleValid) {
                              setActiveStep(2);
                              setVisitedSteps(prev => [...new Set([...prev, 2])]);
                            }
                          }}
                          disabled={!rippleValid}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Continue to Profile
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Step 2: Profile Information */}
                    <TabsContent value="2" className="space-y-6 mt-0">
                      <div className="text-center mb-6">
                        <Users className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Create Your Profile</h3>
                        <p className="text-gray-600 mt-1">Tell us about yourself</p>
                      </div>

                      {/* Nickname */}
                      <div className="grid gap-3">
                        <Label htmlFor="nickname" className="text-base font-semibold">
                          Your Nickname <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="nickname"
                            value={nickname}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^[A-Za-z0-9_]*$/.test(value)) {
                                setNickname(value);
                                setNicknameAvailable(null);
                              }
                            }}
                            placeholder="KindnessHero123"
                            maxLength={20}
                            className="h-12 text-base placeholder:text-gray-400 pr-24"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            {nicknameCheckLoading && nickname.length >= 3 && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                            {nicknameAvailable === true && nickname.length >= 3 && !nicknameCheckLoading && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {nicknameAvailable === false && nickname.length >= 3 && !nicknameCheckLoading && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-xs text-gray-500">{nickname.length}/20</span>
                          </div>
                        </div>
                        {nicknameAvailable === true && nickname.length >= 3 && !nicknameCheckLoading && (
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Nickname is available
                          </p>
                        )}
                        {nicknameAvailable === false && nickname.length >= 3 && !nicknameCheckLoading && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Nickname is already taken
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div className="grid gap-3">
                        <EnhancedDatePicker
                          id="date-of-birth"
                          label="Date of Birth"
                          value={dateOfBirth}
                          onChange={setDateOfBirth}
                          required
                          maxDate={new Date()}
                          minDate={new Date(1900, 0, 1)}
                          showQuickSelect={false}
                          openToDate={(() => {
                            const today = new Date();
                            if (role === "teacher") {
                              return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                            }

                            const storedAgeData = localStorage.getItem("userAgeData");
                            const parsedAgeData = storedAgeData ? JSON.parse(storedAgeData) : {};
                            const userAgeGroup = parsedAgeData?.data?.age_category || "above 13";

                            if (userAgeGroup === "below 13") {
                              return new Date(today.getFullYear() - 11, today.getMonth(), today.getDate());
                            } else {
                              return new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
                            }
                          })()}
                          filterDate={(date) => {
                            const today = new Date();
                            const age = today.getFullYear() - date.getFullYear();
                            const monthDiff = today.getMonth() - date.getMonth();
                            const dayDiff = today.getDate() - date.getDate();

                            const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

                            if (role === "teacher") {
                              return exactAge >= 18;
                            }

                            const storedAgeData = localStorage.getItem("userAgeData");
                            const parsedAgeData = storedAgeData ? JSON.parse(storedAgeData) : {};
                            const userAgeGroup = parsedAgeData?.data?.age_category || "above 13";

                            if (userAgeGroup === "below 13") {
                              return exactAge >= 4 && exactAge < 13;
                            } else {
                              return exactAge >= 13;
                            }
                          }}
                          helperText={(() => {
                            if (role === "teacher") {
                              return "Teacher's age must be at least 18 years";
                            }

                            const storedAgeData = localStorage.getItem("userAgeData");
                            const parsedAgeData = storedAgeData ? JSON.parse(storedAgeData) : {};
                            const userAgeGroup = parsedAgeData?.data?.age_category || "above 13";

                            if (userAgeGroup === "below 13") {
                              return "Age must be between 4-12 years";
                            } else {
                              return "Age must be at least 13 years";
                            }
                          })()}
                          error={errors.dateOfBirth}
                        />
                      </div>

                      {/* Location */}
                      {renderLocationInfo()}

                      {/* Avatar Selection */}
                      <div className="grid gap-4">
                        <Label className="text-base font-semibold">
                          Choose Your Avatar <span className="text-red-500">*</span>
                        </Label>

                        <Tabs defaultValue="default" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="default">Default Avatars</TabsTrigger>
                            <TabsTrigger value="custom">Custom Avatar</TabsTrigger>
                          </TabsList>

                          <TabsContent value="default" className="mt-4">
                            {avatarsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600">Loading avatars...</span>
                              </div>
                            ) : avatarsError ? (
                              <div className="text-center py-8 text-red-500">
                                <p>Failed to load avatars. Please refresh the page.</p>
                              </div>
                            ) : avatars.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p>No avatars available at the moment.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {avatars.map((avatar) => (
                                  <button
                                    key={avatar.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAvatarId(avatar.id);
                                      setCustomAvatar(null);
                                    }}
                                    className={`relative rounded-xl border-2 p-3 transition-all hover:scale-105 group ${selectedAvatarId === avatar.id && !customAvatar
                                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20"
                                        : "border-gray-200 hover:border-blue-300 bg-white"
                                      }`}
                                  >
                                    <img
                                      src={avatar.image}
                                      alt={avatar.name}
                                      className="w-12 h-12 object-contain mx-auto group-hover:scale-110 transition-transform"
                                    />
                                    <span className="absolute top-1 right-1 text-xs">{avatar.emoji}</span>
                                    <p className="text-xs mt-2 font-medium text-center text-gray-700">{avatar.name}</p>
                                  </button>
                                ))}
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="custom" className="mt-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                ref={avatarUploadRef}
                                className="hidden"
                                onChange={handleAvatarUpload}
                              />

                              {customAvatar ? (
                                <div className="space-y-4">
                                  <div className="relative inline-block">
                                    <img
                                      src={customAvatar}
                                      alt="Custom Avatar"
                                      className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 shadow-lg mx-auto"
                                    />
                                    <Badge className="absolute -top-2 -right-2 bg-green-500">
                                      Selected
                                    </Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => avatarUploadRef.current?.click()}
                                    className="mt-2"
                                  >
                                    Change Image
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => avatarUploadRef.current?.click()}
                                  className="w-full space-y-3"
                                >
                                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <ImageIcon className="w-8 h-8 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Upload Custom Avatar</p>
                                    <p className="text-sm text-gray-600 mt-1">JPG, PNG, GIF • Max 1MB</p>
                                    <p className="text-xs text-gray-500 mt-1">200x200 to 300x300 pixels</p>
                                  </div>
                                </button>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (validateStep2()) {
                              setActiveStep(3);
                              setVisitedSteps(prev => [...new Set([...prev, 3])]);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Continue to Security
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Step 3: Security */}
                    <TabsContent value="3" className="space-y-6 mt-0">
                      <div className="text-center mb-6">
                        <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Account Security</h3>
                        <p className="text-gray-600 mt-1">Set up your login credentials</p>
                      </div>

                      {/* Email */}
                      <div className="grid gap-3">
                        <Label htmlFor="email" className="text-base font-semibold">
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="h-12 text-base placeholder:text-gray-400"
                        />
                      </div>

                      {/* Password */}
                      <div className="grid gap-3">
                        <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                          <Key className="w-5 h-5 text-blue-600" />
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`h-12 text-base pr-12 placeholder:text-gray-400 ${errors.password ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"
                              }`}
                            placeholder="Create a strong password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </div>

                        {/* Password Strength Meter */}
                        {password && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Password Strength</span>
                              <span className={`text-sm font-semibold ${passwordStrength <= 2
                                  ? "text-red-600"
                                  : passwordStrength <= 3
                                    ? "text-orange-600"
                                    : passwordStrength <= 4
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                }`}>
                                {passwordStrength <= 2
                                  ? "Weak"
                                  : passwordStrength <= 3
                                    ? "Fair"
                                    : passwordStrength <= 4
                                      ? "Good"
                                      : "Strong"
                                }
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength <= 2
                                    ? "bg-red-500 w-1/4"
                                    : passwordStrength <= 3
                                      ? "bg-orange-500 w-1/2"
                                      : passwordStrength <= 4
                                        ? "bg-yellow-500 w-3/4"
                                        : "bg-green-500 w-full"
                                  }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          Password Requirements
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {passwordRequirements.map((requirement, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${requirement.met
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "bg-white border-gray-300 text-transparent"
                                }`}>
                                <CheckCircle className="w-3 h-3" />
                              </div>
                              <span className={`text-sm ${requirement.met ? "text-green-700 font-medium" : "text-gray-600"
                                }`}>
                                {requirement.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Captcha */}
                      <Captcha
                        onVerify={setCaptchaValid}
                        error={errors.captcha}
                        disabled={loading}
                        resetTrigger={captchaResetTrigger}
                      />

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveStep(2)}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (validateStep3()) {
                              setActiveStep(4);
                              setVisitedSteps(prev => [...new Set([...prev, 4])]);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Continue to Review
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Step 4: Review & Submit */}
                    <TabsContent value="4" className="space-y-6 mt-0">
                      <div className="text-center mb-6">
                        <Calendar className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Review & Complete</h3>
                        <p className="text-gray-600 mt-1">Almost there! Review your information</p>
                      </div>

                      {/* Review Summary */}
                      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                        <h4 className="font-semibold text-gray-900 text-lg mb-4">Registration Summary</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Ripple ID</label>
                              <p className="text-gray-900 font-mono">{rippleCode || "Not provided"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Nickname</label>
                              <p className="text-gray-900">{nickname || "Not provided"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                              <p className="text-gray-900">{dateOfBirth ? dateOfBirth.toLocaleDateString() : "Not provided"}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Email</label>
                              <p className="text-gray-900">{email || "Not provided"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Avatar</label>
                              <p className="text-gray-900">
                                {customAvatar
                                  ? "Custom Avatar"
                                  : avatars.find(a => a.id === selectedAvatarId)?.name || "Default"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Location</label>
                              <p className="text-gray-900 text-sm">{userAddress || "Not detected"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Consent */}
                      <div className="flex items-start space-x-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <Checkbox
                          id="consent"
                          checked={consent}
                          onCheckedChange={(checked) => setConsent(checked as boolean)}
                          className="mt-0.5"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor="consent"
                            className="text-sm font-normal cursor-pointer text-gray-900"
                          >
                            I agree to the{" "}
                            <button
                              type="button"
                              className="text-blue-600 hover:underline font-medium"
                              onClick={() => window.open("/privacy-policy", "_blank")}
                            >
                              Privacy Policy
                            </button>{" "}
                            and{" "}
                            <button
                              type="button"
                              className="text-blue-600 hover:underline font-medium"
                              onClick={() => window.open("/terms-of-service", "_blank")}
                            >
                              Terms of Use
                            </button>
                            <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-xs text-gray-600">
                            We take privacy seriously, especially for young users. Your data is protected and never shared without consent.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveStep(3)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          size="lg"
                          disabled={loading || !consent || !captchaValid}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            "Complete Registration"
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </form>
                </Tabs>

                {/* Error Display */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <h4 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Please fix the following errors:
                    </h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      {Object.entries(errors).map(([key, error]) => (
                        <li key={key}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
};

export default Register;