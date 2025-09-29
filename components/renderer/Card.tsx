/**
 * Card Component
 * 
 * Displays a content card with image, title, and description
 */

import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  style?: 'elevated' | 'outline' | 'glass' | 'minimal';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  link,
  style = 'elevated',
  className = ''
}) => {
  const getStyleClasses = () => {
    switch (style) {
      case 'outline':
        return 'border-2 border-gray-200 bg-white';
      case 'glass':
        return 'bg-white/10 backdrop-blur-sm border border-white/20';
      case 'minimal':
        return 'bg-transparent border-none';
      default:
        return 'bg-white shadow-lg hover:shadow-xl';
    }
  };

  const CardContent = () => (
    <div className={`rounded-lg p-6 transition-all duration-200 ${getStyleClasses()} ${className}`}>
      {image && (
        <div className="mb-4">
          <img
            src={image}
            alt={title || 'Card image'}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      {title && (
        <h3 className={`text-xl font-semibold mb-2 ${style === 'glass' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={`${style === 'glass' ? 'text-white/90' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        className="block hover:scale-105 transition-transform duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardContent />
      </a>
    );
  }

  return <CardContent />;
};

export default Card;
