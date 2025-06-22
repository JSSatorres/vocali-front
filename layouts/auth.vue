<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="absolute top-0 left-0 right-0 z-10">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <UIcon
              name="i-lucide-headphones"
              class="w-8 h-8 text-primary mr-1 translate-y-1"
            />
            <span class="font-bold text-xl text-gray-900 dark:text-white"
              >Vocali</span
            >
          </div>

          <div>
            <UButton
              variant="ghost"
              size="sm"
              square
              @click="
                $colorMode.preference =
                  $colorMode.value === 'dark' ? 'light' : 'dark'
              "
            >
              <UIcon
                :name="
                  $colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'
                "
                class="w-4 h-4"
              />
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex items-center justify-center min-h-screen px-4 py-20">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          © {{ new Date().getFullYear() }} Vocali. All rights reserved.
        </div>
      </div>
    </div>

    <UNotifications />
  </div>
</template>

<script setup lang="ts"></script>
