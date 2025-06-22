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
          <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
        </div>
        <UProgress :value="uploadProgress" data-cy="upload-progress" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Uploading and transcribing your audio file...
        </p>
      </div>
    </UCard>

    <!-- Upload Settings -->
    <UCard v-if="selectedFile" class="w-full">
      <template #header>
        <h3 class="text-lg font-semibold">Transcription Settings</h3>
      </template>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Language</label>
          <USelect
            v-model="settings.language"
            :options="languageOptions"
            data-cy="language-select"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Quality</label>
          <USelect
            v-model="settings.quality"
            :options="qualityOptions"
            data-cy="quality-select"
          />
        </div>

        <div class="flex items-center gap-2">
          <UCheckbox
            v-model="settings.enableTimestamps"
            data-cy="timestamps-checkbox"
          />
          <label class="text-sm">Include timestamps</label>
        </div>

        <div class="flex items-center gap-2">
          <UCheckbox
            v-model="settings.enableSpeakerLabels"
            data-cy="speaker-labels-checkbox"
          />
          <label class="text-sm">Identify speakers</label>
        </div>
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
import { markRaw } from "vue"

const dragover = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref<HTMLInputElement>()

const settings = ref({
  language: "auto",
  quality: "high",
  enableTimestamps: true,
  enableSpeakerLabels: false,
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

  isUploading.value = true
  uploadProgress.value = 0

  // Simulate upload progress
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 10
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        isUploading.value = false
        // TODO: Handle successful transcription
        useToast().add({
          title: "Success",
          description: "Transcription completed successfully!",
        })
        reset()
      }, 1000)
    }
  }, 500)
}

const reset = () => {
  selectedFile.value = null
  isUploading.value = false
  uploadProgress.value = 0
}
</script>
