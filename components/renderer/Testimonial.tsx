/**
 * Testimonial Component
 * 
 * Displays a customer testimonial with quote and author
 */

import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  title?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  layout?: 'card' | 'minimal' | 'featured';
  className?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  title,
  company,
  avatar,
  rating,
  layout = 'card',
  className = ''
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const renderMinimal = () => (
    <div className={`text-center ${className}`}>
      <blockquote className="text-lg italic text-gray-700 mb-4">
        "{quote}"
      </blockquote>
      <div className="flex items-center justify-center space-x-2">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          {(title || company) && (
            <div className="text-sm text-gray-600">
              {title && company ? `${title}, ${company}` : title || company}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFeatured = () => (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg ${className}`}>
      <div className="flex items-start space-x-4">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-16 h-16 rounded-full border-4 border-white/20"
          />
        )}
        <div className="flex-1">
          {rating && (
            <div className="flex mb-2">
              {renderStars(rating)}
            </div>
          )}
          <blockquote className="text-lg mb-4">
            "{quote}"
          </blockquote>
          <div>
            <div className="font-semibold">{author}</div>
            {(title || company) && (
              <div className="text-white/80">
                {title && company ? `${title}, ${company}` : title || company}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
      {rating && (
        <div className="flex mb-4">
          {renderStars(rating)}
        </div>
      )}
      <blockquote className="text-gray-700 mb-4 italic">
        "{quote}"
      </blockquote>
      <div className="flex items-center space-x-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          {(title || company) && (
            <div className="text-sm text-gray-600">
              {title && company ? `${title}, ${company}` : title || company}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (layout) {
    case 'minimal':
      return renderMinimal();
    case 'featured':
      return renderFeatured();
    default:
      return renderCard();
  }
};

export default Testimonial;
