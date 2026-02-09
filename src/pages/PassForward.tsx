import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import Header from "@/components/layouts/includes/HeaderLoggedIn";
import FooterSection from "@/components/layouts/includes/FooterSection";
import { encryptRippleId } from "@/utils/encryption";

const passingTips = [
  "Give it to a friend who loves helping others",
  "Share it with a teacher or school counselor", 
  "Pass it to a neighbor you'd like to get to know",
  "Give it to someone who looks like they need a smile",
  "Share it with a family member",
  "Give it to someone at your favorite local store"
];

const PassForward = () => {
  const navigate = useNavigate();
  const [hasPassed, setHasPassed] = useState(false);
  
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const handlePassed = () => {
    // Mock passing action
    const passAction = {
      id: crypto.randomUUID(),
      passedAt: new Date().toISOString(),
      passedTo: "Anonymous Friend", // In real app, this would be filled when next person registers
      location: "Your City"
    };

    const existingPasses = JSON.parse(localStorage.getItem('ripplePasses') || '[]');
    existingPasses.push(passAction);
    localStorage.setItem('ripplePasses', JSON.stringify(existingPasses));

    setHasPassed(true);
    toast({ 
      title: "Ripple passed forward! 🌊", 
      description: "Your kindness journey continues with someone new!" 
    });
  };

  const handlePrint = () => {
    window.print();
    toast({ title: "Print dialog opened", description: "Print your Ripple Card to share!" });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/age-gate?ref=${encryptRippleId(userProfile.rippleCode)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Pass The Ripple!',
          text: 'I\'m spreading kindness with my Ripple Card. Join me!',
          url: shareUrl
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Share this link to spread the ripple!" });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share this link to spread the ripple!" });
    }
  };

  if (hasPassed) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-10">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-extrabold mb-4">Amazing!</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  You've passed your ripple forward! Your kindness is now traveling to create more positive impact.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="hero" onClick={() => navigate('/tracker')}>
                    Track Your Ripple
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo
        title="Pass It Forward — Pass The Ripple"
        description="Pass your Ripple Card to someone new and continue the chain of kindness."
        canonical={`${window.location.origin}/pass-forward`}
      />
      <Header />
      
      <main className="container py-10">
          <div className="max-w-2xl mx-auto">
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pass It Forward! 🌊</CardTitle>
              <CardDescription>Your ripple is ready to travel to someone new</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-gradient-primary/10 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-semibold mb-2">You've completed your kind act!</h3>
                <p className="text-sm text-muted-foreground">
                  Now it's time to pass your Ripple Card to someone new so they can continue the chain of kindness.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Who should you give it to?</h3>
                <div className="grid gap-2">
                  {passingTips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-primary">💡</div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Share Your Ripple Card</h3>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handlePrint} className="flex-1">
                    🖨️ Print Card
                  </Button>
                  <Button variant="outline" onClick={handleShare} className="flex-1">
                    📱 Share Link
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    When you've given your card to someone new, let us know!
                  </p>
                  <Button variant="hero" size="lg" onClick={handlePassed} className="w-full">
                    I've Passed My Ripple! 🎯
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Printable Card Preview */}
          <div className="mt-8 print:block hidden">
            <Card className="bg-white text-black">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-bold">Ripple Card</h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-3xl">{userProfile.avatar}</div>
                    <div>
                      <div className="font-semibold">{userProfile.nickname}</div>
                      <div className="text-sm text-gray-600">ID: {userProfile.rippleCode}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>Join Pass The Ripple!</p>
                    <p>Register at: ripplechallenge.com/age-gate</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Do something kind • Log your ripple • Pass it forward ✨
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default PassForward;