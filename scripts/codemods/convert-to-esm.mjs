#!/usr/bin/env node

/**
 * ESM Conversion Codemod
 * Converts CommonJS modules to ESM format
 * 
 * Usage: node scripts/codemods/convert-to-esm.mjs [--dry-run] [--verbose] [target-dir]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastGlob from 'fast-glob';

const { glob } = fastGlob;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ESMConverter {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: false,
      ...options
    };
    this.conversions = [];
  }

  async convertDirectory(targetDir = 'scripts') {
    console.log(`🔄 Converting ${targetDir} to ESM...`);
    
    // Find all .js files (excluding .mjs, .cjs)
    const jsFiles = await glob(`${targetDir}/**/*.js`, {
      ignore: ['**/node_modules/**', '**/*.mjs', '**/*.cjs', '**/*.backup.*']
    });

    console.log(`Found ${jsFiles.length} .js files to process`);

    for (const filePath of jsFiles) {
      await this.convertFile(filePath);
    }

    // Rename .cjs files to .mjs and convert
    const cjsFiles = await glob(`${targetDir}/**/*.cjs`, {
      ignore: ['**/node_modules/**', '**/*.backup.*']
    });

    console.log(`Found ${cjsFiles.length} .cjs files to process`);

    for (const filePath of cjsFiles) {
      const newPath = filePath.replace(/\.cjs$/, '.mjs');
      await this.convertFile(filePath, newPath);
    }

    return this.conversions;
  }

  async convertFile(filePath, outputPath = null) {
    const targetPath = outputPath || filePath.replace(/\.js$/, '.mjs');
    
    if (this.options.verbose) {
      console.log(`Processing: ${filePath} → ${targetPath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const converted = this.convertContent(content, filePath);

    if (converted.changed) {
      this.conversions.push({
        from: filePath,
        to: targetPath,
        changes: converted.changes
      });

      if (!this.options.dryRun) {
        // Create backup
        fs.writeFileSync(`${filePath}.backup`, content);
        
        // Write converted content
        fs.writeFileSync(targetPath, converted.content);
        
        // Remove original if path changed
        if (outputPath && outputPath !== filePath) {
          fs.unlinkSync(filePath);
        }
      }
    }

    return converted;
  }

  convertContent(content, filePath) {
    let result = content;
    const changes = [];

    // Track if this file should be converted
    let hasCommonJS = false;

    // Convert require() statements
    const requireRegex = /const\s+(\{[^}]+\}|\w+)\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    result = result.replace(requireRegex, (match, varName, modulePath) => {
      hasCommonJS = true;
      changes.push(`require('${modulePath}') → import`);
      
      if (varName.startsWith('{')) {
        // Destructuring import
        return `import ${varName} from '${modulePath}';`;
      } else {
        // Default import
        return `import ${varName} from '${modulePath}';`;
      }
    });

    // Convert module.exports
    const moduleExportsRegex = /module\.exports\s*=\s*(\{[^}]*\}|\w+|.+)/g;
    result = result.replace(moduleExportsRegex, (match, exportValue) => {
      hasCommonJS = true;
      changes.push(`module.exports → export default`);
      
      if (exportValue.startsWith('{')) {
        // Object export - convert to named exports
        const objContent = exportValue.slice(1, -1);
        return `export ${exportValue};`;
      } else {
        return `export default ${exportValue};`;
      }
    });

    // Convert __dirname and __filename for ESM
    if (result.includes('__dirname') || result.includes('__filename')) {
      hasCommonJS = true;
      changes.push('__dirname/__filename → ESM equivalents');
      
      // Add ESM dirname/filename polyfill at top
      const esmPolyfill = `import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

`;
      
      result = esmPolyfill + result;
    }

    // Update require.main === module check
    result = result.replace(/require\.main\s*===\s*module/g, (match) => {
      hasCommonJS = true;
      changes.push('require.main === module → import.meta.main');
      return 'import.meta.main';
    });

    // Convert exec/spawn require patterns
    const childProcessRegex = /const\s*\{\s*([^}]+)\s*\}\s*=\s*require\s*\(\s*['"`]child_process['"`]\s*\)/g;
    result = result.replace(childProcessRegex, (match, imports) => {
      hasCommonJS = true;
      changes.push("require('child_process') → import");
      return `import { ${imports} } from 'node:child_process';`;
    });

    // Convert other Node.js modules
    const nodeModules = ['fs', 'path', 'os', 'util', 'crypto', 'events'];
    nodeModules.forEach(mod => {
      const regex = new RegExp(`const\\s+(\\w+)\\s*=\\s*require\\s*\\(\\s*['"\`]${mod}['"\`]\\s*\\)`, 'g');
      result = result.replace(regex, (match, varName) => {
        hasCommonJS = true;
        changes.push(`require('${mod}') → import`);
        return `import ${varName} from 'node:${mod}';`;
      });
    });

    return {
      content: result,
      changed: hasCommonJS,
      changes
    };
  }

  generateReport() {
    if (this.conversions.length === 0) {
      console.log('✅ No files needed conversion');
      return;
    }

    console.log(`\n📊 Conversion Report (${this.conversions.length} files):`);
    console.log('='.repeat(50));

    this.conversions.forEach(conv => {
      console.log(`\n📄 ${conv.from}`);
      if (conv.to !== conv.from) {
        console.log(`   → ${conv.to}`);
      }
      conv.changes.forEach(change => {
        console.log(`   ✓ ${change}`);
      });
    });

    console.log(`\n✅ Converted ${this.conversions.length} files to ESM`);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };
  
  const targetDir = args.find(arg => !arg.startsWith('--')) || 'scripts';

  const converter = new ESMConverter(options);
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  }

  try {
    await converter.convertDirectory(targetDir);
    converter.generateReport();
    
    if (options.dryRun && converter.conversions.length > 0) {
      console.log('\n🚀 Run without --dry-run to apply changes');
    }
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// ESM equivalent of require.main === module
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { ESMConverter };
