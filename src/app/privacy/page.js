'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-violet-600 font-medium text-sm mb-6 inline-block hover:text-violet-700">
          ← Volver a NEXUS
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Aviso Legal y Política de Privacidad</h1>
        <p className="text-sm text-slate-500 mb-8">Última actualización: 30 de mayo de 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">

          {/* ============ AVISO LEGAL ============ */}
          <section className="border-b border-slate-200 pb-6">
            <h2 className="text-xl font-semibold text-slate-900">1. Aviso Legal</h2>
            <p>
              <strong>NEXUS</strong> es una plataforma digital operada por:
            </p>
            <ul className="list-none pl-0 space-y-1 text-sm">
              <li><strong>Responsable:</strong> Matanza (imthebow@gmail.com)</li>
              <li><strong>Correo de contacto:</strong> <a href="mailto:imthebow@gmail.com" className="text-violet-600">imthebow@gmail.com</a></li>
              <li><strong>Sitio web:</strong> <a href="https://ionexus.pro" className="text-violet-600">https://ionexus.pro</a></li>
              <li><strong>Jurisdicción:</strong> México</li>
            </ul>
            <p className="mt-4">
              El acceso y uso de esta plataforma atribuye la condición de <strong>Usuario</strong> e implica la
              aceptación plena y sin reservas de todas las disposiciones incluidas en este Aviso Legal,
              Política de Privacidad y Términos de Servicio.
            </p>
          </section>

          {/* ============ DATOS ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Datos que Recopilamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, foto de perfil (vía OAuth)</li>
              <li><strong>Datos de negocio:</strong> clientes, proyectos, propuestas, contratos, facturas, notas, tareas, tiempos</li>
              <li><strong>Datos de pago:</strong> Stripe procesa toda la información financiera; NEXUS solo almacena el ID de cliente de Stripe</li>
              <li><strong>Google Drive:</strong> solo con autorización explícita, para crear carpeta "NexusIO Files" y guardar documentos</li>
              <li><strong>Datos de uso:</strong> páginas visitadas, funciones utilizadas, preferencias</li>
            </ul>
          </section>

          {/* ============ FINALIDADES ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Finalidades del Tratamiento de Datos</h2>
            <p>Al crear una cuenta en NEXUS, el Usuario acepta expresamente que sus datos personales sean tratados para las siguientes finalidades:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Operación de la plataforma:</strong> gestionar su cuenta, proyectos, clientes, facturación y demás funcionalidades contratadas.</li>
              <li><strong>Comunicaciones transaccionales:</strong> enviar facturas, invitaciones al portal de cliente, confirmaciones de pago, recuperación de contraseña.</li>
              <li><strong>Comunicaciones comerciales y publicitarias:</strong> NEXUS y sus proyectos asociados podrán enviar al correo electrónico del Usuario <strong>ofertas, promociones, novedades, lanzamientos de nuevos productos, servicios complementarios y comunicaciones de marketing</strong> relacionadas con el ecosistema NEXUS y sus empresas vinculadas. El Usuario puede darse de baja en cualquier momento mediante el enlace de "Cancelar suscripción" incluido en cada correo.</li>
              <li><strong>Mejora del servicio:</strong> analizar patrones de uso agregados para optimizar la plataforma.</li>
              <li><strong>Cumplimiento legal:</strong> atender obligaciones fiscales, contables y regulatorias aplicables.</li>
            </ol>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-amber-800">
                ⚖️ El Usuario OTORGA SU CONSENTIMIENTO EXPRESO para el envío de comunicaciones comerciales
                al momento de crear su cuenta. Este consentimiento es revocable en cualquier momento.
              </p>
            </div>
          </section>

          {/* ============ BASE LEGAL ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Base Legal del Tratamiento</h2>
            <p>El tratamiento de datos personales se fundamenta en:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consentimiento expreso del Usuario</strong> — mediante la aceptación de esta política al crear su cuenta</li>
              <li><strong>Ejecución de un contrato</strong> — la prestación de los servicios de la plataforma</li>
              <li><strong>Interés legítimo</strong> — comunicaciones comerciales sobre productos y servicios similares, siempre que el Usuario no se haya opuesto</li>
              <li><strong>Cumplimiento de obligaciones legales</strong> — fiscales, contables y de protección de datos</li>
            </ul>
          </section>

          {/* ============ ALMACENAMIENTO ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Almacenamiento, Seguridad y Terceros</h2>
            <p>
              Los datos se almacenan en infraestructura segura con cifrado en reposo y transmisión HTTPS.
              No compartimos datos personales con terceros, excepto los proveedores necesarios:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase</strong> — base de datos (PostgreSQL cifrado)</li>
              <li><strong>Stripe</strong> — pagos (cumple PCI DSS)</li>
              <li><strong>Google Drive / Google Cloud</strong> — almacenamiento de archivos</li>
              <li><strong>OpenRouter</strong> — generación de contenido con IA</li>
              <li><strong>Resend</strong> — envío de correos electrónicos</li>
              <li><strong>Vercel</strong> — hosting de la plataforma</li>
            </ul>
          </section>

          {/* ============ DERECHOS ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Derechos del Usuario (ARCO)</h2>
            <p>El Usuario puede ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición</strong> (ARCO) en cualquier momento:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acceso:</strong> ver todos sus datos almacenados desde Configuración</li>
              <li><strong>Rectificación:</strong> corregir datos desde Configuración o contactándonos</li>
              <li><strong>Cancelación:</strong> eliminar su cuenta desde Configuración (borrado inmediato de todos los datos)</li>
              <li><strong>Oposición:</strong> darse de baja de comunicaciones comerciales mediante el link en cada email</li>
              <li><strong>Portabilidad:</strong> exportar sus datos en formato CSV</li>
              <li><strong>Revocación:</strong> desconectar Google Drive en cualquier momento</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquier derecho, escribir a: <a href="mailto:imthebow@gmail.com" className="text-violet-600">imthebow@gmail.com</a>
            </p>
          </section>

          {/* ============ GOOGLE DRIVE ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Google Drive — Alcance del Acceso</h2>
            <p>La integración con Google Drive es opcional y solo se activa con autorización explícita:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Se crea una carpeta "NexusIO Files" en el Drive del Usuario</li>
              <li>Los documentos se guardan ÚNICAMENTE cuando el Usuario hace clic en "Guardar en mi Drive"</li>
              <li>NUNCA accedemos, leemos o modificamos archivos fuera de la carpeta "NexusIO Files"</li>
              <li>El Usuario puede revocar el acceso desde Configuración de la cuenta o desde su cuenta de Google</li>
            </ul>
          </section>

          {/* ============ RETENCION ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Retención de Datos</h2>
            <p>
              Los datos se conservan mientras la cuenta esté activa. Al cancelar la suscripción, los datos se
              conservan 30 días antes de eliminarse. Al eliminar la cuenta, los datos se borran inmediatamente.
              Los datos fiscales se conservan el tiempo exigido por la legislación aplicable.
            </p>
          </section>

          {/* ============ CAMBIOS ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. Cambios a esta Política</h2>
            <p>
              Notificaremos cambios importantes por correo electrónico con al menos 15 días de antelación.
              El uso continuado después de los cambios constituye aceptación.
            </p>
          </section>

          {/* ============ CONTACTO ============ */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900">10. Contacto y Autoridad Competente</h2>
            <p>
              Para cualquier duda, ejercicio de derechos o reclamación:<br />
              <strong>Email:</strong> <a href="mailto:imthebow@gmail.com" className="text-violet-600">imthebow@gmail.com</a>
            </p>
            <p className="mt-2">
              En caso de no obtener respuesta satisfactoria, el Usuario puede acudir al
              <strong> Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong>
              de México.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
