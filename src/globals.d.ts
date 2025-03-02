declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITEST?: 'true' | 'false'
      TZ?: string
    }
  }
}

export {}
