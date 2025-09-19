import 'reflect-metadata';

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

afterAll(async () => {
  // Add any global cleanup here
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
