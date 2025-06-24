import { defineStore } from "pinia"
import type {
  Transcription,
  TranscriptionApiResponse,
} from "~/types/transcription"

const API_BASE_URL = "https://s09e6850fd.execute-api.eu-west-1.amazonaws.com"
// const API_BASE_URL = "http://localhost:3000"

export const useTranscriptionStore = defineStore("transcription", () => {
  // State
  const transcriptions = ref<Transcription[]>([])
  const isLoading = ref(false)
  const isUploading = ref(false) // New state for upload status
  const error = ref<string | null>(null)
  const autoRefresh = ref<NodeJS.Timeout | null>(null)

  // Getters (Computed)
  const totalTranscriptions = computed(() => transcriptions.value.length)
  const completedTranscriptions = computed(
    () => transcriptions.value.filter((t) => t.status === "completed").length
  )

  const parseDuration = (duration: string): number => {
    if (!duration || typeof duration !== "string") return 0
    const parts = duration.split(":").map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1] // mm:ss
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2] // hh:mm:ss
    }
    return 0
  }

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
    try {
      const response = await $fetch<TranscriptionApiResponse>(
        `${API_BASE_URL}/transcriptions`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
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
        body: formData,
        // Do NOT set the Content-Type header here; let the browser handle it
      })

      if (response.status === "success" && response.data) {
        // Add the new transcription to the top of the list
        transcriptions.value.unshift(response.data)
        // Optionally, you can re-fetch the entire list to ensure consistency
        // await fetchTranscriptions();
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
    try {
      await $fetch(`${API_BASE_URL}/transcriptions/${id}`, {
        method: "DELETE",
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
      } else {
        console.warn("No transcription text available for download")
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

  // Helpers (can be part of the store or outside)
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "green"
      case "processing":
        return "amber"
      case "failed":
        return "red"
      case "pending":
      default:
        return "gray"
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
    // Helpers
    formatDate,
    getStatusColor,
  }
})
