/**
 * CTA (Call to Action) Component
 * 
 * Displays a call-to-action section with buttons
 */

import React from 'react';

interface Button {
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline';
  openInNewTab?: boolean;
}

interface CTAProps {
  title?: string;
  description?: string;
  buttons: Button[];
  background?: 'gradient' | 'solid' | 'transparent';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

const CTA: React.FC<CTAProps> = ({
  title,
  description,
  buttons,
  background = 'gradient',
  alignment = 'center',
  className = ''
}) => {
  const getBackgroundClasses = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600';
      case 'solid':
        return 'bg-gray-900';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600';
    }
  };

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  const getButtonClasses = (style: string = 'primary') => {
    const baseClasses = 'inline-block px-6 py-3 rounded-lg font-semibold transition-colors duration-200';
    
    switch (style) {
      case 'secondary':
        return `${baseClasses} bg-white text-gray-900 hover:bg-gray-100`;
      case 'outline':
        return `${baseClasses} border-2 border-white text-white hover:bg-white hover:text-gray-900`;
      default:
        return `${baseClasses} bg-white text-gray-900 hover:bg-gray-100`;
    }
  };

  return (
    <section className={`py-16 ${getBackgroundClasses()} ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={getAlignmentClasses()}>
          {title && (
            <h2 className={`text-3xl font-bold mb-4 ${background === 'transparent' ? 'text-gray-900' : 'text-white'}`}>
              {title}
            </h2>
          )}
          
          {description && (
            <p className={`text-xl mb-8 ${background === 'transparent' ? 'text-gray-600' : 'text-white'}`}>
              {description}
            </p>
          )}
          
          <div className={`flex flex-wrap gap-4 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.url}
                className={getButtonClasses(button.style)}
                target={button.openInNewTab ? '_blank' : undefined}
                rel={button.openInNewTab ? 'noopener noreferrer' : undefined}
              >
                {button.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
