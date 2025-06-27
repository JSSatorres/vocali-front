declare module "nuxt/schema" {
  interface RuntimeConfig {
    authSecret: string
    cognitoClientSecret: string
  }

  interface PublicRuntimeConfig {
    cognitoRegion: string
    cognitoUserPoolId: string
    cognitoClientId: string
  }
}

export {}
