/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PINATA_KEY: string
  readonly VITE_PINATA_SECRET: string
  readonly VITE_PINATA_JWT: string
  readonly VITE_PINATA_GATEWAY: string
  readonly VITE_ALCHEMY_KEY: string
  readonly VITE_PIMLICO_KEY: string
  readonly VITE_ETHERSCAN_API_KEY: string
  readonly VITE_BACKEND: string
  readonly VITE_L2: string
  readonly VITE_KUBO_ENDPOINT: string
  readonly VITE_LIT_NETWORK: string
  readonly VITE_ENTRYPOINT_ADDRESS_V07: string
  readonly VITE_USE_SAFE: string
}


interface ImportMeta {
  readonly env: ImportMetaEnv
}