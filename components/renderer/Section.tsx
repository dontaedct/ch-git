/**
 * Section Renderer Component
 */

import React from 'react';

export interface SectionProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  backgroundColor = 'transparent',
  padding = 'medium',
  className = '',
  id
}) => {
  const paddingClasses = {
    none: '',
    small: 'py-4 px-4',
    medium: 'py-8 px-6',
    large: 'py-12 px-8',
    xl: 'py-16 px-10'
  };

  return (
    <section
      id={id}
      className={`section ${paddingClasses[padding]} ${className}`}
      style={{ backgroundColor }}
    >
      {children}
    </section>
  );
};

export default Section;