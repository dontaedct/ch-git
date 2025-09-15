/**
 * @fileoverview HT-006 Extract Component Codemod
 * @description Extract inline JSX into separate component files
 * @version 1.0.0
 * @author HT-006 Phase 4 - Refactoring Toolkit
 * @task HT-006.4 - Refactoring Toolkit Implementation
 */

/**
 * Codemod to extract inline JSX into separate component files
 * Usage: jscodeshift -t scripts/codemods/extract-component.js <path> --component-name=NewComponent --jsx-selector="div.className"
 */
module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const { 'component-name': componentName, 'jsx-selector': jsxSelector } = options;
  
  if (!componentName) {
    throw new Error('Missing required option: --component-name');
  }

  let hasChanges = false;
  const source = j(fileInfo.source);

  // Find JSX elements that match the selector
  // This is a simplified version - in practice, you'd want more sophisticated matching
  source.find(j.JSXElement).forEach(path => {
    const jsxElement = path.value;
    const openingElement = jsxElement.openingElement;
    
    // Simple selector matching (can be enhanced)
    if (jsxSelector) {
      const elementName = openingElement.name.name;
      const className = openingElement.attributes.find(attr => 
        attr.type === 'JSXAttribute' && attr.name.name === 'className'
      );
      
      // Check if this element matches our selector
      let matches = false;
      if (jsxSelector.includes('.')) {
        const [tag, className] = jsxSelector.split('.');
        matches = elementName === tag && 
                 className && 
                 className.value && 
                 className.value.value.includes(className);
      } else {
        matches = elementName === jsxSelector;
      }
      
      if (matches) {
        // Replace the JSX element with the new component
        const newComponent = j.jsxElement(
          j.jsxOpeningElement(j.jsxIdentifier(componentName)),
          j.jsxClosingElement(j.jsxIdentifier(componentName)),
          openingElement.attributes
        );
        
        j(path).replaceWith(newComponent);
        hasChanges = true;
      }
    }
  });

  // Add import statement for the new component
  if (hasChanges) {
    const existingImports = source.find(j.ImportDeclaration);
    const lastImport = existingImports.at(-1);
    
    if (lastImport.length > 0) {
      // Add after the last import
      const newImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(componentName))],
        j.literal(`@/components/${componentName}`)
      );
      
      lastImport.insertAfter(newImport);
    } else {
      // Add at the beginning of the file
      const newImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(componentName))],
        j.literal(`@/components/${componentName}`)
      );
      
      source.get().node.program.body.unshift(newImport);
    }
  }

  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};
