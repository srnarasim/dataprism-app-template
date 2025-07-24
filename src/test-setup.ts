import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
(global as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock File API
(global as any).File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  webkitRelativePath: string;

  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    this.name = name;
    this.size = bits.reduce((size, bit) => {
      if (typeof bit === 'string') return size + bit.length;
      if (bit instanceof ArrayBuffer) return size + bit.byteLength;
      return size + (bit as any).size || 0;
    }, 0);
    this.type = options?.type || '';
    this.lastModified = options?.lastModified || Date.now();
    this.webkitRelativePath = '';
  }

  text() {
    return Promise.resolve('mocked file content');
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  stream() {
    return new ReadableStream();
  }

  slice() {
    return new Blob();
  }
} as any;

// Mock FileReader
(global as any).FileReader = class MockFileReader {
  readyState = 0;
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;

  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  abort() {}

  readAsArrayBuffer() {
    this.result = new ArrayBuffer(0);
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  readAsBinaryString() {
    this.result = '';
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  readAsDataURL() {
    this.result = 'data:text/plain;base64,';
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  readAsText() {
    this.result = 'mocked file content';
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
} as any;

// Mock DataPrism Engine for testing
export const mockDataPrismEngine = {
  initialize: vi.fn().mockResolvedValue(undefined),
  cleanup: vi.fn(),
  processData: vi.fn().mockResolvedValue({
    processedData: [
      { name: 'Test 1', value: 100 },
      { name: 'Test 2', value: 200 },
    ],
    metadata: {
      rowCount: 2,
      columnCount: 2,
      processingTime: 50,
    },
  }),
  query: vi.fn().mockResolvedValue({
    data: [],
    metadata: { rowCount: 0, executionTime: 10 },
  }),
  loadPlugin: vi.fn().mockResolvedValue(undefined),
};

// Mock CDN loader
export const mockCDNLoader = vi.fn().mockResolvedValue(mockDataPrismEngine);

// Console override to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

(global as any).beforeEach(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Add custom matchers for DataPrism testing
expect.extend({
  toBeValidDataPrismResult(received: any) {
    const pass =
      received &&
      typeof received === 'object' &&
      Array.isArray(received.data) &&
      received.metadata &&
      typeof received.metadata.rowCount === 'number';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid DataPrism result`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be a valid DataPrism result with data array and metadata`,
        pass: false,
      };
    }
  },

  toHaveProcessingTime(received: any, expectedMax: number) {
    const pass =
      received &&
      received.metadata &&
      typeof received.metadata.processingTime === 'number' &&
      received.metadata.processingTime <= expectedMax;

    if (pass) {
      return {
        message: () =>
          `expected processing time ${received.metadata.processingTime} to be greater than ${expectedMax}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected processing time to be <= ${expectedMax}ms, but got ${received?.metadata?.processingTime}ms`,
        pass: false,
      };
    }
  },
});

// Type declarations for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidDataPrismResult(): T;
    toHaveProcessingTime(expectedMax: number): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidDataPrismResult(): any;
    toHaveProcessingTime(expectedMax: number): any;
  }
}
