<template>
  <div class="space-y-6">
    <!-- Recording Controls -->
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

    <!-- Recording Review -->
    <UCard v-if="recordedAudioUrl && !isUploading">
      <template #header>
        <h3 class="text-lg font-semibold">Review Recording</h3>
      </template>
      <div class="space-y-4 p-4">
        <audio controls :src="recordedAudioUrl" class="w-full"></audio>
        <div class="flex justify-end gap-3 mt-4">
          <UButton @click="handleUpload" data-cy="upload-recording-button">
            <UIcon name="i-lucide-upload" class="w-5 h-5 mr-2" />
            Upload
          </UButton>
          <UButton
            @click="discardRecording"
            variant="outline"
            color="red"
            data-cy="discard-recording-button"
          >
            <UIcon name="i-lucide-trash-2" class="w-5 h-5 mr-2" />
            Discard
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Upload Progress -->
    <UCard v-if="isUploading" class="w-full">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Processing Recording...</h3>
        </div>
        <UProgress animation="carousel" data-cy="upload-progress" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Uploading your recording. This may take a few moments...
        </p>
      </div>
    </UCard>

    <!-- Live Transcription -->
    <UCard v-if="isRecording || (transcriptionText && !recordedAudioUrl)">
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
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"

const store = useTranscriptionStore()
const { isUploading, error } = storeToRefs(store)
const { uploadTranscription } = store

const isRecording = ref(false)
const isPaused = ref(false)
const hasPermission = ref(false)
const showPermissionWarning = ref(false)
const recordingTime = ref(0)
const transcriptionText = ref("")
const audioChunks = ref<Blob[]>([])
const recordedAudioUrl = ref<string | null>(null)
const recordedAudioFile = ref<File | null>(null)

const settings = ref({
  quality: "high",
  realTimeTranscription: true,
  enablePunctuation: true,
})

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
    audioChunks.value = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" })
      recordedAudioFile.value = new File(
        [audioBlob],
        `real-time-recording-${new Date().toISOString()}.webm`,
        { type: "audio/webm" }
      )
      recordedAudioUrl.value = URL.createObjectURL(audioBlob)
      audioChunks.value = []
    }

    isRecording.value = true
    recordingTime.value = 0
    transcriptionText.value = ""

    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)

    mediaRecorder.start()
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

const resumeRecording = () => {
  if (mediaRecorder && isPaused.value) {
    mediaRecorder.resume()
    isPaused.value = false
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)
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
}

const handleUpload = async () => {
  if (!recordedAudioFile.value) return

  const formData = new FormData()
  formData.append("file", recordedAudioFile.value)
  formData.append("settings", JSON.stringify(settings.value))

  // Pass File to the store action
  await uploadTranscription(recordedAudioFile.value, { pepe: "2sdsad" })

  if (!error.value) {
    useToast().add({
      title: "Recording Uploaded",
      description:
        "Your recording is being processed and will appear in History.",
    })
  } else {
    useToast().add({
      title: "Upload Failed",
      description: error.value || "An unknown error occurred.",
      color: "red",
    })
  }
  discardRecording() // Reset state after upload
}

const discardRecording = () => {
  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value)
  }
  recordedAudioUrl.value = null
  recordedAudioFile.value = null
  transcriptionText.value = ""
  recordingTime.value = 0
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
