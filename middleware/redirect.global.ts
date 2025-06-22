export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  if (to.path === "/") {
    if (isAuthenticated.value) {
      return navigateTo("/dashboard")
    } else {
      return navigateTo("/auth/login")
    }
  }
})
