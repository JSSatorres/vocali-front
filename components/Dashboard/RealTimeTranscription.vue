<template>
  <div class="space-y-6">
    <RecordingControls
      v-if="shouldShowRecordingControls"
      :isRecording="isRecording"
      :isPaused="isPaused"
      :hasPermission="hasPermission"
      :showPermissionWarning="showPermissionWarning"
      :recordedAudioUrl="recordedAudioUrl ?? undefined"
      :recordingTime="recordingTime"
      :formatTime="formatTime"
      @start="startRecording"
      @pause="pauseRecording"
      @resume="resumeRecording"
      @stop="stopRecording"
    />
    <RecordingReview
      v-else-if="shouldShowRecordingReview"
      :audioUrl="recordedAudioUrl!"
      :isUploading="isUploading"
      @upload="handleUpload"
      @discard="discardRecordingAndReset"
    />
    <UploadConversionProgress
      v-else-if="shouldShowProgress"
      :isConverting="isConverting"
      :conversionProgress="conversionProgress"
    />
    <!-- Fallback component to ensure something is always shown -->
    <RecordingControls
      v-else
      :isRecording="false"
      :isPaused="false"
      :hasPermission="hasPermission"
      :showPermissionWarning="showPermissionWarning"
      :recordedAudioUrl="undefined"
      :recordingTime="0"
      :formatTime="formatTime"
      @start="startRecording"
      @pause="pauseRecording"
      @resume="resumeRecording"
      @stop="stopRecording"
    />
    <LiveTranscription
      v-if="isRecording || (transcriptionText && !recordedAudioUrl)"
      :transcription-text="transcriptionText"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue"
import { storeToRefs } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"
import { useAudioRecorder } from "~/composables/useAudioRecorder"
import { useAudioConverter } from "~/composables/useAudioConverter"
import { audioSettings } from "./dashboardsUtils/dashboardsUtils"

const emit = defineEmits<{
  uploadSuccess: []
}>()

const store = useTranscriptionStore()
const { isUploading, error } = storeToRefs(store)
const { uploadTranscription, resetUploadState } = store

const {
  isRecording,
  isPaused,
  hasPermission,
  showPermissionWarning,
  recordingTime,
  recordedAudioUrl,
  recordedAudioFile,
  checkMicrophonePermission,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  discardRecording,
  formatTime,
  cleanup,
} = useAudioRecorder()

const {
  isConverting,
  conversionProgress,
  convertedAudioFile,
  convertFileToMp3,
  cleanupConverter,
} = useAudioConverter()

const transcriptionText = ref("")

const settings = ref({
  quality: "high",
  realTimeTranscription: true,
  enablePunctuation: true,
})

// Computed properties to control UI state
const shouldShowRecordingControls = computed(() => {
  return !recordedAudioUrl.value && !isUploading.value && !isConverting.value
})

const shouldShowRecordingReview = computed(() => {
  return (
    !!recordedAudioUrl.value &&
    recordedAudioUrl.value.trim() !== "" &&
    !isUploading.value &&
    !isConverting.value
  )
})

const shouldShowProgress = computed(() => {
  return isUploading.value || isConverting.value
})

const handleUpload = async () => {
  if (!recordedAudioFile.value) {
    useToast().add({
      title: "Upload Failed",
      description: "No audio file to upload",
      color: "red",
    })
    return
  }

  try {
    const result = await convertFileToMp3(recordedAudioFile.value)

    if (!result) {
      useToast().add({
        title: "Conversion Failed",
        description: "Failed to convert audio file",
        color: "red",
      })
      await discardRecordingAndReset()
      return
    }

    const uploadResult = await uploadTranscription(result, audioSettings)

    useToast().add({
      title: "Upload successful",
      description: "Your audio has been transcribed successfully",
      color: "green",
    })

    // Emit success event to parent
    emit("uploadSuccess")
  } catch (err: any) {
    useToast().add({
      title: "Upload Failed",
      description: err.message || "Unknown error occurred",
      color: "red",
    })
  } finally {
    await nextTick()
    await discardRecordingAndReset()
  }
}

const discardRecordingAndReset = async () => {
  try {
    resetUploadState()
    transcriptionText.value = ""

    await cleanupConverter()
    await discardRecording()

    await nextTick()
  } catch (error) {
    console.error("Error during discard:", error)

    try {
      resetUploadState()
      transcriptionText.value = ""
      await cleanupConverter()
      await discardRecording()
      await nextTick()
    } catch (fallbackError) {
      console.error("Fallback reset also failed:", fallbackError)
    }
  }
}

const forceResetState = async () => {
  await discardRecordingAndReset()
}

onMounted(async () => {
  checkMicrophonePermission()
  await forceResetState()
})

onUnmounted(async () => {
  await cleanup()
  cleanupConverter()
})
</script>
