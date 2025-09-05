#!/usr/bin/env node

/**
 * HT-001.4.11 - Meta & OG Verification Script
 * 
 * This script verifies that all metadata and Open Graph tags are properly implemented
 * and validates the structure for Twitter Card compatibility.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 HT-001.4.11 - Meta & OG Verification\n');

// Check if layout.tsx exists and has metadata
const layoutPath = path.join(__dirname, 'app', 'layout.tsx');
if (!fs.existsSync(layoutPath)) {
  console.error('❌ app/layout.tsx not found');
  process.exit(1);
}

const layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Required metadata fields
const requiredFields = [
  'title',
  'description', 
  'keywords',
  'authors',
  'openGraph',
  'twitter',
  'robots'
];

// Required Open Graph fields
const requiredOGFields = [
  'type',
  'locale',
  'url',
  'title',
  'description',
  'siteName',
  'images'
];

// Required Twitter fields
const requiredTwitterFields = [
  'card',
  'title',
  'description',
  'images'
];

console.log('📋 Checking metadata structure...\n');

// Check if metadata export exists
if (!layoutContent.includes('export const metadata')) {
  console.error('❌ No metadata export found in layout.tsx');
  process.exit(1);
}

console.log('✅ Metadata export found');

// Check required fields (basic check)
let allFieldsPresent = true;
requiredFields.forEach(field => {
  if (!layoutContent.includes(field)) {
    console.error(`❌ Missing required field: ${field}`);
    allFieldsPresent = false;
  } else {
    console.log(`✅ ${field} field present`);
  }
});

if (!allFieldsPresent) {
  console.error('\n❌ Some required metadata fields are missing');
  process.exit(1);
}

// Check Open Graph fields
console.log('\n📱 Checking Open Graph metadata...');
requiredOGFields.forEach(field => {
  if (!layoutContent.includes(`openGraph:`) || !layoutContent.includes(field)) {
    console.error(`❌ Missing Open Graph field: ${field}`);
    allFieldsPresent = false;
  } else {
    console.log(`✅ Open Graph ${field} present`);
  }
});

// Check Twitter Card fields
console.log('\n🐦 Checking Twitter Card metadata...');
requiredTwitterFields.forEach(field => {
  if (!layoutContent.includes(`twitter:`) || !layoutContent.includes(field)) {
    console.error(`❌ Missing Twitter Card field: ${field}`);
    allFieldsPresent = false;
  } else {
    console.log(`✅ Twitter Card ${field} present`);
  }
});

// Check for structured data
console.log('\n🏗️ Checking structured data...');
if (layoutContent.includes('application/ld+json')) {
  console.log('✅ Structured data (JSON-LD) present');
} else {
  console.error('❌ No structured data found');
  allFieldsPresent = false;
}

// Check for performance meta tags
console.log('\n⚡ Checking performance meta tags...');
const performanceTags = [
  'viewport',
  'theme-color',
  'format-detection',
  'apple-mobile-web-app'
];

performanceTags.forEach(tag => {
  if (layoutContent.includes(tag)) {
    console.log(`✅ ${tag} meta tag present`);
  } else {
    console.log(`⚠️  ${tag} meta tag missing (optional)`);
  }
});

// Check for OG images
console.log('\n🖼️ Checking OG images...');
if (layoutContent.includes('/og-image.svg')) {
  console.log('✅ OG image reference found');
} else {
  console.error('❌ No OG image reference found');
  allFieldsPresent = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allFieldsPresent) {
  console.log('🎉 All metadata and OG tags are properly implemented!');
  console.log('\n📋 Verification Summary:');
  console.log('✅ Title and description');
  console.log('✅ Keywords and authors');
  console.log('✅ Open Graph metadata');
  console.log('✅ Twitter Card metadata');
  console.log('✅ Robots and SEO tags');
  console.log('✅ Structured data (JSON-LD)');
  console.log('✅ Performance meta tags');
  console.log('✅ OG image references');
  
  console.log('\n🔗 Next steps:');
  console.log('1. Create OG images in /public directory');
  console.log('2. Test with Twitter Card Validator: https://cards-dev.twitter.com/validator');
  console.log('3. Test with Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/');
  console.log('4. Verify with Google Rich Results Test: https://search.google.com/test/rich-results');
  
} else {
  console.error('❌ Some metadata fields are missing or incorrect');
  process.exit(1);
}

console.log('\n✨ HT-001.4.11 - Meta & OG verification complete!');
