/**
 * @fileoverview Test file for brand-aware ESLint rules
 * @description This file contains examples that should trigger ESLint errors
 * @version 1.0.0
 * @author OSS Hero System
 * @module HT-011.4.4: Update ESLint Rules for Brand Support
 */

'use client';

import React, { useState } from 'react';
import { useBrandStyling, useBrandColors, useBrandTypography } from '@/lib/branding/use-brand-styling';

// ❌ This should trigger brand-enforce-colors error
const BadColorComponent = () => {
  return (
    <div className="bg-[#ff0000] text-[#00ff00]">
      {/* Raw hex colors should trigger ESLint error */}
      <p style={{ color: '#0000ff' }}>Bad inline style</p>
    </div>
  );
};

// ❌ This should trigger brand-enforce-typography error
const BadFontComponent = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Hardcoded font should trigger ESLint error */}
      <p>Bad font usage</p>
    </div>
  );
};

// ❌ This should trigger brand-enforce-components error
const BadComponent = () => {
  const [styleState, setStyleState] = useState({
    color: '#ff0000',
    backgroundColor: '#00ff00',
    fontFamily: 'Arial'
  });

  return (
    <div 
      style={styleState}
      className="bg-[#ff0000] text-[#00ff00]"
    >
      {/* Multiple violations should trigger ESLint errors */}
      <p>Bad component with multiple violations</p>
    </div>
  );
};

// ❌ This should trigger brand-enforce-hooks error
const BadHooksComponent = () => {
  const [colorState, setColorState] = useState({ color: '#ff0000' });
  
  const handleStyleChange = (element) => {
    element.style.setProperty('color', '#ff0000');
  };

  return (
    <div>
      {/* useState with style object should trigger ESLint error */}
      <button onClick={() => handleStyleChange(document.body)}>
        Bad style manipulation
      </button>
    </div>
  );
};

// ✅ This should NOT trigger any ESLint errors
const GoodBrandComponent = () => {
  const { getBrandClasses, getBrandColor, cssProperties } = useBrandStyling();
  const { getColor, getColorVariations } = useBrandColors();
  const { getFontFamily, getTypographyClasses } = useBrandTypography();

  return (
    <div 
      className={getBrandClasses('p-4 rounded-lg')}
      style={cssProperties}
    >
      {/* Proper brand usage should not trigger ESLint errors */}
      <h1 className={getTypographyClasses().join(' ')}>
        Good brand usage
      </h1>
      <p style={{ color: getBrandColor('primary') }}>
        Using brand colors properly
      </p>
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white"
        style={{ fontFamily: getFontFamily() }}
      >
        Proper Tailwind + brand usage
      </button>
    </div>
  );
};

// ✅ This should NOT trigger ESLint errors (Tailwind classes)
const GoodTailwindComponent = () => {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg">
      {/* Tailwind classes should not trigger ESLint errors */}
      <p className="text-lg font-semibold">Good Tailwind usage</p>
      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
        Proper Tailwind button
      </button>
    </div>
  );
};

export {
  BadColorComponent,
  BadFontComponent,
  BadComponent,
  BadHooksComponent,
  GoodBrandComponent,
  GoodTailwindComponent
};
