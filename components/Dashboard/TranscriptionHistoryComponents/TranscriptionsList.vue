<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Recent Transcriptions</h3>
        <div class="flex items-center gap-2">
          <UButton
            @click="$emit('refresh')"
            variant="ghost"
            size="sm"
            data-cy="refresh-button"
          >
            <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
          </UButton>
          <USelect
            :model-value="sortBy"
            @update:model-value="$emit('update:sortBy', $event)"
            :options="sortOptions"
            size="sm"
            data-cy="sort-select"
          />
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div
            class="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div
              class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="transcriptions.length === 0" class="text-center py-12">
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

      <div v-else class="space-y-4">
        <DashboardTranscriptionCard
          v-for="transcription in transcriptions"
          :key="transcription.id"
          :transcription="transcription"
          @delete="$emit('delete', transcription)"
          data-cy="transcription-card"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Transcription } from "~/types/transcription"
import DashboardTranscriptionCard from "~/components/Dashboard/TranscriptionHistoryComponents/TranscriptionCard.vue"

interface Props {
  transcriptions: Transcription[]
  isLoading: boolean
  searchQuery: string
  sortBy: string
  sortOptions: Array<{ label: string; value: string }>
}

defineProps<Props>()

defineEmits<{
  refresh: []
  delete: [transcription: Transcription]
  "update:sortBy": [value: string]
}>()
</script>
