<template>
  <UCard class="hover:shadow-md transition-shadow">
    <div class="flex items-center gap-4">
      <!-- File Icon -->
      <div
        class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        :class="getIconBackground(transcription.status)"
      >
        <UIcon
          :name="getIcon(transcription.status)"
          class="w-6 h-6"
          :class="getIconColor(transcription.status)"
        />
      </div>

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
              <span class="flex items-center gap-1">
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
          v-if="transcription.text && transcription.status === 'completed'"
          class="mb-3"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ transcription.text }}
          </p>
        </div>

        <!-- Processing Message -->
        <div v-else-if="transcription.status === 'processing'" class="mb-3">
          <div
            class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
          >
            <UIcon name="i-lucide-loader" class="w-4 h-4 animate-spin" />
            <span>Processing transcription...</span>
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
              @click="$emit('download', transcription)"
              variant="ghost"
              size="xs"
              data-cy="download-button"
              title="Download transcription"
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
interface Transcription {
  id: string
  filename: string
  duration: string
  language: string
  status: "completed" | "processing" | "failed"
  createdAt: string
  text: string
  fileSize: string
}

interface Props {
  transcription: Transcription
}

const props = defineProps<Props>()

const emit = defineEmits<{
  download: [transcription: Transcription]
  delete: [transcription: Transcription]
}>()

const getIcon = (status: string) => {
  switch (status) {
    case "completed":
      return "i-lucide-file-text"
    case "processing":
      return "i-lucide-loader"
    case "failed":
      return "i-lucide-alert-circle"
    default:
      return "i-lucide-file"
  }
}

const getIconColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-500"
    case "processing":
      return "text-amber-500"
    case "failed":
      return "text-red-500"
    default:
      return "text-gray-500"
  }
}

const getIconBackground = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 dark:bg-green-900/20"
    case "processing":
      return "bg-amber-100 dark:bg-amber-900/20"
    case "failed":
      return "bg-red-100 dark:bg-red-900/20"
    default:
      return "bg-gray-100 dark:bg-gray-800"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "green"
    case "processing":
      return "amber"
    case "failed":
      return "red"
    default:
      return "gray"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return "Today"
  } else if (days === 1) {
    return "Yesterday"
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}

const confirmDelete = () => {
  if (
    confirm(
      `Are you sure you want to delete "${props.transcription.filename}"?`
    )
  ) {
    emit("delete", props.transcription)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
