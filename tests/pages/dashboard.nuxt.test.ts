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
  })
})

// Mock components to simplify rendering
mockComponent("DashboardAudioUpload", { template: "<div>Audio Upload</div>" })
mockComponent("DashboardTranscriptionHistory", {
  template: "<div>Transcription History</div>",
})
mockComponent("UCard", { template: '<div class="u-card"><slot /></div>' })
mockComponent("UIcon", { template: '<span class="u-icon"></span>' })

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
  })

  it("should show empty stats initially", async () => {
    const wrapper = await mountSuspended(Dashboard)

    expect(wrapper.text()).toContain("Total")
  })

  // it('should render main components', async () => {
  //   const wrapper = await mountSuspended(Dashboard)

  //   expect(wrapper.text()).toContain('Audio Upload')
  //   expect(wrapper.text()).toContain('Transcription History')
  // })
})
