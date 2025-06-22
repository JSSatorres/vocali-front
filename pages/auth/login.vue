<template>
  <UCard>
    <template #header>
      <div class="text-center space-y-3">
        <div
          class="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto"
        >
          <UIcon name="i-lucide-log-in" class="w-8 h-8 text-primary-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Sign in to your Vocali account
          </p>
        </div>
      </div>
    </template>
    <UForm
      :schema="schema"
      :state="state"
      class="gap-6 flex flex-col"
      @submit="onSubmit"
    >
      <UFormField label="Email or Username" name="email">
        <UInput
          v-model="state.email"
          placeholder="Enter your email or username"
          icon="i-lucide-mail"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="Enter your password"
          icon="i-lucide-lock"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="isLoading"
        :disabled="!state.email || !state.password"
      >
        Sign In
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <UButton
            variant="link"
            :padded="false"
            @click="$router.push('/auth/register')"
          >
            Sign up here
          </UButton>
        </p>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import * as v from "valibot"

definePageMeta({
  layout: "auth",
  auth: {
    guestOnly: true,
  },
})

useHead({
  title: "Sign In - Vocali",
  meta: [{ name: "description", content: "Sign in to your Vocali account" }],
})

const { login, isLoading, error } = useAuth()
const toast = useToast()

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.email("Invalid email address"),
    v.minLength(1, "Email is required")
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters")
  ),
})

type Schema = v.InferOutput<typeof schema>

const state = reactive<Schema>({
  email: "",
  password: "",
})

async function onSubmit(event: { data: Schema }) {
  const result = await login(event.data.email, event.data.password)

  if (result.success) {
    toast.add({
      title: "Welcome back!",
      description: "You have been successfully signed in.",
      color: "green",
    })
  } else {
    toast.add({
      title: "Sign In Failed",
      description:
        result.error || "Invalid email or password. Please try again.",
      color: "red",
    })
  }
}
</script>
