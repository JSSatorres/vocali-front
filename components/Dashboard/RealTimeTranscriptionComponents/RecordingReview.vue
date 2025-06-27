<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Review Recording</h3>
    </template>
    <div class="space-y-4 p-4">
      <audio
        v-if="recordedAudioUrl && recordedAudioUrl.trim()"
        controls
        :src="recordedAudioUrl"
        class="w-full"
      ></audio>
      <div v-else class="text-center text-gray-500 py-4">
        No audio available for review
      </div>
      <div class="flex justify-end gap-3 mt-4">
        <UButton @click="$emit('upload')" data-cy="upload-recording-button">
          <UIcon name="i-lucide-upload" class="w-5 h-5 mr-2" />
          Upload
        </UButton>
        <UButton
          @click="$emit('discard')"
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
</template>
<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  audioUrl: string
  isUploading?: boolean
}>()

defineEmits<{
  (e: "upload"): void
  (e: "discard"): void
}>()

const recordedAudioUrl = computed(() => {
  const url = props.audioUrl
  return url && typeof url === "string" && url.trim() ? url : ""
})
const isUploading = computed(() => props.isUploading ?? false)
</script>
