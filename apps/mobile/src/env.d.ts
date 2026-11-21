// Public build-time variables. Expo inlines `process.env.EXPO_PUBLIC_*` only when accessed
// with literal dot notation, so each one is declared explicitly (no index-signature access).
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
  }
}
