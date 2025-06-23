// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  // Configuración para TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // SSR Configuration
  ssr: true,

  // CSS Configuration
  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
  ],

  // Configuración de runtime
  runtimeConfig: {
    // Claves privadas (solo disponibles en el lado del servidor)
    authSecret: process.env.NUXT_AUTH_SECRET,
    cognitoClientSecret: process.env.NUXT_AUTH_COGNITO_CLIENT_SECRET,

    // Claves públicas (expuestas al lado del cliente)
    public: {
      cognitoRegion: process.env.NUXT_PUBLIC_AUTH_COGNITO_REGION,
      cognitoUserPoolId: process.env.NUXT_PUBLIC_AUTH_COGNITO_USER_POOL_ID,
      cognitoClientId: process.env.NUXT_PUBLIC_AUTH_COGNITO_CLIENT_ID,
    },
  },

  // Configuración de servidor de desarrollo
  devServer: {
    port: 3000,
    host: "localhost",
  },

  // Configuración de componentes
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  // App configuration
  app: {
    head: {
      title: "Vocali Auth",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Sistema de autenticación con Nuxt 3 y Tailwind CSS",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
})
