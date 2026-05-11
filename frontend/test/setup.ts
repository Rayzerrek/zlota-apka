import { afterEach, vi } from "vitest";

const globalWindow = globalThis as unknown as Window & typeof globalThis;

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

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(globalWindow, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(globalWindow, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  vi.clearAllMocks();

  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});
