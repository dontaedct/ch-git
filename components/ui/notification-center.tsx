/**
 * @fileoverview HT-008.10.2: Enterprise-Grade NotificationCenter Component
 * @module components/ui/notification-center
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.2 - Enterprise-Grade Component Library
 * Focus: Real-time notification center with categories, actions, and persistence
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (enterprise notification management)
 */

'use client';

import * as React from 'react';
import { Bell, Check, X, MoreHorizontal, Filter, CheckCheck, Trash2, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useTokens } from '@/lib/design-tokens';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category?: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  avatar?: {
    src?: string;
    fallback: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
  className?: string;
  title?: string;
  showFilters?: boolean;
  showCategories?: boolean;
  maxHeight?: string;
  autoMarkAsRead?: boolean;
  autoMarkDelay?: number;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'system':
      return '🔧';
    default:
      return 'ℹ️';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50';
    case 'error':
      return 'border-red-200 bg-red-50';
    case 'system':
      return 'border-blue-200 bg-blue-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
}> = ({ notification, onMarkAsRead, onArchive, onDelete, onAction }) => {
  const { tokens } = useTokens();
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type)} ${notification.read ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Priority Indicator */}
          <div className={`w-1 h-full rounded-full ${getPriorityColor(notification.priority)}`} />
          
          {/* Avatar */}
          {notification.avatar && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.avatar.src} />
              <AvatarFallback>{notification.avatar.fallback}</AvatarFallback>
            </Avatar>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  {notification.category && (
                    <Badge variant="outline" className="text-xs">
                      {notification.category}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {notification.priority}
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1">
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-1">
                    {notification.actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => onAction(notification.id, action.id)}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!notification.read && (
                      <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onArchive(notification.id)}>
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(notification.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  onAction,
  className,
  title = 'Notifications',
  showFilters = true,
  showCategories = true,
  maxHeight = '600px',
  autoMarkAsRead = false,
  autoMarkDelay = 5000,
}: NotificationCenterProps) {
  const { tokens } = useTokens();
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([]);
  
  // Auto-mark as read functionality
  React.useEffect(() => {
    if (autoMarkAsRead) {
      const unreadNotifications = notifications.filter(n => !n.read);
      unreadNotifications.forEach(notification => {
        setTimeout(() => {
          onMarkAsRead(notification.id);
        }, autoMarkDelay);
      });
    }
  }, [notifications, autoMarkAsRead, autoMarkDelay, onMarkAsRead]);
  
  const filteredNotifications = notifications.filter(notification => {
    if (notification.archived) return false;
    
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
    
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const categories = Array.from(new Set(notifications.map(n => n.category).filter(Boolean)));
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };
  
  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, id]);
    } else {
      setSelectedNotifications(prev => prev.filter(n => n !== id));
    }
  };
  
  const handleBulkAction = (action: 'read' | 'archive' | 'delete') => {
    selectedNotifications.forEach(id => {
      switch (action) {
        case 'read':
          onMarkAsRead(id);
          break;
        case 'archive':
          onArchive(id);
          break;
        case 'delete':
          onDelete(id);
          break;
      }
    });
    setSelectedNotifications([]);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>{title}</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('read')}
                >
                  Mark as read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                >
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Mark all as read
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="flex items-center space-x-4">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {showCategories && categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Category
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setCategoryFilter(category!)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
        
        {/* Bulk Selection */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedNotifications.length === filteredNotifications.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select all ({selectedNotifications.length}/{filteredNotifications.length})
            </span>
          </div>
        )}
        
        {/* Notifications List */}
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onCheckedChange={(checked) => handleSelectNotification(notification.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onArchive={onArchive}
                      onDelete={onDelete}
                      onAction={onAction}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'read' ? 'No read notifications' : 
                   'No notifications available'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
