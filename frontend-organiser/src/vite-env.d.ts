/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAPACITY_TOKEN: string
  readonly VITE_ETHEREUM_PRIVATE_KEY: string
  readonly VITE_PINATA_KEY: string
  readonly VITE_PINATA_SECRET: string
  // Add all your VITE_ prefixed env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}