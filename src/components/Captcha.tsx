import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Shield } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  error?: string;
  disabled?: boolean;
  resetTrigger?: number; // Add reset trigger prop
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify, error, disabled = false, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Generate random captcha text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsValid(false);
    onVerify(false);
  };

  // Draw captcha on canvas
  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add some rotation and distortion to each character
    for (let i = 0; i < captchaText.length; i++) {
      const char = captchaText[i];
      const x = (canvas.width / captchaText.length) * (i + 0.5);
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Add some noise dots
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
  };

  // Handle user input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    const valid = value.toLowerCase() === captchaText.toLowerCase();
    setIsValid(valid);
    onVerify(valid);
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Reset captcha when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      generateCaptcha();
    }
  }, [resetTrigger]);

  // Redraw captcha when text changes
  useEffect(() => {
    if (captchaText) {
      drawCaptcha();
    }
  }, [captchaText]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Security Verification <span className="text-red-500">*</span>
      </Label>
      
      <div className="flex items-center gap-3">
        {/* Captcha Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={150}
            height={50}
            className="border border-gray-300 rounded-md bg-gray-50"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateCaptcha}
            disabled={disabled}
            className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Input Field */}
        <div className="flex-1">
          <Input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Enter the code above"
            disabled={disabled}
            className={`transition-all duration-200 ${
              error ? "border-red-500 focus:border-red-500" : 
              isValid ? "border-green-500 focus:border-green-500" : 
              "focus:border-primary"
            }`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}

      {/* Success Message */}
      {isValid && userInput && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-green-500 rounded-full"></span>
          Verification successful
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Please enter the characters shown in the image above to verify you're human.
      </p>
    </div>
  );
};

export default Captcha;
