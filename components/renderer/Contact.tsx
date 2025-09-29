/**
 * Contact Component
 * 
 * Displays a contact section with form and info
 */

import React from 'react';

interface ContactInfo {
  type: 'email' | 'phone' | 'address' | 'hours';
  label: string;
  value: string;
  icon?: string;
}

interface ContactProps {
  title?: string;
  description?: string;
  formId?: string;
  contactInfo?: ContactInfo[];
  layout?: 'form-only' | 'info-only' | 'split';
  className?: string;
}

const Contact: React.FC<ContactProps> = ({
  title,
  description,
  formId,
  contactInfo = [],
  layout = 'split',
  className = ''
}) => {
  const renderContactInfo = () => (
    <div className="space-y-6">
      {contactInfo.map((info, index) => (
        <div key={index} className="flex items-start space-x-4">
          {info.icon && (
            <div className="text-2xl">{info.icon}</div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{info.label}</h3>
            <p className="text-gray-600">{info.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {formId ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Form ID: {formId}</p>
          <p className="text-sm text-gray-500 mt-2">
            This would render the embedded form component
          </p>
        </div>
      ) : (
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );

  const renderContent = () => {
    switch (layout) {
      case 'form-only':
        return renderForm();
      case 'info-only':
        return renderContactInfo();
      default: // split
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
              {renderContactInfo()}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Send us a Message</h3>
              {renderForm()}
            </div>
          </div>
        );
    }
  };

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
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
        
        {renderContent()}
      </div>
    </section>
  );
};

export default Contact;
