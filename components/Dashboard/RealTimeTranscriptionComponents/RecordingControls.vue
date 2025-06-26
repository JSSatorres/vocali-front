<template>
  <UCard v-if="!recordedAudioUrl">
    <div class="text-center p-8">
      <div
        class="mx-auto h-24 mb-6 rounded-full flex items-center justify-center transition-colors"
        :class="
          isRecording
            ? 'bg-red-100 dark:bg-red-900/20'
            : 'bg-blue-100 dark:bg-blue-900/20'
        "
      >
        <UIcon
          :name="isRecording ? 'i-lucide-mic' : 'i-lucide-mic-off'"
          class="w-12 h-12"
          :class="isRecording ? 'text-red-500' : 'text-blue-500'"
        />
      </div>

      <h3 class="text-xl font-semibold mb-2">
        {{ isRecording ? "Recording..." : "Real-Time Transcription" }}
      </h3>

      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{
          isRecording
            ? "Click stop when finished"
            : "Click the microphone to start recording"
        }}
      </p>

      <!-- Recording Timer -->
      <div v-if="isRecording" class="mb-6">
        <div class="text-2xl font-mono font-bold text-red-500 mb-2">
          {{ formatTime(recordingTime) }}
        </div>
        <div
          class="flex items-center justify-center gap-2 text-sm text-gray-600"
        >
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Recording in progress
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center justify-center gap-4">
        <UButton
          v-if="!isRecording"
          @click="startRecording"
          size="lg"
          :disabled="!hasPermission"
          data-cy="start-recording-button"
        >
          <UIcon name="i-lucide-mic" class="w-5 h-5 mr-2" />
          Start Recording
        </UButton>

        <template v-else>
          <UButton
            v-if="!isPaused"
            @click="pauseRecording"
            variant="outline"
            size="lg"
            data-cy="pause-button"
          >
            <UIcon name="i-lucide-pause" class="w-5 h-5 mr-2" />
            Pause
          </UButton>

          <UButton
            v-if="isPaused"
            @click="resumeRecording"
            variant="outline"
            size="lg"
            data-cy="resume-button"
          >
            <UIcon name="i-lucide-play" class="w-5 h-5 mr-2" />
            Resume
          </UButton>

          <UButton
            @click="stopRecording"
            color="red"
            size="lg"
            data-cy="stop-recording-button"
          >
            <UIcon name="i-lucide-square" class="w-5 h-5 mr-2" />
            Stop
          </UButton>
        </template>
      </div>

      <!-- Permission Warning -->
      <div
        v-if="!hasPermission && showPermissionWarning"
        class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
      >
        <div class="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
          <span class="text-sm"
            >Microphone permission required for recording</span
          >
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  isRecording: boolean
  isPaused: boolean
  hasPermission: boolean
  showPermissionWarning: boolean
  recordedAudioUrl?: string
  recordingTime: number
  formatTime: (seconds: number) => string
}>()

const emit = defineEmits<{
  (e: "start"): void
  (e: "pause"): void
  (e: "resume"): void
  (e: "stop"): void
}>()

function startRecording() {
  emit("start")
}

function pauseRecording() {
  emit("pause")
}

function resumeRecording() {
  emit("resume")
}

function stopRecording() {
  emit("stop")
}
</script>
