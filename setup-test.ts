import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized in another test file
}

const originalConsoleError = console.error;
console.error = function (...args: unknown[]) {
  originalConsoleError.apply(console, args);
  throw new Error(String(args[0]));
};

// The demo components load sample data with `fetch` when they are constructed. Tests must stay
// deterministic and offline, so the global `fetch` is replaced with a canned response that matches
// the shapes the demos expect (plain arrays and `{ data: [...] }` envelopes).
const sampleRecord = { id: 1, name: 'sample', title: 'sample', completed: false };

globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : (input as Request).url ?? String(input);
  const body = url.includes('/todos') ? [sampleRecord] : { data: [sampleRecord] };

  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}) as unknown as typeof fetch;

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    };
  },
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

try {
  Object.defineProperty(document.body.style, 'transform', {
    value: () => {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
} catch {
  // jsdom proxy may not allow redefining style properties
}

export const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
