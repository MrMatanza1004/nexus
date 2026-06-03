import Link from 'next/link'

/**
 * Logo de NEXUS — usable en toda la app.
 *
 * Variantes:
 * - default: icon + "NEXUS" wordmark (navbar, header)
 * - icon: solo el icono (sidebar compact, mobile)
 * - full: icon + wordmark + "FREELANCE OS" (hero, landing)
 * - footer: versión para footer
 */
export default function Logo({ variant = 'default', href, className = '' }) {
  const icon = (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NEXUS logo"
    >
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#lg)" />
      <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 10 L10 22" />
        <path d="M22 10 L22 22" />
        <path d="M11 22 L21 10" />
        <circle cx="16" cy="16" r="1.5" fill="#fff" />
      </g>
    </svg>
  )

  const wordmark = (
    <span className="font-extrabold tracking-wider text-slate-900">
      NEXUS
    </span>
  )

  const content = () => {
    switch (variant) {
      case 'icon':
        return icon

      case 'full':
        return (
          <div className="flex flex-col items-center gap-3">
            <svg
              viewBox="0 0 64 64"
              className="w-16 h-16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#lg2)" />
              <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 20 L20 44" />
                <circle cx="20" cy="18" r="2.5" fill="#fff" />
                <path d="M44 20 L44 44" />
                <circle cx="44" cy="46" r="2.5" fill="#fff" />
                <path d="M22 44 L42 20" />
                <circle cx="32" cy="32" r="2.5" fill="#fff" />
              </g>
            </svg>
            <div className="text-center">
              <div className="text-2xl font-extrabold tracking-[0.2em] text-slate-900">
                NEXUS
              </div>
              <div className="text-xs tracking-[0.3em] text-slate-400 font-medium mt-0.5">
                FREELANCE OS
              </div>
            </div>
          </div>
        )

      case 'footer':
        return (
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <div className="font-extrabold tracking-wider text-white">NEXUS</div>
              <div className="text-[10px] tracking-[0.2em] text-slate-400 font-medium">
                FREELANCE OS
              </div>
            </div>
          </div>
        )

      case 'default':
      default:
        return (
          <div className="flex items-center gap-2.5">
            {icon}
            {wordmark}
          </div>
        )
    }
  }

  if (href) {
    return (
      <Link href={href} className={`flex items-center ${className}`}>
        {content()}
      </Link>
    )
  }

  return <div className={`flex items-center ${className}`}>{content()}</div>
}
