declare module 'cloudflare:workers' {
  interface Env {
    DB: D1Database
    QR_SEED?: string
    ADMIN_PIN?: string
  }
}
