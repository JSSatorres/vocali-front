<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <UCard>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Search transcriptions..."
            icon="i-lucide-search"
            data-cy="search-input"
          />
        </div>

        <div class="flex gap-3">
          <UButton
            @click="resetFilters"
            variant="outline"
            data-cy="reset-filters"
          >
            Reset
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Stats Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UCard>
        <div class="text-center p-4">
          <div class="text-2xl font-bold text-blue-500 mb-1">
            {{ totalTranscriptions }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center p-4">
          <div class="text-2xl font-bold text-green-500 mb-1">
            {{ completedTranscriptions }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center p-4">
          <div class="text-2xl font-bold text-amber-500 mb-1">
            {{ totalDuration }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total Duration
          </div>
        </div>
      </UCard>
    </div>

    <!-- Transcriptions List -->
    <DashboardTranscriptionsList
      :transcriptions="filteredTranscriptions"
      :is-loading="isLoading"
      :search-query="searchQuery"
      v-model:sort-by="sortBy"
      :sort-options="sortOptions"
      @refresh="refreshList"
      @delete="deleteTranscription"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"
import type { Transcription } from "~/types/transcription"
// Explicit import for components
import DashboardTranscriptionCard from "~/components/Dashboard/TranscriptionCard.vue"
import DashboardTranscriptionsList from "~/components/Dashboard/TranscriptionsList.vue"
import { parseDuration } from "./dashboardsUtils/dashboardsUtils"

const store = useTranscriptionStore()
const {
  transcriptions,
  isLoading,
  totalTranscriptions,
  completedTranscriptions,
  totalDuration,
} = storeToRefs(store)

const {
  fetchTranscriptions,
  deleteTranscription: apiDeleteTranscription,
  startAutoRefresh,
  stopAutoRefresh,
} = store

const searchQuery = ref("")
const sortBy = ref("date-desc")

const sortOptions = markRaw([
  { label: "Newest First", value: "date-desc" },
  { label: "Oldest First", value: "date-asc" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Duration", value: "duration" },
])

const filteredTranscriptions = computed(() => {
  let filtered = [...transcriptions.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.filename.toLowerCase().includes(query) ||
        (t.transcriptionText &&
          t.transcriptionText.toLowerCase().includes(query))
    )
  }

  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "date-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "name-asc":
        return a.filename.localeCompare(b.filename)
      case "name-desc":
        return b.filename.localeCompare(a.filename)
      case "duration":
        return parseDuration(b.duration) - parseDuration(a.duration)
      default:
        return 0
    }
  })

  return filtered
})

const resetFilters = () => {
  searchQuery.value = ""
}

const refreshList = async () => {
  await fetchTranscriptions()
  useToast().add({
    title: "Refreshed",
    description: "Transcription list updated.",
  })
}

const deleteTranscription = async (transcription: Transcription) => {
  const success = await apiDeleteTranscription(transcription.id)
  if (success) {
    useToast().add({
      title: "Deleted",
      description: `${transcription.filename} has been deleted.`,
      color: "red",
    })
  } else {
    useToast().add({
      title: "Error",
      description: `Failed to delete ${transcription.filename}.`,
      color: "red",
    })
  }
}

onMounted(async () => {
  await fetchTranscriptions()

  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
