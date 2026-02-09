import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, HelpCircle } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from "@/context/AuthContext";
import { LoggedInUserAvatar } from "@/components/UserIdentity";
import { encryptRippleId } from "@/utils/encryption";
import KidFriendlyTutorial from "@/components/KidFriendlyTutorial";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import { rippleCardTutorialSteps } from "@/hooks/usePageTutorialSteps";
import { convertStepsToTutorialSteps } from "@/utils/convertTutorialSteps";

const RippleCard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState({
    avatar: user.avatar_id,
    nickname: user.nickname,
    ripple_id: user.ripple_id,
    rippleCode: user.ripple_id
  });
  const qrRef = useRef(null);
  
  const rippleId = userProfile.ripple_id;
  const fullUrl = `${window.location.origin}/age-gate?ref=${encryptRippleId(rippleId)}`;

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("ripple_auth_data");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  // Helper: Draw rounded rectangle with high quality
  const roundRect = (ctx, x, y, width, height, radius) => {
    if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
    
    // Enable anti-aliasing
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  };

  const handleDownloadCard = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High resolution settings - 4x for print quality
    const scale = 4;
    const cardWidth = 800 * scale;
    const cardHeight = 1000 * scale;
    canvas.width = cardWidth;
    canvas.height = cardHeight;

    // Enable high quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textRendering = 'optimizeLegibility';
    ctx.letterSpacing = '0.5px';

    // Scale all drawing operations
    ctx.scale(scale, scale);

    // === Background: high quality gradient ===
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1000);
    bgGradient.addColorStop(0, "#e0e7ff");
    bgGradient.addColorStop(1, "#f3e8ff");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 1000);

    // === Header: crisp gradient ===
    const headerHeight = 120;
    const headerGradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    headerGradient.addColorStop(0, "#6366f1");
    headerGradient.addColorStop(1, "#8b5cf6");
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 0, 0, 800, headerHeight, 20);
    ctx.fill();

    // Header text with better typography
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px 'Arial', 'Helvetica', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Ripple Card", 400, 50);
    ctx.font = "20px 'Arial', 'Helvetica', sans-serif";
    ctx.fillText("Spreading Kindness Everywhere", 400, 85);

    // === Centered Avatar Section ===
    const avatarY = 180;
    
    // Avatar background circle with shadow
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.arc(400, avatarY, 65, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowColor = "transparent"; // Reset shadow

    const loadAndDrawAvatar = () => {
      let avatarSrc = null;
      
      if (user?.custom_avatar) {
        avatarSrc = user.custom_avatar;
      } else if (user?.profile_image_path) {
        avatarSrc = user.profile_image_path;
      } else if (user?.avatar_id) {
        import('@/utils/avatars').then(({ getAvatarById }) => {
          const avatar = getAvatarById(user.avatar_id);
          if (avatar?.image) {
            avatarSrc = avatar.image;
          }
          drawAvatarImage(avatarSrc);
        }).catch(() => {
          drawAvatarImage(null);
        });
        return;
      }
      
      drawAvatarImage(avatarSrc);
    };

    const drawAvatarImage = (avatarSrc) => {
      if (avatarSrc) {
        const avatarImg = new Image();
        avatarImg.crossOrigin = "anonymous";
        avatarImg.onload = () => {
          try {
            // Create circular clipping path for crisp edges
            ctx.save();
            ctx.beginPath();
            ctx.arc(400, avatarY, 60, 0, 2 * Math.PI);
            ctx.clip();
            
            // Draw the avatar image with high quality scaling
            ctx.drawImage(avatarImg, 340, avatarY - 60, 120, 120);
            ctx.restore();
            
            continueDrawing();
          } catch (error) {
            drawFallbackAvatar();
          }
        };
        avatarImg.onerror = () => {
          drawFallbackAvatar();
        };
        avatarImg.src = avatarSrc;
      } else {
        drawFallbackAvatar();
      }
    };

    const drawFallbackAvatar = () => {
      // High quality fallback avatar
      ctx.font = "bold 70px 'Arial'";
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👤", 400, avatarY);
      continueDrawing();
    };

    const continueDrawing = () => {
      // Name with better typography
      const nameY = avatarY + 100;
      ctx.font = "bold 36px 'Arial', 'Helvetica', sans-serif";
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(userProfile.nickname, 400, nameY);

      // ID Badge with shadow
      const badgeY = nameY + 45;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      roundRect(ctx, 250, badgeY, 300, 45, 25);
      ctx.fill();
      ctx.shadowColor = "transparent";
      
      ctx.font = "bold 18px 'Monaco', 'Menlo', 'Ubuntu Mono', monospace";
      ctx.fillStyle = "#6366f1";
      ctx.textBaseline = "middle";
      ctx.fillText(`ID: ${rippleId}`, 400, badgeY + 22.5);

      // === Centered QR Code Section ===
      const qrY = badgeY + 85;
      
      // QR title
      ctx.font = "bold 24px 'Arial', 'Helvetica', sans-serif";
      ctx.fillStyle = "#4b5563";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Scan to Track This Ripple", 400, qrY);

      // QR background with shadow
      const qrSize = 220;
      const qrX = 400 - qrSize / 2;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      roundRect(ctx, qrX, qrY + 25, qrSize, qrSize, 20);
      ctx.fill();
      ctx.shadowColor = "transparent";

      // Draw high quality QR code
      const qrCanvas = qrRef.current?.querySelector('canvas');
      if (qrCanvas) {
        // Create a temporary canvas for QR code upscaling
        const tempQrCanvas = document.createElement('canvas');
        const tempQrCtx = tempQrCanvas.getContext('2d');
        if (tempQrCtx) {
          tempQrCanvas.width = qrSize * scale;
          tempQrCanvas.height = qrSize * scale;
          tempQrCtx.imageSmoothingEnabled = false; // Keep QR code crisp
          tempQrCtx.drawImage(qrCanvas, 0, 0, qrSize * scale, qrSize * scale);
          
          // Draw the high-res QR code
          ctx.drawImage(tempQrCanvas, qrX + 10, qrY + 45, qrSize - 20, qrSize - 20);
        }
      }

      // URL below QR
      const urlY = qrY + qrSize + 60;
      ctx.font = "14px 'Monaco', 'Menlo', 'Ubuntu Mono', monospace";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(fullUrl, 400, urlY);

      // === Message Box ===
      const messageY = urlY + 45;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      roundRect(ctx, 80, messageY, 640, 90, 15);
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.font = "bold 16px 'Arial', 'Helvetica', sans-serif";
      ctx.fillStyle = "#4b5563";
      ctx.textAlign = "center";
      ctx.fillText("My Ripple Message:", 400, messageY + 30);
      ctx.font = "italic 22px 'Arial', 'Helvetica', sans-serif";
      ctx.fillStyle = "#6366f1";
      ctx.fillText('"Kindness creates waves of change"', 400, messageY + 65);

      // === Footer ===
      const footerY = messageY + 130;
      ctx.font = "bold 20px 'Arial', 'Helvetica', sans-serif";
      ctx.fillStyle = "#6366f1";
      ctx.textAlign = "center";
      ctx.fillText("https://kindnessripple.pms.mishainfotech.com", 400, footerY);

      // === Generate and Download ===
      setTimeout(() => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ripple-card-${rippleId}-high-quality.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 1.0); // Maximum quality
      }, 100);
    };

    // Start loading avatar
    loadAndDrawAvatar();
  };

  // Download QR code with high quality
  const handleDownloadQR = (rippleId: string, qrUrl: string) => {
    try {
      // Create a high-resolution canvas for the QR code
      const scale = 4; // 4x resolution for crisp output
      const outputSize = 800; // Final size in pixels
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return;
      }

      // Set high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Get the QR code canvas from the ref
      const qrCanvas = qrRef.current?.querySelector('canvas');
      if (qrCanvas) {
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);
        
        // Draw the QR code at high resolution
        ctx.drawImage(qrCanvas, 0, 0, outputSize, outputSize);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ripple-qr-${rippleId}-high-quality.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 1.0); // Maximum quality
      } else {
        // Fallback: generate QR code directly
        const QRCode = require('qrcode.react');
        // This is a fallback - the QR should already be rendered
        console.warn('QR canvas not found');
      }
    } catch (error: any) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleShareCard = async () => {
    const shareText = `Check out my Ripple Card! I'm ${userProfile.nickname} spreading kindness with ID: ${rippleId}. Join the movement! 🌊`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Ripple Card",
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareText + " " + fullUrl);
        }
      }
    } else {
      copyToClipboard(shareText + " " + fullUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Share text copied to clipboard!");
    });
  };

  const { isActive, tutorialSteps, startTutorial, completeTutorial, skipTutorial } = usePageTutorial({
    storageKey: "ripple_card_tutorial_completed",
    steps: rippleCardTutorialSteps,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Tutorial Component */}
      <KidFriendlyTutorial
        isActive={isActive}
        steps={convertStepsToTutorialSteps(tutorialSteps)}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        storageKey="ripple_card_tutorial_completed"
      />
      
      <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 max-w-6xl mx-auto">
        {/* Header - Dashboard Style */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
              Your Digital Ripple Card
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Share your unique card to spread kindness
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        <Card className="w-full shadow-2xl border-0 overflow-hidden" data-tutorial-target="ripple-card-display">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 sm:p-4 text-center text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-1">Ripple Card</h2>
            <p className="text-indigo-100 text-xs sm:text-sm">Spreading Kindness Everywhere</p>
          </div>
          
          <CardContent className="p-3 sm:p-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-3 sm:p-4">
              {/* Main Content Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
                {/* Left Side - Avatar and Name */}
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 flex-1 w-full sm:w-auto">
                  {/* Avatar */}
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-lg">
                    <LoggedInUserAvatar size="w-12 h-12 sm:w-16 sm:h-16"/>
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                      {userProfile.nickname}
                    </h2>
                    <div className="inline-block bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
                      <p className="text-xs sm:text-sm font-mono text-indigo-600 font-semibold">
                        ID: {userProfile.ripple_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="flex flex-col items-center space-y-2 flex-1 w-full sm:w-auto" data-tutorial-target="qr-code">
                  <p className="text-xs font-medium text-slate-600">
                    Scan to Track This Ripple
                  </p>
                  <div 
                    ref={qrRef}
                    className="bg-white p-2 sm:p-3 rounded-xl shadow-lg border-2 border-indigo-100 flex items-center justify-center"
                  >
                    {/* High resolution QR code */}
                    <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px]">
                      <QRCodeCanvas 
                        value={fullUrl}
                        size={400} // Larger base size for better quality
                        level="H" // Highest error correction
                        includeMargin={true}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          imageRendering: 'crisp-edges'
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownloadQR(rippleId, fullUrl)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <Download className="h-3 w-3 mr-1 sm:mr-2" />
                    <span className="text-xs">Download QR</span>
                  </Button>
                  <p className="text-xs text-slate-500 max-w-xs break-all text-center">
                    {fullUrl}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="mt-3 sm:mt-4 bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  My Ripple Message:
                </p>
                <p className="text-xs sm:text-sm italic text-indigo-600">
                  "Kindness creates waves of change"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Instructions */}
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg text-slate-800">
              How to Use Your Ripple Card
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {[
              { 
                step: "1️⃣", 
                title: "Share your QR code", 
                desc: "Let others scan your code when you pass on a kindness act" 
              },
              { 
                step: "2️⃣", 
                title: "Track your ripples", 
                desc: "See where your kindness travels on the interactive journey map" 
              },
              { 
                step: "3️⃣", 
                title: "Earn badges", 
                desc: "Complete challenges and spread more kindness to unlock rewards" 
              },
            ].map(({ step, title, desc }) => (
              <div 
                key={step} 
                className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-slate-50 to-indigo-50 hover:shadow-md transition-shadow"
              >
                <div className="text-xl sm:text-2xl flex-shrink-0">{step}</div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm">{title}</p>
                  <p className="text-slate-600 text-xs mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <Button 
            onClick={handleDownloadCard}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
            size="sm"
          >
            <Download className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Download High-Quality Card
          </Button>
          <Button 
            onClick={handleShareCard}
            data-tutorial-target="share-button"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
            size="sm"
          >
            <Share2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Invite a Friend
          </Button>
        </div>

        
      </div>
    </div>
  );
};

export default RippleCard;