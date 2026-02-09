import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "@/styles/pages/_agegate.scss";

import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import MagicalHeader from "@/components/layouts/includes/MagicalHeader";
import MagicalFooter from "@/components/layouts/includes/MagicalFooter";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import char1 from "@/assets/characters/char1.png";
import { Sparkles } from "lucide-react";
import { getAuthToken } from "@/lib/auth-token";
import { useAuth } from "@/context/AuthContext";
import { decryptRippleId } from "@/utils/encryption";

const AgeGate = () => {
  const [loading, setLoading] = useState(false);
  const [rippleId, setRippleId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const token = getAuthToken();

  // 🚫 Block logged in users
  useEffect(() => {
    if (user || token) {
      navigate("/dashboard", { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate]);

  // On mount → check ref in URL or create ripple ID
  useEffect(() => {
    const initRippleId = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const ref = params.get("ref");

        if (ref != null) {
          try {
            // Decrypt the ripple_id from the URL parameter
            const decryptedRippleId = decryptRippleId(ref);
            localStorage.setItem("rippleId", decryptedRippleId);
            setRippleId(decryptedRippleId);
          } catch (decryptError) {
            console.error("Failed to decrypt ripple_id:", decryptError);
            // If decryption fails, use the original ref as fallback
            localStorage.setItem("rippleId", ref);
            setRippleId(ref);
          }
          setLoading(false);
          return;
        }

        // If not in URL → create a new ripple ID
        // const data = await apiFetch<any>("/dev/create-ripple-id", {
        //   method: "POST",
        // });

        // const newId = data.data.ripple_ids[0].ripple_id;
        // localStorage.setItem("rippleId", newId);
        // setRippleId(newId);
        setLoading(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    initRippleId();
  }, [location.search]);

  const handleAgeSelection = async (isUnder13: boolean) => {
    // if (!rippleId) {
    //   toast({
    //     title: "Error",
    //     description: "Ripple ID not ready yet. Please try again.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    const ageValue = isUnder13 ? "below 13" : "above 13";

    try {
      setLoading(true);
      const data = await apiFetch<any>("/age-gate", {
        method: "POST",
        body: JSON.stringify({
          age: ageValue,
          ripple_id: rippleId,
        }),
      });

      // Save age data in localStorage for later use
      localStorage.setItem("userAgeData", JSON.stringify(data));

      // toast({ title: "Success", description: "Age Detected Successfully" });
      navigate(isUnder13 ? "/parent-consent" : "/register");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      <Seo
        title="Join Pass The Ripple — Spread Kindness Together!"
        description="Join thousands of young heroes creating magical ripples of kindness around the world. Every act of kindness starts a beautiful chain reaction!"
        canonical={`${window.location.origin}/age-gate`}
        image={`${window.location.origin}/assets/ripple-challenge-logo-DgLX7Jj9.png`}
        imageAlt="Pass The Ripple - Kindness Ripple Tracker"
        type="website"
        url={`${window.location.origin}/age-gate${location.search}`}
      />

      {isCheckingAuth ? (
        <p className="text-center py-10 text-gray-900">Checking authentication...</p>
      ) : (
        <div className="container mx-auto px-4">
          <Card className="bg-white shadow-none relative" style={{
            borderRadius: '45px 38px 42px 40px / 42px 40px 38px 45px',
            border: '2px solid #374151',
            borderStyle: 'solid'
          }}>
            <CardHeader className="text-center relative z-10">
              <div className="mx-auto mb-0">
                <img
                  src={char1}
                  alt="Jungle Friend"
                  className="mx-auto w-24 h-24 object-contain"
                />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black text-gray-900 font-fuzzy">
                Welcome to Pass The Ripple!
              </CardTitle>
              <CardDescription className="text-base text-gray-900">
                Let's make sure you have the best experience
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              <div className="p-3 bg-stone-50 rounded-xl text-center border-2 border-gray-200">
                <p className="text-base text-gray-900 mb-1">
                  To keep everyone safe and happy, we need to know your age group.
                </p>
                <h2 className="text-xl font-black text-gray-900 mb-2 font-fuzzy">
                  How old are you?
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    localStorage.setItem("role", "user");
                    handleAgeSelection(true);
                  }}
                  className="h-24 flex-col bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">👶</div>
                    <div className="text-base font-bold">Under 13</div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  onClick={() => {
                    localStorage.setItem("role", "user");
                    handleAgeSelection(false);
                  }}
                  className="h-24 flex-col bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🧑</div>
                    <div className="text-base font-bold">13 or Older</div>
                  </div>
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-900 mb-2">
                  Are you a teacher?
                </p>
                <Link to="/register">
                  <Button
                    size="default"
                    onClick={() => {
                      localStorage.setItem("role", "teacher");
                      handleAgeSelection(false);
                    }}
                    disabled={loading}
                    className="gap-2 bg-green-400 hover:bg-green-500 text-gray-900 shadow-md hover:shadow-lg"
                  >
                    <Sparkles size={16} className="text-gray-900" />
                    <span className="text-gray-900 font-bold">Register as Teacher</span>
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-center text-gray-900 mt-2 italic">
                We take privacy seriously. This helps us comply with COPPA
                regulations.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default AgeGate;
