<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex items-center gap-4">
      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h4
              class="font-medium text-gray-900 dark:text-white truncate"
              :title="transcription.filename"
            >
              {{ transcription.filename }}
            </h4>
            <div
              class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1"
            >
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                {{ transcription.duration }}
              </span>
              <span
                v-if="transcription.language"
                class="flex items-center gap-1"
              >
                <UIcon name="i-lucide-globe" class="w-3 h-3" />
                {{ transcription.language }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-hard-drive" class="w-3 h-3" />
                {{ transcription.fileSize }}
              </span>
            </div>
          </div>

          <!-- Status Badge -->
          <UBadge
            :color="getStatusColor(transcription.status)"
            variant="subtle"
            class="ml-2"
            data-cy="status-badge"
          >
            {{ transcription.status }}
          </UBadge>
        </div>

        <!-- Transcription Preview -->
        <div
          v-if="
            transcription.transcriptionText &&
            transcription.status === 'completed'
          "
          class="mb-3"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ transcription.transcriptionText }}
          </p>
        </div>

        <!-- Processing Message -->
        <div
          v-else-if="
            transcription.status === 'processing' ||
            transcription.status === 'pending'
          "
          class="mb-3"
        >
          <div
            class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
          >
            <UIcon name="i-lucide-loader" class="w-4 h-4 animate-spin" />
            <span>{{
              transcription.status === "pending"
                ? "Queued for processing..."
                : "Processing transcription..."
            }}</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-else-if="transcription.status === 'failed'" class="mb-3">
          <div
            class="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <UIcon name="i-lucide-alert-circle" class="w-4 h-4" />
            <span>Transcription failed. Please try again.</span>
          </div>
        </div>

        <!-- Metadata Row -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDate(transcription.createdAt) }}
          </span>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <UButton
              v-if="transcription.status === 'completed'"
              @click="handleDownload"
              variant="ghost"
              size="xs"
              data-cy="download-button"
              title="Download transcription"
              :loading="isDownloading"
            >
              <UIcon name="i-lucide-download" class="w-4 h-4" />
            </UButton>

            <UButton
              @click="confirmDelete"
              variant="ghost"
              size="xs"
              color="red"
              data-cy="delete-button"
              title="Delete transcription"
            >
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Transcription } from "~/types/transcription"
import { formatDate, getStatusColor } from "../dashboardsUtils/dashboardsUtils"
interface Props {
  transcription: Transcription
}

const toast = useToast()
const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [transcription: Transcription]
}>()

const isDownloading = ref(false)

const confirmDelete = () => {
  const confirmed = confirm(
    `Are you sure you want to delete "${props.transcription.filename}"? This action cannot be undone.`
  )
  if (confirmed) {
    emit("delete", props.transcription)
  }
}

const handleDownload = async () => {
  const { getIdToken } = useAuth()
  const token = await getIdToken()

  const API_BASE_URL = useRuntimeConfig().public.API_BASE_URL
  const url = `${API_BASE_URL}/transcriptions/${props.transcription.id}/download`

  try {
    isDownloading.value = true

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`Error al obtener el fichero (${res.status})`)
    }

    const blob = await res.blob()

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = `${props.transcription.filename}-transcription.txt`
    document.body.appendChild(a)
    a.click()

    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (err: any) {
    toast.add({
      title: "download failed",
      icon: "i-lucide-check-circle",
      color: "red",
    })
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
