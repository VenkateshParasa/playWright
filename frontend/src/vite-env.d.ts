/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_OFFLINE: string;
  readonly VITE_SRS_SYNC_INTERVAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}