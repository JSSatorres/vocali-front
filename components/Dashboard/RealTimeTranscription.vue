<template>
  <div class="space-y-6">
    <RecordingControls
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
      :audio-url="recordedAudioUrl"
      @upload="handleUpload"
      @discard="discardRecording"
    />
    <UploadConversionProgress v-if="isUploading || isConverting" />
    <!-- :is-converting="isConverting"
      :conversion-progress="conversionProgress" -->
    <LiveTranscription
      v-if="isRecording || (transcriptionText && !recordedAudioUrl)"
      :transcription-text="transcriptionText"
      @copy="copyTranscription"
      @download="downloadTranscription"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

const emit = defineEmits<{
  uploadSuccess: []
}>()

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
const isConverting = ref(false)
const conversionProgress = ref(0)

const settings = ref({
  quality: "high",
  realTimeTranscription: true,
  enablePunctuation: true,
})

let recordingInterval: NodeJS.Timeout | null = null
let mediaRecorder: MediaRecorder | null = null
let ffmpeg: FFmpeg | null = null

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

  try {
    isConverting.value = true
    conversionProgress.value = 0

    // Convertir a MP3
    const mp3File = await convertToMp3(recordedAudioFile.value)

    if (!mp3File) {
      throw new Error("Error converting audio to MP3")
    }

    // Subir el archivo MP3
    await uploadTranscription(mp3File, settings.value)

    if (!error.value) {
      useToast().add({
        title: "Recording Uploaded",
        description:
          "Your recording is being processed and will appear in History.",
      })
      emit("uploadSuccess")
    } else {
      useToast().add({
        title: "Upload Failed",
        description: error.value || "An unknown error occurred.",
        color: "red",
      })
    }
  } catch (err: any) {
    useToast().add({
      title: "Conversion Failed",
      description: err.message || "Error converting audio to MP3",
      color: "red",
    })
  } finally {
    isConverting.value = false
    conversionProgress.value = 0
    discardRecording()
  }
}

const convertToMp3 = async (webmFile: File): Promise<File | null> => {
  try {
    if (!ffmpeg) {
      ffmpeg = new FFmpeg()
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd"
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      })
      ffmpeg.on("progress", ({ progress }) => {
        conversionProgress.value = Math.round(progress * 100)
      })
    }
    await ffmpeg.writeFile("input.webm", await fetchFile(webmFile))
    await ffmpeg.exec([
      "-i",
      "input.webm",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "output.mp3",
    ])
    const mp3Data = await ffmpeg.readFile("output.mp3")
    const mp3Blob = new Blob([mp3Data], { type: "audio/mp3" })
    const mp3File = new File(
      [mp3Blob],
      webmFile.name.replace(".webm", ".mp3"),
      { type: "audio/mp3" }
    )
    await ffmpeg.deleteFile("input.webm")
    await ffmpeg.deleteFile("output.mp3")
    return mp3File
  } catch (error) {
    console.error("Error converting to MP3:", error)
    return null
  }
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
  if (ffmpeg) {
    ffmpeg.terminate()
    ffmpeg = null
  }
})
</script>
