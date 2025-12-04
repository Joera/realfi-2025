/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAPACITY_TOKEN: string
  readonly VITE_ETHEREUM_PRIVATE_KEY: string
  readonly VITE_PINATA_KEY: string
  readonly VITE_PINATA_SECRET: string
  readonly VITE_ALCHEMY_KEY: string
  readonly VITE_PIMLICO_KEY: string
  readonly VITE_ETHERSCAN_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}