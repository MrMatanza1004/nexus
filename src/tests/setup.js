// ─────────────────────────────────────────────
// NEXUS — Test Setup
// ─────────────────────────────────────────────

// Set test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.ADMIN_EMAIL = 'admin@test.com'
process.env.CRON_SECRET = 'test-cron-secret'
