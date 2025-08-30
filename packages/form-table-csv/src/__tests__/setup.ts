import '@testing-library/jest-dom'

// Mock crypto.randomUUID for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
})

// Mock window.URL methods
Object.defineProperty(window, 'URL', {
  writable: true,
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
})

// Mock Blob
global.Blob = class MockBlob {
  constructor(public parts: any[], public options: any = {}) {}
} as any

// Mock document methods for CSV export
Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn((tag: string) => {
    const element = {
      tagName: tag.toUpperCase(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      click: jest.fn(),
      style: {},
      download: true
    }
    return element
  })
})

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: jest.fn()
})

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: jest.fn()
})