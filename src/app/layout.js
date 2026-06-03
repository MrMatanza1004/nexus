import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  metadataBase: new URL('https://ionexus.pro'),
  title: 'NEXUS - El Sistema Operativo de tu Negocio Freelance',
  description: 'Gestiona clientes, proyectos, propuestas, contratos y facturas en un solo lugar. El hub central de tu carrera freelance.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'NEXUS - Freelance OS',
    description: 'El sistema operativo que transforma tu freelance en un negocio.',
    url: 'https://ionexus.pro',
    siteName: 'NEXUS',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/nexus-logo.svg', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS - Freelance OS',
    description: 'El sistema operativo que transforma tu freelance en un negocio.',
    images: ['/nexus-logo.svg'],
  },
  other: {
    'google-site-verification': 'jIizGqVljSdBTRZXf0nlukoY0vk-7Mm4wePCGkDj798',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={GeistSans.variable + ' ' + GeistMono.variable}>
      <body className="font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-zinc-800 py-10 px-4 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-label="NEXUS logo">
                  <rect width="32" height="32" rx="7" fill="#7c3aed" />
                  <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 10 L10 22" />
                    <path d="M22 10 L22 22" />
                    <path d="M11 22 L21 10" />
                    <circle cx="16" cy="16" r="1.5" fill="#fff" />
                  </g>
                </svg>
                <span className="font-extrabold tracking-wider text-white">NEXUS</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a href="/pricing" className="text-zinc-400 hover:text-white transition-colors">Planes</a>
                <a href="/tools/rate-calculator" className="text-zinc-400 hover:text-white transition-colors">Calculadora</a>
                <a href="/tools/contract-generator" className="text-zinc-400 hover:text-white transition-colors">Contratos</a>
                <a href="/register" className="text-zinc-400 hover:text-white transition-colors">Registrarse</a>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
              <p>&copy; {new Date().getFullYear()} NEXUS. Todos los derechos reservados.</p>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="hover:text-violet-400 transition-colors">Privacidad</a>
                <a href="/terms" className="hover:text-violet-400 transition-colors">Terminos</a>
              </div>
            </div>
          </div>
        </footer>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#fafafa',
              borderRadius: '12px',
              border: '1px solid #27272a',
            },
          }}
        />
      </body>
    </html>
  )
}
