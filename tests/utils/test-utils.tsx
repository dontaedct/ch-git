/**
 * @fileoverview Comprehensive Test Utilities for DCT Micro-Apps
 * @description Test utilities, custom renderers, and common test helpers
 * @version 1.0.0
 * @author SOS Operation Phase 3 Task 15
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client for tests
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
  rpc: jest.fn(),
};

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}));

// Create a custom renderer that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system';
  queryClient?: QueryClient;
}

const AllTheProviders = ({ 
  children, 
  theme = 'light',
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}: { 
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
  queryClient?: QueryClient;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { theme, queryClient, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders theme={theme} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { mockSupabaseClient, mockRouter };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockFormData = (overrides = {}) => ({
  name: 'Test Form',
  email: 'test@example.com',
  message: 'Test message',
  ...overrides,
});

// Async test helpers
export const waitForElementToBeRemoved = (element: Element | null) => {
  return new Promise<void>((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Form testing helpers
export const fillForm = async (formData: Record<string, string>) => {
  const { screen } = await import('@testing-library/react');
  const { userEvent } = await import('@testing-library/user-event');
  
  const user = userEvent.setup();
  
  for (const [name, value] of Object.entries(formData)) {
    const input = screen.getByRole('textbox', { name: new RegExp(name, 'i') }) ||
                  screen.getByLabelText(new RegExp(name, 'i')) ||
                  screen.getByPlaceholderText(new RegExp(name, 'i'));
    
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
};

// API testing helpers
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

export const mockApiError = (message: string, status = 500) => {
  return Promise.reject(new Error(message));
};

// Snapshot testing helpers
export const expectSnapshot = (component: ReactElement) => {
  const { container } = render(component);
  expect(container.firstChild).toMatchSnapshot();
};

// Accessibility testing helpers
export const expectAccessible = async (component: ReactElement) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  const { container } = render(component);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Performance testing helpers
export const measurePerformance = async (fn: () => void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Cleanup helpers
export const cleanupAfterEach = () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
};

// Test environment setup
export const setupTestEnvironment = () => {
  beforeAll(() => {
    // Global test setup
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  afterAll(() => {
    // Global test cleanup
  });
};
