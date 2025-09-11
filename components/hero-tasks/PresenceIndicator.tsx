/**
 * Presence Indicator Component for Live Collaboration
 * 
 * Shows real-time presence indicators for users viewing/editing tasks
 * with avatar badges, status indicators, and user information.
 */

'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Badge } from '@ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import { User, Eye, Edit, Clock } from 'lucide-react';

export interface PresenceUser {
  userId: string;
  name?: string;
  avatar?: string;
  status: 'viewing' | 'editing' | 'typing';
  lastSeen: Date;
  currentTaskId?: string;
}

export interface PresenceIndicatorProps {
  users: PresenceUser[];
  maxVisible?: number;
  showTooltips?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusIcons = {
  viewing: Eye,
  editing: Edit,
  typing: Clock
};

const statusColors = {
  viewing: 'bg-blue-500',
  editing: 'bg-green-500',
  typing: 'bg-yellow-500'
};

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
};

export function PresenceIndicator({ 
  users, 
  maxVisible = 3, 
  showTooltips = true,
  size = 'md',
  className = ''
}: PresenceIndicatorProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  const getStatusIcon = (status: PresenceUser['status']) => {
    const Icon = statusIcons[status];
    return <Icon className="w-3 h-3" />;
  };

  const getStatusColor = (status: PresenceUser['status']) => {
    return statusColors[status];
  };

  const getInitials = (name?: string, userId?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userId?.slice(0, 2).toUpperCase() || 'U';
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 30) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return lastSeen.toLocaleDateString();
  };

  const renderUserAvatar = (user: PresenceUser, index: number) => {
    const avatarElement = (
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-white shadow-sm`}>
          <AvatarImage src={user.avatar} alt={user.name || user.userId} />
          <AvatarFallback className="text-xs font-medium bg-gray-100">
            {getInitials(user.name, user.userId)}
          </AvatarFallback>
        </Avatar>
        
        {/* Status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)} flex items-center justify-center`}>
          <div className="text-white text-[8px]">
            {getStatusIcon(user.status)}
          </div>
        </div>
      </div>
    );

    if (showTooltips) {
      return (
        <TooltipProvider key={user.userId}>
          <Tooltip>
            <TooltipTrigger asChild>
              {avatarElement}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-medium">
                  {user.name || user.userId}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {user.status} this task
                </div>
                <div className="text-xs text-gray-500">
                  Last seen: {formatLastSeen(user.lastSeen)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return avatarElement;
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div key={user.userId} className="relative">
            {renderUserAvatar(user, index)}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className={`${sizeClasses[size]} rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm`}>
            +{remainingCount}
          </div>
        )}
      </div>
      
      {users.length > 0 && (
        <div className="ml-2 text-sm text-gray-600">
          {users.length === 1 ? '1 person' : `${users.length} people`} viewing
        </div>
      )}
    </div>
  );
}

export default PresenceIndicator;
