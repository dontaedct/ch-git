/**
 * Badge Component
 * 
 * Small status or label badge
 */

import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  color = 'primary',
  size = 'medium',
  className = ''
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'bg-gray-100 text-gray-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-medium
        ${getColorClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {text}
    </span>
  );
};

export default Badge;
