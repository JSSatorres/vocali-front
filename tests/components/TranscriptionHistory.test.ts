// @vitest-environment nuxt
import { describe, it, expect, beforeEach, vi } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { setActivePinia, createPinia } from "pinia"
import TranscriptionHistory from "~/components/Dashboard/TranscriptionHistory.vue"
import { mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime"
import { useTranscriptionStore } from "~/stores/transcription"
import { TranscriptionMother } from "../test-data/TranscriptionMother"

mockNuxtImport("useAuth", () => {
  return () => ({
    user: { value: { name: "Test User" } },
    isAuthenticated: { value: true },
    getIdToken: vi.fn().mockResolvedValue("mock-token"),
  })
})

vi.mock("~/utils/config", () => ({
  API_BASE_URL: "https://s09e6850fd.execute-api.eu-west-1.amazonaws.com",
}))

mockNuxtImport("useToast", () => {
  return () => ({
    add: vi.fn(),
  })
})

mockComponent("UCard", { template: '<div class="u-card"><slot /></div>' })
mockComponent("UButton", { template: "<button><slot /></button>" })
mockComponent("UBadge", { template: '<span class="badge"><slot /></span>' })
mockComponent("USelect", { template: "<select><slot /></select>" })
mockComponent("UInput", { template: "<input />" })
mockComponent("UIcon", { template: '<span class="icon"></span>' })
mockComponent("UPagination", { template: '<div class="pagination"></div>' })
mockComponent("DashboardTranscriptionCard", {
  template:
    '<div class="transcription-card">{{ transcription.filename }}</div>',
  props: ["transcription"],
})
mockComponent("DashboardTranscriptionsList", {
  template: '<div class="transcriptions-list">Transcriptions List</div>',
  props: [
    "transcriptions",
    "isLoading",
    "searchQuery",
    "sortBy",
    "sortOptions",
  ],
  emits: ["refresh", "delete", "update:sortBy"],
})

describe("TranscriptionHistory Component", () => {
  let store: ReturnType<typeof useTranscriptionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTranscriptionStore()
    vi.clearAllMocks()
  })

  it("should render stats section", async () => {
    const wrapper = await mountSuspended(TranscriptionHistory)

    expect(wrapper.text()).toContain("Total")
    expect(wrapper.text()).toContain("Completed")
    expect(wrapper.text()).toContain("Total Duration")
  })

  it("should show empty state when no transcriptions", async () => {
    store.transcriptions = []
    store.isLoading = false

    const wrapper = await mountSuspended(TranscriptionHistory)

    expect(wrapper.text()).toContain("Total")
    expect(wrapper.text()).toContain("0")
  })
})
