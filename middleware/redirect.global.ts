export default defineNuxtRouteMiddleware((to) => {
  if (process.server || to.path !== "/") return

  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    return navigateTo("/dashboard")
  } else {
    return navigateTo("/auth/login")
  }
})
