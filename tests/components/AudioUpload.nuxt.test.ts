// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { setActivePinia, createPinia } from "pinia"
import AudioUpload from "~/components/Dashboard/AudioUpload.vue"
import { mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime"
import { useTranscriptionStore } from "~/stores/transcription"

// Mock UI components to avoid complex rendering
mockComponent("UCard", { template: '<div class="u-card"><slot /></div>' })
mockComponent("UButton", {
  template:
    '<button @click="$emit(\'click\')" :disabled="$attrs.disabled"><slot /></button>',
  emits: ["click"],
})
mockComponent("UIcon", { template: '<span class="u-icon"></span>' })
mockComponent("UProgress", { template: '<div class="u-progress"></div>' })

// Mock toast
const mockToast = {
  add: vi.fn(),
}

mockNuxtImport("useToast", () => {
  return () => mockToast
})

describe("AudioUpload Component", () => {
  let store: ReturnType<typeof useTranscriptionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTranscriptionStore()
    vi.clearAllMocks()
  })

  it("should render upload interface", async () => {
    const wrapper = await mountSuspended(AudioUpload)

    expect(wrapper.text()).toContain("Upload Audio File")
    expect(wrapper.text()).toContain("Drag and drop your audio file here")
  })

  // it('should show file info when file is selected', async () => {
  //   const wrapper = await mountSuspended(AudioUpload)
  //   const vm = wrapper.vm as any

  //   // Set a file directly on the component
  //   vm.selectedFile = new File(['audio content'], 'test.wav', { type: 'audio/wav' })
  //   await wrapper.vm.$nextTick()

  //   expect(wrapper.text()).toContain('test.wav')
  // })

  // it('should show loading state during upload', async () => {
  //   store.isUploading = true

  //   const wrapper = await mountSuspended(AudioUpload)

  //   expect(wrapper.text()).toContain('Processing')
  // })
})
