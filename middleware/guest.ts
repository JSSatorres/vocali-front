export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const { checkAuth } = useAuth()

  try {
    const user = await checkAuth()
    if (user) {
      return navigateTo("/dashboard")
    }
  } catch (error) {
    return
  }
})
