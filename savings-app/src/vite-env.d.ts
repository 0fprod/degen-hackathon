/// <reference types="vite/client" />

interface Window {
  ethereum: any;
}

interface ImportMetaEnv {
  readonly VITE_FUSE_API_KEY: string
  readonly VITE_WALLET_PRIVATE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}