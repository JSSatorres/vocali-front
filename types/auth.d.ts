declare module "nuxt/schema" {
  interface RuntimeConfig {
    authSecret: string
    cognitoClientSecret: string
    public: {
      cognitoRegion: string
      cognitoUserPoolId: string
      cognitoClientId: string
    }
  }
}

export {}
