/// <reference types="vite/client" />
declare module '*.css' {}

interface ImportMetaEnv {
  readonly VITE_BASE_RPC?: string;
  readonly VITE_WC_PROJECT_ID?: string;
  readonly VITE_PAYMASTER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
