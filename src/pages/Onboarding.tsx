import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import OnboardingTutorial from "@/components/OnboardingTutorial";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  // Open modal on mount
  useEffect(() => {
    setOpen(true);
  }, []);

  const loginAndProceed = async () => {
    try {
      setLoading(true);
      setOpen(false);

      toast({ 
        title: "Registration Completed! 🎉", 
        description: "Please login with your credentials to continue." 
      });

      if (user.role === "teacher") {
        navigate("/teacher/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="How Pass The Ripple Works — Pass The Ripple"
        description="Learn how to create ripples of kindness with your Ripple Card."
        canonical={`${window.location.origin}/onboarding`}
      />
      <OnboardingTutorial
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            loginAndProceed();
          }
        }}
        onComplete={loginAndProceed}
        autoOpen={true}
      />
    </>
  );
};

export default Onboarding;