<template>
    <UCard ">
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
</template>
<script setup lang="ts">
// defineProps<{ isConverting: boolean; conversionProgress: number }>()
</script>
