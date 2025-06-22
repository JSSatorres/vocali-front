<template>
  <UCard>
    <template #header>
      <div class="text-center space-y-3">
        <div
          class="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto"
        >
          <UIcon name="i-lucide-user-plus" class="w-8 h-8 text-primary-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Join the Vocali community
          </p>
        </div>
      </div>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UFormField label="Full Name" name="name">
        <UInput
          class="mb-4"
          v-model="state.name"
          placeholder="Enter your full name"
          icon="i-lucide-user"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Email" name="email">
        <UInput
          class="mb-4"
          v-model="state.email"
          type="email"
          placeholder="Enter your email"
          icon="i-lucide-mail"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="Create a password"
          icon="i-lucide-lock"
          size="lg"
          :disabled="isLoading"
        />
        <template #help>
          <span class="text-xs text-gray-500">Minimum 6 characters</span>
        </template>
      </UFormField>

      <div class="flex items-center">
        <UCheckbox v-model="state.terms" required>
          <template #label>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              I accept the
              <UButton variant="link" size="sm" :padded="false" class="text-sm">
                terms and conditions
              </UButton>
            </span>
          </template>
        </UCheckbox>
      </div>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
        :disabled="
          !state.name || !state.email || !state.password || !state.terms
        "
      >
        Create Account
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <UButton
            variant="link"
            :padded="false"
            @click="$router.push('/auth/login')"
          >
            Sign in here
          </UButton>
        </p>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import * as v from "valibot"

// Middleware para usuarios no autenticados
definePageMeta({
  layout: "auth",
  middleware: "guest",
})

// Meta tags
useHead({
  title: "Sign Up - Vocali",
  meta: [
    {
      name: "description",
      content: "Create your Vocali account and join our community",
    },
  ],
})

// Schema de validación con Valibot
const schema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(2, "Name must be at least 2 characters")
  ),
  email: v.pipe(v.string(), v.email("Invalid email")),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters")
  ),
  terms: v.boolean(),
})

type Schema = v.InferOutput<typeof schema>

// Estado del formulario
const state = reactive({
  name: "",
  email: "",
  password: "",
  terms: false,
})

// Composables
const { register, isLoading } = useAuth()
const toast = useToast()

// Manejar submit del formulario
async function onSubmit(event: { data: Schema }) {
  if (!state.terms) {
    toast.add({
      title: "Error",
      description: "You must accept the terms and conditions.",
      color: "red",
    })
    return
  }

  const result = await register(
    event.data.email,
    event.data.password,
    event.data.name
  )

  if (result.success) {
    if (result.needsConfirmation) {
      toast.add({
        title: "Account Created!",
        description: `Please check your email to verify your account. Your username is: ${result.username}`,
        color: "green",
      })

      // Store email and username in session storage for confirmation page
      if (process.client) {
        sessionStorage.setItem("registrationEmail", event.data.email)
        sessionStorage.setItem("registrationUsername", result.username || "")
      }

      await navigateTo("/auth/confirm")
    } else {
      toast.add({
        title: "Account Created!",
        description: `Your account has been created successfully. Your username is: ${result.username}`,
        color: "green",
      })
      await navigateTo("/auth/login")
    }
  } else {
    toast.add({
      title: "Registration Failed",
      description: result.error || "An unexpected error occurred.",
      color: "red",
    })
  }
}
</script>
