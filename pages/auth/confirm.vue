<template>
  <UCard>
    <template #header>
      <div class="text-center space-y-3">
        <div
          class="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto"
        >
          <UIcon name="i-lucide-mail-check" class="w-8 h-8 text-primary-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            We sent a verification code to {{ maskedEmail }}
          </p>
        </div>
      </div>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UFormField label="Verification Code" name="code">
        <UInput
          v-model="state.code"
          placeholder="Enter 6-digit code"
          icon="i-lucide-shield-check"
          size="lg"
          :disabled="isLoading"
          maxlength="6"
        />
        <template #help>
          <span class="text-xs text-gray-500"
            >Check your email for the verification code</span
          >
        </template>
      </UFormField>

      <div class="flex gap-3">
        <UButton
          type="submit"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!state.code || state.code.length < 6"
        >
          Verify Email
        </UButton>
      </div>

      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the code?
          <UButton
            variant="link"
            :padded="false"
            :loading="resendLoading"
            @click="resendCode"
          >
            Resend code
          </UButton>
        </p>
      </div>
    </UForm>

    <template #footer>
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Wrong email?
          <UButton
            variant="link"
            :padded="false"
            @click="$router.push('/auth/register')"
          >
            Go back to registration
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
})

useHead({
  title: "Verify Email - Vocali-dev",
  meta: [
    {
      name: "description",
      content: "Verify your email address to complete registration",
    },
  ],
})

const { confirmRegistration, resendConfirmationCode, isLoading } = useAuth()
const toast = useToast()
const resendLoading = ref(false)

// Get email and username from session storage or redirect back
const email = ref("")
const username = ref("")
onMounted(() => {
  if (process.client) {
    const storedEmail = sessionStorage.getItem("registrationEmail")
    const storedUsername = sessionStorage.getItem("registrationUsername")
    if (storedEmail) {
      email.value = storedEmail
      username.value = storedUsername || storedEmail
    } else {
      navigateTo("/auth/register")
    }
  }
})

// Mask email for display
const maskedEmail = computed(() => {
  if (!email.value) return ""
  const [local, domain] = email.value.split("@")
  if (local.length <= 2) return email.value
  return `${local.slice(0, 2)}${"*".repeat(local.length - 2)}@${domain}`
})

const schema = v.object({
  code: v.pipe(
    v.string(),
    v.minLength(6, "Code must be 6 digits"),
    v.maxLength(6, "Code must be 6 digits")
  ),
})

type Schema = v.InferOutput<typeof schema>

const state = reactive<Schema>({
  code: "",
})

async function onSubmit(event: { data: Schema }) {
  const result = await confirmRegistration(username.value, event.data.code)

  if (result.success) {
    toast.add({
      title: "Email Verified!",
      description: "Your account has been verified successfully.",
      color: "green",
    })

    // Clear stored email
    if (process.client) {
      sessionStorage.removeItem("registrationEmail")
    }

    await navigateTo("/auth/login")
  } else {
    toast.add({
      title: "Verification Failed",
      description:
        result.error || "Invalid verification code. Please try again.",
      color: "red",
    })
  }
}

async function resendCode() {
  resendLoading.value = true

  const result = await resendConfirmationCode(username.value)

  if (result.success) {
    toast.add({
      title: "Code Sent!",
      description: "A new verification code has been sent to your email.",
      color: "green",
    })
  } else {
    toast.add({
      title: "Failed to Resend",
      description: result.error || "Could not resend verification code.",
      color: "red",
    })
  }

  resendLoading.value = false
}
</script>
