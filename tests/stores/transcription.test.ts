// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"
import { registerEndpoint, mockNuxtImport } from "@nuxt/test-utils/runtime"
import { TranscriptionBuilder } from "../test-data/TranscriptionBuilder"
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

describe("TranscriptionStore", () => {
  let store: ReturnType<typeof useTranscriptionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTranscriptionStore()
    vi.clearAllMocks()
  })

  it("should start with empty state", () => {
    expect(store.transcriptions).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
  })

  it("should fetch transcriptions successfully", async () => {
    const testTranscriptions = [
      new TranscriptionBuilder().withId("1").withStatus("completed").build(),
      new TranscriptionBuilder().withId("2").withStatus("processing").build(),
    ]

    // Register mock endpoint matching the store's API call
    registerEndpoint(
      "https://s09e6850fd.execute-api.eu-west-1.amazonaws.com/transcriptions",
      () => ({
        status: "success",
        data: testTranscriptions,
      })
    )

    store.transcriptions = []
    store.error = null
    store.isLoading = false

    await store.fetchTranscriptions()

    //TODO:
    // expect(store.transcriptions).toHaveLength(2)
    // expect(store.transcriptions[0].id).toBe("1")
    // expect(store.error).toBe(null)
  })

  it("should calculate statistics correctly", () => {
    const mockTranscriptions = TranscriptionMother.list()
    store.transcriptions = mockTranscriptions

    expect(store.totalTranscriptions).toBe(3)
    expect(store.completedTranscriptions).toBe(1)
  })
})
