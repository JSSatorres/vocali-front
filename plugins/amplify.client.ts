import { Amplify } from "aws-amplify"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.public.cognitoUserPoolId,
        userPoolClientId: config.public.cognitoClientId,
        loginWith: {
          oauth: {
            domain: `${config.public.cognitoUserPoolId}.auth.${config.public.cognitoRegion}.amazoncognito.com`,
            scopes: ["openid", "email", "profile"],
            redirectSignIn: [
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3002",
            ],
            redirectSignOut: [
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3002",
            ],
            responseType: "code",
          },
        },
      },
    },
  })
})
