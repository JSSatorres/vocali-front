<template>
  <div class="w-full space-y-6">
    <!-- Upload Area -->
    <UCard class="w-full">
      <div class="text-center p-8">
        <div
          class="mx-auto w-16 h-16 mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center"
        >
          <UIcon name="i-lucide-upload" class="w-8 h-8 text-blue-500" />
        </div>
        <h3 class="text-lg font-semibold mb-2">Upload Audio File</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop your audio file here or click to browse
        </p>

        <div
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 transition-colors hover:border-blue-400 dark:hover:border-blue-500"
          :class="{
            'border-blue-400 bg-blue-50 dark:bg-blue-900/10': dragover,
          }"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="handleDrop"
          data-cy="upload-dropzone"
        >
          <input
            ref="fileInput"
            type="file"
            accept="audio/*"
            class="hidden"
            @change="handleFileSelect"
            data-cy="file-input"
          />

          <div v-if="!selectedFile">
            <UIcon
              name="i-lucide-file-audio"
              class="w-12 h-12 text-gray-400 mx-auto mb-3"
            />
            <p class="text-gray-600 dark:text-gray-400 mb-2">
              Supported formats: MP3, WAV, M4A, FLAC
            </p>
            <UButton @click="fileInput?.click()" data-cy="browse-button">
              Browse Files
            </UButton>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-center gap-3">
              <UIcon
                name="i-lucide-file-audio"
                class="w-6 h-6 text-green-500"
              />
              <span class="font-medium">{{ selectedFile.name }}</span>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                size="xs"
                @click="selectedFile = null"
                data-cy="remove-file-button"
              />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Size: {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Upload Progress -->
    <UCard v-if="isUploading" class="w-full">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Processing...</h3>
        </div>
        <UProgress animation="carousel" data-cy="upload-progress" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Uploading and transcribing your audio file. This may take a few
          moments...
        </p>
      </div>
    </UCard>

    <!-- Action Buttons -->
    <div v-if="selectedFile && !isUploading" class="flex gap-3">
      <UButton
        @click="startTranscription"
        :disabled="!selectedFile"
        data-cy="start-transcription-button"
      >
        Start Transcription
      </UButton>
      <UButton variant="outline" @click="reset" data-cy="reset-button">
        Reset
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useTranscriptionStore } from "~/stores/transcription"

const store = useTranscriptionStore()
const { isUploading, error } = storeToRefs(store)
const { uploadTranscription } = store

const dragover = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

const settings = ref({
  quality: "high",
  enableTimestamps: true,
  enableSpeakerLabels: false,
})

const handleDrop = (event: DragEvent) => {
  dragover.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const startTranscription = async () => {
  if (!selectedFile.value) return

  await uploadTranscription(selectedFile.value, settings.value)

  if (!error.value) {
    useToast().add({
      title: "Upload Successful",
      description: "Your file is now being processed.",
    })
    reset()
  } else {
    useToast().add({
      title: "Upload Failed",
      description: error.value || "An unknown error occurred.",
      color: "red",
    })
  }
}

const reset = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ""
  }
}
</script>
