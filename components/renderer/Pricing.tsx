/**
 * Pricing Component
 * 
 * Displays a pricing table with plans and features
 */

import React, { useState } from 'react';

interface Plan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonUrl: string;
}

interface PricingProps {
  title?: string;
  description?: string;
  plans: Plan[];
  layout?: 'cards' | 'table' | 'minimal';
  billing?: 'monthly' | 'yearly' | 'toggle';
  className?: string;
}

const Pricing: React.FC<PricingProps> = ({
  title,
  description,
  plans,
  layout = 'cards',
  billing = 'monthly',
  className = ''
}) => {
  const [isYearly, setIsYearly] = useState(billing === 'yearly');

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {plans.map((plan, index) => (
        <div
          key={index}
          className={`relative p-8 rounded-lg ${
            plan.popular
              ? 'bg-blue-600 text-white transform scale-105'
              : 'bg-white border border-gray-200'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-4xl font-bold">
                ${isYearly ? plan.price.yearly : plan.price.monthly}
              </span>
              <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          
          <a
            href={plan.buttonUrl}
            className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
              plan.popular
                ? 'bg-white text-blue-600 hover:bg-gray-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {plan.buttonText}
          </a>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Features</th>
            {plans.map((plan, index) => (
              <th key={index} className="text-center p-4">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-4 font-semibold">Price</td>
            {plans.map((plan, index) => (
              <td key={index} className="text-center p-4">
                ${isYearly ? plan.price.yearly : plan.price.monthly}/{isYearly ? 'year' : 'month'}
              </td>
            ))}
          </tr>
          {plans[0]?.features.map((_, featureIndex) => (
            <tr key={featureIndex} className="border-b">
              <td className="p-4">{plans[0].features[featureIndex]}</td>
              {plans.map((plan, planIndex) => (
                <td key={planIndex} className="text-center p-4">
                  {plan.features[featureIndex] ? '✓' : '✗'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMinimal = () => (
    <div className="space-y-8">
      {plans.map((plan, index) => (
        <div key={index} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
          <div>
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-gray-600">{plan.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${isYearly ? plan.price.yearly : plan.price.monthly}/{isYearly ? 'year' : 'month'}
            </div>
            <a
              href={plan.buttonUrl}
              className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {plan.buttonText}
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className={`py-16 ${className}`}>
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

        {billing === 'toggle' && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  !isYearly ? 'bg-white text-gray-900' : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isYearly ? 'bg-white text-gray-900' : 'text-gray-600'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        )}

        {layout === 'table' ? renderTable() : layout === 'minimal' ? renderMinimal() : renderCards()}
      </div>
    </section>
  );
};

export default Pricing;
