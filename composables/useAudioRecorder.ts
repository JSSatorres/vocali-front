import { ref, type Ref } from "vue"

export interface AudioRecorderState {
  isRecording: Ref<boolean>
  isPaused: Ref<boolean>
  hasPermission: Ref<boolean>
  showPermissionWarning: Ref<boolean>
  recordingTime: Ref<number>
  recordedAudioUrl: Ref<string | null>
  recordedAudioFile: Ref<File | null>
}

export interface AudioRecorderActions {
  checkMicrophonePermission: () => Promise<void>
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  discardRecording: () => void
  formatTime: (seconds: number) => string
}

export interface AudioRecorderOptions {
  onRecordingStart?: () => void
  onRecordingStop?: (file: File | null, url: string | null) => void
  onRecordingError?: (error: Error) => void
  onPermissionDenied?: () => void
}

export function useAudioRecorder(options: AudioRecorderOptions = {}) {
  const isRecording = ref(false)
  const isPaused = ref(false)
  const hasPermission = ref(false)
  const showPermissionWarning = ref(false)
  const recordingTime = ref(0)
  const recordedAudioUrl = ref<string | null>(null)
  const recordedAudioFile = ref<File | null>(null)

  const audioChunks = ref<Blob[]>([])
  let mediaRecorder: MediaRecorder | null = null
  let recordingInterval: NodeJS.Timeout | null = null

  const AUDIO_CONFIG = {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 16000,
  }

  const RECORDER_CONFIG = {
    audioBitsPerSecond: 64000,
  }

  const MIME_TYPES = [
    "audio/mp3",
    "audio/mpeg",
    "audio/webm;codecs=opus",
    "audio/webm",
  ]

  const selectBestMimeType = (): string => {
    for (const mimeType of MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`Using mime type: ${mimeType}`)
        return mimeType
      }
    }
    return "audio/webm"
  }

  const getFileExtension = (mimeType: string): string => {
    return mimeType.includes("mp3") || mimeType.includes("mpeg")
      ? ".mp3"
      : ".webm"
  }

  const createAudioFile = (audioBlob: Blob, mimeType: string): File => {
    const extension = getFileExtension(mimeType)
    return new File(
      [audioBlob],
      `real-time-recording-${new Date().toISOString()}${extension}`,
      { type: mimeType }
    )
  }

  const startTimer = () => {
    recordingTime.value = 0
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)
  }

  const stopTimer = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }

  const checkMicrophonePermission = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      hasPermission.value = true
      showPermissionWarning.value = false

      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    } catch (error) {
      console.error("Microphone permission denied:", error)
      hasPermission.value = false
      showPermissionWarning.value = true
      options.onPermissionDenied?.()
    }
  }

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONFIG,
      })

      const selectedMimeType = selectBestMimeType()

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        ...RECORDER_CONFIG,
      })

      audioChunks.value = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        try {
          if (audioChunks.value.length > 0) {
            const audioBlob = new Blob(audioChunks.value, {
              type: selectedMimeType,
            })
            const audioFile = createAudioFile(audioBlob, selectedMimeType)
            const audioUrl = URL.createObjectURL(audioBlob)

            recordedAudioFile.value = audioFile
            recordedAudioUrl.value = audioUrl

            console.log(
              `Audio file created as ${getFileExtension(selectedMimeType)
                .slice(1)
                .toUpperCase()}:`,
              audioFile.name,
              audioFile.size
            )

            options.onRecordingStop?.(audioFile, audioUrl)
          } else {
            console.warn("No audio chunks available")
            recordedAudioFile.value = null
            recordedAudioUrl.value = null
            options.onRecordingStop?.(null, null)
          }
        } catch (error) {
          console.error("Error processing recorded audio:", error)
          options.onRecordingError?.(error as Error)
        } finally {
          audioChunks.value = []
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        const error = new Error("Recording failed")
        options.onRecordingError?.(error)
      }

      mediaRecorder.start(1000)

      isRecording.value = true
      isPaused.value = false
      hasPermission.value = true
      showPermissionWarning.value = false

      startTimer()
      options.onRecordingStart?.()
    } catch (error) {
      console.error("Error starting recording:", error)
      hasPermission.value = false
      showPermissionWarning.value = true
      options.onRecordingError?.(error as Error)
      options.onPermissionDenied?.()
    }
  }

  const pauseRecording = (): void => {
    if (mediaRecorder && isRecording.value && !isPaused.value) {
      try {
        mediaRecorder.pause()
        isPaused.value = true
        stopTimer()
        console.log("Recording paused")
      } catch (error) {
        console.error("Error pausing recording:", error)
        options.onRecordingError?.(error as Error)
      }
    }
  }

  const resumeRecording = (): void => {
    if (mediaRecorder && isPaused.value) {
      try {
        mediaRecorder.resume()
        isPaused.value = false
        recordingInterval = setInterval(() => {
          recordingTime.value++
        }, 1000)
        console.log("Recording resumed")
      } catch (error) {
        console.error("Error resuming recording:", error)
        options.onRecordingError?.(error as Error)
      }
    }
  }

  const stopRecording = (): void => {
    try {
      if (mediaRecorder) {
        mediaRecorder.stop()

        if (mediaRecorder.stream) {
          mediaRecorder.stream
            .getTracks()
            .forEach((track: MediaStreamTrack) => {
              track.stop()
            })
        }
      }

      isRecording.value = false
      isPaused.value = false
      stopTimer()

      console.log("Recording stopped")
    } catch (error) {
      console.error("Error stopping recording:", error)
      options.onRecordingError?.(error as Error)
    }
  }

  const discardRecording = (): void => {
    try {
      if (recordedAudioUrl.value) {
        URL.revokeObjectURL(recordedAudioUrl.value)
      }

      recordedAudioUrl.value = null
      recordedAudioFile.value = null
      recordingTime.value = 0
      audioChunks.value = []

      console.log("Recording discarded")
    } catch (error) {
      console.error("Error discarding recording:", error)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const cleanup = (): void => {
    stopRecording()
    discardRecording()
  }

  const state: AudioRecorderState = {
    isRecording,
    isPaused,
    hasPermission,
    showPermissionWarning,
    recordingTime,
    recordedAudioUrl,
    recordedAudioFile,
  }

  const actions: AudioRecorderActions = {
    checkMicrophonePermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    discardRecording,
    formatTime,
  }

  return {
    ...state,
    ...actions,
    cleanup,
  }
}
