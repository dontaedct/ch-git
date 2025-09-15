/**
 * @fileoverview OSS Hero Brand-Specific ESLint Rules
 * @description Custom ESLint rules for brand design consistency and validation
 * @version 1.0.0
 * @author OSS Hero System
 * @module HT-011.4.4: Update ESLint Rules for Brand Support
 */

// Note: Brand context integration will be added in future iterations
// import { getCurrentBrandConfig } from '../../lib/branding/brand-context';

/**
 * Brand-aware ESLint rule definitions
 */
const brandAwareRules = {
  // Rule: Enforce brand color usage
  'brand-enforce-colors': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Enforce usage of brand colors instead of hardcoded colors',
        category: 'Brand Consistency',
        recommended: true
      },
      fixable: 'code',
      schema: [
        {
          type: 'object',
          properties: {
            allowTailwind: { type: 'boolean' },
            allowCustomColors: { type: 'boolean' },
            brandColors: { type: 'array', items: { type: 'string' } }
          },
          additionalProperties: false
        }
      ]
    },
    create(context) {
      const options = context.options[0] || {};
      const { allowTailwind = true, allowCustomColors = false, brandColors = [] } = options;
      
      return {
        Literal(node) {
          if (typeof node.value === 'string' && isColorValue(node.value)) {
            if (!isValidBrandColor(node.value, { allowTailwind, allowCustomColors, brandColors })) {
              context.report({
                node,
                message: `Color '${node.value}' is not in the brand palette. Use brand colors or Tailwind classes.`,
                fix(fixer) {
                  const brandColor = findClosestBrandColor(node.value, brandColors);
                  if (brandColor) {
                    return fixer.replaceText(node, `'${brandColor}'`);
                  }
                  return null;
                }
              });
            }
          }
        }
      };
    }
  },

  // Rule: Enforce brand typography usage
  'brand-enforce-typography': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Enforce usage of brand typography instead of hardcoded fonts',
        category: 'Brand Consistency',
        recommended: true
      },
      fixable: 'code',
      schema: [
        {
          type: 'object',
          properties: {
            allowSystemFonts: { type: 'boolean' },
            allowCustomFonts: { type: 'boolean' },
            brandFonts: { type: 'array', items: { type: 'string' } }
          },
          additionalProperties: false
        }
      ]
    },
    create(context) {
      const options = context.options[0] || {};
      const { allowSystemFonts = true, allowCustomFonts = false, brandFonts = [] } = options;
      
      return {
        ImportDeclaration(node) {
          if (isFontImport(node.source.value)) {
            if (!isValidBrandFont(node.source.value, { allowSystemFonts, allowCustomFonts, brandFonts })) {
              context.report({
                node,
                message: `Font import '${node.source.value}' is not in the brand system. Use brand typography configuration.`,
                fix(fixer) {
                  return fixer.replaceText(node.source, "'@/lib/branding/use-brand-styling'");
                }
              });
            }
          }
        }
      };
    }
  },

  // Rule: Enforce brand component usage
  'brand-enforce-components': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Enforce usage of brand-aware components and hooks',
        category: 'Brand Consistency',
        recommended: true
      },
      fixable: 'code',
      schema: []
    },
    create(context) {
      return {
        JSXElement(node) {
          const tagName = node.openingElement.name.name;
          
          // Check for inline styles
          const styleProp = node.openingElement.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'style'
          );
          
          if (styleProp) {
            context.report({
              node: styleProp,
              message: 'Avoid inline styles. Use useBrandStyling() hook or brand-aware components.',
              fix(fixer) {
                return fixer.replaceText(styleProp, 'className={getBrandClasses()}');
              }
            });
          }
          
          // Check for hardcoded className values
          const classNameProp = node.openingElement.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'className'
          );
          
          if (classNameProp && classNameProp.value.type === 'Literal') {
            const className = classNameProp.value.value;
            if (containsHardcodedColors(className)) {
              context.report({
                node: classNameProp,
                message: 'Avoid hardcoded colors in className. Use brand-aware styling hooks.',
                fix(fixer) {
                  return fixer.replaceText(classNameProp, 'className={getBrandClasses()}');
                }
              });
            }
          }
        }
      };
    }
  },

  // Rule: Enforce brand hook usage
  'brand-enforce-hooks': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Enforce usage of brand hooks for styling and configuration',
        category: 'Brand Consistency',
        recommended: true
      },
      fixable: 'code',
      schema: []
    },
    create(context) {
      return {
        CallExpression(node) {
          const callee = node.callee;
          
          // Check for useState with style objects
          if (callee.name === 'useState' && node.arguments.length > 0) {
            const firstArg = node.arguments[0];
            if (firstArg.type === 'ObjectExpression' && containsStyleProperties(firstArg)) {
              context.report({
                node,
                message: 'Use useBrandStyling() hook instead of useState for brand styling state.',
                fix(fixer) {
                  return fixer.replaceText(node, 'useBrandStyling()');
                }
              });
            }
          }
          
          // Check for direct style manipulation
          if (callee.type === 'MemberExpression' && 
              callee.property.name === 'setProperty' && 
              callee.object.type === 'MemberExpression' &&
              callee.object.property.name === 'style') {
            context.report({
              node,
              message: 'Use brand styling hooks for style manipulation. Use applyBrandStyling() from useBrandStyling().',
            });
          }
        }
      };
    }
  }
};

/**
 * Helper functions for brand validation
 */
function isColorValue(value) {
  return /^#[0-9a-fA-F]{3,6}$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/.test(value);
}

function isValidBrandColor(color, options) {
  const { allowTailwind, allowCustomColors, brandColors } = options;
  
  // Allow brand colors
  if (brandColors.includes(color)) {
    return true;
  }
  
  // Allow Tailwind classes
  if (allowTailwind && isTailwindColor(color)) {
    return true;
  }
  
  // Allow custom colors if configured
  if (allowCustomColors) {
    return true;
  }
  
  return false;
}

function isTailwindColor(color) {
  const tailwindPatterns = [
    /^bg-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^text-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^border-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^from-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^to-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^via-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/
  ];
  
  return tailwindPatterns.some(pattern => pattern.test(color));
}

function findClosestBrandColor(color, brandColors) {
  // Simple implementation - in practice, this would use color distance algorithms
  return brandColors[0] || null;
}

function isFontImport(importPath) {
  return /@fontsource|next\/font|@font-face/.test(importPath);
}

function isValidBrandFont(importPath, options) {
  const { allowSystemFonts, allowCustomFonts, brandFonts } = options;
  
  // Allow brand fonts
  if (brandFonts.some(font => importPath.includes(font))) {
    return true;
  }
  
  // Allow system fonts
  if (allowSystemFonts && /system-ui|sans-serif|serif|monospace/.test(importPath)) {
    return true;
  }
  
  // Allow custom fonts if configured
  if (allowCustomFonts) {
    return true;
  }
  
  return false;
}

function containsHardcodedColors(className) {
  return /bg-\[#[0-9a-fA-F]{3,6}\]|text-\[#[0-9a-fA-F]{3,6}\]|border-\[#[0-9a-fA-F]{3,6}\]/.test(className);
}

function containsStyleProperties(objectExpression) {
  return objectExpression.properties.some(prop => 
    prop.key && (
      prop.key.name === 'color' ||
      prop.key.name === 'backgroundColor' ||
      prop.key.name === 'fontFamily' ||
      prop.key.name === 'fontSize' ||
      prop.key.name === 'fontWeight'
    )
  );
}

export default {
  brandAwareRules,
  // Export helper functions for testing
  helpers: {
    isColorValue,
    isValidBrandColor,
    isTailwindColor,
    isFontImport,
    isValidBrandFont,
    containsHardcodedColors,
    containsStyleProperties
  }
};
