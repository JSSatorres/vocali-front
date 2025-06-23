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
// It is important to add this export {} to make this file a module
export {}
