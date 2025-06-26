<template>
  <div class="space-y-6">
    <RecordingControls
      v-if="!recordedAudioUrl"
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
      v-if="recordedAudioUrl && !isUploading && !isConverting"
      :audioUrl="recordedAudioUrl"
      :isUploading="isUploading"
      @upload="handleUpload"
      @discard="discardRecordingAndReset"
    />
    <UploadConversionProgress
      v-if="isUploading || isConverting"
      :isConverting="isConverting"
      :conversionProgress="conversionProgress"
    />
    <LiveTranscription
      v-if="isRecording || (transcriptionText && !recordedAudioUrl)"
      :transcription-text="transcriptionText"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
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
const { uploadTranscription } = store

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
  cleanupConverter,
} = useAudioConverter(recordedAudioFile)

// Other component state
const transcriptionText = ref("")

const settings = ref({
  quality: "high",
  realTimeTranscription: true,
  enablePunctuation: true,
})

const handleUpload = async () => {
  if (!recordedAudioFile.value) {
    console.error("No recorded audio file available")
    useToast().add({
      title: "Upload Failed",
      description: "No audio file to upload",
      color: "red",
    })
    return
  }

  console.log("Handling upload for file:", recordedAudioFile)

  try {
    await uploadTranscription(convertedAudioFile.value!, audioSettings)
    useToast().add({
      title: "Upload successful",
    })
  } catch (err: any) {
    useToast().add({
      title: "Upload Failed",
      color: "red",
    })
  } finally {
    discardRecordingAndReset()
  }
}

const discardRecordingAndReset = () => {
  discardRecording()
  transcriptionText.value = ""
}

onMounted(() => {
  checkMicrophonePermission()
})

onUnmounted(() => {
  // Use the composable's cleanup function
  cleanup() // From useAudioRecorder
  cleanupConverter() // From useAudioConverter
})
</script>
