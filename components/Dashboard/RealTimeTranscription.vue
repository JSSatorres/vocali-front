<template>
  <div class="space-y-6">
    <!-- Recording Controls -->
    <UCard>
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
              @click="pauseRecording"
              variant="outline"
              size="lg"
              :disabled="isPaused"
              data-cy="pause-button"
            >
              <UIcon name="i-lucide-pause" class="w-5 h-5 mr-2" />
              Pause
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
          <div
            class="flex items-center gap-2 text-amber-800 dark:text-amber-200"
          >
            <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
            <span class="text-sm"
              >Microphone permission required for recording</span
            >
          </div>
        </div>
      </div>
    </UCard>

    <!-- Live Transcription -->
    <UCard v-if="isRecording || transcriptionText">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Live Transcription</h3>
          <div class="flex items-center gap-2">
            <UButton
              v-if="transcriptionText"
              @click="copyTranscription"
              variant="ghost"
              size="sm"
              data-cy="copy-button"
            >
              <UIcon name="i-lucide-copy" class="w-4 h-4" />
            </UButton>
            <UButton
              v-if="transcriptionText"
              @click="downloadTranscription"
              variant="ghost"
              size="sm"
              data-cy="download-button"
            >
              <UIcon name="i-lucide-download" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </template>

      <div class="min-h-[200px] max-h-[400px] overflow-y-auto">
        <div
          v-if="!transcriptionText && isRecording"
          class="flex items-center justify-center h-32 text-gray-500"
        >
          <div class="text-center">
            <UIcon
              name="i-lucide-loader"
              class="w-6 h-6 animate-spin mx-auto mb-2"
            />
            <p class="text-sm">Listening...</p>
          </div>
        </div>

        <div v-else-if="transcriptionText" class="space-y-2">
          <p
            class="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap"
            data-cy="transcription-text"
          >
            {{ transcriptionText }}
          </p>

          <div
            v-if="isRecording"
            class="flex items-center gap-2 text-sm text-gray-500"
          >
            <div class="w-1 h-4 bg-blue-500 animate-pulse"></div>
            <span>Transcribing...</span>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-32 text-gray-500">
          <p class="text-sm">Start recording to see live transcription</p>
        </div>
      </div>
    </UCard>

    <!-- Audio Visualizer -->
    <UCard v-if="isRecording">
      <template #header>
        <h3 class="text-lg font-semibold">Audio Level</h3>
      </template>

      <div class="p-4">
        <div
          class="flex items-center justify-center h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <div class="flex items-end justify-center gap-1 h-12">
            <div
              v-for="i in 20"
              :key="i"
              class="w-2 bg-blue-500 rounded-t transition-all duration-100"
              :style="{ height: `${Math.random() * 100}%` }"
              :class="isRecording ? 'animate-pulse' : ''"
            ></div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { markRaw } from "vue"

const isRecording = ref(false)
const isPaused = ref(false)
const hasPermission = ref(false)
const showPermissionWarning = ref(false)
const recordingTime = ref(0)
const transcriptionText = ref("")

const settings = ref({
  language: "auto",
  quality: "high",
  realTimeTranscription: true,
  enablePunctuation: true,
})

const languageOptions = markRaw([
  { label: "Auto-detect", value: "auto" },
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Portuguese", value: "pt" },
])

const qualityOptions = markRaw([
  { label: "High Quality", value: "high" },
  { label: "Standard", value: "standard" },
  { label: "Fast", value: "fast" },
])

let recordingInterval: NodeJS.Timeout | null = null
let mediaRecorder: MediaRecorder | null = null

const checkMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    hasPermission.value = true
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
  } catch (error) {
    hasPermission.value = false
    showPermissionWarning.value = true
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)

    isRecording.value = true
    recordingTime.value = 0
    transcriptionText.value = ""

    // Start recording timer
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)

    // Simulate live transcription
    simulateLiveTranscription()

    if (mediaRecorder) {
      mediaRecorder.start()
    }
  } catch (error) {
    console.error("Error starting recording:", error)
    hasPermission.value = false
    showPermissionWarning.value = true
  }
}

const pauseRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.pause()
    isPaused.value = true
    if (recordingInterval) {
      clearInterval(recordingInterval)
    }
  }
}

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop()
    mediaRecorder.stream
      .getTracks()
      .forEach((track: MediaStreamTrack) => track.stop())
  }

  isRecording.value = false
  isPaused.value = false

  if (recordingInterval) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }

  useToast().add({
    title: "Recording Saved",
    description: "Your transcription has been saved to history.",
  })
}

const simulateLiveTranscription = () => {
  const sampleTexts = [
    "Hello, this is a sample transcription.",
    "The weather is nice today.",
    "I am testing the real-time transcription feature.",
    "This text appears as you speak.",
    "You can see the words appearing in real-time.",
  ]

  let textIndex = 0
  const interval = setInterval(() => {
    if (!isRecording.value || textIndex >= sampleTexts.length) {
      clearInterval(interval)
      return
    }

    transcriptionText.value +=
      (transcriptionText.value ? " " : "") + sampleTexts[textIndex]
    textIndex++
  }, 3000)
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`
}

const copyTranscription = async () => {
  if (transcriptionText.value) {
    await navigator.clipboard.writeText(transcriptionText.value)
    useToast().add({
      title: "Copied",
      description: "Transcription copied to clipboard.",
    })
  }
}

const downloadTranscription = () => {
  if (transcriptionText.value) {
    const blob = new Blob([transcriptionText.value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcription-${new Date().toISOString().slice(0, 19)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

onMounted(() => {
  checkMicrophonePermission()
})

onUnmounted(() => {
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
  if (mediaRecorder && isRecording.value) {
    stopRecording()
  }
})
</script>
