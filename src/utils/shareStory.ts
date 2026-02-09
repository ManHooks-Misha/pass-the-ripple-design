import { toast } from "@/hooks/use-toast";

export const shareStory = async (story: { id: number; slug?: string; title: string }, platform: string) => {
  const storyIdentifier = story.slug || story.id;
  const storyUrl = `${window.location.origin}/story/${storyIdentifier}`;
  const shareText = `Check out this inspiring story: "${story.title}" on Pass The Ripple`;
  
  switch (platform) {
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + storyUrl)}`, '_blank');
      break;
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`, '_blank');
      break;
    case 'x':
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`, '_blank');
      break;
    case 'instagram':
      // Instagram doesn't support direct URL sharing, show message to copy link
      await navigator.clipboard.writeText(storyUrl);
      toast({
        title: "Link Copied!",
        description: "Copy the link and share it on Instagram",
      });
      break;
    case 'linkedin':
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}`, '_blank');
      break;
    case 'email':
      window.open(`mailto:?subject=${encodeURIComponent(`Inspiring Story: ${story.title}`)}&body=${encodeURIComponent(shareText + '\n\n' + storyUrl)}`, '_blank');
      break;
    case 'copy':
      await navigator.clipboard.writeText(storyUrl);
      toast({
        title: "Link Copied!",
        description: "Story link copied to clipboard",
      });
      break;
    case 'native':
      if (navigator.share) {
        try {
          await navigator.share({
            title: story.title,
            text: shareText,
            url: storyUrl,
          });
        } catch (err) {
          // User cancelled or error occurred
          if ((err as Error).name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        // Fallback to copy
        await navigator.clipboard.writeText(storyUrl);
        toast({
          title: "Link Copied!",
          description: "Story link copied to clipboard",
        });
      }
      break;
  }
};

