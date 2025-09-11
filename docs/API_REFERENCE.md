/**
 * @fileoverview HT-008 Phase 11: Comprehensive API Reference
 * @module docs/API_REFERENCE.md
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.11.2 - Detailed API Documentation
 * Focus: Complete API reference for all HT-008 implementations
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (documentation creation)
 */

# API Reference

**Version:** 1.0.0  
**Last Updated:** January 27, 2025  
**Status:** ✅ **COMPLETE**  
**Phase:** HT-008.11.2 - Documentation & Training

---

## 🎯 Overview

This comprehensive API reference documents all APIs, endpoints, utilities, and services implemented during HT-008. This includes authentication APIs, data management APIs, monitoring APIs, and utility functions.

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Data Management APIs](#data-management-apis)
4. [Monitoring APIs](#monitoring-apis)
5. [Performance APIs](#performance-apis)
6. [Design System APIs](#design-system-apis)
7. [Utility Functions](#utility-functions)
8. [Error Handling APIs](#error-handling-apis)
9. [Security APIs](#security-apis)
10. [Testing APIs](#testing-apis)

---

## 🔐 Authentication APIs

### **Authentication Service**

#### `authenticateUser(credentials: UserCredentials): Promise<AuthResult>`

Authenticates a user with email and password.

**Parameters:**
```typescript
interface UserCredentials {
  email: string;        // User's email address
  password: string;     // User's password
  rememberMe?: boolean; // Optional remember me flag
}
```

**Returns:**
```typescript
interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}
```

**Example:**
```typescript
import { authenticateUser } from '@/lib/auth/auth-service';

const result = await authenticateUser({
  email: 'user@example.com',
  password: 'SecurePass123!',
  rememberMe: true
});

if (result.success) {
  console.log('User authenticated:', result.user);
  localStorage.setItem('token', result.token);
} else {
  console.error('Authentication failed:', result.error);
}
```

#### `refreshToken(refreshToken: string): Promise<TokenResult>`

Refreshes an expired authentication token.

**Parameters:**
```typescript
interface TokenResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}
```

**Example:**
```typescript
import { refreshToken } from '@/lib/auth/auth-service';

const result = await refreshToken(currentRefreshToken);
if (result.success) {
  localStorage.setItem('token', result.token);
}
```

#### `logoutUser(): Promise<void>`

Logs out the current user and clears all authentication data.

**Example:**
```typescript
import { logoutUser } from '@/lib/auth/auth-service';

await logoutUser();
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
```

### **Authorization Utilities**

#### `useAuth(): AuthContext`

React hook for accessing authentication state and methods.

**Returns:**
```typescript
interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

**Example:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (credentials: UserCredentials) => {
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 👥 User Management APIs

### **User Service**

#### `getUser(id: string): Promise<User>`

Retrieves a user by ID.

**Parameters:**
- `id: string` - User ID

**Returns:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile?: UserProfile;
}
```

**Example:**
```typescript
import { getUser } from '@/lib/services/user-service';

const user = await getUser('user-123');
console.log('User:', user.name, user.email);
```

#### `getUsers(filters?: UserFilters): Promise<User[]>`

Retrieves multiple users with optional filtering.

**Parameters:**
```typescript
interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Example:**
```typescript
import { getUsers } from '@/lib/services/user-service';

const users = await getUsers({
  role: 'admin',
  status: 'active',
  limit: 10,
  sortBy: 'name',
  sortOrder: 'asc'
});
```

#### `createUser(userData: CreateUserData): Promise<User>`

Creates a new user.

**Parameters:**
```typescript
interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  profile?: Partial<UserProfile>;
}
```

**Example:**
```typescript
import { createUser } from '@/lib/services/user-service';

const newUser = await createUser({
  email: 'newuser@example.com',
  name: 'New User',
  password: 'SecurePass123!',
  role: 'user'
});
```

#### `updateUser(id: string, updates: UpdateUserData): Promise<User>`

Updates an existing user.

**Parameters:**
```typescript
interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  profile?: Partial<UserProfile>;
}
```

**Example:**
```typescript
import { updateUser } from '@/lib/services/user-service';

const updatedUser = await updateUser('user-123', {
  name: 'Updated Name',
  role: 'admin'
});
```

#### `deleteUser(id: string): Promise<void>`

Deletes a user.

**Example:**
```typescript
import { deleteUser } from '@/lib/services/user-service';

await deleteUser('user-123');
```

---

## 📊 Data Management APIs

### **Data Repository**

#### `DataRepository<T>`

Generic repository interface for data operations.

```typescript
interface DataRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: FilterOptions): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(filters?: FilterOptions): Promise<number>;
}
```

**Example:**
```typescript
import { DataRepository } from '@/lib/repositories/base-repository';

class UserRepository implements DataRepository<User> {
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
  
  async findAll(filters?: UserFilters): Promise<User[]> {
    // Implementation
  }
  
  // ... other methods
}
```

### **Data Table API**

#### `useDataTable<T>(config: DataTableConfig<T>): DataTableHook<T>`

React hook for managing data table state and operations.

**Parameters:**
```typescript
interface DataTableConfig<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  selection?: SelectionConfig;
}
```

**Returns:**
```typescript
interface DataTableHook<T> {
  data: T[];
  columns: Column<T>[];
  pagination: PaginationState;
  sorting: SortingState;
  filtering: FilteringState;
  selection: SelectionState;
  actions: {
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSorting: (sorting: SortingState) => void;
    setFiltering: (filtering: FilteringState) => void;
    setSelection: (selection: SelectionState) => void;
    refresh: () => void;
  };
}
```

**Example:**
```typescript
import { useDataTable } from '@/hooks/useDataTable';

function UserTable() {
  const {
    data,
    columns,
    pagination,
    sorting,
    actions
  } = useDataTable({
    data: users,
    columns: userColumns,
    pagination: { pageSize: 10 },
    sorting: { key: 'name', direction: 'asc' }
  });
  
  return (
    <DataTable
      data={data}
      columns={columns}
      pagination={pagination}
      sorting={sorting}
      onSort={actions.setSorting}
      onPageChange={actions.setPage}
    />
  );
}
```

---

## 📈 Monitoring APIs

### **Performance Monitoring**

#### `PerformanceMonitor`

Class for monitoring application performance metrics.

```typescript
class PerformanceMonitor {
  constructor(config?: PerformanceConfig);
  
  // Start monitoring
  start(): void;
  
  // Stop monitoring
  stop(): void;
  
  // Get current metrics
  getMetrics(): PerformanceMetrics;
  
  // Get Core Web Vitals
  getWebVitals(): WebVitalsMetrics;
  
  // Get custom metrics
  getCustomMetrics(): CustomMetrics;
  
  // Record custom metric
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  
  // Get performance report
  getReport(): PerformanceReport;
}
```

**Example:**
```typescript
import { PerformanceMonitor } from '@/lib/monitoring/performance-monitor';

const monitor = new PerformanceMonitor({
  enableWebVitals: true,
  enableResourceTiming: true,
  enableCustomMetrics: true
});

monitor.start();

// Record custom metric
monitor.recordMetric('api_response_time', 150, {
  endpoint: '/api/users',
  method: 'GET'
});

// Get metrics
const metrics = monitor.getMetrics();
console.log('Performance metrics:', metrics);
```

### **Error Tracking**

#### `ErrorTracker`

Class for tracking and reporting application errors.

```typescript
class ErrorTracker {
  constructor(config?: ErrorTrackerConfig);
  
  // Track an error
  track(error: Error, context?: ErrorContext): void;
  
  // Track custom error
  trackCustom(message: string, context?: ErrorContext): void;
  
  // Get error reports
  getReports(): ErrorReport[];
  
  // Clear error reports
  clearReports(): void;
  
  // Get error statistics
  getStatistics(): ErrorStatistics;
}
```

**Example:**
```typescript
import { ErrorTracker } from '@/lib/monitoring/error-tracker';

const tracker = new ErrorTracker({
  maxReports: 100,
  enableReporting: true
});

// Track error
try {
  // Some operation that might fail
} catch (error) {
  tracker.track(error, {
    component: 'UserForm',
    action: 'submit',
    userId: 'user-123'
  });
}

// Get error statistics
const stats = tracker.getStatistics();
console.log('Error statistics:', stats);
```

### **Health Monitoring**

#### `HealthMonitor`

Class for monitoring application health.

```typescript
class HealthMonitor {
  constructor(config?: HealthConfig);
  
  // Add health check
  addCheck(name: string, check: HealthCheck): void;
  
  // Remove health check
  removeCheck(name: string): void;
  
  // Run all health checks
  checkHealth(): Promise<HealthReport>;
  
  // Get health status
  getStatus(): HealthStatus;
  
  // Get health score
  getScore(): number;
}
```

**Example:**
```typescript
import { HealthMonitor } from '@/lib/monitoring/health-monitor';

const monitor = new HealthMonitor();

// Add database health check
monitor.addCheck('database', async () => {
  try {
    await db.query('SELECT 1');
    return { status: 'healthy', message: 'Database connection OK' };
  } catch (error) {
    return { status: 'unhealthy', message: 'Database connection failed' };
  }
});

// Check health
const report = await monitor.checkHealth();
console.log('Health report:', report);
```

---

## ⚡ Performance APIs

### **Caching APIs**

#### `CacheManager`

Class for managing multi-layer caching.

```typescript
class CacheManager {
  constructor(config?: CacheConfig);
  
  // Get value from cache
  get<T>(key: string): Promise<T | null>;
  
  // Set value in cache
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  
  // Delete value from cache
  delete(key: string): Promise<void>;
  
  // Clear all cache
  clear(): Promise<void>;
  
  // Get cache statistics
  getStats(): CacheStats;
}
```

**Example:**
```typescript
import { CacheManager } from '@/lib/performance/cache-manager';

const cache = new CacheManager({
  memory: { maxSize: 50 * 1024 * 1024 }, // 50MB
  localStorage: { maxSize: 10 * 1024 * 1024 }, // 10MB
  ttl: 3600000 // 1 hour
});

// Cache user data
await cache.set('user:123', userData, 1800000); // 30 minutes

// Get cached data
const cachedUser = await cache.get<User>('user:123');
```

### **Bundle Optimization**

#### `BundleAnalyzer`

Class for analyzing and optimizing bundle sizes.

```typescript
class BundleAnalyzer {
  constructor(config?: BundleConfig);
  
  // Analyze bundle
  analyze(): Promise<BundleReport>;
  
  // Get bundle size
  getSize(): Promise<BundleSize>;
  
  // Get chunk analysis
  getChunks(): Promise<ChunkAnalysis[]>;
  
  // Get recommendations
  getRecommendations(): Promise<OptimizationRecommendation[]>;
  
  // Validate performance budget
  validateBudget(): Promise<BudgetValidation>;
}
```

**Example:**
```typescript
import { BundleAnalyzer } from '@/lib/performance/bundle-analyzer';

const analyzer = new BundleAnalyzer({
  bundleSizeLimit: 100000, // 100KB
  chunkSizeLimit: 50000,   // 50KB
});

const report = await analyzer.analyze();
console.log('Bundle report:', report);

const recommendations = await analyzer.getRecommendations();
console.log('Optimization recommendations:', recommendations);
```

---

## 🎨 Design System APIs

### **Design Tokens**

#### `DesignTokenProvider`

React context provider for design tokens.

```typescript
interface DesignTokenProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  tokens?: Partial<DesignTokens>;
}

function DesignTokenProvider({ children, theme, tokens }: DesignTokenProviderProps): JSX.Element;
```

**Example:**
```typescript
import { DesignTokenProvider } from '@/lib/design-tokens/provider';

function App() {
  return (
    <DesignTokenProvider theme="light">
      <YourApp />
    </DesignTokenProvider>
  );
}
```

#### `useDesignTokens(): DesignTokens`

React hook for accessing design tokens.

**Example:**
```typescript
import { useDesignTokens } from '@/hooks/useDesignTokens';

function Button({ children }: { children: React.ReactNode }) {
  const tokens = useDesignTokens();
  
  return (
    <button
      style={{
        backgroundColor: tokens.colors.accent.500,
        color: tokens.colors.neutral.50,
        padding: tokens.spacing[2],
        borderRadius: tokens.borderRadius.md
      }}
    >
      {children}
    </button>
  );
}
```

### **Component Library APIs**

#### `DataTable<T>`

Advanced data table component.

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  selection?: SelectionConfig;
  loading?: boolean;
  error?: string;
  onSort?: (sorting: SortingConfig) => void;
  onFilter?: (filtering: FilteringConfig) => void;
  onSelectionChange?: (selection: SelectionConfig) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

function DataTable<T>(props: DataTableProps<T>): JSX.Element;
```

**Example:**
```typescript
import { DataTable } from '@/components/ui/data-table';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', filterable: true }
];

function UserTable({ users }: { users: User[] }) {
  return (
    <DataTable
      data={users}
      columns={columns}
      pagination={{ pageSize: 10 }}
      sorting={{ key: 'name', direction: 'asc' }}
      onSort={(sorting) => console.log('Sorting changed:', sorting)}
    />
  );
}
```

#### `FormBuilder`

Dynamic form generation component.

```typescript
interface FormBuilderProps {
  schema: FormSchema;
  data?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void;
  onChange?: (data: Record<string, any>) => void;
  validation?: ValidationConfig;
  layout?: FormLayout;
}

function FormBuilder(props: FormBuilderProps): JSX.Element;
```

**Example:**
```typescript
import { FormBuilder } from '@/components/ui/form-builder';

const userFormSchema = {
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      validation: { minLength: 2, maxLength: 100 }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ]
    }
  ]
};

function UserForm() {
  return (
    <FormBuilder
      schema={userFormSchema}
      onSubmit={(data) => console.log('Form submitted:', data)}
    />
  );
}
```

---

## 🛠️ Utility Functions

### **Validation Utilities**

#### `validateEmail(email: string): boolean`

Validates email format.

**Example:**
```typescript
import { validateEmail } from '@/lib/utils/validation';

const isValid = validateEmail('user@example.com'); // true
```

#### `validatePassword(password: string): PasswordValidation`

Validates password strength.

**Returns:**
```typescript
interface PasswordValidation {
  isValid: boolean;
  score: number;
  feedback: string[];
}
```

**Example:**
```typescript
import { validatePassword } from '@/lib/utils/validation';

const validation = validatePassword('SecurePass123!');
console.log('Password score:', validation.score);
console.log('Feedback:', validation.feedback);
```

### **Date Utilities**

#### `formatDate(date: Date, format?: string): string`

Formats a date according to the specified format.

**Example:**
```typescript
import { formatDate } from '@/lib/utils/date';

const formatted = formatDate(new Date(), 'YYYY-MM-DD'); // "2025-01-27"
```

#### `parseDate(dateString: string): Date | null`

Parses a date string into a Date object.

**Example:**
```typescript
import { parseDate } from '@/lib/utils/date';

const date = parseDate('2025-01-27'); // Date object
```

### **String Utilities**

#### `sanitizeHtml(html: string): string`

Sanitizes HTML content to prevent XSS attacks.

**Example:**
```typescript
import { sanitizeHtml } from '@/lib/utils/string';

const clean = sanitizeHtml('<script>alert("xss")</script><p>Safe content</p>');
// Returns: '<p>Safe content</p>'
```

#### `slugify(text: string): string`

Converts text to URL-friendly slug.

**Example:**
```typescript
import { slugify } from '@/lib/utils/string';

const slug = slugify('Hello World!'); // "hello-world"
```

---

## 🚨 Error Handling APIs

### **Error Boundary**

#### `ErrorBoundary`

React component for catching and handling errors.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element;
```

**Example:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={({ error }) => <div>Something went wrong: {error.message}</div>}
      onError={(error, errorInfo) => {
        console.error('Error caught:', error, errorInfo);
        // Report to monitoring service
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### **Error Handler**

#### `UnifiedErrorHandler`

Class for centralized error handling.

```typescript
class UnifiedErrorHandler {
  static handle(error: Error, context?: ErrorContext): void;
  static handleAsync(error: Error, context?: ErrorContext): Promise<void>;
  static setHandler(handler: ErrorHandler): void;
  static getHandler(): ErrorHandler;
}
```

**Example:**
```typescript
import { UnifiedErrorHandler } from '@/lib/errors/handler';

// Set custom error handler
UnifiedErrorHandler.setHandler((error, context) => {
  console.error('Custom error handler:', error, context);
  // Send to monitoring service
});

// Handle error
try {
  // Some operation
} catch (error) {
  UnifiedErrorHandler.handle(error, {
    component: 'UserForm',
    action: 'submit'
  });
}
```

---

## 🔒 Security APIs

### **CSRF Protection**

#### `generateCsrfToken(): string`

Generates a CSRF token.

**Example:**
```typescript
import { generateCsrfToken } from '@/lib/security/csrf';

const token = generateCsrfToken();
```

#### `validateCsrfToken(token: string): boolean`

Validates a CSRF token.

**Example:**
```typescript
import { validateCsrfToken } from '@/lib/security/csrf';

const isValid = validateCsrfToken(token);
```

### **Input Sanitization**

#### `sanitizeInput(input: any): any`

Sanitizes user input to prevent injection attacks.

**Example:**
```typescript
import { sanitizeInput } from '@/lib/security/sanitization';

const cleanInput = sanitizeInput(userInput);
```

---

## 🧪 Testing APIs

### **Test Utilities**

#### `renderWithProviders(component: ReactElement, options?: RenderOptions): RenderResult`

Renders a component with all necessary providers for testing.

**Example:**
```typescript
import { renderWithProviders } from '@/lib/testing/utils';

const { getByText } = renderWithProviders(<UserProfile user={mockUser} />);
expect(getByText('John Doe')).toBeInTheDocument();
```

#### `createMockUser(overrides?: Partial<User>): User`

Creates a mock user for testing.

**Example:**
```typescript
import { createMockUser } from '@/lib/testing/mocks';

const mockUser = createMockUser({
  name: 'Test User',
  email: 'test@example.com'
});
```

---

## 📚 Additional Resources

### **Type Definitions**

All TypeScript interfaces and types are available in:
- `@/types/api.ts` - API-related types
- `@/types/user.ts` - User-related types
- `@/types/auth.ts` - Authentication types
- `@/types/performance.ts` - Performance monitoring types
- `@/types/design-system.ts` - Design system types

### **Configuration**

API configuration is available in:
- `@/config/api.ts` - API endpoints and settings
- `@/config/auth.ts` - Authentication settings
- `@/config/monitoring.ts` - Monitoring configuration

### **Examples**

Complete examples are available in:
- `@/examples/api-usage/` - API usage examples
- `@/examples/components/` - Component usage examples
- `@/examples/integration/` - Integration examples

---

## ✅ Conclusion

This API reference provides comprehensive documentation for all APIs and utilities implemented during HT-008. All APIs follow consistent patterns and include proper TypeScript support, error handling, and documentation.

**Key Features:**
- ✅ Complete TypeScript support
- ✅ Comprehensive error handling
- ✅ Performance monitoring integration
- ✅ Security best practices
- ✅ Extensive examples and documentation

---

**Documentation Created:** January 27, 2025  
**Phase:** HT-008.11.2 - Documentation & Training  
**Status:** ✅ **COMPLETE**
