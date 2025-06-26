import { defineStore } from "pinia"
import { parseDuration } from "~/components/Dashboard/dashboardsUtils/dashboardsUtils"
import type {
  Transcription,
  TranscriptionApiResponse,
} from "~/types/transcription"

export const useTranscriptionStore = defineStore("transcription", () => {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.API_BASE_URL

  const transcriptions = ref<Transcription[]>([])
  const isLoading = ref(false)
  const isUploading = ref(false)
  const error = ref<string | null>(null)
  const autoRefresh = ref<NodeJS.Timeout | null>(null)

  const totalTranscriptions = computed(() => transcriptions.value.length)
  const completedTranscriptions = computed(
    () => transcriptions.value.filter((t) => t.status === "completed").length
  )

  const totalDuration = computed(() => {
    const totalSeconds = transcriptions.value
      .filter((t) => t.status === "completed" && t.duration)
      .reduce((acc, t) => acc + parseDuration(t.duration), 0)

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  })

  // Actions
  const fetchTranscriptions = async () => {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null

    const { getIdToken } = useAuth()
    const token = await getIdToken()
    try {
      const response = await $fetch<TranscriptionApiResponse>(
        `${API_BASE_URL}/transcriptions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === "success") {
        transcriptions.value = response.data
      } else {
        throw new Error(response.message || "Failed to fetch transcriptions")
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch transcriptions"
      console.error("Error fetching transcriptions:", err)
      if (err.status === 401 || err.status === 403) {
        await navigateTo("/auth/login")
      }
    } finally {
      isLoading.value = false
    }
  }

  const uploadTranscription = async (file: File, settings: object) => {
    if (isUploading.value) return
    isUploading.value = true
    error.value = null

    const { getIdToken } = useAuth()
    const token = await getIdToken()

    const formData = new FormData()
    formData.append("file", file)
    formData.append("settings", JSON.stringify(settings))

    try {
      const response = await $fetch<{
        status: string
        message: string
        data: Transcription
      }>(`${API_BASE_URL}/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.status === "success") {
        transcriptions.value.unshift(response.data)
        return { status: response.status }
      } else {
        throw new Error(response.message || "Upload failed")
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || "Failed to upload file"
      console.error("Error uploading transcription:", err)
    } finally {
      isUploading.value = false
    }
  }

  const deleteTranscription = async (id: string): Promise<boolean> => {
    const { getIdToken } = useAuth()
    const token = await getIdToken()
    try {
      await $fetch(`${API_BASE_URL}/transcriptions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      // Optimistic update
      const index = transcriptions.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        transcriptions.value.splice(index, 1)
      }
      return true
    } catch (err: any) {
      error.value = err.message || "Failed to delete transcription"
      console.error("Error deleting transcription:", err)
      // Re-fetch to get the correct state from the server
      await fetchTranscriptions()
      return false
    }
  }

  const downloadTranscription = async (transcription: Transcription) => {
    try {
      if (transcription.transcriptionText) {
        const blob = new Blob([transcription.transcriptionText], {
          type: "text/plain",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${transcription.filename}-transcription.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err: any) {
      error.value = err.message || "Failed to download transcription"
      console.error("Error downloading transcription:", err)
    }
  }

  const startAutoRefresh = () => {
    if (autoRefresh.value) return
    autoRefresh.value = setInterval(() => {
      const hasProcessing = transcriptions.value.some(
        (t) => t.status === "processing" || t.status === "pending"
      )
      if (hasProcessing) {
        fetchTranscriptions()
      }
    }, 30000)
  }

  const stopAutoRefresh = () => {
    if (autoRefresh.value) {
      clearInterval(autoRefresh.value)
      autoRefresh.value = null
    }
  }

  return {
    // State
    transcriptions,
    isLoading,
    isUploading,
    error,
    // Getters
    totalTranscriptions,
    completedTranscriptions,
    totalDuration,
    // Actions
    fetchTranscriptions,
    uploadTranscription,
    deleteTranscription,
    downloadTranscription,
    startAutoRefresh,
    stopAutoRefresh,
  }
})
