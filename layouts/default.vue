<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation Header -->
    <header class="bg-white dark:bg-gray-900 border-b">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div>
            <UIcon
              name="i-lucide-headphones"
              class="w-8 h-8 mr-1 text-primary translate-y-1"
            />
            <span class="font-bold text-xl text-gray-900 dark:text-white"
              >Vocali-dev</span
            >
          </div>

          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <ClientOnly>
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
                    $colorMode.value === 'dark'
                      ? 'i-lucide-sun'
                      : 'i-lucide-moon'
                  "
                  class="w-4 h-4"
                />
              </UButton>
              <template #fallback>
                <UButton variant="ghost" size="sm" square>
                  <UIcon name="i-lucide-moon" class="w-4 h-4" />
                </UButton>
              </template>
            </ClientOnly>

            <!-- Navigation Links -->
            <div
              v-if="!isAuthenticated"
              class="hidden md:flex items-center space-x-2"
            >
              <UButton variant="outline" size="sm" to="/auth/login"
                >Login</UButton
              >
              <UButton size="sm" to="/auth/register">Sign Up</UButton>
            </div>

            <!-- Authenticated User Menu -->
            <div v-else class="flex items-center space-x-2">
              <UButton variant="ghost" size="sm" to="/dashboard"
                >Dashboard</UButton
              >
              <UDropdown
                :items="userMenuItems"
                :popper="{ placement: 'bottom-end' }"
              >
                <UButton variant="ghost" class="flex items-center space-x-2">
                  <UAvatar
                    :alt="user?.username as string || 'User'"
                    size="sm"
                  />
                  <span class="hidden md:block text-sm">{{
                    user?.username
                  }}</span>
                  <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
                </UButton>
              </UDropdown>
            </div>

            <!-- Mobile Menu -->
            <div class="md:hidden">
              <UButton
                variant="ghost"
                size="sm"
                square
                @click="isMobileMenuOpen = !isMobileMenuOpen"
              >
                <UIcon name="i-lucide-menu" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <USlideover v-model="isMobileMenuOpen" side="right">
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b">
          <span class="font-semibold">Menu</span>
          <UButton
            variant="ghost"
            size="sm"
            square
            @click="isMobileMenuOpen = false"
          >
            <UIcon name="i-lucide-x" class="w-4 h-4" />
          </UButton>
        </div>

        <div v-if="!isAuthenticated" class="space-y-2">
          <UButton
            variant="ghost"
            size="sm"
            block
            to="/contact"
            @click="isMobileMenuOpen = false"
          >
            Contact
          </UButton>
          <UButton
            variant="outline"
            size="sm"
            block
            to="/auth/login"
            @click="isMobileMenuOpen = false"
          >
            Login
          </UButton>
          <UButton
            size="sm"
            block
            to="/auth/register"
            @click="isMobileMenuOpen = false"
          >
            Sign Up
          </UButton>
        </div>

        <div v-else class="space-y-2">
          <UButton
            variant="ghost"
            size="sm"
            block
            to="/dashboard"
            @click="isMobileMenuOpen = false"
          >
            Dashboard
          </UButton>
          <UButton variant="ghost" size="sm" block @click="handleLogout">
            Logout
          </UButton>
        </div>
      </div>
    </USlideover>

    <!-- Main Content -->
    <main class="min-h-[calc(100vh-4rem)]">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <UIcon name="i-lucide-headphones" class="w-5 h-5 text-primary" />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              © {{ new Date().getFullYear() }} Vocali. All rights reserved.
            </span>
          </div>

          <div
            class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400"
          >
            <a
              href="https://github.com/JSSatorres"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <UIcon name="i-lucide-github" class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast Notifications -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout, checkAuth } = useAuth()
const toast = useToast()

const isMobileMenuOpen = ref(false)

// Check auth state on client side
onMounted(() => {
  if (process.client) {
    checkAuth()
  }
})

const userMenuItems = computed(() => [
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
      click: () => navigateTo("/dashboard"),
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-lucide-settings",
      click: () =>
        toast.add({ title: "Settings coming soon!", icon: "i-lucide-info" }),
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      click: handleLogout,
    },
  ],
])

async function handleLogout() {
  try {
    const result = await logout()
    if (result.success) {
      isMobileMenuOpen.value = false
      toast.add({
        title: "Logged out successfully",
        icon: "i-lucide-check-circle",
        color: "green",
      })
    }
  } catch (error) {
    toast.add({
      title: "Logout failed",
      description: "Please try again",
      icon: "i-lucide-alert-circle",
      color: "red",
    })
  }
}

// Close mobile menu on route change
watch(
  () => useRoute().path,
  () => {
    isMobileMenuOpen.value = false
  }
)
</script>
