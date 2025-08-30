// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Polyfill TextEncoder for Node.js environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock Next.js server components
jest.mock('next/server', () => {
  const mockNextResponse = {
    json: jest.fn().mockImplementation((data, init) => {
      const response = {
        status: init?.status || 200,
        headers: new Map(Object.entries(init?.headers || {})),
        json: jest.fn().mockResolvedValue(data),
      };
      // Add getter for status if needed
      Object.defineProperty(response, 'status', {
        get: () => init?.status || 200,
        set: () => {},
      });
      return response;
    }),
    next: jest.fn().mockReturnValue({
      status: 200,
      headers: new Map()
    })
  };

  return {
    NextRequest: jest.fn().mockImplementation((url, init) => ({
      url,
      method: init?.method || 'GET',
      headers: new Map(Object.entries(init?.headers || {})),
      ...init
    })),
    NextResponse: mockNextResponse
  };
});

// Mock Web APIs for Node environment
if (typeof Request === 'undefined') {
  global.Request = class MockRequest {
    constructor(url, init = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new Map(Object.entries(init.headers || {}));
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class MockResponse {
    constructor(body, init = {}) {
      this.status = init.status || 200;
      this.headers = new Map(Object.entries(init.headers || {}));
      this.body = body;
    }
    
    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
  };
}
