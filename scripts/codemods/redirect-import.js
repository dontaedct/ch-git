/**
 * @fileoverview HT-006 Redirect Import Codemod
 * @description Safely redirect import paths across the codebase
 * @version 1.0.0
 * @author HT-006 Phase 4 - Refactoring Toolkit
 * @task HT-006.4 - Refactoring Toolkit Implementation
 */

/**
 * Codemod to redirect import paths
 * Usage: jscodeshift -t scripts/codemods/redirect-import.js <path> --old-path=@/old --new-path=@/new
 */
module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const { 'old-path': oldPath, 'new-path': newPath } = options;
  
  if (!oldPath || !newPath) {
    throw new Error('Missing required options: --old-path, --new-path');
  }

  let hasChanges = false;

  const source = j(fileInfo.source);

  // Find all import declarations
  source.find(j.ImportDeclaration).forEach(path => {
    const importDeclaration = path.value;
    const moduleSpecifier = importDeclaration.source.value;
    
    // Check if this import matches our old path
    if (moduleSpecifier === oldPath) {
      importDeclaration.source.value = newPath;
      hasChanges = true;
    }
    
    // Also handle partial matches (for more flexible redirects)
    if (moduleSpecifier.startsWith(oldPath + '/')) {
      const remainingPath = moduleSpecifier.substring(oldPath.length);
      importDeclaration.source.value = newPath + remainingPath;
      hasChanges = true;
    }
  });

  // Handle dynamic imports
  source.find(j.CallExpression, {
    callee: {
      type: 'Import'
    }
  }).forEach(path => {
    const callExpression = path.value;
    const arg = callExpression.arguments[0];
    
    if (arg && arg.type === 'StringLiteral') {
      const moduleSpecifier = arg.value;
      
      if (moduleSpecifier === oldPath) {
        arg.value = newPath;
        hasChanges = true;
      } else if (moduleSpecifier.startsWith(oldPath + '/')) {
        const remainingPath = moduleSpecifier.substring(oldPath.length);
        arg.value = newPath + remainingPath;
        hasChanges = true;
      }
    }
  });

  // Handle require() calls
  source.find(j.CallExpression, {
    callee: {
      name: 'require'
    }
  }).forEach(path => {
    const callExpression = path.value;
    const arg = callExpression.arguments[0];
    
    if (arg && arg.type === 'StringLiteral') {
      const moduleSpecifier = arg.value;
      
      if (moduleSpecifier === oldPath) {
        arg.value = newPath;
        hasChanges = true;
      } else if (moduleSpecifier.startsWith(oldPath + '/')) {
        const remainingPath = moduleSpecifier.substring(oldPath.length);
        arg.value = newPath + remainingPath;
        hasChanges = true;
      }
    }
  });

  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};
