/**
 * Tabs Component
 * 
 * Tabbed content interface
 */

import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: string | React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  style?: 'default' | 'pills' | 'underline';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  style = 'default',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const getTabStyleClasses = () => {
    switch (style) {
      case 'pills':
        return 'bg-gray-100 rounded-lg p-1';
      case 'underline':
        return 'border-b border-gray-200';
      default:
        return 'bg-white border border-gray-200 rounded-lg';
    }
  };

  const getTabButtonClasses = (tabId: string) => {
    const isActive = activeTab === tabId;
    const baseClasses = 'px-4 py-2 font-medium transition-colors';
    
    switch (style) {
      case 'pills':
        return `${baseClasses} rounded-md ${
          isActive 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`;
      default:
        return `${baseClasses} ${
          isActive 
            ? 'bg-gray-50 text-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div className={`flex ${getTabStyleClasses()}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={getTabButtonClasses(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        {typeof activeTabContent === 'string' ? (
          <p className="text-gray-600">{activeTabContent}</p>
        ) : (
          activeTabContent
        )}
      </div>
    </div>
  );
};

export default Tabs;
