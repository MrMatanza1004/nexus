import './globals.css'
import Navbar from '@/components/Navbar'
import SocialProof from '@/components/SocialProof'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'NEXUS - El Sistema Operativo de tu Negocio Freelance',
  description: 'Gestiona clientes, proyectos, propuestas, contratos y facturas en un solo lugar. El hub central de tu negocio freelance.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <SocialProof />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
