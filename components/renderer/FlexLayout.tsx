/**
 * FlexLayout Component
 * 
 * Flexbox container for layout
 */

import React from 'react';

interface FlexLayoutProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  align?: 'stretch' | 'start' | 'center' | 'end';
  wrap?: boolean;
  gap?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
}

const FlexLayout: React.FC<FlexLayoutProps> = ({
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  wrap = false,
  gap = 'medium',
  children,
  className = ''
}) => {
  const getDirectionClasses = () => {
    switch (direction) {
      case 'column':
        return 'flex-col';
      case 'row-reverse':
        return 'flex-row-reverse';
      case 'column-reverse':
        return 'flex-col-reverse';
      default:
        return 'flex-row';
    }
  };

  const getJustifyClasses = () => {
    switch (justify) {
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'space-between':
        return 'justify-between';
      case 'space-around':
        return 'justify-around';
      default:
        return 'justify-start';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'start':
        return 'items-start';
      case 'center':
        return 'items-center';
      case 'end':
        return 'items-end';
      default:
        return 'items-stretch';
    }
  };

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

  return (
    <div 
      className={`
        flex 
        ${getDirectionClasses()} 
        ${getJustifyClasses()} 
        ${getAlignClasses()} 
        ${wrap ? 'flex-wrap' : 'flex-nowrap'} 
        ${getGapClasses()} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default FlexLayout;
