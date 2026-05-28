# 🚀 Cómo hacer deploy de NEXUS

## 1. GitHub
1. Creá una cuenta en https://github.com
2. Creá un repositorio nuevo (botón verde "New")
3. En tu terminal:
```bash
cd centro
git init
git add .
git commit -m "feat: initial centro platform"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/centro.git
git push -u origin main
```

## 2. Supabase (Base de datos + Auth)
1. Creá cuenta en https://supabase.com
2. Creá un nuevo proyecto
3. En el SQL Editor, pegá TODO el contenido de `supabase/setup.sql` y ejecutalo
4. Andá a **Project Settings > API** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
5. Authentication > Settings > Site URL: poné tu URL de Vercel

## 3. Stripe (Pagos)
1. Creá cuenta en https://stripe.com
2. Creá productos en Stripe Dashboard > Productos (Starter $9, Pro $29, AI $49)
3. Copiá los `price_xxx` IDs y actualizalos en `src/lib/constants.js`
4. Andá a Developers > API keys y copiá:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Webhooks: agregá un endpoint con tu URL de Vercel + `/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.deleted`
   - Copiá el `Signing secret` → `STRIPE_WEBHOOK_SECRET`

## 4. Vercel (Hosting GRATIS)
1. Creá cuenta en https://vercel.com (conectá con GitHub)
2. Importá tu repositorio de GitHub
3. En Environment Variables, agregá TODAS las keys:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=https://tu-app.vercel.app
NEXT_PUBLIC_APP_NAME=NEXUS
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```
4. Deploy! Vercel build automáticamente

## 5. Configurar Stripe Webhook
Después del deploy, volvé a Stripe > Webhooks y actualizá la URL a:
`https://tu-app.vercel.app/api/stripe/webhook`

## 6. ¡A vender!
- Compartí tu landing page
- Los registros crean cuenta gratis automáticamente
- Los afiliados se generan automáticamente al registrarse
- Comisión 25% recurrente

## Stack técnico (todo GRATIS)
| Servicio | Costo | Para qué |
|---|---|---|
| Vercel | $0 | Hosting + dominio |
| Supabase | $0 | DB + Auth + Storage |
| Stripe | $0 | Pagos (solo 2.9%/transacción) |
| GitHub | $0 | Código |
