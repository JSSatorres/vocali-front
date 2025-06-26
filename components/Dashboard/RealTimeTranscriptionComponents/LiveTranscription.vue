<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Live Transcription</h3>
        <div class="flex items-center gap-2">
          <UButton
            v-if="transcriptionText"
            @click="$emit('copy')"
            variant="ghost"
            size="sm"
            data-cy="copy-button"
          >
            <UIcon name="i-lucide-copy" class="w-4 h-4" />
          </UButton>
          <UButton
            v-if="transcriptionText"
            @click="$emit('download')"
            variant="ghost"
            size="sm"
            data-cy="download-button"
          >
            <UIcon name="i-lucide-download" class="w-4 h-4" />
          </UButton>
        </div>
      </div>
    </template>
    <div class="p-4">
      <p class="whitespace-pre-line">{{ transcriptionText }}</p>
    </div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{ transcriptionText: string }>()
defineEmits(["copy", "download"])
</script>
