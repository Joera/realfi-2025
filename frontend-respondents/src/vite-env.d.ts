/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_RPC_URL: string
  readonly VITE_PRIVATE_KEY: string
  readonly VITE_SURVEYSTORE_CONTRACT: string
  // Add all your VITE_ prefixed env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}