/**
 * ESLint Configuration Proposal: Client-Server Boundary Enforcement
 * 
 * This configuration prevents Node.js built-ins and server-only code from leaking into client components.
 * Add these rules to .eslintrc.json to enforce client-server separation.
 * 
 * Universal Header: Prevents client→server leakage at build time
 */

// PROPOSAL: Additional rules to add to .eslintrc.json
const clientBoundaryRules = {
  // Block direct process.env access in client components  
  "no-restricted-globals": [
    "error",
    {
      "name": "process",
      "message": "Use @lib/env-client utilities instead of direct process access in client components"
    }
  ],

  // Block Node.js built-in imports in client files
  "no-restricted-imports": [
    "error", 
    {
      "patterns": [
        "../*", 
        "../../*", 
        "../../../*"
      ],
      "paths": [
        {
          "name": "fs",
          "message": "Node.js 'fs' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "path", 
          "message": "Node.js 'path' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "child_process",
          "message": "Node.js 'child_process' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "crypto",
          "message": "Node.js 'crypto' module not allowed in client components. Use Web Crypto API or server actions."
        },
        {
          "name": "os",
          "message": "Node.js 'os' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "process", 
          "message": "Node.js 'process' module not allowed in client components. Use @lib/env-client utilities."
        },
        {
          "name": "node:fs",
          "message": "Node.js 'fs' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "node:path",
          "message": "Node.js 'path' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "node:child_process", 
          "message": "Node.js 'child_process' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "node:crypto",
          "message": "Node.js 'crypto' module not allowed in client components. Use Web Crypto API or server actions."
        },
        {
          "name": "node:os",
          "message": "Node.js 'os' module not allowed in client components. Use server actions or API routes."
        },
        {
          "name": "node:process",
          "message": "Node.js 'process' module not allowed in client components. Use @lib/env-client utilities."
        }
      ]
    }
  ],

  // Block process.env usage patterns
  "no-restricted-syntax": [
    "error",
    {
      "selector": "MemberExpression[object.object.name='process'][object.property.name='env']",
      "message": "Direct process.env access not allowed in client components. Use @lib/env-client utilities."
    },
    {
      "selector": "MemberExpression[object.name='process'][property.name='env']",
      "message": "Direct process.env access not allowed in client components. Use @lib/env-client utilities."
    }
  ]
};

// PROPOSAL: Override configuration for server-side files where Node.js APIs are allowed
const serverFileOverrides = {
  files: [
    "app/api/**/*.{ts,tsx}",
    "**/*.actions.{ts,tsx}", 
    "**/actions.{ts,tsx}",
    "app/**/route.{ts,tsx}",
    "middleware.{ts,tsx}",
    "next.config.{js,ts}",
    "scripts/**/*.{js,ts,mjs}",
    "lib/supabase/server.{ts,tsx}",
    "**/*.server.{ts,tsx}"
  ],
  rules: {
    "no-restricted-globals": "off",
    "no-restricted-imports": ["error", { "patterns": ["../*", "../../*", "../../../*"] }], // Keep relative import restriction
    "no-restricted-syntax": "off"
  }
};

// PROPOSAL: Debug files override (allow for debugging infrastructure)
const debugFileOverrides = {
  files: [
    "app/_debug/**/*.{ts,tsx}",
    "**/*.debug.{ts,tsx}", 
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}"
  ],
  rules: {
    "no-restricted-globals": "off",
    "no-restricted-imports": "off", 
    "no-restricted-syntax": "off"
  }
};

module.exports = {
  clientBoundaryRules,
  serverFileOverrides,
  debugFileOverrides,
  
  // Complete proposed .eslintrc.json structure
  proposedConfig: {
    "extends": [
      "next/core-web-vitals",
      "next/typescript"
    ],
    "parserOptions": {
      "project": "./tsconfig.json"
    },
    "rules": {
      // Existing rules...
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-eval": "error",
      "no-implied-eval": "error", 
      "no-new-func": "error",
      "no-script-url": "error",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      
      // NEW: Client boundary enforcement rules
      ...clientBoundaryRules
    },
    "overrides": [
      serverFileOverrides,
      debugFileOverrides
    ],
    "env": {
      "node": true,
      "browser": true,
      "es2022": true
    },
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "ignorePatterns": [
      "node_modules/",
      ".next/",
      "out/",
      "dist/",
      "build/",
      "*.min.js",
      "*.bundle.js",
      "coverage/",
      "*.d.ts"
    ],
    "settings": {
      "import/resolver": {
        "typescript": {
          "alwaysTryTypes": false
        }
      }
    }
  }
};
