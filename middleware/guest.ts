export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const { checkAuth } = useAuth()

  try {
    const user = await checkAuth()
    if (user) {
      // Si el usuario está autenticado y trata de acceder a páginas de guest
      // (como login o register), redirigir al dashboard
      return navigateTo("/dashboard")
    }
  } catch (error) {
    // Si hay error en checkAuth, el usuario no está autenticado
    // que es lo que queremos para páginas de guest
    return
  }
})
