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
          <USelect
            v-model="filterLanguage"
            :options="languageFilterOptions"
            placeholder="All languages"
            data-cy="language-filter"
          />

          <USelect
            v-model="filterStatus"
            :options="statusFilterOptions"
            placeholder="All status"
            data-cy="status-filter"
          />

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
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Recent Transcriptions</h3>
          <div class="flex items-center gap-2">
            <UButton
              @click="refreshList"
              variant="ghost"
              size="sm"
              data-cy="refresh-button"
            >
              <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
            </UButton>
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              size="sm"
              data-cy="sort-select"
            />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div
              class="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div
                class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
              <div class="flex-1 space-y-2">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                ></div>
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredTranscriptions.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-lucide-file-text"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No transcriptions found
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{
              searchQuery
                ? "Try adjusting your search or filters to find your transcriptions"
                : "Upload an audio file or start a real-time recording to create your first transcription"
            }}
          </p>
        </div>

        <!-- Transcriptions -->
        <div v-else class="space-y-4">
          <DashboardTranscriptionCard
            v-for="transcription in paginatedTranscriptions"
            :key="transcription.id"
            :transcription="transcription"
            @download="downloadTranscription"
            @delete="deleteTranscription"
            data-cy="transcription-card"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
          {{
            Math.min(currentPage * itemsPerPage, filteredTranscriptions.length)
          }}
          of {{ filteredTranscriptions.length }} results
        </div>

        <UPagination
          v-model="currentPage"
          :page-count="itemsPerPage"
          :total="filteredTranscriptions.length"
          data-cy="pagination"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"
import type { Transcription } from "~/types/transcription"
// Explicit import for TranscriptionCard component
import DashboardTranscriptionCard from "~/components/Dashboard/TranscriptionCard.vue"

// Use the Pinia store
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
  downloadTranscription: apiDownloadTranscription,
  startAutoRefresh,
  stopAutoRefresh,
} = store

// Local reactive state for UI
const searchQuery = ref("")
const filterLanguage = ref("")
const filterStatus = ref("")
const sortBy = ref("date-desc")
const currentPage = ref(1)
const itemsPerPage = 10

// Filter and sort options
const languageFilterOptions = markRaw([
  { label: "All Languages", value: "" },
  { label: "English", value: "English" },
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
])

const statusFilterOptions = markRaw([
  { label: "All Status", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Processing", value: "processing" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
])

const sortOptions = markRaw([
  { label: "Newest First", value: "date-desc" },
  { label: "Oldest First", value: "date-asc" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Duration", value: "duration" },
])

// Helper function for parsing duration
const parseDuration = (duration: string): number => {
  const parts = duration.split(":").map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1] // mm:ss
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2] // hh:mm:ss
  }
  return 0
}

// Computed properties for filtering and pagination
const filteredTranscriptions = computed(() => {
  let filtered = [...transcriptions.value] // Create a copy since transcriptions is readonly

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.filename.toLowerCase().includes(query) ||
        (t.transcriptionText &&
          t.transcriptionText.toLowerCase().includes(query))
    )
  }

  if (filterLanguage.value) {
    filtered = filtered.filter((t) => t.language === filterLanguage.value)
  }

  if (filterStatus.value) {
    filtered = filtered.filter((t) => t.status === filterStatus.value)
  }

  // Sort
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

const totalPages = computed(() =>
  Math.ceil(filteredTranscriptions.value.length / itemsPerPage)
)

const paginatedTranscriptions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTranscriptions.value.slice(start, end)
})

// UI action handlers
const resetFilters = () => {
  searchQuery.value = ""
  filterLanguage.value = ""
  filterStatus.value = ""
  currentPage.value = 1
}

const refreshList = async () => {
  await fetchTranscriptions()
  useToast().add({
    title: "Refreshed",
    description: "Transcription list updated.",
  })
}

const downloadTranscription = async (transcription: Transcription) => {
  await apiDownloadTranscription(transcription)
  useToast().add({
    title: "Downloaded",
    description: `${transcription.filename} transcription downloaded.`,
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

// Reset pagination when filters change
watch([searchQuery, filterLanguage, filterStatus], () => {
  currentPage.value = 1
})

// Lifecycle hooks
onMounted(async () => {
  // Fetch initial data
  await fetchTranscriptions()
  // Start auto-refresh for processing transcriptions
  startAutoRefresh()
})

onUnmounted(() => {
  // Stop auto-refresh when component is unmounted
  stopAutoRefresh()
})
</script>
