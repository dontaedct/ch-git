/**
 * Divider Component
 * 
 * Displays a horizontal divider line
 */

import React from 'react';

interface DividerProps {
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: string;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({
  style = 'solid',
  thickness = 'medium',
  color,
  className = ''
}) => {
  const getStyleClasses = () => {
    switch (style) {
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      default:
        return 'border-solid';
    }
  };

  const getThicknessClasses = () => {
    switch (thickness) {
      case 'thin':
        return 'border-t';
      case 'thick':
        return 'border-t-2';
      default:
        return 'border-t';
    }
  };

  const getColorClasses = () => {
    if (color) {
      return `border-${color}`;
    }
    return 'border-gray-300';
  };

  return (
    <hr 
      className={`w-full ${getStyleClasses()} ${getThicknessClasses()} ${getColorClasses()} ${className}`}
      style={color ? { borderColor: color } : undefined}
    />
  );
};

export default Divider;
