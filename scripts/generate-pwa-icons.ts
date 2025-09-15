/**
 * @fileoverview PWA Icon Generator Script
 * @module scripts/generate-pwa-icons.ts
 * @author Hero Tasks System
 * @version 1.0.0
 * 
 * Generates PWA icons in multiple sizes for different devices
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Icon sizes needed for PWA
const ICON_SIZES = [
  16, 32, 57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512
];

// Create SVG icon template
function createSVGIcon(size: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#gradient)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Task list icon -->
  <g transform="translate(${size/2 - size*0.15}, ${size/2 - size*0.2})">
    <!-- Clipboard -->
    <rect x="0" y="0" width="${size*0.3}" height="${size*0.4}" rx="2" fill="#ffffff" opacity="0.9"/>
    
    <!-- Clipboard top -->
    <rect x="${size*0.05}" y="-${size*0.05}" width="${size*0.2}" height="${size*0.1}" rx="2" fill="#ffffff" opacity="0.9"/>
    
    <!-- Task lines -->
    <line x1="${size*0.08}" y1="${size*0.08}" x2="${size*0.22}" y2="${size*0.08}" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="${size*0.08}" y1="${size*0.15}" x2="${size*0.22}" y2="${size*0.15}" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="${size*0.08}" y1="${size*0.22}" x2="${size*0.18}" y2="${size*0.22}" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
    
    <!-- Checkmark -->
    <path d="M${size*0.06} ${size*0.12} L${size*0.1} ${size*0.16} L${size*0.14} ${size*0.12}" stroke="#10b981" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

// Create placeholder PNG data (base64 encoded 1x1 transparent pixel)
function createPlaceholderPNG(): string {
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

async function generatePWAIcons() {
  console.log('🎨 Generating PWA icons...');
  
  // Ensure icons directory exists
  const iconsDir = join(process.cwd(), 'public', 'icons');
  try {
    mkdirSync(iconsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  // Generate SVG icons
  for (const size of ICON_SIZES) {
    const svgContent = createSVGIcon(size);
    const svgPath = join(iconsDir, `icon-${size}x${size}.svg`);
    
    try {
      writeFileSync(svgPath, svgContent);
      console.log(`✅ Generated SVG icon: ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Failed to generate SVG icon ${size}x${size}:`, error);
    }
  }
  
  // Generate placeholder PNG files (these would normally be converted from SVG)
  for (const size of ICON_SIZES) {
    const pngPath = join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      // Create a simple placeholder file
      writeFileSync(pngPath, Buffer.from(createPlaceholderPNG(), 'base64'));
      console.log(`✅ Generated PNG placeholder: ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Failed to generate PNG placeholder ${size}x${size}:`, error);
    }
  }
  
  // Generate shortcut icons
  const shortcutIcons = [
    { name: 'shortcut-create', description: 'Create Task' },
    { name: 'shortcut-dashboard', description: 'Dashboard' },
    { name: 'shortcut-analytics', description: 'Analytics' }
  ];
  
  for (const icon of shortcutIcons) {
    const svgContent = createSVGIcon(96);
    const svgPath = join(iconsDir, `${icon.name}.svg`);
    
    try {
      writeFileSync(svgPath, svgContent);
      console.log(`✅ Generated shortcut icon: ${icon.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate shortcut icon ${icon.name}:`, error);
    }
  }
  
  console.log('🎉 PWA icon generation complete!');
  console.log('📝 Note: PNG files are placeholders. In production, convert SVG to PNG using tools like Sharp or ImageMagick.');
}

// Run the script
generatePWAIcons().catch(console.error);

export { generatePWAIcons };
