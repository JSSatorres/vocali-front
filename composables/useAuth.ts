import {
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth"
import type { AuthUser } from "aws-amplify/auth"

export const useAuth = () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const checkAuth = async () => {
    try {
      isLoading.value = true
      const currentUser = await getCurrentUser()
      user.value = currentUser
      return currentUser
    } catch (err) {
      user.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  const login = async (emailOrUsername: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { isSignedIn, nextStep } = await signIn({
        username: emailOrUsername,
        password,
      })

      if (isSignedIn) {
        await checkAuth()
        await navigateTo("/dashboard")
        return { success: true }
      }

      return { success: false, nextStep }
    } catch (err: any) {
      error.value = err.message || "Error during sign in"
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const username = email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")

      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: username,
        password,
        options: {
          userAttributes: {
            email: email,
            ...(name && { name }),
          },
          autoSignIn: true,
        },
      })

      return {
        success: true,
        isSignUpComplete,
        userId,
        nextStep,
        needsConfirmation: !isSignUpComplete,
        username: username,
      }
    } catch (err: any) {
      error.value = err.message || "Error during sign up"
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const confirmRegistration = async (usernameOrEmail: string, code: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: usernameOrEmail,
        confirmationCode: code,
      })

      return { success: true, isSignUpComplete, nextStep }
    } catch (err: any) {
      error.value = err.message || "Error confirming sign up"
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const resendConfirmationCode = async (usernameOrEmail: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { destination, deliveryMedium } = await resendSignUpCode({
        username: usernameOrEmail,
      })

      return { success: true, destination, deliveryMedium }
    } catch (err: any) {
      error.value = err.message || "Error resending code"
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      await signOut()
      user.value = null
      await navigateTo("/auth/login")
      return { success: true }
    } catch (err: any) {
      error.value = err.message || "Error during sign out"
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated: computed(() => !!user.value),
    login,
    register,
    confirmRegistration,
    resendConfirmationCode,
    logout,
    checkAuth,
  }
}
