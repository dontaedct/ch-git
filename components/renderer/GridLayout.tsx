/**
 * GridLayout Component
 * 
 * CSS Grid container for layout
 */

import React from 'react';

interface GridLayoutProps {
  columns?: number;
  gap?: 'small' | 'medium' | 'large';
  responsive?: boolean;
  children: React.ReactNode;
  className?: string;
}

const GridLayout: React.FC<GridLayoutProps> = ({
  columns = 2,
  gap = 'medium',
  responsive = true,
  children,
  className = ''
}) => {
  const getGapClasses = () => {
    switch (gap) {
      case 'small':
        return 'gap-2';
      case 'large':
        return 'gap-8';
      default:
        return 'gap-4';
    }
  };

  const getGridClasses = () => {
    if (!responsive) {
      return `grid-cols-${columns}`;
    }

    // Responsive grid classes
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 5:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default:
        return `grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)}`;
    }
  };

  return (
    <div className={`grid ${getGridClasses()} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default GridLayout;
