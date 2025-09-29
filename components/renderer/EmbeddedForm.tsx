/**
 * Embedded Form Renderer Component
 */

import React from 'react';

export interface EmbeddedFormProps {
  formId: string;
  title?: string;
  className?: string;
}

const EmbeddedForm: React.FC<EmbeddedFormProps> = ({
  formId,
  title,
  className = ''
}) => {
  return (
    <div className={`embedded-form ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <p className="text-gray-600 text-center">
          Embedded form placeholder for form ID: {formId}
        </p>
        <p className="text-sm text-gray-500 text-center mt-2">
          This would render the actual form component in production
        </p>
      </div>
    </div>
  );
};

export default EmbeddedForm;