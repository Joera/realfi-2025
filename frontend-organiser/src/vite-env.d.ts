/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ETHEREUM_PRIVATE_KEY: string
  readonly VITE_PINATA_KEY: string
  readonly VITE_PINATA_SECRET: string
  readonly VITE_PINATA_JWT: string
  readonly VITE_PINATA_GATEWAY: string
  readonly VITE_ALCHEMY_KEY: string
  readonly VITE_PIMLICO_KEY: string
  readonly VITE_ETHERSCAN_API_KEY: string
  readonly VITE_BACKEND: string
  readonly VITE_SURVEYSTORE_CONTRACT: string
  readonly VITE_L2: string
  readonly VITE_KUBO_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

