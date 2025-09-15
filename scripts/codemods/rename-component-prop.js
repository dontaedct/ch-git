/**
 * @fileoverview HT-006 Rename Component Prop Codemod
 * @description Safely rename component props across the codebase
 * @version 1.0.0
 * @author HT-006 Phase 4 - Refactoring Toolkit
 * @task HT-006.4 - Refactoring Toolkit Implementation
 */

const { execSync } = require('child_process');

/**
 * Codemod to rename component props
 * Usage: jscodeshift -t scripts/codemods/rename-component-prop.js <path> --component=Button --prop=oldProp --new-prop=newProp
 */
module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const { component, prop, 'new-prop': newProp } = options;
  
  if (!component || !prop || !newProp) {
    throw new Error('Missing required options: --component, --prop, --new-prop');
  }

  let hasChanges = false;

  const source = j(fileInfo.source);

  // Find JSX elements with the specified component
  source.find(j.JSXElement, {
    openingElement: {
      name: {
        name: component
      }
    }
  }).forEach(path => {
    const openingElement = path.value.openingElement;
    
    // Find the prop to rename
    const propIndex = openingElement.attributes.findIndex(attr => {
      if (attr.type === 'JSXAttribute' && attr.name.name === prop) {
        return true;
      }
      return false;
    });

    if (propIndex !== -1) {
      const propAttribute = openingElement.attributes[propIndex];
      propAttribute.name.name = newProp;
      hasChanges = true;
    }
  });

  // Also handle self-closing JSX elements
  source.find(j.JSXSelfClosingElement, {
    name: {
      name: component
    }
  }).forEach(path => {
    const element = path.value;
    
    const propIndex = element.attributes.findIndex(attr => {
      if (attr.type === 'JSXAttribute' && attr.name.name === prop) {
        return true;
      }
      return false;
    });

    if (propIndex !== -1) {
      const propAttribute = element.attributes[propIndex];
      propAttribute.name.name = newProp;
      hasChanges = true;
    }
  });

  // Handle spread props (more complex case)
  source.find(j.JSXSpreadAttribute).forEach(path => {
    const spreadAttribute = path.value;
    
    // Check if this is spreading an object that might contain our prop
    if (spreadAttribute.argument.type === 'ObjectExpression') {
      const objectExpression = spreadAttribute.argument;
      
      objectExpression.properties.forEach(property => {
        if (property.type === 'Property' && 
            property.key.name === prop &&
            !property.computed) {
          property.key.name = newProp;
          hasChanges = true;
        }
      });
    }
  });

  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};
