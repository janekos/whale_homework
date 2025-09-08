interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CRYPTO_SYMBOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}