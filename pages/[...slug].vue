<template>
  <div class="container mx-auto px-4 py-16">
    <div class="max-w-2xl mx-auto text-center">
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mt-4">
          Page Not Found
        </p>
      </div>

      <p class="text-gray-600 dark:text-gray-300 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <UButton size="lg" to="/dashboard">
          <UIcon name="i-lucide-home" class="w-4 h-4 mr-2" />
          Go Home
        </UButton>
        <UButton variant="outline" size="lg" @click="$router.go(-1)">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Go Back
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Page Not Found",
})
</script>
