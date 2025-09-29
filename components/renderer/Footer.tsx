/**
 * Footer Component
 * 
 * Displays a page footer with links and copyright
 */

import React from 'react';

interface Link {
  text: string;
  url: string;
}

interface LinkSection {
  title: string;
  links: Link[];
}

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface FooterProps {
  logo?: string;
  description?: string;
  links?: LinkSection[];
  social?: SocialLink[];
  copyright?: string;
  layout?: 'columns' | 'centered' | 'minimal';
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  logo,
  description,
  links = [],
  social = [],
  copyright,
  layout = 'columns',
  className = ''
}) => {
  const renderColumns = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Logo and Description */}
      <div className="lg:col-span-1">
        {logo && (
          <div className="text-2xl font-bold text-gray-900 mb-4">
            {logo}
          </div>
        )}
        {description && (
          <p className="text-gray-600 mb-4">
            {description}
          </p>
        )}
        {social.length > 0 && (
          <div className="flex space-x-4">
            {social.map((socialLink, index) => (
              <a
                key={index}
                href={socialLink.url}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {socialLink.icon || socialLink.platform}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Link Sections */}
      {links.map((section, index) => (
        <div key={index}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {section.title}
          </h3>
          <ul className="space-y-2">
            {section.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <a
                  href={link.url}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderCentered = () => (
    <div className="text-center">
      {logo && (
        <div className="text-3xl font-bold text-gray-900 mb-4">
          {logo}
        </div>
      )}
      {description && (
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      
      {links.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          {links.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-900 mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      {social.length > 0 && (
        <div className="flex justify-center space-x-4 mb-6">
          {social.map((socialLink, index) => (
            <a
              key={index}
              href={socialLink.url}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {socialLink.icon || socialLink.platform}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div className="text-center">
      {logo && (
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {logo}
        </div>
      )}
      {social.length > 0 && (
        <div className="flex justify-center space-x-4 mb-4">
          {social.map((socialLink, index) => (
            <a
              key={index}
              href={socialLink.url}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {socialLink.icon || socialLink.platform}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (layout) {
      case 'centered':
        return renderCentered();
      case 'minimal':
        return renderMinimal();
      default:
        return renderColumns();
    }
  };

  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
        
        {copyright && (
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              {copyright}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
