import { parseDuration } from "~/components/Dashboard/dashboardsUtils/dashboardsUtils"
import type {
  Transcription,
  TranscriptionApiResponse,
  ApiError,
} from "~/types/transcription"

export const useTranscriptionApi = async () => {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.API_BASE_URL

  const transcriptions = ref<Transcription[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const { getIdToken } = useAuth()
  const token = await getIdToken()

  const fetchTranscriptions = async (): Promise<Transcription[]> => {
    try {
      isLoading.value = true
      error.value = null

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
        return response.data
      } else {
        throw new Error(response.message || "Failed to fetch transcriptions")
      }
    } catch (err: any) {

      error.value = err.message || "Failed to fetch transcriptions"

      if (err.status === 401 || err.status === 403) {
        await navigateTo("/auth/login")
      }

      return []
    } finally {
      isLoading.value = false
    }
  }

  const getTranscriptionById = async (
    id: string
  ): Promise<Transcription | null> => {
    try {
      const response = await $fetch<TranscriptionApiResponse>(
        `${API_BASE_URL}/transcriptions/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === "success" && response.data.length > 0) {
        return response.data[0]
      }
      return null
    } catch (err: any) {
      error.value = err.message || "Failed to fetch transcription"
      return null
    }
  }

  const deleteTranscription = async (id: string): Promise<boolean> => {
    try {
      await $fetch(`${API_BASE_URL}/transcriptions/${id}`, {
        method: "DELETE",
      })

      transcriptions.value = transcriptions.value.filter((t) => t.id !== id)
      return true
    } catch (err: any) {
      console.error("Error deleting transcription:", err)
      error.value = err.message || "Failed to delete transcription"
      return false
    }
  }

  const downloadTranscription = async (
    transcription: Transcription
  ): Promise<void> => {
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
      console.error("Error downloading transcription:", err)
      error.value = err.message || "Failed to download transcription"
    }
  }

  const totalTranscriptions = computed(() => transcriptions.value.length)
  const completedTranscriptions = computed(
    () => transcriptions.value.filter((t) => t.status === "completed").length
  )
  const totalDuration = computed(() => {
    const totalMinutes = transcriptions.value
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => acc + parseDuration(t.duration), 0)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  })

  const autoRefresh = ref<NodeJS.Timeout | null>(null)

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

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // Estados
    transcriptions: readonly(transcriptions),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Métodos
    fetchTranscriptions,
    getTranscriptionById,
    deleteTranscription,
    downloadTranscription,

    // Estadísticas
    totalTranscriptions,
    completedTranscriptions,
    totalDuration,

    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
  }
}
