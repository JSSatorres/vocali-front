<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          {{ statusTitle }}
        </h3>
      </div>

      <div v-if="isConverting" class="space-y-2">
        <UProgress
          :value="conversionProgress"
          :max="100"
          data-cy="conversion-progress"
        />
        <div class="space-y-1">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ statusMessage }}
          </p>
          <p class="text-xs text-gray-500">
            {{ getProgressDescription(conversionProgress) }}
          </p>
        </div>
      </div>

      <div v-else class="space-y-2">
        <UProgress animation="carousel" data-cy="upload-progress" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Uploading your recording. This may take a few moments...
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  isConverting: boolean
  conversionProgress: number
}>()

const statusTitle = computed(() => {
  if (props.isConverting) {
    if (props.conversionProgress < 50) {
      return "Loading Audio Converter..."
    } else if (props.conversionProgress < 70) {
      return "Preparing Audio File..."
    } else if (props.conversionProgress < 90) {
      return "Converting to MP3..."
    } else {
      return "Finalizing Conversion..."
    }
  }
  return "Uploading Recording..."
})

const statusMessage = computed(() => {
  return `Converting audio: ${props.conversionProgress}%`
})

const getProgressDescription = (progress: number): string => {
  if (progress < 20) {
    return "Initializing FFmpeg converter..."
  } else if (progress < 50) {
    return "Loading audio processing libraries..."
  } else if (progress < 60) {
    return "Reading audio file..."
  } else if (progress < 70) {
    return "Setting up conversion..."
  } else if (progress < 90) {
    return "Converting to MP3 format..."
  } else if (progress < 100) {
    return "Finalizing file..."
  } else {
    return "Conversion complete!"
  }
}
</script>
