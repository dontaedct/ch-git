/**
 * Spacer Component
 * 
 * Provides vertical spacing between elements
 */

import React from 'react';

interface SpacerProps {
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Spacer: React.FC<SpacerProps> = ({
  height = 'md',
  className = ''
}) => {
  const getHeightClasses = () => {
    switch (height) {
      case 'xs':
        return 'h-2';
      case 'sm':
        return 'h-4';
      case 'md':
        return 'h-8';
      case 'lg':
        return 'h-12';
      case 'xl':
        return 'h-16';
      case '2xl':
        return 'h-24';
      default:
        return 'h-8';
    }
  };

  return (
    <div className={`${getHeightClasses()} ${className}`} />
  );
};

export default Spacer;
