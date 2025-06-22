<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <UHeader>
      <template #left>
        <div class="flex items-center gap-3">
          <UAvatar
            icon="i-lucide-sparkles"
            size="sm"
            :ui="{ background: 'bg-gradient-to-r from-blue-600 to-purple-600' }"
          />
          <div>
            <h1 class="text-lg font-bold">Vocali</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
          </div>
        </div>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-bell"
            variant="ghost"
            size="sm"
            @click="showNotifications = !showNotifications"
          />

          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton variant="ghost" size="sm">
              <div class="flex items-center gap-2">
                <UAvatar
                  :alt="user?.username ?? ''"
                  size="xs"
                  :ui="{
                    background: 'bg-gradient-to-r from-blue-500 to-purple-500',
                  }"
                >
                  {{ user?.username?.charAt(0).toUpperCase() }}
                </UAvatar>
                <div class="text-left hidden sm:block">
                  <p class="text-sm font-medium">{{ user?.username }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ user?.userId }}
                  </p>
                </div>
                <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
              </div>
            </UButton>
          </UDropdown>
        </div>
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain class="p-6">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">
          ¡Bienvenido, {{ user?.username }}! 👋
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Este es tu dashboard personal. Aquí podrás gestionar tu cuenta y
          acceder a todas las funcionalidades.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Total de Proyectos
              </p>
              <p class="text-2xl font-bold">12</p>
            </div>
            <UIcon
              name="i-lucide-folder"
              class="w-8 h-8 text-blue-600 dark:text-blue-400"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Tareas Completadas
              </p>
              <p class="text-2xl font-bold">47</p>
            </div>
            <UIcon
              name="i-lucide-check-circle"
              class="w-8 h-8 text-green-600 dark:text-green-400"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Tiempo Ahorrado
              </p>
              <p class="text-2xl font-bold">23h</p>
            </div>
            <UIcon
              name="i-lucide-clock"
              class="w-8 h-8 text-purple-600 dark:text-purple-400"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Puntuación</p>
              <p class="text-2xl font-bold">98%</p>
            </div>
            <UIcon
              name="i-lucide-star"
              class="w-8 h-8 text-orange-600 dark:text-orange-400"
            />
          </div>
        </UCard>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity -->
        <div class="lg:col-span-2">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">Actividad Reciente</h2>
                <UButton variant="ghost" size="sm" icon="i-lucide-refresh-cw" />
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <UAvatar :icon="activity.icon" size="sm" />
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ activity.title }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    {{ activity.description }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {{ activity.time }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- User Info Card -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Tu Perfil</h3>
            </template>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-user" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{
                  user?.username
                }}</span>
              </div>
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-mail" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{
                  user?.userId
                }}</span>
              </div>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-shield-check"
                  class="w-5 h-5 text-gray-400"
                />
                <span
                  class="text-sm text-gray-600 dark:text-gray-400 capitalize"
                  >{{ user?.username || "User" }}</span
                >
              </div>
            </div>
          </UCard>

          <!-- Quick Actions -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Acciones Rápidas</h3>
            </template>

            <div class="space-y-3">
              <UButton
                block
                variant="outline"
                icon="i-lucide-plus"
                @click="createProject"
              >
                Nuevo Proyecto
              </UButton>

              <UButton
                block
                variant="outline"
                icon="i-lucide-file-text"
                @click="viewReports"
              >
                Ver Reportes
              </UButton>

              <UButton
                block
                variant="outline"
                icon="i-lucide-settings"
                @click="openSettings"
              >
                Configuración
              </UButton>
            </div>
          </UCard>

          <!-- Quick Stats -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Estadísticas Rápidas</h3>
            </template>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm">Productividad</span>
                <span class="text-sm font-medium">85%</span>
              </div>
              <UProgress :value="85" />

              <div class="flex justify-between items-center">
                <span class="text-sm">Objetivos</span>
                <span class="text-sm font-medium">12/15</span>
              </div>
              <UProgress :value="80" color="green" />

              <div class="flex justify-between items-center">
                <span class="text-sm">Rendimiento</span>
                <span class="text-sm font-medium">92%</span>
              </div>
              <UProgress :value="92" color="blue" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Recent Projects -->
      <UCard class="mt-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Proyectos Recientes</h2>
            <UButton variant="outline" size="sm" to="/projects">
              Ver Todos
            </UButton>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th
                  class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white"
                >
                  Proyecto
                </th>
                <th
                  class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white"
                >
                  Estado
                </th>
                <th
                  class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white"
                >
                  Progreso
                </th>
                <th
                  class="text-left py-3 px-4 font-medium text-gray-900 dark:text-white"
                >
                  Fecha Límite
                </th>
                <th
                  class="text-right py-3 px-4 font-medium text-gray-900 dark:text-white"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="project in recentProjects"
                :key="project.id"
                class="border-b border-gray-100 dark:border-gray-800"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <UAvatar :icon="project.icon" size="sm" />
                    <div>
                      <p class="font-medium">{{ project.name }}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ project.description }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <UBadge :color="project.status.color" variant="soft">
                    {{ project.status.label }}
                  </UBadge>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <UProgress
                      :value="project.progress"
                      size="sm"
                      class="flex-1"
                    />
                    <span class="text-sm text-gray-600 dark:text-gray-400"
                      >{{ project.progress }}%</span
                    >
                  </div>
                </td>
                <td class="py-3 px-4 text-sm">{{ project.dueDate }}</td>
                <td class="py-3 px-4">
                  <div class="flex justify-end gap-2">
                    <UButton size="xs" variant="ghost" icon="i-lucide-eye" />
                    <UButton size="xs" variant="ghost" icon="i-lucide-edit" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </UMain>
  </div>
</template>

<script setup lang="ts">
// Middleware para proteger la ruta
definePageMeta({
  auth: true,
})

// Meta tags
useHead({
  title: "Dashboard - Vocali",
  meta: [
    {
      name: "description",
      content: "Your personal dashboard to manage your account and projects.",
    },
  ],
})

const { user, logout } = useAuth()
const toast = useToast()

const showNotifications = ref(false)

const userMenuItems = [
  [
    {
      label: "Profile",
      icon: "i-lucide-user-circle",
      click: () =>
        toast.add({
          title: "Profile clicked",
          description: "This is a placeholder for the profile page.",
        }),
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      click: () =>
        toast.add({
          title: "Settings clicked",
          description: "This is a placeholder for the settings page.",
        }),
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-lucide-log-out",
      click: async () => {
        const result = await logout()
        if (result.success) {
          toast.add({
            title: "Logged out!",
            description: "You have been successfully logged out.",
          })
        }
      },
    },
  ],
]

const recentActivity = [
  {
    id: 1,
    icon: "i-lucide-git-commit",
    title: "Proyecto actualizado",
    description: "Se completó la fase de desarrollo",
    time: "Hace 2 horas",
  },
  {
    id: 2,
    icon: "i-lucide-user-plus",
    title: "Nuevo miembro del equipo",
    description: "María se unió al proyecto Alpha",
    time: "Hace 4 horas",
  },
  {
    id: 3,
    icon: "i-lucide-check-circle",
    title: "Tarea completada",
    description: "Implementación de autenticación finalizada",
    time: "Ayer",
  },
  {
    id: 4,
    icon: "i-lucide-message-square",
    title: "Nuevo comentario",
    description: "Feedback recibido en el proyecto Beta",
    time: "Hace 2 días",
  },
]

const recentProjects = [
  {
    id: 1,
    name: "Proyecto Alpha",
    description: "Sistema de gestión empresarial",
    icon: "i-lucide-briefcase",
    status: { label: "En Progreso", color: "blue" as const },
    progress: 75,
    dueDate: "15 Dic 2024",
  },
  {
    id: 2,
    name: "Proyecto Beta",
    description: "Aplicación móvil de ventas",
    icon: "i-lucide-smartphone",
    status: { label: "Revisión", color: "yellow" as const },
    progress: 90,
    dueDate: "20 Dic 2024",
  },
  {
    id: 3,
    name: "Proyecto Gamma",
    description: "Plataforma de e-learning",
    icon: "i-lucide-graduation-cap",
    status: { label: "Completado", color: "green" as const },
    progress: 100,
    dueDate: "10 Dic 2024",
  },
]

function createProject() {
  toast.add({
    title: "Crear Proyecto",
    description: "Funcionalidad en desarrollo",
    color: "blue",
  })
}

function viewReports() {
  toast.add({
    title: "Ver Reportes",
    description: "Funcionalidad en desarrollo",
    color: "blue",
  })
}

function openSettings() {
  toast.add({
    title: "Configuración",
    description: "Funcionalidad en desarrollo",
    color: "blue",
  })
}
</script>
