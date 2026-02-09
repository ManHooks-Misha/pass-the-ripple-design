import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { encryptRippleId } from '@/utils/encryption';
import { PageHeader } from '@/components/admin/PageHeader';
import { LoadingState } from '@/components/admin/LoadingState';
import { ProfileView } from '@/components/profile/ProfileView';
import { useUserDetailProfile } from '@/hooks/useUserDetailProfile';

export default function AdminUserProfileDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, activity, loading, error } = useUserDetailProfile(userId);

  const handleShare = async (rippleId: string, nickname?: string) => {
    if (!rippleId) return;
   
    const encryptedRippleId = encryptRippleId(rippleId);
    const shareUrl = `${window.location.origin}/age-gate?ref=${encryptedRippleId}`;
   
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${nickname || 'User'}'s Profile`,
          text: 'Check out this user profile on Ripple Effect',
          url: shareUrl,
        });
        toast({
          title: 'Shared Successfully',
          description: 'Profile link has been shared',
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.log('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied',
          description: 'Profile link has been copied to clipboard',
        });
      } catch (err) {
        console.log('Error copying:', err);
      }
    }
  };

  const handleCopyRippleId = async (rippleId: string) => {
    if (!rippleId) return;
   
    try {
      await navigator.clipboard.writeText(rippleId);
      toast({
        title: 'Copied',
        description: 'Ripple ID copied to clipboard',
      });
    } catch (err) {
      console.log('Error copying:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading user profile..." />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">User Not Found</h2>
          <p className="text-gray-600 text-sm">The requested user could not be found.</p>
          <Button onClick={() => navigate('/admin/manage-users')} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/manage-users')}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        
        <PageHeader
          title="User Profile"
          description="Complete profile information and activity overview"
        />
      </div>

      {/* Profile View Component */}
      <ProfileView
        user={user}
        activity={activity}
        onShare={handleShare}
        onCopyRippleId={handleCopyRippleId}
        showQRCode={true}
        showShareButtons={true}
        showReferralInfo={true}
        showJourneyTab={true}
        visibleTabs={['details', 'activity', 'content', 'timeline', 'journey']}
      />
    </div>
  );
}