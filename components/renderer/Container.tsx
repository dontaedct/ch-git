/**
 * Container Component
 * 
 * Responsive container with max-width
 */

import React from 'react';

interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  padding = 'medium',
  children,
  className = ''
}) => {
  const getMaxWidthClasses = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-3xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-6xl';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'px-4';
      case 'large':
        return 'px-8';
      default:
        return 'px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className={`mx-auto ${getMaxWidthClasses()} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
