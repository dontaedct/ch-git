/**
 * FeatureGrid Component
 * 
 * Displays a grid of features with icons and descriptions
 */

import React from 'react';

interface Feature {
  icon?: string;
  title: string;
  description: string;
  link?: string;
}

interface FeatureGridProps {
  title?: string;
  description?: string;
  features: Feature[];
  columns?: number;
  layout?: 'cards' | 'icons' | 'text' | 'minimal';
  className?: string;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({
  title,
  description,
  features,
  columns = 3,
  layout = 'cards',
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const renderFeature = (feature: Feature, index: number) => {
    const baseClasses = "p-6 rounded-lg";
    
    switch (layout) {
      case 'minimal':
        return (
          <div key={index} className={`${baseClasses} text-center`}>
            {feature.icon && (
              <div className="text-4xl mb-4">{feature.icon}</div>
            )}
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        );
      
      case 'icons':
        return (
          <div key={index} className={`${baseClasses} text-center`}>
            {feature.icon && (
              <div className="text-6xl mb-4">{feature.icon}</div>
            )}
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        );
      
      case 'text':
        return (
          <div key={index} className={`${baseClasses}`}>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        );
      
      default: // cards
        return (
          <div key={index} className={`${baseClasses} bg-white shadow-md hover:shadow-lg transition-shadow`}>
            {feature.icon && (
              <div className="text-4xl mb-4">{feature.icon}</div>
            )}
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            {feature.link && (
              <a 
                href={feature.link} 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Learn more →
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-8`}>
          {features.map(renderFeature)}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
