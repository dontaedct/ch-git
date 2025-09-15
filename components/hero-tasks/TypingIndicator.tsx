/**
 * Typing Indicator Component for Real-time Collaboration
 * 
 * Shows when users are typing in real-time with animated dots
 * and user identification.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TypingDots } from './TypingDots';

export interface TypingUser {
  userId: string;
  name?: string;
  avatar?: string;
  taskId: string;
}

export interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId?: string;
  className?: string;
}

export function TypingIndicator({ 
  typingUsers, 
  currentUserId,
  className = ''
}: TypingIndicatorProps) {
  const [visibleUsers, setVisibleUsers] = useState<TypingUser[]>([]);

  // Filter out current user and manage visibility
  useEffect(() => {
    const filtered = typingUsers.filter(user => user.userId !== currentUserId);
    setVisibleUsers(filtered);
  }, [typingUsers, currentUserId]);

  const getInitials = (name?: string, userId?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userId?.slice(0, 2).toUpperCase() || 'U';
  };

  const getTypingText = () => {
    if (visibleUsers.length === 0) return null;
    
    if (visibleUsers.length === 1) {
      return `${visibleUsers[0].name || visibleUsers[0].userId} is typing`;
    }
    
    if (visibleUsers.length === 2) {
      return `${visibleUsers[0].name || visibleUsers[0].userId} and ${visibleUsers[1].name || visibleUsers[1].userId} are typing`;
    }
    
    return `${visibleUsers.length} people are typing`;
  };

  if (visibleUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <div className="flex -space-x-1">
        {visibleUsers.slice(0, 3).map((user) => (
          <Avatar key={user.userId} className="w-6 h-6 border border-white">
            <AvatarImage src={user.avatar} alt={user.name || user.userId} />
            <AvatarFallback className="text-xs bg-gray-100">
              {getInitials(user.name, user.userId)}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {visibleUsers.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border border-white">
            +{visibleUsers.length - 3}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <span>{getTypingText()}</span>
        <TypingDots />
      </div>
    </div>
  );
}

export default TypingIndicator;
