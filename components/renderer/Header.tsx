/**
 * Header Renderer Component
 */

import React from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  logo?: {
    src: string;
    alt: string;
  };
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  navigation = [],
  logo,
  className = ''
}) => {
  return (
    <header className={`header bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {logo && (
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 w-auto"
              />
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>

          {navigation.length > 0 && (
            <nav className="flex space-x-6">
              {navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`text-sm font-medium ${
                    item.active
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;