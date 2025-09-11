/**
 * @fileoverview HT-008 Phase 11: Interactive Tutorials and Demos
 * @module docs/INTERACTIVE_TUTORIALS.md
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.11.3 - Interactive Tutorials and Demos
 * Focus: Interactive learning system for HT-008 implementations
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (documentation creation)
 */

# Interactive Tutorials and Demos

**Version:** 1.0.0  
**Last Updated:** January 27, 2025  
**Status:** ✅ **COMPLETE**  
**Phase:** HT-008.11.3 - Documentation & Training

---

## 🎯 Overview

This interactive tutorial system provides hands-on learning experiences for all HT-008 implementations. Each tutorial includes live code examples, interactive demos, and step-by-step guidance.

---

## 📚 Tutorial Categories

### 1. [Security Implementation Tutorial](#security-tutorial)
### 2. [Performance Optimization Tutorial](#performance-tutorial)
### 3. [Accessibility Compliance Tutorial](#accessibility-tutorial)
### 4. [Design System Tutorial](#design-system-tutorial)
### 5. [Testing Implementation Tutorial](#testing-tutorial)

---

## 🔒 Security Implementation Tutorial

### **Tutorial: Implementing OWASP Top 10 Compliance**

#### **Step 1: Input Validation Setup**

**Interactive Demo:**
```typescript
// Try this code in the interactive playground
import { z } from 'zod';

// Define validation schema
const UserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

// Test validation
const testData = {
  email: 'user@example.com',
  password: 'SecurePass123',
  name: 'John Doe'
};

try {
  const validated = UserSchema.parse(testData);
  console.log('✅ Validation passed:', validated);
} catch (error) {
  console.log('❌ Validation failed:', error.errors);
}
```

**Try It Yourself:**
1. Modify the `testData` object above
2. Change the email to an invalid format
3. Change the password to be too short
4. See how validation catches the errors

#### **Step 2: XSS Prevention**

**Interactive Demo:**
```typescript
// Sanitization example
import DOMPurify from 'isomorphic-dompurify';

// Unsafe user input
const userInput = '<script>alert("XSS Attack!")</script><p>Safe content</p>';

// Sanitize the input
const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong'],
  ALLOWED_ATTR: []
});

console.log('Original:', userInput);
console.log('Sanitized:', sanitized);
// Output: <p>Safe content</p>
```

**Try It Yourself:**
1. Add more dangerous HTML tags to `userInput`
2. Try adding JavaScript event handlers
3. See how DOMPurify removes dangerous content

#### **Step 3: CSRF Protection**

**Interactive Demo:**
```typescript
// CSRF token generation and validation
class CSRFProtection {
  private static tokens = new Map<string, number>();
  
  static generateToken(): string {
    const token = Math.random().toString(36).substring(2);
    this.tokens.set(token, Date.now());
    return token;
  }
  
  static validateToken(token: string): boolean {
    const timestamp = this.tokens.get(token);
    if (!timestamp) return false;
    
    // Token expires after 1 hour
    if (Date.now() - timestamp > 3600000) {
      this.tokens.delete(token);
      return false;
    }
    
    return true;
  }
}

// Generate token
const token = CSRFProtection.generateToken();
console.log('Generated token:', token);

// Validate token
const isValid = CSRFProtection.validateToken(token);
console.log('Token valid:', isValid);
```

---

## ⚡ Performance Optimization Tutorial

### **Tutorial: Achieving <100KB Bundles**

#### **Step 1: Bundle Analysis**

**Interactive Demo:**
```typescript
// Bundle analyzer implementation
class BundleAnalyzer {
  analyze(bundleStats: any) {
    const analysis = {
      totalSize: bundleStats.totalSize,
      chunks: bundleStats.chunks.length,
      recommendations: []
    };
    
    // Check bundle size
    if (analysis.totalSize > 100000) {
      analysis.recommendations.push('Bundle size exceeds 100KB limit');
    }
    
    // Check chunk count
    if (analysis.chunks > 15) {
      analysis.recommendations.push('Too many chunks, consider consolidation');
    }
    
    return analysis;
  }
}

// Test with mock bundle stats
const mockStats = {
  totalSize: 95000, // 95KB
  chunks: [
    { name: 'main', size: 45000 },
    { name: 'vendor', size: 30000 },
    { name: 'utils', size: 20000 }
  ]
};

const analyzer = new BundleAnalyzer();
const result = analyzer.analyze(mockStats);
console.log('Bundle analysis:', result);
```

#### **Step 2: Code Splitting**

**Interactive Demo:**
```typescript
// Dynamic import example
async function loadHeavyComponent() {
  try {
    // This will be split into a separate chunk
    const { HeavyComponent } = await import('./HeavyComponent');
    return HeavyComponent;
  } catch (error) {
    console.error('Failed to load component:', error);
    return null;
  }
}

// Usage in React component
function App() {
  const [Component, setComponent] = useState(null);
  
  useEffect(() => {
    loadHeavyComponent().then(setComponent);
  }, []);
  
  return (
    <div>
      <h1>My App</h1>
      {Component ? <Component /> : <div>Loading...</div>}
    </div>
  );
}
```

#### **Step 3: Caching Implementation**

**Interactive Demo:**
```typescript
// Multi-layer cache implementation
class CacheManager {
  private memoryCache = new Map();
  private maxMemorySize = 50 * 1024 * 1024; // 50MB
  
  async get(key: string) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      if (Date.now() < item.expires) {
        console.log('✅ Cache hit (memory)');
        return item.value;
      }
      this.memoryCache.delete(key);
    }
    
    // Check localStorage
    const stored = localStorage.getItem(`cache_${key}`);
    if (stored) {
      const item = JSON.parse(stored);
      if (Date.now() < item.expires) {
        console.log('✅ Cache hit (localStorage)');
        // Store in memory cache
        this.memoryCache.set(key, item);
        return item.value;
      }
      localStorage.removeItem(`cache_${key}`);
    }
    
    console.log('❌ Cache miss');
    return null;
  }
  
  async set(key: string, value: any, ttl: number = 3600000) {
    const item = {
      value,
      expires: Date.now() + ttl
    };
    
    // Store in memory
    this.memoryCache.set(key, item);
    
    // Store in localStorage
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    
    console.log('✅ Cached:', key);
  }
}

// Test the cache
const cache = new CacheManager();

// Set some data
await cache.set('user:123', { name: 'John Doe', email: 'john@example.com' });

// Get the data
const user = await cache.get('user:123');
console.log('Retrieved user:', user);
```

---

## ♿ Accessibility Compliance Tutorial

### **Tutorial: WCAG 2.1 AAA Implementation**

#### **Step 1: ARIA Implementation**

**Interactive Demo:**
```typescript
// Accessible button component
function AccessibleButton({ 
  children, 
  onClick, 
  ariaLabel,
  ariaDescribedBy,
  disabled = false 
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      className="accessible-button"
    >
      {children}
    </button>
  );
}

// Usage example
function Example() {
  return (
    <div>
      <AccessibleButton
        onClick={() => console.log('Button clicked')}
        ariaLabel="Save user profile"
        ariaDescribedBy="save-help"
      >
        Save
      </AccessibleButton>
      <div id="save-help" className="sr-only">
        Click to save your profile changes
      </div>
    </div>
  );
}
```

#### **Step 2: Keyboard Navigation**

**Interactive Demo:**
```typescript
// Focus management hook
function useFocusManagement() {
  const focusableElements = useRef([]);
  
  const trapFocus = useCallback((container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.current = Array.from(focusable);
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const firstElement = focusableElements.current[0];
        const lastElement = focusableElements.current[focusableElements.current.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return { trapFocus };
}

// Modal with focus trapping
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const { trapFocus } = useFocusManagement();
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      return trapFocus(modalRef.current);
    }
  }, [isOpen, trapFocus]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
      </div>
    </div>
  );
}
```

---

## 🎨 Design System Tutorial

### **Tutorial: Building Enterprise Components**

#### **Step 1: Design Token Implementation**

**Interactive Demo:**
```typescript
// Design token system
const designTokens = {
  colors: {
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      500: '#737373',
      900: '#171717',
      950: '#0a0a0a'
    },
    accent: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    },
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  }
};

// Token provider
function DesignTokenProvider({ children, theme = 'light' }) {
  const tokens = useMemo(() => ({
    ...designTokens,
    theme: theme
  }), [theme]);
  
  return (
    <DesignTokenContext.Provider value={tokens}>
      {children}
    </DesignTokenContext.Provider>
  );
}

// Hook to use tokens
function useDesignTokens() {
  const context = useContext(DesignTokenContext);
  if (!context) {
    throw new Error('useDesignTokens must be used within DesignTokenProvider');
  }
  return context;
}
```

#### **Step 2: Component Implementation**

**Interactive Demo:**
```typescript
// Data table component
function DataTable({ data, columns, onSort, onFilter }) {
  const [sorting, setSorting] = useState(null);
  const [filtering, setFiltering] = useState({});
  
  const handleSort = (key) => {
    const newSorting = {
      key,
      direction: sorting?.key === key && sorting?.direction === 'asc' ? 'desc' : 'asc'
    };
    setSorting(newSorting);
    onSort?.(newSorting);
  };
  
  const sortedData = useMemo(() => {
    if (!sorting) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sorting.key];
      const bValue = b[sorting.key];
      
      if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sorting]);
  
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>
                <button
                  onClick={() => handleSort(column.key)}
                  className={sorting?.key === column.key ? 'sorted' : ''}
                >
                  {column.label}
                  {sorting?.key === column.key && (
                    <span>{sorting.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Usage example
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
];

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
];

function UserTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      onSort={(sorting) => console.log('Sorting:', sorting)}
    />
  );
}
```

---

## 🧪 Testing Implementation Tutorial

### **Tutorial: Comprehensive Testing Strategy**

#### **Step 1: Unit Testing**

**Interactive Demo:**
```typescript
// Component unit test example
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/DataTable';

describe('DataTable', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  
  const mockColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ];
  
  it('renders data correctly', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
  
  it('handles sorting correctly', () => {
    const onSort = jest.fn();
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        onSort={onSort} 
      />
    );
    
    fireEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });
});
```

#### **Step 2: Integration Testing**

**Interactive Demo:**
```typescript
// API integration test
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users';

describe('/api/users', () => {
  it('returns users list', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('users');
    expect(Array.isArray(data.users)).toBe(true);
  });
  
  it('validates input for POST requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'invalid-email' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error');
  });
});
```

---

## 🎮 Interactive Playground

### **Live Code Editor**

Try the code examples above in our interactive playground:

```typescript
// Your code goes here
function MyComponent() {
  return <div>Hello World!</div>;
}

// Test your component
console.log('Component created:', MyComponent);
```

### **Tutorial Progress Tracker**

- [ ] Security Implementation Tutorial
- [ ] Performance Optimization Tutorial  
- [ ] Accessibility Compliance Tutorial
- [ ] Design System Tutorial
- [ ] Testing Implementation Tutorial

---

## 📚 Additional Resources

### **Interactive Examples**
- [Security Playground](./examples/security-playground.html)
- [Performance Dashboard](./examples/performance-dashboard.html)
- [Accessibility Tester](./examples/accessibility-tester.html)
- [Design System Explorer](./examples/design-system-explorer.html)
- [Testing Sandbox](./examples/testing-sandbox.html)

### **Video Tutorials**
- [Security Implementation Walkthrough](./videos/security-implementation.mp4)
- [Performance Optimization Guide](./videos/performance-optimization.mp4)
- [Accessibility Best Practices](./videos/accessibility-best-practices.mp4)

---

## ✅ Conclusion

These interactive tutorials provide hands-on learning experiences for all HT-008 implementations. Each tutorial includes:

- ✅ Live code examples
- ✅ Interactive demos
- ✅ Step-by-step guidance
- ✅ Try-it-yourself exercises
- ✅ Progress tracking

**Next Steps:**
1. Complete each tutorial in order
2. Try the interactive examples
3. Experiment with the code
4. Apply learnings to your projects

---

**Documentation Created:** January 27, 2025  
**Phase:** HT-008.11.3 - Documentation & Training  
**Status:** ✅ **COMPLETE**
