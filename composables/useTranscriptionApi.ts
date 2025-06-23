import type {
  Transcription,
  TranscriptionApiResponse,
  ApiError,
} from "~/types/transcription"

export const useTranscriptionApi = () => {
  const config = useRuntimeConfig()
  const API_BASE_URL = "https://s09e6850fd.execute-api.eu-west-1.amazonaws.com"

  // Estados reactivos
  const transcriptions = ref<Transcription[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Obtener todas las transcripciones
  const fetchTranscriptions = async (): Promise<Transcription[]> => {
    try {
      isLoading.value = true
      error.value = null

      console.log("Fetching transcriptions from:", `${API_BASE_URL}`)

      // Usar $fetch de Nuxt que maneja automáticamente la autenticación
      const response = await $fetch<TranscriptionApiResponse>(
        `${API_BASE_URL}/transcriptions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Nuxt automáticamente incluirá headers de autenticación si están disponibles
          },
        }
      )

      console.log("API Response:", response)

      if (response.status === "success") {
        transcriptions.value = response.data
        return response.data
      } else {
        throw new Error(response.message || "Failed to fetch transcriptions")
      }
    } catch (err: any) {
      console.error("Error fetching transcriptions:", err)
      error.value = err.message || "Failed to fetch transcriptions"

      // Si hay error de autenticación, podrías redirigir al login
      if (err.status === 401 || err.status === 403) {
        await navigateTo("/auth/login")
      }

      return []
    } finally {
      isLoading.value = false
    }
  }

  // Obtener una transcripción específica por ID
  const getTranscriptionById = async (
    id: string
  ): Promise<Transcription | null> => {
    try {
      const response = await $fetch<TranscriptionApiResponse>(
        `${API_BASE_URL}/transcriptions/${id}`,
        {
          method: "GET",
        }
      )

      if (response.status === "success" && response.data.length > 0) {
        return response.data[0]
      }
      return null
    } catch (err: any) {
      console.error("Error fetching transcription:", err)
      error.value = err.message || "Failed to fetch transcription"
      return null
    }
  }

  // Eliminar una transcripción
  const deleteTranscription = async (id: string): Promise<boolean> => {
    try {
      await $fetch(`${API_BASE_URL}/transcriptions/${id}`, {
        method: "DELETE",
      })

      // Actualizar la lista local
      transcriptions.value = transcriptions.value.filter((t) => t.id !== id)
      return true
    } catch (err: any) {
      console.error("Error deleting transcription:", err)
      error.value = err.message || "Failed to delete transcription"
      return false
    }
  }

  // Descargar el archivo de transcripción
  const downloadTranscription = async (
    transcription: Transcription
  ): Promise<void> => {
    try {
      // Si tiene texto de transcripción, descargarlo como archivo de texto
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
        // Si no hay texto, intentar descargar el archivo original (si la API lo permite)
        console.warn("No transcription text available for download")
      }
    } catch (err: any) {
      console.error("Error downloading transcription:", err)
      error.value = err.message || "Failed to download transcription"
    }
  }

  // Función helper para formatear la fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función helper para obtener el color del estado
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

  // Estadísticas computadas
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

  // Helper para parsear duración
  const parseDuration = (duration: string): number => {
    const parts = duration.split(":").map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1] // mm:ss
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2] // hh:mm:ss
    }
    return 0
  }

  // Auto-refresh cada 30 segundos si hay transcripciones en proceso
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
    }, 30000) // 30 segundos
  }

  const stopAutoRefresh = () => {
    if (autoRefresh.value) {
      clearInterval(autoRefresh.value)
      autoRefresh.value = null
    }
  }

  // Limpiar el intervalo cuando el composable se desmonte
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

    // Helpers
    formatDate,
    getStatusColor,

    // Estadísticas
    totalTranscriptions,
    completedTranscriptions,
    totalDuration,

    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
  }
}
