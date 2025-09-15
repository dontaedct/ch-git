/**
 * Mobile Navigation Component for Hero Tasks
 * Created: 2025-09-08T15:40:02.000Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Plus, 
  Search, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  currentView: 'dashboard' | 'create' | 'search' | 'analytics' | 'settings';
  onViewChange: (view: string) => void;
  className?: string;
}

export function MobileNav({ currentView, onViewChange, className }: MobileNavProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tasks',
      icon: Home,
      active: currentView === 'dashboard'
    },
    {
      id: 'create',
      label: 'Create',
      icon: Plus,
      active: currentView === 'create'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      active: currentView === 'search'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: currentView === 'analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: currentView === 'settings'
    }
  ];

  return (
    <nav className={cn(
      "mobile-nav",
      "flex items-center justify-around",
      "bg-white border-t border-gray-200",
      "px-2 py-1",
      "shadow-lg",
      className
    )}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "mobile-nav-item",
              "flex flex-col items-center justify-center",
              "p-2 rounded-lg",
              "transition-colors duration-200",
              "touch-manipulation",
              "min-h-[44px] min-w-[44px]",
              item.active 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
            aria-label={item.label}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showMenu?: boolean;
  className?: string;
}

export function MobileHeader({ 
  title, 
  onBack, 
  onMenu, 
  showBack = false, 
  showMenu = false,
  className 
}: MobileHeaderProps) {
  return (
    <header className={cn(
      "mobile-header",
      "flex items-center justify-between",
      "px-4 py-3",
      "bg-white border-b border-gray-200",
      "sticky top-0 z-40",
      className
    )}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="touch-manipulation p-2"
            aria-label="Go back"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        <h1 className="mobile-heading text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>
      
      {showMenu && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenu}
          className="touch-manipulation p-2"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
    </header>
  );
}

interface MobileFloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}

export function MobileFloatingActionButton({ 
  onClick, 
  icon, 
  label,
  className 
}: MobileFloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mobile-fab",
        "fixed bottom-20 right-4 z-50",
        "bg-blue-600 hover:bg-blue-700",
        "text-white rounded-full shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-200",
        "touch-manipulation",
        "min-h-[56px] min-w-[56px]",
        label ? "px-4 gap-2" : "p-3",
        className
      )}
      aria-label={label || "Floating action button"}
    >
      {icon}
      {label && (
        <span className="text-sm font-medium hidden sm:inline">
          {label}
        </span>
      )}
    </button>
  );
}

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children, 
  className 
}: MobileBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className={cn(
        "mobile-bottom-sheet",
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white rounded-t-xl shadow-xl",
        "max-h-[80vh] overflow-hidden",
        "transform transition-transform duration-300",
        isOpen ? "translate-y-0" : "translate-y-full",
        className
      )}>
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="mobile-heading text-lg font-semibold text-gray-900">
              {title}
            </h2>
          </div>
        )}
        
        {/* Content */}
        <div className="mobile-scroll overflow-y-auto max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </>
  );
}

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export function MobileSearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...",
  onFocus,
  onBlur,
  className 
}: MobileSearchBarProps) {
  return (
    <div className={cn(
      "mobile-search-bar",
      "relative",
      className
    )}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "mobile-input",
          "w-full px-4 py-3 pl-10",
          "bg-gray-50 border border-gray-200",
          "rounded-lg text-base",
          "focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "touch-manipulation",
          "placeholder-gray-500"
        )}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}

export default MobileNav;
