import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Mail, Link2, MessageCircle, Instagram, Linkedin } from "lucide-react";
import { shareStory } from "@/utils/shareStory";

interface ShareStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: { id: number; slug?: string; title: string };
}

export const ShareStoryDialog: React.FC<ShareStoryDialogProps> = ({
  open,
  onOpenChange,
  story,
}) => {
  const handleShare = async (platform: string) => {
    await shareStory(story, platform);
    // Don't close on copy, native share, or instagram (user might want to share to multiple platforms)
    if (platform === 'copy' || platform === 'native' || platform === 'instagram') {
      return;
    }
    // Close after opening external share window
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Story</DialogTitle>
          <DialogDescription>
            Share "{story.title}" on social media
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('native')}
          >
            <Share2 className="h-6 w-6" />
            <span className="text-xs">Share</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-6 w-6 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('x')}
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-xs">X</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('instagram')}
          >
            <Instagram className="h-6 w-6 text-pink-600" />
            <span className="text-xs">Instagram</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-6 w-6 text-blue-700" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageCircle className="h-6 w-6 text-green-600" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('email')}
          >
            <Mail className="h-6 w-6" />
            <span className="text-xs">Email</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => handleShare('copy')}
          >
            <Link2 className="h-6 w-6" />
            <span className="text-xs">Copy Link</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

