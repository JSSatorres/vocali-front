import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock navigator.mediaDevices for audio recorder tests
Object.defineProperty(global, "navigator", {
  value: {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  },
  writable: true,
})

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(global, "URL", {
  value: {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
})

// Mock MediaRecorder
Object.defineProperty(global, "MediaRecorder", {
  value: class MockMediaRecorder {
    constructor() {}
    start() {}
    stop() {}
    pause() {}
    resume() {}
    ondataavailable = null
    onstop = null
    onerror = null
    static isTypeSupported() {
      return true
    }
  },
  writable: true,
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
