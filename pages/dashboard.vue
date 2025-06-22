<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Welcome back, {{ user?.username }}! Manage your transcriptions.
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <UCard>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Total transcriptions
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-clock" class="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                12.5h
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total time</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <UTabs v-model="activeTab" :items="tabs" class="w-full">
      <!-- Tab Panels -->
      <template #item="{ item }">
        <div class="mt-6">
          <!-- Audio Upload Tab -->
          <div v-if="item.key === 'upload'" class="w-full">
            <DashboardAudioUpload />
          </div>

          <!-- Real Time Transcription Tab -->
          <div v-else-if="item.key === 'realtime'" class="w-full">
            <DashboardRealTimeTranscription />
          </div>

          <!-- History Tab -->
          <div v-else-if="item.key === 'history'">
            <DashboardTranscriptionHistory />
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
// Explicit imports for dashboard components
import DashboardAudioUpload from "~/components/Dashboard/AudioUpload.vue"
import DashboardRealTimeTranscription from "~/components/Dashboard/RealTimeTranscription.vue"
import DashboardTranscriptionHistory from "~/components/Dashboard/TranscriptionHistory.vue"

definePageMeta({
  middleware: "auth",
})

const { user } = useAuth()

const activeTab = ref(0)

const tabs = [
  {
    key: "upload",
    label: "Upload Audio",
    icon: "i-lucide-upload",
  },
  {
    key: "realtime",
    label: "Real Time",
    icon: "i-lucide-mic",
  },
  {
    key: "history",
    label: "History",
    icon: "i-lucide-history",
  },
]

useHead({
  title: "Dashboard - Vocali",
  meta: [
    {
      name: "description",
      content: "Vocali dashboard for managing transcriptions",
    },
  ],
})
</script>
