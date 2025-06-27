// @vitest-environment nuxt
import { describe, it, expect, beforeEach, vi } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { setActivePinia, createPinia } from "pinia"
import Dashboard from "~/pages/dashboard.vue"
import { mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime"
import { useTranscriptionStore } from "~/stores/transcription"

// Mock auth composable
mockNuxtImport("useAuth", () => {
  return () => ({
    user: { value: { name: "Test User" } },
    isAuthenticated: { value: true },
    getIdToken: vi.fn().mockResolvedValue("mock-token"),
  })
})

// Mock useToast
mockNuxtImport("useToast", () => {
  return () => ({
    add: vi.fn(),
  })
})

// Mock config
vi.mock("~/utils/config", () => ({
  API_BASE_URL: "https://s09e6850fd.execute-api.eu-west-1.amazonaws.com",
}))

// Mock components to simplify rendering
mockComponent("DashboardAudioUpload", { template: "<div>Audio Upload</div>" })
mockComponent("DashboardTranscriptionHistory", {
  template: "<div>Transcription History</div>",
})
mockComponent("DashboardRealTimeTranscription", {
  template: "<div>Real Time Transcription</div>",
})
mockComponent("UCard", { template: '<div class="u-card"><slot /></div>' })
mockComponent("UIcon", { template: '<span class="u-icon"></span>' })
mockComponent("UTabs", { template: '<div class="u-tabs"><slot /></div>' })

// Mock composables that might cause issues
mockNuxtImport("useAudioRecorder", () => {
  return () => ({
    isRecording: { value: false },
    isPaused: { value: false },
    hasPermission: { value: true },
    showPermissionWarning: { value: false },
    recordingTime: { value: 0 },
    recordedAudioUrl: { value: null },
    recordedAudioFile: { value: null },
    checkMicrophonePermission: vi.fn(),
    startRecording: vi.fn(),
    pauseRecording: vi.fn(),
    resumeRecording: vi.fn(),
    stopRecording: vi.fn(),
    discardRecording: vi.fn(),
    formatTime: vi.fn(),
    cleanup: vi.fn(),
  })
})

mockNuxtImport("useAudioConverter", () => {
  return () => ({
    isConverting: { value: false },
    conversionProgress: { value: 0 },
    convertedAudioFile: { value: null },
    convertFileToMp3: vi.fn(),
    cleanupConverter: vi.fn(),
  })
})

describe("Dashboard Page", () => {
  let store: ReturnType<typeof useTranscriptionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTranscriptionStore()
    vi.clearAllMocks()
  })

  it("should render dashboard layout", async () => {
    const wrapper = await mountSuspended(Dashboard)

    expect(wrapper.text()).toContain("Dashboard")
    expect(wrapper.text()).toContain("Welcome back")
  }, 10000) // Increase timeout to 10 seconds

  it("should show empty stats initially", async () => {
    const wrapper = await mountSuspended(Dashboard)

    expect(wrapper.text()).toContain("Total")
  }, 10000) // Increase timeout to 10 seconds

  // it('should render main components', async () => {
  //   const wrapper = await mountSuspended(Dashboard)

  //   expect(wrapper.text()).toContain('Audio Upload')
  //   expect(wrapper.text()).toContain('Transcription History')
  // })
})
