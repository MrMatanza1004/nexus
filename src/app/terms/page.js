'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-violet-600 font-medium text-sm mb-6 inline-block hover:text-violet-700">
          ← Volver a NEXUS
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos de Servicio</h1>
        <p className="text-sm text-slate-500 mb-8">Última actualización: 30 de mayo de 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">

          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Aceptación de los Términos</h2>
            <p>
              Al crear una cuenta, acceder o utilizar la plataforma NEXUS ("la Plataforma"), el Usuario declara
              haber leído, entendido y aceptado expresamente estos Términos de Servicio, el Aviso Legal y la
              Política de Privacidad. Si no está de acuerdo, NO debe crear una cuenta ni utilizar la Plataforma.
            </p>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-violet-900">
                ⚖️ AL HACER CLIC EN "CREAR CUENTA" O "REGISTRARSE", EL USUARIO OTORGA SU CONSENTIMIENTO
                EXPRESO, LIBRE, INFORMADO E INEQUÍVOCO A ESTOS TÉRMINOS.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Descripción del Servicio</h2>
            <p>
              NEXUS es un sistema operativo para negocios freelance que proporciona herramientas de
              gestión de clientes, proyectos, propuestas, contratos, facturación, seguimiento de tiempo,
              panel de IA, marketing de afiliados y almacenamiento en la nube, entre otras funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. Registro y Cuenta</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>El Usuario debe ser mayor de 18 años o tener capacidad legal para contratar.</li>
              <li>Los datos proporcionados deben ser veraces, exactos y completos.</li>
              <li>El Usuario es responsable de mantener la confidencialidad de su contraseña.</li>
              <li>La cuenta es personal e intransferible.</li>
              <li>NEXUS se reserva el derecho de rechazar o cancelar cuentas que incumplan estos términos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Comunicaciones Comerciales</h2>
            <p>
              El Usuario autoriza expresamente a NEXUS y a sus empresas vinculadas, proyectos asociados y
              colaboradores a enviar comunicaciones comerciales, publicitarias y promocionales a la dirección
              de correo electrónico proporcionada durante el registro. Estas comunicaciones pueden incluir:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ofertas y promociones de planes y servicios de NEXUS</li>
              <li>Lanzamiento de nuevas funcionalidades y productos</li>
              <li>Información sobre proyectos relacionados del ecosistema NEXUS</li>
              <li>Contenido educativo y recursos para freelancers</li>
              <li>Invitaciones a eventos, webinars y programas de afiliados</li>
            </ul>
            <p className="mt-3">
              El Usuario puede revocar este consentimiento en cualquier momento mediante el enlace
              "Cancelar suscripción" en cada correo o contactando a <a href="mailto:imthebow@gmail.com" className="text-violet-600">imthebow@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Planes, Precios y Pagos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los precios se muestran en la página de precios y pueden ser modificados con aviso previo.</li>
              <li>Los pagos se procesan a través de Stripe. NEXUS no almacena datos de tarjetas.</li>
              <li>Las suscripciones se renuevan automáticamente al final de cada período.</li>
              <li>El Usuario puede cancelar su suscripción en cualquier momento desde Configuración.</li>
              <li>No se realizan reembolsos parciales por períodos no utilizados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Propiedad Intelectual</h2>
            <p>
              El contenido generado por el Usuario (proyectos, clientes, documentos) es de su propiedad.
              NEXUS no reclama derechos de propiedad sobre dicho contenido.
              El software, diseño, marca y nombre NEXUS son propiedad del operador de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Limitación de Responsabilidad</h2>
            <p>
              NEXUS se proporciona "tal cual", sin garantías de disponibilidad continua. La plataforma se
              esfuerza por mantener un 99.9% de uptime pero no garantiza funcionamiento ininterrumpido.
              NEXUS no será responsable por daños indirectos, pérdida de datos o pérdida de negocio
              derivados del uso de la plataforma. El Usuario es responsable de mantener copias de seguridad
              de su información.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Cancelación y Eliminación</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>El Usuario puede cancelar su suscripción en cualquier momento desde Configuración.</li>
              <li>El Usuario puede eliminar su cuenta desde Configuración, lo que borra todos sus datos inmediatamente.</li>
              <li>NEXUS puede suspender o cancelar cuentas que incumplan estos términos.</li>
              <li>Al cancelar la suscripción sin eliminar la cuenta, los datos se conservan 30 días.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. Modificaciones</h2>
            <p>
              NEXUS se reserva el derecho de modificar estos términos en cualquier momento. Los cambios
              serán notificados por correo electrónico con 15 días de antelación. El uso continuado de la
              plataforma después de los cambios constituye aceptación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">10. Legislación Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>.
              Cualquier controversia se someterá a los tribunales competentes de México.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">11. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos:<br />
              <a href="mailto:imthebow@gmail.com" className="text-violet-600 font-medium">imthebow@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
