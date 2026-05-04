import { vi } from "vitest";

// Use `globalThis` so mocks work in both Node and browser-like (jsdom/happy-dom) environments.
const globalWindow = globalThis as unknown as Window & typeof globalThis;

// Mock `window.matchMedia`
Object.defineProperty(globalWindow, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock `ResizeObserver`
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(globalWindow, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

// Mock `window.scrollTo`
Object.defineProperty(globalWindow, "scrollTo", {
  writable: true,
  value: vi.fn(),
});
