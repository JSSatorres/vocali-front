export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { checkAuth } = useAuth()

  try {
    const user = await checkAuth()
    if (!user) {
      return navigateTo("/auth/login")
    }
  } catch (error) {
    return navigateTo("/auth/login")
  }
})
