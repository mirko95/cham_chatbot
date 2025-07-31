/// <reference types="vite/client" />
// ↑ Ensures TypeScript knows about Vite's built-in types (e.g., `import.meta.env`)

/**
 * ImportMetaEnv
 * --------------------------
 * - Strongly types environment variables used by the app.
 * - `VITE_` prefix is required for variables to be exposed to frontend code.
 * - Keeps `import.meta.env.VITE_GEMINI_API_KEY` type-safe across the project.
 */
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string; // API key for Gemini model (configured in `.env`)
}

/**
 * ImportMeta
 * --------------------------
 * - Extends TypeScript's definition of `import.meta` with our custom `env`.
 * - Ensures `import.meta.env.VITE_GEMINI_API_KEY` is available and typed.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
