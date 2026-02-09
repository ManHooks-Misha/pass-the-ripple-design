import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Mail, Calendar, MapPin } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import { Avatar } from '@/components/admin/Avatar';
import { encryptRippleId } from '@/utils/encryption';
import { User } from '@/types/user';
import { UserAvatarOnly } from '../UserIdentity';

interface ProfileHeaderProps {
  user: User;
  onShare: (rippleId: string, nickname: string) => void;
  onCopyRippleId: (rippleId: string) => void;
  showQRCode?: boolean;
  showShareButtons?: boolean;
  formatAgeGroup: (ageGroup: string | null) => string;
  getFinalStatus: (user: User) => string;
}

const InfoItem = ({ icon: Icon, label, value, className = "" }: { 
  icon?: React.ElementType; 
  label: string; 
  value: string | React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />}
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
    <div className="text-xs sm:text-sm text-gray-900 font-medium break-words">{value}</div>
  </div>
);

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onShare,
  onCopyRippleId,
  showQRCode = true,
  showShareButtons = true,
  formatAgeGroup,
  getFinalStatus
}) => {
  return (
    <Card className="mb-4 sm:mb-6 shadow-sm overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <CardContent className="p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-8">
          {/* Left: Avatar and Info */}
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 flex-1 w-full">
            <UserAvatarOnly
            nickname={user.nickname}
            profile_image_path={user.profile_image_path}
            avatar_id={user?.avatar_id}
            size="w-20 h-20 sm:w-28 sm:h-28 shadow-lg" 
            />
            
            <div className="flex-1 space-y-3 sm:space-y-4 w-full sm:w-auto">
              {/* Name and Badges */}
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{user.nickname}</h2>
                  <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <Badge 
                    variant={getFinalStatus(user) === "active" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {getFinalStatus(user).charAt(0).toUpperCase() + getFinalStatus(user).slice(1)}
                  </Badge>
                </div>
                {user.full_name && (
                  <p className="text-sm sm:text-base text-gray-700 font-medium mb-2 sm:mb-3">{user.full_name}</p>
                )}
                
                {/* Ripple ID and Share Button */}
                {user.ripple_id && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border break-all">
                      {user.ripple_id}
                    </span>
                    {showShareButtons && (
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => onCopyRippleId(user.ripple_id!)} 
                          size="sm" 
                          variant="outline" 
                          className="h-7 sm:h-8 px-2 text-xs sm:text-sm"
                          title="Copy Ripple ID"
                        >
                          <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Button>
                        <Button 
                          onClick={() => onShare(user.ripple_id!, user.nickname)} 
                          size="sm" 
                          variant="outline" 
                          className="h-7 sm:h-8 px-2 sm:px-3 gap-1 text-xs sm:text-sm"
                          title="Share Profile"
                        >
                          <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <InfoItem icon={Mail} label="Email" value={user.email} />
                <InfoItem icon={Calendar} label="Age Group" value={formatAgeGroup(user.age_group)} />
                {user.address && (
                  <InfoItem icon={MapPin} label="Location" value={user.address} className="sm:col-span-2" />
                )}
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
          {showQRCode && user.ripple_id && (
            <div className="flex-shrink-0 bg-white rounded-xl border-2 border-gray-200 shadow-md w-full sm:w-auto flex justify-center sm:justify-start">
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]">
                <QRCodeCanvas 
                  value={`${window.location.origin}/age-gate?ref=${encryptRippleId(user.ripple_id)}`}
                  size={150}
                  level="H"
                  includeMargin={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};