<template>
  <div class="container mx-auto px-4 py-16">
    <UCard class="max-w-2xl mx-auto text-center">
      <template #header>
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-alert-triangle"
              class="w-12 h-12 text-red-500"
            />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ error.statusCode }}
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-400 mt-2">
              {{ pageTitle }}
            </p>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <p class="text-gray-600 dark:text-gray-300">
          {{ error.statusMessage || pageDescription }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton size="lg" @click="handleError">
            <UIcon name="i-lucide-home" class="w-4 h-4 mr-2" />
            Go Home
          </UButton>
          <UButton variant="outline" size="lg" @click="$router.go(-1)">
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
            Go Back
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface NuxtError {
  statusCode: number
  statusMessage: string
  message?: string
}

const props = defineProps<{
  error: NuxtError
}>()

const pageTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return "Page Not Found"
    case 500:
      return "Server Error"
    case 403:
      return "Access Forbidden"
    case 401:
      return "Unauthorized"
    default:
      return "An Error Occurred"
  }
})

const pageDescription = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return "The page you are looking for does not exist."
    case 500:
      return "Something went wrong on the server."
    case 403:
      return "You do not have permission to access this page."
    case 401:
      return "You need to sign in to access this page."
    default:
      return "Something unexpected happened."
  }
})

const handleError = async () => {
  await clearError({ redirect: "/" })
}

useHead({
  title: `${props.error.statusCode} - ${pageTitle.value}`,
  meta: [{ name: "description", content: pageDescription.value }],
})
</script>
